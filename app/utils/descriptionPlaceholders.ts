import type { Card, ValueNode } from "@/app/types/gameTypes";

/**
 * Numeric tier from a plain number or `{ base, upgraded? }`, honoring {@link Card.isUpgraded}.
 */
export function tieredNumeric(card: Card, node: unknown): number {
  if (node === undefined || node === null) return 0;
  if (typeof node === "number" && !Number.isNaN(node)) return node;
  if (typeof node === "object" && !Array.isArray(node)) {
    const o = node as { base?: number; upgraded?: number };
    if (card.isUpgraded && o.upgraded !== undefined) return o.upgraded;
    if (o.base !== undefined) return o.base;
    if (o.upgraded !== undefined) return o.upgraded;
  }
  return 0;
}

function tieredField(card: Card, field?: ValueNode | null): number {
  return tieredNumeric(card, field);
}

function energyGainSource(card: Card): unknown {
  const c = card as Record<string, unknown>;
  return c.energyGain ?? c.gainEnergy;
}

function debuffStacks(card: Card, kind: string): number {
  const c = card as Record<string, unknown>;
  const debuffs = c.appliesDebuffs as Record<string, unknown> | undefined;
  const nested = debuffs?.[kind];
  if (nested !== undefined) return tieredNumeric(card, nested);
  return tieredNumeric(card, c[kind]);
}

/** `[W]` in STS: Mantra when `mantra` is present, otherwise Weak stacks. */
function weakOrMantraW(card: Card): number {
  const c = card as Record<string, unknown>;
  if (c.mantra !== undefined && c.mantra !== null) return tieredNumeric(card, c.mantra);
  return debuffStacks(card, "weak");
}

function discardDisplayCount(card: Card): number {
  const d = (card as Record<string, unknown>).discardEffect;
  if (!d || typeof d !== "object" || Array.isArray(d)) return 0;
  const n = tieredNumeric(card, d);
  return n > 0 ? n : 1;
}

function multiHitCount(card: Card): number {
  const c = card as Record<string, unknown>;
  const multi = c.multiHit;
  if (!multi || typeof multi !== "object" || Array.isArray(multi)) return 0;
  const mhRaw = (multi as { multiHitCount?: unknown }).multiHitCount;
  if (mhRaw === undefined) return 0;
  return tieredNumeric(card, mhRaw);
}

type PlaceholderRule = {
  token: string;
  /** Short note for docs / debugging */
  label: string;
  resolve: (card: Card) => number;
};

const PLACEHOLDER_RULES_UNSORTED: PlaceholderRule[] = [
  { token: "[DMG]", label: "Damage", resolve: (c) => tieredField(c, c.damage) },
  { token: "[BLOCK]", label: "Block", resolve: (c) => tieredField(c, c.block) },
  { token: "[B]", label: "Block (short)", resolve: (c) => tieredField(c, c.block) },
  { token: "[DRAW]", label: "Draw", resolve: (c) => tieredField(c, c.draw) },
  { token: "[COST]", label: "Cost", resolve: (c) => tieredField(c, c.cost) },
  { token: "[TAKEDMG]", label: "Lose HP / self-hit", resolve: (c) => tieredField(c, c.takeDamage) },
  { token: "[GAINE]", label: "Gain energy (explicit)", resolve: (c) => tieredNumeric(c, energyGainSource(c)) },
  { token: "[G]", label: "Gain energy (Ui shorthand)", resolve: (c) => tieredNumeric(c, energyGainSource(c)) },
  { token: "[R]", label: "Energy (STS red pip text)", resolve: (c) => tieredNumeric(c, energyGainSource(c)) },
  { token: "[VULN]", label: "Vulnerable stacks", resolve: (c) => debuffStacks(c, "vulnerable") },
  { token: "[WEAK]", label: "Weak stacks", resolve: (c) => debuffStacks(c, "weak") },
  { token: "[W]", label: "Mantra or Weak (see card.mantra)", resolve: weakOrMantraW },
  { token: "[MANTRA]", label: "Mantra stacks", resolve: (c) => tieredNumeric(c, (c as Record<string, unknown>).mantra) },
  { token: "[PSN]", label: "Poison stacks", resolve: (c) => debuffStacks(c, "poison") },
  { token: "[POISON]", label: "Poison stacks (long)", resolve: (c) => debuffStacks(c, "poison") },
  { token: "[WOUND]", label: "Wound stacks", resolve: (c) => debuffStacks(c, "wound") },
  { token: "[FRAIL]", label: "Frail stacks", resolve: (c) => debuffStacks(c, "frail") },
  { token: "[DISCARD]", label: "Discard count (discardEffect)", resolve: discardDisplayCount },
  { token: "[HITS]", label: "Multi-hit count", resolve: multiHitCount },
  { token: "[HEAL]", label: "Heal (optional card.heal)", resolve: (c) => tieredNumeric(c, (c as Record<string, unknown>).heal) },
  { token: "[STR]", label: "Strength (optional card.strength)", resolve: (c) => tieredNumeric(c, (c as Record<string, unknown>).strength) },
  { token: "[DEX]", label: "Dexterity (optional card.dexterity)", resolve: (c) => tieredNumeric(c, (c as Record<string, unknown>).dexterity) },
  { token: "[FOCUS]", label: "Focus (card.focus)", resolve: (c) => tieredNumeric(c, (c as Record<string, unknown>).focus) },
  { token: "[LOCK]", label: "Lock-On (optional appliesDebuffs.lockOn)", resolve: (c) => debuffStacks(c, "lockOn") },
  { token: "[ART]", label: "Artifact (optional card.artifact)", resolve: (c) => tieredNumeric(c, (c as Record<string, unknown>).artifact) },
];

/** Longer tokens first so e.g. `[WEAK]` is not broken by a hypothetical shorter prefix. */
export const DESCRIPTION_PLACEHOLDER_RULES: PlaceholderRule[] = [...PLACEHOLDER_RULES_UNSORTED].sort(
  (a, b) => b.token.length - a.token.length,
);

export const DESCRIPTION_PLACEHOLDER_TOKENS: readonly string[] = DESCRIPTION_PLACEHOLDER_RULES.map((r) => r.token);

/** Map token → substituted string for the given card. */
export function getDescriptionPlaceholderMap(card: Card): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of DESCRIPTION_PLACEHOLDER_RULES) {
    m.set(r.token, String(r.resolve(card)));
  }
  return m;
}

export function applyDescriptionPlaceholders(description: string, card: Card): string {
  let result = description;
  for (const r of DESCRIPTION_PLACEHOLDER_RULES) {
    result = result.replaceAll(r.token, String(r.resolve(card)));
  }
  return result;
}

/**
 * Fills bracket tokens in a card description (e.g. `[DMG]`, `[BLOCK]`, STS `[G]` / `[R]` / `[B]` / `[W]`).
 * Does not alter `X` cost wording; `[X]` is not a defined token.
 */
export function getFormattedDescription(description: string | undefined, card: Card): string {
  if (!description) return "";
  return applyDescriptionPlaceholders(description, card);
}
