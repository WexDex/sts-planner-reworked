"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Zap,
} from "lucide-react";
import stsBundle from "@/app/data/db/STS_CARDS_DB.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActionType =
  | "give_buff"
  | "give_debuff"
  | "remove_buff"
  | "modify_hp"
  | "modify_block"
  | "modify_energy"
  | "draw_cards"
  | "move_to_pile";

type CustomAction = {
  label: string;
  actionType: ActionType;
  buffName?: string;
  buffType?: "buff" | "debuff";
  hasInput?: boolean;
  defaultValue?: number;
  pile?: string;
};

type CustomActionsMap = Record<string, CustomAction[]>;

const ACTION_TYPES: { value: ActionType; label: string; description: string; color: string; activeClass: string }[] = [
  {
    value: "give_buff", label: "Give Buff", description: "Apply a named buff",
    color: "emerald",
    activeClass: "border-emerald-500/70 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-500/30",
  },
  {
    value: "give_debuff", label: "Give Debuff", description: "Apply a named debuff",
    color: "orange",
    activeClass: "border-orange-500/70 bg-orange-950/60 text-orange-200 ring-1 ring-orange-500/30",
  },
  {
    value: "remove_buff", label: "Remove Buff", description: "Remove buff/debuff",
    color: "rose",
    activeClass: "border-rose-500/70 bg-rose-950/60 text-rose-200 ring-1 ring-rose-500/30",
  },
  {
    value: "modify_hp", label: "Modify HP", description: "Change player HP",
    color: "red",
    activeClass: "border-red-500/70 bg-red-950/60 text-red-200 ring-1 ring-red-500/30",
  },
  {
    value: "modify_block", label: "Modify Block", description: "Add/remove block",
    color: "sky",
    activeClass: "border-sky-500/70 bg-sky-950/60 text-sky-200 ring-1 ring-sky-500/30",
  },
  {
    value: "modify_energy", label: "Modify Energy", description: "Add/remove energy",
    color: "amber",
    activeClass: "border-amber-500/70 bg-amber-950/60 text-amber-200 ring-1 ring-amber-500/30",
  },
  {
    value: "draw_cards", label: "Draw Cards", description: "Draw N cards",
    color: "violet",
    activeClass: "border-violet-500/70 bg-violet-950/60 text-violet-200 ring-1 ring-violet-500/30",
  },
  {
    value: "move_to_pile", label: "Move to Pile", description: "Move card to a pile",
    color: "slate",
    activeClass: "border-slate-400/60 bg-slate-700/60 text-slate-200 ring-1 ring-slate-400/25",
  },
];

const PILE_OPTIONS: { value: string; label: string; activeClass: string }[] = [
  { value: "hand",    label: "Hand",    activeClass: "border-emerald-500/70 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-500/30" },
  { value: "draw",    label: "Draw",    activeClass: "border-sky-500/70 bg-sky-950/60 text-sky-200 ring-1 ring-sky-500/30" },
  { value: "discard", label: "Discard", activeClass: "border-rose-500/70 bg-rose-950/60 text-rose-200 ring-1 ring-rose-500/30" },
  { value: "exhaust", label: "Exhaust", activeClass: "border-amber-500/70 bg-amber-950/60 text-amber-200 ring-1 ring-amber-500/30" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type CardData = {
  type?: string;
  rarity?: string;
  characters?: string;
  description?: string;
  [key: string]: any;
};

const allCards: { id: string; data: CardData }[] = Object.entries(
  (stsBundle as any).cards ?? {} as Record<string, CardData>,
)
  .map(([id, data]) => ({ id, data: data as CardData }))
  .sort((a, b) => a.id.localeCompare(b.id));

function typeChipCls(type?: string): string {
  switch (type?.toLowerCase()) {
    case "attack": return "border-rose-500/50 bg-rose-950/50 text-rose-300";
    case "skill": return "border-teal-500/50 bg-teal-950/50 text-teal-300";
    case "power": return "border-violet-500/50 bg-violet-950/50 text-violet-300";
    default: return "border-slate-600/50 bg-slate-800/50 text-slate-400";
  }
}

function rarityChipCls(rarity?: string): string {
  switch (rarity?.toLowerCase()) {
    case "rare": return "border-amber-500/45 bg-amber-950/40 text-amber-300";
    case "uncommon": return "border-blue-500/45 bg-blue-950/40 text-blue-300";
    case "common": return "border-slate-600/45 bg-slate-800/40 text-slate-400";
    default: return "border-slate-700/40 bg-slate-900/40 text-slate-500";
  }
}

function blankAction(): CustomAction {
  return { label: "", actionType: "give_buff", buffName: "", buffType: "buff", hasInput: true, defaultValue: 1 };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ActionRow({
  action,
  index,
  onChange,
  onDelete,
}: {
  action: CustomAction;
  index: number;
  onChange: (idx: number, updated: CustomAction) => void;
  onDelete: (idx: number) => void;
}) {
  const set = (patch: Partial<CustomAction>) => onChange(index, { ...action, ...patch });

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3 space-y-2.5">
      {/* Row header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Action #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-700/50 bg-rose-950/50 text-rose-400 transition hover:bg-rose-900/60 hover:text-rose-200"
          title="Remove action"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Label */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Button label
        </label>
        <input
          type="text"
          value={action.label}
          placeholder="e.g. Give Accuracy"
          onChange={(e) => set({ label: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
        />
      </div>

      {/* Action type */}
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Action type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {ACTION_TYPES.map((at) => {
            const active = action.actionType === at.value;
            return (
              <button
                key={at.value}
                type="button"
                onClick={() => {
                  const t = at.value;
                  const patch: Partial<CustomAction> = { actionType: t };
                  if (t === "move_to_pile") patch.pile = action.pile ?? "hand";
                  if (t === "give_buff" || t === "give_debuff" || t === "remove_buff") {
                    patch.buffName = action.buffName ?? "";
                    patch.buffType = t === "give_debuff" ? "debuff" : "buff";
                  }
                  set(patch);
                }}
                className={`flex flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left transition ${
                  active
                    ? at.activeClass
                    : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300"
                }`}
              >
                <span className="text-[11px] font-semibold leading-none">{at.label}</span>
                <span className="text-[9px] leading-snug opacity-70">{at.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Buff/debuff name */}
      {(action.actionType === "give_buff" || action.actionType === "give_debuff" || action.actionType === "remove_buff") && (
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Buff / debuff name
          </label>
          <input
            type="text"
            value={action.buffName ?? ""}
            placeholder="e.g. Accuracy"
            onChange={(e) => set({ buffName: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
      )}

      {/* Pile selector */}
      {action.actionType === "move_to_pile" && (
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Destination pile
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PILE_OPTIONS.map((p) => {
              const active = (action.pile ?? "hand") === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set({ pile: p.value })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? p.activeClass
                      : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Has input + default value (not for remove_buff or move_to_pile) */}
      {action.actionType !== "remove_buff" && action.actionType !== "move_to_pile" && (
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Show input
            </label>
            <button
              type="button"
              onClick={() => set({ hasInput: !action.hasInput })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
                action.hasInput
                  ? "border-cyan-500/60 bg-cyan-500/30"
                  : "border-slate-600 bg-slate-800"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 -translate-y-px rounded-full bg-white shadow transition-transform ${
                  action.hasInput ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Default value
            </label>
            <input
              type="number"
              value={action.defaultValue ?? 1}
              onChange={(e) => set({ defaultValue: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm tabular-nums text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export default function CardActionsEditorClient() {
  const [data, setData] = useState<CustomActionsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function loadFromApi() {
    fetch("/api/card-actions")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadFromApi(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCards;
    return allCards.filter(({ id, data }) =>
      id.toLowerCase().includes(q) ||
      (data.type ?? "").toLowerCase().includes(q) ||
      (data.rarity ?? "").toLowerCase().includes(q) ||
      (data.characters ?? "").toLowerCase().includes(q) ||
      (data.description ?? "").toLowerCase().includes(q),
    );
  }, [search]);

  const currentActions: CustomAction[] = selectedCard ? (data[selectedCard] ?? []) : [];

  function setCardActions(actions: CustomAction[]) {
    if (!selectedCard) return;
    setData((prev) => ({ ...prev, [selectedCard]: actions }));
  }

  function addAction() {
    setCardActions([...currentActions, blankAction()]);
  }

  function updateAction(idx: number, updated: CustomAction) {
    const next = [...currentActions];
    next[idx] = updated;
    setCardActions(next);
  }

  function deleteAction(idx: number) {
    setCardActions(currentActions.filter((_, i) => i !== idx));
  }

  function deleteCardConfig() {
    if (!selectedCard) return;
    setData((prev) => {
      const next = { ...prev };
      delete next[selectedCard];
      return next;
    });
    setSelectedCard(null);
    setSearch("");
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/card-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data, null, 2),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  }

  async function resetToOriginal() {
    if (!confirm("Reset all actions to the original backup? This will discard all your changes.")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/card-actions?reset=true", { method: "POST" });
      if (res.ok) {
        setSelectedCard(null);
        loadFromApi();
        setResetDone(true);
        setTimeout(() => setResetDone(false), 2500);
      }
    } catch {}
    setResetting(false);
  }

  const configuredCardCount = Object.keys(data).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Back to planner
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-950/40 text-amber-300">
                <Zap className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-100">Quick Actions Editor</p>
                <p className="text-[10px] text-slate-500">
                  {configuredCardCount} card{configuredCardCount !== 1 ? "s" : ""} configured
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetToOriginal}
              disabled={resetting}
              title="Reset all actions to the original backup"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600/60 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-950/40 hover:text-rose-200 disabled:opacity-50"
            >
              {resetting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              ) : resetDone ? (
                <Check className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2.5} />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              {resetDone ? "Reset!" : "Reset to original"}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-950/50 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-900/60 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : saved ? (
                <Check className="h-4 w-4 text-emerald-300" strokeWidth={2.5} />
              ) : (
                <Save className="h-4 w-4" strokeWidth={2} />
              )}
              {saved ? "Saved to disk!" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" strokeWidth={2} />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[22rem_1fr]">
            {/* Left: card list */}
            <aside className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                All cards — {filtered.length} shown
              </p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, type, rarity, character…"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
              />
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/50 [scrollbar-width:thin] md:max-h-[calc(100vh-12rem)]"
              >
                {filtered.map(({ id, data: card }) => {
                  const isSelected = selectedCard === id;
                  const hasConfig = Boolean(data[id]?.length);
                  const typeStr = card.type ?? "";
                  const rarityStr = card.rarity ?? "";
                  const charStr = card.characters ?? "";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedCard(id)}
                      className={`flex w-full flex-col gap-1 border-b border-slate-800/50 px-3 py-2.5 text-left last:border-0 transition ${
                        isSelected
                          ? "bg-slate-800/90 ring-inset ring-1 ring-cyan-500/40"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Name row */}
                      <div className="flex items-center gap-1.5">
                        <span className={`min-w-0 truncate text-xs font-semibold ${isSelected ? "text-cyan-100" : "text-slate-100"}`}>
                          {id}
                        </span>
                        {hasConfig && (
                          <span className="ml-auto shrink-0 rounded-md bg-amber-950/70 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                            {data[id].length}
                          </span>
                        )}
                      </div>
                      {/* Chips row */}
                      <div className="flex flex-wrap items-center gap-1">
                        {typeStr && (
                          <span className={`rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide ${typeChipCls(typeStr)}`}>
                            {typeStr}
                          </span>
                        )}
                        {rarityStr && (
                          <span className={`rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide ${rarityChipCls(rarityStr)}`}>
                            {rarityStr}
                          </span>
                        )}
                        {charStr && (
                          <span className="rounded border border-slate-700/50 bg-slate-800/50 px-1 py-px text-[9px] font-medium capitalize text-slate-400">
                            {charStr}
                          </span>
                        )}
                      </div>
                      {/* Description */}
                      {card.description && (
                        <p className="line-clamp-2 text-[10px] leading-snug text-slate-400">
                          {card.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right: action editor */}
            <div>
              {!selectedCard ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/30 py-20 text-center">
                  <Zap className="mb-3 h-8 w-8 text-slate-700" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-slate-500">No card selected</p>
                  <p className="mt-1 text-xs text-slate-600">Search and select a card on the left to edit its custom actions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className="text-base font-bold text-slate-100">{selectedCard}</h2>
                        {(() => {
                          const card = (stsBundle as any).cards?.[selectedCard] as CardData | undefined;
                          if (!card) return null;
                          return (
                            <>
                              {card.type && <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${typeChipCls(card.type)}`}>{card.type}</span>}
                              {card.rarity && <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${rarityChipCls(card.rarity)}`}>{card.rarity}</span>}
                              {card.characters && <span className="rounded border border-slate-700/50 bg-slate-800/50 px-1.5 py-0.5 text-[9px] font-medium capitalize text-slate-400">{card.characters}</span>}
                            </>
                          );
                        })()}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {currentActions.length} custom action{currentActions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {data[selectedCard] !== undefined && (
                        <button
                          type="button"
                          onClick={deleteCardConfig}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-700/50 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-900/60"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          Delete config
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={addAction}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/45 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-900/50"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Add action
                      </button>
                    </div>
                  </div>

                  {currentActions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/20 py-12 text-center">
                      <p className="text-sm text-slate-600">No custom actions yet.</p>
                      <p className="mt-1 text-xs text-slate-700">Click <strong className="text-slate-500">Add action</strong> to create one.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentActions.map((action, i) => (
                        <ActionRow
                          key={i}
                          action={action}
                          index={i}
                          onChange={updateAction}
                          onDelete={deleteAction}
                        />
                      ))}
                    </div>
                  )}

                  {currentActions.length > 0 && (
                    <div className="pt-2">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Preview JSON
                      </p>
                      <pre className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[10px] leading-relaxed text-slate-400 [scrollbar-width:thin]">
                        {JSON.stringify(currentActions, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
