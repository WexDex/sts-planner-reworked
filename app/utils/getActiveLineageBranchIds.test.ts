import { describe, expect, it } from 'vitest';
import {
  getActiveLineageBranchIds,
  getPinnedAncestorCheckpointIds,
  getUniqueChildLadderDescendantIds,
  turnsVisibleForActiveDecisionLineage,
} from './decisionTreeHelpers';
import type { CombatData, DecisionNode, DecisionTimelineRole, Turn } from '@/app/types/gameTypes';

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

describe('getPinnedAncestorCheckpointIds', () => {
  it('excludes unique-child ladder below the pin', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('t1', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('t2', 't1', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
      mk('t3', 't2', 'turn_checkpoint', '2020-01-01T00:00:03.000Z'),
    ];
    expect([...getPinnedAncestorCheckpointIds(nodes, 't1')].sort()).toEqual(['t1']);
  });

  it('matches fork wing ancestors only', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('ta', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('tb', 's', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
      mk('tc', 'ta', 'turn_checkpoint', '2020-01-01T00:00:03.000Z'),
      mk('td', 'tc', 'turn_checkpoint', '2020-01-01T00:00:04.000Z'),
    ];
    expect([...getPinnedAncestorCheckpointIds(nodes, 'tc')].sort()).toEqual(['ta', 'tc']);
  });
});

describe('getUniqueChildLadderDescendantIds', () => {
  it('walks sole-child chain from pin', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('t1', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('t2', 't1', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
      mk('t3', 't2', 'turn_checkpoint', '2020-01-01T00:00:03.000Z'),
    ];
    expect([...getUniqueChildLadderDescendantIds(nodes, 't1')].sort()).toEqual(['t2', 't3']);
  });

  it('stops at forks', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('ta', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('tb', 's', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
    ];
    expect(getUniqueChildLadderDescendantIds(nodes, 's').size).toBe(0);
  });
});

describe('turnsVisibleForActiveDecisionLineage', () => {
  const plannerTurns: Turn[] = [1, 2, 3, 4].map((id) => ({
    id,
    uid: `uid-${id}`,
    state: emptySnapshot,
  }));

  it('shows only ROOT→pin ancestry — first checkpoint pin excludes ladder rows', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('t1', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('t2', 't1', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
      mk('t3', 't2', 'turn_checkpoint', '2020-01-01T00:00:03.000Z'),
    ];
    const v = turnsVisibleForActiveDecisionLineage(nodes, 't1', plannerTurns);
    expect(v?.map((t) => t.id)).toEqual([1]);
  });

  it('shows checkpoints along chain to pin only', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('t1', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('t2', 't1', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
    ];
    const v = turnsVisibleForActiveDecisionLineage(nodes, 't2', plannerTurns);
    expect(v?.map((t) => t.id)).toEqual([1, 2]);
  });

  it('uses fork wing path — excludes sibling alternate under START', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('ta', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('tb', 's', 'turn_checkpoint', '2020-01-01T00:00:02.000Z'),
      mk('tc', 'ta', 'turn_checkpoint', '2020-01-01T00:00:03.000Z'),
    ];
    const v = turnsVisibleForActiveDecisionLineage(nodes, 'tc', plannerTurns);
    expect(v?.map((t) => t.id)).toEqual([1, 2]);
  });

  it('returns null when START has no child checkpoint', () => {
    const nodes: DecisionNode[] = [mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z')];
    expect(turnsVisibleForActiveDecisionLineage(nodes, 's', plannerTurns)).toBeNull();
  });

  it('returns null when pin is not anchored under START (orphan root)', () => {
    const nodes: DecisionNode[] = [
      mk('s', null, 'timeline_start', '2020-01-01T00:00:00.000Z'),
      mk('t1', 's', 'turn_checkpoint', '2020-01-01T00:00:01.000Z'),
      mk('o', null, 'branch', '2020-01-01T00:00:02.000Z'),
    ];
    expect(turnsVisibleForActiveDecisionLineage(nodes, 'o', plannerTurns)).toBeNull();
  });
});
