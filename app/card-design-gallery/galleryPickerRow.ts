import { buildCardFromPotion, getPotionByName } from "@/app/data/db/potionsRecord";
import type { GalleryDisplayRow } from "@/app/card-design-gallery/galleryTypes";
import { galleryRowFromStsCardId } from "@/app/card-design-gallery/stsToGalleryRow";

/** Modal / template prefix so potion names never collide with STS card ids. */
export const POTION_PICKER_PREFIX = "potion|" as const;

export function galleryRowFromPotionName(
  name: string,
  _opts?: { isUpgraded?: boolean },
): GalleryDisplayRow | null {
  const entry = getPotionByName(name);
  if (!entry) return null;
  const card = buildCardFromPotion(entry);
  return {
    id: `potion-row-${entry.name}`,
    title: `${entry.name} · ${entry.rarity} · potion`,
    card,
    size: "large",
  };
}

/** STS card id, or `potion|` + exact potion name from `POTIONS_DB.json`. */
export function galleryRowFromPickerRef(
  ref: string,
  opts?: { isUpgraded?: boolean },
): GalleryDisplayRow | null {
  if (ref.startsWith(POTION_PICKER_PREFIX)) {
    return galleryRowFromPotionName(ref.slice(POTION_PICKER_PREFIX.length), opts);
  }
  return galleryRowFromStsCardId(ref, opts);
}
