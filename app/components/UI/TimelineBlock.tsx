"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameManager } from "@/app/context/GameContext";
import type { CombatData, Turn } from "@/app/types/gameTypes";
import {
  buildIncomingDamageContext,
  describeIncomingModifiers,
  formatIntentActionsLineIncoming,
  isEnemyActiveForIntents,
  sumIncomingAttackDamageFromActions,
} from "@/app/utils/intentFormat";
import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Clock,
  History,
  RotateCcw,
  SkipForward,
  Swords,
} from "lucide-react";
import { toast } from "@/app/utils/toast";

interface EnemyIntentSummary {
  name: string;
  line: string;
  damage: number;
  modifierHint: string;
}

interface TurnSummary {
  turn: number;
  totalDamage: number;
  enemySummaries: EnemyIntentSummary[];
}

const TIMELINE_ZONE =
  "animate-sts-panel-in rounded-2xl border-2 border-cyan-500/25 bg-linear-to-b from-cyan-950/35 via-slate-950 to-slate-950 p-3 shadow-[inset_0_1px_0_0_rgba(34,211,238,0.06)] shadow-lg shadow-cyan-950/25 ring-1 ring-cyan-400/10 transition-all duration-300";

const ACTIONS_ZONE =
  "animate-sts-panel-in rounded-2xl border-2 border-slate-600/40 bg-linear-to-b from-slate-900/90 via-slate-950 to-slate-950 p-3 shadow-lg shadow-slate-950/40 ring-1 ring-slate-500/10";

type BtnTone = "cyan" | "amber" | "rose" | "slate";

const actionTone: Record<BtnTone, string> = {
  cyan: "border-cyan-500/45 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-100 shadow-sm shadow-cyan-950/20",
  amber: "border-amber-500/45 bg-amber-950/40 hover:bg-amber-900/45 text-amber-100 shadow-sm shadow-amber-950/20",
  rose: "border-rose-500/45 bg-rose-950/40 hover:bg-rose-900/45 text-rose-100 shadow-sm shadow-rose-950/20",
  slate: "border-slate-600 bg-slate-800/85 hover:bg-slate-800 text-slate-200",
};

function ActionBtn({
  children,
  onClick,
  tone = "slate",
  icon: Icon,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: BtnTone;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98] hover:brightness-110 ${actionTone[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} /> : null}
      {children}
    </button>
  );
}

const INTENT_PREVIEW_MAX = 4;

/** Combat snapshot for a given intent turn: frozen slot in the planner, except the active turn uses live gameState. */
function snapshotForIntentTurn(
  intentTurnId: number,
  turns: Turn[],
  currentTurnIndex: number,
  liveState: CombatData | null,
): CombatData | null {
  if (!liveState) return null;
  const liveTurnId = turns[currentTurnIndex]?.id;
  if (liveTurnId != null && intentTurnId === liveTurnId) {
    return liveState;
  }
  return turns.find((t) => t.id === intentTurnId)?.state ?? liveState;
}

export default function TimelineBlock() {
  const { gameState, turns, currentTurnIndex, setCurrentTurn, endTurn, continueFromTurn, resetCurrentTurn } =
    useGameManager();

  const activeTurnRef = useRef<HTMLDivElement | null>(null);
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});

  const turnsData = useMemo(() => {
    const map = new Map<number, TurnSummary>();
    if (!gameState) return [];

    const turnIds = new Set<number>();
    for (const t of turns) {
      turnIds.add(t.id);
      for (const e of t.state?.enemies ?? []) {
        for (const it of e.intents ?? []) turnIds.add(it.turn);
      }
    }
    for (const e of gameState.enemies ?? []) {
      for (const it of e.intents ?? []) turnIds.add(it.turn);
    }

    for (const turn of turnIds) {
      const snap = snapshotForIntentTurn(turn, turns, currentTurnIndex, gameState);
      if (!snap?.player) continue;

      for (const enemySnap of snap.enemies ?? []) {
        for (const intent of enemySnap.intents ?? []) {
          if (intent.turn !== turn) continue;
          if (!isEnemyActiveForIntents(enemySnap)) continue;

          if (!map.has(turn)) {
            map.set(turn, { turn, totalDamage: 0, enemySummaries: [] });
          }
          const entry = map.get(turn)!;
          const incomingCtx = buildIncomingDamageContext(snap.player, enemySnap);
          const line = formatIntentActionsLineIncoming(intent.actions, incomingCtx);
          const damage = sumIncomingAttackDamageFromActions(intent.actions, incomingCtx);
          const modifierHint = describeIncomingModifiers(incomingCtx);

          entry.enemySummaries.push({
            name: enemySnap.name,
            line,
            damage,
            modifierHint,
          });
          entry.totalDamage += damage;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.turn - b.turn);
  }, [gameState, turns, currentTurnIndex]);

  const summariesByTurn = useMemo(() => new Map(turnsData.map((s) => [s.turn, s])), [turnsData]);

  const plannerRows = useMemo(
    () =>
      turns.map((t) => ({
        id: t.id,
        summary: summariesByTurn.get(t.id) ?? null,
      })),
    [turns, summariesByTurn],
  );

  const currentTurnId = turns[currentTurnIndex]?.id ?? plannerRows[0]?.id ?? 1;

  const selected = turnsData.find((t) => t.turn === currentTurnId) ?? turnsData[0];

  useEffect(() => {
    activeTurnRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentTurnId]);

  const toggleTurnExpanded = useCallback((turnId: number) => {
    setExpandedTurns((prev) => ({ ...prev, [turnId]: !prev[turnId] }));
  }, []);

  const isExpanded = useCallback(
    (turnId: number, lineCount: number) => {
      if (lineCount <= INTENT_PREVIEW_MAX) return true;
      return expandedTurns[turnId] ?? false;
    },
    [expandedTurns],
  );

  const handleReset = useCallback(() => {
    if (typeof window !== "undefined" && !window.confirm("Reset this turn to the initial combat snapshot?")) return;
    resetCurrentTurn();
    toast('Turn reset', 'warning');
  }, [resetCurrentTurn]);

  if (!gameState) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]">
        <header className="sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">Turn timeline</h2>
          <p className="text-[11px] text-slate-500">Load combat data to plan turns.</p>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  const player = gameState.player;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]">
      <header className="sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-slate-100">
          <CalendarClock className="h-4 w-4 shrink-0 text-cyan-400/90" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold tracking-tight">Turn timeline</h2>
            <p className="truncate text-[11px] text-slate-500">
              {player.combatName} · Fl {player.floor} · {plannerRows.length} turn{plannerRows.length === 1 ? "" : "s"} in
              planner
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-2.5 py-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0 text-cyan-300/80" strokeWidth={2} />
          <span className="text-[11px] font-medium tabular-nums text-cyan-100/95">
            Active: Turn {currentTurnId}
            {selected?.totalDamage != null && selected.totalDamage > 0 ? (
              <span className="font-normal text-slate-500"> · {selected.totalDamage} incoming atk</span>
            ) : null}
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-3 p-3">
        <div className={TIMELINE_ZONE}>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <History className="h-3 w-3 text-cyan-500/80" strokeWidth={2} />
            Intent preview by turn
          </p>

          {plannerRows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700/80 py-6 text-center text-[11px] text-slate-500">
              No turns loaded yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {plannerRows.map((row, index) => {
                const isActive = row.id === currentTurnId;
                const summary = row.summary;
                const lines = summary?.enemySummaries ?? [];
                const expanded = isExpanded(row.id, lines.length);
                const visibleLines = expanded ? lines : lines.slice(0, INTENT_PREVIEW_MAX);
                const hiddenCount = lines.length - visibleLines.length;

                return (
                  <div key={row.id} ref={isActive ? activeTurnRef : undefined} className="w-full">
                    <button
                      type="button"
                      onClick={() => setCurrentTurn(row.id)}
                      className={`w-full max-w-full rounded-xl border-2 p-2.5 text-left transition-all duration-200 ${
                        isActive
                          ? "border-cyan-500/70 bg-slate-900/95 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-400/15"
                          : "border-slate-700/80 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Swords
                              className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-600"}`}
                              strokeWidth={2}
                            />
                            <span className="text-sm font-bold tabular-nums text-slate-100">Turn {row.id}</span>
                            {isActive ? (
                              <span className="rounded-md bg-cyan-500/20 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-cyan-200">
                                Active
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {summary
                              ? `${summary.enemySummaries.length} intent line${summary.enemySummaries.length === 1 ? "" : "s"}`
                              : "No intents in data for this turn"}
                          </p>
                        </div>
                        {summary && summary.totalDamage > 0 ? (
                          <div className="shrink-0 rounded-full border border-rose-500/35 bg-rose-950/40 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-rose-200">
                            {summary.totalDamage} dmg
                          </div>
                        ) : null}
                      </div>

                      {lines.length > 0 ? (
                        <div className="mt-2 space-y-1 border-t border-slate-800/80 pt-2">
                          {visibleLines.map((s) => (
                            <div key={`${row.id}-${s.name}-${s.line}`} className="space-y-0.5">
                              <div
                                className="flex gap-2 text-[10px] leading-snug text-slate-400"
                                title={
                                  s.modifierHint
                                    ? `${s.name}: ${s.line} — ${s.modifierHint}. (n) = base attack.`
                                    : `${s.name}: ${s.line || "No intent"}`
                                }
                              >
                                <span className="shrink-0 font-medium text-slate-500">{s.name}</span>
                                <span className="min-w-0 text-slate-300">{s.line || "—"}</span>
                              </div>
                              {s.modifierHint ? (
                                <p className="text-[9px] leading-tight text-amber-200/75">{s.modifierHint}</p>
                              ) : null}
                            </div>
                          ))}
                          {hiddenCount > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTurnExpanded(row.id);
                              }}
                              className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/50 py-1 text-[10px] font-medium text-cyan-300/90 transition hover:bg-slate-800/80"
                            >
                              {expanded ? (
                                <>
                                  <ChevronDown className="h-3 w-3" strokeWidth={2} />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-3 w-3" strokeWidth={2} />
                                  +{hiddenCount} more
                                </>
                              )}
                            </button>
                          ) : lines.length > INTENT_PREVIEW_MAX ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTurnExpanded(row.id);
                              }}
                              className="flex w-full items-center justify-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-400"
                            >
                              <ChevronDown className="h-3 w-3" strokeWidth={2} />
                              Collapse
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </button>

                    {index < plannerRows.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => continueFromTurn(row.id, plannerRows[index + 1]!.id)}
                        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-600/40 bg-cyan-950/25 py-1.5 text-[11px] font-semibold text-cyan-200/95 transition hover:bg-cyan-900/35 hover:text-cyan-50"
                      >
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                        Copy state → Turn {plannerRows[index + 1]!.id}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={ACTIONS_ZONE}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quick actions</p>
          <div className="flex flex-col gap-2">
            <ActionBtn tone="amber" icon={SkipForward} onClick={endTurn}>
              End turn
            </ActionBtn>
            <ActionBtn tone="rose" icon={RotateCcw} onClick={handleReset}>
              Reset turn data
            </ActionBtn>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
            Tip: “Copy state” pre-fills the next turn from the current one. Reset restores the initial snapshot for this
            turn.
          </p>
        </div>
      </div>
    </div>
  );
}
