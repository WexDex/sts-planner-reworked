"use client";

import { useState } from "react";
import {
  ArrowBigDown,
  ArrowBigUp,
  ChevronsDown,
  ChevronsUp,
  Copy,
  CreditCard,
  DollarSign,
  Layers,
  Library,
  Play,
  Redo2,
  RefreshCw,
  Sparkles,
  Trash2,
  Undo2,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useGameManager } from "@/app/context/GameContext";
import CardDBModal from "@/app/components/CardDBModal";

const SECT = "rounded-xl border border-slate-800/90 bg-slate-950/50 p-3 ring-1 ring-slate-500/5";
const SECT_LBL = "mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500";

const pill =
  "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40";

export default function ActionsBar() {
  const {
    gameState,
    playSelectedCards,
    moveSelectedCards,
    removeSelectedCards,
    spendEnergyOnSelected,
    deselectAllCards,
    upgradeSelected,
    downgradeSelected,
    duplicateSelected,
    setSelectedCostZero,
    setSelectedCustomCost,
    transformSelectedType,
    toggleChangedSelected,
    transformSelectedFromDatabase,
  } = useGameManager();

  const [collapsed, setCollapsed] = useState(false);
  const [transformDbOpen, setTransformDbOpen] = useState(false);

  const selectedCount = gameState
    ? gameState.draw.filter((c) => c.isSelected).length +
      gameState.discard.filter((c) => c.isSelected).length +
      gameState.exhaust.filter((c) => c.isSelected).length +
      gameState.hand.filter((c) => c.isSelected).length +
      gameState.playedCards.filter((c) => c.isSelected).length
    : 0;

  const totalEnergyCost = gameState
    ? [...gameState.draw, ...gameState.discard, ...gameState.exhaust, ...gameState.hand, ...gameState.playedCards]
        .filter((c) => c.isSelected)
        .reduce((sum, card) => {
          const cost =
            typeof card.cost === "object"
              ? card.isUpgraded && card.cost.upgraded !== undefined
                ? card.cost.upgraded
                : card.cost.base
              : card.cost;
          return sum + (typeof cost === "number" ? cost : 0);
        }, 0)
    : 0;

  const currentEnergy = gameState?.player.currentEnergy ?? 0;
  const hasEnoughEnergy = currentEnergy >= totalEnergyCost;

  if (selectedCount === 0) return null;

  if (collapsed) {
    return (
      <div className="shrink-0 border-t-2 border-amber-500/25 bg-gradient-to-b from-amber-950/25 to-slate-950/95 px-4 py-2 shadow-[0_-6px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-950/40 text-amber-200">
              <Layers className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">
                {selectedCount} <span className="font-medium text-slate-400">selected</span>
              </p>
              <p className="text-[10px] text-amber-200/60">
                {currentEnergy} energy · {totalEnergyCost} to pay
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={playSelectedCards}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-950/50 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-900/50"
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2} />
              Play
            </button>
            <button
              type="button"
              onClick={deselectAllCards}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
              Clear
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-900/30 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-800/30"
            >
              <ChevronsUp className="h-3.5 w-3.5" strokeWidth={2} />
              All actions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto relative z-20 shrink-0 border-t-2 border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-950/98 to-slate-950 px-4 py-2.5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl space-y-2.5">
        <div className="flex flex-wrap items-start justify-between gap-2 sm:items-center">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-200 shadow-sm shadow-amber-950/30">
              <Layers className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-100">Card actions</h2>
              <p className="text-[10px] text-slate-500">Above the draw row · applies to the selected stack</p>
            </div>
            <span className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-xs font-bold tabular-nums text-emerald-300">
              {selectedCount} sel
            </span>
            <span
              className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-bold tabular-nums ${
                hasEnoughEnergy
                  ? "border-amber-500/30 bg-amber-950/35 text-amber-200"
                  : "border-rose-500/35 bg-rose-950/30 text-rose-300"
              }`}
            >
              {currentEnergy} / {totalEnergyCost} e
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-900/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:bg-slate-800"
            title="Collapse to a thin strip (more board space)"
          >
            <ChevronsDown className="h-3.5 w-3.5" strokeWidth={2} />
            Minimize
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[500px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <section className={SECT}>
            <p className={SECT_LBL}>
              <Play className="h-3 w-3 text-cyan-400" strokeWidth={2} />
              Play
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={playSelectedCards}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-cyan-500/50 bg-cyan-950/45 py-2.5 text-sm font-bold text-cyan-50 shadow-md shadow-cyan-950/30 transition hover:bg-cyan-900/50"
              >
                <Play className="h-4 w-4" strokeWidth={2} />
                Play cards
              </button>
              <button
                type="button"
                onClick={spendEnergyOnSelected}
                disabled={!hasEnoughEnergy}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-bold transition ${
                  hasEnoughEnergy
                    ? "border-amber-500/55 bg-amber-950/40 text-amber-50 shadow-sm shadow-amber-950/25 hover:bg-amber-900/40"
                    : "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
                }`}
              >
                <Zap className="h-4 w-4" strokeWidth={2} />
                Pay {totalEnergyCost} energy
              </button>
            </div>
          </section>

          <section className={SECT}>
            <p className={SECT_LBL}>
              <Library className="h-3 w-3 text-slate-400" strokeWidth={2} />
              Move to
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => moveSelectedCards("hand")}
                className={`${pill} border-emerald-500/40 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900/50`}
              >
                <CreditCard className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
                Hand
              </button>
              <button
                type="button"
                onClick={() => moveSelectedCards("draw")}
                className={`${pill} border-blue-500/45 bg-blue-950/50 text-blue-100 hover:bg-blue-900/50`}
              >
                <Library className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
                Draw
              </button>
              <button
                type="button"
                onClick={() => moveSelectedCards("discard")}
                className={`${pill} border-rose-500/45 bg-rose-950/40 text-rose-100 hover:bg-rose-900/50`}
              >
                <Trash2 className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
                Discard
              </button>
              <button
                type="button"
                onClick={() => moveSelectedCards("exhaust")}
                className={`${pill} border-amber-500/40 bg-amber-950/40 text-amber-100 hover:bg-amber-900/50`}
              >
                <X className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
                Exhaust
              </button>
            </div>
          </section>

          <section className={SECT}>
            <p className={SECT_LBL}>
              <Sparkles className="h-3 w-3 text-violet-400" strokeWidth={2} />
              Modify
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={upgradeSelected}
                className={`${pill} border-emerald-500/45 bg-emerald-950/50 text-emerald-50 ring-1 ring-inset ring-emerald-500/20 shadow-sm shadow-emerald-950/25 hover:bg-emerald-900/55 hover:ring-emerald-400/25`}
              >
                <ArrowBigUp className="h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={2} />
                <span className="min-w-0">Upgrade</span>
              </button>
              <button
                type="button"
                onClick={downgradeSelected}
                className={`${pill} border-rose-500/45 bg-rose-950/45 text-rose-50 ring-1 ring-inset ring-rose-500/20 shadow-sm shadow-rose-950/25 hover:bg-rose-900/50 hover:ring-rose-400/25`}
              >
                <ArrowBigDown className="h-3.5 w-3.5 shrink-0 text-rose-300" strokeWidth={2} />
                <span className="min-w-0">Downgrade</span>
              </button>
              <button
                type="button"
                onClick={duplicateSelected}
                className={`${pill} border-cyan-500/40 bg-cyan-950/50 text-cyan-100 ring-1 ring-inset ring-cyan-500/15 shadow-sm shadow-cyan-950/20 hover:bg-cyan-900/50 hover:ring-cyan-400/20`}
              >
                <Copy className="h-3.5 w-3.5 shrink-0 text-cyan-300" strokeWidth={2} />
                <span className="min-w-0">Copy</span>
              </button>
            </div>
          </section>

          <section className={SECT}>
            <p className={SECT_LBL}>
              <DollarSign className="h-3 w-3 text-amber-400/80" strokeWidth={2} />
              Cost & type
            </p>
            <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
              <button
                type="button"
                onClick={setSelectedCostZero}
                className={`${pill} border-amber-500/40 bg-amber-950/45 text-amber-100 hover:bg-amber-900/50`}
              >
                <span className="text-xs font-black">0</span>
                Cost
              </button>
              <button
                type="button"
                onClick={setSelectedCustomCost}
                className={`${pill} border-lime-500/40 bg-lime-950/35 text-lime-100 hover:bg-lime-900/30`}
              >
                <Wand2 className="h-3 w-3" strokeWidth={2} />
                Custom
              </button>
              <button
                type="button"
                onClick={transformSelectedType}
                className={`${pill} border-fuchsia-500/40 bg-fuchsia-950/40 text-fuchsia-100 hover:bg-fuchsia-900/50`}
              >
                <Redo2 className="h-3 w-3" strokeWidth={2} />
                Type
              </button>
              <button
                type="button"
                onClick={toggleChangedSelected}
                className={`${pill} border-slate-500/50 bg-slate-800/80 text-slate-200 hover:bg-slate-700`}
              >
                <Undo2 className="h-3 w-3" strokeWidth={2} />
                Changed
              </button>
              <button
                type="button"
                onClick={() => setTransformDbOpen(true)}
                className={`${pill} col-span-full border-teal-500/45 bg-teal-950/40 text-teal-100 hover:bg-teal-900/50`}
                title="Replace selected with a card from the database (marked changed)"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                Transform
              </button>
            </div>
          </section>

          <section className={SECT}>
            <p className={SECT_LBL}>
              <Trash2 className="h-3 w-3 text-rose-400" strokeWidth={2} />
              Manage
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={removeSelectedCards}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-500/50 bg-rose-950/45 py-2.5 text-sm font-bold text-rose-50 shadow-sm shadow-rose-950/25 transition hover:bg-rose-900/50"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                Remove
              </button>
              <button
                type="button"
                onClick={deselectAllCards}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                <X className="h-4 w-4" strokeWidth={2} />
                Deselect all
              </button>
            </div>
          </section>
        </div>
      </div>

      <CardDBModal
        isOpen={transformDbOpen}
        onClose={() => setTransformDbOpen(false)}
        variant="transform"
        onTransform={(cardId, isUpgraded) => {
          transformSelectedFromDatabase(cardId, isUpgraded);
        }}
      />
    </div>
  );
}
