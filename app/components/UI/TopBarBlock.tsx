"use client";

import { useMemo, useState } from "react";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import { Shield } from "lucide-react";
import { useGameManager } from "@/app/context/GameContext";
import CardDBModal from "@/app/components/CardDBModal";

type EnemyDisplay = {
  name: string;
  hp: number;
  maxHp: number;
};

export default function TopBarBlock() {
  const { gameState, loadGameData, isLoading, turns, currentTurnIndex, addCardFromDB } = useGameManager();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentTurn = turns[currentTurnIndex]?.id ?? 1;

  const playerHp = gameState?.player.hp ?? 0;
  const playerMaxHp = gameState?.player.maxHp ?? 0;
  const baseEnergy = gameState?.player.energy.base ?? 0;
  const currentEnergy = gameState?.player.currentEnergy ?? 0;
  const playerCombatName = gameState?.player.combatName ?? "Unknown";
  const combatType = gameState?.player.combatType ?? "Unknown";
  const playerFloor = gameState?.player.floor ?? 0;
  const incomingDamage = 1500;
  const enemies: EnemyDisplay[] = gameState?.enemies ?? [];

  const relicTooltips = useMemo(() => {
    const turnEffects = gameState?.player.relicEffects?.filter(
      (effect) => effect.turn === currentTurn,
    ) ?? [];

    const turnRelics = gameState?.player.relics?.filter((relic) =>
      !!relic.description?.match(new RegExp(`turn\\s*${currentTurn}`, "i")),
    ) ?? [];

    const tooltipEntries = [
      ...turnEffects.map((effect) => ({
        label: effect.effect,
        tooltip: effect.effect,
      })),
      ...turnRelics.map((relic) => ({
        label: relic.name,
        tooltip: relic.description ?? relic.name,
      })),
    ];

    const uniqueLabels = new Set<string>();
    return tooltipEntries.filter((entry) => {
      if (uniqueLabels.has(entry.label)) return false;
      uniqueLabels.add(entry.label);
      return true;
    });
  }, [currentTurn, gameState?.player.relicEffects, gameState?.player.relics]);

  const hpEffect = getEffectDisplay("health", playerHp);
  const energyEffect = getEffectDisplay("energy", baseEnergy);
  const blockEffect = getEffectDisplay("block", gameState?.player.currentBlock ?? 0);
  const HpIcon = hpEffect.icon;
  const EnergyIcon = energyEffect.icon;
  const BlockIcon = blockEffect.icon;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 text-slate-200 fixed top-0 right-80 left-80 z-50">
      <div className="mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-2">
            <div className="rounded-full bg-slate-800 p-2 text-slate-200">
              <HpIcon className={`${hpEffect.color} w-5 h-5`} />
            </div>
            <span className="font-medium text-sm text-slate-100">
              HP {playerHp}/{playerMaxHp}
            </span>
          </div>


          <div className="flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-2">
            <div className="rounded-full bg-slate-800 p-2 text-slate-200">
              <EnergyIcon className={`${energyEffect.color} w-5 h-5`} />
            </div>
            <span className="font-medium text-sm text-slate-100">
              Energy {currentEnergy}/{baseEnergy}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-2">
            <div className="rounded-full bg-slate-800 p-2 text-slate-200">
              <BlockIcon className={`${blockEffect.color} w-5 h-5`} />
            </div>
            <span className="font-medium text-sm text-slate-100">
              Block {gameState?.player.currentBlock ?? 0}
            </span>
          </div>
        </div>

        <div className="h-12 w-px bg-slate-700" />
        <div className="flex flex-col items-center gap-1 text-center text-slate-400">
          <div className="text-xs uppercase tracking-[0.2em]">
            Turn {currentTurn}
          </div>
          <div className="text-sm text-slate-200">{playerCombatName}</div>
          <div className="text-xs text-slate-500">
            {combatType} - Floor {playerFloor}
          </div>
        </div>
        
        
        <div className="h-12 w-px bg-slate-700" />
        {relicTooltips.length > 0 && (
          <div className="flex items-center gap-3">
            {relicTooltips.map((relic, i) => (
              <div
                key={i}
                className="bg-purple-950/30 px-3 py-2 rounded border border-purple-900/50 text-xs text-purple-300"
                title={relic.tooltip}
              >
                {relic.label}
              </div>
            ))}
          </div>
        )}
        
        <div className="h-12 w-px bg-slate-700" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors text-sm"
        >
          Add Card
        </button>
{/* 
        {incomingDamage > 0 && (
          <>
            <div className="h-12 w-px bg-slate-700" />
            <div className="flex items-center gap-2 bg-red-950/30 px-3 py-2 rounded border border-red-900/50">
              <Shield className="w-4 h-4 text-red-400" />
              <div className="text-sm">
                <span className="text-gray-400">Incoming:</span>
                <span className="ml-2 text-red-400 font-mono">{incomingDamage}</span>
              </div>
            </div>
          </>
        )} */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {/* {enemies.map((enemy, i) => (
              <div
                key={i}
                className="min-w-40 rounded-2xl bg-slate-950/90 p-3 text-xs"
              >
                <div className="mb-2 flex items-center justify-between text-slate-300">
                  <span>{enemy.name}</span>
                  <span className="font-mono text-slate-100">{enemy.hp}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            ))} */}
          </div>
        </div>
      </div>
      
      <CardDBModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCard={addCardFromDB}
      />
    </div>
  );
}
