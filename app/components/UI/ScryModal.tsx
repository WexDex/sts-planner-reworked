"use client";

import React, { useState, useRef } from "react";
import { Card } from "@/app/types/gameTypes";
import { GripVertical, Trash2, X } from "lucide-react";

interface ScryItem extends Card {
  _scryKey: string;
  _toDiscard: boolean;
}

interface ScryModalProps {
  draw: Card[];
  scryCount: number;
  onConfirm: (keep: Card[], discard: Card[]) => void;
  onClose: () => void;
}

const CARD_COLOR: Record<string, string> = {
  Attack: "text-red-400",
  Skill: "text-blue-400",
  Power: "text-yellow-400",
  Status: "text-gray-400",
  Curse: "text-purple-400",
};

export default function ScryModal({ draw, scryCount, onConfirm, onClose }: ScryModalProps) {
  const actual = Math.min(scryCount, draw.length);
  const visible = draw.slice(0, actual);

  const [items, setItems] = useState<ScryItem[]>(() =>
    visible.map((c, i) => ({ ...c, _scryKey: c._uid ?? `scry-${i}`, _toDiscard: false }))
  );

  const dragIdx = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current!, 1);
      next.splice(idx, 0, moved);
      dragIdx.current = idx;
      return next;
    });
  };

  const toggleDiscard = (key: string) => {
    setItems(prev => prev.map(c => c._scryKey === key ? { ...c, _toDiscard: !c._toDiscard } : c));
  };

  const handleConfirm = () => {
    const keep = items.filter(c => !c._toDiscard).map(({ _scryKey, _toDiscard, ...card }) => card as Card);
    const discard = items.filter(c => c._toDiscard).map(({ _scryKey, _toDiscard, ...card }) => card as Card);
    onConfirm(keep, discard);
  };

  const discardCount = items.filter(c => c._toDiscard).length;
  const keepCount = items.length - discardCount;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <div>
            <span className="text-sm font-semibold text-zinc-100">
              Scry {actual}
            </span>
            {actual < scryCount && (
              <span className="ml-2 text-xs text-zinc-500">(draw has only {actual})</span>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 text-[10px] text-zinc-500">
          <span>Drag to reorder</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Trash2 size={10} className="text-rose-400" /> click to mark for discard
          </span>
          <span className="ml-auto font-semibold text-zinc-400">
            Keep {keepCount} · Discard {discardCount}
          </span>
        </div>

        {/* Card list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {items.length === 0 && (
            <p className="text-zinc-500 text-xs text-center py-6">Draw pile is empty.</p>
          )}
          {items.map((card, idx) => (
            <div
              key={card._scryKey}
              draggable
              onDragStart={e => handleDragStart(e, idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnd={() => { dragIdx.current = null; }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing select-none transition-colors ${
                card._toDiscard
                  ? "bg-rose-950/40 border-rose-700/50 opacity-60"
                  : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <span className="text-zinc-500 shrink-0"><GripVertical size={14} /></span>
              <span className="text-xs text-zinc-400 w-5 shrink-0 tabular-nums">{idx + 1}</span>
              <span className={`flex-1 text-sm font-medium ${card._toDiscard ? "line-through text-zinc-500" : (CARD_COLOR[card.type ?? ""] ?? "text-zinc-100")}`}>
                {card.name}{card.isUpgraded && <span className="text-yellow-400">+</span>}
              </span>
              {card.type && (
                <span className={`text-xs shrink-0 ${card._toDiscard ? "text-zinc-600" : "text-zinc-500"}`}>{card.type}</span>
              )}
              <button
                onClick={() => toggleDiscard(card._scryKey)}
                title={card._toDiscard ? "Keep this card" : "Discard this card"}
                className={`shrink-0 rounded p-1 transition-colors ${
                  card._toDiscard
                    ? "text-rose-400 hover:text-zinc-300 bg-rose-900/30 hover:bg-zinc-800"
                    : "text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40"
                }`}
                aria-label={card._toDiscard ? "Keep" : "Discard"}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-700">
          <span className="text-xs text-zinc-500">
            {keepCount} stay on top of draw pile
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              Confirm Scry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
