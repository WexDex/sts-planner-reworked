'use client';

import { useCallback, useEffect, useMemo, memo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Pencil, Trash2 } from 'lucide-react';
import { useGameManager } from '@/app/context/GameContext';
import type { DecisionNode as DecisionNodeModel } from '@/app/types/gameTypes';
import { layoutDecisionTreeNodes } from '@/app/utils/decisionTreeHelpers';
import { deriveDecisionNodeSummary } from '@/app/utils/deriveDecisionNodeSummary';

type DecisionCardData = {
  decisionNode: DecisionNodeModel;
  isActive: boolean;
};

/** Fit viewport when the tree structure (node ids) changes — not on every activate. */
function FitViewOnStructureChange({ structureKey }: { structureKey: string }) {
  const { fitView } = useReactFlow();
  const isFirst = useRef(true);
  useEffect(() => {
    const t = window.setTimeout(() => {
      fitView({ padding: 0.2, duration: isFirst.current ? 0 : 220 });
      isFirst.current = false;
    }, 40);
    return () => window.clearTimeout(t);
  }, [structureKey, fitView]);
  return null;
}

const DecisionCardNode = memo(function DecisionCardNode({
  data,
}: {
  id: string;
  data: DecisionCardData;
}) {
  const { jumpToDecisionNode, deleteDecisionBranch, updateDecisionNodeLabel } = useGameManager();
  const { decisionNode, isActive } = data;
  const summary = deriveDecisionNodeSummary(decisionNode.snapshot, decisionNode.plannerTurnSlotId);
  const isRoot = decisionNode.parentId === null;

  const onRename = useCallback(() => {
    const next = window.prompt('Branch label', decisionNode.label);
    if (next === null) return;
    updateDecisionNodeLabel(decisionNode.id, next);
  }, [decisionNode.id, decisionNode.label, updateDecisionNodeLabel]);

  const btnCls =
    'nodrag nopan cursor-pointer'; /* let React Flow pan/drag the node, not start on buttons */

  return (
    <div
      className={`min-w-[200px] max-w-[220px] rounded-xl border-2 px-2.5 py-2 shadow-lg transition-colors ${
        isActive
          ? 'border-cyan-400/70 bg-slate-900/95 shadow-cyan-900/30 ring-1 ring-cyan-400/25'
          : 'border-slate-600/60 bg-slate-950/90 ring-1 ring-slate-700/30'
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-1">
        <p className="line-clamp-2 text-[11px] font-bold leading-tight text-slate-100">{decisionNode.label}</p>
        <div className="flex shrink-0 gap-0.5">
          <button
            type="button"
            title="Rename"
            className={`rounded-md border border-slate-600/50 bg-slate-900 p-1 text-slate-300 hover:bg-slate-800 ${btnCls}`}
            onClick={(e) => {
              e.stopPropagation();
              onRename();
            }}
          >
            <Pencil className="h-3 w-3" strokeWidth={2} aria-hidden />
          </button>
          {!isRoot ? (
            <button
              type="button"
              title="Delete branch"
              className={`rounded-md border border-rose-500/40 bg-rose-950/50 p-1 text-rose-200 hover:bg-rose-900/60 ${btnCls}`}
              onClick={(e) => {
                e.stopPropagation();
                deleteDecisionBranch(decisionNode.id);
              }}
            >
              <Trash2 className="h-3 w-3" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      <p className="mb-1.5 text-[9px] uppercase tracking-wide text-slate-500">
        Turn slot {summary.turnSlot} · {decisionNode.turnPhase}
      </p>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300/95">
        <span>HP {summary.hp}</span>
        <span>Blk {summary.block}</span>
        <span>En {summary.energy}</span>
        <span>Hand {summary.handSize}</span>
      </div>
      <p
        className="mt-1.5 line-clamp-2 border-t border-slate-700/50 pt-1 text-[9px] text-slate-500"
        title={summary.lastLogTitle}
      >
        {summary.lastLogTitle}
      </p>
      <button
        type="button"
        className={`mt-2 w-full rounded-lg border border-cyan-500/45 bg-cyan-950/50 py-1.5 text-[10px] font-semibold text-cyan-100 hover:bg-cyan-900/55 ${btnCls}`}
        onClick={(e) => {
          e.stopPropagation();
          jumpToDecisionNode(decisionNode.id);
        }}
      >
        Activate
      </button>
    </div>
  );
});

function buildFlowGraph(
  decisionNodes: DecisionNodeModel[],
  activeNodeId: string | null,
): { nodes: Node<DecisionCardData>[]; edges: Edge[] } {
  const pos = layoutDecisionTreeNodes(decisionNodes);
  const nodes: Node<DecisionCardData>[] = decisionNodes.map((n) => {
    const p = pos.get(n.id) ?? { x: 0, y: 0 };
    return {
      id: n.id,
      type: 'decisionCard',
      position: { x: p.x, y: p.y },
      data: { decisionNode: n, isActive: n.id === activeNodeId },
    };
  });
  const edges: Edge[] = decisionNodes
    .filter((n) => n.parentId != null)
    .map((n) => ({
      id: `${n.parentId}-${n.id}`,
      source: n.parentId!,
      target: n.id,
      type: 'smoothstep',
    }));
  return { nodes, edges };
}

function structureKeyFromNodes(decisionNodes: DecisionNodeModel[]) {
  return `${decisionNodes.length}:${[...decisionNodes]
    .map((n) => n.id)
    .sort()
    .join(',')}`;
}

function DecisionTimelineCanvas() {
  const { decisionNodes, activeDecisionNodeId, gameState, isLoading } = useGameManager();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DecisionCardData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const structureKey = useMemo(() => structureKeyFromNodes(decisionNodes), [decisionNodes]);

  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = buildFlowGraph(decisionNodes, activeDecisionNodeId);
    setEdges(nextEdges);
    setNodes((curr) => {
      const posById = new Map(curr.map((n) => [n.id, n.position]));
      return nextNodes.map((n) => ({
        ...n,
        position: posById.get(n.id) ?? n.position,
      }));
    });
  }, [decisionNodes, activeDecisionNodeId, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({ decisionCard: DecisionCardNode }), []);

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

  return (
    <div className="relative h-full min-h-[400px] w-full rounded-xl border border-slate-700/50 bg-slate-900/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
        defaultEdgeOptions={{ type: 'smoothstep' }}
        deleteKeyCode={null}
        connectionRadius={0}
        elevateNodesOnSelect
      >
        <Background color="#334155" gap={20} size={1} />
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
          nodeColor={(n) => (n.data && (n.data as DecisionCardData).isActive ? '#22d3ee' : '#475569')}
        />
        <Panel position="bottom-center" className="pointer-events-none m-0 max-w-[min(36rem,92vw)] rounded-lg border border-slate-700/40 bg-slate-950/85 px-2 py-1 text-center text-[10px] text-slate-400 shadow-md backdrop-blur-sm">
          Drag nodes to rearrange · wheel zooms · drag background to pan · use controls for zoom/extent · minimap pans/zooms
        </Panel>
        <FitViewOnStructureChange structureKey={structureKey} />
      </ReactFlow>
    </div>
  );
}

export default function DecisionTimelineFlow() {
  return (
    <ReactFlowProvider>
      <DecisionTimelineCanvas />
    </ReactFlowProvider>
  );
}
