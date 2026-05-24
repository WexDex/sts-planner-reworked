import { genId } from "@/app/card-design-gallery/galleryFilterUtils";
import {
  type SavedDeck,
  type DeckCardEntry,
  type DrawOrderEntry,
  DEFAULT_PLAYER,
} from "./deckBuilderTypes";

const LS_KEY = "sts-deck-builder-saved-decks";

export function loadSavedDecks(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedDeck[];
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

/** Expand card entries into individual draw-order instances. */
export function expandToDrawOrder(cards: DeckCardEntry[]): DrawOrderEntry[] {
  return cards.flatMap(entry =>
    Array.from({ length: entry.count }, (_, i) => ({
      uid: `${entry.card_ID}-${entry.isUpgraded ? "u" : "b"}-${i}`,
      card_ID: entry.card_ID,
      isUpgraded: entry.isUpgraded,
    })),
  );
}
