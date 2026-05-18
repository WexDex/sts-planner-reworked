import type { Card, CombatData, Enemy, PlayerData } from '@/app/types/gameTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStack(buffs: PlayerData['buffsDebuffs'], name: string): number {
  return buffs?.find((b) => b.name === name)?.stacks ?? 0;
}

function resolveNumeric(
  v: Card['damage'] | Card['block'] | Card['cost'],
  isUpgraded = false,
): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (isUpgraded && v.upgraded !== undefined) return v.upgraded;
  return v.base ?? 0;
}

// ---------------------------------------------------------------------------
// Damage formula
// floor( floor( floor(base + STR) × stance ) × weak ) × vuln
// stance multiplier only applies when scalesWithStrength is true
// ---------------------------------------------------------------------------

export function computeDamage(
  base: number,
  scalesWithStrength: boolean,
  player: PlayerData,
  targetEnemy: Enemy | null,
  stance: CombatData['stance'],
): number {
  const str = scalesWithStrength ? getStack(player.buffsDebuffs, 'Strength') : 0;
  const withStr = Math.floor(base + str);

  const stanceMult = scalesWithStrength
    ? (stance === 'wrath' ? 2 : stance === 'divinity' ? 3 : 1)
    : 1;
  const withStance = Math.floor(withStr * stanceMult);

  const weakStacks = getStack(player.buffsDebuffs, 'Weak');
  const weakMult = weakStacks > 0 ? 0.75 : 1;
  const withWeak = Math.floor(withStance * weakMult);

  const vulnStacks = targetEnemy ? getStack(targetEnemy.buffsDebuffs, 'Vulnerable') : 0;
  const vulnMult = vulnStacks > 0 ? 1.5 : 1;
  return Math.floor(withWeak * vulnMult);
}

// ---------------------------------------------------------------------------
// Block formula
// floor( (base + DEX) × frail )
// Frail only penalises block that can scale with Dexterity (e.g. not Impervious).
// ---------------------------------------------------------------------------

export function computeBlock(
  base: number,
  scalesWithDexterity: boolean,
  player: PlayerData,
): number {
  const dex = scalesWithDexterity ? getStack(player.buffsDebuffs, 'Dexterity') : 0;
  const frailStacks = scalesWithDexterity ? getStack(player.buffsDebuffs, 'Frail') : 0;
  return Math.floor((base + dex) * (frailStacks > 0 ? 0.75 : 1));
}

// ---------------------------------------------------------------------------
// Per-card hit breakdown
// ---------------------------------------------------------------------------

export interface HitBreakdown {
  /** Base damage per hit (after formula). */
  perHit: number;
  /** Number of hits. */
  hits: number;
  /** perHit × hits */
  total: number;
}

export interface CardPlayResult {
  card: Card;
  /** Damage dealt per targeted enemy index. */
  damageByTarget: Record<number, HitBreakdown>;
  /** Block gained. */
  block: number;
  /** Self HP change (negative = self-damage). */
  selfHpDelta: number;
  /** Energy cost of the card (resolved numeric). */
  energyCost: number;
}

// ---------------------------------------------------------------------------
// Full play summary
// ---------------------------------------------------------------------------

export interface PlaySummary {
  cards: CardPlayResult[];
  /** Total damage per enemy index (sum across all cards). */
  totalDamageByTarget: Record<number, number>;
  /** Total block gained across all cards. */
  totalBlock: number;
  /** Total energy cost. */
  totalEnergyCost: number;
  /** Enemy indices where total damage ≥ remaining HP (kill). */
  kills: number[];
  /** Cumulative self HP delta. */
  selfHpDelta: number;
  /** Projected player HP after self-damage (does not include enemy attacks). */
  projectedPlayerHp: number;
}

export interface IncomingEnemyHit {
  enemy: Enemy;
  enemyIndex: number;
  /** Raw incoming damage from this enemy's attack intents this turn. */
  rawDamage: number;
  /** Damage after applying full formula (Strength, Weak, Vulnerable, Intangible). */
  effectiveDamage: number;
  /** Active modifiers that altered effectiveDamage vs rawDamage. */
  mods: {
    enemyStr: number;
    enemyWeak: boolean;
    playerVulnerable: boolean;
    playerIntangible: boolean;
  };
}

export interface IncomingPreview {
  hits: IncomingEnemyHit[];
  /** Block available at start of enemy phase (post-play). */
  blockPool: number;
  /** Final projected HP after all enemy hits (post-block). */
  finalHp: number;
  /** True if finalHp ≤ 0. */
  lethal: boolean;
}

export function computePlaySummary(
  selectedCards: Card[],
  gameState: CombatData,
  targetEnemyIndices: number[],
): PlaySummary {
  const { player, enemies = [], stance } = gameState;
  const targetEnemies = targetEnemyIndices.map((i) => enemies[i] ?? null);

  const cardResults: CardPlayResult[] = [];
  const totalDamageByTarget: Record<number, number> = {};

  for (const card of selectedCards) {
    const upgraded = card.isUpgraded ?? false;
    const damageBase = resolveNumeric(card.damage, upgraded);
    const blockBase = resolveNumeric(card.block, upgraded);
    const costBase = card.xCost ? 0 : resolveNumeric(card.cost, upgraded);
    const hitCount = card.hitCount ?? 1;

    const damageByTarget: Record<number, HitBreakdown> = {};

    if (damageBase > 0) {
      for (let ti = 0; ti < targetEnemyIndices.length; ti++) {
        const enemyIdx = targetEnemyIndices[ti];
        const enemy = targetEnemies[ti];
        const enemyIntangible = enemy ? getStack(enemy.buffsDebuffs, 'Intangible') > 0 : false;
        const perHit = enemyIntangible ? 1 : computeDamage(damageBase, card.scalesWithStrength ?? false, player, enemy, stance);
        const total = perHit * hitCount;
        damageByTarget[enemyIdx] = { perHit, hits: hitCount, total };
        totalDamageByTarget[enemyIdx] = (totalDamageByTarget[enemyIdx] ?? 0) + total;
      }
    }

    const blockGained = blockBase > 0
      ? computeBlock(blockBase, card.scalesWithDexterity ?? false, player)
      : 0;

    cardResults.push({
      card,
      damageByTarget,
      block: blockGained,
      selfHpDelta: 0,
      energyCost: costBase,
    });
  }

  const totalBlock = cardResults.reduce((s, r) => s + r.block, 0);
  const totalEnergyCost = cardResults.reduce((s, r) => s + r.energyCost, 0);
  const selfHpDelta = cardResults.reduce((s, r) => s + r.selfHpDelta, 0);
  const projectedPlayerHp = (player.hp ?? 0) + selfHpDelta;

  const kills: number[] = [];
  for (const [idxStr, totalDmg] of Object.entries(totalDamageByTarget)) {
    const i = Number(idxStr);
    const enemy = enemies[i];
    if (enemy && totalDmg >= (enemy.hp ?? 0)) kills.push(i);
  }

  return {
    cards: cardResults,
    totalDamageByTarget,
    totalBlock,
    totalEnergyCost,
    kills,
    selfHpDelta,
    projectedPlayerHp,
  };
}

// ---------------------------------------------------------------------------
// Enemy incoming preview
//
// Formula per hit:
//   rawPerHit = action dmg (per hit for multi_attack)
//   withStr   = floor(rawPerHit + enemyStr)
//   withWeak  = floor(withStr × 0.75)  if enemy has Weak, else withStr
//   withVuln  = floor(withWeak × 1.5)  if player has Vulnerable, else withWeak
//   final     = 1                       if player has Intangible, else withVuln
// ---------------------------------------------------------------------------

export function computeIncomingPreview(
  gameState: CombatData,
  postPlayBlock: number,
  currentTurnId: number,
): IncomingPreview {
  const { player, enemies = [] } = gameState;

  const playerVulnerable = getStack(player.buffsDebuffs, 'Vulnerable') > 0;
  const playerIntangible = getStack(player.buffsDebuffs, 'Intangible') > 0;

  const hits: IncomingEnemyHit[] = [];

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const intent = enemy.intents?.find((it) => it.turn === currentTurnId);
    if (!intent) continue;

    const enemyStr = getStack(enemy.buffsDebuffs, 'Strength');
    const enemyWeak = getStack(enemy.buffsDebuffs, 'Weak') > 0;
    const weakMult = enemyWeak ? 0.75 : 1;
    const vulnMult = playerVulnerable ? 1.5 : 1;

    let rawTotal = 0;
    let effectiveTotal = 0;

    for (const action of intent.actions) {
      if (action.type === 'attack') {
        const base = action.dmg ?? action.value ?? 0;
        rawTotal += base;
        if (playerIntangible) {
          effectiveTotal += 1;
        } else {
          const withStr = Math.floor(base + enemyStr);
          const withWeak = Math.floor(withStr * weakMult);
          effectiveTotal += Math.floor(withWeak * vulnMult);
        }
      } else if (action.type === 'multi_attack') {
        const base = action.dmg ?? 0;
        const count = action.count ?? 1;
        rawTotal += base * count;
        if (playerIntangible) {
          effectiveTotal += count; // 1 per hit
        } else {
          const perHit = Math.floor(Math.floor(Math.floor(base + enemyStr) * weakMult) * vulnMult);
          effectiveTotal += perHit * count;
        }
      }
    }

    if (rawTotal === 0) continue;

    hits.push({
      enemy,
      enemyIndex: i,
      rawDamage: rawTotal,
      effectiveDamage: effectiveTotal,
      mods: { enemyStr, enemyWeak, playerVulnerable, playerIntangible },
    });
  }

  let blockPool = postPlayBlock;
  let hp = player.hp ?? 0;

  for (const hit of hits) {
    const netDamage = Math.max(0, hit.effectiveDamage - blockPool);
    blockPool = Math.max(0, blockPool - hit.effectiveDamage);
    hp -= netDamage;
  }

  return {
    hits,
    blockPool: postPlayBlock,
    finalHp: hp,
    lethal: hp <= 0,
  };
}
