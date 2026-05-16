export { getFormattedDescription, tieredNumeric } from "./descriptionPlaceholders";

const weakMultiplier = 0.75;
const vulnerableMultiplier = 1.5;
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

/**
 * Hover tip for damage on cards.
 * Attack: full STS-style breakdown (weak reduces dealt ↓, vuln increases damage taken ↑).
 * Other types with a damage field (e.g. powers): base DMG only.
 */
export function formatDamageStatTitle(
  baseDamage: number | undefined,
  cardType: string | undefined,
): string | undefined {
  if (baseDamage === undefined) return undefined;
  if (cardType !== "Attack") return `DMG ${baseDamage}`;
  const s = getDamageStats(baseDamage);
  if (!s) return `DMG ${baseDamage}`;
  return `DMG ${s.dmg} · WEAK ${s.weak} ↓ · VULN ${s.vulnerable} ↑ · BOTH ${s.both}`;
}

/** Attack / skill: block and frail-adjusted block. Powers: block only. */
export function formatBlockStatTitle(
  baseBlock: number | undefined,
  cardType: string | undefined,
): string | undefined {
  if (baseBlock === undefined) return undefined;
  if (cardType === "Attack" || cardType === "Skill") {
    const s = getBlockStats(baseBlock);
    if (!s) return String(baseBlock);
    return `BLOCK ${s.block} · FRAIL ${s.frail}`;
  }
  return String(baseBlock);
}
