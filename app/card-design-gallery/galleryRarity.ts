import type { GalleryRarityBand } from "@/app/card-design-gallery/galleryTypes";

export function stsStringToRarityBand(rarity: string | undefined): GalleryRarityBand {
  const r = (rarity ?? "Common").toLowerCase();
  if (r === "uncommon") return "uncommon";
  if (r === "rare" || r === "special") return "rare";
  return "common";
}

export function galleryRarityPillClass(band: GalleryRarityBand): string {
  switch (band) {
    case "uncommon":
      return "border-sky-500/45 bg-sky-600/28 text-sky-50";
    case "rare":
      return "border-amber-500/45 bg-amber-600/28 text-amber-50";
    default:
      return "border-slate-500/45 bg-slate-600/35 text-slate-100";
  }
}
