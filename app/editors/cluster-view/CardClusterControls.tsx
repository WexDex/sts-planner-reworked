"use client";

import { useMemo, useState, useCallback } from "react";
import { Play, ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { CLUSTER_FIELDS, COMBO_BIN_LABELS } from "./clusterAlgorithm";
import type { ClusterMode } from "./clusterTypes";

const CARD_TYPES   = ["Attack", "Skill", "Power", "Curse", "Status"];
const CARD_RARITIES = ["Common", "Uncommon", "Rare", "Special", "Starter"];
const CARD_CHARS   = ["ironclad", "silent", "defect", "watcher", "colorless"];

type Props = {
  allCards: Record<string, unknown>;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  mode: ClusterMode;
  onModeChange: (m: ClusterMode) => void;
  fields: string[];
  onFieldsChange: (f: string[]) => void;
  comboBins: number;
  onComboBinsChange: (n: number) => void;
  onlyWithFields: boolean;
  onOnlyWithFieldsChange: (v: boolean) => void;
  k: number;
  onKChange: (k: number) => void;
  onAutoK: () => void;
  onRun: () => void;
  isRunning: boolean;
  warning: string | null;
};

export default function CardClusterControls({
  allCards,
  selectedIds,
  onSelectionChange,
  mode,
  onModeChange,
  fields,
  onFieldsChange,
  comboBins,
  onComboBinsChange,
  onlyWithFields,
  onOnlyWithFieldsChange,
  k,
  onKChange,
  onAutoK,
  onRun,
  isRunning,
  warning,
}: Props) {
  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("all");
  const [filterRarity, setFilterRarity] = useState("all");
  const [filterChar, setFilterChar]   = useState("all");
  const [pickerOpen, setPickerOpen]   = useState(true);
  const [configOpen, setConfigOpen]   = useState(true);

  const allIds = useMemo(() => Object.keys(allCards).sort(), [allCards]);

  const filteredIds = useMemo(() => {
    const q = search.toLowerCase();
    return allIds.filter(id => {
      const card = allCards[id] as Record<string, unknown>;
      if (!card) return false;
      if (q && !id.toLowerCase().includes(q)) return false;
      if (filterType !== "all" && card.type !== filterType) return false;
      if (filterRarity !== "all" && card.rarity !== filterRarity) return false;
      if (filterChar !== "all" && card.characters !== filterChar) return false;
      return true;
    });
  }, [allIds, allCards, search, filterType, filterRarity, filterChar]);

  const selectedCount = selectedIds.size;

  const selectAll = useCallback(() => {
    onSelectionChange(new Set(filteredIds));
  }, [filteredIds, onSelectionChange]);

  const deselectAll = useCallback(() => {
    const next = new Set(selectedIds);
    for (const id of filteredIds) next.delete(id);
    onSelectionChange(next);
  }, [filteredIds, selectedIds, onSelectionChange]);

  const toggleCard = useCallback((id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }, [selectedIds, onSelectionChange]);

  const toggleField = useCallback((key: string) => {
    if (mode === "manual") {
      onFieldsChange([key]);
    } else {
      if (fields.includes(key)) {
        if (fields.length > 1) onFieldsChange(fields.filter(f => f !== key));
      } else {
        onFieldsChange([...fields, key]);
      }
    }
  }, [mode, fields, onFieldsChange]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-3">
        <h1 className="text-sm font-bold tracking-tight text-slate-100">Cluster View</h1>
        <p className="mt-0.5 text-[11px] text-slate-500">Visualize cards by field similarity</p>
      </div>

      {/* ── Card Picker ── */}
      <section>
        <button
          onClick={() => setPickerOpen(p => !p)}
          className="flex w-full items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5 text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cards
            <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
              {selectedCount} / {allIds.length}
            </span>
          </span>
          {pickerOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
        </button>

        {pickerOpen && (
          <div className="border-b border-slate-800">
            {/* Filters */}
            <div className="space-y-1.5 px-3 pt-2.5 pb-2">
              <input
                type="text"
                placeholder="Search cards…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
              />
              <div className="flex gap-1.5">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                >
                  <option value="all">All types</option>
                  {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={filterRarity}
                  onChange={e => setFilterRarity(e.target.value)}
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                >
                  <option value="all">All rarities</option>
                  {CARD_RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                  value={filterChar}
                  onChange={e => setFilterChar(e.target.value)}
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                >
                  <option value="all">All chars</option>
                  {CARD_CHARS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              {/* Select / Deselect visible */}
              <div className="flex gap-2">
                <button onClick={selectAll} className="flex-1 rounded-md border border-slate-700 bg-slate-800 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition-colors">
                  Select all ({filteredIds.length})
                </button>
                <button onClick={deselectAll} className="flex-1 rounded-md border border-slate-700 bg-slate-800 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition-colors">
                  Deselect
                </button>
              </div>
            </div>

            {/* Card list */}
            <div className="max-h-52 overflow-y-auto px-3 pb-2">
              {filteredIds.length === 0 ? (
                <p className="py-3 text-center text-[11px] text-slate-600">No cards match the filters</p>
              ) : (
                <div className="space-y-0.5">
                  {filteredIds.map(id => {
                    const card = allCards[id] as Record<string, unknown>;
                    const checked = selectedIds.has(id);
                    return (
                      <label key={id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-slate-800/60">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCard(id)}
                          className="h-3 w-3 accent-violet-500"
                        />
                        <span className="flex-1 truncate text-[11px] text-slate-300">{id}</span>
                        <span className="shrink-0 text-[10px] text-slate-600">{String(card?.type ?? "")}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Cluster Config ── */}
      <section>
        <button
          onClick={() => setConfigOpen(p => !p)}
          className="flex w-full items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5 text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cluster Config</span>
          {configOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
        </button>

        {configOpen && (
          <div className="space-y-3 border-b border-slate-800 px-3 py-3">
            {/* Mode toggle */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Mode</p>
              <div className="flex gap-1">
                {([
                  { id: "manual", label: "Manual" },
                  { id: "combo",  label: "Combo"  },
                  { id: "kmeans", label: "K-Means" },
                ] as { id: ClusterMode; label: string }[]).map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onModeChange(m.id);
                      if (m.id === "manual" && fields.length > 1) onFieldsChange([fields[0]!]);
                    }}
                    className={`flex-1 rounded-md border py-1.5 text-[10px] font-semibold transition-colors ${
                      mode === m.id
                        ? "border-violet-500/60 bg-violet-950/60 text-violet-300"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-slate-600">
                {mode === "manual" && "Group by exact value of one field"}
                {mode === "combo"  && "All combinations of High/Low per field — 2 fields → 4 clusters, 3 → 8…"}
                {mode === "kmeans" && "Algorithm finds natural statistical clusters"}
              </p>
            </div>

            {/* Field selector */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {mode === "manual" ? "Group by field" : "Fields"}
              </p>
              <div className="flex flex-wrap gap-1">
                {CLUSTER_FIELDS.map(f => {
                  const active = fields.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggleField(f.key)}
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        active
                          ? "border-violet-500/60 bg-violet-950/50 text-violet-300"
                          : "border-slate-700 bg-slate-800/60 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
              {mode === "combo" && fields.length > 0 && (
                <p className="mt-1.5 text-[10px] text-slate-600">
                  up to{" "}
                  <span className="text-slate-400 font-medium">
                    {Math.pow(comboBins, fields.filter(k => {
                      const d = CLUSTER_FIELDS.find(f => f.key === k);
                      return d && d.kind !== "categorical";
                    }).length)} clusters
                  </span>
                  {" "}+ None groups for missing values
                </p>
              )}
            </div>

            {/* Bins slider (combo only) */}
            {mode === "combo" && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Bins per field</p>
                  <span className="text-[10px] text-violet-300 font-mono">
                    {comboBins} — {(COMBO_BIN_LABELS[comboBins] ?? []).join(" / ")}
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={4}
                  step={1}
                  value={comboBins}
                  onChange={e => onComboBinsChange(Number(e.target.value))}
                  className="w-full cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-[9px] text-slate-600 -mt-0.5">
                  <span>2 (L/H)</span>
                  <span>3 (L/M/H)</span>
                  <span>4</span>
                </div>
              </div>
            )}

            {/* K input (kmeans only) */}
            {mode === "kmeans" && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Clusters (k)
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={k}
                    onChange={e => onKChange(Math.max(1, Math.min(50, Number(e.target.value))))}
                    className="w-16 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:border-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={onAutoK}
                    className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
                  >
                    <ChevronsUpDown className="h-3 w-3" />
                    Auto
                  </button>
                  <span className="text-[10px] text-slate-600">clamped to card count</span>
                </div>
              </div>
            )}

            {/* Exclude missing fields toggle */}
            {mode !== "manual" && fields.length > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
                <div className="min-w-0 pr-3">
                  <p className="text-[11px] font-medium text-slate-300">Only cards with all fields</p>
                  <p className="text-[10px] text-slate-600">Exclude cards where any selected field is missing</p>
                </div>
                <button
                  onClick={() => onOnlyWithFieldsChange(!onlyWithFields)}
                  className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${onlyWithFields ? "bg-violet-600" : "bg-slate-700"}`}
                >
                  <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${onlyWithFields ? "translate-x-3.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            )}

            {/* Warning */}
            {warning && (
              <p className="rounded-md border border-amber-800/50 bg-amber-950/40 px-2.5 py-1.5 text-[11px] text-amber-400">
                {warning}
              </p>
            )}

            {/* Run button */}
            <button
              onClick={onRun}
              disabled={isRunning}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/50 bg-violet-900/40 py-2 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-900/70 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {isRunning ? "Running…" : "Run Clustering"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
