"use client";

import { useGameManager } from "@/app/context/GameContext";
import STSCard from "./Card";
import { LOCATION } from "@/app/types/types";

export default function MainFieldBlock() {
  const { gameState } = useGameManager();

  return (
    <div className="space-y-6">
      {/* Target to Select */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold mb-4">Target to Select</h2>
        {/* Placeholder for enemy selection */}
        <p className="text-slate-400">Select target here</p>
      </div>

      {/* Player Hand */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold mb-4">Player Hand</h2>
        <div className="flex flex-wrap gap-5">
          {gameState?.hand.map((card, index) => (
            <STSCard
              key={`hand-${index}-${card.name}`}
              card={card}
              index={index}
              location={LOCATION.HAND}
            />
          ))}
        </div>
      </div>

      {/* Played Cards */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold mb-4">Played Cards</h2>
        <div className="flex flex-wrap gap-5">
          {gameState?.playedCards.map((card, index) => (
            <STSCard
              key={`played-${index}-${card.name}`}
              card={card}
              index={index}
              location={LOCATION.PLAYED}
            />
          ))}
        </div>
      </div>

      {/* Turn Activity Log */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold mb-4">Turn Activity Log</h2>
        <div className="max-h-40 overflow-y-auto text-sm text-slate-400">
          {gameState?.activityLog.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
