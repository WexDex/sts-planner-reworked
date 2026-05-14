"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Search, X } from "lucide-react";
import stsBundle from "@/app/data/db/STS_CARDS_DB.json";

// ─── Data ────────────────────────────────────────────────────────────────────

type CardEntry = {
  id: string;
  type?: string;
  rarity?: string;
  characters?: string;
  description?: string;
};

const ALL_CARDS: CardEntry[] = Object.entries((stsBundle as any).cards ?? {})
  .map(([id, data]: [string, any]) => ({
    id,
    type: data.type as string | undefined,
    rarity: data.rarity as string | undefined,
    characters: data.characters as string | undefined,
    description: data.description as string | undefined,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

// ─── Helpers ─────────────────────────────────────────────────────────────────

type CharFilter = "all" | "ironclad" | "silent" | "defect" | "watcher" | "colorless" | "status" | "curse";

const CHAR_FILTERS: { value: CharFilter; label: string; pill: string; activePill: string }[] = [
  { value: "all",       label: "All",       pill: "border-slate-600/60 text-slate-400 hover:bg-slate-800/50",       activePill: "border-slate-400/70 bg-slate-700/70 text-slate-100" },
  { value: "ironclad",  label: "Ironclad",  pill: "border-rose-900/50 text-rose-400/80 hover:bg-rose-950/30",        activePill: "border-rose-500/65 bg-rose-950/60 text-rose-200" },
  { value: "silent",    label: "Silent",    pill: "border-teal-900/50 text-teal-400/80 hover:bg-teal-950/30",         activePill: "border-teal-500/65 bg-teal-950/60 text-teal-200" },
  { value: "defect",    label: "Defect",    pill: "border-blue-900/50 text-blue-400/80 hover:bg-blue-950/30",         activePill: "border-blue-500/65 bg-blue-950/60 text-blue-200" },
  { value: "watcher",   label: "Watcher",   pill: "border-purple-900/50 text-purple-400/80 hover:bg-purple-950/30",   activePill: "border-purple-500/65 bg-purple-950/60 text-purple-200" },
  { value: "colorless", label: "Colorless", pill: "border-slate-700/50 text-slate-400/80 hover:bg-slate-800/30",      activePill: "border-slate-400/65 bg-slate-700/60 text-slate-200" },
  { value: "status",    label: "Status",    pill: "border-amber-900/50 text-amber-400/80 hover:bg-amber-950/30",      activePill: "border-amber-500/65 bg-amber-950/60 text-amber-200" },
  { value: "curse",     label: "Curses",    pill: "border-indigo-900/50 text-indigo-400/80 hover:bg-indigo-950/30",   activePill: "border-indigo-500/65 bg-indigo-950/60 text-indigo-200" },
];

function typeChipCls(type?: string): string {
  switch (type?.toLowerCase()) {
    case "attack":  return "border-rose-500/50 bg-rose-950/50 text-rose-300";
    case "skill":   return "border-teal-500/50 bg-teal-950/50 text-teal-300";
    case "power":   return "border-violet-500/50 bg-violet-950/50 text-violet-300";
    default:        return "border-slate-600/50 bg-slate-800/50 text-slate-400";
  }
}

function rarityChipCls(rarity?: string): string {
  switch (rarity?.toLowerCase()) {
    case "rare":     return "border-amber-500/45 bg-amber-950/40 text-amber-300";
    case "uncommon": return "border-blue-500/45 bg-blue-950/40 text-blue-300";
    case "common":   return "border-slate-600/45 bg-slate-800/40 text-slate-400";
    default:         return "border-slate-700/40 bg-slate-900/40 text-slate-500";
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  /**
   * Called when the user confirms. Always receives an array of IDs.
   * `count` is the per-card copy count (only meaningful when showCount=true).
   */
  onSelect: (cardIds: string[], count: number) => void;
  onClose: () => void;
  title?: string;
  /** Allow picking multiple different cards at once (checkbox mode). */
  multiSelect?: boolean;
  /** Show a count-per-card input in the footer. */
  showCount?: boolean;
  defaultCount?: number;
  /** Destination label shown next to count. */
  pile?: string;
  /** Pre-selected card IDs. */
  initialSelected?: string[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CardPickerModal({
  onSelect,
  onClose,
  title = "Pick a card",
  multiSelect = false,
  showCount = false,
  defaultCount = 1,
  pile,
  initialSelected = [],
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [charFilter, setCharFilter] = useState<CharFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [count, setCount] = useState(Math.max(1, defaultCount));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Enter" && selected.size > 0) confirm();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_CARDS.filter((c) => {
      if (charFilter !== "all" && (c.characters ?? "").toLowerCase() !== charFilter) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        (c.type ?? "").toLowerCase().includes(q) ||
        (c.rarity ?? "").toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, charFilter]);

  function toggleCard(id: string) {
    setSelected((prev) => {
      if (!multiSelect) return new Set([id]);
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function confirm() {
    if (selected.size === 0) return;
    onSelect([...selected], count);
    onClose();
  }

  const modal = (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex h-[75vh] w-152 max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/80">

        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-800 px-4 py-3">
          <p className="flex-1 text-sm font-bold text-slate-100">{title}</p>
          {multiSelect && selected.size > 0 && (
            <span className="rounded-md border border-cyan-500/40 bg-cyan-950/50 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
              {selected.size} selected
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Search + character filter */}
        <div className="shrink-0 space-y-2 border-b border-slate-800 p-3">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              strokeWidth={2}
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search card name, type, rarity…"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-8 pr-3 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {CHAR_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setCharFilter(f.value)}
                className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition ${
                  charFilter === f.value ? f.activePill : f.pill
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-600">
            {filtered.length} card{filtered.length !== 1 ? "s" : ""}
            {multiSelect && (
              <span className="ml-2 text-slate-500">
                · click to {selected.size > 0 ? "toggle" : "select"}
              </span>
            )}
          </p>
        </div>

        {/* Card list */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-slate-600">No cards match your search.</p>
            </div>
          ) : (
            filtered.map((card) => {
              const isSelected = selected.has(card.id);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => toggleCard(card.id)}
className={`flex w-full items-start gap-2.5 border-b border-slate-800/40 px-3 py-2 text-left last:border-0 transition ${
                    isSelected
                      ? "bg-cyan-950/50 ring-inset ring-1 ring-cyan-500/40"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  {multiSelect && (
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                      isSelected
                        ? "border-cyan-500/70 bg-cyan-500/30 text-cyan-200"
                        : "border-slate-600 bg-slate-800 text-transparent"
                    }`}>
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs font-semibold ${isSelected ? "text-cyan-100" : "text-slate-100"}`}>
                      {card.id}
                    </span>
                    <span className="mt-0.5 flex flex-wrap gap-1">
                      {card.type && (
                        <span className={`rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide ${typeChipCls(card.type)}`}>
                          {card.type}
                        </span>
                      )}
                      {card.rarity && (
                        <span className={`rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide ${rarityChipCls(card.rarity)}`}>
                          {card.rarity}
                        </span>
                      )}
                      {card.characters && (
                        <span className="rounded border border-slate-600/50 bg-slate-800/50 px-1 py-px text-[9px] font-medium capitalize text-slate-400">
                          {card.characters}
                        </span>
                      )}
                    </span>
                    {card.description && (
                      <span className="mt-0.5 block line-clamp-1 text-[10px] leading-snug text-slate-500">{card.description}</span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800 p-3">
          <div className="flex flex-wrap items-center gap-3">
            {showCount && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Copies each
                </span>
                <input
                  type="number"
                  min={1}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
                  className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-sm font-bold tabular-nums text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                />
                {pile && (
                  <span className="text-[10px] text-slate-500">→ {pile}</span>
                )}
              </div>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={confirm}
                disabled={selected.size === 0}
                className="rounded-xl border border-cyan-500/50 bg-cyan-950/50 px-5 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-900/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {selected.size === 0
                  ? "Select a card"
                  : multiSelect && selected.size > 1
                    ? `Add ${selected.size} cards${showCount && count > 1 ? ` ×${count}` : ""}`
                    : showCount && count > 1
                      ? `Add ×${count} "${[...selected][0]}"`
                      : `Select "${[...selected][0]}"`}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
