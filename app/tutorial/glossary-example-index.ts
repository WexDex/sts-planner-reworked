import { inferGalleryCardEffects, STS_ICON_GLYPH } from "@/app/card-design-gallery/galleryStsGlyphs";
import { buildGameCardFromStsRaw } from "@/app/data/gameCardFromSts";
import { getStsCardsRecord, listStsCardIdsSorted } from "@/app/card-design-gallery/stsRecord";
import type { GalleryGlyph } from "@/app/card-design-gallery/galleryStsGlyphs";
import type { Card } from "@/app/types/gameTypes";
import { computeLegendHighlightIds } from "@/app/utils/legendHighlightFromCard";
import { EFFECT_TYPES_ALL, type EffectType } from "@/app/utils/effectDisplay";

/** Up to this many card ids are kept per glossary key (larger pool ⇒ better hover randomness). */
export const GLOSSARY_EXAMPLE_POOL_MAX = 48;
/** How many cards the preview rail shows at once. */
export const GLOSSARY_PREVIEW_DISPLAY_MAX = 2;

const LEGEND_STAT_TO_GLYPH_CATALOG: Record<string, string> = {
  "stat-draw": "DRAW_ICON",
  "stat-energygain": "GAIN_ENERGY_ICON",
  "stat-hpcost": "HP_COST",
  "stat-poison": "POISON_STAT",
};

const GLYPH_CATALOG_KEYS = new Set(Object.keys(STS_ICON_GLYPH));

function addExample(map: Map<string, Set<string>>, key: string, cardId: string): void {
  if (!GLYPH_CATALOG_KEYS.has(key)) return;
  let s = map.get(key);
  if (!s) {
    s = new Set();
    map.set(key, s);
  }
  if (s.size >= GLOSSARY_EXAMPLE_POOL_MAX) return;
  s.add(cardId);
}

function collectGlyphCatalogKeysForCard(
  card: Card,
  legendIds: Set<string>,
  glyphs: GalleryGlyph[],
): Set<string> {
  const keys = new Set<string>();
  for (const lid of legendIds) {
    if (GLYPH_CATALOG_KEYS.has(lid)) keys.add(lid);
    const mapped = LEGEND_STAT_TO_GLYPH_CATALOG[lid];
    if (mapped && GLYPH_CATALOG_KEYS.has(mapped)) keys.add(mapped);
  }
  for (const g of glyphs) {
    const ck = g.catalogKey;
    if (ck && GLYPH_CATALOG_KEYS.has(ck)) keys.add(ck);
  }
  return keys;
}

function describesGainStrength(card: Card): boolean {
  const d = String(card.description ?? "").toLowerCase();
  if (!/\bstrength\b/.test(d)) return false;
  if (/\blose\b/.test(d) && /\bstrength\b/.test(d) && !/\bgain\b/.test(d)) return false;
  if (/\benemy\b[^\n]{0,48}\blose\b[^\n]{0,24}\bstrength\b/.test(d)) return false;
  return /\bgain\b[^\n]{0,40}\bstrength\b|\bdouble your strength\b/.test(d);
}

function cardMatchesTutorialEffect(
  card: Card,
  raw: Record<string, unknown>,
  legendIds: Set<string>,
  effect: EffectType,
): boolean {
  const c = card as Record<string, unknown>;
  const applies = c.appliesDebuffs as Record<string, unknown> | undefined;

  switch (effect) {
    case "weak":
      return legendIds.has("stat-weak");
    case "vulnerable":
      return legendIds.has("stat-vulnerable");
    case "frail":
      return Boolean(applies?.frail) || /\bfrail\b/i.test(card.description ?? "");
    case "damage":
      return legendIds.has("stat-damage");
    case "block":
      return legendIds.has("stat-block");
    case "wound":
      if (String(card.name ?? "").trim().toLowerCase() === "wound") return true;
      return Boolean(applies?.wound);
    case "strength":
    case "strength_buff":
      return describesGainStrength(card);
    case "entangle":
      return /\bentangle\b/i.test(card.description ?? "") || /\bcannot play attacks\b/i.test(card.description ?? "");
    case "takedamage":
      return card.takeDamage != null;
    case "energygain":
      return legendIds.has("stat-energygain");
    case "draw":
      return legendIds.has("stat-draw");
    case "intangible":
      return /\bintangible\b/i.test(card.description ?? "");
    case "hp":
      return false;
    case "maxHp":
      return /\bmax hp\b/i.test(card.description ?? "");
    case "health":
      return legendIds.has("stat-heal");
    case "attack":
      return String(card.type ?? "").toLowerCase() === "attack" && card.damage != undefined;
    case "energy":
      return typeof raw.cost === "object" && raw.cost != null && !Array.isArray(raw.cost);
    case "heal":
      return legendIds.has("stat-heal");
    case "focus":
      return legendIds.has("stat-focus");
    case "poison":
      return legendIds.has("stat-poison");
    case "hpcost":
      return legendIds.has("stat-hpcost");
    default:
      return false;
  }
}

function mapToSortedRecord(map: Map<string, Set<string>>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const keys = [...map.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  for (const k of keys) {
    const ids = [...map.get(k)!].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    out[k] = ids;
  }
  return out;
}

export type GlossaryExampleIndex = {
  byGlyphCatalogKey: Record<string, string[]>;
  byEffectId: Record<string, string[]>;
};

export function buildGlossaryExampleIndex(): GlossaryExampleIndex {
  const byGlyph = new Map<string, Set<string>>();
  const byEffect = new Map<string, Set<string>>();

  const db = getStsCardsRecord();
  for (const id of listStsCardIdsSorted()) {
    const raw = db[id];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;

    const card = buildGameCardFromStsRaw(id, raw as Record<string, unknown>, {});
    const inferred = inferGalleryCardEffects(card);
    const legendIds = computeLegendHighlightIds(card, inferred);

    for (const ck of collectGlyphCatalogKeysForCard(card, legendIds, inferred.glyphs)) {
      addExample(byGlyph, ck, id);
    }

    for (const e of EFFECT_TYPES_ALL) {
      if (!cardMatchesTutorialEffect(card, raw as Record<string, unknown>, legendIds, e)) continue;
      let s = byEffect.get(e);
      if (!s) {
        s = new Set();
        byEffect.set(e, s);
      }
      if (s.size >= GLOSSARY_EXAMPLE_POOL_MAX) continue;
      s.add(id);
    }
  }

  return {
    byGlyphCatalogKey: mapToSortedRecord(byGlyph),
    byEffectId: mapToSortedRecord(byEffect),
  };
}
