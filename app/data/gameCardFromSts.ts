import type { Card, PlayerData } from "@/app/types/gameTypes";
import { getStsCardsRecord } from "@/app/card-design-gallery/stsRecord";

/** STS basic attack/block cards: Ironclad=R, Silent=G, Defect=B, Watcher=P (case-insensitive character slug). */
const VARIANT_SUFFIX_BY_PLAYABLE_CHARACTER: Record<string, "R" | "G" | "B" | "P"> = {
  ironclad: "R",
  silent: "G",
  defect: "B",
  watcher: "P",
};

function capitalizeStsCardWord(word: string): string {
  const t = word.trim();
  if (!t) return t;
  const lower = t.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Maps deck `card_ID` `Strike` / `Defend` to `Strike_R`, `Defend_G`, etc. from {@link PlayerData.characters}.
 * Normalizes existing `strike_r`-style IDs to STS DB keys. Unknown character defaults to `_R`.
 */
export function resolveStrikeDefendDatabaseId(
  cardId: string,
  playerCharacters?: string,
): string {
  const trimmed = cardId.trim();
  const variantMatch = trimmed.match(/^(strike|defend)_([RGBP])$/i);
  if (variantMatch) {
    const base = capitalizeStsCardWord(variantMatch[1]);
    return `${base}_${variantMatch[2].toUpperCase()}`;
  }

  const plain = trimmed.toLowerCase();
  if (plain !== "strike" && plain !== "defend") return trimmed;

  const ch = playerCharacters?.trim().toLowerCase() ?? "";
  const suffix = VARIANT_SUFFIX_BY_PLAYABLE_CHARACTER[ch] ?? "R";
  return `${capitalizeStsCardWord(trimmed)}_${suffix}`;
}

export function playableCharacterSlug(player: PlayerData): string | undefined {
  if (typeof player.characters === "string" && player.characters.trim() !== "") {
    return player.characters;
  }
  const legacy = (player as unknown as { character?: unknown }).character;
  return typeof legacy === "string" ? legacy : undefined;
}

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
