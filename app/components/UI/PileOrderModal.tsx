"use client";

import React, { useState, useCallback, useRef } from "react";
import { Card } from "@/app/types/gameTypes";
import { X, GripVertical, ArrowDownToLine } from "lucide-react";

export interface PileOrderModalProps {
  /** Modal title shown in header */
  title: string;
  /** Cards to display and reorder */
  cards: Card[];
  /** If set, only the first N cards are shown/reorderable (Scry); rest stay locked below */
  visibleCount?: number;
  /** Called with reordered visible slice (full array if no visibleCount) when user confirms */
  onConfirm: (reordered: Card[]) => void;
  onClose: () => void;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Show "Put on Bottom" action per card (Scry use case) */
  showPutOnBottom?: boolean;
}

export default function PileOrderModal({
  title,
  cards,
  visibleCount,
  onConfirm,
  onClose,
  confirmLabel = "Confirm Order",
  showPutOnBottom = false,
}: PileOrderModalProps) {
  const limit = visibleCount !== undefined ? Math.min(visibleCount, cards.length) : cards.length;
  const [visible, setVisible] = useState<Card[]>(cards.slice(0, limit));
  const locked = cards.slice(limit);

  const dragIdx = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const next = [...visible];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(idx, 0, moved);
    dragIdx.current = idx;
    setVisible(next);
  };

  const handleDragEnd = () => {
    dragIdx.current = null;
  };

  const putOnBottom = useCallback((idx: number) => {
    setVisible(prev => {
      const next = [...prev];
      const [card] = next.splice(idx, 1);
      next.push(card);
      return next;
    });
  }, []);

  const handleConfirm = () => {
    onConfirm([...visible, ...locked]);
  };

  const cardTypeColor: Record<string, string> = {
    Attack: "text-red-400",
    Skill: "text-blue-400",
    Power: "text-yellow-400",
    Status: "text-gray-400",
    Curse: "text-purple-400",
    Potion: "text-green-400",
  };

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <span className="text-sm font-semibold text-zinc-100">{title}</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Visible (reorderable) cards */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {visible.length === 0 && (
            <p className="text-zinc-500 text-xs text-center py-4">No cards to show.</p>
          )}
          {visible.map((card, idx) => (
            <div
              key={card._uid ?? `${card.name}-${idx}`}
              draggable
              onDragStart={e => handleDragStart(e, idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing select-none group"
            >
              <span className="text-zinc-500 shrink-0">
                <GripVertical size={14} />
              </span>
              <span className="text-xs text-zinc-400 w-5 shrink-0 tabular-nums">{idx + 1}</span>
              <span className={`flex-1 text-sm font-medium ${cardTypeColor[card.type ?? ""] ?? "text-zinc-100"}`}>
                {card.name}
                {card.isUpgraded && <span className="text-yellow-400">+</span>}
              </span>
              {card.type && (
                <span className="text-xs text-zinc-500 shrink-0">{card.type}</span>
              )}
              {showPutOnBottom && (
                <button
                  onClick={() => putOnBottom(idx)}
                  title="Put on bottom"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-100 shrink-0"
                >
                  <ArrowDownToLine size={13} />
                </button>
              )}
            </div>
          ))}

          {/* Locked cards (below visible count) */}
          {locked.length > 0 && (
            <>
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 border-t border-zinc-700" />
                <span className="text-xs text-zinc-500 shrink-0">rest of pile ({locked.length})</span>
                <div className="flex-1 border-t border-zinc-700" />
              </div>
              {locked.map((card, idx) => (
                <div
                  key={card._uid ?? `${card.name}-locked-${idx}`}
                  className="flex items-center gap-2 bg-zinc-850 border border-zinc-800 rounded-lg px-3 py-2 opacity-50 select-none"
                >
                  <span className="text-xs text-zinc-500 w-5 tabular-nums">{limit + idx + 1}</span>
                  <span className={`flex-1 text-sm ${cardTypeColor[card.type ?? ""] ?? "text-zinc-100"}`}>
                    {card.name}
                    {card.isUpgraded && <span className="text-yellow-400">+</span>}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-700">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
