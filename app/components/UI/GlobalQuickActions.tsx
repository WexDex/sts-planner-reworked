"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGameManager } from "@/app/context/GameContext";
import { Card } from "@/app/types/gameTypes";
import PileOrderModal from "@/app/components/UI/PileOrderModal";
import ScryModal from "@/app/components/UI/ScryModal";
import { ChevronDown, ChevronUp, Zap, Hand, Shuffle, Trash2, Filter } from "lucide-react";

// ── Discard-exceptions chip picker ────────────────────────────────────────────
function HandExceptionsModal({
  hand,
  onConfirm,
  onClose,
}: {
  hand: Card[];
  onConfirm: (keepUids: string[]) => void;
  onClose: () => void;
}) {
  const [kept, setKept] = useState<Set<string>>(new Set());

  const toggle = (uid: string) =>
    setKept(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="px-4 py-3 border-b border-zinc-700">
          <p className="text-sm font-semibold text-zinc-100">Choose cards to KEEP</p>
          <p className="text-xs text-zinc-500 mt-0.5">All others will be discarded</p>
        </div>
        <div className="px-3 py-2 flex flex-wrap gap-2 max-h-60 overflow-y-auto">
          {hand.map((card, i) => {
            const uid = card._uid ?? `${card.name}-${i}`;
            const isKept = kept.has(uid);
            return (
              <button
                key={uid}
                onClick={() => toggle(uid)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isKept
                    ? "bg-emerald-900/80 border-emerald-400/70 text-emerald-100"
                    : "bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {card.name}{card.isUpgraded ? "+" : ""}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-700">
          <span className="text-xs text-zinc-500">Keeping {kept.size} · Discarding {hand.length - kept.size}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
            <button
              onClick={() => onConfirm([...kept])}
              className="px-4 py-1.5 text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white rounded-lg transition-colors"
            >
              Discard {hand.length - kept.size}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GlobalQuickActions() {
  const {
    gameState,
    updateGameState,
    discardWholeHand,
    discardHandWithExceptions,
    shuffleDiscardIntoDraw,
    confirmReshuffle,
  } = useGameManager();

  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [scryCount, setScryCount] = useState(3);

  const [scryOpen, setScryOpen] = useState(false);
  const [shuffleOpen, setShuffleOpen] = useState(false);
  const [exceptionsOpen, setExceptionsOpen] = useState(false);
  const [reshuffleOpen, setReshuffleOpen] = useState(false);

  const hand = gameState?.hand ?? [];
  const discard = gameState?.discard ?? [];
  const pendingReshuffle = gameState?.pendingReshuffle ?? null;

  React.useEffect(() => {
    if (pendingReshuffle && !reshuffleOpen) setReshuffleOpen(true);
  }, [pendingReshuffle, reshuffleOpen]);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (buttonRef.current) setPanelTop(buttonRef.current.getBoundingClientRect().bottom);
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen(v => {
      if (!v && buttonRef.current) setPanelTop(buttonRef.current.getBoundingClientRect().bottom);
      return !v;
    });
  }, []);

  // Scry: keep reordered non-discarded cards on top, send marked ones to discard pile
  const handleScryConfirm = useCallback((keep: Card[], discarded: Card[]) => {
    if (!gameState) return;
    const actual = Math.min(scryCount, (gameState.draw ?? []).length);
    const rest = (gameState.draw ?? []).slice(actual);
    updateGameState({
      draw: [...keep, ...rest],
      discard: [...(gameState.discard ?? []), ...discarded],
    });
    setScryOpen(false);
  }, [gameState, scryCount, updateGameState]);

  const handleShuffleConfirm = useCallback((ordered: Card[]) => {
    shuffleDiscardIntoDraw(ordered);
    setShuffleOpen(false);
  }, [shuffleDiscardIntoDraw]);

  const handleReshuffleConfirm = useCallback((ordered: Card[]) => {
    confirmReshuffle(ordered);
    setReshuffleOpen(false);
  }, [confirmReshuffle]);

  if (!gameState) return null;

  return (
    <>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-bold shadow-md ring-1 transition sm:min-w-36 ${
          open
            ? "border-indigo-400/70 bg-indigo-900/60 text-indigo-50 ring-indigo-500/25"
            : "border-indigo-500/45 bg-indigo-950/40 text-indigo-100 ring-indigo-500/15 hover:border-indigo-400/65 hover:bg-indigo-900/45"
        }`}
        aria-expanded={open}
        aria-label="Toggle quick actions panel"
      >
        <Zap className="h-4 w-4 shrink-0 text-indigo-300" strokeWidth={2.25} aria-hidden />
        Quick Actions
        {open
          ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-indigo-300" strokeWidth={2.25} aria-hidden />
          : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-indigo-300" strokeWidth={2.25} aria-hidden />}
      </button>

      {/* Panel — portalled to body as position:fixed to escape overflow-hidden ancestors */}
      {open && typeof window !== "undefined" && createPortal(
        <div
          style={{ top: panelTop }}
          className="fixed left-0 right-0 z-9999 border-t border-indigo-500/25 bg-slate-950/98 shadow-xl shadow-black/40 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-400 px-3 py-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              {/* ── Hand Actions ── */}
              <section className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-300/80">
                  <Hand className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                  Hand Actions
                  <span className="ml-auto text-amber-400/60 font-normal normal-case tracking-normal">
                    {hand.length} cards
                  </span>
                </p>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => discardWholeHand()}
                    disabled={hand.length === 0}
                    className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-900/55 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
                    Discard whole hand
                  </button>
                  <button
                    onClick={() => setExceptionsOpen(true)}
                    disabled={hand.length === 0}
                    className="flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-950/40 px-3 py-2 text-xs font-semibold text-orange-100 transition hover:bg-orange-900/55 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Filter className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
                    Discard with exceptions…
                  </button>
                </div>
              </section>

              {/* ── Draw Pile Actions ── */}
              <section className="rounded-xl border border-sky-500/25 bg-sky-950/15 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-300/80">
                  <Shuffle className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                  Draw Pile
                  <span className="ml-auto text-sky-400/60 font-normal normal-case tracking-normal">
                    discard: {discard.length}
                  </span>
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setScryOpen(true)}
                      disabled={(gameState.draw ?? []).length === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-950/50 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-900/55 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Scry
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={scryCount}
                      onChange={e => setScryCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                      className="w-12 rounded-lg border border-slate-600 bg-slate-900 px-1.5 py-2 text-center text-xs text-slate-100"
                      aria-label="Scry count"
                    />
                  </div>
                  <button
                    onClick={() => setShuffleOpen(true)}
                    disabled={discard.length === 0}
                    className="flex items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-950/50 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-900/60 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Shuffle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
                    Shuffle discard → draw…
                  </button>
                </div>
              </section>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modals — z-10000 so they appear above the z-9999 panel ── */}
      {scryOpen && typeof window !== "undefined" && createPortal(
        <ScryModal
          draw={gameState.draw ?? []}
          scryCount={scryCount}
          onConfirm={handleScryConfirm}
          onClose={() => setScryOpen(false)}
        />,
        document.body
      )}

      {shuffleOpen && typeof window !== "undefined" && createPortal(
        <PileOrderModal
          title={`Shuffle discard (${discard.length}) into draw pile`}
          cards={[...discard].sort(() => Math.random() - 0.5)}
          confirmLabel="Shuffle into Draw"
          onConfirm={handleShuffleConfirm}
          onClose={() => setShuffleOpen(false)}
        />,
        document.body
      )}

      {reshuffleOpen && pendingReshuffle && typeof window !== "undefined" && createPortal(
        <PileOrderModal
          title={`Deck exhausted — order discard (${discard.length} cards) to reshuffle`}
          cards={[...discard].sort(() => Math.random() - 0.5)}
          confirmLabel={`Reshuffle & draw ${pendingReshuffle.remaining} more`}
          onConfirm={handleReshuffleConfirm}
          onClose={() => setReshuffleOpen(false)}
        />,
        document.body
      )}

      {exceptionsOpen && typeof window !== "undefined" && createPortal(
        <HandExceptionsModal
          hand={hand}
          onConfirm={uids => { discardHandWithExceptions(uids); setExceptionsOpen(false); }}
          onClose={() => setExceptionsOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
