"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGameManager } from "@/app/context/GameContext";
import type { CombatData, EnemyIntentAction, Turn } from "@/app/types/gameTypes";
import {
  buildIncomingDamageContext,
  describeIncomingModifiers,
  formatIntentActionsLineIncoming,
  isEnemyActiveForIntents,
  sumIncomingAttackDamageFromActions,
  type IncomingDamageContext,
} from "@/app/utils/intentFormat";
import { IntentIncomingChips } from "@/app/components/UI/IntentIncomingChips";
import { enemyIntentSlotTone } from "@/app/utils/enemyIntentSlotTone";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Copy,
  GitBranch,
  Pencil,
  RotateCcw,
  Save,
  Skull,
  Sparkles,
  Swords,
  User,
} from "lucide-react";
import { toast } from "@/app/utils/toast";
import { formatTurnUidShort, liveCombatDiffersFromPlannerRow } from "@/app/utils/gameHelpers";
import {
  decisionTimelineStartHasConnectedCheckpoint,
  decisionTimelineStartRootId,
  getActiveLineageCanonicalNodeIdBySlot,
  outgoingDecisionBranchCountForPlannerSlot,
  pinnedDecisionLineageAnchoredAtStart,
  turnsVisibleForActiveDecisionLineage,
} from "@/app/utils/decisionTreeHelpers";
import { resolvedDecisionTimelineAccentHex } from "@/app/utils/decisionTimelineAccent";

interface EnemyIntentSummary {
  name: string;
  /** Plain-text intent (modifiers, tooltips); kept for accessibility. */
  line: string;
  damage: number;
  modifierHint: string;
  actions: EnemyIntentAction[];
  incomingCtx: IncomingDamageContext;
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
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: BtnTone;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98] hover:brightness-110 ${actionTone[tone]} ${disabled ? "pointer-events-none cursor-not-allowed opacity-45" : ""} ${className}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} /> : null}
      {children}
    </button>
  );
}

const INTENT_PREVIEW_MAX = 4;

function decisionTimelineBranchSummary(outCount: number): string {
  if (outCount <= 0) return "No further branches in Decision Timeline";
  if (outCount === 1) return "This turn continues in 1 branch";
  return `This turn branches into ${outCount} branches`;
}

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
  const {
    gameState,
    turns,
    currentTurnIndex,
    turnPhase,
    setCurrentTurn,
    resetCurrentTurn,
    decisionNodes,
    activeDecisionNodeId,
    saveCurrentTurn,
    syncActiveDecisionNodeFromPlanner,
    updateDecisionNodeLabel,
    copyTurnStateToSlot,
    isLoading,
  } = useGameManager();

  /** Flush live board state into the planner turn row when this panel mounts (e.g. mobile timeline sheet). */
  useEffect(() => {
    syncActiveDecisionNodeFromPlanner();
  }, [syncActiveDecisionNodeFromPlanner]);

  const activeTurnRef = useRef<HTMLDivElement | null>(null);
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});

  const { displayTurns, timelineFilteredToLineage } = useMemo(() => {
    const lineageTurns = turnsVisibleForActiveDecisionLineage(decisionNodes, activeDecisionNodeId, turns);
    const hasDecisionTimeline = decisionNodes.length > 0;
    const displayTurnsResolved =
      !hasDecisionTimeline ? turns : lineageTurns == null ? [] : lineageTurns;
    const timelineFilteredToLineageResolved = hasDecisionTimeline;
    return {
      displayTurns: displayTurnsResolved,
      timelineFilteredToLineage: timelineFilteredToLineageResolved,
    };
  }, [decisionNodes, activeDecisionNodeId, turns]);

  /** Pulse empty “path turns” when planner has rows but this panel shows none (Decision Timeline setup needed). */
  const pathTurnsSeekAttention = useMemo(() => {
    if (!gameState) return false;
    if (!timelineFilteredToLineage) return false;
    if (turns.length === 0) return false;
    return displayTurns.length === 0;
  }, [gameState, timelineFilteredToLineage, turns.length, displayTurns.length]);

  /** Explains why Path turns is empty under Decision Timeline filtering. */
  const pathTurnsEmptyExplanation = useMemo(() => {
    if (!timelineFilteredToLineage || turns.length === 0) return null;
    if (displayTurns.length > 0) return null;
    if (!decisionTimelineStartHasConnectedCheckpoint(decisionNodes)) {
      return "Nothing branches from START yet. Open Decision Timeline and add or link a checkpoint under START.";
    }
    if (!activeDecisionNodeId) {
      return "Set Active on a checkpoint under START on the Decision Timeline to load path turns here.";
    }
    const startId = decisionTimelineStartRootId(decisionNodes);
    if (startId && activeDecisionNodeId === startId) {
      return "Active pin is START — Set Active on a checkpoint below START to show planner rows on this path.";
    }
    if (!pinnedDecisionLineageAnchoredAtStart(decisionNodes, activeDecisionNodeId)) {
      return "Active checkpoint is not connected to START (orphan or separate root). Relink under START or choose another branch.";
    }
    return "No planner rows on this path for the current pin.";
  }, [
    timelineFilteredToLineage,
    turns.length,
    displayTurns.length,
    decisionNodes,
    activeDecisionNodeId,
  ]);

  /** User-facing {@link DecisionNode.label} per planner slot — deepest checkpoint on the **active lineage** (aligned with visible timeline rows). */
  const decisionTimelineLabelBySlotId = useMemo(() => {
    const out = new Map<number, string>();
    if (!activeDecisionNodeId || decisionNodes.length === 0) {
      return out;
    }
    const canonicalNodeIdBySlot = getActiveLineageCanonicalNodeIdBySlot(
      decisionNodes,
      activeDecisionNodeId,
      turns,
    );
    const byId = new Map(decisionNodes.map((n) => [n.id, n] as const));
    for (const [slot, nodeId] of canonicalNodeIdBySlot) {
      const trimmed = byId.get(nodeId)?.label?.trim() ?? "";
      if (trimmed) out.set(slot, trimmed);
    }
    return out;
  }, [activeDecisionNodeId, decisionNodes, turns]);

  /** Per-slot accent matching the canonical lineage checkpoint (same mapping as turn names). */
  const decisionTimelineAccentHexBySlotId = useMemo(() => {
    const out = new Map<number, string>();
    if (!activeDecisionNodeId || decisionNodes.length === 0) return out;
    const canonicalNodeIdBySlot = getActiveLineageCanonicalNodeIdBySlot(
      decisionNodes,
      activeDecisionNodeId,
      turns,
    );
    const byId = new Map(decisionNodes.map((n) => [n.id, n] as const));
    const fallback = "#64748B";
    for (const [slot, nodeId] of canonicalNodeIdBySlot) {
      const node = byId.get(nodeId);
      out.set(slot, node ? resolvedDecisionTimelineAccentHex(node, fallback) : fallback);
    }
    return out;
  }, [activeDecisionNodeId, decisionNodes, turns]);

  /**
   * Second headline segment: spine label for this planner row when present, else default `Turn {rowId}`
   * using the real planner {@link Turn.id}. The leading `Turn X` in the box is the path projection index.
   */
  const timelineTurnSubtitleByPlannerRowId = useMemo(() => {
    const spine = decisionTimelineLabelBySlotId;
    const m = new Map<number, string>();
    displayTurns.forEach((t) => {
      const raw = spine.get(t.id)?.trim();
      if (!raw?.length) {
        m.set(t.id, `Turn ${t.id}`);
        return;
      }
      const numMatch = raw.match(/^turn\s*(\d+)$/i);
      const name =
        numMatch !== null && Number(numMatch[1]) === t.id ? `Turn ${t.id}` : raw;
      m.set(t.id, name);
    });
    return m;
  }, [decisionTimelineLabelBySlotId, displayTurns]);

  const turnsData = useMemo(() => {
    const map = new Map<number, TurnSummary>();
    if (!gameState) return [];

    const allowedSlots = new Set(displayTurns.map((t) => t.id));
    const turnIds = new Set<number>();
    for (const t of displayTurns) {
      turnIds.add(t.id);
      for (const e of t.state?.enemies ?? []) {
        for (const it of e.intents ?? []) {
          if (allowedSlots.has(it.turn)) turnIds.add(it.turn);
        }
      }
    }
    const liveTurnId = turns[currentTurnIndex]?.id;
    if (liveTurnId != null && allowedSlots.has(liveTurnId)) {
      for (const e of gameState.enemies ?? []) {
        for (const it of e.intents ?? []) {
          if (allowedSlots.has(it.turn)) turnIds.add(it.turn);
        }
      }
    }

    for (const turn of turnIds) {
      const snap = snapshotForIntentTurn(turn, turns, currentTurnIndex, gameState);
      if (!snap?.player) continue;

      for (const enemySnap of snap.enemies ?? []) {
        for (const intent of enemySnap.intents ?? []) {
          if (intent.turn !== turn) continue;
          if (!isEnemyActiveForIntents(enemySnap)) continue;
          /** Empty slot = enemy not spawned for this planner turn yet (distinct from explicit `no_action`). */
          if ((intent.actions?.length ?? 0) === 0) continue;

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
            actions: [...intent.actions],
            incomingCtx,
          });
          entry.totalDamage += damage;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.turn - b.turn);
  }, [gameState, turns, currentTurnIndex, displayTurns]);

  const summariesByTurn = useMemo(() => new Map(turnsData.map((s) => [s.turn, s])), [turnsData]);

  const plannerRows = useMemo(() => {
    const hasTimeline = decisionNodes.length > 0;
    const neutralStripe = "#475569";
    return displayTurns.map((t) => ({
      id: t.id,
      uid: t.uid,
      combatName: (t.state?.player?.combatName ?? '').trim() || 'Encounter',
      summary: summariesByTurn.get(t.id) ?? null,
      decisionBranchOutCount: hasTimeline
        ? outgoingDecisionBranchCountForPlannerSlot(decisionNodes, t.id, turns)
        : null,
      timelineAccentHex: decisionTimelineAccentHexBySlotId.get(t.id) ?? neutralStripe,
    }));
  }, [displayTurns, summariesByTurn, decisionNodes, turns, decisionTimelineAccentHexBySlotId]);

  const currentTurnId = turns[currentTurnIndex]?.id ?? plannerRows[0]?.id ?? 1;
  const currentTurnUid = turns[currentTurnIndex]?.uid ?? '';

  const canonicalNodeIdForCurrentSlot = useMemo(() => {
    if (!activeDecisionNodeId || decisionNodes.length === 0) return null;
    const canonicalNodeIdBySlot = getActiveLineageCanonicalNodeIdBySlot(
      decisionNodes,
      activeDecisionNodeId,
      turns,
    );
    const cid = canonicalNodeIdBySlot.get(currentTurnId) ?? null;
    return cid;
  }, [activeDecisionNodeId, decisionNodes, turns, currentTurnId]);

  const activeCanonicalLabel = useMemo(() => {
    if (!canonicalNodeIdForCurrentSlot) return "";
    return decisionNodes.find((n) => n.id === canonicalNodeIdForCurrentSlot)?.label ?? "";
  }, [canonicalNodeIdForCurrentSlot, decisionNodes]);

  const currentTurnPathIndex = useMemo(() => {
    const idx = plannerRows.findIndex((r) => r.id === currentTurnId);
    return idx >= 0 ? idx + 1 : 1;
  }, [plannerRows, currentTurnId]);

  const currentTurnCombatName = useMemo(() => {
    const row = turns[currentTurnIndex];
    const name = row?.state?.player?.combatName?.trim();
    return name || null;
  }, [turns, currentTurnIndex]);

  const currentTurnHasUnsavedChanges = useMemo(
    () => liveCombatDiffersFromPlannerRow(gameState, turns, currentTurnIndex),
    [gameState, turns, currentTurnIndex],
  );

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
    toast("Turn reset", "warning");
  }, [resetCurrentTurn]);

  const commitTurnName = useCallback(
    (trimmed: string) => {
      if (!canonicalNodeIdForCurrentSlot) return;
      const fallback = timelineTurnSubtitleByPlannerRowId.get(currentTurnId) ?? `Turn ${currentTurnId}`;
      updateDecisionNodeLabel(canonicalNodeIdForCurrentSlot, trimmed || fallback);
    },
    [
      canonicalNodeIdForCurrentSlot,
      currentTurnId,
      timelineTurnSubtitleByPlannerRowId,
      updateDecisionNodeLabel,
    ],
  );

  const promptEditTurnNickname = useCallback(() => {
    if (!canonicalNodeIdForCurrentSlot || typeof window === "undefined") return;
    const current = activeCanonicalLabel.trim();
    const next = window.prompt(
      "Nickname for this turn on the Decision Timeline spine. Leave empty to use the default label.",
      current,
    );
    if (next === null) return;
    commitTurnName(next.trim());
  }, [canonicalNodeIdForCurrentSlot, activeCanonicalLabel, commitTurnName]);

  if (!gameState) {
    if (isLoading) {
      return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]">
          <header className="sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
            <h2 className="text-sm font-semibold tracking-tight text-slate-100">Turn timeline</h2>
            <p className="text-[11px] text-slate-500">Restoring session…</p>
          </header>
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">Loading…</div>
        </div>
      );
    }
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]">
        <header className="sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">Turn timeline</h2>
          <p className="text-[11px] leading-relaxed text-slate-500">
            No project loaded. Use{" "}
            <span className="font-semibold text-slate-300">Load project</span> or{" "}
            <span className="font-semibold text-slate-300">Load data</span> in the header, then add rows in{" "}
            <Link href="/turn-maker" className="font-semibold text-amber-300/95 underline-offset-2 hover:underline">
              Turns
            </Link>
            .
          </p>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-500">
          Open or start a project to see the turn stack.
        </div>
      </div>
    );
  }

  const player = gameState.player;

  const phaseSummary =
    turnPhase === "start" ? "Start" : turnPhase === "player" ? "Main" : "Enemy";

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]">
      <header className="sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-start gap-2 text-slate-100">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400/90" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold tracking-tight">Turn timeline</h2>
            <p className="truncate text-[11px] text-slate-500">
              {player.combatName} · Fl {player.floor} · {plannerRows.length} turn{plannerRows.length === 1 ? "" : "s"}
              {timelineFilteredToLineage ? " on active path" : " in planner"}
              {timelineFilteredToLineage && turns.length !== plannerRows.length ? ` · ${turns.length} imported` : null}
            </p>
          </div>
          <button
            type="button"
            disabled={!canonicalNodeIdForCurrentSlot}
            onClick={promptEditTurnNickname}
            title={
              canonicalNodeIdForCurrentSlot
                ? "Edit nickname for the selected turn (Decision Timeline spine)"
                : "Requires an active decision branch with a spine node for this slot"
            }
            aria-label="Edit turn nickname"
            className="mt-0.5 shrink-0 rounded-lg border border-slate-600/70 bg-slate-900/80 p-2 text-slate-300 transition-colors hover:border-violet-500/45 hover:bg-violet-950/35 hover:text-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Phase</span>
          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
              turnPhase === "start"
                ? "border-amber-500/55 bg-amber-950/45 text-amber-100"
                : "border-slate-700/80 bg-slate-900/50 text-slate-500"
            }`}
          >
            <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
            Start
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
              turnPhase === "player"
                ? "border-emerald-500/55 bg-emerald-950/45 text-emerald-100"
                : "border-slate-700/80 bg-slate-900/50 text-slate-500"
            }`}
          >
            <User className="h-3 w-3" strokeWidth={2} aria-hidden />
            Main
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
              turnPhase === "enemy"
                ? "border-rose-500/50 bg-rose-950/45 text-rose-100"
                : "border-slate-700/80 bg-slate-900/50 text-slate-500"
            }`}
          >
            <Skull className="h-3 w-3" strokeWidth={2} aria-hidden />
            Enemy
          </span>
          <span className="ml-auto text-[10px] font-semibold tabular-nums text-cyan-200/90">{phaseSummary}</span>
        </div>

        <div className="mt-3 space-y-1.5 rounded-xl border border-slate-700/70 bg-slate-950/70 px-2.5 py-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px] text-slate-300">
            <span className="font-bold tabular-nums text-slate-100">Turn {currentTurnPathIndex}</span>
            <span className="text-slate-600">·</span>
            <span className="tabular-nums text-slate-500" title="Planner slot id">
              slot {currentTurnId}
            </span>
            {currentTurnUid ? (
              <>
                <span className="text-slate-600">·</span>
                <span
                  className="font-mono text-[9px] font-semibold tabular-nums text-slate-500"
                  title={currentTurnUid}
                >
                  {formatTurnUidShort(currentTurnUid)}
                </span>
              </>
            ) : null}
            {currentTurnCombatName ? (
              <>
                <span className="text-slate-600">·</span>
                <span className="truncate text-slate-400">{currentTurnCombatName}</span>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 p-3">
        <div className={TIMELINE_ZONE}>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <GitBranch className="h-3 w-3 text-cyan-500/80" strokeWidth={2} />
            Path turns
            {timelineFilteredToLineage ? " · active lineage" : ""}
          </p>

          {plannerRows.length === 0 ? (
            <p
              className={`rounded-xl border border-dashed py-6 text-center text-[11px] leading-relaxed transition-colors duration-300 ${
                pathTurnsSeekAttention
                  ? "animate-sts-seek-attention border-cyan-400/45 bg-cyan-950/20 text-cyan-100/95"
                  : "border-slate-700/80 text-slate-500"
              }`}
            >
              {timelineFilteredToLineage && turns.length > 0
                ? pathTurnsEmptyExplanation ??
                  "No turns on the active path. Use Decision Timeline to connect START and Set Active on a checkpoint."
                : "No turns loaded yet."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {plannerRows.map((row, index) => {
                const turnCount = index + 1;
                const turnSubtitle =
                  timelineTurnSubtitleByPlannerRowId.get(row.id) ?? `Turn ${row.id}`;
                const isActive = row.id === currentTurnId;
                const summary = row.summary;
                const lines = summary?.enemySummaries ?? [];
                const expanded = isExpanded(row.id, lines.length);
                const visibleLines = expanded ? lines : lines.slice(0, INTENT_PREVIEW_MAX);
                const hiddenCount = lines.length - visibleLines.length;

                return (
                  <div key={row.id} className="flex w-full flex-col gap-2">
                    <div ref={isActive ? activeTurnRef : undefined} className="w-full">
                    <button
                      type="button"
                      onClick={() => setCurrentTurn(row.id)}
                      title={`${row.combatName} · Turn ${turnCount} · ${turnSubtitle} · Planner row ${row.id} · uid ${row.uid}`}
                      className={`relative w-full max-w-full overflow-hidden rounded-xl border-2 p-2.5 pl-3 text-left transition-all duration-200 ${
                        isActive && currentTurnHasUnsavedChanges
                          ? "border-amber-400/75 bg-linear-to-b from-amber-950/70 via-amber-950/45 to-slate-950/90 text-slate-100 shadow-md shadow-amber-950/35 ring-1 ring-amber-300/30"
                          : isActive
                            ? "border-cyan-500/70 bg-slate-900/95 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-400/15"
                            : "border-slate-700/80 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/50"
                      }`}
                    >
                      <span
                        className="pointer-events-none absolute bottom-0 left-0 top-0 z-[1] w-1 rounded-l-[10px]"
                        style={{ backgroundColor: row.timelineAccentHex }}
                        aria-hidden
                      />
                      <div className="relative z-[2] flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Swords
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive && currentTurnHasUnsavedChanges
                                  ? "text-amber-300"
                                  : isActive
                                    ? "text-cyan-400"
                                    : "text-slate-600"
                              }`}
                              strokeWidth={2}
                            />
                            <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                              <span className="shrink-0 text-sm font-bold tabular-nums tracking-tight text-slate-100">
                                Turn {turnCount}
                              </span>
                              <span className="shrink-0 text-[10px] leading-none text-slate-600" aria-hidden>
                                ·
                              </span>
                              <span
                                className="min-w-0 max-w-[13rem] truncate text-[10px] font-medium leading-none tabular-nums text-slate-500 md:max-w-[15rem]"
                                title={turnSubtitle}
                              >
                                {turnSubtitle}
                              </span>
                            </span>
                            {isActive ? (
                              <span className="rounded-md bg-cyan-500/20 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-cyan-200">
                                Active
                              </span>
                            ) : null}
                            {isActive && currentTurnHasUnsavedChanges ? (
                              <span
                                className="rounded-md bg-amber-400/30 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-50"
                                title="Live combat differs from this planner turn row. Switching turns saves automatically; you can also Save to planner row."
                              >
                                Unsaved
                              </span>
                            ) : null}
                          </div>
                          <p
                            className="mt-0.5 font-mono text-[8px] font-medium tabular-nums text-slate-600"
                            title={row.uid}
                          >
                            {formatTurnUidShort(row.uid)}
                          </p>
                          <p
                            className={`text-[10px] ${
                              isActive && currentTurnHasUnsavedChanges ? "text-amber-200/80" : "text-slate-500"
                            }`}
                          >
                            {summary
                              ? `${summary.enemySummaries.length} intent line${summary.enemySummaries.length === 1 ? "" : "s"}`
                              : "No intents in data for this turn"}
                          </p>
                          {row.decisionBranchOutCount != null ? (
                            <p
                              className={`mt-1 flex items-start gap-1.5 text-[10px] leading-snug ${
                                isActive && currentTurnHasUnsavedChanges
                                  ? "text-violet-200/90"
                                  : "text-violet-300/75"
                              }`}
                            >
                              <GitBranch className="mt-0.5 h-3 w-3 shrink-0 opacity-90" strokeWidth={2} />
                              <span>{decisionTimelineBranchSummary(row.decisionBranchOutCount)}</span>
                            </p>
                          ) : null}
                        </div>
                        {summary && summary.totalDamage > 0 ? (
                          <div className="shrink-0 rounded-full border border-rose-500/35 bg-rose-950/40 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-rose-200">
                            {summary.totalDamage} dmg
                          </div>
                        ) : null}
                      </div>

                      {lines.length > 0 ? (
                        <div
                          className={`relative z-[2] mt-2 space-y-1 border-t pt-2 ${
                            isActive && currentTurnHasUnsavedChanges
                              ? "border-amber-700/50"
                              : "border-slate-800/80"
                          }`}
                        >
                          {visibleLines.map((s, ei) => {
                            const tone = enemyIntentSlotTone(s.name);
                            const titleParts = [
                              `${s.name}: ${s.line || "No intent"}`,
                              s.modifierHint ? `${s.modifierHint}. (n) = base attack.` : "",
                            ].filter(Boolean);
                            return (
                              <div
                                key={`${row.id}-${ei}-${s.name}`}
                                className={`space-y-0.5 rounded-md border px-2 py-1.5 ${tone.card}`}
                              >
                                <div
                                  className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2"
                                  title={titleParts.join(" ")}
                                >
                                  <span
                                    className={`shrink-0 text-[10px] font-semibold tracking-tight ${tone.name}`}
                                  >
                                    {s.name}
                                  </span>
                                  <div className="min-w-0 flex-1 text-[10px] leading-snug text-slate-300">
                                    <IntentIncomingChips actions={s.actions} ctx={s.incomingCtx} />
                                  </div>
                                </div>
                                {s.modifierHint ? (
                                  <p className="text-[9px] leading-tight text-amber-200/80">{s.modifierHint}</p>
                                ) : null}
                              </div>
                            );
                          })}
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
                    </div>
                    {index < plannerRows.length - 1 && (
                      <button
                        type="button"
                        onClick={() => copyTurnStateToSlot(row.id, plannerRows[index + 1].id)}
                        title={`Copy Turn ${turnCount} state into Turn ${turnCount + 1} (active variant)`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-700/60 bg-slate-950/40 py-1 text-[10px] font-medium text-slate-500 transition hover:border-cyan-500/40 hover:bg-cyan-950/20 hover:text-cyan-300"
                      >
                        <Copy className="h-3 w-3 shrink-0" strokeWidth={2} />
                        Copy Turn {turnCount} → Turn {turnCount + 1}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={ACTIONS_ZONE}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quick actions</p>
          <div className="flex flex-col gap-2">
            <ActionBtn
              tone="amber"
              icon={Save}
              onClick={saveCurrentTurn}
              disabled={!currentTurnHasUnsavedChanges}
            >
              Save to planner row
            </ActionBtn>
            <ActionBtn tone="slate" icon={RotateCcw} onClick={handleReset}>
              Reset turn data
            </ActionBtn>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
            Phase steps (Before start, End of start / main / enemy) live in the bar above the top strip. Logs and saves sync
            to the Decision Timeline for the active branch. Yellow highlight means unsaved edits vs this row; switching
            turns saves the previous slot automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
