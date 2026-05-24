"use client";

import { useMemo, useState } from "react";
import { ArrowUpCircle, X, Minus, Plus, ChevronDown, ChevronUp, Layers, List } from "lucide-react";
import type { DeckCardEntry } from "./deckBuilderTypes";
import { deckEntryKey } from "./deckBuilderTypes";
import { getStsCardsRecord } from "@/app/card-design-gallery/stsRecord";

const DB_RECORDS = getStsCardsRecord();

const TYPE_ORDER = ["Attack", "Skill", "Power", "Curse", "Status"];
function typeRank(t: string | undefined): number {
  const i = TYPE_ORDER.indexOf(t ?? "");
  return i === -1 ? TYPE_ORDER.length : i;
}

function costLabel(rec: Record<string, unknown> | undefined, isUpgraded: boolean): string {
  if (!rec) return "?";
  if (rec.xCost) return "X";
  if (rec.unplayable) return "–";
  const cost = rec.cost;
  if (cost == null) return "0";
  if (typeof cost === "number") return String(cost);
  if (typeof cost === "object" && !Array.isArray(cost)) {
    const o = cost as Record<string, unknown>;
    const v = isUpgraded ? (o.upgraded ?? o.base) : o.base;
    if (v == null) return "0";
    return String(v);
  }
  return "?";
}

const TYPE_DOT: Record<string, string> = {
  Attack: "bg-red-500",
  Skill:  "bg-sky-500",
  Power:  "bg-violet-500",
  Curse:  "bg-zinc-500",
  Status: "bg-stone-500",
};
const TYPE_COST: Record<string, string> = {
  Attack: "border-red-700/50 bg-red-950/50 text-red-300",
  Skill:  "border-sky-700/50 bg-sky-950/50 text-sky-300",
  Power:  "border-violet-700/50 bg-violet-950/50 text-violet-300",
  Curse:  "border-zinc-700/50 bg-zinc-800/50 text-zinc-400",
  Status: "border-stone-700/50 bg-stone-800/50 text-stone-400",
};
const RARITY_COLOR: Record<string, string> = {
  Common:   "text-slate-400",
  Uncommon: "text-sky-400",
  Rare:     "text-amber-400",
  Special:  "text-violet-400",
  Starter:  "text-slate-500",
};
const CHAR_COLOR: Record<string, string> = {
  ironclad: "text-red-400",
  silent:   "text-emerald-400",
  defect:   "text-sky-400",
  watcher:  "text-violet-400",
  colorless:"text-zinc-400",
};

interface DeckBuilderDeckListProps {
  cards: DeckCardEntry[];
  onChangeCount: (cardId: string, isUpgraded: boolean, delta: number) => void;
  onRemove: (cardId: string, isUpgraded: boolean) => void;
  onToggleUpgrade: (cardId: string, isUpgraded: boolean) => void;
}

type ViewMode = "clustered" | "separate";

export default function DeckBuilderDeckList({
  cards,
  onChangeCount,
  onRemove,
  onToggleUpgrade,
}: DeckBuilderDeckListProps) {
  const [statsOpen, setStatsOpen] = useState(true);
  const [viewMode,  setViewMode]  = useState<ViewMode>("clustered");

  const totalCount = useMemo(() => cards.reduce((s, e) => s + e.count, 0), [cards]);

  // Type breakdown
  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of cards) {
      const t = (DB_RECORDS[e.card_ID]?.type as string) ?? "Unknown";
      counts[t] = (counts[t] ?? 0) + e.count;
    }
    return counts;
  }, [cards]);

  // Rarity breakdown
  const rarityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of cards) {
      const r = (DB_RECORDS[e.card_ID]?.rarity as string) ?? "Unknown";
      counts[r] = (counts[r] ?? 0) + e.count;
    }
    return counts;
  }, [cards]);

  // Character breakdown
  const charBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of cards) {
      const ch = (DB_RECORDS[e.card_ID]?.character as string) ?? "unknown";
      counts[ch] = (counts[ch] ?? 0) + e.count;
    }
    return counts;
  }, [cards]);

  // Cost curve
  const costCurve = useMemo(() => {
    const curve: Record<string, number> = { "0": 0, "1": 0, "2": 0, "3+": 0, "X": 0 };
    for (const e of cards) {
      const rec = DB_RECORDS[e.card_ID];
      const lbl = costLabel(rec, e.isUpgraded);
      if (lbl === "X") { curve["X"]! += e.count; continue; }
      if (lbl === "–" || lbl === "?") continue;
      const n = parseInt(lbl, 10);
      if (isNaN(n)) continue;
      curve[n <= 2 ? String(n) : "3+"]! += e.count;
    }
    return curve;
  }, [cards]);

  // Sorted entries: type then name
  const sorted = useMemo(() =>
    [...cards].sort((a, b) => {
      const ra = DB_RECORDS[a.card_ID];
      const rb = DB_RECORDS[b.card_ID];
      const tr = typeRank(ra?.type as string) - typeRank(rb?.type as string);
      if (tr !== 0) return tr;
      const na = (ra?.name as string) ?? a.card_ID;
      const nb = (rb?.name as string) ?? b.card_ID;
      return na.localeCompare(nb, undefined, { sensitivity: "base" });
    }),
  [cards]);

  const curveMax = Math.max(1, ...Object.values(costCurve));

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Stats section ───────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-700/40">
        <div className="flex items-center gap-1 px-3 py-1.5">
          <button
            type="button"
            onClick={() => setStatsOpen(v => !v)}
            className="flex flex-1 items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-400 transition"
          >
            {statsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Stats · {totalCount} cards
          </button>
          {/* Cluster / Separate toggle */}
          <div className="flex rounded border border-slate-700/40 overflow-hidden">
            <button
              type="button"
              title="Clustered view — one row per card with count"
              onClick={() => setViewMode("clustered")}
              className={["flex h-5 w-6 items-center justify-center transition",
                viewMode === "clustered"
                  ? "bg-indigo-600/40 text-indigo-300"
                  : "bg-slate-800/40 text-slate-600 hover:text-slate-400",
              ].join(" ")}
            >
              <Layers className="h-3 w-3" />
            </button>
            <button
              type="button"
              title="Separate view — one row per copy"
              onClick={() => setViewMode("separate")}
              className={["flex h-5 w-6 items-center justify-center transition",
                viewMode === "separate"
                  ? "bg-indigo-600/40 text-indigo-300"
                  : "bg-slate-800/40 text-slate-600 hover:text-slate-400",
              ].join(" ")}
            >
              <List className="h-3 w-3" />
            </button>
          </div>
        </div>

        {statsOpen && (
          <div className="space-y-2 px-3 pb-2">

            {/* Cost curve */}
            <div>
              <p className="mb-1 text-[10px] text-slate-600 uppercase tracking-wider">Cost</p>
              <div className="flex items-end gap-1">
                {(["0", "1", "2", "3+", "X"] as const).map(label => {
                  const val = costCurve[label] ?? 0;
                  const h = val === 0 ? 2 : Math.max(4, Math.round((val / curveMax) * 32));
                  return (
                    <div key={label} className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] text-slate-600 leading-none">{val || ""}</span>
                      <div className={`w-6 rounded-t transition-all ${val > 0 ? "bg-indigo-500/70" : "bg-slate-800/40"}`} style={{ height: h }} />
                      <span className="text-[9px] text-slate-500 leading-none">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Type breakdown */}
            <div>
              <p className="mb-1 text-[10px] text-slate-600 uppercase tracking-wider">Type</p>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {TYPE_ORDER.map(t => {
                  const n = typeBreakdown[t];
                  if (!n) return null;
                  return (
                    <span key={t} className="flex items-center gap-1 text-[11px]">
                      <span className={`h-1.5 w-1.5 rounded-full ${TYPE_DOT[t] ?? "bg-slate-500"}`} />
                      <span className="text-slate-300">{n}</span>
                      <span className="text-slate-600">{t.slice(0, 3)}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Rarity breakdown */}
            {Object.keys(rarityBreakdown).length > 0 && (
              <div>
                <p className="mb-1 text-[10px] text-slate-600 uppercase tracking-wider">Rarity</p>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  {Object.entries(rarityBreakdown).map(([r, n]) => (
                    <span key={r} className="flex items-center gap-1 text-[11px]">
                      <span className={`font-semibold ${RARITY_COLOR[r] ?? "text-slate-500"}`}>{n}</span>
                      <span className="text-slate-600">{r}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Character breakdown */}
            {Object.keys(charBreakdown).length > 0 && (
              <div>
                <p className="mb-1 text-[10px] text-slate-600 uppercase tracking-wider">Character</p>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  {Object.entries(charBreakdown).map(([ch, n]) => (
                    <span key={ch} className="flex items-center gap-1 text-[11px]">
                      <span className={`font-semibold ${CHAR_COLOR[ch] ?? "text-slate-400"}`}>{n}</span>
                      <span className="text-slate-600 capitalize">{ch}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Card list ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <p className="text-xs text-slate-600">No cards in deck yet.</p>
            <p className="mt-0.5 text-[11px] text-slate-700">Click cards in the picker to add them.</p>
          </div>
        ) : viewMode === "clustered" ? (
          /* ── CLUSTERED: one row per (card_ID, isUpgraded) with count ── */
          <ul className="divide-y divide-slate-800/60">
            {sorted.map(entry => {
              const key     = deckEntryKey(entry.card_ID, entry.isUpgraded);
              const rec     = DB_RECORDS[entry.card_ID];
              const name    = (rec?.name as string) ?? entry.card_ID;
              const type    = (rec?.type as string) ?? "Unknown";
              const cost    = costLabel(rec, entry.isUpgraded);
              const dotCls  = TYPE_DOT[type] ?? "bg-slate-500";
              const costCls = TYPE_COST[type] ?? "border-slate-700/50 bg-slate-800/50 text-slate-400";

              return (
                <li key={key} className="group flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/40 transition">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${dotCls}`} />
                  {/* Count prefix */}
                  <span className="shrink-0 w-6 text-right text-[11px] font-bold text-slate-500 tabular-nums">{entry.count}×</span>
                  {/* Name */}
                  <span className="flex-1 min-w-0 truncate text-xs text-slate-200 leading-tight">
                    {name}
                    {entry.isUpgraded && <span className="ml-1 text-[10px] text-sky-400 font-bold">+</span>}
                  </span>
                  <span className={`shrink-0 rounded border px-1 py-0.5 text-[10px] font-bold ${costCls}`}>{cost}</span>
                  <button type="button" title={entry.isUpgraded ? "Switch to base" : "Switch to upgraded"}
                    onClick={() => onToggleUpgrade(entry.card_ID, entry.isUpgraded)}
                    className={["shrink-0 flex h-5 w-5 items-center justify-center rounded-full border transition",
                      entry.isUpgraded
                        ? "border-sky-500/70 bg-sky-500/20 text-sky-400"
                        : "border-slate-600/40 text-slate-600 hover:border-sky-500/50 hover:text-sky-400",
                    ].join(" ")}>
                    <ArrowUpCircle className="h-3 w-3" />
                  </button>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button type="button" onClick={() => onChangeCount(entry.card_ID, entry.isUpgraded, -1)}
                      className="flex h-5 w-5 items-center justify-center rounded border border-slate-700/40 bg-slate-800/60 text-slate-400 transition hover:text-slate-200">
                      <Minus className="h-2.5 w-2.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-200 tabular-nums">{entry.count}</span>
                    <button type="button" onClick={() => onChangeCount(entry.card_ID, entry.isUpgraded, 1)}
                      className="flex h-5 w-5 items-center justify-center rounded border border-slate-700/40 bg-slate-800/60 text-slate-400 transition hover:text-slate-200">
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <button type="button" onClick={() => onRemove(entry.card_ID, entry.isUpgraded)}
                    className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-slate-600 transition hover:text-rose-400 opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          /* ── SEPARATE: one row per individual copy ── */
          <ul className="divide-y divide-slate-800/60">
            {sorted.flatMap(entry => {
              const rec     = DB_RECORDS[entry.card_ID];
              const name    = (rec?.name as string) ?? entry.card_ID;
              const type    = (rec?.type as string) ?? "Unknown";
              const cost    = costLabel(rec, entry.isUpgraded);
              const dotCls  = TYPE_DOT[type] ?? "bg-slate-500";
              const costCls = TYPE_COST[type] ?? "border-slate-700/50 bg-slate-800/50 text-slate-400";

              return Array.from({ length: entry.count }, (_, i) => (
                <li key={`${deckEntryKey(entry.card_ID, entry.isUpgraded)}-${i}`}
                  className="group flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/40 transition">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${dotCls}`} />
                  {/* Instance number */}
                  <span className="shrink-0 w-4 text-right text-[10px] text-slate-700 tabular-nums">{i + 1}</span>
                  <span className="flex-1 min-w-0 truncate text-xs text-slate-200 leading-tight">
                    {name}
                    {entry.isUpgraded && <span className="ml-1 text-[10px] text-sky-400 font-bold">+</span>}
                  </span>
                  <span className={`shrink-0 rounded border px-1 py-0.5 text-[10px] font-bold ${costCls}`}>{cost}</span>
                  {/* Remove one copy */}
                  <button type="button" onClick={() => onChangeCount(entry.card_ID, entry.isUpgraded, -1)}
                    title="Remove this copy"
                    className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-slate-600 transition hover:text-rose-400 opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ));
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
