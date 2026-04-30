'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { gameCardFromDatabaseId } from '@/app/data/gameCardFromSts';
import { getStsCardsRecord } from '@/app/card-design-gallery/stsRecord';
import STSCard from './UI/Card';
import { LOCATION, cardTypeStyles } from '@/app/types/types';
import type { CardTypeStyle } from '@/app/components/UI/cardVisualVariants';
import { Check, Minus, Plus, Search, X } from 'lucide-react';

interface CardDBModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Default: add new cards to a pile (supports multi-select). */
  variant?: 'add' | 'transform';
  onAddCard?: (cardIds: string[], location: string, isUpgraded?: boolean) => void;
  /** When variant is "transform", selected cards become this card from the DB. */
  onTransform?: (cardId: string, isUpgraded: boolean) => void;
}

type TileSurface = {
  bar: string;
  tileBg: string;
  tileBorder: string;
  selectedRing: string;
};

const LOCATIONS: {
  id: string;
  label: string;
  sub: string;
  activeClass: string;
  ringClass: string;
  dotClass: string;
}[] = [
  {
    id: LOCATION.HAND,
    label: 'Hand',
    sub: '',
    activeClass: 'border-emerald-500/80 bg-emerald-950/40',
    ringClass: 'ring-emerald-500/40',
    dotClass: 'bg-emerald-400',
  },
  {
    id: LOCATION.DRAW,
    label: 'Draw',
    sub: 'pile',
    activeClass: 'border-sky-500/80 bg-sky-950/50',
    ringClass: 'ring-sky-500/40',
    dotClass: 'bg-sky-400',
  },
  {
    id: LOCATION.DISCARD,
    label: 'Discard',
    sub: 'pile',
    activeClass: 'border-rose-500/80 bg-rose-950/45',
    ringClass: 'ring-rose-500/40',
    dotClass: 'bg-rose-400',
  },
  {
    id: LOCATION.EXHAUST,
    label: 'Exhaust',
    sub: 'pile',
    activeClass: 'border-amber-500/80 bg-amber-950/35',
    ringClass: 'ring-amber-500/35',
    dotClass: 'bg-amber-400',
  },
];

const TYPE_SURFACE: Record<string, TileSurface> = {
  Attack: {
    bar: 'bg-red-500',
    tileBg: 'bg-red-950/35',
    tileBorder: 'border-red-900/50',
    selectedRing: 'ring-red-400/90',
  },
  Skill: {
    bar: 'bg-sky-500',
    tileBg: 'bg-sky-950/35',
    tileBorder: 'border-sky-900/45',
    selectedRing: 'ring-sky-400/90',
  },
  Power: {
    bar: 'bg-violet-500',
    tileBg: 'bg-violet-950/40',
    tileBorder: 'border-violet-900/50',
    selectedRing: 'ring-violet-400/90',
  },
  Curse: {
    bar: 'bg-orange-500',
    tileBg: 'bg-orange-950/35',
    tileBorder: 'border-orange-900/45',
    selectedRing: 'ring-orange-400/85',
  },
  Status: {
    bar: 'bg-slate-500',
    tileBg: 'bg-slate-800/50',
    tileBorder: 'border-slate-600/60',
    selectedRing: 'ring-slate-300/80',
  },
};

const CHARACTER_SURFACE: Record<string, TileSurface> = {
  ironclad: {
    bar: 'bg-rose-500',
    tileBg: 'bg-rose-950/32',
    tileBorder: 'border-rose-900/45',
    selectedRing: 'ring-rose-400/90',
  },
  silent: {
    bar: 'bg-emerald-500',
    tileBg: 'bg-emerald-950/30',
    tileBorder: 'border-emerald-900/45',
    selectedRing: 'ring-emerald-400/90',
  },
  defect: {
    bar: 'bg-cyan-500',
    tileBg: 'bg-cyan-950/32',
    tileBorder: 'border-cyan-900/45',
    selectedRing: 'ring-cyan-400/90',
  },
  watcher: {
    bar: 'bg-violet-500',
    tileBg: 'bg-violet-950/35',
    tileBorder: 'border-violet-900/45',
    selectedRing: 'ring-violet-400/90',
  },
  colorless: {
    bar: 'bg-slate-400',
    tileBg: 'bg-slate-800/45',
    tileBorder: 'border-slate-600/55',
    selectedRing: 'ring-slate-300/85',
  },
  curse: {
    bar: 'bg-purple-600',
    tileBg: 'bg-purple-950/35',
    tileBorder: 'border-purple-900/50',
    selectedRing: 'ring-purple-400/85',
  },
};

const DEFAULT_TILE_SURFACE: TileSurface = {
  bar: 'bg-slate-500',
  tileBg: 'bg-slate-900/40',
  tileBorder: 'border-slate-700/70',
  selectedRing: 'ring-cyan-400/90',
};

function typeSurface(type?: string): TileSurface {
  if (!type) return DEFAULT_TILE_SURFACE;
  return TYPE_SURFACE[type] ?? DEFAULT_TILE_SURFACE;
}

function characterSurface(char?: string): TileSurface {
  if (!char) return DEFAULT_TILE_SURFACE;
  return CHARACTER_SURFACE[char.toLowerCase()] ?? DEFAULT_TILE_SURFACE;
}

function cardTileSurface(
  colorMode: 'character' | 'type',
  cardData: { type?: string; characters?: string },
): TileSurface {
  return colorMode === 'type'
    ? typeSurface(cardData.type)
    : characterSurface(cardData.characters);
}

function typeBadgeClass(type?: string) {
  switch (type) {
    case 'Attack':
      return 'bg-red-950/90 text-red-200 border-red-800/60';
    case 'Skill':
      return 'bg-sky-950/90 text-sky-200 border-sky-800/60';
    case 'Power':
      return 'bg-violet-950/90 text-violet-200 border-violet-800/60';
    case 'Curse':
      return 'bg-orange-950/90 text-orange-200 border-orange-800/60';
    case 'Status':
      return 'bg-slate-800 text-slate-200 border-slate-600/60';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-600/60';
  }
}

function rarityPillClass(rarity?: string) {
  switch (rarity) {
    case 'Common':
      return 'border-slate-600 bg-slate-800/90 text-slate-300';
    case 'Uncommon':
      return 'border-sky-500/50 bg-sky-950/80 text-sky-100';
    case 'Rare':
      return 'border-amber-500/55 bg-amber-950/70 text-amber-100';
    case 'Special':
      return 'border-fuchsia-500/45 bg-fuchsia-950/60 text-fuchsia-100';
    default:
      return 'border-slate-600/80 bg-slate-800/60 text-slate-400';
  }
}

function characterAccentLabel(char?: string): string {
  switch (char?.toLowerCase()) {
    case 'ironclad':
      return 'IR';
    case 'silent':
      return 'SI';
    case 'defect':
      return 'DF';
    case 'watcher':
      return 'WT';
    case 'colorless':
      return 'CL';
    case 'curse':
      return 'CS';
    default:
      return '';
  }
}

function characterAccentStyles(char?: string): string {
  switch (char?.toLowerCase()) {
    case 'ironclad':
      return 'border-rose-500/60 bg-rose-950/60 text-rose-100/95';
    case 'silent':
      return 'border-emerald-500/60 bg-emerald-950/55 text-emerald-100/95';
    case 'defect':
      return 'border-cyan-500/55 bg-cyan-950/55 text-cyan-100/95';
    case 'watcher':
      return 'border-violet-500/55 bg-violet-950/55 text-violet-100/95';
    case 'colorless':
      return 'border-slate-400/50 bg-slate-800/80 text-slate-200';
    case 'curse':
      return 'border-purple-500/55 bg-purple-950/55 text-purple-100/95';
    default:
      return 'border-slate-600/60 bg-slate-900/80 text-slate-500';
  }
}

const COPIES_MAX = 20;

export default function CardDBModal({
  isOpen,
  onClose,
  variant = 'add',
  onAddCard,
  onTransform,
}: CardDBModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(() => new Set());
  const [selectedLocation, setSelectedLocation] = useState<string>(LOCATION.HAND);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  /** Tile tint: owner color vs card type. */
  const [colorMode, setColorMode] = useState<'character' | 'type'>('character');
  /** Copies of each selected id (add mode). */
  const [copiesPerCard, setCopiesPerCard] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedLocation(LOCATION.HAND);
    setIsUpgraded(false);
    setColorMode('character');
    setCopiesPerCard(1);
    if (variant === 'add') {
      setSelectedCardIds(new Set());
      setSelectedCard(null);
    } else {
      setSelectedCard(null);
      setSelectedCardIds(new Set());
    }
  }, [isOpen, variant]);

  const stsCards = useMemo(() => getStsCardsRecord(), []);

  const cardEntries = useMemo(() => {
    return Object.entries(stsCards).filter(([cardId, cardData]) => {
      const desc = String((cardData as { description?: string }).description ?? '');
      const matchesSearch =
        cardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        desc.toLowerCase().includes(searchTerm.toLowerCase());
      const t = (cardData as { type?: string }).type;
      const matchesType = selectedType === 'all' || t?.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [stsCards, searchTerm, selectedType]);

  const cardTypes = useMemo(() => {
    const types = new Set<string>();
    Object.values(stsCards).forEach((card) => {
      const t = (card as { type?: string }).type;
      if (t) types.add(t);
    });
    return Array.from(types).sort();
  }, [stsCards]);

  const typeRadioOptions = useMemo(
    () => [{ value: 'all', label: 'All' }, ...cardTypes.map((t) => ({ value: t.toLowerCase(), label: t }))],
    [cardTypes],
  );

  const selectedCount = variant === 'add' ? selectedCardIds.size : selectedCard ? 1 : 0;
  const copiesSafe = Math.max(1, Math.min(COPIES_MAX, Math.floor(copiesPerCard) || 1));
  const totalCardsToAdd = variant === 'add' ? selectedCardIds.size * copiesSafe : 0;

  const previewCardId =
    variant === 'transform'
      ? selectedCard
      : selectedCardIds.size > 0
        ? Array.from(selectedCardIds)[0]
        : null;

  const previewCard = useMemo(() => {
    if (!previewCardId) return null;
    const c = gameCardFromDatabaseId(previewCardId, { isUpgraded });
    if (!c) return null;
    return { ...c, isChanged: variant === 'transform', isSelected: false };
  }, [previewCardId, isUpgraded, variant]);

  /** Match grid “Tile color” toggle: type chrome vs character / curse / status chrome. */
  const previewChromeStyle = useMemo((): CardTypeStyle | undefined => {
    if (!previewCard) return undefined;
    if (colorMode !== 'type') return undefined;
    const t = previewCard.type;
    if (t && t in cardTypeStyles) {
      return cardTypeStyles[t as keyof typeof cardTypeStyles];
    }
    return cardTypeStyles.Attack;
  }, [previewCard, colorMode]);

  const locationLabel = useMemo(
    () => LOCATIONS.find((l) => l.id === selectedLocation)?.label ?? selectedLocation,
    [selectedLocation],
  );

  const toggleCardPick = useCallback(
    (cardId: string) => {
      if (variant === 'transform') {
        setSelectedCard((prev) => (prev === cardId ? null : cardId));
        return;
      }
      setSelectedCardIds((prev) => {
        const next = new Set(prev);
        if (next.has(cardId)) next.delete(cardId);
        else next.add(cardId);
        return next;
      });
    },
    [variant],
  );

  const clearAddSelection = useCallback(() => {
    setSelectedCardIds(new Set());
  }, []);

  const bumpCopies = useCallback((delta: number) => {
    setCopiesPerCard((n) => {
      const cur = Math.max(1, Math.min(COPIES_MAX, Math.floor(n) || 1));
      return Math.max(1, Math.min(COPIES_MAX, cur + delta));
    });
  }, []);

  const handleConfirm = () => {
    if (variant === 'transform' && onTransform && selectedCard) {
      onTransform(selectedCard, isUpgraded);
      onClose();
      setSelectedCard(null);
      setIsUpgraded(false);
      return;
    }
    if (variant === 'add' && onAddCard && selectedCardIds.size > 0) {
      const n = Math.max(1, Math.min(COPIES_MAX, Math.floor(copiesPerCard) || 1));
      const expanded = Array.from(selectedCardIds).flatMap((id) => Array.from({ length: n }, () => id));
      onAddCard(expanded, selectedLocation, isUpgraded);
      onClose();
      setSelectedCardIds(new Set());
      setIsUpgraded(false);
      setCopiesPerCard(1);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedCard(null);
    setSelectedCardIds(new Set());
    setIsUpgraded(false);
    setCopiesPerCard(1);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-db-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-slate-950/75 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={handleClose}
      />

      <div className="relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-600/50 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl shadow-black/50">
        <div className="shrink-0 border-b border-slate-700/80 bg-slate-900/95 px-5 py-4 sm:px-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id="card-db-modal-title" className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {variant === 'transform' ? 'Transform into…' : 'Add card'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {variant === 'transform'
                  ? 'Choose a card from the database. Selected cards in play become that card (marked changed).'
                  : 'Tiles use character colors by default; toggle type coloring. Set copies per selected card.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                placeholder="Search by name or description…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-600/80 bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none ring-0 transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="shrink-0">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Type</p>
              <div
                role="radiogroup"
                aria-label="Filter by card type"
                className="flex flex-wrap gap-1.5 rounded-xl border border-slate-700/80 bg-slate-950/50 p-1.5"
              >
                {typeRadioOptions.map((opt) => {
                  const checked = selectedType === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`relative cursor-pointer select-none rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        checked
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="card-db-type"
                        value={opt.value}
                        checked={checked}
                        onChange={() => setSelectedType(opt.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tile color</p>
              <div
                className="inline-flex rounded-xl border border-slate-700/80 bg-slate-950/60 p-0.5"
                role="tablist"
                aria-label="Color cards by"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={colorMode === 'character'}
                  onClick={() => setColorMode('character')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    colorMode === 'character'
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Character
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={colorMode === 'type'}
                  onClick={() => setColorMode('type')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    colorMode === 'type'
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Type
                </button>
              </div>
            </div>
          </div>

          {variant === 'add' ? (
            <div className="mt-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Add to pile
                </p>
                {selectedCardIds.size > 0 ? (
                  <button
                    type="button"
                    onClick={clearAddSelection}
                    className="text-[11px] font-semibold text-slate-400 underline decoration-slate-600 underline-offset-2 hover:text-white"
                  >
                    Clear selection ({selectedCardIds.size})
                  </button>
                ) : null}
              </div>
              <div
                role="radiogroup"
                aria-label="Pile to add cards to"
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {LOCATIONS.map((loc) => {
                  const checked = selectedLocation === loc.id;
                  return (
                    <label
                      key={loc.id}
                      className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-3 transition ${
                        checked
                          ? `${loc.activeClass} ${loc.ringClass} ring-2`
                          : 'border-slate-700/80 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'
                      }`}
                    >
                      <input
                        type="radio"
                        name="card-db-location"
                        value={loc.id}
                        checked={checked}
                        onChange={() => setSelectedLocation(loc.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            checked
                              ? `border-white/50 ${loc.dotClass} shadow-[0_0_8px_rgba(255,255,255,0.12)]`
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {checked ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                        </span>
                        <span className="text-sm font-semibold text-slate-100">{loc.label}</span>
                      </div>
                      {loc.sub ? (
                        <span className="mt-0.5 pl-6 text-[10px] uppercase tracking-wide text-slate-500">
                          {loc.sub}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {selectedCount > 0 && previewCard ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-2">
              <div
                className="relative flex h-[120px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-600/50 bg-linear-to-b from-slate-900/90 to-slate-950/95 shadow-md ring-1 ring-white/[0.07]"
                title={
                  variant === 'add' && selectedCardIds.size > 1
                    ? `Preview: first of ${selectedCardIds.size} selected`
                    : 'Preview'
                }
              >
                <div
                  className="pointer-events-none origin-center scale-[0.8] transform-gpu will-change-transform"
                  aria-hidden
                >
                  <STSCard
                    card={previewCard}
                    index={0}
                    location={LOCATION.HAND}
                    size="small"
                    interactive={false}
                    legendHover={false}
                    galleryChromeStyle={previewChromeStyle}
                  />
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Version
                  </span>
                  <div
                    className="inline-flex items-center rounded-lg border border-slate-600/80 bg-slate-900/90 p-0.5 shadow-inner"
                    role="tablist"
                    aria-label="Base or upgraded"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={!isUpgraded}
                      onClick={() => setIsUpgraded(false)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        !isUpgraded
                          ? 'bg-slate-200 text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Base
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isUpgraded}
                      onClick={() => setIsUpgraded(true)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        isUpgraded
                          ? 'bg-violet-500 text-white shadow-sm shadow-violet-950/50'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Upgraded
                    </button>
                  </div>
                </div>

                {variant === 'add' ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      Each selected
                    </span>
                    <div className="flex items-center gap-0.5 rounded-lg border border-slate-600/80 bg-slate-900/90 px-0.5 py-0.5">
                      <button
                        type="button"
                        aria-label="Decrease copies"
                        onClick={() => bumpCopies(-1)}
                        disabled={copiesSafe <= 1}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-30"
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={COPIES_MAX}
                        aria-label="Copies per selected card"
                        value={copiesPerCard}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (Number.isNaN(v)) setCopiesPerCard(1);
                          else setCopiesPerCard(Math.max(1, Math.min(COPIES_MAX, v)));
                        }}
                        className="w-10 bg-transparent text-center text-sm font-bold tabular-nums text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        aria-label="Increase copies"
                        onClick={() => bumpCopies(1)}
                        disabled={copiesSafe >= COPIES_MAX}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ) : null}

                {variant === 'add' && selectedCardIds.size > 1 ? (
                  <p className="text-[11px] text-slate-500">
                    +{selectedCardIds.size - 1} more in selection
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={variant === 'add' ? selectedCardIds.size === 0 : !selectedCard}
                  className="ml-auto shrink-0 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-950/30 transition hover:bg-cyan-500 disabled:pointer-events-none disabled:opacity-40 sm:text-sm"
                >
                  {variant === 'transform'
                    ? 'Transform'
                    : totalCardsToAdd <= 1
                      ? `Add to ${locationLabel}`
                      : `Add ${totalCardsToAdd} to ${locationLabel}`}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cardEntries.map(([cardId, raw]) => {
              const cardData = raw as {
                type?: string;
                description?: string;
                cost?: unknown;
                rarity?: string;
                characters?: string;
              };
              const picked =
                variant === 'transform' ? selectedCard === cardId : selectedCardIds.has(cardId);
              const desc = String(cardData.description ?? '');
              const snippet = desc.slice(0, 72);
              const ellipsize = desc.length > 72;
              const cost = cardData.cost;
              const surf = cardTileSurface(colorMode, cardData);
              const charAbbr = characterAccentLabel(cardData.characters);
              return (
                <button
                  key={cardId}
                  type="button"
                  onClick={() => toggleCardPick(cardId)}
                  className={`relative rounded-xl border-2 p-3 pl-3.5 text-left transition ${
                    picked
                      ? `bg-cyan-950/15 shadow-md shadow-cyan-950/25 ring-2 ${surf.selectedRing} ${surf.tileBorder}`
                      : `${surf.tileBg} ${surf.tileBorder} hover:border-slate-500/80 hover:brightness-110`
                  }`}
                >
                  <span
                    className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-lg ${surf.bar} opacity-90`}
                    aria-hidden
                  />
                  {picked ? (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-white shadow-md">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                  ) : null}
                  <div className="mb-1.5 pr-7 font-medium leading-tight text-white">{cardId}</div>
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeBadgeClass(cardData.type)}`}
                    >
                      {cardData.type ?? '—'}
                    </span>
                    {cardData.rarity ? (
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${rarityPillClass(cardData.rarity)}`}
                      >
                        {cardData.rarity}
                      </span>
                    ) : null}
                    {charAbbr ? (
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-bold tabular-nums ${characterAccentStyles(cardData.characters)}`}
                        title={cardData.characters ?? ''}
                      >
                        {charAbbr}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] leading-snug text-slate-400">
                    {snippet}
                    {ellipsize ? '…' : ''}
                  </p>
                  {cost != null && (
                    <div className="mt-2 text-[11px] font-mono tabular-nums text-amber-200/90">
                      Cost{' '}
                      {typeof cost === 'object' && cost !== null && 'base' in cost
                        ? String((cost as { base: number }).base)
                        : String(cost as number)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
