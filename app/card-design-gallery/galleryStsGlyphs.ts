import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Ban,
  Bookmark,
  ChevronsUp,
  CircleDot,
  Cog,
  Coins,
  Copy,
  CreditCard,
  Crosshair,
  Droplets,
  FileText,
  FlaskConical,
  Ghost,
  HelpCircle,
  Layers,
  Library,
  Moon,
  Package,
  Plus,
  ScanSearch,
  Shield,
  ShieldCheck,
  Shuffle,
  Skull,
  Snowflake,
  Sparkles,
  SquarePlus,
  Star,
  Tags,
  Trash2,
  TrendingDown,
  TestTube,
  Wand2,
  Wind,
  Zap,
  Flame,
  Swords,
  Orbit,
} from "lucide-react";
import type { Card } from "@/app/types/gameTypes";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import raw from "@/app/data/db/STS_CARDS_DB.json";
import { loadCustomGlyphs, loadBuiltinGlyphOverrides } from "@/app/utils/customGlyphRegistry";

export type GalleryGlyphSegment = {
  Icon?: LucideIcon;
  iconClass?: string;
  text?: string;
  textClass?: string;
};

export type GalleryGlyph = {
  id: string;
  catalogKey?: string;
  label: string;
  /** Single-icon glyph (legacy / simple) */
  Icon?: LucideIcon;
  iconClass?: string;
  /** Lucide icon name for custom glyphs — resolved at render time in Card.tsx. */
  lucideIconName?: string;
  /** Raw SVG markup for custom glyphs that use an uploaded/fetched SVG instead of a Lucide icon. */
  svgData?: string;
  /** Numeric value to render alongside the icon (custom glyphs with mode="numeric" + showNumber). */
  numericValue?: number;
  /** When true, suppress all numeric text segments and numericValue at render time. */
  hideNumber?: boolean;
  /** Hover tooltip text; overrides label as the title attribute on the chip. */
  tooltip?: string;
  /** Inline cluster: icons + text in order */
  segments?: GalleryGlyphSegment[];
  /** Tailwind for cluster wrapper */
  clusterClass?: string;
  /**
   * Gallery: render this cluster on the same row as the damage stat (weak/vuln/both),
   * not in the separate effect strip — base damage stays only in the stat row.
   */
  prefixDamageRow?: boolean;
};

export type GallerySuppressedStats = Partial<
  Record<
    "damage" | "draw" | "block" | "energyGain" | "heal" | "focus" | "hpcost",
    true
  >
>;

/** Lucide + color for each STS `iconCatalog` key (and a few derived ids). */
export const STS_ICON_GLYPH: Record<
  string,
  { Icon: LucideIcon; iconClass: string; shortLabel: string }
> = {
  LIGHTNING_ORB: { Icon: Zap, iconClass: "text-amber-300", shortLabel: "Lightning orb" },
  FROST_ORB: { Icon: Snowflake, iconClass: "text-sky-300", shortLabel: "Frost orb" },
  DARK_ORB: { Icon: Moon, iconClass: "text-violet-300", shortLabel: "Dark orb" },
  PLASMA_ORB: { Icon: Sparkles, iconClass: "text-yellow-200", shortLabel: "Plasma orb" },
  DRAW_ICON: { Icon: FileText, iconClass: "text-cyan-300", shortLabel: "Draw" },
  DISCARD_ICON: { Icon: Trash2, iconClass: "text-orange-300", shortLabel: "Discard" },
  EVOKE_ICON: { Icon: CircleDot, iconClass: "text-amber-200", shortLabel: "Evoke" },
  CONDITIONAL_MARKER: { Icon: HelpCircle, iconClass: "text-amber-200/90", shortLabel: "Conditional" },
  ANY_ORB: { Icon: Layers, iconClass: "text-slate-300", shortLabel: "Any orb" },
  SAME_ORB_AS_EVOKED: { Icon: Copy, iconClass: "text-slate-300", shortLabel: "Same as evoked" },
  /** Area-of-effect marker paired with damage icon */
  AOE_ICON: { Icon: Crosshair, iconClass: "text-rose-200", shortLabel: "AoE" },
  /** Gallery: legacy multi-hit row (distinct from main damage stat icon). */
  AOE_DAMAGE: { Icon: Swords, iconClass: "text-rose-300", shortLabel: "Multi-hit" },
  RANDOM_ICON: { Icon: Shuffle, iconClass: "text-violet-300", shortLabel: "Random" },
  EXHAUST_SELF: { Icon: Flame, iconClass: "text-orange-400", shortLabel: "Exhaust (self)" },
  SCRY_ICON: { Icon: ScanSearch, iconClass: "text-fuchsia-300", shortLabel: "Scry" },
  LOSE_STRENGTH: { Icon: TrendingDown, iconClass: "text-orange-300", shortLabel: "Lose Strength" },
  KEY_INNATE: { Icon: Star, iconClass: "text-amber-200", shortLabel: "Innate" },
  KEY_ETHEREAL: { Icon: Ghost, iconClass: "text-slate-400", shortLabel: "Ethereal" },
  KEY_RETAIN: { Icon: Bookmark, iconClass: "text-lime-200", shortLabel: "Retain" },
  KEY_POTION: { Icon: TestTube, iconClass: "text-amber-300", shortLabel: "Potion"},
  /** Potion category tags from `POTIONS_DB.json`; unknown tags use `PTAG_UNKNOWN`. */
  PTAG_DEFENSE: { Icon: Shield, iconClass: "text-emerald-300", shortLabel: "Tag: Defense" },
  PTAG_RESOURCE: { Icon: Package, iconClass: "text-amber-200", shortLabel: "Tag: Resource" },
  PTAG_CARD: { Icon: CreditCard, iconClass: "text-cyan-300", shortLabel: "Tag: Card" },
  PTAG_OFFENSE: { Icon: Swords, iconClass: "text-rose-300", shortLabel: "Tag: Offense" },
  PTAG_BUFF: { Icon: Sparkles, iconClass: "text-lime-300", shortLabel: "Tag: Buff" },
  PTAG_SCALING: { Icon: Activity, iconClass: "text-violet-300", shortLabel: "Tag: Scaling" },
  PTAG_SPECIAL: { Icon: Wand2, iconClass: "text-fuchsia-300", shortLabel: "Tag: Special" },
  PTAG_ENERGY: { Icon: Zap, iconClass: "text-yellow-300", shortLabel: "Tag: Energy" },
  PTAG_DEBUFF: { Icon: Skull, iconClass: "text-orange-400", shortLabel: "Tag: Debuff" },
  PTAG_UNKNOWN: { Icon: Tags, iconClass: "text-amber-200/85", shortLabel: "Tag (other)" },
  KEY_UNPLAYABLE: { Icon: Ban, iconClass: "text-slate-500", shortLabel: "Unplayable" },
  COST_MANIP: { Icon: Coins, iconClass: "text-amber-300", shortLabel: "Cost" },
  UPGRADE_CARD: { Icon: ChevronsUp, iconClass: "text-violet-300", shortLabel: "Upgrade" },
  ADD_CARD: { Icon: SquarePlus, iconClass: "text-cyan-300", shortLabel: "Add card" },
  CAN_ADD_CARDS: { Icon: Library, iconClass: "text-teal-300", shortLabel: "Adds cards" },
  CAN_ADD_POTIONS: { Icon: FlaskConical, iconClass: "text-lime-300", shortLabel: "Adds potions" },
  HP_COST: { Icon: Droplets, iconClass: "text-rose-400", shortLabel: "HP cost" },
  GAIN_ENERGY_ICON: { Icon: Orbit, iconClass: "text-yellow-300", shortLabel: "Gain energy" },
};

const FALLBACK_ICON_CATALOG: Record<string, string> = {
  LIGHTNING_ORB: "Lightning orb (channel / evoke visuals)",
  FROST_ORB: "Frost orb",
  DARK_ORB: "Dark orb",
  PLASMA_ORB: "Plasma orb",
  DRAW_ICON: "Draw from draw pile",
  DISCARD_ICON: "Discard to discard pile",
  EVOKE_ICON: "Evoke orb",
  CONDITIONAL_MARKER:
    "Effect is conditional — prepended before draw, damage, discard, block, energy, etc.",
  ANY_ORB: "Generic orb placeholder when color not fixed",
  SAME_ORB_AS_EVOKED: "Echo orb type from prior evoke",
  AOE_ICON: "All-enemies attack marker — grouped with the damage stat row (rose tint in gallery)",
  RANDOM_ICON: "Random choice (e.g. discard target, random hit)",
  CAN_ADD_CARDS: "Adds cards into hand — flagged on card data (spawn / generated cards)",
  KEY_POTION: "Consumable potion (planner deck chrome — not a playable card)",
  PTAG_DEFENSE: "Potion tag: block / mitigation themed",
  PTAG_RESOURCE: "Potion tag: healing, gold, or generic resources",
  PTAG_CARD: "Potion tag: generates or manipulates cards",
  PTAG_OFFENSE: "Potion tag: damage or aggression",
  PTAG_BUFF: "Potion tag: stat or combat buffs",
  PTAG_SCALING: "Potion tag: scaling or growth effects",
  PTAG_SPECIAL: "Potion tag: unusual / character-specific interactions",
  PTAG_ENERGY: "Potion tag: energy manipulation",
  PTAG_DEBUFF: "Potion tag: applies negative effects",
  PTAG_UNKNOWN: "Potion tag not in the canonical set — generic tag icon",
};

export function readStsIconCatalog(): { key: string; description: string }[] {
  const root = raw as { iconCatalog?: Record<string, string> };
  const cat =
    root.iconCatalog && Object.keys(root.iconCatalog).length > 0
      ? root.iconCatalog
      : FALLBACK_ICON_CATALOG;
  return Object.entries(cat).map(([key, description]) => ({ key, description }));
}

function glyphFromStsKey(
  id: string,
  catalogKey: string,
  label?: string,
): GalleryGlyph | null {
  const meta = STS_ICON_GLYPH[catalogKey];
  if (!meta) return null;
  return {
    id,
    catalogKey,
    label: label ?? meta.shortLabel,
    Icon: meta.Icon,
    iconClass: meta.iconClass,
  };
}

function fullDesc(card: Card): string {
  const c = card as Record<string, unknown>;
  const u = c.descriptionUpgraded;
  return `${card.description ?? ""} ${typeof u === "string" ? u : ""}`;
}

function isConditionedField(node: unknown): boolean {
  return (
    node !== null &&
    typeof node === "object" &&
    !Array.isArray(node) &&
    (node as Record<string, unknown>).conditioned === true
  );
}

function damageTargetIsAllEnemies(card: Card): boolean {
  const d = card.damage;
  if (d == null || typeof d !== "object" || Array.isArray(d)) return false;
  const t = (d as Record<string, unknown>).target;
  if (typeof t === "string" && /\ball enemies\b/i.test(t)) return true;
  if (t != null && typeof t === "object" && !Array.isArray(t)) {
    const o = t as { base?: string; upgraded?: string };
    const pick =
      card.isUpgraded === true && o.upgraded !== undefined ? o.upgraded : o.base;
    if (typeof pick === "string" && /\ball enemies\b/i.test(pick)) return true;
  }
  return false;
}

function damageRowIsAoE(card: Card): boolean {
  return (
    card.type === "Attack" &&
    card.damage != undefined &&
    (damageTargetIsAllEnemies(card) || /\ball enemies\b/i.test(fullDesc(card)))
  );
}

/** String or tiered `{ base, upgraded? }` → current tier is "all enemies". */
function appliesDebuffTargetTierIsAllEnemies(card: Card, t: unknown): boolean {
  if (typeof t === "string" && /\ball enemies\b/i.test(t)) return true;
  if (t != null && typeof t === "object" && !Array.isArray(t)) {
    const o = t as { base?: string; upgraded?: string };
    const pick =
      card.isUpgraded === true && o.upgraded !== undefined ? o.upgraded : o.base;
    if (typeof pick === "string" && /\ball enemies\b/i.test(pick)) return true;
  }
  return false;
}

function appliesDebuffRootIsAllEnemies(card: Card, debuffs: Record<string, unknown>): boolean {
  return appliesDebuffTargetTierIsAllEnemies(card, debuffs.target);
}

/** Per-entry `target` on a debuff node (e.g. weak: { base: 2, target: { base: "all enemies" } }). */
function appliesDebuffEntryTargetIsAllEnemies(card: Card, raw: unknown): boolean {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return false;
  return appliesDebuffTargetTierIsAllEnemies(card, (raw as Record<string, unknown>).target);
}

/** AoE icon prefix for this debuff row: root `appliesDebuffs.target` or per-entry `target`. */
function appliesDebuffGlyphLeadsWithAoe(
  card: Card,
  debuffs: Record<string, unknown>,
  raw: unknown,
): boolean {
  return appliesDebuffRootIsAllEnemies(card, debuffs) || appliesDebuffEntryTargetIsAllEnemies(card, raw);
}

/** True if any appliesDebuffs effect is flagged all-enemies (legend / hints). */
export function galleryAppliesDebuffsIsAoE(card: Card): boolean {
  const c = card as Record<string, unknown>;
  const debuffs = c.appliesDebuffs as Record<string, unknown> | undefined;
  if (!debuffs || typeof debuffs !== "object") return false;
  if (appliesDebuffRootIsAllEnemies(card, debuffs)) return true;
  for (const [key, val] of Object.entries(debuffs)) {
    if (key === "target") continue;
    if (appliesDebuffEntryTargetIsAllEnemies(card, val)) return true;
  }
  return false;
}

export function galleryDamageIsConditional(card: Card): boolean {
  return card.damage != undefined && isConditionedField(card.damage);
}

function blockIsConditional(card: Card): boolean {
  return card.block != undefined && isConditionedField(card.block);
}

export function galleryBlockRowIsConditional(card: Card): boolean {
  return blockIsConditional(card);
}

function segmentConditional(): GalleryGlyphSegment {
  const m = STS_ICON_GLYPH.CONDITIONAL_MARKER;
  return { Icon: m.Icon, iconClass: m.iconClass };
}

function segmentAoe(): GalleryGlyphSegment {
  const m = STS_ICON_GLYPH.AOE_ICON;
  return { Icon: m.Icon, iconClass: m.iconClass };
}

function segmentRandom(): GalleryGlyphSegment {
  const m = STS_ICON_GLYPH.RANDOM_ICON;
  return { Icon: m.Icon, iconClass: m.iconClass };
}

export function galleryDrawIsConditional(card: Card): boolean {
  const c = card as Record<string, unknown>;
  if (card.draw != undefined && isConditionedField(card.draw)) return true;
  const dc = c.drawConditional;
  return Array.isArray(dc) && dc.length > 0;
}

function legacyDrawConditional(card: Card): boolean {
  const dc = (card as Record<string, unknown>).drawConditional;
  return Array.isArray(dc) && dc.length > 0;
}

function drawUsesCatalogKey(card: Card): string {
  const c = card as Record<string, unknown>;
  const dRaw = card.draw as Record<string, unknown> | undefined;
  if (typeof dRaw?.drawUsesIcon === "string") return dRaw.drawUsesIcon;
  if (typeof c.drawUsesIcon === "string") return c.drawUsesIcon;
  return "DRAW_ICON";
}

export function energyGainNode(card: Card): unknown {
  const c = card as Record<string, unknown>;
  return c.energyGain ?? c.gainEnergy;
}

/**
 * `selfExhaustOnPlay`: legacy boolean, or `{ base, upgraded? }` booleans (matches STS DB).
 */
export function cardSelfExhaustsOnPlay(card: Card): boolean {
  const v = (card as Record<string, unknown>).selfExhaustOnPlay;
  if (v === true) return true;
  if (v === false || v == null) return false;
  if (typeof v === "object" && !Array.isArray(v)) {
    const o = v as { base?: boolean; upgraded?: boolean };
    if (card.isUpgraded === true && o.upgraded !== undefined) return Boolean(o.upgraded);
    return Boolean(o.base);
  }
  return false;
}

/** True when a tier / effect payload marks random targeting or random choice (enemy, card, hit, …). */
export function galleryTierOrEffectHasRandomFlag(node: unknown): boolean {
  if (node == null || typeof node !== "object" || Array.isArray(node)) return false;
  const o = node as Record<string, unknown>;
  return o.random === true || o.randomTarget === true;
}

function discardIsRandom(discard: { randomTarget?: boolean; random?: boolean }): boolean {
  return galleryTierOrEffectHasRandomFlag(discard);
}

/** Scan common card JSON blobs for `@link galleryTierOrEffectHasRandomFlag` (legend / hints). */
export function galleryCardDeclaresRandomTargeting(card: Card): boolean {
  const c = card as Record<string, unknown>;
  const discard = c.discardEffect as { random?: boolean; randomTarget?: boolean } | undefined;

  const debuffs = c.appliesDebuffs as Record<string, unknown> | undefined;
  if (debuffs && typeof debuffs === "object") {
    for (const [k, val] of Object.entries(debuffs)) {
      if (k === "target") continue;
      if (galleryTierOrEffectHasRandomFlag(val)) return true;
    }
  }

  const tierFields: unknown[] = [
    card.damage,
    card.block,
    card.draw,
    energyGainNode(card),
    c.heal,
    c.focus,
    card.takeDamage,
    c.bonusDamage,
    c.bonusBlock,
    c.hpcost,
    c.hpCost,
    c.scry,
  ];
  for (const n of tierFields) {
    if (galleryTierOrEffectHasRandomFlag(n)) return true;
  }

  if (discardIsRandom(discard ?? {})) return true;

  const addCardRaw = c.addCard;
  if (addCardRaw && typeof addCardRaw === "object" && !Array.isArray(addCardRaw)) {
    if (galleryTierOrEffectHasRandomFlag(addCardRaw)) return true;
  }

  for (const entry of orbInteractionEntries(c)) {
    if (galleryTierOrEffectHasRandomFlag(entry)) return true;
  }

  return false;
}

/**
 * Numeric tier from a plain number or `{ base, upgraded? }` (uses `card.isUpgraded`).
 */
export function galleryTierNumber(card: Card, node: unknown): number | undefined {
  if (node === undefined || node === null) return undefined;
  if (typeof node === "number" && !Number.isNaN(node)) return node;
  if (typeof node === "object" && !Array.isArray(node)) {
    const o = node as { base?: number; upgraded?: number };
    if (card.isUpgraded === true && o.upgraded !== undefined) return o.upgraded;
    if (o.base !== undefined) return o.base;
  }
  return undefined;
}

function galleryNumericField(
  card: Card,
  field: "damage" | "draw" | "energyGain" | "block",
): number | undefined {
  if (field === "energyGain") {
    return galleryTierNumber(card, energyGainNode(card));
  }
  return galleryTierNumber(card, card[field]);
}

/** Discard count for glyphs; defaults to 1 when an effect exists but has no numeric tier. */
function galleryDiscardDisplayCount(card: Card): number {
  const d = (card as Record<string, unknown>).discardEffect;
  if (!d || typeof d !== "object" || Array.isArray(d)) return 1;
  const n = galleryTierNumber(card, d);
  return n !== undefined ? n : 1;
}

/** Legacy damage row: optional conditional + AoE markers before the damage icon. */
function buildDamageLegacyGlyph(card: Card): GalleryGlyph | null {
  if (card.damage === undefined) return null;
  const dmgD = getEffectDisplay("damage");
  const hasSub = galleryDamageIsConditional(card) || damageRowIsAoE(card);
  const dRaw =
    card.damage && typeof card.damage === "object" && !Array.isArray(card.damage)
      ? (card.damage as Record<string, unknown>)
      : undefined;
  const dmgRandom = galleryTierOrEffectHasRandomFlag(dRaw ?? card.damage);
  const trigger = typeof dRaw?.trigger === "string" ? String(dRaw.trigger) : undefined;

  if (!hasSub && !dmgRandom) {
    return {
      id: "damage",
      label: "Damage",
      Icon: dmgD.icon,
      iconClass: dmgD.color,
    };
  }

  if (!hasSub && dmgRandom) {
    return {
      id: "damage-random-simple",
      label: trigger ? `Random · Damage — ${trigger}` : "Random · Damage",
      clusterClass: clusterShellField("damage"),
      segments: [segmentRandom()],
      prefixDamageRow: true,
    };
  }

  const segments: GalleryGlyphSegment[] = [];
  if (dmgRandom) segments.push(segmentRandom());
  if (galleryDamageIsConditional(card)) segments.push(segmentConditional());
  if (damageRowIsAoE(card)) segments.push(segmentAoe());
  const labelParts: string[] = [];
  if (dmgRandom) labelParts.push("Random");
  if (galleryDamageIsConditional(card)) labelParts.push("Conditional");
  if (damageRowIsAoE(card)) labelParts.push("AoE");
  labelParts.push("Damage");
  return {
    id: "damage-combo",
    label: trigger ? `${labelParts.join(" · ")} — ${trigger}` : labelParts.join(" · "),
    clusterClass: clusterShellField("damage"),
    segments,
    prefixDamageRow: true,
  };
}

type GalleryClusterField = "damage" | "block" | "draw" | "energy" | "neutral";

function clusterShellField(field: GalleryClusterField): string {
  switch (field) {
    case "damage":
      return "rounded-md border border-red-400/30 bg-red-950/40 px-1 py-0.5 shadow-sm";
    case "block":
      return "rounded-md border border-blue-400/30 bg-blue-950/45 px-1 py-0.5 shadow-sm";
    case "draw":
      return "rounded-md border border-indigo-400/30 bg-indigo-950/40 px-1 py-0.5 shadow-sm";
    case "energy":
      return "rounded-md border border-yellow-400/25 bg-yellow-950/35 px-1 py-0.5 shadow-sm";
    default:
      return "rounded-md border border-white/15 bg-black/25 px-1 py-0.5 shadow-sm";
  }
}

/** Same shell as damage-field gallery glyphs (multi-hit, conditional damage row, etc.). */
export const galleryDamageClusterShellClass = clusterShellField("damage");

/** Same shell as block-field gallery glyphs (multihit block row, etc.). */
export const galleryBlockClusterShellClass = clusterShellField("block");

/** Small "×" before multihit count when inlined after the damage number. */
export const MULTIHIT_INLINE_TIMES_CLASS =
  "text-[0.75em] font-semibold leading-none text-slate-400 opacity-90 mx-px";

export const MULTIHIT_INLINE_COUNT_CLASS =
  "text-[0.9em] font-bold tabular-nums leading-none text-indigo-300";

function cardUsesXCostOrbLocal(card: Card): boolean {
  const v = (card as Record<string, unknown>).xCost;
  if (v === undefined || v === null || v === false) return false;
  if (typeof v === "number" && v === 0) return false;
  if (typeof v === "string" && v.trim() === "") return false;
  return true;
}

/**
 * Multihit hit-count label for inlining after damage (`×2`, `×5`, `×X`), or null if not a DB multihit attack.
 */
export function damageMultihitInlineHitLabel(card: Card): string | null {
  if (card.damage === undefined || card.type !== "Attack") return null;
  const c = card as Record<string, unknown>;
  const multi = c.multiHit;
  if (multi == null || typeof multi !== "object" || Array.isArray(multi)) return null;
  const m = multi as Record<string, unknown>;
  if (m.multiHitEnergyScaling === true && cardUsesXCostOrbLocal(card)) {
    return "X";
  }
  if (!("multiHitCount" in m)) return null;
  const mhc = m.multiHitCount;
  if (typeof mhc === "object" && mhc !== null && !Array.isArray(mhc) && (mhc as Record<string, unknown>).hideNumber === true) return "?";
  const n = galleryTierNumber(card, mhc);
  return n != null ? String(n) : null;
}

/** Conditional + markers before block when multihit block uses the same shell as multihit damage. */
export function multihitBlockRowLeadingSegments(card: Card): GalleryGlyphSegment[] {
  if (blockMultihitInlineHitLabel(card) == null) return [];
  const segs: GalleryGlyphSegment[] = [];
  if (blockIsConditional(card)) segs.push(segmentConditional());
  return segs;
}

/**
 * Multihit block: inline count after block stat (e.g. Reinforced Body: block × X).
 * Requires {@link Card.block} and `multiHit.blockUsesMainField` on the DB record.
 */
export function blockMultihitInlineHitLabel(card: Card): string | null {
  if (card.block === undefined) return null;
  const c = card as Record<string, unknown>;
  const multi = c.multiHit;
  if (multi == null || typeof multi !== "object" || Array.isArray(multi)) return null;
  const m = multi as Record<string, unknown>;
  if (m.blockUsesMainField !== true) return null;
  if (m.multiHitEnergyScaling === true && cardUsesXCostOrbLocal(card)) {
    return "X";
  }
  if (!("multiHitCount" in m)) return null;
  const mhc = m.multiHitCount;
  if (typeof mhc === "object" && mhc !== null && !Array.isArray(mhc) && (mhc as Record<string, unknown>).hideNumber === true) return "?";
  const n = galleryTierNumber(card, mhc);
  return n != null ? String(n) : null;
}

/**
 * Multihit repeat count for `appliesDebuffs.poison` when `multiHit.appliesDebuffsUsesMainField`
 * is set (e.g. Bouncing Flask). `×X` when energy-scaling; else numeric tier from `multiHitCount`.
 */
export function debuffPoisonMultihitHitLabel(card: Card): string | null {
  const c = card as Record<string, unknown>;
  const debuffs = c.appliesDebuffs as Record<string, unknown> | undefined;
  if (debuffs?.poison == null) return null;
  const multi = c.multiHit;
  if (multi == null || typeof multi !== "object" || Array.isArray(multi)) return null;
  const m = multi as Record<string, unknown>;
  if (m.appliesDebuffsUsesMainField !== true) return null;
  if (m.multiHitEnergyScaling === true && cardUsesXCostOrbLocal(card)) {
    return "X";
  }
  if (!("multiHitCount" in m)) return null;
  const mhc = m.multiHitCount;
  if (typeof mhc === "object" && mhc !== null && !Array.isArray(mhc) && (mhc as Record<string, unknown>).hideNumber === true) return "?";
  const n = galleryTierNumber(card, mhc);
  return n != null ? String(n) : null;
}

/** Conditional + random + AoE icons placed before damage inside the unified multihit damage cluster. */
export function multihitDamageRowLeadingSegments(card: Card): GalleryGlyphSegment[] {
  if (damageMultihitInlineHitLabel(card) == null) return [];
  const dmgObj =
    card.damage && typeof card.damage === "object" && !Array.isArray(card.damage)
      ? card.damage
      : undefined;
  const segs: GalleryGlyphSegment[] = [];
  if (galleryTierOrEffectHasRandomFlag(dmgObj ?? card.damage)) {
    segs.push(segmentRandom());
  }
  if (galleryDamageIsConditional(card)) segs.push(segmentConditional());
  if (damageRowIsAoE(card)) segs.push(segmentAoe());
  return segs;
}

/** Same leading icons as {@link multihitDamageRowLeadingSegments} for single-hit damage rows (inside stat shell). */
export function singleHitDamageRowLeadingSegments(card: Card): GalleryGlyphSegment[] {
  if (damageMultihitInlineHitLabel(card) != null) return [];
  const dmgObj =
    card.damage && typeof card.damage === "object" && !Array.isArray(card.damage)
      ? card.damage
      : undefined;
  const segs: GalleryGlyphSegment[] = [];
  if (galleryTierOrEffectHasRandomFlag(dmgObj ?? card.damage)) {
    segs.push(segmentRandom());
  }
  if (galleryDamageIsConditional(card)) segs.push(segmentConditional());
  if (damageRowIsAoE(card)) segs.push(segmentAoe());
  return segs;
}

export function galleryTieredBoolActive(card: Card, node: unknown): boolean {
  if (node === true) return true;
  if (node === false || node == null) return false;
  if (typeof node === "object" && !Array.isArray(node)) {
    const o = node as { base?: boolean; upgraded?: boolean };
    if (card.isUpgraded === true && o.upgraded !== undefined) return Boolean(o.upgraded);
    return Boolean(o.base);
  }
  return false;
}

/** Safe id segment for potion tag glyphs / legend catalog keys. */
export function slugPotionTagForGlyph(tag: string): string {
  const t = tag.trim();
  if (!t) return "TAG";
  return t.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "TAG";
}

const PTAG_NAME_TO_STS_KEY: Record<string, keyof typeof STS_ICON_GLYPH> = {
  DEFENSE: "PTAG_DEFENSE",
  RESOURCE: "PTAG_RESOURCE",
  CARD: "PTAG_CARD",
  OFFENSE: "PTAG_OFFENSE",
  BUFF: "PTAG_BUFF",
  SCALING: "PTAG_SCALING",
  SPECIAL: "PTAG_SPECIAL",
  ENERGY: "PTAG_ENERGY",
  DEBUFF: "PTAG_DEBUFF",
};

function resolvePotionTagGlyphMeta(tag: string): {
  catalogKey: string;
  Icon: LucideIcon;
  iconClass: string;
  labelUpper: string;
} {
  const trimmed = typeof tag === "string" ? tag.trim() : "";
  const labelUpper = trimmed.length > 0 ? trimmed.toUpperCase() : "TAG";
  const slug = slugPotionTagForGlyph(trimmed);
  const catalogKey = `PTAG_${slug.toUpperCase()}`;
  const canon = slug.toUpperCase();
  const stsKey = PTAG_NAME_TO_STS_KEY[canon] ?? "PTAG_UNKNOWN";
  const m = STS_ICON_GLYPH[stsKey];
  return {
    catalogKey,
    Icon: m.Icon,
    iconClass: m.iconClass,
    labelUpper,
  };
}

function buildKeywordGlyphs(card: Card): GalleryGlyph[] {
  const c = card as Record<string, unknown>;
  const out: GalleryGlyph[] = [];

  if (card.type === "Potion") {
    const m = STS_ICON_GLYPH.KEY_POTION;
    out.push({
      id: "kw-potion",
      catalogKey: "KEY_POTION",
      label: "Potion",
      Icon: m.Icon,
      iconClass: m.iconClass,
    });
    const tags = (card as { potionTags?: string[] }).potionTags;
    if (Array.isArray(tags)) {
      for (const rawTag of tags) {
        const tag = typeof rawTag === "string" ? rawTag.trim() : "";
        if (!tag) continue;
        const slug = slugPotionTagForGlyph(tag);
        const meta = resolvePotionTagGlyphMeta(tag);
        out.push({
          id: `potion-tag-${slug}`,
          catalogKey: meta.catalogKey,
          label: meta.labelUpper,
          segments: [
            { Icon: meta.Icon, iconClass: meta.iconClass },
            {
              text: meta.labelUpper,
              textClass:
                "text-[8px] font-extrabold uppercase tracking-tight text-amber-100/95 leading-none",
            },
          ],
          clusterClass:
            "inline-flex items-center gap-0.5 rounded border border-amber-500/40 bg-amber-950/50 px-1 py-px shadow-sm shadow-amber-950/35",
        });
      }
    }
    return out;
  }

  const innate = c.innate ?? c.Innate;
  const ethereal = c.ethereal ?? c.Ethereal;
  const retainField = c.retain ?? c.Retain;
  if (galleryTieredBoolActive(card, innate)) {
    const m = STS_ICON_GLYPH.KEY_INNATE;
    out.push({
      id: "kw-innate",
      label: "Innate",
      Icon: m.Icon,
      iconClass: m.iconClass,
    });
  }
  if (galleryTieredBoolActive(card, ethereal)) {
    const m = STS_ICON_GLYPH.KEY_ETHEREAL;
    out.push({
      id: "kw-ethereal",
      label: "Ethereal",
      Icon: m.Icon,
      iconClass: m.iconClass,
    });
  }
  if (galleryTieredBoolActive(card, retainField)) {
    const m = STS_ICON_GLYPH.KEY_RETAIN;
    out.push({
      id: "kw-retain",
      catalogKey: "KEY_RETAIN",
      label: "Retain",
      Icon: m.Icon,
      iconClass: m.iconClass,
    });
  }
  if (galleryTieredBoolActive(card, c.unplayable ?? c.Unplayable)) {
    const m = STS_ICON_GLYPH.KEY_UNPLAYABLE;
    out.push({
      id: "kw-unplayable",
      catalogKey: "KEY_UNPLAYABLE",
      label: "Unplayable",
      Icon: m.Icon,
      iconClass: m.iconClass,
    });
  }
  return out;
}

const ORB_TYPE_TO_CATALOG: Record<string, string> = {
  lightning: "LIGHTNING_ORB",
  frost: "FROST_ORB",
  dark: "DARK_ORB",
  plasma: "PLASMA_ORB",
};

export function orbInteractionEntries(root: Record<string, unknown>): Record<string, unknown>[] {
  const o = root.orbInteractions;
  if (Array.isArray(o)) return o as Record<string, unknown>[];
  if (o && typeof o === "object" && !Array.isArray(o)) return [o as Record<string, unknown>];
  return [];
}

export function resolveOrbCatalogKey(e: Record<string, unknown>, verbRaw: string): string {
  if (typeof e.usesIcon === "string") return e.usesIcon;
  if (typeof e.orbIcon === "string") return e.orbIcon;
  const ot = e.orbtype ?? e.orbType;
  if (typeof ot === "string") {
    const k = ORB_TYPE_TO_CATALOG[ot.toLowerCase()];
    if (k) return k;
  }
  if (/^evoke/i.test(verbRaw)) return "EVOKE_ICON";
  return "ANY_ORB";
}

function plusSegment(): GalleryGlyphSegment {
  return {
    Icon: Plus,
    iconClass: "text-emerald-300/95",
  };
}

const EXHAUST_GLYPH_IDS = new Set(["exhaust-self", "structured-exhaust"]);

/** Keyword chips shown first on the card (order). Strip duplicates from the inferred list. */
const KEYWORD_PREFIX_IDS = new Set([
  "kw-innate",
  "kw-ethereal",
  "kw-retain",
  "kw-unplayable",
]);

/** Keyword / potion-tag chips peeled to the front of the stat strip (matches {@link finalizeGlyphDisplayOrder}). */
function isKeywordLeadingGlyphId(id: string): boolean {
  return (
    KEYWORD_PREFIX_IDS.has(id) ||
    id === "kw-potion" ||
    id.startsWith("potion-tag-")
  );
}

/**
 * Medium/large `Card` stat strip renders numeric rows (block, draw, …) in JSX before the
 * suffix glyph list; peel keyword glyphs so they can be painted first and match
 * {@link finalizeGlyphDisplayOrder}.
 */
export function galleryStatStripKeywordLeadingAndRest(glyphs: GalleryGlyph[]): {
  keywordLeading: GalleryGlyph[];
  rest: GalleryGlyph[];
} {
  const keywordLeading = glyphs.filter((g) => isKeywordLeadingGlyphId(g.id));
  const rest = glyphs.filter((g) => !isKeywordLeadingGlyphId(g.id));
  return { keywordLeading, rest };
}

/**
 * Row order: lower = further left / earlier.
 * Keywords 1–4, effect glyphs between keywords and exhaust, exhaust last (9999).
 */
const GLYPH_DISPLAY_PRIORITY_EXHAUST = 9999;

function glyphDisplayPriority(glyphId: string): number {
  if (EXHAUST_GLYPH_IDS.has(glyphId)) return GLYPH_DISPLAY_PRIORITY_EXHAUST;
  switch (glyphId) {
    case "kw-potion":
      return 0;
    case "kw-innate":
      return 1;
    case "kw-ethereal":
      return 2;
    case "kw-retain":
      return 3;
    case "kw-unplayable":
      return 4;
    default:
      if (glyphId.startsWith("potion-tag-")) return 10;
      return 500;
  }
}

/**
 * Innate → Ethereal → Retain → Unplayable (only those present), then other glyphs (stable
 * inference order), then self-exhaust glyphs ({@link EXHAUST_GLYPH_IDS}).
 */
function finalizeGlyphDisplayOrder(card: Card, glyphs: GalleryGlyph[]): GalleryGlyph[] {
  const prefix = buildKeywordGlyphs(card);
  const middle: GalleryGlyph[] = [];
  const exhaust: GalleryGlyph[] = [];
  for (const g of glyphs) {
    if (EXHAUST_GLYPH_IDS.has(g.id)) exhaust.push(g);
    else if (!isKeywordLeadingGlyphId(g.id)) middle.push(g);
  }
  const combined = [...prefix, ...middle, ...exhaust];
  combined.sort(
    (a, b) => glyphDisplayPriority(a.id) - glyphDisplayPriority(b.id),
  );
  return combined;
}

/**
 * High-touch layouts: ordered clusters + stat suppression (gallery only).
 * See Dropkick, All-Out Attack, Acrobatics, Pummel patterns.
 */
function tryStructuredGalleryGlyphs(
  card: Card,
): { glyphs: GalleryGlyph[]; suppressStats: GallerySuppressedStats } | null {
  const c = card as Record<string, unknown>;
  const desc = fullDesc(card);
  const discard = c.discardEffect as
    | {
        usesIcon?: string;
        randomTarget?: boolean;
        random?: boolean;
        conditioned?: boolean;
        base?: number;
        upgraded?: number;
        fromHand?: boolean;
      }
    | undefined;

  const multi = c.multiHit;
  const mObj =
    multi && typeof multi === "object" && multi !== null && !Array.isArray(multi)
      ? (multi as Record<string, unknown>)
      : null;
  const mhRaw =
    mObj && "multiHitCount" in mObj ? mObj.multiHitCount : undefined;
  const multiCount =
    mhRaw != null &&
    typeof mhRaw === "object" &&
    !Array.isArray(mhRaw)
      ? (mhRaw as { base?: number; upgraded?: number })
      : null;

  const multihitDamageInlined =
    card.damage !== undefined &&
    (multiCount != null ||
      (mObj?.damageUsesMainField === true &&
        mObj?.multiHitEnergyScaling === true &&
        cardUsesXCostOrbLocal(card)));

  const multihitBlockInlined =
    card.block !== undefined &&
    mObj?.blockUsesMainField === true &&
    (multiCount != null ||
      (mObj?.multiHitEnergyScaling === true && cardUsesXCostOrbLocal(card)));

  // Pummel / Skewer / Reinforced Body: hit count inlined in `Card` after damage or block. Optional exhaust glyph only.
  if (multihitDamageInlined || multihitBlockInlined) {
    const glyphs: GalleryGlyph[] = [];
    if (cardSelfExhaustsOnPlay(card)) {
      const ex = STS_ICON_GLYPH.EXHAUST_SELF;
      glyphs.push({
        id: "structured-exhaust",
        label: "Exhaust",
        clusterClass: clusterShellField("neutral"),
        Icon: ex.Icon,
        iconClass: ex.iconClass,
      });
    }
    return { glyphs, suppressStats: {} };
  }

  // Dropkick-style: damage + conditional draw + conditional energy (same gate)
  const egNode = energyGainNode(card);
  if (
    card.damage !== undefined &&
    card.draw !== undefined &&
    galleryDrawIsConditional(card) &&
    egNode != null &&
    isConditionedField(egNode)
  ) {
    const condMeta = STS_ICON_GLYPH.CONDITIONAL_MARKER;
    const drawVis = getEffectDisplay("draw");
    const enD = getEffectDisplay("energygain");
    const drawN = galleryNumericField(card, "draw");
    const enN = galleryNumericField(card, "energyGain");
    const dRaw =
      card.draw && typeof card.draw === "object" && !Array.isArray(card.draw)
        ? (card.draw as Record<string, unknown>)
        : undefined;
    const trigger =
      typeof dRaw?.trigger === "string"
        ? String(dRaw.trigger)
        : egNode !== null &&
            typeof egNode === "object" &&
            typeof (egNode as Record<string, unknown>).trigger === "string"
          ? String((egNode as Record<string, unknown>).trigger)
          : undefined;

    const dmgO =
      card.damage && typeof card.damage === "object" && !Array.isArray(card.damage)
        ? (card.damage as Record<string, unknown>)
        : undefined;
    const dmgRand = galleryTierOrEffectHasRandomFlag(dmgO ?? card.damage);
    const drawRand = galleryTierOrEffectHasRandomFlag(dRaw);
    const egO =
      egNode != null && typeof egNode === "object" && !Array.isArray(egNode)
        ? (egNode as Record<string, unknown>)
        : undefined;
    const egRand = galleryTierOrEffectHasRandomFlag(egO ?? egNode);

    const dmgSegs: GalleryGlyphSegment[] = [];
    if (dmgRand) dmgSegs.push(segmentRandom());
    if (galleryDamageIsConditional(card)) dmgSegs.push(segmentConditional());
    if (damageRowIsAoE(card)) dmgSegs.push(segmentAoe());
    const glyphs: GalleryGlyph[] = [];
    if (dmgSegs.length > 0) {
      glyphs.push({
        id: "structured-dmg",
        label: "Damage modifiers",
        clusterClass: clusterShellField("damage"),
        segments: dmgSegs,
        prefixDamageRow: true,
      });
    }
    glyphs.push(
      {
        id: "structured-cond-draw",
        label: trigger ? `Draw when ${trigger}` : "Conditional draw",
        clusterClass: clusterShellField("draw"),
        segments: [
          ...(drawRand ? [segmentRandom()] : []),
          { Icon: condMeta.Icon, iconClass: condMeta.iconClass },
          { Icon: drawVis.icon, iconClass: drawVis.color },
          {
            text: drawN != null ? String(drawN) : "?",
            textClass: `${drawVis.color} font-bold tabular-nums leading-none`,
          },
        ],
      },
      {
        id: "structured-cond-energy",
        label: trigger ? `Energy when ${trigger}` : "Conditional energy",
        clusterClass: clusterShellField("energy"),
        segments: [
          ...(egRand ? [segmentRandom()] : []),
          { Icon: condMeta.Icon, iconClass: condMeta.iconClass },
          { Icon: enD.icon, iconClass: enD.color },
          {
            text: enN != null ? String(enN) : "?",
            textClass: `${enD.color} font-bold tabular-nums leading-none`,
          },
        ],
      },
    );
    return {
      glyphs,
      suppressStats: { draw: true, energyGain: true },
    };
  }

  // All-Out Attack: AoE damage + random discard
  if (
    card.type === "Attack" &&
    card.damage !== undefined &&
    /\ball enemies\b/i.test(desc) &&
    discard &&
    discardIsRandom(discard)
  ) {
    const aoe = STS_ICON_GLYPH.AOE_ICON;
    const rand = STS_ICON_GLYPH.RANDOM_ICON;
    const dis = STS_ICON_GLYPH.DISCARD_ICON;
    const dCount = galleryDiscardDisplayCount(card);
    const dmgForRand =
      card.damage && typeof card.damage === "object" && !Array.isArray(card.damage)
        ? card.damage
        : undefined;
    const dmgRandFlag = galleryTierOrEffectHasRandomFlag(dmgForRand ?? card.damage);
    const aoeDmgSegs: GalleryGlyphSegment[] = [];
    if (dmgRandFlag) aoeDmgSegs.push(segmentRandom());
    if (galleryDamageIsConditional(card)) aoeDmgSegs.push(segmentConditional());
    aoeDmgSegs.push({ Icon: aoe.Icon, iconClass: aoe.iconClass });
    const rndDiscSegs: GalleryGlyphSegment[] = [];
    if (discard.conditioned === true) rndDiscSegs.push(segmentConditional());
    rndDiscSegs.push(
      { Icon: rand.Icon, iconClass: rand.iconClass },
      { Icon: dis.Icon, iconClass: dis.iconClass },
      {
        text: String(dCount),
        textClass: `${dis.iconClass} font-bold tabular-nums leading-none`,
      },
    );
    return {
      glyphs: [
        {
          id: "structured-aoe-dmg",
          label: "AoE damage",
          clusterClass: clusterShellField("damage"),
          segments: aoeDmgSegs,
          prefixDamageRow: true,
        },
        {
          id: "structured-random-discard",
          label: "Random discard",
          clusterClass: clusterShellField("neutral"),
          segments: rndDiscSegs,
        },
      ],
      suppressStats: {},
    };
  }

  // Acrobatics-style: unconditional draw + hand discard (not random)
  if (
    card.draw !== undefined &&
    discard &&
    !galleryDrawIsConditional(card) &&
    !discardIsRandom(discard) &&
    discard.fromHand === true
  ) {
    const dis = STS_ICON_GLYPH.DISCARD_ICON;
    const dCount = galleryDiscardDisplayCount(card);
    return {
      glyphs: [
        {
          id: "structured-discard-n",
          label: "Discard",
          clusterClass: clusterShellField("neutral"),
          segments: [
            ...(discard.conditioned === true ? [segmentConditional()] : []),
            { Icon: dis.Icon, iconClass: dis.iconClass },
            {
              text: String(dCount),
              textClass: `${dis.iconClass} font-bold tabular-nums leading-none`,
            },
          ],
        },
      ],
      suppressStats: {},
    };
  }

  return null;
}

function inferLegacyCardGalleryGlyphs(card: Card): GalleryGlyph[] {
  const c = card as Record<string, unknown>;
  const out: GalleryGlyph[] = [];
  const seen = new Set<string>();

  const push = (g: GalleryGlyph | null) => {
    if (!g || seen.has(g.id)) return;
    seen.add(g.id);
    out.push(g);
  };

  const drawCond = galleryDrawIsConditional(card);
  const legacyDraw = legacyDrawConditional(card);

  if (card.draw != undefined) {
    const key = drawUsesCatalogKey(card);
    const dRaw =
      card.draw && typeof card.draw === "object" && !Array.isArray(card.draw)
        ? (card.draw as Record<string, unknown>)
        : undefined;
    const trigger = typeof dRaw?.trigger === "string" ? dRaw.trigger : undefined;

    const drawRandFlag = galleryTierOrEffectHasRandomFlag(dRaw ?? card.draw);

    if (drawCond) {
      const condM = STS_ICON_GLYPH.CONDITIONAL_MARKER;
      const drawVis = getEffectDisplay("draw");
      const drawN = galleryNumericField(card, "draw");
      push({
        id: "draw-conditional-combo",
        label: trigger ? `Draw — ${trigger}` : "Draw (conditional)",
        clusterClass: clusterShellField("draw"),
        segments: [
          ...(drawRandFlag ? [segmentRandom()] : []),
          { Icon: condM.Icon, iconClass: condM.iconClass },
          { Icon: drawVis.icon, iconClass: drawVis.color },
          {
            text: drawN != null ? String(drawN) : "?",
            textClass: `${drawVis.color} font-bold tabular-nums leading-none`,
          },
        ],
      });
    } else if (drawRandFlag) {
      const drawVis = getEffectDisplay("draw");
      const drawN = galleryNumericField(card, "draw");
      const rndSeg = segmentRandom();
      const segs: GalleryGlyphSegment[] = [rndSeg, { Icon: drawVis.icon, iconClass: drawVis.color }];
      if (drawN != null) {
        segs.push({
          text: String(drawN),
          textClass: `${drawVis.color} font-bold tabular-nums leading-none`,
        });
      }
      push({
        id: "draw-main-random",
        label:
          drawN != null ? `Random · Draw ${drawN}` : "Random · Draw",
        clusterClass: clusterShellField("draw"),
        segments: segs,
      });
    } else {
      const dm =
        glyphFromStsKey("draw-main", key, "Draw") ?? {
          id: "draw-main",
          label: "Draw",
          Icon: getEffectDisplay("draw").icon,
          iconClass: getEffectDisplay("draw").color,
        };
      push(dm);
    }
  } else if (legacyDraw) {
    const condM = STS_ICON_GLYPH.CONDITIONAL_MARKER;
    const drawVis = getEffectDisplay("draw");
    push({
      id: "draw-conditional-marker-legacy",
      label: "Draw (conditional)",
      clusterClass: clusterShellField("draw"),
      segments: [
        { Icon: condM.Icon, iconClass: condM.iconClass },
        { Icon: drawVis.icon, iconClass: drawVis.color },
      ],
    });
  }

  const discard = c.discardEffect as
    | {
        usesIcon?: string;
        randomTarget?: boolean;
        random?: boolean;
        conditioned?: boolean;
        base?: number;
        upgraded?: number;
      }
    | undefined;
  if (discard) {
    const key =
      typeof discard.usesIcon === "string" ? discard.usesIcon : "DISCARD_ICON";
    const random = discardIsRandom(discard);
    const dn = galleryTierNumber(card, discard);
    const disMeta = STS_ICON_GLYPH[key] ?? STS_ICON_GLYPH.DISCARD_ICON;
    const segs: GalleryGlyphSegment[] = [];
    if (random) segs.push(segmentRandom());
    if (discard.conditioned === true) segs.push(segmentConditional());
    segs.push({ Icon: disMeta.Icon, iconClass: disMeta.iconClass });
    if (dn != null) {
      segs.push({
        text: String(dn),
        textClass: `${disMeta.iconClass} font-bold tabular-nums leading-none`,
      });
    }
    const nSuffix = dn != null ? ` ${dn}` : "";
    push({
      id: random ? "discard-random" : "discard-fixed",
      label: random ? `Discard${nSuffix} (random)` : `Discard${nSuffix}`,
      clusterClass: clusterShellField("neutral"),
      segments: segs,
    });
  }

  const orbList = orbInteractionEntries(c);
  orbList.forEach((entry, i) => {
    const e = entry;
    let verb = String(e.verb ?? "").toLowerCase();
    if (!verb && (e.orbtype != null || e.orbType != null || e.amount != null)) {
      verb = "channel";
    }
    const uses = resolveOrbCatalogKey(e, verb);
    const orbMeta = STS_ICON_GLYPH[uses] ?? STS_ICON_GLYPH.ANY_ORB;
    const orbAmt =
      galleryTierNumber(card, e.amount) ?? galleryTierNumber(card, e.times);
    const isChannel = verb === "channel";
    const isEvoke = /^evoke/i.test(verb);

    if (isChannel) {
      const segs: GalleryGlyphSegment[] = [];
      if (galleryTierOrEffectHasRandomFlag(e)) segs.push(segmentRandom());
      segs.push(
        plusSegment(),
        { Icon: orbMeta.Icon, iconClass: orbMeta.iconClass },
      );
      if (orbAmt != null) {
        segs.push({
          text: String(orbAmt),
          textClass: `${orbMeta.iconClass} font-bold tabular-nums leading-none`,
        });
      }
      const label =
        orbAmt != null ? `Channel ${orbAmt} (${uses})` : `Channel (${uses})`;
      push({
        id: `orb-${i}-channel`,
        label,
        clusterClass: clusterShellField("neutral"),
        segments: segs,
      });
      return;
    }

    if (isEvoke) {
      const ev = STS_ICON_GLYPH.EVOKE_ICON;
      const segs: GalleryGlyphSegment[] = [];
      if (galleryTierOrEffectHasRandomFlag(e)) segs.push(segmentRandom());
      segs.push(
        { Icon: ev.Icon, iconClass: ev.iconClass },
        { Icon: orbMeta.Icon, iconClass: orbMeta.iconClass },
      );
      if (orbAmt != null) {
        segs.push({
          text: String(orbAmt),
          textClass: `${orbMeta.iconClass} font-bold tabular-nums leading-none`,
        });
      }
      const label =
        orbAmt != null ? `Evoke ${orbAmt} (${uses})` : `Evoke (${uses})`;
      push({
        id: `orb-${i}-evoke`,
        label,
        clusterClass: clusterShellField("neutral"),
        segments: segs,
      });
      return;
    }

    const labelVerb = verb || "Orb";
    const label =
      orbAmt != null
        ? `${labelVerb} ${orbAmt} (${uses})`
        : `${labelVerb} (${uses})`;
    push(
      glyphFromStsKey(`orb-${i}-${labelVerb}`, uses, label) ??
        glyphFromStsKey(`orb-${i}-any`, "ANY_ORB", labelVerb),
    );
  });

  if (cardSelfExhaustsOnPlay(card)) {
    push(
      glyphFromStsKey("exhaust-self", "EXHAUST_SELF", "Exhaust") ?? {
        id: "exhaust-self",
        label: "Exhaust",
        Icon: Flame,
        iconClass: "text-orange-400",
      },
    );
  }

  const eg = energyGainNode(card);
  if (eg != null) {
    const egObj =
      eg !== null && typeof eg === "object" && !Array.isArray(eg)
        ? (eg as Record<string, unknown>)
        : null;
    const cond = egObj?.conditioned === true;
    const trigger = typeof egObj?.trigger === "string" ? egObj.trigger : undefined;
    const egDisplay = getEffectDisplay("energygain");
    const egRand = galleryTierOrEffectHasRandomFlag(egObj ?? eg);
    if (cond) {
      const condM = STS_ICON_GLYPH.CONDITIONAL_MARKER;
      const en = galleryTierNumber(card, energyGainNode(card));
      const segs: GalleryGlyphSegment[] = [];
      if (egRand) segs.push(segmentRandom());
      segs.push(
        { Icon: condM.Icon, iconClass: condM.iconClass },
        { Icon: egDisplay.icon, iconClass: egDisplay.color },
      );
      if (en != null) {
        segs.push({
          text: String(en),
          textClass: `${egDisplay.color} font-bold tabular-nums leading-none`,
        });
      }
      push({
        id: "energy-combo",
        label: trigger ? `Energy — ${trigger}` : "Energy (conditional)",
        clusterClass: clusterShellField("energy"),
        segments: segs,
      });
    } else {
      const en = galleryNumericField(card, "energyGain");
      if (en != null) {
        push({
          id: "gain-energy-main",
          label: `Gain ${en} energy`,
          clusterClass: clusterShellField("energy"),
          segments: [
            ...(egRand ? [segmentRandom()] : []),
            { Icon: egDisplay.icon, iconClass: egDisplay.color },
            {
              text: String(en),
              textClass: `${egDisplay.color} font-bold tabular-nums leading-none`,
            },
          ],
        });
      } else if (egRand) {
        push({
          id: "gain-energy-main",
          label: "Random · Gain energy",
          clusterClass: clusterShellField("energy"),
          segments: [
            segmentRandom(),
            { Icon: egDisplay.icon, iconClass: egDisplay.color },
          ],
        });
      } else {
        push({
          id: "gain-energy-main",
          label: "Gain energy",
          Icon: egDisplay.icon,
          iconClass: egDisplay.color,
        });
      }
    }
  }

  const healRaw = c.heal;
  if (healRaw != null) {
    const h = getEffectDisplay("heal");
    if (galleryTierOrEffectHasRandomFlag(healRaw)) {
      push({
        id: "heal-main",
        label: "Random · Heal",
        clusterClass: clusterShellField("neutral"),
        segments: [segmentRandom(), { Icon: h.icon, iconClass: h.color }],
      });
    } else {
      push({
        id: "heal-main",
        label: "Heal",
        Icon: h.icon,
        iconClass: h.color,
      });
    }
  }

  const focusRaw = c.focus;
  if (focusRaw != null) {
    const f = getEffectDisplay("focus");
    if (galleryTierOrEffectHasRandomFlag(focusRaw)) {
      push({
        id: "focus-main",
        label: "Random · Focus",
        clusterClass: clusterShellField("neutral"),
        segments: [segmentRandom(), { Icon: f.icon, iconClass: f.color }],
      });
    } else {
      push({
        id: "focus-main",
        label: "Focus",
        Icon: f.icon,
        iconClass: f.color,
      });
    }
  }

  // Artifact — Cog icon, amber/gold colour, shows stack count
  const artifactRaw = c.artifact;
  if (artifactRaw != null) {
    const an = galleryTierNumber(card, artifactRaw);
    if (an != null) {
      push({
        id: "artifact-n",
        label: `Artifact ${an}`,
        clusterClass: "rounded-md border border-yellow-400/35 bg-yellow-950/45 px-1 py-0.5 shadow-sm",
        segments: [
          { Icon: Cog, iconClass: "text-yellow-300" },
          { text: String(an), textClass: "text-yellow-300 font-bold tabular-nums leading-none" },
        ],
      });
    } else {
      push({ id: "artifact", label: "Artifact", Icon: Cog, iconClass: "text-yellow-300" });
    }
  }

  // Buffer — ShieldCheck icon, lime/green colour, shows stack count
  const bufferRaw = c.buffer;
  if (bufferRaw != null) {
    const bn = galleryTierNumber(card, bufferRaw);
    if (bn != null) {
      push({
        id: "buffer-n",
        label: `Buffer ${bn}`,
        clusterClass: "rounded-md border border-lime-400/35 bg-lime-950/45 px-1 py-0.5 shadow-sm",
        segments: [
          { Icon: ShieldCheck, iconClass: "text-lime-300" },
          { text: String(bn), textClass: "text-lime-300 font-bold tabular-nums leading-none" },
        ],
      });
    } else {
      push({ id: "buffer", label: "Buffer", Icon: ShieldCheck, iconClass: "text-lime-300" });
    }
  }

  // Mantra — Wind icon, purple colour (Watcher class), shows stack count
  const mantraRaw = c.mantra;
  if (mantraRaw != null) {
    const mn = galleryTierNumber(card, mantraRaw);
    if (mn != null) {
      push({
        id: "mantra-n",
        label: `Mantra ${mn}`,
        clusterClass: "rounded-md border border-purple-400/35 bg-purple-950/45 px-1 py-0.5 shadow-sm",
        segments: [
          { Icon: Wind, iconClass: "text-purple-300" },
          { text: String(mn), textClass: "text-purple-300 font-bold tabular-nums leading-none" },
        ],
      });
    } else {
      push({ id: "mantra", label: "Mantra", Icon: Wind, iconClass: "text-purple-300" });
    }
  }

  const scryRaw = c.scry;
  if (scryRaw != null) {
    const sn = galleryTierNumber(card, scryRaw);
    const sc = STS_ICON_GLYPH.SCRY_ICON;
    const scryRand = galleryTierOrEffectHasRandomFlag(scryRaw);
    if (sn != null) {
      push({
        id: "scry-n",
        catalogKey: "SCRY_ICON",
        label: `Scry ${sn}`,
        clusterClass: clusterShellField("neutral"),
        segments: [
          ...(scryRand ? [segmentRandom()] : []),
          { Icon: sc.Icon, iconClass: sc.iconClass },
          {
            text: String(sn),
            textClass: `${sc.iconClass} font-bold tabular-nums leading-none`,
          },
        ],
      });
    } else if (scryRand) {
      push({
        id: "scry",
        catalogKey: "SCRY_ICON",
        label: "Random · Scry",
        clusterClass: clusterShellField("neutral"),
        segments: [segmentRandom(), { Icon: sc.Icon, iconClass: sc.iconClass }],
      });
    } else {
      push({
        id: "scry",
        catalogKey: "SCRY_ICON",
        label: "Scry",
        Icon: sc.Icon,
        iconClass: sc.iconClass,
      });
    }
  }

  const hpCostRaw = c.hpcost ?? c.hpCost;
  if (hpCostRaw != null) {
    const hn = galleryTierNumber(card, hpCostRaw);
    const hpMeta = STS_ICON_GLYPH.HP_COST;
    const hpRand = galleryTierOrEffectHasRandomFlag(hpCostRaw);
    if (hn != null) {
      push({
        id: "hp-cost-n",
        catalogKey: "HP_COST",
        label: `HP cost ${hn}`,
        clusterClass: clusterShellField("neutral"),
        segments: [
          ...(hpRand ? [segmentRandom()] : []),
          { Icon: hpMeta.Icon, iconClass: hpMeta.iconClass },
          {
            text: String(hn),
            textClass: `${hpMeta.iconClass} font-bold tabular-nums leading-none`,
          },
        ],
      });
    } else if (hpRand) {
      push({
        id: "hp-cost",
        catalogKey: "HP_COST",
        label: "Random · HP cost",
        clusterClass: clusterShellField("neutral"),
        segments: [segmentRandom(), { Icon: hpMeta.Icon, iconClass: hpMeta.iconClass }],
      });
    } else {
      push({
        id: "hp-cost",
        catalogKey: "HP_COST",
        label: "HP cost",
        Icon: hpMeta.Icon,
        iconClass: hpMeta.iconClass,
      });
    }
  }

  if (c.costManipulation === true) {
    const cm = STS_ICON_GLYPH.COST_MANIP;
    push({
      id: "cost-manip",
      catalogKey: "COST_MANIP",
      label: "Cost manipulation",
      Icon: cm.Icon,
      iconClass: cm.iconClass,
    });
  }

  if (c.canUpgradeCards === true) {
    const up = STS_ICON_GLYPH.UPGRADE_CARD;
    push({
      id: "upgrade-cards",
      catalogKey: "UPGRADE_CARD",
      label: "Upgrade cards",
      Icon: up.Icon,
      iconClass: up.iconClass,
    });
  }

  if (galleryTieredBoolActive(card, c.canAddPotions)) {
    const ac = STS_ICON_GLYPH.CAN_ADD_POTIONS;
    push({
      id: "can-add-potions",
      catalogKey: "CAN_ADD_POTIONS",
      label: "Adds potions",
      Icon: ac.Icon,
      iconClass: ac.iconClass,
    });
  }
  if (galleryTieredBoolActive(card, c.canAddCards)) {
    const ac = STS_ICON_GLYPH.CAN_ADD_CARDS;
    push({
      id: "can-add-cards",
      catalogKey: "CAN_ADD_CARDS",
      label: "Adds cards",
      Icon: ac.Icon,
      iconClass: ac.iconClass,
    });
  }

  const addCardRaw = c.addCard;
  if (addCardRaw && typeof addCardRaw === "object" && !Array.isArray(addCardRaw)) {
    const ac = addCardRaw as Record<string, unknown>;
    const addN =
      galleryTierNumber(card, ac.count) ??
      galleryTierNumber(card, ac.addCount) ??
      galleryTierNumber(card, addCardRaw);
    const attr =
      typeof ac.attribute === "string"
        ? ac.attribute
        : typeof ac.cardName === "string"
          ? ac.cardName
          : undefined;
    const addMeta = STS_ICON_GLYPH.ADD_CARD;
    const addRand = galleryTierOrEffectHasRandomFlag(addCardRaw);
    const segs: GalleryGlyphSegment[] = [];
    if (addRand) segs.push(segmentRandom());
    segs.push(
      plusSegment(),
      { Icon: addMeta.Icon, iconClass: addMeta.iconClass },
    );
    if (addN != null) {
      segs.push({
        text: String(addN),
        textClass: `${addMeta.iconClass} font-bold tabular-nums leading-none`,
      });
    }
    if (attr) {
      segs.push({
        text: attr,
        textClass:
          "max-w-[4.5rem] truncate text-[0.65em] font-semibold text-slate-300",
      });
    }
    push({
      id: "add-card",
      catalogKey: "ADD_CARD",
      label: attr ? `Add card (${attr})` : "Add card",
      clusterClass: clusterShellField("neutral"),
      segments: segs,
    });
  }

  const debuffs = c.appliesDebuffs as Record<string, unknown> | undefined;
  if (debuffs && typeof debuffs === "object") {
    for (const kind of ["vulnerable", "weak", "poison", "wound", "losestrength"] as const) {
      const raw = debuffs[kind];
      if (raw == null) continue;
      const debuffAoe = appliesDebuffGlyphLeadsWithAoe(card, debuffs, raw);

      if (kind === "losestrength") {
        const stacks = galleryTierNumber(card, raw);
        const debuffRand = galleryTierOrEffectHasRandomFlag(raw);
        const m = STS_ICON_GLYPH.LOSE_STRENGTH;
        const pfx =
          `${debuffAoe ? "AoE · " : ""}${debuffRand ? "Random · " : ""}`;
        const label =
          stacks != null ? `${pfx}Lose Strength ${stacks}` : `${pfx}Lose Strength`;
        if (stacks != null) {
          const segs: GalleryGlyphSegment[] = [];
          if (debuffAoe) segs.push(segmentAoe());
          if (debuffRand) segs.push(segmentRandom());
          segs.push(
            { Icon: m.Icon, iconClass: m.iconClass },
            {
              text: String(stacks),
              textClass: `${m.iconClass} font-bold tabular-nums leading-none`,
            },
          );
          push({
            id: "debuff-losestrength",
            catalogKey: "LOSE_STRENGTH",
            label,
            clusterClass: clusterShellField("neutral"),
            segments: segs,
          });
        } else {
          if (debuffAoe && debuffRand) {
            push({
              id: "debuff-losestrength",
              catalogKey: "LOSE_STRENGTH",
              label,
              clusterClass: clusterShellField("neutral"),
              segments: [segmentAoe(), segmentRandom(), { Icon: m.Icon, iconClass: m.iconClass }],
            });
          } else if (debuffAoe) {
            push({
              id: "debuff-losestrength",
              catalogKey: "LOSE_STRENGTH",
              label,
              clusterClass: clusterShellField("neutral"),
              segments: [segmentAoe(), { Icon: m.Icon, iconClass: m.iconClass }],
            });
          } else if (debuffRand) {
            push({
              id: "debuff-losestrength",
              catalogKey: "LOSE_STRENGTH",
              label,
              clusterClass: clusterShellField("neutral"),
              segments: [segmentRandom(), { Icon: m.Icon, iconClass: m.iconClass }],
            });
          } else {
            push({
              id: "debuff-losestrength",
              catalogKey: "LOSE_STRENGTH",
              label,
              Icon: m.Icon,
              iconClass: m.iconClass,
            });
          }
        }
        continue;
      }

      if (kind === "poison") {
        const poisonObj =
          typeof raw === "object" && !Array.isArray(raw)
            ? (raw as Record<string, unknown>)
            : null;
        const stacks = galleryTierNumber(card, raw);
        const multi = c.multiHit;
        const mHit =
          multi != null && typeof multi === "object" && !Array.isArray(multi)
            ? (multi as Record<string, unknown>)
            : null;
        const hitFromMulti =
          mHit?.appliesDebuffsUsesMainField === true
            ? mHit.multiHitEnergyScaling === true && cardUsesXCostOrbLocal(card)
              ? ("X" as const)
              : galleryTierNumber(card, mHit.multiHitCount)
            : undefined;
        const hitsLegacy =
          poisonObj != null
            ? galleryTierNumber(card, poisonObj.hits) ??
              galleryTierNumber(card, poisonObj.times)
            : undefined;
        const hitCount: number | "X" | undefined =
          hitFromMulti !== undefined ? hitFromMulti : hitsLegacy;

        const debuffPoisonRand =
          poisonObj != null
            ? galleryTierOrEffectHasRandomFlag(poisonObj)
            : galleryTierOrEffectHasRandomFlag(raw);

        const p = getEffectDisplay("poison");
        const segments: GalleryGlyphSegment[] = [];
        if (debuffAoe) segments.push(segmentAoe());
        if (debuffPoisonRand) segments.push(segmentRandom());
        segments.push({ Icon: p.icon, iconClass: p.color });
        if (stacks != null) {
          segments.push({
            text: String(stacks),
            textClass: `${p.color} font-bold tabular-nums leading-none`,
          });
        }
        const showRepeat =
          hitCount === "X" ||
          (typeof hitCount === "number" && hitCount > 1);
        if (showRepeat) {
          const repeatText =
            hitCount === "X" ? "X" : typeof hitCount === "number" ? String(hitCount) : "";
          segments.push(
            { text: "×", textClass: MULTIHIT_INLINE_TIMES_CLASS },
            {
              text: repeatText,
              textClass: MULTIHIT_INLINE_COUNT_CLASS,
            },
          );
        } else if (stacks == null && typeof hitCount === "number") {
          segments.push({
            text: String(hitCount),
            textClass: `${p.color} font-bold tabular-nums leading-none`,
          });
        }

        const pfxPoison = `${debuffAoe ? "AoE · " : ""}${debuffPoisonRand ? "Random · " : ""}`;
        let label = `${pfxPoison}Poison`;
        if (stacks != null) {
          label =
            showRepeat && hitCount !== undefined
              ? hitCount === "X"
                ? `${pfxPoison}Poison ${stacks} × X`
                : `${pfxPoison}Poison ${stacks} × ${hitCount}`
              : `${pfxPoison}Poison ${stacks}`;
        } else if (hitCount != null) {
          label =
            hitCount === "X"
              ? `${pfxPoison}Poison × X`
              : `${pfxPoison}Poison × ${hitCount}`;
        }
        push({
          id: "debuff-poison",
          catalogKey: "POISON_STAT",
          label,
          clusterClass: clusterShellField("neutral"),
          segments,
        });
        continue;
      }

      const eff =
        kind === "vulnerable" || kind === "weak" ? kind : ("wound" as const);
      const d = getEffectDisplay(eff);
      const stacks = galleryTierNumber(card, raw);
      const debuffRand = galleryTierOrEffectHasRandomFlag(raw);
      const pfx = `${debuffAoe ? "AoE · " : ""}${debuffRand ? "Random · " : ""}`;
      const label = stacks != null ? `${pfx}${kind} ${stacks}` : `${pfx}${kind}`;
      if (stacks != null) {
        const segs: GalleryGlyphSegment[] = [];
        if (debuffAoe) segs.push(segmentAoe());
        if (debuffRand) segs.push(segmentRandom());
        segs.push(
          { Icon: d.icon, iconClass: d.color },
          {
            text: String(stacks),
            textClass: `${d.color} font-bold tabular-nums leading-none`,
          },
        );
        push({
          id: `debuff-${kind}`,
          label,
          clusterClass: clusterShellField("neutral"),
          segments: segs,
        });
      } else if (debuffAoe && debuffRand) {
        push({
          id: `debuff-${kind}`,
          label,
          clusterClass: clusterShellField("neutral"),
          segments: [segmentAoe(), segmentRandom(), { Icon: d.icon, iconClass: d.color }],
        });
      } else if (debuffAoe) {
        push({
          id: `debuff-${kind}`,
          label,
          clusterClass: clusterShellField("neutral"),
          segments: [segmentAoe(), { Icon: d.icon, iconClass: d.color }],
        });
      } else if (debuffRand) {
        push({
          id: `debuff-${kind}`,
          label,
          clusterClass: clusterShellField("neutral"),
          segments: [segmentRandom(), { Icon: d.icon, iconClass: d.color }],
        });
      } else {
        push({
          id: `debuff-${kind}`,
          label,
          Icon: d.icon,
          iconClass: d.color,
        });
      }
    }
  }

  const multi = c.multiHit;
  const hasMulti =
    multi != null &&
    typeof multi === "object" &&
    !Array.isArray(multi) &&
    Object.keys(multi as object).length > 0;

  if (hasMulti && card.damage != undefined && !("multiHitCount" in (multi as object))) {
    const mhSegs: GalleryGlyphSegment[] = [];
    const dmgRand =
      card.damage !== undefined &&
      typeof card.damage === "object" &&
      !Array.isArray(card.damage) &&
      galleryTierOrEffectHasRandomFlag(card.damage);
    if (dmgRand) mhSegs.push(segmentRandom());
    if (galleryDamageIsConditional(card)) mhSegs.push(segmentConditional());
    if (damageRowIsAoE(card)) mhSegs.push(segmentAoe());
    const mhIcon = STS_ICON_GLYPH.AOE_DAMAGE;
    mhSegs.push({ Icon: mhIcon.Icon, iconClass: "text-fuchsia-300" });
    push({
      id: "multi-hit",
      label: "Multi-hit",
      clusterClass: clusterShellField("damage"),
      segments: mhSegs,
      prefixDamageRow: true,
    });
  } else {
    const dmgG = buildDamageLegacyGlyph(card);
    if (dmgG) push(dmgG);
  }

  const bonusRaw = c.bonusDamage;
  if (bonusRaw != null) {
    const dmgVis = getEffectDisplay("damage");
    if (typeof bonusRaw === "number" && !Number.isNaN(bonusRaw)) {
      push({
        id: "bonus-damage",
        label: "Bonus damage",
        clusterClass: clusterShellField("damage"),
        segments: [
          { Icon: dmgVis.icon, iconClass: dmgVis.color },
          {
            text: String(bonusRaw),
            textClass: `${dmgVis.color} font-bold tabular-nums leading-none`,
          },
        ],
      });
    } else if (typeof bonusRaw === "object" && !Array.isArray(bonusRaw)) {
      const bn = galleryTierNumber(card, bonusRaw);
      const condBonus = isConditionedField(bonusRaw);
      const bonusRand = galleryTierOrEffectHasRandomFlag(bonusRaw);
      const bTrig =
        typeof (bonusRaw as Record<string, unknown>).trigger === "string"
          ? String((bonusRaw as Record<string, unknown>).trigger)
          : undefined;
      const segs: GalleryGlyphSegment[] = [];
      if (bonusRand) segs.push(segmentRandom());
      if (condBonus) segs.push(segmentConditional());
      segs.push(
        { Icon: dmgVis.icon, iconClass: dmgVis.color },
        {
          text: bn != null ? String(bn) : "?",
          textClass: `${dmgVis.color} font-bold tabular-nums leading-none`,
        },
      );
      push({
        id: "bonus-damage",
        label: bTrig ? `Bonus damage — ${bTrig}` : "Bonus damage",
        clusterClass: clusterShellField("damage"),
        segments: segs,
      });
    }
  }

  const bonusBlkRaw = c.bonusBlock;
  if (bonusBlkRaw != null) {
    const blkVis = getEffectDisplay("block");
    if (typeof bonusBlkRaw === "number" && !Number.isNaN(bonusBlkRaw)) {
      push({
        id: "bonus-block",
        label: "Bonus block",
        clusterClass: clusterShellField("block"),
        segments: [
          { Icon: blkVis.icon, iconClass: blkVis.color },
          {
            text: String(bonusBlkRaw),
            textClass: `${blkVis.color} font-bold tabular-nums leading-none`,
          },
        ],
      });
    } else if (typeof bonusBlkRaw === "object" && !Array.isArray(bonusBlkRaw)) {
      const bbN = galleryTierNumber(card, bonusBlkRaw);
      const condB = isConditionedField(bonusBlkRaw);
      const bbRand = galleryTierOrEffectHasRandomFlag(bonusBlkRaw);
      const bbTrig =
        typeof (bonusBlkRaw as Record<string, unknown>).trigger === "string"
          ? String((bonusBlkRaw as Record<string, unknown>).trigger)
          : undefined;
      const bbSegs: GalleryGlyphSegment[] = [];
      if (bbRand) bbSegs.push(segmentRandom());
      if (condB) bbSegs.push(segmentConditional());
      bbSegs.push(
        { Icon: blkVis.icon, iconClass: blkVis.color },
        {
          text: bbN != null ? String(bbN) : "?",
          textClass: `${blkVis.color} font-bold tabular-nums leading-none`,
        },
      );
      push({
        id: "bonus-block",
        label: bbTrig ? `Bonus block — ${bbTrig}` : "Bonus block",
        clusterClass: clusterShellField("block"),
        segments: bbSegs,
      });
    }
  }

  if (card.block != undefined) {
    const blk = getEffectDisplay("block");
    const blockRand =
      typeof card.block === "object" &&
      card.block !== null &&
      !Array.isArray(card.block) &&
      galleryTierOrEffectHasRandomFlag(card.block);
    if (blockIsConditional(card)) {
      const bRaw =
        card.block && typeof card.block === "object" && !Array.isArray(card.block)
          ? (card.block as Record<string, unknown>)
          : undefined;
      const bTrig =
        typeof bRaw?.trigger === "string" ? String(bRaw.trigger) : undefined;
      const blkN = galleryNumericField(card, "block");
      const segs: GalleryGlyphSegment[] = [];
      if (blockRand) segs.push(segmentRandom());
      segs.push(segmentConditional(), { Icon: blk.icon, iconClass: blk.color });
      if (blkN != null) {
        segs.push({
          text: String(blkN),
          textClass: `${blk.color} font-bold tabular-nums leading-none`,
        });
      }
      push({
        id: "block-combo",
        label: bTrig ? `Block — ${bTrig}` : "Block (conditional)",
        clusterClass: clusterShellField("block"),
        segments: segs,
      });
    } else if (blockRand) {
      push({
        id: "block",
        label: "Random · Block",
        clusterClass: clusterShellField("block"),
        segments: [segmentRandom(), { Icon: blk.icon, iconClass: blk.color }],
      });
    } else {
      push({
        id: "block",
        label: "Block",
        Icon: blk.icon,
        iconClass: blk.color,
      });
    }
  }

  return out;
}

/** Stat rows to hide when legacy glyphs already show the same numbers in a cluster. */
function legacyGallerySuppressStats(card: Card): GallerySuppressedStats {
  const out: GallerySuppressedStats = {};
  const eg = energyGainNode(card);
  if (
    eg !== null &&
    typeof eg === "object" &&
    !Array.isArray(eg) &&
    (eg as Record<string, unknown>).conditioned === true
  ) {
    out.energyGain = true;
  }
  return out;
}

export function galleryGlyphsInsideCardOnly(
  card: Card,
  glyphs: GalleryGlyph[],
): GalleryGlyph[] {
  const c = card as Record<string, unknown>;
  const drawCond = galleryDrawIsConditional(card);

  return glyphs.filter((g) => {
    // When a field has hideNumber:true the stat strip is suppressed, so keep the
    // glyph chip — it's the only remaining way to show the icon for that field.
    if (g.id === "draw-main"  && card.draw != undefined && !drawCond          && !fieldHasHideNumber(card.draw)) return false;
    if (g.id === "block"      && card.block != undefined                       && !fieldHasHideNumber(c.block))   return false;
    if (g.id === "damage"     && card.damage != undefined                      && !fieldHasHideNumber(c.damage))  return false;
    if (g.id === "heal-main"  && c.heal != undefined                           && !fieldHasHideNumber(c.heal))    return false;
    if (g.id === "focus-main" && c.focus != undefined                          && !fieldHasHideNumber(c.focus))   return false;
    return true;
  });
}

/** True when a field value object carries `hideNumber: true`. */
function fieldHasHideNumber(val: unknown): boolean {
  if (!val || typeof val !== "object" || Array.isArray(val)) return false;
  return (val as Record<string, unknown>).hideNumber === true;
}

/** Append custom glyphs that match the given card's fields. */
function appendCustomGlyphs(card: Card, glyphs: GalleryGlyph[]): GalleryGlyph[] {
  const customGlyphs = loadCustomGlyphs();
  if (customGlyphs.length === 0) return glyphs;
  const cardRec = card as Record<string, unknown>;
  const out = [...glyphs];
  for (const cg of customGlyphs) {
    const link = cg.fieldLink;
    if (link.mode === "none") continue;
    const fn = link.fieldName;
    const fieldVal = cardRec[fn] ?? cardRec[fn.charAt(0).toUpperCase() + fn.slice(1)];
    let show = false;
    if (link.mode === "boolean")  show = galleryTieredBoolActive(card, fieldVal);
    if (link.mode === "presence") show = fieldVal != null;
    if (link.mode === "numeric")  show = galleryTierNumber(card, fieldVal) !== undefined;
    if (!show) continue;
    const num =
      link.mode === "numeric" && link.showNumber
        ? galleryTierNumber(card, fieldVal)
        : undefined;
    const svgData =
      cg.source.type === "svg"
        ? cg.source.svgData
        : cg.source.type === "url"
          ? cg.source.cachedSvg
          : undefined;
    out.push({
      id: `custom-${cg.key}`,
      catalogKey: cg.key,
      label: num !== undefined ? `${cg.shortLabel} ${num}` : cg.shortLabel,
      lucideIconName: cg.source.type === "lucide" ? cg.source.iconName : undefined,
      svgData,
      iconClass: cg.iconClass,
      numericValue: num,
      // hideNumber: either the glyph definition sets it, or the card field data does
      hideNumber: (cg.hideNumber === true || fieldHasHideNumber(fieldVal)) ? true : undefined,
      tooltip: cg.tooltip,
    });
  }
  return out;
}

/** Glyph id-prefix → accessor for the card field that drives this glyph's number. */
const GLYPH_ID_PREFIX_FIELD: Array<{
  prefix: string;
  getField: (c: Record<string, unknown>) => unknown;
}> = [
  { prefix: "draw",        getField: (c) => c.draw },
  { prefix: "block",       getField: (c) => c.block },
  { prefix: "gain-energy", getField: (c) => c.energyGain ?? c.gainEnergy },
  { prefix: "scry",        getField: (c) => c.scry },
  { prefix: "hp-cost",     getField: (c) => c.hpcost ?? c.hpCost },
  { prefix: "artifact",    getField: (c) => c.artifact },
  { prefix: "buffer",      getField: (c) => c.buffer },
  { prefix: "mantra",      getField: (c) => c.mantra },
  { prefix: "discard",     getField: (c) => c.discardEffect },
  { prefix: "structured-random-discard", getField: (c) => c.discardEffect },
];

/** CatalogKey → accessor for the card field that drives this glyph's number. */
const GLYPH_CATALOG_FIELD: Partial<Record<string, (c: Record<string, unknown>) => unknown>> = {
  DRAW_ICON:        (c) => c.draw,
  DISCARD_ICON:     (c) => c.discardEffect,
  GAIN_ENERGY_ICON: (c) => c.energyGain ?? c.gainEnergy,
  SCRY_ICON:        (c) => c.scry,
  HP_COST:          (c) => c.hpcost ?? c.hpCost,
};

/**
 * Apply `hideNumber` from card field data.
 * When a card field (e.g. `draw: { base: 3, hideNumber: true }`) carries `hideNumber: true`,
 * the corresponding glyph gets `hideNumber: true` for this specific card.
 */
function applyFieldLevelHideNumbers(card: Card, glyphs: GalleryGlyph[]): GalleryGlyph[] {
  const c = card as Record<string, unknown>;
  return glyphs.map((g) => {
    if (g.hideNumber) return g; // already set by override or custom glyph definition
    let fieldVal: unknown = undefined;
    // Check by catalogKey first
    if (g.catalogKey) {
      const fn = GLYPH_CATALOG_FIELD[g.catalogKey];
      if (fn) fieldVal = fn(c);
    }
    // Fallback to id-prefix matching
    if (fieldVal === undefined) {
      for (const { prefix, getField } of GLYPH_ID_PREFIX_FIELD) {
        if (g.id.startsWith(prefix)) { fieldVal = getField(c); break; }
      }
    }
    return fieldHasHideNumber(fieldVal) ? { ...g, hideNumber: true } : g;
  });
}

/** Apply per-catalogKey hideNumber overrides from localStorage (set via Glyph Editor). */
function applyBuiltinOverrides(glyphs: GalleryGlyph[]): GalleryGlyph[] {
  const overrides = loadBuiltinGlyphOverrides();
  if (Object.keys(overrides).length === 0) return glyphs;
  return glyphs.map((g) => {
    if (!g.catalogKey) return g;
    const ov = overrides[g.catalogKey];
    return ov ? { ...g, hideNumber: ov.hideNumber ?? g.hideNumber } : g;
  });
}

/** Gallery preview: structured clusters when applicable, else legacy infer + dedupe. */
export function inferGalleryCardEffects(card: Card): {
  glyphs: GalleryGlyph[];
  suppressStats: GallerySuppressedStats;
} {
  function finalize(raw: GalleryGlyph[]): GalleryGlyph[] {
    return applyFieldLevelHideNumbers(card, applyBuiltinOverrides(appendCustomGlyphs(card, finalizeGlyphDisplayOrder(card, raw))));
  }

  /** Suppress stat strip values when the card field carries `hideNumber: true`. */
  function fieldStatSuppression(base: GallerySuppressedStats): GallerySuppressedStats {
    const c = card as Record<string, unknown>;
    const out = { ...base };
    if (fieldHasHideNumber(c.block)) out.block = true;
    if (fieldHasHideNumber(c.damage)) out.damage = true;
    if (fieldHasHideNumber(c.draw)) out.draw = true;
    if (fieldHasHideNumber(energyGainNode(card))) out.energyGain = true;
    if (fieldHasHideNumber(c.heal)) out.heal = true;
    if (fieldHasHideNumber(c.focus)) out.focus = true;
    if (fieldHasHideNumber(c.hpcost ?? c.hpCost)) out.hpcost = true;
    return out;
  }

  if (card.type === "Potion") {
    return { glyphs: finalize([]), suppressStats: {} };
  }

  const structured = tryStructuredGalleryGlyphs(card);
  if (structured) {
    return {
      glyphs: finalize(structured.glyphs),
      suppressStats: fieldStatSuppression(structured.suppressStats),
    };
  }
  const legacyGlyphs = inferLegacyCardGalleryGlyphs(card);
  const insideOnly = galleryGlyphsInsideCardOnly(card, legacyGlyphs);
  const glyphs = finalize(insideOnly);
  const suppressStats: GallerySuppressedStats = fieldStatSuppression({ ...legacyGallerySuppressStats(card) });
  if (
    glyphs.some(
      (g) => g.id === "gain-energy-main" && (g.segments?.length ?? 0) > 0,
    )
  ) {
    suppressStats.energyGain = true;
  }
  if (
    glyphs.some(
      (g) => g.id === "hp-cost-n" && (g.segments?.length ?? 0) > 0,
    )
  ) {
    suppressStats.hpcost = true;
  }
  if (glyphs.some((g) => g.id === "block-combo")) {
    suppressStats.block = true;
  }
  if (glyphs.some((g) => g.id === "draw-conditional-combo")) {
    suppressStats.draw = true;
  }
  return { glyphs, suppressStats };
}

/** True when gallery treats this card’s damage as AoE (attack + “all enemies” in text). */
export function galleryDamageRowIsAoE(card: Card): boolean {
  return damageRowIsAoE(card);
}

/** @deprecated Prefer inferGalleryCardEffects for suppression; glyphs-only helper */
export function inferCardGalleryGlyphs(card: Card): GalleryGlyph[] {
  return inferGalleryCardEffects(card).glyphs;
}
