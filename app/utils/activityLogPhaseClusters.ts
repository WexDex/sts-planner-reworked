import type { ActivityLogEntry, CombatTurnPhase } from '@/app/types/gameTypes';
import { plannerCombatPhaseLong } from '@/app/utils/decisionTimelinePhaseUi';

const PHASE_ORDER: readonly CombatTurnPhase[] = ['start', 'player', 'enemy'] as const;

export type ActivityLogPhaseCluster = {
  phase: CombatTurnPhase;
  displayName: string;
  entries: ActivityLogEntry[];
};

/** True if the log uses explicit phase boundary lines (Draw / Main / Enemy grouping in DTT). */
export function activityLogHasPhaseBoundaryMarkers(entries: ActivityLogEntry[] | undefined): boolean {
  if (!entries?.length) return false;
  return entries.some((e) => e.type === 'phase-start' || e.type === 'phase-end');
}

/**
 * Split **chronological** (oldest-first) log lines into Draw / Main / Enemy buckets using
 * `phase-start` / `phase-end` markers. Lines before the first `phase-start` go to Draw.
 */
export function clusterActivityLogByPhaseBoundaries(
  entriesOldestFirst: ActivityLogEntry[],
): ActivityLogPhaseCluster[] {
  const buckets: Record<CombatTurnPhase, ActivityLogEntry[]> = {
    start: [],
    player: [],
    enemy: [],
  };
  let active: CombatTurnPhase | null = null;

  for (const e of entriesOldestFirst) {
    if (e.type === 'phase-start' && e.phaseMarker) {
      active = e.phaseMarker;
      buckets[e.phaseMarker].push(e);
      continue;
    }
    if (e.type === 'phase-end' && e.phaseMarker) {
      buckets[e.phaseMarker].push(e);
      continue;
    }
    const target = active ?? 'start';
    buckets[target].push(e);
  }

  return PHASE_ORDER.map((phase) => ({
    phase,
    displayName: plannerCombatPhaseLong(phase),
    entries: buckets[phase],
  }));
}
