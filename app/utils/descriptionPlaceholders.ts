import type { Card } from "@/app/types/gameTypes";
import rulesData from "@/app/data/description_placeholder_rules.json";

export type PlaceholderRuleConfig = {
  token: string;
  label: string;
  resolverType: "field" | "debuff" | "custom";
  fieldKey: string;
  customId?: string;
};

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


function debuffStacks(card: Card, kind: string): number {
  const c = card as Record<string, unknown>;
  const debuffs = c.appliesDebuffs as Record<string, unknown> | undefined;
  const nested = debuffs?.[kind];
  if (nested !== undefined) return tieredNumeric(card, nested);
  return tieredNumeric(card, c[kind]);
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

export function buildResolver(cfg: PlaceholderRuleConfig): (card: Card) => number {
  if (cfg.resolverType === "field")
    return (c) => tieredNumeric(c, (c as Record<string, unknown>)[cfg.fieldKey]);
  if (cfg.resolverType === "debuff")
    return (c) => debuffStacks(c, cfg.fieldKey);
  if (cfg.customId === "discard") return discardDisplayCount;
  if (cfg.customId === "hits") return multiHitCount;
  return () => 0;
}

type PlaceholderRule = {
  token: string;
  label: string;
  resolve: (card: Card) => number;
};

/** Longer tokens first so e.g. `[POISON]` is matched before `[PSN]`. */
export const DESCRIPTION_PLACEHOLDER_RULES: PlaceholderRule[] =
  [...(rulesData as PlaceholderRuleConfig[])]
    .sort((a, b) => b.token.length - a.token.length)
    .map((cfg) => ({ token: cfg.token, label: cfg.label, resolve: buildResolver(cfg) }));

export const DESCRIPTION_PLACEHOLDER_TOKENS: readonly string[] =
  DESCRIPTION_PLACEHOLDER_RULES.map((r) => r.token);

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
 * Fills bracket tokens in a card description (e.g. `[DMG]`, `[BLOCK]`).
 */
export function getFormattedDescription(description: string | undefined, card: Card): string {
  if (!description) return "";
  return applyDescriptionPlaceholders(description, card);
}
