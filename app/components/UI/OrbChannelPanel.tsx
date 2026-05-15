"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus } from "lucide-react";
import { useGameManager } from "@/app/context/GameContext";
import { getOrbDefaults } from "@/app/utils/orbDefaults";
import type { OrbType } from "@/app/types/gameTypes";

const FOCUS_STORAGE_KEY = "sts-orb-focus";

const ORB_CFG: { type: OrbType; label: string; emoji: string; bg: string; border: string }[] = [
  { type: "lightning", label: "Lightning", emoji: "⚡", bg: "bg-yellow-950/60", border: "border-yellow-500/50" },
  { type: "dark",      label: "Dark",      emoji: "🌑", bg: "bg-purple-950/60", border: "border-purple-500/50" },
  { type: "frost",     label: "Frost",     emoji: "🔵", bg: "bg-sky-950/60",    border: "border-sky-500/50"    },
  { type: "plasma",    label: "Plasma",    emoji: "⬜", bg: "bg-slate-800/60",  border: "border-slate-500/50"  },
];

export { ORB_CFG };

export default function OrbChannelPanel() {
  const {
    gameState,
    channelOrb,
    evokeOrb,
    triggerSingleOrbPassive,
    setOrbChannelSize,
  } = useGameManager();

  const [evokeTimes, setEvokeTimes] = useState(0);
  const [orbPassiveDmg, setOrbPassiveDmg] = useState<number[]>([]);
  const [orbEvokeDmg, setOrbEvokeDmg] = useState<number[]>([]);
  const [focus, setFocusVal] = useState(0);

  // Persist focus across sessions
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FOCUS_STORAGE_KEY);
      if (stored !== null) setFocusVal(Number(stored) || 0);
    } catch { /* ignore */ }
  }, []);

  const updateFocus = (v: number) => {
    setFocusVal(v);
    try { localStorage.setItem(FOCUS_STORAGE_KEY, String(v)); } catch { /* ignore */ }
  };

  // Returns the effective passive value for a given orb slot, adding focus if applicable
  const effectivePassive = (orbType: OrbType, basePassive: number): number => {
    const defaults = getOrbDefaults();
    const focusAffected = defaults[orbType]?.passiveFocus ?? false;
    return basePassive + (focusAffected ? focus : 0);
  };

  // Returns the effective evoke value for a given orb slot, adding focus if applicable
  const effectiveEvoke = (orbType: OrbType, baseEvoke: number): number => {
    const defaults = getOrbDefaults();
    const focusAffected = defaults[orbType]?.evokeFocus ?? false;
    return baseEvoke + (focusAffected ? focus : 0);
  };
  const [editingOrb, setEditingOrb] = useState<{ idx: number; kind: "passive" | "evoke" } | null>(null);
  const [editingOrbVal, setEditingOrbVal] = useState("");

  useEffect(() => {
    const orbLen = (gameState?.orbs ?? []).length;
    const sync = (prev: number[]) => {
      if (prev.length === orbLen) return prev;
      if (orbLen > prev.length) return [...Array(orbLen - prev.length).fill(0), ...prev];
      return prev.slice(0, orbLen);
    };
    setOrbPassiveDmg(sync);
    setOrbEvokeDmg(sync);
  }, [(gameState?.orbs ?? []).length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChannelOrb = (type: OrbType) => {
    const orbs = gameState?.orbs ?? [];
    const size = gameState?.orbChannelSize ?? 3;
    const isFull = orbs.length >= size;
    const defaults = getOrbDefaults();
    const passiveDef = defaults[type]?.passiveDmg ?? 0;
    const evokeDef   = defaults[type]?.evokeDmg   ?? 0;
    if (isFull) {
      const droppedDmg = orbPassiveDmg[orbs.length - 1] ?? 0;
      channelOrb(type, droppedDmg);
      setOrbPassiveDmg(prev => [passiveDef, ...prev.slice(0, size - 1)]);
      setOrbEvokeDmg(prev   => [evokeDef,   ...prev.slice(0, size - 1)]);
    } else {
      channelOrb(type);
      setOrbPassiveDmg(prev => [passiveDef, ...prev]);
      setOrbEvokeDmg(prev   => [evokeDef,   ...prev]);
    }
  };

  const handleEvokeOrb = () => {
    const orbs = gameState?.orbs ?? [];
    if (orbs.length === 0) return;
    const lastIdx = orbs.length - 1;
    const orbType = orbs[lastIdx];
    const passiveVal = orbType ? effectivePassive(orbType, orbPassiveDmg[lastIdx] ?? 0) : (orbPassiveDmg[lastIdx] ?? 0);
    const evokeVal   = orbType ? effectiveEvoke(orbType, orbEvokeDmg[lastIdx] ?? 0)   : (orbEvokeDmg[lastIdx] ?? 0);
    evokeOrb(1, evokeTimes, passiveVal, evokeVal);
    setOrbPassiveDmg(prev => prev.slice(0, Math.max(0, prev.length - 1)));
    setOrbEvokeDmg(prev   => prev.slice(0, Math.max(0, prev.length - 1)));
  };

  const handleDecreaseOrbSize = () => {
    const orbs = gameState?.orbs ?? [];
    const size = gameState?.orbChannelSize ?? 3;
    const next = Math.max(1, size - 1);
    setOrbChannelSize(next);
    if (orbs.length > next) {
      setOrbPassiveDmg(prev => prev.length > next ? prev.slice(prev.length - next) : prev);
      setOrbEvokeDmg(prev   => prev.length > next ? prev.slice(prev.length - next) : prev);
    }
  };

  return (
    <div className="rounded-xl border border-purple-500/25 bg-purple-950/15 px-3 py-2 flex flex-col gap-2 min-w-[260px]">
      {/* Row 1: current orb slots */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300/80">
            Orbs
            <span className="ml-1 font-normal normal-case tracking-normal text-purple-400/60">
              {(gameState?.orbs ?? []).length}/{gameState?.orbChannelSize ?? 3}
            </span>
          </p>
          <button
            type="button"
            disabled={!gameState}
            onClick={handleDecreaseOrbSize}
            className="flex h-4 w-4 items-center justify-center rounded border border-purple-700/50 bg-purple-950/60 text-purple-300 transition hover:border-purple-500/70 hover:bg-purple-900/60 disabled:cursor-not-allowed disabled:opacity-40"
            title="Decrease orb slots"
          >
            <Minus className="h-2 w-2" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            disabled={!gameState}
            onClick={() => setOrbChannelSize((gameState?.orbChannelSize ?? 3) + 1)}
            className="flex h-4 w-4 items-center justify-center rounded border border-purple-600/50 bg-purple-900/40 text-purple-200 transition hover:border-purple-400/70 hover:bg-purple-800/50 disabled:cursor-not-allowed disabled:opacity-40"
            title="Increase orb slots"
          >
            <Plus className="h-2 w-2" strokeWidth={2.5} />
          </button>
        </div>

        {(() => {
          const orbs = gameState?.orbs ?? [];
          const size = gameState?.orbChannelSize ?? 3;
          const leftPad = size - orbs.length;
          return (
            <div className="flex items-end gap-1">
              {Array.from({ length: size }, (_, displayIdx) => {
                const orbArrayIdx = displayIdx - leftPad;
                const orb = orbArrayIdx >= 0 ? orbs[orbArrayIdx] : null;
                const cfg = orb ? ORB_CFG.find(o => o.type === orb) : null;
                const basePassive = orb && orbArrayIdx >= 0 ? (orbPassiveDmg[orbArrayIdx] ?? 0) : 0;
                const dispPassive = orb ? effectivePassive(orb, basePassive) : 0;
                const baseEvoke = orb && orbArrayIdx >= 0 ? (orbEvokeDmg[orbArrayIdx] ?? 0) : 0;
                const dispEvoke = orb ? effectiveEvoke(orb, baseEvoke) : 0;
                return (
                  <div key={displayIdx} className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      disabled={!orb || !gameState}
                      onClick={() => {
                        if (!orb || orbArrayIdx < 0) return;
                        triggerSingleOrbPassive(orbArrayIdx, dispPassive);
                      }}
                      title={orb ? `${orb} passive (slot ${displayIdx + 1}) — click to log` : `Slot ${displayIdx + 1}: empty`}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition ${
                        cfg
                          ? `${cfg.bg} ${cfg.border} hover:opacity-75`
                          : "bg-slate-900/50 border-slate-700/40"
                      } disabled:cursor-default`}
                    >
                      {cfg ? cfg.emoji : <span className="text-slate-600 text-xs">·</span>}
                    </button>
                    {orb ? (
                      <>
                        <button
                          type="button"
                          onClick={() => { setEditingOrb({ idx: orbArrayIdx, kind: "passive" }); setEditingOrbVal(String(basePassive)); }}
                          style={{ width: "28px" }}
                          className="rounded border border-purple-700/40 bg-slate-900/80 py-0.5 text-center text-[10px] font-semibold text-purple-200 transition hover:border-purple-500/60 hover:bg-purple-950/50"
                          title={`Passive: base ${basePassive}${dispPassive !== basePassive ? ` + ${focus} focus = ${dispPassive}` : ""} — click to edit base`}
                        >
                          {dispPassive}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingOrb({ idx: orbArrayIdx, kind: "evoke" }); setEditingOrbVal(String(baseEvoke)); }}
                          style={{ width: "28px" }}
                          className="rounded border border-yellow-700/40 bg-slate-900/80 py-0.5 text-center text-[10px] font-semibold text-yellow-200 transition hover:border-yellow-500/60 hover:bg-yellow-950/50"
                          title={`Evoke: base ${baseEvoke}${dispEvoke !== baseEvoke ? ` + ${focus} focus = ${dispEvoke}` : ""} — click to edit base`}
                        >
                          {dispEvoke}
                        </button>
                      </>
                    ) : (
                      <div style={{ width: "28px", height: "40px" }} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      <div className="border-t border-purple-700/25" />

      {/* Row 2: controls (channel + evoke) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300/60 shrink-0">Channel</p>
          {ORB_CFG.map(({ type, emoji, label, bg, border }) => (
            <button
              key={type}
              type="button"
              disabled={!gameState}
              onClick={() => handleChannelOrb(type)}
              title={`Channel ${label} Orb`}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 ${bg} ${border}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-purple-700/30 shrink-0" />

        <div className="flex items-center gap-1.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300/60 shrink-0">
            Evoke
            <span className="ml-1 font-normal normal-case tracking-normal text-purple-400/60">×{evokeTimes}</span>
          </p>
          <button
            type="button"
            onClick={handleEvokeOrb}
            disabled={!gameState || (gameState?.orbs ?? []).length === 0}
            className="rounded-lg border border-yellow-500/40 bg-yellow-950/50 px-2 py-1 text-[10px] font-semibold text-yellow-100 transition hover:bg-yellow-900/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Evoke
          </button>
          <input
            type="number"
            min={0}
            value={evokeTimes}
            onChange={e => setEvokeTimes(Math.max(0, Number(e.target.value)))}
            style={{ width: "36px" }}
            className="rounded-lg border border-slate-600 bg-slate-900 px-1 py-1 text-center text-xs text-slate-100 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
            aria-label="Times evoked"
            title="Times evoked — editable"
          />
        </div>
      </div>

      <div className="border-t border-purple-700/25" />

      {/* Focus input */}
      <div className="flex items-center gap-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300/60 shrink-0">Focus</p>
        <input
          type="number"
          value={focus}
          onChange={e => updateFocus(Math.max(0, Number(e.target.value) || 0))}
          style={{ width: "48px" }}
          className="rounded-lg border border-purple-700/50 bg-slate-900/80 px-2 py-1 text-center text-xs font-semibold text-purple-200 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden focus:outline-none focus:border-purple-500/70 transition-colors"
          title="Focus — added to passive/evoke values that have +Focus enabled"
        />
        <p className="text-[9px] text-purple-400/50">adds to ⚡ flagged slots</p>
      </div>

      {editingOrb !== null && typeof window !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setEditingOrb(null); }}
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-64 mx-4">
            <div className="px-4 py-3 border-b border-zinc-700">
              <p className="text-sm font-semibold text-zinc-100">
                {(() => {
                  const orb = (gameState?.orbs ?? [])[editingOrb.idx];
                  const cfg = orb ? ORB_CFG.find(o => o.type === orb) : null;
                  return cfg ? `${cfg.emoji} ${cfg.label} (slot ${editingOrb.idx + 1})` : `Slot ${editingOrb.idx + 1}`;
                })()}
              </p>
              <p className={`text-xs mt-0.5 ${editingOrb.kind === "passive" ? "text-purple-400" : "text-yellow-400"}`}>
                {editingOrb.kind === "passive" ? "Passive value" : "Evoke value"}
              </p>
            </div>
            <div className="px-4 py-3">
              <input
                type="number"
                autoFocus
                min={0}
                value={editingOrbVal}
                onChange={e => setEditingOrbVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const v = Math.max(0, Number(editingOrbVal) || 0);
                    const setter = editingOrb.kind === "passive" ? setOrbPassiveDmg : setOrbEvokeDmg;
                    setter(prev => { const n = [...prev]; n[editingOrb.idx] = v; return n; });
                    setEditingOrb(null);
                  }
                  if (e.key === "Escape") setEditingOrb(null);
                }}
                className={`w-full rounded-lg border bg-slate-800 px-3 py-2 text-center text-lg font-bold text-slate-100 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden focus:outline-none transition-colors ${
                  editingOrb.kind === "passive"
                    ? "border-slate-600 focus:border-purple-500/70"
                    : "border-slate-600 focus:border-yellow-500/70"
                }`}
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-700">
              <button
                onClick={() => setEditingOrb(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const v = Math.max(0, Number(editingOrbVal) || 0);
                  const setter = editingOrb.kind === "passive" ? setOrbPassiveDmg : setOrbEvokeDmg;
                  setter(prev => { const n = [...prev]; n[editingOrb.idx] = v; return n; });
                  setEditingOrb(null);
                }}
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors ${
                  editingOrb.kind === "passive"
                    ? "bg-purple-700 hover:bg-purple-600"
                    : "bg-yellow-700 hover:bg-yellow-600"
                }`}
              >
                Set
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
