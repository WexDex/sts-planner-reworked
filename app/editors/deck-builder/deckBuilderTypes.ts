// ─── Core instance type ───────────────────────────────────────────────────────
/** One physical card copy in the deck, uniquely identified by uid. */
export type DeckCardInstance = {
  uid: string;
  card_ID: string;
  isUpgraded: boolean;
};

/** Composite key for grouping instances (clustered view / picker badges). */
export function deckGroupKey(card_ID: string, isUpgraded: boolean): string {
  return `${card_ID}:${isUpgraded ? "u" : "b"}`;
}

// ─── Draw order ───────────────────────────────────────────────────────────────
/** Draw order is just an ordered copy of DeckCardInstance (same shape). */
export type DrawOrderEntry = DeckCardInstance;

// ─── Player setup ─────────────────────────────────────────────────────────────
export type PlayerSetup = {
  characters: "ironclad" | "silent" | "defect" | "watcher";
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

// ─── Saved deck ───────────────────────────────────────────────────────────────
export type SavedDeck = {
  id: string;
  name: string;
  player: PlayerSetup;
  cards: DeckCardInstance[];
  drawOrder: DrawOrderEntry[] | null;
  createdAt: number;
  updatedAt: number;
};

/** JSON export format (no id / timestamps needed). */
export type DeckExport = {
  name: string;
  player: PlayerSetup;
  cards: DeckCardInstance[];
  drawOrder: DrawOrderEntry[] | null;
  exportedAt: number;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────
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
/** Template entries (with count) — expanded to DeckCardInstance[] on use. */
type StarterEntry = { card_ID: string; count: number; isUpgraded: boolean };

export const STARTER_DECKS: Record<string, StarterEntry[]> = {
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
