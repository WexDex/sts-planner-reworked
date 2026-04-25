import { Card } from '@/app/types/gameTypes';
import { CARD_TYPE_COLORS } from '@/app/constants/colors';

export type ActivityLogType = 
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
  | 'system';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  title: string;
  before?: string;
  after?: string;
  details?: string;
  type?: ActivityLogType;
  target?: 'player' | 'enemy';
}

export interface CardNameWithTypeColor {
  name: string;
  type?: string;
  colorClass: string;
}

export const formatCardNames = (cards: Card[]) =>
  cards.map((card) => card.name).join(', ');

export const formatCardNamesWithTypeColor = (cards: Card[]): CardNameWithTypeColor[] =>
  cards.map((card) => ({
    name: card.name,
    type: card.type,
    colorClass:
      (card.type && CARD_TYPE_COLORS[card.type as keyof typeof CARD_TYPE_COLORS]) ||
      'text-slate-300',
  }));

export const createActivityLogEntry = (
  title: string,
  before?: string,
  after?: string,
  details?: string,
  type: ActivityLogType = 'info',
): ActivityLogEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  timestamp: new Date().toLocaleTimeString(),
  title,
  before,
  after,
  details,
  type,
});


export const buildActionLogEntry = (
  action: string,
  selected: { card: Card }[],
): ActivityLogEntry => {
  const names = formatCardNames(selected.map(({ card }) => card));
  const title = `${action}`;
  return createActivityLogEntry(title, undefined, undefined, names ? `Cards: ${names}` : undefined, 'action');
};

export const buildStateDiffLogEntry = (
  action: string,
  before: string,
  after: string,
  details?: string,
): ActivityLogEntry => createActivityLogEntry(action, before, after, details, 'state-change');

// Damage logging
export const buildDamageLogEntry = (
  target: 'player' | 'enemy',
  damage: number,
  beforeHp: number,
  afterHp: number,
  enemyName?: string,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  return createActivityLogEntry(
    `${targetLabel} took ${damage} damage`,
    `HP: ${beforeHp}`,
    `HP: ${afterHp}`,
    undefined,
    'damage',
  );
};

// Heal logging
export const buildHealLogEntry = (
  target: 'player' | 'enemy',
  healAmount: number,
  beforeHp: number,
  afterHp: number,
  enemyName?: string,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  return createActivityLogEntry(
    `${targetLabel} gained ${healAmount} HP`,
    `HP: ${beforeHp}`,
    `HP: ${afterHp}`,
    undefined,
    'heal',
  );
};

// Block logging
export const buildBlockLogEntry = (
  target: 'player' | 'enemy',
  blockAmount: number,
  beforeBlock: number,
  afterBlock: number,
  enemyName?: string,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  return createActivityLogEntry(
    `${targetLabel} gained ${blockAmount} block`,
    `Block: ${beforeBlock}`,
    `Block: ${afterBlock}`,
    undefined,
    'block',
  );
};

// Block lost logging
export const buildBlockLostLogEntry = (
  target: 'player' | 'enemy',
  blockAmount: number,
  beforeBlock: number,
  afterBlock: number,
  enemyName?: string,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'Your' : (enemyName || 'Enemy') + "'s";
  return createActivityLogEntry(
    `${targetLabel} block reduced by ${blockAmount}`,
    `Block: ${beforeBlock}`,
    `Block: ${afterBlock}`,
    undefined,
    'block-lost',
  );
};

// Energy logging
export const buildEnergyLogEntry = (
  energyAmount: number,
  beforeEnergy: number,
  afterEnergy: number,
  action: string = 'energy changed',
): ActivityLogEntry => createActivityLogEntry(
  `Energy: ${action}`,
  `Energy: ${beforeEnergy}`,
  `Energy: ${afterEnergy}`,
  undefined,
  'energy',
);

// Buff logging
export const buildBuffLogEntry = (
  buffName: string,
  stacks: number,
  target: 'player' | 'enemy',
  enemyName?: string,
  previousStacks?: number,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  const action = previousStacks ? 'updated' : 'gained';
  const details = previousStacks ? `${previousStacks} → ${stacks} stacks` : `${targetLabel} Gained ${stacks} stacks of ${buffName}`;
  return createActivityLogEntry(
    `${targetLabel} ${action} ${buffName}`,
    previousStacks ? `Stacks: ${previousStacks}` : undefined,
    `Stacks: ${stacks}`,
    details,
    'buff',
  );
};

// Debuff logging
export const buildDebuffLogEntry = (
  debuffName: string,
  stacks: number,
  target: 'player' | 'enemy',
  enemyName?: string,
  previousStacks?: number,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  const action = previousStacks ? 'updated' : 'gained';
  const details = previousStacks ? `${previousStacks} → ${stacks} stacks` : `${targetLabel} Gained ${stacks} stacks of ${debuffName}`;
  return createActivityLogEntry(
    `${targetLabel} ${action} ${debuffName}`,
    previousStacks ? `Stacks: ${previousStacks}` : undefined,
    `Stacks: ${stacks}`,
    details,
    'debuff',
  );
};

// Debuff removal logging
export const buildDebuffRemovedLogEntry = (
  debuffName: string,
  target: 'player' | 'enemy',
  enemyName?: string,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'Your' : (enemyName || 'Enemy') + "'s";
  return createActivityLogEntry(
    `${targetLabel} ${debuffName} was removed`,
    undefined,
    undefined,
    undefined,
    'debuff',
  );
};
