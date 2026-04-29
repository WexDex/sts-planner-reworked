"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Card } from "@/app/types/gameTypes";
import { computeLegendHighlightIds } from "@/app/utils/legendHighlightFromCard";

type LegendHighlightContextValue = {
  hoveredCard: Card | null;
  setHoveredLegendCard: (card: Card | null) => void;
  highlightIds: Set<string>;
};

const LegendHighlightContext = createContext<LegendHighlightContextValue | null>(null);

export function LegendHighlightProvider({ children }: { children: React.ReactNode }) {
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  const setHoveredLegendCard = useCallback((card: Card | null) => {
    setHoveredCard(card);
  }, []);

  const highlightIds = useMemo(() => {
    if (!hoveredCard) return new Set<string>();
    return computeLegendHighlightIds(hoveredCard);
  }, [hoveredCard]);

  const value = useMemo(
    () => ({
      hoveredCard,
      setHoveredLegendCard,
      highlightIds,
    }),
    [hoveredCard, setHoveredLegendCard, highlightIds],
  );

  return (
    <LegendHighlightContext.Provider value={value}>{children}</LegendHighlightContext.Provider>
  );
}

export function useLegendHighlight(): LegendHighlightContextValue {
  const ctx = useContext(LegendHighlightContext);
  if (!ctx) {
    return {
      hoveredCard: null,
      setHoveredLegendCard: () => {},
      highlightIds: new Set(),
    };
  }
  return ctx;
}
