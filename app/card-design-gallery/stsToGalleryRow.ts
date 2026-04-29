import type { Card } from "@/app/types/gameTypes";
import { buildGameCardFromStsRaw } from "@/app/data/gameCardFromSts";
import { getStsCardsRecord } from "@/app/card-design-gallery/stsRecord";
import type { GalleryDisplayRow } from "@/app/card-design-gallery/galleryTypes";

export function galleryRowFromStsCardId(
  cardId: string,
  opts?: { isUpgraded?: boolean },
): GalleryDisplayRow | null {
  const db = getStsCardsRecord();
  const raw = db[cardId];
  if (!raw) return null;

  const card: Card = buildGameCardFromStsRaw(cardId, raw as Record<string, unknown>, opts);

  const rarityStr = typeof raw.rarity === "string" ? raw.rarity : "—";

  return {
    id: `sts-${cardId}`,
    title: `${cardId} · ${rarityStr}`,
    card,
    size: "large",
  };
}
