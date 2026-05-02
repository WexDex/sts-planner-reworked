import type { ActivityLogEntry, CombatTurnPhase, DecisionNode } from '@/app/types/gameTypes';

const MAX_ROOT_LOG_TAIL = 20;

/**
 * Log lines to show as "plays" for this node vs parent (or tail for root).
 *
 * Cumulative diff vs parent only makes sense when child and parent represent the SAME planner row
 * (e.g. fork alternates branching from the same slot — child's log is parent's log + new actions).
 * When parent and node sit on **different** planner slots their `snapshot.activityLog`s are
 * independent rows (per-row logs); the prefix-style diff returns nonsense (often `[]` when parent's
 * row happens to have more entries than child's). Pass `slotContext` so the cross-slot case can
 * fall back to the node's own log instead.
 *
 * Caller computes slots via `effectivePlannerTurnSlotId` to avoid a circular dep with
 * `decisionTreeHelpers`.
 */
export function getNewLogEntriesForDecisionNode(
  node: DecisionNode,
  parent: DecisionNode | null,
  slotContext?: { childSlot: number; parentSlot: number },
): ActivityLogEntry[] {
  const childLog = node.snapshot.activityLog ?? [];
  if (!parent) {
    if (childLog.length <= MAX_ROOT_LOG_TAIL) return [...childLog];
    return childLog.slice(-MAX_ROOT_LOG_TAIL);
  }
  if (slotContext && slotContext.childSlot !== slotContext.parentSlot) {
    if (childLog.length <= MAX_ROOT_LOG_TAIL) return [...childLog];
    return childLog.slice(-MAX_ROOT_LOG_TAIL);
  }
  return diffActivityLog(parent.snapshot.activityLog, childLog);
}

/** Entries in `childLog` appended after `parentLog` (append-only diff). Uses prefix length; ignores id mismatches beyond length defense. */
export function diffActivityLog(
  parentLog: ActivityLogEntry[] | undefined,
  childLog: ActivityLogEntry[] | undefined,
): ActivityLogEntry[] {
  const a = parentLog ?? [];
  const b = childLog ?? [];
  if (b.length <= a.length) return [];
  // If child is shorter than parent, treat entire child log as new (repair path).
  if (b.length < a.length)
    return b.slice();
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.id !== b[i]?.id) {
      return b.slice(i);
    }
  }
  return b.slice(a.length);
}

export interface PlaysStructuredSummary {
  /** One-line for collapsed chip (max ~120 chars externally). */
  headline: string;
  uniqueCardNames: string[];
  entryCount: number;
  phasesTouched: CombatTurnPhase[];
}

function uniq<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

/** Rough phase hint from entry type (fallback when grouping). */
export function inferPhaseFromEntryType(entry: ActivityLogEntry): CombatTurnPhase | null {
  const t = entry.type;
  if (t === 'turn-start') return 'start';
  if (t === 'card-action' || t === 'energy' || (t === 'damage' && entry.target === 'enemy')) return 'player';
  if (t === 'damage' && entry.target === 'player') return 'enemy';
  if (t === 'buff' || t === 'debuff' || t === 'heal' || t === 'block') return null;
  return null;
}

/** Collapsed headline + structured bits for expandable “Plays” header. */
export function summarizePlays(
  entries: ActivityLogEntry[],
  nodeTurnPhase: CombatTurnPhase,
): PlaysStructuredSummary {
  const cardNames: string[] = [];
  const phasesHit = new Set<CombatTurnPhase>();
  phasesHit.add(nodeTurnPhase);

  for (const e of entries) {
    const inf = inferPhaseFromEntryType(e);
    if (inf) phasesHit.add(inf);
    for (const c of e.cardsInvolved ?? []) {
      if (c.name?.trim()) cardNames.push(c.name.trim());
    }
  }

  const uniqueCardNames = uniq(cardNames);
  const cardPart =
    uniqueCardNames.length <= 4
      ? uniqueCardNames.join(', ')
      : `${uniqueCardNames.slice(0, 3).join(', ')} +${uniqueCardNames.length - 3}`;

  let headline =
    entries.length === 0
      ? 'No plays since parent'
      : uniqueCardNames.length > 0
        ? `${entries.length} event${entries.length === 1 ? '' : 's'} · ${cardPart}`
        : `${entries.length} event${entries.length === 1 ? '' : 's'}`;

  headline = headline.length > 110 ? headline.slice(0, 107) + '…' : headline;

  return {
    headline,
    uniqueCardNames,
    entryCount: entries.length,
    phasesTouched: [...phasesHit],
  };
}
