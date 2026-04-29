// Types for game data structure
export interface Relic {
  name: string;
  description: string;
}

export interface RelicEffect {
  turn: number;
  effect: string;
  enabled?: boolean;
}

export type ValueNode = number | { base: number; upgraded?: number };

export interface Card {
  name: string;
  type?: string;
  isUpgraded?: boolean;
  isChanged?: boolean;
  isSelected?: boolean;
  /** When set (e.g. true), cost orb shows X and ignores numeric `cost`. */
  xCost?: boolean;
  cost?: ValueNode;
  damage?: ValueNode;
  block?: ValueNode;
  draw?: ValueNode;
  takeDamage?: ValueNode;
  energyGain?: ValueNode;
  vulnerable?: ValueNode;
  blockOnExhaust?: ValueNode;
  /** HP restored (Bite, etc.) — tiers in STS DB. */
  heal?: ValueNode;
  /** Defect Focus (+/- orbs scaling). */
  focus?: ValueNode;
  /** Watcher Mantra stacks when using `[MANTRA]` / mantra-backed `[W]`. */
  mantra?: ValueNode;
  description?: string;
  /** No energy cost orb (curse / special). */
  unplayable?: boolean;
  /** Retain on hand (STS tiered booleans). */
  retain?: { base?: boolean; upgraded?: boolean };
  [key: string]: any;
}

export interface CardReference {
  card_ID: string;
  isUpgraded?: boolean;
  isChanged?: boolean;
  isSelected?: boolean;
  [key: string]: any;
}

export type DeckEntry = Card | CardReference;

export interface BuffDebuff {
  name: string;
  stacks: number;
  type: 'buff' | 'debuff';
  description?: string;
}

export interface PlayerData {
  hp: number;
  maxHp: number;
  currentBlock?: number;
  energy: {
    base: number;
    turn1Bonus: number;
  };
  currentEnergy?: number;
  combatType: string;
  combatName: string;
  floor: number;
  drawPerTurn: number;
  modifiers: {
    vulnerableMultiplier: number;
    weakMultiplier: number;
  };
  relics: Relic[];
  relicEffects: RelicEffect[];
  activeRelics?: string[];
  bonusEnergy?: number;
  bonusBlock?: number;
  intangible?: boolean;
  buffsDebuffs?: BuffDebuff[];
}

export interface EnemyIntentAction {
  type: string;
  value?: number;
  effect?: string;
  description?: string;
}

export interface EnemyIntent {
  turn: number;
  actions: EnemyIntentAction[];
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  currentBlock?: number;
  buffsDebuffs?: BuffDebuff[];
  intents: EnemyIntent[];
}

/** Card references for rich log rendering (colors by card type). */
export interface ActivityLogCardRef {
  name: string;
  cardType?: string;
}

/** Structured key/value lines shown under a log entry (sources, piles, reasons). */
export interface ActivityLogContextLine {
  label: string;
  value: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  title: string;
  before?: string;
  after?: string;
  details?: string;
  type?: 'info' | 'action' | 'state-change' | 'damage' | 'heal' | 'block' | 'block-lost' | 'energy' | 'buff' | 'debuff' | 'card-action' | 'system';
  target?: 'player' | 'enemy';
  /** Cards involved in this event (colored by type in the UI). */
  cardsInvolved?: ActivityLogCardRef[];
  /** Extra structured context (pile, hand size, reason, etc.). */
  context?: ActivityLogContextLine[];
}

/** Round flow: start-of-turn hooks (relics, draw, ST) → play cards → enemy resolves. */
export type CombatTurnPhase = "start" | "player" | "enemy";

export interface Turn {
  id: number;
  state: CombatData;
}

export interface CombatData {
  player: PlayerData;
  deck: DeckEntry[];
  draw: Card[];
  discard: Card[];
  exhaust: Card[];
  hand: Card[];
  playedCards: Card[];
  activityLog: ActivityLogEntry[];
  enemies?: Enemy[];
  [key: string]: any;
}
