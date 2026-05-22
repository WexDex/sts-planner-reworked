"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  Link2,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  TriangleAlert,
  Undo2,
  Users,
  X,
} from "lucide-react";
import type { PlaceholderRuleConfig } from "@/app/utils/descriptionPlaceholders";
import { buildResolver } from "@/app/utils/descriptionPlaceholders";
import rulesData from "@/app/data/description_placeholder_rules.json";
import rulesBackup from "@/app/data/description_placeholder_rules.backup.json";
import type { Card } from "@/app/types/gameTypes";
import FieldSuggestInput from "@/app/components/UI/FieldSuggestInput";

type BuiltRule = {
  token: string;
  label: string;
  resolve: (card: Card) => string;
};

function renderColored(
  description: string,
  card: Card,
  rules: BuiltRule[],
): React.ReactNode {
  const segments: React.ReactNode[] = [];
  let rest = description;
  let key = 0;
  while (rest.length > 0) {
    let bestIdx = rest.length;
    let bestRule: BuiltRule | null = null;
    for (const r of rules) {
      const idx = rest.indexOf(r.token);
      if (idx !== -1 && idx < bestIdx) {
        bestIdx = idx;
        bestRule = r;
      }
    }
    if (!bestRule) {
      segments.push(rest);
      break;
    }
    if (bestIdx > 0) segments.push(rest.slice(0, bestIdx));
    segments.push(
      <span key={key++} className="not-italic font-bold text-amber-300">
        {String(bestRule.resolve(card))}
      </span>,
    );
    rest = rest.slice(bestIdx + bestRule.token.length);
  }
  return <>{segments}</>;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type CardData = Record<string, unknown>;
type Bundle = Record<string, CardData>;
type CharFilter =
  | "all"
  | "ironclad"
  | "silent"
  | "defect"
  | "watcher"
  | "colorless"
  | "status"
  | "curse";

// ─── Editor context (avoids prop-drilling bundle/fieldUsage into sub-components) ─

type EditorCtxValue = {
  bundle: Bundle;
  fieldUsage: Record<string, string[]>;
};
const EditorCtx = React.createContext<EditorCtxValue>({
  bundle: {},
  fieldUsage: {},
});

// ─── Constants ─────────────────────────────────────────────────────────────────

const CHAR_FILTERS: {
  value: CharFilter;
  label: string;
  pill: string;
  active: string;
}[] = [
  {
    value: "all",
    label: "All",
    pill: "border-slate-700/50 text-slate-400 hover:bg-slate-800/50",
    active: "border-slate-400/70 bg-slate-700/70 text-slate-100",
  },
  {
    value: "ironclad",
    label: "Ironclad",
    pill: "border-rose-900/50 text-rose-400/80 hover:bg-rose-950/30",
    active: "border-rose-500/65 bg-rose-950/60 text-rose-200",
  },
  {
    value: "silent",
    label: "Silent",
    pill: "border-teal-900/50 text-teal-400/80 hover:bg-teal-950/30",
    active: "border-teal-500/65 bg-teal-950/60 text-teal-200",
  },
  {
    value: "defect",
    label: "Defect",
    pill: "border-blue-900/50 text-blue-400/80 hover:bg-blue-950/30",
    active: "border-blue-500/65 bg-blue-950/60 text-blue-200",
  },
  {
    value: "watcher",
    label: "Watcher",
    pill: "border-purple-900/50 text-purple-400/80 hover:bg-purple-950/30",
    active: "border-purple-500/65 bg-purple-950/60 text-purple-200",
  },
  {
    value: "colorless",
    label: "Colorless",
    pill: "border-slate-700/50 text-slate-400/80 hover:bg-slate-800/30",
    active: "border-slate-400/65 bg-slate-700/60 text-slate-200",
  },
  {
    value: "status",
    label: "Status",
    pill: "border-amber-900/50 text-amber-400/80 hover:bg-amber-950/30",
    active: "border-amber-500/65 bg-amber-950/60 text-amber-200",
  },
  {
    value: "curse",
    label: "Curses",
    pill: "border-indigo-900/50 text-indigo-400/80 hover:bg-indigo-950/30",
    active: "border-indigo-500/65 bg-indigo-950/60 text-indigo-200",
  },
];

const TYPE_OPTIONS = ["Attack", "Skill", "Power", "Status", "Curse"];
const RARITY_OPTIONS = ["Starter", "Common", "Uncommon", "Rare", "Special"];
const CHAR_OPTIONS = [
  "ironclad",
  "silent",
  "defect",
  "watcher",
  "colorless",
  "status",
  "curse",
];

const VALUE_NODE_FIELDS: { key: string; label: string }[] = [
  { key: "damage", label: "Damage" },
  { key: "block", label: "Block" },
  { key: "draw", label: "Draw" },
  { key: "gainEnergy", label: "Energy Gain" },
  { key: "heal", label: "Heal" },
  { key: "hpcost", label: "HP Cost" },
  { key: "vulnerable", label: "Vulnerable" },
  { key: "focus", label: "Focus" },
  { key: "mantra", label: "Mantra" },
];

const BONUS_FIELDS: { key: string; label: string }[] = [
  { key: "bonusDamage", label: "Bonus Damage" },
  { key: "bonusBlock", label: "Bonus Block" },
];

// Fields shown in Identity / Cost sections — excluded from the main Fields section
const COMBAT_EXCLUDED = new Set([
  "id",
  "type",
  "rarity",
  "characters",
  "description",
  "descriptionUpgraded",
  "cost",
  "xCost",
  "unplayable",
]);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function snap<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

function getBase(v: unknown): number | "" {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return v;
  if (typeof v === "object" && v !== null && "base" in v) {
    const b = (v as any).base;
    return typeof b === "number" ? b : "";
  }
  return "";
}

function getUpgraded(v: unknown): number | "" {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return "";
  if (typeof v === "object" && v !== null && "upgraded" in v) {
    const u = (v as any).upgraded;
    return typeof u === "number" ? u : "";
  }
  return "";
}

function getBoolBase(v: unknown): boolean | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return v;
  if (typeof v === "object" && v !== null && "base" in v) {
    const b = (v as any).base;
    return typeof b === "boolean" ? b : null;
  }
  return null;
}

function getBoolUpgraded(v: unknown): boolean | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return null;
  if (typeof v === "object" && v !== null && "upgraded" in v) {
    const u = (v as any).upgraded;
    return typeof u === "boolean" ? u : null;
  }
  return null;
}

function humanise(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function validate(card: CardData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!card.type) errors.type = "Required";
  if (!card.characters) errors.characters = "Required";
  if (!card.description) errors.description = "Required";
  for (const { key } of VALUE_NODE_FIELDS) {
    const b = getBase(card[key]);
    if (b !== "" && !Number.isFinite(Number(b)))
      errors[key] = "Must be a number";
  }
  return errors;
}

function typeChipCls(type?: string): string {
  switch (type?.toLowerCase()) {
    case "attack":
      return "border-rose-500/50 bg-rose-950/50 text-rose-300";
    case "skill":
      return "border-teal-500/50 bg-teal-950/50 text-teal-300";
    case "power":
      return "border-violet-500/50 bg-violet-950/50 text-violet-300";
    default:
      return "border-slate-600/50 bg-slate-800/50 text-slate-400";
  }
}

// ─── Prop-type helpers ─────────────────────────────────────────────────────────

type PropType = "boolean" | "number" | "string" | "obj" | "val";

function detectType(v: unknown): PropType {
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") return "number";
  if (typeof v === "object" && v !== null) return "obj";
  return "string";
}

function coerceToType(v: unknown, t: PropType): unknown {
  if (t === "boolean") return !!v;
  if (t === "number") return isNaN(Number(v)) ? 0 : Number(v);
  if (t === "val") return { base: 0, upgraded: 0 };
  if (t === "obj") return typeof v === "object" && v !== null ? v : {};
  return String(v ?? "");
}

// Collect all unique child keys at a given dot-path across all cards in the bundle
function collectKeysAtPath(bundle: Bundle, path: string): string[] {
  const keys = new Set<string>();
  const parts = path.split(".");
  for (const card of Object.values(bundle)) {
    let node: unknown = card;
    for (const part of parts) {
      if (typeof node !== "object" || node === null) {
        node = undefined;
        break;
      }
      node = (node as Record<string, unknown>)[part];
    }
    if (typeof node === "object" && node !== null) {
      for (const k of Object.keys(node as object)) keys.add(k);
    }
  }
  return [...keys].sort();
}

function TypeBadge({ type }: { type: PropType }) {
  const cls =
    type === "boolean"
      ? "border-violet-700/50 text-violet-400"
      : type === "number"
        ? "border-sky-700/50 text-sky-400"
        : type === "obj"
          ? "border-amber-700/50 text-amber-400"
          : type === "val"
            ? "border-emerald-700/50 text-emerald-400"
            : "border-slate-700/50 text-slate-500";
  const label =
    type === "boolean"
      ? "B"
      : type === "number"
        ? "N"
        : type === "obj"
          ? "O"
          : type === "val"
            ? "V"
            : "S";
  return (
    <span
      className={`rounded border px-1 py-px font-mono text-[8px] font-bold ${cls}`}
    >
      {label}
    </span>
  );
}

function TypeSelector({
  value: t,
  onChange,
}: {
  value: PropType;
  onChange: (t: PropType) => void;
}) {
  const opts: { id: PropType; label: string; cls: string; title?: string }[] = [
    {
      id: "string",
      label: "str",
      cls: "border-slate-500/60 bg-slate-700/40 text-slate-200",
    },
    {
      id: "number",
      label: "num",
      cls: "border-sky-500/60 bg-sky-950/40 text-sky-300",
    },
    {
      id: "boolean",
      label: "bool",
      cls: "border-violet-500/60 bg-violet-950/40 text-violet-300",
    },
    {
      id: "obj",
      label: "obj",
      cls: "border-amber-500/60 bg-amber-950/40 text-amber-300",
    },
    {
      id: "val",
      label: "val",
      cls: "border-emerald-500/60 bg-emerald-950/40 text-emerald-300",
      title: "ValueNode — { base: 0, upgraded: 0 }",
    },
  ];
  return (
    <div className="flex gap-1">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          title={o.title}
          className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold transition ${t === o.id ? o.cls : "border-slate-700/40 bg-transparent text-slate-600 hover:text-slate-400"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PropValueInput({
  type,
  value,
  onChange,
  placeholder,
  onEnter,
}: {
  type: PropType;
  value: unknown;
  onChange: (v: unknown) => void;
  placeholder?: string;
  onEnter?: () => void;
}) {
  const base =
    "rounded-md border bg-slate-900/60 px-2 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-cyan-500/40";
  if (type === "boolean") {
    return (
      <div className="flex gap-1">
        {([true, false] as const).map((b) => (
          <button
            key={String(b)}
            type="button"
            onClick={() => onChange(b)}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
              value === b
                ? b
                  ? "border-emerald-500/70 bg-emerald-950/50 text-emerald-300"
                  : "border-rose-500/60 bg-rose-950/40 text-rose-300"
                : "border-slate-700/50 bg-slate-900/50 text-slate-500"
            }`}
          >
            {String(b)}
          </button>
        ))}
      </div>
    );
  }
  if (type === "val" || type === "obj") {
    const count =
      typeof value === "object" && value !== null
        ? Object.keys(value as object).length
        : 0;
    return (
      <span className={`${base} border-amber-700/30 text-amber-400/70 flex-1`}>
        {`{ ${count} ${count === 1 ? "prop" : "props"} }`}
      </span>
    );
  }
  return (
    <input
      type={type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      placeholder={placeholder}
      onChange={(e) =>
        onChange(
          type === "number"
            ? e.target.value === ""
              ? 0
              : Number(e.target.value)
            : e.target.value,
        )
      }
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      className={`${base} ${type === "number" ? "w-24" : "flex-1"} border-slate-700/60`}
    />
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2 py-1.5 text-left"
    >
      <ChevronDown
        className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-150 ${open ? "" : "-rotate-90"}`}
        strokeWidth={2.5}
      />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <div className="flex-1 border-t border-slate-800/70" />
    </button>
  );
}

// Extra sub-fields editor (key-value pairs beyond base/upgraded on a field object)
function ExtraProps({
  value,
  onChangeRaw,
  parentPath,
}: {
  value: unknown;
  onChangeRaw: (obj: Record<string, unknown> | undefined) => void;
  parentPath?: string;
}) {
  const { bundle } = useContext(EditorCtx);
  const [adding, setAdding] = useState(false);
  const [addKey, setAddKey] = useState("");
  const [addType, setAddType] = useState<PropType>("string");
  const [addVal, setAddVal] = useState<unknown>("");

  const [modifyKey, setModifyKey] = useState<string | null>(null);
  const [modState, setModState] = useState<{
    newKey: string;
    type: PropType;
    val: unknown;
  }>({
    newKey: "",
    type: "string",
    val: "",
  });

  const obj =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const extras = Object.entries(obj).filter(
    ([k]) => k !== "base" && k !== "upgraded",
  );

  const addKeySuggestions = useMemo(
    () => (parentPath ? collectKeysAtPath(bundle, parentPath) : []),
    [bundle, parentPath],
  );

  function removeExtra(key: string) {
    const next = { ...obj };
    delete next[key];
    onChangeRaw(Object.keys(next).length === 0 ? undefined : next);
  }

  function updateExtraVal(key: string, v: unknown) {
    onChangeRaw({ ...obj, [key]: v });
  }

  function startModify(key: string, v: unknown) {
    setModifyKey(key);
    setModState({ newKey: key, type: detectType(v), val: v });
  }

  function confirmModify() {
    if (!modState.newKey.trim() || !modifyKey) return;
    const next = { ...obj };
    delete next[modifyKey];
    next[modState.newKey.trim()] = coerceToType(modState.val, modState.type);
    onChangeRaw(Object.keys(next).length === 0 ? undefined : next);
    setModifyKey(null);
  }

  function startAdd() {
    setAdding(true);
    setAddKey("");
    setAddType("string");
    setAddVal("");
  }

  function confirmAdd() {
    if (!addKey.trim()) return;
    const initial =
      addType === "boolean"
        ? (addVal ?? true)
        : addType === "val"
          ? { base: 0, upgraded: 0 }
          : addType === "obj"
            ? {}
            : addVal;
    onChangeRaw({ ...obj, [addKey.trim()]: initial });
    setAdding(false);
  }

  const cancelBtn = (onCancel: () => void) => (
    <button
      type="button"
      onClick={onCancel}
      className="rounded-md border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-300"
    >
      ✕
    </button>
  );

  const okBtn = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-cyan-600/50 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-900/50"
    >
      OK
    </button>
  );

  const inputCls =
    "w-24 rounded-md border border-slate-600 bg-slate-900/60 px-2 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-cyan-500/40";

  return (
    <div className="mt-1.5 space-y-1 pl-2">
      {extras.map(([k, v]) => {
        const t = detectType(v);

        // ── Modify mode ──────────────────────────────────────────────────────
        if (modifyKey === k) {
          return (
            <div
              key={k}
              className="space-y-1.5 rounded-lg border border-cyan-700/40 bg-cyan-950/20 p-1.5"
            >
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={modState.newKey}
                  onChange={(e) =>
                    setModState((s) => ({ ...s, newKey: e.target.value }))
                  }
                  className={inputCls}
                />
                <TypeSelector
                  value={modState.type}
                  onChange={(nt) =>
                    setModState((s) => ({
                      ...s,
                      type: nt,
                      val: coerceToType(s.val, nt),
                    }))
                  }
                />
                {okBtn(confirmModify)}
                {cancelBtn(() => setModifyKey(null))}
              </div>
              {modState.type !== "obj" && modState.type !== "val" && (
                <div className="flex items-center gap-1.5">
                  <PropValueInput
                    type={modState.type}
                    value={modState.val}
                    onChange={(nv) => setModState((s) => ({ ...s, val: nv }))}
                    onEnter={confirmModify}
                  />
                </div>
              )}
            </div>
          );
        }

        // ── Object type — nested ExtraProps ──────────────────────────────────
        if (t === "obj") {
          const subCount =
            typeof v === "object" && v !== null
              ? Object.keys(v as object).length
              : 0;
          return (
            <div
              key={k}
              className="rounded-md border border-amber-700/30 bg-amber-950/10 p-1.5"
            >
              <div className="mb-1 flex items-center gap-1.5">
                <TypeBadge type="obj" />
                <span className="font-mono text-[10px] text-slate-400">
                  {k}:
                </span>
                <span className="font-mono text-[9px] text-amber-600/70">{`{${subCount}}`}</span>
                <button
                  type="button"
                  onClick={() => startModify(k, v)}
                  title="Rename key"
                  className="inline-flex h-5 w-5 items-center justify-center rounded border border-sky-700/40 bg-sky-950/30 text-sky-400 hover:bg-sky-900/50"
                >
                  <Pencil className="h-2.5 w-2.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => removeExtra(k)}
                  className="inline-flex h-5 w-5 items-center justify-center rounded border border-rose-700/40 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50"
                >
                  <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                </button>
              </div>
              <ExtraProps
                value={v}
                onChangeRaw={(nested) => updateExtraVal(k, nested ?? {})}
                parentPath={parentPath ? `${parentPath}.${k}` : k}
              />
            </div>
          );
        }

        // ── Scalar types ─────────────────────────────────────────────────────
        return (
          <div key={k} className="flex items-center gap-1.5">
            <TypeBadge type={t} />
            <span className="w-20 shrink-0 font-mono text-[10px] text-slate-500">
              {k}:
            </span>
            <PropValueInput
              type={t}
              value={v}
              onChange={(nv) => updateExtraVal(k, nv)}
            />
            <button
              type="button"
              onClick={() => startModify(k, v)}
              title="Modify"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-sky-700/40 bg-sky-950/30 text-sky-400 hover:bg-sky-900/50"
            >
              <Pencil className="h-2.5 w-2.5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => removeExtra(k)}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-rose-700/40 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50"
            >
              <X className="h-2.5 w-2.5" strokeWidth={2.5} />
            </button>
          </div>
        );
      })}

      {adding ? (
        <div className="space-y-1.5 rounded-lg border border-slate-700/40 bg-slate-800/30 p-1.5">
          <div className="flex items-center gap-1.5">
            <FieldSuggestInput
              autoFocus
              value={addKey}
              onChange={setAddKey}
              suggestions={addKeySuggestions}
              placeholder="key"
              wrapperClassName="w-24 shrink-0"
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-2 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-cyan-500/40"
              onEnter={() =>
                addType !== "obj" && addType !== "val" && confirmAdd()
              }
            />
            <TypeSelector
              value={addType}
              onChange={(t) => {
                setAddType(t);
                setAddVal(
                  t === "boolean"
                    ? true
                    : t === "number"
                      ? 0
                      : t === "obj" || t === "val"
                        ? {}
                        : "",
                );
              }}
            />
            {(addType === "obj" || addType === "val") && okBtn(confirmAdd)}
            {(addType === "obj" || addType === "val") &&
              cancelBtn(() => setAdding(false))}
          </div>
          {addType !== "obj" && addType !== "val" && (
            <div className="flex items-center gap-1.5">
              <PropValueInput
                type={addType}
                value={addVal}
                onChange={setAddVal}
                placeholder="value"
                onEnter={confirmAdd}
              />
              {okBtn(confirmAdd)}
              {cancelBtn(() => setAdding(false))}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-1 text-[10px] text-slate-600 transition hover:text-slate-400"
        >
          <Plus className="h-2.5 w-2.5" strokeWidth={2.5} /> prop
        </button>
      )}
    </div>
  );
}

// ─── UsageTooltip ──────────────────────────────────────────────────────────────

function charTooltipCls(character?: string): string {
  switch (character?.toLowerCase()) {
    case "ironclad":
      return "text-rose-300 bg-rose-950/60";
    case "silent":
      return "text-teal-300 bg-teal-950/60";
    case "defect":
      return "text-blue-300 bg-blue-950/60";
    case "watcher":
      return "text-purple-300 bg-purple-950/60";
    case "colorless":
      return "text-slate-300 bg-slate-800/60";
    case "status":
      return "text-amber-300 bg-amber-950/60";
    case "curse":
      return "text-indigo-300 bg-indigo-950/60";
    default:
      return "text-slate-400";
  }
}

function UsageTooltip({ cards }: { cards: string[] }) {
  const { bundle } = useContext(EditorCtx);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  function cancelLeave() {
    clearTimeout(leaveTimer.current);
  }

  function scheduleClose() {
    leaveTimer.current = setTimeout(() => setShow(false), 350);
  }

  useEffect(() => {
    if (!show) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setShow(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [show]);

  if (cards.length === 0) return null;
  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={cancelLeave}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        onMouseEnter={() => setShow(true)}
        title={`${cards.length} card${cards.length !== 1 ? "s" : ""} use this field`}
        className="inline-flex h-6 shrink-0 items-center gap-1 rounded border border-slate-700/40 bg-slate-800/30 px-1.5 text-slate-500 transition hover:border-violet-600/50 hover:text-violet-400"
      >
        <Users className="h-3 w-3" strokeWidth={2} />
        <span className="font-mono text-[8px]">{cards.length}</span>
      </button>
      {show && (
        <div className="absolute right-0 top-7 z-50 max-h-52 w-52 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl [scrollbar-width:thin]">
          <p className="sticky top-0 border-b border-slate-800 bg-slate-900 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            {cards.length} card{cards.length !== 1 ? "s" : ""}
          </p>
          {cards.map((id) => {
            const char = bundle[id]?.characters as string | undefined;
            const c = bundle[id] ?? {};
            return (
              <div
                key={id}
                className={`"flex flex-row justify-between items-center gap-1"`}
              >
                <span
                  className={`px-2.5 py-0.5 font-mono text-[10px]`}
                >
                  {id}
                </span>
                <span
                  className={`shrink-0 rounded border px-1 py-px text-[9px] font-bold ${typeChipCls(c.type as string)}`}
                >
                  {(c.type as string).slice(0, 3).toUpperCase()}
                </span>
                <span
                  className={`shrink-0 rounded border px-1 py-px ms-1 text-[9px] font-bold ${charTooltipCls(c.characters as string)}`}
                >
                  {(c.characters as string)?.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ValueNodeRow({
  label,
  fieldKey,
  value,
  error,
  onChangeRaw,
  onRef,
  onRemove,
}: {
  label: string;
  fieldKey?: string;
  value: unknown;
  error?: string;
  onChangeRaw: (obj: Record<string, unknown> | undefined) => void;
  onRef?: () => void;
  onRemove?: () => void;
}) {
  const { fieldUsage } = useContext(EditorCtx);
  const b = getBase(value);
  const u = getUpgraded(value);
  const obj =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const usingCards = fieldKey ? (fieldUsage[fieldKey] ?? []) : [];

  function emitBase(rawB: string) {
    if (rawB === "") {
      onChangeRaw(undefined);
      return;
    }
    const base = Number(rawB);
    onChangeRaw({ ...obj, base });
  }

  function emitUpgraded(rawU: string) {
    if (rawU === "") {
      const next = { ...obj };
      delete next.upgraded;
      onChangeRaw(Object.keys(next).length ? next : undefined);
      return;
    }
    onChangeRaw({
      ...obj,
      base: b === "" ? 0 : Number(b),
      upgraded: Number(rawU),
    });
  }

  const inputCls = (err?: string) =>
    `w-20 rounded-lg border ${err ? "border-red-500/70 bg-red-950/20" : "border-slate-700 bg-slate-900/70"} px-2 py-1.5 text-sm tabular-nums text-slate-100 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20`;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="w-32 shrink-0 text-[11px] font-medium text-slate-400">
          {label}
          {fieldKey && (
            <span className="ml-1 font-mono text-[9px] text-slate-600">
              ({fieldKey})
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Base"
            value={b}
            onChange={(e) => emitBase(e.target.value)}
            className={inputCls(error)}
            title={error}
          />
          <span className="text-[10px] text-slate-600">Base</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="+"
            value={u}
            onChange={(e) => emitUpgraded(e.target.value)}
            className={inputCls()}
          />
          <span className="text-[10px] text-slate-600">Upgraded</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {onRef && (
            <button
              type="button"
              onClick={onRef}
              title="Show/add token"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-sky-600/50 hover:text-sky-400"
            >
              <Link2 className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
          <UsageTooltip cards={usingCards} />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Remove field"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-rose-700/40 bg-rose-950/30 text-rose-400 transition hover:bg-rose-900/50"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
      <ExtraProps
        value={value}
        onChangeRaw={onChangeRaw}
        parentPath={fieldKey}
      />
    </div>
  );
}

function BoolCard({
  fieldKey,
  count,
  value,
  onChangeRaw,
  onRef,
}: {
  fieldKey: string;
  count: number;
  value: unknown;
  onChangeRaw: (obj: Record<string, unknown> | boolean | undefined) => void;
  onRef?: () => void;
}) {
  const { fieldUsage } = useContext(EditorCtx);
  const b = getBoolBase(value);
  const u = getBoolUpgraded(value);
  const obj =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const usingCards = fieldUsage[fieldKey] ?? [];

  function cycleBase() {
    const next = b === null ? true : b === true ? false : null;
    if (next === null) {
      const withoutBase = { ...obj };
      delete withoutBase.base;
      onChangeRaw(Object.keys(withoutBase).length ? withoutBase : undefined);
    } else {
      onChangeRaw({ ...obj, base: next });
    }
  }

  function cycleUpgraded() {
    const next = u === null ? true : u === true ? false : null;
    if (next === null) {
      const withoutUpgraded = { ...obj };
      delete withoutUpgraded.upgraded;
      onChangeRaw(withoutUpgraded);
    } else {
      onChangeRaw({ ...obj, upgraded: next });
    }
  }

  const stateCls = (active: boolean | null) =>
    active === true
      ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-200"
      : active === false
        ? "border-rose-500/60 bg-rose-500/15 text-rose-300"
        : "border-dashed border-slate-600/50 bg-transparent text-slate-500";

  const stateLabel = (active: boolean | null, suffix: string) =>
    active === true
      ? `✓ ${suffix}`
      : active === false
        ? `✗ ${suffix}`
        : `— ${suffix}`;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[12px] font-semibold text-slate-200">
          {humanise(fieldKey)}
        </span>
        <span className="rounded-md border border-slate-700/40 bg-slate-800/50 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
          {count} cards
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {onRef && (
            <button
              type="button"
              onClick={onRef}
              title="Show/add token"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-sky-600/50 hover:text-sky-400"
            >
              <Link2 className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
          <UsageTooltip cards={usingCards} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={cycleBase}
          className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${stateCls(b)}`}
        >
          {stateLabel(b, "Base")}
        </button>
        <button
          type="button"
          onClick={cycleUpgraded}
          className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${stateCls(u)}`}
        >
          {stateLabel(u, "Upgraded")}
        </button>
      </div>
      <ExtraProps
        value={value}
        onChangeRaw={onChangeRaw}
        parentPath={fieldKey}
      />
    </div>
  );
}

function RecursiveField({
  label,
  fieldPath,
  value,
  onChange,
  onRef,
  onRemove,
  absent,
}: {
  label: string;
  fieldPath: string;
  value: unknown;
  onChange: (v: unknown) => void;
  onRef?: (fieldPath: string) => void;
  onRemove?: () => void;
  absent?: boolean;
}) {
  const { bundle, fieldUsage } = useContext(EditorCtx);
  const [adding, setAdding] = useState(false);
  const [addKey, setAddKey] = useState("");
  const [addType, setAddType] = useState<PropType>("string");

  const t = detectType(value);

  const addKeySuggestions = useMemo(
    () => (t === "obj" ? collectKeysAtPath(bundle, fieldPath) : []),
    [bundle, fieldPath, t],
  );

  const topLevelKey = fieldPath.split(".")[0];
  const usingCards = fieldUsage[topLevelKey] ?? [];

  if (t === "obj") {
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj);

    function addChild() {
      if (!addKey.trim()) return;
      const initial: unknown =
        addType === "boolean"
          ? false
          : addType === "number"
            ? 0
            : addType === "val"
              ? { base: 0, upgraded: 0 }
              : addType === "obj"
                ? {}
                : "";
      onChange({ ...obj, [addKey.trim()]: initial });
      setAddKey("");
      setAdding(false);
    }

    return (
      <div>
        <div className="flex items-center gap-2 py-1">
          <TypeBadge type="obj" />
          <span
            className={`font-mono text-[11px] font-semibold ${absent ? "text-slate-600" : "text-slate-300"}`}
          >
            {label}
          </span>
          <span className="text-[9px] text-slate-600">[{entries.length}]</span>
          <div className="ml-auto flex items-center gap-1.5">
            {onRef && (
              <button
                type="button"
                onClick={() => onRef(fieldPath)}
                title="Show/add token"
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-sky-600/50 hover:text-sky-400"
              >
                <Link2 className="h-3 w-3" strokeWidth={2} />
              </button>
            )}
            {!fieldPath.includes(".") && <UsageTooltip cards={usingCards} />}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                title="Remove field"
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-rose-700/40 bg-rose-950/30 text-rose-400 transition hover:bg-rose-900/50"
              >
                <X className="h-3 w-3" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
        <div className="ml-3 space-y-0.5 border-l border-slate-700/40 pl-3">
          {entries.map(([k, v]) => (
            <RecursiveField
              key={k}
              label={`${label}.${k}`}
              fieldPath={`${fieldPath}.${k}`}
              value={v}
              onChange={(nv) => onChange({ ...obj, [k]: nv })}
              onRef={onRef}
            />
          ))}
          {adding ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <FieldSuggestInput
                autoFocus
                value={addKey}
                onChange={setAddKey}
                suggestions={addKeySuggestions}
                placeholder="key"
                wrapperClassName="w-20 shrink-0"
                className="w-full rounded border border-slate-600 bg-slate-900/60 px-1.5 py-0.5 text-[10px] font-mono text-slate-200 outline-none focus:border-cyan-500/40"
                onEnter={addChild}
              />
              <TypeSelector value={addType} onChange={setAddType} />
              <button
                type="button"
                onClick={addChild}
                className="rounded border border-cyan-600/50 bg-cyan-950/40 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 hover:bg-cyan-900/50"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded border border-slate-700/40 bg-slate-800/40 px-1.5 py-0.5 text-[9px] text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdding(true);
                setAddKey("");
                setAddType("string");
              }}
              className="flex items-center gap-1 py-0.5 text-[9px] text-slate-600 hover:text-slate-400"
            >
              <Plus className="h-2.5 w-2.5" strokeWidth={2.5} /> add field
            </button>
          )}
        </div>
      </div>
    );
  }

  const displayValue = absent && t === "boolean" ? null : value;

  return (
    <div className="flex items-center gap-2 py-0.5">
      <TypeBadge type={t} />
      <span
        className={`w-40 shrink-0 truncate font-mono text-[10px] ${absent ? "text-slate-600" : "text-slate-400"}`}
      >
        {label}
      </span>
      <PropValueInput type={t} value={displayValue} onChange={onChange} />
      {onRef && (
        <button
          type="button"
          onClick={() => onRef(fieldPath)}
          title="Show/add token"
          className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-sky-600/50 hover:text-sky-400"
        >
          <Link2 className="h-3 w-3" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function CardFieldEditorClient({
  initialBundle,
  bundleMeta,
}: {
  initialBundle: Bundle;
  bundleMeta: Record<string, unknown>;
}) {
  const [bundle, setBundle] = useState<Bundle>(initialBundle);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmingRevert, setConfirmingRevert] = useState(false);
  const [charFilter, setCharFilter] = useState<CharFilter>("all");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identity: true,
    cost: true,
    fields: true,
  });
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState<PropType>("string");

  // Field sorting + search
  const [fieldSort, setFieldSort] = useState<"az" | "mostUsed" | "activeFirst">(
    "activeFirst",
  );
  const [fieldSortDir, setFieldSortDir] = useState<"asc" | "desc">("desc");
  const [fieldSearch, setFieldSearch] = useState("");

  const [placeholderRules, setPlaceholderRules] = useState<
    PlaceholderRuleConfig[]
  >(rulesData as PlaceholderRuleConfig[]);
  const [highlightedToken, setHighlightedToken] = useState<string | null>(null);
  const [confirmingRevertRules, setConfirmingRevertRules] = useState(false);
  const [addingRule, setAddingRule] = useState(false);
  const [newRuleToken, setNewRuleToken] = useState("");
  const [newRuleLabel, setNewRuleLabel] = useState("");
  const [newRuleType, setNewRuleType] = useState<"field" | "debuff">("field");
  const [newRuleFieldKey, setNewRuleFieldKey] = useState("");

  const historyRef = useRef<Record<string, { stack: CardData[]; idx: number }>>(
    {},
  );
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const listRef = useRef<HTMLDivElement>(null);
  const rulesListRef = useRef<HTMLDivElement>(null);
  const ruleItemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Placeholder rules ────────────────────────────────────────────────────────

  const builtRules = useMemo<BuiltRule[]>(
    () =>
      [...placeholderRules]
        .sort((a, b) => b.token.length - a.token.length)
        .map((cfg) => ({
          token: cfg.token,
          label: cfg.label,
          resolve: buildResolver(cfg),
        })),
    [placeholderRules],
  );

  function handleRef(fieldKey: string) {
    const match = placeholderRules.find(
      (r) => r.resolverType !== "custom" && r.fieldKey === fieldKey,
    );
    if (match) {
      ruleItemRefs.current[match.token]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      setHighlightedToken(match.token);
      setTimeout(() => setHighlightedToken(null), 1500);
    } else {
      setNewRuleToken(`[${fieldKey.toUpperCase()}]`);
      setNewRuleLabel(humanise(fieldKey));
      setNewRuleFieldKey(fieldKey);
      setNewRuleType("field");
      setAddingRule(true);
      setTimeout(
        () =>
          rulesListRef.current?.scrollTo({ top: 99999, behavior: "smooth" }),
        50,
      );
    }
  }

  function addRule() {
    if (!newRuleToken.trim() || !newRuleFieldKey.trim()) return;
    const cfg: PlaceholderRuleConfig = {
      token: newRuleToken.trim(),
      label: newRuleLabel.trim() || newRuleToken.trim(),
      resolverType: newRuleType,
      fieldKey: newRuleFieldKey.trim(),
    };
    setPlaceholderRules((prev) => [...prev, cfg]);
    setNewRuleToken("");
    setNewRuleLabel("");
    setNewRuleFieldKey("");
    setAddingRule(false);
  }

  function deleteRule(token: string) {
    setPlaceholderRules((prev) => prev.filter((r) => r.token !== token));
  }

  function downloadRules() {
    const json = JSON.stringify(placeholderRules, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "description_placeholder_rules.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function revertRules() {
    setPlaceholderRules(rulesBackup as PlaceholderRuleConfig[]);
    setConfirmingRevertRules(false);
  }

  // ── Card list ────────────────────────────────────────────────────────────────

  const cardIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return Object.keys(initialBundle)
      .filter((id) => {
        const c = bundle[id] ?? {};
        if (
          charFilter !== "all" &&
          (c.characters as string)?.toLowerCase() !== charFilter
        )
          return false;
        if (!q) return true;
        return (
          id.toLowerCase().includes(q) ||
          ((c.type as string) ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.localeCompare(b));
  }, [bundle, search, charFilter, initialBundle]);

  const selectedIdx = selectedId ? cardIds.indexOf(selectedId) : -1;

  function selectCard(id: string) {
    setSelectedId(id);
    if (!historyRef.current[id]) {
      historyRef.current[id] = { stack: [snap(bundle[id] ?? {})], idx: 0 };
    }
  }

  function navigate(delta: -1 | 1) {
    const next = selectedIdx + delta;
    if (next >= 0 && next < cardIds.length) {
      selectCard(cardIds[next]);
      setTimeout(() => {
        listRef.current
          ?.querySelector("[data-selected=true]")
          ?.scrollIntoView({ block: "nearest" });
      }, 0);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      navigate(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      navigate(-1);
    }
  }

  // ── Field update ─────────────────────────────────────────────────────────────

  const updateCard = useCallback(
    (patch: Partial<CardData>) => {
      if (!selectedId) return;
      setBundle((prev) => {
        const updated = { ...prev[selectedId], ...patch };
        for (const k of Object.keys(patch)) {
          if (patch[k] === undefined) delete updated[k];
        }
        const next = { ...prev, [selectedId]: updated };
        clearTimeout(pushTimerRef.current);
        pushTimerRef.current = setTimeout(() => {
          const h = historyRef.current[selectedId] ?? { stack: [], idx: -1 };
          const sliced = h.stack.slice(0, h.idx + 1);
          sliced.push(snap(next[selectedId]));
          historyRef.current[selectedId] = {
            stack: sliced,
            idx: sliced.length - 1,
          };
        }, 400);
        return next;
      });
      setDirty((prev) => new Set(prev).add(selectedId));
    },
    [selectedId],
  );

  // ── Undo / Redo ──────────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    if (!selectedId) return;
    const h = historyRef.current[selectedId];
    if (!h || h.idx <= 0) return;
    h.idx--;
    const s = snap(h.stack[h.idx]);
    setBundle((prev) => ({ ...prev, [selectedId]: s }));
  }, [selectedId]);

  const redo = useCallback(() => {
    if (!selectedId) return;
    const h = historyRef.current[selectedId];
    if (!h || h.idx >= h.stack.length - 1) return;
    h.idx++;
    const s = snap(h.stack[h.idx]);
    setBundle((prev) => ({ ...prev, [selectedId]: s }));
  }, [selectedId]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // ── Download ─────────────────────────────────────────────────────────────────

  function download() {
    const out = { ...bundleMeta, cards: bundle };
    const json = JSON.stringify(out, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "STS_CARDS_DB.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function revert() {
    setBundle(snap(initialBundle));
    setDirty(new Set());
    historyRef.current = {};
    setConfirmingRevert(false);
  }

  // ── Master field list (union across all cards) ───────────────────────────────

  const masterFields = useMemo(() => {
    const priority = [
      ...VALUE_NODE_FIELDS.map((f) => f.key),
      ...BONUS_FIELDS.map((f) => f.key),
    ];
    const allKeys = new Set<string>();
    for (const c of Object.values(initialBundle)) {
      for (const k of Object.keys(c)) {
        if (!COMBAT_EXCLUDED.has(k)) allKeys.add(k);
      }
    }
    const rest = [...allKeys].filter((k) => !priority.includes(k)).sort();
    return [...priority.filter((k) => allKeys.has(k)), ...rest];
  }, [initialBundle]);

  // ── Field usage (which cards have each field set) ─────────────────────────────

  const fieldUsage = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const [id, card] of Object.entries(bundle)) {
      for (const k of Object.keys(card)) {
        if (!COMBAT_EXCLUDED.has(k)) {
          if (!map[k]) map[k] = [];
          map[k].push(id);
        }
      }
    }
    return map;
  }, [bundle]);

  function defaultValueForField(key: string): unknown {
    for (const c of Object.values(initialBundle)) {
      if (key in c && c[key] !== undefined) {
        const t = detectType(c[key]);
        if (t === "boolean") return false;
        if (t === "number") return 0;
        if (t === "obj") return {};
        return "";
      }
    }
    return "";
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  const card = selectedId ? (bundle[selectedId] ?? {}) : null;
  const errors = card ? validate(card) : {};
  const errorCount = Object.keys(errors).length;
  const histEntry = selectedId ? historyRef.current[selectedId] : null;
  const canUndo = histEntry ? histEntry.idx > 0 : false;
  const canRedo = histEntry
    ? histEntry.idx < histEntry.stack.length - 1
    : false;

  const allFieldKeys = useMemo(() => {
    const keys = new Set(masterFields);
    if (card) {
      for (const k of Object.keys(card)) {
        if (!COMBAT_EXCLUDED.has(k)) keys.add(k);
      }
    }
    return [...keys];
  }, [masterFields, card]);

  // ── Sorted + filtered field keys ─────────────────────────────────────────────

  const sortedFieldKeys = useMemo(() => {
    let keys = [...allFieldKeys];
    if (fieldSort === "az") {
      keys.sort((a, b) => a.localeCompare(b));
    } else if (fieldSort === "mostUsed") {
      keys.sort(
        (a, b) => (fieldUsage[b]?.length ?? 0) - (fieldUsage[a]?.length ?? 0),
      );
    } else {
      // activeFirst
      keys.sort((a, b) => {
        const aIn = card && a in card ? 1 : 0;
        const bIn = card && b in card ? 1 : 0;
        if (bIn !== aIn) return bIn - aIn;
        return a.localeCompare(b);
      });
    }
    if (fieldSortDir === "asc") keys.reverse();
    return keys;
  }, [allFieldKeys, fieldSort, fieldSortDir, fieldUsage, card]);

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const txtCls = (err?: string) =>
    `w-full rounded-lg border ${err ? "border-red-500/70 bg-red-950/20" : "border-slate-700 bg-slate-900/70"} px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20`;

  function addField() {
    if (!newFieldKey.trim()) return;
    const iv =
      newFieldType === "boolean"
        ? false
        : newFieldType === "number"
          ? 0
          : newFieldType === "val"
            ? { base: 0, upgraded: 0 }
            : newFieldType === "obj"
              ? {}
              : "";
    updateCard({ [newFieldKey.trim()]: iv });
    setNewFieldKey("");
  }

  // ── Token description usage (cards whose description contains each token) ────────

  const tokenDescCards = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const rule of placeholderRules) {
      const ids: string[] = [];
      for (const [id, c] of Object.entries(bundle)) {
        const desc = (c.description as string) ?? "";
        const descUp = (c.descriptionUpgraded as string) ?? "";
        if (desc.includes(rule.token) || descUp.includes(rule.token))
          ids.push(id);
      }
      map[rule.token] = ids;
    }
    return map;
  }, [placeholderRules, bundle]);

  // ── Sort button helper ────────────────────────────────────────────────────────

  const sortBtnCls = (active: boolean) =>
    active
      ? "border-cyan-500/60 bg-cyan-950/50 text-cyan-300"
      : "border-slate-700/50 bg-slate-900/50 text-slate-500 hover:border-slate-600 hover:text-slate-300";

  // ── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <EditorCtx.Provider value={{ bundle, fieldUsage }}>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
        {/* ── Top bar ── */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-800/80 bg-slate-900/60 px-4 py-2.5">
          <Link
            href="/editors"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={2.5} /> Editors
          </Link>
          <span className="text-sm font-bold text-slate-200">
            Card Field Editor
          </span>
          {errorCount > 0 && (
            <span className="flex items-center gap-1 rounded-md border border-red-500/40 bg-red-950/50 px-2 py-0.5 text-[10px] font-bold text-red-300">
              <TriangleAlert className="h-3 w-3" strokeWidth={2} />
              {errorCount} error{errorCount > 1 ? "s" : ""}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/60 text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/60 text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Redo2 className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            {confirmingRevert ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-600/50 bg-amber-950/40 px-3 py-1.5">
                <span className="text-[11px] font-semibold text-amber-300">
                  Revert all changes?
                </span>
                <button
                  type="button"
                  onClick={revert}
                  className="rounded-md border border-amber-500/60 bg-amber-900/50 px-2 py-0.5 text-[10px] font-bold text-amber-200 hover:bg-amber-800/60"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingRevert(false)}
                  className="rounded-md border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingRevert(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/40 bg-amber-950/30 px-3 py-1.5 text-[11px] font-semibold text-amber-400 transition hover:border-amber-600/60 hover:bg-amber-900/40"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                Revert
              </button>
            )}
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-600/50 bg-sky-950/50 px-3 py-1.5 text-[11px] font-bold text-sky-200 transition hover:bg-sky-900/60"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              Download JSON
              {dirty.size > 0 && (
                <span className="rounded-md bg-sky-500/25 px-1.5 py-0.5 text-[9px] font-bold">
                  {dirty.size} modified
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: card list ── */}
          <div className="flex w-60 shrink-0 flex-col overflow-hidden border-r border-slate-800/80">
            <div className="shrink-0 border-b border-slate-800/60 p-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cards…"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="shrink-0 flex flex-wrap gap-1 border-b border-slate-800/60 px-2 py-2">
              {CHAR_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setCharFilter(f.value)}
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold transition ${charFilter === f.value ? f.active : f.pill}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800/60 px-3 py-1.5">
              <span className="text-[10px] text-slate-600">
                {selectedIdx >= 0 ? (
                  <>
                    <span className="font-bold text-slate-400">
                      {selectedIdx + 1}
                    </span>{" "}
                    / {cardIds.length}
                  </>
                ) : (
                  <span>{cardIds.length} cards</span>
                )}
              </span>
              <span className="text-[10px] text-slate-600">
                {Object.keys(bundle).length} total
              </span>
            </div>
            <div
              ref={listRef}
              tabIndex={0}
              onKeyDown={onListKeyDown}
              className="flex-1 overflow-y-auto outline-none [scrollbar-width:thin] focus:ring-1 focus:ring-inset focus:ring-cyan-500/20"
            >
              {cardIds.length === 0 && (
                <p className="px-3 py-8 text-center text-[11px] text-slate-600">
                  No cards match
                </p>
              )}
              {cardIds.map((id, i) => {
                const c = bundle[id] ?? {};
                const isSelected = id === selectedId;
                return (
                  <button
                    key={id}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => selectCard(id)}
                    className={`flex w-full items-center gap-2 border-b border-slate-800/30 px-2 py-2 text-left transition last:border-0 ${isSelected ? "bg-sky-950/45 ring-inset ring-1 ring-sky-500/40" : "hover:bg-slate-800/40"}`}
                  >
                    <span className="w-6 shrink-0 text-right font-mono text-[9px] text-slate-600">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-200">
                      {id}
                    </span>
                    {!!c.type && (
                      <span
                        className={`shrink-0 rounded border px-1 py-px text-[9px] font-bold ${typeChipCls(c.type as string)}`}
                      >
                        {(c.type as string).slice(0, 3).toUpperCase()}
                      </span>
                    )}
                    {dirty.has(id) && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                        title="Unsaved"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="shrink-0 flex border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={selectedIdx <= 0}
                className="flex flex-1 items-center justify-center gap-1 py-2 text-[11px] font-semibold text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} /> Prev
              </button>
              <div className="w-px bg-slate-800/60" />
              <button
                type="button"
                onClick={() => navigate(1)}
                disabled={selectedIdx >= cardIds.length - 1}
                className="flex flex-1 items-center justify-center gap-1 py-2 text-[11px] font-semibold text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ── Right: card detail ── */}
          {!card ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-slate-600">
                Select a card to edit its fields
              </p>
            </div>
          ) : (
            <div className="flex flex-1 min-w-0 overflow-hidden">
              {/* ── Field editor (60%) + Tokens panel (40%) ── */}
              <div className="flex flex-[3] min-w-0 overflow-hidden">
                {/* Field editor */}
                <div className="flex-[3] min-w-0 overflow-y-auto [scrollbar-width:thin]">
                  <div className="mx-auto max-w-3xl space-y-1 px-5 py-5">
                    {/* Card header */}
                    <div className="mb-4 flex items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-100">
                        {selectedId}
                      </h2>
                      {!!card.type && (
                        <span
                          className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${typeChipCls(card.type as string)}`}
                        >
                          {card.type as string}
                        </span>
                      )}
                      {!!card.rarity && (
                        <span className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                          {card.rarity as string}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-slate-600">
                        {selectedIdx + 1} / {cardIds.length}
                      </span>
                    </div>

                    {/* Identity */}
                    <SectionHeader
                      label="Identity"
                      open={openSections.identity}
                      onToggle={() => toggleSection("identity")}
                    />
                    {openSections.identity && (
                      <div className="space-y-3 rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
                        <div>
                          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Type{" "}
                            {errors.type && (
                              <span className="ml-1 text-red-400">
                                — {errors.type}
                              </span>
                            )}
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {TYPE_OPTIONS.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => updateCard({ type: t })}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${card.type === t ? typeChipCls(t) + " ring-1 ring-current/30" : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50"}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Rarity
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {RARITY_OPTIONS.map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => updateCard({ rarity: r })}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${card.rarity === r ? "border-amber-500/70 bg-amber-950/60 text-amber-200 ring-1 ring-amber-500/30" : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50"}`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Character{" "}
                            {errors.characters && (
                              <span className="ml-1 text-red-400">
                                — {errors.characters}
                              </span>
                            )}
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {CHAR_OPTIONS.map((ch) => {
                              const cfg = CHAR_FILTERS.find(
                                (f) => f.value === ch,
                              )!;
                              return (
                                <button
                                  key={ch}
                                  type="button"
                                  onClick={() => updateCard({ characters: ch })}
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition ${card.characters === ch ? cfg.active : cfg.pill}`}
                                >
                                  {ch}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          {[
                            { key: "xCost", label: "X Cost" },
                            { key: "unplayable", label: "Unplayable" },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => updateCard({ [key]: !card[key] })}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${card[key] ? "border-violet-500/70 bg-violet-950/60 text-violet-200" : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600"}`}
                            >
                              {card[key] ? "✓" : "○"} {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cost */}
                    <SectionHeader
                      label="Cost"
                      open={openSections.cost}
                      onToggle={() => toggleSection("cost")}
                    />
                    {openSections.cost && (
                      <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
                        <ValueNodeRow
                          label="Cost"
                          value={card.cost}
                          onChangeRaw={(obj) => updateCard({ cost: obj })}
                        />
                      </div>
                    )}

                    {/* Fields */}
                    <SectionHeader
                      label={`Fields (${allFieldKeys.length})`}
                      open={openSections.fields}
                      onToggle={() => toggleSection("fields")}
                    />
                    {openSections.fields && (
                      <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
                        {/* Sort + search controls */}
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <div className="flex gap-1">
                            {(["activeFirst", "mostUsed", "az"] as const).map(
                              (s) => {
                                const labels = {
                                  activeFirst: "Active First",
                                  mostUsed: "Most Used",
                                  az: "A–Z",
                                };
                                const isActive = fieldSort === s;
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      if (isActive)
                                        setFieldSortDir((d) =>
                                          d === "asc" ? "desc" : "asc",
                                        );
                                      else {
                                        setFieldSort(s);
                                        setFieldSortDir("desc");
                                      }
                                    }}
                                    className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition ${sortBtnCls(isActive)}`}
                                  >
                                    {labels[s]}
                                    {isActive &&
                                      (fieldSortDir === "desc" ? (
                                        <ChevronDown
                                          className="h-2.5 w-2.5"
                                          strokeWidth={2.5}
                                        />
                                      ) : (
                                        <ChevronUp
                                          className="h-2.5 w-2.5"
                                          strokeWidth={2.5}
                                        />
                                      ))}
                                  </button>
                                );
                              },
                            )}
                          </div>
                          <div className="ml-auto">
                            <input
                              type="text"
                              value={fieldSearch}
                              onChange={(e) => setFieldSearch(e.target.value)}
                              placeholder="filter fields…"
                              className="w-36 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2.5 py-1 text-[10px] text-slate-300 outline-none focus:border-cyan-500/40 placeholder:text-slate-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          {sortedFieldKeys.map((key) => {
                            const matchesSearch =
                              !fieldSearch ||
                              key
                                .toLowerCase()
                                .includes(fieldSearch.toLowerCase());
                            const rowWrap = matchesSearch
                              ? ""
                              : "opacity-25 pointer-events-none select-none";

                            const vnf = VALUE_NODE_FIELDS.find(
                              (f) => f.key === key,
                            );
                            if (vnf)
                              return (
                                <div
                                  key={key}
                                  className={`border-b pb-2 last:border-0 last:pb-0 border border-slate-800/50 rounded-lg bg-slate-900/50 p-3 hover:bg-slate-800/70 transition ${rowWrap}`}
                                >
                                  <ValueNodeRow
                                    label={vnf.label}
                                    fieldKey={key}
                                    value={card[key]}
                                    error={errors[key]}
                                    onChangeRaw={(obj) =>
                                      updateCard({ [key]: obj })
                                    }
                                    onRef={() => handleRef(key)}
                                    onRemove={
                                      key in card
                                        ? () => updateCard({ [key]: undefined })
                                        : undefined
                                    }
                                  />
                                </div>
                              );
                            const bf = BONUS_FIELDS.find((f) => f.key === key);
                            if (bf)
                              return (
                                <div
                                  key={key}
                                  className={`border-b pb-2 last:border-0 last:pb-0 border border-slate-800/50 rounded-lg bg-slate-900/50 p-3 hover:bg-slate-800/70 transition ${rowWrap}`}
                                >
                                  <ValueNodeRow
                                    label={bf.label}
                                    fieldKey={key}
                                    value={card[key]}
                                    onChangeRaw={(obj) =>
                                      updateCard({ [key]: obj })
                                    }
                                    onRef={() => handleRef(key)}
                                    onRemove={
                                      key in card
                                        ? () => updateCard({ [key]: undefined })
                                        : undefined
                                    }
                                  />
                                </div>
                              );
                            const exists = key in card;
                            const effectiveValue = exists
                              ? card[key]
                              : defaultValueForField(key);
                            return (
                              <div
                                key={key}
                                className={`border-b pb-2 last:border-0 last:pb-0 border border-slate-800/50 rounded-lg bg-slate-900/50 p-3 hover:bg-slate-800/70 transition ${rowWrap}`}
                              >
                                <RecursiveField
                                  label={key}
                                  fieldPath={key}
                                  value={effectiveValue}
                                  onChange={(v) => updateCard({ [key]: v })}
                                  onRef={(fieldPath) => handleRef(fieldPath)}
                                  onRemove={
                                    exists
                                      ? () => updateCard({ [key]: undefined })
                                      : undefined
                                  }
                                  absent={!exists}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Add new field */}
                        <div className="mt-3 flex items-center gap-2 border-t border-slate-800/60 pt-3">
                          <FieldSuggestInput
                            value={newFieldKey}
                            onChange={setNewFieldKey}
                            suggestions={masterFields}
                            placeholder="new field key…"
                            wrapperClassName="flex-1 min-w-0"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1.5 text-[12px] font-mono text-slate-200 outline-none focus:border-cyan-500/50"
                            onEnter={addField}
                          />
                          <TypeSelector
                            value={newFieldType}
                            onChange={setNewFieldType}
                          />
                          <button
                            type="button"
                            disabled={!newFieldKey.trim()}
                            onClick={addField}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-600/50 bg-slate-800/50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" strokeWidth={2.5} /> Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* JSON */}
                    <div className="border-t border-slate-800/60 pt-4">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          JSON
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            card &&
                            navigator.clipboard.writeText(
                              JSON.stringify(card, null, 2),
                            )
                          }
                          title="Copy JSON"
                          className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-sky-600/50 hover:text-sky-400"
                        >
                          <Copy className="h-3 w-3" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedId) return;
                            const original = initialBundle[selectedId];
                            if (original) {
                              setBundle((prev) => ({
                                ...prev,
                                [selectedId]: snap(original),
                              }));
                            }
                          }}
                          title="Revert card to original"
                          className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-amber-600/50 hover:text-amber-400"
                        >
                          <RotateCcw className="h-3 w-3" strokeWidth={2} />
                        </button>
                      </div>
                      <textarea
                        value={card ? JSON.stringify(card, null, 2) : ""}
                        onChange={(e) => {
                          if (!card || !selectedId) return;
                          try {
                            const parsed = JSON.parse(e.target.value);
                            updateCard(parsed);
                          } catch {
                            // Invalid JSON, ignore
                          }
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1.5 text-[12px] font-mono text-slate-200 outline-none focus:border-cyan-500/50 resize-none"
                        rows={10}
                        placeholder="Card JSON..."
                      />
                    </div>

                    <div className="h-10" />
                  </div>
                </div>

                {/* ── Tokens panel (25%) ── */}
                <div className="flex-[1] min-w-0 border-l border-slate-800/80 overflow-y-auto [scrollbar-width:thin]">
                  <div className="px-3 py-3 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Tokens
                      </span>
                      <span className="rounded border border-slate-700/40 bg-slate-800/40 px-1.5 py-px text-[10px] font-bold text-slate-500">
                        {placeholderRules.length}
                      </span>
                      <div className="flex-1" />
                      {confirmingRevertRules ? (
                        <>
                          <span className="text-[9px] text-amber-400">
                            Revert?
                          </span>
                          <button
                            type="button"
                            onClick={revertRules}
                            className="rounded border border-amber-500/50 bg-amber-950/40 px-1.5 py-px text-[9px] font-bold text-amber-300 hover:bg-amber-900/50"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingRevertRules(false)}
                            className="rounded border border-slate-700/40 bg-slate-800/40 px-1.5 py-px text-[9px] text-slate-500 hover:text-slate-300"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingRevertRules(true)}
                          title="Revert to backup"
                          className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-amber-600/50 hover:text-amber-400"
                        >
                          <RotateCcw
                            className="h-2.5 w-2.5"
                            strokeWidth={2.5}
                          />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAddingRule(true);
                          setNewRuleToken("");
                          setNewRuleLabel("");
                          setNewRuleFieldKey("");
                          setNewRuleType("field");
                        }}
                        className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-cyan-600/50 hover:text-cyan-400"
                      >
                        <Plus className="h-2.5 w-2.5" strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={downloadRules}
                        title="Download rules JSON"
                        className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-sky-600/50 hover:text-sky-400"
                      >
                        <Download className="h-2.5 w-2.5" strokeWidth={2} />
                      </button>
                    </div>

                    {/* Rules list */}
                    <div
                      ref={rulesListRef}
                      className="space-y-1.5 overflow-y-auto [scrollbar-width:thin]"
                    >
                      {placeholderRules.map((r) => {
                        const isCustom = r.resolverType === "custom";
                        const isHighlighted = highlightedToken === r.token;
                        const usingCards = tokenDescCards[r.token] ?? [];
                        const liveValue =
                          card && !isCustom
                            ? builtRules
                                .find((br) => br.token === r.token)
                                ?.resolve({
                                  ...card,
                                  isUpgraded: false,
                                } as unknown as Card)
                            : undefined;

                        return (
                          <div
                            key={r.token}
                            ref={(el) => {
                              ruleItemRefs.current[r.token] = el;
                            }}
                            className={`rounded-lg border px-2.5 py-2.5 transition-all duration-300 ${
                              isHighlighted
                                ? "border-amber-400/50 bg-amber-950/30 ring-1 ring-amber-400/40"
                                : isCustom
                                  ? "border-slate-800/40 bg-slate-900/20 opacity-60"
                                  : "border-slate-800/50 bg-slate-900/30"
                            }`}
                          >
                            {/* Row 1: token + copy + resolver badge + actions */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-[12px] font-bold text-slate-200">
                                {r.token}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  void navigator.clipboard.writeText(r.token)
                                }
                                title="Copy token"
                                className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700/40 bg-slate-800/30 text-slate-500 transition hover:border-sky-600/50 hover:text-sky-400"
                              >
                                <Copy className="h-3 w-3" strokeWidth={2} />
                              </button>
                              <span
                                className={`rounded border px-1.5 py-px text-[9px] font-bold font-mono ${
                                  r.resolverType === "debuff"
                                    ? "border-rose-700/50 text-rose-400"
                                    : r.resolverType === "custom"
                                      ? "border-slate-600/40 text-slate-600"
                                      : "border-sky-700/50 text-sky-400"
                                }`}
                              >
                                {r.resolverType}
                              </span>
                              <div className="flex-1" />
                              <UsageTooltip cards={usingCards} />
                              {!isCustom && (
                                <button
                                  type="button"
                                  onClick={() => deleteRule(r.token)}
                                  className="inline-flex h-5 w-5 items-center justify-center rounded border border-rose-700/40 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50"
                                >
                                  <X
                                    className="h-2.5 w-2.5"
                                    strokeWidth={2.5}
                                  />
                                </button>
                              )}
                            </div>
                            {/* Row 2: label + fieldKey */}
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400">
                                {r.label}
                              </span>
                              {!isCustom && r.fieldKey && (
                                <span className="font-mono text-[10px] text-slate-600">
                                  → {r.fieldKey}
                                </span>
                              )}
                            </div>
                            {/* Row 3: live value for selected card */}
                            {liveValue !== undefined && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-[9px] text-slate-600">
                                  now:
                                </span>
                                <span className="font-mono text-[11px] font-bold text-amber-300">
                                  {liveValue}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add rule form */}
                      {addingRule && (
                        <div className="space-y-1.5 rounded-lg border border-cyan-700/30 bg-cyan-950/10 p-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              autoFocus
                              value={newRuleToken}
                              onChange={(e) => setNewRuleToken(e.target.value)}
                              placeholder="[TOKEN]"
                              className="w-20 rounded border border-slate-600 bg-slate-900/60 px-1.5 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-cyan-500/40"
                            />
                            <input
                              value={newRuleLabel}
                              onChange={(e) => setNewRuleLabel(e.target.value)}
                              placeholder="label"
                              className="flex-1 rounded border border-slate-600 bg-slate-900/60 px-1.5 py-0.5 text-[11px] text-slate-200 outline-none focus:border-cyan-500/40"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-1">
                              {(["field", "debuff"] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setNewRuleType(t)}
                                  className={`rounded border px-1.5 py-0.5 text-[9px] font-bold transition ${
                                    newRuleType === t
                                      ? t === "debuff"
                                        ? "border-rose-500/60 bg-rose-950/40 text-rose-300"
                                        : "border-sky-500/60 bg-sky-950/40 text-sky-300"
                                      : "border-slate-700/40 text-slate-600 hover:text-slate-400"
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                            <input
                              value={newRuleFieldKey}
                              onChange={(e) =>
                                setNewRuleFieldKey(e.target.value)
                              }
                              placeholder="fieldKey"
                              onKeyDown={(e) => e.key === "Enter" && addRule()}
                              className="flex-1 rounded border border-slate-600 bg-slate-900/60 px-1.5 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-cyan-500/40"
                            />
                            <button
                              type="button"
                              onClick={addRule}
                              className="rounded border border-cyan-600/50 bg-cyan-950/40 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-900/50"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingRule(false)}
                              className="rounded border border-slate-700/40 bg-slate-800/40 px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-300"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Descriptions column (25%) ── */}
              <div className="flex-[1] min-w-0 overflow-y-auto border-l border-slate-800/80 [scrollbar-width:thin]">
                <div className="space-y-2 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Description
                  </p>

                  {/* Live preview */}
                  <div className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-3">
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      Base
                    </p>
                    <p className="font-mono text-[12px] leading-relaxed italic text-slate-300">
                      {card.description ? (
                        renderColored(
                          card.description as string,
                          { ...card, isUpgraded: false } as unknown as Card,
                          builtRules,
                        )
                      ) : (
                        <span className="not-italic text-slate-600">
                          — empty —
                        </span>
                      )}
                    </p>
                    <div className="my-2 h-px bg-slate-800/60" />
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      Upgraded
                    </p>
                    <p className="font-mono text-[12px] leading-relaxed italic text-sky-300/80">
                      {(card.descriptionUpgraded ?? card.description) ? (
                        renderColored(
                          (card.descriptionUpgraded ??
                            card.description) as string,
                          { ...card, isUpgraded: true } as unknown as Card,
                          builtRules,
                        )
                      ) : (
                        <span className="not-italic text-slate-600">
                          — empty —
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Base description */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Base{" "}
                      {errors.description && (
                        <span className="text-red-400">
                          — {errors.description}
                        </span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      value={(card.description as string) ?? ""}
                      onChange={(e) =>
                        updateCard({ description: e.target.value })
                      }
                      className={`${txtCls(errors.description)} resize-none font-mono text-[12px]`}
                      placeholder="e.g. Deal [DMG] damage."
                    />
                  </div>

                  {/* Upgraded description */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Upgraded
                    </label>
                    <textarea
                      rows={4}
                      value={(card.descriptionUpgraded as string) ?? ""}
                      onChange={(e) =>
                        updateCard({
                          descriptionUpgraded: e.target.value || undefined,
                        })
                      }
                      className={`${txtCls()} resize-none font-mono text-[12px]`}
                      placeholder="Leave blank if unchanged when upgraded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </EditorCtx.Provider>
  );
}
