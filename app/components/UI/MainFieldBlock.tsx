"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useGameManager } from "@/app/context/GameContext";
import STSCard from "./Card";
import { LOCATION } from "@/app/types/types";
import { ACTIVITY_LOG_COLORS, ACTIVITY_LOG_ICONS, CARD_TYPE_BG, CARD_TYPE_COLORS } from "@/app/constants/colors";
import { ActivityLogType } from "@/app/utils/activityLogger";
import type {
  ActivityLogCardRef,
  ActivityLogContextLine,
  ActivityLogEntry,
  Enemy,
  EnemyIntentAction,
  PlayerData,
} from "@/app/types/gameTypes";
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
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  Crosshair,
  GripHorizontal,
  Hand,
  Layers,
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
type ActivityLogInlineDensity = "minimal" | "detailed";
type CardPileViewSize = "small" | "medium" | "large";

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

type LogColors = (typeof ACTIVITY_LOG_COLORS)[keyof typeof ACTIVITY_LOG_COLORS];

function getActivityLogColors(type?: ActivityLogType): LogColors {
  const logType = type || "info";
  return (ACTIVITY_LOG_COLORS as Record<string, LogColors>)[logType] || ACTIVITY_LOG_COLORS.info;
}

function getActivityLogIcon(type?: ActivityLogType): string {
  const logType = type || "info";
  return (ACTIVITY_LOG_ICONS as Record<string, string>)[logType] || "•";
}

function cardTypeClasses(cardType?: string) {
  const t = cardType as keyof typeof CARD_TYPE_COLORS | undefined;
  const text = (t && CARD_TYPE_COLORS[t]) || "text-slate-200";
  const bg = (t && CARD_TYPE_BG[t]) || "bg-slate-800/80";
  return { text, bg };
}

function ActivityLogCardChips({ cards, size = "sm" }: { cards: ActivityLogCardRef[]; size?: "sm" | "md" }) {
  const md = size === "md";
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Cards involved">
      {cards.map((c, i) => {
        const { text, bg } = cardTypeClasses(c.cardType);
        return (
          <span
            key={`${c.name}-${i}`}
            title={c.cardType ? `${c.name} · ${c.cardType}` : c.name}
            className={`inline-flex max-w-full items-baseline gap-1 truncate rounded-lg border border-white/10 font-semibold shadow-sm ${text} ${bg} ${md ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-[11px]"}`}
          >
            <span className="truncate">{c.name}</span>
            {c.cardType ? (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide opacity-85">({c.cardType})</span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function ActivityLogContextRows({ context, dense }: { context: ActivityLogContextLine[]; dense?: boolean }) {
  return (
    <dl className={`grid gap-1.5 ${dense ? "" : "sm:grid-cols-2"}`}>
      {context.map((row, i) => (
        <div
          key={`${row.label}-${i}`}
          className={`rounded-lg border border-slate-700/55 bg-slate-950/40 ${dense ? "px-2 py-1.5" : "px-3 py-2"}`}
        >
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{row.label}</dt>
          <dd className={`mt-0.5 break-words text-slate-200 ${dense ? "text-xs" : "text-sm"}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function logEntryMatchesFilter(entry: ActivityLogEntry, q: string): boolean {
  if (
    entry.title.toLowerCase().includes(q) ||
    (entry.details?.toLowerCase().includes(q) ?? false) ||
    (entry.before?.toLowerCase().includes(q) ?? false) ||
    (entry.after?.toLowerCase().includes(q) ?? false)
  ) {
    return true;
  }
  if (entry.cardsInvolved?.some((c) => c.name.toLowerCase().includes(q) || (c.cardType?.toLowerCase().includes(q) ?? false))) {
    return true;
  }
  if (entry.context?.some((c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q))) {
    return true;
  }
  return false;
}

/** Hide raw "Cards: …" line when structured chips are shown. */
function shouldShowDetailsText(entry: ActivityLogEntry): boolean {
  if (!entry.details?.trim()) return false;
  if (entry.cardsInvolved?.length && /^cards:\s/i.test(entry.details.trim())) return false;
  return true;
}

/** Single-line + optional meta; card names use type colors when present. */
function ActivityLogRowMinimal({ entry }: { entry: ActivityLogEntry }) {
  const colors = getActivityLogColors(entry.type);
  const icon = getActivityLogIcon(entry.type);
  const metaLine =
    entry.after ||
    entry.before ||
    entry.context?.map((c) => `${c.label}: ${c.value}`).join(" · ") ||
    (shouldShowDetailsText(entry) ? entry.details : undefined);

  return (
    <div
      className={`group flex gap-2 border-b border-slate-800/50 border-l-2 py-2 pl-2 pr-2 transition-colors last:border-b-0 hover:bg-slate-900/35 ${colors.border}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <span className="shrink-0 text-sm leading-none opacity-90" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={`min-w-0 truncate text-[13px] font-semibold leading-tight ${colors.text}`}>{entry.title}</p>
            <time className="shrink-0 text-[10px] tabular-nums text-slate-500">{entry.timestamp}</time>
          </div>
          {entry.cardsInvolved && entry.cardsInvolved.length > 0 ? (
            <p className="mt-0.5 min-w-0 truncate text-[11px] leading-tight">
              {entry.cardsInvolved.map((c, i) => {
                const { text } = cardTypeClasses(c.cardType);
                return (
                  <span key={`${c.name}-${i}`} className={`font-medium ${text}`}>
                    {i > 0 ? <span className="font-normal text-slate-600">, </span> : null}
                    <span className="inline max-w-[12rem] truncate align-bottom">{c.name}</span>
                  </span>
                );
              })}
            </p>
          ) : metaLine ? (
            <p className="mt-0.5 truncate text-[11px] text-slate-500" title={metaLine}>
              {metaLine}
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-600">
              {(entry.type ?? "info").replace(/-/g, " ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityLogRowDetailed({ entry }: { entry: ActivityLogEntry }) {
  const colors = getActivityLogColors(entry.type);
  const icon = getActivityLogIcon(entry.type);
  const hasDelta = Boolean(entry.before || entry.after);
  const showDetails = shouldShowDetailsText(entry);
  const hasBody = Boolean(
    hasDelta || showDetails || (entry.context && entry.context.length > 0) || (entry.cardsInvolved && entry.cardsInvolved.length > 0)
  );

  return (
    <div className="group relative flex gap-3 py-2 pl-1 pr-2">
      <div className="relative flex w-5 shrink-0 flex-col items-center pt-1">
        <span
          className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm shadow-sm transition-transform duration-200 group-hover:scale-105 ${colors.border} ${colors.bg}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <div
        className={`min-w-0 flex-1 rounded-xl border px-3 py-2 transition-shadow duration-200 group-hover:shadow-md ${colors.border} ${colors.bg}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <p className={`min-w-0 text-sm font-semibold leading-snug ${colors.text}`}>{entry.title}</p>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors.badge} ${colors.text}`}>
              {(entry.type ?? "info").replace(/-/g, " ")}
            </span>
            <time className="text-[11px] tabular-nums text-slate-500">{entry.timestamp}</time>
          </div>
        </div>

        {entry.cardsInvolved && entry.cardsInvolved.length > 0 ? (
          <div className="mt-2 border-t border-slate-700/30 pt-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cards</p>
            <ActivityLogCardChips cards={entry.cardsInvolved} />
          </div>
        ) : null}

        {entry.context && entry.context.length > 0 ? (
          <div className="mt-2 border-t border-slate-700/30 pt-2">
            <ActivityLogContextRows context={entry.context} dense />
          </div>
        ) : null}

        {hasBody && (hasDelta || showDetails) ? (
          <div className="mt-2 space-y-1.5 border-t border-slate-700/40 pt-2 text-[11px]">
            {hasDelta ? (
              <div className="flex flex-wrap items-stretch gap-2">
                {entry.before != null && entry.before !== "" && (
                  <div className="min-w-0 flex-1 rounded-lg border border-slate-700/60 bg-slate-950/40 px-2 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Before</span>
                    <p className="mt-0.5 font-mono text-xs text-slate-300 break-words">{entry.before}</p>
                  </div>
                )}
                {entry.before && entry.after ? (
                  <span className="hidden shrink-0 self-center text-slate-600 sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
                {entry.after != null && entry.after !== "" && (
                  <div className="min-w-0 flex-1 rounded-lg border border-slate-700/60 bg-slate-950/40 px-2 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">After</span>
                    <p className={`mt-0.5 font-mono text-xs font-semibold break-words ${colors.text}`}>{entry.after}</p>
                  </div>
                )}
              </div>
            ) : null}
            {showDetails ? (
              <p className="text-slate-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none">{entry.details}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActivityLogRowInline({
  entry,
  density,
}: {
  entry: ActivityLogEntry;
  density: ActivityLogInlineDensity;
}) {
  if (density === "minimal") return <ActivityLogRowMinimal entry={entry} />;
  return <ActivityLogRowDetailed entry={entry} />;
}

function ActivityLogRowExpanded({ entry }: { entry: ActivityLogEntry }) {
  const colors = getActivityLogColors(entry.type);
  const icon = getActivityLogIcon(entry.type);
  const showDetails = shouldShowDetailsText(entry);

  return (
    <article className={`rounded-2xl border-2 p-5 md:p-6 ${colors.border} ${colors.bg}`}>
      <div className="flex flex-wrap items-start gap-3 border-b border-slate-700/50 pb-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-600/50 bg-slate-950/50 text-2xl shadow-inner">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg font-bold leading-snug md:text-xl ${colors.text}`}>{entry.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide ${colors.badge} ${colors.text}`}>
              {(entry.type ?? "info").replace(/-/g, " ")}
            </span>
            {entry.target ? (
              <span className="rounded-lg border border-slate-600 bg-slate-900/80 px-2 py-1 text-xs text-slate-300">
                {entry.target}
              </span>
            ) : null}
            <time className="text-sm tabular-nums text-slate-400">{entry.timestamp}</time>
          </div>
        </div>
      </div>

      {entry.cardsInvolved && entry.cardsInvolved.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Cards</p>
          <ActivityLogCardChips cards={entry.cardsInvolved} size="md" />
        </div>
      ) : null}

      {entry.context && entry.context.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Context</p>
          <ActivityLogContextRows context={entry.context} />
        </div>
      ) : null}

      {(entry.before || entry.after) && (
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-stretch">
          {entry.before != null && entry.before !== "" && (
            <div className="min-w-0 flex-1 rounded-xl border border-slate-700/70 bg-slate-950/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Before</p>
              <p className="mt-2 font-mono text-base leading-relaxed text-slate-200 whitespace-pre-wrap break-words">
                {entry.before}
              </p>
            </div>
          )}
          {entry.before && entry.after ? (
            <div className="flex shrink-0 items-center justify-center md:px-1" aria-hidden>
              <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-400">→</span>
            </div>
          ) : null}
          {entry.after != null && entry.after !== "" && (
            <div className="min-w-0 flex-1 rounded-xl border border-slate-700/70 bg-slate-950/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">After</p>
              <p className={`mt-2 font-mono text-base font-semibold leading-relaxed whitespace-pre-wrap break-words ${colors.text}`}>
                {entry.after}
              </p>
            </div>
          )}
        </div>
      )}

      {showDetails ? (
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</p>
          <p className="mt-2 text-base leading-relaxed text-slate-200 whitespace-pre-wrap break-words">{entry.details}</p>
        </div>
      ) : null}
    </article>
  );
}

const SHELL = "rounded-2xl border border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-xl shadow-slate-950/25";

export default function MainFieldBlock() {
  const {
    gameState,
    turns,
    currentTurnIndex,
    saveCurrentTurn,
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
  const [playedCardSize, setPlayedCardSize] = useState<CardPileViewSize>("small");
  const [enemyTargetLayout, setEnemyTargetLayout] = useState<TargetEnemyLayout>("tiles");

  const enemies = useMemo(() => gameState?.enemies ?? [], [gameState?.enemies]);

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

      {/* Hand + played */}
      <div className="grid gap-4 xl:grid-cols-2">
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
            <CardSizeCycleButton size={handCardSize} onChange={setHandCardSize} />
          </div>
          <div className="flex flex-wrap gap-4">
            {(gameState?.hand ?? []).map((card, index) => (
              <STSCard
                key={`hand-${index}-${card.name}`}
                size={handCardSize}
                card={card}
                index={index}
                location={LOCATION.HAND}
              />
            ))}
          </div>
        </section>

        <section className={`${SHELL}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-950/35 text-violet-400">
                <Layers className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-slate-100">Played</h2>
                <p className="text-[11px] text-slate-500">{(gameState?.playedCards ?? []).length} cards</p>
              </div>
            </div>
            <CardSizeCycleButton size={playedCardSize} onChange={setPlayedCardSize} />
          </div>
          <div className="flex flex-wrap gap-4">
            {(gameState?.playedCards ?? []).map((card, index) => (
              <STSCard
                key={`played-${index}-${card.name}`}
                size={playedCardSize}
                card={card}
                index={index}
                location={LOCATION.PLAYED}
              />
            ))}
          </div>
        </section>
      </div>

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
              disabled={!anyTurnHasLogEntries}
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
                            className="min-w-[7.5rem] select-none text-center text-sm font-semibold tabular-nums text-slate-100"
                            title={modalTurnMeta ? `Turn id ${modalTurnMeta.id}` : undefined}
                          >
                            Turn {modalTurnMeta?.id ?? "—"}
                            {turns.length > 1 ? ` · ${safeModalLogTurnIndex + 1}/${turns.length}` : null}
                            {!isViewingCurrentTurnInModal && turns.length > 1 ? (
                              <span className="ms-1 text-[10px] font-medium uppercase text-amber-400/90">(not current)</span>
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
