import type { DecisionNode } from '@/app/types/gameTypes';

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

/** Simple top-to-bottom layout for React Flow (centered per depth). */
export function layoutDecisionTreeNodes(nodes: DecisionNode[]): Map<string, { x: number; y: number }> {
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

  const LEVEL_Y = 130;
  const NODE_X_SPACING = 240;

  const levels = new Map<number, DecisionNode[]>();
  const queue: { node: DecisionNode; depth: number }[] = [{ node: root, depth: 0 }];
  while (queue.length) {
    const { node, depth } = queue.shift()!;
    if (!levels.has(depth)) levels.set(depth, []);
    levels.get(depth)!.push(node);
    for (const c of byParent.get(node.id) ?? []) {
      queue.push({ node: c, depth: depth + 1 });
    }
  }

  const depths = [...levels.keys()].sort((a, b) => a - b);
  for (const depth of depths) {
    const lev = levels.get(depth)!;
    const width = lev.length * NODE_X_SPACING;
    const startX = -width / 2 + NODE_X_SPACING / 2;
    lev.forEach((n, i) => {
      positions.set(n.id, { x: startX + i * NODE_X_SPACING, y: depth * LEVEL_Y });
    });
  }

  return positions;
}
