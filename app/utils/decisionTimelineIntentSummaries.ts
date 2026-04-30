import type { CombatData, EnemyIntentAction } from '@/app/types/gameTypes';
import {
  buildIncomingDamageContext,
  describeIncomingModifiers,
  formatIntentActionsLineIncoming,
  isEnemyActiveForIntents,
  sumIncomingAttackDamageFromActions,
  type IncomingDamageContext,
} from '@/app/utils/intentFormat';

/** One enemy row for the planner turn slot on a frozen decision checkpoint snapshot. */
export interface DecisionTimelineEnemyIntentLine {
  name: string;
  line: string;
  damage: number;
  modifierHint: string;
  actions: EnemyIntentAction[];
  incomingCtx: IncomingDamageContext;
}

/**
 * Enemy intents on `snapshot` whose `intent.turn` matches `plannerTurnSlotId`
 * (same filters as Turn timeline intent preview).
 */
export function collectEnemyIntentLinesForPlannerSlot(
  snapshot: CombatData,
  plannerTurnSlotId: number,
): DecisionTimelineEnemyIntentLine[] {
  const player = snapshot.player;
  if (!player) return [];

  const out: DecisionTimelineEnemyIntentLine[] = [];
  for (const enemySnap of snapshot.enemies ?? []) {
    for (const intent of enemySnap.intents ?? []) {
      if (intent.turn !== plannerTurnSlotId) continue;
      if (!isEnemyActiveForIntents(enemySnap)) continue;
      if ((intent.actions?.length ?? 0) === 0) continue;

      const incomingCtx = buildIncomingDamageContext(player, enemySnap);
      const line = formatIntentActionsLineIncoming(intent.actions, incomingCtx);
      const damage = sumIncomingAttackDamageFromActions(intent.actions, incomingCtx);
      const modifierHint = describeIncomingModifiers(incomingCtx);

      out.push({
        name: enemySnap.name,
        line,
        damage,
        modifierHint,
        actions: [...intent.actions],
        incomingCtx,
      });
    }
  }
  return out;
}
