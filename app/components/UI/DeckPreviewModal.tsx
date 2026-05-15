"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { getStsCardsRecord } from "@/app/card-design-gallery/stsRecord";
import type { DeckEntry } from "@/app/types/gameTypes";
import { BookOpen, Search, Shuffle, X } from "lucide-react";

type TileSurface = { bar: string; tileBg: string; tileBorder: string; selectedRing: string };

const TYPE_SURFACE: Record<string, TileSurface> = {
  Attack:  { bar: "bg-red-500",    tileBg: "bg-red-950/35",    tileBorder: "border-red-900/50",    selectedRing: "ring-red-400/90"    },
  Skill:   { bar: "bg-sky-500",    tileBg: "bg-sky-950/35",    tileBorder: "border-sky-900/45",    selectedRing: "ring-sky-400/90"    },
  Power:   { bar: "bg-violet-500", tileBg: "bg-violet-950/40", tileBorder: "border-violet-900/50", selectedRing: "ring-violet-400/90" },
  Curse:   { bar: "bg-orange-500", tileBg: "bg-orange-950/35", tileBorder: "border-orange-900/45", selectedRing: "ring-orange-400/85" },
  Status:  { bar: "bg-slate-500",  tileBg: "bg-slate-800/50",  tileBorder: "border-slate-600/60",  selectedRing: "ring-slate-300/80"  },
};

const CHARACTER_SURFACE: Record<string, TileSurface> = {
  ironclad:  { bar: "bg-rose-500",    tileBg: "bg-rose-950/32",    tileBorder: "border-rose-900/45",    selectedRing: "ring-rose-400/90"    },
  silent:    { bar: "bg-emerald-500", tileBg: "bg-emerald-950/30", tileBorder: "border-emerald-900/45", selectedRing: "ring-emerald-400/90" },
  defect:    { bar: "bg-cyan-500",    tileBg: "bg-cyan-950/32",    tileBorder: "border-cyan-900/45",    selectedRing: "ring-cyan-400/90"    },
  watcher:   { bar: "bg-violet-500",  tileBg: "bg-violet-950/35",  tileBorder: "border-violet-900/45",  selectedRing: "ring-violet-400/90"  },
  colorless: { bar: "bg-slate-400",   tileBg: "bg-slate-800/45",   tileBorder: "border-slate-600/55",   selectedRing: "ring-slate-300/85"   },
  curse:     { bar: "bg-purple-600",  tileBg: "bg-purple-950/35",  tileBorder: "border-purple-900/50",  selectedRing: "ring-purple-400/85"  },
};

const DEFAULT_SURFACE: TileSurface = {
  bar: "bg-slate-500", tileBg: "bg-slate-900/40", tileBorder: "border-slate-700/70", selectedRing: "ring-cyan-400/90",
};

function resolveSurface(colorMode: "character" | "type", type?: string, characters?: string): TileSurface {
  if (colorMode === "type") return TYPE_SURFACE[type ?? ""] ?? DEFAULT_SURFACE;
  return CHARACTER_SURFACE[(characters ?? "").toLowerCase()] ?? DEFAULT_SURFACE;
}

function typeBadgeClass(type?: string): string {
  switch (type) {
    case "Attack": return "bg-red-950/90 text-red-200 border-red-800/60";
    case "Skill":  return "bg-sky-950/90 text-sky-200 border-sky-800/60";
    case "Power":  return "bg-violet-950/90 text-violet-200 border-violet-800/60";
    case "Curse":  return "bg-orange-950/90 text-orange-200 border-orange-800/60";
    case "Status": return "bg-slate-800 text-slate-200 border-slate-600/60";
    default:       return "bg-slate-800 text-slate-300 border-slate-600/60";
  }
}

function getEntryName(entry: DeckEntry): string {
  if ("card_ID" in entry) return entry.card_ID;
  return (entry as { name: string }).name;
}

function getEntryUpgraded(entry: DeckEntry): boolean {
  return !!((entry as { isUpgraded?: boolean }).isUpgraded);
}

function fisherYates<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const TYPE_ORDER = ["Attack", "Skill", "Power", "Curse", "Status"];

type EnrichedCard = {
  name: string;
  upgraded: boolean;
  type: string | undefined;
  characters: string | undefined;
  count: number;
};

export default function DeckPreviewModal({
  isOpen,
  onClose,
  deck,
}: {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckEntry[];
}) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [colorMode, setColorMode] = useState<"character" | "type">("character");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState<EnrichedCard[] | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (isOpen) { setSearch(""); setActiveType(null); setDisplayOrder(null); }
  }, [isOpen]);

  const stsRecord = useMemo(() => getStsCardsRecord(), []);

  // Deduplicated unique cards with counts
  const unique = useMemo<EnrichedCard[]>(() => {
    const countMap = new Map<string, number>();
    const metaMap = new Map<string, { type?: string; characters?: string }>();
    deck.forEach((entry) => {
      const name = getEntryName(entry);
      const upgraded = getEntryUpgraded(entry);
      const key = name + (upgraded ? "+" : "");
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
      if (!metaMap.has(key)) {
        const dbEntry = stsRecord[name] ?? stsRecord[name.replace(/\+$/, "")];
        metaMap.set(key, {
          type: dbEntry?.type as string | undefined,
          characters: dbEntry?.characters as string | undefined,
        });
      }
    });
    const seen = new Set<string>();
    const result: EnrichedCard[] = [];
    deck.forEach((entry) => {
      const name = getEntryName(entry);
      const upgraded = getEntryUpgraded(entry);
      const key = name + (upgraded ? "+" : "");
      if (!seen.has(key)) {
        seen.add(key);
        const meta = metaMap.get(key)!;
        result.push({ name, upgraded, type: meta.type, characters: meta.characters, count: countMap.get(key)! });
      }
    });
    return result;
  }, [deck, stsRecord]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // Count from original deck (not deduplicated) for accurate totals
    deck.forEach((entry) => {
      const name = getEntryName(entry);
      const dbEntry = stsRecord[name] ?? stsRecord[name.replace(/\+$/, "")];
      const t = (dbEntry?.type as string | undefined) ?? "Other";
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return counts;
  }, [deck, stsRecord]);

  const displayed = displayOrder ?? unique;

  const gridItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayed
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .map((c) => ({
        ...c,
        dimmed: activeType !== null && c.type !== activeType,
      }));
  }, [displayed, search, activeType]);

  const handleShuffle = useCallback(() => {
    setDisplayOrder(fisherYates(unique));
  }, [unique]);

  const handleResetOrder = useCallback(() => {
    setDisplayOrder(null);
  }, []);

  const toggleType = useCallback((t: string) => {
    setActiveType((prev) => (prev === t ? null : t));
  }, []);

  if (!isOpen || !mounted) return null;

  const typeStatKeys = [
    ...TYPE_ORDER.filter((t) => typeCounts[t]),
    ...Object.keys(typeCounts).filter((t) => !TYPE_ORDER.includes(t)),
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Starting deck preview"
      className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <BookOpen className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
            <h2 className="text-sm font-semibold text-slate-100">Starting Deck</h2>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-400">
              {deck.length}
            </span>
            {typeStatKeys.map((t) => {
              const isActive = activeType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums transition ${typeBadgeClass(t)} ${
                    isActive
                      ? "ring-2 ring-white/40 brightness-125"
                      : activeType !== null
                        ? "opacity-40"
                        : "hover:brightness-110"
                  }`}
                >
                  {t} ×{typeCounts[t]}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search + color mode toggle + shuffle */}
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards…"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-slate-500"
            />
          </label>

          {/* Color mode */}
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-slate-700">
            {(["character", "type"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setColorMode(mode)}
                className={`px-3 py-1.5 text-[11px] font-semibold capitalize transition ${
                  colorMode === mode
                    ? "bg-slate-700 text-slate-100"
                    : "bg-slate-900 text-slate-500 hover:text-slate-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Shuffle / reset order */}
          {displayOrder ? (
            <button
              type="button"
              onClick={handleResetOrder}
              title="Reset to original order"
              className="shrink-0 rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              Reset
            </button>
          ) : (
            <button
              type="button"
              onClick={handleShuffle}
              title="Shuffle display order"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-200 transition hover:bg-indigo-900/50"
            >
              <Shuffle className="h-3 w-3" strokeWidth={2.25} />
              Shuffle
            </button>
          )}
        </div>

        {/* Card grid */}
        <div className="min-h-0 max-h-[65vh] overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
          {gridItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">No cards found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {gridItems.map(({ name, upgraded, type, characters, count, dimmed }) => {
                const surface = resolveSurface(colorMode, type, characters);
                return (
                  <div
                    key={name + (upgraded ? "+" : "")}
                    className={`relative overflow-hidden rounded-xl border px-3 py-2.5 transition-opacity duration-150 ${surface.tileBg} ${surface.tileBorder} ${dimmed ? "opacity-20" : "opacity-100"}`}
                  >
                    <div className={`absolute left-0 top-0 h-0.5 w-full ${surface.bar}`} />
                    <div className="flex items-start justify-between gap-1">
                      <p className="min-w-0 flex-1 text-xs font-semibold leading-snug text-slate-100 wrap-break-word">
                        {name}
                        {upgraded && <span className="ml-0.5 text-amber-400">+</span>}
                      </p>
                      {count > 1 && (
                        <span className="ml-1 shrink-0 rounded bg-slate-800/80 px-1 py-px text-[9px] font-bold tabular-nums text-slate-300">
                          ×{count}
                        </span>
                      )}
                    </div>
                    {type && (
                      <span className={`mt-1.5 inline-flex items-center rounded border px-1.5 py-px text-[9px] font-semibold ${typeBadgeClass(type)}`}>
                        {type}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 px-5 py-2.5">
          <p className="text-[10px] text-slate-600">
            {unique.length} unique · {deck.length} total — read-only starting deck
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
