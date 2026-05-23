"use client";

import { useState } from "react";
import {
  Search, Star, Bookmark, Flame, ChevronDown, ChevronUp, X, Plus, Pencil,
  FlaskConical, Ghost, ArrowUpAZ, ArrowDownAZ,
} from "lucide-react";
import { POTION_CATEGORIES } from "@/app/types/types";
import {
  ADV_FILTER_DEFS, ADV_FILTER_MAP,
  type AdvancedFilters, type AdvancedFilterGroup, type AdvancedFilterType,
  type SavedFilter, type SortField, type SortDir,
} from "./galleryFilterUtils";
import type { STSCardSize } from "@/app/components/UI/Card";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GalleryTopBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  selChars: string[];
  onToggleChar: (c: string) => void;
  selTypes: string[];
  onToggleType: (t: string) => void;
  selRarities: string[];
  onToggleRarity: (r: string) => void;
  selCosts: string[];
  onToggleCost: (c: string) => void;
  selGlyphs: string[];
  onToggleGlyph: (g: string) => void;
  showPotions: boolean;
  onTogglePotions: () => void;
  selPotionTags: string[];
  onTogglePotionTag: (t: string) => void;
  advFilters: AdvancedFilters;
  onToggleAdv: (key: string) => void;
  savedFilters: SavedFilter[];
  onToggleSavedFilter: (id: string) => void;
  onEditSavedFilter: (id: string) => void;
  onDeleteSavedFilter: (id: string) => void;
  onOpenBuilder: () => void;
  onClearAll: () => void;
  globalSize: STSCardSize;
  onSizeChange: (s: STSCardSize) => void;
  sortBy: SortField;
  onSortByChange: (f: SortField) => void;
  sortDir: SortDir;
  onSortDirToggle: () => void;
  totalCount: number;
  filteredCount: number;
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
const charColors: Record<string, { active: string; inactive: string }> = {
  ironclad: {
    active:   "border-red-500/70 bg-red-950/60 text-red-200",
    inactive: "border-red-800/40 text-red-500/70 hover:text-red-300 hover:border-red-700/50",
  },
  silent: {
    active:   "border-emerald-500/70 bg-emerald-950/60 text-emerald-200",
    inactive: "border-emerald-800/40 text-emerald-500/70 hover:text-emerald-300 hover:border-emerald-700/50",
  },
  defect: {
    active:   "border-sky-500/70 bg-sky-950/60 text-sky-200",
    inactive: "border-sky-800/40 text-sky-500/70 hover:text-sky-300 hover:border-sky-700/50",
  },
  watcher: {
    active:   "border-violet-500/70 bg-violet-950/60 text-violet-200",
    inactive: "border-violet-800/40 text-violet-500/70 hover:text-violet-300 hover:border-violet-700/50",
  },
  colorless: {
    active:   "border-zinc-400/60 bg-zinc-700/50 text-zinc-100",
    inactive: "border-zinc-700/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600/50",
  },
  status: {
    active:   "border-slate-400/60 bg-slate-700/50 text-slate-100",
    inactive: "border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600/50",
  },
  curse: {
    active:   "border-neutral-500/60 bg-neutral-800/60 text-neutral-200",
    inactive: "border-neutral-700/40 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600/50",
  },
};

const typeColors: Record<string, { active: string; inactive: string }> = {
  Attack:  { active: "border-red-500/60 bg-red-950/50 text-red-200",           inactive: "border-slate-700/40 text-slate-400 hover:text-red-300" },
  Skill:   { active: "border-sky-500/60 bg-sky-950/50 text-sky-200",            inactive: "border-slate-700/40 text-slate-400 hover:text-sky-300" },
  Power:   { active: "border-amber-500/60 bg-amber-950/50 text-amber-200",      inactive: "border-slate-700/40 text-slate-400 hover:text-amber-300" },
  Curse:   { active: "border-neutral-500/60 bg-neutral-900/50 text-neutral-300",inactive: "border-slate-700/40 text-slate-400 hover:text-neutral-300" },
  Status:  { active: "border-slate-500/60 bg-slate-700/50 text-slate-200",      inactive: "border-slate-700/40 text-slate-400 hover:text-slate-300" },
};

const rarityColors: Record<string, { active: string; inactive: string }> = {
  Common:   { active: "border-slate-400/60 bg-slate-700/50 text-slate-100",   inactive: "border-slate-700/40 text-slate-400 hover:text-slate-200" },
  Uncommon: { active: "border-sky-500/60 bg-sky-950/50 text-sky-200",          inactive: "border-slate-700/40 text-slate-400 hover:text-sky-300" },
  Rare:     { active: "border-amber-500/60 bg-amber-950/50 text-amber-200",    inactive: "border-slate-700/40 text-slate-400 hover:text-amber-300" },
  Special:  { active: "border-rose-500/60 bg-rose-950/50 text-rose-200",       inactive: "border-slate-700/40 text-slate-400 hover:text-rose-300" },
};

// Active colour per advanced-filter type
const ADV_ACTIVE: Record<AdvancedFilterType, string> = {
  boolean: "border-indigo-500/60 bg-indigo-950/50 text-indigo-200",
  exists:  "border-teal-500/60 bg-teal-950/50 text-teal-200",
  custom:  "border-amber-500/60 bg-amber-950/50 text-amber-200",
};

// ─── Shared primitive ─────────────────────────────────────────────────────────
const PILL_BASE    = "rounded-md border px-2 py-0.5 text-xs font-medium transition";
const ALL_ACTIVE   = "border-slate-500 bg-slate-700/60 text-slate-100";
const ALL_INACTIVE = "border-slate-700/40 text-slate-500 hover:border-slate-600/60 hover:text-slate-300";
const LABEL_CLS    = "w-20 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-600";

function Pill({
  label, active, onClick, activeClass, inactiveClass, children,
}: {
  label?: string;
  active: boolean;
  onClick: () => void;
  activeClass?: string;
  inactiveClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${PILL_BASE} ${active ? (activeClass ?? ALL_ACTIVE) : (inactiveClass ?? ALL_INACTIVE)}`}
    >
      {children ?? label}
    </button>
  );
}

// ─── Keyword glyph quick-filters ─────────────────────────────────────────────
const GLYPH_FILTERS = [
  { field: "innate",            label: "Innate",   Icon: Star,        iconClass: "text-yellow-400" },
  { field: "ethereal",          label: "Ethereal", Icon: Ghost,       iconClass: "text-slate-300" },
  { field: "retain",            label: "Retain",   Icon: Bookmark,    iconClass: "text-emerald-400" },
  { field: "selfExhaustOnPlay", label: "Exhaust",  Icon: Flame,       iconClass: "text-orange-400" },
];

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS: { id: SortField; label: string }[] = [
  { id: "name",      label: "A-Z" },
  { id: "character", label: "Character" },
  { id: "type",      label: "Type" },
  { id: "cost",      label: "Cost" },
  { id: "rarity",    label: "Rarity" },
];

const SIZE_OPTIONS: { id: STSCardSize; label: string }[] = [
  { id: "small",   label: "S" },
  { id: "medium",  label: "M" },
  { id: "large",   label: "L" },
  { id: "preview", label: "P" },
];

// ─── Advanced filter groups in display order ──────────────────────────────────
const ADV_GROUPS: { group: AdvancedFilterGroup; label: string; hint: string }[] = [
  { group: "Mechanics",    label: "Mechanics",    hint: "bool/custom" },
  { group: "Scales",       label: "Scales",       hint: "bool" },
  { group: "Has",          label: "Has field",    hint: "presence" },
  { group: "Card Actions", label: "Card Actions", hint: "bool" },
];

// ─── Collapsed-view active chips ──────────────────────────────────────────────
type ActiveChip = { key: string; label: string; color: string; onRemove: () => void };

function buildActiveChips(props: GalleryTopBarProps): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (props.search) chips.push({ key: "search", label: `"${props.search}"`, color: "bg-slate-700/60 text-slate-200", onRemove: () => props.onSearchChange("") });
  for (const c of props.selChars)    chips.push({ key: `char-${c}`,  label: c.charAt(0).toUpperCase() + c.slice(1), color: "bg-slate-700/60 text-slate-200", onRemove: () => props.onToggleChar(c) });
  for (const t of props.selTypes)    chips.push({ key: `type-${t}`,  label: t, color: "bg-slate-700/60 text-slate-200", onRemove: () => props.onToggleType(t) });
  for (const r of props.selRarities) chips.push({ key: `rar-${r}`,   label: r, color: "bg-slate-700/60 text-slate-200", onRemove: () => props.onToggleRarity(r) });
  for (const c of props.selCosts)    chips.push({ key: `cost-${c}`,  label: `Cost: ${c}`, color: "bg-slate-700/60 text-slate-200", onRemove: () => props.onToggleCost(c) });
  for (const g of props.selGlyphs) {
    const def = GLYPH_FILTERS.find(f => f.field === g);
    if (def) chips.push({ key: `glyph-${g}`, label: def.label, color: "bg-slate-700/60 text-slate-200", onRemove: () => props.onToggleGlyph(g) });
  }
  if (props.showPotions) chips.push({ key: "potions", label: "Potions", color: "bg-amber-900/60 text-amber-200", onRemove: () => props.onTogglePotions() });
  for (const t of props.selPotionTags) chips.push({ key: `ptag-${t}`, label: t, color: "bg-amber-900/50 text-amber-300", onRemove: () => props.onTogglePotionTag(t) });
  for (const [k, v] of Object.entries(props.advFilters)) {
    if (v) {
      const def = ADV_FILTER_MAP.get(k);
      if (def) chips.push({ key: `adv-${k}`, label: def.label, color: "bg-indigo-950/60 text-indigo-300", onRemove: () => props.onToggleAdv(k) });
    }
  }
  return chips;
}

const hasAnyFilter = (p: GalleryTopBarProps) =>
  p.search.trim() !== "" ||
  p.selChars.length > 0 ||
  p.selTypes.length > 0 ||
  p.selRarities.length > 0 ||
  p.selCosts.length > 0 ||
  p.selGlyphs.length > 0 ||
  p.showPotions ||
  Object.values(p.advFilters).some(Boolean);

// ─── Main component ───────────────────────────────────────────────────────────
export default function GalleryTopBar(props: GalleryTopBarProps) {
  const {
    search, onSearchChange,
    selChars, onToggleChar,
    selTypes, onToggleType,
    selRarities, onToggleRarity,
    selCosts, onToggleCost,
    selGlyphs, onToggleGlyph,
    showPotions, onTogglePotions,
    selPotionTags, onTogglePotionTag,
    advFilters, onToggleAdv,
    savedFilters, onToggleSavedFilter, onEditSavedFilter, onDeleteSavedFilter, onOpenBuilder,
    onClearAll,
    globalSize, onSizeChange,
    sortBy, onSortByChange, sortDir, onSortDirToggle,
    totalCount, filteredCount,
  } = props;

  const [expanded,     setExpanded]     = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const activeChips = buildActiveChips(props);
  const anyFilter   = hasAnyFilter(props);
  const advCount    = Object.values(advFilters).filter(Boolean).length;

  return (
    <div className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md">

      {/* ── Top row — three balanced columns ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-5 py-3">

        {/* ── LEFT: search ──────────────────────────────────────────────── */}
        <div className="flex flex-1 items-center">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search cards…"
              className="w-full rounded-lg border border-slate-700/50 bg-slate-800/60 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500/60 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
            />
            {search && (
              <button type="button" onClick={() => onSearchChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── CENTRE: size + sort ───────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Size picker */}
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-700/50 bg-slate-800/50 p-1">
            <span className="px-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Size</span>
            {SIZE_OPTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSizeChange(s.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  globalSize === s.id
                    ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-500/40"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-700/60" />

          {/* Sort pills */}
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-700/50 bg-slate-800/50 p-1">
            <span className="px-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Sort</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  if (sortBy === opt.id) onSortDirToggle();
                  else onSortByChange(opt.id);
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  sortBy === opt.id
                    ? "bg-sky-600/30 text-sky-100 ring-1 ring-sky-500/40"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {opt.label}
                {sortBy === opt.id && (
                  <span className="ml-1 text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            ))}
            {/* Direction toggle icon */}
            <button
              type="button"
              onClick={onSortDirToggle}
              title={sortDir === "asc" ? "Ascending — click to flip" : "Descending — click to flip"}
              className="ml-1 rounded-md border border-slate-700/40 p-1.5 text-slate-500 transition hover:border-slate-600/60 hover:text-slate-300"
            >
              {sortDir === "asc"
                ? <ArrowUpAZ className="h-4 w-4" />
                : <ArrowDownAZ className="h-4 w-4" />
              }
            </button>
          </div>
        </div>

        {/* ── RIGHT: count + clear + collapse ──────────────────────────── */}
        <div className="flex flex-1 items-center justify-end gap-3">

          {/* Count badge */}
          <div className="flex items-baseline gap-1 text-sm">
            <span className={filteredCount < totalCount ? "font-bold text-slate-100" : "text-slate-400"}>
              {filteredCount}
            </span>
            <span className="text-slate-600 text-xs">/ {totalCount} cards</span>
          </div>

          {anyFilter && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/40 px-3 py-1.5 text-sm text-slate-500 transition hover:border-rose-700/50 hover:text-rose-400"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/40 px-3 py-1.5 text-sm text-slate-400 transition hover:border-slate-600/60 hover:text-slate-200"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? "Collapse" : "Filters"}
          </button>
        </div>
      </div>

      {/* ── Collapsed chips ────────────────────────────────────────────────── */}
      {!expanded && activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 px-4 pb-2">
          {activeChips.map(chip => (
            <span key={chip.key} className={`flex items-center gap-1 rounded-md border border-transparent px-2 py-0.5 text-xs font-medium ${chip.color}`}>
              {chip.label}
              <button type="button" onClick={chip.onRemove} className="transition hover:text-rose-400">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Expanded filter rows ───────────────────────────────────────────── */}
      {expanded && (
        <div className="space-y-2 px-4 pb-3">

          {/* Characters */}
          <div className="flex flex-wrap items-center gap-1">
            <span className={LABEL_CLS}>Character</span>
            <Pill label="All" active={selChars.length === 0} onClick={() => {}} />
            {Object.keys(charColors).map(c => (
              <Pill
                key={c}
                label={c.charAt(0).toUpperCase() + c.slice(1)}
                active={selChars.includes(c)}
                activeClass={charColors[c]?.active}
                inactiveClass={charColors[c]?.inactive}
                onClick={() => onToggleChar(c)}
              />
            ))}
          </div>

          {/* Types */}
          <div className="flex flex-wrap items-center gap-1">
            <span className={LABEL_CLS}>Type</span>
            <Pill label="All" active={selTypes.length === 0} onClick={() => {}} />
            {["Attack","Skill","Power","Curse","Status"].map(t => (
              <Pill
                key={t}
                label={t}
                active={selTypes.includes(t)}
                activeClass={typeColors[t]?.active}
                inactiveClass={typeColors[t]?.inactive}
                onClick={() => onToggleType(t)}
              />
            ))}
          </div>

          {/* Rarities */}
          <div className="flex flex-wrap items-center gap-1">
            <span className={LABEL_CLS}>Rarity</span>
            <Pill label="All" active={selRarities.length === 0} onClick={() => {}} />
            {["Common","Uncommon","Rare","Special"].map(r => (
              <Pill
                key={r}
                label={r}
                active={selRarities.includes(r)}
                activeClass={rarityColors[r]?.active}
                inactiveClass={rarityColors[r]?.inactive}
                onClick={() => onToggleRarity(r)}
              />
            ))}
          </div>

          {/* Costs */}
          <div className="flex flex-wrap items-center gap-1">
            <span className={LABEL_CLS}>Cost</span>
            <Pill label="All" active={selCosts.length === 0} onClick={() => {}} />
            {["X","0","1","2","3+"].map(c => (
              <Pill
                key={c}
                label={c}
                active={selCosts.includes(c)}
                activeClass={c === "X" ? "border-amber-500/60 bg-amber-950/50 text-amber-200" : "border-sky-500/60 bg-sky-950/50 text-sky-200"}
                onClick={() => onToggleCost(c)}
              />
            ))}
          </div>

          {/* Keywords + Potions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={LABEL_CLS}>Keywords</span>
            {GLYPH_FILTERS.map(({ field, label, Icon, iconClass }) => {
              const on = selGlyphs.includes(field);
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => onToggleGlyph(field)}
                  className={`flex items-center gap-1.5 ${PILL_BASE} ${on ? "border-slate-500 bg-slate-700/60 text-slate-100" : ALL_INACTIVE}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${on ? iconClass : "text-slate-500"}`} />
                  {label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onTogglePotions}
              className={`flex items-center gap-1.5 ${PILL_BASE} ${showPotions ? "border-amber-500/60 bg-amber-950/50 text-amber-200" : ALL_INACTIVE}`}
            >
              <FlaskConical className={`h-3.5 w-3.5 ${showPotions ? "text-amber-400" : "text-slate-500"}`} />
              Potions
            </button>
          </div>

          {/* Potion sub-tags */}
          {showPotions && (
            <div className="flex flex-wrap items-center gap-1 pl-[5.5rem]">
              {POTION_CATEGORIES.map(tag => (
                <Pill
                  key={tag}
                  label={tag}
                  active={selPotionTags.includes(tag)}
                  activeClass="border-amber-500/60 bg-amber-950/50 text-amber-200"
                  onClick={() => onTogglePotionTag(tag)}
                />
              ))}
            </div>
          )}

          {/* My Filters row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={LABEL_CLS}>My Filters</span>
            {savedFilters.map(sf => (
              <span
                key={sf.id}
                className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition ${
                  sf.active ? "border-indigo-500/60 bg-indigo-950/50 text-indigo-200" : "border-slate-700/40 text-slate-500"
                }`}
              >
                <button type="button" onClick={() => onToggleSavedFilter(sf.id)} className="hover:opacity-80">
                  {sf.name}
                </button>
                <button type="button" onClick={() => onEditSavedFilter(sf.id)} title="Edit filter" className="text-slate-600 transition hover:text-indigo-400">
                  <Pencil className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => onDeleteSavedFilter(sf.id)} title="Delete filter" className="text-slate-600 transition hover:text-rose-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={onOpenBuilder}
              className={`flex items-center gap-1 ${PILL_BASE} ${ALL_INACTIVE}`}
            >
              <Plus className="h-3 w-3" /> New Filter
            </button>
          </div>

          {/* Advanced accordion */}
          <div>
            <button
              type="button"
              onClick={() => setAdvancedOpen(v => !v)}
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition hover:text-slate-300"
            >
              {advancedOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Advanced
              {advCount > 0 && (
                <span className="ml-1 rounded-full bg-indigo-600/50 px-1.5 py-0 text-[9px] text-indigo-200">
                  {advCount}
                </span>
              )}
            </button>

            {advancedOpen && (
              <div className="mt-2 space-y-2">
                {ADV_GROUPS.map(({ group, label, hint }) => {
                  const defs = ADV_FILTER_DEFS.filter(d => d.group === group);
                  if (defs.length === 0) return null;
                  return (
                    <div key={group} className="flex flex-wrap items-start gap-x-1 gap-y-1">
                      <div className="flex w-24 shrink-0 flex-col pt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400">{label}</span>
                        <span className="text-[9px] text-slate-600">{hint}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {defs.map(def => (
                          <button
                            key={def.key}
                            type="button"
                            onClick={() => onToggleAdv(def.key)}
                            className={`${PILL_BASE} ${
                              advFilters[def.key]
                                ? ADV_ACTIVE[def.filterType]
                                : ALL_INACTIVE
                            }`}
                          >
                            {def.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
