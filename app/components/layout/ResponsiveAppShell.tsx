"use client";

import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";
import { GitBranch, Hand, LayoutDashboard, Swords, X } from "lucide-react";
import TopBarBlock from "@/app/components/UI/TopBarBlock";
import TimelineBlock from "@/app/components/UI/TimelineBlock";
import MainFieldBlock from "@/app/components/UI/MainFieldBlock";
import BottomBlock from "@/app/components/UI/BottomBlock";
import ActionsBar from "@/app/components/UI/ActionsBar";
import RightBlock from "@/app/components/UI/RightBlock";
import { ToastStack } from "@/app/components/UI/NotificationProvider";

const MD_UP = "(min-width: 768px)";

type MobilePanel = "none" | "timeline" | "tools";

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

const RAIL_INNER = "min-h-0 w-full min-w-0 max-w-md flex-1";
const RAIL_L =
  "sticky top-0 z-20 h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-hidden border-r-2 border-cyan-500/55 bg-linear-to-b from-gray-900 to-gray-950";
const RAIL_R =
  "sticky top-0 z-20 h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-hidden border-l-2 border-amber-600/70 bg-linear-to-b from-gray-900 to-gray-950";

function scrollToAnchor(id: string) {
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default function ResponsiveAppShell() {
  const isMdUp = useSyncExternalStore(subscribeMdUp, getMdUpSnapshot, () => false);
  const [panel, setPanel] = useState<MobilePanel>("none");
  const sheetTitleId = useId();

  /** When desktop layout is active, sheets must not use `panel` (stale) state. */
  const mobileSheet: MobilePanel = isMdUp ? "none" : panel;

  const closePanel = useCallback(() => setPanel("none"), []);

  const openTimeline = useCallback(() => {
    setPanel((p) => (p === "timeline" ? "none" : "timeline"));
  }, []);

  const openTools = useCallback(() => {
    setPanel((p) => (p === "tools" ? "none" : "tools"));
  }, []);

  const goBoard = useCallback(() => {
    setPanel("none");
    scrollToAnchor("sts-battle-focus");
  }, []);

  const goDeck = useCallback(() => {
    setPanel("none");
    scrollToAnchor("sts-deck-zone");
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

  return (
    <>
      <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-950 text-gray-100 md:flex-row">
        {showLeftRail ? (
          <aside
            className={`${RAIL_L} flex w-[min(15rem,34vw)] shrink-0 sm:w-[min(16rem,32vw)] md:w-[min(17rem,30vw)] lg:w-[min(18rem,28vw)] xl:w-[min(19rem,26vw)] 2xl:w-80 2xl:max-w-[20rem]`}
            aria-label="Turn timeline"
          >
            <div className={`${RAIL_INNER} overflow-hidden`}>
              <TimelineBlock />
            </div>
          </aside>
        ) : null}

        <div
          className={
            showMobileBar
              ? "flex min-h-0 min-w-0 flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:ring-1 md:ring-cyan-500/[0.07] md:ring-inset"
              : "flex min-h-0 min-w-0 flex-1 flex-col md:ring-1 md:ring-cyan-500/[0.07] md:ring-inset"
          }
        >
          <header className="z-40 shrink-0 border-b border-slate-800/80 bg-slate-950/80 shadow-md shadow-black/30 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/70">
            <TopBarBlock />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-3 sm:px-3 md:px-4 md:py-4 [scrollbar-gutter:stable]">
            <MainFieldBlock />
          </div>

          <div className="flex shrink-0 flex-col" data-bottom-deck-skip-outside>
            <ActionsBar />
            <div className="relative z-30 shrink-0">
              <ToastStack />
              <BottomBlock />
            </div>
          </div>
        </div>

        {showRightRail ? (
          <aside
            className={`${RAIL_R} flex w-[min(16rem,36vw)] shrink-0 sm:w-[min(17rem,34vw)] md:w-[min(18.5rem,32vw)] lg:w-[min(20rem,30vw)] xl:min-w-[20rem] 2xl:w-[22rem] 2xl:max-w-[24rem]`}
            aria-label="Combat tools"
          >
            <div className={`${RAIL_INNER} overflow-y-auto overflow-x-hidden`}>
              <RightBlock />
            </div>
          </aside>
        ) : null}
      </div>

      {showTimelineSheet || showToolsSheet ? (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={sheetTitleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] transition-opacity"
            aria-label="Close panel"
            onClick={closePanel}
          />
          <div
            className="animate-sts-mobile-sheet relative flex max-h-[min(88dvh,32rem)] flex-col rounded-t-2xl border border-slate-700/80 border-b-0 bg-slate-900 shadow-[0_-8px_40px_rgba(0,0,0,0.5)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="shrink-0 border-b border-slate-800/90 px-3 pb-2.5 pt-2">
              <div className="mb-2 flex justify-center" aria-hidden>
                <span className="h-1 w-10 rounded-full bg-slate-600/80" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {showTimelineSheet ? (
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-400">
                      <GitBranch className="h-4 w-4" strokeWidth={2} />
                    </span>
                  ) : (
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/50 text-amber-400">
                      <Swords className="h-4 w-4" strokeWidth={2} />
                    </span>
                  )}
                  <h2 id={sheetTitleId} className="min-w-0 truncate text-sm font-semibold text-slate-100">
                    {showTimelineSheet ? "Turn timeline" : "Combat tools"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-600 bg-slate-800/80 text-slate-300 active:scale-95"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
              {showTimelineSheet ? <TimelineBlock /> : <RightBlock />}
            </div>
          </div>
        </div>
      ) : null}

      {showMobileBar ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] backdrop-blur-lg"
          style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
          aria-label="Quick navigation"
        >
          <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-1 pt-1">
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openTimeline}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors ${
                  panel === "timeline" ? "bg-cyan-950/50 text-cyan-200" : "text-slate-400 active:bg-slate-800/80"
                }`}
              >
                <GitBranch className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="truncate">Turns</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={goBoard}
                className="flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold text-slate-400 transition-colors active:bg-slate-800/80"
              >
                <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="truncate">Board</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={goDeck}
                className="flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold text-slate-400 transition-colors active:bg-slate-800/80"
              >
                <Hand className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="truncate">Deck</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openTools}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors ${
                  panel === "tools" ? "bg-amber-950/50 text-amber-200" : "text-slate-400 active:bg-slate-800/80"
                }`}
              >
                <Swords className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="truncate">Tools</span>
              </button>
            </li>
          </ul>
        </nav>
      ) : null}
    </>
  );
}
