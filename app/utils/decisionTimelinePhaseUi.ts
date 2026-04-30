import type { CombatTurnPhase, DecisionNode } from '@/app/types/gameTypes';

/** STS `start` is start-of-turn / relics / draw before main combat. */
export function plannerCombatPhaseLong(p: CombatTurnPhase): string {
  if (p === 'start') return 'Draw';
  if (p === 'player') return 'Main';
  return 'Enemy';
}

/** Short chip for breadcrumbs / legends. */
export function plannerCombatPhaseCrumbAbbrev(p: CombatTurnPhase): string {
  if (p === 'start') return 'Dr';
  if (p === 'player') return 'Mn';
  return 'En';
}

/** Outer card accents (checkpoint + forks use combat phase tint; START unchanged in caller). */
export function plannerPhaseTimelineCardAccent(
  phase: CombatTurnPhase,
  isActive: boolean,
): string {
  const activeRing = isActive ? ' shadow-lg ring-2 ring-cyan-400/45 ring-offset-1 ring-offset-slate-950' : '';

  if (phase === 'start')
    return `border-violet-500/55 bg-linear-to-br from-violet-950/45 to-slate-950/92 shadow-violet-950/25 ring-1 ring-violet-400/35${activeRing}`;
  if (phase === 'player')
    return `border-emerald-500/55 bg-linear-to-br from-emerald-950/40 to-slate-950/92 shadow-emerald-950/20 ring-1 ring-emerald-400/35${activeRing}`;
  return `border-rose-500/55 bg-linear-to-br from-rose-950/40 to-slate-950/92 shadow-rose-950/25 ring-1 ring-rose-400/30${activeRing}`;
}

/** Accent bar strip at top of card (easier at-a-glance than border alone). */
export function plannerPhaseStripClass(phase: CombatTurnPhase): string {
  if (phase === 'start') return 'bg-linear-to-r from-violet-500 via-violet-400 to-fuchsia-500';
  if (phase === 'player') return 'bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-400';
  return 'bg-linear-to-r from-rose-600 via-orange-600 to-rose-500';
}

export function plannerPhasePillClasses(phase: CombatTurnPhase): string {
  if (phase === 'start')
    return 'border-violet-400/50 bg-violet-950/80 text-violet-100 shadow-sm shadow-violet-950/40';
  if (phase === 'player')
    return 'border-emerald-400/45 bg-emerald-950/80 text-emerald-100 shadow-sm shadow-emerald-950/35';
  return 'border-rose-400/50 bg-rose-950/85 text-rose-100 shadow-sm shadow-rose-950/35';
}

export function minimapHexForDecisionNodePreview(
  n: DecisionNode,
  isPinned: boolean,
  slotHot?: boolean,
): string {
  if (n.timelineRole === 'timeline_start') return '#f59e0b';
  if (isPinned) return '#22d3ee';
  if (slotHot) return '#22d3d4';
  if (n.turnPhase === 'start') return '#a78bfa';
  if (n.turnPhase === 'player') return '#34d399';
  return '#fb7185';
}
