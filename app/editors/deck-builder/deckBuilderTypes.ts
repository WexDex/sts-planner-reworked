// ─── Deck Builder Types ───────────────────────────────────────────────────────

export type DeckCardEntry = {
  card_ID: string;
  count: number;
  isUpgraded: boolean;
};

/** Composite key used to distinguish base vs upgraded of the same card. */
export function deckEntryKey(card_ID: string, isUpgraded: boolean): string {
  return `${card_ID}:${isUpgraded ? "u" : "b"}`;
}

export type DrawOrderEntry = {
  uid: string;          // "${card_ID}-${isUpgraded}-${instanceIndex}"
  card_ID: string;
  isUpgraded: boolean;
};

export type PlayerSetup = {
  characters: "ironclad" | "silent" | "defect" | "watcher" | "colorless";
  hp: number;
  maxHp: number;
  energy: { base: number };
  drawPerTurn: number;
  floor: number;
  combatName: string;
  combatType: string;
  modifiers: {
    vulnerableMultiplier: number;
    weakMultiplier: number;
  };
  bonusEnergy: number;
  bonusBlock: number;
  relics: Array<{ name: string; description: string }>;
  buffsDebuffs: Array<{ name: string; stacks: number; type: "buff" | "debuff"; description: string }>;
  potions: Array<{ name: string; description: string }>;
  potionBeltSize: number;
};

export type SavedDeck = {
  id: string;
  name: string;
  player: PlayerSetup;
  cards: DeckCardEntry[];
  drawOrder: DrawOrderEntry[] | null;
  createdAt: number;
  updatedAt: number;
};

/** Format written to JSON when exporting — no id/timestamps needed. */
export type DeckExport = {
  name: string;
  player: PlayerSetup;
  cards: DeckCardEntry[];
  drawOrder: DrawOrderEntry[] | null;
  exportedAt: number;
};

export const DEFAULT_PLAYER: PlayerSetup = {
  characters: "ironclad",
  hp: 80,
  maxHp: 80,
  energy: { base: 3 },
  drawPerTurn: 5,
  floor: 1,
  combatName: "Combat",
  combatType: "normal",
  modifiers: { vulnerableMultiplier: 1.5, weakMultiplier: 0.75 },
  bonusEnergy: 0,
  bonusBlock: 0,
  relics: [],
  buffsDebuffs: [],
  potions: [],
  potionBeltSize: 2,
};

// ─── Starter deck definitions ─────────────────────────────────────────────────
export const STARTER_DECKS: Record<string, DeckCardEntry[]> = {
  ironclad: [
    { card_ID: "Strike_R", count: 5, isUpgraded: false },
    { card_ID: "Defend_R", count: 4, isUpgraded: false },
    { card_ID: "Bash",     count: 1, isUpgraded: false },
  ],
  silent: [
    { card_ID: "Strike_G",   count: 5, isUpgraded: false },
    { card_ID: "Defend_G",   count: 5, isUpgraded: false },
    { card_ID: "Neutralize", count: 1, isUpgraded: false },
    { card_ID: "Survivor",   count: 1, isUpgraded: false },
  ],
  defect: [
    { card_ID: "Strike_B", count: 4, isUpgraded: false },
    { card_ID: "Defend_B", count: 4, isUpgraded: false },
    { card_ID: "Zap",      count: 1, isUpgraded: false },
    { card_ID: "Dualcast", count: 1, isUpgraded: false },
  ],
  watcher: [
    { card_ID: "Strike_P",  count: 4, isUpgraded: false },
    { card_ID: "Defend_P",  count: 4, isUpgraded: false },
    { card_ID: "Eruption",  count: 1, isUpgraded: false },
    { card_ID: "Vigilance", count: 1, isUpgraded: false },
  ],
};
