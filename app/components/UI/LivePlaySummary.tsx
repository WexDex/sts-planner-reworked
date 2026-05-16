"use client";

import { useMemo } from "react";
import { Shield, Swords, Zap, Skull, AlertTriangle, Heart } from "lucide-react";
import { useGameManager } from "@/app/context/GameContext";
import { computePlaySummary, computeIncomingPreview } from "@/app/utils/playSimulator";
import { hasValidPlannerTurnSelection } from "@/app/utils/gameHelpers";

function ModTag({ label, tone }: { label: string; tone: "red" | "amber" | "sky" | "violet" | "emerald" }) {
  const cls = {
    red:     "border-red-500/50 bg-red-950/50 text-red-300",
    amber:   "border-amber-500/50 bg-amber-950/50 text-amber-300",
    sky:     "border-sky-500/50 bg-sky-950/50 text-sky-300",
    violet:  "border-violet-500/50 bg-violet-950/50 text-violet-300",
    emerald: "border-emerald-500/50 bg-emerald-950/50 text-emerald-300",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded px-1 py-px text-[8px] font-bold uppercase tracking-wide border ${cls}`}>
      {label}
    </span>
  );
}

export default function LivePlaySummary() {
  const {
    gameState,
    turns,
    currentTurnIndex,
    combatTargetEnemyIndices,
  } = useGameManager();

  const plannerTurnReady = hasValidPlannerTurnSelection(turns, currentTurnIndex);

  const selectedCards = useMemo(() => {
    if (!gameState) return [];
    return [
      ...gameState.hand,
      ...gameState.draw,
      ...gameState.discard,
      ...gameState.exhaust,
      ...gameState.playedCards,
    ].filter((c) => c.isSelected);
  }, [gameState]);

  const summary = useMemo(() => {
    if (!gameState || selectedCards.length === 0) return null;
    return computePlaySummary(selectedCards, gameState, combatTargetEnemyIndices ?? []);
  }, [gameState, selectedCards, combatTargetEnemyIndices]);

  const currentTurnId = useMemo(() => {
    return turns[currentTurnIndex]?.id ?? 1;
  }, [turns, currentTurnIndex]);

  const incoming = useMemo(() => {
    if (!gameState || !summary || !plannerTurnReady) return null;
    const postPlayBlock = (gameState.player.currentBlock ?? 0) + summary.totalBlock;
    return computeIncomingPreview(gameState, postPlayBlock, currentTurnId);
  }, [gameState, summary, plannerTurnReady, currentTurnId]);

  if (!gameState || !summary) return null;

  const { player, enemies = [], stance } = gameState;
  const energyAvailable = player.currentEnergy ?? 0;
  const overBudget = summary.totalEnergyCost > energyAvailable;

  // Player modifier stacks for outgoing damage
  const buffs = player.buffsDebuffs ?? [];
  const playerStr    = buffs.find(b => b.name === "Strength")?.stacks ?? 0;
  const playerWeak   = (buffs.find(b => b.name === "Weak")?.stacks ?? 0) > 0;
  const playerDex    = buffs.find(b => b.name === "Dexterity")?.stacks ?? 0;
  const playerFrail  = (buffs.find(b => b.name === "Frail")?.stacks ?? 0) > 0;

  // Only show DEX/Frail tags when at least one selected card scales with DEX
  const anyCardScalesDex = summary.cards.some(cr => cr.card.scalesWithDexterity);
  // Only show STR tag when at least one selected card scales with STR
  const anyCardScalesStr = summary.cards.some(cr => cr.card.scalesWithStrength);

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 ring-1 ring-emerald-500/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-emerald-600/25 bg-emerald-950/30 px-3 py-1.5">
        <Swords className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" strokeWidth={2} />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/80">
          Play preview
        </span>
        <span className="ml-auto text-[10px] text-slate-500">
          {summary.cards.length} card{summary.cards.length !== 1 ? "s" : ""} selected
        </span>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Damage column */}
        <div className="space-y-1.5">
          <p className="flex flex-wrap items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            <Swords className="h-3 w-3 shrink-0" strokeWidth={2} />
            Damage
            {anyCardScalesStr && playerStr !== 0 && (
              <ModTag label={`STR ${playerStr > 0 ? "+" : ""}${playerStr}`} tone={playerStr > 0 ? "emerald" : "red"} />
            )}
            {playerWeak && <ModTag label="Weak ×0.75" tone="amber" />}
            {stance === "wrath" && <ModTag label="Wrath ×2" tone="red" />}
            {stance === "divinity" && <ModTag label="Divinity ×3" tone="violet" />}
          </p>
          {Object.keys(summary.totalDamageByTarget).length === 0 ? (
            <p className="text-[10px] text-slate-600 italic">No damage</p>
          ) : (
            Object.entries(summary.totalDamageByTarget).map(([idxStr, total]) => {
              const i = Number(idxStr);
              const enemy = enemies[i];
              const isKill = summary.kills.includes(i);
              const enemyIntangible = (enemy?.buffsDebuffs ?? []).some(b => b.name === "Intangible" && (b.stacks ?? 0) > 0);
              return (
                <div key={i} className="flex flex-wrap items-center gap-1.5">
                  {isKill && (
                    <Skull className="h-3.5 w-3.5 shrink-0 text-rose-400" strokeWidth={2} aria-label="Kill" />
                  )}
                  <span className={`text-sm font-bold tabular-nums ${isKill ? "text-rose-300" : "text-slate-100"}`}>
                    {total}
                  </span>
                  <span className="min-w-0 truncate text-[10px] text-slate-500">
                    → {enemy?.name ?? `Enemy #${i + 1}`}
                    {isKill && <span className="ml-1 font-semibold text-rose-400">kill</span>}
                  </span>
                  {enemyIntangible && <ModTag label="Intangible → 1/hit" tone="violet" />}
                </div>
              );
            })
          )}
          {/* Per-card hit breakdown */}
          {summary.cards.map((cr, ci) => {
            const entries = Object.entries(cr.damageByTarget);
            if (entries.length === 0) return null;
            return entries.map(([idxStr, hb]) => {
              if (hb.hits <= 1) return null;
              const i = Number(idxStr);
              const enemy = enemies[i];
              return (
                <p key={`${ci}-${i}`} className="text-[9px] tabular-nums text-slate-600">
                  {cr.card.name}: {hb.perHit}×{hb.hits}={hb.total}
                  {enemy ? ` → ${enemy.name}` : ""}
                </p>
              );
            });
          })}
        </div>

        {/* Block + energy column */}
        <div className="space-y-1.5">
          <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            <Shield className="h-3 w-3 shrink-0" strokeWidth={2} />
            Defense
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold tabular-nums text-sky-300">
              +{summary.totalBlock}
            </span>
            <span className="text-[10px] text-slate-500">block</span>
            {summary.totalBlock > 0 && (
              <span className="text-[10px] text-slate-600">
                (→ {(player.currentBlock ?? 0) + summary.totalBlock} total)
              </span>
            )}
            {anyCardScalesDex && playerDex !== 0 && (
              <ModTag label={`DEX ${playerDex > 0 ? "+" : ""}${playerDex}`} tone={playerDex > 0 ? "sky" : "red"} />
            )}
            {anyCardScalesDex && playerFrail && <ModTag label="Frail ×0.75" tone="amber" />}
          </div>

          <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-2">
            <Zap className="h-3 w-3 shrink-0" strokeWidth={2} />
            Energy
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold tabular-nums ${overBudget ? "text-red-400" : "text-amber-300"}`}>
              {summary.totalEnergyCost}
            </span>
            <span className="text-[10px] text-slate-500">
              / {energyAvailable} available
            </span>
            {overBudget && (
              <span className="flex items-center gap-0.5 rounded-md border border-red-500/50 bg-red-950/50 px-1.5 py-0.5 text-[9px] font-bold text-red-300">
                <AlertTriangle className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} />
                Over
              </span>
            )}
          </div>
        </div>

        {/* Enemy incoming preview column */}
        {incoming && incoming.hits.length > 0 && (
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <Heart className="h-3 w-3 shrink-0" strokeWidth={2} />
              After enemy phase
            </p>
            {incoming.hits.map((hit) => {
              const blockForThisHit = Math.min(incoming.blockPool, hit.effectiveDamage);
              const taken = Math.max(0, hit.effectiveDamage - blockForThisHit);
              const { mods } = hit;
              return (
                <div key={hit.enemyIndex} className="space-y-0.5">
                  <div className="text-[10px] tabular-nums">
                    <span className="font-medium text-slate-300">{hit.enemy.name}</span>
                    <span className="text-slate-500"> hits </span>
                    <span className="font-bold text-rose-300">{hit.effectiveDamage}</span>
                    {taken > 0 ? (
                      <>
                        <span className="text-slate-600"> → take </span>
                        <span className="font-bold text-rose-400">{taken}</span>
                      </>
                    ) : (
                      <span className="text-sky-400"> → blocked</span>
                    )}
                  </div>
                  {(mods.enemyStr !== 0 || mods.enemyWeak || mods.playerVulnerable || mods.playerIntangible) && (
                    <div className="flex flex-wrap gap-1 pl-1">
                      {mods.enemyStr !== 0 && (
                        <ModTag label={`STR ${mods.enemyStr > 0 ? "+" : ""}${mods.enemyStr}`} tone={mods.enemyStr > 0 ? "red" : "emerald"} />
                      )}
                      {mods.enemyWeak && <ModTag label="Weak ×0.75" tone="emerald" />}
                      {mods.playerVulnerable && <ModTag label="Vuln ×1.5" tone="red" />}
                      {mods.playerIntangible && <ModTag label="Intangible → 1" tone="violet" />}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="border-t border-slate-700/60 pt-1.5">
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 shrink-0 text-rose-400" strokeWidth={2} />
                <span className={`text-sm font-bold tabular-nums ${incoming.lethal ? "text-red-400" : incoming.finalHp < (player.maxHp ?? 1) * 0.3 ? "text-rose-300" : "text-slate-100"}`}>
                  {incoming.finalHp}
                </span>
                <span className="text-[10px] text-slate-500">/ {player.maxHp} HP after</span>
                {incoming.lethal && (
                  <span className="rounded-md border border-red-500/70 bg-red-950/60 px-1.5 py-0.5 text-[9px] font-bold text-red-300">
                    LETHAL
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
