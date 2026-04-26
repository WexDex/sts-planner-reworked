import type { Enemy, EnemyIntentAction, PlayerData } from "@/app/types/gameTypes";

/** STS-style: Vulnerable on you → +50% damage taken from enemy hits. */
const INCOMING_VULNERABLE_MULT = 1.5;
/** Weak on the attacker → 25% less damage dealt. */
const INCOMING_ATTACKER_WEAK_MULT = 0.75;

export interface IncomingDamageContext {
  playerVulnerable: boolean;
  enemyWeak: boolean;
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
  return {
    playerVulnerable: playerHasVulnerableForIncoming(player),
    enemyWeak: enemyHasWeakForIncoming(enemy),
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
  return Math.floor(d);
}

export function describeIncomingModifiers(ctx: IncomingDamageContext): string {
  const bits: string[] = [];
  if (ctx.playerVulnerable) bits.push("You: Vulnerable (+50% damage taken)");
  if (ctx.enemyWeak) bits.push("Attacker: Weak (−25% damage dealt)");
  return bits.join(" · ");
}

/** Builds intent text segments using the same rules as the timeline planner (attack / debuff / status / buff). */
export function formatIntentActionParts(actions: EnemyIntentAction[] | undefined): string[] {
  const parts: string[] = [];
  for (const action of actions ?? []) {
    if (action.type === "attack") {
      parts.push(`⚔️ ${action.value}`);
    }
    if (action.type === "debuff" || action.type === "status") {
      parts.push(`❗ ${action.effect}${action.value ? ` ${action.value}` : ""}`);
    }
    if (action.type === "buff") {
      parts.push(`📈 ${action.effect}${action.value ? ` ${action.value}` : ""}`);
    }
  }
  return parts;
}

export function formatIntentActionsLine(actions: EnemyIntentAction[] | undefined): string {
  return formatIntentActionParts(actions).join(" · ");
}

/** Like {@link formatIntentActionsLine} but adjusts ⚔️ attack values for incoming damage; shows base in parens when modified. */
export function formatIntentActionsLineIncoming(
  actions: EnemyIntentAction[] | undefined,
  ctx: IncomingDamageContext,
): string {
  const parts: string[] = [];
  for (const action of actions ?? []) {
    if (action.type === "attack") {
      const base = action.value ?? 0;
      const mod = applyIncomingEnemyAttackDamage(base, ctx);
      parts.push(mod !== base ? `⚔️ ${mod} (${base})` : `⚔️ ${base}`);
    }
    if (action.type === "debuff" || action.type === "status") {
      parts.push(`❗ ${action.effect}${action.value ? ` ${action.value}` : ""}`);
    }
    if (action.type === "buff") {
      parts.push(`📈 ${action.effect}${action.value ? ` ${action.value}` : ""}`);
    }
  }
  return parts.join(" · ");
}

export function sumAttackDamageFromActions(actions: EnemyIntentAction[] | undefined): number {
  let damage = 0;
  for (const action of actions ?? []) {
    if (action.type === "attack") {
      damage += action.value ?? 0;
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
      damage += applyIncomingEnemyAttackDamage(action.value ?? 0, ctx);
    }
  }
  return damage;
}
