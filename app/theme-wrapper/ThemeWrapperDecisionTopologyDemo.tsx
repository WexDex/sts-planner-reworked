"use client";

import { useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DECISION_TIMELINE_START_CARD_W } from "@/app/utils/decisionTreeHelpers";

type DemoBranchVariant = "graph" | "pin" | "neutral";

function DemoStartNode(_props: NodeProps) {
  return (
    <div
      className="rounded-xl border-2 border-amber-400/95 bg-slate-950 px-2 py-2.5 text-center shadow-md shadow-black/40"
      style={{ width: DECISION_TIMELINE_START_CARD_W }}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2.5 !border-amber-300 !bg-amber-400"
      />
      <p className="text-[13px] font-black uppercase tracking-[0.2em] text-amber-300">START</p>
      <p className="mt-1 truncate font-mono text-[9px] font-semibold tabular-nums text-amber-200/80">
        t-root · demo
      </p>
    </div>
  );
}

function DemoClusterNode({ data }: NodeProps) {
  const label = typeof data.label === "string" ? data.label : "";
  return (
    <div className="pointer-events-none flex h-full w-full flex-col rounded-2xl border-2 border-slate-600/45 bg-slate-900/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-black/25">
      <span className="pt-2 text-center text-[9px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

function DemoBranchNode({ data }: NodeProps) {
  const title = typeof data.title === "string" ? data.title : "";
  const variant: DemoBranchVariant =
    data.variant === "graph" || data.variant === "pin" || data.variant === "neutral"
      ? data.variant
      : "neutral";
  const ring =
    variant === "graph"
      ? "border-slate-600 ring-2 ring-violet-400/85 ring-offset-2 ring-offset-[#020617]"
      : variant === "pin"
        ? "border-cyan-500/50 shadow-[0_0_22px_-8px_rgba(34,211,238,0.55)]"
        : "border-slate-600";

  return (
    <div className={`relative w-[220px] rounded-xl border-2 bg-slate-950 px-2.5 py-2 ${ring}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2.5 !border-slate-500 !bg-slate-600"
      />
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Checkpoint</p>
      <p className="mt-0.5 text-[13px] font-semibold leading-snug text-slate-100">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {variant === "graph" ? (
          <span className="rounded border border-violet-500/45 bg-violet-950/85 px-1.5 py-0.5 text-[8px] font-semibold text-violet-100">
            Violet ring — graph selection
          </span>
        ) : null}
        {variant === "pin" ? (
          <span className="rounded border border-cyan-500/45 bg-cyan-950/75 px-1.5 py-0.5 text-[8px] font-semibold text-cyan-100">
            Cyan glow — active planner pin
          </span>
        ) : null}
        {variant === "neutral" ? (
          <span className="text-[8px] font-medium text-slate-500">Sibling fork — default chrome</span>
        ) : null}
      </div>
    </div>
  );
}
function FitViewOnReady() {
  const rf = useReactFlow();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      rf.fitView({ padding: 0.18, maxZoom: 1.2, minZoom: 0.45 });
    });
    return () => cancelAnimationFrame(id);
  }, [rf]);
  return null;
}

const DEMO_NODES: Node[] = [
  {
    id: "cluster",
    type: "demoCluster",
    position: { x: 0, y: 124 },
    style: { width: 680, height: 248 },
    zIndex: -2,
    draggable: false,
    selectable: false,
    data: { label: "Same planner row · branch cluster (slot depth)" },
  },
  {
    id: "start",
    type: "demoStart",
    position: { x: 272, y: 8 },
    draggable: false,
    selectable: false,
    data: {},
  },
  {
    id: "branch-graph",
    type: "demoBranch",
    position: { x: 16, y: 164 },
    draggable: false,
    selectable: false,
    data: { title: "T4 · Before elites", variant: "graph" },
  },
  {
    id: "branch-pin",
    type: "demoBranch",
    position: { x: 236, y: 164 },
    draggable: false,
    selectable: false,
    data: { title: "T5 · Split jaw worm", variant: "pin" },
  },
  {
    id: "branch-neutral",
    type: "demoBranch",
    position: { x: 448, y: 164 },
    draggable: false,
    selectable: false,
    data: { title: "T5 · Alt line", variant: "neutral" },
  },
];

const DEMO_EDGES: Edge[] = [
  {
    id: "e-s-g",
    source: "start",
    target: "branch-graph",
    type: "smoothstep",
    style: { stroke: "#64748b", strokeWidth: 2 },
  },
  {
    id: "e-s-p",
    source: "start",
    target: "branch-pin",
    type: "smoothstep",
    style: { stroke: "#64748b", strokeWidth: 2 },
  },
  {
    id: "e-s-n",
    source: "start",
    target: "branch-neutral",
    type: "smoothstep",
    style: { stroke: "#64748b", strokeWidth: 2 },
  },
];

export function ThemeWrapperDecisionTopologyDemo() {
  const nodeTypes = useMemo(
    () => ({
      demoStart: DemoStartNode,
      demoBranch: DemoBranchNode,
      demoCluster: DemoClusterNode,
    }),
    [],
  );

  return (
    <div className="h-[min(380px,55vh)] min-h-[280px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <ReactFlowProvider>
        <ReactFlow
          nodes={DEMO_NODES}
          edges={DEMO_EDGES}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnScroll
          zoomOnScroll
          minZoom={0.35}
          maxZoom={1.6}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { stroke: "#64748b", strokeWidth: 2 },
          }}
        >
          <Background color="#475569" gap={20} size={1} />
          <Controls position="bottom-right" showInteractive={false} />
          <FitViewOnReady />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
