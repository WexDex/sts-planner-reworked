import type {
  Enemy,
  EnemyIntentAction,
  EnemyIntentActionStatus,
  PlayerData,
} from "@/app/types/gameTypes";
import { ENEMY_INTENT_ACTION_GLYPH } from "@/app/utils/enemyIntentGlyphs";
import { getSingleAttackDamage } from "@/app/utils/enemyIntentActionHelpers";
import { entityHasIntangible, findIntangibleBuff } from "@/app/utils/intangibleBuff";

/** STS-style: Vulnerable on you → +50% damage taken from enemy hits. */
const INCOMING_VULNERABLE_MULT = 1.5;
/** Weak on the attacker → 25% less damage dealt. */
const INCOMING_ATTACKER_WEAK_MULT = 0.75;

export interface IncomingDamageContext {
  playerVulnerable: boolean;
  enemyWeak: boolean;
  /** Each attack / hit deals at most 1 (0-damage hits stay 0). */
  playerIntangible: boolean;
  /** Stacks on Intangible buff (turns remaining), when applicable. */
  playerIntangibleTurns?: number;
}

export function playerHasVulnerableForIncoming(player: PlayerData | undefined | null): boolean {
  if (!player?.buffsDebuffs?.length) return false;
  return player.buffsDebuffs.some((b) => b.type === "debuff" && /vulnerable/i.test(b.name.trim()));
}

export function enemyHasWeakForIncoming(enemy: Pick<Enemy, "buffsDebuffs">): boolean {
  if (!enemy.buffsDebuffs?.length) return false;
  return enemy.buffsDebuffs.some(
    (b) => b.type === "debuff" && /^(weak|weakened)$/i.test(b.name.trim()),
  );
}

export function buildIncomingDamageContext(
  player: PlayerData | undefined | null,
  enemy: Pick<Enemy, "buffsDebuffs">,
): IncomingDamageContext {
  const ib = findIntangibleBuff(player?.buffsDebuffs);
  const turns = ib && ib.stacks > 0 ? ib.stacks : undefined;
  return {
    playerVulnerable: playerHasVulnerableForIncoming(player),
    enemyWeak: enemyHasWeakForIncoming(enemy),
    playerIntangible: entityHasIntangible(player?.buffsDebuffs),
    playerIntangibleTurns: turns,
  };
}

/** Defeated enemies do not act; no incoming attack damage for their intents. */
export function isEnemyActiveForIntents(enemy: Pick<Enemy, "hp">): boolean {
  return enemy.hp > 0;
}

/** Damage you would take after Vulnerable (you) and Weak (them). */
export function applyIncomingEnemyAttackDamage(
  baseDamage: number,
  ctx: IncomingDamageContext,
): number {
  let d = baseDamage;
  if (ctx.enemyWeak) d *= INCOMING_ATTACKER_WEAK_MULT;
  if (ctx.playerVulnerable) d *= INCOMING_VULNERABLE_MULT;
  if (ctx.playerIntangible) d = Math.min(d, 1);
  return Math.floor(d);
}

export function describeIncomingModifiers(ctx: IncomingDamageContext): string {
  const bits: string[] = [];
  if (ctx.playerVulnerable) bits.push("You: Vulnerable (+50% damage taken)");
  if (ctx.enemyWeak) bits.push("Attacker: Weak (−25% damage dealt)");
  if (ctx.playerIntangible) {
    const n = ctx.playerIntangibleTurns ?? 1;
    bits.push(
      `You: Intangible (${n} turn${n !== 1 ? "s" : ""} left — damage reduced to 1 per hit)`,
    );
  }
  return bits.join(" · ");
}

function debuffStacksLabel(value: number | undefined): string {
  const v = value ?? 1;
  return v === 1 ? "" : ` ${v}`;
}

function statusLocationShort(loc: EnemyIntentActionStatus["location"]): string {
  const zone = loc ?? "hand";
  if (zone === "hand") return "hand";
  if (zone === "draw") return "draw";
  return "discard";
}

function pushUnknown(parts: string[], action: EnemyIntentAction) {
  parts.push(`? ${JSON.stringify(action)}`);
}

/** Builds intent text segments using the same rules as the timeline planner. */
export function formatIntentActionParts(actions: EnemyIntentAction[] | undefined): string[] {
  const g = ENEMY_INTENT_ACTION_GLYPH;
  const parts: string[] = [];
  for (const action of actions ?? []) {
    switch (action.type) {
      case "attack": {
        const d = getSingleAttackDamage(action);
        parts.push(`${g.attack} ${d}`);
        break;
      }
      case "multi_attack":
        parts.push(`${g.multi_attack} ${action.dmg}×${action.count}`);
        break;
      case "block":
        parts.push(`${g.block} ${action.amount}`);
        break;
      case "debuff":
        parts.push(`${g.debuff} ${action.effect}${debuffStacksLabel(action.value)}`);
        break;
      case "status":
        parts.push(
          `${g.status} ${action.effect}×${action.value} · ${statusLocationShort(action.location)}`,
        );
        break;
      case "buff":
        parts.push(`${g.buff} ${action.effect} ${action.value}`);
        break;
      case "cowardly":
        parts.push(`${g.cowardly} Escape`);
        break;
      case "stunned":
        parts.push(`${g.stunned} Stunned ${action.value}`);
        break;
      case "no_action":
        parts.push(`${g.no_action} No action`);
        break;
      default:
        pushUnknown(parts, action as EnemyIntentAction);
    }
  }
  return parts;
}

export function formatIntentActionsLine(actions: EnemyIntentAction[] | undefined): string {
  return formatIntentActionParts(actions).join(" · ");
}

/** Like {@link formatIntentActionsLine} but adjusts attack values for incoming damage; shows base in parens when modified. */
export function formatIntentActionsLineIncoming(
  actions: EnemyIntentAction[] | undefined,
  ctx: IncomingDamageContext,
): string {
  const g = ENEMY_INTENT_ACTION_GLYPH;
  const parts: string[] = [];
  for (const action of actions ?? []) {
    switch (action.type) {
      case "attack": {
        const base = getSingleAttackDamage(action);
        const mod = applyIncomingEnemyAttackDamage(base, ctx);
        parts.push(mod !== base ? `${g.attack} ${mod} (${base})` : `${g.attack} ${base}`);
        break;
      }
      case "multi_attack": {
        const per = applyIncomingEnemyAttackDamage(action.dmg, ctx);
        const showsDetail = per !== action.dmg;
        parts.push(
          showsDetail
            ? `${g.multi_attack} ${per}×${action.count} (${action.dmg}×${action.count})`
            : `${g.multi_attack} ${action.dmg}×${action.count}`,
        );
        break;
      }
      case "block":
        parts.push(`${g.block} ${action.amount}`);
        break;
      case "debuff":
        parts.push(`${g.debuff} ${action.effect}${debuffStacksLabel(action.value)}`);
        break;
      case "status":
        parts.push(
          `${g.status} ${action.effect}×${action.value} · ${statusLocationShort(action.location)}`,
        );
        break;
      case "buff":
        parts.push(`${g.buff} ${action.effect} ${action.value}`);
        break;
      case "cowardly":
        parts.push(`${g.cowardly} Escape`);
        break;
      case "stunned":
        parts.push(`${g.stunned} Stunned ${action.value}`);
        break;
      case "no_action":
        parts.push(`${g.no_action} No action`);
        break;
      default:
        pushUnknown(parts, action as EnemyIntentAction);
    }
  }
  return parts.join(" · ");
}

export function sumAttackDamageFromActions(actions: EnemyIntentAction[] | undefined): number {
  let damage = 0;
  for (const action of actions ?? []) {
    if (action.type === "attack") {
      damage += getSingleAttackDamage(action);
    }
    if (action.type === "multi_attack") {
      damage += action.dmg * action.count;
    }
  }
  return damage;
}

/** Sum of attack damage you would take after Vulnerable / attacker Weak. */
export function sumIncomingAttackDamageFromActions(
  actions: EnemyIntentAction[] | undefined,
  ctx: IncomingDamageContext,
): number {
  let damage = 0;
  for (const action of actions ?? []) {
    if (action.type === "attack") {
      damage += applyIncomingEnemyAttackDamage(getSingleAttackDamage(action), ctx);
    }
    if (action.type === "multi_attack") {
      for (let i = 0; i < action.count; i++) {
        damage += applyIncomingEnemyAttackDamage(action.dmg, ctx);
      }
    }
  }
  return damage;
}
