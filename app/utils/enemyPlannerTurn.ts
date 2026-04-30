import type { Enemy } from "@/app/types/gameTypes";

/** Intent row locked to a planner turn slot (`Turn.id`). */
export function enemyPlannerIntentSlot(enemy: Pick<Enemy, "intents">, plannerTurnId: number) {
  return enemy.intents?.find((it) => it.turn === plannerTurnId);
}

/**
 * Enemy can be picked as a combat / status target only when they have intent data for this planner turn
 * with at least one action. Empty `actions[]` means “not in combat yet” for this slot; use explicit
 * `no_action` to mark spawned-but-idle enemies.
 */
export function isEnemyTargetableInPlannerTurn(enemy: Enemy, plannerTurnId: number): boolean {
  const slot = enemyPlannerIntentSlot(enemy, plannerTurnId);
  return (slot?.actions?.length ?? 0) > 0;
}
