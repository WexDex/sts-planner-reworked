'use client';

import { useGameManager } from '@/app/context/GameContext';

export function GameStateDisplay() {
  const { gameState, isLoading, error } = useGameManager();

  if (isLoading) {
    return <div className="p-4">Loading game data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!gameState) {
    return <div className="p-4">No game data available</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Combat Info</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Combat Type</p>
          <p className="text-xl font-semibold">{gameState.player.combatType}</p>
        </div>
        <div>
          <p className="text-gray-600">Combat Name</p>
          <p className="text-xl font-semibold">{gameState.player.combatName}</p>
        </div>
        <div>
          <p className="text-gray-600">Floor</p>
          <p className="text-xl font-semibold">{gameState.player.floor}</p>
        </div>
        <div>
          <p className="text-gray-600">Health</p>
          <p className="text-xl font-semibold">
            {gameState.player.hp} / {gameState.player.maxHp}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Relics ({gameState.player.relics.length})</h3>
        <ul className="mt-2 space-y-2">
          {gameState.player.relics.map((relic, idx) => (
            <li key={idx} className="text-sm text-gray-700">
              • {relic.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
