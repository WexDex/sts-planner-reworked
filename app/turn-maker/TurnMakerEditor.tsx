"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  Enemy,
  EnemyIntent,
  EnemyIntentAction,
  EnemyIntentStatusLocation,
} from "@/app/types/gameTypes";
import { ENEMY_INTENT_ACTION_TYPES } from "@/app/types/gameTypes";
import { useGameManager } from "@/app/context/GameContext";
import { formatIntentActionsLine } from "@/app/utils/intentFormat";
import {
  createDefaultEnemyIntentAction,
  getSingleAttackDamage,
} from "@/app/utils/enemyIntentActionHelpers";
import eliteSample from "@/app/data/sample/EliteSlavers.json";
import {
  ClipboardCopy,
  Footprints,
  GripVertical,
  Minus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { getActiveLineageCanonicalNodeIdBySlot } from "@/app/utils/decisionTreeHelpers";
import {
  hslHueToAccentHex,
  resolvedDecisionTimelineAccentHex,
} from "@/app/utils/decisionTimelineAccent";
import { IntentIconGlyph } from "@/app/components/UI/IntentIconGlyph";

const ACTION_LABEL: Record<EnemyIntentAction["type"], string> = {
  attack: "Attack",
  multi_attack: "Multi-hit",
  block: "Block",
  debuff: "Debuff",
  buff: "Buff",
  status: "Status",
  cowardly: "Escape",
  stunned: "Stunned",
  no_action: "No action",
};

/** Inactive chip + ring when selected (radio-card look). */
const ACTION_TYPE_THEME: Record<
  EnemyIntentAction["type"],
  { ring: string; soft: string; label: string; iconCls: string }
> = {
  attack: {
    ring: "ring-rose-400/55 border-rose-400/65 bg-rose-950/55 text-rose-50",
    soft: "border-rose-500/25 bg-rose-950/25 text-rose-100/85 hover:bg-rose-950/45",
    label: "text-rose-200/95",
    iconCls: "text-rose-300",
  },
  multi_attack: {
    ring: "ring-orange-400/55 border-orange-400/65 bg-orange-950/55 text-orange-50",
    soft: "border-orange-500/25 bg-orange-950/25 text-orange-100/85 hover:bg-orange-950/45",
    label: "text-orange-200/95",
    iconCls: "text-orange-300",
  },
  block: {
    ring: "ring-sky-400/55 border-sky-400/65 bg-sky-950/55 text-sky-50",
    soft: "border-sky-500/25 bg-sky-950/25 text-sky-100/85 hover:bg-sky-950/45",
    label: "text-sky-200/95",
    iconCls: "text-sky-300",
  },
  debuff: {
    ring: "ring-violet-400/55 border-violet-400/65 bg-violet-950/55 text-violet-50",
    soft: "border-violet-500/25 bg-violet-950/25 text-violet-100/85 hover:bg-violet-950/45",
    label: "text-violet-200/95",
    iconCls: "text-violet-300",
  },
  buff: {
    ring: "ring-emerald-400/55 border-emerald-400/65 bg-emerald-950/55 text-emerald-50",
    soft: "border-emerald-500/25 bg-emerald-950/25 text-emerald-100/85 hover:bg-emerald-950/45",
    label: "text-emerald-200/95",
    iconCls: "text-emerald-300",
  },
  status: {
    ring: "ring-cyan-400/55 border-cyan-400/65 bg-cyan-950/55 text-cyan-50",
    soft: "border-cyan-500/25 bg-cyan-950/25 text-cyan-100/85 hover:bg-cyan-950/45",
    label: "text-cyan-200/95",
    iconCls: "text-cyan-300",
  },
  cowardly: {
    ring: "ring-amber-400/55 border-amber-400/65 bg-amber-950/55 text-amber-50",
    soft: "border-amber-500/25 bg-amber-950/25 text-amber-100/85 hover:bg-amber-950/45",
    label: "text-amber-200/95",
    iconCls: "text-amber-300",
  },
  stunned: {
    ring: "ring-indigo-400/55 border-indigo-400/65 bg-indigo-950/55 text-indigo-50",
    soft: "border-indigo-500/25 bg-indigo-950/25 text-indigo-100/85 hover:bg-indigo-950/45",
    label: "text-indigo-200/95",
    iconCls: "text-indigo-300",
  },
  no_action: {
    ring: "ring-slate-400/55 border-slate-400/65 bg-slate-900/95 text-slate-50",
    soft: "border-slate-500/25 bg-slate-950/40 text-slate-200/85 hover:bg-slate-900/65",
    label: "text-slate-200/95",
    iconCls: "text-slate-400",
  },
};

const ENTITY_NAME_INPUT_CLASSES =
  "min-h-[3rem] w-full rounded-xl border border-fuchsia-500/35 bg-linear-to-br from-slate-900/94 to-slate-950 px-4 py-2.5 text-[16px] font-semibold tracking-tight text-slate-50 outline-none ring-1 ring-black/35 transition hover:border-fuchsia-400/50 focus-visible:border-fuchsia-400/60 focus-visible:ring-2 focus-visible:ring-fuchsia-400/25";

/** Single-line text in action rows (effects, notes). */
const TEXT_LINE_CLASSES =
  "min-h-[2.75rem] w-full rounded-xl border border-slate-600/80 bg-linear-to-b from-slate-800/88 to-slate-950 px-3.5 py-2.5 text-[14px] font-medium text-slate-100 placeholder:text-slate-600 shadow-inner shadow-black/35 outline-none ring-1 ring-black/30 transition hover:border-slate-500 focus-visible:border-teal-400/50 focus-visible:ring-2 focus-visible:ring-teal-400/20";

const LOCATION_SELECT_CLASSES = `${TEXT_LINE_CLASSES} cursor-pointer`;

const STATUS_LOCATION_OPTIONS: { value: EnemyIntentStatusLocation; label: string }[] = [
  { value: "hand", label: "Hand" },
  { value: "draw", label: "Draw pile" },
  { value: "discard", label: "Discard pile" },
];

/** Golden-angle hue step — matches {@link decisionTimelineAccent} spacing for fallback slot colors. */
const SLOT_ACCENT_GOLDEN_DEG = 137.50776405003784;


/** Field labels — sentence-style, readable size (avoid tiny all-caps alone). */
const L = {
  rose: "text-[11px] font-semibold leading-snug tracking-wide text-rose-200/92",
  orange: "text-[11px] font-semibold leading-snug tracking-wide text-orange-200/90",
  sky: "text-[11px] font-semibold leading-snug tracking-wide text-sky-200/92",
  violet: "text-[11px] font-semibold leading-snug tracking-wide text-violet-200/92",
  slate: "text-[11px] font-semibold leading-snug tracking-wide text-slate-300/92",
  slateMuted:
    "text-[11px] font-semibold leading-snug tracking-wide text-slate-400/92",
  amber: "text-[11px] font-semibold leading-snug tracking-wide text-amber-200/88",
  indigo: "text-[11px] font-semibold leading-snug tracking-wide text-indigo-200/92",
  emerald: "text-[11px] font-semibold leading-snug tracking-wide text-emerald-200/90",
  cyan: "text-[11px] font-semibold leading-snug tracking-wide text-cyan-200/90",
  fuchsia: "text-[11px] font-semibold leading-snug tracking-wide text-fuchsia-200/92",
};

function FieldHint({ children }: { children: ReactNode }) {
  return (
    <span className="mt-1 block max-w-[20rem] text-[10px] font-normal leading-relaxed tracking-normal text-slate-500/95">
      {children}
    </span>
  );
}

const STEP_BTN_INNER_BASE =
  "flex shrink-0 cursor-pointer touch-manipulation select-none items-center justify-center rounded-lg border border-slate-600/40 bg-slate-800/80 px-2 py-2 text-slate-200 shadow-sm outline-none disabled:pointer-events-none disabled:opacity-35 sm:px-2.5";

const STEP_BTN_INNER_HIT =
  " border-slate-500/95 bg-slate-700/95 text-white shadow-inner shadow-black/25";

const STEP_INNER_INPUT_ACTION =
  "min-h-[2.85rem] min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-center text-[16px] font-bold tabular-nums tracking-tight text-slate-50 caret-teal-400 outline-none ring-0 [appearance:textfield] [-moz-appearance:textfield] sm:text-[17px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const STEP_INNER_INPUT_STAT =
  "min-h-[3rem] min-w-0 flex-1 border-0 bg-transparent px-2 py-2.5 text-center text-[17px] font-bold tabular-nums tracking-tight text-slate-50 caret-teal-400 outline-none ring-0 [appearance:textfield] [-moz-appearance:textfield] sm:text-[18px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function StepNumberInput({
  id,
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  size = "action",
  shellClassName = "",
}: {
  id?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "action" | "stat";
  shellClassName?: string;
}) {
  const inner =
    size === "stat" ? STEP_INNER_INPUT_STAT : STEP_INNER_INPUT_ACTION;
  const shellH =
    size === "stat"
      ? "min-h-[3.35rem] sm:min-h-[3.55rem]"
      : "min-h-[3rem] sm:min-h-[3.25rem]";
  const [hit, setHit] = useState<"minus" | "plus" | null>(null);
  const minus = () =>
    onChange(Math.max(min, Number.isFinite(step) ? value - step : value - 1));
  const plus = () =>
    onChange(Math.min(max, Number.isFinite(step) ? value + step : value + 1));
  const atMin = value <= min;
  const atMax = value >= max;
  const iconCls =
    "pointer-events-none shrink-0 h-5 w-5 text-current sm:h-[1.35rem] sm:w-[1.35rem]";
  return (
    <div
      className={`isolate flex w-full min-w-0 items-center gap-1.5 rounded-2xl border-2 border-slate-600/55 bg-linear-to-b from-slate-800/95 via-slate-900 to-slate-950 px-2 py-1 shadow-[inset_0_2px_14px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-150 focus-within:border-teal-400/65 focus-within:shadow-[inset_0_0_0_1px_rgba(45,212,191,0.12),0_0_0_3px_rgba(45,212,191,0.15)] ${shellH} ${shellClassName}`}
    >
      <button
        type="button"
        tabIndex={-1}
        className={`${STEP_BTN_INNER_BASE} active:scale-[0.96] transition-[transform,color,background-color,border-color,box-shadow] duration-150 ${
          !atMin && hit === "minus" ? STEP_BTN_INNER_HIT : ""
        }`}
        disabled={atMin}
        aria-label={`Decrease by ${step}`}
        onPointerEnter={() => {
          if (!atMin) setHit("minus");
        }}
        onPointerLeave={() => setHit(null)}
        onMouseDown={(e) => {
          if (atMin) return;
          e.preventDefault();
          minus();
        }}
      >
        <Minus className={iconCls} strokeWidth={2.75} aria-hidden />
      </button>
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => {
          const v = e.target.value.trim();
          if (v === "" || v === "-") {
            onChange(min);
            return;
          }
          const n = Number(v);
          if (!Number.isFinite(n)) return;
          onChange(Math.min(max, Math.max(min, Math.floor(n))));
        }}
        onPointerEnter={() => setHit(null)}
        className={inner}
      />
      <button
        type="button"
        tabIndex={-1}
        className={`${STEP_BTN_INNER_BASE} active:scale-[0.96] transition-[transform,color,background-color,border-color,box-shadow] duration-150 ${
          !atMax && hit === "plus" ? STEP_BTN_INNER_HIT : ""
        }`}
        disabled={atMax}
        aria-label={`Increase by ${step}`}
        onPointerEnter={() => {
          if (!atMax) setHit("plus");
        }}
        onPointerLeave={() => setHit(null)}
        onMouseDown={(e) => {
          if (atMax) return;
          e.preventDefault();
          plus();
        }}
      >
        <Plus className={iconCls} strokeWidth={2.75} aria-hidden />
      </button>
    </div>
  );
}

function OptionalStackStepInput({
  value,
  onChange,
  max = 999,
}: {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  max?: number;
}) {
  const [hit, setHit] = useState<"minus" | "plus" | null>(null);
  const iconCls =
    "pointer-events-none shrink-0 h-5 w-5 text-current sm:h-[1.35rem] sm:w-[1.35rem]";
  const minusDisabled = value === undefined;
  const plusDisabled = value !== undefined && value >= max;

  const minus = () => {
    if (value === undefined || value <= 1) {
      onChange(undefined);
      return;
    }
    onChange(value - 1);
  };
  const plus = () => {
    const cur = value === undefined ? 0 : value;
    onChange(Math.min(max, cur + 1));
  };

  return (
    <div className="isolate flex w-full min-w-0 items-center gap-1.5 rounded-2xl border-2 border-slate-600/55 bg-linear-to-b from-slate-800/95 via-slate-900 to-slate-950 px-2 py-1 shadow-[inset_0_2px_14px_rgba(0,0,0,0.45)] transition-colors duration-150 focus-within:border-teal-400/65 focus-within:shadow-[inset_0_0_0_1px_rgba(45,212,191,0.12),0_0_0_3px_rgba(45,212,191,0.15)]">
      <button
        type="button"
        tabIndex={-1}
        className={`${STEP_BTN_INNER_BASE} active:scale-[0.96] transition-[transform,color,background-color,border-color,box-shadow] duration-150 ${
          !minusDisabled && hit === "minus" ? STEP_BTN_INNER_HIT : ""
        }`}
        disabled={minusDisabled}
        aria-label="Decrease stack count (omit to mean 1)"
        onPointerEnter={() => {
          if (!minusDisabled) setHit("minus");
        }}
        onPointerLeave={() => setHit(null)}
        onMouseDown={(e) => {
          e.preventDefault();
          minus();
        }}
      >
        <Minus className={iconCls} strokeWidth={2.75} aria-hidden />
      </button>
      <input
        type="number"
        value={value === undefined ? "" : value}
        placeholder="Blank = default 1"
        onPointerEnter={() => setHit(null)}
        onChange={(e) => {
          const raw = e.target.value.trim();
          if (raw === "") onChange(undefined);
          else onChange(Math.max(1, Number(raw) || 1));
        }}
        className={`${STEP_INNER_INPUT_ACTION} placeholder:text-[11px] placeholder:font-semibold`}
      />
      <button
        type="button"
        tabIndex={-1}
        className={`${STEP_BTN_INNER_BASE} active:scale-[0.96] transition-[transform,color,background-color,border-color,box-shadow] duration-150 ${
          !plusDisabled && hit === "plus" ? STEP_BTN_INNER_HIT : ""
        }`}
        disabled={plusDisabled}
        aria-label="Increase stack count"
        onPointerEnter={() => {
          if (!plusDisabled) setHit("plus");
        }}
        onPointerLeave={() => setHit(null)}
        onMouseDown={(e) => {
          e.preventDefault();
          plus();
        }}
      >
        <Plus className={iconCls} strokeWidth={2.75} aria-hidden />
      </button>
    </div>
  );
}

function cloneEnemies(e: Enemy[]): Enemy[] {
  return JSON.parse(JSON.stringify(e)) as Enemy[];
}

function nextTurnNumber(intents: EnemyIntent[]): number {
  const nums = intents.map((i) => i.turn).filter(Number.isFinite);
  if (!nums.length) return 1;
  return Math.max(...nums, 0) + 1;
}

function actionRowAccentClass(type: EnemyIntentAction["type"]): string {
  const map: Record<EnemyIntentAction["type"], string> = {
    attack: "border-l-rose-500/60 bg-rose-950/15",
    multi_attack: "border-l-orange-500/60 bg-orange-950/15",
    block: "border-l-sky-500/60 bg-sky-950/15",
    debuff: "border-l-violet-500/60 bg-violet-950/15",
    buff: "border-l-emerald-500/60 bg-emerald-950/15",
    status: "border-l-cyan-500/60 bg-cyan-950/15",
    cowardly: "border-l-amber-500/60 bg-amber-950/15",
    stunned: "border-l-indigo-500/60 bg-indigo-950/15",
    no_action: "border-l-slate-500/60 bg-slate-950/20",
  };
  return map[type] ?? "border-l-slate-600 bg-slate-950/40";
}

function FieldShell({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone:
    | "neutral"
    | "rose"
    | "sky"
    | "violet"
    | "orange"
    | "emerald"
    | "cyan";
}) {
  const shell =
    tone === "rose"
      ? "border-rose-500/30 bg-rose-950/20 focus-within:border-rose-400/50"
      : tone === "orange"
        ? "border-orange-500/30 bg-orange-950/20 focus-within:border-orange-400/50"
        : tone === "emerald"
          ? "border-emerald-500/30 bg-emerald-950/20 focus-within:border-emerald-400/50"
          : tone === "cyan"
            ? "border-cyan-500/30 bg-cyan-950/20 focus-within:border-cyan-400/50"
            : tone === "sky"
              ? "border-sky-500/30 bg-sky-950/20 focus-within:border-sky-400/50"
              : tone === "violet"
                ? "border-violet-500/30 bg-violet-950/20 focus-within:border-violet-400/50"
                : "border-slate-600/80 bg-slate-950/60 focus-within:border-slate-500/80";
  return (
    <div className={`rounded-lg border px-2 py-1 transition-colors ${shell}`}>
      {children}
    </div>
  );
}

function ActionTypePickerGrid({
  value,
  onChange,
}: {
  value: EnemyIntentAction["type"];
  onChange: (t: EnemyIntentAction["type"]) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Intent action types"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {ENEMY_INTENT_ACTION_TYPES.map((t) => {
        const th = ACTION_TYPE_THEME[t];
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t)}
            title={ACTION_LABEL[t]}
            className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-center shadow-sm transition-all active:scale-[0.98] ${
              active ? `${th.ring} ring-2 shadow-md shadow-black/30` : `${th.soft}`
            }`}
          >
            <IntentIconGlyph
              type={t}
              className={`h-6 w-6 shrink-0 drop-shadow-sm ${th.iconCls}`}
              strokeWidth={1.75}
            />
            <span className={`line-clamp-2 text-[11px] font-semibold leading-tight ${th.label}`}>
              {ACTION_LABEL[t]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ActionFields({
  action,
  onChange,
}: {
  action: EnemyIntentAction;
  onChange: (next: EnemyIntentAction) => void;
}) {
  const setNum = (
    patch: Partial<EnemyIntentAction> & Record<string, number | string | undefined>,
  ) => {
    onChange({ ...action, ...patch } as EnemyIntentAction);
  };

  const textCls = TEXT_LINE_CLASSES;

  switch (action.type) {
    case "attack":
      return (
        <FieldShell tone="rose">
          <label className="flex flex-col gap-1.5">
            <span className={L.rose}>Damage</span>
            <StepNumberInput
              min={0}
              value={getSingleAttackDamage(action)}
              onChange={(n) => setNum({ dmg: n, value: undefined })}
            />
          </label>
        </FieldShell>
      );
    case "multi_attack":
      return (
        <div className="flex flex-wrap gap-2">
          <FieldShell tone="rose">
            <label className="flex flex-col gap-1.5">
              <span className={L.rose}>Damage per hit</span>
              <StepNumberInput
                min={0}
                value={action.dmg}
                onChange={(n) => setNum({ dmg: n })}
              />
            </label>
          </FieldShell>
          <FieldShell tone="orange">
            <label className="flex flex-col gap-1.5">
              <span className={L.orange}>Number of hits</span>
              <StepNumberInput
                min={1}
                max={999}
                value={action.count}
                onChange={(n) => setNum({ count: n })}
              />
            </label>
          </FieldShell>
        </div>
      );
    case "block":
      return (
        <FieldShell tone="sky">
          <label className="flex flex-col gap-1.5">
            <span className={L.sky}>Block</span>
            <FieldHint>How many block points this intent applies.</FieldHint>
            <StepNumberInput
              min={0}
              value={action.amount}
              onChange={(n) => setNum({ amount: n })}
            />
          </label>
        </FieldShell>
      );
    case "debuff":
      return (
        <div className="flex flex-1 flex-wrap gap-2">
          <FieldShell tone="violet">
            <label className="flex min-w-[7rem] flex-1 flex-col gap-1.5">
              <span className={L.violet}>Effect name</span>
              <FieldHint>e.g. Weak, Vulnerable, Frail</FieldHint>
              <input
                type="text"
                value={action.effect}
                onChange={(e) => setNum({ effect: e.target.value })}
                className={textCls}
                placeholder="Weak"
              />
            </label>
          </FieldShell>
          <FieldShell tone="neutral">
            <label className="flex min-w-[12rem] max-w-[18rem] flex-1 flex-col gap-1.5">
              <span className={L.slateMuted}>Stack count</span>
              <FieldHint>Leave blank to use the default of 1.</FieldHint>
              <OptionalStackStepInput
                value={action.value}
                onChange={(v) => setNum({ value: v })}
              />
            </label>
          </FieldShell>
          <FieldShell tone="neutral">
            <label className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
              <span className={L.slateMuted}>Description</span>
              <FieldHint>Optional — shown in summaries only.</FieldHint>
              <input
                type="text"
                value={action.description ?? ""}
                onChange={(e) => setNum({ description: e.target.value || undefined })}
                className={textCls}
                placeholder="Optional text"
              />
            </label>
          </FieldShell>
        </div>
      );
    case "buff":
      return (
        <div className="flex flex-1 flex-wrap gap-2">
          <FieldShell tone="emerald">
            <label className="flex min-w-[7rem] flex-1 flex-col gap-1.5">
              <span className={L.emerald}>Effect name</span>
              <input
                type="text"
                value={action.effect}
                onChange={(e) => setNum({ effect: e.target.value })}
                className={textCls}
                placeholder="Strength"
              />
            </label>
          </FieldShell>
          <FieldShell tone="neutral">
            <label className="flex min-w-[10rem] max-w-[16rem] flex-col gap-1.5">
              <span className={L.slateMuted}>Magnitude</span>
              <FieldHint>Value or stacks — buff strength.</FieldHint>
              <StepNumberInput
                min={0}
                value={action.value}
                onChange={(n) => setNum({ value: n })}
              />
            </label>
          </FieldShell>
        </div>
      );
    case "status":
      return (
        <div className="flex flex-1 flex-wrap gap-2">
          <FieldShell tone="cyan">
            <label className="flex min-w-[7rem] flex-1 flex-col gap-1.5">
              <span className={L.cyan}>Card / token name</span>
              <FieldHint>Which card (e.g. Wound).</FieldHint>
              <input
                type="text"
                value={action.effect}
                onChange={(e) => setNum({ effect: e.target.value })}
                className={textCls}
                placeholder="Wound"
              />
            </label>
          </FieldShell>
          <FieldShell tone="neutral">
            <label className="flex min-w-[9rem] max-w-[13rem] flex-col gap-1.5">
              <span className={L.slateMuted}>Count</span>
              <FieldHint>How many are added.</FieldHint>
              <StepNumberInput
                min={0}
                value={action.value}
                onChange={(n) => setNum({ value: n })}
              />
            </label>
          </FieldShell>
          <FieldShell tone="neutral">
            <label className="flex min-w-[10rem] max-w-[17rem] flex-col gap-1.5">
              <span className={L.slateMuted}>Location</span>
              <FieldHint>Deck zone receiving the copies.</FieldHint>
              <select
                value={action.location ?? "hand"}
                aria-label="Status card pile"
                onChange={(e) =>
                  setNum({
                    location: e.target.value as EnemyIntentStatusLocation,
                  })
                }
                className={LOCATION_SELECT_CLASSES}
              >
                {STATUS_LOCATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </FieldShell>
        </div>
      );
    case "cowardly":
      return (
        <FieldShell tone="neutral">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
            <span className={L.amber}>Notes</span>
            <FieldHint>Optional — describes how this flee intent reads.</FieldHint>
            <input
              type="text"
              value={action.description ?? ""}
              onChange={(e) =>
                setNum({ description: e.target.value || undefined })
              }
              className={textCls}
              placeholder="Adds flavor text only"
            />
          </label>
        </FieldShell>
      );
    case "stunned":
      return (
        <FieldShell tone="neutral">
          <label className="flex min-w-[10rem] max-w-[16rem] flex-col gap-1.5">
            <span className={L.indigo}>Duration (turns stunned)</span>
            <StepNumberInput
              min={1}
              max={999}
              value={action.value}
              onChange={(n) => setNum({ value: n })}
            />
          </label>
        </FieldShell>
      );
    case "no_action":
      return (
        <FieldShell tone="neutral">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
            <span className={L.slateMuted}>Notes</span>
            <FieldHint>
              Marks this enemy as in combat for this planner turn with no attack (empty intent row would mean “not
              spawned yet”).
            </FieldHint>
            <input
              type="text"
              value={action.description ?? ""}
              onChange={(e) => setNum({ description: e.target.value || undefined })}
              className={textCls}
              placeholder="Optional label"
            />
          </label>
        </FieldShell>
      );
    default:
      return null;
  }
}

function EnemyPickerCards({
  enemies,
  selectedIdx,
  onSelect,
  onRemove,
}: {
  enemies: Enemy[];
  selectedIdx: number;
  onSelect: (i: number) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Enemies — pick one to edit"
      className="flex flex-wrap gap-2"
    >
      {enemies.map((en, i) => {
        const active = i === selectedIdx;
        return (
          <div key={`${en.name}-${i}`} className="relative inline-flex shrink-0">
            <button
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(i)}
              className={`relative flex max-w-[11rem] min-w-[7.5rem] flex-col rounded-xl border px-3 py-2.5 pr-7 text-left shadow-sm transition-all active:scale-[0.99] ${
                active
                  ? "border-fuchsia-400/65 bg-gradient-to-br from-fuchsia-950/80 to-purple-950/60 ring-2 ring-fuchsia-400/35"
                  : "border-slate-600/65 bg-slate-900/80 hover:border-slate-500/80 hover:bg-slate-800/85"
              }`}
            >
              <span className={`truncate text-xs font-bold ${active ? "text-fuchsia-100" : "text-slate-200"}`}>
                {en.name}
              </span>
              <span className={`text-[10px] tabular-nums ${active ? "text-fuchsia-200/85" : "text-slate-500"}`}>
                HP {en.hp}/{en.maxHp}
              </span>
            </button>
            {active && enemies.length > 1 ? (
              <button
                type="button"
                title="Remove enemy"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(i);
                }}
                className="absolute right-1 top-1 z-10 rounded-md p-1 text-rose-400/95 hover:bg-rose-950/70 hover:text-rose-200"
              >
                <Trash2 className="h-3 w-3" strokeWidth={2.25} />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function TurnMakerEditor() {
  const {
    gameState,
    syncEnemyIntentsGlobally,
    turns,
    decisionNodes,
    activeDecisionNodeId,
  } = useGameManager();
  const [enemies, setEnemies] = useState<Enemy[]>(() =>
    gameState?.enemies?.length
      ? cloneEnemies(gameState.enemies)
      : cloneEnemies(eliteSample.enemies as Enemy[]),
  );
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [intentIdx, setIntentIdx] = useState(0);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [importDraft, setImportDraft] = useState("");
  /** Mobile: collapsible sections could use this later; keep expand for JSON */
  const [jsonOpen, setJsonOpen] = useState(true);
  const [overridesOpen, setOverridesOpen] = useState(false);
  const dragFromIdx = useRef<number | null>(null);

  const intentsSorted = useMemo(() => {
    const list = enemies[enemyIdx]?.intents ?? [];
    return [...list].sort((a, b) => a.turn - b.turn);
  }, [enemies, enemyIdx]);

  /** Accent by planner slot id (timeline lineage when a branch is active; else golden-angle fallback). */
  const plannerSlotAccentById = useMemo(() => {
    const meta = new Map<number, string>();
    const accentBySlot = new Map<number, string>();
    if (activeDecisionNodeId && decisionNodes.length > 0) {
      const canonicalNodeIdBySlot = getActiveLineageCanonicalNodeIdBySlot(
        decisionNodes,
        activeDecisionNodeId,
        turns,
      );
      const byId = new Map(decisionNodes.map((n) => [n.id, n] as const));
      const fallback = "#64748B";
      for (const [slot, nodeId] of canonicalNodeIdBySlot) {
        const node = byId.get(nodeId);
        accentBySlot.set(
          slot,
          node ? resolvedDecisionTimelineAccentHex(node, fallback) : fallback,
        );
      }
    }

    const slotIds = new Set<number>();
    for (const t of turns) slotIds.add(t.id);
    for (const it of intentsSorted) slotIds.add(it.turn);

    for (const slot of slotIds) {
      const accentHex =
        accentBySlot.get(slot) ??
        hslHueToAccentHex((Math.max(1, slot) - 1) * SLOT_ACCENT_GOLDEN_DEG);
      meta.set(slot, accentHex);
    }
    return meta;
  }, [turns, intentsSorted, decisionNodes, activeDecisionNodeId]);

  const maxIntentIdx = Math.max(0, intentsSorted.length - 1);
  const intentIdxResolved = Math.min(intentIdx, maxIntentIdx);

  const currentIntent =
    intentsSorted[intentIdxResolved] ??
    intentsSorted[0] ??
    ({
      turn: 1,
      actions: [],
    } as EnemyIntent);

  const turnMakerIntentsMatchPlanner = useMemo(() => {
    const live = gameState?.enemies;
    if (!live?.length && enemies.length === 0) return true;
    if (!live || live.length !== enemies.length) return false;
    return JSON.stringify(live) === JSON.stringify(enemies);
  }, [gameState?.enemies, enemies]);

  const syncFromPlanner = useCallback(() => {
    if (!gameState?.enemies?.length) return;
    setEnemies(cloneEnemies(gameState.enemies));
    setEnemyIdx(0);
    setIntentIdx(0);
  }, [gameState]);

  const applyToPlanner = useCallback(() => {
    if (!gameState) return;
    syncEnemyIntentsGlobally(cloneEnemies(enemies));
  }, [gameState, enemies, syncEnemyIntentsGlobally]);

  const patchEnemy = useCallback((i: number, patch: Partial<Enemy>) => {
    setEnemies((prev) => {
      const next = cloneEnemies(prev);
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }, []);

  const patchIntent = useCallback(
    (enemyI: number, turnKey: number, patch: EnemyIntent | ((prev: EnemyIntent) => EnemyIntent)) => {
      setEnemies((prev) => {
        const next = cloneEnemies(prev);
        const ix = next[enemyI].intents.findIndex((x) => x.turn === turnKey);
        if (ix < 0) return prev;
        const prevIntent = next[enemyI].intents[ix];
        next[enemyI].intents[ix] =
          typeof patch === "function" ? patch(prevIntent) : patch;
        return next;
      });
    },
    [],
  );

  const addEnemy = () => {
    let newIndex = 0;
    setEnemies((prev) => {
      newIndex = prev.length;
      const row: Enemy = {
        name: `Enemy ${newIndex + 1}`,
        hp: 40,
        maxHp: 40,
        intents: [{ turn: 1, actions: [{ type: "attack", dmg: 6 }] }],
      };
      return [...prev, row];
    });
    setEnemyIdx(newIndex);
    setIntentIdx(0);
  };

  const removeEnemy = (i: number) => {
    setEnemies((prev) => prev.filter((_, j) => j !== i));
    setEnemyIdx((ei) =>
      Math.max(0, ei === i ? ei - 1 : ei > i ? ei - 1 : ei),
    );
  };

  const addIntent = () => {
    const e = enemies[enemyIdx];
    if (!e) return;
    const t = nextTurnNumber(e.intents);
    patchEnemy(enemyIdx, {
      intents: [...e.intents, { turn: t, actions: [{ type: "attack", dmg: 6 }] }],
    });
    const sorted = [...e.intents, { turn: t, actions: [{ type: "attack", dmg: 6 }] }].sort(
      (a, b) => a.turn - b.turn,
    );
    setIntentIdx(sorted.findIndex((x) => x.turn === t));
  };

  const duplicateIntent = () => {
    const e = enemies[enemyIdx];
    if (!e) return;
    const src = intentsSorted[intentIdxResolved];
    if (!src) return;
    const t = nextTurnNumber(e.intents);
    const clone: EnemyIntent = { turn: t, actions: JSON.parse(JSON.stringify(src.actions)) };
    patchEnemy(enemyIdx, { intents: [...e.intents, clone] });
    const sorted = [...e.intents, clone].sort((a, b) => a.turn - b.turn);
    setIntentIdx(sorted.findIndex((x) => x.turn === t));
  };

  const removeIntent = (turnKey: number) => {
    const e = enemies[enemyIdx];
    if (!e || e.intents.length <= 1) return;
    patchEnemy(enemyIdx, { intents: e.intents.filter((x) => x.turn !== turnKey) });
    setIntentIdx(0);
  };

  /** Reorder intents after drag: renumber turns 1..N to match new visual order. */
  const reorderIntents = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setEnemies((prev) => {
      const next = cloneEnemies(prev);
      const sorted = [...next[enemyIdx].intents].sort((a, b) => a.turn - b.turn);
      const [moved] = sorted.splice(fromIdx, 1);
      sorted.splice(toIdx, 0, moved);
      next[enemyIdx].intents = sorted.map((it, i) => ({ ...it, turn: i + 1 }));
      return next;
    });
    setIntentIdx(toIdx);
  }, [enemyIdx]);

  // HP override management
  const addOverride = useCallback(() => {
    setEnemies((prev) => {
      const next = cloneEnemies(prev);
      const overrides = next[enemyIdx].intentOverrides ?? [];
      next[enemyIdx].intentOverrides = [...overrides, { hpThresholdPercent: 50, intentTurnNumber: 1 }];
      return next;
    });
  }, [enemyIdx]);

  const patchOverride = useCallback((overrideIdx: number, patch: Partial<import('@/app/types/gameTypes').EnemyIntentOverride>) => {
    setEnemies((prev) => {
      const next = cloneEnemies(prev);
      const overrides = next[enemyIdx].intentOverrides ?? [];
      overrides[overrideIdx] = { ...overrides[overrideIdx], ...patch };
      next[enemyIdx].intentOverrides = overrides;
      return next;
    });
  }, [enemyIdx]);

  const removeOverride = useCallback((overrideIdx: number) => {
    setEnemies((prev) => {
      const next = cloneEnemies(prev);
      const overrides = next[enemyIdx].intentOverrides ?? [];
      next[enemyIdx].intentOverrides = overrides.filter((_, i) => i !== overrideIdx);
      return next;
    });
  }, [enemyIdx]);

  const previewLine = formatIntentActionsLine(currentIntent.actions);

  const peersAtPlannerTurn = useMemo(() => {
    const slot = currentIntent.turn;
    return enemies.map((en, enemyIndex) => {
      const intent = en.intents.find((it) => it.turn === slot);
      const rowLine = intent
        ? formatIntentActionsLine(intent.actions)
        : "— no scripted intent at this planner turn slot —";
      return { enemyIndex, name: en.name, rowLine };
    });
  }, [enemies, currentIntent.turn]);

  const currentSlotAccentHex =
    plannerSlotAccentById.get(currentIntent.turn) ?? "#64748b";

  const jsonExport = useMemo(() => JSON.stringify(enemies, null, 2), [enemies]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Top toolbar — color bands */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => syncFromPlanner()}
          disabled={!gameState?.enemies?.length}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/55 bg-gradient-to-br from-sky-900/85 to-blue-950/70 px-3 py-2 text-xs font-bold text-sky-50 shadow-md shadow-black/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={2} />
          Load planner
        </button>
        <button
          type="button"
          onClick={() => {
            setEnemies(cloneEnemies(eliteSample.enemies as Enemy[]));
            setEnemyIdx(0);
            setIntentIdx(0);
          }}
          className="rounded-xl border border-slate-500/65 bg-gradient-to-br from-slate-800/95 to-slate-900/90 px-3 py-2 text-xs font-bold text-slate-100 shadow-md shadow-black/20 transition hover:brightness-110"
        >
          Elite sample
        </button>
        <button
          type="button"
          onClick={applyToPlanner}
          disabled={!gameState || turnMakerIntentsMatchPlanner}
          title={
            turnMakerIntentsMatchPlanner
              ? 'Enemy intents already match the planner — nothing to publish'
              : 'Writes enemy intents to combat, every planner turn slot, and all decision snapshots.'
          }
          className={`rounded-xl border px-3 py-2 text-xs font-bold shadow-md shadow-black/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 ${
            turnMakerIntentsMatchPlanner
              ? 'border-slate-600 bg-gradient-to-br from-slate-800/90 to-slate-900/85 text-slate-500'
              : 'border-emerald-400/55 bg-gradient-to-br from-emerald-800/92 to-teal-950/70 text-emerald-50'
          }`}
        >
          Apply planner
        </button>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(jsonExport);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/50 bg-gradient-to-br from-violet-900/82 to-purple-950/75 px-3 py-2 text-xs font-bold text-violet-50 shadow-md shadow-black/25 transition hover:brightness-110"
        >
          <ClipboardCopy className="h-3.5 w-3.5" strokeWidth={2} />
          Copy JSON
        </button>
      </div>

      <div className="flex min-h-[min(76vh,900px)] min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-4">
        {/* Left: planner turn slots */}
        <aside className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-teal-500/35 bg-gradient-to-b from-teal-950/50 to-slate-950/95 p-3 shadow-inner shadow-teal-950/40 lg:w-[17rem] xl:w-[19rem]">
          <div className="flex items-start gap-2 border-b border-teal-500/25 pb-2.5">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 select-none items-center justify-center text-lg leading-none"
              aria-hidden
            >
              📋
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-200/95">
                Planner turns
              </p>
              <p className="mt-1 text-[10px] font-normal normal-case leading-snug tracking-normal text-teal-500/90">
                Enemy intent slots by <span className="font-semibold text-teal-300/95">planner turn number</span>
                {" — "}
                <span className="font-semibold text-teal-300/95">colors</span> mirror timeline accents when a branch is
                active (optional visual only).
              </p>
            </div>
          </div>
          <div
            role="radiogroup"
            aria-label="Select planner turn"
            className="flex min-h-[8rem] max-h-[40vh] flex-col gap-2.5 overflow-y-auto pr-0.5 lg:max-h-none lg:flex-1"
          >
            {intentsSorted.map((it, idx) => {
              const line = formatIntentActionsLine(it.actions);
              const sel = intentIdxResolved === idx;
              const short = !line
                ? ""
                : line.length > (sel ? 200 : 72)
                  ? `${line.slice(0, sel ? 198 : 70)}…`
                  : line;
              const ac = plannerSlotAccentById.get(it.turn) ?? "#64748b";
              const nActs = it.actions.length;
              const typeStrip = it.actions.slice(0, 5);
              const stepLabel = `${idx + 1} / ${intentsSorted.length}`;
              const hasOverride = (enemies[enemyIdx]?.intentOverrides ?? []).some(
                (ov) => ov.intentTurnNumber === it.turn,
              );
              return (
                <button
                  key={it.turn}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  draggable
                  onDragStart={() => { dragFromIdx.current = idx; }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragFromIdx.current !== null && dragFromIdx.current !== idx) {
                      reorderIntents(dragFromIdx.current, idx);
                      dragFromIdx.current = idx;
                    }
                  }}
                  onDragEnd={() => { dragFromIdx.current = null; }}
                  onClick={() => setIntentIdx(idx)}
                  title={line || "No intent line yet"}
                  className={`group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-200 active:scale-[0.992] cursor-grab active:cursor-grabbing ${
                    sel ? "shadow-lg shadow-black/45" : "hover:brightness-[1.03]"
                  }`}
                  style={{
                    borderColor: sel ? `${ac}aa` : "rgba(45, 212, 196, 0.22)",
                    background: sel
                      ? `linear-gradient(152deg, ${ac}38 0%, rgba(15,23,42,0.97) 38%, rgba(2,6,23,0.99) 100%)`
                      : `linear-gradient(152deg, ${ac}18 0%, rgba(15,23,42,0.82) 45%, rgba(2,6,23,0.94) 100%)`,
                    boxShadow: sel
                      ? `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${ac}44, 0 14px 36px rgba(0,0,0,0.42)`
                      : `inset 0 1px 0 rgba(255,255,255,0.03)`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-[0.14] blur-2xl"
                    style={{ backgroundColor: ac }}
                    aria-hidden
                  />
                  <div className="relative flex gap-3 p-3 sm:p-3.5">
                    <div
                      className="flex h-[3.65rem] w-[3.65rem] shrink-0 flex-col items-center justify-center rounded-2xl border-2 shadow-inner"
                      style={{
                        borderColor: `${ac}bb`,
                        background: `linear-gradient(165deg, ${ac}55 0%, rgba(15,23,42,0.98) 72%)`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), 0 0 24px ${ac}28`,
                      }}
                    >
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-white/65">
                        Slot
                      </span>
                      <span className="mt-0.5 text-[1.35rem] font-black leading-none tabular-nums tracking-tight text-white drop-shadow-sm sm:text-2xl">
                        {it.turn}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="rounded-md border border-white/10 bg-black/28 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-teal-200/90">
                          {stepLabel}
                        </span>
                        {hasOverride && (
                          <span className="rounded-md border border-amber-500/50 bg-amber-950/50 px-1.5 py-px text-[9px] font-bold text-amber-200" title="HP threshold override points to this turn">
                            ⚠ HP override
                          </span>
                        )}
                        {nActs > 0 ? (
                          <span className="ml-auto rounded-full border border-slate-600/50 bg-slate-950/40 px-2 py-px text-[9px] font-bold tabular-nums text-slate-400 group-hover:border-slate-500 group-hover:text-slate-300 sm:ml-0">
                            {nActs}&nbsp;action{nActs === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span className="ml-auto rounded-full border border-amber-500/35 bg-amber-950/35 px-2 py-px text-[9px] font-bold text-amber-200/90 sm:ml-0">
                            Empty
                          </span>
                        )}
                      </div>
                      {typeStrip.length > 0 ? (
                        <div className="mt-1.5 flex items-center gap-1">
                          {typeStrip.map((a, ai) => (
                            <IntentIconGlyph
                              key={ai}
                              type={a.type}
                              className={`h-3.5 w-3.5 shrink-0 ${ACTION_TYPE_THEME[a.type].iconCls}`}
                              strokeWidth={1.75}
                            />
                          ))}
                          {it.actions.length > 5 && (
                            <span className="text-[9px] font-bold text-slate-500">+{it.actions.length - 5}</span>
                          )}
                        </div>
                      ) : null}
                      <p
                        className={`mt-2 line-clamp-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed ${
                          sel ? "text-teal-100/95" : "text-slate-500 group-hover:text-slate-400"
                        }`}
                      >
                        {short ||
                          "No intent line yet — pick this slot and add actions in the center column."}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex flex-col gap-2 border-t border-teal-500/20 pt-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={addIntent}
                className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-teal-400/50 bg-teal-950/35 py-2 text-[10px] font-bold text-teal-200 transition hover:bg-teal-950/55 hover:text-teal-50"
              >
                ➕ Add turn
              </button>
              <button
                type="button"
                onClick={duplicateIntent}
                className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-sky-400/40 bg-sky-950/30 py-2 text-[10px] font-bold text-sky-200 transition hover:bg-sky-950/50 hover:text-sky-50"
                title="Duplicate current turn at next slot"
              >
                ⧉ Duplicate
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeIntent(currentIntent.turn)}
              disabled={intentsSorted.length <= 1}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/30 py-2 text-[11px] font-semibold text-rose-100/95 transition hover:bg-rose-950/50 disabled:opacity-40"
              title="Remove this planner turn"
            >
              <span className="text-sm leading-none select-none" aria-hidden>🗑️</span>
              Remove turn
            </button>

            {/* HP Conditional Overrides */}
            <div className="border-t border-teal-500/15 pt-2">
              <button
                type="button"
                onClick={() => setOverridesOpen(v => !v)}
                className="flex w-full items-center justify-between gap-1.5 rounded-lg px-1 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300/80 hover:text-amber-200 transition-colors"
              >
                <span>⚠ HP Overrides ({(enemies[enemyIdx]?.intentOverrides ?? []).length})</span>
                <span>{overridesOpen ? "▲" : "▼"}</span>
              </button>
              {overridesOpen && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {(enemies[enemyIdx]?.intentOverrides ?? []).map((ov, oi) => (
                    <div key={oi} className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-950/25 px-2 py-1.5">
                      <span className="text-[9px] text-amber-400/70 shrink-0">HP ≤</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={ov.hpThresholdPercent}
                        onChange={e => patchOverride(oi, { hpThresholdPercent: Number(e.target.value) })}
                        className="w-10 rounded border border-amber-700/50 bg-slate-900 px-1 py-0.5 text-center text-[10px] text-amber-100"
                      />
                      <span className="text-[9px] text-amber-400/70 shrink-0">% → T</span>
                      <input
                        type="number"
                        min={1}
                        value={ov.intentTurnNumber}
                        onChange={e => patchOverride(oi, { intentTurnNumber: Number(e.target.value) })}
                        className="w-10 rounded border border-amber-700/50 bg-slate-900 px-1 py-0.5 text-center text-[10px] text-amber-100"
                      />
                      <button
                        onClick={() => removeOverride(oi)}
                        className="ml-auto text-rose-400 hover:text-rose-200 text-xs"
                        aria-label="Remove override"
                      >✕</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOverride}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-amber-500/35 bg-amber-950/20 py-1.5 text-[10px] font-bold text-amber-300 hover:bg-amber-950/40 transition-colors"
                  >
                    + Add override
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Center */}
        <div className="min-h-[min(60vh,720px)] min-h-0 flex-1 space-y-3 overflow-auto rounded-2xl border border-slate-700/65 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-950 p-4 shadow-xl shadow-black/40 md:rounded-3xl md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-700/60 pb-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Footprints className="h-4 w-4 text-fuchsia-400" strokeWidth={2} />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fuchsia-200/95">
                  Enemies
                </p>
              </div>
              <EnemyPickerCards
                enemies={enemies}
                selectedIdx={enemyIdx}
                onSelect={(i) => {
                  setEnemyIdx(i);
                  setIntentIdx(0);
                }}
                onRemove={removeEnemy}
              />
            </div>
            <button
              type="button"
              onClick={addEnemy}
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-fuchsia-500/45 bg-fuchsia-950/40 px-3 py-2 text-[11px] font-bold text-fuchsia-100 shadow-sm transition hover:bg-fuchsia-900/55"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add enemy
            </button>
          </div>

          {enemies[enemyIdx] ? (
            <div className="grid gap-3 rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-950/20 to-purple-950/10 p-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-300/92">
                  Display name
                </span>
                <input
                  value={enemies[enemyIdx].name}
                  onChange={(e) => patchEnemy(enemyIdx, { name: e.target.value })}
                  className={ENTITY_NAME_INPUT_CLASSES}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-300/92">
                  Current HP
                </span>
                <StepNumberInput
                  size="stat"
                  min={0}
                  value={enemies[enemyIdx].hp}
                  onChange={(n) => patchEnemy(enemyIdx, { hp: n })}
                  shellClassName="border-rose-500/50 text-rose-50 focus-within:border-rose-400/70 focus-within:shadow-[inset_0_0_0_1px_rgba(251,113,133,0.12),0_0_0_3px_rgba(251,113,133,0.16)]"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-300/92">
                  Maximum HP
                </span>
                <StepNumberInput
                  size="stat"
                  min={0}
                  value={enemies[enemyIdx].maxHp}
                  onChange={(n) => patchEnemy(enemyIdx, { maxHp: n })}
                  shellClassName="border-amber-500/45 text-amber-50 focus-within:border-amber-400/65 focus-within:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.12),0_0_0_3px_rgba(251,191,36,0.14)]"
                />
              </label>
            </div>
          ) : null}

            <div className="space-y-4">
            <div className="flex flex-col gap-2 border-b border-slate-700/50 pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                Intent actions
                <span className="text-[11px] font-normal normal-case tracking-normal text-slate-500">
                  Stack multiple blocks for this planner turn if needed.
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold tabular-nums text-slate-200"
                  style={{ borderLeftWidth: 3, borderLeftColor: currentSlotAccentHex }}
                >
                  Slot {currentIntent.turn}
                </span>
              </div>
            </div>
            <ul className="space-y-5">
              {currentIntent.actions.map((action, ai) => (
                <li key={ai} className={`rounded-2xl border border-slate-700/55 border-l-[3px] p-4 shadow-md shadow-black/30 ${actionRowAccentClass(action.type)}`}>
                  <div className="mb-4 flex flex-wrap items-start gap-3">
                    <GripVertical className="mt-1 hidden h-5 w-5 shrink-0 text-slate-600 sm:block" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <ActionTypePickerGrid
                        value={action.type}
                        onChange={(t) =>
                          patchIntent(enemyIdx, currentIntent.turn, (prev) => {
                            const acts = [...prev.actions];
                            acts[ai] = createDefaultEnemyIntentAction(t);
                            return { ...prev, actions: acts };
                          })
                        }
                      />
                    </div>
                    <div className="ml-auto flex shrink-0 gap-1">
                      <button
                        type="button"
                        title="Move up"
                        onClick={() =>
                          patchIntent(enemyIdx, currentIntent.turn, (prev) => {
                            if (ai <= 0) return prev;
                            const acts = [...prev.actions];
                            [acts[ai - 1], acts[ai]] = [acts[ai], acts[ai - 1]];
                            return { ...prev, actions: acts };
                          })
                        }
                        disabled={ai === 0}
                        className="rounded-lg border border-slate-600/80 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-200 disabled:opacity-35"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        onClick={() =>
                          patchIntent(enemyIdx, currentIntent.turn, (prev) => {
                            if (ai >= prev.actions.length - 1) return prev;
                            const acts = [...prev.actions];
                            [acts[ai], acts[ai + 1]] = [
                              acts[ai + 1],
                              acts[ai],
                            ];
                            return { ...prev, actions: acts };
                          })
                        }
                        disabled={ai >= currentIntent.actions.length - 1}
                        className="rounded-lg border border-slate-600/80 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-200 disabled:opacity-35"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        title="Remove"
                        onClick={() =>
                          patchIntent(enemyIdx, currentIntent.turn, (prev) => ({
                            ...prev,
                            actions: prev.actions.filter((_, j) => j !== ai),
                          }))
                        }
                        className="rounded-lg border border-rose-500/45 bg-rose-950/40 px-2.5 py-1.5 text-rose-200 transition hover:bg-rose-950/65"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  <ActionFields
                    action={action}
                    onChange={(next) =>
                      patchIntent(enemyIdx, currentIntent.turn, (prev) => {
                        const acts = [...prev.actions];
                        acts[ai] = next;
                        return { ...prev, actions: acts };
                      })
                    }
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                patchIntent(enemyIdx, currentIntent.turn, (prev) => ({
                  ...prev,
                  actions: [...prev.actions, createDefaultEnemyIntentAction("attack")],
                }))
              }
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-teal-500/35 bg-teal-950/20 px-4 py-3 text-xs font-bold text-teal-200/95 transition hover:border-teal-400/55 hover:bg-teal-950/40 hover:text-teal-50"
            >
              <Plus className="h-5 w-5 text-teal-400" strokeWidth={2} />
              Add intent action
            </button>
          </div>
        </div>

        {/* Right: turn summary */}
        <div className="flex w-full min-w-0 shrink-0 flex-col lg:max-w-none lg:flex-[0_1_22rem] xl:flex-[0_1_25rem]">
          <div
            className="flex min-h-0 flex-col gap-4 overflow-hidden rounded-2xl border border-slate-700/55 bg-gradient-to-b from-slate-900/90 via-slate-950/96 to-slate-950 p-4 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06] xl:sticky xl:top-3 xl:z-10 xl:max-h-[min(72dvh,calc(100dvh-5rem))] xl:overflow-y-auto xl:p-5"
            style={{ borderLeft: `4px solid ${currentSlotAccentHex}` }}
          >
            <header className="min-w-0 space-y-3 border-b border-slate-700/55 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Turn summary
                  </p>
                  <p className="mt-1.5 inline-flex items-center rounded-md border border-teal-500/30 bg-teal-950/35 px-2 py-0.5 text-[11px] font-bold tabular-nums text-teal-100/95">
                    Planner slot {currentIntent.turn}
                  </p>
                  <h2 className="mt-3 break-words text-2xl font-black leading-tight tracking-tight text-slate-50 xl:text-[1.6rem]">
                    {enemies[enemyIdx]?.name ?? "—"}
                  </h2>
                  <p className="mt-2 max-w-prose text-[12px] leading-relaxed text-slate-500">
                    Scripted intents for this enemy at the selected slot. Roster below shows every enemy at the same
                    planner turn.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-600/55 bg-slate-950/70 px-3 py-2.5 shadow-inner shadow-black/30">
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg border border-white/15 shadow-md shadow-black/40"
                    style={{ backgroundColor: currentSlotAccentHex }}
                    title={currentSlotAccentHex}
                  />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      <span className="text-xs leading-none opacity-90" aria-hidden>
                        🎨
                      </span>
                      Slot color
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] font-semibold tabular-nums text-slate-200">
                      {currentSlotAccentHex}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500">
                Hint colors follow the same turn <span className="font-medium text-slate-400">slot id</span> as the main
                planner when a decision branch is active; they are not decision-node identities.
              </p>
            </header>

            <section className="min-w-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Scripted line · this enemy
              </p>
              <p
                className={`text-pretty font-sans text-[15px] leading-relaxed tracking-normal ${previewLine ? "text-slate-100/96" : "text-slate-600"}`}
              >
                {previewLine || "— No actions scripted yet —"}
              </p>
            </section>

            <section className="border-t border-slate-700/55 pt-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Whole roster · slot {currentIntent.turn}
              </p>
              <ul className="space-y-2">
                {peersAtPlannerTurn.map(({ enemyIndex, name, rowLine }) => {
                  const isActive = enemyIndex === enemyIdx;
                  return (
                    <li
                      key={`peer-${name}-${enemyIndex}`}
                      className={`rounded-xl border px-3 py-2.5 transition sm:px-3.5 sm:py-3 ${
                        isActive
                          ? "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-950/40 to-slate-950/45 ring-1 ring-fuchsia-500/22"
                          : "border-slate-700/75 bg-slate-900/40 hover:border-slate-600/90"
                      }`}
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: currentSlotAccentHex,
                      }}
                    >
                      <p
                        className={`text-[13px] font-bold tracking-tight ${isActive ? "text-fuchsia-100" : "text-slate-400"}`}
                      >
                        {name}
                        {isActive ? (
                          <span className="ml-2 rounded-md border border-fuchsia-400/35 bg-fuchsia-950/55 px-1.5 py-px align-middle text-[8px] font-bold uppercase tracking-wide text-fuchsia-100/95">
                            Editing
                          </span>
                        ) : null}
                      </p>
                      <p
                        className={`mt-1.5 text-pretty font-sans text-[12px] leading-relaxed sm:text-[13px] ${isActive ? "text-slate-200/95" : "text-slate-500"}`}
                      >
                        {rowLine}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </div>

      <section
        aria-label="Enemy intent data as JSON"
        className="flex min-h-0 w-full flex-col gap-3 rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-950/40 to-slate-950 px-4 pb-4 pt-3 shadow-inner md:flex-row md:items-start md:gap-4 md:px-5 md:pb-5"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:min-h-[18rem]">
          <button
            type="button"
            onClick={() => setJsonOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 rounded-xl px-1 py-1.5 text-left lg:cursor-default"
            aria-expanded={jsonOpen}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-200/95">
                Enemy data (JSON)
              </p>
              <p className="mt-1 text-[10px] font-normal leading-relaxed normal-case tracking-normal text-violet-300/65">
                Read-only snapshot of all enemies · use <span className="text-violet-200/90">Paste</span> to replace locally, then Apply planner to publish.
              </p>
            </div>
            <span className="shrink-0 rounded-md border border-violet-500/40 px-2 py-1 text-[10px] font-semibold text-violet-200/85 md:hidden">
              {jsonOpen ? "Hide" : "Show"}
            </span>
          </button>
          <div
            className={`min-h-[12rem] flex-1 flex-col gap-2 ${jsonOpen ? "flex" : "hidden"} lg:flex`}
          >
            <textarea
              readOnly
              value={jsonExport}
              className="min-h-[14rem] w-full flex-1 resize-y rounded-xl border border-violet-500/25 bg-slate-950/90 p-3 font-mono text-[11px] leading-relaxed text-violet-100/95 lg:min-h-[16rem]"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 md:max-w-[min(28rem,100%)] md:pt-[2px] lg:max-w-none lg:flex-[0_1_22rem] xl:flex-[0_1_26rem]">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-300/85">
              Paste enemy array
            </span>
            <span className="text-[10px] font-normal normal-case tracking-normal text-slate-500">
              Imports into this Turn Maker workspace only until you Apply planner.
            </span>
            <textarea
              value={importDraft}
              onChange={(e) => setImportDraft(e.target.value)}
              className="min-h-[10rem] w-full resize-y rounded-xl border border-violet-500/25 bg-slate-950/90 p-2 font-mono text-[10px] text-violet-100/95"
              placeholder='[ { "name": "…", "hp": 40, "maxHp": 40, "intents": [ … ] } ]'
              spellCheck={false}
            />
          </label>
          <button
            type="button"
            className="rounded-xl border border-violet-400/45 bg-gradient-to-br from-violet-900/92 to-purple-950/80 py-2.5 text-[11px] font-bold text-violet-50 shadow-md hover:brightness-110"
            onClick={() => {
              try {
                const parsed = JSON.parse(importDraft.trim());
                if (!Array.isArray(parsed)) throw new Error("Root must be an array");
                setEnemies(parsed as Enemy[]);
                setEnemyIdx(0);
                setIntentIdx(0);
                setJsonError(null);
              } catch (err) {
                setJsonError(err instanceof Error ? err.message : "Invalid JSON");
              }
            }}
          >
            Replace from pasted JSON
          </button>
          {jsonError ? (
            <p className="text-[11px] text-rose-400">{jsonError}</p>
          ) : null}
        </div>
      </section>

      <p className="rounded-xl border border-slate-800/90 bg-slate-900/50 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-400">How to use this screen:</span> choose a{" "}
        <span className="text-teal-400">planner turn</span> on the left, select an{" "}
        <span className="text-fuchsia-300">enemy</span>, then add or edit{" "}
        <span className="text-slate-300">intent actions</span> for that pair.{" "}
        <span className="font-semibold text-slate-400">Apply planner</span> publishes your edits to combat, every planner slot, and branching decision snapshots. Summary on the right is for previews; raw JSON is in the violet section above.
        Saves that still{" "}
        <code className="rounded bg-slate-800 px-1 py-px text-[10px] text-slate-400">attack.value</code> migrate automatically.
      </p>
    </div>
  );
}
