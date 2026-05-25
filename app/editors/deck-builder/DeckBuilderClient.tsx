"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Swords, ChevronDown, Download, Upload, Zap } from "lucide-react";
import DeckBuilderStarterModal from "./DeckBuilderStarterModal";
import Link from "next/link";
import { useGameManager } from "@/app/context/GameContext";
import type { CombatData } from "@/app/types/gameTypes";
import {
  type DeckCardInstance,
  type DrawOrderEntry,
  type PlayerSetup,
  type SavedDeck,
  type DeckExport,
  DEFAULT_PLAYER,
  deckGroupKey,
} from "./deckBuilderTypes";
import {
  loadSavedDecks,
  saveSavedDecks,
} from "./deckBuilderStorage";
import { genId } from "@/app/card-design-gallery/galleryFilterUtils";
import DeckBuilderCardPicker from "./DeckBuilderCardPicker";
import DeckBuilderDeckList from "./DeckBuilderDeckList";
import DeckBuilderPlayerSetup from "./DeckBuilderPlayerSetup";
import DeckBuilderDrawOrder from "./DeckBuilderDrawOrder";

type LeftTab = "player" | "draw";

// Migrate imported cards from old DeckCardEntry format if needed
function migrateImportedCards(raw: unknown[]): DeckCardInstance[] {
  return raw.flatMap(entry => {
    const e = entry as Record<string, unknown>;
    if (typeof e.uid === "string") return [e as unknown as DeckCardInstance];
    const count = typeof e.count === "number" ? e.count : 1;
    return Array.from({ length: count }, () => ({
      uid: genId(),
      card_ID: e.card_ID as string,
      isUpgraded: Boolean(e.isUpgraded),
    }));
  });
}

export default function DeckBuilderClient() {
  const router = useRouter();
  const { loadGameDataFromJson, gameState } = useGameManager();

  const importFileRef = useRef<HTMLInputElement>(null);

  // ── Saved decks ──────────────────────────────────────────────────────────────
  const [savedDecks,   setSavedDecks]   = useState<SavedDeck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  // ── Active deck state ────────────────────────────────────────────────────────
  const [deckName,  setDeckName]  = useState("New Deck");
  const [player,    setPlayer]    = useState<PlayerSetup>({ ...DEFAULT_PLAYER });
  const [cards,     setCards]     = useState<DeckCardInstance[]>([]);
  const [drawOrder, setDrawOrder] = useState<DrawOrderEntry[] | null>(null);
  const [isDirty,   setIsDirty]   = useState(false);

  // ── UI ────────────────────────────────────────────────────────────────────────
  const [leftTab,     setLeftTab]     = useState<LeftTab>("player");
  const [showDeckDD,  setShowDeckDD]  = useState(false);
  const [starterOpen, setStarterOpen] = useState(false);

  // ── Load localStorage on mount ───────────────────────────────────────────────
  useEffect(() => { setSavedDecks(loadSavedDecks()); }, []);

  // ── Close dropdown on outside click ──────────────────────────────────────────
  useEffect(() => {
    if (!showDeckDD) return;
    const h = () => setShowDeckDD(false);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [showDeckDD]);

  const markDirty = () => setIsDirty(true);

  function loadDeck(deck: SavedDeck) {
    setActiveDeckId(deck.id);
    setDeckName(deck.name);
    setPlayer(deck.player);
    setCards(deck.cards);
    setDrawOrder(deck.drawOrder);
    setIsDirty(false);
    setShowDeckDD(false);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const now = Date.now();
    const id  = activeDeckId ?? genId();
    const deck: SavedDeck = {
      id, name: deckName, player, cards, drawOrder,
      createdAt: savedDecks.find(d => d.id === id)?.createdAt ?? now,
      updatedAt: now,
    };
    const next = savedDecks.some(d => d.id === id)
      ? savedDecks.map(d => d.id === id ? deck : d)
      : [...savedDecks, deck];
    setSavedDecks(next);
    saveSavedDecks(next);
    setActiveDeckId(id);
    setIsDirty(false);
  }, [activeDeckId, deckName, player, cards, drawOrder, savedDecks]);

  // ── New ──────────────────────────────────────────────────────────────────────
  const handleNew = useCallback(() => {
    setActiveDeckId(null);
    setDeckName("New Deck");
    setPlayer({ ...DEFAULT_PLAYER });
    setCards([]);
    setDrawOrder(null);
    setIsDirty(false);
  }, []);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!activeDeckId) return;
    if (!confirm(`Delete deck "${deckName}"?`)) return;
    const next = savedDecks.filter(d => d.id !== activeDeckId);
    setSavedDecks(next);
    saveSavedDecks(next);
    handleNew();
  }, [activeDeckId, deckName, savedDecks, handleNew]);

  // ── Export JSON ──────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const exported: DeckExport = { name: deckName, player, cards, drawOrder, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deckName.replace(/\s+/g, "_")}.deck.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [deckName, player, cards, drawOrder]);

  // ── Import JSON ───────────────────────────────────────────────────────────────
  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file.text().then(text => {
      try {
        const data = JSON.parse(text) as DeckExport;
        setActiveDeckId(null);
        setDeckName(data.name ?? "Imported Deck");
        setPlayer(data.player ?? { ...DEFAULT_PLAYER });
        setCards(migrateImportedCards((data.cards ?? []) as unknown[]));
        setDrawOrder(data.drawOrder ? migrateImportedCards(data.drawOrder as unknown[]) : null);
        setIsDirty(true);
      } catch {
        alert("Failed to parse deck JSON.");
      }
    });
  }, []);

  // ── Starter deck modal ────────────────────────────────────────────────────────
  const handleStarterAdd = useCallback((instances: DeckCardInstance[]) => {
    setCards(prev => [...prev, ...instances]);
    setDrawOrder(null);
    markDirty();
  }, []);

  // ── Card picker: add one instance ─────────────────────────────────────────────
  const handleAddCard = useCallback((cardId: string, isUpgraded: boolean) => {
    setCards(prev => [...prev, { uid: genId(), card_ID: cardId, isUpgraded }]);
    setDrawOrder(null);
    markDirty();
  }, []);

  // ── Clustered view: add another copy to a group ───────────────────────────────
  const handleAddToGroup = useCallback((cardId: string, isUpgraded: boolean) => {
    setCards(prev => [...prev, { uid: genId(), card_ID: cardId, isUpgraded }]);
    setDrawOrder(null);
    markDirty();
  }, []);

  // ── Clustered view: remove last copy from a group ─────────────────────────────
  const handleRemoveFromGroup = useCallback((cardId: string, isUpgraded: boolean) => {
    setCards(prev => {
      const key = deckGroupKey(cardId, isUpgraded);
      // Find the last instance in this group
      let lastIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (deckGroupKey(prev[i]!.card_ID, prev[i]!.isUpgraded) === key) {
          lastIdx = i;
          break;
        }
      }
      if (lastIdx === -1) return prev;
      return prev.filter((_, i) => i !== lastIdx);
    });
    setDrawOrder(null);
    markDirty();
  }, []);

  // ── Clustered view: remove ALL copies in a group ──────────────────────────────
  const handleRemoveGroup = useCallback((cardId: string, isUpgraded: boolean) => {
    const key = deckGroupKey(cardId, isUpgraded);
    setCards(prev => prev.filter(inst => deckGroupKey(inst.card_ID, inst.isUpgraded) !== key));
    setDrawOrder(null);
    markDirty();
  }, []);

  // ── Clustered view: flip isUpgraded for ALL instances in a group ──────────────
  const handleToggleUpgradeGroup = useCallback((cardId: string, isUpgraded: boolean) => {
    const key = deckGroupKey(cardId, isUpgraded);
    setCards(prev => prev.map(inst =>
      deckGroupKey(inst.card_ID, inst.isUpgraded) === key
        ? { ...inst, isUpgraded: !isUpgraded }
        : inst,
    ));
    setDrawOrder(null);
    markDirty();
  }, []);

  // ── Separate view: flip isUpgraded for ONE instance ───────────────────────────
  const handleToggleUpgradeInstance = useCallback((uid: string) => {
    setCards(prev => prev.map(inst =>
      inst.uid === uid ? { ...inst, isUpgraded: !inst.isUpgraded } : inst,
    ));
    setDrawOrder(null);
    markDirty();
  }, []);

  // ── Separate view: remove ONE instance ───────────────────────────────────────
  const handleRemoveInstance = useCallback((uid: string) => {
    setCards(prev => prev.filter(inst => inst.uid !== uid));
    setDrawOrder(null);
    markDirty();
  }, []);

  // ── Player update ─────────────────────────────────────────────────────────────
  const handlePlayerChange = useCallback((updates: Partial<PlayerSetup>) => {
    setPlayer(prev => ({ ...prev, ...updates }));
    markDirty();
  }, []);

  // ── Launch combat (preserve existing enemies) ─────────────────────────────────
  const handleLaunch = useCallback(async () => {
    const orderedEntries = drawOrder
      ? drawOrder.map(o => ({ card_ID: o.card_ID, isUpgraded: o.isUpgraded }))
      : cards.map(i => ({ card_ID: i.card_ID, isUpgraded: i.isUpgraded }));

    const existingEnemies = gameState?.enemies ?? [];

    const payload: CombatData = {
      player: {
        ...player,
        energy:        { base: player.energy.base, turn1Bonus: 0 },
        currentBlock:  0,
        currentEnergy: player.energy.base,
        modifiers:     player.modifiers,
        bonusEnergy:   player.bonusEnergy,
        bonusBlock:    player.bonusBlock,
        relicEffects:  [],
        activeRelics:  [],
        buffsDebuffs:  player.buffsDebuffs,
      },
      deck:           orderedEntries,
      draw:           [],
      discard:        [],
      exhaust:        [],
      hand:           [],
      playedCards:    [],
      activityLog:    [],
      enemies:        existingEnemies,
      potionBelt:     player.potions.map(p =>
        p.name ? { name: p.name, type: "Potion" as const, description: p.description } : null,
      ),
      potionBeltSize: player.potionBeltSize,
    };

    await loadGameDataFromJson(payload);
    router.push("/");
  }, [drawOrder, cards, player, loadGameDataFromJson, router, gameState]);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const totalCards      = cards.length;
  const drawOrderActive = drawOrder !== null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">

      {/* Hidden file input for import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        onChange={handleImportFile}
      />

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="relative z-30 shrink-0 flex flex-wrap items-center gap-2 border-b border-slate-800/60 bg-slate-900/90 px-4 py-2.5 backdrop-blur">
        <Link href="/editors"
          className="flex items-center gap-1.5 rounded border border-slate-700/40 px-2.5 py-1 text-xs text-slate-400 transition hover:text-slate-200">
          <ArrowLeft className="h-3.5 w-3.5" /> Editors
        </Link>

        {/* Deck name */}
        <input
          type="text" value={deckName}
          onChange={e => { setDeckName(e.target.value); markDirty(); }}
          className="w-40 rounded border border-slate-700/40 bg-slate-800/60 px-2.5 py-1 text-sm font-medium text-slate-200 focus:border-indigo-500/50 focus:outline-none"
          placeholder="Deck name"
        />

        {/* Saved deck dropdown */}
        <div className="relative z-[200]" onClick={e => e.stopPropagation()}>
          <button type="button" onClick={() => setShowDeckDD(v => !v)}
            className="flex items-center gap-1.5 rounded border border-slate-700/40 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-400 transition hover:text-slate-200">
            <ChevronDown className="h-3.5 w-3.5" />
            {savedDecks.length > 0 ? `${savedDecks.length} saved` : "No saved decks"}
          </button>
          {showDeckDD && (
            <div className="absolute left-0 top-full mt-1 min-w-52 rounded-lg border border-slate-700/50 bg-slate-900 shadow-xl z-[300]">
              {savedDecks.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-600">No saved decks yet.</p>
              ) : savedDecks.map(d => (
                <button key={d.id} type="button" onClick={() => loadDeck(d)}
                  className={["flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-slate-800/60",
                    d.id === activeDeckId ? "text-indigo-300" : "text-slate-300",
                  ].join(" ")}>
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className="text-slate-600">{d.cards.length} cards</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <button type="button" onClick={handleSave}
          className={["flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition",
            isDirty
              ? "border-indigo-500/60 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30"
              : "border-slate-700/40 bg-slate-800/40 text-slate-500 hover:text-slate-300",
          ].join(" ")}>
          <Save className="h-3.5 w-3.5" />{isDirty ? "Save*" : "Save"}
        </button>

        {/* New */}
        <button type="button" onClick={handleNew}
          className="flex items-center gap-1.5 rounded border border-slate-700/40 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-400 transition hover:text-slate-200">
          <Plus className="h-3.5 w-3.5" /> New
        </button>

        {/* Starter deck */}
        <button type="button" onClick={() => setStarterOpen(true)}
          title="Add starter cards for a character"
          className="flex items-center gap-1.5 rounded border border-amber-700/40 bg-amber-950/30 px-2.5 py-1 text-xs text-amber-400 transition hover:bg-amber-950/50">
          <Zap className="h-3.5 w-3.5" /> Starter
        </button>

        {/* Export */}
        <button type="button" onClick={handleExport}
          className="flex items-center gap-1.5 rounded border border-slate-700/40 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-400 transition hover:text-slate-200">
          <Download className="h-3.5 w-3.5" /> Export
        </button>

        {/* Import */}
        <button type="button" onClick={() => importFileRef.current?.click()}
          className="flex items-center gap-1.5 rounded border border-slate-700/40 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-400 transition hover:text-slate-200">
          <Upload className="h-3.5 w-3.5" /> Import
        </button>

        {/* Delete */}
        {activeDeckId && (
          <button type="button" onClick={handleDelete}
            className="flex items-center gap-1.5 rounded border border-rose-900/40 bg-rose-950/20 px-2.5 py-1 text-xs text-rose-500 transition hover:bg-rose-950/40">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        )}

        <div className="flex-1" />

        {/* Launch */}
        <button type="button" onClick={handleLaunch}
          className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-600/20 px-4 py-1.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-600/35 hover:border-amber-400/60">
          <Swords className="h-4 w-4" />
          Launch Combat →
        </button>
      </header>

      {/* ── 3-column body ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Player Setup / Draw Order */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/40 overflow-hidden">
          <div className="flex shrink-0 border-b border-slate-800/60">
            {(["player", "draw"] as const).map(tab => (
              <button key={tab} type="button" onClick={() => setLeftTab(tab)}
                className={["flex-1 py-2 text-xs font-medium transition flex items-center justify-center gap-1.5",
                  leftTab === tab ? "border-b-2 border-indigo-500 text-indigo-300" : "text-slate-500 hover:text-slate-300",
                ].join(" ")}>
                {tab === "player" ? "Player Setup" : (
                  <>Draw Order {drawOrderActive && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}</>
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            {leftTab === "player"
              ? <DeckBuilderPlayerSetup player={player} onChange={handlePlayerChange} />
              : <DeckBuilderDrawOrder cards={cards} drawOrder={drawOrder} onChange={order => { setDrawOrder(order); markDirty(); }} />}
          </div>
        </aside>

        {/* CENTRE — Card picker */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <DeckBuilderCardPicker deckCards={cards} onAddCard={handleAddCard} />
        </main>

        {/* RIGHT — Deck list */}
        <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800/60 bg-slate-900/40 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-slate-800/60">
            <span className="text-xs font-semibold text-slate-300">Deck</span>
            <span className="text-xs text-slate-500 tabular-nums">{totalCards} cards</span>
          </div>
          <DeckBuilderDeckList
            cards={cards}
            onAddToGroup={handleAddToGroup}
            onRemoveFromGroup={handleRemoveFromGroup}
            onRemoveGroup={handleRemoveGroup}
            onToggleUpgradeGroup={handleToggleUpgradeGroup}
            onToggleUpgradeInstance={handleToggleUpgradeInstance}
            onRemoveInstance={handleRemoveInstance}
          />
        </aside>
      </div>

      {/* Starter deck modal */}
      {starterOpen && (
        <DeckBuilderStarterModal
          defaultCharacter={player.characters}
          onAdd={handleStarterAdd}
          onClose={() => setStarterOpen(false)}
        />
      )}
    </div>
  );
}
