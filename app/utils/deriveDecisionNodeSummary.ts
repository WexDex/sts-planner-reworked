import type { CombatData } from '@/app/types/gameTypes';

export interface DecisionNodeSummary {
  hp: number;
  block: number;
  energy: number;
  handSize: number;
  lastLogTitle: string;
  /** Which planner turn slot (`Turn.id`) this node is tied to. */
  turnSlot: number;
}

export function deriveDecisionNodeSummary(
  snapshot: CombatData,
  plannerTurnSlotId: number,
): DecisionNodeSummary {
  const log = snapshot.activityLog ?? [];
  const last = log[log.length - 1];
  return {
    hp: snapshot.player?.hp ?? 0,
    block: snapshot.player?.currentBlock ?? 0,
    energy: snapshot.player?.currentEnergy ?? snapshot.player?.energy?.base ?? 0,
    handSize: snapshot.hand?.length ?? 0,
    lastLogTitle: last?.title?.slice(0, 72) ?? '—',
    turnSlot: plannerTurnSlotId,
  };
}
