import React, { useMemo } from "react";
import { Card } from "@/app/types/gameTypes";
import { LOCATION } from "@/app/types/types";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import {
  formatBlockStatTitle,
  formatDamageStatTitle,
  getBlockStats,
  getDamageStats,
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
  MULTIHIT_INLINE_COUNT_CLASS,
  MULTIHIT_INLINE_TIMES_CLASS,
  damageMultihitInlineHitLabel,
  galleryDamageClusterShellClass,
  galleryDamageRowIsAoE,
  galleryTierNumber,
  galleryStatStripKeywordLeadingAndRest,
  inferGalleryCardEffects,
  multihitDamageRowLeadingSegments,
  type GalleryGlyph,
  type GalleryGlyphSegment,
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

function usesEnergyScalingDamageMultihit(card: Card): boolean {
  const mh = (card as Record<string, unknown>).multiHit;
  return (
    mh != null &&
    typeof mh === "object" &&
    !Array.isArray(mh) &&
    (mh as Record<string, unknown>).multiHitEnergyScaling === true
  );
}

function cardUsesXCostOrb(card: Card): boolean {
  const v = (card as Record<string, unknown>).xCost;
  if (v === undefined || v === null || v === false) return false;
  if (typeof v === "number" && v === 0) return false;
  if (typeof v === "string" && v.trim() === "") return false;
  return true;
}

function renderLeadingGlyphSegments(
  segments: GalleryGlyphSegment[],
  iconCls: string,
): React.ReactNode {
  return segments.map((s, i) => (
    <React.Fragment key={i}>
      {s.Icon ? (
        <s.Icon className={`${iconCls} shrink-0 ${s.iconClass ?? ""}`} aria-hidden />
      ) : null}
      {s.text != null && s.text !== "" ? (
        <span className={s.textClass ?? ""}>{s.text}</span>
      ) : null}
    </React.Fragment>
  ));
}

/** Tier-resolved damage number only (multihit count is shown separately after the icon). */
function attackDamageStatDisplay(card: Card): string | undefined {
  const n = galleryTierNumber(card, card.damage);
  if (n != null) {
    return String(n);
  }
  const raw = card.damage;
  if (typeof raw === "number" && !Number.isNaN(raw)) return String(raw);
  return undefined;
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

/** Block + optional frail tier: dark clustered chip (aligned with gallery glyph fallback shell). */
const BLOCK_FRAIL_CLUSTER_CLASS =
  "inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-white/15 bg-black/20 px-1 py-0.5 shadow-sm";

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

  function getFullBlock() {
    if (card.block === undefined) return undefined;
    return getBlockStats(getValue("block"));
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
  const prefixDamageGlyphsFiltered = prefixDamageGlyphs.filter(
    (g) =>
      !(
        g.id === "multi-hit" &&
        usesEnergyScalingDamageMultihit(card) &&
        cardUsesXCostOrb(card)
      ),
  );
  const suffixGalleryGlyphs = stat
    ? rawGalleryGlyphs.filter((g) => !g.prefixDamageRow)
    : rawGalleryGlyphs;

  const statStripLeadingAndRest =
    stat == null
      ? { keywordLeading: [] as GalleryGlyph[], rest: [] as GalleryGlyph[] }
      : galleryStatStripKeywordLeadingAndRest(suffixGalleryGlyphs);

  // #region agent log
  if (stat && card.name === "Boot Sequence") {
    fetch("http://127.0.0.1:7283/ingest/08b9d505-d660-4eb9-b23f-47e9eb90cb11", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "2826d0",
      },
      body: JSON.stringify({
        sessionId: "2826d0",
        runId: "post-fix",
        hypothesisId: "A",
        location: "Card.tsx:statStripPartition",
        message: "keywordLeading before stats; rest after",
        data: {
          keywordLeadingIds: statStripLeadingAndRest.keywordLeading.map((g) => g.id),
          restIds: statStripLeadingAndRest.rest.map((g) => g.id),
          hasBlockStatJsxAfterKeywords: card.block !== undefined,
          statSize: size,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

  const damageStatLabel = attackDamageStatDisplay(card);
  const damageFormulaBase = galleryTierNumber(card, card.damage);
  const attackDamageBreakdown =
    card.type === "Attack" && typeof damageFormulaBase === "number"
      ? getDamageStats(damageFormulaBase)
      : null;

  const damageStatTooltip =
    (() => {
      const formula = formatDamageStatTitle(
        typeof damageFormulaBase === "number" ? damageFormulaBase : undefined,
        card.type,
      );
      if (damageStatLabel && formula) return `${damageStatLabel} — ${formula}`;
      if (formula) return formula;
      return damageStatLabel ? `Damage ${damageStatLabel}` : undefined;
    })();

  const multihitHitLabel = stat ? damageMultihitInlineHitLabel(card) : null;
  const multihitLeadSegs =
    multihitHitLabel != null ? multihitDamageRowLeadingSegments(card) : [];

  const showDamageStatBlock =
    card.damage !== undefined && !mergedSuppressStats?.damage;
  const showDamageRow =
    showDamageStatBlock || prefixDamageGlyphsFiltered.length > 0;
  const unifiedDamageAoE = galleryDamageRowIsAoE(card) && showDamageRow;
  const damageAoEGroupClass = unifiedDamageAoE
    ? "inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-rose-400/25 bg-rose-950/45 px-1.5 py-1 shadow-sm"
    : "flex flex-wrap items-center justify-center gap-1";

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
            {cardUsesXCostOrb(card) ? "X" : getValue("cost")}
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
            className={`flex flex-1 flex-wrap items-center justify-center content-center gap-x-2 gap-y-1 ${stat.midGap}`}
            aria-label="Card stats"
          >
            {statStripLeadingAndRest.keywordLeading.map((g) => (
              <React.Fragment key={g.id}>
                {renderGalleryGlyphCluster(
                  g,
                  stat.galleryIcon,
                  stat.galleryText,
                )}
              </React.Fragment>
            ))}
            {showDamageRow ? (
              <div className={damageAoEGroupClass}>
                {prefixDamageGlyphsFiltered.map((g) => (
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
                  multihitHitLabel != null ? (
                    attackDamageBreakdown ? (
                      <span
                        className={`${galleryDamageClusterShellClass} inline-flex max-w-full flex-row items-center gap-x-0.5 ${stat.statMain}`}
                        title={damageStatTooltip}
                      >
                        {renderLeadingGlyphSegments(multihitLeadSegs, stat.galleryIcon)}
                        <span
                          className={`inline-flex items-center gap-0.5 text-lg ${getEffectDisplay("damage").color}`}
                        >
                          {React.createElement(getEffectDisplay("damage").icon, {
                            className: `${stat.statIcon} inline shrink-0`,
                          })}
                          {damageStatLabel ?? "?"}
                        </span>
                        <span
                          className="flex flex-col items-center justify-center leading-none text-sm font-semibold tabular-nums tracking-tight"
                          title="Weak (top) · Vulnerable (bottom)"
                        >
                          <span className={getEffectDisplay("weak").color}>
                            {attackDamageBreakdown.weak}
                          </span>
                          <span className={getEffectDisplay("vulnerable").color}>
                            {attackDamageBreakdown.vulnerable}
                          </span>
                        </span>
                        <span
                          className="text-slate-200/95 tabular-nums text-lg"
                          title="Weak + Vulnerable"
                        >
                          {attackDamageBreakdown.both}
                        </span>
                        <span className={MULTIHIT_INLINE_TIMES_CLASS}>×</span>
                        <span className={MULTIHIT_INLINE_COUNT_CLASS}>{multihitHitLabel}</span>
                      </span>
                    ) : (
                      <span
                        className={`${galleryDamageClusterShellClass} inline-flex max-w-full flex-row items-center gap-x-0.5 ${stat.statMain}`}
                        title={damageStatTooltip}
                      >
                        {renderLeadingGlyphSegments(multihitLeadSegs, stat.galleryIcon)}
                        <span
                          className={`inline-flex items-center gap-0.5 text-lg ${getEffectDisplay("damage").color}`}
                        >
                          {React.createElement(getEffectDisplay("damage").icon, {
                            className: `${stat.statIcon} inline shrink-0`,
                          })}
                          {damageStatLabel ?? "?"}
                        </span>
                        <span className={MULTIHIT_INLINE_TIMES_CLASS}>×</span>
                        <span className={MULTIHIT_INLINE_COUNT_CLASS}>{multihitHitLabel}</span>
                      </span>
                    )
                  ) : attackDamageBreakdown ? (
                    <span
                      className={`${galleryDamageClusterShellClass} inline-flex max-w-full flex-row items-center gap-x-0.5 ${stat.statMain}`}
                      title={damageStatTooltip}
                    >
                      <span
                        className={`inline-flex items-center gap-0.5 text-lg ${getEffectDisplay("damage").color}`}
                      >
                        {React.createElement(getEffectDisplay("damage").icon, {
                          className: `${stat.statIcon} inline shrink-0`,
                        })}
                        {damageStatLabel ?? "?"}
                      </span>
                      <span
                        className="flex flex-col items-center justify-center leading-none text-sm font-semibold tabular-nums tracking-tight"
                        title="Weak (top) · Vulnerable (bottom)"
                      >
                        <span className={getEffectDisplay("weak").color}>
                          {attackDamageBreakdown.weak}
                        </span>
                        <span className={getEffectDisplay("vulnerable").color}>
                          {attackDamageBreakdown.vulnerable}
                        </span>
                      </span>
                      <span
                        className="text-slate-200/95 tabular-nums text-lg"
                        title="Weak + Vulnerable"
                      >
                        {attackDamageBreakdown.both}
                      </span>
                    </span>
                  ) : (
                    <span
                      title={damageStatTooltip}
                      className={`${stat.statMain} inline-flex items-center gap-0.5 ${getEffectDisplay("damage").color}`}
                    >
                      {React.createElement(getEffectDisplay("damage").icon, {
                        className: `${stat.statIcon} inline`,
                      })}
                      {damageStatLabel ?? "?"}
                    </span>
                  )
                ) : null}
              </div>
            ) : null}
            {card.block !== undefined && !mergedSuppressStats?.block && (
              <div
                className={BLOCK_FRAIL_CLUSTER_CLASS}
                title={formatBlockStatTitle(getValue("block"), card.type)}
              >
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
              <div
                className={BLOCK_FRAIL_CLUSTER_CLASS}
                title={formatBlockStatTitle(getValue("blockOnExhaust"), card.type)}
              >
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
              <div className="inline-flex flex-wrap items-center gap-1">
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
              <div className="inline-flex flex-wrap items-center gap-1">
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
              <div className="inline-flex flex-wrap items-center gap-1">
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
              <div className="inline-flex flex-wrap items-center gap-1">
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
              <div className="inline-flex flex-wrap items-center gap-1">
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
              <div className="inline-flex flex-wrap items-center gap-1">
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
            {statStripLeadingAndRest.rest.map((g) => (
              <React.Fragment key={g.id}>
                {renderGalleryGlyphCluster(
                  g,
                  stat.galleryIcon,
                  stat.galleryText,
                )}
              </React.Fragment>
            ))}
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
