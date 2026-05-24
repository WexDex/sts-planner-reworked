"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";
import { STARTER_DECKS } from "./deckBuilderTypes";
import type { DeckCardEntry } from "./deckBuilderTypes";

// Ascender's Bane — the curse added on Ascension 10+
const ASCENDERS_BANE: DeckCardEntry = {
  card_ID: "Ascender's Bane",
  count: 1,
  isUpgraded: false,
};

const CHAR_OPTIONS: Array<{
  id: keyof typeof STARTER_DECKS;
  label: string;
  active: string;
  inactive: string;
}> = [
  { id: "ironclad", label: "Ironclad", active: "border-red-500/70 bg-red-950/60 text-red-200",     inactive: "border-red-800/40 text-red-500/70 hover:text-red-300 hover:border-red-700/50" },
  { id: "silent",   label: "Silent",   active: "border-emerald-500/70 bg-emerald-950/60 text-emerald-200", inactive: "border-emerald-800/40 text-emerald-500/70 hover:text-emerald-300 hover:border-emerald-700/50" },
  { id: "defect",   label: "Defect",   active: "border-sky-500/70 bg-sky-950/60 text-sky-200",     inactive: "border-sky-800/40 text-sky-500/70 hover:text-sky-300 hover:border-sky-700/50" },
  { id: "watcher",  label: "Watcher",  active: "border-violet-500/70 bg-violet-950/60 text-violet-200", inactive: "border-violet-800/40 text-violet-500/70 hover:text-violet-300 hover:border-violet-700/50" },
];

interface DeckBuilderStarterModalProps {
  defaultCharacter?: string;
  onAdd: (entries: DeckCardEntry[]) => void;
  onClose: () => void;
}

export default function DeckBuilderStarterModal({
  defaultCharacter,
  onAdd,
  onClose,
}: DeckBuilderStarterModalProps) {
  const [selected, setSelected] = useState<keyof typeof STARTER_DECKS>(
    (defaultCharacter && defaultCharacter in STARTER_DECKS
      ? defaultCharacter
      : "ironclad") as keyof typeof STARTER_DECKS,
  );
  const [addBane, setAddBane] = useState(false);

  const preview = STARTER_DECKS[selected] ?? [];

  function handleAdd() {
    const entries: DeckCardEntry[] = [...preview];
    if (addBane) entries.push(ASCENDERS_BANE);
    onAdd(entries);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/40 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-slate-100">Add Starter Deck</span>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Character picker */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Character</p>
            <div className="flex flex-wrap gap-2">
              {CHAR_OPTIONS.map(ch => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelected(ch.id)}
                  className={[
                    "rounded-md border px-3 py-1.5 text-xs font-semibold transition",
                    selected === ch.id ? ch.active : ch.inactive,
                  ].join(" ")}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cards to add</p>
            <ul className="space-y-0.5 rounded-lg border border-slate-700/30 bg-slate-800/40 px-3 py-2">
              {preview.map(e => (
                <li key={e.card_ID} className="flex items-center justify-between text-xs text-slate-300">
                  <span>{e.card_ID}</span>
                  <span className="text-slate-500 tabular-nums">{e.count}×</span>
                </li>
              ))}
              {addBane && (
                <li className="flex items-center justify-between text-xs text-rose-400/80 border-t border-slate-700/30 mt-1 pt-1">
                  <span>Ascender's Bane</span>
                  <span className="tabular-nums">1×</span>
                </li>
              )}
            </ul>
          </div>

          {/* Ascender's Bane toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700/30 bg-slate-800/30 px-3 py-2.5 transition hover:bg-slate-800/50">
            <div className={[
              "relative h-4 w-7 rounded-full transition",
              addBane ? "bg-rose-600/70" : "bg-slate-700",
            ].join(" ")}>
              <div className={[
                "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform",
                addBane ? "translate-x-3.5" : "translate-x-0.5",
              ].join(" ")} />
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={addBane}
              onChange={e => setAddBane(e.target.checked)}
            />
            <div>
              <p className="text-xs font-medium text-slate-300">Include Ascender's Bane</p>
              <p className="text-[11px] text-slate-600">Curse added on Ascension 10+</p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-700/40 px-5 py-3">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-slate-700/40 px-3.5 py-1.5 text-xs text-slate-400 transition hover:text-slate-200">
            Cancel
          </button>
          <button type="button" onClick={handleAdd}
            className="rounded-lg border border-amber-500/50 bg-amber-600/20 px-4 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-600/35">
            Add cards
          </button>
        </div>
      </div>
    </div>
  );
}
