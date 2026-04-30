import type { Card } from "@/app/types/gameTypes";
import type { GalleryGlyph } from "@/app/card-design-gallery/galleryStsGlyphs";
import {
  blockMultihitInlineHitLabel,
  cardSelfExhaustsOnPlay,
  damageMultihitInlineHitLabel,
  energyGainNode,
  galleryBlockRowIsConditional,
  galleryDamageIsConditional,
  galleryDamageRowIsAoE,
  galleryDrawIsConditional,
  galleryTieredBoolActive,
  galleryTierNumber,
  inferGalleryCardEffects,
  orbInteractionEntries,
  resolveOrbCatalogKey,
} from "@/app/card-design-gallery/galleryStsGlyphs";

function isConditionedEnergyGain(card: Card): boolean {
  const eg = energyGainNode(card);
  return (
    eg !== null &&
    typeof eg === "object" &&
    !Array.isArray(eg) &&
    (eg as Record<string, unknown>).conditioned === true
  );
}

function bonusDamageIsConditional(card: Card): boolean {
  const b = (card as Record<string, unknown>).bonusDamage;
  return (
    b != null &&
    typeof b === "object" &&
    !Array.isArray(b) &&
    (b as Record<string, unknown>).conditioned === true
  );
}

function bonusBlockIsConditional(card: Card): boolean {
  const b = (card as Record<string, unknown>).bonusBlock;
  return (
    b != null &&
    typeof b === "object" &&
    !Array.isArray(b) &&
    (b as Record<string, unknown>).conditioned === true
  );
}

function mapCatalogToLegendId(catalogKey: string): string {
  if (catalogKey === "DRAW_ICON") return "stat-draw";
  if (catalogKey === "HP_COST") return "stat-hpcost";
  if (catalogKey === "POISON_STAT") return "stat-poison";
  return catalogKey;
}

function addOrbLegendKeys(card: Card, ids: Set<string>): void {
  const c = card as Record<string, unknown>;
  for (const entry of orbInteractionEntries(c)) {
    const e = entry;
    let verb = String(e.verb ?? "").toLowerCase();
    if (!verb && (e.orbtype != null || e.orbType != null || e.amount != null)) {
      verb = "channel";
    }
    ids.add(resolveOrbCatalogKey(e, verb));
    if (/^evoke/i.test(verb)) ids.add("EVOKE_ICON");
  }
}

function addDiscardLegendKeys(card: Card, ids: Set<string>): void {
  const d = (card as Record<string, unknown>).discardEffect as
    | { randomTarget?: boolean; random?: boolean }
    | undefined;
  if (!d || typeof d !== "object" || Array.isArray(d)) return;
  ids.add("DISCARD_ICON");
  if (d.randomTarget === true || d.random === true) ids.add("RANDOM_ICON");
}

function addGlyphLegendHints(card: Card, glyphs: GalleryGlyph[], ids: Set<string>): void {
  for (const g of glyphs) {
    if (g.catalogKey) ids.add(mapCatalogToLegendId(g.catalogKey));

    switch (g.id) {
      case "kw-innate":
        ids.add("KEY_INNATE");
        break;
      case "kw-ethereal":
        ids.add("KEY_ETHEREAL");
        break;
      case "kw-retain":
        ids.add("KEY_RETAIN");
        break;
      case "multi-hit":
      case "structured-multihit":
        ids.add("AOE_DAMAGE");
        break;
      case "structured-aoe-dmg":
      case "damage-combo":
        if (galleryDamageRowIsAoE(card)) ids.add("AOE_ICON");
        break;
      case "bonus-damage":
        ids.add("stat-damage");
        break;
      case "bonus-block":
        ids.add("stat-block");
        break;
      case "block-combo":
        ids.add("stat-block");
        break;
      case "discard-random":
      case "structured-random-discard":
        ids.add("DISCARD_ICON");
        ids.add("RANDOM_ICON");
        break;
      case "discard-fixed":
      case "structured-discard-n":
        ids.add("DISCARD_ICON");
        break;
      case "debuff-weak":
        ids.add("stat-weak");
        break;
      case "debuff-vulnerable":
        ids.add("stat-vulnerable");
        break;
      case "debuff-poison":
        ids.add("stat-poison");
        break;
      case "cost-manip":
        ids.add("COST_MANIP");
        break;
      case "upgrade-cards":
        ids.add("UPGRADE_CARD");
        break;
      case "can-add-cards":
        ids.add("CAN_ADD_CARDS");
        break;
      case "add-card":
        ids.add("ADD_CARD");
        break;
      case "scry":
      case "scry-n":
        ids.add("SCRY_ICON");
        break;
      case "debuff-losestrength":
        ids.add("LOSE_STRENGTH");
        break;
      case "hp-cost":
      case "hp-cost-n":
        ids.add("stat-hpcost");
        break;
      default:
        break;
    }
  }
}

/**
 * Legend chip ids (`stat-*` and STS catalog keys) that apply to this card at its
 * current upgrade tier — aligned with gallery inference and stat suppression.
 */
export function computeLegendHighlightIds(card: Card): Set<string> {
  const ids = new Set<string>();
  const { glyphs, suppressStats } = inferGalleryCardEffects(card);
  const c = card as Record<string, unknown>;

  if (card.damage !== undefined && !suppressStats.damage) ids.add("stat-damage");
  if (card.block !== undefined && !suppressStats.block) ids.add("stat-block");
  if (card.blockOnExhaust !== undefined) ids.add("stat-block");
  if (card.draw !== undefined) ids.add("stat-draw");
  /** Suppression hides duplicate stat row when energy is in a glyph cluster; legend should still match the visible icon. */
  if (energyGainNode(card) != null) {
    ids.add("stat-energygain");
  }
  if (c.heal != null && !suppressStats.heal) ids.add("stat-heal");
  if (c.focus != null && !suppressStats.focus) ids.add("stat-focus");
  const hpCostNode = c.hpcost ?? c.hpCost;
  if (hpCostNode != null && !suppressStats.hpcost) ids.add("stat-hpcost");
  if (c.weak != null && galleryTierNumber(card, c.weak) != null) ids.add("stat-weak");
  if (card.vulnerable != null && galleryTierNumber(card, card.vulnerable) != null) {
    ids.add("stat-vulnerable");
  }

  const applies = c.appliesDebuffs as Record<string, unknown> | undefined;
  if (applies && typeof applies === "object" && applies.poison != null) {
    ids.add("stat-poison");
  }

  if (galleryTieredBoolActive(card, c.innate ?? c.Innate)) ids.add("KEY_INNATE");
  if (galleryTieredBoolActive(card, c.ethereal ?? c.Ethereal)) ids.add("KEY_ETHEREAL");
  if (galleryTieredBoolActive(card, c.retain ?? c.Retain)) ids.add("KEY_RETAIN");
  if (galleryTieredBoolActive(card, c.unplayable ?? c.Unplayable)) ids.add("KEY_UNPLAYABLE");

  if (c.costManipulation === true) ids.add("COST_MANIP");
  if (c.canUpgradeCards === true) ids.add("UPGRADE_CARD");
  if (galleryTieredBoolActive(card, c.canAddCards)) ids.add("CAN_ADD_CARDS");

  if (cardSelfExhaustsOnPlay(card)) ids.add("EXHAUST_SELF");

  addDiscardLegendKeys(card, ids);
  addOrbLegendKeys(card, ids);
  addGlyphLegendHints(card, glyphs, ids);

  if (damageMultihitInlineHitLabel(card) != null) ids.add("AOE_DAMAGE");
  if (blockMultihitInlineHitLabel(card) != null) ids.add("AOE_DAMAGE");

  if (
    galleryDamageRowIsAoE(card) &&
    card.damage !== undefined &&
    !suppressStats.damage
  ) {
    ids.add("AOE_ICON");
  }

  if (
    galleryDamageIsConditional(card) ||
    galleryDrawIsConditional(card) ||
    galleryBlockRowIsConditional(card) ||
    isConditionedEnergyGain(card) ||
    bonusDamageIsConditional(card) ||
    bonusBlockIsConditional(card)
  ) {
    ids.add("CONDITIONAL_MARKER");
  }

  return ids;
}
