"use client";

import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, GitBranch, Hand, LayoutDashboard, Menu, Swords, X, Zap } from "lucide-react";
import TopBarBlock from "@/app/components/UI/TopBarBlock";
import TimelineBlock from "@/app/components/UI/TimelineBlock";
import MainFieldBlock from "@/app/components/UI/MainFieldBlock";
import BottomBlock from "@/app/components/UI/BottomBlock";
import ActionsBar from "@/app/components/UI/ActionsBar";
import RightBlock from "@/app/components/UI/RightBlock";
import MobileNavPanel from "@/app/components/UI/MobileNavPanel";
import { ToastStack } from "@/app/components/UI/NotificationProvider";
import { useGameManager } from "@/app/context/GameContext";

const MD_UP = "(min-width: 768px)";

type MobilePanel = "none" | "timeline" | "tools" | "deck" | "actions" | "menu";

function subscribeMdUp(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MD_UP);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMdUpSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MD_UP).matches;
}

const LS_RAIL_LEFT_COLLAPSED = "sts-shell-rail-left-collapsed";
const LS_RAIL_RIGHT_COLLAPSED = "sts-shell-rail-right-collapsed";

const RAIL_COLLAPSED_W = "w-11 min-w-11 max-w-11";
const RAIL_L =
  "sticky top-0 z-20 h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-hidden border-r-2 border-cyan-500/55 bg-linear-to-b from-gray-900 to-gray-950";
const RAIL_R =
  "sticky top-0 z-20 h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-hidden border-l-2 border-amber-600/70 bg-linear-to-b from-gray-900 to-gray-950";
/** Fills the rail below the header controls; `min-h-0` lets nested panels scroll. */
const RAIL_INNER = "flex min-h-0 w-full min-w-0 flex-1 flex-col";

function scrollToAnchor(id: string) {
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function SheetNoData({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="text-sm font-semibold text-slate-400">No data loaded</p>
      <p className="text-xs leading-relaxed text-slate-600">
        Load a project or combat data to use {label}.<br />
        Use the <span className="font-semibold text-slate-500">Load data</span> or{" "}
        <span className="font-semibold text-slate-500">Load proj</span> buttons in the top bar,
        or open the <span className="font-semibold text-slate-500">Menu</span> tab below.
      </p>
    </div>
  );
}

export default function ResponsiveAppShell() {
  const { gameState } = useGameManager();
  const isMdUp = useSyncExternalStore(subscribeMdUp, getMdUpSnapshot, () => false);

  const selectedCount = gameState
    ? gameState.draw.filter((c) => c.isSelected).length +
      gameState.discard.filter((c) => c.isSelected).length +
      gameState.exhaust.filter((c) => c.isSelected).length +
      gameState.hand.filter((c) => c.isSelected).length +
      gameState.playedCards.filter((c) => c.isSelected).length
    : 0;
  const leftRailShowsActions = isMdUp && selectedCount > 0;
  const [panel, setPanel] = useState<MobilePanel>("none");
  const sheetTitleId = useId();
  const [leftRailCollapsed, setLeftRailCollapsed] = useState(false);
  const [rightRailCollapsed, setRightRailCollapsed] = useState(false);

  useEffect(() => {
    if (!isMdUp) return;
    try {
      const l = localStorage.getItem(LS_RAIL_LEFT_COLLAPSED) === "1";
      const r = localStorage.getItem(LS_RAIL_RIGHT_COLLAPSED) === "1";
      queueMicrotask(() => {
        if (l) setLeftRailCollapsed(true);
        if (r) setRightRailCollapsed(true);
      });
    } catch {
      /* ignore */
    }
  }, [isMdUp]);

  useEffect(() => {
    if (!isMdUp) return;
    try {
      localStorage.setItem(LS_RAIL_LEFT_COLLAPSED, leftRailCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [isMdUp, leftRailCollapsed]);

  useEffect(() => {
    if (!isMdUp) return;
    try {
      localStorage.setItem(LS_RAIL_RIGHT_COLLAPSED, rightRailCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [isMdUp, rightRailCollapsed]);

  /** When desktop layout is active, sheets must not use `panel` (stale) state. */
  const mobileSheet: MobilePanel = isMdUp ? "none" : panel;

  const closePanel = useCallback(() => setPanel("none"), []);

  const openTimeline = useCallback(() => {
    setPanel((p) => (p === "timeline" ? "none" : "timeline"));
  }, []);

  const openTools = useCallback(() => {
    setPanel((p) => (p === "tools" ? "none" : "tools"));
  }, []);

  const openDeck = useCallback(() => {
    setPanel((p) => (p === "deck" ? "none" : "deck"));
  }, []);

  const openActions = useCallback(() => {
    setPanel((p) => (p === "actions" ? "none" : "actions"));
  }, []);

  const openMenu = useCallback(() => {
    setPanel((p) => (p === "menu" ? "none" : "menu"));
  }, []);

  const goBoard = useCallback(() => {
    setPanel("none");
    scrollToAnchor("sts-battle-focus");
  }, []);

  useEffect(() => {
    if (mobileSheet === "none") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSheet]);

  useEffect(() => {
    if (mobileSheet === "none") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSheet, closePanel]);

  const showLeftRail = isMdUp;
  const showRightRail = isMdUp;
  const showMobileBar = !isMdUp;
  const showTimelineSheet = mobileSheet === "timeline";
  const showToolsSheet = mobileSheet === "tools";
  const showDeckSheet = mobileSheet === "deck";
  const showActionsSheet = mobileSheet === "actions";
  const showMenuSheet = mobileSheet === "menu";
  const showAnySheet = showTimelineSheet || showToolsSheet || showDeckSheet || showActionsSheet || showMenuSheet;

  return (
    <>
      <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-950 text-gray-100 md:flex-row">
        {showLeftRail ? (
          <aside
            className={`${RAIL_L} relative flex shrink-0 flex-col overflow-hidden transition-[width,min-width,max-width] duration-300 ease-in-out motion-reduce:transition-none ${
              !leftRailShowsActions && leftRailCollapsed
                ? RAIL_COLLAPSED_W
                : "w-[min(15rem,34vw)] sm:w-[min(16rem,32vw)] md:w-[min(17rem,30vw)] lg:w-[min(18rem,28vw)] xl:w-[min(19rem,26vw)] 2xl:w-80 2xl:max-w-[20rem]"
            }`}
            aria-label={leftRailShowsActions ? "Card actions" : "Turn timeline"}
          >
            {/* Collapse button — hidden while showing card actions */}
            {!leftRailShowsActions && !leftRailCollapsed ? (
              <button
                type="button"
                onClick={() => setLeftRailCollapsed(true)}
                className="absolute right-1 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/45 bg-slate-950/95 text-cyan-200 shadow-md shadow-black/30 backdrop-blur-sm transition hover:border-cyan-400/60 hover:bg-slate-900"
                title="Collapse timeline"
                aria-label="Collapse timeline rail"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </button>
            ) : null}
            <div
              className={`${RAIL_INNER} relative min-h-0 flex-1 overflow-hidden transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
                !leftRailShowsActions && leftRailCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              {leftRailShowsActions ? <ActionsBar /> : <TimelineBlock />}
            </div>
            {/* Expand overlay — only shown when collapsed in timeline mode */}
            {!leftRailShowsActions ? (
              <button
                type="button"
                onClick={() => setLeftRailCollapsed(false)}
                title="Expand timeline"
                aria-label="Expand timeline rail"
                className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 border-r border-cyan-500/40 bg-linear-to-b from-slate-950 to-slate-900 text-cyan-200 transition-[opacity,background-color] duration-300 ease-in-out motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  leftRailCollapsed
                    ? "pointer-events-auto cursor-e-resize opacity-100 hover:bg-cyan-500/[0.08] active:bg-cyan-500/[0.14]"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <GitBranch className="h-5 w-5 shrink-0 drop-shadow-sm" strokeWidth={2.25} aria-hidden />
                <ChevronRight className="h-4 w-4 shrink-0 opacity-85 drop-shadow-sm" strokeWidth={2.5} aria-hidden />
              </button>
            ) : null}
          </aside>
        ) : null}

        <div
          className={
            showMobileBar
              ? "flex min-h-0 min-w-0 flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:ring-1 md:ring-cyan-500/[0.07] md:ring-inset"
              : "flex min-h-0 min-w-0 flex-1 flex-col md:ring-1 md:ring-cyan-500/[0.07] md:ring-inset"
          }
        >
          <header className="z-40 shrink-0 overflow-hidden border-b border-slate-800/80 bg-slate-950/80 shadow-md shadow-black/30 backdrop-blur-md transition-[box-shadow] duration-300 supports-[backdrop-filter]:bg-slate-950/70 max-md:shadow-md max-md:shadow-cyan-950/20 max-md:backdrop-blur-md">
            <TopBarBlock />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-3 sm:px-3 md:px-4 md:py-4 [scrollbar-gutter:stable]">
            <MainFieldBlock />
          </div>

          {/* On desktop: BottomBlock inline. ActionsBar lives in the left rail. On mobile: they live in sheets. */}
          <div className="hidden md:flex min-h-0 shrink-0 flex-col" data-bottom-deck-skip-outside>
            <div className="relative z-30 shrink-0">
              <BottomBlock />
            </div>
          </div>
          {/* ToastStack always visible regardless of layout */}
          <div className="relative z-30 shrink-0">
            <ToastStack />
          </div>
        </div>

        {showRightRail ? (
          <aside
            className={`${RAIL_R} relative flex shrink-0 flex-col overflow-hidden transition-[width,min-width,max-width] duration-300 ease-in-out motion-reduce:transition-none ${
              rightRailCollapsed
                ? RAIL_COLLAPSED_W
                : "w-[min(16rem,36vw)] sm:w-[min(17rem,34vw)] md:w-[min(18.5rem,32vw)] lg:w-[min(20rem,30vw)] xl:min-w-[20rem] 2xl:w-[22rem] 2xl:max-w-[24rem]"
            }`}
            aria-label="Combat tools"
          >
            {!rightRailCollapsed ? (
              <button
                type="button"
                onClick={() => setRightRailCollapsed(true)}
                className="absolute left-1 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/45 bg-slate-950/95 text-amber-200 shadow-md shadow-black/30 backdrop-blur-sm transition hover:border-amber-400/60 hover:bg-slate-900"
                title="Collapse combat tools"
                aria-label="Collapse combat tools rail"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </button>
            ) : null}
            <div
              className={`${RAIL_INNER} relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
                rightRailCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <RightBlock />
            </div>
            <button
              type="button"
              onClick={() => setRightRailCollapsed(false)}
              title="Expand combat tools"
              aria-label="Expand combat tools rail"
              className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 border-l border-amber-500/40 bg-linear-to-b from-slate-950 to-slate-900 text-amber-200 transition-[opacity,background-color] duration-300 ease-in-out motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                rightRailCollapsed
                  ? "pointer-events-auto cursor-w-resize opacity-100 hover:bg-amber-500/[0.08] active:bg-amber-500/[0.14]"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <Swords className="h-5 w-5 shrink-0 drop-shadow-sm" strokeWidth={2.25} aria-hidden />
              <ChevronLeft className="h-4 w-4 shrink-0 opacity-85 drop-shadow-sm" strokeWidth={2.5} aria-hidden />
            </button>
          </aside>
        ) : null}
      </div>

      {showAnySheet ? (
        <div
          className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] flex-col md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={sheetTitleId}
        >
          <div
            className={`animate-sts-mobile-sheet flex min-h-0 w-full flex-1 flex-col border-x border-t-2 bg-slate-900 shadow-[0_0_0_1px_rgba(0,0,0,0.3)] ${
              showTimelineSheet
                ? "border-cyan-500/50 shadow-[0_0_48px_-8px_rgba(34,211,238,0.25),inset_0_1px_0_0_rgba(34,211,238,0.2)]"
                : showToolsSheet
                  ? "border-amber-500/50 shadow-[0_0_48px_-8px_rgba(245,158,11,0.2),inset_0_1px_0_0_rgba(245,158,11,0.2)]"
                  : showDeckSheet
                    ? "border-violet-500/50 shadow-[0_0_48px_-8px_rgba(139,92,246,0.2),inset_0_1px_0_0_rgba(139,92,246,0.2)]"
                    : showMenuSheet
                      ? "border-slate-500/60 shadow-[0_0_48px_-8px_rgba(148,163,184,0.15),inset_0_1px_0_0_rgba(148,163,184,0.15)]"
                      : "border-emerald-500/50 shadow-[0_0_48px_-8px_rgba(16,185,129,0.2),inset_0_1px_0_0_rgba(16,185,129,0.2)]"
            }`}
            style={{
              paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div
              className={`relative z-30 shrink-0 border-b px-3 pb-2.5 pt-1 ${
                showTimelineSheet
                  ? "border-cyan-600/40 bg-cyan-950/50"
                  : showToolsSheet
                    ? "border-amber-600/40 bg-amber-950/40"
                    : showDeckSheet
                      ? "border-violet-600/40 bg-violet-950/40"
                      : showMenuSheet
                        ? "border-slate-600/50 bg-slate-900/70"
                        : "border-emerald-600/40 bg-emerald-950/40"
              }`}
            >
              <div className="mb-1.5 flex justify-center" aria-hidden>
                <span className="h-1 w-10 rounded-full bg-white/20" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {showTimelineSheet ? (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-cyan-400/50 bg-cyan-950/70 text-cyan-300 shadow-lg shadow-cyan-950/40">
                      <GitBranch className="h-5 w-5" strokeWidth={2} />
                    </span>
                  ) : showToolsSheet ? (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-amber-400/50 bg-amber-950/70 text-amber-300 shadow-lg shadow-amber-950/40">
                      <Swords className="h-5 w-5" strokeWidth={2} />
                    </span>
                  ) : showDeckSheet ? (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-violet-400/50 bg-violet-950/70 text-violet-300 shadow-lg shadow-violet-950/40">
                      <Hand className="h-5 w-5" strokeWidth={2} />
                    </span>
                  ) : showMenuSheet ? (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-slate-500/60 bg-slate-800/80 text-slate-200 shadow-lg shadow-black/30">
                      <Menu className="h-5 w-5" strokeWidth={2} />
                    </span>
                  ) : (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-emerald-400/50 bg-emerald-950/70 text-emerald-300 shadow-lg shadow-emerald-950/40">
                      <Zap className="h-5 w-5" strokeWidth={2} />
                    </span>
                  )}
                  <h2 id={sheetTitleId} className="min-w-0 truncate text-base font-semibold text-slate-50">
                    {showTimelineSheet
                      ? "Turn timeline"
                      : showToolsSheet
                        ? "Combat tools"
                        : showDeckSheet
                          ? "Deck & Piles"
                          : showMenuSheet
                            ? "Navigation & Project"
                            : "Card Actions"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-500/60 bg-slate-800 text-slate-100 shadow-md active:scale-95"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-950/90 [scrollbar-width:thin]">
              {showTimelineSheet ? (
                <TimelineBlock />
              ) : showToolsSheet ? (
                gameState ? <RightBlock /> : <SheetNoData label="Combat Tools" />
              ) : showDeckSheet ? (
                gameState ? <BottomBlock /> : <SheetNoData label="Deck & Piles" />
              ) : showMenuSheet ? (
                <MobileNavPanel />
              ) : (
                gameState ? <ActionsBar /> : <SheetNoData label="Card Actions" />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showMobileBar ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-cyan-500/35 bg-gradient-to-t from-slate-950 via-slate-900 to-cyan-950/40 shadow-[0_-6px_28px_rgba(34,211,238,0.12)] backdrop-blur-md md:shadow-none"
          style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
          aria-label="Quick navigation"
        >
          <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-0.5 pt-1">
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openTimeline}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-semibold transition-colors ${
                  panel === "timeline"
                    ? "bg-cyan-500/25 text-cyan-100 ring-1 ring-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                    : "text-cyan-100/60 active:bg-cyan-950/40"
                }`}
              >
                <GitBranch className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="truncate">Timeline</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={goBoard}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-semibold transition-colors ${
                  panel === "none"
                    ? "bg-slate-500/20 text-slate-100 ring-1 ring-slate-400/40"
                    : "text-slate-100/50 active:bg-slate-800/40"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="truncate">Board</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openActions}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-semibold transition-colors ${
                  panel === "actions"
                    ? "bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "text-emerald-100/60 active:bg-emerald-950/40"
                }`}
              >
                <Zap className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="truncate">Actions</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openDeck}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-semibold transition-colors ${
                  panel === "deck"
                    ? "bg-violet-500/25 text-violet-100 ring-1 ring-violet-400/50 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                    : "text-violet-100/60 active:bg-violet-950/40"
                }`}
              >
                <Hand className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="truncate">Deck</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openTools}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-semibold transition-colors ${
                  panel === "tools"
                    ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "text-amber-100/60 active:bg-amber-950/40"
                }`}
              >
                <Swords className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="truncate">Tools</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openMenu}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-semibold transition-colors ${
                  panel === "menu"
                    ? "bg-slate-500/25 text-slate-100 ring-1 ring-slate-400/45"
                    : "text-slate-300 active:bg-slate-800/40"
                }`}
              >
                <Menu className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="truncate">Menu</span>
              </button>
            </li>
          </ul>
        </nav>
      ) : null}
    </>
  );
}
