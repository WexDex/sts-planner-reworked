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
  cost?: ValueNode;
  damage?: ValueNode;
  block?: ValueNode;
  draw?: ValueNode;
  takeDamage?: ValueNode;
  energyGain?: ValueNode;
  vulnerable?: ValueNode;
  blockOnExhaust?: ValueNode;
  description?: string;
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

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  title: string;
  before?: string;
  after?: string;
  details?: string;
  type?: 'info' | 'action' | 'state-change' | 'damage' | 'heal' | 'block' | 'block-lost' | 'energy' | 'buff' | 'debuff' | 'card-action' | 'system';
  target?: 'player' | 'enemy';
}

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
