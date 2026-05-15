"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getPotionsList, type PotionDbEntry } from "@/app/data/db/potionsRecord";
import { POTION_CATEGORIES } from "@/app/types/types";
import { FlaskConical, Search, X } from "lucide-react";

const TAG_COLORS: Record<string, string> = {
  offensive: "border-red-400/80 bg-red-900/70 text-red-50",
  defensive: "border-sky-400/80 bg-sky-900/70 text-sky-50",
  utility:   "border-violet-400/80 bg-violet-900/70 text-violet-50",
  power:     "border-orange-400/80 bg-orange-900/70 text-orange-50",
};

function tileBg(p: PotionDbEntry): string {
  const tag = p.tags[0];
  if (tag && TAG_COLORS[tag]) return TAG_COLORS[tag];
  return "border-emerald-400/80 bg-emerald-900/70 text-emerald-50";
}

export default function PotionPickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (potionName: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("all");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (isOpen) { setSearch(""); setTag("all"); }
  }, [isOpen]);

  const allPotions = useMemo(() => getPotionsList(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPotions.filter((p) => {
      const matchSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.effect.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchTag = tag === "all" || p.tags.some((t) => t.toLowerCase() === tag);
      return matchSearch && matchTag;
    });
  }, [allPotions, search, tag]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select a potion"
      className="fixed inset-0 z-10000 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="h-4 w-4 text-amber-400" strokeWidth={2} />
            <h2 className="text-sm font-semibold text-slate-100">Select Potion</h2>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-400">
              {filtered.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search + tag filter */}
        <div className="border-b border-slate-800 px-4 py-3 space-y-2.5">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search potions by name, effect, or tag…"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-amber-500/50"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {["all", ...POTION_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setTag(cat === "all" ? "all" : cat.toLowerCase())}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                  tag === (cat === "all" ? "all" : cat.toLowerCase())
                    ? "border-amber-500/70 bg-amber-950/50 text-amber-100"
                    : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Potion grid */}
        <div className="min-h-0 max-h-[60vh] overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">No potions found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filtered.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelect(p.name); }}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left text-xs font-medium transition hover:brightness-110 active:scale-[0.98] ${tileBg(p)}`}
                >
                  <p className="mb-0.5 font-semibold leading-tight">{p.name}</p>
                  {p.rarity && (
                    <p className="text-[10px] opacity-70 capitalize">{p.rarity}</p>
                  )}
                  <p className="mt-1 line-clamp-2 text-[10px] leading-snug opacity-80">
                    {p.effect}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-current/30 px-1 py-px text-[8px] font-bold uppercase tracking-wide opacity-80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
