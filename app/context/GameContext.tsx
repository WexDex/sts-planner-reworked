'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CombatData, Card, CardReference } from '@/app/types/gameTypes';
import {
  loadFromFile,
  cloneGameData,
  saveToLocalStorage,
  loadFromLocalStorage,
} from '@/app/utils/gameHelpers';
import { combatData as staticCombatData } from '@/app/data/combatData';
import cardDB from '@/app/data/cardDB.json';

interface GameContextType {
  gameState: CombatData | null;
  currentTurn: number;
  setCurrentTurn: (turn: number) => void;
  isLoading: boolean;
  error: string | null;
  updateGameState: (newState: Partial<CombatData>) => void;
  resetGameState: () => void;
  loadGameData: (filePath?: string) => Promise<void>;
  saveGameData: (key?: string) => void;
  loadSavedGame: (key?: string) => boolean;
  toggleRelic: (relicName: string) => void;
  toggleCardSelection: (location: string, index: number) => void;
  playSelectedCards: () => void;
  moveSelectedCards: (toLocation: string) => void;
  removeSelectedCards: () => void;
  spendEnergyOnSelected: () => void;
  deselectAllCards: () => void;
  addToActivityLog: (message: string) => void;
  drawCards: (amount: number) => void;
  upgradeSelected: () => void;
  downgradeSelected: () => void;
  duplicateSelected: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DEFAULT_SAVE_KEY = 'sts_game_save';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<CombatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<CombatData | null>(null);
  const [currentTurn, setCurrentTurn] = useState(1);

  // Load static data on mount
  useEffect(() => {
    loadGameData();
  }, []);

  const normalizeRelicEffects = (data: CombatData): CombatData => ({
    ...data,
    player: {
      ...data.player,
      relicEffects:
        data.player.relicEffects?.map((effect) => ({
          ...effect,
          enabled: effect.enabled ?? true,
        })) ?? [],
    },
  });

  const normalizeCard = (card: Card): Card => ({
    ...card,
    isChanged: card.isChanged ?? false,
    isSelected: card.isSelected ?? false,
  });

  const hydrateCardEntry = (entry: Card | CardReference): Card => {
    if ('card_ID' in entry) {
      const { card_ID, ...referenceFields } = entry;
      const baseCard = (cardDB as Record<string, Omit<Card, 'name'>>)[card_ID];
      return {
        name: card_ID,
        ...(baseCard ?? {}),
        ...referenceFields,
      };
    }
    return entry;
  };

  const hydrateCombatData = (data: CombatData): CombatData => ({
    ...data,
    deck: data.deck.map((entry) => hydrateCardEntry(entry)),
  });

  const loadGameData = async (filePath?: string) => {
    try {
      setIsLoading(true);
      let data: CombatData;

      // If filePath is provided, load from file; otherwise use static data
      if (filePath) {
        data = await loadFromFile(filePath);
      } else {
        data = staticCombatData;
      }

      const normalizedData = normalizeRelicEffects(data);
      const hydratedData = hydrateCombatData(normalizedData);
      const withPiles = {
        ...hydratedData,
        draw: (hydratedData.deck as Card[]).map(normalizeCard),
        discard: [],
        exhaust: [],
        hand: [],
        playedCards: [],
        activityLog: [],
        player: {
          ...hydratedData.player,
          currentEnergy: hydratedData.player.energy.base + hydratedData.player.energy.turn1Bonus,
        },
      };
      setInitialData(cloneGameData(withPiles));
      setGameState(cloneGameData(withPiles));
      setCurrentTurn(1);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error loading game data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameState = (newState: Partial<CombatData>) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        ...newState,
      };
    });
  };

  const resetGameState = () => {
    if (initialData) {
      setGameState(cloneGameData(initialData));
    }
  };

  const saveGameData = (key: string = DEFAULT_SAVE_KEY) => {
    if (gameState) {
      saveToLocalStorage(key, gameState);
    }
  };

  const toggleRelic = (relicName: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;

      const activeRelics = prevState.player.activeRelics ?? [];
      const isActive = activeRelics.includes(relicName);
      const nextActiveRelics = isActive
        ? activeRelics.filter((name) => name !== relicName)
        : [...activeRelics, relicName];

      let bonusEnergy = prevState.player.bonusEnergy ?? 0;
      let bonusBlock = prevState.player.bonusBlock ?? 0;
      let intangible = prevState.player.intangible ?? false;

      if (relicName === 'Lantern') {
        bonusEnergy = isActive ? Math.max(0, bonusEnergy - 1) : bonusEnergy + 1;
      }
      if (relicName === "Captains Wheel") {
        bonusBlock = isActive ? Math.max(0, bonusBlock - 18) : bonusBlock + 18;
      }
      if (relicName === "Incense Burner") {
        intangible = !isActive;
      }

      return {
        ...prevState,
        player: {
          ...prevState.player,
          activeRelics: nextActiveRelics,
          bonusEnergy,
          bonusBlock,
          intangible,
        },
      };
    });
  };

  const loadSavedGame = (key: string = DEFAULT_SAVE_KEY): boolean => {
    const saved = loadFromLocalStorage(key);
    if (saved) {
      setGameState(saved);
      return true;
    }
    return false;
  };

  const getSelectedCards = (state: CombatData) => {
    const locations = ['draw', 'discard', 'exhaust', 'hand', 'playedCards'];
    const selected: { card: Card; location: string; index: number }[] = [];
    locations.forEach(loc => {
      const pile = state[loc as keyof CombatData] as Card[];
      pile.forEach((card, idx) => {
        if (card.isSelected) {
          selected.push({ card, location: loc, index: idx });
        }
      });
    });
    return selected;
  };

  const formatCardNames = (cards: Card[]) => cards.map((card) => card.name).join(', ');

  const buildActionLog = (action: string, selected: { card: Card }[]) => {
    const names = formatCardNames(selected.map(({ card }) => card));
    return `${new Date().toLocaleTimeString()}: ${action} ${selected.length} card${selected.length === 1 ? '' : 's'}${names ? ` (${names})` : ''}`;
  };

  const addToActivityLog = (message: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        activityLog: [...prevState.activityLog, `${new Date().toLocaleTimeString()}: ${message}`],
      };
    });
  };

  const clearSelectionState = (state: CombatData): CombatData => ({
    ...state,
    draw: state.draw.map((card) => ({ ...card, isSelected: false })),
    discard: state.discard.map((card) => ({ ...card, isSelected: false })),
    exhaust: state.exhaust.map((card) => ({ ...card, isSelected: false })),
    hand: state.hand.map((card) => ({ ...card, isSelected: false })),
    playedCards: state.playedCards.map((card) => ({ ...card, isSelected: false })),
  });

  const sortSelectedForRemoval = (selected: { card: Card; location: string; index: number }[]) =>
    [...selected].sort((a, b) => {
      if (a.location === b.location) return b.index - a.index;
      return a.location.localeCompare(b.location);
    });

  const playSelectedCards = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = clearSelectionState({
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      });
      const newPlayedCards = [...newState.playedCards];

      const sortedSelected = sortSelectedForRemoval(selected);
      sortedSelected.forEach(({ card }) => {
        newPlayedCards.push({ ...card, isSelected: false });
      });

      return {
        ...newState,
        playedCards: newPlayedCards,
        activityLog: [...newState.activityLog, buildActionLog('Copied to played area', selected)],
      };
    });
  };

  const moveSelectedCards = (toLocation: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = clearSelectionState({
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      });
      const toPile = (newState as any)[toLocation] as Card[];

      const sortedSelected = sortSelectedForRemoval(selected);
      sortedSelected.forEach(({ card, location, index }) => {
        const fromPile = (newState as any)[location] as Card[];
        fromPile.splice(index, 1);
        toPile.push({ ...card, isSelected: false });
      });

      return {
        ...newState,
        activityLog: [...newState.activityLog, buildActionLog(`Moved to ${toLocation}`, selected)],
      };
    });
  };

  const removeSelectedCards = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = clearSelectionState({
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      });

      const sortedSelected = sortSelectedForRemoval(selected);
      sortedSelected.forEach(({ location, index }) => {
        const pile = (newState as any)[location] as Card[];
        pile.splice(index, 1);
      });

      return {
        ...newState,
        activityLog: [...newState.activityLog, buildActionLog('Removed', selected)],
      };
    });
  };

  const spendEnergyOnSelected = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;
      let totalCost = 0;
      selected.forEach(({ card }) => {
        const cost = card.cost && typeof card.cost === 'object' ? (card.isUpgraded && card.cost.upgraded !== undefined ? card.cost.upgraded : card.cost.base) : card.cost;
        if (typeof cost === 'number') totalCost += cost;
      });
      if (prevState.player.currentEnergy! < totalCost) return prevState;

      const newState = clearSelectionState(prevState);
      return {
        ...newState,
        player: {
          ...newState.player,
          currentEnergy: newState.player.currentEnergy! - totalCost,
        },
        activityLog: [...newState.activityLog, buildActionLog(`Spent ${totalCost} energy on`, selected)],
      };
    });
  };

  const deselectAllCards = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      return clearSelectionState(prevState);
    });
  };

  const drawCards = (amount: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const cardsToDraw = prevState.draw.slice(0, amount);
      const remainingDraw = prevState.draw.slice(amount);
      const newHand = [...prevState.hand, ...cardsToDraw];
      return {
        ...prevState,
        draw: remainingDraw,
        hand: newHand,
        activityLog: [...prevState.activityLog, `${new Date().toLocaleTimeString()}: Drew ${cardsToDraw.length} cards,
            (${cardsToDraw.map((c) => c.name).join(', ')})`],
      };
    });
  };

  const upgradeSelected = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = {
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      };
      selected.forEach(({ location, index }) => {
        const pile = (newState as any)[location] as Card[];
        pile[index] = { ...pile[index], isUpgraded: true, isChanged: true };
      });
      const stateWithSelectionCleared = clearSelectionState(newState);
      return {
        ...stateWithSelectionCleared,
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLog('Upgraded', selected)],
      };
    });
  };

  const downgradeSelected = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = {
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      };
      selected.forEach(({ location, index }) => {
        const pile = (newState as any)[location] as Card[];
        pile[index] = { ...pile[index], isUpgraded: false, isChanged: true };
      });
      const stateWithSelectionCleared = clearSelectionState(newState);
      return {
        ...stateWithSelectionCleared,
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLog('Downgraded', selected)],
      };
    });
  };

  const duplicateSelected = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = {
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      };
      selected.forEach(({ card, location }) => {
        const pile = (newState as any)[location] as Card[];
        pile.push({ ...card, isSelected: false, isChanged: true });
      });
      const stateWithSelectionCleared = clearSelectionState(newState);
      return {
        ...stateWithSelectionCleared,
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLog('Duplicated', selected)],
      };
    });
  };

  const toggleCardSelection = (location: string, index: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const pile = prevState[location as keyof CombatData] as Card[];
      if (!Array.isArray(pile) || index < 0 || index >= pile.length) return prevState;
      const newPile = [...pile];
      newPile[index] = { ...newPile[index], isSelected: !newPile[index].isSelected };
      return {
        ...prevState,
        [location]: newPile,
      };
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentTurn,
        setCurrentTurn,
        isLoading,
        error,
        updateGameState,
        resetGameState,
        loadGameData,
        saveGameData,
        loadSavedGame,
        toggleRelic,
        toggleCardSelection,
        playSelectedCards,
        moveSelectedCards,
        removeSelectedCards,
        spendEnergyOnSelected,
        deselectAllCards,
        addToActivityLog,
        drawCards,
        upgradeSelected,
        downgradeSelected,
        duplicateSelected,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook to access the game state globally
 * @returns GameContextType object with gameState and utility functions
 */
export function useGameManager() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameManager must be used within a GameProvider');
  }
  return context;
}
