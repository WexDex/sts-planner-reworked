import type { EnemyIntentAction } from "@/app/types/gameTypes";

/** Emoji prefixes aligned with Turn Maker intent tiles and timeline display. */
export const ENEMY_INTENT_ACTION_GLYPH: Record<EnemyIntentAction["type"], string> = {
  attack: "⚔️",
  multi_attack: "⚔️×",
  block: "🛡️",
  debuff: "❗",
  buff: "📈",
  status: "◎",
  cowardly: "🏃",
  stunned: "💫",
  no_action: "—",
};

export function enemyIntentActionGlyph(type: EnemyIntentAction["type"]): string {
  return ENEMY_INTENT_ACTION_GLYPH[type];
}
