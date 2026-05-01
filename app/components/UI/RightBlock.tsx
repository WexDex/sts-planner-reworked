'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGameManager } from '@/app/context/GameContext';
import {
  LANTERN_RELIC_NAME,
  canTurnOffLantern,
  getPlayerMaxEnergy,
  hasValidPlannerTurnSelection,
} from '@/app/utils/gameHelpers';
import type { Enemy } from '@/app/types/gameTypes';
import { isEnemyTargetableInPlannerTurn } from '@/app/utils/enemyPlannerTurn';
import BuffDebuffItem from '@/app/components/UI/BuffDebuffItem';
import {
  INTANGIBLE_BUFF_DESCRIPTION,
  INTANGIBLE_BUFF_NAME,
  sortBuffsForDisplay,
} from '@/app/utils/intangibleBuff';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Heart,
  Layers,
  Shield,
  Sparkles,
  Swords,
  User,
  Zap,
} from 'lucide-react';

const BUFF_COMPOSER_ZONE =
  'animate-sts-panel-in rounded-2xl border-2 border-amber-500/25 bg-linear-to-b from-amber-950/40 via-slate-950 to-slate-950 p-4 shadow-[inset_0_1px_0_0_rgba(251,251,113,0.08)] shadow-lg shadow-amber-950/30 ring-1 ring-amber-400/10 transition-all duration-300';

  const RELICS_ZONE =
  'animate-sts-panel-in rounded-2xl border-2 border-lime-500/25 bg-linear-to-b from-lime-950/40 via-slate-950 to-slate-950 p-4 shadow-lg shadow-lime-950/30 ring-1 ring-lime-400/10 transition-all duration-300';

/** Visually separated “combatants” zone vs generic tool panels */
const PLAYER_ZONE =
  'animate-sts-panel-in rounded-2xl border-2 border-blue-500/25 bg-linear-to-b from-blue-950/40 via-slate-950 to-slate-950 p-4 shadow-[inset_0_1px_0_0_rgba(113,113,251,0.08)] shadow-lg shadow-blue-950/30 ring-1 ring-blue-400/10 transition-all duration-300';
const ENEMIES_ZONE =
  'animate-sts-panel-in rounded-2xl border-2 border-rose-500/25 bg-linear-to-b from-rose-950/40 via-slate-950 to-slate-950 p-4 shadow-[inset_0_1px_0_0_rgba(251,113,133,0.08)] shadow-lg shadow-rose-950/30 ring-1 ring-rose-400/10 transition-all duration-300';

const QUICK_DEBUFFS = ['Vulnerable', 'Weak', 'Poison', 'Frail'] as const;
const QUICK_BUFFS = ['Strength', 'Dexterity', 'Focus', 'Artifact'] as const;

type BtnTone = 'rose' | 'sky' | 'amber' | 'slate' | 'emerald' | 'violet';

const toneRing: Record<BtnTone, string> = {
  rose: 'border-rose-500/40 bg-rose-950/35 hover:bg-rose-900/45 text-rose-100',
  sky: 'border-sky-500/40 bg-sky-950/35 hover:bg-sky-900/45 text-sky-100',
  amber: 'border-amber-500/40 bg-amber-950/35 hover:bg-amber-900/45 text-amber-100',
  slate: 'border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-slate-200',
  emerald: 'border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-100',
  violet: 'border-violet-500/40 bg-violet-950/35 hover:bg-violet-900/45 text-violet-100',
};

function StepBtn({
  children,
  onClick,
  tone = 'slate',
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: BtnTone;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[2.25rem] rounded-lg border px-2 py-1.5 text-center text-[11px] font-semibold tabular-nums transition-all duration-150 active:scale-95 hover:brightness-110 ${toneRing[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export default function RightBlock() {
  const {
    gameState,
    turns,
    currentTurnIndex,
    modifyPlayerHp,
    modifyPlayerBlock,
    modifyPlayerEnergy,
    modifyEnemyHp,
    modifyEnemyBlock,
    addBuffDebuff,
    removeBuffDebuff,
    reduceBuffDebuff,
    toggleRelic,
  } = useGameManager();

  const [buffName, setBuffName] = useState('');
  const [buffStacks, setBuffStacks] = useState(1);
  const [buffDescription, setBuffDescription] = useState('');
  const [buffTarget, setBuffTarget] = useState<'player' | 'enemy'>('player');
  const [selectedEnemyIdx, setSelectedEnemyIdx] = useState(0);
  const [playerHpAmt, setPlayerHpAmt] = useState('');
  const [playerBlkAmt, setPlayerBlkAmt] = useState('');
  const [playerNrgAmt, setPlayerNrgAmt] = useState('');
  const [enemyHpAmt, setEnemyHpAmt] = useState<Record<number, string>>({});
  const [enemyBlkAmt, setEnemyBlkAmt] = useState<Record<number, string>>({});
  const [buffAdvancedOpen, setBuffAdvancedOpen] = useState(false);

  const enemies = gameState?.enemies;

  const currentTurn = Number(turns[currentTurnIndex]?.id ?? 1);

  const plannerTargetEnemyIndices = useMemo(() => {
    if (!enemies?.length) return [];
    return enemies
      .map((e, idx) => (isEnemyTargetableInPlannerTurn(e, currentTurn) ? idx : -1))
      .filter((idx) => idx >= 0);
  }, [enemies, currentTurn]);

  useEffect(() => {
    if (!enemies?.length) return;
    setSelectedEnemyIdx((i) => Math.min(Math.max(0, i), enemies.length - 1));
  }, [enemies?.length]);

  useEffect(() => {
    if (buffTarget !== 'enemy') return;
    if (!enemies?.length) return;
    if (plannerTargetEnemyIndices.length === 0) {
      setBuffTarget('player');
      return;
    }
    setSelectedEnemyIdx((prev) =>
      plannerTargetEnemyIndices.includes(prev) ? prev : plannerTargetEnemyIndices[0],
    );
  }, [buffTarget, enemies?.length, plannerTargetEnemyIndices]);

  const activeRelics = gameState?.player.activeRelics ?? [];

  const relicTooltips = useMemo(() => {
    if (!gameState) return [];
    const turnEffects =
      gameState.player.relicEffects?.filter(
        (effect) => effect.enabled !== false && Number(effect.turn) === currentTurn,
      ) ?? [];

    return turnEffects.map((effect, i) => ({
      key: `relic-effect-${currentTurn}-${i}-${effect.effect}`,
      label: effect.effect,
      tooltip: effect.effect,
    }));
  }, [currentTurn, gameState]);

  const handleAddBuff = (type: 'buff' | 'debuff') => {
    if (!buffName.trim()) return;
    if (buffTarget === 'player') {
      addBuffDebuff('player', 0, buffName.trim(), type, buffStacks, buffDescription.trim() || undefined);
    } else {
      addBuffDebuff('enemy', selectedEnemyIdx, buffName.trim(), type, buffStacks, buffDescription.trim() || undefined);
    }
    setBuffName('');
    setBuffStacks(1);
    setBuffDescription('');
  };

  const quickAdd = (name: string, type: 'buff' | 'debuff') => {
    const stacks = Math.max(1, buffStacks);
    if (buffTarget === 'player') {
      addBuffDebuff('player', 0, name, type, stacks);
    } else {
      addBuffDebuff('enemy', selectedEnemyIdx, name, type, stacks);
    }
  };

  const enemyHpKey = (idx: number) => enemyHpAmt[idx] ?? '';
  const enemyBlkKey = (idx: number) => enemyBlkAmt[idx] ?? '';

  if (!gameState) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-slate-800 bg-linear-to-b from-slate-950 to-slate-900">
        <header className="sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">Combat tools</h2>
          <p className="text-[11px] text-slate-500">Load combat data to use this panel.</p>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  if (!hasValidPlannerTurnSelection(turns, currentTurnIndex)) {
    const noPlannerRows = turns.length === 0;
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]">
        <header className="sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-100">
            <Swords className="h-4 w-4 shrink-0 text-cyan-500/90" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold tracking-tight">Combat tools</h2>
              <p className="truncate text-[11px] text-amber-400/95">
                {noPlannerRows ? "No data" : "No planner turn selected"}
              </p>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            {noPlannerRows ? (
              <>
                Add at least one row in{" "}
                <Link href="/turn-maker" className="font-semibold text-amber-300/95 underline-offset-2 hover:underline">
                  Turns
                </Link>{" "}
                — there is no planner snapshot yet.
              </>
            ) : (
              <>
                Add or select a row in{" "}
                <Link href="/turn-maker" className="font-semibold text-amber-300/95 underline-offset-2 hover:underline">
                  Turns
                </Link>
                . Tools here apply to the active planner snapshot.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  const player = gameState.player;
  const hpPct = player.maxHp > 0 ? Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100)) : 0;
  const energyCap = getPlayerMaxEnergy(player);

  const parseUnsigned = (s: string) => Math.max(0, parseInt(s, 10) || 0);
  const parseSigned = (s: string) => parseInt(s, 10) || 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]">
      <header className="sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-slate-100">
          <Swords className="h-4 w-4 shrink-0 text-cyan-500/90" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight">Combat tools</h2>
            <p className="truncate text-[11px] text-slate-500">
              {player.combatName} · {player.combatType} · Fl {player.floor}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 p-3">
        {/* Relics — toggles match encounter relics */}
        {player.relics?.length ? (
          <div className={RELICS_ZONE}>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <Sparkles className="h-3 w-3" /> Relics (tap to toggle bonus)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {player.relics.map((r) => {
                const on = activeRelics.includes(r.name);
                const lanternLockedOff =
                  r.name === LANTERN_RELIC_NAME && on && !canTurnOffLantern(player);
                return (
                  <button
                    key={r.name}
                    type="button"
                    title={
                      lanternLockedOff
                        ? `Need at least 1 energy to turn off. ${r.description ?? ''}`.trim()
                        : (r.description ?? undefined)
                    }
                    disabled={lanternLockedOff}
                    onClick={() => toggleRelic(r.name)}
                    className={`max-w-full truncate rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition ${on
                        ? 'border-cyan-500/60 bg-cyan-950/50 text-cyan-100 shadow-sm shadow-cyan-950/30'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      } ${lanternLockedOff ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Player */}
        <div className={PLAYER_ZONE}>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200">
            <User className="h-3.5 w-3.5 text-slate-400" />
            You
          </h3>

          {relicTooltips.length > 0 ? (
            <div className="mb-4 rounded-xl border border-violet-500/35 bg-violet-950/30 px-2.5 py-2 ring-1 ring-violet-500/10">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-300/90">
                <Sparkles className="h-3 w-3 shrink-0" />
                This turn (relic effects)
              </p>
              <p className="mb-1.5 text-[9px] text-violet-200/55">Planner turn {currentTurn} — encounter relic timing from combat JSON</p>
              <div className="flex flex-wrap gap-1.5">
                {relicTooltips.map((entry) => (
                  <div
                    key={entry.key}
                    className="max-w-full truncate rounded-md border border-violet-500/45 bg-violet-950/55 px-2 py-1 text-[10px] font-medium text-violet-100"
                    title={entry.tooltip}
                  >
                    {entry.label}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mb-4">
            <div className="mb-1 flex justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-rose-400/90" /> HP
              </span>
              <span className="font-mono tabular-nums text-rose-200">
                {player.hp} / {player.maxHp}
              </span>
            </div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-500" style={{ width: `${hpPct}%` }} />
            </div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">Quick</p>
            <div className="mb-2 flex flex-wrap gap-1">
              <StepBtn tone="rose" onClick={() => modifyPlayerHp(-10)}>-10</StepBtn>
              <StepBtn tone="rose" onClick={() => modifyPlayerHp(-5)}>-5</StepBtn>
              <StepBtn tone="rose" onClick={() => modifyPlayerHp(-1)}>-1</StepBtn>
              <StepBtn tone="emerald" onClick={() => modifyPlayerHp(1)}>+1</StepBtn>
              <StepBtn tone="emerald" onClick={() => modifyPlayerHp(5)}>+5</StepBtn>
              <StepBtn tone="emerald" onClick={() => modifyPlayerHp(10)}>+10</StepBtn>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={playerHpAmt}
                onChange={(e) => setPlayerHpAmt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const n = parseUnsigned(playerHpAmt);
                    if (n) {
                      modifyPlayerHp(-n);
                      setPlayerHpAmt('');
                    }
                  }
                }}
                placeholder="Amount…"
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25"
              />
              <button
                type="button"
                className="rounded-xl border border-rose-600/50 bg-rose-900/40 px-3 text-[11px] font-semibold text-rose-100 hover:bg-rose-900/60"
                onClick={() => {
                  const n = parseUnsigned(playerHpAmt);
                  if (n) {
                    modifyPlayerHp(-n);
                    setPlayerHpAmt('');
                  }
                }}
              >
                Dmg
              </button>
              <button
                type="button"
                className="rounded-xl border border-emerald-600/50 bg-emerald-900/35 px-3 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-900/55"
                onClick={() => {
                  const n = parseUnsigned(playerHpAmt);
                  if (n) {
                    modifyPlayerHp(n);
                    setPlayerHpAmt('');
                  }
                }}
              >
                Heal
              </button>
            </div>
          </div>

          <div className="mb-4 border-t border-slate-800/80 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Shield className="h-3 w-3 text-sky-400/90" /> Block
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold tabular-nums text-sky-200">{player.currentBlock ?? 0}</span>
                <button
                  type="button"
                  onClick={() => modifyPlayerBlock(-(player.currentBlock ?? 0))}
                  className="text-[10px] font-medium text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              <StepBtn tone="sky" onClick={() => modifyPlayerBlock(-10)}>-10</StepBtn>
              <StepBtn tone="sky" onClick={() => modifyPlayerBlock(-5)}>-5</StepBtn>
              <StepBtn tone="sky" onClick={() => modifyPlayerBlock(5)}>+5</StepBtn>
              <StepBtn tone="sky" onClick={() => modifyPlayerBlock(10)}>+10</StepBtn>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={playerBlkAmt}
                onChange={(e) => setPlayerBlkAmt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const n = parseSigned(playerBlkAmt);
                    if (n) {
                      modifyPlayerBlock(n);
                      setPlayerBlkAmt('');
                    }
                  }
                }}
                placeholder="± block"
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/25"
              />
              <button
                type="button"
                className="rounded-xl border border-sky-600/50 bg-sky-900/40 px-3 text-[11px] font-semibold text-sky-100 hover:bg-sky-900/60"
                onClick={() => {
                  const n = parseSigned(playerBlkAmt);
                  if (n) {
                    modifyPlayerBlock(n);
                    setPlayerBlkAmt('');
                  }
                }}
              >
                Apply
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <div className="mb-2 flex justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400/90" /> Energy
              </span>
              <span className="font-mono tabular-nums text-amber-200">
                {player.currentEnergy ?? 0} / {energyCap}
              </span>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              <StepBtn tone="amber" onClick={() => modifyPlayerEnergy(-3)}>-3</StepBtn>
              <StepBtn tone="amber" onClick={() => modifyPlayerEnergy(-1)}>-1</StepBtn>
              <StepBtn tone="amber" onClick={() => modifyPlayerEnergy(1)}>+1</StepBtn>
              <StepBtn tone="amber" onClick={() => modifyPlayerEnergy(3)}>+3</StepBtn>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={playerNrgAmt}
                onChange={(e) => setPlayerNrgAmt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const n = parseSigned(playerNrgAmt);
                    if (n) {
                      modifyPlayerEnergy(n);
                      setPlayerNrgAmt('');
                    }
                  }
                }}
                placeholder="± energy"
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
              />
              <button
                type="button"
                className="rounded-xl border border-amber-600/50 bg-amber-900/35 px-3 text-[11px] font-semibold text-amber-100 hover:bg-amber-900/55"
                onClick={() => {
                  const n = parseSigned(playerNrgAmt);
                  if (n) {
                    modifyPlayerEnergy(n);
                    setPlayerNrgAmt('');
                  }
                }}
              >
                Apply
              </button>
            </div>
          </div>

          {(player.bonusBlock ?? 0) > 0 && (
            <p className="mt-3 text-[11px] text-emerald-400/90">Bonus block: {player.bonusBlock}</p>
          )}

          <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Your buffs</p>
              <button
                type="button"
                title={`Uses “Stacks” from Status below (currently ${Math.max(1, buffStacks)})`}
                onClick={() =>
                  addBuffDebuff(
                    'player',
                    0,
                    INTANGIBLE_BUFF_NAME,
                    'buff',
                    Math.max(1, buffStacks),
                    INTANGIBLE_BUFF_DESCRIPTION,
                  )
                }
                className="rounded-lg border border-violet-500/35 bg-slate-900/60 px-2 py-1 text-[10px] font-semibold text-violet-200/90 transition hover:border-violet-500/50 hover:bg-violet-950/40 active:scale-95"
              >
                + Intangible ({Math.max(1, buffStacks)} turn{Math.max(1, buffStacks) !== 1 ? 's' : ''})
              </button>
            </div>
            {player.buffsDebuffs && player.buffsDebuffs.length > 0 && (
              <div className="space-y-1.5">
                {sortBuffsForDisplay(player.buffsDebuffs).map((bd, idx) => (
                  <BuffDebuffItem
                    key={`${bd.name}-${idx}`}
                    bd={bd}
                    onReduce={() => reduceBuffDebuff('player', 0, bd.name)}
                    onRemove={() => removeBuffDebuff('player', 0, bd.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enemies — all visible; zone styled separately from tool panels */}
        {enemies && enemies.length > 0 && (
          <div className={ENEMIES_ZONE}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/15 pb-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-rose-100/95">
                <Layers className="h-3.5 w-3.5 text-rose-400" />
                Enemies
                <span className="rounded-md border border-rose-500/30 bg-rose-950/50 px-1.5 py-0.5 font-mono text-[10px] font-normal tabular-nums text-rose-200/90">
                  {enemies.length}
                </span>
              </h3>
              <p className="text-[10px] text-rose-200/50">Each row is one combatant</p>
            </div>

            <div className="flex flex-col gap-3">
              {enemies.map((enemy: Enemy, idx: number) => {
                const eHpPct = enemy.maxHp > 0 ? Math.min(100, Math.max(0, (enemy.hp / enemy.maxHp) * 100)) : 0;
                const isBuffFocus = buffTarget === 'enemy' && selectedEnemyIdx === idx;
                return (
                  <div
                    key={`${enemy.name}-${idx}`}
                    className={`rounded-xl border bg-slate-900/55 p-3 transition-all duration-200 ${isBuffFocus
                        ? 'border-rose-400/55 shadow-md shadow-rose-950/25 ring-1 ring-rose-400/25'
                        : 'border-slate-700/80 hover:border-slate-600'
                      }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-50">{enemy.name}</p>
                        {isBuffFocus ? (
                          <p className="mt-0.5 text-[10px] font-medium text-rose-300/80">Status target</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 rounded-md border border-slate-600/80 bg-slate-950/70 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-slate-400">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                      <span>HP</span>
                      <span className="font-mono tabular-nums text-rose-200">
                        {enemy.hp} / {enemy.maxHp}
                      </span>
                    </div>
                    <div className="mb-2 h-1 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full bg-rose-600" style={{ width: `${eHpPct}%` }} />
                    </div>
                    <div className="mb-2 flex flex-wrap gap-1">
                      <StepBtn tone="rose" onClick={() => modifyEnemyHp(idx, -10)}>-10</StepBtn>
                      <StepBtn tone="rose" onClick={() => modifyEnemyHp(idx, -5)}>-5</StepBtn>
                      <StepBtn tone="emerald" onClick={() => modifyEnemyHp(idx, 5)}>+5</StepBtn>
                      <StepBtn tone="emerald" onClick={() => modifyEnemyHp(idx, 10)}>+10</StepBtn>
                    </div>
                    <div className="mb-4 flex gap-2">
                      <input
                        type="number"
                        value={enemyHpKey(idx)}
                        onChange={(e) => setEnemyHpAmt((m) => ({ ...m, [idx]: e.target.value }))}
                        placeholder="Amount…"
                        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        className="rounded-lg bg-rose-700/80 px-2.5 text-[11px] font-semibold hover:bg-rose-600"
                        onClick={() => {
                          const n = parseUnsigned(enemyHpKey(idx));
                          if (n) {
                            modifyEnemyHp(idx, -n);
                            setEnemyHpAmt((m) => ({ ...m, [idx]: '' }));
                          }
                        }}
                      >
                        Dmg
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-800/80 px-2.5 text-[11px] font-semibold hover:bg-emerald-700"
                        onClick={() => {
                          const n = parseUnsigned(enemyHpKey(idx));
                          if (n) {
                            modifyEnemyHp(idx, n);
                            setEnemyHpAmt((m) => ({ ...m, [idx]: '' }));
                          }
                        }}
                      >
                        Heal
                      </button>
                    </div>

                    <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Block</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sky-200">{enemy.currentBlock ?? 0}</span>
                        <button
                          type="button"
                          onClick={() => modifyEnemyBlock(idx, -(enemy.currentBlock ?? 0))}
                          className="text-[10px] text-slate-500 hover:text-slate-300 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="mb-2 flex flex-wrap gap-1">
                      <StepBtn tone="sky" onClick={() => modifyEnemyBlock(idx, -10)}>-10</StepBtn>
                      <StepBtn tone="sky" onClick={() => modifyEnemyBlock(idx, 5)}>+5</StepBtn>
                      <StepBtn tone="sky" onClick={() => modifyEnemyBlock(idx, 10)}>+10</StepBtn>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={enemyBlkKey(idx)}
                        onChange={(e) => setEnemyBlkAmt((m) => ({ ...m, [idx]: e.target.value }))}
                        placeholder="± block"
                        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        className="rounded-lg border border-sky-600/50 bg-sky-900/40 px-3 text-[11px] font-semibold text-sky-100"
                        onClick={() => {
                          const n = parseSigned(enemyBlkKey(idx));
                          if (n) {
                            modifyEnemyBlock(idx, n);
                            setEnemyBlkAmt((m) => ({ ...m, [idx]: '' }));
                          }
                        }}
                      >
                        Apply
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 border-t border-slate-800/80 pt-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Buffs</p>
                        <button
                          type="button"
                          title={`Uses “Stacks” from Status below (currently ${Math.max(1, buffStacks)})`}
                          onClick={() =>
                            addBuffDebuff(
                              'enemy',
                              idx,
                              INTANGIBLE_BUFF_NAME,
                              'buff',
                              Math.max(1, buffStacks),
                              INTANGIBLE_BUFF_DESCRIPTION,
                            )
                          }
                          className="rounded-lg border border-violet-500/35 bg-slate-900/60 px-2 py-1 text-[10px] font-semibold text-violet-200/90 transition hover:border-violet-500/50 hover:bg-violet-950/40 active:scale-95"
                        >
                          + Intangible ({Math.max(1, buffStacks)} turn
                          {Math.max(1, buffStacks) !== 1 ? 's' : ''})
                        </button>
                      </div>
                      {enemy.buffsDebuffs && enemy.buffsDebuffs.length > 0 && (
                        <div className="space-y-1">
                          {sortBuffsForDisplay(enemy.buffsDebuffs).map((bd, buffIdx) => (
                            <BuffDebuffItem
                              key={`${bd.name}-${buffIdx}`}
                              bd={bd}
                              onReduce={() => reduceBuffDebuff('enemy', idx, bd.name)}
                              onRemove={() => removeBuffDebuff('enemy', idx, bd.name)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buff composer */}
        <div className={BUFF_COMPOSER_ZONE}>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Activity className="h-3.5 w-3.5 text-violet-400/90" />
            Status
          </h3>

          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">Target</p>
          <div className="mb-3 flex flex-wrap gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
            <button
              type="button"
              onClick={() => setBuffTarget('player')}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${buffTarget === 'player'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              You
            </button>
            {plannerTargetEnemyIndices.map((idx) => {
              const enemy = enemies![idx];
              if (!enemy) return null;
              return (
              <button
                key={`bt-${idx}`}
                type="button"
                onClick={() => {
                  setBuffTarget('enemy');
                  setSelectedEnemyIdx(idx);
                }}
                className={`max-w-[10rem] truncate rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${buffTarget === 'enemy' && selectedEnemyIdx === idx
                    ? 'bg-rose-600/90 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                {enemy.name}
              </button>
            );
            })}
          </div>
          {enemies && enemies.length > 0 && plannerTargetEnemyIndices.length === 0 ? (
            <p className="mb-3 text-[10px] leading-relaxed text-slate-600">
              No enemies are targetable for planner turn {currentTurn} yet — add an intent row with at least one action, or
              &quot;No action&quot; if they should count as in combat.
            </p>
          ) : null}

          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Stacks <span className="font-normal normal-case text-slate-600">(quick + custom)</span>
          </p>
          <div className="mb-3 flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 transition-colors duration-300 focus-within:border-violet-500/35 focus-within:ring-1 focus-within:ring-violet-500/20">
            <button
              type="button"
              aria-label="Fewer stacks"
              className="rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-90"
              onClick={() => setBuffStacks((s) => Math.max(1, s - 1))}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-mono font-bold tabular-nums text-violet-200 transition-transform duration-200">
              {buffStacks}
            </span>
            <button
              type="button"
              aria-label="More stacks"
              className="rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-90"
              onClick={() => setBuffStacks((s) => s + 1)}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">Quick add</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {QUICK_DEBUFFS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => quickAdd(name, 'debuff')}
                className="rounded-lg border border-amber-900/50 bg-amber-950/40 px-2.5 py-1.5 text-[10px] font-medium text-amber-200/90 shadow-sm transition-all duration-200 hover:bg-amber-950/65 hover:shadow-md active:scale-95"
              >
                + {name}
              </button>
            ))}
            {QUICK_BUFFS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => quickAdd(name, 'buff')}
                className="rounded-lg border border-emerald-900/50 bg-emerald-950/35 px-2.5 py-1.5 text-[10px] font-medium text-emerald-200/90 shadow-sm transition-all duration-200 hover:bg-emerald-950/55 hover:shadow-md active:scale-95"
              >
                + {name}
              </button>
            ))}
          </div>

          <div className="mb-2">
            <input
              type="text"
              value={buffName}
              onChange={(e) => setBuffName(e.target.value)}
              placeholder="Custom name…"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs outline-none transition-all duration-200 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15"
            />
          </div>

          <button
            type="button"
            onClick={() => setBuffAdvancedOpen((o) => !o)}
            className="mb-2 flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/70 active:scale-[0.99]"
          >
            Notes (optional)
            <span className={`transition-transform duration-200 ${buffAdvancedOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-3 w-3" />
            </span>
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${buffAdvancedOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="min-h-0 overflow-hidden">
              <input
                type="text"
                value={buffDescription}
                onChange={(e) => setBuffDescription(e.target.value)}
                placeholder="Tooltip / description"
                className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs transition-all duration-200 focus:border-violet-500/40"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!buffName.trim()}
              onClick={() => handleAddBuff('buff')}
              className="flex-1 rounded-xl border border-emerald-600/50 bg-emerald-800/50 py-2 text-[11px] font-semibold text-emerald-100 transition-all duration-200 hover:bg-emerald-800/70 hover:shadow-lg hover:shadow-emerald-950/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add buff
            </button>
            <button
              type="button"
              disabled={!buffName.trim()}
              onClick={() => handleAddBuff('debuff')}
              className="flex-1 rounded-xl border border-amber-600/50 bg-amber-900/45 py-2 text-[11px] font-semibold text-amber-100 transition-all duration-200 hover:bg-amber-900/65 hover:shadow-lg hover:shadow-amber-950/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add debuff
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-600">
            Quick chips use the stacks value above. Custom add uses the same stacks and needs a name.
          </p>
        </div>
      </div>
    </div>
  );
}
