'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftRight, Beaker, ChevronDown, ChevronLeft, ChevronRight,
  Hexagon, Shield, Heart, Swords, X, Zap,
} from 'lucide-react';
import type { Card, CardReference, CombatData, DecisionNode, OrbType, Turn } from '@/app/types/gameTypes';
import { cardTypeStyles } from '@/app/types/types';
import { getPlayerMaxEnergy } from '@/app/utils/gameHelpers';

// ─── Card helpers ─────────────────────────────────────────────────────────────

type KnownCardType = keyof typeof cardTypeStyles;

function isFullCard(c: Card | CardReference): c is Card {
  return 'name' in c && typeof (c as Card).name === 'string';
}

function cardDisplayName(c: Card | CardReference): string {
  if (isFullCard(c)) return `${(c as Card).name}${c.isUpgraded ? '+' : ''}`;
  const ref = c as CardReference;
  return `${ref.card_ID ?? '?'}${ref.isUpgraded ? '+' : ''}`;
}

function cardTypeKey(c: Card | CardReference): KnownCardType {
  const raw = isFullCard(c) ? (c as Card).type : undefined;
  const t = (raw ?? '').trim();
  return (t in cardTypeStyles ? t : 'Status') as KnownCardType;
}

function cardCostStr(c: Card | CardReference): string {
  if (!isFullCard(c)) return '?';
  if ((c as Card).xCost) return 'X';
  const cost = (c as Card).cost;
  if (cost == null) return '0';
  if (typeof cost === 'number') return String(cost);
  return String((cost as { base?: number }).base ?? 0);
}

// Condensed chip colors per type (bg + text + border)
const TYPE_CHIP: Record<KnownCardType, string> = {
  Attack:  'bg-red-950/70 text-red-300 border-red-700/50',
  Skill:   'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
  Power:   'bg-violet-950/70 text-violet-300 border-violet-700/50',
  Potion:  'bg-amber-950/70 text-amber-300 border-amber-700/50',
  Curse:   'bg-purple-950/70 text-purple-300 border-purple-700/50',
  Status:  'bg-slate-800/70 text-slate-400 border-slate-600/50',
};

const CARD_ROW_CLS: Record<KnownCardType, string> = {
  Attack:  'text-red-200',
  Skill:   'text-emerald-200',
  Power:   'text-violet-200',
  Potion:  'text-amber-200',
  Curse:   'text-purple-300',
  Status:  'text-slate-400',
};

// ─── Orb / misc helpers ───────────────────────────────────────────────────────

function orbInfo(orb: OrbType): { sym: string; cls: string } {
  switch (orb) {
    case 'lightning': return { sym: '⚡', cls: 'text-yellow-300' };
    case 'dark':      return { sym: '◆',  cls: 'text-violet-400' };
    case 'frost':     return { sym: '❄',  cls: 'text-sky-300' };
    case 'plasma':    return { sym: '✦',  cls: 'text-pink-300' };
    default:          return { sym: '○',  cls: 'text-slate-500' };
  }
}

function buffLabel(b: { name: string; stacks?: number }) {
  return b.stacks !== undefined && b.stacks !== 1 ? `${b.name} (${b.stacks})` : b.name;
}

function delta(a: number, b: number) { return b - a; }

function deltaBadge(d: number, higherIsBetter = true) {
  if (d === 0) return null;
  const sign = d > 0 ? '+' : '';
  const good = higherIsBetter ? d > 0 : d < 0;
  return { text: `${sign}${d}`, cls: good ? 'text-emerald-400' : 'text-rose-400' };
}

// ─── Card chip with hover preview ─────────────────────────────────────────────

function CardChip({ card, isUnique }: { card: Card | CardReference; isUnique: boolean }) {
  const type = cardTypeKey(card);
  const name = cardDisplayName(card);
  const cost = cardCostStr(card);
  const desc = isFullCard(card) ? (card as Card).description : undefined;
  const chipCls = TYPE_CHIP[type];
  const nameCls = CARD_ROW_CLS[type];

  return (
    <div className="group/card relative">
      {/* Chip */}
      <div
        className={`flex cursor-default items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${chipCls} transition-opacity hover:opacity-90`}
      >
        <span className="shrink-0 rounded bg-black/25 px-1 font-black tabular-nums">{cost}</span>
        <span className="max-w-27.5 truncate">
          {name}
          {isUnique && <span className="ml-1 text-emerald-400">★</span>}
        </span>
      </div>

      {/* Hover card preview — floats above the chip */}
      <div className="pointer-events-none invisible absolute bottom-full left-0 z-50 mb-2 w-44 rounded-xl border border-slate-600/60 bg-slate-900 p-3 opacity-0 shadow-2xl shadow-black/80 transition-all duration-100 group-hover/card:visible group-hover/card:opacity-100">
        {/* Cost orb */}
        <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-[15px] font-black ${chipCls}`}>
          {cost}
        </div>
        {/* Name */}
        <p className={`text-[14px] font-black leading-snug ${nameCls}`}>{name}</p>
        {/* Type badge */}
        <span className={`mt-1 inline-block rounded border px-1.5 py-px text-[9px] font-bold uppercase tracking-wide ${chipCls}`}>
          {type}
        </span>
        {/* Description */}
        {desc && (
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{desc}</p>
        )}
        {isUnique && (
          <p className="mt-1.5 text-[10px] font-semibold text-emerald-400">Unique to this node</p>
        )}
      </div>
    </div>
  );
}

// ─── Pile section (wrapped card chips) ────────────────────────────────────────

function PileSection({
  title,
  cards,
  uniqueKeys,
  defaultOpen = false,
}: {
  title: string;
  cards: (Card | CardReference)[];
  uniqueKeys?: Set<string>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-800/50 first:border-t-0">
      <button
        type="button"
        className="flex w-full items-center gap-2 py-2 text-left transition-colors hover:text-slate-200"
        onClick={() => setOpen((v) => !v)}
      >
        {open
          ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} />
          : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} />}
        <span className="flex-1 text-[13px] font-semibold text-slate-300">{title}</span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">{cards.length}</span>
      </button>
      {open && (
        <div className="mb-3 flex flex-wrap gap-1.5 pl-1">
          {cards.length === 0 ? (
            <span className="text-[13px] italic text-slate-600">Empty</span>
          ) : (
            cards.map((c, i) => {
              const name = cardDisplayName(c);
              const isUnique = uniqueKeys?.has(name) ?? false;
              return <CardChip key={i} card={c} isUnique={isUnique} />;
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Node picker cluster colors ───────────────────────────────────────────────
// Edit this list to change the rotating bg/border palette for turn-slot clusters.
// Cycles by insertion order (T0 → index 0, T1 → index 1, …).
const CLUSTER_COLORS: { bg: string; border: string }[] = [
  { bg: 'bg-slate-900/70',   border: 'border-slate-700/50'   }, // T0 — neutral (START)
  { bg: 'bg-sky-950/40',     border: 'border-sky-800/40'     }, // T1
  { bg: 'bg-violet-950/40',  border: 'border-violet-800/40'  }, // T2
  { bg: 'bg-emerald-950/40', border: 'border-emerald-800/40' }, // T3
  { bg: 'bg-amber-950/40',   border: 'border-amber-800/40'   }, // T4
  { bg: 'bg-rose-950/40',    border: 'border-rose-800/40'    }, // T5
  { bg: 'bg-cyan-950/40',    border: 'border-cyan-800/40'    }, // T6
  { bg: 'bg-indigo-950/40',  border: 'border-indigo-800/40'  }, // T7
];

// ─── Node picker (clustered by turn slot + arrows) ────────────────────────────

function NodePicker({
  allNodes,
  selectedId,
  excludeId,
  onChange,
  label,
}: {
  allNodes: DecisionNode[];
  selectedId: string | null;
  excludeId: string | null;
  onChange: (id: string | null) => void;
  label: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group by plannerTurnSlotId, sorted ascending (all nodes included — excludeId shown as disabled)
  const grouped = useMemo(() => {
    const candidates = allNodes
      .slice()
      .sort((a, b) => a.plannerTurnSlotId - b.plannerTurnSlotId || a.label.localeCompare(b.label));

    const map = new Map<number, DecisionNode[]>();
    for (const n of candidates) {
      const slot = n.plannerTurnSlotId;
      if (!map.has(slot)) map.set(slot, []);
      map.get(slot)!.push(n);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [allNodes, excludeId]);

  const isEmpty = grouped.length === 0;

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="shrink-0 rounded-md border border-slate-700 bg-slate-800 p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-30"
          onClick={() => scroll('left')}
          disabled={isEmpty}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>

        {/* Scrollable clusters row */}
        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isEmpty ? (
            <span className="py-1 text-[12px] italic text-slate-600">No nodes available</span>
          ) : (
            grouped.map(([slot, nodes], clusterIdx) => {
              const { bg, border } = CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length];
              return (
              <div
                key={slot}
                className={`shrink-0 rounded-lg border px-2 pb-2 pt-1.5 ${bg} ${border}`}
              >
                {/* Turn slot label */}
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-600">
                  T{slot}
                </span>
                {/* Node buttons */}
                <div className="flex gap-1">
                  {nodes.map((n) => {
                    const selected = n.id === selectedId;
                    const takenByOther = n.id === excludeId;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        disabled={takenByOther}
                        onClick={() => !takenByOther && onChange(selected ? null : n.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-all ${
                          takenByOther
                            ? 'cursor-not-allowed border-amber-500/50 bg-amber-950/20 opacity-60'
                            : selected
                            ? 'border-sky-500/60 bg-sky-950/50 shadow-[0_0_0_1px] shadow-sky-500/30'
                            : 'border-slate-700/60 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-700/60'
                        }`}
                        title={takenByOther ? 'Already selected on the other side' : `T${n.plannerTurnSlotId} · ${n.label} · ${n.turnPhase}`}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/10"
                          style={{ background: n.timelineAccentHex ?? '#64748b' }}
                        />
                        <div className="leading-tight">
                          <span className={`block text-[13px] font-bold ${takenByOther ? 'text-amber-300/70' : selected ? 'text-sky-200' : 'text-slate-200'}`}>
                            {n.label}
                          </span>
                          <span className="block text-[10px] text-slate-500">{n.turnPhase}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          className="shrink-0 rounded-md border border-slate-700 bg-slate-800 p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-30"
          onClick={() => scroll('right')}
          disabled={isEmpty}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── Node panel ───────────────────────────────────────────────────────────────

function NodePanel({
  node,
  uniqueKeys,
  sideLabel,
}: {
  node: DecisionNode | null;
  uniqueKeys: Set<string>;
  sideLabel: 'Start' | 'Result';
}) {
  if (!node) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[14px] italic text-slate-600">No Turn Node selected</p>
      </div>
    );
  }

  const snap = node.snapshot;
  const player = snap.player;
  const hp = player.hp;
  const maxHp = player.maxHp;
  const hpPct = maxHp > 0 ? hp / maxHp : 1;
  const block = player.currentBlock ?? 0;
  const energy = player.currentEnergy ?? 0;
  const maxEnergy = getPlayerMaxEnergy(player);
  const stance = snap.stance ?? 'neutral';
  const orbs: OrbType[] = snap.orbs ?? [];
  const orbSlots = snap.orbChannelSize ?? orbs.length;
  const potions = (snap.potionBelt ?? []).filter((p): p is Card => p !== null && isFullCard(p as Card));
  const buffs = (player.buffsDebuffs ?? []).filter((b) => b.type === 'buff');
  const debuffs = (player.buffsDebuffs ?? []).filter((b) => b.type === 'debuff');
  const enemies = snap.enemies ?? [];

  const hand    = snap.hand ?? [];
  const draw    = snap.draw ?? [];
  const discard = snap.discard ?? [];
  const exhaust = snap.exhaust ?? [];
  const played  = (snap.playedCards as (Card | CardReference)[] | undefined) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Identity */}
      <div className="flex items-center gap-2">
        <span className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-white/10"
              style={{ background: node.timelineAccentHex ?? '#64748b' }} />
        <div>
          <span className="font-mono text-[15px] font-black text-slate-100">{node.label}</span>
          <span className="ml-2 text-[12px] text-slate-500">
            T{node.plannerTurnSlotId} · {node.turnPhase} · {sideLabel}
          </span>
        </div>
      </div>

      {/* HP bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-400">
            <Heart className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            HP
          </span>
          <span className={`text-[15px] font-black tabular-nums ${hpPct < 0.3 ? 'text-rose-300' : hpPct < 0.6 ? 'text-amber-300' : 'text-emerald-300'}`}>
            {hp}<span className="text-[12px] font-normal text-slate-600">/{maxHp}</span>
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${hpPct < 0.3 ? 'bg-rose-500' : hpPct < 0.6 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.max(2, hpPct * 100)}%` }}
          />
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-lg border border-sky-700/40 bg-sky-950/30 px-2.5 py-1.5 text-[14px] font-bold text-sky-200">
          <Shield className="h-4 w-4 shrink-0 text-sky-400" strokeWidth={2} />
          {block}
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-amber-700/40 bg-amber-950/30 px-2.5 py-1.5 text-[14px] font-bold text-amber-200">
          <Zap className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} />
          {energy}/{maxEnergy}
        </span>
        {stance !== 'neutral' && (
          <span className={`rounded-lg border px-2.5 py-1.5 text-[14px] font-bold capitalize ${
            stance === 'wrath'    ? 'border-red-700/50 bg-red-950/40 text-red-200' :
            stance === 'calm'     ? 'border-sky-700/50 bg-sky-950/40 text-sky-200' :
            stance === 'divinity' ? 'border-violet-700/50 bg-violet-950/40 text-violet-200' :
            'border-slate-700 text-slate-400'}`}>{stance}</span>
        )}
      </div>

      {/* Orbs */}
      {orbSlots > 0 && (
        <div className="flex items-center gap-2">
          <Hexagon className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={1.5} />
          <span className="text-[12px] font-semibold text-slate-500">Orbs</span>
          <div className="flex gap-1">
            {Array.from({ length: orbSlots }).map((_, i) => {
              const orb = orbs[i];
              if (!orb) return <span key={i} className="text-[16px] text-slate-700">○</span>;
              const { sym, cls } = orbInfo(orb);
              return <span key={i} className={`text-[16px] ${cls}`} title={orb}>{sym}</span>;
            })}
          </div>
        </div>
      )}

      {/* Potions */}
      {potions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Beaker className="h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={1.5} />
          {potions.map((p, i) => (
            <span key={i} className="rounded-md border border-amber-700/30 bg-amber-950/40 px-2 py-0.5 text-[12px] font-semibold text-amber-200">
              {p.name}
            </span>
          ))}
        </div>
      )}

      {/* Buffs */}
      {buffs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {buffs.map((b, i) => (
            <span key={i} className="rounded border border-emerald-700/30 bg-emerald-950/40 px-1.5 py-0.5 text-[12px] font-semibold text-emerald-300">
              {buffLabel(b)}
            </span>
          ))}
        </div>
      )}

      {/* Debuffs */}
      {debuffs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {debuffs.map((b, i) => (
            <span key={i} className="rounded border border-rose-700/30 bg-rose-950/40 px-1.5 py-0.5 text-[12px] font-semibold text-rose-300">
              {buffLabel(b)}
            </span>
          ))}
        </div>
      )}

      {/* Enemies */}
      {enemies.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500">
            <Swords className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            Enemies
          </p>
          {enemies.map((e, i) => {
            const ePct = (e.maxHp ?? 1) > 0 ? e.hp / (e.maxHp ?? 1) : 1;
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-semibold text-slate-200">{e.name}</span>
                  <span className={`shrink-0 tabular-nums font-bold text-[14px] ${ePct < 0.3 ? 'text-rose-300' : ePct < 0.6 ? 'text-amber-300' : 'text-slate-300'}`}>
                    {e.hp}<span className="text-slate-600 font-normal text-[12px]">/{e.maxHp ?? '?'}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${ePct < 0.3 ? 'bg-rose-500' : ePct < 0.6 ? 'bg-amber-500' : 'bg-slate-500'}`}
                    style={{ width: `${Math.max(2, ePct * 100)}%` }}
                  />
                </div>
                {(e.buffsDebuffs ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-1">
                    {(e.buffsDebuffs ?? []).map((b, j) => (
                      <span key={j} className="text-[11px] text-slate-500">{buffLabel(b)}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Card piles */}
      <div className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-1">
        <PileSection title="Hand"    cards={hand}    uniqueKeys={uniqueKeys} defaultOpen />
        <PileSection title="Draw"    cards={draw}    uniqueKeys={uniqueKeys} />
        <PileSection title="Discard" cards={discard} uniqueKeys={uniqueKeys} />
        <PileSection title="Exhaust" cards={exhaust} uniqueKeys={uniqueKeys} />
        {played.length > 0 && <PileSection title="Played" cards={played} uniqueKeys={uniqueKeys} />}
      </div>
    </div>
  );
}

// ─── Delta strip ─────────────────────────────────────────────────────────────

function DeltaStrip({ a, b }: { a: CombatData | null; b: CombatData | null }) {
  if (!a || !b) {
    return <div className="w-20 shrink-0 border-x border-slate-700/40" />;
  }

  const rows: { label: string; d: number; hib?: boolean }[] = [
    { label: 'HP',      d: delta(a.player.hp, b.player.hp) },
    { label: 'Block',   d: delta(a.player.currentBlock ?? 0, b.player.currentBlock ?? 0) },
    { label: 'Energy',  d: delta(a.player.currentEnergy ?? 0, b.player.currentEnergy ?? 0) },
    { label: 'Hand',    d: delta((a.hand ?? []).length, (b.hand ?? []).length) },
    { label: 'Draw',    d: delta((a.draw ?? []).length, (b.draw ?? []).length) },
    { label: 'Discard', d: delta((a.discard ?? []).length, (b.discard ?? []).length), hib: false },
    { label: 'Orbs',    d: delta((a.orbs ?? []).length, (b.orbs ?? []).length) },
  ];

  return (
    <div className="flex w-20 shrink-0 flex-col items-center gap-0 border-x border-slate-700/40 pt-12">
      {rows.map(({ label, d, hib = true }) => {
        const badge = deltaBadge(d, hib);
        return (
          <div key={label} className="flex w-full flex-col items-center border-b border-slate-800/40 py-2 text-center last:border-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{label}</span>
            {badge
              ? <span className={`text-[15px] font-black tabular-nums ${badge.cls}`}>{badge.text}</span>
              : <span className="text-[14px] text-slate-700">=</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DtlNodeCompareModal({
  nodeA: initialNodeA,
  allNodes,
  onClose,
}: {
  nodeA: DecisionNode;
  allNodes: DecisionNode[];
  turns: Turn[];
  onClose: () => void;
}) {
  const [nodeAId, setNodeAId] = useState<string | null>(initialNodeA.id);
  const [nodeBId, setNodeBId] = useState<string | null>(() => {
    const sameSlot = allNodes.find(
      (n) => n.id !== initialNodeA.id && n.plannerTurnSlotId === initialNodeA.plannerTurnSlotId
    );
    return sameSlot?.id ?? allNodes.find((n) => n.id !== initialNodeA.id)?.id ?? null;
  });

  const nodeA = allNodes.find((n) => n.id === nodeAId) ?? null;
  const nodeB = allNodes.find((n) => n.id === nodeBId) ?? null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { uniqueToA, uniqueToB } = useMemo(() => {
    if (!nodeA || !nodeB) return { uniqueToA: new Set<string>(), uniqueToB: new Set<string>() };
    const aKeys = new Set([...(nodeA.snapshot.hand ?? []), ...(nodeA.snapshot.draw ?? []),
                           ...(nodeA.snapshot.discard ?? []), ...(nodeA.snapshot.exhaust ?? [])].map(cardDisplayName));
    const bKeys = new Set([...(nodeB.snapshot.hand ?? []), ...(nodeB.snapshot.draw ?? []),
                           ...(nodeB.snapshot.discard ?? []), ...(nodeB.snapshot.exhaust ?? [])].map(cardDisplayName));
    return {
      uniqueToA: new Set([...aKeys].filter((k) => !bKeys.has(k))),
      uniqueToB: new Set([...bKeys].filter((k) => !aKeys.has(k))),
    };
  }, [nodeA, nodeB]);

  const modal = (
    <div
      className="fixed inset-0 z-99999 flex flex-col bg-slate-950/97 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Compare nodes"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-700/60 bg-slate-900/80 px-5 py-3.5">
        <ArrowLeftRight className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={2} />
        <span className="flex-1 text-base font-bold text-slate-100">Compare Nodes</span>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Pickers row */}
      <div className="flex shrink-0 items-start gap-3 border-b border-slate-700/40 bg-slate-900/50 px-5 py-3">
        <NodePicker
          allNodes={allNodes}
          selectedId={nodeAId}
          excludeId={nodeBId}
          onChange={setNodeAId}
          label="Start node"
        />
        <div className="mt-6 shrink-0 self-center">
          <ArrowLeftRight className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
        </div>
        <NodePicker
          allNodes={allNodes}
          selectedId={nodeBId}
          excludeId={nodeAId}
          onChange={setNodeBId}
          label="Result node"
        />
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left — Node A */}
        <div className="min-w-0 flex-1 overflow-y-auto p-5">
          <NodePanel node={nodeA} uniqueKeys={uniqueToA} sideLabel="Start" />
        </div>

        {/* Delta strip */}
        <DeltaStrip a={nodeA?.snapshot ?? null} b={nodeB?.snapshot ?? null} />

        {/* Right — Node B */}
        <div className="min-w-0 flex-1 overflow-y-auto p-5">
          <NodePanel node={nodeB} uniqueKeys={uniqueToB} sideLabel="Result" />
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
