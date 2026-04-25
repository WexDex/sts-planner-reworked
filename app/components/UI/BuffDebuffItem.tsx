'use client';

import React from 'react';
import { BuffDebuff } from '@/app/types/gameTypes';
import { Minus } from 'lucide-react';

interface BuffDebuffItemProps {
  bd: BuffDebuff;
  onReduce: () => void;
  onRemove: () => void;
}

export default function BuffDebuffItem({ bd, onReduce, onRemove }: BuffDebuffItemProps) {
  return (
    <div
      title={bd.description || `${bd.name} (${bd.type})`}
      className={`flex justify-between items-center p-2 rounded text-xs ${
        bd.type === 'buff' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
      }`}
    >
      <div>
        <span className="font-bold">{bd.name}</span>
        <span className="ml-2 text-gray-300">x{bd.stacks}</span>
      </div>
      <div className="flex flex-row gap-2">
        <button
          onClick={onReduce}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-0.5 rounded"
          aria-label={`Reduce ${bd.name}`}
        >
          <Minus size={12} />
        </button>
        <button
          onClick={onRemove}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-0.5 rounded"
          aria-label={`Remove ${bd.name}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
