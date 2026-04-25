'use client';

import { useGameManager } from '@/app/context/GameContext';
import {
  takeDamage,
  healPlayer,
  applyDamageWithModifiers,
  addRelic,
  removeRelic,
  getGameStats,
  downloadGameData,
  addCardToDeck,
  removeCardFromDeck,
} from '@/app/utils/gameHelpers';
import { useState } from 'react';

export function GameActionsExample() {
  const { gameState, updateGameState, saveGameData, loadSavedGame, resetGameState } =
    useGameManager();
  const [damageAmount, setDamageAmount] = useState('10');
  const [healAmount, setHealAmount] = useState('5');

  if (!gameState) return null;

  const stats = getGameStats(gameState);

  const handleTakeDamage = () => {
    const damage = parseInt(damageAmount) || 0;
    const updatedPlayer = takeDamage(gameState.player, damage);
    updateGameState({ player: updatedPlayer });
  };

  const handleHeal = () => {
    const amount = parseInt(healAmount) || 0;
    const updatedPlayer = healPlayer(gameState.player, amount);
    updateGameState({ player: updatedPlayer });
  };

  const handleApplyModifiedDamage = () => {
    const updatedPlayer = applyDamageWithModifiers(
      gameState.player,
      20,
      true, // vulnerable
      false
    );
    updateGameState({ player: updatedPlayer });
  };

  const handleAddTestRelic = () => {
    const testRelic = {
      name: 'Test Relic',
      description: 'A test relic for demonstration',
    };
    const updatedPlayer = addRelic(gameState.player, testRelic);
    updateGameState({ player: updatedPlayer });
  };

  const handleRemoveLastRelic = () => {
    if (gameState.player.relics.length > 0) {
      const lastRelic = gameState.player.relics[gameState.player.relics.length - 1];
      const updatedPlayer = removeRelic(gameState.player, lastRelic.name);
      updateGameState({ player: updatedPlayer });
    }
  };

  const handleSaveGame = () => {
    saveGameData();
    alert('Game saved to browser storage!');
  };

  const handleLoadGame = () => {
    const loaded = loadSavedGame();
    alert(loaded ? 'Game loaded!' : 'No saved game found');
  };

  const handleDownloadGame = () => {
    downloadGameData(gameState, `combat-${gameState.player.combatName}.json`);
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded shadow">
      <div>
        <h3 className="text-lg font-semibold mb-2">Game Statistics</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>Deck Size: <span className="font-semibold">{stats.deckSize}</span></p>
          <p>Total Damage: <span className="font-semibold">{stats.totalDamageInDeck}</span></p>
          <p>Total Block: <span className="font-semibold">{stats.totalBlockInDeck}</span></p>
          <p>HP: <span className="font-semibold">{stats.hpPercent.toFixed(1)}%</span></p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Combat Actions</h3>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={damageAmount}
              onChange={(e) => setDamageAmount(e.target.value)}
              placeholder="Damage amount"
              className="px-2 py-1 border rounded w-24"
            />
            <button
              onClick={handleTakeDamage}
              className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Take Damage
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={healAmount}
              onChange={(e) => setHealAmount(e.target.value)}
              placeholder="Heal amount"
              className="px-2 py-1 border rounded w-24"
            />
            <button
              onClick={handleHeal}
              className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Heal
            </button>
          </div>

          <button
            onClick={handleApplyModifiedDamage}
            className="w-full px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Take 20 Damage (Vulnerable)
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Relic Management</h3>
        <div className="flex gap-2">
          <button
            onClick={handleAddTestRelic}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Relic
          </button>
          <button
            onClick={handleRemoveLastRelic}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={gameState.player.relics.length === 0}
          >
            Remove Last
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Save/Load</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSaveGame}
            className="px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Save Game
          </button>
          <button
            onClick={handleLoadGame}
            className="px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Load Game
          </button>
          <button
            onClick={handleDownloadGame}
            className="px-4 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Download
          </button>
          <button
            onClick={resetGameState}
            className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
