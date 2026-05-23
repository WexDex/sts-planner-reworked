"use client";

import { useState, useCallback, useRef, type DragEvent } from "react";
import {
  genId, makeBlankGroup,
  treeAddCondition, treeAddGroup, treeRemoveNode, treeUpdateCondition,
  treeToggleLogic, treeMoveNode,
  FILTER_FIELD_DEFS, FILTER_FIELD_MAP, FILTER_OPS_FOR_TYPE,
  type FilterGroup, type FilterCondition, type FilterNode, type FilterOp, type SavedFilter,
} from "./galleryFilterUtils";
import { Plus, X, GripVertical, Pencil, Save } from "lucide-react";

// ─── Condition row ─────────────────────────────────────────────────────────────
interface ConditionRowProps {
  cond: FilterCondition;
  onUpdate: (id: string, patch: Partial<Pick<FilterCondition, "field" | "op" | "value">>) => void;
  onRemove: (id: string) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, nodeId: string) => void;
  isDragOver: boolean;
}

function ConditionRow({ cond, onUpdate, onRemove, onDragStart, isDragOver }: ConditionRowProps) {
  const def = FILTER_FIELD_MAP.get(cond.field);
  const ops = FILTER_OPS_FOR_TYPE[def?.type ?? "string"];
  const needsValue = !["isTrue", "isFalse", "exists", "notExists"].includes(cond.op);

  function handleFieldChange(newField: string) {
    const newDef = FILTER_FIELD_MAP.get(newField);
    const newOps = FILTER_OPS_FOR_TYPE[newDef?.type ?? "string"];
    const newOp = newOps[0].op;
    const newValue: string | number | boolean =
      newDef?.type === "number" ? 1 :
      newDef?.type === "boolean" ? true :
      (newDef?.values?.[0] ?? "");
    onUpdate(cond.id, { field: newField, op: newOp, value: newValue });
  }

  const sel = "rounded border border-slate-700/50 bg-slate-900/80 px-1.5 py-0.5 text-[11px] text-slate-200 focus:border-slate-500/60 focus:outline-none";
  const inp = "rounded border border-slate-700/50 bg-slate-900/80 px-1.5 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:border-slate-500/60 focus:outline-none";

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, cond.id)}
      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition cursor-grab active:cursor-grabbing ${
        isDragOver
          ? "border-indigo-400/60 bg-indigo-950/40"
          : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60"
      }`}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-600" />

      {/* Field */}
      <select value={cond.field} onChange={e => handleFieldChange(e.target.value)} className={sel}>
        {["Basic", "Stats", "Keywords"].map(grp => (
          <optgroup key={grp} label={grp}>
            {FILTER_FIELD_DEFS.filter(f => f.group === grp).map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Op */}
      <select value={cond.op} onChange={e => onUpdate(cond.id, { op: e.target.value as FilterOp })} className={sel}>
        {ops.map(o => <option key={o.op} value={o.op}>{o.label}</option>)}
      </select>

      {/* Value */}
      {needsValue && def?.type === "enum" && def.values ? (
        <select value={String(cond.value)} onChange={e => onUpdate(cond.id, { value: e.target.value })} className={sel}>
          {def.values.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      ) : needsValue && def?.type === "number" ? (
        <input
          type="number"
          value={typeof cond.value === "number" ? cond.value : ""}
          onChange={e => onUpdate(cond.id, { value: parseFloat(e.target.value) || 0 })}
          className={`w-16 ${inp}`}
        />
      ) : needsValue ? (
        <input
          type="text"
          value={String(cond.value)}
          onChange={e => onUpdate(cond.id, { value: e.target.value })}
          placeholder="value"
          className={`w-24 ${inp}`}
        />
      ) : null}

      <button
        type="button"
        onClick={() => onRemove(cond.id)}
        className="ml-auto shrink-0 text-slate-600 transition hover:text-rose-400"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Group view (recursive) ────────────────────────────────────────────────────
interface GroupViewProps {
  group: FilterGroup;
  depth: number;
  isRoot: boolean;
  onAddCondition: (groupId: string) => void;
  onAddGroup: (groupId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onUpdateCondition: (condId: string, patch: Partial<Pick<FilterCondition, "field" | "op" | "value">>) => void;
  onToggleLogic: (groupId: string) => void;
  dragState: { dragId: string | null; dropGroupId: string | null };
  onDragStart: (e: DragEvent<HTMLDivElement>, nodeId: string) => void;
  onGroupDragOver: (e: DragEvent<HTMLDivElement>, groupId: string) => void;
  onGroupDrop: (e: DragEvent<HTMLDivElement>, groupId: string) => void;
}

const DEPTH_BORDER  = ["border-slate-600/40", "border-indigo-700/40", "border-teal-700/40", "border-amber-700/40"];
const DEPTH_BG      = ["bg-slate-800/20",     "bg-indigo-950/20",     "bg-teal-950/20",     "bg-amber-950/20"    ];
const LOGIC_ACTIVE  = { AND: "border-sky-500/70 bg-sky-600/30 text-sky-200", OR: "border-amber-500/70 bg-amber-600/30 text-amber-200" };

function GroupView({
  group, depth, isRoot,
  onAddCondition, onAddGroup, onRemoveNode, onUpdateCondition, onToggleLogic,
  dragState, onDragStart, onGroupDragOver, onGroupDrop,
}: GroupViewProps) {
  const isDropTarget = dragState.dropGroupId === group.id && dragState.dragId !== group.id;
  const d = depth % 4;

  return (
    <div
      className={`rounded-lg border p-2 space-y-1.5 transition ${DEPTH_BORDER[d]} ${DEPTH_BG[d]} ${isDropTarget ? "ring-2 ring-indigo-400/50" : ""}`}
      onDragOver={e => { e.preventDefault(); onGroupDragOver(e, group.id); }}
      onDrop={e => onGroupDrop(e, group.id)}
    >
      {/* Group header */}
      <div className="flex items-center gap-1.5">
        {!isRoot && (
          <div
            draggable
            onDragStart={e => onDragStart(e, group.id)}
            className="cursor-grab text-slate-600 hover:text-slate-400 active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}
        <button
          type="button"
          onClick={() => onToggleLogic(group.id)}
          className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider transition ${LOGIC_ACTIVE[group.logic]}`}
        >
          {group.logic}
        </button>
        <span className="text-[10px] text-slate-600">group</span>
        {!isRoot && (
          <button
            type="button"
            onClick={() => onRemoveNode(group.id)}
            className="ml-auto text-slate-600 transition hover:text-rose-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Children */}
      {group.children.map(child =>
        child.kind === "condition" ? (
          <ConditionRow
            key={child.id}
            cond={child}
            onUpdate={onUpdateCondition}
            onRemove={onRemoveNode}
            onDragStart={onDragStart}
            isDragOver={dragState.dropGroupId === group.id && dragState.dragId === child.id}
          />
        ) : (
          <GroupView
            key={child.id}
            group={child}
            depth={depth + 1}
            isRoot={false}
            onAddCondition={onAddCondition}
            onAddGroup={onAddGroup}
            onRemoveNode={onRemoveNode}
            onUpdateCondition={onUpdateCondition}
            onToggleLogic={onToggleLogic}
            dragState={dragState}
            onDragStart={onDragStart}
            onGroupDragOver={onGroupDragOver}
            onGroupDrop={onGroupDrop}
          />
        ),
      )}

      {/* Add buttons */}
      <div className="flex gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => onAddCondition(group.id)}
          className="flex items-center gap-1 rounded border border-slate-700/40 bg-slate-800/50 px-2 py-1 text-[10px] text-slate-400 transition hover:border-slate-600/60 hover:text-slate-300"
        >
          <Plus className="h-3 w-3" /> Condition
        </button>
        <button
          type="button"
          onClick={() => onAddGroup(group.id)}
          className="flex items-center gap-1 rounded border border-slate-700/40 bg-slate-800/50 px-2 py-1 text-[10px] text-slate-400 transition hover:border-slate-600/60 hover:text-slate-300"
        >
          <Plus className="h-3 w-3" /> Sub-group
        </button>
      </div>
    </div>
  );
}

// ─── Main builder component ────────────────────────────────────────────────────
interface GalleryFilterBuilderProps {
  initial?: SavedFilter;
  onSave: (filter: SavedFilter) => void;
  onClose: () => void;
}

export default function GalleryFilterBuilder({ initial, onSave, onClose }: GalleryFilterBuilderProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [expr, setExpr] = useState<FilterGroup>(
    initial?.expr ?? makeBlankGroup("AND"),
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropGroupId, setDropGroupId] = useState<string | null>(null);
  const dragState = { dragId, dropGroupId };

  // Tree mutation callbacks (all stable — no deps change)
  const handleAddCondition = useCallback((groupId: string) => {
    setExpr(prev => treeAddCondition(prev, groupId));
  }, []);

  const handleAddGroup = useCallback((groupId: string) => {
    setExpr(prev => treeAddGroup(prev, groupId));
  }, []);

  const handleRemoveNode = useCallback((nodeId: string) => {
    setExpr(prev => treeRemoveNode(prev, nodeId));
  }, []);

  const handleUpdateCondition = useCallback((
    condId: string,
    patch: Partial<Pick<FilterCondition, "field" | "op" | "value">>,
  ) => {
    setExpr(prev => treeUpdateCondition(prev, condId, patch));
  }, []);

  const handleToggleLogic = useCallback((groupId: string) => {
    setExpr(prev => treeToggleLogic(prev, groupId));
  }, []);

  // DnD handlers
  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, nodeId: string) => {
    e.stopPropagation();
    setDragId(nodeId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleGroupDragOver = useCallback((e: DragEvent<HTMLDivElement>, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropGroupId(groupId);
  }, []);

  const handleGroupDrop = useCallback((e: DragEvent<HTMLDivElement>, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragId && dragId !== groupId) {
      setExpr(prev => treeMoveNode(prev, dragId, groupId));
    }
    setDragId(null);
    setDropGroupId(null);
  }, [dragId]);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      id: initial?.id ?? genId(),
      name: trimmed,
      expr,
      active: initial?.active ?? true,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-12 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-[600px] max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/50"
        onDragLeave={() => setDropGroupId(null)}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Pencil className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              {initial ? "Edit Filter" : "New Filter"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 transition hover:text-slate-300">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Filter Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Big Attacks"
              className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>

          {/* Expression tree */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Conditions
              <span className="ml-1 text-slate-600 normal-case">(drag rows to reorder or move between groups)</span>
            </label>
            <GroupView
              group={expr}
              depth={0}
              isRoot
              onAddCondition={handleAddCondition}
              onAddGroup={handleAddGroup}
              onRemoveNode={handleRemoveNode}
              onUpdateCondition={handleUpdateCondition}
              onToggleLogic={handleToggleLogic}
              dragState={dragState}
              onDragStart={handleDragStart}
              onGroupDragOver={handleGroupDragOver}
              onGroupDrop={handleGroupDrop}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-2.5 border-t border-slate-700/50 bg-slate-900 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 rounded-lg border border-indigo-500/50 bg-indigo-600/30 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-600/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {initial ? "Update Filter" : "Save Filter"}
          </button>
        </div>
      </div>
    </div>
  );
}
