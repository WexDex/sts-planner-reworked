import React, { useMemo } from "react";
import { Card } from "@/app/types/gameTypes";
import { LOCATION } from "@/app/types/types";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import {
  getDamageStats,
  getBlockStats,
  getFormattedDescription,
} from "@/app/utils/utils";
import { useGameManager } from "@/app/context/GameContext";
import { useLegendHighlight } from "@/app/context/LegendHighlightContext";
import {
  DEFAULT_CARD_VISUAL_VARIANT,
  type CardTypeStyle,
  type CardVisualVariant,
  getCardVariantChrome,
} from "@/app/components/UI/cardVisualVariants";
import {
  galleryBlockRowIsConditional,
  galleryDamageRowIsAoE,
  inferGalleryCardEffects,
  type GalleryGlyph,
  type GallerySuppressedStats,
} from "@/app/card-design-gallery/galleryStsGlyphs";
import { resolveGameCardChromeStyle } from "@/app/card-design-gallery/galleryCharacterCardStyles";

interface GameCardProps {
  card: Card;
  size?: "small" | "medium" | "large";
  index: number;
  location: LOCATION;
  /** When false, no selection toggle and no hover “play” motion (for galleries / previews). */
  interactive?: boolean;
  /** When true (default), hovering syncs the top-bar symbol legend to this card. */
  legendHover?: boolean;
  /** Visual chrome preset; default matches the original glossy gradient look. */
  variant?: CardVisualVariant;
  /**
   * Design gallery only: extra effect icons (draw/discard/AoE/orbs, etc.) rendered in the
   * same stat column as damage/block. Omit duplicates of numeric stats already shown.
   */
  galleryEffectGlyphs?: GalleryGlyph[];
  /** Card-design-gallery only: hide stat rows duplicated by `galleryEffectGlyphs` clusters. */
  gallerySuppressStats?: GallerySuppressedStats;
  /** Card-design-gallery only: use character-based chrome instead of `card.type` colors. */
  galleryChromeStyle?: CardTypeStyle;
}

const SIZE_STYLES = {
  small: {
    frame: "w-[6.25rem] h-[8.5rem] rounded-xl",
    costOrb: "h-7 w-7 -left-1.5 -top-1.5 ring-2 ring-slate-950/80",
    costText: "text-sm font-extrabold tabular-nums",
    bodyPad: "px-1.5 pb-1 pt-1",
    nameBand: "mt-2.5 rounded-md px-1.5 py-1",
    name: "text-[10px] font-bold leading-tight tracking-tight",
    upgradedBadge: "text-[9px]",
    changedPill: "mt-0.5 px-1 py-px text-[8px] font-semibold tracking-wide",
    typeLabel: "pt-1 text-[8px] font-semibold uppercase tracking-widest",
    galleryIcon: "h-3 w-3",
    galleryText: "text-[10px] font-bold",
  },

  medium: {
    frame: "w-[8.25rem] h-[12rem] rounded-xl",
    costOrb: "h-8 w-8 -left-1.5 -top-1.5 ring-[2.5px] ring-slate-950/85",
    costText: "text-base font-extrabold tabular-nums",
    bodyPad: "px-2 pb-1.5 pt-1",
    nameBand: "mt-3.5 rounded-md px-2 py-1",
    name: "text-[11px] font-bold leading-tight tracking-tight",
    upgradedBadge: "text-[10px]",
    changedPill: "mt-0.5 px-1.5 py-px text-[9px] font-semibold tracking-wide",
    statMain: "text-[13px] font-bold tabular-nums",
    statSide: "text-[10px] font-semibold tabular-nums leading-none",
    statIcon: "h-3.5 w-3.5 shrink-0",
    midGap: "my-1 gap-1",
    descBox: "rounded-md px-1.5 py-1.5 text-[10px] font-medium leading-snug tracking-tight",
    typeLabel: "pt-1 text-[9px] font-semibold uppercase tracking-[0.1em]",
    galleryIcon: "h-3.5 w-3.5",
    galleryText: "text-[13px] font-bold",
  },
  large: {
    frame: "w-[10.5rem] h-[15.25rem] rounded-2xl",
    costOrb: "h-9 w-9 -left-1.5 -top-1.5 ring-[3px] ring-slate-950/90",
    costText: "text-lg font-extrabold tabular-nums",
    bodyPad: "px-2 pb-1.5 pt-1",
    nameBand: "mt-5 rounded-lg px-2 py-1.5",
    name: "text-[13px] font-bold leading-snug tracking-tight",
    upgradedBadge: "text-xs",
    changedPill: "mt-1 px-1.5 py-0.5 text-[9px] font-bold tracking-wide",
    statMain: "text-[15px] font-bold tabular-nums",
    statSide: "text-[11px] font-semibold tabular-nums leading-none",
    statIcon: "h-4 w-4 shrink-0",
    midGap: "my-1.5 gap-1",
    descBox: "rounded-md px-2 py-2 text-[11px] font-medium leading-snug tracking-tight",
    typeLabel: "pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
    galleryIcon: "h-4 w-4",
    galleryText: "text-[15px] font-bold",
  },
} as const;

function renderGalleryGlyphCluster(
  g: GalleryGlyph,
  iconCls: string,
  textBaseCls: string,
  opts?: { stripClusterShell?: boolean },
): React.ReactNode {
  const fallbackShell =
    "rounded-md border border-white/15 bg-black/20 px-1 py-0.5 shadow-sm";
  const shell = opts?.stripClusterShell
    ? ""
    : (g.clusterClass ?? fallbackShell);
  const row = ["inline-flex", "items-center", "gap-0.5", shell, textBaseCls]
    .filter(Boolean)
    .join(" ");

  if (g.segments?.length) {
    return (
      <span title={g.label} className={row}>
        {g.segments.map((s, i) => (
          <React.Fragment key={i}>
            {s.Icon ? (
              <s.Icon
                className={`${iconCls} shrink-0 ${s.iconClass ?? ""}`}
                aria-hidden
              />
            ) : null}
            {s.text != null && s.text !== "" ? (
              <span className={s.textClass ?? ""}>{s.text}</span>
            ) : null}
          </React.Fragment>
        ))}
      </span>
    );
  }

  if (g.Icon) {
    return (
      <span
        title={g.label}
        className={["inline-flex", "items-center", "gap-0.5", shell, g.iconClass ?? "", textBaseCls]
          .filter(Boolean)
          .join(" ")}
      >
        <g.Icon className={`${iconCls} shrink-0`} aria-hidden />
      </span>
    );
  }

  return null;
}

export default function STSCard({
  card,
  index,
  location,
  size = "large",
  interactive = true,
  legendHover = true,
  variant = DEFAULT_CARD_VISUAL_VARIANT,
  galleryEffectGlyphs,
  gallerySuppressStats,
  galleryChromeStyle,
}: GameCardProps) {
  const { toggleCardSelection } = useGameManager();
  const { setHoveredLegendCard } = useLegendHighlight();
  const inferredGallery = useMemo(() => inferGalleryCardEffects(card), [card]);
  const mergedEffectGlyphs =
    galleryEffectGlyphs ??
    (inferredGallery.glyphs.length > 0 ? inferredGallery.glyphs : undefined);
  const mergedSuppressStats =
    gallerySuppressStats ??
    (Object.keys(inferredGallery.suppressStats).length > 0
      ? inferredGallery.suppressStats
      : undefined);

  const styles = resolveGameCardChromeStyle(card, galleryChromeStyle);
  const sz =
    size === "small"
      ? SIZE_STYLES.small
      : size === "medium"
        ? SIZE_STYLES.medium
        : SIZE_STYLES.large;
  /** Stats + description typography (only for medium & large — small is name + type only). */
  const stat =
    size === "small" ? null : size === "medium" ? SIZE_STYLES.medium : SIZE_STYLES.large;

  function getValue(
    field:
      | "damage"
      | "block"
      | "draw"
      | "cost"
      | "takeDamage"
      | "energyGain"
      | "blockOnExhaust"
      | "vulnerable"
      | "heal"
      | "focus"
      | "hpcost",
  ): number | undefined {
    const c = card as Record<string, unknown>;
    const raw: unknown =
      field === "energyGain"
        ? card.energyGain ?? c.gainEnergy
        : field === "hpcost"
          ? c.hpcost ?? c.hpCost
          : c[field];
    if (raw === undefined) return undefined;

    if (typeof raw === "number") {
      return raw;
    }

    if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
      const v = raw as { base?: number; upgraded?: number };
      if (card.isUpgraded && v.upgraded !== undefined) {
        return v.upgraded;
      }
      if (v.base !== undefined) return v.base;
      if (v.upgraded !== undefined) return v.upgraded;
    }

    return undefined;
  }

  function getFullDamage() {
    if (card.damage === undefined) return undefined;
    return getDamageStats(getValue("damage"));
  }
  function getFullBlock() {
    if (card.block === undefined) return undefined;
    return getBlockStats(getValue("block"));
  }

  /** Root `xCost` takes priority over numeric `cost` for the orb (Slay-the-Spire-style X cards). */
  function cardUsesXCost(): boolean {
    const v = (card as Record<string, unknown>).xCost;
    if (v === undefined || v === null || v === false) return false;
    if (typeof v === "number" && v === 0) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
  }

  /** Hide cost orb for curse / status / STS `unplayable` (Necronomicurse, etc.). */
  const hideCostOrb =
    card.type === "Curse" ||
    card.type === "Status" ||
    (card as Record<string, unknown>).unplayable === true;

  const chrome = getCardVariantChrome({
    variant,
    typeStyles: styles,
    interactive,
    isSelected: !!card.isSelected,
  });

  const rawGalleryGlyphs = mergedEffectGlyphs ?? [];
  const prefixDamageGlyphs = stat
    ? rawGalleryGlyphs.filter((g) => g.prefixDamageRow)
    : [];
  const suffixGalleryGlyphs = stat
    ? rawGalleryGlyphs.filter((g) => !g.prefixDamageRow)
    : rawGalleryGlyphs;

  const showDamageStatBlock =
    card.damage !== undefined && !mergedSuppressStats?.damage;
  const showDamageRow = showDamageStatBlock || prefixDamageGlyphs.length > 0;
  const unifiedDamageAoE = galleryDamageRowIsAoE(card) && showDamageRow;
  const damageAoEGroupClass = unifiedDamageAoE
    ? "inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-rose-400/25 bg-rose-950/45 px-1.5 py-1 shadow-sm"
    : "flex flex-wrap items-center justify-center gap-1";

  const blockConditionalShell =
    galleryBlockRowIsConditional(card) && card.block !== undefined;
  const blockRowGroupClass = blockConditionalShell
    ? "inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-blue-400/25 bg-blue-950/40 px-1.5 py-1 shadow-sm"
    : "flex items-center gap-1";

  return (
    <div
      data-sts-card=""
      onMouseEnter={
        legendHover
          ? () => {
              setHoveredLegendCard(card);
            }
          : undefined
      }
      onMouseLeave={
        legendHover
          ? () => {
              setHoveredLegendCard(null);
            }
          : undefined
      }
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation();
              toggleCardSelection(location, index);
            }
          : undefined
      }
      className={`${sz.frame} ${chrome.root}`}
    >
      <div className={chrome.topLine} />

      <div className={chrome.innerRim} />

      {!hideCostOrb && (
        <div
          className={`absolute z-10 flex items-center justify-center rounded-full border-2 border-slate-950 ${sz.costOrb} ${styles.costBg} ${styles.costGlow} shadow-lg ${chrome.costOrbExtra}`}
        >
          <span className={`${sz.costText} text-white drop-shadow-md`}>
            {cardUsesXCost() ? "X" : getValue("cost")}
          </span>
        </div>
      )}

      <div className={`relative flex h-full flex-col ${sz.bodyPad}`}>
        <div
          className={`${styles.nameBg} ${sz.nameBand} border ${styles.accentBorder} backdrop-blur-sm transition-all duration-300 hover:brightness-125 ${chrome.nameBandExtra}`}
        >
          <div
            className={`${sz.name} flex flex-col items-center justify-center text-center text-white`}
          >
            <span>
              <span
                className={
                  card.isUpgraded ? "text-emerald-300 animate-pulse" : ""
                }
              >
                {card.name}
              </span>
              {card.isUpgraded && (
                <span className={`${sz.upgradedBadge} ml-0.5 text-emerald-400`}>
                  +
                </span>
              )}
            </span>
            {card.isChanged && (
              <span
                className={`${sz.changedPill} inline-block rounded-full bg-amber-400/25 text-amber-200 animate-bounce-pop`}
              >
                CHANGED
              </span>
            )}
          </div>
        </div>

        {!stat && rawGalleryGlyphs.length > 0 ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-0.5"
            aria-label="Extra effects"
          >
            <div className="flex flex-wrap items-center justify-center gap-1">
              {rawGalleryGlyphs.map((g) => (
                <React.Fragment key={g.id}>
                  {renderGalleryGlyphCluster(g, SIZE_STYLES.small.galleryIcon, "text-[10px]")}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : null}

        {stat && (
          <div
            className={`flex flex-1 flex-col items-center justify-center ${stat.midGap}`}
          >
            {showDamageRow ? (
              <div className={damageAoEGroupClass}>
                {prefixDamageGlyphs.map((g) => (
                  <React.Fragment key={g.id}>
                    {renderGalleryGlyphCluster(
                      g,
                      stat.galleryIcon,
                      stat.galleryText,
                      unifiedDamageAoE ? { stripClusterShell: true } : undefined,
                    )}
                  </React.Fragment>
                ))}
                {showDamageStatBlock ? (
                  <span
                    className={`${stat.statMain} inline-flex items-center gap-0.5 ${getEffectDisplay("damage").color}`}
                  >
                    {React.createElement(getEffectDisplay("damage").icon, {
                      className: `${stat.statIcon} inline`,
                    })}
                    {getFullDamage()?.dmg}
                  </span>
                ) : null}
              </div>
            ) : null}
            {card.block !== undefined && !mergedSuppressStats?.block && (
              <div className={blockRowGroupClass}>
                <span
                  className={`${stat.statMain} flex items-center gap-0.5 ${getEffectDisplay("block").color}`}
                >
                  {React.createElement(getEffectDisplay("block").icon, {
                    className: `${stat.statIcon} inline`,
                  })}
                  {getFullBlock()?.block}
                </span>
                <span
                  className={`${stat.statSide} ${getEffectDisplay("frail").color}`}
                >
                  {getFullBlock()?.frail}
                </span>
              </div>
            )}
            {card.blockOnExhaust !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={`${stat.statMain} flex items-center gap-0.5 ${getEffectDisplay("block").color}`}
                >
                  {React.createElement(getEffectDisplay("block").icon, {
                    className: `${stat.statIcon} inline`,
                  })}
                  {getValue("blockOnExhaust")}
                </span>
                <span
                  className={`${stat.statSide} ${getEffectDisplay("frail").color}`}
                >
                  {getFullBlock()?.frail}
                </span>
              </div>
            )}
            {card.draw !== undefined && !mergedSuppressStats?.draw && (
              <div className="flex items-center gap-1">
                <span
                  className={`${stat.statMain} flex items-center gap-0.5 ${getEffectDisplay("draw").color}`}
                >
                  {React.createElement(getEffectDisplay("draw").icon, {
                    className: `${stat.statIcon} inline`,
                  })}
                  {getValue("draw")}
                </span>
              </div>
            )}
            {card.takeDamage !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={`${stat.statMain} flex items-center gap-0.5 ${styles.statColor}`}
                >
                  {React.createElement(getEffectDisplay("takedamage").icon, {
                    className: `${stat.statIcon} inline`,
                  })}
                  {getValue("takeDamage")}
                </span>
              </div>
            )}
            {getValue("hpcost") !== undefined && !mergedSuppressStats?.hpcost && (
              <div className="flex items-center gap-1">
                <span
                  className={`${stat.statMain} flex items-center gap-0.5 ${getEffectDisplay("hpcost").color}`}
                >
                  {React.createElement(getEffectDisplay("hpcost").icon, {
                    className: `${stat.statIcon} inline`,
                  })}
                  {getValue("hpcost")}
                </span>
              </div>
            )}
            {(card.energyGain != null ||
              (card as Record<string, unknown>).gainEnergy != null) &&
              !mergedSuppressStats?.energyGain && (
              <div className="flex items-center gap-1">
                <span
                  className={`${stat.statMain} flex items-center gap-0.5 ${styles.statColor}`}
                >
                  {React.createElement(getEffectDisplay("energygain").icon, {
                    className: `${stat.statIcon} inline`,
                  })}
                  {getValue("energyGain")}
                </span>
              </div>
            )}
            {(card as Record<string, unknown>).heal != null && !mergedSuppressStats?.heal && (
              <div className="flex items-center gap-1">
                <span
                  className={`${stat.statMain} flex items-center gap-0.5 ${getEffectDisplay("heal").color}`}
                >
                  {React.createElement(getEffectDisplay("heal").icon, {
                    className: `${stat.statIcon} inline`,
                  })}
                  {getValue("heal")}
                </span>
              </div>
            )}
            {(card as Record<string, unknown>).focus != null && !mergedSuppressStats?.focus && (
              <div className="flex items-center gap-1">
                <span
                  className={`${stat.statMain} flex items-center gap-0.5 ${getEffectDisplay("focus").color}`}
                >
                  {React.createElement(getEffectDisplay("focus").icon, {
                    className: `${stat.statIcon} inline`,
                  })}
                  {getValue("focus")}
                </span>
              </div>
            )}
            {suffixGalleryGlyphs.length > 0 ? (
              <div
                className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
                aria-label="Extra effects"
              >
                {suffixGalleryGlyphs.map((g) => (
                  <React.Fragment key={g.id}>
                    {renderGalleryGlyphCluster(
                      g,
                      stat.galleryIcon,
                      stat.galleryText,
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {stat && card.description && (
          <div
            className={`${styles.nameBg} ${stat.descBox} border ${styles.accentBorder} text-center text-slate-200/95 backdrop-blur-sm ${chrome.descBoxExtra}`}
          >
            {getFormattedDescription(card.description, card)}
          </div>
        )}

        <div
          className={`${sz.typeLabel} ${styles.typeColor} mt-auto text-center opacity-80 ${chrome.typeLabelExtra}`}
        >
          {card.type}
        </div>
      </div>

      <div className={chrome.bottomLine} />
    </div>
  );
}
