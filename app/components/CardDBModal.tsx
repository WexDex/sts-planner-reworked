'use client';

import { useState, useMemo } from 'react';
import cardDB from '@/app/data/cardDB.json';
import STSCard from './UI/Card';
import { LOCATION } from '@/app/types/types';
import { Card } from '@/app/types/gameTypes';

type CardDBEntry = Omit<Card, 'name' | 'isUpgraded' | 'isChanged' | 'isSelected'>;

interface CardDBModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (cardId: string, location: string, isUpgraded?: boolean) => void;
}

const LOCATIONS = [
  { id: LOCATION.DRAW, name: 'Draw Pile', color: 'blue' },
  { id: LOCATION.HAND, name: 'Hand', color: 'green' },
  { id: LOCATION.DISCARD, name: 'Discard Pile', color: 'red' },
  { id: LOCATION.EXHAUST, name: 'Exhaust Pile', color: 'gray' },
];

export default function CardDBModal({ isOpen, onClose, onAddCard }: CardDBModalProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('draw');
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const cardEntries = useMemo(() => {
    return Object.entries(cardDB as Record<string, CardDBEntry>).filter(([cardId, cardData]) => {
      const matchesSearch = cardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cardData.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || cardData.type?.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType]);

  const cardTypes = useMemo(() => {
    const types = new Set<string>();
    Object.values(cardDB as Record<string, CardDBEntry>).forEach(card => {
      if (card.type) types.add(card.type);
    });
    return Array.from(types).sort();
  }, []);

  const handleAddCard = () => {
    if (selectedCard) {
      onAddCard(selectedCard, selectedLocation, isUpgraded);
      onClose();
      setSelectedCard(null);
      setIsUpgraded(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Add Card from Database</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
            >
              <option value="all">All Types</option>
              {cardTypes.map(type => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>

          {/* Card Preview and Location Selection */}
          {selectedCard && (
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="text-sm text-slate-400 mb-2">Preview:</div>
                <div className="scale-75 origin-top-left">
                  <STSCard
                    card={{
                      name: selectedCard,
                      type: (cardDB as Record<string, CardDBEntry>)[selectedCard]?.type,
                      isUpgraded,
                      isChanged: false,
                      isSelected: false,
                      cost: (cardDB as Record<string, CardDBEntry>)[selectedCard]?.cost,
                      damage: (cardDB as Record<string, CardDBEntry>)[selectedCard]?.damage,
                      block: (cardDB as Record<string, CardDBEntry>)[selectedCard]?.block,
                      draw: (cardDB as Record<string, CardDBEntry>)[selectedCard]?.draw,
                      description: (cardDB as Record<string, CardDBEntry>)[selectedCard]?.description,
                    }}
                    index={0}
                    location={LOCATION.DRAW}
                    size="small"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm text-slate-400 mb-2">Add to Location:</div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {LOCATIONS.map(location => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        selectedLocation === location.id
                          ? `bg-${location.color}-600 text-white`
                          : `bg-slate-800 text-slate-300 hover:bg-slate-700`
                      }`}
                    >
                      {location.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={isUpgraded}
                      onChange={(e) => setIsUpgraded(e.target.checked)}
                      className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    Upgraded
                  </label>

                  <button
                    onClick={handleAddCard}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cardEntries.map(([cardId, cardData]) => (
              <button
                key={cardId}
                onClick={() => setSelectedCard(cardId)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedCard === cardId
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-sm font-medium text-white mb-1">{cardId}</div>
                <div className={`text-xs px-2 py-1 rounded inline-block mb-2 ${
                  cardData.type === 'Attack' ? 'bg-red-900 text-red-300' :
                  cardData.type === 'Skill' ? 'bg-blue-900 text-blue-300' :
                  cardData.type === 'Power' ? 'bg-purple-900 text-purple-300' :
                  cardData.type === 'Curse' ? 'bg-orange-900 text-orange-300' :
                  'bg-gray-900 text-gray-300'
                }`}>
                  {cardData.type}
                </div>
                <div className="text-xs text-slate-400 line-clamp-2">
                  {cardData.description?.substring(0, 60)}...
                </div>
                {cardData.cost && (
                  <div className="text-xs text-yellow-400 mt-1">
                    Cost: {typeof cardData.cost === 'object' ? cardData.cost.base : cardData.cost}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}