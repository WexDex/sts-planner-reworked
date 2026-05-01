import type { CombatData, DecisionNode, DecisionTimelineRole, Turn } from '@/app/types/gameTypes';
import { assignDistinctTimelineAccentHexesSequential } from '@/app/utils/decisionTimelineAccent';
import { cloneGameData } from '@/app/utils/gameHelpers';
import { formatDecisionBreadcrumbSegment } from '@/app/utils/decisionTreeHelpers';

export type ImportedTimelineSpineOptions = {
  /**
   * When set, the checkpoint for this planner slot ({@link Turn.id}) becomes active.
   * When omitted, **no** timeline pin — user chooses via Set Active on each checkpoint.
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
): { nodes: DecisionNode[]; activeNodeId: string | null } {
  const base = Date.now();
  const ts = (tick: number) => new Date(base + tick).toISOString();

  const firstSlotId = initialTurns[0]?.id ?? 1;
  const startId = createId();
  const accentPalette = assignDistinctTimelineAccentHexesSequential(1 + initialTurns.length);
  const startNode: DecisionNode = {
    id: startId,
    parentId: null,
    label: 'START',
    timelineRole: 'timeline_start',
    snapshot: cloneGameData(withPiles),
    plannerTurnSlotId: firstSlotId,
    timelineAccentHex: accentPalette[0],
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
      label: formatDecisionBreadcrumbSegment(t.id, 1),
      timelineRole: 'turn_checkpoint',
      snapshot: cloneGameData(t.state),
      plannerTurnSlotId: t.id,
      timelineAccentHex: accentPalette[i + 1],
      turnPhase: 'start',
      createdAt: ts((i + 1) * 10),
    });
    prevId = nid;
  }

  const explicitSlot = options?.activePlannerTurnSlotId;
  const useExplicitActiveSlot = explicitSlot !== undefined && explicitSlot !== null;
  const match =
    useExplicitActiveSlot
      ? nodes.find((n) => n.timelineRole === 'turn_checkpoint' && n.plannerTurnSlotId === explicitSlot)
      : undefined;

  const spineLeafCheckpointId = prevId !== startId ? prevId : null;
  const spineLeafCheckpoint =
    spineLeafCheckpointId !== null ? nodes.find((n) => n.id === spineLeafCheckpointId) : undefined;

  const activeNodeId = useExplicitActiveSlot
    ? (match?.id ?? spineLeafCheckpoint?.id ?? null)
    : null;

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
