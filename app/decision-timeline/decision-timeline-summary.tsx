'use client';

import { useMemo } from 'react';
import { GitBranch, Route } from 'lucide-react';
import { useGameManager } from '@/app/context/GameContext';
import {
  decisionNodesSubtreePreorderFromStart,
  decisionTimelineStartHasConnectedCheckpoint,
  decisionTimelineStartRootId,
  effectivePlannerTurnSlotId,
  getDecisionPathFromRoot,
  pinnedDecisionLineageAnchoredAtStart,
} from '@/app/utils/decisionTreeHelpers';
import type { DecisionNode, Turn } from '@/app/types/gameTypes';
import { resolvedDecisionTimelineAccentHex } from '@/app/utils/decisionTimelineAccent';

function summaryLineLabel(n: DecisionNode, nodes: DecisionNode[], turns: Turn[]): string {
  if (n.timelineRole === 'timeline_start' || (n.parentId === null && n.timelineRole !== 'branch')) {
    return 'START';
  }
  const slot = effectivePlannerTurnSlotId(nodes, n, turns);
  const nick = (n.label ?? '').trim();
  const short = nick.slice(0, 22);
  const ell = nick.length > 22 ? '…' : '';
  return short ? `T${slot} · ${short}${ell}` : `Turn slot ${slot}`;
}

/** Left sidebar: nodes under START + active pin path as one vertical spine (outside React Flow). */
export default function DecisionTimelineSummary() {
  const { decisionNodes, activeDecisionNodeId, turns } = useGameManager();

  const startConnected = useMemo(
    () => decisionTimelineStartHasConnectedCheckpoint(decisionNodes),
    [decisionNodes],
  );

  const preorder = useMemo(() => decisionNodesSubtreePreorderFromStart(decisionNodes), [decisionNodes]);

  const connectedCheckpointCount = useMemo(() => {
    const startId = decisionTimelineStartRootId(decisionNodes);
    if (!startId) return 0;
    return Math.max(0, preorder.filter((n) => n.id !== startId).length);
  }, [decisionNodes, preorder]);

  const activePath = useMemo(() => {
    if (!activeDecisionNodeId || decisionNodes.length === 0) return [];
    if (!pinnedDecisionLineageAnchoredAtStart(decisionNodes, activeDecisionNodeId)) return [];
    return getDecisionPathFromRoot(decisionNodes, activeDecisionNodeId);
  }, [activeDecisionNodeId, decisionNodes]);

  if (decisionNodes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3 shadow-inner shadow-black/20">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Summary</p>
        <p className="mt-2 text-[11px] leading-snug text-slate-500">Load a project or combat JSON from the planner header, then open this page to see the decision tree.</p>
      </div>
    );
  }

  return (
    <div className="flex max-h-[calc(100dvh-8rem)] min-h-0 flex-col gap-3 rounded-xl border border-slate-700/70 bg-slate-900/85 p-3 shadow-inner shadow-black/25 [scrollbar-width:thin]">
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <GitBranch className="h-3 w-3 shrink-0 text-cyan-500/85" strokeWidth={2} aria-hidden />
          Summary
        </p>
        <p className="mt-1 text-[10px] leading-snug text-slate-500">
          Nodes linked under START and the current active path (cyan pin), top → bottom.
        </p>
      </div>

      <div className="min-h-0 shrink-0">
        <p className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
          <Route className="h-3 w-3 text-cyan-400/90" strokeWidth={2} aria-hidden />
          Active path
        </p>
        {!startConnected ? (
          <p className="rounded-lg border border-rose-500/35 bg-rose-950/25 px-2 py-2 text-[10px] leading-snug text-rose-100/90">
            Nothing branches from START yet — fork or link a checkpoint under START.
          </p>
        ) : activePath.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-600/80 px-2 py-2 text-[10px] leading-snug text-slate-500">
            {!activeDecisionNodeId
              ? 'No active pin — Set Active on a checkpoint under START.'
              : 'Active checkpoint is not on the START tree — pick a node linked from START.'}
          </p>
        ) : (
          <div className="flex flex-col">
            {activePath.map((n, idx) => {
              const isLast = idx === activePath.length - 1;
              const isPin = n.id === activeDecisionNodeId;
              const accent = resolvedDecisionTimelineAccentHex(n, '#64748b');
              const line = summaryLineLabel(n, decisionNodes, turns);
              return (
                <div key={n.id} className="flex gap-2">
                  <div className="flex w-5 shrink-0 flex-col items-center pt-0.5">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ${
                        n.timelineRole === 'timeline_start'
                          ? 'bg-amber-400 ring-amber-200/90'
                          : isPin
                            ? 'bg-cyan-300 ring-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.65)]'
                            : 'bg-slate-500 ring-slate-700'
                      }`}
                      style={
                        n.timelineRole !== 'timeline_start'
                          ? { boxShadow: `0 0 0 1px ${accent}55, inset 0 0 0 1px ${accent}35` }
                          : undefined
                      }
                      title={n.id}
                    />
                    {!isLast ? (
                      <span className="my-0.5 block w-0.5 flex-1 min-h-[12px] rounded-full bg-slate-600/90" aria-hidden />
                    ) : null}
                  </div>
                  <div className={`min-w-0 flex-1 pb-2 ${isPin ? 'text-cyan-50' : 'text-slate-200'}`}>
                    <p className={`text-[10px] font-semibold leading-snug ${isPin ? 'text-cyan-200' : ''}`}>{line}</p>
                    {isPin ? (
                      <span className="mt-0.5 inline-block rounded bg-cyan-500/25 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-cyan-200">
                        Active pin
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-700/60 pt-2">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">Connected under START</p>
        <p className="mb-2 text-[10px] tabular-nums text-slate-400">
          <span className="font-semibold text-slate-200">{connectedCheckpointCount}</span> checkpoint
          {connectedCheckpointCount === 1 ? '' : 's'} in subtree
        </p>
        <ul className="space-y-1 border-l-2 border-slate-700/80 pl-2.5">
          {preorder.map((n) => {
            const accent = resolvedDecisionTimelineAccentHex(n, '#64748b');
            const isStart = n.timelineRole === 'timeline_start' || n.parentId === null;
            return (
              <li key={n.id} className="relative text-[9px] leading-tight">
                <span
                  className="absolute -left-[11px] top-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                <span className={isStart ? 'font-bold text-amber-200/95' : 'text-slate-400'}>
                  {summaryLineLabel(n, decisionNodes, turns)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
