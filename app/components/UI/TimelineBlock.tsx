"use client";

import { useMemo } from "react";
import { useGameManager } from "@/app/context/GameContext";
import { Zap } from "lucide-react";

interface EnemyIntentSummary {
  name: string;
  line: string;
  damage: number;
}

interface TurnSummary {
  turn: number;
  totalDamage: number;
  enemySummaries: EnemyIntentSummary[];
}

export default function TimelineBlock() {
  const { gameState, currentTurn, setCurrentTurn } = useGameManager();

  const turns = useMemo(() => {
    const map = new Map<number, TurnSummary>();
    const enemies = gameState?.enemies ?? [];

    for (const enemy of enemies) {
      for (const intent of enemy.intents ?? []) {
        const turn = intent.turn;
        if (!map.has(turn)) {
          map.set(turn, {
            turn,
            totalDamage: 0,
            enemySummaries: [],
          });
        }

        const entry = map.get(turn)!;
        const parts: string[] = [];
        let damage = 0;

        for (const action of intent.actions ?? []) {
          if (action.type === "attack") {
            parts.push(`⚔️ ${action.value}`);
            damage += action.value ?? 0;
          }
          if (action.type === "debuff" || action.type === "status") {
            parts.push(`❗ ${action.effect}${action.value ? ` ${action.value}` : ""}`);
          }
          if (action.type === "buff") {
            parts.push(`📈 ${action.effect}${action.value ? ` ${action.value}` : ""}`);
          }
        }

        entry.enemySummaries.push({
          name: enemy.name,
          line: parts.join(" · "),
          damage,
        });
        entry.totalDamage += damage;
      }
    }

    return Array.from(map.values()).sort((a, b) => a.turn - b.turn);
  }, [gameState?.enemies]);

  const selected = turns.find((turn) => turn.turn === currentTurn) ?? turns[0];

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/20">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Timeline</p>
          <h2 className="text-xl font-semibold">Turn Planner</h2>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
          Turn {selected?.turn ?? 1}
        </div>
      </div>

      <div className="space-y-3">
        {turns.map((turnSummary) => (
          <button
            key={turnSummary.turn}
            type="button"
            onClick={() => setCurrentTurn(turnSummary.turn)}
            className={`w-full rounded-3xl border p-4 text-left transition ${
              turnSummary.turn === currentTurn
                ? 'border-blue-500 bg-slate-900/90 shadow-lg shadow-blue-500/10'
                : 'border-slate-800 bg-slate-950/80 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Turn {turnSummary.turn}</div>
                <div className="text-[11px] text-slate-500">{turnSummary.enemySummaries.length} enemy intents</div>
              </div>
              <div className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300">
                {turnSummary.totalDamage} dmg
              </div>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-400">
              {turnSummary.enemySummaries.map((summary) => (
                <div key={summary.name} className="flex items-center justify-between gap-2">
                  <span>{summary.name}</span>
                  <span className="text-slate-300">{summary.line || 'No intent'}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
          <div className="mb-3 flex items-center gap-2 text-slate-400">
            <Zap className="h-4 w-4 text-red-400" />
            <span>Turn {selected.turn} summary</span>
          </div>
          <div className="space-y-2">
            {selected.enemySummaries.map((summary) => (
              <div key={summary.name} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-950/60 px-3 py-2">
                <span className="font-semibold text-slate-100">{summary.name}</span>
                <span className="text-xs text-slate-400">{summary.line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
