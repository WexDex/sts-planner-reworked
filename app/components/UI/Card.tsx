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
import { useState } from "react";

interface GameCardProps {
  card: Card;
  size?: "small" | "large";
  index: number;
  location: LOCATION;
}

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
  const isSmall = size === "small";

  const cardWidth = isSmall ? "w-25" : "w-41";
  const cardHeight = isSmall ? "h-32" : "h-57";
  const costSize = isSmall ? "w-6 h-6" : "w-10 h-10";
  const costText = isSmall ? "text-xs" : "text-lg";

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

    // Handle ValueNode type
    if (typeof value === "number") {
      return value;
    }

    // If upgraded and upgraded value exists, use it; otherwise use base
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
      className={`${cardWidth} ${cardHeight} relative rounded-lg border-2 ${styles.border} ${styles.glow} shadow-xl overflow-hidden bg-gradient-to-b ${styles.gradient} backdrop-blur-sm cursor-pointer
        hover:brightness-110 transition-all duration-300 hover:ring-2
         hover:ring-slate-400/30 hover:-translate-y-3 hover:shadow-2xl hover:scale-105 animate-slide-in-up
          ${card.isSelected ? "ring-4 ring-yellow-400 shadow-yellow-400/50 animate-pulse-glow scale-105 -translate-y-3" : ""} 
        `}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

      <div
        className={`absolute inset-1 rounded-md border ${styles.accentBorder} pointer-events-none opacity-40 transition-opacity duration-300 group-hover:opacity-70`}
      />

      {card.type !== "Curse" && card.type !== "Status" && (
        <div
          className={`absolute -top-2 -left-2 ${costSize} ${styles.costBg} rounded-full border-2 border-slate-950 ${styles.costGlow} shadow-lg flex items-center justify-center z-10 animate-bounce-pop hover:animate-pulse-glow`}
        >
          <span className={`${costText} font-bold text-white drop-shadow-lg`}>
            {getValue("cost")}
          </span>
        </div>
      )}

      <div className="relative h-full flex flex-col p-2">
        <div
          className={`${styles.nameBg} ${isSmall ? "px-1.5 py-0.5 mt-3" : "px-2 py-1 mt-6"} rounded border ${styles.accentBorder} backdrop-blur-sm transition-all duration-300 hover:brightness-120`}
        >
          <div
            className={`${isSmall ? "text-[10px]" : "text-sm"} flex flex-col justify-center font-semibold text-white text-center leading-tight`}
          >
            <span>
                <span
                  className={`${card.isUpgraded ? "text-green-400 animate-pulse" : "text-white"}`}
                >
                  {card.name}
                </span>
                {card.isUpgraded && (
                  <span className="text-xs text-green-400 ml-1 animate-pulse">
                    +{" "}
                  </span>
                )}
            </span>
            {card.isChanged && (
              <span className="ml-1 rounded-full bg-yellow-400/20 px-1 text-[10px] text-yellow-200 animate-bounce-pop inline-block">
                CHANGED
              </span>
            )}
          </div>
        </div>
        {/* CARD MIDDLE */}
        {!isSmall && (
          <div className="flex-1 flex flex-col items-center justify-center gap-1 my-2 transition-all duration-300">
            {card.damage !== undefined && (
              <div className="flex items-center gap-1">
                <div className="flex flex-row">
                  <span
                    className={`text-lg font-bold ${getEffectDisplay("damage").color}`}
                  >
                    {React.createElement(getEffectDisplay("damage").icon, {
                      className: "w-4 h-4 inline",
                    })}{" "}
                    {getFullDamage()?.dmg}
                  </span>
                  <div className="flex flex-col justify-center items-center gap-0">
                    <span
                      className={`text-xs ${getEffectDisplay("weak").color}`}
                    >
                      {getFullDamage()?.weak}
                    </span>
                    <span
                      className={`text-xs ${getEffectDisplay("vulnerable").color}`}
                    >
                      {getFullDamage()?.vulnerable}
                    </span>
                  </div>
                  <span
                    className={`text-lg ${getEffectDisplay("strength").color}`}
                  >
                    {getFullDamage()?.both}
                  </span>
                </div>
              </div>
            )}
            {card.block !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={`text-lg font-bold ${getEffectDisplay("block").color}`}
                >
                  {React.createElement(getEffectDisplay("block").icon, {
                    className: "w-4 h-4 inline",
                  })}{" "}
                  {getFullBlock()?.block}
                </span>
                <span className={`text-xs ${getEffectDisplay("frail").color}`}>
                  {getFullBlock()?.frail}
                </span>
              </div>
            )}
            {card.blockOnExhaust !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={`text-lg font-bold ${getEffectDisplay("block").color}`}
                >
                  {React.createElement(getEffectDisplay("block").icon, {
                    className: "w-4 h-4 inline",
                  })}{" "}
                  {getValue("blockOnExhaust")}
                </span>
                <span className={`text-xs ${getEffectDisplay("frail").color}`}>
                  {getFullBlock()?.frail}
                </span>
              </div>
            )}
            {card.draw !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={`text-lg font-bold ${getEffectDisplay("draw").color}`}
                >
                  {React.createElement(getEffectDisplay("draw").icon, {
                    className: "w-4 h-4 inline",
                  })}{" "}
                  {getValue("draw")}
                </span>
              </div>
            )}
            {card.takeDamage !== undefined && (
              <div className="flex items-center gap-1">
                <span className={`text-lg font-bold ${styles.statColor}`}>
                  {React.createElement(getEffectDisplay("takedamage").icon, {
                    className: "w-4 h-4 inline",
                  })}{" "}
                  {getValue("takeDamage")}
                </span>
              </div>
            )}
            {card.energyGain !== undefined && (
              <div className="flex items-center gap-1">
                <span className={`text-lg font-bold ${styles.statColor}`}>
                  {React.createElement(getEffectDisplay("energygain").icon, {
                    className: "w-4 h-4 inline",
                  })}{" "}
                  {getValue("energyGain")}
                </span>
              </div>
            )}
          </div>
        )}

        {!isSmall && card.description && (
          <div
            className={`${styles.nameBg} px-2 py-1.5 rounded text-[10px] text-slate-300 text-center leading-tight border ${styles.accentBorder} backdrop-blur-sm`}
          >
            {getFormattedDescription(card.description, card)}
          </div>
        )}

        <div
          className={`mt-auto pt-1 ${isSmall ? "text-[9px]" : "text-xs"} ${styles.typeColor} text-center font-medium opacity-70`}
        >
          {card.type}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
