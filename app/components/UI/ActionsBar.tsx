"use client";

import { useMemo, useState } from "react";
import {
  ArrowBigDown,
  ArrowBigUp,
  Copy,
  CreditCard,
  DollarSign,
  Hand,
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
import { hasValidPlannerTurnSelection } from "@/app/utils/gameHelpers";
import CardDBModal from "@/app/components/CardDBModal";
import QuickActionsSection from "@/app/components/UI/QuickActionsSection";

const SECT = "rounded-xl border border-slate-800/90 bg-slate-950/50 p-3 ring-1 ring-slate-500/5";
const SECT_LBL = "mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500";
const pill =
  "inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40";

export default function ActionsBar() {
  const {
    gameState,
    turns,
    currentTurnIndex,
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

  const plannerTurnReady = useMemo(
    () => hasValidPlannerTurnSelection(turns, currentTurnIndex),
    [turns, currentTurnIndex],
  );
  const actionsLocked = Boolean(gameState && !plannerTurnReady);
  const actionsLockedHint =
    turns.length === 0
      ? "No data — add planner turns in Turns first"
      : "Select a planner turn in Turns first";

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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-cyan-500/30 bg-linear-to-b from-cyan-950/40 to-slate-950/80 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-950/50 text-cyan-300">
              <Hand className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100">Card Actions</p>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-emerald-300">
                  {selectedCount} sel
                </span>
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    hasEnoughEnergy
                      ? "border-amber-500/30 bg-amber-950/35 text-amber-200"
                      : "border-rose-500/35 bg-rose-950/30 text-rose-300"
                  }`}
                >
                  {currentEnergy}/{totalEnergyCost}e
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={deselectAllCards}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-600 bg-slate-800/80 text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
            title="Deselect all (return to timeline)"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {actionsLocked && (
          <p className="mt-1 text-[10px] text-amber-400/95">{actionsLockedHint}</p>
        )}
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:thin] space-y-3">

        {/* Play section */}
        <section className={SECT}>
          <p className={SECT_LBL}>
            <Play className="h-3 w-3 text-cyan-400" strokeWidth={2} />
            Play
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={playSelectedCards}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-cyan-500/50 bg-cyan-950/45 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-900/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-4 w-4" strokeWidth={2} />
              Play cards
            </button>
            <button
              type="button"
              onClick={spendEnergyOnSelected}
              disabled={actionsLocked || !hasEnoughEnergy}
              title={
                actionsLocked ? actionsLockedHint : !hasEnoughEnergy ? "Not enough energy" : undefined
              }
              className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 py-2 text-sm font-bold transition ${
                hasEnoughEnergy && !actionsLocked
                  ? "border-amber-500/55 bg-amber-950/40 text-amber-50 hover:bg-amber-900/40"
                  : "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
              }`}
            >
              <Zap className="h-4 w-4" strokeWidth={2} />
              Pay {totalEnergyCost}e
            </button>
          </div>
        </section>

        {/* Quick Actions section — only when 1 card selected */}
        <QuickActionsSection />

        {/* Move to section */}
        <section className={SECT}>
          <p className={SECT_LBL}>
            <Library className="h-3 w-3 text-slate-400" strokeWidth={2} />
            Move to
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={() => moveSelectedCards("hand")}
              className={`${pill} border-emerald-500/40 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900/50`}
            >
              <CreditCard className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
              Hand
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={() => moveSelectedCards("draw")}
              className={`${pill} border-blue-500/45 bg-blue-950/50 text-blue-100 hover:bg-blue-900/50`}
            >
              <Library className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
              Draw
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={() => moveSelectedCards("discard")}
              className={`${pill} border-rose-500/45 bg-rose-950/40 text-rose-100 hover:bg-rose-900/50`}
            >
              <Trash2 className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
              Discard
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={() => moveSelectedCards("exhaust")}
              className={`${pill} border-amber-500/40 bg-amber-950/40 text-amber-100 hover:bg-amber-900/50`}
            >
              <X className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
              Exhaust
            </button>
          </div>
        </section>

        {/* Modify section */}
        <section className={SECT}>
          <p className={SECT_LBL}>
            <Sparkles className="h-3 w-3 text-violet-400" strokeWidth={2} />
            Modify
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={upgradeSelected}
              className={`${pill} border-emerald-500/45 bg-emerald-950/50 text-emerald-50 ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-900/55`}
            >
              <ArrowBigUp className="h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={2} />
              Upgrade
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={downgradeSelected}
              className={`${pill} border-rose-500/45 bg-rose-950/45 text-rose-50 ring-1 ring-inset ring-rose-500/20 hover:bg-rose-900/50`}
            >
              <ArrowBigDown className="h-3.5 w-3.5 shrink-0 text-rose-300" strokeWidth={2} />
              Downgrade
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={duplicateSelected}
              className={`${pill} border-cyan-500/40 bg-cyan-950/50 text-cyan-100 ring-1 ring-inset ring-cyan-500/15 hover:bg-cyan-900/50`}
            >
              <Copy className="h-3.5 w-3.5 shrink-0 text-cyan-300" strokeWidth={2} />
              Copy
            </button>
          </div>
        </section>

        {/* Cost & type section */}
        <section className={SECT}>
          <p className={SECT_LBL}>
            <DollarSign className="h-3 w-3 text-amber-400/80" strokeWidth={2} />
            Cost & type
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={setSelectedCostZero}
              className={`${pill} border-amber-500/40 bg-amber-950/45 text-amber-100 hover:bg-amber-900/50`}
            >
              <span className="text-xs font-black">0</span>
              Cost
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={setSelectedCustomCost}
              className={`${pill} border-lime-500/40 bg-lime-950/35 text-lime-100 hover:bg-lime-900/30`}
            >
              <Wand2 className="h-3 w-3" strokeWidth={2} />
              Custom
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={transformSelectedType}
              className={`${pill} border-fuchsia-500/40 bg-fuchsia-950/40 text-fuchsia-100 hover:bg-fuchsia-900/50`}
            >
              <Redo2 className="h-3 w-3" strokeWidth={2} />
              Type
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={actionsLocked ? actionsLockedHint : undefined}
              onClick={toggleChangedSelected}
              className={`${pill} border-slate-500/50 bg-slate-800/80 text-slate-200 hover:bg-slate-700`}
            >
              <Undo2 className="h-3 w-3" strokeWidth={2} />
              Changed
            </button>
            <button
              type="button"
              disabled={actionsLocked}
              title={
                actionsLocked
                  ? actionsLockedHint
                  : "Replace selected with a card from the database"
              }
              onClick={() => setTransformDbOpen(true)}
              className={`${pill} col-span-full border-teal-500/45 bg-teal-950/40 text-teal-100 hover:bg-teal-900/50`}
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
              Transform
            </button>
          </div>
        </section>

        {/* Manage section */}
        <section className={SECT}>
          <p className={SECT_LBL}>
            <Trash2 className="h-3 w-3 text-rose-400" strokeWidth={2} />
            Manage
          </p>
          <button
            type="button"
            disabled={actionsLocked}
            title={actionsLocked ? actionsLockedHint : undefined}
            onClick={removeSelectedCards}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-500/50 bg-rose-950/45 py-2.5 text-sm font-bold text-rose-50 transition hover:bg-rose-900/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Remove
          </button>
        </section>

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
