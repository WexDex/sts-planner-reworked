'use client';

import Link from 'next/link';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { useGameManager } from '@/app/context/GameContext';
import DecisionTimelineFlow from '@/app/decision-timeline/DecisionTimelineFlow';

export default function DecisionTimelinePage() {
  const { forkDecisionBranch, saveGameData } = useGameManager();

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-800/90 bg-slate-900/90 px-4 py-3 shadow-md shadow-black/20">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-600/60 bg-slate-800/80 px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 sm:px-3 sm:py-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Planner
            </Link>
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-sm font-bold text-slate-100 sm:text-base">
                <GitBranch className="h-4 w-4 shrink-0 text-cyan-400" strokeWidth={2} aria-hidden />
                <span className="truncate">Decision timeline</span>
              </h1>
              <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                Fork branches from the current board; activate a node to restore that snapshot in the planner.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const label = window.prompt('Optional label for new branch (or leave empty)', '');
                if (label === null) return;
                forkDecisionBranch(label);
              }}
              className="rounded-xl border border-cyan-500/50 bg-cyan-900/70 px-3.5 py-2 text-xs font-semibold text-cyan-50 shadow-sm transition hover:bg-cyan-800/80 active:scale-[0.99]"
            >
              Fork from current
            </button>
            <button
              type="button"
              onClick={() => saveGameData()}
              className="rounded-xl border border-slate-600 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
              title="Save planner + decision tree to browser storage"
            >
              Save game
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 p-3 sm:p-4">
        <DecisionTimelineFlow />
      </main>
    </div>
  );
}
