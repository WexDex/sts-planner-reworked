"use client";

import { useEffect, useMemo, useState, useCallback, memo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeProps,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { computeLayout, getCardFieldDisplay, blobBorderRadius, CLUSTER_FIELDS } from "./clusterAlgorithm";
import type { ClusterResult, AppearanceConfig, NodeShape } from "./clusterTypes";

// ─── Node data types ──────────────────────────────────────────────────────────

type ClusterBgData = {
  clusterId: number;
  label: string;
  color: string;
  bgOpacity: number;
  showBorder: boolean;
  borderWidth: number;
  showLabel: boolean;
  labelSize: number;
  labelColor: string;
  cardCount: number;
  isSelected: boolean;
  onHeaderClick: (id: number) => void;
};

type CardDotData = {
  cardId: string;
  color: string;
  size: number;
  shape: NodeShape;
  borderWidth: number;
  opacity: number;
  showLabel: boolean;
};

// ─── Cluster blob node ────────────────────────────────────────────────────────

const ClusterBgNode = memo(function ClusterBgNode({ data }: NodeProps) {
  const d = data as ClusterBgData;
  const bgAlpha = Math.round((d.bgOpacity / 100) * 255).toString(16).padStart(2, "0");
  const blobRadius = blobBorderRadius(d.clusterId);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        pointerEvents: "none",
      }}
    >
      {/* Blob background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: d.color + bgAlpha,
          border: d.showBorder ? `${d.borderWidth}px solid ${d.color}88` : "none",
          borderRadius: blobRadius,
          transition: "border-color 0.15s",
          boxShadow: d.isSelected ? `0 0 0 2px ${d.color}99, 0 0 24px 4px ${d.color}44` : undefined,
        }}
      />

      {/* Clickable header */}
      {d.showLabel && (
        <button
          onClick={e => {
            e.stopPropagation();
            d.onHeaderClick(d.clusterId);
          }}
          style={{
            position: "absolute",
            top: 6,
            left: 10,
            pointerEvents: "auto",
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: "2px 6px",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          className="hover:bg-white/10 transition-colors"
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: d.color,
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: d.labelSize,
              color: d.isSelected ? d.color : d.labelColor,
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {d.label}
          </span>
          <span
            style={{
              fontSize: d.labelSize - 2,
              fontWeight: 400,
              opacity: 0.55,
              color: d.labelColor,
              userSelect: "none",
            }}
          >
            ({d.cardCount})
          </span>
        </button>
      )}
    </div>
  );
});

// ─── Card dot node ────────────────────────────────────────────────────────────

const CardDotNode = memo(function CardDotNode({ data }: NodeProps) {
  const d = data as CardDotData;
  const shapeStyle: React.CSSProperties =
    d.shape === "diamond"
      ? { transform: "rotate(45deg)", borderRadius: 3 }
      : d.shape === "circle"
      ? { borderRadius: "50%" }
      : { borderRadius: 3 };
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: d.color,
        opacity: d.opacity / 100,
        border: d.borderWidth > 0 ? `${d.borderWidth}px solid ${d.color}cc` : "none",
        cursor: "default",
        ...shapeStyle,
      }}
    >
      {d.showLabel && (
        <span
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 8,
            color: "#94a3b8",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {d.cardId}
        </span>
      )}
    </div>
  );
});

const nodeTypes = { clusterBg: ClusterBgNode, cardDot: CardDotNode };

// ─── Tooltip ──────────────────────────────────────────────────────────────────

type TooltipState = { x: number; y: number; cardId: string } | null;

function CardTooltip({
  tooltip,
  allCards,
  appearance,
  fields,
}: {
  tooltip: TooltipState;
  allCards: Record<string, unknown>;
  appearance: AppearanceConfig;
  fields: string[];
}) {
  if (!tooltip) return null;
  const card = allCards[tooltip.cardId] as Record<string, unknown> | undefined;
  if (!card) return null;

  const tooltipFields = appearance.tooltipFields.length > 0
    ? appearance.tooltipFields
    : ["type", "rarity", "characters"];

  const displayFields = CLUSTER_FIELDS.filter(f => tooltipFields.includes(f.key));
  const activeFields  = CLUSTER_FIELDS.filter(f => fields.includes(f.key));

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: tooltip.x + 14,
        top: tooltip.y - 8,
        zIndex: 9999,
        maxWidth: appearance.tooltipMaxWidth,
        pointerEvents: "none",
      }}
      className="rounded-xl border border-slate-700/80 bg-slate-950/95 px-3 py-2.5 shadow-2xl shadow-black/60 backdrop-blur-sm"
    >
      <p className="mb-1.5 text-xs font-bold text-slate-100 leading-tight">{tooltip.cardId}</p>
      {displayFields.map(f => {
        const val = getCardFieldDisplay(card, f.key);
        const isActive = activeFields.some(a => a.key === f.key);
        return (
          <div key={f.key} className="flex items-center gap-1.5 py-0.5">
            <span className={`text-[10px] ${isActive ? "text-violet-400 font-semibold" : "text-slate-500"}`}>
              {f.label}
            </span>
            <span className={`text-[10px] ${isActive ? "text-violet-200" : "text-slate-300"}`}>{val}</span>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

// ─── Flow inner ───────────────────────────────────────────────────────────────

type Props = {
  clusterResults: ClusterResult[];
  allCards: Record<string, unknown>;
  appearance: AppearanceConfig;
  fields: string[];
  selectedClusterId: number | null;
  onClusterClick: (id: number) => void;
};

function ClusterFlowInner({
  clusterResults,
  allCards,
  appearance,
  fields,
  selectedClusterId,
  onClusterClick,
}: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges] = useEdgesState([]);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // Keep a stable ref so node data doesn't need a new reference on every render
  const onClusterClickRef = useRef(onClusterClick);
  onClusterClickRef.current = onClusterClick;
  const stableOnHeaderClick = useCallback((id: number) => onClusterClickRef.current(id), []);

  const layoutClusters = useMemo(
    () => computeLayout(clusterResults, appearance),
    [clusterResults, appearance],
  );

  useEffect(() => {
    const next: Node[] = [];

    for (const cl of layoutClusters) {
      next.push({
        id: `bg-${cl.id}`,
        type: "clusterBg",
        position: { x: cl.bgX, y: cl.bgY },
        style: { width: cl.bgW, height: cl.bgH },
        zIndex: 0,
        draggable: false,
        selectable: false,
        data: {
          clusterId: cl.id,
          label: cl.label,
          color: cl.color,
          bgOpacity: appearance.clusterBgOpacity,
          showBorder: appearance.showClusterBorder,
          borderWidth: appearance.clusterBorderWidth,
          showLabel: appearance.showClusterLabel,
          labelSize: appearance.clusterLabelSize,
          labelColor: appearance.clusterLabelColor,
          cardCount: cl.cards.length,
          isSelected: cl.id === selectedClusterId,
          onHeaderClick: stableOnHeaderClick,
        } satisfies ClusterBgData,
      });

      for (const { cardId, x, y } of cl.cards) {
        next.push({
          id: `card-${cardId}`,
          type: "cardDot",
          position: { x, y },
          style: { width: appearance.nodeSize, height: appearance.nodeSize },
          zIndex: 10,
          draggable: false,
          selectable: false,
          data: {
            cardId,
            color: cl.color,
            size: appearance.nodeSize,
            shape: appearance.nodeShape,
            borderWidth: appearance.nodeBorderWidth,
            opacity: appearance.nodeOpacity,
            showLabel: appearance.showNodeLabel,
          } satisfies CardDotData,
        });
      }
    }

    setNodes(next);
  }, [layoutClusters, appearance, selectedClusterId, stableOnHeaderClick, setNodes]);

  const handleNodeMouseEnter: NodeMouseHandler = useCallback((event, node) => {
    if (node.type === "cardDot") {
      setTooltip({ x: mousePos.current.x, y: mousePos.current.y, cardId: (node.data as CardDotData).cardId });
    }
  }, []);

  const handleNodeMouseLeave = useCallback(() => setTooltip(null), []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
  }, []);

  return (
    <div className="h-full w-full" onMouseMove={handleMouseMove}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        minZoom={0.05}
        maxZoom={4}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        style={{ background: appearance.canvasBg }}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={32} size={1} />
        <Controls className="!bg-slate-900 !border-slate-700" />
        <MiniMap
          nodeColor={n => {
            const d = n.data as { color?: string };
            return d.color ?? "#6366f1";
          }}
          maskColor="rgba(2,6,23,0.7)"
          className="!bg-slate-900/80 !border-slate-700"
        />
      </ReactFlow>
      <CardTooltip tooltip={tooltip} allCards={allCards} appearance={appearance} fields={fields} />
    </div>
  );
}

export default function CardClusterFlow(props: Props) {
  return (
    <ReactFlowProvider>
      <ClusterFlowInner {...props} />
    </ReactFlowProvider>
  );
}
