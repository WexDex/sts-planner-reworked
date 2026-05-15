"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGameManager } from "@/app/context/GameContext";
import STSCard from "./Card";
import PotionBelt from "@/app/components/UI/PotionBelt";
import OrbChannelPanel, { ORB_CFG } from "@/app/components/UI/OrbChannelPanel";
import { getOrbDefaults } from "@/app/utils/orbDefaults";
import { LOCATION } from "@/app/types/types";
import PileOrderModal from "@/app/components/UI/PileOrderModal";
import {
  ArrowUpDown,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Columns2,
  Flame,
  Layers,
  LayoutGrid,
  Library,
  Shuffle,
  SquareStack,
  Trash2,
  TableProperties,
} from "lucide-react";

type PileType = "draw" | "discard" | "exhaust" | "playedCards";

const PILES: {
  id: PileType;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  idle: string;
  active: string;
}[] = [
  {
    id: "draw",
    label: "Draw",
    Icon: Library,
    idle: "border-slate-600/80 bg-slate-800/60 text-slate-200 hover:border-blue-400/50 hover:bg-blue-950/40",
    active: "border-blue-400/90 bg-blue-950/55 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-2 ring-blue-400/40",
  },
  {
    id: "discard",
    label: "Discard",
    Icon: Trash2,
    idle: "border-slate-600/80 bg-slate-800/60 text-slate-200 hover:border-rose-400/50 hover:bg-rose-950/35",
    active: "border-rose-400/90 bg-rose-950/45 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)] ring-2 ring-rose-400/35",
  },
  {
    id: "exhaust",
    label: "Exhaust",
    Icon: Flame,
    idle: "border-slate-600/80 bg-slate-800/60 text-slate-200 hover:border-amber-400/45 hover:bg-amber-950/30",
    active: "border-amber-400/85 bg-amber-950/40 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.18)] ring-2 ring-amber-400/35",
  },
  {
    id: "playedCards",
    label: "Played",
    Icon: Layers,
    idle: "border-slate-600/80 bg-slate-800/60 text-slate-200 hover:border-violet-400/50 hover:bg-violet-950/35",
    active: "border-violet-400/90 bg-violet-950/45 text-violet-100 shadow-[0_0_20px_rgba(167,139,250,0.22)] ring-2 ring-violet-400/35",
  },
];

export default function BottomBlock() {
  const { gameState, drawCards, toggleCardSelection, selectAllInPile, shufflePile, reorderPile } = useGameManager();
  const [expandedPile, setExpandedPile] = useState<PileType | null>(null);
  const [reorderingPile, setReorderingPile] = useState<PileType | null>(null);
  const [drawAmount, setDrawAmount] = useState(5);
  const [show_size, setShowSize] = useState<"small" | "medium" | "large">("small");
  const [expandLayout, setExpandLayout] = useState<"wrap" | "grid">("wrap");
  const [orbPotionOpen, setOrbPotionOpen] = useState(false);
  const orbPotionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orbPotionOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (orbPotionRef.current?.contains(t)) return;
      if (t instanceof Element && t.closest?.('[role="dialog"]')) return;
      setOrbPotionOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [orbPotionOpen]);

  const toggleExpand = (pile: PileType) => {
    setExpandedPile((prev) => (prev === pile ? null : pile));
  };

  const handleDraw = () => {
    drawCards(drawAmount);
  };

  const handleDrawOne = () => {
    drawCards(1);
  };

  const DRAW_MIN = 1;
  const DRAW_MAX = 9;
  const clampDrawAmount = (n: number) => Math.min(Math.max(n, DRAW_MIN), DRAW_MAX);

  const getPileCards = (pile: PileType) => {
    return gameState?.[pile] || [];
  };

  const getPileCount = (pile: PileType) => {
    return getPileCards(pile).length;
  };

  const getSelectedCount = (pile: PileType) => {
    return getPileCards(pile).filter((c) => (c as any).isSelected).length;
  };

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (expandedPile == null) return;

    const isInBounds = (t: EventTarget | null) => {
      if (!(t instanceof Node)) return false;
      if (ref.current?.contains(t)) return true;
      if (t instanceof Element) {
        if (t.closest?.("[data-bottom-deck-skip-outside]")) return true;
        if (t.closest?.("aside")) return true;
        if (t.closest?.("header")) return true;
        if (t.closest?.('[role="dialog"]')) return true;
      }
      return false;
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isInBounds(event.target)) return;
      setExpandedPile(null);
    };

    // Bubble (default) so the pile / skip-zone controls handle the click first; then we close
    // if the user actually clicked “outside” (avoids the old mousedown race with the actions bar)
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [expandedPile]);

  const expandedLabel = PILES.find((p) => p.id === expandedPile)?.label ?? "Pile";

  return (
    <>
    <div
      id="sts-deck-zone"
      ref={ref}
      className="relative scroll-mt-2 border-t border-slate-700/90 bg-slate-900/95 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md max-md:border-t-2 max-md:border-emerald-500/30 max-md:bg-linear-to-b max-md:from-emerald-950/20 max-md:via-slate-900/95 max-md:to-slate-900/95 max-md:shadow-[0_-8px_32px_rgba(16,185,129,0.08)]"
    >
      {/* Expandable panel — height animates via grid template rows */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          expandedPile ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden border-b border-slate-800/80">
          <div className="max-h-[min(60vh,28rem)] overflow-y-auto px-4 pt-3 [scrollbar-width:thin]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="whitespace-nowrap text-sm font-semibold tracking-tight text-white">
                {expandedLabel}{" "}
                <span className="font-normal text-slate-500">
                  ({expandedPile ? getPileCount(expandedPile) : 0})
                </span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {/* Pile actions */}
                {expandedPile && getPileCount(expandedPile) > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => selectAllInPile(expandedPile)}
                      title={getPileCards(expandedPile).every(c => (c as any).isSelected) ? "Deselect all" : "Select all"}
                      className="flex items-center gap-1 rounded-lg border border-slate-600/70 bg-slate-800/80 px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      <CheckSquare className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      {getPileCards(expandedPile).every(c => (c as any).isSelected) ? "Desel. All" : "Sel. All"}
                    </button>
                    <button
                      type="button"
                      onClick={() => shufflePile(expandedPile)}
                      title="Shuffle pile randomly"
                      className="flex items-center gap-1 rounded-lg border border-slate-600/70 bg-slate-800/80 px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      <Shuffle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      Shuffle
                    </button>
                    <button
                      type="button"
                      onClick={() => setReorderingPile(expandedPile)}
                      title="Manually reorder cards"
                      className="flex items-center gap-1 rounded-lg border border-slate-600/70 bg-slate-800/80 px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      Reorder
                    </button>
                  </div>
                )}
                <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => setExpandLayout("wrap")}
                    title="Wrap layout"
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${expandLayout === "wrap" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    Wrap
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandLayout("grid")}
                    title="Dense grid layout"
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${expandLayout === "grid" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    <TableProperties className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    Grid
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setShowSize((s) => (s === "small" ? "medium" : s === "medium" ? "large" : "small"))
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                  title="Cycle card size: small → medium → large"
                >
                  <LayoutGrid
                    className={`h-4 w-4 ${show_size === "small" ? "text-cyan-300" : "text-slate-500"}`}
                    strokeWidth={2}
                  />
                  <Columns2
                    className={`h-4 w-4 ${show_size === "medium" ? "text-cyan-300" : "text-slate-500"}`}
                    strokeWidth={2}
                  />
                  <SquareStack
                    className={`h-4 w-4 ${show_size === "large" ? "text-cyan-300" : "text-slate-500"}`}
                    strokeWidth={2}
                  />
                  <span className="hidden sm:inline">Size</span>
                </button>
              </div>
            </div>
            <div
              className={`pb-3 ${
                expandLayout === "grid"
                  ? `grid gap-2`
                  : "flex flex-wrap gap-2"
              }`}
              style={
                expandLayout === "grid"
                  ? {
                      gridTemplateColumns: `repeat(auto-fill, minmax(${show_size === "small" ? "6.5rem" : show_size === "large" ? "10.75rem" : "8.5rem"}, 1fr))`,
                    }
                  : undefined
              }
            >
              {expandedPile &&
                getPileCards(expandedPile).map((card, index) => (
                  <STSCard
                    key={`${expandedPile}-${index}-${card.name}`}
                    card={card}
                    index={index}
                    location={
                      expandedPile === "playedCards"
                        ? LOCATION.PLAYED
                        : LOCATION[expandedPile.toUpperCase() as keyof typeof LOCATION]
                    }
                    size={show_size}
                    onToggleSelect={toggleCardSelection}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Control bar: mobile = 2 rows (2×2 piles + one draw row); md+ = original wrap layout */}
      <div className="flex flex-col gap-1.5 px-2 py-2 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3 md:px-3 md:py-2.5">
        <div className="grid w-full max-md:max-w-full max-md:grid-cols-2 max-md:gap-1.5 md:flex md:w-auto md:flex-wrap md:items-center md:gap-2">
          {PILES.map(({ id, label, Icon, idle, active }) => {
            const isOpen = expandedPile === id;
            const selCount = getSelectedCount(id);
            const hasSel = selCount > 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleExpand(id)}
                className={`flex min-h-10 items-center justify-between gap-1 rounded-xl border px-2 py-1.5 text-left text-xs font-medium transition-all duration-200 max-md:min-w-0 max-md:pr-1.5 md:gap-2 md:px-3 md:py-2 md:text-sm ${
                  isOpen ? active : hasSel ? "border-yellow-400/70 bg-yellow-950/45 text-yellow-100 shadow-[0_0_14px_rgba(234,179,8,0.22)] ring-1 ring-yellow-400/30" : idle
                }`}
              >
                <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-90 md:h-4 md:w-4" />
                  <span className="min-w-0 truncate max-md:max-w-[4.2rem] md:whitespace-nowrap">{label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {hasSel && (
                    <span className="rounded-md bg-yellow-400/20 px-1 py-0.5 text-[10px] font-bold tabular-nums text-yellow-300 ring-1 ring-yellow-400/30 md:px-1.5 md:text-xs">
                      {selCount}✓
                    </span>
                  )}
                  <span
                    className={`min-w-6 rounded-md px-1 py-0.5 text-center text-[10px] tabular-nums md:min-w-7 md:px-1.5 md:text-xs ${
                      isOpen ? "bg-black/25" : "bg-black/20"
                    }`}
                  >
                    {getPileCount(id)}
                  </span>
                  <ChevronUp
                    className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-200 md:h-4 md:w-4 ${
                      isOpen ? "rotate-0" : "-rotate-180"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Combined orbs + potions dropdown-up */}
        <div ref={orbPotionRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOrbPotionOpen(v => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-slate-600 hover:bg-slate-700/70"
            title="Potions & Orbs"
          >
            <span>🧪</span>
            <span className="tabular-nums text-slate-300">
              {(gameState?.potionBelt ?? []).filter(Boolean).length}/{gameState?.potionBeltSize ?? 2}
            </span>
            {(gameState?.orbs ?? []).length > 0 && (
              <span className="flex gap-0.5">
                {(gameState?.orbs ?? []).map((orb, i) => {
                  const cfg = ORB_CFG.find(o => o.type === orb);
                  const focus = (() => { try { return parseInt(localStorage.getItem("sts-orb-focus") ?? "0", 10) || 0; } catch { return 0; } })();
                  const d = getOrbDefaults()[orb];
                  const passive = d ? d.passiveDmg + (d.passiveFocus ? focus : 0) : "?";
                  const evoke = d ? d.evokeDmg + (d.evokeFocus ? focus : 0) : "?";
                  return (
                    <span key={i} aria-hidden className="flex flex-col items-center rounded border border-slate-100/20 px-0.5 leading-none">
                      <span>{cfg?.emoji ?? "?"}</span>
                      <span className="tabular-nums text-[8px] text-slate-300">{passive}</span>
                      <span className="tabular-nums text-[8px] text-slate-500">{evoke}</span>
                    </span>
                  );
                })}
              </span>
            )}
            <ChevronUp className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-150 ${orbPotionOpen ? "" : "rotate-180"}`} strokeWidth={2} />
          </button>

          {/* Keep always mounted so OrbChannelPanel local state (passive/evoke values) isn't lost on close */}
          <div
            className="absolute bottom-full left-0 z-50 mb-2 flex gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl"
            style={{ display: orbPotionOpen ? undefined : "none" }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Potions</p>
              <PotionBelt />
            </div>
            <div className="w-px bg-slate-700/60 self-stretch" />
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400/70 mb-1">Orb Channel</p>
              <OrbChannelPanel />
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 max-md:max-w-full max-md:flex-nowrap max-md:items-center max-md:justify-between max-md:gap-1.5 max-md:overflow-x-auto max-md:pb-0.5 md:w-auto md:flex-wrap md:items-center md:gap-2 md:overflow-visible">
          <span className="hidden text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:mr-0.5 md:inline">Draw</span>
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-slate-500 md:hidden">Dr</span>
          <div
            className="flex h-9 items-center justify-center gap-0.5 rounded-xl border border-slate-800 bg-slate-900/60 p-0.5 transition-colors focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20"
            role="group"
            aria-label="Cards to draw"
          >
            <button
              type="button"
              aria-label="Draw fewer cards"
              disabled={drawAmount <= DRAW_MIN}
              className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30"
              onClick={() => setDrawAmount((a) => clampDrawAmount(a - 1))}
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2} />
            </button>
            <span className="min-w-8 text-center text-sm font-mono font-bold tabular-nums text-emerald-200">
              {drawAmount}
            </span>
            <input
              id="draw-amount"
              type="number"
              value={drawAmount}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setDrawAmount(Number.isNaN(value) ? DRAW_MIN : clampDrawAmount(value));
              }}
              className="sr-only"
              min={DRAW_MIN}
              max={DRAW_MAX}
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Cards to draw (or use the arrows). Current value is shown in the group."
            />
            <button
              type="button"
              aria-label="Draw more cards"
              disabled={drawAmount >= DRAW_MAX}
              className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30"
              onClick={() => setDrawAmount((a) => clampDrawAmount(a + 1))}
            >
              <ChevronUp className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleDraw}
            className="h-9 whitespace-nowrap rounded-lg border-2 border-emerald-500/60 bg-emerald-700/85 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-950/30 transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            Draw {drawAmount}
          </button>
          <button
            type="button"
            onClick={handleDrawOne}
            className="h-9 whitespace-nowrap rounded-lg border border-emerald-500/45 bg-emerald-950/50 px-3 text-sm font-semibold text-emerald-100 shadow-sm transition hover:bg-emerald-900/55 active:scale-[0.98]"
            title="Draw a single card"
          >
            Draw 1
          </button>
        </div>
      </div>
    </div>
    {reorderingPile && (
      <PileOrderModal
        title={`Reorder ${reorderingPile}`}
        cards={getPileCards(reorderingPile)}
        onConfirm={(ordered) => {
          reorderPile(reorderingPile!, ordered);
          setReorderingPile(null);
        }}
        onClose={() => setReorderingPile(null)}
      />
    )}
    </>
  );
}
