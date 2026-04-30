import type { EnemyIntentAction } from "@/app/types/gameTypes";

/** Resolve single-hit damage (`dmg` preferred; legacy `value` on attack). */
export function getSingleAttackDamage(action: { type: string; dmg?: number; value?: number }): number {
  if (action.type !== "attack") return 0;
  const d = action.dmg ?? action.value;
  return typeof d === "number" && !Number.isNaN(d) ? d : 0;
}

export function createDefaultEnemyIntentAction(type: EnemyIntentAction["type"]): EnemyIntentAction {
  switch (type) {
    case "attack":
      return { type: "attack", dmg: 6 };
    case "multi_attack":
      return { type: "multi_attack", dmg: 4, count: 2 };
    case "block":
      return { type: "block", amount: 10 };
    case "debuff":
      return { type: "debuff", effect: "Weak", value: 2 };
    case "buff":
      return { type: "buff", effect: "Strength", value: 1 };
    case "status":
      return { type: "status", effect: "Wound", value: 1, location: "hand" };
    case "cowardly":
      return { type: "cowardly" };
    case "stunned":
      return { type: "stunned", value: 1 };
    case "no_action":
      return { type: "no_action" };
    default:
      return { type: "attack", dmg: 6 };
  }
}
