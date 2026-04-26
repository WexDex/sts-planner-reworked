"use client";

import { useMemo, useRef, useState } from "react";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import { getPlayerMaxEnergy, importGameData } from "@/app/utils/gameHelpers";
import { useGameManager } from "@/app/context/GameContext";
import CardDBModal from "@/app/components/CardDBModal";
import { Activity } from "lucide-react";

function clampPct(n: number) {
  return Math.max(0, Math.min(100, n));
}

export default function TopBarBlock() {
  const {
    gameState,
    turns,
    currentTurnIndex,
    addCardFromDB,
    loadGameDataFromJson,
    isLoading,
    error,
  } = useGameManager();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTurn = Number(turns[currentTurnIndex]?.id ?? 1);

  const playerHp = gameState?.player.hp ?? 0;
  const playerMaxHp = gameState?.player.maxHp ?? 0;
  const baseEnergy = gameState?.player.energy.base ?? 0;
  const energyMax = gameState?.player
    ? getPlayerMaxEnergy(gameState.player)
    : 0;
  const currentEnergy = gameState?.player.currentEnergy ?? 0;
  /** Pip rows when over max (e.g. 4/3), still at most 9 pips */
  const energyPipSlots =
    energyMax > 0
      ? Math.min(9, Math.max(energyMax, currentEnergy))
      : 0;
  const currentBlock = gameState?.player.currentBlock ?? 0;
  const playerCombatName = gameState?.player.combatName ?? "Unknown";
  const combatType = gameState?.player.combatType ?? "Unknown";
  const playerFloor = gameState?.player.floor ?? 0;

  const hpPct = playerMaxHp > 0 ? clampPct((playerHp / playerMaxHp) * 100) : 0;
  const lowHp = playerMaxHp > 0 && (playerHp === 0 || (playerHp > 0 && hpPct < 30));
  const energyPct = energyMax > 0 ? clampPct((currentEnergy / energyMax) * 100) : 0;
  const showEnergyPips = energyMax > 0 && energyMax <= 9;

  const relicTooltips = useMemo(() => {
    const turnEffects =
      gameState?.player.relicEffects?.filter(
        (effect) => effect.enabled !== false && Number(effect.turn) === currentTurn,
      ) ?? [];

    return turnEffects.map((effect, i) => ({
      key: `relic-effect-${currentTurn}-${i}-${effect.effect}`,
      label: effect.effect,
      tooltip: effect.effect,
    }));
  }, [currentTurn, gameState?.player.relicEffects]);

  const hpEffect = getEffectDisplay("health", playerHp);
  const energyEffect = getEffectDisplay("energy", baseEnergy);
  const blockEffect = getEffectDisplay("block", currentBlock);
  const HpIcon = hpEffect.icon;
  const EnergyIcon = energyEffect.icon;
  const BlockIcon = blockEffect.icon;

  const loadError = fileError ?? error;

  const handleJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileError(null);
    try {
      const text = await file.text();
      const data = importGameData(text);
      await loadGameDataFromJson(data);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not read combat JSON");
    }
  };

  return (
    <div className="border-b border-slate-800/90 bg-gradient-to-b from-slate-900/98 via-slate-950 to-slate-950/95 px-3 py-3 text-slate-200 shadow-md shadow-slate-950/40">
      <div className="mx-auto flex max-w-[1600px] flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-4">
        {/* Player vitals — primary read */}
        <div
          className={`min-w-0 flex-1 rounded-2xl border bg-slate-950/60 p-2 shadow-inner shadow-black/20 ring-1 ring-inset sm:p-2.5 ${
            lowHp
              ? "border-rose-500/45 ring-rose-500/20"
              : "border-slate-700/80 ring-slate-500/5"
          }`}
        >
          <p className="mb-1.5 flex items-center gap-1.5 px-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Activity className="h-3 w-3 text-slate-500" strokeWidth={2.5} aria-hidden />
            Player
          </p>
          <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3 sm:gap-2.5">
            {/* HP */}
            <div
              className={`flex flex-col rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 ${
                lowHp
                  ? "border-rose-500/50 bg-rose-950/35 shadow-md shadow-rose-950/20"
                  : "border-rose-500/20 bg-rose-950/25"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-950/50 shadow-sm ${
                      lowHp ? "ring-1 ring-rose-400/30" : ""
                    }`}
                    aria-hidden
                  >
                    <HpIcon className={`${hpEffect.color} h-4 w-4`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase leading-none tracking-wider text-rose-200/80">Health</p>
                    <p className="text-[9px] text-rose-100/50">Pool</p>
                  </div>
                </div>
                <p className="shrink-0 text-right">
                  <span className="text-xl font-bold tabular-nums leading-none text-rose-50 sm:text-2xl">{playerHp}</span>
                  <span className="text-sm font-medium tabular-nums text-rose-200/50">/{playerMaxHp || "—"}</span>
                </p>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full border border-rose-900/50 bg-rose-950/80"
                role="progressbar"
                aria-valuenow={Math.round(hpPct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Health ${Math.round(hpPct)} percent`}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-rose-800 to-rose-500 transition-[width] duration-500 ${
                    lowHp ? "shadow-[0_0_12px_rgba(244,63,94,0.45)]" : ""
                  }`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div className="flex flex-col rounded-xl border border-amber-500/25 bg-amber-950/30 px-2.5 py-2 sm:px-3 sm:py-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-950/50 shadow-sm"
                    aria-hidden
                  >
                    <EnergyIcon className={`${energyEffect.color} h-4 w-4`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase leading-none tracking-wider text-amber-200/90">Energy</p>
                    <p className="text-[9px] text-amber-100/45">This turn</p>
                  </div>
                </div>
                <p className="shrink-0 text-right">
                  <span className="text-xl font-bold tabular-nums leading-none text-amber-50 sm:text-2xl">
                    {currentEnergy}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-amber-200/50">/{energyMax || "—"}</span>
                </p>
              </div>
              {energyMax > 0 ? (
                showEnergyPips ? (
                  <div className="flex flex-wrap items-center justify-center gap-1" aria-label={`Energy pips ${currentEnergy} of ${energyMax}`}>
                    {Array.from({ length: energyPipSlots }, (_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 w-2.5 rounded-sm border-2 ${
                          i < currentEnergy
                            ? "border-amber-300 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                            : "border-amber-700/50 bg-amber-950/60"
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="h-2.5 w-full overflow-hidden rounded-full border border-amber-900/50 bg-amber-950/80"
                    role="progressbar"
                    aria-valuenow={Math.round(energyPct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Energy ${Math.round(energyPct)} percent`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-800 to-amber-400 transition-[width] duration-300"
                      style={{ width: `${energyPct}%` }}
                    />
                  </div>
                )
              ) : (
                <p className="text-center text-[10px] text-amber-200/40">—</p>
              )}
            </div>

            {/* Block */}
            <div
              className={`flex flex-col rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 ${
                currentBlock > 0
                  ? "border-sky-400/45 bg-sky-950/40 shadow-md shadow-sky-950/30"
                  : "border-slate-600/50 bg-slate-900/40"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm ${
                      currentBlock > 0
                        ? "border-sky-500/40 bg-sky-950/55"
                        : "border-slate-600/60 bg-slate-800/50"
                    }`}
                    aria-hidden
                  >
                    <BlockIcon className={`${blockEffect.color} h-4 w-4`} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-[9px] font-bold uppercase leading-none tracking-wider ${
                        currentBlock > 0 ? "text-sky-200/90" : "text-slate-500"
                      }`}
                    >
                      Block
                    </p>
                    <p className="text-[9px] text-slate-500">Defense</p>
                  </div>
                </div>
                <p
                  className={`shrink-0 text-2xl font-bold tabular-nums leading-none sm:text-3xl ${
                    currentBlock > 0 ? "text-sky-100" : "text-slate-500"
                  }`}
                >
                  {currentBlock}
                </p>
              </div>
              <div
                className={`h-1.5 w-full overflow-hidden rounded-full border ${
                  currentBlock > 0
                    ? "border-sky-800/50 bg-sky-950/80"
                    : "border-slate-700/40 bg-slate-900/50"
                }`}
                aria-hidden
              >
                {currentBlock > 0 ? (
                  <div
                    className="h-full w-full min-w-[20%] rounded-full bg-gradient-to-r from-sky-700 to-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.35)]"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:thin] lg:pb-0">
          <div className="flex min-w-0 flex-col justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/25 px-3 py-2 text-center ring-1 ring-cyan-500/10 sm:min-w-[10rem]">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/95">Turn {currentTurn}</div>
            <div className="mt-0.5 max-w-[16rem] truncate text-sm font-semibold text-slate-50" title={playerCombatName}>
              {playerCombatName}
            </div>
            <div className="text-[10px] text-cyan-200/50">
              {combatType} · Fl {playerFloor}
            </div>
          </div>

          {relicTooltips.length > 0 && (
            <div className="hidden h-9 w-px shrink-0 bg-gradient-to-b from-transparent via-slate-600/80 to-transparent sm:block" />
          )}
          {relicTooltips.length > 0 && (
            <div className="flex max-w-sm shrink-0 flex-wrap items-center gap-1.5">
              {relicTooltips.map((entry) => (
                <div
                  key={entry.key}
                  className="max-w-[10rem] truncate rounded-lg border border-violet-500/35 bg-violet-950/50 px-2 py-1 text-[10px] font-medium text-violet-200"
                  title={entry.tooltip}
                >
                  {entry.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleJsonFile}
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-sky-500/45 bg-sky-800/80 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-950/30 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              title="Load combat from a JSON file (replaces current combat)"
            >
              {isLoading ? "Loading…" : "Load data"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={!gameState}
              className="rounded-xl border border-emerald-500/50 bg-emerald-700/85 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-950/40 transition hover:bg-emerald-600 hover:shadow-emerald-900/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Card
            </button>
          </div>
          {loadError ? (
            <p className="max-w-sm text-right text-[10px] text-red-400" title={loadError}>
              {loadError}
            </p>
          ) : null}
        </div>
      </div>

      <CardDBModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddCard={addCardFromDB} />
    </div>
  );
}
