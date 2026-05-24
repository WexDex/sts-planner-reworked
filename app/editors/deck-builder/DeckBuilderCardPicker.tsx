"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getStsCardsRecord,
  listStsCardIdsSorted,
} from "@/app/card-design-gallery/stsRecord";
import {
  applyGalleryFilters,
  type AdvancedFilters,
  type RangeFilters,
  type SavedFilter,
  type SortField,
  type SortDir,
  type GalleryFilterState,
} from "@/app/card-design-gallery/galleryFilterUtils";
import GalleryTopBar from "@/app/card-design-gallery/GalleryTopBar";
import GalleryCardBox from "@/app/card-design-gallery/GalleryCardBox";
import type { STSCardSize } from "@/app/components/UI/Card";
import { deckEntryKey } from "./deckBuilderTypes";
import type { DeckCardEntry } from "./deckBuilderTypes";

const DB_RECORDS = getStsCardsRecord();
const ALL_IDS    = listStsCardIdsSorted();

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

interface DeckBuilderCardPickerProps {
  deckCards: DeckCardEntry[];
  onAddCard: (cardId: string, isUpgraded: boolean) => void;
}

export default function DeckBuilderCardPicker({
  deckCards,
  onAddCard,
}: DeckBuilderCardPickerProps) {
  const [search,        setSearch]        = useState("");
  const [selChars,      setSelChars]      = useState<string[]>([]);
  const [selTypes,      setSelTypes]      = useState<string[]>([]);
  const [selRarities,   setSelRarities]   = useState<string[]>([]);
  const [selCosts,      setSelCosts]      = useState<string[]>([]);
  const [selGlyphs,     setSelGlyphs]     = useState<string[]>([]);
  const [showPotions,   setShowPotions]   = useState(false);
  const [selPotionTags, setSelPotionTags] = useState<string[]>([]);
  const [advFilters,    setAdvFilters]    = useState<AdvancedFilters>({});
  const [rangeFilters,  setRangeFilters]  = useState<RangeFilters>({});
  const [savedFilters,  setSavedFilters]  = useState<SavedFilter[]>([]);
  const [globalSize,    setGlobalSize]    = useState<STSCardSize>("small");
  const [sortBy,        setSortBy]        = useState<SortField>("name");
  const [sortDir,       setSortDir]       = useState<SortDir>("asc");
  const [allUpgraded,   setAllUpgraded]   = useState(false);
  const [bothVersions,  setBothVersions]  = useState(false);

  const filterState = useMemo<GalleryFilterState>(() => ({
    search, selChars, selTypes, selRarities, selCosts, selGlyphs,
    showPotions, selPotionTags, advFilters, rangeFilters, savedFilters,
  }), [search, selChars, selTypes, selRarities, selCosts, selGlyphs,
       showPotions, selPotionTags, advFilters, rangeFilters, savedFilters]);

  const { ids: filteredIds, upgradedMatchIds } = useMemo(
    () => applyGalleryFilters(ALL_IDS, DB_RECORDS, filterState, new Set(), new Set(), sortBy, sortDir, bothVersions),
    [filterState, sortBy, sortDir, bothVersions],
  );

  const onToggleChar      = useCallback((c: string) => setSelChars(p => toggle(p, c)), []);
  const onToggleType      = useCallback((t: string) => setSelTypes(p => toggle(p, t)), []);
  const onToggleRarity    = useCallback((r: string) => setSelRarities(p => toggle(p, r)), []);
  const onToggleCost      = useCallback((c: string) => setSelCosts(p => toggle(p, c)), []);
  const onToggleGlyph     = useCallback((g: string) => setSelGlyphs(p => toggle(p, g)), []);
  const onTogglePotions   = useCallback(() => setShowPotions(v => !v), []);
  const onTogglePotionTag = useCallback((t: string) => setSelPotionTags(p => toggle(p, t)), []);
  const onToggleAdv       = useCallback((key: string) => setAdvFilters(p => ({ ...p, [key]: !p[key] })), []);
  const onClearAll        = useCallback(() => {
    setSearch(""); setSelChars([]); setSelTypes([]); setSelRarities([]);
    setSelCosts([]); setSelGlyphs([]); setShowPotions(false);
    setSelPotionTags([]); setAdvFilters({}); setRangeFilters({});
  }, []);
  const onToggleSaved  = useCallback((id: string) => setSavedFilters(p => p.map(f => f.id === id ? { ...f, active: !f.active } : f)), []);
  const onDeleteSaved  = useCallback((id: string) => setSavedFilters(p => p.filter(f => f.id !== id)), []);

  const totalCount = useMemo(
    () => ALL_IDS.filter(id => DB_RECORDS[id]?.type !== "Potion" || showPotions).length,
    [showPotions],
  );

  // Build a map for quick lookup: entryKey → count
  const countMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of deckCards) {
      m[deckEntryKey(e.card_ID, false)]  = (m[deckEntryKey(e.card_ID, false)]  ?? 0);
      m[deckEntryKey(e.card_ID, true)]   = (m[deckEntryKey(e.card_ID, true)]   ?? 0);
    }
    for (const e of deckCards) {
      m[deckEntryKey(e.card_ID, e.isUpgraded)] = e.count;
    }
    return m;
  }, [deckCards]);

  const noop = useCallback((_: string) => {}, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
        onToggleSavedFilter={onToggleSaved}
        onEditSavedFilter={noop}
        onDeleteSavedFilter={onDeleteSaved}
        onOpenBuilder={() => {}}
        onClearAll={onClearAll}
        allUpgraded={allUpgraded} onToggleAllUpgraded={() => setAllUpgraded(v => !v)}
        bothVersions={bothVersions} onToggleBothVersions={() => setBothVersions(v => !v)}
        globalSize={globalSize} onSizeChange={setGlobalSize}
        sortBy={sortBy} onSortByChange={setSortBy}
        sortDir={sortDir} onSortDirToggle={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
        totalCount={totalCount}
        filteredCount={filteredIds.length}
      />

      {/* Hint bar */}
      <div className="shrink-0 flex items-center gap-3 border-b border-slate-800/50 bg-slate-900/40 px-3 py-1.5">
        <span className="text-[11px] text-slate-600">
          <kbd className="rounded border border-slate-700/60 bg-slate-800/70 px-1 py-0.5 text-[10px]">Left-click</kbd>
          {" "}Add base &nbsp;
          <kbd className="rounded border border-slate-700/60 bg-slate-800/70 px-1 py-0.5 text-[10px]">Right-click</kbd>
          {" "}Add upgraded
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filteredIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-slate-500">No cards match</p>
            <button type="button" onClick={onClearAll} className="mt-3 rounded-lg border border-slate-700/50 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:text-slate-100">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {filteredIds.map(id => {
              const baseCount  = countMap[deckEntryKey(id, false)] ?? 0;
              const upgCount   = countMap[deckEntryKey(id, true)]  ?? 0;
              // Auto-show upgraded when allUpgraded is on, or when ±Ver matched this card via upgraded only
              const isUpgraded = allUpgraded || upgradedMatchIds.has(id);

              return (
                <div
                  key={id}
                  className="relative cursor-pointer select-none"
                  onClick={() => onAddCard(id, isUpgraded)}
                  onContextMenu={e => { e.preventDefault(); onAddCard(id, true); }}
                  title="Left-click: add base | Right-click: add upgraded"
                >
                  <GalleryCardBox
                    cardId={id}
                    globalSize={globalSize}
                    isUpgraded={isUpgraded}
                    isPinned={false}
                    onTogglePin={noop}
                    onToggleUpgrade={noop}
                    onIgnore={noop}
                  />
                  {/* Count badges — base (indigo) and upgraded (sky) */}
                  <div className="pointer-events-none absolute bottom-1 right-1 z-30 flex gap-0.5">
                    {baseCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white shadow">
                        {baseCount}
                      </span>
                    )}
                    {upgCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-xs font-bold text-white shadow">
                        {upgCount}+
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
