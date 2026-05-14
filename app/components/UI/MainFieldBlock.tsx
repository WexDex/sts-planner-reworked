"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useGameManager } from "@/app/context/GameContext";
import STSCard from "./Card";
import { LOCATION } from "@/app/types/types";
import {
  ActivityLogRowExpanded,
  ActivityLogRowInline,
  logEntryMatchesFilter,
  type ActivityLogInlineDensity,
} from "@/app/components/activity-log/activity-log-rows";
import type { ActivityLogEntry, Enemy, EnemyIntentAction, PlayerData } from "@/app/types/gameTypes";
import { IntentIncomingChips } from "@/app/components/UI/IntentIncomingChips";
import type { IncomingDamageContext } from "@/app/utils/intentFormat";
import {
  buildIncomingDamageContext,
  describeIncomingModifiers,
  formatIntentActionsLineIncoming,
  isEnemyActiveForIntents,
} from "@/app/utils/intentFormat";
import { isEnemyTargetableInPlannerTurn } from "@/app/utils/enemyPlannerTurn";
import { enemyIntentSlotTone } from "@/app/utils/enemyIntentSlotTone";
import { formatTurnUidShort, hasValidPlannerTurnSelection } from "@/app/utils/gameHelpers";
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  Crosshair,
  GalleryHorizontal,
  GripHorizontal,
  Hand,
  LayoutDashboard,
  LayoutGrid,
  ListTree,
  Maximize2,
  Minus,
  ScrollText,
  Search,
  SquareStack,
  User,
  X,
} from "lucide-react";

import { toast } from "@/app/utils/toast";

type TargetMode = "single" | "multi";
type CardPileViewSize = "small" | "medium" | "large";
type HandLayout = "legacy" | "scroll" | "fan";

const HAND_LAYOUT_KEY = "sts-hand-layout-v1";

function cyclePileViewSize(s: CardPileViewSize): CardPileViewSize {
  return s === "small" ? "medium" : s === "medium" ? "large" : "small";
}

function CardSizeCycleButton({
  size,
  onChange,
}: {
  size: CardPileViewSize;
  onChange: (next: CardPileViewSize) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(cyclePileViewSize(size))}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
      title="Cycle card size: small → medium → large"
    >
      <LayoutGrid
        className={`h-4 w-4 ${size === "small" ? "text-cyan-300" : "text-slate-500"}`}
        strokeWidth={2}
      />
      <Columns2
        className={`h-4 w-4 ${size === "medium" ? "text-cyan-300" : "text-slate-500"}`}
        strokeWidth={2}
      />
      <SquareStack
        className={`h-4 w-4 ${size === "large" ? "text-cyan-300" : "text-slate-500"}`}
        strokeWidth={2}
      />
      <span className="hidden sm:inline">Size</span>
    </button>
  );
}

function PlayOrderBadge({ order }: { order: number }) {
  return (
    <span className="pointer-events-none absolute right-1 top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-md ring-1 ring-white/20">
      {order}
    </span>
  );
}

function HandFan({
  hand,
  size,
  onToggleSelect,
  playOrder,
  getCardKey,
}: {
  hand: import("@/app/types/gameTypes").Card[];
  size: CardPileViewSize;
  onToggleSelect: (location: string, index: number) => void;
  playOrder: Record<string, number>;
  getCardKey: (card: import("@/app/types/gameTypes").Card, index: number) => string;
}) {
  const n = hand.length;
  const totalSpread = Math.min(60, n * 8);
  const cardStep = size === "small" ? 72 : size === "large" ? 116 : 92;
  const minHeight = size === "small" ? "11rem" : size === "large" ? "19rem" : "15rem";
  return (
    <div className="relative flex items-end justify-center overflow-x-auto" style={{ minHeight }}>
      {hand.map((card, index) => {
        const rotDeg = n > 1 ? totalSpread * (index - (n - 1) / 2) / (n - 1) : 0;
        const yOffset = Math.abs(rotDeg) * 1.2;
        const offsetX = (index - (n - 1) / 2) * cardStep;
        const order = playOrder[getCardKey(card, index)];
        return (
          <div
            key={`fan-${index}-${card.name}`}
            className="absolute bottom-0 transition-[transform,z-index] duration-200 hover:z-50"
            style={{
              transform: `translateX(${offsetX}px) rotate(${rotDeg}deg) translateY(${yOffset}px)`,
              zIndex: card.isSelected ? 50 + index : index + 1,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = `translateX(${offsetX}px) rotate(${rotDeg}deg) translateY(-2rem)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = `translateX(${offsetX}px) rotate(${rotDeg}deg) translateY(${yOffset}px)`;
            }}
          >
            <div className="relative">
              {order != null && <PlayOrderBadge order={order} />}
              <STSCard
                size={size}
                card={card}
                index={index}
                location={LOCATION.HAND}
                onToggleSelect={onToggleSelect}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ACTIVITY_LOG_DENSITY_KEY = "sts-activity-log-inline-density";
const TARGET_ENEMY_LAYOUT_KEY = "sts-target-enemy-layout-v1";

/** Visual layout for selectable enemy tiles (persisted locally while comparing). */
type TargetEnemyLayout = "tiles" | "hud_strip";

/** Intent row + incoming context for the active planner turn (for chips + tooltips). */
function plannerTurnIntentIncoming(
  enemy: Enemy,
  turnId: number,
  player: PlayerData | undefined,
): {
  actions: EnemyIntentAction[];
  incomingCtx: IncomingDamageContext;
  modifierHint: string;
  line: string;
} | null {
  const intent = enemy.intents?.find((i) => i.turn === turnId);
  if (!intent) return null;
  if (!isEnemyActiveForIntents(enemy)) return null;
  const incomingCtx = buildIncomingDamageContext(player, enemy);
  const line = formatIntentActionsLineIncoming(intent.actions, incomingCtx);
  const modifierHint = describeIncomingModifiers(incomingCtx);
  return { actions: [...intent.actions], incomingCtx, modifierHint, line };
}

const SHELL = "rounded-2xl border border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-xl shadow-slate-950/25";

export default function MainFieldBlock() {
  const {
    gameState,
    turns,
    currentTurnIndex,
    saveCurrentTurn,
    toggleCardSelection,
    combatTargetMode: targetMode,
    setCombatTargetMode,
    combatTargetEnemyIndices: selectedEnemyIndices,
    toggleCombatEnemyTarget,
    combatTargetSelf,
    toggleCombatTargetSelf,
    clearCombatTargets,
  } = useGameManager();
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [activityLogFilter, setActivityLogFilter] = useState("");
  const [activityLogModalTurnIndex, setActivityLogModalTurnIndex] = useState(0);
  const [activityLogDensity, setActivityLogDensity] = useState<ActivityLogInlineDensity>("detailed");
  const [mounted, setMounted] = useState(false);
  const [handCardSize, setHandCardSize] = useState<CardPileViewSize>("medium");
  const [handLayout, setHandLayout] = useState<HandLayout>("legacy");
  const [enemyTargetLayout, setEnemyTargetLayout] = useState<TargetEnemyLayout>("tiles");

  // Play order: keyed by card._uid or fallback "hand-{index}", value = 1-based play position
  const [playOrder, setPlayOrder] = useState<Record<string, number>>({});

  const getHandCardKey = useCallback((card: import("@/app/types/gameTypes").Card, index: number) =>
    card._uid ?? `hand-${index}`, []);

  // Keep playOrder in sync with actual hand selection.
  // Any external action (playSelectedCards, moveSelectedCards, deselectAllCards, etc.)
  // clears isSelected in gameState but never touches the local playOrder — this effect
  // removes stale keys and renumbers so badges never linger on deselected/played cards.
  useEffect(() => {
    const hand = gameState?.hand;
    if (!hand || hand.length === 0) {
      setPlayOrder({});
      return;
    }
    const selectedKeys = new Set<string>();
    hand.forEach((card, i) => {
      if (card.isSelected) selectedKeys.add(getHandCardKey(card, i));
    });
    setPlayOrder(prev => {
      const hasStale = Object.keys(prev).some(k => !selectedKeys.has(k));
      if (!hasStale) return prev;
      const kept = Object.entries(prev)
        .filter(([k]) => selectedKeys.has(k))
        .sort((a, b) => a[1] - b[1]);
      const renumbered: Record<string, number> = {};
      kept.forEach(([k], i) => { renumbered[k] = i + 1; });
      return renumbered;
    });
  }, [gameState?.hand, getHandCardKey]);

  const handleToggleHandSelect = useCallback((location: string, index: number) => {
    if (location === LOCATION.HAND) {
      const card = gameState?.hand[index];
      const key = getHandCardKey(card!, index);
      const wasSelected = card?.isSelected;
      setPlayOrder(prev => {
        if (wasSelected) {
          const next = { ...prev };
          delete next[key];
          const sorted = Object.entries(next).sort((a, b) => a[1] - b[1]);
          const renumbered: Record<string, number> = {};
          sorted.forEach(([k], i) => { renumbered[k] = i + 1; });
          return renumbered;
        } else {
          const maxOrder = Object.values(prev).length > 0 ? Math.max(...Object.values(prev)) : 0;
          return { ...prev, [key]: maxOrder + 1 };
        }
      });
    }
    toggleCardSelection(location, index);
  }, [gameState?.hand, getHandCardKey, toggleCardSelection]);

  const enemies = useMemo(() => gameState?.enemies ?? [], [gameState?.enemies]);

  const plannerTurnReady = useMemo(
    () => hasValidPlannerTurnSelection(turns, currentTurnIndex),
    [turns, currentTurnIndex],
  );

  const logEntriesNewestFirst = useMemo(() => [...(gameState?.activityLog ?? [])].reverse(), [gameState?.activityLog]);

  const anyTurnHasLogEntries = useMemo(
    () => turns.some((t) => (t.state?.activityLog?.length ?? 0) > 0),
    [turns],
  );

  const safeModalLogTurnIndex = Math.min(
    activityLogModalTurnIndex,
    Math.max(0, turns.length - 1),
  );
  const activityLogForModalTurn = turns[safeModalLogTurnIndex]?.state?.activityLog;
  const modalLogEntriesNewestFirst = useMemo(
    () => [...(activityLogForModalTurn ?? [])].reverse(),
    [activityLogForModalTurn],
  );
  const filteredModalLogEntries = useMemo(() => {
    const q = activityLogFilter.trim().toLowerCase();
    if (!q) return modalLogEntriesNewestFirst;
    return modalLogEntriesNewestFirst.filter((e) => logEntryMatchesFilter(e, q));
  }, [modalLogEntriesNewestFirst, activityLogFilter]);

  const modalTurnMeta = turns[safeModalLogTurnIndex];
  const isViewingCurrentTurnInModal = safeModalLogTurnIndex === currentTurnIndex;

  const currentTurnId = useMemo(() => {
    const fromTurn = turns[currentTurnIndex]?.id;
    if (fromTurn != null) return fromTurn;
    let minT: number | null = null;
    for (const e of enemies) {
      for (const intent of e.intents ?? []) {
        if (minT == null || intent.turn < minT) minT = intent.turn;
      }
    }
    return minT ?? 1;
  }, [turns, currentTurnIndex, enemies]);

  const plannerTargetEnemyEntries = useMemo(
    () =>
      enemies.map((enemy, index) => ({ enemy, index })).filter(({ enemy }) =>
        isEnemyTargetableInPlannerTurn(enemy, currentTurnId)),
    [enemies, currentTurnId],
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACTIVITY_LOG_DENSITY_KEY);
      if (raw === "minimal" || raw === "detailed") setActivityLogDensity(raw);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TARGET_ENEMY_LAYOUT_KEY);
      if (raw === "tiles" || raw === "hud_strip") setEnemyTargetLayout(raw);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TARGET_ENEMY_LAYOUT_KEY, enemyTargetLayout);
    } catch {
      /* ignore */
    }
  }, [enemyTargetLayout]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HAND_LAYOUT_KEY);
      if (raw === "legacy" || raw === "scroll" || raw === "fan") setHandLayout(raw);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HAND_LAYOUT_KEY, handLayout);
    } catch {
      /* ignore */
    }
  }, [handLayout]);

  const setInlineLogDensity = useCallback((d: ActivityLogInlineDensity) => {
    setActivityLogDensity(d);
    try {
      localStorage.setItem(ACTIVITY_LOG_DENSITY_KEY, d);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!activityLogOpen) {
      setActivityLogFilter("");
      return;
    }
    const isTypingInField = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      return el.isContentEditable;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setActivityLogOpen(false);
        return;
      }
      if (turns.length < 2 || isTypingInField(e.target)) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        setActivityLogModalTurnIndex((i) => {
          const max = Math.max(0, turns.length - 1);
          const c = Math.min(Math.max(0, i), max);
          if (e.key === "ArrowLeft") return Math.max(0, c - 1);
          return Math.min(max, c + 1);
        });
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [activityLogOpen, turns.length]);

  const setMode = useCallback((mode: TargetMode) => {
    setCombatTargetMode(mode);
  }, [setCombatTargetMode]);

  if (!gameState || !plannerTurnReady) {
    const noPlannerRows = turns.length === 0;
    return (
      <div id="sts-battle-focus" className="mx-auto w-full max-w-6xl scroll-mt-2 space-y-4">
        <section className={`${SHELL} border-amber-500/30 ring-1 ring-amber-500/15`}>
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-lg font-semibold text-amber-100">No data</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              {!gameState ? (
                <>
                  Use <span className="font-semibold text-slate-300">Load project</span> or{" "}
                  <span className="font-semibold text-slate-300">Load data</span> in the header, then add planner rows in{" "}
                  <Link href="/turn-maker" className="font-semibold text-amber-300/95 underline-offset-2 hover:underline">
                    Turns
                  </Link>
                  . The board stays inactive until combat and a valid row are ready.
                </>
              ) : noPlannerRows ? (
                <>
                  Open{" "}
                  <Link href="/turn-maker" className="font-semibold text-amber-300/95 underline-offset-2 hover:underline">
                    Turns
                  </Link>{" "}
                  and add at least one planner row. Without rows there is no snapshot to target or edit.
                </>
              ) : (
                <>
                  The main field needs an active planner row. Open{" "}
                  <Link href="/turn-maker" className="font-semibold text-amber-300/95 underline-offset-2 hover:underline">
                    Turns
                  </Link>{" "}
                  to add a row or select one, then return here to play and edit that snapshot.
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div id="sts-battle-focus" className="mx-auto w-full max-w-6xl scroll-mt-2 space-y-4">
      {/* Targets */}
      <section className={`${SHELL} border-cyan-500/15 ring-1 ring-cyan-500/5`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-950/40 text-cyan-400">
              <Crosshair className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-100">Target selection</h2>
              <p className="text-[11px] text-slate-500">
                Single or multi-select for card actions. Only enemies with intent data for planner turn{" "}
                <span className="font-mono tabular-nums text-slate-400">{currentTurnId}</span> appear here (empty intent = not
                spawned yet; use Turn Maker &quot;No action&quot; when they should appear with no intent).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(selectedEnemyIndices.length > 0 || combatTargetSelf) && (
              <button
                type="button"
                onClick={clearCombatTargets}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                Clear
              </button>
            )}
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 ms-4">Mode</span>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 p-0.5">


              <button
                type="button"
                onClick={() => setMode("single")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${targetMode === "single"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/30"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setMode("multi")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${targetMode === "multi"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/30"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Multi
              </button>
            </div>
            <button
              type="button"
              onClick={() => toggleCombatTargetSelf()}
              title="Mark yourself as the target (self-targeting cards)"
              className={`inline-flex items-center gap-0.5 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${combatTargetSelf
                  ? "border-sky-500/70 bg-sky-950/45 text-sky-200 shadow-sm shadow-sky-950/30"
                  : "border-slate-600/90 bg-slate-900/70 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                }`}
            >
              <User className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2} />
              Self
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700/65 bg-slate-900/40 px-3 py-2 shadow-inner shadow-black/20">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Enemy layout</span>
          <div className="inline-flex rounded-lg border border-slate-600/85 bg-slate-950/80 p-0.5">
            <button
              type="button"
              onClick={() => setEnemyTargetLayout("tiles")}
              title="Wide cards — more stats and buff chips"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                enemyTargetLayout === "tiles"
                  ? "bg-cyan-600 text-white shadow-sm shadow-cyan-950/40"
                  : "text-slate-400 hover:bg-slate-800/90 hover:text-slate-100"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} />
              Tiles
            </button>
            <button
              type="button"
              onClick={() => setEnemyTargetLayout("hud_strip")}
              title="Compact horizontal tokens — scan intents quickly"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                enemyTargetLayout === "hud_strip"
                  ? "bg-cyan-600 text-white shadow-sm shadow-cyan-950/40"
                  : "text-slate-400 hover:bg-slate-800/90 hover:text-slate-100"
              }`}
            >
              <GripHorizontal className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} />
              HUD strip
            </button>
          </div>
          <span className="text-[10px] text-slate-600">
            Choice is saved in this browser so you can switch turns and still compare.
          </span>
        </div>

        {(selectedEnemyIndices.length > 0 || combatTargetSelf) && (
          <p
            className="mb-3 truncate rounded-lg border border-rose-500/20 bg-rose-950/25 px-3 py-2 text-xs text-slate-300"
            title={
              [
                ...(combatTargetSelf ? ["Self"] : []),
                ...selectedEnemyIndices.map((i) => enemies[i]?.name ?? `#${i}`),
              ].join(", ") || undefined
            }
          >
            Selected{" "}
            <span className="font-mono font-medium text-rose-200">
              {[
                ...(combatTargetSelf ? ["Self"] : []),
                ...selectedEnemyIndices.map((i) => enemies[i]?.name ?? `Enemy #${i + 1}`),
              ].join(" · ")}
            </span>
            <span className="text-slate-500">
              {" "}
              · {selectedEnemyIndices.length + (combatTargetSelf ? 1 : 0)}
            </span>
          </p>
        )}

        {enemies.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 py-8 text-center text-sm text-slate-500">No enemies in this combat.</p>
        ) : plannerTargetEnemyEntries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700/85 bg-slate-950/35 py-8 text-center text-sm leading-relaxed text-slate-500">
            No enemies are in combat for planner turn {currentTurnId} yet.&nbsp;
            <span className="block text-[12px] text-slate-600">
              Give each enemy an intent slot for this turn — add at least one action, or choose &quot;No action&quot; if they spawn
              but act later.
            </span>
          </p>
        ) : enemyTargetLayout === "tiles" ? (
          <div className="rounded-2xl border-2 border-cyan-500/22 bg-linear-to-b from-cyan-950/30 via-slate-950 to-slate-950 p-3 shadow-[inset_0_1px_0_0_rgba(34,211,238,0.07)] shadow-lg shadow-cyan-950/22 ring-1 ring-cyan-400/10">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <Crosshair className="h-3 w-3 shrink-0 text-cyan-400/80" strokeWidth={2} />
              Target pool · same intent chips as timeline
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {plannerTargetEnemyEntries.map(({ enemy, index }) => {
                const tone = enemyIntentSlotTone(enemy.name);
                const selected = selectedEnemyIndices.includes(index);
                const hpPct = enemy.maxHp > 0 ? Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100)) : 0;
                const block = enemy.currentBlock ?? 0;
                const buffs = enemy.buffsDebuffs ?? [];
                const incoming = plannerTurnIntentIncoming(enemy, currentTurnId, gameState?.player);
                const tooltipLine = incoming
                  ? incoming.modifierHint
                    ? `${incoming.line} — ${incoming.modifierHint}. (n) = base attack where shown.`
                    : `${incoming.line}. (n) = base attack where shown.`
                  : undefined;

                return (
                  <button
                    key={`${enemy.name}-${index}-tiles`}
                    type="button"
                    onClick={() => toggleCombatEnemyTarget(index)}
                    title={tooltipLine}
                    className={`group relative w-full overflow-hidden rounded-xl border text-left shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${tone.card} ${
                      selected
                        ? "ring-2 ring-rose-400/55 ring-offset-2 ring-offset-[rgb(2,6,23)] shadow-lg shadow-rose-950/35 brightness-105"
                        : "hover:shadow-lg hover:shadow-black/25 hover:brightness-[1.03]"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent ${selected ? "via-rose-300/35" : "via-white/12"} to-transparent`}
                    />
                    <div className="relative p-3">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`line-clamp-2 text-[15px] font-bold leading-snug tracking-tight ${tone.name}`}>
                            {enemy.name}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium text-slate-500">Combat slot {index + 1}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {selected ? (
                            <span className="rounded-md bg-rose-500/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                              Targeted
                            </span>
                          ) : null}
                          <span className="rounded-md border border-white/10 bg-black/35 px-1.5 py-px font-mono text-[10px] tabular-nums text-slate-400">
                            T{currentTurnId}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-white/8 bg-black/22 p-2 shadow-inner shadow-black/30">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">HP</p>
                          <p className="font-mono text-sm font-semibold tabular-nums text-rose-200">
                            {enemy.hp}
                            <span className="font-normal text-slate-600"> / </span>
                            {enemy.maxHp}
                          </p>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-900/90">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-rose-800 to-rose-400 transition-[width]"
                              style={{ width: `${hpPct}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Block</p>
                          <p
                            className={`font-mono text-sm font-semibold tabular-nums ${block ? "text-sky-300" : "text-slate-600"}`}
                          >
                            {block}
                          </p>
                          <div className="mt-[1.35rem] h-px w-full bg-linear-to-r from-sky-500/25 via-sky-400/15 to-transparent opacity-80" />
                        </div>
                      </div>

                      {buffs.length > 0 ? (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {buffs.map((bd, bi) => (
                            <span
                              key={bi}
                              title={bd.description}
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                                bd.type === "buff"
                                  ? "border border-emerald-800/90 bg-emerald-950/85 text-emerald-300"
                                  : "border border-amber-800/90 bg-amber-950/85 text-amber-200"
                              }`}
                            >
                              {bd.name}
                              {bd.stacks !== 1 ? `×${bd.stacks}` : ""}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="rounded-lg border border-white/10 bg-slate-950/55 px-2.5 py-2 shadow-inner shadow-black/40">
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Incoming</p>
                        {incoming ? (
                          <>
                            <IntentIncomingChips actions={incoming.actions} ctx={incoming.incomingCtx} />
                            {incoming.modifierHint ? (
                              <p className="mt-2 border-t border-amber-500/15 pt-1.5 text-[9px] leading-relaxed text-amber-200/85">
                                {incoming.modifierHint}
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <p className="text-[10px] italic text-slate-600">No intent for this slot</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-cyan-500/18 bg-linear-to-br from-slate-950 via-slate-900/92 to-slate-950 px-3 py-3 shadow-inner shadow-black/35 ring-1 ring-cyan-500/8">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/75">
                Alternate · HUD strip
              </span>
              <span className="max-w-xl text-[10px] text-slate-500">
                Compact tokens in a scrolling row — swipe on narrow viewports.
              </span>
            </div>
            <div className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 pt-0.5 [scrollbar-width:thin]">
              {plannerTargetEnemyEntries.map(({ enemy, index }) => {
                const selected = selectedEnemyIndices.includes(index);
                const hpPct = enemy.maxHp > 0 ? Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100)) : 0;
                const block = enemy.currentBlock ?? 0;
                const buffCount = enemy.buffsDebuffs?.length ?? 0;
                const incoming = plannerTurnIntentIncoming(enemy, currentTurnId, gameState?.player);
                const titleIntent = incoming
                  ? incoming.modifierHint
                    ? `${incoming.line} — ${incoming.modifierHint}`
                    : incoming.line
                  : undefined;

                return (
                  <button
                    key={`${enemy.name}-${index}-hud`}
                    type="button"
                    onClick={() => toggleCombatEnemyTarget(index)}
                    title={titleIntent}
                    className={`group relative flex w-[154px] shrink-0 snap-start flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.985] md:w-[164px] ${
                      selected
                        ? "border-rose-500/95 bg-linear-to-b from-rose-950/55 to-slate-950/90 shadow-lg shadow-rose-950/25 ring-1 ring-rose-400/25"
                        : "border-slate-600/75 bg-slate-900/55 hover:border-cyan-500/40 hover:bg-slate-900/95"
                    }`}
                  >
                    {selected ? (
                      <span
                        aria-hidden
                        className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_theme(colors.cyan.400)]"
                      />
                    ) : null}

                    <div className={`flex items-start gap-2 ${selected ? "pl-4" : "pl-0"}`}>
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-black tabular-nums ${
                          selected
                            ? "border-cyan-500/55 bg-linear-to-br from-cyan-950/90 to-slate-950 text-cyan-100"
                            : "border-slate-600 bg-slate-950/95 text-slate-400 group-hover:border-slate-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[13px] font-bold leading-snug tracking-tight text-slate-100">
                          {enemy.name}
                        </p>
                      </div>
                    </div>

                    <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-black/65">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-[width] ${
                          selected
                            ? "bg-linear-to-r from-rose-500 to-orange-400"
                            : "bg-linear-to-r from-rose-600/90 to-rose-400/85"
                        }`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1 font-mono text-[10px] tabular-nums text-slate-400">
                      <span className="truncate text-rose-200/90">{enemy.hp}</span>
                      <span className="shrink-0 text-slate-600">/</span>
                      <span className="truncate text-right text-slate-500">{enemy.maxHp}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 border-t border-white/10 pt-1.5 text-[10px]">
                      <span className="text-slate-500">Blk</span>
                      <span className={`font-semibold tabular-nums ${block ? "text-sky-300" : "text-slate-600"}`}>{block}</span>
                      <span className={`text-[9px] ${buffCount ? "text-violet-300/90" : "text-slate-600"}`}>
                        Status×{buffCount}
                      </span>
                    </div>
                    <div className="max-h-[5.5rem] min-h-[2.75rem] overflow-y-auto border-t border-dashed border-slate-700/85 pt-1.5 text-[10px] leading-snug [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600">
                      {incoming ? (
                        <>
                          <span className="mb-1 block font-mono text-[9px] text-cyan-500/85">T{currentTurnId}</span>
                          <IntentIncomingChips actions={incoming.actions} ctx={incoming.incomingCtx} />
                          {incoming.modifierHint ? (
                            <span className="mt-1 block text-[9px] text-amber-200/75" title={incoming.modifierHint}>
                              {incoming.modifierHint}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-slate-600 italic">No intent preview</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Hand */}
      <section className={`${SHELL}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-950/35 text-emerald-400">
              <Hand className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-100">Hand</h2>
              <p className="text-[11px] text-slate-500">{(gameState?.hand ?? []).length} cards</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 p-0.5" role="group" aria-label="Hand layout">
              <button
                type="button"
                onClick={() => setHandLayout("legacy")}
                title="Wrap layout"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${handLayout === "legacy" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-950/40" : "text-slate-400 hover:text-slate-200"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                Wrap
              </button>
              <button
                type="button"
                onClick={() => setHandLayout("scroll")}
                title="Horizontal scroll row"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${handLayout === "scroll" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-950/40" : "text-slate-400 hover:text-slate-200"}`}
              >
                <GalleryHorizontal className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                Row
              </button>
              <button
                type="button"
                onClick={() => setHandLayout("fan")}
                title="Fan / arc layout"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${handLayout === "fan" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-950/40" : "text-slate-400 hover:text-slate-200"}`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                Fan
              </button>
            </div>
            <CardSizeCycleButton size={handCardSize} onChange={setHandCardSize} />
          </div>
        </div>

        {handLayout === "legacy" && (
          <div className="flex flex-wrap gap-4">
            {(gameState?.hand ?? []).map((card, index) => {
              const order = playOrder[getHandCardKey(card, index)];
              return (
                <div key={`hand-${index}-${card.name}`} className="relative">
                  {order != null && <PlayOrderBadge order={order} />}
                  <STSCard
                    size={handCardSize}
                    card={card}
                    index={index}
                    location={LOCATION.HAND}
                    onToggleSelect={handleToggleHandSelect}
                  />
                </div>
              );
            })}
          </div>
        )}

        {handLayout === "scroll" && (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {(gameState?.hand ?? []).map((card, index) => {
              const order = playOrder[getHandCardKey(card, index)];
              return (
                <div key={`hand-${index}-${card.name}`} className="relative shrink-0 snap-start">
                  {order != null && <PlayOrderBadge order={order} />}
                  <STSCard
                    size={handCardSize}
                    card={card}
                    index={index}
                    location={LOCATION.HAND}
                    onToggleSelect={handleToggleHandSelect}
                  />
                </div>
              );
            })}
          </div>
        )}

        {handLayout === "fan" && (
          <HandFan
            hand={gameState?.hand ?? []}
            size={handCardSize}
            onToggleSelect={handleToggleHandSelect}
            playOrder={playOrder}
            getCardKey={getHandCardKey}
          />
        )}
      </section>

      {/* Activity log — compact + expand */}
      <section
        className={`${SHELL} border-violet-500/20 bg-linear-to-br from-slate-950 via-slate-900/98 to-violet-950/20 ring-1 ring-violet-500/10`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-950/40 text-violet-300">
              <ScrollText className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-100">Activity log</h2>
              <p className="text-[11px] text-slate-500">
                {logEntriesNewestFirst.length} {logEntriesNewestFirst.length === 1 ? "entry" : "entries"} · newest first
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 p-0.5"
              role="group"
              aria-label="Inline log detail level"
            >
              <button
                type="button"
                onClick={() => setInlineLogDensity("minimal")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${activityLogDensity === "minimal"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                Minimal
              </button>
              <button
                type="button"
                onClick={() => setInlineLogDensity("detailed")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${activityLogDensity === "detailed"
                    ? "bg-violet-600/90 text-white shadow-sm shadow-violet-950/30"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <ListTree className="h-3.5 w-3.5" strokeWidth={2} />
                Detailed
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                saveCurrentTurn();
                setActivityLogModalTurnIndex(currentTurnIndex);
                setActivityLogOpen(true);
              }}
              disabled={!plannerTurnReady || !anyTurnHasLogEntries}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-950/50 px-3 py-2 text-xs font-semibold text-violet-100 shadow-sm transition-all hover:bg-violet-900/50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
              Big view
            </button>
          </div>
        </div>

        {logEntriesNewestFirst.length > 0 ? (
          <div className="relative max-h-80 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/40 pr-1 [scrollbar-width:thin]">
            {activityLogDensity === "detailed" ? (
              <div className="pointer-events-none absolute bottom-0 left-[21px] top-8 w-px bg-slate-700/80" aria-hidden />
            ) : null}
            <div className="relative py-1">
              {logEntriesNewestFirst.map((entry) => (
                <ActivityLogRowInline key={entry.id} entry={entry} density={activityLogDensity} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center">
            <p className="text-sm text-slate-400">No activity recorded yet.</p>
            <p className="mt-1 text-xs text-slate-600">Plays, moves, and stat changes will show up here.</p>
          </div>
        )}
      </section>

      {mounted &&
        activityLogOpen &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="activity-log-expanded-title">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
              aria-label="Close activity log"
              onClick={() => setActivityLogOpen(false)}
            />
            <div className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col px-3 pb-4 pt-4 md:px-6 md:pb-8 md:pt-6">
              <div className="flex shrink-0 flex-col gap-3 rounded-t-2xl border border-b-0 border-violet-500/25 bg-slate-950/95 px-4 py-4 shadow-2xl shadow-black/40 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="flex items-center gap-3">
                  <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/35 bg-violet-950/50 text-violet-300 sm:flex">
                    <ScrollText className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 id="activity-log-expanded-title" className="text-lg font-bold text-slate-50 md:text-xl">
                      Activity log
                    </h2>
                    <p className="text-sm text-slate-500">
                      Larger type and full text — Esc to close.{" "}
                      {turns.length > 1 ? "←/→ to change turn when not typing in the filter." : null}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivityLogOpen(false)}
                  className="inline-flex items-center justify-center gap-2 self-end rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 md:self-auto"
                >
                  <X className="h-4 w-4" />
                  Close
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl border border-t-0 border-violet-500/25 bg-slate-950/90 shadow-2xl shadow-black/50">
                <div className="shrink-0 space-y-3 border-b border-slate-800 p-4 md:px-6">
                  {turns.length > 0 ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Log from</span>
                        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              setActivityLogModalTurnIndex((i) => {
                                const max = Math.max(0, turns.length - 1);
                                const c = Math.min(Math.max(0, i), max);
                                return Math.max(0, c - 1);
                              })
                            }
                            disabled={safeModalLogTurnIndex <= 0}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Previous turn log"
                            title="Previous turn (←)"
                          >
                            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                          </button>
                          <span
                            className="flex min-w-[7.5rem] flex-col items-center justify-center select-none text-center text-sm font-semibold tabular-nums text-slate-100"
                            title={
                              modalTurnMeta
                                ? `Planner slot ${modalTurnMeta.id} · uid ${modalTurnMeta.uid}`
                                : undefined
                            }
                          >
                            <span>
                              Turn {modalTurnMeta?.id ?? "—"}
                              {turns.length > 1 ? ` · ${safeModalLogTurnIndex + 1}/${turns.length}` : null}
                              {!isViewingCurrentTurnInModal && turns.length > 1 ? (
                                <span className="ms-1 text-[10px] font-medium uppercase text-amber-400/90">
                                  (not current)
                                </span>
                              ) : null}
                            </span>
                            {modalTurnMeta?.uid ? (
                              <span
                                className="font-mono text-[9px] font-medium tabular-nums text-slate-500"
                                title={modalTurnMeta.uid}
                              >
                                {formatTurnUidShort(modalTurnMeta.uid)}
                              </span>
                            ) : null}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setActivityLogModalTurnIndex((i) => {
                                const max = Math.max(0, turns.length - 1);
                                const c = Math.min(Math.max(0, i), max);
                                return Math.min(max, c + 1);
                              })
                            }
                            disabled={safeModalLogTurnIndex >= turns.length - 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Next turn log"
                            title="Next turn (→)"
                          >
                            <ChevronRight className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActivityLogModalTurnIndex(currentTurnIndex)}
                          disabled={isViewingCurrentTurnInModal}
                          className="rounded-lg border border-violet-500/35 bg-violet-950/40 px-2.5 py-1.5 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-900/50 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Jump to the turn you are playing"
                        >
                          Current turn
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      value={activityLogFilter}
                      onChange={(e) => setActivityLogFilter(e.target.value)}
                      placeholder="Filter by title or details…"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 pl-10 pr-4 text-base text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    Showing {filteredModalLogEntries.length} of {modalLogEntriesNewestFirst.length} entries
                    {turns.length > 1 && modalTurnMeta ? ` · Turn ${modalTurnMeta.id}` : null}
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 [scrollbar-width:thin]">
                  {filteredModalLogEntries.length > 0 ? (
                    <div className="flex flex-col gap-5 pb-8">
                      {filteredModalLogEntries.map((entry) => (
                        <ActivityLogRowExpanded key={entry.id} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <p className="py-12 text-center text-slate-500">
                      {modalLogEntriesNewestFirst.length === 0
                        ? "No activity for this turn."
                        : "No entries match your filter."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
