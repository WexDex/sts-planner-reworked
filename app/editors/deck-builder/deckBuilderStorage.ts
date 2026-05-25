import { genId } from "@/app/card-design-gallery/galleryFilterUtils";
import {
  type SavedDeck,
  type DeckCardInstance,
  type DrawOrderEntry,
  DEFAULT_PLAYER,
} from "./deckBuilderTypes";

const LS_KEY = "sts-deck-builder-saved-decks";

// ─── Migration helper ─────────────────────────────────────────────────────────
// Old format: DeckCardEntry = { card_ID, count, isUpgraded }
// New format: DeckCardInstance = { uid, card_ID, isUpgraded }
function migrateCards(raw: unknown[]): DeckCardInstance[] {
  return raw.flatMap(entry => {
    const e = entry as Record<string, unknown>;
    // Already migrated (has uid field)
    if (typeof e.uid === "string") return [e as unknown as DeckCardInstance];
    // Old format: has count — expand to individual instances
    const count = typeof e.count === "number" ? e.count : 1;
    return Array.from({ length: count }, () => ({
      uid: genId(),
      card_ID: e.card_ID as string,
      isUpgraded: Boolean(e.isUpgraded),
    }));
  });
}

export function loadSavedDecks(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedDeck[];
    // Migrate each deck's cards and drawOrder if they're in old format
    return parsed.map(deck => ({
      ...deck,
      cards: migrateCards(deck.cards as unknown[]),
      drawOrder: deck.drawOrder ? migrateCards(deck.drawOrder as unknown[]) : null,
    }));
  } catch {
    return [];
  }
}

export function saveSavedDecks(decks: SavedDeck[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(decks));
  } catch {}
}

export function createBlankDeck(): SavedDeck {
  const now = Date.now();
  return {
    id: genId(),
    name: "New Deck",
    player: { ...DEFAULT_PLAYER, relics: [], buffsDebuffs: [], potions: [] },
    cards: [],
    drawOrder: null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Draw order is now trivial — each DeckCardInstance is already one copy. */
export function expandToDrawOrder(cards: DeckCardInstance[]): DrawOrderEntry[] {
  return [...cards];
}
