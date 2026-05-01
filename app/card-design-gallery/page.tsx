"use client";

import { useCallback, useMemo, useState } from "react";
import type { CardVisualVariant } from "@/app/components/UI/cardVisualVariants";
import { GalleryCardSelectModal } from "@/app/card-design-gallery/GalleryCardSelectModal";
import { GalleryCardPreview } from "@/app/card-design-gallery/GalleryCardPreview";
import { GalleryIconCatalogPanel } from "@/app/card-design-gallery/GalleryIconCatalogPanel";
import type {
  GalleryCardSize,
  GalleryDisplayRow,
  GallerySizeMode,
} from "@/app/card-design-gallery/galleryTypes";
import { GalleryQuickTemplateBar } from "@/app/card-design-gallery/GalleryQuickTemplateBar";
import { galleryRowsFromTemplate } from "@/app/card-design-gallery/galleryQuickTemplates";
import { galleryRowFromStsCardId } from "@/app/card-design-gallery/stsToGalleryRow";
import { pickRandomStsCardIds } from "@/app/card-design-gallery/stsRecord";

const RANDOM_CARD_COUNT = 10;

const GALLERY_VARIANTS = ["aurora", "neon"] as const satisfies readonly CardVisualVariant[];

type GalleryVariant = (typeof GALLERY_VARIANTS)[number];

const VARIANT_BLURB: Record<GalleryVariant, string> = {
  aurora: "Baseline glossy gradient, glass highlights, strong hover lift.",
  neon: "Tighter border, heavier outer glow, brighter rim lines.",
};

const SIZE_ORDER: Record<GalleryCardSize, number> = {
  small: 0,
  medium: 1,
  large: 2,
  preview: 3,
};

function effectiveDisplaySize(
  row: GalleryDisplayRow,
  mode: GallerySizeMode,
): GalleryCardSize {
  return mode === "auto" ? row.size ?? "large" : mode;
}

function sortRowsByCardSize(rows: GalleryDisplayRow[]): GalleryDisplayRow[] {
  return [...rows].sort(
    (a, b) =>
      SIZE_ORDER[a.size ?? "large"] - SIZE_ORDER[b.size ?? "large"],
  );
}

const SIZE_MODE_OPTIONS: { id: GallerySizeMode; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "small", label: "S" },
  { id: "medium", label: "M" },
  { id: "large", label: "L" },
  { id: "preview", label: "P" },
];

export default function CardDesignGalleryPage() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerResetKey, setPickerResetKey] = useState(0);
  const [sizeMode, setSizeMode] = useState<GallerySizeMode>("auto");
  const [previewUpgraded, setPreviewUpgraded] = useState(false);
  const [gridRows, setGridRows] = useState<GalleryDisplayRow[]>([]);

  const orderedGridRows = useMemo(() => {
    if (sizeMode !== "auto") return gridRows;
    return sortRowsByCardSize(gridRows);
  }, [gridRows, sizeMode]);

  const clearGrid = useCallback(() => {
    setGridRows([]);
  }, []);

  const resetGallery = useCallback(() => {
    setPreviewUpgraded(false);
    setGridRows([]);
    setSizeMode("auto");
    setPickerOpen(false);
    setPickerResetKey((k) => k + 1);
  }, []);

  const applyPreviewUpgraded = useCallback((v: boolean) => {
    setPreviewUpgraded(v);
    setGridRows((prev) => {
      if (prev.length === 0) return prev;
      return prev
        .map((row) => galleryRowFromStsCardId(row.card.name, { isUpgraded: v }))
        .filter((r): r is GalleryDisplayRow => r != null);
    });
  }, []);

  const loadRandomCards = useCallback(() => {
    const ids = pickRandomStsCardIds(RANDOM_CARD_COUNT);
    const rows = ids
      .map((id) => galleryRowFromStsCardId(id, { isUpgraded: previewUpgraded }))
      .filter((r): r is GalleryDisplayRow => r != null);
    setGridRows(rows);
  }, [previewUpgraded]);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100 lg:flex-row">
      <GalleryCardSelectModal
        open={pickerOpen}
        resetKey={pickerResetKey}
        previewUpgraded={previewUpgraded}
        onPreviewUpgradedChange={applyPreviewUpgraded}
        onClose={() => setPickerOpen(false)}
        onApply={(ids) => {
          const rows = ids
            .map((id) => galleryRowFromStsCardId(id, { isUpgraded: previewUpgraded }))
            .filter((r): r is GalleryDisplayRow => r != null);
          setGridRows(rows);
          setPickerOpen(false);
        }}
      />

      <div className="min-w-0 flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/95 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Card design gallery
                </h1>
                <p className="text-sm text-slate-400">
                  Aurora & Neon · quick templates or pick from the database · effect icons in-card
                  (see catalog →). Rarity appears only in the picker list. Size: Auto sorts small →
                  large; S/M/L forces one size.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/60 p-1"
                    role="group"
                    aria-label="Card preview size"
                  >
                    <span className="px-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Size
                    </span>
                    {SIZE_MODE_OPTIONS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSizeMode(id)}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                          sizeMode === id
                            ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-500/40"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={previewUpgraded}
                      onChange={(e) => applyPreviewUpgraded(e.target.checked)}
                      className="rounded border-slate-600"
                    />
                    Upgraded
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
                  >
                    Select cards…
                  </button>
                  <button
                    type="button"
                    onClick={loadRandomCards}
                    title={`Load ${RANDOM_CARD_COUNT} random cards from the current database`}
                    className="rounded-lg border border-violet-500/45 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/20"
                  >
                    Random ({RANDOM_CARD_COUNT})
                  </button>
                  <button
                    type="button"
                    onClick={clearGrid}
                    disabled={gridRows.length === 0}
                    className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
                  >
                    Clear grid
                  </button>
                  <button
                    type="button"
                    onClick={resetGallery}
                    title="Clear grid, set size to Auto, close picker, reset picker search/selection (use after editing STS_CARDS_DB)"
                    className="rounded-lg border border-amber-600/50 bg-amber-950/40 px-4 py-2 text-sm font-semibold text-amber-100/95 transition hover:bg-amber-950/70"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
          <GalleryQuickTemplateBar
            onPick={(t) =>
              setGridRows(galleryRowsFromTemplate(t, { isUpgraded: previewUpgraded }))
            }
            className="max-w-3xl"
          />

          {gridRows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-12 text-center text-sm text-slate-500">
              No cards selected. Use a quick template above or{" "}
              <strong className="text-slate-300">Select cards…</strong> to load previews from
              STS_CARDS_DB.
            </p>
          ) : (
            GALLERY_VARIANTS.map((variant) => (
              <section
                key={variant}
                className="space-y-4"
                aria-labelledby={`variant-${variant}`}
              >
                <div>
                  <h2
                    id={`variant-${variant}`}
                    className="text-base font-bold capitalize text-white"
                  >
                    {variant}
                  </h2>
                  <p className="text-sm text-slate-500">{VARIANT_BLURB[variant]}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {orderedGridRows.map((row) => {
                    const sz = effectiveDisplaySize(row, sizeMode);
                    return (
                      <div
                        key={`${variant}-${row.id}`}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className="min-h-8 max-w-[11rem] text-center text-[10px] font-medium leading-tight text-slate-500">
                          {row.title}
                          <span className="block text-[9px] text-slate-600">
                            {sizeMode === "auto" ? `size: ${sz}` : `forced: ${sz}`}
                          </span>
                        </span>
                        <GalleryCardPreview row={row} variant={variant} displaySize={sz} />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <GalleryIconCatalogPanel className="max-h-[50vh] overflow-y-auto lg:max-h-none lg:w-80 lg:shrink-0 lg:overflow-y-auto" />
    </div>
  );
}
