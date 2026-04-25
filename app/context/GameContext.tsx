'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CombatData, Card, CardReference, ActivityLogEntry, Turn } from '@/app/types/gameTypes';
import {
  loadFromFile,
  cloneGameData,
  saveToLocalStorage,
  loadFromLocalStorage,
} from '@/app/utils/gameHelpers';
import {
  buildActionLogEntry,
  buildStateDiffLogEntry,
  createActivityLogEntry,
  formatCardNames,
  buildDamageLogEntry,
  buildHealLogEntry,
  buildBlockLogEntry,
  buildBlockLostLogEntry,
  buildEnergyLogEntry,
  buildBuffLogEntry,
  buildDebuffLogEntry,
  buildDebuffRemovedLogEntry,
} from '@/app/utils/activityLogger';
import { combatData as staticCombatData } from '@/app/data/combatData';
import cardDB from '@/app/data/cardDB.json';

interface GameContextType {
  gameState: CombatData | null;
  turns: Turn[];
  currentTurnIndex: number;
  setCurrentTurn: (turnId: number) => void;
  endTurn: () => void;
  continueFromTurn: (fromTurnId: number, toTurnId: number) => void;
  resetCurrentTurn: () => void;
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
  addToActivityLog: (entry: ActivityLogEntry | string) => void;
  drawCards: (amount: number) => void;
  upgradeSelected: () => void;
  downgradeSelected: () => void;
  duplicateSelected: () => void;
  setSelectedCostZero: () => void;
  setSelectedCustomCost: () => void;
  transformSelectedType: () => void;
  toggleChangedSelected: () => void;
  addCardFromDB: (cardId: string, location: string, isUpgraded?: boolean) => void;
  modifyPlayerHp: (delta: number) => void;
  modifyPlayerBlock: (delta: number) => void;
  modifyPlayerEnergy: (delta: number) => void;
  modifyEnemyHp: (enemyIndex: number, delta: number) => void;
  modifyEnemyBlock: (enemyIndex: number, delta: number) => void;
  addBuffDebuff: (target: 'player' | 'enemy', enemyIndex: number, name: string, type: 'buff' | 'debuff', stacks: number, description?: string) => void;
  removeBuffDebuff: (target: 'player' | 'enemy', enemyIndex: number, name: string) => void;
  reduceBuffDebuff: (target: 'player' | 'enemy', enemyIndex: number, name: string) => void;
  updateBuffDebuffStacks: (target: 'player' | 'enemy', enemyIndex: number, name: string, stacks: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DEFAULT_SAVE_KEY = 'sts_game_save';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<CombatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<CombatData | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

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
      return Object.assign({ name: card_ID }, baseCard ?? {}, referenceFields);
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

      // Initialize turns based on enemy intents
      const turnNumbers = new Set<number>();
      withPiles.enemies?.forEach(enemy => enemy.intents?.forEach(intent => turnNumbers.add(intent.turn)));
      const uniqueTurns = Array.from(turnNumbers).sort((a, b) => a - b);
      const initialTurns: Turn[] = uniqueTurns.map(id => ({ id, state: cloneGameData(withPiles) }));
      setTurns(initialTurns);
      setCurrentTurnIndex(0);

      setGameState(cloneGameData(withPiles));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error loading game data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load static data on mount
  useEffect(() => {
    loadGameData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrentTurn = (turnId: number) => {
    const index = turns.findIndex(turn => turn.id === turnId);
    if (index !== -1 && index !== currentTurnIndex) {
      // Autosave current turn before switching
      setTurns(prev => prev.map((turn, idx) => idx === currentTurnIndex ? { ...turn, state: cloneGameData(gameState!) } : turn));
      setCurrentTurnIndex(index);
      setGameState(cloneGameData(turns[index].state));
    }
  };

  const endTurn = () => {
    // Save current state to current turn
    setTurns(prev => prev.map((turn, idx) => idx === currentTurnIndex ? { ...turn, state: cloneGameData(gameState!) } : turn));
    const nextIndex = currentTurnIndex + 1;
    if (nextIndex >= turns.length) {
      // Create new turn with initial/default data
      const newTurn: Turn = { id: turns.length + 1, state: cloneGameData(initialData!) };
      setTurns(prev => [...prev, newTurn]);
      setCurrentTurnIndex(nextIndex);
      setGameState(cloneGameData(initialData!));
    } else {
      setCurrentTurnIndex(nextIndex);
      setGameState(cloneGameData(turns[nextIndex].state));
    }
  };

  const continueFromTurn = (fromTurnId: number, toTurnId: number) => {
    const fromTurnIndex = turns.findIndex(turn => turn.id === fromTurnId);
    const toTurnIndex = turns.findIndex(turn => turn.id === toTurnId);
    
    if (fromTurnIndex === -1 || toTurnIndex === -1) return;
    
    // Copy data from source turn to target turn
    const sourceState = cloneGameData(turns[fromTurnIndex].state);
    setTurns(prev => prev.map((turn, idx) => idx === toTurnIndex ? { ...turn, state: sourceState } : turn));
    setCurrentTurnIndex(toTurnIndex);
  };

  const resetCurrentTurn = () => {
    if (!initialData) return;
    const resetState = cloneGameData(initialData);
    setGameState(resetState);
    setTurns(prev => prev.map((turn, idx) => idx === currentTurnIndex ? { ...turn, state: resetState } : turn));
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
    if (turns.length > 0) {
      saveToLocalStorage(key, { turns, currentTurnIndex });
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
    if (saved && saved.turns && Array.isArray(saved.turns)) {
      setTurns(saved.turns);
      setCurrentTurnIndex(saved.currentTurnIndex || 0);
      setGameState(cloneGameData(saved.turns[saved.currentTurnIndex || 0]?.state || null));
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

  const addToActivityLog = (entry: ActivityLogEntry | string) => {
    const logEntry =
      typeof entry === 'string' ? createActivityLogEntry(entry) : entry;

    setGameState((prevState) => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        activityLog: [...prevState.activityLog, logEntry],
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

  const modifySelectedCards = (
    updater: (card: Card) => Card,
    actionLabel: string,
  ) => {
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
        pile[index] = updater(pile[index]);
      });

      const stateWithSelectionCleared = clearSelectionState(newState);
      return {
        ...stateWithSelectionCleared,
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLogEntry(actionLabel, selected)],
      };
    });
  };

  const setSelectedCostZero = () => {
    modifySelectedCards((card) => ({ ...card, cost: 0, isChanged: true }), 'Set cost to zero for');
  };

  const setSelectedCustomCost = () => {
    const promptValue = window.prompt('Enter custom cost for selected cards:', '0');
    if (promptValue === null) return;
    const value = Number(promptValue);
    if (Number.isNaN(value)) return;
    modifySelectedCards((card) => ({ ...card, cost: value, isChanged: true }), `Set cost to ${value} for`);
  };

  const transformSelectedType = () => {
    const newType = window.prompt('Enter a new type for selected cards (Attack, Skill, Power, Status, Curse):', 'Attack');
    if (!newType) return;
    modifySelectedCards((card) => ({ ...card, type: newType, isChanged: true }), `Transformed type to ${newType} for`);
  };

  const toggleChangedSelected = () => {
    modifySelectedCards((card) => ({ ...card, isChanged: !card.isChanged }), 'Toggled changed on');
  };

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
        activityLog: [...newState.activityLog, buildActionLogEntry(`Played ${formatCardNames(selected.map(({ card }) => card))}`, selected)],
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
        activityLog: [...newState.activityLog, buildActionLogEntry(`Moved to ${toLocation}`, selected)],
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
        activityLog: [...newState.activityLog, buildActionLogEntry('Removed', selected)],
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
        activityLog: [
          ...newState.activityLog,
          buildEnergyLogEntry(
            totalCost,
            prevState.player.currentEnergy ?? 0,
            newState.player.currentEnergy! - totalCost,
            `Spent ${totalCost} energy on ${formatCardNames(selected.map(({ card }) => card))}`,
          ),
        ],
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
        activityLog: [
          ...prevState.activityLog,
          buildStateDiffLogEntry(
            `Drew ${cardsToDraw.length} cards`,
            `Draw pile: ${prevState.draw.length} cards`,
            `Draw pile: ${remainingDraw.length} cards`,
            `Cards: ${cardsToDraw.map((c) => c.name).join(', ')}`,
          ),
        ],
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
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLogEntry('Upgraded', selected)],
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
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLogEntry('Downgraded', selected)],
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
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLogEntry('Duplicated', selected)],
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

  const addCardFromDB = (cardId: string, location: string, isUpgraded = false) => {
    const cardData = (cardDB as Record<string, any>)[cardId];
    if (!cardData) return;

    const newCard: Card = {
      name: cardId,
      type: cardData.type,
      isUpgraded,
      isChanged: false,
      isSelected: false,
      cost: cardData.cost,
      damage: cardData.damage,
      block: cardData.block,
      draw: cardData.draw,
      description: cardData.description,
      ...cardData,
    };

    setGameState((prevState) => {
      if (!prevState) return prevState;
      const pile = (prevState as any)[location] as Card[];
      if (!Array.isArray(pile)) return prevState;

      const newPile = [...pile, newCard];
      return {
        ...prevState,
        [location]: newPile,
        activityLog: [
          ...prevState.activityLog,
          createActivityLogEntry(`Added ${cardId}${isUpgraded ? '+' : ''} to ${location}`),
        ],
      };
    });
  };

  const modifyPlayerHp = (delta: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const beforeHp = prevState.player.hp ?? 0;
      const newHp = Math.max(0, beforeHp + delta);
      
      if (beforeHp === newHp) return prevState;
      
      const logEntry = delta > 0 
        ? buildHealLogEntry('player', delta, beforeHp, newHp)
        : buildDamageLogEntry('player', Math.abs(delta), beforeHp, newHp);
      
      return {
        ...prevState,
        player: {
          ...prevState.player,
          hp: newHp,
        },
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const modifyPlayerBlock = (delta: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const beforeBlock = prevState.player.currentBlock ?? 0;
      const newBlock = Math.max(0, beforeBlock + delta);
      
      if (beforeBlock === newBlock) return prevState;
      
      const logEntry = delta > 0
        ? buildBlockLogEntry('player', delta, beforeBlock, newBlock)
        : buildBlockLostLogEntry('player', Math.abs(delta), beforeBlock, newBlock);
      
      return {
        ...prevState,
        player: {
          ...prevState.player,
          currentBlock: newBlock,
        },
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const modifyPlayerEnergy = (delta: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const beforeEnergy = prevState.player.currentEnergy ?? 0;
      const newEnergy = Math.max(0, beforeEnergy + delta);
      
      if (beforeEnergy === newEnergy) return prevState;
      
      const action = delta > 0 ? 'gained' : 'spent';
      const logEntry = buildEnergyLogEntry(Math.abs(delta), beforeEnergy, newEnergy, action);
      
      return {
        ...prevState,
        player: {
          ...prevState.player,
          currentEnergy: newEnergy,
        },
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const modifyEnemyHp = (enemyIndex: number, delta: number) => {
    setGameState((prevState) => {
      if (!prevState || !prevState.enemies) return prevState;
      const nextEnemies = [...prevState.enemies];
      if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
      
      const beforeHp = nextEnemies[enemyIndex].hp;
      const newHp = Math.max(0, beforeHp + delta);
      
      if (beforeHp === newHp) return prevState;
      
      const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
      const logEntry = delta > 0
        ? buildHealLogEntry('enemy', delta, beforeHp, newHp, enemyName)
        : buildDamageLogEntry('enemy', Math.abs(delta), beforeHp, newHp, enemyName);
      
      nextEnemies[enemyIndex] = {
        ...nextEnemies[enemyIndex],
        hp: newHp,
      };
      
      return { 
        ...prevState, 
        enemies: nextEnemies,
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const modifyEnemyBlock = (enemyIndex: number, delta: number) => {
    setGameState((prevState) => {
      if (!prevState || !prevState.enemies) return prevState;
      const nextEnemies = [...prevState.enemies];
      if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
      
      const beforeBlock = nextEnemies[enemyIndex].currentBlock ?? 0;
      const newBlock = Math.max(0, beforeBlock + delta);
      
      if (beforeBlock === newBlock) return prevState;
      
      const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
      const logEntry = delta > 0
        ? buildBlockLogEntry('enemy', delta, beforeBlock, newBlock, enemyName)
        : buildBlockLostLogEntry('enemy', Math.abs(delta), beforeBlock, newBlock, enemyName);
      
      nextEnemies[enemyIndex] = {
        ...nextEnemies[enemyIndex],
        currentBlock: newBlock,
      };
      
      return { 
        ...prevState, 
        enemies: nextEnemies,
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const addBuffDebuff = (target: 'player' | 'enemy', enemyIndex: number, name: string, type: 'buff' | 'debuff', stacks: number, description?: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      if (target === 'player') {
        const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
        const existingIndex = buffsDebuffs.findIndex((bd) => bd.name === name);
        let nextBuffsDebuffs: typeof buffsDebuffs;
        let logEntry: ActivityLogEntry;
        
        if (existingIndex >= 0) {
          const previousStacks = buffsDebuffs[existingIndex].stacks;
          nextBuffsDebuffs = [...buffsDebuffs];
          nextBuffsDebuffs[existingIndex] = { ...nextBuffsDebuffs[existingIndex], stacks, description };
          
          logEntry = type === 'buff'
            ? buildBuffLogEntry(name, stacks, 'player', undefined, previousStacks)
            : buildDebuffLogEntry(name, stacks, 'player', undefined, previousStacks);
        } else {
          nextBuffsDebuffs = [...buffsDebuffs, { name, stacks, type, description }];
          
          logEntry = type === 'buff'
            ? buildBuffLogEntry(name, stacks, 'player')
            : buildDebuffLogEntry(name, stacks, 'player');
        }
        
        return {
          ...prevState,
          player: { ...prevState.player, buffsDebuffs: nextBuffsDebuffs },
          activityLog: [...prevState.activityLog, logEntry],
        };
      } else {
        if (!prevState.enemies) return prevState;
        const nextEnemies = [...prevState.enemies];
        if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
        
        const buffsDebuffs = nextEnemies[enemyIndex].buffsDebuffs ?? [];
        const existingIndex = buffsDebuffs.findIndex((bd) => bd.name === name);
        let nextBuffsDebuffs: typeof buffsDebuffs;
        let logEntry: ActivityLogEntry;
        
        if (existingIndex >= 0) {
          const previousStacks = buffsDebuffs[existingIndex].stacks;
          nextBuffsDebuffs = [...buffsDebuffs];
          nextBuffsDebuffs[existingIndex] = { ...nextBuffsDebuffs[existingIndex], stacks, description };
          
          const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
          logEntry = type === 'buff'
            ? buildBuffLogEntry(name, stacks, 'enemy', enemyName, previousStacks)
            : buildDebuffLogEntry(name, stacks, 'enemy', enemyName, previousStacks);
        } else {
          nextBuffsDebuffs = [...buffsDebuffs, { name, stacks, type, description }];
          
          const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
          logEntry = type === 'buff'
            ? buildBuffLogEntry(name, stacks, 'enemy', enemyName)
            : buildDebuffLogEntry(name, stacks, 'enemy', enemyName);
        }
        
        nextEnemies[enemyIndex] = { ...nextEnemies[enemyIndex], buffsDebuffs: nextBuffsDebuffs };
        return { 
          ...prevState, 
          enemies: nextEnemies,
          activityLog: [...prevState.activityLog, logEntry],
        };
      }
    });
  };

  const removeBuffDebuff = (target: 'player' | 'enemy', enemyIndex: number, name: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      if (target === 'player') {
        const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
        const logEntry = buildDebuffRemovedLogEntry(name, 'player');
        
        return {
          ...prevState,
          player: {
            ...prevState.player,
            buffsDebuffs: buffsDebuffs.filter((bd) => bd.name !== name),
          },
          activityLog: [...prevState.activityLog, logEntry],
        };
      } else {
        if (!prevState.enemies) return prevState;
        const nextEnemies = [...prevState.enemies];
        if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
        
        const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
        const logEntry = buildDebuffRemovedLogEntry(name, 'enemy', enemyName);
        
        
        nextEnemies[enemyIndex] = {
          ...nextEnemies[enemyIndex],
          buffsDebuffs: (nextEnemies[enemyIndex].buffsDebuffs ?? []).filter((bd) => bd.name !== name),
        };
        return { 
          ...prevState, 
          enemies: nextEnemies,
          activityLog: [...prevState.activityLog, logEntry],
        };
      }
    });
  };

  const reduceBuffDebuff = (target: 'player' | 'enemy', enemyIndex: number, name: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const isPlayer = target === 'player';
      const enemyName = !isPlayer ? prevState.enemies?.[enemyIndex].name || `Enemy ${enemyIndex + 1}` : undefined;

      if (isPlayer) {
        const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
        const existingIndex = buffsDebuffs.findIndex((bd) => bd.name === name);
        if (existingIndex < 0) return prevState;

        const existing = buffsDebuffs[existingIndex];
        const currentStacks = existing.stacks;
        let logEntry: ActivityLogEntry;
        let nextBuffsDebuffs;

        if (currentStacks <= 1) {
          nextBuffsDebuffs = buffsDebuffs.filter((bd) => bd.name !== name);
          
        logEntry = buildDebuffRemovedLogEntry(name, isPlayer ? 'player' : 'enemy', enemyName);
        } else {
          const newStacks = currentStacks - 1;
          nextBuffsDebuffs = [...buffsDebuffs];
          nextBuffsDebuffs[existingIndex] = { ...existing, stacks: newStacks };
          logEntry = existing.type === 'buff'
            ? buildBuffLogEntry(name, newStacks, target, enemyName, currentStacks)
            : buildDebuffLogEntry(name, newStacks, target, enemyName, currentStacks);
        }

        return {
          ...prevState,
          player: {
            ...prevState.player,
            buffsDebuffs: nextBuffsDebuffs,
          },
          activityLog: [...prevState.activityLog, logEntry],
        };
      }

      if (!prevState.enemies) return prevState;
      const nextEnemies = [...prevState.enemies];
      if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;

      const buffsDebuffs = nextEnemies[enemyIndex].buffsDebuffs ?? [];
      const existingIndex = buffsDebuffs.findIndex((bd) => bd.name === name);
      if (existingIndex < 0) return prevState;

      const existing = buffsDebuffs[existingIndex];
      const currentStacks = existing.stacks;
      let logEntry: ActivityLogEntry;
      let nextBuffsDebuffs;

      if (currentStacks <= 1) {
        nextBuffsDebuffs = buffsDebuffs.filter((bd) => bd.name !== name);
        logEntry = createActivityLogEntry(
          `${enemyName}'s ${name} was removed`,
          `Stacks: ${currentStacks}`,
          `Stacks: 0`,
          undefined,
          existing.type === 'buff' ? 'buff' : 'debuff',
        );
      } else {
        const newStacks = currentStacks - 1;
        nextBuffsDebuffs = [...buffsDebuffs];
        nextBuffsDebuffs[existingIndex] = { ...existing, stacks: newStacks };
        logEntry = existing.type === 'buff'
          ? buildBuffLogEntry(name, newStacks, target, enemyName, currentStacks)
          : buildDebuffLogEntry(name, newStacks, target, enemyName, currentStacks);
      }

      nextEnemies[enemyIndex] = {
        ...nextEnemies[enemyIndex],
        buffsDebuffs: nextBuffsDebuffs,
      };

      return {
        ...prevState,
        enemies: nextEnemies,
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const updateBuffDebuffStacks = (target: 'player' | 'enemy', enemyIndex: number, name: string, stacks: number) => {
    addBuffDebuff(target, enemyIndex, name, 'buff', stacks);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        turns,
        currentTurnIndex,
        setCurrentTurn,
        endTurn,
        continueFromTurn,
        resetCurrentTurn,
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
        setSelectedCostZero,
        setSelectedCustomCost,
        transformSelectedType,
        toggleChangedSelected,
        addCardFromDB,
        modifyPlayerHp,
        modifyPlayerBlock,
        modifyPlayerEnergy,
        modifyEnemyHp,
        modifyEnemyBlock,
        addBuffDebuff,
        removeBuffDebuff,
        reduceBuffDebuff,
        updateBuffDebuffStacks,
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
