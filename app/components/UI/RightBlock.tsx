'use client';

import React, { useState } from 'react';
import { useGameManager } from '@/app/context/GameContext';
import { Enemy, BuffDebuff } from '@/app/types/gameTypes';
import { Minus } from 'lucide-react';
import BuffDebuffItem from '@/app/components/UI/BuffDebuffItem';

export default function RightBlock() {
  const {
    gameState,
    modifyPlayerHp,
    modifyPlayerBlock,
    modifyPlayerEnergy,
    modifyEnemyHp,
    modifyEnemyBlock,
    addBuffDebuff,
    removeBuffDebuff,
    reduceBuffDebuff,
  } = useGameManager();

  const [buffName, setBuffName] = useState('');
  const [buffStacks, setBuffStacks] = useState(1);
  const [buffDescription, setBuffDescription] = useState('');
  const [buffTarget, setBuffTarget] = useState<'player' | 'enemy'>('player');
  const [selectedEnemyIdx, setSelectedEnemyIdx] = useState(0);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({
    playerDamage: '0',
    playerBlock: '0',
    playerEnergy: '0',
  });

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  if (!gameState) {
    return (
      <div className="fixed right-0 top-0 bottom-28 w-80 bg-linear-to-b from-gray-900 to-gray-950 border-l-2 border-amber-600 overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b-2 border-amber-600 p-4">
          <h2 className="text-lg font-bold text-amber-300">Combat Panel</h2>
        </div>
        <div className="p-4 text-gray-400 text-center">Loading...</div>
      </div>
    );
  }

  const player = gameState.player;
  const enemies = gameState.enemies;

  const handleAddBuff = (type: 'buff' | 'debuff') => {
    if (!buffName.trim()) return;

    if (buffTarget === 'player') {
      addBuffDebuff('player', 0, buffName, type, buffStacks, buffDescription || undefined);
    } else {
      addBuffDebuff('enemy', selectedEnemyIdx, buffName, type, buffStacks, buffDescription || undefined);
    }
    
    setBuffName('');
    setBuffStacks(1);
    setBuffDescription('');
  };

  const handleReduceBuff = (target: 'player' | 'enemy', enemyIndex: number, name: string) => {
    reduceBuffDebuff(target, enemyIndex, name);
  };

  const handleRemoveBuff = (target: 'player' | 'enemy', enemyIndex: number, name: string) => {
    removeBuffDebuff(target, enemyIndex, name);
  };

  const applyPlayerDamage = () => {
    const damage = Math.abs(parseInt(inputs.playerDamage) || 0);
    if (damage > 0) {
      modifyPlayerHp(-damage);
      handleInputChange('playerDamage', '0');
    }
  };

  const applyPlayerBlock = () => {
    const block = Math.abs(parseInt(inputs.playerBlock) || 0);
    if (block > 0) {
      modifyPlayerBlock(block);
      handleInputChange('playerBlock', '0');
    }
  };

  const applyPlayerEnergy = () => {
    const energy = parseInt(inputs.playerEnergy) || 0;
    if (energy !== 0) {
      modifyPlayerEnergy(energy);
      handleInputChange('playerEnergy', '0');
    }
  };

  const applyEnemyDamage = (enemyIdx: number) => {
    const key = `enemyDamage${enemyIdx}`;
    const damage = Math.abs(parseInt(inputs[key]) || 0);
    if (damage > 0) {
      modifyEnemyHp(enemyIdx, -damage);
      handleInputChange(key, '0');
    }
  };

  const applyEnemyBlock = (enemyIdx: number) => {
    const key = `enemyBlock${enemyIdx}`;
    const block = Math.abs(parseInt(inputs[key]) || 0);
    if (block > 0) {
      modifyEnemyBlock(enemyIdx, block);
      handleInputChange(key, '0');
    }
  };

  return (
    <div className="fixed right-0 top-0 bottom-28 w-80 bg-linear-to-b from-gray-900 to-gray-950 border-l-2 border-amber-600 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-800 border-b-2 border-amber-600 p-4">
        <h2 className="text-lg font-bold text-amber-300">Combat Panel</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Player Stats Section */}
        <div className="bg-gray-800 rounded-lg border border-amber-500 p-4">
          <h3 className="text-amber-300 font-bold mb-3">Player Stats</h3>

          {/* HP */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">HP</span>
              <span className="text-sm font-bold text-red-400">
                {player.hp} / {player.maxHp}
              </span>
            </div>
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => modifyPlayerHp(-10)}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white text-xs py-1 rounded"
              >
                -10
              </button>
              <button
                onClick={() => modifyPlayerHp(-1)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs py-1 rounded"
              >
                -1
              </button>
              <button
                onClick={() => modifyPlayerHp(1)}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-1 rounded"
              >
                +1
              </button>
              <button
                onClick={() => modifyPlayerHp(10)}
                className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs py-1 rounded"
              >
                +10
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.playerDamage}
                onChange={(e) => handleInputChange('playerDamage', e.target.value)}
                placeholder="Damage"
                className="flex-1 bg-gray-700 text-white text-xs p-2 rounded border border-gray-600"
              />
              <button
                onClick={applyPlayerDamage}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded"
              >
                Dmg
              </button>
            </div>
          </div>

          {/* Block */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Block</span>
              <span className="text-sm font-bold text-blue-400">
                {player.currentBlock ?? 0}
              </span>
            </div>
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => modifyPlayerBlock(-10)}
                className="flex-1 bg-blue-700 hover:bg-blue-600 text-white text-xs py-1 rounded"
              >
                -10
              </button>
              <button
                onClick={() => modifyPlayerBlock(-1)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 rounded"
              >
                -1
              </button>
              <button
                onClick={() => modifyPlayerBlock(1)}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-1 rounded"
              >
                +1
              </button>
              <button
                onClick={() => modifyPlayerBlock(10)}
                className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white text-xs py-1 rounded"
              >
                +10
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.playerBlock}
                onChange={(e) => handleInputChange('playerBlock', e.target.value)}
                placeholder="Block"
                className="flex-1 bg-gray-700 text-white text-xs p-2 rounded border border-gray-600"
              />
              <button
                onClick={applyPlayerBlock}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-3 rounded"
              >
                Blk
              </button>
            </div>
          </div>

          {/* Energy */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Energy</span>
              <span className="text-sm font-bold text-yellow-400">
                {player.currentEnergy ?? 0} / {player.energy.base + (player.bonusEnergy ?? 0)}
              </span>
            </div>
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => modifyPlayerEnergy(-3)}
                className="flex-1 bg-yellow-700 hover:bg-yellow-600 text-white text-xs py-1 rounded"
              >
                -3
              </button>
              <button
                onClick={() => modifyPlayerEnergy(-2)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-1 rounded"
              >
                -2
              </button>
              <button
                onClick={() => modifyPlayerEnergy(-1)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-1 rounded"
              >
                -1
              </button>
              <button
                onClick={() => modifyPlayerEnergy(1)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white text-xs py-1 rounded"
              >
                +1
              </button>
              <button
                onClick={() => modifyPlayerEnergy(2)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-1 rounded"
              >
                +2
              </button>
              <button
                onClick={() => modifyPlayerEnergy(3)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-1 rounded"
              >
                +3
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.playerEnergy}
                onChange={(e) => handleInputChange('playerEnergy', e.target.value)}
                placeholder="Energy ±"
                className="flex-1 bg-gray-700 text-white text-xs p-2 rounded border border-gray-600"
              />
              <button
                onClick={applyPlayerEnergy}
                className="bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-bold py-2 px-3 rounded"
              >
                ±
              </button>
            </div>
          </div>

          {/* Bonus Block */}
          {(player.bonusBlock ?? 0) > 0 && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Bonus Block</span>
                <span className="text-sm font-bold text-green-400">{player.bonusBlock}</span>
              </div>
            </div>
          )}

          {/* Intangible */}
          {player.intangible && (
            <div className="mb-3 p-2 bg-purple-900/50 rounded border border-purple-600 text-xs text-purple-300">
              Status: Intangible
            </div>
          )}

          {/* Buffs/Debuffs for Player */}
          {(player.buffsDebuffs && player.buffsDebuffs.length > 0) && (
            <div className="mt-4 space-y-1">
              <div className="text-xs text-gray-400 font-semibold mb-2">Buffs & Debuffs</div>
              {player.buffsDebuffs.map((bd, idx) => (
                <BuffDebuffItem
                  key={idx}
                  bd={bd}
                  onReduce={() => handleReduceBuff('player', 0, bd.name)}
                  onRemove={() => handleRemoveBuff('player', 0, bd.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Enemies Stats Section */}
        {enemies?.map((enemy: Enemy, idx: number) => (
          <div key={idx} className="bg-gray-800 rounded-lg border border-red-600 p-4">
            <h3 className="text-red-400 font-bold mb-3">{enemy.name}</h3>

            {/* Enemy HP */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">HP</span>
                <span className="text-sm font-bold text-red-400">
                  {enemy.hp} / {enemy.maxHp}
                </span>
              </div>
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => modifyEnemyHp(idx, -10)}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white text-xs py-1 rounded"
                >
                  -10
                </button>
                <button
                  onClick={() => modifyEnemyHp(idx, -5)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs py-1 rounded"
                >
                  -5
                </button>
                <button
                  onClick={() => modifyEnemyHp(idx, 5)}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-1 rounded"
                >
                  +5
                </button>
                <button
                  onClick={() => modifyEnemyHp(idx, 10)}
                  className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs py-1 rounded"
                >
                  +10
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs[`enemyDamage${idx}`] || '0'}
                  onChange={(e) => handleInputChange(`enemyDamage${idx}`, e.target.value)}
                  placeholder="Damage"
                  className="flex-1 bg-gray-700 text-white text-xs p-2 rounded border border-gray-600"
                />
                <button
                  onClick={() => applyEnemyDamage(idx)}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded"
                >
                  Dmg
                </button>
              </div>
            </div>

            {/* Enemy Block */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Block</span>
                <span className="text-sm font-bold text-blue-400">
                  {enemy.currentBlock ?? 0}
                </span>
              </div>
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => modifyEnemyBlock(idx, -10)}
                  className="flex-1 bg-blue-700 hover:bg-blue-600 text-white text-xs py-1 rounded"
                >
                  -10
                </button>
                <button
                  onClick={() => modifyEnemyBlock(idx, -1)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 rounded"
                >
                  -1
                </button>
                <button
                  onClick={() => modifyEnemyBlock(idx, 1)}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-1 rounded"
                >
                  +1
                </button>
                <button
                  onClick={() => modifyEnemyBlock(idx, 10)}
                  className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white text-xs py-1 rounded"
                >
                  +10
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs[`enemyBlock${idx}`] || '0'}
                  onChange={(e) => handleInputChange(`enemyBlock${idx}`, e.target.value)}
                  placeholder="Block"
                  className="flex-1 bg-gray-700 text-white text-xs p-2 rounded border border-gray-600"
                />
                <button
                  onClick={() => applyEnemyBlock(idx)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-3 rounded"
                >
                  Blk
                </button>
              </div>
            </div>

            {/* Enemy Buffs/Debuffs */}
            {(enemy.buffsDebuffs && enemy.buffsDebuffs.length > 0) && (
              <div className="mt-4 space-y-1">
                <div className="text-xs text-gray-400 font-semibold mb-2">Buffs & Debuffs</div>
                {enemy.buffsDebuffs.map((bd, buffIdx) => (
                  <BuffDebuffItem
                    key={buffIdx}
                    bd={bd}
                    onReduce={() => handleReduceBuff('enemy', idx, bd.name)}
                    onRemove={() => handleRemoveBuff('enemy', idx, bd.name)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Add Custom Buff/Debuff Section */}
        <div className="bg-gray-800 rounded-lg border border-purple-600 p-4">
          <h3 className="text-white font-bold mb-3">Add Custom Buff/Debuff</h3>

          {/* Target Selection */}
          <div className="mb-3">
            <select
              value={buffTarget === 'player' ? 'player' : `enemy-${selectedEnemyIdx}`}
              onChange={(e) => {
                if (e.target.value === 'player') {
                  setBuffTarget('player');
                } else {
                  setBuffTarget('enemy');
                  setSelectedEnemyIdx(parseInt(e.target.value.split('-')[1]));
                }
              }}
              className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600"
            >
              <option value="player">Player</option>
              {enemies?.map((enemy: Enemy, idx: number) => (
                <option key={idx} value={`enemy-${idx}`}>
                  {enemy.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buff Name */}
          <div className="mb-3">
            <input
              type="text"
              value={buffName}
              onChange={(e) => setBuffName(e.target.value)}
              placeholder="Buff/Debuff name"
              className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600 placeholder-gray-500"
            />
          </div>

          {/* Stacks */}
          <div className="mb-3">
            <input
              type="number"
              value={buffStacks}
              onChange={(e) => setBuffStacks(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600"
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <input
              type="text"
              value={buffDescription}
              onChange={(e) => setBuffDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600 placeholder-gray-500"
            />
          </div>

          {/* Add Buff/Debuff Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                handleAddBuff('buff');
              }}
              disabled={!buffName.trim()}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs py-2 rounded font-bold"
            >
              Add Buff
            </button>
            <button
              onClick={() => {
                handleAddBuff('debuff');
              }}
              disabled={!buffName.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs py-2 rounded font-bold"
            >
              Add Debuff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
