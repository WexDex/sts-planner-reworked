"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useGameManager } from "@/app/context/GameContext";
import STSCard from "./Card";
import { LOCATION } from "@/app/types/types";
import { Grid2X2, Grid3X3 } from 'lucide-react';

type PileType = 'draw' | 'discard' | 'exhaust' | 'playedCards';

export default function BottomBlock() {
  const { gameState, drawCards } = useGameManager();
  const [expandedPile, setExpandedPile] = useState<PileType | null>(null);
  const [drawAmount, setDrawAmount] = useState(5);
  const [show_size, setShowSize] = useState<"small" | "large">("small");

  const toggleExpand = (pile: PileType) => {
    setExpandedPile(expandedPile === pile ? null : pile);
  };

  const handleDraw = () => {
    drawCards(drawAmount);
  };

  const getPileCards = (pile: PileType) => {
    return gameState?.[pile] || [];
  };

  const getPileCount = (pile: PileType) => {
    return getPileCards(pile).length;
  };

  
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setExpandedPile(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div ref={ref} className="fixed bottom-0 left-80 right-0 z-30 bg-slate-900 border-t border-slate-700 overflow-visible">
      <div className="relative overflow-visible h-full">
        {/* Expanded content, positioned above the bar */}
        <div
          className={`z-50 absolute bottom-full left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 overflow-y-auto max-h-72 transform transition-all duration-300 ease-out ${
            expandedPile ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        > 
          <div className='flex flex-row justify-between gap-5 items-center mb-4'>
              <h3 className="text-lg font-semibold text-white capitalize">
                {expandedPile?.replace('Pile', ' Pile')}
              </h3>
              <button type='button' 
              onClick={() => setShowSize(show_size === "small" ? "large" : "small")}
               className='items-center'>
                <div className='flex flex-row gap-3 hover:bg-slate-400/20 transition-colors px-2 py-1 rounded-lg'>
                    <Grid3X3 className={`w-6 h-6 ${show_size === "small" ? "text-slate-400" : "text-slate-200"}`} />
                    <Grid2X2 className={`w-6 h-6 ${show_size === "large" ? "text-slate-400" : "text-slate-200"}`} />
                </div>
              </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {expandedPile && getPileCards(expandedPile).map((card, index) => (
              <STSCard
                key={`${expandedPile}-${index}-${card.name}`}
                card={card}
                index={index}
                location={expandedPile === 'playedCards' ? LOCATION.PLAYED : LOCATION[expandedPile.toUpperCase() as keyof typeof LOCATION]}
                size={show_size}
              />
            ))}
          </div>
        </div>

        {/* Collapsed bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleExpand('draw')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white cursor-pointer"
            >
              Draw Pile {getPileCount('draw')}
            </button>
            <button
              onClick={() => toggleExpand('discard')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white cursor-pointer"
            >
              Discard Pile {getPileCount('discard')}
            </button>
            <button
              onClick={() => toggleExpand('exhaust')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white cursor-pointer"
            >
              Exhaust Pile {getPileCount('exhaust')}
            </button>
            <button
              onClick={() => toggleExpand('playedCards')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white cursor-pointer"
            >
              Played Pile {getPileCount('playedCards')}
            </button>
          </div>
          <div className="flex items-center flex-row gap-2">
            <input
              type="number"
              value={drawAmount}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setDrawAmount(Number.isNaN(value) ? 1 : Math.min(Math.max(value, 1), 9));
              }}
              className="w-16 h-10 px-2 bg-slate-800 border border-slate-600 rounded-full text-center text-white outline-none ring-1 ring-transparent transition focus:border-blue-400 focus:ring-blue-500/30"
              min="1"
              max="9"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <button
              onClick={handleDraw}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
            >
              Draw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}