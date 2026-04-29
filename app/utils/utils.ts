export { getFormattedDescription, tieredNumeric } from "./descriptionPlaceholders";

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
