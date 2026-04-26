import React from "react";
import { Card } from "@/app/types/gameTypes";
import { cardTypeStyles, LOCATION } from "@/app/types/types";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import {
  getDamageStats,
  getBlockStats,
  getFormattedDescription,
} from "@/app/utils/utils";
import { useGameManager } from "@/app/context/GameContext";

interface GameCardProps {
  card: Card;
  size?: "small" | "medium" | "large";
  index: number;
  location: LOCATION;
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
  },
} as const;

export default function STSCard({
  card,
  index,
  location,
  size = "large",
}: GameCardProps) {
  const { toggleCardSelection } = useGameManager();
  const getCardStyles = (type?: string) => {
    const validTypes = [
      "Attack",
      "Skill",
      "Power",
      "Potion",
      "Curse",
      "Status",
    ];
    const cardType = validTypes.includes(type || "") ? type : "Attack";
    return cardTypeStyles[cardType as keyof typeof cardTypeStyles];
  };

  const styles = getCardStyles(card.type);
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
      | "vulnerable",
  ): number | undefined {
    const value = card[field];
    if (value === undefined) return undefined;

    if (typeof value === "number") {
      return value;
    }

    if (card.isUpgraded && value.upgraded !== undefined) {
      return value.upgraded;
    }
    return value.base;
  }

  function getFullDamage() {
    if (card.damage === undefined) return undefined;
    return getDamageStats(getValue("damage"));
  }
  function getFullBlock() {
    if (card.block === undefined) return undefined;
    return getBlockStats(getValue("block"));
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        toggleCardSelection(location, index);
      }}
      className={`${sz.frame} relative cursor-pointer overflow-hidden border-2 ${styles.border} ${styles.glow} bg-gradient-to-b ${styles.gradient} shadow-xl backdrop-blur-sm transition-all duration-300 animate-slide-in-up
        hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl hover:brightness-110
        ${card.isSelected ? "ring-[3px] ring-amber-400/90 shadow-amber-400/40 animate-pulse-glow -translate-y-2 scale-[1.03]" : "hover:ring-2 hover:ring-white/30"}
        `}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div
        className={`pointer-events-none absolute inset-[3px] rounded-[inherit] border ${styles.accentBorder} opacity-35 transition-opacity duration-300`}
      />

      {card.type !== "Curse" && card.type !== "Status" && (
        <div
          className={`absolute z-10 flex items-center justify-center rounded-full border-2 border-slate-950 ${sz.costOrb} ${styles.costBg} ${styles.costGlow} shadow-lg animate-bounce-pop hover:animate-pulse-glow`}
        >
          <span className={`${sz.costText} text-white drop-shadow-md`}>
            {getValue("cost")}
          </span>
        </div>
      )}

      <div className={`relative flex h-full flex-col ${sz.bodyPad}`}>
        <div
          className={`${styles.nameBg} ${sz.nameBand} border ${styles.accentBorder} backdrop-blur-sm transition-all duration-300 hover:brightness-125`}
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

        {stat && (
          <div
            className={`flex flex-1 flex-col items-center justify-center ${stat.midGap}`}
          >
            {card.damage !== undefined && (
              <div className="flex items-center gap-1">
                <div className="flex flex-row items-center">
                  <span
                    className={`${stat.statMain} flex items-center gap-0.5 ${getEffectDisplay("damage").color}`}
                  >
                    {React.createElement(getEffectDisplay("damage").icon, {
                      className: `${stat.statIcon} inline`,
                    })}
                    {getFullDamage()?.dmg}
                  </span>
                  <div className="flex flex-col items-center justify-center gap-0">
                    <span
                      className={`${stat.statSide} ${getEffectDisplay("weak").color}`}
                    >
                      {getFullDamage()?.weak}
                    </span>
                    <span
                      className={`${stat.statSide} ${getEffectDisplay("vulnerable").color}`}
                    >
                      {getFullDamage()?.vulnerable}
                    </span>
                  </div>
                  <span
                    className={`${stat.statMain} ${getEffectDisplay("strength").color}`}
                  >
                    {getFullDamage()?.both}
                  </span>
                </div>
              </div>
            )}
            {card.block !== undefined && (
              <div className="flex items-center gap-1">
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
            {card.draw !== undefined && (
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
            {card.energyGain !== undefined && (
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
          </div>
        )}

        {stat && card.description && (
          <div
            className={`${styles.nameBg} ${stat.descBox} border ${styles.accentBorder} text-center text-slate-200/95 backdrop-blur-sm`}
          >
            {getFormattedDescription(card.description, card)}
          </div>
        )}

        <div
          className={`${sz.typeLabel} ${styles.typeColor} mt-auto text-center opacity-80`}
        >
          {card.type}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}
