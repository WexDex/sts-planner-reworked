"use client";

import { useMemo, useRef, useState } from "react";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import { getPlayerMaxEnergy, importGameData } from "@/app/utils/gameHelpers";
import { useGameManager } from "@/app/context/GameContext";
import { useLegendHighlight } from "@/app/context/LegendHighlightContext";
import CardDBModal from "@/app/components/CardDBModal";
import {
  getCardEffectLegendItems,
  type CardIconLegendItem,
} from "@/app/components/UI/cardIconLegend";
import { Activity, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

const CARD_EFFECT_LEGEND = getCardEffectLegendItems();

function clampPct(n: number) {
  return Math.max(0, Math.min(100, n));
}

function TopBarLegendChip({
  item,
  hoverSync,
  highlighted,
  showAllLabels,
  size,
}: {
  item: CardIconLegendItem;
  hoverSync: boolean;
  highlighted: boolean;
  showAllLabels: boolean;
  size: "desktop" | "mobile";
}) {
  const pinLabel = hoverSync && highlighted;
  const labelForced = pinLabel || showAllLabels;
  const iconSize = size === "desktop" ? "h-3.5 w-3.5" : "h-3 w-3";
  const idleBorder = size === "mobile" ? "border-slate-600/50" : "border-slate-600/45";

  const labelTextCls =
    size === "desktop"
      ? "truncate text-[9px] font-medium leading-none text-slate-200/95"
      : "truncate text-[8px] font-medium text-slate-200";

  const labelRevealCls =
    size === "desktop"
      ? labelForced
        ? "max-w-[10rem] opacity-100"
        : "max-w-0 opacity-0 overflow-hidden group-hover/chip:max-w-[10rem] group-hover/chip:opacity-100"
      : labelForced
        ? "max-w-[5.5rem] opacity-100"
        : "max-w-0 opacity-0 overflow-hidden group-hover/chip:max-w-[5.5rem] group-hover/chip:opacity-100";

  return (
    <span
      title={item.label}
      aria-label={item.label}
      className={`group/chip inline-flex items-center rounded-md border shadow-sm shadow-black/20 transition-[opacity,box-shadow,border-color,background-color,gap,padding,max-width] ${
        labelForced
          ? "gap-1 px-1.5 py-0.5"
          : "justify-center p-1 group-hover/chip:gap-1 group-hover/chip:px-1.5 group-hover/chip:py-0.5"
      } ${
        !hoverSync
          ? `${idleBorder} bg-slate-900/55 group-hover/chip:bg-slate-900/70`
          : highlighted
            ? "border-cyan-400/55 bg-cyan-950/45 ring-1 ring-cyan-400/35 shadow-[0_0_12px_rgba(34,211,238,0.14)]"
            : "border-slate-700/35 bg-slate-950/35 opacity-45 group-hover/chip:opacity-90"
      }`}
    >
      <item.Icon className={`${iconSize} shrink-0 ${item.iconClass}`} strokeWidth={2.25} aria-hidden />
      <span className={`${labelTextCls} transition-[max-width,opacity] duration-200 ${labelRevealCls}`}>
        {item.label}
      </span>
    </span>
  );
}

export default function TopBarBlock() {
  const {
    gameState,
    addCardFromDB,
    loadGameDataFromJson,
    isLoading,
    error,
  } = useGameManager();
  const { hoveredCard, highlightIds } = useLegendHighlight();
  const sortedLegend = useMemo(() => {
    if (!hoveredCard) return CARD_EFFECT_LEGEND;
    const hi: CardIconLegendItem[] = [];
    const lo: CardIconLegendItem[] = [];
    for (const item of CARD_EFFECT_LEGEND) {
      (highlightIds.has(item.id) ? hi : lo).push(item);
    }
    return [...hi, ...lo];
  }, [hoveredCard, highlightIds]);
  const [legendShowAllLabels, setLegendShowAllLabels] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [mobileVitalsOpen, setMobileVitalsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const hpPct = playerMaxHp > 0 ? clampPct((playerHp / playerMaxHp) * 100) : 0;
  const lowHp = playerMaxHp > 0 && (playerHp === 0 || (playerHp > 0 && hpPct < 30));
  const energyPct = energyMax > 0 ? clampPct((currentEnergy / energyMax) * 100) : 0;
  const showEnergyPips = energyMax > 0 && energyMax <= 9;

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
    <div className="border-b border-slate-800/90 bg-gradient-to-b from-slate-900/98 via-slate-950 to-slate-950/95 text-slate-200 shadow-md shadow-slate-950/40 max-md:border-b-2 max-md:border-cyan-500/35 max-md:bg-gradient-to-b max-md:from-cyan-950/45 max-md:via-slate-900 max-md:to-slate-950 max-md:shadow-md max-md:shadow-cyan-900/20 md:px-3 md:py-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="fixed left-0 top-0 m-0 h-px w-px overflow-hidden border-0 p-0 opacity-0"
        onChange={handleJsonFile}
        tabIndex={-1}
        aria-label="Load combat JSON file"
      />
      <div className="hidden md:block">
        <div className="mx-auto flex max-w-[1600px] flex-col items-stretch gap-3 px-0 py-0 lg:flex-row lg:items-center lg:gap-4">
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

        {/* Card icon legend + file actions (this-turn relics live under Combat tools → Player) */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-2 lg:max-w-none">
          <div className="flex min-w-0 flex-col items-stretch gap-2 min-[1000px]:flex-row min-[1000px]:items-stretch min-[1000px]:gap-3">
            <div
              className="min-w-0 flex-1 rounded-2xl border border-cyan-500/30 bg-cyan-950/25 p-2.5 ring-1 ring-cyan-500/10 sm:p-3"
              role="region"
              aria-label="Card effect icons legend"
            >
              <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
                <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/85">
                  <BookOpen className="h-3 w-3 shrink-0 text-cyan-400/90" strokeWidth={2.5} aria-hidden />
                  <span className="truncate">Symbols legend</span>
                </p>
                <button
                  type="button"
                  onClick={() => setLegendShowAllLabels((v) => !v)}
                  aria-pressed={legendShowAllLabels}
                  aria-label={legendShowAllLabels ? "Collapse legend to icons only" : "Expand all legend names"}
                  className="shrink-0 rounded-md border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-100/95 shadow-sm transition hover:border-cyan-400/55 hover:bg-cyan-900/50"
                >
                  {legendShowAllLabels ? "Icons only" : "Show all"}
                </button>
              </div>
              <div className="flex min-h-[4rem] max-h-[9rem] flex-wrap content-start gap-1.5 overflow-y-auto pr-0.5 [scrollbar-width:thin] sm:max-h-[10rem] md:max-h-[11rem]">
                {sortedLegend.map((item) => {
                  const hoverSync = hoveredCard != null;
                  const highlighted = highlightIds.has(item.id);
                  return (
                    <TopBarLegendChip
                      key={item.id}
                      item={item}
                      hoverSync={hoverSync}
                      highlighted={highlighted}
                      showAllLabels={legendShowAllLabels}
                      size="desktop"
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 min-[1000px]:flex-col min-[1000px]:items-stretch min-[1000px]:justify-center min-[1000px]:self-center">
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
                className="rounded-xl border border-emerald-500/50 bg-emerald-700/85 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-950/40 transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add Card
              </button>
            </div>
          </div>
          {loadError ? (
            <p className="w-full text-right text-[10px] text-red-400" title={loadError}>
              {loadError}
            </p>
          ) : null}
        </div>
        </div>
      </div>

      {/* Mobile: high-contrast strip + collapsible vitals */}
      <div className="md:hidden">
        <div className="mx-auto max-w-2xl space-y-2 px-2 py-2">
          <div className="overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-slate-900/90 shadow-md shadow-cyan-950/30">
            <div className="flex items-center justify-between border-b border-cyan-800/30 bg-cyan-950/40 px-2.5 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/90">
                <Activity className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                Player
              </p>
              <button
                type="button"
                onClick={() => setMobileVitalsOpen((o) => !o)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-cyan-600/50 bg-cyan-950/60 px-2.5 text-[10px] font-semibold text-cyan-200/90"
                aria-expanded={mobileVitalsOpen}
                aria-label={mobileVitalsOpen ? "Hide stat details" : "Show full stat details"}
              >
                {mobileVitalsOpen ? (
                  <>
                    <span>Less</span>
                    <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </>
                ) : (
                  <>
                    <span>Details</span>
                    <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>

            {!mobileVitalsOpen ? (
              <div className="grid grid-cols-3 gap-1.5 p-2">
                <div
                  className={`rounded-xl border px-1.5 py-1.5 ${
                    lowHp ? "border-rose-500/45 bg-rose-950/40" : "border-rose-500/25 bg-rose-950/20"
                  }`}
                >
                  <p className="text-[8px] font-bold uppercase text-rose-300/90">HP</p>
                  <p className="text-center text-sm font-bold tabular-nums text-rose-50">
                    {playerHp}
                    <span className="text-[10px] font-medium text-rose-300/50">/{playerMaxHp || "—"}</span>
                  </p>
                  <div
                    className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-rose-950/80"
                    role="progressbar"
                    aria-label={`Health ${Math.round(hpPct)}%`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-500"
                      style={{ width: `${hpPct}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/25 px-1.5 py-1.5 text-center">
                  <p className="text-[8px] font-bold uppercase text-amber-200/80">NRG</p>
                  <p className="text-sm font-bold tabular-nums text-amber-50">
                    {currentEnergy}
                    <span className="text-[10px] text-amber-200/50">/{energyMax || "—"}</span>
                  </p>
                  {showEnergyPips && energyMax > 0 ? (
                    <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                      {Array.from({ length: Math.min(5, energyPipSlots) }, (_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-sm border ${
                            i < currentEnergy
                              ? "border-amber-300 bg-amber-400"
                              : "border-amber-800/50 bg-amber-950/60"
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <div
                  className={`rounded-xl border px-1.5 py-1.5 text-center ${
                    currentBlock > 0 ? "border-sky-400/45 bg-sky-950/35" : "border-slate-600/50 bg-slate-900/50"
                  }`}
                >
                  <p
                    className={`text-[8px] font-bold uppercase ${
                      currentBlock > 0 ? "text-sky-200/90" : "text-slate-500"
                    }`}
                  >
                    Blk
                  </p>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      currentBlock > 0 ? "text-sky-100" : "text-slate-500"
                    }`}
                  >
                    {currentBlock}
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[70vh] space-y-2 overflow-y-auto p-2 [scrollbar-width:thin]">
                <div
                  className={`rounded-xl border p-2.5 ${
                    lowHp
                      ? "border-rose-500/50 bg-rose-950/35"
                      : "border-rose-500/20 bg-rose-950/25"
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-950/50 ${
                          lowHp ? "ring-1 ring-rose-400/30" : ""
                        }`}
                      >
                        <HpIcon className={`${hpEffect.color} h-3.5 w-3.5`} />
                      </div>
                      <p className="text-[9px] font-bold uppercase text-rose-200/80">Health</p>
                    </div>
                    <p className="text-right text-sm font-bold tabular-nums text-rose-50">
                      {playerHp}/{playerMaxHp || "—"}
                    </p>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full border border-rose-900/50 bg-rose-950/80">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-800 to-rose-500" style={{ width: `${hpPct}%` }} />
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-950/30 p-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-950/50">
                        <EnergyIcon className={`${energyEffect.color} h-3.5 w-3.5`} />
                      </div>
                      <p className="text-[9px] font-bold uppercase text-amber-200/90">Energy</p>
                    </div>
                    <p className="text-right text-sm font-bold tabular-nums text-amber-50">
                      {currentEnergy}/{energyMax || "—"}
                    </p>
                  </div>
                  {energyMax > 0 && showEnergyPips ? (
                    <div className="flex flex-wrap justify-center gap-1">
                      {Array.from({ length: energyPipSlots }, (_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-2 rounded-sm border-2 ${
                            i < currentEnergy
                              ? "border-amber-300 bg-amber-400"
                              : "border-amber-700/50 bg-amber-950/60"
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <div
                  className={`rounded-xl border p-2.5 ${
                    currentBlock > 0
                      ? "border-sky-400/45 bg-sky-950/40"
                      : "border-slate-600/50 bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                          currentBlock > 0
                            ? "border-sky-500/40 bg-sky-950/55"
                            : "border-slate-600/60 bg-slate-800/50"
                        }`}
                      >
                        <BlockIcon className={`${blockEffect.color} h-3.5 w-3.5`} />
                      </div>
                      <p className="text-[9px] font-bold uppercase text-slate-400">Block</p>
                    </div>
                    <p
                      className={`text-xl font-bold tabular-nums ${
                        currentBlock > 0 ? "text-sky-100" : "text-slate-500"
                      }`}
                    >
                      {currentBlock}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div
              className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-2.5 ring-1 ring-cyan-500/15"
              role="region"
              aria-label="Card effect icons legend"
            >
              <div className="mb-1.5 flex items-center justify-between gap-1.5">
                <p className="flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-cyan-200/90">
                  <BookOpen className="h-3 w-3 shrink-0 text-cyan-400/90" strokeWidth={2.5} aria-hidden />
                  <span className="truncate">Symbols</span>
                </p>
                <button
                  type="button"
                  onClick={() => setLegendShowAllLabels((v) => !v)}
                  aria-pressed={legendShowAllLabels}
                  aria-label={legendShowAllLabels ? "Collapse legend to icons only" : "Expand all legend names"}
                  className="shrink-0 rounded-md border border-cyan-500/40 bg-cyan-950/55 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-cyan-100/95"
                >
                  {legendShowAllLabels ? "Icons" : "All"}
                </button>
              </div>
              <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto [scrollbar-width:thin]">
                {sortedLegend.map((item) => {
                  const hoverSync = hoveredCard != null;
                  const highlighted = highlightIds.has(item.id);
                  return (
                    <TopBarLegendChip
                      key={item.id}
                      item={item}
                      hoverSync={hoverSync}
                      highlighted={highlighted}
                      showAllLabels={legendShowAllLabels}
                      size="mobile"
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="min-w-0 flex-1 rounded-lg border border-sky-500/50 bg-sky-800/90 px-2 py-2.5 text-[11px] font-semibold text-white active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? "…" : "Load data"}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={!gameState}
                className="min-w-0 flex-1 rounded-lg border border-emerald-500/50 bg-emerald-700/90 px-2 py-2.5 text-[11px] font-semibold text-white active:scale-[0.99] disabled:opacity-40"
              >
                Add card
              </button>
            </div>
          </div>

          {loadError ? (
            <p className="text-center text-[10px] text-red-400" title={loadError}>
              {loadError}
            </p>
          ) : null}
        </div>
      </div>

      <CardDBModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddCard={addCardFromDB} />
    </div>
  );
}
