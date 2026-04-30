import type { CombatData, DecisionNode, DecisionTimelineRole, Turn } from '@/app/types/gameTypes';
import { cloneGameData } from '@/app/utils/gameHelpers';

export type ImportedTimelineSpineOptions = {
  /**
   * Planner turn slot ({@link Turn.id}) whose checkpoint becomes the initially active timeline step.
   * Defaults to {@link initialTurns}[0] when edits start on first row (typical ingest).
   */
  activePlannerTurnSlotId?: number;
};

/**
 * On fresh combat load: START anchor + one checkpoint per planner turn (phases shown inside the card).
 */
export function buildImportedDecisionTimelineSpine(
  initialTurns: Turn[],
  withPiles: CombatData,
  createId: () => string,
  options?: ImportedTimelineSpineOptions,
): { nodes: DecisionNode[]; activeNodeId: string } {
  const base = Date.now();
  const ts = (tick: number) => new Date(base + tick).toISOString();

  const firstSlotId = initialTurns[0]?.id ?? 1;
  const startId = createId();
  const startNode: DecisionNode = {
    id: startId,
    parentId: null,
    label: 'START',
    timelineRole: 'timeline_start',
    snapshot: cloneGameData(withPiles),
    plannerTurnSlotId: firstSlotId,
    turnPhase: 'start',
    createdAt: ts(0),
  };

  const nodes: DecisionNode[] = [startNode];
  let prevId = startId;

  for (let i = 0; i < initialTurns.length; i++) {
    const t = initialTurns[i]!;
    const nid = createId();
    nodes.push({
      id: nid,
      parentId: prevId,
      label: `Turn ${t.id}`,
      timelineRole: 'turn_checkpoint',
      snapshot: cloneGameData(t.state),
      plannerTurnSlotId: t.id,
      turnPhase: 'start',
      createdAt: ts((i + 1) * 10),
    });
    prevId = nid;
  }

  const wantSlot =
    options?.activePlannerTurnSlotId !== undefined ? options.activePlannerTurnSlotId : initialTurns[0]?.id;
  const match =
    wantSlot !== undefined && wantSlot !== null
      ? nodes.find((n) => n.timelineRole === 'turn_checkpoint' && n.plannerTurnSlotId === wantSlot)
      : undefined;
  const activeNodeId =
    match?.id ?? nodes.find((n) => n.timelineRole === 'turn_checkpoint')?.id ?? startNode.id;

  return { nodes, activeNodeId };
}

/** Backfill timeline roles when loading saves that omit the field (pre–spine format). */
export function migrateDecisionNodeTimelineRoles(nodes: DecisionNode[]): DecisionNode[] {
  return nodes.map((n) => {
    if (n.timelineRole) return n;
    if (n.parentId === null) {
      const raw = String(n.label ?? '').trim();
      const unifyStart = /^start$/i.test(raw);
      return {
        ...n,
        label: unifyStart ? 'START' : raw || 'START',
        timelineRole: 'timeline_start' as DecisionTimelineRole,
      };
    }
    return { ...n, timelineRole: 'branch' as DecisionTimelineRole };
  });
}
