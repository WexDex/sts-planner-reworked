'use client';

import React from 'react';
import { BuffDebuff } from '@/app/types/gameTypes';
import { Minus, Sparkles, Skull, Trash2 } from 'lucide-react';

interface BuffDebuffItemProps {
  bd: BuffDebuff;
  onReduce: () => void;
  onRemove: () => void;
}

export default function BuffDebuffItem({ bd, onReduce, onRemove }: BuffDebuffItemProps) {
  const isBuff = bd.type === 'buff';

  return (
    <div
      title={bd.description || `${bd.name} (${bd.type})`}
      className={`animate-sts-buff-in group relative flex items-stretch gap-0 overflow-hidden rounded-xl border text-xs shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-[1.03] ${
        isBuff
          ? 'border-emerald-500/35 bg-linear-to-r from-emerald-950/50 to-slate-900/80 text-emerald-100'
          : 'border-rose-500/35 bg-linear-to-r from-rose-950/45 to-slate-900/80 text-rose-100'
      } `}
    >
      <div
        className={`w-1 shrink-0 rounded-l-xl ${
          isBuff
            ? 'bg-linear-to-b from-emerald-400 to-emerald-700 animate-sts-buff-accent'
            : 'bg-linear-to-b from-rose-400 to-rose-800 animate-sts-buff-accent'
        }`}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-2.5 pr-1">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105 ${
            isBuff
              ? 'border-emerald-500/30 bg-emerald-900/40 text-emerald-300'
              : 'border-rose-500/30 bg-rose-900/40 text-rose-300'
          }`}
        >
          {isBuff ? <Sparkles className="h-4 w-4" strokeWidth={2} /> : <Skull className="h-4 w-4" strokeWidth={2} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold tracking-tight text-slate-50">{bd.name}</div>
          {bd.description ? (
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-400 transition-colors group-hover:text-slate-300">
              {bd.description}
            </p>
          ) : null}
        </div>
        <div
          className={`shrink-0 rounded-lg border px-2 py-1 font-mono text-[11px] font-bold tabular-nums transition-transform duration-200 group-hover:scale-105 ${
            isBuff
              ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-200'
              : 'border-rose-500/40 bg-rose-950/60 text-rose-200'
          }`}
        >
          ×{bd.stacks}
        </div>
      </div>

      <div className="flex shrink-0 flex-col justify-center gap-1 border-l border-slate-700/50 bg-slate-950/30 p-1.5">
        <button
          type="button"
          onClick={onReduce}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600/60 bg-slate-800/80 text-slate-300 transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:bg-slate-700 hover:text-white active:scale-95"
          aria-label={`Reduce ${bd.name}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/50 bg-red-950/50 text-red-300 transition-all duration-200 hover:scale-105 hover:border-red-500/50 hover:bg-red-900/60 hover:text-red-100 active:scale-95"
          aria-label={`Remove ${bd.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
