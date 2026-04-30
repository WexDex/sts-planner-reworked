import { describe, expect, it } from 'vitest';
import { getActiveLineageBranchIds } from './decisionTreeHelpers';
import type { CombatData, DecisionNode, DecisionTimelineRole } from '@/app/types/gameTypes';

const emptySnapshot = {} as CombatData;

function mk(
  id: string,
  parentId: string | null,
  timelineRole: DecisionTimelineRole,
  createdAt: string,
): DecisionNode {
  return {
    id,
    parentId,
    timelineRole,
    label: id,
    snapshot: emptySnapshot,
    plannerTurnSlotId: 1,
    turnPhase: 'start',
    createdAt,
  };
}

describe('getActiveLineageBranchIds', () => {
  it('returns empty when pinned id is null', () => {
    const s = mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z');
    const t1 = mk('t1', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z');
    expect(getActiveLineageBranchIds([s, t1], null).size).toBe(0);
  });

  it('returns empty when pinned id is unknown', () => {
    const s = mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z');
    expect(getActiveLineageBranchIds([s], 'missing').size).toBe(0);
  });

  it('includes full chain when pinned on first checkpoint under a linear spine', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('t1', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('t2', 't1', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
      mk('t3', 't2', 'turn_checkpoint', '2020-01-01T00:00:03.000Z'),
      mk('t4', 't3', 'turn_checkpoint', '2020-01-01T00:00:04.000Z'),
    ];
    const set = getActiveLineageBranchIds(nodes, 't1');
    expect([...set].sort()).toEqual(['t1', 't2', 't3', 't4']);
  });

  it('includes only one fork wing and unique-child ladder below the pin', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('ta', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('tb', 's', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
      mk('tc', 'ta', 'turn_checkpoint', '2020-01-01T00:00:03.000Z'),
      mk('td', 'tc', 'turn_checkpoint', '2020-01-01T00:00:04.000Z'),
    ];
    const set = getActiveLineageBranchIds(nodes, 'tc');
    expect(set.has('tb')).toBe(false);
    expect([...set].sort()).toEqual(['ta', 'tc', 'td']);
  });

  it('has no downward extension when pinned leaf has no children', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('t1', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('t2', 't1', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
    ];
    expect([...getActiveLineageBranchIds(nodes, 't2')].sort()).toEqual(['t1', 't2']);
  });
});
