import type { GalleryDisplayRow } from "@/app/card-design-gallery/galleryTypes";
import { galleryRowFromStsCardId } from "@/app/card-design-gallery/stsToGalleryRow";

export type GalleryQuickTemplate = {
  id: string;
  title: string;
  blurb: string;
  /** Real `STS_CARDS_DB.json` card keys. */
  cardIds: readonly string[];
};

/**
 * Hardcoded gallery presets: one per playable character + curse + status, and a dense “many fields” set.
 */
export const GALLERY_QUICK_TEMPLATES: GalleryQuickTemplate[] = [
  {
    id: "by-character",
    title: "All characters",
    blurb: "Ironclad, Silent, Defect, Watcher, Colorless, Curse, Status",
    cardIds: [
      "Anger",
      "Acrobatics",
      "Zap",
      "Alpha",
      "Apotheosis",
      "Ascender's Bane",
      "Burn",
    ],
  },
  {
    id: "effect-kitchen-sink",
    title: "Heavy effects",
    blurb: "Conditional draw/energy, AoE + discard, orbs, draw+discard, exhaust",
    cardIds: [
      "Dropkick",
      "All-Out Attack",
      "Darkness",
      "Acrobatics",
      "Pummel",
      "Dark Embrace",
      "Adrenaline",
      "Dualcast",
    ],
  },
  {
    id: "diri",
    title: "DORO MONSTA CARDO",
    blurb: "",
    cardIds: ["Pommel Strike", "Acrobatics", "Evolve", "Dark Embrace", "Prepared", "Calculated Gamble", "Dagger Throw"],
  },
  {
    id: "multihit",
    title: "Multi hit",
    blurb: "MULTIIII",
    cardIds: ["Dagger Spray", "Whirlwind", "Glass Knife", "Tantrum","Skewer","Ragnarok"],
  },
];

export function galleryRowsFromTemplate(
  template: GalleryQuickTemplate,
  opts?: { isUpgraded?: boolean },
): GalleryDisplayRow[] {
  const isUpgraded = opts?.isUpgraded ?? false;
  return template.cardIds
    .map((id) => galleryRowFromStsCardId(id, { isUpgraded }))
    .filter((r): r is GalleryDisplayRow => r != null);
}
