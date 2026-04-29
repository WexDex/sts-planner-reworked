'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { gameCardFromDatabaseId } from '@/app/data/gameCardFromSts';
import { getStsCardsRecord } from '@/app/card-design-gallery/stsRecord';
import STSCard from './UI/Card';
import { LOCATION } from '@/app/types/types';
import { Search, X } from 'lucide-react';

interface CardDBModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Default: add a new card to a pile. */
  variant?: 'add' | 'transform';
  onAddCard?: (cardId: string, location: string, isUpgraded?: boolean) => void;
  /** When variant is "transform", selected cards become this card from the DB. */
  onTransform?: (cardId: string, isUpgraded: boolean) => void;
}

const LOCATIONS: {
  id: string;
  label: string;
  sub: string;
  activeClass: string;
  ringClass: string;
  dotClass: string;
}[] = [
  {
    id: LOCATION.DRAW,
    label: 'Draw',
    sub: 'pile',
    activeClass: 'border-sky-500/80 bg-sky-950/50',
    ringClass: 'ring-sky-500/40',
    dotClass: 'bg-sky-400',
  },
  {
    id: LOCATION.HAND,
    label: 'Hand',
    sub: '',
    activeClass: 'border-emerald-500/80 bg-emerald-950/40',
    ringClass: 'ring-emerald-500/40',
    dotClass: 'bg-emerald-400',
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

function typeBadgeClass(type?: string) {
  switch (type) {
    case 'Attack':
      return 'bg-red-950/90 text-red-200 border-red-800/60';
    case 'Skill':
      return 'bg-blue-950/90 text-blue-200 border-blue-800/60';
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

export default function CardDBModal({
  isOpen,
  onClose,
  variant = 'add',
  onAddCard,
  onTransform,
}: CardDBModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>(LOCATION.DRAW);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleConfirm = () => {
    if (!selectedCard) return;
    if (variant === 'transform' && onTransform) {
      onTransform(selectedCard, isUpgraded);
    } else if (onAddCard) {
      onAddCard(selectedCard, selectedLocation, isUpgraded);
    }
    onClose();
    setSelectedCard(null);
    setIsUpgraded(false);
  };

  const previewCard = useMemo(() => {
    if (!selectedCard) return null;
    const c = gameCardFromDatabaseId(selectedCard, { isUpgraded });
    if (!c) return null;
    return { ...c, isChanged: variant === 'transform', isSelected: false };
  }, [selectedCard, isUpgraded, variant]);

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
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-600/50 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-700/80 bg-slate-900/95 px-5 py-4 sm:px-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id="card-db-modal-title" className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {variant === 'transform' ? 'Transform into…' : 'Add card'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {variant === 'transform'
                  ? 'Choose a card from the database. Selected cards in play become that card (marked changed).'
                  : 'Search the database, pick a destination pile, then add.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
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
          </div>

          {selectedCard && previewCard && (
            <div className="mt-5 flex flex-col gap-5 rounded-xl border border-slate-700/60 bg-slate-950/40 p-4 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Preview</p>
                <div className="origin-top-left scale-[0.72] sm:scale-75">
                  <STSCard
                    card={previewCard}
                    index={0}
                    location={LOCATION.DRAW}
                    size="small"
                    interactive={false}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                {variant === 'add' ? (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Destination
                  </p>
                  <div role="radiogroup" aria-label="Pile to add card to" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                              {checked ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              ) : null}
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

                <div className="flex flex-wrap items-center gap-6 border-t border-slate-800/80 pt-4">
                  <div role="radiogroup" aria-label="Card upgrade" className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Version</span>
                    {[
                      { value: false, label: 'Base' },
                      { value: true, label: 'Upgraded' },
                    ].map((opt) => (
                      <label
                        key={String(opt.value)}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          isUpgraded === opt.value
                            ? 'border-violet-500/70 bg-violet-950/50 text-violet-100'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="card-db-upgrade"
                          checked={isUpgraded === opt.value}
                          onChange={() => setIsUpgraded(opt.value)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                            isUpgraded === opt.value
                              ? 'border-violet-400 bg-violet-500'
                              : 'border-slate-500 bg-slate-900'
                          }`}
                        >
                          {isUpgraded === opt.value ? (
                            <span className="h-1 w-1 rounded-full bg-white" />
                          ) : null}
                        </span>
                        {opt.label}
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="ml-auto rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-500"
                  >
                    {variant === 'transform' ? 'Transform' : 'Add to pile'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card grid */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cardEntries.map(([cardId, raw]) => {
              const cardData = raw as { type?: string; description?: string; cost?: unknown };
              const picked = selectedCard === cardId;
              const desc = String(cardData.description ?? '');
              const snippet = desc.slice(0, 72);
              const ellipsize = desc.length > 72;
              const cost = cardData.cost;
              return (
                <button
                  key={cardId}
                  type="button"
                  onClick={() => setSelectedCard(cardId)}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    picked
                      ? 'border-cyan-500 bg-cyan-950/25 shadow-md shadow-cyan-950/20'
                      : 'border-slate-700/80 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="mb-1.5 font-medium leading-tight text-white">{cardId}</div>
                  <span
                    className={`mb-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeBadgeClass(cardData.type)}`}
                  >
                    {cardData.type ?? '—'}
                  </span>
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
