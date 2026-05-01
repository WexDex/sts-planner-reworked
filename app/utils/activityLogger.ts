import type {
  ActivityLogEntry,
  ActivityLogContextLine,
  Card,
} from '@/app/types/gameTypes';
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
  | 'system'
  | 'turn-start';

export interface CardNameWithTypeColor {
  name: string;
  type?: string;
  colorClass: string;
}

export function formatPileLabel(loc: string): string {
  const map: Record<string, string> = {
    draw: 'Draw pile',
    discard: 'Discard',
    exhaust: 'Exhaust',
    hand: 'Hand',
    playedCards: 'Played',
  };
  return map[loc] ?? loc;
}

export const formatCardNames = (cards: Card[]) => cards.map((card) => card.name).join(', ');

export const formatCardNamesWithTypeColor = (cards: Card[]): CardNameWithTypeColor[] =>
  cards.map((card) => ({
    name: card.name,
    type: card.type,
    colorClass:
      (card.type && CARD_TYPE_COLORS[card.type as keyof typeof CARD_TYPE_COLORS]) || 'text-slate-300',
  }));

type LogExtras = Partial<Pick<ActivityLogEntry, 'cardsInvolved' | 'context' | 'target'>>;

export const createActivityLogEntry = (
  title: string,
  before?: string,
  after?: string,
  details?: string,
  type: ActivityLogType = 'info',
  extras?: LogExtras,
): ActivityLogEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  timestamp: new Date().toLocaleTimeString(),
  title,
  before,
  after,
  details,
  type,
  ...extras,
});

/** Whether the live planner row already has a “turn started” marker (at most one per snapshot). */
export function activityLogHasTurnStartLogged(log: ActivityLogEntry[] | undefined): boolean {
  return Boolean(log?.some((e) => e.type === 'turn-start'));
}

/** Single-use per planner row: marks that this turn has begun (Start phase). */
export function buildTurnStartBoundaryLogEntry(plannerTurnSlotId: number): ActivityLogEntry {
  return createActivityLogEntry(
    `Turn ${plannerTurnSlotId} — started`,
    undefined,
    undefined,
    'Start-of-turn marker: use this once when the turn begins. Log relic hooks, draw, and setup underneath, then use End of start when you enter Main.',
    'turn-start',
    {
      context: [
        { label: 'Planner slot', value: String(plannerTurnSlotId) },
        { label: 'Phase', value: 'Start' },
      ],
    },
  );
}

export interface BuildActionLogExtras {
  context?: ActivityLogContextLine[];
  /** When set, adds a "To" context line (e.g. move destination). */
  toPile?: string;
  /** When set (e.g. play card with enemies / self selected), adds a "Targets" context line. */
  playTargetsLabel?: string;
}

/** Labels for activity log when playing cards with combat targets selected. */
export function formatPlayCardTargets(
  enemies: { name?: string }[] | undefined,
  indices: number[],
  includeSelf: boolean,
): string | null {
  const parts: string[] = [];
  if (includeSelf) parts.push('Self');
  for (const i of indices) {
    const name = enemies?.[i]?.name?.trim();
    parts.push(name && name.length > 0 ? name : `Enemy #${i + 1}`);
  }
  if (parts.length === 0) return null;
  return parts.join(' · ');
}

export const buildActionLogEntry = (
  action: string,
  selected: { card: Card; location?: string }[],
  extras?: BuildActionLogExtras,
): ActivityLogEntry => {
  const cardsInvolved = selected.map(({ card }) => ({
    name: card.name,
    cardType: card.type,
  }));

  const context: ActivityLogContextLine[] = [...(extras?.context ?? [])];

  if (selected.length && !context.some((c) => c.label === 'From')) {
    const pileCounts = new Map<string, number>();
    for (const s of selected) {
      const loc = s.location ?? 'unknown';
      pileCounts.set(loc, (pileCounts.get(loc) ?? 0) + 1);
    }
    const fromParts = [...pileCounts.entries()].map(([loc, n]) => `${formatPileLabel(loc)} ×${n}`);
    context.unshift({ label: 'From', value: fromParts.join(' · ') });
  }

  if (extras?.toPile) {
    context.push({ label: 'To', value: formatPileLabel(extras.toPile) });
  }

  if (extras?.playTargetsLabel) {
    const fromIdx = context.findIndex((c) => c.label === 'From');
    const row = { label: 'Targets', value: extras.playTargetsLabel };
    if (fromIdx >= 0) {
      context.splice(fromIdx + 1, 0, row);
    } else {
      context.unshift(row);
    }
  }

  const nameList = formatCardNames(selected.map(({ card }) => card));

  return createActivityLogEntry(
    action,
    undefined,
    undefined,
    nameList ? `Cards: ${nameList}` : undefined,
    'card-action',
    {
      cardsInvolved: cardsInvolved.length ? cardsInvolved : undefined,
      context: context.length ? context : undefined,
    },
  );
};

export const buildStateDiffLogEntry = (
  action: string,
  before: string,
  after: string,
  details?: string,
  extras?: LogExtras,
): ActivityLogEntry => createActivityLogEntry(action, before, after, details, 'state-change', extras);

export const buildDamageLogEntry = (
  target: 'player' | 'enemy',
  damage: number,
  beforeHp: number,
  afterHp: number,
  enemyName?: string,
  maxHp?: number,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  const context: ActivityLogContextLine[] = [
    { label: 'Damage', value: String(damage) },
    {
      label: 'HP',
      value:
        maxHp != null && maxHp > 0
          ? `${afterHp} / ${maxHp} (${Math.round((afterHp / maxHp) * 100)}%)`
          : String(afterHp),
    },
  ];
  return createActivityLogEntry(
    `${targetLabel} took ${damage} damage`,
    `HP: ${beforeHp}`,
    `HP: ${afterHp}`,
    maxHp != null ? `${targetLabel} HP ${beforeHp} → ${afterHp} (max ${maxHp})` : undefined,
    'damage',
    { target, context },
  );
};

export const buildHealLogEntry = (
  target: 'player' | 'enemy',
  healAmount: number,
  beforeHp: number,
  afterHp: number,
  enemyName?: string,
  maxHp?: number,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  const context: ActivityLogContextLine[] = [
    { label: 'Healing', value: `+${healAmount}` },
    {
      label: 'HP',
      value:
        maxHp != null && maxHp > 0
          ? `${afterHp} / ${maxHp} (${Math.round((afterHp / maxHp) * 100)}%)`
          : String(afterHp),
    },
  ];
  return createActivityLogEntry(
    `${targetLabel} gained ${healAmount} HP`,
    `HP: ${beforeHp}`,
    `HP: ${afterHp}`,
    maxHp != null ? `${targetLabel} HP ${beforeHp} → ${afterHp} (max ${maxHp})` : undefined,
    'heal',
    { target, context },
  );
};

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
    `Block ${beforeBlock} → ${afterBlock} (+${blockAmount})`,
    'block',
    {
      target,
      context: [
        { label: 'Block gained', value: String(blockAmount) },
        { label: 'Block total', value: `${beforeBlock} → ${afterBlock}` },
      ],
    },
  );
};

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
    `Block ${beforeBlock} → ${afterBlock} (−${blockAmount})`,
    'block-lost',
    {
      target,
      context: [
        { label: 'Block lost', value: String(blockAmount) },
        { label: 'Block total', value: `${beforeBlock} → ${afterBlock}` },
      ],
    },
  );
};

export const buildEnergyLogEntry = (
  beforeEnergy: number,
  afterEnergy: number,
  options?: {
    /** Overrides auto-generated title when set. */
    summary?: string;
    cards?: Card[];
    reason?: string;
  },
): ActivityLogEntry => {
  const delta = afterEnergy - beforeEnergy;
  const amt = Math.abs(delta);
  const title =
    options?.summary ??
    (delta > 0
      ? `Energy +${amt} (${beforeEnergy} → ${afterEnergy})`
      : delta < 0
        ? `Energy −${amt} (${beforeEnergy} → ${afterEnergy})`
        : `Energy unchanged (${beforeEnergy})`);

  const context: ActivityLogContextLine[] = [{ label: 'Energy', value: `${beforeEnergy} → ${afterEnergy}` }];
  if (options?.reason) context.push({ label: 'Reason', value: options.reason });

  const cards = options?.cards;

  return createActivityLogEntry(
    title,
    `Energy: ${beforeEnergy}`,
    `Energy: ${afterEnergy}`,
    cards?.length ? `Cards: ${formatCardNames(cards)}` : undefined,
    'energy',
    {
      cardsInvolved: cards?.length ? cards.map((c) => ({ name: c.name, cardType: c.type })) : undefined,
      context,
    },
  );
};

export const buildBuffLogEntry = (
  buffName: string,
  stacks: number,
  target: 'player' | 'enemy',
  enemyName?: string,
  previousStacks?: number,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  const action = previousStacks !== undefined ? 'updated' : 'gained';
  const details =
    previousStacks !== undefined
      ? `${previousStacks} → ${stacks} stacks`
      : `${targetLabel} gained ${stacks} stack(s) of ${buffName}`;
  return createActivityLogEntry(
    `${targetLabel} ${action} ${buffName}`,
    previousStacks !== undefined ? `Stacks: ${previousStacks}` : undefined,
    `Stacks: ${stacks}`,
    details,
    'buff',
    {
      target,
      context: [
        { label: 'Effect', value: buffName },
        {
          label: 'Stacks',
          value: previousStacks !== undefined ? `${previousStacks} → ${stacks}` : String(stacks),
        },
      ],
    },
  );
};

export const buildDebuffLogEntry = (
  debuffName: string,
  stacks: number,
  target: 'player' | 'enemy',
  enemyName?: string,
  previousStacks?: number,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
  const action = previousStacks !== undefined ? 'updated' : 'gained';
  const details =
    previousStacks !== undefined
      ? `${previousStacks} → ${stacks} stacks`
      : `${targetLabel} gained ${stacks} stack(s) of ${debuffName}`;
  return createActivityLogEntry(
    `${targetLabel} ${action} ${debuffName}`,
    previousStacks !== undefined ? `Stacks: ${previousStacks}` : undefined,
    `Stacks: ${stacks}`,
    details,
    'debuff',
    {
      target,
      context: [
        { label: 'Effect', value: debuffName },
        {
          label: 'Stacks',
          value: previousStacks !== undefined ? `${previousStacks} → ${stacks}` : String(stacks),
        },
      ],
    },
  );
};

export const buildDebuffRemovedLogEntry = (
  debuffName: string,
  target: 'player' | 'enemy',
  enemyName?: string,
): ActivityLogEntry => {
  const targetLabel = target === 'player' ? 'Your' : (enemyName || 'Enemy') + "'s";
  return createActivityLogEntry(
    `${targetLabel} ${debuffName} removed`,
    undefined,
    undefined,
    undefined,
    'debuff',
    {
      target,
      context: [{ label: 'Removed', value: debuffName }],
    },
  );
};
