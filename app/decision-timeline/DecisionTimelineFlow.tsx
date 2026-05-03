'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  memo,
  useRef,
  useState,
  Fragment,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useViewport,
  Panel,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type OnNodeDrag,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GripVertical,
  LayoutDashboard,
  Link2,
  Minus,
  Palette,
  Pencil,
  ScrollText,
  Skull,
  Trash2,
  Unlink,
  X,
} from 'lucide-react';
import { useGameManager, type DecisionTimelinePositionMap } from '@/app/context/GameContext';
import type {
  ActivityLogEntry,
  CombatTurnPhase,
  DecisionNode as DecisionNodeModel,
  Turn,
} from '@/app/types/gameTypes';
import { resolvedDecisionTimelineAccentHex, timelineAccentRgba } from '@/app/utils/decisionTimelineAccent';
import {
  layoutDecisionTreeNodes,
  layoutDecisionTreePacked,
  DECISION_TIMELINE_BRANCH_CARD_W,
  DECISION_TIMELINE_START_CARD_W,
  estimateDecisionTimelineBranchFootprint,
  type DecisionTreePackOrientation,
  getPinnedAncestorCheckpointIds,
  getUniqueChildLadderDescendantIds,
  getDecisionNodeBreadcrumb,
  decisionNodesPeersSameTurnDepth,
  eligibleDecisionReparentParents,
  isDecisionTimelineOrphan,
  getDecisionTimelineSpineMeta,
  effectivePlannerTurnSlotId,
  decisionNodeDepthFromRoot,
  decisionTimelineStartHasConnectedCheckpoint,
  pinnedDecisionLineageAnchoredAtStart,
  formatDecisionBreadcrumbSegment,
} from '@/app/utils/decisionTreeHelpers';
import { getNewLogEntriesForDecisionNode } from '@/app/utils/decisionNodePlays';
import {
  activityLogHasPhaseBoundaryMarkers,
  clusterActivityLogByPhaseBoundaries,
} from '@/app/utils/activityLogPhaseClusters';

import {
  minimapHexForDecisionNodePreview,
  plannerPhaseStripClass,
  plannerPhaseTimelineCardAccent,
} from '@/app/utils/decisionTimelinePhaseUi';
import {
  ActivityLogRowInline,
  type ActivityLogInlineDensity,
} from '@/app/components/activity-log/activity-log-rows';
import { IntentIncomingChips } from '@/app/components/UI/IntentIncomingChips';
import {
  collectEnemyIntentLinesForPlannerSlot,
  type DecisionTimelineEnemyIntentLine,
} from '@/app/utils/decisionTimelineIntentSummaries';
import { enemyIntentSlotTone } from '@/app/utils/enemyIntentSlotTone';
import { useRouter } from 'next/navigation';
import { formatTurnUidShort } from '@/app/utils/gameHelpers';
import { DtlBranchCombatIntel } from '@/app/decision-timeline/dtl-branch-combat-panel';

/** Match Turn timeline: collapse long enemy lists on branch cards. */
const BRANCH_INTENT_PREVIEW_MAX = 4;

/** Full-width top/bottom MOVE rails (`absolute` + edge rounding applied at call site). */
const DTL_BRANCH_MOVE_EDGE_ROW =
  'dtl-branch-move-rail flex h-8 shrink-0 cursor-grab items-center justify-center gap-1.5 border-slate-700/50 bg-slate-900/80 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500 shadow-inner shadow-black/20 active:cursor-grabbing hover:bg-slate-900/95 hover:text-slate-400';

/** Colored hit targets — distinct hues per action for quick scanning. */
const DTL_CARD_TOOLBAR_BTN_BASE =
  'nodrag nopan flex min-h-9 min-w-9 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-lg border p-0 shadow-sm transition-[colors,transform] active:scale-[0.96]';
/** Floated above the card so actions are not clipped and do not cover header content. */
const DTL_CARD_TOOLBAR_ROW_FLOAT =
  'nodrag nopan flex max-w-[min(100vw-1.5rem,520px)] flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-500/40 bg-slate-950/98 px-1.5 py-1 shadow-xl shadow-black/50 ring-1 ring-violet-500/15 backdrop-blur-md';

/**
 * Branch-card floating toolbar: visible while hovering the card on fine pointers.
 * On coarse pointers (touch), only the graph-selected node keeps an always-on rail — otherwise every card would stack duplicate toolbars.
 */
function useDtlFloatingActionsVisible(isGraphSelected: boolean, chromeHovered: boolean): boolean {
  const [coarseNoHover, setCoarseNoHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const sync = () => setCoarseNoHover(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return chromeHovered || (coarseNoHover && isGraphSelected);
}

/** Keep aligned with `MainFieldBlock` `ACTIVITY_LOG_DENSITY_KEY`. */
const ACTIVITY_LOG_INLINE_DENSITY_KEY = 'sts-activity-log-inline-density';

/** Typed planner-turn id line: `T1`, `T4`, `T3.2` — matches {@link formatDecisionBreadcrumbSegment}. */
function TurnSlugTypography({
  slug,
  size = 'lg',
  className = '',
  title: titleProp,
  accentHex,
}: {
  slug: string;
  size?: 'lg' | 'md';
  className?: string;
  /** Hover hint (e.g. full breadcrumb); defaults to `slug`. */
  title?: string;
  /** When set, main planner index is drawn in this color (decision node accent). */
  accentHex?: string;
}) {
  const m = /^T(\d+)(?:\.(\d+))?$/.exec(slug.trim());
  const tLetter = size === 'lg' ? 'text-[13px]' : 'text-[10px]';
  const mainNum = size === 'lg' ? 'text-xl' : 'text-lg';
  const dot = size === 'lg' ? 'text-[12px]' : 'text-[11px]';
  const altNum = size === 'lg' ? 'text-[15px]' : 'text-[13px]';
  const title = titleProp ?? slug;
  if (!m) {
    return (
      <span className={`font-black tabular-nums tracking-tight text-slate-100 ${className}`} title={title}>
        {slug}
      </span>
    );
  }
  const [, main, alt] = m;
  return (
    <span className={`inline-flex items-baseline font-black tabular-nums tracking-tight ${className}`} title={title}>
      <span className={`${tLetter} font-black text-slate-300`}>T</span>
      <span
        className={`${mainNum} ps-1 leading-none ${accentHex ? '' : 'text-slate-100'}`}
        style={accentHex ? { color: accentHex } : undefined}
      >
        {main}
      </span>
      {alt ? (
        <>
          <span className={`${dot} mx-px font-bold leading-none text-slate-600`}>.</span>
          <span className={`${altNum} font-bold leading-none text-amber-400`}>{alt}</span>
        </>
      ) : null}
    </span>
  );
}

/** Snapshot-derived fields for branch nodes; built in {@link buildFlowGraph}. */
type DecisionTimelineBranchCardDisplay = {
  treeDepth: number;
  branchOrdinal: number;
  branchPeerCount: number;
  /** Enemy intents for {@link DecisionCardData.effectivePlannerSlotId} on this checkpoint. */
  enemyIntentLines: DecisionTimelineEnemyIntentLine[];
  logEntries: ActivityLogEntry[];
};

type DecisionCardData = {
  decisionNode: DecisionNodeModel;
  parent: DecisionNodeModel | null;
  /** Same planner turn row as the left Timeline (all matching nodes highlight together). */
  isSlotActive: boolean;
  /**
   * Loaded timeline lineage: true for START when any decision is active (`activeDecisionNodeId`);
   * true for branch cards on ROOT→active pin only (single-child continuations below still use Set Active).
   */
  isPinned: boolean;
  /**
   * Sole-child continuation below the pin — user must click Set Active; sky-accent button hints this.
   */
  setActiveSuggested?: boolean;
  /** Depth-derived row id (maps to planner `Turn.id` by row order). */
  effectivePlannerSlotId: number;
  /** Stable planner row id (`Turn.uid`) for this checkpoint slot; START uses first-slot row when present. */
  plannerTurnUid: string | null;
  breadcrumbDisplay: string;
  /** Relink panel: which role this node plays in the pending parent change. */
  relinkPanelRole: 'child' | 'parent' | null;
  /** Parent checkpoint missing from tree — relink to restore. */
  isOrphan: boolean;
  /** XYFlow / toolbar selection — violet ring (distinct from active path pinning). */
  isGraphSelected?: boolean;
  /** Header &quot;Fork new checkpoint&quot; hover — bright yellow ring on the parent that would receive the fork. */
  isForkParentHoverHighlight?: boolean;
  /** Present on branch cards only — START omits. */
  branchDisplay?: DecisionTimelineBranchCardDisplay;
};

/** Background grouping for all checkpoints at the same tree depth (same planner row / branch alternates). */
type DecisionSlotClusterData = {
  label: string;
  depth: number;
  /** Tailwind surface + border classes for depth-based hue. */
  surfaceClass: string;
};

type DecisionFlowNodeData = DecisionCardData | DecisionSlotClusterData;

type ClusterSnapCtx = {
  snapLockedDepths: ReadonlySet<number>;
  toggleClusterSnapDepth: (depth: number) => void;
  /** Reset all timeline nodes to compact packed tree positions (reduces overlap / messy drags). */
  organizeTimelineLayout: () => void;
};

const ClusterSnapContext = createContext<ClusterSnapCtx | null>(null);

type TimelineInteractCtx = {
  reparentSourceId: string | null;
  setReparentSourceId: React.Dispatch<React.SetStateAction<string | null>>;
  reparentHoverParentId: string | null;
  setReparentHoverParentId: React.Dispatch<React.SetStateAction<string | null>>;
  /** Clear panel relink picks for the branch being moved when disarming Link2 on that card. */
  disarmMovingBranchFromCard: (branchNodeId: string) => void;
  /** Relink panel pick modes — parent mode uses {@link reparentHoverParentId} for hover ring on valid targets. */
  relinkPickMode: null | 'child' | 'parent';
  relinkChildId: string | null;
};

const TimelineInteractContext = createContext<TimelineInteractCtx | null>(null);

/** Jump to main planner (`/`) and select the given planner turn row (`Turn.id`). */
function useGoEditTurnOnMainScene() {
  const router = useRouter();
  const { gameState, turns, currentTurnIndex, setCurrentTurn } = useGameManager();
  return useCallback(
    (plannerTurnId: number) => {
      if (gameState) {
        const idx = turns.findIndex((t) => t.id === plannerTurnId);
        if (idx !== -1 && idx !== currentTurnIndex) {
          setCurrentTurn(plannerTurnId);
        }
      }
      router.push('/');
    },
    [gameState, turns, currentTurnIndex, setCurrentTurn, router],
  );
}

type DecisionTimelineFlowProps = {
  /** Timeline checkpoint selected on the canvas (click); drives violet highlight + Branch parent. */
  selectedGraphNodeId?: string | null;
  onSelectedNodeIdChange?: (nodeId: string | null) => void;
  /**
   * While the header &quot;Fork new checkpoint&quot; control is hovered, this node id is outlined in yellow
   * (resolved parent: violet selection → else active pin → tree root).
   */
  forkParentHoverHighlightId?: string | null;
  /** When set, Relink controls render here (portal) instead of the canvas top-right panel. */
  relinkPanelMount?: HTMLElement | null;
  /** When set, Layout / Organize controls render here (portal) instead of the canvas bottom-right panel. */
  organizePanelMount?: HTMLElement | null;
};

/** Fit viewport when the tree structure (node ids) changes — not on every activate. */
function FitViewOnStructureChange({ structureKey }: { structureKey: string }) {
  const { fitView } = useReactFlow();
  const isFirst = useRef(true);
  useEffect(() => {
    const t = window.setTimeout(() => {
      fitView({
        padding: 0.18,
        duration: isFirst.current ? 0 : 440,
      });
      isFirst.current = false;
    }, 48);
    return () => window.clearTimeout(t);
  }, [structureKey, fitView]);
  return null;
}

function parentPickHoverRingClass(isHoverTarget: boolean): string {
  return isHoverTarget
    ? ' z-30 scale-[1.04] ring-4 ring-yellow-300 ring-offset-2 ring-offset-slate-950 shadow-xl shadow-yellow-400/55 brightness-[1.08]'
    : '';
}

/** Off the loaded Active path — read clearly darker / less saturated than {@link timelineBranchOnPathClass}. */
function timelineBranchOffPathClass(active: boolean): string {
  return active
    ? ''
    : 'relative z-0 opacity-[0.85] saturate-[0.62] brightness-[0.86] before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-[inherit] before:bg-slate-950/65 before:content-[""]';
}

/** On the pinned lineage — strong cyan frame and glow so the main path pops vs alternates. */
function timelineBranchOnPathClass(active: boolean): string {
  return active
    ? 'z-[3] border-cyan-400/80 ring-[3px] ring-cyan-200/95 ring-offset-[3px] ring-offset-slate-950 brightness-[1.06] shadow-[inset_0_0_0_1px_rgba(103,232,249,0.4),0_0_40px_-4px_rgba(34,211,238,0.55)]'
    : '';
}

/** Labels/nodes selected in the zoom-safe Relink panel (distinct from active-path styling). */
function relinkPanelVisualClass(role: 'child' | 'parent' | null): string {
  if (role === 'child') {
    return ' z-[5] !ring-amber-400 shadow-[0_0_26px_rgba(251,191,36,0.45),inset_0_0_0_1px_rgba(251,191,36,0.35)] !ring-[3px] ring-offset-2 ring-offset-slate-950';
  }
  if (role === 'parent') {
    return ' z-[5] !ring-sky-300 shadow-[0_0_26px_rgba(56,189,248,0.4),inset_0_0_0_1px_rgba(125,211,252,0.35)] !ring-[3px] ring-offset-2 ring-offset-slate-950';
  }
  return '';
}

/** "Move branch" relink target — rendered above the card so it is not clipped by overflow-hidden. */
function RelinkMoveBranchAboveCard() {
  return (
    <span
      className="pointer-events-none absolute bottom-full left-1/2 z-[25] mb-1 max-w-[min(320px,calc(100vw-2rem))] -translate-x-1/2 truncate rounded-md border border-amber-200/80 bg-amber-500 px-2 py-0.5 text-[8px] font-black uppercase leading-none tracking-wider text-amber-950 shadow-md shadow-amber-950/40"
      title="Relink: branch that will move"
      aria-hidden
    >
      Move branch
    </span>
  );
}

function RelinkRoleBadge({ role, placement }: { role: 'child' | 'parent' | null; placement: 'start' | 'branch' }) {
  const posClass = placement === 'start' ? 'bottom-2 left-2' : 'top-11 left-2';
  if (role === 'parent') {
    return (
      <span
        className={`pointer-events-none absolute ${posClass} z-[25] max-w-[calc(100%-1rem)] truncate rounded-md border border-sky-200/80 bg-sky-400 px-1.5 py-0.5 text-[8px] font-black uppercase leading-none tracking-wider text-slate-950 shadow-md shadow-sky-950/40`}
        title="Relink: new parent"
        aria-hidden
      >
        New parent
      </span>
    );
  }
  return null;
}

const DTL_HANDLE_CLS = '!h-2 !w-2 !min-h-0 !min-w-0 !border-0 !bg-transparent';

const DTL_PORT_SIDES: { suffix: 'top' | 'bottom' | 'left' | 'right'; position: Position }[] = [
  { suffix: 'top', position: Position.Top },
  { suffix: 'bottom', position: Position.Bottom },
  { suffix: 'left', position: Position.Left },
  { suffix: 'right', position: Position.Right },
];

/** Source + target ports on every side so edges can exit/enter the nearest face (positions chosen in {@link nearestPortHandles}). */
function DtlCardPortHandles() {
  return (
    <>
      {DTL_PORT_SIDES.map(({ suffix, position }) => (
        <Fragment key={suffix}>
          <Handle
            type="source"
            position={position}
            id={`dtl-src-${suffix}`}
            isConnectable={false}
            className={DTL_HANDLE_CLS}
            aria-hidden
          />
          <Handle
            type="target"
            position={position}
            id={`dtl-tgt-${suffix}`}
            isConnectable={false}
            className={DTL_HANDLE_CLS}
            aria-hidden
          />
        </Fragment>
      ))}
    </>
  );
}

type DtlCardSide = 'top' | 'bottom' | 'left' | 'right';

/** For an edge from `from` → `to` (node center positions), pick the side of each node that faces the other. */
function nearestPortHandles(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { sourceHandle: string; targetHandle: string } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let fromSide: DtlCardSide;
  if (Math.abs(dx) > Math.abs(dy)) {
    fromSide = dx > 0 ? 'right' : 'left';
  } else {
    fromSide = dy > 0 ? 'bottom' : 'top';
  }
  const dx2 = from.x - to.x;
  const dy2 = from.y - to.y;
  let toSide: DtlCardSide;
  if (Math.abs(dx2) > Math.abs(dy2)) {
    toSide = dx2 > 0 ? 'right' : 'left';
  } else {
    toSide = dy2 > 0 ? 'bottom' : 'top';
  }
  return {
    sourceHandle: `dtl-src-${fromSide}`,
    targetHandle: `dtl-tgt-${toSide}`,
  };
}

const TREE_BEZIER_CURVATURE_BASE = 0.26;
const TREE_BEZIER_CURVATURE_SPREAD = 0.052;
const CLUSTER_PAD = 28;

/** Depth row cluster panel hues (cycles by depth). Tint kept muted so cards stay the focus. */
const CLUSTER_DEPTH_PANEL_STYLES: readonly string[] = [
  'bg-violet-950/44 border-violet-800/24',
  'bg-sky-950/42 border-sky-800/24',
  'bg-emerald-950/42 border-emerald-800/24',
  'bg-amber-950/42 border-amber-800/22',
  'bg-rose-950/42 border-rose-800/24',
  'bg-fuchsia-950/42 border-fuchsia-800/24',
  'bg-cyan-950/42 border-cyan-800/24',
  'bg-orange-950/42 border-orange-800/22',
];

function clusterSurfaceClassForDepth(depth: number): string {
  return CLUSTER_DEPTH_PANEL_STYLES[(depth - 1) % CLUSTER_DEPTH_PANEL_STYLES.length]!;
}

/** Ordered child nodes per parent (left→right by layout x), to fan sibling edges and reduce overlap. */
function groupChildrenByParentId(
  decisionNodes: DecisionNodeModel[],
  pos: Map<string, { x: number; y: number }>,
): Map<string, DecisionNodeModel[]> {
  const byParent = new Map<string, DecisionNodeModel[]>();
  for (const n of decisionNodes) {
    if (n.parentId == null) continue;
    const list = byParent.get(n.parentId);
    if (list) list.push(n);
    else byParent.set(n.parentId, [n]);
  }
  for (const [, kids] of byParent) {
    kids.sort((a, b) => {
      const ax = pos.get(a.id)?.x ?? 0;
      const bx = pos.get(b.id)?.x ?? 0;
      if (ax !== bx) return ax - bx;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }
  return byParent;
}

/** Slightly different Bézier tension per sibling so shared parent→child bundles don’t sit on one path. */
function bezierCurvatureForFan(
  siblingIdsLeftToRight: string[],
  edgeChildId: string,
  base: number,
  spread: number,
): number {
  if (siblingIdsLeftToRight.length <= 1) return base;
  const idx = siblingIdsLeftToRight.indexOf(edgeChildId);
  if (idx < 0) return base;
  const mid = (siblingIdsLeftToRight.length - 1) / 2;
  const t = base + (idx - mid) * spread;
  return Math.min(0.48, Math.max(0.12, t));
}

function footprintForTimelineCard(
  nodes: DecisionNodeModel[],
  n: DecisionNodeModel,
  turns: Turn[],
): { w: number; h: number } {
  return estimateDecisionTimelineBranchFootprint(nodes, n, turns);
}

function buildSlotClusterNodes(
  decisionNodes: DecisionNodeModel[],
  pos: Map<string, { x: number; y: number }>,
  turns: Turn[],
  snapLockedDepths: ReadonlySet<number>,
): Node<DecisionSlotClusterData>[] {
  let maxDepth = 0;
  for (const n of decisionNodes) {
    if (n.timelineRole === 'timeline_start' || n.parentId == null) continue;
    maxDepth = Math.max(maxDepth, decisionNodeDepthFromRoot(decisionNodes, n.id));
  }
  const clusters: Node<DecisionSlotClusterData>[] = [];
  for (let depth = 1; depth <= maxDepth; depth++) {
    const peers = decisionNodes.filter(
      (n) =>
        n.timelineRole !== 'timeline_start' &&
        n.parentId != null &&
        decisionNodeDepthFromRoot(decisionNodes, n.id) === depth,
    );
    if (peers.length < 2) continue;

    let minL = Infinity;
    let minT = Infinity;
    let maxR = -Infinity;
    let maxB = -Infinity;
    for (const n of peers) {
      const c = pos.get(n.id) ?? { x: 0, y: 0 };
      const { w, h } = footprintForTimelineCard(decisionNodes, n, turns);
      minL = Math.min(minL, c.x - w / 2);
      maxR = Math.max(maxR, c.x + w / 2);
      minT = Math.min(minT, c.y - h / 2);
      maxB = Math.max(maxB, c.y + h / 2);
    }
    const slotId = effectivePlannerTurnSlotId(decisionNodes, peers[0]!, turns);
    const wBox = maxR - minL + CLUSTER_PAD * 2;
    const hBox = maxB - minT + CLUSTER_PAD * 2;
    const snapLocked = snapLockedDepths.has(depth);
    clusters.push({
      id: `dtl-cluster:d${depth}`,
      type: 'decisionSlotCluster',
      position: { x: minL - CLUSTER_PAD, y: minT - CLUSTER_PAD },
      origin: [0, 0] as const,
      width: wBox,
      height: hBox,
      draggable: snapLocked,
      dragHandle: snapLocked ? '.dtl-cluster-drag-rail' : undefined,
      selectable: false,
      focusable: false,
      zIndex: snapLocked ? 0 : -2,
      data: {
        label: `${formatDecisionBreadcrumbSegment(slotId, 1)} · ${peers.length} branches`,
        depth,
        surfaceClass: clusterSurfaceClassForDepth(depth),
      },
    });
  }
  return clusters;
}

const DecisionSlotCluster = memo(function DecisionSlotCluster({ data }: { id: string; data: DecisionSlotClusterData }) {
  const clusterSnap = useContext(ClusterSnapContext);
  const locked = clusterSnap ? clusterSnap.snapLockedDepths.has(data.depth) : false;
  const toggle = clusterSnap?.toggleClusterSnapDepth;
  const organize = clusterSnap?.organizeTimelineLayout;

  return (
    <div
      className={`relative h-full w-full rounded-2xl border-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-black/35 ${data.surfaceClass}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-2 z-0 truncate px-2 text-center text-[9px] font-bold uppercase tracking-wide text-slate-500/95">
        {data.label}
      </span>
      {organize ? (
        <button
          type="button"
          title="Reorganize entire graph: compact tree layout, less overlap (saved with game)"
          className="nodrag nopan absolute left-2 top-1.5 z-[2] rounded-md border border-emerald-600/55 bg-emerald-950/90 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-100 shadow-sm shadow-emerald-950/25 transition-colors hover:border-emerald-500 hover:bg-emerald-900/90"
          onClick={(e) => {
            e.stopPropagation();
            organize();
          }}
        >
          Organize
        </button>
      ) : null}
      {toggle ? (
        <button
          type="button"
          title={
            locked
              ? 'Unlock: drag individual branches again (cluster frame follows layout)'
              : 'Snap: drag the whole group from the top rail; branches stay locked together'
          }
          className={`nodrag nopan absolute right-2 top-1.5 z-[2] rounded-md border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider transition-colors ${
            locked
              ? 'border-sky-500/60 bg-sky-950/90 text-sky-100 shadow-md shadow-sky-950/30'
              : 'border-slate-600/70 bg-slate-900/95 text-slate-400 hover:border-slate-500 hover:text-slate-200'
          }`}
          aria-pressed={locked}
          onClick={(e) => {
            e.stopPropagation();
            toggle(data.depth);
          }}
        >
          Snap
        </button>
      ) : null}
      {locked ? (
        <div
          className="dtl-cluster-drag-rail absolute left-0 right-0 top-0 z-0 flex h-8 cursor-grab items-end justify-center rounded-t-2xl border-b border-slate-700/35 bg-slate-900/55 pb-0.5 text-[8px] font-semibold text-slate-600 active:cursor-grabbing"
          title="Drag to move all branches in this row together"
        >
          <span className="pointer-events-none select-none">Drag row</span>
        </div>
      ) : null}
    </div>
  );
});

/** Prevent wheel from reaching React Flow’s pane (zoom) when scrolling nested log lists. */
function stopWheelZoomOnPane(e: React.WheelEvent) {
  e.stopPropagation();
}

const PHASE_STRIP: readonly { phase: CombatTurnPhase; label: string; tint: string }[] = [
  { phase: 'start', label: 'Draw', tint: 'border-violet-400/55 bg-violet-950/90 text-violet-100' },
  { phase: 'player', label: 'Main', tint: 'border-emerald-400/55 bg-emerald-950/90 text-emerald-100' },
  { phase: 'enemy', label: 'Enemy', tint: 'border-rose-400/55 bg-rose-950/90 text-rose-100' },
];

const PHASE_LOG_CLUSTER_FRAME: Record<CombatTurnPhase, string> = {
  start: 'border-violet-500/45 bg-violet-950/30',
  player: 'border-emerald-500/45 bg-emerald-950/28',
  enemy: 'border-rose-500/45 bg-rose-950/28',
};

const PHASE_LOG_CLUSTER_LABEL: Record<CombatTurnPhase, string> = {
  start: 'text-violet-200/95',
  player: 'text-emerald-200/95',
  enemy: 'text-rose-200/95',
};

function TurnPhaseTripleStrip({
  hintPhase,
  mode,
}: {
  /** Snapshot phase from the decision node (soft guide). */
  hintPhase: CombatTurnPhase;
  /** `readonly` = display only. `dtl-highlight` = tap cycles emphasis only (planner bar drives real phase). */
  mode: 'readonly' | 'dtl-highlight';
}) {
  const editable = mode === 'dtl-highlight';
  const [focusPhase, setFocusPhase] = useState(hintPhase);
  useEffect(() => {
    setFocusPhase(hintPhase);
  }, [hintPhase]);

  return (
    <div
      className="nodrag nopan mb-2 flex overflow-hidden rounded-lg border border-slate-600/55 shadow-inner shadow-black/30"
      title={
        editable
          ? 'Planner phase is advanced with “End of start / main / enemy” in the main bar (writes Start/End lines in the activity log). Tap a cell to emphasize it in this strip only.'
          : 'Draw → Main → Enemy for this planner turn'
      }
      role={editable ? 'group' : undefined}
      aria-label={editable ? 'Emphasize timeline phase (display only)' : undefined}
    >
      {PHASE_STRIP.map(({ phase, label, tint }) => {
        const isFocus = focusPhase === phase;
        const isHint = hintPhase === phase;
        const cellCls = `${tint} ${
          isFocus
            ? 'relative z-[1] shadow-[inset_0_0_0_3px_rgba(250,250,250,0.55)] brightness-110 scale-[1.02]'
            : isHint
              ? 'shadow-[inset_0_0_0_1px_rgba(250,250,250,0.3)] opacity-[0.95] saturate-100'
              : 'opacity-[0.82] saturate-[0.88]'
        } ${editable ? 'cursor-pointer hover:brightness-110 hover:saturate-100 active:brightness-95' : ''}`;
        const inner = (
          <>
            <span className="text-[8px] font-extrabold uppercase leading-none tracking-tight">{label}</span>
            <span className="mt-0.5 font-mono text-[7px] opacity-85">{phase}</span>
          </>
        );
        if (!editable) {
          return (
            <div
              key={phase}
              className={`nodrag nopan flex min-h-[2.25rem] flex-1 flex-col items-center justify-center border-r border-slate-800/85 px-0.5 py-1 text-center last:border-r-0 ${cellCls}`}
            >
              {inner}
            </div>
          );
        }
        return (
          <button
            key={phase}
            type="button"
            className={`nodrag nopan flex min-h-[2.25rem] flex-1 flex-col items-center justify-center border-r border-slate-800/85 px-0.5 py-1 text-center last:border-r-0 ${cellCls}`}
            aria-pressed={isFocus}
            onClick={(e) => {
              e.stopPropagation();
              setFocusPhase(phase);
            }}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

function neighborCheckpointSummary(
  n: DecisionNodeModel | null | undefined,
  allNodes: DecisionNodeModel[],
  turnRows: Turn[],
): string | null {
  if (!n) return null;
  if (n.timelineRole === 'timeline_start') {
    return `ROOT · ${n.id}`;
  }
  const depth = decisionNodeDepthFromRoot(allNodes, n.id);
  const peers = decisionNodesPeersSameTurnDepth(allNodes, n.id);
  const ord = Math.max(1, peers.findIndex((x) => x.id === n.id) + 1);
  const slot = effectivePlannerTurnSlotId(allNodes, n, turnRows);
  const tid = formatDecisionBreadcrumbSegment(slot, ord);
  return `${tid} · depth ${depth}${peers.length > 1 ? ` · ${peers.length} paths` : ''}`;
}

/** Short ROOT id in tight UI; full id is shown via `title` / native tooltip. */
function formatDecisionTimelineRootIdLabel(id: string): string {
  if (id.length <= 18) return id;
  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}

/** `entries` oldest-first (same order as snapshot / delta helpers). */
function renderDtlActivityLogBody(
  entriesOldestFirst: ActivityLogEntry[],
  density: ActivityLogInlineDensity,
  stripe: 'modal' | 'inline' | 'none',
): ReactNode {
  const clustered = activityLogHasPhaseBoundaryMarkers(entriesOldestFirst);
  const stripeLine =
    stripe !== 'none' && density === 'detailed' ? (
      <div
        className={`pointer-events-none absolute bottom-0 left-[21px] w-px bg-slate-700/80 ${
          stripe === 'modal' ? 'top-3' : 'top-2'
        }`}
        aria-hidden
      />
    ) : null;

  if (clustered) {
    const clusters = clusterActivityLogByPhaseBoundaries(entriesOldestFirst);
    return (
      <>
        {stripeLine}
        <div className="space-y-2 py-1">
          {[...clusters].reverse().map((cluster) => (
            <div
              key={cluster.phase}
              className={`rounded-lg border ${PHASE_LOG_CLUSTER_FRAME[cluster.phase]} px-1.5 py-1.5`}
            >
              <p
                className={`mb-1 border-b border-white/10 px-0.5 pb-0.5 text-[8px] font-black uppercase tracking-widest ${PHASE_LOG_CLUSTER_LABEL[cluster.phase]}`}
              >
                {cluster.displayName} phase
                <span className="ml-1 font-mono text-[7px] font-semibold opacity-70">
                  ({cluster.entries.length})
                </span>
              </p>
              <div className="space-y-0.5">
                {cluster.entries.length === 0 ? (
                  <p className="px-1 py-1 text-[9px] italic text-slate-600">No log lines in this phase.</p>
                ) : (
                  [...cluster.entries].reverse().map((entry) => (
                    <ActivityLogRowInline key={entry.id} entry={entry} density={density} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {stripeLine}
      <div className="space-y-1 py-1">
        {[...entriesOldestFirst].reverse().map((entry) => (
          <ActivityLogRowInline key={entry.id} entry={entry} density={density} />
        ))}
      </div>
    </>
  );
}

function DtlModalLogScroll({
  entries,
  density,
  emptyLabel,
}: {
  entries: ActivityLogEntry[];
  density: ActivityLogInlineDensity;
  emptyLabel: string;
}) {
  if (entries.length === 0) {
    return <p className="px-3 py-10 text-center text-xs leading-snug text-slate-500">{emptyLabel}</p>;
  }
  return (
    <div className="relative px-3 py-3">{renderDtlActivityLogBody(entries, density, 'modal')}</div>
  );
}

const DecisionStartCard = memo(function DecisionStartCard({ data }: { id: string; data: DecisionCardData }) {
  const interact = useContext(TimelineInteractContext);
  const { decisionNodes, activeDecisionNodeId } = useGameManager();
  const { decisionNode, isPinned, plannerTurnUid } = data;
  const uidRaw = plannerTurnUid?.trim() ?? '';
  const uidDisplay = uidRaw ? formatTurnUidShort(uidRaw) : '—';
  const uidTitle = uidRaw || decisionNode.id;

  const eligibleToolbarParents = useMemo(() => {
    const src = interact?.reparentSourceId;
    if (!src) return null;
    return new Set(eligibleDecisionReparentParents(decisionNodes, src).map((p) => p.id));
  }, [interact?.reparentSourceId, decisionNodes]);

  const eligibleRelinkPanelParents = useMemo(() => {
    const childId = interact?.relinkChildId;
    if (!childId || interact?.relinkPickMode !== 'parent') return null;
    return new Set(eligibleDecisionReparentParents(decisionNodes, childId).map((p) => p.id));
  }, [interact?.relinkChildId, interact?.relinkPickMode, decisionNodes]);

  const hoverPick =
    (interact != null &&
      interact.reparentSourceId &&
      interact.reparentHoverParentId === decisionNode.id &&
      eligibleToolbarParents?.has(decisionNode.id)) ||
    (interact?.relinkPickMode === 'parent' &&
      interact?.relinkChildId &&
      interact.reparentHoverParentId === decisionNode.id &&
      eligibleRelinkPanelParents?.has(decisionNode.id));

  const startHasNoChildCheckpoint = useMemo(
    () => !decisionTimelineStartHasConnectedCheckpoint(decisionNodes),
    [decisionNodes],
  );
  const activePinNotUnderStart = useMemo(() => {
    if (!activeDecisionNodeId) return false;
    return !pinnedDecisionLineageAnchoredAtStart(decisionNodes, activeDecisionNodeId);
  }, [decisionNodes, activeDecisionNodeId]);

  const startDisconnected = startHasNoChildCheckpoint || activePinNotUnderStart;
  const startDisconnectedTitle =
    startHasNoChildCheckpoint
      ? 'No checkpoint is linked under START — fork or link a branch from START.'
      : activePinNotUnderStart
        ? 'Active pin is not on a path from START — select a checkpoint under START or relink the orphan branch.'
        : undefined;

  const startCardAccentChromeStyle = useMemo((): CSSProperties => {
    const h = resolvedDecisionTimelineAccentHex(decisionNode, '#fbbf24');
    const parts = [
      `inset 3px 0 0 0 ${h}`,
      `inset 0 2px 0 0 ${timelineAccentRgba(h, 0.38)}`,
      `inset 0 -2px 0 0 ${timelineAccentRgba(h, 0.38)}`,
      `inset -2px 0 0 0 ${timelineAccentRgba(h, 0.28)}`,
    ];
    if (isPinned) {
      parts.push('inset 0 0 0 1px rgba(251,191,36,0.22)');
      parts.push('0 0 26px -10px rgba(250,204,21,0.38)');
    }
    return { boxShadow: parts.join(', ') };
  }, [decisionNode, isPinned]);

  return (
    <div className="relative shrink-0" style={{ width: DECISION_TIMELINE_START_CARD_W }}>
      {data.relinkPanelRole === 'child' ? <RelinkMoveBranchAboveCard /> : null}
      <div
        style={startDisconnected ? undefined : startCardAccentChromeStyle}
        title={startDisconnectedTitle}
        className={`relative w-full overflow-hidden rounded-xl border-2 bg-slate-950 px-2 py-2.5 pl-3 text-center transition-[transform,box-shadow,ring] duration-150 ${
          startDisconnected
            ? 'animate-sts-start-disconnected shadow-black/50'
            : 'border-amber-400/95 shadow-md shadow-black/40'
        }${parentPickHoverRingClass(Boolean(hoverPick || data.isForkParentHoverHighlight))}${relinkPanelVisualClass(data.relinkPanelRole)}${data.isGraphSelected ? ' ring-2 ring-violet-400/85 ring-offset-2 ring-offset-slate-950 z-[5]' : ''}`}
      >
        <DtlCardPortHandles />
        <RelinkRoleBadge role={data.relinkPanelRole} placement="start" />
        <p
          className={`text-[13px] font-black uppercase tracking-[0.2em] ${startDisconnected ? 'text-rose-200' : 'text-amber-300'}`}
        >
          START
        </p>
        <p
          className={`mt-1 truncate font-mono text-[9px] font-semibold tabular-nums ${startDisconnected ? 'text-rose-200/75' : 'text-amber-200/80'}`}
          title={uidTitle}
        >
          {uidDisplay}
        </p>
      </div>
    </div>
  );
});

const DecisionBranchCard = memo(function DecisionBranchCard({ data }: { id: string; data: DecisionCardData }) {
  const interact = useContext(TimelineInteractContext);
  const clusterSnap = useContext(ClusterSnapContext);
  const {
    jumpToDecisionNode,
    deleteDecisionBranch,
    unlinkDecisionTimelineBranch,
    updateDecisionNodeLabel,
    updateDecisionNodeTimelineAccent,
    decisionNodes,
    turns,
  } = useGameManager();
  const goEditTurnOnMain = useGoEditTurnOnMainScene();
  /** Counteract React Flow viewport zoom so toolbar hit-targets stay ~constant screen size. */
  const { zoom } = useViewport();
  const toolbarScreenScale = useMemo(() => 1 / Math.max(zoom, 0.08), [zoom]);
  const bd = data.branchDisplay;
  const clusterSnapLocked =
    bd != null &&
    bd.treeDepth > 0 &&
    clusterSnap != null &&
    clusterSnap.snapLockedDepths.has(bd.treeDepth);
  const {
    decisionNode,
    isSlotActive,
    isPinned,
    setActiveSuggested = false,
    effectivePlannerSlotId,
    plannerTurnUid,
    breadcrumbDisplay,
  } = data;
  const isRoot = decisionNode.parentId === null;

  const eligibleToolbarParents = useMemo(() => {
    const src = interact?.reparentSourceId;
    if (!src) return null;
    return new Set(eligibleDecisionReparentParents(decisionNodes, src).map((p) => p.id));
  }, [interact?.reparentSourceId, decisionNodes]);

  const eligibleRelinkPanelParents = useMemo(() => {
    const childId = interact?.relinkChildId;
    if (!childId || interact?.relinkPickMode !== 'parent') return null;
    return new Set(eligibleDecisionReparentParents(decisionNodes, childId).map((p) => p.id));
  }, [interact?.relinkChildId, interact?.relinkPickMode, decisionNodes]);

  const hoverPick =
    (interact != null &&
      interact.reparentSourceId &&
      interact.reparentHoverParentId === decisionNode.id &&
      eligibleToolbarParents?.has(decisionNode.id)) ||
    (interact?.relinkPickMode === 'parent' &&
      interact?.relinkChildId &&
      interact.reparentHoverParentId === decisionNode.id &&
      eligibleRelinkPanelParents?.has(decisionNode.id));

  const [inlineLogDensity, setInlineLogDensity] = useState<ActivityLogInlineDensity>('minimal');
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logsSectionExpanded, setLogsSectionExpanded] = useState(true);
  const [portalMounted, setPortalMounted] = useState(false);
  const [intentsExpanded, setIntentsExpanded] = useState(false);
  const [chromeHovered, setChromeHovered] = useState(false);
  const showFloatingActions = useDtlFloatingActionsVisible(Boolean(data.isGraphSelected), chromeHovered);
  /** Hover depth across disjoint MOVE rails — pointer moving edge→edge without dipping to zero between frames. */
  const moveRailHoverDepthRef = useRef(0);
  const branchColorInputRef = useRef<HTMLInputElement>(null);
  const [moveRailsHovered, setMoveRailsHovered] = useState(false);
  const [moveRailsGrabbed, setMoveRailsGrabbed] = useState(false);
  const moveRailsLit = moveRailsHovered || moveRailsGrabbed;

  const onMoveRailPointerEnter = useCallback(() => {
    moveRailHoverDepthRef.current += 1;
    setMoveRailsHovered(true);
  }, []);

  const onMoveRailPointerLeave = useCallback(() => {
    moveRailHoverDepthRef.current = Math.max(0, moveRailHoverDepthRef.current - 1);
    requestAnimationFrame(() => {
      if (moveRailHoverDepthRef.current === 0) setMoveRailsHovered(false);
    });
  }, []);

  const onMoveRailPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setMoveRailsGrabbed(true);
  }, []);

  useEffect(() => {
    if (!moveRailsGrabbed) return;
    const end = () => setMoveRailsGrabbed(false);
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', end, true);
    return () => {
      window.removeEventListener('pointerup', end, true);
      window.removeEventListener('pointercancel', end, true);
    };
  }, [moveRailsGrabbed]);

  /** Bottom padding (not margin) keeps pointer hit-testing continuous from toolbar → card (margin leaves a dead gap). */
  const floatToolbarBelowPad = data.relinkPanelRole === 'child' ? 'pb-9' : 'pb-2';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACTIVITY_LOG_INLINE_DENSITY_KEY);
      if (raw === 'minimal' || raw === 'detailed') setInlineLogDensity(raw);
    } catch {
      /* ignore */
    }
  }, []);

  const setInlineLogDensityPersisted = useCallback((d: ActivityLogInlineDensity) => {
    setInlineLogDensity(d);
    try {
      localStorage.setItem(ACTIVITY_LOG_INLINE_DENSITY_KEY, d);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setPortalMounted(true);
  }, []);

  useEffect(() => {
    if (!logModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLogModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [logModalOpen]);

  const parentNode = data.parent;
  const childNodes = useMemo(
    () => decisionNodes.filter((n) => n.parentId === decisionNode.id),
    [decisionNodes, decisionNode.id],
  );
  const grandparentNode = useMemo(() => {
    if (!parentNode?.parentId) return null;
    return decisionNodes.find((n) => n.id === parentNode.parentId) ?? null;
  }, [decisionNodes, parentNode?.parentId]);

  const parentStepLogs = useMemo((): ActivityLogEntry[] | null => {
    if (!parentNode) return null;
    const childSlot = effectivePlannerTurnSlotId(decisionNodes, parentNode, turns);
    const parentSlot = grandparentNode
      ? effectivePlannerTurnSlotId(decisionNodes, grandparentNode, turns)
      : childSlot;
    return getNewLogEntriesForDecisionNode(parentNode, grandparentNode, {
      childSlot,
      parentSlot,
    });
  }, [parentNode, grandparentNode, decisionNodes, turns]);

  const soleChildNode = childNodes.length === 1 ? childNodes[0]! : null;
  const childStepLogs = useMemo((): ActivityLogEntry[] | null => {
    if (!soleChildNode) return null;
    const childSlot = effectivePlannerTurnSlotId(decisionNodes, soleChildNode, turns);
    const parentSlot = effectivePlannerTurnSlotId(decisionNodes, decisionNode, turns);
    return getNewLogEntriesForDecisionNode(soleChildNode, decisionNode, {
      childSlot,
      parentSlot,
    });
  }, [soleChildNode, decisionNode, decisionNodes, turns]);

  const onRename = useCallback(() => {
    const next = window.prompt('Branch label', decisionNode.label);
    if (next === null) return;
    updateDecisionNodeLabel(decisionNode.id, next);
  }, [decisionNode.id, decisionNode.label, updateDecisionNodeLabel]);

  const toggleReparentMode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!interact) return;
      interact.setReparentSourceId((cur) => {
        if (cur === decisionNode.id) {
          interact.disarmMovingBranchFromCard(decisionNode.id);
          return null;
        }
        return decisionNode.id;
      });
      interact.setReparentHoverParentId(null);
    },
    [interact, decisionNode.id],
  );

  const onUnlinkBranch = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!decisionNode.parentId) return;
      if (interact?.reparentSourceId === decisionNode.id) {
        interact.setReparentSourceId(null);
      }
      interact?.setReparentHoverParentId(null);
      interact?.disarmMovingBranchFromCard(decisionNode.id);
      unlinkDecisionTimelineBranch(decisionNode.id);
    },
    [
      interact,
      decisionNode.id,
      decisionNode.parentId,
      unlinkDecisionTimelineBranch,
    ],
  );

  const accentShell = plannerPhaseTimelineCardAccent(decisionNode.turnPhase, isSlotActive && !isPinned);
  const reparentSelf = interact?.reparentSourceId === decisionNode.id;
  const orphanShell = data.isOrphan
    ? 'animate-sts-start-disconnected shadow-black/50'
    : '';

  const renameToolbarCls = `${DTL_CARD_TOOLBAR_BTN_BASE} border-violet-500/50 bg-violet-950/70 text-violet-100 hover:bg-violet-900/60`;
  const plannerToolbarCls = `${DTL_CARD_TOOLBAR_BTN_BASE} border-cyan-500/45 bg-cyan-950/65 text-cyan-100 hover:bg-cyan-900/55`;
  const linkToolbarIdleCls = `${DTL_CARD_TOOLBAR_BTN_BASE} border-sky-500/45 bg-sky-950/55 text-sky-100 hover:bg-sky-900/50`;
  const linkToolbarArmedCls = `${DTL_CARD_TOOLBAR_BTN_BASE} border-sky-400/75 bg-sky-900/80 text-sky-50 shadow-[0_0_14px_-2px_rgba(56,189,248,0.45)] hover:bg-sky-800/75`;
  const unlinkToolbarCls = `${DTL_CARD_TOOLBAR_BTN_BASE} border-amber-500/50 bg-amber-950/55 text-amber-100 hover:bg-amber-900/45`;
  const deleteToolbarCls = `${DTL_CARD_TOOLBAR_BTN_BASE} border-rose-500/45 bg-rose-950/55 text-rose-100 hover:bg-rose-900/50`;
  const colorToolbarCls = `${DTL_CARD_TOOLBAR_BTN_BASE} border-fuchsia-500/45 bg-fuchsia-950/55 text-fuchsia-100 hover:bg-fuchsia-900/50`;

  const branchAccentHex = resolvedDecisionTimelineAccentHex(decisionNode);

  const branchCardAccentChromeStyle = useMemo(
    (): CSSProperties => ({
      boxShadow: [
        `inset 4px 0 0 0 ${branchAccentHex}`,
        `inset 0 2px 0 0 ${timelineAccentRgba(branchAccentHex, 0.44)}`,
        `inset 0 -2px 0 0 ${timelineAccentRgba(branchAccentHex, 0.44)}`,
        `inset -2px 0 0 0 ${timelineAccentRgba(branchAccentHex, 0.38)}`,
      ].join(', '),
    }),
    [branchAccentHex],
  );

  const branchMoveRailAccentStyle = useMemo(() => {
    const lit = moveRailsLit;
    const edge = timelineAccentRgba(branchAccentHex, lit ? 0.82 : 0.52);
    const band = timelineAccentRgba(branchAccentHex, lit ? 0.26 : 0.14);
    const glow = timelineAccentRgba(branchAccentHex, lit ? 0.4 : 0);
    const sideBand = timelineAccentRgba(branchAccentHex, lit ? 0.22 : 0.12);
    const litGlow = lit ? `0 0 14px -2px ${glow}` : undefined;
    return {
      topRail: {
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
        borderBottomColor: edge,
        backgroundImage: `linear-gradient(180deg, ${band} 0%, transparent 92%)`,
        boxShadow: litGlow,
      } as CSSProperties,
      bottomRail: {
        borderTopWidth: 2,
        borderTopStyle: 'solid',
        borderTopColor: edge,
        backgroundImage: `linear-gradient(0deg, ${band} 0%, transparent 92%)`,
        boxShadow: litGlow,
      } as CSSProperties,
      sideLeft: {
        borderTopColor: edge,
        borderBottomColor: edge,
        borderRightColor: edge,
        borderLeftWidth: 0,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 2,
        borderStyle: 'solid',
        backgroundImage: `linear-gradient(90deg, ${sideBand} 0%, transparent 72%)`,
        boxShadow: litGlow,
      } as CSSProperties,
      sideRight: {
        borderTopColor: edge,
        borderBottomColor: edge,
        borderLeftColor: edge,
        borderRightWidth: 0,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 2,
        borderStyle: 'solid',
        backgroundImage: `linear-gradient(270deg, ${sideBand} 0%, transparent 72%)`,
        boxShadow: litGlow,
      } as CSSProperties,
      gripColor: lit ? timelineAccentRgba(branchAccentHex, 0.94) : undefined,
    };
  }, [branchAccentHex, moveRailsLit]);

  if (!bd) return null;

  const logEntries = bd.logEntries;
  const intentLines = bd.enemyIntentLines;
  const autoTurnSlug = formatDecisionBreadcrumbSegment(effectivePlannerSlotId, bd.branchOrdinal);
  const customLabelRaw = decisionNode.label.trim();
  const showRenamedTitle = customLabelRaw.length > 0 && customLabelRaw !== autoTurnSlug;
  const incomingIntentDamageTotal = intentLines.reduce((s, x) => s + x.damage, 0);
  const intentsExpandedView =
    intentLines.length <= BRANCH_INTENT_PREVIEW_MAX || intentsExpanded;
  const visibleIntentLines = intentsExpandedView
    ? intentLines
    : intentLines.slice(0, BRANCH_INTENT_PREVIEW_MAX);
  const hiddenIntentCount = intentLines.length - visibleIntentLines.length;

  return (
    <>
    <div
      className="relative max-w-[358px] min-w-[273px] shrink-0"
      onPointerEnter={() => setChromeHovered(true)}
      onPointerLeave={() => setChromeHovered(false)}
    >
      <div
        className={`nodrag nopan absolute bottom-full left-1/2 z-[32] flex flex-col items-center transition-opacity duration-150 ${floatToolbarBelowPad} ${
          showFloatingActions ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{
          transform: `translateX(-50%) scale(${toolbarScreenScale})`,
          transformOrigin: 'bottom center',
        }}
      >
        <div className={DTL_CARD_TOOLBAR_ROW_FLOAT} onPointerDown={(e) => e.stopPropagation()}>
          <input
            ref={branchColorInputRef}
            type="color"
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            aria-hidden
            tabIndex={-1}
            value={branchAccentHex}
            onChange={(e) => updateDecisionNodeTimelineAccent(decisionNode.id, e.target.value)}
          />
          <button
            type="button"
            title="Rename"
            className={renameToolbarCls}
            onClick={(e) => {
              e.stopPropagation();
              onRename();
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            title={`Edit turn — open main planner (row ${effectivePlannerSlotId})`}
            aria-label={`Edit turn ${effectivePlannerSlotId} on main planner`}
            className={plannerToolbarCls}
            onClick={(e) => {
              e.stopPropagation();
              goEditTurnOnMain(effectivePlannerSlotId);
            }}
          >
            <LayoutDashboard className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            title="Branch color — left timeline stripe uses this accent"
            aria-label="Change branch color"
            className={colorToolbarCls}
            onClick={(e) => {
              e.stopPropagation();
              branchColorInputRef.current?.click();
            }}
          >
            <Palette className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            title={
              reparentSelf
                ? 'Cancel relink'
                : 'Link parent — hover a valid node, then click it (or use Relink panel: toggles + click nodes)'
            }
            className={reparentSelf ? linkToolbarArmedCls : linkToolbarIdleCls}
            onClick={toggleReparentMode}
          >
            <Link2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
          {decisionNode.parentId ? (
            <button
              type="button"
              title="Unlink from parent — makes this checkpoint an orphan (relink later)"
              className={unlinkToolbarCls}
              onClick={onUnlinkBranch}
            >
              <Unlink className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
          {!isRoot ? (
            <button
              type="button"
              title="Delete branch"
              className={deleteToolbarCls}
              onClick={(e) => {
                e.stopPropagation();
                deleteDecisionBranch(decisionNode.id);
              }}
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      {data.relinkPanelRole === 'child' ? <RelinkMoveBranchAboveCard /> : null}
      <div
      style={data.isOrphan ? undefined : branchCardAccentChromeStyle}
      className={`relative max-w-[358px] min-w-[273px] overflow-hidden rounded-xl border-2 shadow-lg transition-[transform,box-shadow,ring,filter] duration-150 ${clusterSnapLocked ? 'px-2.5 pb-2.5 pt-3' : 'p-0'} ${accentShell} ${timelineBranchOffPathClass(isPinned)} ${timelineBranchOnPathClass(isPinned)}${parentPickHoverRingClass(Boolean(hoverPick || data.isForkParentHoverHighlight))}${relinkPanelVisualClass(data.relinkPanelRole)} ${orphanShell}${data.isGraphSelected ? ' ring-2 ring-violet-400/85 ring-offset-2 ring-offset-slate-950 z-[5]' : ''}`}
    >
      <DtlCardPortHandles />
      <RelinkRoleBadge role={data.relinkPanelRole} placement="branch" />
      {data.isOrphan ? (
        <span
          className="pointer-events-none absolute left-2 top-11 z-[22] rounded-md border border-rose-400/80 bg-rose-950/95 px-1.5 py-px text-[8px] font-extrabold uppercase tracking-wider text-rose-100"
          title="Parent checkpoint is missing — pick a new parent (Relink or Link on card)."
        >
          Orphan Node
        </span>
      ) : null}
      <div className={`pointer-events-none absolute left-0 right-0 top-0 z-[2] h-[5px] ${plannerPhaseStripClass(decisionNode.turnPhase)}`} aria-hidden />

      {!clusterSnapLocked ? (
        <>
          <div
            className={`${DTL_BRANCH_MOVE_EDGE_ROW} absolute left-0 right-0 top-[5px] z-[24] rounded-t-xl border-b border-slate-700/40 transition-[box-shadow,background-color,color] duration-150 ${moveRailsLit ? 'text-slate-100' : 'text-slate-500'}`}
            style={branchMoveRailAccentStyle.topRail}
            title="Drag here to reposition this checkpoint on the canvas"
            onPointerEnter={onMoveRailPointerEnter}
            onPointerLeave={onMoveRailPointerLeave}
            onPointerDown={onMoveRailPointerDown}
          >
            <GripVertical
              className="h-3.5 w-3.5 shrink-0"
              style={branchMoveRailAccentStyle.gripColor ? { color: branchMoveRailAccentStyle.gripColor } : undefined}
              strokeWidth={2.25}
              aria-hidden
            />
            Move
          </div>
          <div
            className={`${DTL_BRANCH_MOVE_EDGE_ROW} absolute bottom-0 left-0 right-0 z-[24] rounded-b-xl border-t border-slate-700/40 transition-[box-shadow,background-color,color] duration-150 ${moveRailsLit ? 'text-slate-100' : 'text-slate-500'}`}
            style={branchMoveRailAccentStyle.bottomRail}
            title="Drag here to reposition this checkpoint on the canvas"
            onPointerEnter={onMoveRailPointerEnter}
            onPointerLeave={onMoveRailPointerLeave}
            onPointerDown={onMoveRailPointerDown}
          >
            <GripVertical
              className="h-3.5 w-3.5 shrink-0 rotate-90"
              style={branchMoveRailAccentStyle.gripColor ? { color: branchMoveRailAccentStyle.gripColor } : undefined}
              strokeWidth={2.25}
              aria-hidden
            />
            Move
          </div>
          <div
            className={`dtl-branch-move-rail absolute bottom-8 left-0 top-[calc(5px+2rem)] z-[24] flex w-5 cursor-grab flex-col items-center justify-center border-slate-700/30 bg-slate-900/78 transition-[box-shadow,background-color] duration-150 hover:bg-slate-900/92 active:cursor-grabbing`}
            style={branchMoveRailAccentStyle.sideLeft}
            title="Drag to move this checkpoint"
            onPointerEnter={onMoveRailPointerEnter}
            onPointerLeave={onMoveRailPointerLeave}
            onPointerDown={onMoveRailPointerDown}
          >
            <GripVertical
              className="h-4 w-4 shrink-0"
              style={branchMoveRailAccentStyle.gripColor ? { color: branchMoveRailAccentStyle.gripColor } : undefined}
              strokeWidth={2.25}
              aria-hidden
            />
          </div>
          <div
            className={`dtl-branch-move-rail absolute bottom-8 right-0 top-[calc(5px+2rem)] z-[24] flex w-5 cursor-grab flex-col items-center justify-center border-slate-700/30 bg-slate-900/78 transition-[box-shadow,background-color] duration-150 hover:bg-slate-900/92 active:cursor-grabbing`}
            style={branchMoveRailAccentStyle.sideRight}
            title="Drag to move this checkpoint"
            onPointerEnter={onMoveRailPointerEnter}
            onPointerLeave={onMoveRailPointerLeave}
            onPointerDown={onMoveRailPointerDown}
          >
            <GripVertical
              className="h-4 w-4 shrink-0"
              style={branchMoveRailAccentStyle.gripColor ? { color: branchMoveRailAccentStyle.gripColor } : undefined}
              strokeWidth={2.25}
              aria-hidden
            />
          </div>
        </>
      ) : null}

      <div className={`relative z-[2] ${!clusterSnapLocked ? 'px-6 pb-[calc(2rem+0.5rem)] pt-[calc(5px+2rem+0.5rem)]' : ''}`}>
        <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <TurnSlugTypography
            slug={autoTurnSlug}
            size="lg"
            title={breadcrumbDisplay}
            accentHex={branchAccentHex}
          />
          {plannerTurnUid ? (
            <span className="font-mono text-[8px] font-medium tabular-nums text-slate-600" title={plannerTurnUid}>
              {formatTurnUidShort(plannerTurnUid)}
            </span>
          ) : null}
        </div>

        {showRenamedTitle ? (
          <div className="mb-1 rounded-md border border-violet-500/25 bg-violet-950/20 px-2 py-1">
            <p className="text-[8px] font-bold uppercase tracking-wide text-violet-400/90">Nickname</p>
            <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-violet-100">{customLabelRaw}</p>
          </div>
        ) : null}

        <TurnPhaseTripleStrip
          key={`${decisionNode.id}-phase-strip`}
          hintPhase={decisionNode.turnPhase}
          mode="dtl-highlight"
        />

        <DtlBranchCombatIntel
          key={decisionNode.id}
          snapshot={decisionNode.snapshot}
          turnPhase={decisionNode.turnPhase}
        />

        <div
          className="nodrag nopan mb-1.5 border-t border-slate-700/35 pt-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-rose-200/95">
                <Skull className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                <span>Enemy intents</span>
              </p>
              <p className="mt-0.5 text-[9px] text-slate-600">
                {intentLines.length === 0
                  ? 'No intents on snapshot for this turn slot.'
                  : `${intentLines.length} intent line${intentLines.length === 1 ? '' : 's'}`}
              </p>
            </div>
            {incomingIntentDamageTotal > 0 ? (
              <div
                className="shrink-0 rounded-full border border-rose-500/35 bg-rose-950/40 px-2 py-px text-[10px] font-semibold tabular-nums text-rose-200"
                title="Sum of incoming attack damage from intents (after Weak / Vulnerable / Intangible)"
              >
                {incomingIntentDamageTotal} dmg
              </div>
            ) : null}
          </div>

          {intentLines.length > 0 ? (
            <>
              <div
                className="max-h-[11rem] space-y-1 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]"
                onWheelCapture={stopWheelZoomOnPane}
              >
                {visibleIntentLines.map((row, ei) => {
                  const tone = enemyIntentSlotTone(row.name);
                  const titleParts = [
                    `${row.name}: ${row.line || 'No intent'}`,
                    row.modifierHint ? `${row.modifierHint}. (n) = base attack.` : '',
                  ].filter(Boolean);
                  return (
                    <div
                      key={`${decisionNode.id}-intent-${ei}-${row.name}`}
                      className={`space-y-0.5 rounded-md border px-2 py-1.5 ${tone.card}`}
                    >
                      <div
                        className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2"
                        title={titleParts.join(' ')}
                      >
                        <span className={`shrink-0 text-[10px] font-semibold tracking-tight ${tone.name}`}>
                          {row.name}
                        </span>
                        <div className="min-w-0 flex-1 text-[10px] leading-snug text-slate-300">
                          <IntentIncomingChips actions={row.actions} ctx={row.incomingCtx} />
                        </div>
                      </div>
                      {row.modifierHint ? (
                        <p className="text-[9px] leading-tight text-amber-200/85">{row.modifierHint}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {hiddenIntentCount > 0 ? (
                <button
                  type="button"
                  className="nodrag nopan mt-1 flex w-full items-center justify-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/50 py-1 text-[10px] font-medium text-cyan-300/90 transition hover:bg-slate-800/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIntentsExpanded((v) => !v);
                  }}
                >
                  {intentsExpanded ? (
                    <>
                      <ChevronDown className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                      +{hiddenIntentCount} more
                    </>
                  )}
                </button>
              ) : intentLines.length > BRANCH_INTENT_PREVIEW_MAX ? (
                <button
                  type="button"
                  className="nodrag nopan mt-1 flex w-full items-center justify-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIntentsExpanded(false);
                  }}
                >
                  <ChevronDown className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                  Collapse
                </button>
              ) : null}
            </>
          ) : null}
        </div>

        <div
          className="nodrag nopan border-t border-slate-700/40 pt-2"
          onPointerDown={(e) => e.stopPropagation()}
          onWheelCapture={stopWheelZoomOnPane}
        >
          <div className="mb-1 flex flex-wrap items-start gap-x-2 gap-y-2">
            <button
              type="button"
              className={`nodrag nopan flex min-h-8 min-w-0 flex-1 shrink items-center gap-1 rounded-lg border px-2 py-1 text-left transition-colors ${
                logsSectionExpanded
                  ? 'border-slate-600/70 bg-slate-900/35 text-slate-200 hover:bg-slate-800/50'
                  : 'border-slate-700/50 bg-slate-950/50 text-slate-400 hover:bg-slate-900/65'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setLogsSectionExpanded((v) => !v);
              }}
              aria-expanded={logsSectionExpanded}
            >
              {logsSectionExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden strokeWidth={2} />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden strokeWidth={2} />
              )}
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                Log <span className="tabular-nums text-slate-500">({logEntries.length})</span>
              </span>
              {!logsSectionExpanded ? (
                <span className="ml-auto text-[9px] font-normal text-slate-600">Collapsed</span>
              ) : null}
            </button>
            <div className="flex flex-wrap gap-1 sm:justify-end">
              <button
                type="button"
                className={`nodrag nopan min-h-8 rounded-md border px-2 py-1 text-[9px] font-semibold transition-colors sm:px-2.5 ${
                  inlineLogDensity === 'minimal'
                    ? 'border-violet-500/50 bg-violet-950/55 text-violet-100'
                    : 'border-slate-600 bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setInlineLogDensityPersisted('minimal');
                }}
              >
                Compact
              </button>
              <button
                type="button"
                className={`nodrag nopan min-h-8 rounded-md border px-2 py-1 text-[9px] font-semibold transition-colors sm:px-2.5 ${
                  inlineLogDensity === 'detailed'
                    ? 'border-violet-500/50 bg-violet-950/55 text-violet-100'
                    : 'border-slate-600 bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setInlineLogDensityPersisted('detailed');
                }}
              >
                Detailed
              </button>
              <button
                type="button"
                disabled={logEntries.length === 0}
                className={`nodrag nopan min-h-8 rounded-md border px-2 py-1 text-[9px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:px-2.5 ${
                  logModalOpen
                    ? 'border-amber-500/50 bg-amber-950/45 text-amber-100'
                    : 'border-slate-600 bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setLogModalOpen(true);
                }}
                aria-haspopup="dialog"
                aria-expanded={logModalOpen}
              >
                Full
              </button>
            </div>
          </div>

          {logsSectionExpanded ? (
            logEntries.length === 0 ? (
              <p className="py-2 text-center text-[10px] text-slate-600">No new log entries for this step.</p>
            ) : (
              <div
                className="relative max-h-44 overflow-y-auto overscroll-contain py-1 pr-0.5 [scrollbar-width:thin]"
                onWheelCapture={stopWheelZoomOnPane}
              >
                {renderDtlActivityLogBody(logEntries, inlineLogDensity, 'inline')}
              </div>
            )
          ) : (
            logEntries.length > 0 ? (
              <p className="py-1.5 text-center text-[9px] text-slate-600">
                Expand to preview inline logs, or tap <span className="font-semibold text-slate-400">Full</span>.
              </p>
            ) : null
          )}
        </div>

        <button
          type="button"
          disabled={isPinned}
          title={
            isPinned
              ? 'On the loaded timeline path for this turn row (alternate branches use Set Active).'
              : setActiveSuggested
                ? 'Only continuation below your active pin — click Set Active to extend the loaded path.'
                : isSlotActive
                  ? 'Load this alternate for planner turn row ' + effectivePlannerSlotId
                  : 'Load checkpoint for planner turn row ' +
                    effectivePlannerSlotId +
                    ' (timeline row differs from planner selection)'
          }
          className={`nodrag nopan mt-2 w-full min-h-10 cursor-pointer touch-manipulation rounded-xl border px-3 py-2.5 text-xs font-semibold sm:min-h-11 sm:py-3 ${
            isPinned
              ? 'cursor-default border-slate-600/55 bg-slate-900/50 text-slate-500 opacity-95'
              : setActiveSuggested
                ? 'border-sky-400/65 bg-sky-950/45 text-sky-50 shadow-[0_0_22px_-6px_rgba(56,189,248,0.48)] ring-1 ring-sky-400/45 hover:bg-sky-900/55 hover:ring-sky-300/55'
                : 'border-cyan-500/45 bg-cyan-950/50 text-cyan-100 hover:bg-cyan-900/55'
          } disabled:pointer-events-none`}
          onClick={(e) => {
            e.stopPropagation();
            jumpToDecisionNode(decisionNode.id);
          }}
        >
          {isPinned ? 'Active' : 'Set Active'}
        </button>
      </div>
    </div>
    </div>

    {portalMounted && logModalOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[240] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dtl-branch-log-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/88 backdrop-blur-md"
              aria-label="Close log modal"
              onClick={() => setLogModalOpen(false)}
            />
            <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[1480px] flex-col px-2 pb-3 pt-4 md:px-5 md:pb-6 md:pt-5">
              <div className="flex shrink-0 flex-col gap-2 rounded-t-2xl border border-b-0 border-slate-600/45 bg-slate-950/96 px-3 py-3 shadow-2xl shadow-black/40 md:flex-row md:items-start md:justify-between md:px-5 md:py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-950/50 text-cyan-300 sm:flex">
                    <ScrollText className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 id="dtl-branch-log-title" className="text-base font-bold tracking-tight text-slate-50 md:text-lg">
                      Checkpoint logs — this step & neighbors
                    </h2>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                      <TurnSlugTypography slug={autoTurnSlug} size="md" accentHex={branchAccentHex} />
                      {showRenamedTitle ? (
                        <span className="truncate text-xs font-semibold text-violet-200">{customLabelRaw}</span>
                      ) : null}
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] leading-snug text-slate-400">
                      <p className="font-semibold tabular-nums text-slate-300">
                        {breadcrumbDisplay}
                        {bd.branchPeerCount > 1 ? ` · ${bd.branchOrdinal}/${bd.branchPeerCount} alternates` : ''}
                      </p>
                      <p className="text-slate-500">
                        Center: delta vs parent ({logEntries.length} new{' '}
                        {logEntries.length === 1 ? 'line' : 'lines'}). Side panels: parent step / single child step · Esc
                        to close
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 md:self-auto"
                >
                  <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Close
                </button>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 border border-y-0 border-slate-600/35 bg-slate-950/92 px-3 py-2.5 md:px-5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Log density</span>
                <button
                  type="button"
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                    inlineLogDensity === 'minimal'
                      ? 'border-violet-500/50 bg-violet-950/55 text-violet-100'
                      : 'border-slate-600 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => setInlineLogDensityPersisted('minimal')}
                >
                  Compact
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                    inlineLogDensity === 'detailed'
                      ? 'border-violet-500/50 bg-violet-950/55 text-violet-100'
                      : 'border-slate-600 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => setInlineLogDensityPersisted('detailed')}
                >
                  Detailed
                </button>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden rounded-b-2xl border border-t-0 border-slate-600/45 bg-slate-950/85 p-3 shadow-2xl shadow-black/45 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-4 lg:p-4">
                <section
                  className="flex min-h-[200px] flex-col overflow-hidden rounded-xl border border-sky-500/40 bg-slate-950/95 lg:min-h-0"
                  aria-label="Parent checkpoint log"
                >
                  <div className="shrink-0 border-b border-sky-800/45 bg-sky-950/25 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-sky-400" strokeWidth={2} aria-hidden />
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-200">Parent</span>
                    </div>
                    {parentNode ? (
                      <>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-200">{parentNode.label}</p>
                        <p className="mt-0.5 text-[10px] text-sky-200/80">
                          {neighborCheckpointSummary(parentNode, decisionNodes, turns)}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-500">No linked parent in the tree.</p>
                    )}
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                    {parentNode && parentStepLogs ? (
                      <DtlModalLogScroll
                        entries={parentStepLogs}
                        density={inlineLogDensity}
                        emptyLabel="No new log lines on the parent step (same prefix as its parent)."
                      />
                    ) : (
                      <p className="px-3 py-10 text-center text-xs text-slate-500">
                        Parent panel unavailable — this checkpoint is the planner root.
                      </p>
                    )}
                  </div>
                </section>

                <section
                  className="flex min-h-[240px] flex-col overflow-hidden rounded-xl border border-cyan-500/45 bg-slate-950/95 lg:min-h-0"
                  aria-label="This checkpoint log"
                >
                  <div className="shrink-0 border-b border-cyan-800/45 bg-cyan-950/20 px-3 py-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-200">
                      This checkpoint
                    </span>
                    <p className="mt-1 text-[10px] text-cyan-100/75">
                      {neighborCheckpointSummary(decisionNode, decisionNodes, turns)}
                    </p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                    <DtlModalLogScroll
                      entries={logEntries}
                      density={inlineLogDensity}
                      emptyLabel="No new entries since the parent snapshot for this step."
                    />
                  </div>
                </section>

                <section
                  className="flex min-h-[200px] flex-col overflow-hidden rounded-xl border border-emerald-500/40 bg-slate-950/95 lg:min-h-0"
                  aria-label="Child checkpoint log"
                >
                  <div className="shrink-0 border-b border-emerald-800/45 bg-emerald-950/25 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">Child</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2} aria-hidden />
                    </div>
                    {soleChildNode ? (
                      <>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-200">{soleChildNode.label}</p>
                        <p className="mt-0.5 text-[10px] text-emerald-200/85">
                          {neighborCheckpointSummary(soleChildNode, decisionNodes, turns)}
                        </p>
                      </>
                    ) : childNodes.length === 0 ? (
                      <p className="mt-1 text-[11px] text-slate-500">Leaf — no downstream checkpoints yet.</p>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {childNodes.length} child branches — open each downstream card on the graph for its delta log.
                      </p>
                    )}
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                    {soleChildNode && childStepLogs ? (
                      <DtlModalLogScroll
                        entries={childStepLogs}
                        density={inlineLogDensity}
                        emptyLabel="Child step has no new lines vs this checkpoint yet."
                      />
                    ) : (
                      <p className="px-3 py-10 text-center text-xs text-slate-500">
                        Child log preview appears only when this node has exactly one child checkpoint.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null}
    </>
  );
});

function mergeLayoutWithPersisted(
  layoutPos: Map<string, { x: number; y: number }>,
  persisted: DecisionTimelinePositionMap,
  nodeIds: Set<string>,
): Map<string, { x: number; y: number }> {
  const out = new Map(layoutPos);
  for (const [id, pos] of Object.entries(persisted)) {
    if (nodeIds.has(id) && pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
      out.set(id, pos);
    }
  }
  return out;
}

/** Minimum center-to-center spacing when scattering siblings at the same depth (~card width + gutter). */
const SCATTER_MIN_CENTER_DIST = DECISION_TIMELINE_BRANCH_CARD_W + 38;

function scatterHash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Widen same-depth rows, light vertical jitter, re-center horizontally — writes positions for all timeline nodes. */
function computeScatterPositionPatch(
  decisionNodes: DecisionNodeModel[],
  persisted: DecisionTimelinePositionMap,
  turns: Turn[],
): DecisionTimelinePositionMap {
  const layoutPos = layoutDecisionTreeNodes(decisionNodes, turns);
  const nodeIds = new Set(decisionNodes.map((n) => n.id));
  const next = mergeLayoutWithPersisted(layoutPos, persisted, nodeIds);

  const byDepth = new Map<number, DecisionNodeModel[]>();
  for (const n of decisionNodes) {
    if (n.timelineRole === 'timeline_start' || n.parentId == null) continue;
    const d = decisionNodeDepthFromRoot(decisionNodes, n.id);
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n);
  }

  for (const peers of byDepth.values()) {
    if (peers.length < 2) continue;
    peers.sort((a, b) => {
      const ax = next.get(a.id)?.x ?? 0;
      const bx = next.get(b.id)?.x ?? 0;
      if (ax !== bx) return ax - bx;
      return a.id.localeCompare(b.id);
    });
    const xs = peers.map((p) => next.get(p.id)!.x);
    const cx = xs.reduce((s, x) => s + x, 0) / peers.length;
    const span = (peers.length - 1) * SCATTER_MIN_CENTER_DIST;
    let xCursor = cx - span / 2;
    for (const p of peers) {
      const old = next.get(p.id)!;
      const jy = ((scatterHash(p.id) % 11) - 5) * 5;
      next.set(p.id, { x: xCursor, y: old.y + jy });
      xCursor += SCATTER_MIN_CENTER_DIST;
    }
  }

  let minL = Infinity;
  let maxR = -Infinity;
  for (const n of decisionNodes) {
    const c = next.get(n.id)!;
    const { w } = footprintForTimelineCard(decisionNodes, n, turns);
    minL = Math.min(minL, c.x - w / 2);
    maxR = Math.max(maxR, c.x + w / 2);
  }
  if (!Number.isFinite(minL) || !Number.isFinite(maxR)) {
    return {};
  }
  const mid = (minL + maxR) / 2;

  const patch: DecisionTimelinePositionMap = {};
  for (const n of decisionNodes) {
    const c = next.get(n.id)!;
    patch[n.id] = { x: c.x - mid, y: c.y };
  }
  return patch;
}

/** Recompute positions from the packed tree. Ignores current drags. */
function computeOrganizePositionPatch(
  decisionNodes: DecisionNodeModel[],
  turns: Turn[],
  orientation: DecisionTreePackOrientation,
): DecisionTimelinePositionMap {
  const packed = layoutDecisionTreePacked(decisionNodes, turns, orientation);
  const patch: DecisionTimelinePositionMap = {};
  for (const [id, pos] of packed) {
    patch[id] = { x: pos.x, y: pos.y };
  }
  return patch;
}

type DecisionTimelineLinkStyle = 'curved' | 'straight';

function buildFlowGraph(
  decisionNodes: DecisionNodeModel[],
  activeNodeId: string | null,
  activePlannerTurnSlotId: number | undefined,
  persistedPositions: DecisionTimelinePositionMap,
  turns: Turn[],
  selectedGraphNodeId: string | null,
  linkStyle: DecisionTimelineLinkStyle = 'curved',
  snapLockedDepths: ReadonlySet<number> = new Set(),
  relinkChildId: string | null = null,
  relinkParentId: string | null = null,
  reparentSourceId: string | null = null,
  reparentHoverParentId: string | null = null,
  relinkPickMode: null | 'child' | 'parent' = null,
  forkParentHoverHighlightId: string | null = null,
): { nodes: Node<DecisionFlowNodeData>[]; edges: Edge[] } {
  const byId = new Map(decisionNodes.map((n) => [n.id, n] as const));
  const layoutPos = layoutDecisionTreeNodes(decisionNodes, turns);
  const nodeIds = new Set(decisionNodes.map((n) => n.id));
  const pos = mergeLayoutWithPersisted(layoutPos, persistedPositions, nodeIds);
  const turnUidBySlot = new Map(turns.map((t) => [t.id, t.uid] as const));
  const childrenByParent = groupChildrenByParentId(decisionNodes, pos);

  const previewChildId = relinkChildId ?? reparentSourceId ?? null;
  const toolbarHoverEligible =
    Boolean(reparentSourceId) &&
    Boolean(reparentHoverParentId) &&
    eligibleDecisionReparentParents(decisionNodes, reparentSourceId!).some((p) => p.id === reparentHoverParentId);
  const panelParentHoverEligible =
    relinkPickMode === 'parent' &&
    Boolean(relinkChildId) &&
    Boolean(reparentHoverParentId) &&
    eligibleDecisionReparentParents(decisionNodes, relinkChildId!).some((p) => p.id === reparentHoverParentId);
  const previewParentId =
    relinkParentId ??
    ((toolbarHoverEligible || panelParentHoverEligible) && reparentHoverParentId
      ? reparentHoverParentId
      : null);

  const relinkOldParentId =
    previewChildId != null ? (byId.get(previewChildId)?.parentId ?? null) : null;

  const showRelinkPreview = Boolean(
    previewChildId &&
      previewParentId &&
      relinkOldParentId &&
      previewParentId !== relinkOldParentId &&
      byId.has(previewParentId),
  );

  /** Toolbar Link mode: red old edge once the branch is armed; green appears when hovering a valid new parent. */
  const showToolbarOldEdgeHighlight = Boolean(
    reparentSourceId &&
      !relinkChildId &&
      previewChildId &&
      relinkOldParentId &&
      byId.has(relinkOldParentId) &&
      !showRelinkPreview,
  );

  /** Cards: Active only for ROOT→pin ancestors; sole-child chain below uses sky Set Active hint. */
  const pinnedAncestorCheckpointIds = getPinnedAncestorCheckpointIds(decisionNodes, activeNodeId);
  const suggestSetActiveIds = getUniqueChildLadderDescendantIds(decisionNodes, activeNodeId);

  const cardNodes: Node<DecisionCardData>[] = decisionNodes.map((n) => {
    const p = pos.get(n.id) ?? { x: 0, y: 0 };
    const parent = n.parentId ? byId.get(n.parentId) ?? null : null;
    const { display: breadcrumbDisplay } = getDecisionNodeBreadcrumb(decisionNodes, n.id, turns);
    const rowPlannerSlotId = effectivePlannerTurnSlotId(decisionNodes, n, turns);
    const isStart = n.timelineRole === 'timeline_start';
    const fp = footprintForTimelineCard(decisionNodes, n, turns);
    const packFootprintW = fp.w;
    const packFootprintH = fp.h;
    const isPinned = isStart
      ? Boolean(activeNodeId)
      : Boolean(activeNodeId && pinnedAncestorCheckpointIds.has(n.id));
    const setActiveSuggested =
      !isStart && Boolean(activeNodeId) && !isPinned && suggestSetActiveIds.has(n.id);
    const isSlotActive =
      !isStart && activePlannerTurnSlotId !== undefined && rowPlannerSlotId === activePlannerTurnSlotId;
    const treeDepth =
      isStart || !n.parentId ? 0 : decisionNodeDepthFromRoot(decisionNodes, n.id);
    const clusterSnapLocked = !isStart && treeDepth > 0 && snapLockedDepths.has(treeDepth);
    const relinkPanelRole: DecisionCardData['relinkPanelRole'] =
      previewChildId != null && n.id === previewChildId
        ? 'child'
        : previewParentId != null && n.id === previewParentId
          ? 'parent'
          : null;
    const isGraphSelected = Boolean(selectedGraphNodeId && selectedGraphNodeId === n.id);
    const isForkParentHoverHighlight = Boolean(
      forkParentHoverHighlightId && n.id === forkParentHoverHighlightId,
    );
    const isOrphan = !isStart && isDecisionTimelineOrphan(decisionNodes, n);
    let branchDisplay: DecisionTimelineBranchCardDisplay | undefined;
    if (!isStart) {
      const peersSame = decisionNodesPeersSameTurnDepth(decisionNodes, n.id);
      const branchOrdinal = Math.max(1, peersSame.findIndex((x) => x.id === n.id) + 1);
      const parentSlotForLog = parent
        ? effectivePlannerTurnSlotId(decisionNodes, parent, turns)
        : rowPlannerSlotId;
      branchDisplay = {
        treeDepth,
        branchOrdinal,
        branchPeerCount: peersSame.length,
        enemyIntentLines: collectEnemyIntentLinesForPlannerSlot(n.snapshot, rowPlannerSlotId),
        logEntries: getNewLogEntriesForDecisionNode(n, parent, {
          childSlot: rowPlannerSlotId,
          parentSlot: parentSlotForLog,
        }),
      };
    }
    return {
      id: n.id,
      type: isStart ? 'decisionStartCard' : 'decisionCard',
      position: { x: p.x, y: p.y },
      origin: [0.5, 0.5] as const,
      width: packFootprintW,
      height: packFootprintH,
      draggable: !clusterSnapLocked,
      zIndex: clusterSnapLocked ? 2 : isGraphSelected ? 4 : undefined,
      selected: isGraphSelected,
      data: {
        decisionNode: n,
        parent,
        isSlotActive,
        isPinned,
        effectivePlannerSlotId: rowPlannerSlotId,
        plannerTurnUid: turnUidBySlot.get(rowPlannerSlotId) ?? null,
        breadcrumbDisplay,
        relinkPanelRole,
        isOrphan,
        isGraphSelected,
        isForkParentHoverHighlight,
        ...(setActiveSuggested ? { setActiveSuggested: true } : {}),
        ...(branchDisplay ? { branchDisplay } : {}),
      },
    };
  });

  const spineMeta = getDecisionTimelineSpineMeta(decisionNodes, activeNodeId, turns);
  const MAIN_SPINE = '#38bdf8';
  const BRANCH_STROKE = '#5c6573';
  const RELINK_REMOVE_STROKE = '#f87171';
  const RELINK_NEW_STROKE = '#22c55e';

  const showRelinkRemovedEdge = showRelinkPreview || showToolbarOldEdgeHighlight;

  const treeEdges: Edge[] = decisionNodes
    .filter((n) => n.parentId != null && byId.has(n.parentId))
    .map((n) => {
      const stepKey = `${n.id}|${n.parentId!}`;
      const isMainSpine = spineMeta.spineEdgeKeys.has(stepKey);

      const parentId = n.parentId!;
      const parentPt = pos.get(parentId) ?? { x: 0, y: 0 };
      const childPt = pos.get(n.id) ?? { x: 0, y: 0 };
      const { sourceHandle, targetHandle } = nearestPortHandles(parentPt, childPt);
      const siblingIds = childrenByParent.get(parentId)?.map((c) => c.id) ?? [];
      const curvature = bezierCurvatureForFan(
        siblingIds,
        n.id,
        TREE_BEZIER_CURVATURE_BASE,
        TREE_BEZIER_CURVATURE_SPREAD,
      );

      const isRemovedRelink =
        showRelinkRemovedEdge && n.id === previewChildId && parentId === relinkOldParentId;

      const common = {
        id: `${parentId}→${n.id}`,
        source: parentId,
        target: n.id,
        sourceHandle,
        targetHandle,
        animated: isRemovedRelink ? false : isMainSpine,
        style: isRemovedRelink
          ? { stroke: RELINK_REMOVE_STROKE, strokeWidth: 3, strokeDasharray: '8 5' }
          : isMainSpine
            ? { stroke: MAIN_SPINE, strokeWidth: 3 }
            : { stroke: BRANCH_STROKE, strokeWidth: 1.1, opacity: 0.65 },
        markerEnd: isRemovedRelink
          ? {
              type: MarkerType.ArrowClosed,
              width: 22,
              height: 22,
              color: RELINK_REMOVE_STROKE,
            }
          : {
              type: MarkerType.ArrowClosed,
              width: isMainSpine ? 22 : 14,
              height: isMainSpine ? 22 : 14,
              color: isMainSpine ? MAIN_SPINE : '#8b96a8',
            },
        zIndex: isRemovedRelink ? 52 : isMainSpine ? 35 : 6,
      };

      if (linkStyle === 'curved') {
        return {
          ...common,
          type: 'default' as const,
          pathOptions: { curvature },
        } as Edge;
      }

      return {
        ...common,
        type: 'straight' as const,
      } as Edge;
    });

  const edges: Edge[] = [...treeEdges];
  if (showRelinkPreview && previewParentId && previewChildId) {
    const parentPt = pos.get(previewParentId) ?? { x: 0, y: 0 };
    const childPt = pos.get(previewChildId) ?? { x: 0, y: 0 };
    const { sourceHandle, targetHandle } = nearestPortHandles(parentPt, childPt);
    const existingKids = childrenByParent.get(previewParentId)?.map((c) => c.id) ?? [];
    const siblingIdsForNew = existingKids.includes(previewChildId)
      ? [...existingKids]
      : [...existingKids, previewChildId];
    siblingIdsForNew.sort((a, b) => (pos.get(a)?.x ?? 0) - (pos.get(b)?.x ?? 0));
    const previewCurvature = bezierCurvatureForFan(
      siblingIdsForNew,
      previewChildId,
      TREE_BEZIER_CURVATURE_BASE,
      TREE_BEZIER_CURVATURE_SPREAD,
    );
    const greenCommon = {
      id: 'dtl-relink-preview-new',
      source: previewParentId,
      target: previewChildId,
      sourceHandle,
      targetHandle,
      animated: true,
      style: { stroke: RELINK_NEW_STROKE, strokeWidth: 3, strokeDasharray: '10 6' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 22,
        height: 22,
        color: RELINK_NEW_STROKE,
      },
      zIndex: 55,
    };
    edges.push(
      (linkStyle === 'curved'
        ? { ...greenCommon, type: 'default' as const, pathOptions: { curvature: previewCurvature } }
        : { ...greenCommon, type: 'straight' as const }) as Edge,
    );
  }

  const clusterNodes = buildSlotClusterNodes(decisionNodes, pos, turns, snapLockedDepths);
  return { nodes: [...clusterNodes, ...cardNodes], edges };
}

function formatRelinkNodePickLabel(
  id: string | null,
  decisionNodes: DecisionNodeModel[],
  turns: Turn[],
): string {
  if (!id) return '— none —';
  const n = decisionNodes.find((x) => x.id === id);
  if (!n) return '— none —';
  if (n.timelineRole === 'timeline_start') return `ROOT · ${formatDecisionTimelineRootIdLabel(n.id)}`;
  const slice = (n.label || '(no label)').slice(0, 26);
  const ellipsis = n.label && n.label.length > 26 ? '…' : '';
  return `T${effectivePlannerTurnSlotId(decisionNodes, n, turns)} · ${slice}${ellipsis}`;
}

function structureKeyFromNodes(decisionNodes: DecisionNodeModel[]) {
  return `${decisionNodes.length}:${[...decisionNodes]
    .map((n) => n.id)
    .sort()
    .join(',')}`;
}

function DecisionTimelineCanvas({
  selectedGraphNodeId = null,
  onSelectedNodeIdChange,
  forkParentHoverHighlightId = null,
  relinkPanelMount = null,
  organizePanelMount = null,
}: DecisionTimelineFlowProps) {
  const { fitView } = useReactFlow();
  const {
    decisionNodes,
    activeDecisionNodeId,
    turns,
    currentTurnIndex,
    gameState,
    isLoading,
    decisionTimelinePositions,
    setDecisionTimelineNodePosition,
    mergeDecisionTimelinePositions,
    linkDecisionTimelineParent,
    saveGameData,
  } = useGameManager();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DecisionFlowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [reparentSourceId, setReparentSourceId] = useState<string | null>(null);
  const [reparentHoverParentId, setReparentHoverParentId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  /** Default curved (Bézier); straight uses XYFlow straight edges. */
  const [curvedLinks, setCurvedLinks] = useState(true);
  /** Organize direction: top-down vs left-right packed tree. */
  const [organizeOrientation, setOrganizeOrientation] = useState<DecisionTreePackOrientation>('horizontal');
  /** Zoom-safe relink panel: pick branch + new parent via toggles, then click nodes on the canvas. */
  const [relinkChildId, setRelinkChildId] = useState<string | null>(null);
  const [relinkParentId, setRelinkParentId] = useState<string | null>(null);
  /** Relink: arm canvas click — next branch card sets move target; next valid node sets new parent. */
  const [relinkPickMode, setRelinkPickMode] = useState<null | 'child' | 'parent'>(null);
  const [relinkPanelMinimized, setRelinkPanelMinimized] = useState(false);
  const [snapLockedDepths, setSnapLockedDepths] = useState<Set<number>>(() => new Set());
  const clusterDragSessionRef = useRef<{
    clusterId: string;
    clusterStart: { x: number; y: number };
    memberIds: string[];
    memberStarts: Map<string, { x: number; y: number }>;
  } | null>(null);
  /** Bumps XYFlow rebuild after relink/organize so main-spine edge styling stays in sync with topology. */
  const [timelineGraphRefreshNonce, setTimelineGraphRefreshNonce] = useState(0);
  const bumpTimelineGraphRefresh = useCallback(() => {
    setTimelineGraphRefreshNonce((n) => n + 1);
  }, []);
  /** After relink / randomize topology, run Organize on the next `decisionNodes` commit. */
  const pendingOrganizeAfterTopologyRef = useRef(false);

  /** XYFlow renders from `decisionNodes` + `gameState`; Provider syncs snapshots on every live `gameState` change. */

  const toggleClusterSnapDepth = useCallback((depth: number) => {
    setSnapLockedDepths((prev) => {
      const next = new Set(prev);
      if (next.has(depth)) next.delete(depth);
      else next.add(depth);
      return next;
    });
  }, []);

  const disarmMovingBranchFromCard = useCallback((branchNodeId: string) => {
    setReparentHoverParentId(null);
    setRelinkChildId((c) => (c === branchNodeId ? null : c));
    setRelinkParentId(null);
  }, []);

  const interactValue = useMemo<TimelineInteractCtx>(
    () => ({
      reparentSourceId,
      setReparentSourceId,
      reparentHoverParentId,
      setReparentHoverParentId,
      disarmMovingBranchFromCard,
      relinkPickMode,
      relinkChildId,
    }),
    [reparentSourceId, reparentHoverParentId, disarmMovingBranchFromCard, relinkPickMode, relinkChildId],
  );

  const eligibleParentIdSet = useMemo(() => {
    if (!reparentSourceId) return new Set<string>();
    return new Set(eligibleDecisionReparentParents(decisionNodes, reparentSourceId).map((p) => p.id));
  }, [reparentSourceId, decisionNodes]);

  const eligibleRelinkParentIdSet = useMemo(() => {
    if (!relinkChildId) return new Set<string>();
    return new Set(eligibleDecisionReparentParents(decisionNodes, relinkChildId).map((p) => p.id));
  }, [relinkChildId, decisionNodes]);

  const relinkOldParentId = useMemo(() => {
    if (!relinkChildId) return null;
    return decisionNodes.find((n) => n.id === relinkChildId)?.parentId ?? null;
  }, [relinkChildId, decisionNodes]);

  const applyRelinkFromPanel = useCallback(() => {
    if (!relinkChildId || !relinkParentId || relinkParentId === relinkOldParentId) return;
    linkDecisionTimelineParent(relinkChildId, relinkParentId);
    bumpTimelineGraphRefresh();
    setRelinkChildId(null);
    setRelinkParentId(null);
    setRelinkPickMode(null);
    setReparentSourceId(null);
    setReparentHoverParentId(null);
    pendingOrganizeAfterTopologyRef.current = true;
  }, [relinkChildId, relinkParentId, relinkOldParentId, linkDecisionTimelineParent, bumpTimelineGraphRefresh]);

  /** Toolbar Link2 arms a branch → mirror it in the Relink panel and clear stale new-parent pick. */
  useEffect(() => {
    if (!reparentSourceId) return;
    setRelinkChildId(reparentSourceId);
    setRelinkParentId(null);
    setRelinkPickMode(null);
  }, [reparentSourceId]);

  /** Relink panel: entering move-branch pick mode — reset toolbar + selections for a fresh branch choice. */
  useEffect(() => {
    if (relinkPickMode !== 'child') return;
    setReparentSourceId(null);
    setReparentHoverParentId(null);
    setRelinkChildId(null);
    setRelinkParentId(null);
  }, [relinkPickMode]);

  const structureKey = useMemo(() => structureKeyFromNodes(decisionNodes), [decisionNodes]);

  const autoScatterRanForKeyRef = useRef<string | null>(null);

  const applyTimelineScatter = useCallback(() => {
    const patch = computeScatterPositionPatch(decisionNodes, decisionTimelinePositions, turns);
    if (Object.keys(patch).length === 0) return;
    mergeDecisionTimelinePositions(patch);
  }, [decisionNodes, decisionTimelinePositions, mergeDecisionTimelinePositions, turns]);

  const applyTimelineOrganize = useCallback(() => {
    const patch = computeOrganizePositionPatch(decisionNodes, turns, organizeOrientation);
    if (Object.keys(patch).length === 0) return;
    mergeDecisionTimelinePositions(patch);
    bumpTimelineGraphRefresh();
    window.setTimeout(() => {
      saveGameData();
    }, 0);
    requestAnimationFrame(() => {
      fitView({ padding: 0.14, duration: 320 });
    });
  }, [
    decisionNodes,
    turns,
    organizeOrientation,
    mergeDecisionTimelinePositions,
    fitView,
    bumpTimelineGraphRefresh,
    saveGameData,
  ]);

  useEffect(() => {
    if (!pendingOrganizeAfterTopologyRef.current) return;
    pendingOrganizeAfterTopologyRef.current = false;
    if (isLoading || !gameState) return;
    applyTimelineOrganize();
  }, [decisionNodes, applyTimelineOrganize, isLoading, gameState]);

  const clusterSnapContextValue = useMemo<ClusterSnapCtx>(
    () => ({
      snapLockedDepths,
      toggleClusterSnapDepth,
      organizeTimelineLayout: applyTimelineOrganize,
    }),
    [snapLockedDepths, toggleClusterSnapDepth, applyTimelineOrganize],
  );

  useEffect(() => {
    if (isLoading || !gameState) return;
    const hasSaved = decisionNodes.some((n) => {
      const p = decisionTimelinePositions[n.id];
      return p != null && Number.isFinite(p.x) && Number.isFinite(p.y);
    });
    if (hasSaved) return;
    if (autoScatterRanForKeyRef.current === structureKey) return;
    autoScatterRanForKeyRef.current = structureKey;
    const patch = computeScatterPositionPatch(decisionNodes, decisionTimelinePositions, turns);
    if (Object.keys(patch).length === 0) return;
    mergeDecisionTimelinePositions(patch);
  }, [
    isLoading,
    gameState,
    decisionNodes,
    structureKey,
    decisionTimelinePositions,
    mergeDecisionTimelinePositions,
    turns,
  ]);

  const activePlannerTurnSlotId = turns[currentTurnIndex]?.id;

  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = buildFlowGraph(
      decisionNodes,
      activeDecisionNodeId,
      activePlannerTurnSlotId,
      decisionTimelinePositions,
      turns,
      selectedGraphNodeId,
      curvedLinks ? 'curved' : 'straight',
      snapLockedDepths,
      relinkChildId,
      relinkParentId,
      reparentSourceId,
      reparentHoverParentId,
      relinkPickMode,
      forkParentHoverHighlightId,
    );
    setEdges(nextEdges);
    setNodes((curr) => {
      // XYFlow edges need RF-measured dims; rebuilding from topology must not drop them (see XYFlow troubleshooting).
      const prevById = new Map(curr.map((n) => [n.id, n]));
      const posById = new Map(curr.map((n) => [n.id, n.position]));
      return nextNodes.map((n) => {
        const prev = prevById.get(n.id);
        const draggingThis = draggingNodeId !== null && n.id === draggingNodeId;
        /** Cluster box is recomputed in buildFlowGraph from member footprints; do not reuse stale RF width/height. */
        if (n.type === 'decisionSlotCluster') {
          if (draggingThis) {
            return {
              ...n,
              position: posById.get(n.id) ?? n.position,
              ...(prev?.measured ? { measured: { ...prev.measured } } : {}),
              ...(prev?.width !== undefined ? { width: prev.width } : {}),
              ...(prev?.height !== undefined ? { height: prev.height } : {}),
              ...(prev?.initialWidth !== undefined ? { initialWidth: prev.initialWidth } : {}),
              ...(prev?.initialHeight !== undefined ? { initialHeight: prev.initialHeight } : {}),
              className: 'dtl-node-dragging',
            };
          }
          return {
            ...n,
            className: undefined,
          };
        }
        return {
          ...n,
          /** Use graph layout position when not dragging — otherwise Organize / persisted updates never apply visually. */
          position: draggingThis ? (posById.get(n.id) ?? n.position) : n.position,
          ...(prev?.measured ? { measured: { ...prev.measured } } : {}),
          ...(prev?.width !== undefined ? { width: prev.width } : {}),
          ...(prev?.height !== undefined ? { height: prev.height } : {}),
          ...(prev?.initialWidth !== undefined ? { initialWidth: prev.initialWidth } : {}),
          ...(prev?.initialHeight !== undefined ? { initialHeight: prev.initialHeight } : {}),
          className: draggingThis ? 'dtl-node-dragging' : undefined,
        };
      });
    });
  }, [
    decisionNodes,
    activeDecisionNodeId,
    activePlannerTurnSlotId,
    decisionTimelinePositions,
    draggingNodeId,
    turns,
    selectedGraphNodeId,
    curvedLinks,
    snapLockedDepths,
    relinkChildId,
    relinkParentId,
    reparentSourceId,
    reparentHoverParentId,
    relinkPickMode,
    forkParentHoverHighlightId,
    timelineGraphRefreshNonce,
    setNodes,
    setEdges,
  ]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: curvedLinks ? ('default' as const) : ('straight' as const),
      interactionWidth: 14,
      style: { strokeWidth: 1.1, stroke: '#5e6875' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: '#8c98a9',
      },
    }),
    [curvedLinks],
  );

  const onNodeDragStart = useCallback<OnNodeDrag<Node<DecisionFlowNodeData>>>(
    (_, node) => {
      setDraggingNodeId(node.id);
      if (node.type !== 'decisionSlotCluster') return;
      const depth = (node.data as DecisionSlotClusterData).depth;
      if (!snapLockedDepths.has(depth)) return;
      const memberIds = decisionNodes
        .filter(
          (n) =>
            n.timelineRole !== 'timeline_start' &&
            n.parentId != null &&
            decisionNodeDepthFromRoot(decisionNodes, n.id) === depth,
        )
        .map((n) => n.id);
      const memberStarts = new Map<string, { x: number; y: number }>();
      for (const id of memberIds) {
        const found = nodes.find((x) => x.id === id);
        if (found) memberStarts.set(id, { ...found.position });
      }
      clusterDragSessionRef.current = {
        clusterId: node.id,
        clusterStart: { ...node.position },
        memberIds,
        memberStarts,
      };
    },
    [decisionNodes, snapLockedDepths, nodes],
  );

  const onNodeDrag = useCallback<OnNodeDrag<Node<DecisionFlowNodeData>>>(
    (_, node) => {
      const s = clusterDragSessionRef.current;
      if (!s || node.id !== s.clusterId) return;
      const dx = node.position.x - s.clusterStart.x;
      const dy = node.position.y - s.clusterStart.y;
      setNodes((curr) =>
        curr.map((n) => {
          if (n.id === node.id) return n;
          if (s.memberStarts.has(n.id)) {
            const p0 = s.memberStarts.get(n.id)!;
            return { ...n, position: { x: p0.x + dx, y: p0.y + dy } };
          }
          return n;
        }),
      );
    },
    [setNodes],
  );

  const onNodeDragStop = useCallback<OnNodeDrag<Node<DecisionFlowNodeData>>>(
    (_event, node) => {
      setDraggingNodeId(null);
      if (node.type === 'decisionSlotCluster') {
        const s = clusterDragSessionRef.current;
        clusterDragSessionRef.current = null;
        if (s && node.id === s.clusterId) {
          const dx = node.position.x - s.clusterStart.x;
          const dy = node.position.y - s.clusterStart.y;
          for (const id of s.memberIds) {
            const p0 = s.memberStarts.get(id);
            if (p0) {
              setDecisionTimelineNodePosition(id, { x: p0.x + dx, y: p0.y + dy });
            }
          }
        }
        return;
      }
      setDecisionTimelineNodePosition(node.id, { x: node.position.x, y: node.position.y });
    },
    [setDecisionTimelineNodePosition],
  );

  useEffect(() => {
    if (!reparentSourceId && !relinkPickMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setReparentSourceId(null);
      setReparentHoverParentId(null);
      setRelinkPickMode(null);
      setRelinkChildId(null);
      setRelinkParentId(null);
      onSelectedNodeIdChange?.(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reparentSourceId, relinkPickMode, onSelectedNodeIdChange]);

  const onNodeMouseEnter = useCallback<NodeMouseHandler<Node<DecisionFlowNodeData>>>(
    (_, node) => {
      if (reparentSourceId) {
        if (eligibleParentIdSet.has(node.id)) setReparentHoverParentId(node.id);
        return;
      }
      if (relinkPickMode === 'parent' && relinkChildId && eligibleRelinkParentIdSet.has(node.id)) {
        setReparentHoverParentId(node.id);
      }
    },
    [
      reparentSourceId,
      relinkPickMode,
      relinkChildId,
      eligibleParentIdSet,
      eligibleRelinkParentIdSet,
    ],
  );

  const onNodeMouseLeave = useCallback<NodeMouseHandler<Node<DecisionFlowNodeData>>>(
    (_, node) => {
      setReparentHoverParentId((h) => (h === node.id ? null : h));
    },
    [],
  );

  const onNodeClick = useCallback<NodeMouseHandler<Node<DecisionFlowNodeData>>>(
    (_, node) => {
      if (node.type === 'decisionSlotCluster') return;

      if (relinkPickMode === 'child') {
        const model = decisionNodes.find((n) => n.id === node.id);
        if (!model || model.timelineRole === 'timeline_start') return;
        setRelinkChildId(node.id);
        setRelinkParentId(null);
        setRelinkPickMode(null);
        setReparentSourceId(node.id);
        setReparentHoverParentId(null);
        return;
      }

      if (relinkPickMode === 'parent') {
        if (!relinkChildId) return;
        if (!eligibleRelinkParentIdSet.has(node.id)) return;
        setRelinkParentId(node.id);
        setRelinkPickMode(null);
        return;
      }

      if (reparentSourceId) {
        if (node.id === reparentSourceId) {
          setReparentSourceId(null);
          setReparentHoverParentId(null);
          return;
        }
        if (!eligibleParentIdSet.has(node.id)) return;
        const movedBranchId = reparentSourceId;
        linkDecisionTimelineParent(movedBranchId, node.id);
        bumpTimelineGraphRefresh();
        pendingOrganizeAfterTopologyRef.current = true;
        setRelinkChildId(null);
        setRelinkParentId(null);
        setRelinkPickMode(null);
        setReparentSourceId(null);
        setReparentHoverParentId(null);
        return;
      }

      onSelectedNodeIdChange?.(node.id);
    },
    [
      relinkPickMode,
      decisionNodes,
      relinkChildId,
      eligibleRelinkParentIdSet,
      reparentSourceId,
      eligibleParentIdSet,
      linkDecisionTimelineParent,
      bumpTimelineGraphRefresh,
      onSelectedNodeIdChange,
    ],
  );

  const onPaneClick = useCallback(() => {
    setReparentSourceId(null);
    setReparentHoverParentId(null);
    setRelinkPickMode(null);
    setRelinkChildId(null);
    setRelinkParentId(null);
    onSelectedNodeIdChange?.(null);
  }, [onSelectedNodeIdChange]);

  const nodeTypes = useMemo(
    () => ({
      decisionStartCard: DecisionStartCard,
      decisionCard: DecisionBranchCard,
      decisionSlotCluster: DecisionSlotCluster,
    }),
    [],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading combat…</div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-slate-400">
        <p>No combat loaded. Open the planner and load combat JSON, then return here.</p>
      </div>
    );
  }

  const relinkPanelChildren = (
    <>
      <div className="nodrag nopan flex items-center justify-between gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Relink</span>
        <button
          type="button"
          className="nodrag nopan flex min-h-8 min-w-8 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-md border border-slate-600/55 bg-slate-900/95 p-0 text-slate-400 transition-colors hover:bg-slate-800"
          title={relinkPanelMinimized ? 'Expand relink panel' : 'Minimize relink panel'}
          aria-expanded={!relinkPanelMinimized}
          onClick={() => setRelinkPanelMinimized((v) => !v)}
        >
          {relinkPanelMinimized ? (
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          ) : (
            <Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>

      {relinkPanelMinimized ? (
        <p className="text-[8px] leading-snug text-slate-500">
          {relinkChildId || relinkParentId
            ? 'Branch / parent set — expand to edit or apply.'
            : 'Minimized — expand to relink.'}
        </p>
      ) : (
        <>
          <div>
            <p className="text-[8px] leading-snug text-slate-500">
              Toggle, then <span className="font-semibold text-slate-300">click a node</span>.{' '}
              <span className="font-semibold text-red-400">Red dashed</span> removes old link;{' '}
              <span className="font-semibold text-emerald-400">green dashed</span> is new parent.
            </p>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[7px] font-semibold uppercase tracking-wide text-slate-500">
              <span className="inline-flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-amber-400 ring-1 ring-amber-200/90" aria-hidden />
                Move
              </span>
              <span className="inline-flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-sky-400 ring-1 ring-sky-200/90" aria-hidden />
                Parent
              </span>
            </div>
          </div>

          {relinkPickMode ? (
            <p className="rounded-md border border-sky-500/40 bg-sky-950/40 px-1.5 py-1 text-[8px] font-medium text-sky-100/95">
              {relinkPickMode === 'child'
                ? 'Click a branch node (not ROOT).'
                : 'Click a valid parent (including ROOT).'}
            </p>
          ) : null}

          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Move branch</span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-pressed={relinkPickMode === 'child'}
                className={`nodrag nopan flex-1 rounded-lg border px-1.5 py-1.5 text-left text-[9px] font-semibold leading-tight transition-colors ${
                  relinkPickMode === 'child'
                    ? 'border-amber-400/70 bg-amber-950/70 text-amber-50 shadow-inner'
                    : 'border-slate-600 bg-slate-950 text-slate-200 hover:border-slate-500'
                }`}
                onClick={() => setRelinkPickMode((m) => (m === 'child' ? null : 'child'))}
              >
                {relinkPickMode === 'child' ? 'Click a node…' : 'Pick a node'}
              </button>
              <button
                type="button"
                title="Clear move branch"
                className={`nodrag nopan shrink-0 rounded-lg border px-1.5 py-1.5 text-[9px] font-semibold ${
                  relinkChildId
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    : 'cursor-not-allowed border-slate-700 text-slate-600'
                }`}
                disabled={!relinkChildId}
                onClick={() => {
                  setRelinkChildId(null);
                  setRelinkParentId(null);
                  setRelinkPickMode(null);
                  setReparentSourceId(null);
                  setReparentHoverParentId(null);
                }}
              >
                Clear
              </button>
            </div>
            <div
              className={`min-h-[2.35rem] rounded-lg border px-2 py-1.5 transition-colors ${
                relinkChildId
                  ? 'border-amber-400/75 bg-amber-950/50 text-amber-50 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.2)]'
                  : 'border-slate-700/60 bg-slate-950/80 text-slate-500'
              }`}
            >
              <p
                className="line-clamp-3 text-[9px] font-semibold leading-snug"
                title={formatRelinkNodePickLabel(relinkChildId, decisionNodes, turns)}
              >
                {formatRelinkNodePickLabel(relinkChildId, decisionNodes, turns)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">New parent</span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-pressed={relinkPickMode === 'parent'}
                disabled={!relinkChildId || eligibleRelinkParentIdSet.size === 0}
                className={`nodrag nopan flex-1 rounded-lg border px-1.5 py-1.5 text-left text-[9px] font-semibold leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  relinkPickMode === 'parent'
                    ? 'border-sky-400/70 bg-sky-950/70 text-sky-50 shadow-inner'
                    : 'border-slate-600 bg-slate-950 text-slate-200 hover:border-slate-500'
                }`}
                onClick={() => {
                  if (!relinkChildId || eligibleRelinkParentIdSet.size === 0) return;
                  setReparentHoverParentId(null);
                  setRelinkPickMode((m) => (m === 'parent' ? null : 'parent'));
                }}
              >
                {relinkPickMode === 'parent' ? 'Click a node…' : 'Pick a node'}
              </button>
              <button
                type="button"
                title="Clear new parent"
                className={`nodrag nopan shrink-0 rounded-lg border px-1.5 py-1.5 text-[9px] font-semibold ${
                  relinkParentId
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    : 'cursor-not-allowed border-slate-700 text-slate-600'
                }`}
                disabled={!relinkParentId}
                onClick={() => {
                  setRelinkParentId(null);
                  setRelinkPickMode(null);
                }}
              >
                Clear
              </button>
            </div>
            <div
              className={`min-h-[2.35rem] rounded-lg border px-2 py-1.5 transition-colors ${
                relinkParentId
                  ? 'border-sky-400/70 bg-sky-950/45 text-sky-50 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.2)]'
                  : 'border-slate-700/60 bg-slate-950/80 text-slate-500'
              }`}
            >
              <p
                className="line-clamp-3 text-[9px] font-semibold leading-snug"
                title={formatRelinkNodePickLabel(relinkParentId, decisionNodes, turns)}
              >
                {formatRelinkNodePickLabel(relinkParentId, decisionNodes, turns)}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="nodrag nopan rounded-lg border border-sky-500/55 bg-sky-950/70 px-2 py-1.5 text-[11px] font-semibold text-sky-50 transition-colors hover:bg-sky-900/80 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={
              !relinkChildId ||
              !relinkParentId ||
              relinkParentId === relinkOldParentId ||
              !eligibleRelinkParentIdSet.has(relinkParentId)
            }
            onClick={applyRelinkFromPanel}
          >
            Apply parent link
          </button>
        </>
      )}
    </>
  );

  const organizePanelChildren = (
    <>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Layout</span>
      <div
        className="flex rounded-lg border border-slate-600/80 bg-slate-950/90 p-0.5"
        role="group"
        aria-label="Organize tree direction"
      >
        <button
          type="button"
          aria-pressed={organizeOrientation === 'vertical'}
          className={`nodrag nopan flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors ${
            organizeOrientation === 'vertical'
              ? 'bg-teal-600/90 text-white shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
          title="Organize: tree grows downward (root at top)"
          onClick={() => setOrganizeOrientation('vertical')}
        >
          Vertical
        </button>
        <button
          type="button"
          aria-pressed={organizeOrientation === 'horizontal'}
          className={`nodrag nopan flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors ${
            organizeOrientation === 'horizontal'
              ? 'bg-teal-600/90 text-white shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
          title="Organize: tree grows to the right (root at left)"
          onClick={() => setOrganizeOrientation('horizontal')}
        >
          Horizontal
        </button>
      </div>
      <button
        type="button"
        className="nodrag nopan w-full rounded-lg border border-emerald-500/45 bg-emerald-950/55 px-2 py-5.5 text-xl font-bold text-emerald-100 transition-colors hover:bg-emerald-900/55"
        title={`Reset to compact ${organizeOrientation} tree (saved with the game)`}
        onClick={applyTimelineOrganize}
      >
        Organize
      </button>
    </>
  );

  return (
    <TimelineInteractContext.Provider value={interactValue}>
      <ClusterSnapContext.Provider value={clusterSnapContextValue}>
      <div className="decision-timeline-flow relative h-full min-h-[400px] w-full rounded-xl border border-slate-700/50 bg-slate-900/40">
        <style>
          {`
            .decision-timeline-flow .react-flow__node:not(.dtl-node-dragging) {
              transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            .decision-timeline-flow .react-flow__node.dtl-node-dragging {
              transition: none !important;
            }
            /* Tailwind / preflight can clip edge layers; keep viewport + SVG visible (XYFlow + Tailwind). */
            .decision-timeline-flow .react-flow__viewport,
            .decision-timeline-flow .react-flow__renderer {
              overflow: visible !important;
            }
            .decision-timeline-flow .react-flow__edges svg {
              overflow: visible !important;
            }
          `}
        </style>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          selectNodesOnDrag={false}
          panOnDrag
          panOnScroll={false}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          minZoom={0.08}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={null}
          connectionRadius={0}
          elevateEdgesOnSelect
          elevateNodesOnSelect
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Background color="#334155" gap={20} size={1} />
          {relinkPanelMount
            ? createPortal(
                <div className="pointer-events-auto flex h-full min-h-0 w-full flex-col gap-1.5 overflow-y-auto rounded-xl border border-slate-600 bg-slate-900/98 p-2 shadow-xl [scrollbar-width:thin]">
                  {relinkPanelChildren}
                </div>,
                relinkPanelMount,
              )
            : (
              <Panel
                position="top-right"
                className="pointer-events-auto z-[6] m-0 flex w-[min(12.5rem,calc(100vw-1rem))] flex-col gap-1.5 !mt-2 !mr-2 !rounded-xl !border !border-slate-600 !bg-slate-900/98 !p-2 !shadow-xl"
              >
                {relinkPanelChildren}
              </Panel>
            )}
          <Panel
            position="bottom-left"
            className="pointer-events-auto z-[6] m-0 flex max-w-[min(18rem,calc(100vw-2rem))] flex-col gap-1.5 !mb-[5.75rem] !ml-2 !rounded-xl !border !border-slate-600 !bg-slate-900/96 !p-2 !shadow-lg"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Links</span>
            <div
              className="flex rounded-lg border border-slate-600/80 bg-slate-950/90 p-0.5"
              role="group"
              aria-label="Edge link style"
            >
              <button
                type="button"
                aria-pressed={curvedLinks}
                className={`nodrag nopan flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                  curvedLinks
                    ? 'bg-sky-600/90 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                onClick={() => setCurvedLinks(true)}
              >
                Curved
              </button>
              <button
                type="button"
                aria-pressed={!curvedLinks}
                className={`nodrag nopan flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                  !curvedLinks
                    ? 'bg-sky-600/90 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                onClick={() => setCurvedLinks(false)}
              >
                Straight
              </button>
            </div>
            <button
              type="button"
              className="nodrag nopan w-full rounded-lg border border-violet-500/45 bg-violet-950/55 px-2 py-1.5 text-[10px] font-semibold text-violet-100 transition-colors hover:bg-violet-900/55"
              title="Spread same-depth rows and re-center (saved with the game)"
              onClick={applyTimelineScatter}
            >
              Scatter layout
            </button>
          </Panel>
          {organizePanelMount
            ? createPortal(
                <div className="pointer-events-auto flex w-full flex-col gap-1.5 rounded-xl border border-slate-600 bg-slate-900/96 p-2 shadow-lg">
                  {organizePanelChildren}
                </div>,
                organizePanelMount,
              )
            : (
              <Panel
                position="bottom-right"
                className="pointer-events-auto z-[6] m-0 flex max-w-[min(18rem,calc(100vw-2rem))] flex-col gap-1.5 !mb-[10rem] !mr-2 !rounded-xl !border !border-slate-600 !bg-slate-900/96 !p-2 !shadow-lg"
              >
                {organizePanelChildren}
              </Panel>
            )}
          <Controls
            position="bottom-left"
            showZoom
            showFitView
            showInteractive
            className="!m-2 !flex !flex-row !flex-wrap !gap-0.5 !rounded-xl !border !border-slate-600 !bg-slate-900/95 !p-2 !shadow-lg [&_button]:!rounded-lg [&_button]:!border-slate-600 [&_button]:!bg-slate-800 [&_button]:!fill-slate-200 [&_button]:hover:!bg-slate-700"
          />
          <MiniMap
            className="!m-2 !rounded-lg !border !border-slate-600 !bg-slate-950/90"
            nodeStrokeWidth={2}
            pannable
            zoomable
            maskColor="rgb(15 23 42 / 0.65)"
            nodeColor={(n) => {
              if (n.type === 'decisionSlotCluster') return '#0f172a';
              const data = n.data as DecisionCardData | undefined;
              const node = data?.decisionNode;
              if (!node) return '#475569';
              if (data.isOrphan) return '#e11d48';
              return minimapHexForDecisionNodePreview(
                node,
                !!data?.isPinned,
                !!(data?.isSlotActive && !data?.isPinned),
              );
            }}
          />
          <Panel
            position="bottom-center"
            className="pointer-events-none m-0 max-w-[min(40rem,92vw)] rounded-lg border border-slate-700/40 bg-slate-950/85 px-2 py-1 text-center text-[10px] text-slate-400 shadow-md backdrop-blur-sm"
          >
            Click a checkpoint for a <span className="font-semibold text-violet-300">violet</span> selection (Branch parents from it). Curved or straight: <span className="font-semibold text-slate-300">Links</span> bottom-left. <span className="font-semibold text-slate-300">Relink</span>{' '}
            {relinkPanelMount ? 'right sidebar' : 'top-right'} — dashed preview edges. <span className="font-semibold text-amber-200">Unlink</span> → orphan (rose). <span className="font-semibold text-slate-300">Organize</span>{' '}
            {organizePanelMount ? 'right sidebar' : 'bottom-right'} reflows layout.
          </Panel>
          <FitViewOnStructureChange structureKey={structureKey} />
        </ReactFlow>
      </div>
      </ClusterSnapContext.Provider>
    </TimelineInteractContext.Provider>
  );
}

export default function DecisionTimelineFlow(props: DecisionTimelineFlowProps) {
  return (
    <ReactFlowProvider>
      <DecisionTimelineCanvas {...props} />
    </ReactFlowProvider>
  );
}
