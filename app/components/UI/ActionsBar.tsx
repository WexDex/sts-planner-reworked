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
    setSelectedCostZero,
    setSelectedCustomCost,
    transformSelectedType,
    toggleChangedSelected,
  } = useGameManager();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [position, setPosition] = useState({ top: 100, left: 100 });
  const [isDragging, setIsDragging] = useState(false);

  // 🔥 layout toggle instead of resize
  const [layout, setLayout] = useState<"vertical" | "horizontal">("vertical");

  const clampPosition = (left: number, top: number, width: number, height: number) => {
    const minLeft = 8;
    const minTop = 8;
    const maxLeft = Math.max(window.innerWidth - width - 8, minLeft);
    const maxTop = Math.max(window.innerHeight - height - 8, minTop);
    return {
      left: Math.min(Math.max(left, minLeft), maxLeft),
      top: Math.min(Math.max(top, minTop), maxTop),
    };
  };

  function toggleLayout() {
    setLayout((prev) => (prev === "vertical" ? "horizontal" : "vertical"));
  }

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const newLeft = event.clientX - dragOffset.current.x;
      const newTop = event.clientY - dragOffset.current.y;

      setPosition(clampPosition(newLeft, newTop, rect.width, rect.height));
    };

    const handleMouseUp = () => setIsDragging(false);

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

  const selectedCount = gameState
    ? gameState.draw.filter(c => c.isSelected).length +
      gameState.discard.filter(c => c.isSelected).length +
      gameState.exhaust.filter(c => c.isSelected).length +
      gameState.hand.filter(c => c.isSelected).length +
      gameState.playedCards.filter(c => c.isSelected).length
    : 0;

  if (selectedCount === 0) return null;

  const totalEnergyCost = gameState
    ? [...gameState.draw, ...gameState.discard, ...gameState.exhaust, ...gameState.hand, ...gameState.playedCards]
        .filter(c => c.isSelected)
        .reduce((sum, card) => {
          const cost =
            typeof card.cost === "object"
              ? card.isUpgraded && card.cost.upgraded !== undefined
                ? card.cost.upgraded
                : card.cost.base
              : card.cost;
          return sum + (typeof cost === "number" ? cost : 0);
        }, 0)
    : 0;

  const hasEnoughEnergy = (gameState?.player.currentEnergy ?? 0) >= totalEnergyCost;

  const isHorizontal = layout === "horizontal";

  return (
    <div
      ref={containerRef}
      className={`fixed bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 
        ${isDragging ? "duration-0" : "duration-300"} text-white flex flex-col ${isDragging ? "cursor-grabbing" : ""}`}
      style={{
        top: position.top,
        left: position.left,
        width: isHorizontal ? 700 : 320,
        height: isHorizontal ? 260 : undefined,
        resize: "both",
        overflow: "visible",
      }}
    >
      {/* HEADER */}
      <div
        onMouseDown={handleDragStart}
        className="cursor-grab select-none bg-slate-800/30 px-3 py-2 rounded-t-2xl flex items-center justify-between"
      >
        <div>
          <h3 className="text-sm font-semibold">Actions</h3>
          <p className="text-xs text-white/50">{selectedCount} selected</p>
        </div>

        {/* 🔥 Layout Toggle */}
        <button
          onClick={toggleLayout}
          className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition"
        >
          {isHorizontal ? "⬇ Vertical" : "➡ Horizontal"}
        </button>
      </div>

      {/* CONTENT */}
      <div className={`flex-1 p-3 ${isHorizontal ? "gap-3 flex flex-row" : "space-y-4"}`}>

        {/* PLAY */}
        <div>
          <p className="text-[10px] uppercase text-white/40 mb-2">Play</p>
          <div className="space-y-2">
            <button onClick={playSelectedCards} className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500">
              ▶ Play
            </button>
            <button
              onClick={spendEnergyOnSelected}
              disabled={!hasEnoughEnergy}
              className={`w-full py-2 rounded-xl text-gray-200 ${
                hasEnoughEnergy ? "bg-yellow-500 hover:bg-yellow-400" : "bg-gray-700 text-white/40"
              }`}
            >
              ⚡Pay Cost {totalEnergyCost}
            </button>
          </div>
        </div>

        {/* MOVE */}
        <div>
          <p className="text-[10px] uppercase text-white/40 mb-2">Move</p>
          <div className={`grid gap-2 ${isHorizontal ? "grid-cols-2" : "grid-cols-4"}`}>
            <button onClick={() => moveSelectedCards("hand")} className="btn-mini green px-2">Hand</button>
            <button onClick={() => moveSelectedCards("draw")} className="btn-mini blue px-2">Draw</button>
            <button onClick={() => moveSelectedCards("discard")} className="btn-mini red px-2">Discard</button>
            <button onClick={() => moveSelectedCards("exhaust")} className="btn-mini gray px-2">Exhaust</button>
          </div>
        </div>

        {/* MODIFY */}
        <div>
          <p className="text-[10px] uppercase text-white/40 mb-2">Modify</p>
          <div className={`grid gap-2 ${isHorizontal ? "grid-cols-2" : "grid-cols-4"}`}>
            <button onClick={upgradeSelected} className="btn-mini purple">Upgrade</button>
            <button onClick={downgradeSelected} className="btn-mini orange">Downgrade</button>
            <button onClick={duplicateSelected} className="btn-mini cyan">Duplicate</button>
          </div>
        </div>

        {/* COST / TRANSFORM */}
        <div>
          <p className="text-[10px] uppercase text-white/40 mb-2">Cost / Transform</p>
          <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]">
            <button onClick={setSelectedCostZero} className="btn-mini yellow">Cost 0</button>
            <button onClick={setSelectedCustomCost} className="btn-mini lime">Custom</button>
            <button onClick={transformSelectedType} className="btn-mini purple">Transform</button>
            <button onClick={toggleChangedSelected} className="btn-mini orange">Toggle</button>
          </div>
        </div>

        {/* MANAGEMENT */}
        <div className={isHorizontal ? "col-span-2" : ""}>
          <p className="text-[10px] uppercase text-white/40 mb-2">Manage</p>
          <div className="space-y-2">
            <button onClick={removeSelectedCards} className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500">
              🗑 Remove
            </button>
            <button onClick={deselectAllCards} className="w-full py-2 rounded-xl bg-gray-700 hover:bg-gray-600">
              ✖ Deselect
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}