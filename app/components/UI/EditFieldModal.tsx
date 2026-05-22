"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, EyeOff, X } from "lucide-react";
import type { Card } from "@/app/types/gameTypes";

// Only skip pure selection state and internal ID — users can edit everything else
const SKIP_KEYS = new Set(["isSelected", "_uid"]);

// ─── Type helpers ─────────────────────────────────────────────────────────────

type NodeType = "number" | "boolean" | "string" | "valuennode" | "object" | "array" | "unknown";

/**
 * Classify a value as "valuennode" if it has a numeric "base" and all non-"base"/"upgraded" keys
 * are known ValueNode meta-flags (hideNumber). Extra keys like conditioned/trigger keep it
 * as "object" so they appear as editable children.
 */
function detectNodeType(val: unknown): NodeType {
  if (val === null || val === undefined) return "unknown";
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "string") return "string";
  if (Array.isArray(val)) return "array";
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    const keys = Object.keys(o);
    // A "pure" ValueNode: only base / upgraded / hideNumber
    const VALUE_NODE_KEYS = new Set(["base", "upgraded", "hideNumber"]);
    if (
      "base" in o &&
      typeof o.base === "number" &&
      keys.every((k) => VALUE_NODE_KEYS.has(k))
    ) {
      return "valuennode";
    }
    return "object";
  }
  return "unknown";
}

// ─── Leaf value editor ────────────────────────────────────────────────────────

function LeafEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const t = detectNodeType(value);

  if (t === "valuennode") {
    const vn = value as Record<string, unknown>;
    const base = typeof vn.base === "number" ? vn.base : 0;
    const upgraded = typeof vn.upgraded === "number" ? vn.upgraded : undefined;
    const hideNumber = vn.hideNumber === true;

    return (
      <span className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-[10px] text-slate-500">
          base
          <input
            type="number"
            value={base}
            onChange={(e) => onChange({ ...vn, base: Number(e.target.value) })}
            className="w-16 rounded border border-slate-600 bg-slate-900/70 px-1.5 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-violet-500/60"
          />
        </label>
        <label className="flex items-center gap-1 text-[10px] text-slate-500">
          upg
          <input
            type="number"
            value={upgraded ?? ""}
            placeholder="—"
            onChange={(e) =>
              onChange({
                ...vn,
                upgraded: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="w-16 rounded border border-slate-600 bg-slate-900/70 px-1.5 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-violet-500/60"
          />
        </label>
        {"hideNumber" in vn && (
          <button
            type="button"
            title="hideNumber — when true, displays '?' instead of the numeric value on the card"
            onClick={() => onChange({ ...vn, hideNumber: !hideNumber })}
            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${
              hideNumber
                ? "border-violet-500/50 bg-violet-950/50 text-violet-300"
                : "border-slate-700/40 bg-slate-800/40 text-slate-500"
            }`}
          >
            <EyeOff className="h-2.5 w-2.5" strokeWidth={2} />
            hide?
          </button>
        )}
      </span>
    );
  }

  if (t === "boolean") {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`rounded border px-2 py-0.5 text-[10px] font-bold transition ${
          value
            ? "border-emerald-500/50 bg-emerald-950/50 text-emerald-300"
            : "border-slate-600/50 bg-slate-800/50 text-slate-400"
        }`}
      >
        {value ? "true" : "false"}
      </button>
    );
  }

  if (t === "number") {
    return (
      <input
        type="number"
        value={value as number}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 rounded border border-slate-600 bg-slate-900/70 px-1.5 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-violet-500/60"
      />
    );
  }

  if (t === "string") {
    return (
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className="w-48 rounded border border-slate-600 bg-slate-900/70 px-1.5 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-violet-500/60"
      />
    );
  }

  return <span className="text-[10px] text-slate-600 italic">(not editable)</span>;
}

// ─── Recursive tree node ──────────────────────────────────────────────────────

function FieldNode({
  label,
  value,
  onChange,
  depth,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  depth: number;
}) {
  const t = detectNodeType(value);
  const [open, setOpen] = useState(depth < 2);

  if (t === "object") {
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj);
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-1.5 py-0.5 text-left"
        >
          {open ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" strokeWidth={2} />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" strokeWidth={2} />
          )}
          <span className="font-mono text-[11px] font-semibold text-slate-300">{label}</span>
          <span className="text-[9px] text-slate-600">[{entries.length}]</span>
        </button>
        {open && (
          <div className="ml-4 space-y-0.5 border-l border-slate-700/40 pl-3">
            {entries.map(([k, v]) => (
              <FieldNode
                key={k}
                label={k}
                value={v}
                onChange={(nv) => onChange({ ...obj, [k]: nv })}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-36 shrink-0 truncate font-mono text-[10px] text-slate-400">{label}</span>
      <LeafEditor value={value} onChange={onChange} />
    </div>
  );
}

// ─── Deep clone utility ───────────────────────────────────────────────────────

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function EditFieldModal({
  card,
  onClose,
  onSave,
}: {
  card: Card;
  onClose: () => void;
  onSave: (updates: Record<string, unknown>) => void;
}) {
  function buildDraft(c: Card): Record<string, unknown> {
    const draft: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(c)) {
      if (!SKIP_KEYS.has(k)) draft[k] = deepClone(v);
    }
    return draft;
  }

  const [draft, setDraft] = useState<Record<string, unknown>>(() => buildDraft(card));
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave() {
    const original = buildDraft(card);
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(draft)) {
      if (JSON.stringify(v) !== JSON.stringify(original[k])) {
        updates[k] = v;
      }
    }
    onSave(updates);
  }

  function setField(key: string, value: unknown) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const entries = Object.entries(draft);

  const content = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="flex w-[580px] max-h-[78vh] flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/70">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-slate-100">Edit Fields</p>
            <p className="text-[10px] text-slate-500 font-mono">{card.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700/60 text-slate-500 hover:text-slate-300 transition"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable field tree */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:thin] space-y-0.5">
          {entries.map(([k, v]) => (
            <FieldNode
              key={k}
              label={k}
              value={v}
              onChange={(nv) => setField(k, nv)}
              depth={0}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-700/60 px-4 py-3">
          <p className="mr-auto text-[10px] text-slate-500">
            Saving marks card as <span className="text-violet-300 font-semibold">ALTERED?</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg border border-violet-500/50 bg-violet-950/60 px-4 py-1.5 text-xs font-semibold text-violet-100 hover:bg-violet-900/60 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(content, document.body)
    : null;
}
