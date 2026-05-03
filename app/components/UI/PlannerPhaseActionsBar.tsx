"use client";

import type { LucideIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useGameManager } from "@/app/context/GameContext";
import {
  activityLogHasTurnStartLogged,
  buildPhaseBoundaryStartEntry,
  buildTurnStartBoundaryLogEntry,
} from "@/app/utils/activityLogger";
import { hasValidPlannerTurnSelection } from "@/app/utils/gameHelpers";
import { toast } from "@/app/utils/toast";
import { Flag, Skull, SkipForward, Sparkles } from "lucide-react";

type BtnTone = "cyan" | "amber" | "rose" | "slate";

const toneCls: Record<BtnTone, string> = {
  cyan: "border-cyan-500/45 bg-cyan-950/45 hover:bg-cyan-900/55 text-cyan-100 shadow-sm shadow-cyan-950/20",
  amber: "border-amber-500/45 bg-amber-950/45 hover:bg-amber-900/50 text-amber-100 shadow-sm shadow-amber-950/20",
  rose: "border-rose-500/45 bg-rose-950/45 hover:bg-rose-900/50 text-rose-100 shadow-sm shadow-rose-950/20",
  slate: "border-slate-600 bg-slate-800/85 hover:bg-slate-800 text-slate-200",
};

function PhaseActionBtn({
  children,
  onClick,
  tone = "slate",
  icon: Icon,
  disabled = false,
  title: titleText,
  compact = false,
}: {
  children: string;
  onClick: () => void;
  tone?: BtnTone;
  icon?: LucideIcon;
  disabled?: boolean;
  title?: string;
  compact?: boolean;
}) {
  const sizeCls = compact
    ? "min-h-8 gap-0 rounded-md border px-1.5 py-1"
    : "min-h-9 gap-1.5 rounded-lg border px-2.5 py-1.5 sm:gap-2 sm:px-3";
  const textCls = compact ? "sr-only" : "max-w-[9rem] truncate sm:max-w-none";
  const iconCls = compact ? "h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" : "h-3 w-3 opacity-90 sm:h-3.5 sm:w-3.5";
  return (
    <button
      type="button"
      disabled={disabled}
      title={titleText}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center justify-center text-[10px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98] sm:text-[11px] ${sizeCls} ${toneCls[tone]} ${
        disabled ? "pointer-events-none cursor-not-allowed opacity-45" : ""
      }`}
    >
      {Icon ? <Icon className={`${iconCls} shrink-0`} strokeWidth={2} aria-hidden /> : null}
      <span className={textCls}>{children}</span>
    </button>
  );
}

export default function PlannerPhaseActionsBar({
  variant = "standalone",
  compact = false,
}: {
  variant?: "standalone" | "inline";
  /** Icon-first buttons (top bar compact mode). */
  compact?: boolean;
}) {
  const {
    gameState,
    turns,
    currentTurnIndex,
    turnPhase,
    beginTurn,
    endPlayerTurn,
    endEnemyTurn,
    addToActivityLog,
  } = useGameManager();

  const plannerTurnReady = useMemo(
    () => hasValidPlannerTurnSelection(turns, currentTurnIndex),
    [turns, currentTurnIndex],
  );

  const turnStartAlreadyLogged = useMemo(
    () => activityLogHasTurnStartLogged(gameState?.activityLog),
    [gameState?.activityLog],
  );

  const noTurnHint = !plannerTurnReady
    ? turns.length === 0
      ? "No data — add planner turns in Turns first."
      : "Select or add a planner turn row in Turns first."
    : "";
  const beforeStartDisabled =
    !plannerTurnReady || turnPhase !== "start" || turnStartAlreadyLogged;

  const handleBeforeStartLog = useCallback(() => {
    if (!gameState || !hasValidPlannerTurnSelection(turns, currentTurnIndex) || turnPhase !== "start") return;
    if (activityLogHasTurnStartLogged(gameState.activityLog)) return;
    const plannerTurnSlotId = turns[currentTurnIndex]?.id ?? currentTurnIndex + 1;
    addToActivityLog(buildTurnStartBoundaryLogEntry(plannerTurnSlotId));
    addToActivityLog(buildPhaseBoundaryStartEntry("start", plannerTurnSlotId));
    toast("Turn start recorded in activity log", "info");
  }, [addToActivityLog, gameState, turnPhase, turns, currentTurnIndex]);

  if (!gameState) return null;

  const beforeStartTitle = noTurnHint
    ? noTurnHint
    : turnPhase !== "start"
      ? "Available during Start phase only"
      : turnStartAlreadyLogged
        ? "Already marked for this planner turn"
        : "Once per turn: mark that this planner turn has begun (logged with turn-start style)";

  const beforeStartLabel = turnStartAlreadyLogged ? "Turn start logged" : "Mark turn start";

  const buttons = (
    <>
      <PhaseActionBtn
        tone="slate"
        icon={Flag}
        compact={compact}
        disabled={beforeStartDisabled}
        title={beforeStartTitle}
        onClick={handleBeforeStartLog}
      >
        {beforeStartLabel}
      </PhaseActionBtn>
      <PhaseActionBtn
        tone="cyan"
        icon={Sparkles}
        compact={compact}
        disabled={!plannerTurnReady || turnPhase !== "start"}
        title={noTurnHint || "End Start phase — enter Main"}
        onClick={beginTurn}
      >
        End of start
      </PhaseActionBtn>
      <PhaseActionBtn
        tone="amber"
        icon={SkipForward}
        compact={compact}
        disabled={!plannerTurnReady || turnPhase !== "player"}
        title={noTurnHint || "End Main — enter Enemy phase"}
        onClick={endPlayerTurn}
      >
        End of main
      </PhaseActionBtn>
      <PhaseActionBtn
        tone="rose"
        icon={Skull}
        compact={compact}
        disabled={!plannerTurnReady || turnPhase !== "enemy"}
        title={noTurnHint || "End Enemy — advance planner turn"}
        onClick={endEnemyTurn}
      >
        End of enemy
      </PhaseActionBtn>
    </>
  );

  if (variant === "inline") {
    return (
      <div
        role="toolbar"
        aria-label="Planner turn phase actions"
        className={`flex min-w-0 flex-wrap items-center justify-end ${compact ? "gap-1" : "gap-1.5 sm:gap-2"}`}
      >
        {buttons}
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/70 bg-slate-950/95 px-2 py-1.5 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.06)] sm:gap-2 sm:px-3 sm:py-2"
      role="toolbar"
      aria-label="Planner turn phase actions"
    >
      <span className="mr-0.5 hidden text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:inline">
        Phase steps
      </span>
      <div className={`flex min-w-0 flex-1 flex-wrap items-center ${compact ? "gap-1" : "gap-1.5 sm:gap-2"}`}>{buttons}</div>
    </div>
  );
}
