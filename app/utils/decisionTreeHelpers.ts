import type { CombatData, CombatTurnPhase, DecisionNode, Turn } from '@/app/types/gameTypes';
import { cloneGameData, combatSnapshotsEqual } from '@/app/utils/gameHelpers';
import { plannerCombatPhaseCrumbAbbrev } from '@/app/utils/decisionTimelinePhaseUi';
import { getNewLogEntriesForDecisionNode } from '@/app/utils/decisionNodePlays';
import { collectEnemyIntentLinesForPlannerSlot } from '@/app/utils/decisionTimelineIntentSummaries';

/** Horizontal footprint for timeline **branch / turn** cards — keep in sync with `DecisionTimelineFlow` card chrome. */
export const DECISION_TIMELINE_BRANCH_CARD_W = 400;

/**
 * Minimum branch-card height for RF + layout when estimation returns less (fallback).
 * Most real cards exceed this once combat intel + intents + logs are counted — see {@link estimateDecisionTimelineBranchFootprint}.
 */
export const DECISION_TIMELINE_BRANCH_CARD_H = 520;

/** START (ROOT) stub width — minimal structural node in `DecisionTimelineFlow`. */
export const DECISION_TIMELINE_START_CARD_W = 136;

/** START stub height — keep in sync with `DecisionTimelineFlow` footprint. */
export const DECISION_TIMELINE_START_CARD_H = 62;

export type DecisionTreePackOrientation = 'vertical' | 'horizontal';

/** Matches `BRANCH_INTENT_PREVIEW_MAX` in `DecisionTimelineFlow` (collapsed intent list cap). */
const TIMELINE_INTENT_PREVIEW_MAX = 4;

function maxBranchFootprintHeight(nodes: DecisionNode[], turns: Turn[]): number {
  let m = DECISION_TIMELINE_BRANCH_CARD_H;
  for (const n of nodes) {
    if (n.timelineRole === 'timeline_start') continue;
    m = Math.max(m, estimateDecisionTimelineBranchFootprint(nodes, n, turns).h);
  }
  return m;
}

/**
 * RF / pack spacing footprint for a timeline card — branch height scales with snapshot (intents, logs, nickname).
 * Update slice constants when `DecisionBranchCard` / `DtlBranchCombatIntel` chrome changes.
 */
export function estimateDecisionTimelineBranchFootprint(
  nodes: DecisionNode[],
  n: DecisionNode,
  turns: Turn[],
): { w: number; h: number } {
  if (n.timelineRole === 'timeline_start') {
    return { w: DECISION_TIMELINE_START_CARD_W, h: DECISION_TIMELINE_START_CARD_H };
  }

  const w = DECISION_TIMELINE_BRANCH_CARD_W;
  const slotId = effectivePlannerTurnSlotId(nodes, n, turns);
  const parent = n.parentId ? nodes.find((x) => x.id === n.parentId) ?? null : null;
  const peersSame = decisionNodesPeersSameTurnDepth(nodes, n.id);
  const branchOrdinal = Math.max(1, peersSame.findIndex((x) => x.id === n.id) + 1);
  const autoSlug = formatDecisionBreadcrumbSegment(slotId, branchOrdinal);
  const customLabelRaw = n.label.trim();
  const showNickname = customLabelRaw.length > 0 && customLabelRaw !== autoSlug;

  const intentLines = collectEnemyIntentLinesForPlannerSlot(n.snapshot, slotId);
  const logEntries = getNewLogEntriesForDecisionNode(n, parent);

  /** Floating icon toolbar sits above the card; reserve space so packed layouts don’t vertically collide. */
  const FLOAT_TOOLBAR_CLEARANCE = 56;
  let h = FLOAT_TOOLBAR_CLEARANCE;

  h += 22; // outer vertical padding (aligned with card pt/pb)
  h += 34; // top MOVE grab rail on branch checkpoint cards
  h += 34; // bottom MOVE grab rail
  h += 42; // phase strip + slug / uid row
  if (showNickname) h += 52;
  h += 36; // `TurnPhaseTripleStrip`

  // `DtlBranchCombatIntel`: stats grid, buff/enemy panels (enemy list max-h-40), collapsed hand/played rows, piles row
  h += 400;

  const intentHeader = 68;
  if (intentLines.length === 0) {
    h += intentHeader + 28;
  } else if (intentLines.length <= TIMELINE_INTENT_PREVIEW_MAX) {
    h += intentHeader + intentLines.length * 54 + 10;
  } else {
    h += intentHeader + 176 + 32; // max-h ~11rem scroll + expand control
  }

  const logHeader = 56;
  if (logEntries.length === 0) {
    h += logHeader + 36;
  } else {
    const rowApprox = 22;
    h += logHeader + Math.min(176, Math.max(52, logEntries.length * rowApprox));
  }

  h += 48; // “Set Active” + breathing room

  if (isDecisionTimelineOrphan(nodes, n)) h += 26;

  h += 28; // slack for borders, line wraps, and RF rounding

  return { w, h: Math.max(DECISION_TIMELINE_BRANCH_CARD_H, Math.ceil(h)) };
}

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

/** Packed tree positions when no saved timeline coords exist — {@link layoutDecisionTreePacked} (default horizontal). */
export function layoutDecisionTreeNodes(
  nodes: DecisionNode[],
  turns: Turn[],
  orientation: DecisionTreePackOrientation = 'horizontal',
): Map<string, { x: number; y: number }> {
  return layoutDecisionTreePacked(nodes, turns, orientation);
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
function layoutDecisionTreePackedVertical(
  nodes: DecisionNode[],
  turns: Turn[],
): Map<string, { x: number; y: number }> {
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
  const LEVEL_Y = maxBranchFootprintHeight(nodes, turns) + 48;

  function nodeWidth(n: DecisionNode): number {
    return estimateDecisionTimelineBranchFootprint(nodes, n, turns).w;
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
function layoutDecisionTreePackedHorizontal(
  nodes: DecisionNode[],
  turns: Turn[],
): Map<string, { x: number; y: number }> {
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

  let maxBranchW = DECISION_TIMELINE_BRANCH_CARD_W;
  for (const n of nodes) {
    if (n.timelineRole !== 'timeline_start') {
      maxBranchW = Math.max(maxBranchW, estimateDecisionTimelineBranchFootprint(nodes, n, turns).w);
    }
  }
  /** Advance along X between depth columns — clear widest branch footprint + gutter. */
  const LEVEL_X = maxBranchW + 48;
  const GAP_Y = 120;

  function nodeHeight(n: DecisionNode): number {
    return estimateDecisionTimelineBranchFootprint(nodes, n, turns).h;
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
  turns: Turn[],
  orientation: DecisionTreePackOrientation = 'horizontal',
): Map<string, { x: number; y: number }> {
  if (orientation === 'horizontal') {
    return layoutDecisionTreePackedHorizontal(nodes, turns);
  }
  return layoutDecisionTreePackedVertical(nodes, turns);
}

/** Planner-turn id chip: `T1`, `T2`, or `T3.2` when this is the 2nd alternate at that row. */
export function formatDecisionBreadcrumbSegment(plannerTurnSlotId: number, siblingOrdinal: number): string {
  const ord = Math.max(1, Math.floor(siblingOrdinal));
  if (ord <= 1) return `T${plannerTurnSlotId}`;
  return `T${plannerTurnSlotId}.${ord}`;
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

/** Timeline anchor: explicit START role, else the sole `parentId === null` node when present. */
export function decisionTimelineStartRootId(nodes: DecisionNode[]): string | null {
  const tagged = nodes.find((n) => n.timelineRole === 'timeline_start');
  if (tagged) return tagged.id;
  const root = nodes.find((n) => n.parentId === null);
  return root?.id ?? null;
}

/** True when at least one node lists START as its parent (path turns stay hidden until this exists). */
export function decisionTimelineStartHasConnectedCheckpoint(nodes: DecisionNode[]): boolean {
  const sid = decisionTimelineStartRootId(nodes);
  if (!sid) return false;
  return nodes.some((n) => n.parentId === sid);
}

/** Whether ROOT→`pinnedNodeId` walks up to the decision START root (excludes orphans / other roots). */
export function pinnedDecisionLineageAnchoredAtStart(nodes: DecisionNode[], pinnedNodeId: string): boolean {
  const sid = decisionTimelineStartRootId(nodes);
  if (!sid) return false;
  const path = getDecisionPathFromRoot(nodes, pinnedNodeId);
  return path.length > 0 && path[0]!.id === sid;
}

/**
 * Preorder from START (START first, then descendants): siblings ordered by {@link DecisionNode.createdAt}
 * then id — stable tree summary order.
 */
export function decisionNodesSubtreePreorderFromStart(nodes: DecisionNode[]): DecisionNode[] {
  const startId = decisionTimelineStartRootId(nodes);
  if (!startId) return [];
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const byParent = new Map<string | null, DecisionNode[]>();
  for (const n of nodes) {
    const k = n.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(n);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }
  const out: DecisionNode[] = [];
  function walk(id: string) {
    const n = byId.get(id);
    if (!n) return;
    out.push(n);
    for (const c of byParent.get(id) ?? []) walk(c.id);
  }
  walk(startId);
  return out;
}

/**
 * Checkpoints on ROOT→`pinnedNodeId` (excluding START) — exactly what the user has explicitly pinned as
 * **Active** on Decision Timeline cards. Does not walk single-child continuations below the pin.
 *
 * When `pinnedNodeId` is null or missing from `nodes`, returns an empty set.
 */
export function getPinnedAncestorCheckpointIds(nodes: DecisionNode[], pinnedNodeId: string | null): Set<string> {
  const ids = new Set<string>();
  if (!pinnedNodeId) return ids;
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  if (!byId.has(pinnedNodeId)) return ids;

  for (const step of getDecisionPathFromRoot(nodes, pinnedNodeId)) {
    if (step.timelineRole === 'timeline_start') continue;
    ids.add(step.id);
  }

  return ids;
}

/**
 * From `pinnedNodeId`, repeatedly follow the sole child until there are zero or ≥2 children.
 * Used for planner lineage ({@link getActiveLineageBranchIds}) and UI hints (sky **Set Active** button).
 * Ordered by {@link DecisionNode.createdAt} among siblings when building `byParent`.
 */
export function getUniqueChildLadderDescendantIds(
  nodes: DecisionNode[],
  pinnedNodeId: string | null,
): Set<string> {
  const ids = new Set<string>();
  if (!pinnedNodeId) return ids;
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  if (!byId.has(pinnedNodeId)) return ids;

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
    ids.add(tip.id);
  }

  return ids;
}

/**
 * Full lineage for planner rows / spine: {@link getPinnedAncestorCheckpointIds} ∪
 * {@link getUniqueChildLadderDescendantIds}. Decision Timeline cards use ancestors only for **Active** pinning.
 *
 * When `pinnedNodeId` is null or missing from `nodes`, returns an empty set.
 */
export function getActiveLineageBranchIds(nodes: DecisionNode[], pinnedNodeId: string | null): Set<string> {
  const out = getPinnedAncestorCheckpointIds(nodes, pinnedNodeId);
  for (const id of getUniqueChildLadderDescendantIds(nodes, pinnedNodeId)) {
    out.add(id);
  }
  return out;
}

/**
 * Planner rows (`Turn`) on the **explicit active chain**: checkpoints on ROOT→`pinnedNodeId`
 * ({@link getPinnedAncestorCheckpointIds} only — no unique-child ladder below the pin).
 * Matches which Decision Timeline cards show **Active** vs **Set Active** along that ancestry.
 *
 * Returns `null` when there is no pin, the pin is unknown, START has no child checkpoint, the pin is not
 * anchored under START (e.g. orphan), or lineage resolves to zero planner slots.
 * Callers with a Decision Timeline should treat `null` as “no visible lineage rows” (not “fall back to all turns”).
 */
export function turnsVisibleForActiveDecisionLineage(
  nodes: DecisionNode[],
  pinnedNodeId: string | null,
  turns: Turn[],
): Turn[] | null {
  if (!pinnedNodeId || nodes.length === 0) return null;
  if (!nodes.some((n) => n.id === pinnedNodeId)) return null;

  if (!decisionTimelineStartHasConnectedCheckpoint(nodes)) return null;
  if (!pinnedDecisionLineageAnchoredAtStart(nodes, pinnedNodeId)) return null;

  const lineageIds = getPinnedAncestorCheckpointIds(nodes, pinnedNodeId);
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
 * Per planner slot, the checkpoint on ROOT→`pinnedNodeId` that should drive labels/editing on the left Timeline
 * ({@link getPinnedAncestorCheckpointIds}): deepest **ancestor-path** node per {@link effectivePlannerTurnSlotId}.
 * Matches {@link turnsVisibleForActiveDecisionLineage} (no ladder below the pin).
 */
export function getActiveLineageCanonicalNodeIdBySlot(
  nodes: DecisionNode[],
  pinnedNodeId: string | null,
  turns: Turn[],
): Map<number, string> {
  if (!pinnedNodeId || nodes.length === 0) return new Map();
  if (!nodes.some((n) => n.id === pinnedNodeId)) return new Map();

  if (!decisionTimelineStartHasConnectedCheckpoint(nodes)) return new Map();
  if (!pinnedDecisionLineageAnchoredAtStart(nodes, pinnedNodeId)) return new Map();

  const lineageIds = getPinnedAncestorCheckpointIds(nodes, pinnedNodeId);
  if (lineageIds.size === 0) return new Map();

  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const best = new Map<number, { depth: number; nodeId: string }>();

  for (const nid of lineageIds) {
    const node = byId.get(nid);
    if (!node || node.timelineRole === 'timeline_start' || node.parentId === null) continue;

    const slot = effectivePlannerTurnSlotId(nodes, node, turns);
    const depth = decisionNodeDepthFromRoot(nodes, nid);
    const prev = best.get(slot);
    if (!prev || depth > prev.depth) {
      best.set(slot, { depth, nodeId: nid });
      continue;
    }
    if (depth === prev.depth) {
      const prevNode = byId.get(prev.nodeId);
      if (prevNode && node.createdAt.localeCompare(prevNode.createdAt) > 0) {
        best.set(slot, { depth, nodeId: nid });
      }
    }
  }

  return new Map([...best.entries()].map(([slot, v]) => [slot, v.nodeId]));
}

/**
 * Walk from the tree root (START): follow the only child while unique; at a fork, prefer
 * {@link DecisionNode.timelineRole} `turn_checkpoint` then earliest {@link DecisionNode.createdAt}.
 * Repeat until a leaf — typical imported spine + deterministic “main chain”.
 *
 * Used to pin the active decision node id so {@link getActiveLineageBranchIds} still spans planner rows
 * on load (ancestors ∪ unique-child ladder below that leaf).
 */
export function getForcedMainTimelineLeafFromStart(nodes: DecisionNode[]): string | null {
  const root = nodes.find((n) => n.parentId === null);
  if (!root) return null;

  const byParent = new Map<string | null, DecisionNode[]>();
  for (const n of nodes) {
    const k = n.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(n);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }

  let tip = root;
  for (;;) {
    const kids = byParent.get(tip.id) ?? [];
    if (kids.length === 0) return tip.id;
    let next: DecisionNode;
    if (kids.length === 1) {
      next = kids[0]!;
    } else {
      const checkpoints = kids.filter((k) => k.timelineRole === 'turn_checkpoint');
      next = checkpoints[0] ?? kids[0]!;
    }
    tip = next;
  }
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
 * After linking a branch under a parent: pin active on {@link linkedNodeId}, then walk down while that node has
 * exactly one child (siblings ordered like {@link getForcedMainTimelineLeafFromStart}). Returns the deepest id.
 */
export function pinActiveAlongUniqueChildChainFromNode(
  nodes: DecisionNode[],
  linkedNodeId: string,
): string {
  const byParent = new Map<string | null, DecisionNode[]>();
  for (const n of nodes) {
    const k = n.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(n);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }
  let cur = linkedNodeId;
  for (;;) {
    const kids = byParent.get(cur) ?? [];
    if (kids.length !== 1) break;
    cur = kids[0]!.id;
  }
  return cur;
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

/** Breadcrumb segments and display string, e.g. `START → T1 → T2 → T3.2 · Main`. */
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
  return { segments, display: segments.join(' → ') };
}

/** Stable nickname `T1` / `T3.2` from topology (no combat-phase suffix). */
export function computeDecisionCheckpointNickname(
  nodes: DecisionNode[],
  nodeId: string,
  turns: Turn[],
): string | null {
  const n = nodes.find((x) => x.id === nodeId);
  if (!n || n.timelineRole === 'timeline_start' || n.parentId === null) return null;
  const slotId = effectivePlannerTurnSlotId(nodes, n, turns);
  const peers = decisionNodesPeersSameTurnDepth(nodes, nodeId);
  const idx = peers.findIndex((s) => s.id === nodeId);
  const ord = idx >= 0 ? idx + 1 : 1;
  return formatDecisionBreadcrumbSegment(slotId, ord);
}

/**
 * Replace legacy default labels (`Turn 3`, empty) with {@link computeDecisionCheckpointNickname}.
 * Custom user nicknames are left unchanged.
 */
export function migrateDecisionCheckpointLabelsToTurnSlugs(
  nodes: DecisionNode[],
  turns: Turn[],
): DecisionNode[] {
  return nodes.map((n) => {
    if (n.timelineRole === 'timeline_start') return n;
    const slug = computeDecisionCheckpointNickname(nodes, n.id, turns);
    if (!slug) return n;
    const raw = (n.label ?? '').trim();
    if (raw === '' || /^Turn\s+\d+\s*$/i.test(raw)) return { ...n, label: slug };
    return n;
  });
}

/** Default nickname for a new branch checkpoint: `T3`, `T3.2`, … */
export function defaultForkDecisionLabel(
  nodes: DecisionNode[],
  newNode: DecisionNode,
  turns: Turn[],
): string {
  return computeDecisionCheckpointNickname(nodes, newNode.id, turns) ?? 'Branch';
}

/**
 * Live planner `gameState` is only authoritative for {@link currentTurnIndex}'s row. When the active timeline pin
 * maps to a different planner slot, its checkpoint must keep that slot's row snapshot — not live combat from
 * another row (otherwise merges duplicate hands / logs across turns).
 */
export function activeDecisionCheckpointSnapshotFromPlanner(
  activeNode: DecisionNode,
  allNodes: DecisionNode[],
  turnsScratch: Turn[],
  currentTurnIndex: number,
  gameState: CombatData,
  turnPhase: CombatTurnPhase,
): Pick<DecisionNode, 'snapshot' | 'turnPhase'> {
  const activeSlotId = effectivePlannerTurnSlotId(allNodes, activeNode, turnsScratch);
  const currentRowTurnId = turnsScratch[currentTurnIndex]?.id;
  if (currentRowTurnId !== undefined && currentRowTurnId !== null && activeSlotId === currentRowTurnId) {
    return { snapshot: cloneGameData(gameState), turnPhase };
  }
  const row = turnsScratch.find((t) => t.id === activeSlotId);
  if (row) {
    return { snapshot: cloneGameData(row.state), turnPhase };
  }
  return { snapshot: cloneGameData(gameState), turnPhase };
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

function turnRowsSnapshotsAlign(a: Turn[], b: Turn[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.id !== b[i]!.id) return false;
    if (!combatSnapshotsEqual(a[i]!.state, b[i]!.state)) return false;
  }
  return true;
}

function decisionNodesApplyPayloadEqual(a: DecisionNode[], b: DecisionNode[]): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(a.map((n) => [n.id, n] as const));
  for (const bn of b) {
    const an = byId.get(bn.id);
    if (!an) return false;
    if (an.parentId !== bn.parentId) return false;
    if (an.turnPhase !== bn.turnPhase) return false;
    if (an.plannerTurnSlotId !== bn.plannerTurnSlotId) return false;
    if ((an.label ?? '').trim() !== (bn.label ?? '').trim()) return false;
    if (!combatSnapshotsEqual(an.snapshot, bn.snapshot)) return false;
  }
  return true;
}

/**
 * Mirrors {@link applyDecisionBranchToPlanner} patch step (flush live combat into active node + slot)
 * before merging path snapshots into planner rows.
 */
export function computeApplyDecisionBranchToPlannerProjection(
  decisionNodes: DecisionNode[],
  activeDecisionNodeId: string | null,
  gameState: CombatData,
  turns: Turn[],
  currentTurnIndex: number,
  turnPhase: CombatTurnPhase,
  targetNodeId: string,
): { nodesForPath: DecisionNode[]; mergedTurns: Turn[]; targetNode: DecisionNode } | null {
  const targetNodeBare = decisionNodes.find((n) => n.id === targetNodeId);
  if (!targetNodeBare) return null;

  let nodesForPath = decisionNodes;
  let turnsScratch = turns;

  if (activeDecisionNodeId) {
    turnsScratch = turns.map((t, i) =>
      i === currentTurnIndex ? { ...t, state: cloneGameData(gameState) } : t,
    );
    nodesForPath = normalizeDecisionNodePlannerSlots(
      decisionNodes.map((n) =>
        n.id === activeDecisionNodeId
          ? {
              ...n,
              ...activeDecisionCheckpointSnapshotFromPlanner(
                n,
                decisionNodes,
                turnsScratch,
                currentTurnIndex,
                gameState,
                turnPhase,
              ),
            }
          : n,
      ),
      turns,
    );
  }

  const mergedTurns = buildTurnStatesFromBranchPath(nodesForPath, targetNodeId, turnsScratch);
  const targetNode = nodesForPath.find((n) => n.id === targetNodeId);
  if (!targetNode) return null;
  return { nodesForPath, mergedTurns, targetNode };
}

/**
 * True when calling apply for `targetNodeId` would be a no-op (planner rows, decision payloads, live combat,
 * phase, and active pin already match the merged branch).
 */
export function isApplyDecisionBranchToPlannerSynced(
  decisionNodes: DecisionNode[],
  activeDecisionNodeId: string | null,
  gameState: CombatData | null,
  turns: Turn[],
  currentTurnIndex: number,
  turnPhase: CombatTurnPhase,
  targetNodeId: string,
): boolean {
  if (!gameState) return true;
  const proj = computeApplyDecisionBranchToPlannerProjection(
    decisionNodes,
    activeDecisionNodeId,
    gameState,
    turns,
    currentTurnIndex,
    turnPhase,
    targetNodeId,
  );
  if (!proj) return true;
  const { nodesForPath, mergedTurns, targetNode } = proj;

  if (activeDecisionNodeId !== targetNodeId) return false;
  if (!combatSnapshotsEqual(gameState, targetNode.snapshot)) return false;
  if (turnPhase !== targetNode.turnPhase) return false;
  if (!turnRowsSnapshotsAlign(turns, mergedTurns)) return false;
  if (!decisionNodesApplyPayloadEqual(decisionNodes, nodesForPath)) return false;
  return true;
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
