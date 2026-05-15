"use client";

import React, { useState } from "react";
import { useGameManager } from "@/app/context/GameContext";
import { Card } from "@/app/types/gameTypes";
import PotionPickerModal from "@/app/components/PotionPickerModal";
import { FlaskConical, Minus, Plus, X } from "lucide-react";

const POTION_TYPE_COLOR: Record<string, string> = {
  offensive: "border-red-400/80 bg-red-900/70 text-red-50",
  defensive: "border-sky-400/80 bg-sky-900/70 text-sky-50",
  utility:   "border-violet-400/80 bg-violet-900/70 text-violet-50",
  power:     "border-orange-400/80 bg-orange-900/70 text-orange-50",
};

function potionSlotStyle(card: Card): string {
  const tag = card.potionTags?.[0];
  return POTION_TYPE_COLOR[tag ?? ""] ?? "border-emerald-400/80 bg-emerald-900/70 text-emerald-50";
}

interface SlotMenuProps {
  card: Card;
  slotIndex: number;
  onClose: () => void;
}

function SlotMenu({ card, slotIndex, onClose }: SlotMenuProps) {
  const { usePotionFromBelt, discardPotionFromBelt } = useGameManager();

  return (
    <div className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl p-1 min-w-36">
      <p className="px-2 py-1 text-[10px] font-semibold text-zinc-400 truncate">{card.name}</p>
      <hr className="border-zinc-700 mb-1" />
      <button
        onClick={() => { usePotionFromBelt(slotIndex); onClose(); }}
        className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-emerald-200 hover:bg-emerald-900/50 transition-colors"
      >
        Use
      </button>
      <button
        onClick={() => { discardPotionFromBelt(slotIndex); onClose(); }}
        className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-rose-300 hover:bg-rose-900/40 transition-colors"
      >
        Discard
      </button>
      <button
        onClick={onClose}
        className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-zinc-500 hover:bg-zinc-800 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

export default function PotionBelt() {
  const { gameState, addPotionToBelt, setPotionBeltSize, discardPotionFromBelt } = useGameManager();
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);

  const belt = gameState?.potionBelt ?? [];
  const size = gameState?.potionBeltSize ?? 2;

  const handlePickerSelect = (name: string) => {
    const card: Card = { name, type: "Potion" };
    addPotionToBelt(card, targetSlot ?? undefined);
    setPickerOpen(false);
    setTargetSlot(null);
  };

  if (!gameState) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Belt label + size controls */}
      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/80">
          Belt
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setPotionBeltSize(Math.max(1, size - 1))}
            className="flex h-4 w-4 items-center justify-center rounded border border-slate-600/60 bg-slate-800/60 text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Remove potion slot"
          >
            <Minus size={9} />
          </button>
          <span className="text-[9px] text-slate-500 tabular-nums w-3 text-center">{size}</span>
          <button
            onClick={() => setPotionBeltSize(Math.min(5, size + 1))}
            className="flex h-4 w-4 items-center justify-center rounded border border-slate-600/60 bg-slate-800/60 text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Add potion slot"
          >
            <Plus size={9} />
          </button>
        </div>
      </div>

      {/* Slots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: size }, (_, i) => {
          const card = belt[i] ?? null;
          const isOpen = openSlot === i;

          return (
            <div key={i} className="relative">
              {isOpen && card && (
                <SlotMenu card={card} slotIndex={i} onClose={() => setOpenSlot(null)} />
              )}
              <button
                onClick={() => {
                  if (card) {
                    setOpenSlot(isOpen ? null : i);
                  } else {
                    setTargetSlot(i);
                    setPickerOpen(true);
                  }
                }}
                title={card ? `${card.name} — click to use or discard` : "Empty slot — click to add potion"}
                className={`relative flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                  card
                    ? potionSlotStyle(card)
                    : "border-slate-500/60 bg-slate-800/50 text-slate-500 hover:border-emerald-500/50 hover:bg-emerald-950/30 hover:text-emerald-300"
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                <span className="whitespace-nowrap leading-tight">
                  {card ? card.name : <span className="text-[10px]">+ Potion</span>}
                </span>
              </button>

              {/* Quick remove X for filled slots */}
              {card && !isOpen && (
                <button
                  onClick={(e) => { e.stopPropagation(); discardPotionFromBelt(i); }}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-rose-800 text-rose-100 hover:bg-rose-600 group-hover:flex"
                  aria-label={`Discard ${card.name}`}
                >
                  <X size={9} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Potion picker modal */}
      {pickerOpen && (
        <PotionPickerModal
          isOpen={pickerOpen}
          onClose={() => { setPickerOpen(false); setTargetSlot(null); }}
          onSelect={handlePickerSelect}
        />
      )}
    </div>
  );
}
