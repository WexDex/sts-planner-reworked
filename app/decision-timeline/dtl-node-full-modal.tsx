'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Beaker, Hexagon, Heart, Layers, ScrollText, X } from 'lucide-react';
import type {
  ActivityLogEntry,
  Card,
  CardReference,
  CombatData,
  DecisionNode,
  OrbType,
  Turn,
} from '@/app/types/gameTypes';
import { cardTypeStyles } from '@/app/types/types';
import { DtlBranchCombatIntel } from './dtl-branch-combat-panel';
import {
  activityLogHasPhaseBoundaryMarkers,
  clusterActivityLogByPhaseBoundaries,
  type ActivityLogPhaseCluster,
} from '@/app/utils/activityLogPhaseClusters';
import { ActivityLogRowInline } from '@/app/components/activity-log/activity-log-rows';

type Tab = 'overview' | 'piles' | 'log';
type PileKey = 'hand' | 'draw' | 'discard' | 'exhaust' | 'played';
type Density = 'minimal' | 'detailed';
type KnownCardType = keyof typeof cardTypeStyles;

function isFullCard(c: Card | CardReference): c is Card {
  return 'name' in c && typeof (c as Card).name === 'string';
}

function cardLabel(c: Card | CardReference): string {
  if (isFullCard(c)) return `${c.name}${c.isUpgraded ? '+' : ''}`;
  const ref = c as CardReference;
  return `${ref.card_ID ?? '?'}${ref.isUpgraded ? '+' : ''}`;
}

function cardTypeKey(c: Card | CardReference): KnownCardType {
  const raw = isFullCard(c) ? (c as Card).type : undefined;
  const t = (raw ?? '').trim();
  return t in cardTypeStyles ? (t as KnownCardType) : 'Status';
}

function cardCost(c: Card | CardReference): string {
  if (!isFullCard(c)) return '?';
  const card = c as Card;
  if (card.xCost) return 'X';
  const cost = card.cost;
  if (cost == null) return '0';
  if (typeof cost === 'number') return String(cost);
  return String((cost as { base?: number }).base ?? 0);
}

function PileList({ cards }: { cards: (Card | CardReference)[] }) {
  if (cards.length === 0) {
    return <p className="py-4 text-center text-[10px] italic text-slate-600">Empty</p>;
  }
  return (
    <ul className="divide-y divide-slate-800/60">
      {cards.map((c, i) => {
        const type = cardTypeKey(c);
        const style = cardTypeStyles[type];
        return (
          <li key={i} className="flex items-center gap-2 px-1 py-1.5">
            <span
              className={`shrink-0 rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide border ${style.border} ${style.nameBg} ${style.typeColor}`}
            >
              {type}
            </span>
            <span className="flex-1 truncate text-[11px] text-slate-200">{cardLabel(c)}</span>
            <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
              {cardCost(c)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function orbSymbol(orb: OrbType): { sym: string; cls: string; label: string } {
  switch (orb) {
    case 'lightning': return { sym: '⚡', cls: 'text-yellow-300', label: 'Lightning' };
    case 'dark':      return { sym: '◆',  cls: 'text-violet-400', label: 'Dark' };
    case 'frost':     return { sym: '❄',  cls: 'text-sky-300',    label: 'Frost' };
    case 'plasma':    return { sym: '✦',  cls: 'text-pink-300',   label: 'Plasma' };
    default:          return { sym: '○',  cls: 'text-slate-400',  label: orb as string };
  }
}

function OrbList({ orbs, maxSlots }: { orbs: OrbType[]; maxSlots: number }) {
  if (orbs.length === 0 && maxSlots === 0) {
    return <p className="py-4 text-center text-[10px] italic text-slate-600">No orb channels</p>;
  }
  const slots = Array.from({ length: Math.max(maxSlots, orbs.length) }, (_, i) => orbs[i] ?? null);
  return (
    <ul className="divide-y divide-slate-800/60">
      {slots.map((orb, i) => {
        if (orb === null) {
          return (
            <li key={i} className="flex items-center gap-3 px-2 py-2">
              <span className="text-[14px] text-slate-700">○</span>
              <span className="text-[11px] italic text-slate-600">Empty slot</span>
              <span className="ml-auto text-[10px] text-slate-700">#{i + 1}</span>
            </li>
          );
        }
        const { sym, cls, label } = orbSymbol(orb);
        return (
          <li key={i} className="flex items-center gap-3 px-2 py-2">
            <span className={`text-[16px] leading-none ${cls}`}>{sym}</span>
            <span className={`text-[12px] font-semibold ${cls}`}>{label}</span>
            <span className="ml-auto text-[10px] text-slate-600">slot {i + 1}</span>
          </li>
        );
      })}
    </ul>
  );
}

function PotionList({ potions }: { potions: (Card | null)[] }) {
  const nonEmpty = potions.filter((p): p is Card => p !== null && isFullCard(p));
  if (potions.length === 0) {
    return <p className="py-4 text-center text-[10px] italic text-slate-600">No potion belt</p>;
  }
  return (
    <ul className="divide-y divide-slate-800/60">
      {potions.map((p, i) => {
        if (p === null || !isFullCard(p)) {
          return (
            <li key={i} className="flex items-center gap-3 px-2 py-2">
              <Beaker className="h-4 w-4 shrink-0 text-slate-700" strokeWidth={1.5} />
              <span className="text-[11px] italic text-slate-600">Empty slot</span>
              <span className="ml-auto text-[10px] text-slate-700">#{i + 1}</span>
            </li>
          );
        }
        return (
          <li key={i} className="flex items-center gap-3 px-2 py-2">
            <Beaker className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={1.5} />
            <span className="flex-1 truncate text-[12px] font-semibold text-amber-200">{p.name}</span>
            <span className="ml-auto text-[10px] text-slate-600">slot {i + 1}</span>
          </li>
        );
      })}
      {nonEmpty.length === 0 && potions.length > 0 && (
        <li className="px-2 py-2">
          <p className="text-[10px] italic text-slate-600">All slots empty</p>
        </li>
      )}
    </ul>
  );
}

function getPile(snapshot: CombatData, pile: PileKey): (Card | CardReference)[] {
  if (pile === 'played') return (snapshot.playedCards as (Card | CardReference)[] | undefined) ?? [];
  return (snapshot[pile as keyof CombatData] as (Card | CardReference)[] | undefined) ?? [];
}

function ActivityLogContent({
  entries,
  density,
}: {
  entries: ActivityLogEntry[];
  density: Density;
}) {
  const oldestFirst = [...entries].reverse();
  const clustered = activityLogHasPhaseBoundaryMarkers(oldestFirst);

  if (clustered) {
    const clusters: ActivityLogPhaseCluster[] = clusterActivityLogByPhaseBoundaries(oldestFirst);
    return (
      <>
        {clusters
          .filter((c) => c.entries.length > 0)
          .map((cluster) => (
            <div key={cluster.phase}>
              <div className="sticky top-0 z-10 bg-slate-950/90 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 backdrop-blur-sm">
                {cluster.displayName}
              </div>
              {cluster.entries.map((entry) => (
                <ActivityLogRowInline key={entry.id} entry={entry} density={density} />
              ))}
            </div>
          ))}
      </>
    );
  }
  return (
    <>
      {entries.map((entry) => (
        <ActivityLogRowInline key={entry.id} entry={entry} density={density} />
      ))}
    </>
  );
}

const PILE_TABS: { id: PileKey; label: string }[] = [
  { id: 'hand', label: 'Hand' },
  { id: 'draw', label: 'Draw' },
  { id: 'discard', label: 'Discard' },
  { id: 'exhaust', label: 'Exhaust' },
  { id: 'played', label: 'Played' },
];

export function DtlNodeFullModal({
  decisionNode,
  onClose,
}: {
  decisionNode: DecisionNode;
  turns: Turn[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const [pileTab, setPileTab] = useState<PileKey>('hand');
  const [showOrbsTab, setShowOrbsTab] = useState(false);
  const [showPotionsTab, setShowPotionsTab] = useState(false);
  const [logDensity, setLogDensity] = useState<Density>('minimal');

  const snapshot = decisionNode.snapshot;
  const logEntries = [...(snapshot.activityLog ?? [])].reverse();
  const orbs = snapshot.orbs ?? [];
  const maxSlots = snapshot.orbChannelSize ?? orbs.length;
  const potions = snapshot.potionBelt ?? [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const phaseLabel = decisionNode.turnPhase
    ? decisionNode.turnPhase.charAt(0).toUpperCase() + decisionNode.turnPhase.slice(1)
    : 'Unknown';

  const modal = (
    <div
      className="fixed inset-0 z-99999 flex flex-col bg-slate-950/97 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Full view: ${decisionNode.label}`}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-700/60 bg-slate-900/80 px-4 py-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ background: decisionNode.timelineAccentHex ?? '#64748b' }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-sm font-bold text-slate-100">{decisionNode.label}</span>
            <span className="text-[10px] text-slate-500">·</span>
            <span className="text-[10px] text-slate-400">Turn {decisionNode.plannerTurnSlotId}</span>
            <span className="text-[10px] text-slate-500">·</span>
            <span className="text-[10px] text-slate-400">{phaseLabel} phase</span>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 gap-1 border-b border-slate-700/60 bg-slate-900/60 px-4 py-2">
        {(
          [
            { id: 'overview' as Tab, label: 'Overview', Icon: Heart },
            { id: 'piles' as Tab, label: 'Card Piles', Icon: Layers },
            { id: 'log' as Tab, label: 'Activity Log', Icon: ScrollText },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              tab === id
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'overview' && (
          <div className="p-4">
            <DtlBranchCombatIntel
              snapshot={snapshot}
              turnPhase={decisionNode.turnPhase}
              section="all"
            />
          </div>
        )}

        {tab === 'piles' && (
          <div className="flex h-full flex-col">
            {/* Sub-tabs row — card piles + orbs + potions */}
            <div className="flex shrink-0 flex-wrap gap-1 border-b border-slate-800/60 bg-slate-900/40 px-4 py-2">
              {PILE_TABS.map(({ id, label }) => {
                const count = getPile(snapshot, id).length;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setPileTab(id); setShowOrbsTab(false); setShowPotionsTab(false); }}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      !showOrbsTab && !showPotionsTab && pileTab === id
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {label}
                    <span className="ml-1 text-slate-500">({count})</span>
                  </button>
                );
              })}
              <div className="mx-1 h-auto w-px bg-slate-700/50" aria-hidden />
              <button
                type="button"
                onClick={() => { setShowOrbsTab(true); setShowPotionsTab(false); }}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  showOrbsTab
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <Hexagon className="h-3 w-3 shrink-0" strokeWidth={2} />
                Orbs
                <span className="text-slate-500">({orbs.length}/{maxSlots || orbs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowPotionsTab(true); setShowOrbsTab(false); }}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  showPotionsTab
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <Beaker className="h-3 w-3 shrink-0" strokeWidth={2} />
                Potions
                <span className="text-slate-500">({potions.filter(Boolean).length})</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
              {showOrbsTab && <OrbList orbs={orbs} maxSlots={maxSlots} />}
              {showPotionsTab && <PotionList potions={potions} />}
              {!showOrbsTab && !showPotionsTab && (
                <PileList cards={getPile(snapshot, pileTab)} />
              )}
            </div>
          </div>
        )}

        {tab === 'log' && (
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800/60 bg-slate-900/40 px-4 py-2">
              <span className="text-[10px] text-slate-500">{logEntries.length} entries</span>
              <div className="flex gap-1">
                {(['minimal', 'detailed'] as Density[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setLogDensity(d)}
                    className={`rounded px-2 py-1 text-[9px] font-semibold capitalize transition-colors ${
                      logDensity === d
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {logEntries.length === 0 ? (
                <p className="py-8 text-center text-[10px] italic text-slate-600">No log entries</p>
              ) : (
                <ActivityLogContent entries={logEntries} density={logDensity} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
