import type { DecisionNode, Turn } from '@/app/types/gameTypes';
import { cloneGameData } from '@/app/utils/gameHelpers';
import { plannerCombatPhaseCrumbAbbrev } from '@/app/utils/decisionTimelinePhaseUi';

/** Horizontal footprint for timeline **branch / turn** cards — keep in sync with `DecisionTimelineFlow` card chrome. */
export const DECISION_TIMELINE_BRANCH_CARD_W = 400;

/** Branch card height in the timeline flow — keep in sync with `DecisionTimelineFlow` footprint; drives packed row spacing. */
export const DECISION_TIMELINE_BRANCH_CARD_H = 400;

/** START node width in the decision timeline flow. */
export const DECISION_TIMELINE_START_CARD_W = 156;

/** START node height — keep in sync with `DecisionTimelineFlow` footprint. */
export const DECISION_TIMELINE_START_CARD_H = 118;

export type DecisionTreePackOrientation = 'vertical' | 'horizontal';

/** All node ids in the subtree rooted at `rootId` (including `rootId`). */
export function collectSubtreeIds(nodes: DecisionNode[], rootId: string): Set<string> {
  const byParent = new Map<string | null, string[]>();
  for (const n of nodes) {
    const k = n.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(n.id);
  }
  const out = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    out.add(id);
    for (const c of byParent.get(id) ?? []) stack.push(c);
  }
  return out;
}

/**
 * Branch checkpoint whose `parentId` is missing from `nodes` (e.g. parent was deleted).
 * START is never treated as an orphan.
 */
export function isDecisionTimelineOrphan(nodes: DecisionNode[], n: DecisionNode): boolean {
  if (n.timelineRole === 'timeline_start') return false;
  if (n.parentId == null) return true;
  return !nodes.some((x) => x.id === n.parentId);
}

/** Simple top-to-bottom layout (centered per depth), wide spacing — prefer {@link layoutDecisionTreePacked}. */
export function layoutDecisionTreeNodes(nodes: DecisionNode[]): Map<string, { x: number; y: number }> {
  return layoutDecisionTreePacked(nodes, 'vertical');
}

function centerPackedPositions(positions: Map<string, { x: number; y: number }>): Map<string, { x: number; y: number }> {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of positions.values()) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  for (const id of [...positions.keys()]) {
    const p = positions.get(id)!;
    positions.set(id, { x: p.x - midX, y: p.y - midY });
  }
  return positions;
}

/**
 * Top→bottom tree: depth walks **Y**, sibling subtrees pack along **X**.
 */
function layoutDecisionTreePackedVertical(nodes: DecisionNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const byParent = new Map<string | null, DecisionNode[]>();
  for (const n of nodes) {
    const k = n.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(n);
  }
  for (const [, arr] of byParent) {
    arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const root = nodes.find((n) => n.parentId === null);
  if (!root) return positions;

  const GAP_X = 120;
  const LEVEL_Y = DECISION_TIMELINE_BRANCH_CARD_H + 48;

  function nodeWidth(n: DecisionNode): number {
    return n.timelineRole === 'timeline_start' ? DECISION_TIMELINE_START_CARD_W : DECISION_TIMELINE_BRANCH_CARD_W;
  }

  let leafCursor = 0;

  function subtree(node: DecisionNode, depth: number): { xl: number; xr: number } {
    const kids = byParent.get(node.id) ?? [];
    if (kids.length === 0) {
      const w = nodeWidth(node);
      const xc = leafCursor + w / 2;
      positions.set(node.id, { x: xc, y: depth * LEVEL_Y });
      leafCursor += w + GAP_X;
      return { xl: xc - w / 2, xr: xc + w / 2 };
    }

    let xl = Infinity;
    let xr = -Infinity;
    for (const k of kids) {
      const span = subtree(k, depth + 1);
      xl = Math.min(xl, span.xl);
      xr = Math.max(xr, span.xr);
    }

    const xc = (xl + xr) / 2;
    positions.set(node.id, { x: xc, y: depth * LEVEL_Y });

    return { xl, xr };
  }

  subtree(root, 0);
  return centerPackedPositions(positions);
}

/**
 * Left→right tree: depth walks **X**, sibling subtrees pack along **Y**.
 */
function layoutDecisionTreePackedHorizontal(nodes: DecisionNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const byParent = new Map<string | null, DecisionNode[]>();
  for (const n of nodes) {
    const k = n.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(n);
  }
  for (const [, arr] of byParent) {
    arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const root = nodes.find((n) => n.parentId === null);
  if (!root) return positions;

  /** Advance along X between depths — must clear branch card width. */
  const LEVEL_X = DECISION_TIMELINE_BRANCH_CARD_W + 48;
  const GAP_Y = 120;

  function nodeHeight(n: DecisionNode): number {
    return n.timelineRole === 'timeline_start' ? DECISION_TIMELINE_START_CARD_H : DECISION_TIMELINE_BRANCH_CARD_H;
  }

  let leafCursor = 0;

  function subtree(node: DecisionNode, depth: number): { yt: number; yb: number } {
    const kids = byParent.get(node.id) ?? [];
    if (kids.length === 0) {
      const h = nodeHeight(node);
      const yc = leafCursor + h / 2;
      positions.set(node.id, { x: depth * LEVEL_X, y: yc });
      leafCursor += h + GAP_Y;
      return { yt: yc - h / 2, yb: yc + h / 2 };
    }

    let yt = Infinity;
    let yb = -Infinity;
    for (const k of kids) {
      const span = subtree(k, depth + 1);
      yt = Math.min(yt, span.yt);
      yb = Math.max(yb, span.yb);
    }

    const yc = (yt + yb) / 2;
    positions.set(node.id, { x: depth * LEVEL_X, y: yc });

    return { yt, yb };
  }

  subtree(root, 0);
  return centerPackedPositions(positions);
}

/**
 * Leaf-sequenced layered tree: parent centered over descendant span.
 * **vertical** — root at top, children below; **horizontal** — root at left, children to the right.
 */
export function layoutDecisionTreePacked(
  nodes: DecisionNode[],
  orientation: DecisionTreePackOrientation = 'vertical',
): Map<string, { x: number; y: number }> {
  if (orientation === 'horizontal') {
    return layoutDecisionTreePackedHorizontal(nodes);
  }
  return layoutDecisionTreePackedVertical(nodes);
}

export function formatDecisionBreadcrumbSegment(plannerTurnSlotId: number, siblingOrdinal: number): string {
  return `T${plannerTurnSlotId}·${siblingOrdinal}`;
}

/** Ordered path from root to `nodeId` (inclusive). Empty if unknown. */
export function getDecisionPathFromRoot(nodes: DecisionNode[], nodeId: string): DecisionNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const upwards: DecisionNode[] = [];
  let cur = byId.get(nodeId);
  while (cur) {
    upwards.push(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  upwards.reverse();
  return upwards;
}

/**
 * Checkpoint ids on the **loaded lineage** path used to pin branches as Active (disabled) vs Set Active.
 * START itself is pinned separately (see Decision timeline flow: `Boolean(activeNodeId)` for START cards).
 *
 * When `pinnedNodeId` is null or missing from `nodes`, returns an empty set.
 *
 * 1. **Ancestors**: every checkpoint on {@link getDecisionPathFromRoot} from root to `pinnedNodeId`,
 *    excluding nodes with {@link DecisionNode.timelineRole} `timeline_start`.
 * 2. **Unique-child ladder downward**: from `pinnedNodeId`, repeatedly take the sole child until the parent
 *    has zero or ≥2 children among `nodes`; children ordered by {@link DecisionNode.createdAt} before picks.
 */
export function getActiveLineageBranchIds(nodes: DecisionNode[], pinnedNodeId: string | null): Set<string> {
  const activeLineageBranchIds = new Set<string>();
  if (!pinnedNodeId) return activeLineageBranchIds;
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  if (!byId.has(pinnedNodeId)) return activeLineageBranchIds;

  for (const step of getDecisionPathFromRoot(nodes, pinnedNodeId)) {
    if (step.timelineRole === 'timeline_start') continue;
    activeLineageBranchIds.add(step.id);
  }

  const byParent = new Map<string | null, DecisionNode[]>();
  for (const n of nodes) {
    const k = n.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(n);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  let tip = byId.get(pinnedNodeId);
  while (tip) {
    const kids = byParent.get(tip.id) ?? [];
    if (kids.length !== 1) break;
    tip = kids[0]!;
    activeLineageBranchIds.add(tip.id);
  }

  return activeLineageBranchIds;
}

/**
 * Planner rows (`Turn`) that belong to the pinned Decision Timeline lineage — same nodes as
 * {@link getActiveLineageBranchIds} (root→pin checkpoints + unique-child ladder).
 *
 * Returns `null` when there is no pin, the pin is unknown, or lineage resolves empty (show full `turns` in UI).
 */
export function turnsVisibleForActiveDecisionLineage(
  nodes: DecisionNode[],
  pinnedNodeId: string | null,
  turns: Turn[],
): Turn[] | null {
  if (!pinnedNodeId || nodes.length === 0) return null;
  if (!nodes.some((n) => n.id === pinnedNodeId)) return null;

  const lineageIds = getActiveLineageBranchIds(nodes, pinnedNodeId);
  if (lineageIds.size === 0) return null;

  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const slotSet = new Set<number>();
  for (const nid of lineageIds) {
    const node = byId.get(nid);
    if (!node) continue;
    slotSet.add(effectivePlannerTurnSlotId(nodes, node, turns));
  }

  const visible = turns.filter((t) => slotSet.has(t.id));
  return visible.length > 0 ? visible : null;
}

/**
 * Depth of `nodeId` under the tree root (`parentId === null`), counting edges.
 * START is 0; its direct children are 1, etc.
 */
export function decisionNodeDepthFromRoot(nodes: DecisionNode[], nodeId: string): number {
  const path = getDecisionPathFromRoot(nodes, nodeId);
  return Math.max(0, path.length - 1);
}

/**
 * Planner turn row id ({@link Turn.id}) inferred from topology: branch depth maps to `turns` order.
 * Depth 1 → `turns[0]`, depth 2 → `turns[1]`, etc.; deeper chains clamp to the last row.
 */
export function effectivePlannerTurnSlotId(
  nodes: DecisionNode[],
  node: DecisionNode,
  turns: Turn[],
): number {
  if (node.timelineRole === 'timeline_start' || node.parentId === null) {
    return turns[0]?.id ?? 1;
  }
  const depth = decisionNodeDepthFromRoot(nodes, node.id);
  const rowIndex = depth - 1;
  if (turns.length === 0) {
    return Math.max(1, depth);
  }
  const clamped = Math.min(Math.max(0, rowIndex), turns.length - 1);
  return turns[clamped]!.id;
}

/**
 * Alternate checkpoints for the same **turn generation** as `nodeId`: all non-START nodes with the same
 * depth below the root (`decisionNodeDepthFromRoot`). Used for Branch X/Y labeling and breadcrumbs.
 */
export function decisionNodesPeersSameTurnDepth(nodes: DecisionNode[], nodeId: string): DecisionNode[] {
  const target = nodes.find((n) => n.id === nodeId);
  if (!target || target.timelineRole === 'timeline_start' || target.parentId === null) {
    return [];
  }
  const depth = decisionNodeDepthFromRoot(nodes, nodeId);
  return nodes
    .filter(
      (n) =>
        n.timelineRole !== 'timeline_start' &&
        n.parentId !== null &&
        decisionNodeDepthFromRoot(nodes, n.id) === depth,
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

/** Recompute cached {@link DecisionNode.plannerTurnSlotId} for every node from parent links + `turns`. */
export function normalizeDecisionNodePlannerSlots(nodes: DecisionNode[], turns: Turn[]): DecisionNode[] {
  if (nodes.length === 0) return nodes;
  return nodes.map((n) => ({
    ...n,
    plannerTurnSlotId: effectivePlannerTurnSlotId(nodes, n, turns),
  }));
}

/**
 * Total outbound edges from Decision Timeline checkpoint(s) tied to this planner {@link Turn.id}
 * (all non-START nodes whose effective slot is `plannerSlotId`, each child counted once).
 */
export function outgoingDecisionBranchCountForPlannerSlot(
  nodes: DecisionNode[],
  plannerSlotId: number,
  turns: Turn[],
): number {
  if (nodes.length === 0) return 0;
  const childCountByParent = new Map<string, number>();
  for (const c of nodes) {
    if (c.parentId == null) continue;
    childCountByParent.set(c.parentId, (childCountByParent.get(c.parentId) ?? 0) + 1);
  }
  let total = 0;
  for (const n of nodes) {
    if (n.timelineRole === 'timeline_start' || n.parentId === null) continue;
    if (effectivePlannerTurnSlotId(nodes, n, turns) !== plannerSlotId) continue;
    total += childCountByParent.get(n.id) ?? 0;
  }
  return total;
}

/** Pins canonical planner-slot snapshots along the ROOT→pinned path for timeline edge layering. */
export type DecisionTimelineSpineMeta = {
  pinnedPath: DecisionNode[];
  pathIds: ReadonlySet<string>;
  /** Directed spine segment keys `"childId|parentId"` on the active branch. */
  spineEdgeKeys: ReadonlySet<string>;
  canonicalNodeIdBySlot: ReadonlyMap<number, string>;
};

/**
 * Path from START to {@link pinnedDecisionNodeId} defines the MAIN spine (`spineEdgeKeys`).
 * Deepest occurrence of each planner slot wins for `canonicalNodeIdBySlot`.
 */
export function getDecisionTimelineSpineMeta(
  nodes: DecisionNode[],
  pinnedDecisionNodeId: string | null,
  turns: Turn[],
): DecisionTimelineSpineMeta {
  const root = nodes.find((n) => n.parentId === null);
  if (!root) {
    return {
      pinnedPath: [],
      pathIds: new Set(),
      spineEdgeKeys: new Set(),
      canonicalNodeIdBySlot: new Map(),
    };
  }

  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const pinnedPath =
    pinnedDecisionNodeId && byId.has(pinnedDecisionNodeId)
      ? getDecisionPathFromRoot(nodes, pinnedDecisionNodeId)
      : [root];

  const pathIds = new Set(pinnedPath.map((p) => p.id));

  const spineEdgeKeys = new Set<string>();
  for (let i = 1; i < pinnedPath.length; i++) {
    const child = pinnedPath[i]!;
    const parent = pinnedPath[i - 1]!;
    if (child.parentId !== parent.id) continue;
    spineEdgeKeys.add(`${child.id}|${parent.id}`);
  }

  const canonicalNodeIdBySlot = new Map<number, string>();
  for (const step of pinnedPath) {
    canonicalNodeIdBySlot.set(effectivePlannerTurnSlotId(nodes, step, turns), step.id);
  }

  return { pinnedPath, pathIds, spineEdgeKeys, canonicalNodeIdBySlot };
}

/** Breadcrumb segments and display string `"T1·1 › T2·1"`. */
export function getDecisionNodeBreadcrumb(
  nodes: DecisionNode[],
  nodeId: string,
  turns: Turn[],
): { segments: string[]; display: string } {
  const path = getDecisionPathFromRoot(nodes, nodeId);
  const segments: string[] = [];
  let i = 0;
  for (const step of path) {
    if (step.timelineRole === 'timeline_start') {
      segments.push('START');
      i++;
      continue;
    }
    const peers = decisionNodesPeersSameTurnDepth(nodes, step.id);
    const ord = Math.max(
      1,
      peers.length > 0 ? peers.findIndex((s) => s.id === step.id) + 1 : i + 1,
    );
    const crumb = plannerCombatPhaseCrumbAbbrev(step.turnPhase);
    const slotId = effectivePlannerTurnSlotId(nodes, step, turns);
    const base = formatDecisionBreadcrumbSegment(slotId, ord || i + 1);
    const phaseTag =
      step.timelineRole === 'turn_checkpoint' ? ` · ${crumb}` : '';
    segments.push(`${base}${phaseTag}`);
    i++;
  }
  return { segments, display: segments.join(' › ') };
}

/** Default label tail for a new fork: e.g. `T3·2`. */
export function defaultForkDecisionLabel(
  nodes: DecisionNode[],
  newNode: DecisionNode,
  turns: Turn[],
): string {
  const { segments } = getDecisionNodeBreadcrumb(nodes, newNode.id, turns);
  return segments[segments.length - 1] ?? 'Branch';
}

/**
 * Merge each planner slot’s state along `root … target` — deepest node per depth-derived slot wins.
 * Returns cloned turn rows for `setTurns`.
 */
export function buildTurnStatesFromBranchPath(nodes: DecisionNode[], targetNodeId: string, turns: Turn[]): Turn[] {
  const path = getDecisionPathFromRoot(nodes, targetNodeId);
  if (path.length === 0) return turns.map((t) => ({ ...t, state: cloneGameData(t.state) }));

  const bestBySlot = new Map<number, DecisionNode>();
  for (let i = 0; i < path.length; i++) {
    const n = path[i];
    const slot = effectivePlannerTurnSlotId(nodes, n, turns);
    bestBySlot.set(slot, n);
  }

  return turns.map((t) => {
    const chosen = bestBySlot.get(t.id);
    if (!chosen) return { ...t, state: cloneGameData(t.state) };
    return { ...t, state: cloneGameData(chosen.snapshot) };
  });
}

/** Allowed new parents when relinking node `nodeId` (cannot parent to own subtree → avoids cycles). */
export function eligibleDecisionReparentParents(nodes: DecisionNode[], nodeId: string): DecisionNode[] {
  const moving = nodes.find((n) => n.id === nodeId);
  if (!moving || moving.timelineRole === 'timeline_start') return [];

  const forbidden = collectSubtreeIds(nodes, nodeId);
  return nodes.filter((c) => !forbidden.has(c.id));
}

/** Reparent preserves a single-root tree anchored at START. */
export function isValidDecisionReparent(
  nodes: DecisionNode[],
  nodeId: string,
  newParentId: string,
): boolean {
  if (nodeId === newParentId) return false;
  const moving = nodes.find((n) => n.id === nodeId);
  if (!moving || moving.timelineRole === 'timeline_start') return false;
  if (!nodes.some((n) => n.id === newParentId)) return false;
  const sub = collectSubtreeIds(nodes, nodeId);
  return !sub.has(newParentId);
}
