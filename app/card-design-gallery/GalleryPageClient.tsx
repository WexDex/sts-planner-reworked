"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getStsCardsRecord, listStsCardIdsSorted } from "./stsRecord";
import {
  applyGalleryFilters,
  computeDbFieldRanges,
  type AdvancedFilters,
  type DbFieldRanges,
  type GalleryFilterState,
  type RangeFilters,
  type SavedFilter,
  type SortField,
  type SortDir,
  genId,
} from "./galleryFilterUtils";
import GalleryCardBox from "./GalleryCardBox";
import GalleryTopBar from "./GalleryTopBar";
import GalleryRightPanel from "./GalleryRightPanel";
import GalleryFilterBuilder from "./GalleryFilterBuilder";
import type { STSCardSize } from "@/app/components/UI/Card";

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS_PINS     = "gallery-pins";
const LS_IGNORED  = "gallery-ignored";
const LS_UPGRADED = "gallery-upgraded";
const LS_SAVED    = "gallery-saved-filters";

// ─── DB records (loaded once at module level — stable) ───────────────────────
const DB_RECORDS = getStsCardsRecord();
const ALL_IDS    = listStsCardIdsSorted();
const DB_RANGES  = computeDbFieldRanges(DB_RECORDS);

// ─── Toggle helper ────────────────────────────────────────────────────────────
function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}
function toggleSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id); else next.add(id);
  return next;
}

// ─── Main client ──────────────────────────────────────────────────────────────
export default function GalleryPageClient() {
  // ── Filter state ────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [selChars,     setSelChars]     = useState<string[]>([]);
  const [selTypes,     setSelTypes]     = useState<string[]>([]);
  const [selRarities,  setSelRarities]  = useState<string[]>([]);
  const [selCosts,     setSelCosts]     = useState<string[]>([]);
  const [selGlyphs,    setSelGlyphs]    = useState<string[]>([]);
  const [showPotions,  setShowPotions]  = useState(false);
  const [selPotionTags,setSelPotionTags]= useState<string[]>([]);
  const [advFilters,   setAdvFilters]   = useState<AdvancedFilters>({});
  const [rangeFilters, setRangeFilters] = useState<RangeFilters>({});
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // ── Per-card state (persisted) ───────────────────────────────────────────
  const [pinnedIds,   setPinnedIds]   = useState<Set<string>>(new Set());
  const [ignoredIds,  setIgnoredIds]  = useState<Set<string>>(new Set());
  const [upgradedIds, setUpgradedIds] = useState<Set<string>>(new Set());

  // ── Display ──────────────────────────────────────────────────────────────
  const [globalSize,      setGlobalSize]      = useState<STSCardSize>("medium");
  const [rightPanelOpen,  setRightPanelOpen]  = useState(true);
  const [builderOpen,     setBuilderOpen]     = useState(false);
  const [editingFilter,   setEditingFilter]   = useState<SavedFilter | undefined>();

  // ── Sort ─────────────────────────────────────────────────────────────────
  const [sortBy,  setSortBy]  = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const onSortByChange  = useCallback((f: SortField) => setSortBy(f), []);
  const onSortDirToggle = useCallback(() => setSortDir(d => d === "asc" ? "desc" : "asc"), []);

  // ── Load from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    try {
      const pins = localStorage.getItem(LS_PINS);
      if (pins) setPinnedIds(new Set(JSON.parse(pins)));
    } catch {}
    try {
      const ign = localStorage.getItem(LS_IGNORED);
      if (ign) setIgnoredIds(new Set(JSON.parse(ign)));
    } catch {}
    try {
      const upg = localStorage.getItem(LS_UPGRADED);
      if (upg) setUpgradedIds(new Set(JSON.parse(upg)));
    } catch {}
    try {
      const saved = localStorage.getItem(LS_SAVED);
      if (saved) setSavedFilters(JSON.parse(saved));
    } catch {}
  }, []);

  // ── Persist to localStorage on change ───────────────────────────────────
  useEffect(() => { localStorage.setItem(LS_PINS,    JSON.stringify([...pinnedIds])); }, [pinnedIds]);
  useEffect(() => { localStorage.setItem(LS_IGNORED, JSON.stringify([...ignoredIds])); }, [ignoredIds]);
  useEffect(() => { localStorage.setItem(LS_UPGRADED,JSON.stringify([...upgradedIds])); }, [upgradedIds]);
  useEffect(() => { localStorage.setItem(LS_SAVED,   JSON.stringify(savedFilters)); }, [savedFilters]);

  // ── Filter state object (memoised) ───────────────────────────────────────
  const filterState = useMemo<GalleryFilterState>(() => ({
    search, selChars, selTypes, selRarities, selCosts, selGlyphs,
    showPotions, selPotionTags, advFilters, rangeFilters, savedFilters,
  }), [search, selChars, selTypes, selRarities, selCosts, selGlyphs,
       showPotions, selPotionTags, advFilters, rangeFilters, savedFilters]);

  // ── Filtered + sorted card IDs ────────────────────────────────────────────
  const filteredIds = useMemo(
    () => applyGalleryFilters(ALL_IDS, DB_RECORDS, filterState, pinnedIds, ignoredIds, sortBy, sortDir),
    [filterState, pinnedIds, ignoredIds, sortBy, sortDir],
  );

  // ── Filter callbacks ──────────────────────────────────────────────────────
  const onToggleChar    = useCallback((c: string) => setSelChars(p => toggle(p, c)), []);
  const onToggleType    = useCallback((t: string) => setSelTypes(p => toggle(p, t)), []);
  const onToggleRarity  = useCallback((r: string) => setSelRarities(p => toggle(p, r)), []);
  const onToggleCost    = useCallback((c: string) => setSelCosts(p => toggle(p, c)), []);
  const onToggleGlyph   = useCallback((g: string) => setSelGlyphs(p => toggle(p, g)), []);
  const onTogglePotions = useCallback(() => setShowPotions(v => !v), []);
  const onTogglePotionTag = useCallback((t: string) => setSelPotionTags(p => toggle(p, t)), []);
  const onToggleAdv     = useCallback((key: string) => {
    setAdvFilters(p => ({ ...p, [key]: !p[key] }));
  }, []);

  const onClearAll = useCallback(() => {
    setSearch(""); setSelChars([]); setSelTypes([]); setSelRarities([]);
    setSelCosts([]); setSelGlyphs([]); setShowPotions(false);
    setSelPotionTags([]); setAdvFilters({}); setRangeFilters({});
  }, []);

  const onRangeChange = useCallback((field: string, bound: "min" | "max", value: string) => {
    const n = value === "" ? undefined : parseFloat(value);
    setRangeFilters(prev => {
      const existing = prev[field] ?? {};
      const updated = { ...existing, [bound]: n };
      return { ...prev, [field]: updated };
    });
  }, []);

  const onRangeClear = useCallback(() => setRangeFilters({}), []);

  // ── Per-card callbacks ────────────────────────────────────────────────────
  const onTogglePin     = useCallback((id: string) => setPinnedIds(p => toggleSet(p, id)), []);
  const onToggleUpgrade = useCallback((id: string) => setUpgradedIds(p => toggleSet(p, id)), []);
  const onIgnore        = useCallback((id: string) => setIgnoredIds(p => { const n = new Set(p); n.add(id); return n; }), []);

  // ── Saved filter callbacks ────────────────────────────────────────────────
  const onToggleSavedFilter  = useCallback((id: string) => {
    setSavedFilters(p => p.map(f => f.id === id ? { ...f, active: !f.active } : f));
  }, []);
  const onEditSavedFilter    = useCallback((id: string) => {
    const f = savedFilters.find(sf => sf.id === id);
    if (f) { setEditingFilter(f); setBuilderOpen(true); }
  }, [savedFilters]);
  const onDeleteSavedFilter  = useCallback((id: string) => {
    setSavedFilters(p => p.filter(f => f.id !== id));
  }, []);
  const onOpenBuilder        = useCallback(() => { setEditingFilter(undefined); setBuilderOpen(true); }, []);
  const onCloseBuilder       = useCallback(() => { setBuilderOpen(false); setEditingFilter(undefined); }, []);
  const onSaveFilter         = useCallback((sf: SavedFilter) => {
    setSavedFilters(prev => {
      const exists = prev.find(f => f.id === sf.id);
      return exists ? prev.map(f => f.id === sf.id ? sf : f) : [...prev, sf];
    });
    setBuilderOpen(false);
    setEditingFilter(undefined);
  }, []);

  const totalVisible = useMemo(
    () => ALL_IDS.filter(id => !ignoredIds.has(id) && (DB_RECORDS[id]?.type !== "Potion" || showPotions)).length,
    [ignoredIds, showPotions],
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top filter bar */}
      <GalleryTopBar
        search={search} onSearchChange={setSearch}
        selChars={selChars} onToggleChar={onToggleChar}
        selTypes={selTypes} onToggleType={onToggleType}
        selRarities={selRarities} onToggleRarity={onToggleRarity}
        selCosts={selCosts} onToggleCost={onToggleCost}
        selGlyphs={selGlyphs} onToggleGlyph={onToggleGlyph}
        showPotions={showPotions} onTogglePotions={onTogglePotions}
        selPotionTags={selPotionTags} onTogglePotionTag={onTogglePotionTag}
        advFilters={advFilters} onToggleAdv={onToggleAdv}
        savedFilters={savedFilters}
        onToggleSavedFilter={onToggleSavedFilter}
        onEditSavedFilter={onEditSavedFilter}
        onDeleteSavedFilter={onDeleteSavedFilter}
        onOpenBuilder={onOpenBuilder}
        onClearAll={onClearAll}
        globalSize={globalSize} onSizeChange={setGlobalSize}
        sortBy={sortBy} onSortByChange={onSortByChange}
        sortDir={sortDir} onSortDirToggle={onSortDirToggle}
        totalCount={totalVisible}
        filteredCount={filteredIds.length}
      />

      {/* Content row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Card grid */}
        <main className="flex-1 overflow-y-auto p-4">
          {filteredIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-semibold text-slate-500">No cards match your filters</p>
              <p className="mt-1 text-sm text-slate-600">Try removing some filters or broadening your search.</p>
              <button
                type="button"
                onClick={onClearAll}
                className="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-5 justify-center">
              {filteredIds.map(id => (
                <GalleryCardBox
                  key={`${id}-${upgradedIds.has(id) ? "u" : "b"}`}
                  cardId={id}
                  globalSize={globalSize}
                  isUpgraded={upgradedIds.has(id)}
                  isPinned={pinnedIds.has(id)}
                  onTogglePin={onTogglePin}
                  onToggleUpgrade={onToggleUpgrade}
                  onIgnore={onIgnore}
                />
              ))}
            </div>
          )}

          {/* Ignored cards indicator */}
          {ignoredIds.size > 0 && (
            <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-600">
              <span>{ignoredIds.size} card{ignoredIds.size !== 1 ? "s" : ""} hidden</span>
              <button
                type="button"
                onClick={() => setIgnoredIds(new Set())}
                className="rounded border border-slate-700/40 px-2 py-0.5 text-[11px] text-slate-600 transition hover:border-slate-600/50 hover:text-slate-300"
              >
                Restore all
              </button>
            </div>
          )}
        </main>

        {/* Range filter right panel */}
        <GalleryRightPanel
          dbRanges={DB_RANGES}
          rangeFilters={rangeFilters}
          onChange={onRangeChange}
          onClear={onRangeClear}
          open={rightPanelOpen}
          onToggle={() => setRightPanelOpen(v => !v)}
        />
      </div>

      {/* Filter builder modal */}
      {builderOpen && (
        <GalleryFilterBuilder
          initial={editingFilter}
          onSave={onSaveFilter}
          onClose={onCloseBuilder}
        />
      )}
    </div>
  );
}
