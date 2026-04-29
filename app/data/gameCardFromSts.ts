import type { Card } from "@/app/types/gameTypes";
import { getStsCardsRecord } from "@/app/card-design-gallery/stsRecord";

/** Fields stored on STS records that are not copied onto {@link Card} (handled separately). */
const OMIT_FROM_CARD = new Set([
  "id",
  "description",
  "descriptionUpgraded",
  "rarity",
  "characters",
  "gainEnergy",
]);

/**
 * Maps one STS `cards` entry to a planner {@link Card} (name + tier + conflict-safe fields).
 */
export function buildGameCardFromStsRaw(
  cardId: string,
  raw: Record<string, unknown>,
  opts?: { isUpgraded?: boolean },
): Card {
  const isUpgraded = opts?.isUpgraded ?? false;
  const desc =
    isUpgraded && raw.descriptionUpgraded != null
      ? String(raw.descriptionUpgraded)
      : String(raw.description ?? "");

  const card: Card = { name: cardId };
  for (const [k, v] of Object.entries(raw)) {
    if (OMIT_FROM_CARD.has(k)) continue;
    (card as Record<string, unknown>)[k] = v;
  }
  card.description = desc;
  card.isUpgraded = isUpgraded;

  if (typeof raw.character === "string") {
    card.character = raw.character;
  } else if (typeof raw.characters === "string") {
    card.character = raw.characters;
  } else {
    const ch = raw.characters;
    if (Array.isArray(ch) && typeof ch[0] === "string") {
      card.character = ch[0];
    }
  }

  if (raw.gainEnergy != null) {
    card.energyGain = raw.gainEnergy as Card["energyGain"];
  }

  return card;
}

export function gameCardFromDatabaseId(
  cardId: string,
  opts?: { isUpgraded?: boolean },
): Card | null {
  const raw = getStsCardsRecord()[cardId];
  if (!raw) return null;
  return buildGameCardFromStsRaw(cardId, raw as Record<string, unknown>, opts);
}

/** Patch `description` when toggling upgrade tier and the card exists in STS. */
export function stsTierDescriptionPatch(
  cardId: string,
  isUpgraded: boolean,
): Pick<Card, "description"> | Record<string, never> {
  const raw = getStsCardsRecord()[cardId];
  if (!raw) return {};
  const desc =
    isUpgraded && raw.descriptionUpgraded != null
      ? String(raw.descriptionUpgraded)
      : String(raw.description ?? "");
  return { description: desc };
}
