import type { Card, ValueNode } from "../types/gameTypes";

const weakMultiplier = 0.75;
const vulnerableMultiplier = 1.75;
const frailMultiplier = 0.75;

export function getDamageStats(dmg: number | undefined) {
  if (!dmg) return null;
  return {
    dmg,
    weak: Math.floor(dmg * weakMultiplier),
    vulnerable: Math.floor(dmg * vulnerableMultiplier),
    both: Math.floor(dmg * weakMultiplier * vulnerableMultiplier),
  };
}

export function getBlockStats(block: number | undefined) {
  if (!block) return null;
  return {
    block,
    frail: Math.floor(block * frailMultiplier),
  };
}

export function getFormattedDescription(desc: string, card: Card) {
  function getValue(field?: ValueNode) {
    if (!field) return 0;

    // Handle ValueNode type
    if (typeof field === 'number') {
      return field;
    }

    // if upgraded and upgraded value exists → use it
    if (card.isUpgraded && field.upgraded !== undefined) {
      return field.upgraded;
    }

    // otherwise fallback to base (or upgraded if base missing)
    if (field.base !== undefined) return field.base;
    if (field.upgraded !== undefined) return field.upgraded;

    return 0;
  }

  const replacements: Record<string, number> = {
    "[DMG]": getValue(card.damage),
    "[BLOCK]": getValue(card.block),
    "[DRAW]": getValue(card.draw),
    "[COST]": getValue(card.cost),
    "[VULN]": getValue(card.vulnerable),
    "[TAKEDMG]": getValue(card.takeDamage),
    "[GAINE]": getValue(card.energyGain),
  };

  let result = desc;

  for (const key in replacements) {
    result = result.replaceAll(key, String(replacements[key]));
  }

  return result;
}
