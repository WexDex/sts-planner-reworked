"use client";

import { useGameManager } from "@/app/context/GameContext";
import STSCard from "./Card";
import { LOCATION } from "@/app/types/types";
import { ACTIVITY_LOG_COLORS, ACTIVITY_LOG_ICONS } from "@/app/constants/colors";
import { ActivityLogType } from "@/app/utils/activityLogger";

export default function MainFieldBlock() {
  const { gameState } = useGameManager();

  const getActivityLogColors = (type?: ActivityLogType) => {
    const logType = type || 'info';
    return (ACTIVITY_LOG_COLORS as Record<string, any>)[logType] || ACTIVITY_LOG_COLORS.info;
  };

  const getActivityLogIcon = (type?: ActivityLogType) => {
    const logType = type || 'info';
    return (ACTIVITY_LOG_ICONS as Record<string, string>)[logType] || '•';
  };

  return (
    <div className="space-y-6 w-3/4">
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
        <div className="max-h-96 overflow-y-auto space-y-2 text-sm">
          {gameState?.activityLog && gameState.activityLog.length > 0 ? (
            [...gameState.activityLog].reverse().map((entry) => {
            const colors = getActivityLogColors(entry.type);
            const icon = getActivityLogIcon(entry.type);
            
            return (
              <div
                key={entry.id}
                className={`rounded-lg border transition-all duration-200 hover:shadow-lg ${colors.border} ${colors.bg}`}
              >
                <div className="p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-lg shrink-0 w-5 h-5 flex items-center justify-center`}>
                        {icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`${colors.text} font-semibold text-sm truncate`}>
                          {entry.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge} ${colors.text} uppercase tracking-wider whitespace-nowrap`}>
                        {entry.type ?? 'info'}
                      </span>
                      <span className="text-slate-500 text-xs whitespace-nowrap">
                        {entry.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Before/After Values */}
                  {(entry.before || entry.after) && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      {entry.before && (
                        <div className="bg-slate-900/50 rounded px-2.5 py-1.5 border border-slate-700/50">
                          <div className="text-slate-400 text-[11px] uppercase tracking-wide mb-0.5">
                            Before
                          </div>
                          <div className="text-slate-200 font-mono text-sm overflow-hidden">
                            {entry.before}
                          </div>
                        </div>
                      )}
                      {entry.after && (
                        <div className="bg-slate-900/50 rounded px-2.5 py-1.5 border border-slate-700/50">
                          <div className="text-slate-400 text-[11px] uppercase tracking-wide mb-0.5">
                            After
                          </div>
                          <div className={`${colors.text} font-mono text-sm overflow-hidden font-semibold`}>
                            {entry.after}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Details */}
                  {entry.details && (
                    <div className="mt-2 px-2 py-1.5 bg-slate-900/50 rounded border border-slate-700/50">
                      <div className="text-slate-400 text-[11px] uppercase tracking-wide mb-0.5">
                        Details
                      </div>
                      <div className="text-slate-300 text-xs overflow-hidden">
                        {entry.details}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No activity recorded yet.</p>
              <p className="text-xs text-slate-600 mt-1">Actions will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
