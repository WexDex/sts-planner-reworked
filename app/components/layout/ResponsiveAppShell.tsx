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
          <header className="z-40 shrink-0 border-b border-slate-800/80 bg-slate-950/80 shadow-md shadow-black/30 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/70 max-md:shadow-md max-md:shadow-cyan-950/20 max-md:backdrop-blur-md">
            <TopBarBlock />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-3 sm:px-3 md:px-4 md:py-4 [scrollbar-gutter:stable]">
            <MainFieldBlock />
          </div>

          <div className="flex min-h-0 shrink-0 flex-col" data-bottom-deck-skip-outside>
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
          className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] flex-col md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={sheetTitleId}
        >
          <div
            className={`animate-sts-mobile-sheet flex min-h-0 w-full flex-1 flex-col border-x border-t-2 bg-slate-900 shadow-[0_0_0_1px_rgba(0,0,0,0.3)] ${
              showTimelineSheet
                ? "border-cyan-500/50 shadow-[0_0_48px_-8px_rgba(34,211,238,0.25),inset_0_1px_0_0_rgba(34,211,238,0.2)]"
                : "border-amber-500/50 shadow-[0_0_48px_-8px_rgba(245,158,11,0.2),inset_0_1px_0_0_rgba(245,158,11,0.2)]"
            }`}
            style={{
              paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div
              className={`shrink-0 border-b px-3 pb-2.5 pt-1 ${
                showTimelineSheet ? "border-cyan-600/40 bg-cyan-950/50" : "border-amber-600/40 bg-amber-950/40"
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
                  ) : (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-amber-400/50 bg-amber-950/70 text-amber-300 shadow-lg shadow-amber-950/40">
                      <Swords className="h-5 w-5" strokeWidth={2} />
                    </span>
                  )}
                  <h2 id={sheetTitleId} className="min-w-0 truncate text-base font-semibold text-slate-50">
                    {showTimelineSheet ? "Turn timeline" : "Combat tools"}
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
              {showTimelineSheet ? <TimelineBlock /> : <RightBlock />}
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
          <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-1 pt-1">
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openTimeline}
                className={`flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors ${
                  panel === "timeline"
                    ? "bg-cyan-500/25 text-cyan-100 ring-1 ring-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                    : "text-cyan-100/60 active:bg-cyan-950/40"
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
                className="flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold text-cyan-100/60 transition-colors active:bg-cyan-950/40"
              >
                <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="truncate">Board</span>
              </button>
            </li>
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={goDeck}
                className="flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold text-cyan-100/60 transition-colors active:bg-cyan-950/40"
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
                  panel === "tools"
                    ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "text-amber-100/60 active:bg-amber-950/40"
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
