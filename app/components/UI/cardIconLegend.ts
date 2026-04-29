import type { LucideIcon } from "lucide-react";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import { STS_ICON_GLYPH } from "@/app/card-design-gallery/galleryStsGlyphs";

export type CardIconLegendItem = {
  id: string;
  Icon: LucideIcon;
  iconClass: string;
  label: string;
};

const STAT_KEYS = [
  "damage",
  "block",
  "draw",
  "energygain",
  "heal",
  "focus",
  "weak",
  "vulnerable",
  "poison",
  "hpcost",
] as const;

/** Short labels shown in the top-bar legend (catalog `shortLabel` is often terse). */
const LEGEND_LABEL_OVERRIDES: Partial<Record<keyof typeof STS_ICON_GLYPH, string>> = {
  COST_MANIP: "Cost manipulation",
  UPGRADE_CARD: "Upgrade cards",
  CAN_ADD_CARDS: "Adds cards",
};

/** Stable STS catalog keys; skips DRAW_ICON (same meaning as stat “Draw”). */
const STS_LEGEND_KEYS: (keyof typeof STS_ICON_GLYPH)[] = [
  "LIGHTNING_ORB",
  "FROST_ORB",
  "DARK_ORB",
  "PLASMA_ORB",
  "KEY_INNATE",
  "KEY_ETHEREAL",
  "KEY_RETAIN",
  "KEY_UNPLAYABLE",
  "DISCARD_ICON",
  "EVOKE_ICON",
  "CONDITIONAL_MARKER",
  "AOE_ICON",
  "AOE_DAMAGE",
  "RANDOM_ICON",
  "EXHAUST_SELF",
  "ANY_ORB",
  "SAME_ORB_AS_EVOKED",
  "COST_MANIP",
  "UPGRADE_CARD",
  "CAN_ADD_CARDS",
  "ADD_CARD",
  "SCRY_ICON",
  "LOSE_STRENGTH",
];

/** Icons shown on cards / STS reference — for top-bar legend. */
export function getCardEffectLegendItems(): CardIconLegendItem[] {
  const fromStats: CardIconLegendItem[] = STAT_KEYS.map((k) => {
    const d = getEffectDisplay(k);
    return {
      id: `stat-${k}`,
      Icon: d.icon,
      iconClass: d.color,
      label: k === "hpcost" ? "HP cost" : d.fullLabel,
    };
  });

  const fromSts: CardIconLegendItem[] = STS_LEGEND_KEYS.map((key) => {
    const meta = STS_ICON_GLYPH[key];
    return {
      id: key,
      Icon: meta.Icon,
      iconClass: meta.iconClass,
      label: LEGEND_LABEL_OVERRIDES[key] ?? meta.shortLabel,
    };
  });

  return [...fromStats, ...fromSts];
}
