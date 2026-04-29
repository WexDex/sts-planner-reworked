"use client";

import { useEffect, useMemo, useState } from "react";
import { getStsCardsRecord, listStsCardIdsSorted } from "@/app/card-design-gallery/stsRecord";
import {
  galleryRarityPillClass,
  stsStringToRarityBand,
} from "@/app/card-design-gallery/galleryRarity";
import { GalleryQuickTemplateBar } from "@/app/card-design-gallery/GalleryQuickTemplateBar";

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (cardIds: string[]) => void;
  previewUpgraded: boolean;
  onPreviewUpgradedChange: (value: boolean) => void;
  /** Increment to clear search, selection, and upgraded checkbox (e.g. after reimport). */
  resetKey?: number;
};

export function GalleryCardSelectModal({
  open,
  onClose,
  onApply,
  previewUpgraded,
  onPreviewUpgradedChange,
  resetKey = 0,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, [open, onClose]);

  useEffect(() => {
    if (resetKey === 0) return;
    setQ("");
    setSelected(new Set());
    onPreviewUpgradedChange(false);
  }, [resetKey, onPreviewUpgradedChange]);

  const ids = useMemo(() => listStsCardIdsSorted(), [resetKey]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ids;
    return ids.filter((id) => id.toLowerCase().includes(s));
  }, [ids, q]);

  if (!mounted || !open) return null;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSel() {
    setSelected(new Set());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-card-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
        <header className="shrink-0 border-b border-slate-800 px-4 py-3">
          <h2 id="gallery-card-modal-title" className="text-base font-bold text-white">
            Select cards
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Gallery only · any number of cards · STS_CARDS_DB
          </p>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={previewUpgraded}
              onChange={(e) => onPreviewUpgradedChange(e.target.checked)}
              className="rounded border-slate-600"
            />
            Preview upgraded (same as header toggle)
          </label>
          <div className="mt-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-3">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name…"
              className="min-w-0 w-full flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
              aria-describedby="gallery-card-search-count"
            />
            <p
              id="gallery-card-search-count"
              className="shrink-0 text-xs tabular-nums text-slate-500 min-[400px]:text-right"
            >
              Found {filtered.length} of {ids.length}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span>{selected.size} selected</span>
            <button
              type="button"
              onClick={clearSel}
              className="rounded border border-slate-700 px-2 py-0.5 text-slate-400 hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </header>

        <div className="shrink-0 border-b border-slate-800 px-3 py-2">
          <GalleryQuickTemplateBar
            size="compact"
            showFooterHint={false}
            onPick={(t) => setSelected(new Set(t.cardIds))}
            className="!border-0 !bg-transparent !p-0"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <ul className="space-y-0.5">
            {filtered.map((id) => {
              const raw = getStsCardsRecord()[id];
              const rarity =
                raw && typeof raw.rarity === "string" ? raw.rarity : "—";
              const band = stsStringToRarityBand(
                raw && typeof raw.rarity === "string" ? raw.rarity : undefined,
              );
              const isOn = selected.has(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                      isOn
                        ? "bg-amber-500/20 text-amber-50 ring-1 ring-amber-500/40"
                        : "text-slate-200 hover:bg-slate-800/80"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                        isOn
                          ? "border-amber-400 bg-amber-500/30 text-amber-100"
                          : "border-slate-600 bg-slate-950 text-slate-600"
                      }`}
                    >
                      {isOn ? "✓" : ""}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{id}</span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${galleryRarityPillClass(band)}`}
                    >
                      {rarity}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No matches.</p>
          ) : null}
        </div>

        <footer className="shrink-0 flex gap-2 border-t border-slate-800 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-600 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(Array.from(selected));
              setSelected(new Set());
              setQ("");
            }}
            disabled={selected.size === 0}
            className="flex-1 rounded-lg bg-amber-500/90 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
          >
            Show in grid ({selected.size})
          </button>
        </footer>
      </div>
    </div>
  );
}
