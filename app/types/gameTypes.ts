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

/** STS-style damage payload: tiers plus optional gate (`conditioned`, `trigger`, etc.). */
export type DamageValueField =
  | ValueNode
  | {
      base?: number;
      upgraded?: number;
      conditioned?: boolean;
      trigger?: string;
      target?: unknown;
      [key: string]: unknown;
    };

export interface Card {
  name: string;
  /** When `type` is `Potion`, category tags from `POTION_CATEGORIES` / `POTIONS_DB.json`. */
  potionTags?: string[];
  type?: string;
  isUpgraded?: boolean;
  isChanged?: boolean;
  isSelected?: boolean;
  /** When set (e.g. true), cost orb shows X and ignores numeric `cost`. */
  xCost?: boolean;
  cost?: ValueNode;
  damage?: ValueNode;
  /**
   * Second damage line (e.g. Bane repeat hit). Same JSON shape as extended `damage` objects
   * (`base`, `upgraded`, optional `conditioned`, `trigger`); rendered as its own glyph cluster.
   */
  bonusDamage?: DamageValueField;
  /**
   * Second block line (e.g. Halt in Wrath). Same JSON shape as {@link bonusDamage}
   * (`base` / `upgraded`, optional `conditioned`, `trigger`).
   */
  bonusBlock?: DamageValueField;
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
  /** Adds generated/specific cards into hand (Blade Dance, powers that add each turn, etc.). */
  canAddCards?: boolean | { base?: boolean; upgraded?: boolean };
  canAddPotions?: boolean | { base?: boolean; upgraded?: boolean };
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
  /** Combat JSON slug, e.g. `ironclad` — used to resolve generic `Strike` / `Defend` deck IDs to character variants. */
  characters?: string;
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
  buffsDebuffs?: BuffDebuff[];
}

/** Normal single attack; `value` is legacy alias for `dmg` (still read everywhere). */
export type EnemyIntentActionAttack = {
  type: "attack";
  dmg?: number;
  value?: number;
};

/** Multi-hit attack: same damage per hit, `count` times (each hit applies incoming modifiers separately in the planner). */
export type EnemyIntentActionMultiAttack = {
  type: "multi_attack";
  dmg: number;
  count: number;
};

export type EnemyIntentActionBlock = {
  type: "block";
  amount: number;
};

/** Debuff applied to the player; omit `value` for 1 stack (e.g. Weak). */
export type EnemyIntentActionDebuff = {
  type: "debuff";
  effect: string;
  value?: number;
  description?: string;
};

export type EnemyIntentActionBuff = {
  type: "buff";
  effect: string;
  value: number;
  description?: string;
};

/** Where status cards/tokens apply (deck zone). Legacy saves omit → treat as `"hand"`. */
export type EnemyIntentStatusLocation = "hand" | "draw" | "discard";

/** Granted card-style status (e.g. Wound ×3 into hand). `effect` = card/token name. */
export type EnemyIntentActionStatus = {
  type: "status";
  effect: string;
  value: number;
  location?: EnemyIntentStatusLocation;
  description?: string;
};

/** Enemy intends to flee (e.g. Looters). */
export type EnemyIntentActionCowardly = {
  type: "cowardly";
  description?: string;
};

/** Enemy is stunned / idle for this intent (show turn count). */
export type EnemyIntentActionStunned = {
  type: "stunned";
  value: number;
  description?: string;
};

/** In combat but no attack / utility this turn — distinguishes from missing intent (not spawned yet). */
export type EnemyIntentActionNoAction = {
  type: "no_action";
  description?: string;
};

/** One atomic piece of an enemy intent; several can combine in the same planner turn slot. */
export type EnemyIntentAction =
  | EnemyIntentActionAttack
  | EnemyIntentActionMultiAttack
  | EnemyIntentActionBlock
  | EnemyIntentActionDebuff
  | EnemyIntentActionBuff
  | EnemyIntentActionStatus
  | EnemyIntentActionCowardly
  | EnemyIntentActionStunned
  | EnemyIntentActionNoAction;

export const ENEMY_INTENT_ACTION_TYPES = [
  "attack",
  "multi_attack",
  "block",
  "debuff",
  "buff",
  "status",
  "cowardly",
  "stunned",
  "no_action",
] as const satisfies readonly EnemyIntentAction["type"][];

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
  type?:
    | 'info'
    | 'action'
    | 'state-change'
    | 'damage'
    | 'heal'
    | 'block'
    | 'block-lost'
    | 'energy'
    | 'buff'
    | 'debuff'
    | 'card-action'
    | 'system'
    /** One explicit “this planner turn has begun” marker per row (phase bar). */
    | 'turn-start';
  target?: 'player' | 'enemy';
  /** Cards involved in this event (colored by type in the UI). */
  cardsInvolved?: ActivityLogCardRef[];
  /** Extra structured context (pile, hand size, reason, etc.). */
  context?: ActivityLogContextLine[];
}

/** Turn flow: start-of-turn hooks (relics, draw, ST) → play cards → enemy resolves. */
export type CombatTurnPhase = "start" | "player" | "enemy";

export interface Turn {
  id: number;
  /** Stable row identity for tooling / logs / correlation (distinct from planner slot {@link Turn.id}). */
  uid: string;
  state: CombatData;
}

/** Saved payloads may omit `uid` until `migrateTurnRowsWithUids` runs. */
export type TurnRowMigrateInput = Omit<Turn, 'uid'> & { uid?: string };

/** Decision timeline topology: anchored START vs imported planner row vs divergent fork. */
export type DecisionTimelineRole = 'timeline_start' | 'turn_checkpoint' | 'branch';

/** One node in the branching decision overlay; carries a full combat snapshot and planner slot metadata. */
export interface DecisionNode {
  id: string;
  parentId: string | null;
  /** Imported spine / UI role; absent in legacy saves (migrated at load). */
  timelineRole?: DecisionTimelineRole;
  /** User-defined short name for the branch. */
  label: string;
  snapshot: CombatData;
  /** Which planner turn slot (`Turn.id`); recomputed from depth below START (matches `turns[]` order). */
  plannerTurnSlotId: number;
  /** Distinct chrome on timeline rows / minimap (`#RRGGBB`). Assigned on create/import; user-editable. */
  timelineAccentHex?: string;
  turnPhase: CombatTurnPhase;
  createdAt: string;
}

export interface DecisionTreeState {
  nodes: DecisionNode[];
  activeNodeId: string | null;
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
