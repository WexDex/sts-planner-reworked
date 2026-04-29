import type { BuffDebuff, CombatData, Enemy } from '@/app/types/gameTypes';

export const INTANGIBLE_BUFF_NAME = 'Intangible';
export const INTANGIBLE_BUFF_DESCRIPTION =
  'Turns remaining — each incoming hit deals at most 1 HP while stacks last (ticks down when you end Main → Enemy; enemies tick when the enemy phase ends).';

export function findIntangibleBuff(
  buffs: BuffDebuff[] | undefined,
): BuffDebuff | undefined {
  if (!buffs?.length) return undefined;
  return buffs.find(
    (b) =>
      b.type === 'buff' &&
      b.name.trim().toLowerCase() === INTANGIBLE_BUFF_NAME.toLowerCase(),
  );
}

export function entityHasIntangible(buffs: BuffDebuff[] | undefined): boolean {
  const b = findIntangibleBuff(buffs);
  return !!b && b.stacks > 0;
}

/** Decrement Intangible stacks by 1; remove entry when stacks hit 0. */
export function decrementIntangibleStacks(
  buffs: BuffDebuff[] | undefined,
): BuffDebuff[] | undefined {
  if (!buffs?.length) return buffs;
  const idx = buffs.findIndex(
    (b) =>
      b.type === 'buff' &&
      b.name.trim().toLowerCase() === INTANGIBLE_BUFF_NAME.toLowerCase(),
  );
  if (idx < 0) return buffs;
  const cur = buffs[idx];
  if (cur.stacks <= 1) {
    return buffs.filter((_, i) => i !== idx);
  }
  const next = [...buffs];
  next[idx] = { ...cur, stacks: cur.stacks - 1 };
  return next;
}

/** Stable sort: Intangible first, then name. */
export function sortBuffsForDisplay(list: BuffDebuff[]): BuffDebuff[] {
  return [...list].sort((a, b) => {
    const aI =
      a.name.trim().toLowerCase() === INTANGIBLE_BUFF_NAME.toLowerCase() ? 0 : 1;
    const bI =
      b.name.trim().toLowerCase() === INTANGIBLE_BUFF_NAME.toLowerCase() ? 0 : 1;
    if (aI !== bI) return aI - bI;
    return a.name.localeCompare(b.name);
  });
}

/** Older saves used `intangible` booleans; merge into stack buff and strip flags. */
export function migrateLegacyIntangibleFields(data: CombatData): CombatData {
  const rawPlayer = data.player as CombatData['player'] & { intangible?: boolean };
  const player = { ...rawPlayer };
  let playerBuffs = [...(player.buffsDebuffs ?? [])];
  if (player.intangible === true && !entityHasIntangible(playerBuffs)) {
    playerBuffs.push({
      name: INTANGIBLE_BUFF_NAME,
      stacks: 1,
      type: 'buff',
      description: INTANGIBLE_BUFF_DESCRIPTION,
    });
  }
  delete (player as { intangible?: boolean }).intangible;
  player.buffsDebuffs = playerBuffs.length > 0 ? playerBuffs : undefined;

  const enemies = data.enemies?.map((enemy) => {
    const e = { ...enemy } as Enemy & { intangible?: boolean };
    let eb = [...(e.buffsDebuffs ?? [])];
    if (e.intangible === true && !entityHasIntangible(eb)) {
      eb.push({
        name: INTANGIBLE_BUFF_NAME,
        stacks: 1,
        type: 'buff',
        description: INTANGIBLE_BUFF_DESCRIPTION,
      });
    }
    delete e.intangible;
    e.buffsDebuffs = eb.length > 0 ? eb : undefined;
    return e;
  });

  return {
    ...data,
    player,
    enemies,
  };
}
