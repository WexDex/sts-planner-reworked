'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Download, GitBranch, GitBranchPlus, Waypoints } from 'lucide-react';
import type { DecisionNode, Turn } from '@/app/types/gameTypes';
import { useGameManager } from '@/app/context/GameContext';
import DecisionTimelineFlow from '@/app/decision-timeline/DecisionTimelineFlow';
import DecisionTimelineSummary from '@/app/decision-timeline/decision-timeline-summary';
import { ToastStack } from '@/app/components/UI/NotificationProvider';
import {
  computeDecisionCheckpointNickname,
  getDecisionNodeBreadcrumb,
} from '@/app/utils/decisionTreeHelpers';

function forkParentDisplayLine(
  nodes: DecisionNode[],
  parentId: string | null,
  turns: Turn[],
): string {
  if (!parentId) return '…';
  const node = nodes.find((n) => n.id === parentId);
  if (!node) return `${parentId.slice(0, 8)}…`;
  if (node.timelineRole === 'timeline_start' || node.parentId === null) return 'START';
  const slug = computeDecisionCheckpointNickname(nodes, parentId, turns);
  const nick = (node.label ?? '').trim();
  if (slug && nick && nick !== slug) return `${slug} (${nick})`;
  return slug ?? (nick || 'Checkpoint');
}

export default function DecisionTimelinePage() {
  const {
    forkDecisionBranch,
    forceActiveDecisionTimelineMainChain,
    downloadPlannerSaveJson,
    applyDecisionBranchToPlanner,
    isApplyDecisionBranchToPlannerSynced,
    decisionNodes,
    activeDecisionNodeId,
    turns,
    gameState,
  } = useGameManager();
  const [selectedGraphNodeId, setSelectedGraphNodeId] = useState<string | null>(null);
  const [forkNewCheckpointHover, setForkNewCheckpointHover] = useState(false);
  const [relinkPanelMount, setRelinkPanelMount] = useState<HTMLElement | null>(null);
  const [organizePanelMount, setOrganizePanelMount] = useState<HTMLElement | null>(null);

  const applyTargetId = selectedGraphNodeId ?? activeDecisionNodeId;
  const applyBreadcrumb = useMemo(() => {
    if (!applyTargetId) return '';
    return getDecisionNodeBreadcrumb(decisionNodes, applyTargetId, turns).display;
  }, [applyTargetId, decisionNodes, turns]);

  const applyBranchFullySynced = applyTargetId ? isApplyDecisionBranchToPlannerSynced(applyTargetId) : true;

  const forkParentId = selectedGraphNodeId ?? activeDecisionNodeId;
  const forkParentIdResolved = useMemo(() => {
    if (forkParentId) return forkParentId;
    const root = decisionNodes.find((n) => n.parentId === null);
    return root?.id ?? null;
  }, [forkParentId, decisionNodes]);

  const forkParentLine = useMemo(() => {
    if (!gameState) return '—';
    if (decisionNodes.length === 0) return 'START · new tree';
    if (!forkParentIdResolved) return 'Pick a checkpoint';
    return forkParentDisplayLine(decisionNodes, forkParentIdResolved, turns);
  }, [gameState, decisionNodes, forkParentIdResolved, turns]);

  const forkParentBreadcrumb = useMemo(() => {
    if (!forkParentIdResolved || decisionNodes.length === 0) return '';
    return getDecisionNodeBreadcrumb(decisionNodes, forkParentIdResolved, turns).display;
  }, [forkParentIdResolved, decisionNodes, turns]);

  const forkUsesVioletSelection = Boolean(selectedGraphNodeId);

  const forkHoverHighlightId =
    forkNewCheckpointHover && forkParentIdResolved ? forkParentIdResolved : null;

  return (
    <div className="relative flex h-dvh min-h-0 flex-col bg-slate-950 text-slate-100">
      <ToastStack placement="topRight" />
      <header className="shrink-0 border-b border-slate-800/90 bg-slate-900/90 px-4 py-3 shadow-md shadow-black/20">
        <div className="mx-auto flex max-w-[1920px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                Violet ring = fork parent for &quot;Fork new checkpoint&quot;; if none selected, the cyan active pin is used.
                Live planner edits sync on the active path; Apply merges the chosen checkpoint into planner rows.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyTargetId && applyDecisionBranchToPlanner(applyTargetId)}
              disabled={
                !applyTargetId || decisionNodes.length === 0 || !gameState || applyBranchFullySynced
              }
              title={
                applyBranchFullySynced && applyTargetId
                  ? 'Planner and timeline already match this branch — nothing to merge'
                  : applyBreadcrumb
                    ? `Merge path into planner rows and open: ${applyBreadcrumb}`
                    : 'Select or activate a branch'
              }
              className={`rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${
                applyBranchFullySynced
                  ? 'border-slate-600 bg-slate-800/70 text-slate-500'
                  : 'border-emerald-500/50 bg-emerald-900/70 text-emerald-50 hover:bg-emerald-800/80'
              }`}
            >
              Apply to planner
            </button>
            <button
              type="button"
              disabled={!gameState}
              onMouseEnter={() => setForkNewCheckpointHover(true)}
              onMouseLeave={() => setForkNewCheckpointHover(false)}
              onClick={() => {
                const label = window.prompt('Optional nickname (or leave empty for default T1 / T2 style)', '');
                if (label === null) return;
                const childId = forkDecisionBranch(label, selectedGraphNodeId);
                if (childId) setSelectedGraphNodeId(childId);
              }}
              title={[
                'Add a child checkpoint under the node shown below.',
                forkParentBreadcrumb ? `Path: ${forkParentBreadcrumb}` : '',
                'Copies that snapshot, appends a Copied-from log line, and adds planner rows when the tree grows deeper.',
              ]
                .filter(Boolean)
                .join(' ')}
              className="inline-flex max-w-[min(100%,17rem)] rounded-xl border border-cyan-500/50 bg-cyan-900/70 px-3 py-2 text-left text-xs font-semibold text-cyan-50 shadow-sm transition hover:bg-cyan-800/80 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="flex min-w-0 items-start gap-2">
                <GitBranchPlus className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" strokeWidth={2} aria-hidden />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="leading-snug">Fork new checkpoint</span>
                  <span className="max-w-full truncate text-[10px] font-semibold leading-snug text-cyan-100/95">
                    Under <span className="text-cyan-50">{forkParentLine}</span>
                  </span>
                  <span className="text-[9px] font-medium leading-snug text-slate-400">
                    Parent source:{' '}
                    <span
                      className={forkUsesVioletSelection ? 'text-violet-300' : 'text-sky-300'}
                    >
                      {forkUsesVioletSelection ? 'violet selection' : 'active pin (cyan)'}
                    </span>
                  </span>
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => forceActiveDecisionTimelineMainChain()}
              disabled={decisionNodes.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/45 bg-violet-950/55 px-3.5 py-2 text-xs font-semibold text-violet-100 shadow-sm transition hover:bg-violet-900/55 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              title="START → children: pin active node to the deterministic main chain so every planner step on that chain is on-path"
            >
              <Waypoints className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Force active path
            </button>
            <button
              type="button"
              onClick={() => downloadPlannerSaveJson()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
              title="Download planner, decision tree, and timeline positions as JSON"
            >
              <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Export JSON
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col p-3 sm:p-4">
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3">
          <aside className="order-2 flex min-h-0 flex-col lg:order-1 lg:w-[min(15rem,calc(100vw-2rem))] lg:max-w-[260px] lg:shrink-0">
            <DecisionTimelineSummary />
          </aside>
          <div className="order-1 flex min-h-[min(420px,48vh)] min-w-0 flex-1 flex-col lg:order-2 lg:min-h-0">
            <DecisionTimelineFlow
              selectedGraphNodeId={selectedGraphNodeId}
              onSelectedNodeIdChange={setSelectedGraphNodeId}
              forkParentHoverHighlightId={forkHoverHighlightId}
              relinkPanelMount={relinkPanelMount}
              organizePanelMount={organizePanelMount}
            />
          </div>
          <aside className="order-3 flex min-h-0 w-full flex-col gap-2 lg:order-3 lg:w-[min(13rem,calc(100vw-2rem))] lg:shrink-0">
            <div
              ref={setRelinkPanelMount}
              className="sticky top-2 flex min-h-0 max-h-[min(52vh,calc(100dvh-13rem))] min-h-[10rem] flex-col lg:top-3 lg:max-h-[calc(100dvh-18rem)]"
            />
            <div ref={setOrganizePanelMount} className="sticky top-2 shrink-0 lg:top-3" />
          </aside>
        </div>
      </main>
    </div>
  );
}
