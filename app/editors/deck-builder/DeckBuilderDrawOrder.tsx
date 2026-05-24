"use client";

import { useCallback, useRef, useState } from "react";
import { Shuffle, RotateCcw, GripVertical, ArrowUpCircle } from "lucide-react";
import type { DeckCardEntry, DrawOrderEntry } from "./deckBuilderTypes";
import { expandToDrawOrder } from "./deckBuilderStorage";
import { getStsCardsRecord } from "@/app/card-design-gallery/stsRecord";

const DB_RECORDS = getStsCardsRecord();

function costLabel(rec: Record<string, unknown> | undefined, isUpgraded: boolean): string {
  if (!rec) return "?";
  if (rec.xCost) return "X";
  if (rec.unplayable) return "–";
  const cost = rec.cost;
  if (cost == null) return "0";
  if (typeof cost === "number") return String(cost);
  if (typeof cost === "object" && !Array.isArray(cost)) {
    const o = cost as Record<string, unknown>;
    const v = isUpgraded ? (o.upgraded ?? o.base) : o.base;
    return v == null ? "0" : String(v);
  }
  return "?";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ─── Character colours ────────────────────────────────────────────────────────
type CharPalette = { row: string; nameBadge: string };
const CHAR_PALETTE: Record<string, CharPalette> = {
  ironclad: { row: "hover:bg-red-950/20",     nameBadge: "border-red-700/40 bg-red-950/50 text-red-300" },
  silent:   { row: "hover:bg-emerald-950/20", nameBadge: "border-emerald-700/40 bg-emerald-950/50 text-emerald-300" },
  defect:   { row: "hover:bg-sky-950/20",     nameBadge: "border-sky-700/40 bg-sky-950/50 text-sky-300" },
  watcher:  { row: "hover:bg-violet-950/20",  nameBadge: "border-violet-700/40 bg-violet-950/50 text-violet-300" },
  colorless:{ row: "hover:bg-zinc-800/20",    nameBadge: "border-zinc-600/40 bg-zinc-800/50 text-zinc-300" },
};
const DEFAULT_PALETTE: CharPalette = {
  row: "hover:bg-slate-800/30",
  nameBadge: "border-slate-600/40 bg-slate-800/50 text-slate-300",
};

// ─── Type chip colours ────────────────────────────────────────────────────────
const TYPE_CHIP: Record<string, string> = {
  Attack: "border-red-800/50 bg-red-950/40 text-red-400",
  Skill:  "border-sky-800/50 bg-sky-950/40 text-sky-400",
  Power:  "border-violet-800/50 bg-violet-950/40 text-violet-400",
  Curse:  "border-zinc-700/50 bg-zinc-800/40 text-zinc-500",
  Status: "border-stone-700/50 bg-stone-800/40 text-stone-500",
};

interface DeckBuilderDrawOrderProps {
  cards: DeckCardEntry[];
  drawOrder: DrawOrderEntry[] | null;
  onChange: (order: DrawOrderEntry[] | null) => void;
}

export default function DeckBuilderDrawOrder({ cards, drawOrder, onChange }: DeckBuilderDrawOrderProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const entries: DrawOrderEntry[] = drawOrder ?? expandToDrawOrder(cards);
  const isCustom = drawOrder !== null;

  const onDragStart = useCallback((i: number) => setDragIdx(i), []);
  const onDragEnter = useCallback((i: number) => { dragOver.current = i; }, []);

  const onDragEnd = useCallback(() => {
    if (dragIdx === null || dragOver.current === null || dragIdx === dragOver.current) {
      setDragIdx(null);
      dragOver.current = null;
      return;
    }
    const reordered = [...entries];
    const [item] = reordered.splice(dragIdx, 1);
    reordered.splice(dragOver.current, 0, item!);
    onChange(reordered);
    setDragIdx(null);
    dragOver.current = null;
  }, [dragIdx, entries, onChange]);

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-16 text-center px-4">
        <p className="text-xs text-slate-600">Add cards to the deck first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Controls */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-slate-700/40 flex-wrap">
        <button type="button" onClick={() => onChange(shuffle(entries))}
          className="flex items-center gap-1.5 rounded border border-slate-700/40 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-400 transition hover:text-slate-200">
          <Shuffle className="h-3 w-3" /> Shuffle
        </button>
        {isCustom && (
          <button type="button" onClick={() => onChange(null)}
            className="flex items-center gap-1.5 rounded border border-amber-700/40 bg-amber-950/30 px-2.5 py-1 text-xs text-amber-400 transition hover:bg-amber-950/50">
            <RotateCcw className="h-3 w-3" /> Reset order
          </button>
        )}
        {!isCustom && (
          <span className="text-[11px] text-slate-600 italic">Default order — drag to customise</span>
        )}
        {isCustom && (
          <span className="ml-auto flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] text-amber-400 font-semibold">
            Custom order active
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <ol className="divide-y divide-slate-800/50">
          {entries.map((entry, i) => {
            const rec      = DB_RECORDS[entry.card_ID];
            const name     = (rec?.name as string) ?? entry.card_ID;
            const type     = (rec?.type as string) ?? "";
            const char     = ((rec?.character as string) ?? "").toLowerCase();
            const cost     = costLabel(rec, entry.isUpgraded);
            const rarity   = (rec?.rarity as string) ?? "";
            const palette  = CHAR_PALETTE[char] ?? DEFAULT_PALETTE;
            const typeCls  = TYPE_CHIP[type] ?? "border-slate-700/40 bg-slate-800/40 text-slate-500";
            const isDragging = dragIdx === i;

            return (
              <li
                key={entry.uid}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnter={() => onDragEnter(i)}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
                className={[
                  "flex items-center gap-2 px-2 py-1.5 select-none transition",
                  isDragging
                    ? "bg-indigo-950/40 opacity-50"
                    : `cursor-grab active:cursor-grabbing ${palette.row}`,
                ].join(" ")}
              >
                {/* Position */}
                <span className="w-5 shrink-0 text-right text-[10px] text-slate-600 tabular-nums">{i + 1}</span>

                {/* Drag handle */}
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-700" />

                {/* Name badge (character-coloured) */}
                <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium leading-tight truncate max-w-[7rem] ${palette.nameBadge}`}>
                  {name}
                  {entry.isUpgraded && <span className="ml-0.5 text-[9px] font-bold opacity-80">+</span>}
                </span>

                {/* Type chip */}
                {type && (
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${typeCls}`}>
                    {type.slice(0, 3)}
                  </span>
                )}

                {/* Rarity chip (first letter) */}
                {rarity && (
                  <span className="rounded border border-slate-700/30 bg-slate-800/30 px-1 py-0.5 text-[9px] text-slate-600 shrink-0 uppercase tracking-wide">
                    {rarity[0]}
                  </span>
                )}

                <div className="flex-1" />

                {/* Upgraded icon */}
                {entry.isUpgraded && (
                  <ArrowUpCircle className="h-3 w-3 shrink-0 text-sky-500" />
                )}

                {/* Cost */}
                <span className="shrink-0 text-[11px] text-slate-500 tabular-nums w-4 text-right">{cost}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
