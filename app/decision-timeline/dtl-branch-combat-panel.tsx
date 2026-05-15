'use client';

import type { ComponentType, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  BuffDebuff,
  Card,
  CardReference,
  CombatData,
  CombatTurnPhase,
  DeckEntry,
  Enemy,
  ValueNode,
} from '@/app/types/gameTypes';
import { cardTypeStyles } from '@/app/types/types';
import { getPlayerMaxEnergy } from '@/app/utils/gameHelpers';
import {
  ChevronDown,
  ChevronRight,
  Hand,
  Heart,
  Layers,
  Play,
  Shield,
  Skull,
  Sparkles,
  Swords,
  X,
  Zap,
} from 'lucide-react';

/** Prevent wheel from reaching React Flow's pane when scrolling nested lists. */
function stopWheelZoomOnPane(e: React.WheelEvent) {
  e.stopPropagation();
}

function isFullCard(c: Card | CardReference): c is Card {
  return 'name' in c && typeof (c as Card).name === 'string' && Boolean((c as Card).name);
}

function deckEntryLabel(e: DeckEntry | Card): string {
  if (isFullCard(e)) return `${e.name}${e.isUpgraded ? '+' : ''}`;
  const ref = e as CardReference;
  const id = ref.card_ID ?? '?';
  return `${id}${ref.isUpgraded ? '+' : ''}`;
}

type KnownCardType = keyof typeof cardTypeStyles;

function normalizePileCardType(raw: string | undefined): KnownCardType {
  const t = (raw ?? '').trim();
  if (t in cardTypeStyles) return t as KnownCardType;
  return 'Status';
}

function valueNodeTier(v: ValueNode | undefined, upgraded: boolean): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v === 'number') return v;
  const o = v as { base?: number; upgraded?: number };
  const n = upgraded ? o.upgraded ?? o.base : o.base ?? o.upgraded;
  return typeof n === 'number' ? n : null;
}

function pileCardCostLabel(card: Card): string | null {
  if (card.xCost) return 'X';
  const c = card.cost;
  if (c === undefined || c === null) return null;
  if (typeof c === 'number') return String(c);
  const n = valueNodeTier(c, !!card.isUpgraded);
  return n !== null ? String(n) : null;
}

function pileCardRetainActive(card: Card): boolean {
  const r = card.retain;
  if (r == null) return false;
  if (typeof r === 'boolean') return r;
  if (typeof r === 'object') {
    return Boolean(card.isUpgraded ? r.upgraded ?? r.base : r.base ?? r.upgraded);
  }
  return false;
}

function MiniTag({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase leading-snug tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

function PileCardRow({ entry }: { entry: DeckEntry | Card }) {
  if (!isFullCard(entry)) {
    const ref = entry as CardReference;
    return (
      <li className="flex gap-3 border-b border-slate-800/80 py-3 last:border-b-0">
        <div
          className="mt-1 w-2 shrink-0 self-stretch rounded-full bg-gradient-to-b from-slate-600 to-slate-700 shadow-sm"
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate text-[15px] font-semibold leading-snug text-slate-100" title={deckEntryLabel(entry)}>
            {deckEntryLabel(entry)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <MiniTag className="border-slate-600/80 bg-slate-900/90 text-slate-400">Deck ref</MiniTag>
            {ref.isUpgraded ? (
              <MiniTag className="border-emerald-500/50 bg-emerald-950/70 text-emerald-200">Upgraded</MiniTag>
            ) : null}
            {ref.isChanged ? (
              <MiniTag className="border-amber-500/45 bg-amber-950/60 text-amber-200">Changed</MiniTag>
            ) : null}
          </div>
        </div>
      </li>
    );
  }

  const card = entry;
  const ct = normalizePileCardType(card.type);
  const st = cardTypeStyles[ct];
  const cost = pileCardCostLabel(card);
  const dmg = valueNodeTier(card.damage, !!card.isUpgraded);
  const blk = valueNodeTier(card.block, !!card.isUpgraded);
  const retain = pileCardRetainActive(card);

  return (
    <li className="flex gap-3 border-b border-slate-800/80 py-3 last:border-b-0">
      <div
        className={`mt-1 w-2 shrink-0 self-stretch rounded-full bg-gradient-to-b ${st.gradient} shadow-md ${st.glow}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate text-[15px] font-semibold leading-snug text-slate-100" title={card.name}>
          {card.name}
          {card.isUpgraded ? <span className="text-emerald-400/95">+</span> : null}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <MiniTag className={`${st.border} ${st.nameBg} ${st.typeColor}`}>{ct}</MiniTag>
          {cost !== null ? (
            <MiniTag className={`${st.border} bg-slate-950/80 ${st.statColor}`}>Cost {cost}</MiniTag>
          ) : null}
          {dmg !== null ? (
            <MiniTag className="border-rose-500/40 bg-rose-950/55 text-rose-200">Dmg {dmg}</MiniTag>
          ) : null}
          {blk !== null ? (
            <MiniTag className="border-sky-500/40 bg-sky-950/55 text-sky-200">Blk {blk}</MiniTag>
          ) : null}
          {card.unplayable ? (
            <MiniTag className="border-purple-500/45 bg-purple-950/55 text-purple-200">Unplayable</MiniTag>
          ) : null}
          {retain ? (
            <MiniTag className="border-cyan-500/40 bg-cyan-950/50 text-cyan-200">Retain</MiniTag>
          ) : null}
          {card.isChanged ? (
            <MiniTag className="border-amber-500/45 bg-amber-950/60 text-amber-200">Changed</MiniTag>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function sortBuffDebuffs(a: BuffDebuff, b: BuffDebuff): number {
  if (a.type !== b.type) return a.type === 'buff' ? -1 : 1;
  return a.name.localeCompare(b.name);
}

const PHASE_BOOKMARK_LABEL: Record<CombatTurnPhase, string> = {
  start: 'Draw / start',
  player: 'Player main',
  enemy: 'Enemy',
};

function ReadonlyBuffGrid({ items, title }: { items: BuffDebuff[]; title: string }) {
  if (items.length === 0) {
    return <p className="text-[9px] text-slate-600">{title}: —</p>;
  }
  const sorted = [...items].sort(sortBuffDebuffs);
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="flex flex-wrap gap-1">
        {sorted.map((bd, i) => (
          <span
            key={`${bd.name}-${bd.type}-${i}`}
            title={bd.description || undefined}
            className={`max-w-[10rem] truncate rounded-md border px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ${
              bd.type === 'buff'
                ? 'border-emerald-500/45 bg-emerald-950/55 text-emerald-100'
                : 'border-rose-500/45 bg-rose-950/55 text-rose-100'
            }`}
          >
            {bd.name} ×{bd.stacks}
          </span>
        ))}
      </div>
    </div>
  );
}

type PileKind = 'draw' | 'discard' | 'exhaust';

const PILE_LABEL: Record<PileKind, string> = {
  draw: 'Draw pile',
  discard: 'Discard',
  exhaust: 'Exhaust',
};

const PILE_TABS: readonly PileKind[] = ['draw', 'discard', 'exhaust'];

function PilesModal({
  open,
  drawPile,
  discardPile,
  exhaustPile,
  onClose,
}: {
  open: boolean;
  drawPile: (DeckEntry | Card)[];
  discardPile: (DeckEntry | Card)[];
  exhaustPile: (DeckEntry | Card)[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<PileKind>('draw');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setTab('draw');
  }, [open]);

  const piles: Record<PileKind, (DeckEntry | Card)[]> = {
    draw: drawPile,
    discard: discardPile,
    exhaust: exhaustPile,
  };

  const cards = piles[tab];

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[245] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="dtl-piles-modal-title">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/88 backdrop-blur-md"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 mx-auto mt-[5vh] flex max-h-[min(92vh,880px)] w-[min(96vw,720px)] flex-col overflow-hidden rounded-2xl border border-slate-600/55 bg-slate-950/98 shadow-2xl shadow-black/60">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-700/60 px-4 py-3">
          <div>
            <p id="dtl-piles-modal-title" className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Card piles
            </p>
            <p className="font-mono text-sm tabular-nums text-slate-400">
              Draw {drawPile.length} · Discard {discardPile.length} · Exhaust {exhaustPile.length}
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-600 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex shrink-0 gap-0 border-b border-slate-800/90 px-3 pt-2" role="tablist">
          {PILE_TABS.map((k) => {
            const count = piles[k].length;
            const sel = tab === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={sel}
                className={`flex-1 rounded-t-lg border border-b-0 px-3 py-2.5 text-center text-xs font-semibold transition-colors ${
                  sel
                    ? 'border-slate-600/80 bg-slate-900/95 text-cyan-100'
                    : 'border-transparent bg-transparent text-slate-500 hover:bg-slate-900/40 hover:text-slate-300'
                }`}
                onClick={() => setTab(k)}
              >
                <span className="block truncate">{PILE_LABEL[k]}</span>
                <span className="font-mono tabular-nums text-slate-400">{count}</span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="min-h-0 flex flex-1 flex-col overflow-hidden">
          <p className="shrink-0 border-b border-slate-800/60 px-4 py-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-300">{PILE_LABEL[tab]}</span>
            <span className="mx-1 text-slate-600">·</span>
            <span className="tabular-nums">{cards.length} cards</span>
          </p>
          <ul
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:thin]"
            onWheelCapture={stopWheelZoomOnPane}
          >
            {cards.length === 0 ? (
              <li className="py-12 text-center text-base text-slate-500">Empty</li>
            ) : (
              cards.map((c, i) => <PileCardRow key={`${tab}-${i}-${deckEntryLabel(c)}`} entry={c} />)
            )}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CollapsibleCardList({
  title,
  count,
  Icon,
  cards,
  expanded,
  onToggle,
  emptyHint,
}: {
  title: string;
  count: number;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  cards: Card[];
  expanded: boolean;
  onToggle: () => void;
  emptyHint: string;
}) {
  return (
    <div className="rounded-lg border border-slate-700/45 bg-slate-950/35">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-2 py-1.5 text-left transition hover:bg-slate-900/50"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
        )}
        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
          {title}{' '}
          <span className="tabular-nums text-slate-500">({count})</span>
        </span>
      </button>
      {expanded ? (
        <div
          className="max-h-36 overflow-y-auto border-t border-slate-800/75 px-2 py-1.5 [scrollbar-width:thin]"
          onWheelCapture={stopWheelZoomOnPane}
        >
          {count === 0 ? (
            <p className="py-1 text-center text-[9px] text-slate-600">{emptyHint}</p>
          ) : (
            <ul className="space-y-0.5">
              {cards.map((c, i) => (
                <li key={`${c.name}-${i}`} className="truncate text-[10px] text-slate-300" title={c.name}>
                  {c.name}
                  {c.isUpgraded ? <span className="text-emerald-400/90">+</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MiniEnemyRow({ enemy, index }: { enemy: Enemy; index: number }) {
  const buffs = enemy.buffsDebuffs?.filter((b) => b.type === 'buff') ?? [];
  const debuffs = enemy.buffsDebuffs?.filter((b) => b.type === 'debuff') ?? [];
  const block = enemy.currentBlock ?? 0;

  return (
    <div className="rounded-lg border border-rose-500/25 bg-rose-950/15 px-2 py-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <span className="text-[10px] font-semibold text-rose-100/95">
          <span className="text-slate-500">{index + 1}.</span> {enemy.name}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-slate-300">
          <span className="text-rose-300">{enemy.hp}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-500">{enemy.maxHp}</span>
          {block > 0 ? (
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-sky-300" title="Block">
              <Shield className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
              {block}
            </span>
          ) : null}
        </span>
      </div>
      {buffs.length === 0 && debuffs.length === 0 ? (
        <p className="mt-0.5 text-[8px] text-slate-600">No buffs / debuffs</p>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1">
          {[...buffs].sort(sortBuffDebuffs).map((bd, i) => (
            <span
              key={`eb-${i}-${bd.name}`}
              title={bd.description}
              className="rounded border border-emerald-500/35 bg-emerald-950/40 px-1 py-px text-[8px] font-semibold text-emerald-200"
            >
              {bd.name}×{bd.stacks}
            </span>
          ))}
          {[...debuffs].sort(sortBuffDebuffs).map((bd, i) => (
            <span
              key={`ed-${i}-${bd.name}`}
              title={bd.description}
              className="rounded border border-rose-500/35 bg-rose-950/40 px-1 py-px text-[8px] font-semibold text-rose-200"
            >
              {bd.name}×{bd.stacks}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DtlBranchCombatIntel({
  snapshot,
  turnPhase,
  section = 'all',
}: {
  snapshot: CombatData;
  turnPhase: CombatTurnPhase;
  /** Which portion of the combat intel to render. Default 'all' = original full layout. */
  section?: 'all' | 'player' | 'enemies';
}) {
  const [handOpen, setHandOpen] = useState(false);
  const [playedOpen, setPlayedOpen] = useState(false);
  const [pilesModalOpen, setPilesModalOpen] = useState(false);

  const player = snapshot.player;
  const energyMax = getPlayerMaxEnergy(player);
  const currentEnergy = player.currentEnergy ?? 0;
  /** Max-3 proportional orbs; above that use "N × orb" so the cell stays readable. */
  const useEnergyCountFormat = energyMax > 3 || currentEnergy > 3;
  const energyOrbFilled =
    energyMax > 0 && !useEnergyCountFormat
      ? Math.min(3, Math.max(0, Math.round((currentEnergy / energyMax) * 3)))
      : 0;
  const hp = player.hp;
  const maxHp = player.maxHp;
  const block = player.currentBlock ?? 0;

  const hand = snapshot.hand ?? [];
  const played = snapshot.playedCards ?? [];
  const drawPile = snapshot.draw ?? [];
  const discardPile = snapshot.discard ?? [];
  const exhaustPile = snapshot.exhaust ?? [];

  const pBuffs = useMemo(
    () => player.buffsDebuffs?.filter((b) => b.type === 'buff') ?? [],
    [player.buffsDebuffs],
  );
  const pDebuffs = useMemo(
    () => player.buffsDebuffs?.filter((b) => b.type === 'debuff') ?? [],
    [player.buffsDebuffs],
  );

  const enemies = snapshot.enemies ?? [];

  const totalPileCards = drawPile.length + discardPile.length + exhaustPile.length;

  const showHeader = section === 'all';
  const showStats = section !== 'enemies';
  const showHandPiles = section !== 'enemies';

  const statsGrid = (
    <div className="grid grid-cols-3 gap-1.5">
      <div
        className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/20 px-1.5 py-1"
        title="HP / max HP"
      >
        <Heart className="h-3 w-3 shrink-0 text-emerald-400/90" strokeWidth={2} aria-hidden />
        <span className="font-mono text-[10px] font-semibold tabular-nums text-emerald-100">
          {hp}<span className="text-slate-600">/</span>{maxHp}
        </span>
      </div>
      <div
        className="flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-950/20 px-1.5 py-1"
        title="Block"
      >
        <Shield className="h-3 w-3 shrink-0 text-sky-300/90" strokeWidth={2} aria-hidden />
        <span className="font-mono text-[10px] font-semibold tabular-nums text-sky-100">{block}</span>
      </div>
      <div
        className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/20 px-1.5 py-1"
        title={energyMax > 0 ? `Energy ${currentEnergy} / ${energyMax}` : 'Energy'}
      >
        <Zap className="h-3 w-3 shrink-0 text-amber-300/90" strokeWidth={2} aria-hidden />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
          {energyMax > 0 ? (
            useEnergyCountFormat ? (
              <div
                className="flex items-center justify-center gap-0.5"
                role="img"
                aria-label={`Energy ${currentEnergy} of ${energyMax}`}
              >
                <span className="font-mono text-[10px] font-semibold tabular-nums text-amber-100">
                  {currentEnergy}
                </span>
                <span className="text-[9px] font-semibold text-amber-200/55" aria-hidden>
                  ×
                </span>
                <span
                  className="h-3 w-3 shrink-0 rounded-full border-2 border-amber-300/90 bg-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                  title={`${currentEnergy} energy`}
                  aria-hidden
                />
              </div>
            ) : (
              <div
                className="flex items-center justify-center gap-0.5"
                role="img"
                aria-label={`Energy ${currentEnergy} of ${energyMax}, ${energyOrbFilled} of 3 orbs lit`}
              >
                {Array.from({ length: 3 }, (_, i) => {
                  const filled = i < energyOrbFilled;
                  return (
                    <span
                      key={i}
                      className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                        filled
                          ? 'border-amber-300/90 bg-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                          : 'border-amber-800/55 bg-amber-950/80'
                      }`}
                    />
                  );
                })}
              </div>
            )
          ) : (
            <span className="text-[10px] font-semibold text-amber-200/40">—</span>
          )}
        </div>
      </div>
    </div>
  );

  const playerPanel = (
    <div className="rounded-md border border-blue-500/20 bg-blue-950/10 px-2 py-1.5">
      <p className="mb-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-blue-300/90">
        <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
        Player
      </p>
      <ReadonlyBuffGrid items={pBuffs} title="Buffs" />
      <div className="mt-1.5">
        <ReadonlyBuffGrid items={pDebuffs} title="Debuffs" />
      </div>
    </div>
  );

  const enemiesPanel = (
    <div className="rounded-md border border-rose-500/20 bg-rose-950/10 px-2 py-1.5">
      <p className="mb-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-rose-300/90">
        <Skull className="h-3 w-3" strokeWidth={2} aria-hidden />
        Enemies ({enemies.length})
      </p>
      {enemies.length === 0 ? (
        <p className="text-[9px] text-slate-600">No enemies in snapshot</p>
      ) : (
        <div className="max-h-40 space-y-1 overflow-y-auto [scrollbar-width:thin]" onWheelCapture={stopWheelZoomOnPane}>
          {enemies.map((enemy, i) => (
            <MiniEnemyRow key={`${enemy.name}-${i}`} enemy={enemy} index={i} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`nodrag nopan space-y-2 ${section === 'all' ? 'mb-2 border-t border-slate-700/40 pt-2' : ''}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-1">
          <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
            <Swords className="h-3 w-3" strokeWidth={2} aria-hidden />
            Combat snapshot
          </p>
          <span
            className="rounded border border-slate-600/70 bg-slate-900/80 px-1.5 py-px text-[8px] font-semibold text-slate-400"
            title="Each checkpoint stores one combat state. The phase strip tags which moment this bookmark refers to (all values below are from that snapshot)."
          >
            Bookmark: {PHASE_BOOKMARK_LABEL[turnPhase]}
          </span>
        </div>
      )}

      {showStats && statsGrid}

      {section === 'all' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {playerPanel}
          {enemiesPanel}
        </div>
      ) : section === 'player' ? (
        playerPanel
      ) : (
        enemiesPanel
      )}

      {showHandPiles && (
        <div className="space-y-1.5">
          <CollapsibleCardList
            title="Hand"
            count={hand.length}
            Icon={Hand}
            cards={hand}
            expanded={handOpen}
            onToggle={() => setHandOpen((v) => !v)}
            emptyHint="No cards in hand"
          />
          <CollapsibleCardList
            title="Played this turn"
            count={played.length}
            Icon={Play}
            cards={played}
            expanded={playedOpen}
            onToggle={() => setPlayedOpen((v) => !v)}
            emptyHint="No cards in played zone"
          />
        </div>
      )}

      {showHandPiles && (
        <div>
          <p className="mb-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-slate-500">
            <Layers className="h-3 w-3" strokeWidth={2} aria-hidden />
            Piles
          </p>
          <button
            type="button"
            className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-600/70 bg-slate-900/70 px-2.5 py-1.5 text-left transition hover:bg-slate-800/90"
            title="Draw, discard, and exhaust piles — choose a tab inside"
            onClick={(e) => {
              e.stopPropagation();
              setPilesModalOpen(true);
            }}
          >
            <span className="text-[10px] font-semibold text-slate-200">View piles</span>
            <span className="font-mono text-[9px] tabular-nums text-slate-400">
              <span className="text-cyan-200/90">{drawPile.length}</span>
              <span className="mx-1 text-slate-600">/</span>
              <span className="text-sky-200/90">{discardPile.length}</span>
              <span className="mx-1 text-slate-600">/</span>
              <span className="text-amber-200/90">{exhaustPile.length}</span>
              <span className="ml-1.5 text-slate-600">({totalPileCards})</span>
            </span>
          </button>
        </div>
      )}

      <PilesModal
        open={pilesModalOpen}
        drawPile={drawPile}
        discardPile={discardPile}
        exhaustPile={exhaustPile}
        onClose={() => setPilesModalOpen(false)}
      />
    </div>
  );
}
