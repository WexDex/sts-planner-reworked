"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import {
  getCardFieldDisplay,
  getNumericFieldStats,
  getBooleanFieldStats,
  CLUSTER_FIELDS,
} from "./clusterAlgorithm";
import type { ClusterResult, AppearanceConfig } from "./clusterTypes";

type Props = {
  cluster: ClusterResult;
  color: string;
  allCards: Record<string, unknown>;
  fields: string[];
  appearance: AppearanceConfig;
  onClose: () => void;
};

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function CardClusterDetail({
  cluster,
  color,
  allCards,
  fields,
  appearance,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");

  const displayFields = useMemo(
    () => CLUSTER_FIELDS.filter(f => appearance.tooltipFields.includes(f.key)),
    [appearance.tooltipFields],
  );

  const activeFields = useMemo(
    () => CLUSTER_FIELDS.filter(f => fields.includes(f.key)),
    [fields],
  );

  // Pre-compute stats for each active field across this cluster's cards
  const fieldStats = useMemo(() => {
    const result: Record<string, { numeric?: ReturnType<typeof getNumericFieldStats>; boolean?: ReturnType<typeof getBooleanFieldStats> }> = {};
    for (const f of activeFields) {
      if (f.kind === "numeric") {
        result[f.key] = { numeric: getNumericFieldStats(cluster.cardIds, allCards, f.key) };
      } else if (f.kind === "boolean") {
        result[f.key] = { boolean: getBooleanFieldStats(cluster.cardIds, allCards, f.key) };
      }
    }
    return result;
  }, [activeFields, cluster.cardIds, allCards]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? cluster.cardIds.filter(id => id.toLowerCase().includes(q))
      : cluster.cardIds;
  }, [cluster.cardIds, search]);

  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-slate-800 bg-slate-950">
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-slate-800 px-4 py-3"
        style={{ borderLeftColor: color, borderLeftWidth: 3 }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="truncate text-sm font-bold text-slate-100">{cluster.label}</span>
          <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
            {cluster.cardIds.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-2 shrink-0 rounded p-1 text-slate-600 hover:bg-slate-800 hover:text-slate-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Field stats chips */}
      {activeFields.length > 0 && (
        <div className="border-b border-slate-800/60 px-3 py-2.5 space-y-2">
          {activeFields.map(f => {
            const stats = fieldStats[f.key];
            const num = stats?.numeric;
            const bool = stats?.boolean;

            return (
              <div key={f.key}>
                {/* Field label */}
                <span className="rounded border border-violet-500/30 bg-violet-950/40 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
                  {f.label}
                </span>

                {/* Numeric stats */}
                {num && (
                  <div className="mt-1 ml-0.5 flex items-center gap-0 text-[10px]">
                    <span className="text-slate-500">min</span>
                    <span className="ml-1 font-mono text-slate-300">{fmt(num.min)}</span>
                    <span className="mx-2 text-slate-700">·</span>
                    <span className="text-slate-500">avg</span>
                    <span className="ml-1 font-mono text-violet-300 font-semibold">{fmt(num.avg)}</span>
                    <span className="mx-2 text-slate-700">·</span>
                    <span className="text-slate-500">max</span>
                    <span className="ml-1 font-mono text-slate-300">{fmt(num.max)}</span>
                    {num.presentCount < cluster.cardIds.length && (
                      <span className="ml-2 text-slate-600">({num.presentCount} cards)</span>
                    )}
                  </div>
                )}

                {/* Boolean stats */}
                {bool && (
                  <div className="mt-1 ml-0.5 flex items-center gap-2 text-[10px]">
                    <span className="text-emerald-400">
                      Yes: {bool.yesCount}
                      <span className="text-slate-600 ml-0.5">
                        ({Math.round((bool.yesCount / cluster.cardIds.length) * 100)}%)
                      </span>
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="text-slate-400">
                      No: {bool.noCount}
                      <span className="text-slate-600 ml-0.5">
                        ({Math.round((bool.noCount / cluster.cardIds.length) * 100)}%)
                      </span>
                    </span>
                  </div>
                )}

                {/* Categorical — no stats row, just the chip */}
              </div>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="border-b border-slate-800/60 px-3 py-2">
        <input
          type="text"
          placeholder="Search cards…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
        />
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-slate-600">No cards match</p>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filtered.map(cardId => {
              const card = allCards[cardId] as Record<string, unknown> | undefined;
              return (
                <div key={cardId} className="px-3 py-2 hover:bg-slate-900/60">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[12px] font-semibold text-slate-200 leading-tight">{cardId}</span>
                  </div>
                  {card && displayFields.length > 0 && (
                    <div className="ml-3.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {displayFields.map(f => {
                        const val = getCardFieldDisplay(card, f.key);
                        const isActive = activeFields.some(a => a.key === f.key);
                        return (
                          <span key={f.key} className="text-[10px]">
                            <span className={isActive ? "text-violet-400" : "text-slate-600"}>{f.label}: </span>
                            <span className={isActive ? "text-violet-200 font-medium" : "text-slate-400"}>{val}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="border-t border-slate-800 px-3 py-2">
        <p className="text-[10px] text-slate-600">
          {filtered.length === cluster.cardIds.length
            ? `${cluster.cardIds.length} cards`
            : `${filtered.length} of ${cluster.cardIds.length} cards`}
        </p>
      </div>
    </div>
  );
}
