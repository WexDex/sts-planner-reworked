"use client";

import { useState, useEffect, useRef } from "react";
import { useGameManager } from "@/app/context/GameContext";

export default function ActionsBar() {
  const {
    gameState,
    playSelectedCards,
    moveSelectedCards,
    removeSelectedCards,
    spendEnergyOnSelected,
    deselectAllCards,
    upgradeSelected,
    downgradeSelected,
    duplicateSelected,
  } = useGameManager();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ top: 100, right: 20 });
  const [isDragging, setIsDragging] = useState(false);

  const clampPosition = (right: number, top: number) => {
    if (!containerRef.current) {
      return { right, top };
    }

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;
    const minRight = 8;
    const minTop = 8;
    const maxRight = Math.max(window.innerWidth - width - 8, minRight);
    const maxTop = Math.max(window.innerHeight - height - 8, minTop);

    return {
      right: Math.min(Math.max(right, minRight), maxRight),
      top: Math.min(Math.max(top, minTop), maxTop),
    };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const elementWidth = containerRef.current.offsetWidth;
    setPosition((prev) =>
      clampPosition(prev.right, prev.top),
    );
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const newRight = Math.round(window.innerWidth - event.clientX + dragOffset.current.x - width);
      const newTop = event.clientY - dragOffset.current.y;
      setPosition(clampPosition(newRight, newTop));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setIsDragging(true);
    event.preventDefault();
  };

  const selectedCount = gameState ? (
    (gameState.draw.filter(c => c.isSelected).length +
     gameState.discard.filter(c => c.isSelected).length +
     gameState.exhaust.filter(c => c.isSelected).length +
     gameState.hand.filter(c => c.isSelected).length +
     gameState.playedCards.filter(c => c.isSelected).length)
  ) : 0;

  if (selectedCount === 0) return null;

  const totalEnergyCost = gameState ? (
    [...gameState.draw, ...gameState.discard, ...gameState.exhaust, ...gameState.hand, ...gameState.playedCards]
      .filter(c => c.isSelected)
      .reduce((sum, card) => {
        const cost = card.cost && typeof card.cost === 'object' ? (card.isUpgraded && card.cost.upgraded !== undefined ? card.cost.upgraded : card.cost.base) : card.cost;
        return sum + (typeof cost === 'number' ? cost : 0);
      }, 0)
  ) : 0;

  const hasEnoughEnergy = gameState?.player.currentEnergy! >= totalEnergyCost;

  return (
    <div
      ref={containerRef}
      className={`fixed w-72 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl
        z-50 text-white ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ top: position.top, right: position.right }}
    >

      {/* Header */}
      <div
        onMouseDown={handleDragStart}
        className="mb-3 cursor-grab select-none bg-slate-800/20 px-3 py-2 rounded-lg"
      >
    <h3 className="text-sm font-semibold tracking-wide">
      Actions
    </h3>
    <p className="text-xs text-white/50">
      {selectedCount} selected
    </p>
  </div>

  {/* PLAY */}
  <div className="mb-4">
    <p className="text-[10px] uppercase text-white/40 mb-2">Play</p>
    <div className="space-y-2">
      <button
        onClick={playSelectedCards}
        className="w-full py-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 transition shadow-md"
      >
        ▶ Play Card
      </button>

      <button
        onClick={spendEnergyOnSelected}
        disabled={!hasEnoughEnergy}
        className={`w-full py-2 rounded-xl transition ${
          hasEnoughEnergy
            ? 'bg-yellow-500/90 hover:bg-yellow-400'
            : 'bg-gray-700 text-white/40 cursor-not-allowed'
        }`}
      >
        ⚡ Spend Energy ({totalEnergyCost})
      </button>
    </div>
  </div>

  {/* MOVE */}
  <div className="mb-4">
    <p className="text-[10px] uppercase text-white/40 mb-2">Move</p>
    <div className="grid grid-cols-2 gap-2">
      <button onClick={() => moveSelectedCards('hand')} className="btn-mini green">Hand</button>
      <button onClick={() => moveSelectedCards('draw')} className="btn-mini blue">Draw</button>
      <button onClick={() => moveSelectedCards('discard')} className="btn-mini red">Discard</button>
      <button onClick={() => moveSelectedCards('exhaust')} className="btn-mini gray">Exhaust</button>
    </div>
  </div>

  {/* MODIFY */}
  <div className="mb-4">
    <p className="text-[10px] uppercase text-white/40 mb-2">Modify</p>
    <div className="grid grid-cols-2 gap-2">
      <button onClick={upgradeSelected} className="btn-mini purple">⬆ Upgrade</button>
      <button onClick={downgradeSelected} className="btn-mini orange">⬇ Downgrade</button>
      <button onClick={duplicateSelected} className="btn-mini cyan">⧉ Duplicate</button>
    </div>
  </div>

  {/* MANAGEMENT */}
  <div>
    <p className="text-[10px] uppercase text-white/40 mb-2">Manage</p>
    <div className="space-y-2">
      <button
        onClick={removeSelectedCards}
        className="w-full py-2 rounded-xl bg-red-600/90 hover:bg-red-500 transition"
      >
        🗑 Remove
      </button>

      <button
        onClick={deselectAllCards}
        className="w-full py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition"
      >
        ✖ Deselect All
      </button>
    </div>
  </div>

</div>
  );
}