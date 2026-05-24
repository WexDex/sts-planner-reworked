"use client";

import { Plus, X } from "lucide-react";
import type { PlayerSetup } from "./deckBuilderTypes";

const CHARACTERS: Array<{ id: PlayerSetup["characters"]; label: string; cls: string }> = [
  { id: "ironclad", label: "Ironclad", cls: "border-red-500/60 bg-red-950/50 text-red-200" },
  { id: "silent",   label: "Silent",   cls: "border-emerald-500/60 bg-emerald-950/50 text-emerald-200" },
  { id: "defect",   label: "Defect",   cls: "border-sky-500/60 bg-sky-950/50 text-sky-200" },
  { id: "watcher",  label: "Watcher",  cls: "border-violet-500/60 bg-violet-950/50 text-violet-200" },
  { id: "colorless",label: "Colorless",cls: "border-zinc-400/50 bg-zinc-700/40 text-zinc-100" },
];

const DEFAULT_HP: Record<PlayerSetup["characters"], number> = {
  ironclad: 80,
  silent:   70,
  defect:   75,
  watcher:  72,
  colorless: 75,
};

const LABEL_CLS  = "text-[11px] text-slate-500 uppercase tracking-wider font-semibold";
const DIVIDER    = "my-2.5 border-t border-slate-700/30";

function NumInput({ value, onChange, min = 0, max, step = 1, cls = "" }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; cls?: string;
}) {
  return (
    <input
      type="number" min={min} max={max} step={step} value={value}
      onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(n); }}
      className={`w-16 rounded border border-slate-700/50 bg-slate-800/60 px-2 py-1 text-xs text-slate-200 tabular-nums focus:border-indigo-500/50 focus:outline-none ${cls}`}
    />
  );
}

function TxtInput({ value, onChange, placeholder = "", cls = "" }: {
  value: string; onChange: (s: string) => void; placeholder?: string; cls?: string;
}) {
  return (
    <input
      type="text" value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={`flex-1 min-w-0 rounded border border-slate-700/50 bg-slate-800/60 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none ${cls}`}
    />
  );
}

interface Props { player: PlayerSetup; onChange: (u: Partial<PlayerSetup>) => void; }

export default function DeckBuilderPlayerSetup({ player, onChange }: Props) {

  // ── Relics ────────────────────────────────────────────────────────────────────
  const addRelic    = () => onChange({ relics: [...player.relics, { name: "", description: "" }] });
  const updateRelic = (i: number, f: "name" | "description", v: string) =>
    onChange({ relics: player.relics.map((r, j) => j === i ? { ...r, [f]: v } : r) });
  const removeRelic = (i: number) =>
    onChange({ relics: player.relics.filter((_, j) => j !== i) });

  // ── Buffs ─────────────────────────────────────────────────────────────────────
  const addBuff    = () => onChange({ buffsDebuffs: [...player.buffsDebuffs, { name: "", stacks: 1, type: "buff" as const, description: "" }] });
  const updateBuff = (i: number, patch: Partial<PlayerSetup["buffsDebuffs"][number]>) =>
    onChange({ buffsDebuffs: player.buffsDebuffs.map((b, j) => j === i ? { ...b, ...patch } : b) });
  const removeBuff = (i: number) =>
    onChange({ buffsDebuffs: player.buffsDebuffs.filter((_, j) => j !== i) });

  // ── Potions ───────────────────────────────────────────────────────────────────
  const addPotion    = () => {
    if (player.potions.length >= player.potionBeltSize) return;
    onChange({ potions: [...player.potions, { name: "", description: "" }] });
  };
  const updatePotion = (i: number, f: "name" | "description", v: string) =>
    onChange({ potions: player.potions.map((p, j) => j === i ? { ...p, [f]: v } : p) });
  const removePotion = (i: number) =>
    onChange({ potions: player.potions.filter((_, j) => j !== i) });

  const row = "flex items-center justify-between gap-2";

  return (
    <div className="h-full flex flex-col gap-2.5 overflow-y-auto px-3 py-3 text-slate-300">

      {/* Character */}
      <div>
        <span className={LABEL_CLS}>Character</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CHARACTERS.map(ch => (
            <button key={ch.id} type="button"
              onClick={() => {
                const hp = DEFAULT_HP[ch.id];
                onChange({ characters: ch.id, hp, maxHp: hp });
              }}
              className={["rounded-md border px-2.5 py-1 text-xs font-medium transition",
                player.characters === ch.id
                  ? ch.cls
                  : "border-slate-700/40 text-slate-500 hover:border-slate-600/50 hover:text-slate-300",
              ].join(" ")}
            >{ch.label}</button>
          ))}
        </div>
      </div>

      <div className={DIVIDER} />

      {/* HP */}
      <div className={row}>
        <span className={LABEL_CLS}>HP</span>
        <div className="flex items-center gap-1.5">
          <NumInput value={player.hp} onChange={hp => onChange({ hp })} min={1} max={player.maxHp} />
          <span className="text-slate-600 text-xs">/</span>
          <span className="text-[11px] text-slate-500">Max</span>
          <NumInput value={player.maxHp} onChange={maxHp => onChange({ maxHp })} min={1} />
        </div>
      </div>

      {/* Energy */}
      <div className={row}>
        <span className={LABEL_CLS}>Energy</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Base</span>
          <NumInput value={player.energy.base} onChange={n => onChange({ energy: { base: n } })} min={0} max={9} />
        </div>
      </div>

      {/* Bonus Energy / Block */}
      <div className={row}>
        <span className={LABEL_CLS}>Bonuses</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">⚡</span>
          <NumInput value={player.bonusEnergy} onChange={n => onChange({ bonusEnergy: n })} min={0} cls="w-12" />
          <span className="text-[11px] text-slate-500">🛡</span>
          <NumInput value={player.bonusBlock} onChange={n => onChange({ bonusBlock: n })} min={0} cls="w-12" />
        </div>
      </div>

      {/* Draw/Turn */}
      <div className={row}>
        <span className={LABEL_CLS}>Draw / Turn</span>
        <NumInput value={player.drawPerTurn} onChange={n => onChange({ drawPerTurn: n })} min={0} max={20} />
      </div>

      {/* Floor */}
      <div className={row}>
        <span className={LABEL_CLS}>Floor</span>
        <NumInput value={player.floor} onChange={n => onChange({ floor: n })} min={1} max={57} />
      </div>

      <div className={DIVIDER} />

      {/* Combat Name + Type */}
      <div>
        <span className={LABEL_CLS}>Combat Name</span>
        <input type="text" value={player.combatName} placeholder="Combat"
          onChange={e => onChange({ combatName: e.target.value })}
          className="mt-1 w-full rounded border border-slate-700/50 bg-slate-800/60 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none" />
      </div>
      <div className={row}>
        <span className={LABEL_CLS}>Combat Type</span>
        <div className="flex gap-1">
          {(["normal", "Elite", "Boss"] as const).map(t => (
            <button key={t} type="button"
              onClick={() => onChange({ combatType: t })}
              className={["rounded border px-2 py-0.5 text-[11px] font-medium transition",
                player.combatType === t
                  ? t === "Boss" ? "border-red-500/60 bg-red-950/50 text-red-200"
                    : t === "Elite" ? "border-orange-500/60 bg-orange-950/50 text-orange-200"
                    : "border-slate-500/60 bg-slate-700/50 text-slate-200"
                  : "border-slate-700/40 text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className={DIVIDER} />

      {/* Modifiers */}
      <div>
        <span className={LABEL_CLS}>Modifiers</span>
        <div className="mt-1.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">Vuln. multiplier</span>
            <NumInput value={player.modifiers.vulnerableMultiplier}
              onChange={n => onChange({ modifiers: { ...player.modifiers, vulnerableMultiplier: n } })}
              step={0.05} min={1} max={3} cls="w-16" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">Weak multiplier</span>
            <NumInput value={player.modifiers.weakMultiplier}
              onChange={n => onChange({ modifiers: { ...player.modifiers, weakMultiplier: n } })}
              step={0.05} min={0} max={1} cls="w-16" />
          </div>
        </div>
      </div>

      <div className={DIVIDER} />

      {/* Relics */}
      <div>
        <div className="flex items-center justify-between">
          <span className={LABEL_CLS}>Relics</span>
          <button type="button" onClick={addRelic}
            className="flex items-center gap-1 rounded border border-slate-700/40 bg-slate-800/40 px-2 py-0.5 text-[11px] text-slate-400 transition hover:text-slate-200">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {player.relics.length > 0 && (
          <ul className="mt-1.5 space-y-1.5">
            {player.relics.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <div className="flex flex-1 flex-col gap-1">
                  <TxtInput value={r.name} onChange={v => updateRelic(i, "name", v)} placeholder="Relic name" />
                  <TxtInput value={r.description} onChange={v => updateRelic(i, "description", v)} placeholder="Effect description" />
                </div>
                <button type="button" onClick={() => removeRelic(i)}
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-600 hover:text-rose-400 transition">
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={DIVIDER} />

      {/* Potions */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={LABEL_CLS}>Potions</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-600">slots</span>
              <NumInput value={player.potionBeltSize} onChange={n => onChange({ potionBeltSize: Math.max(1, n) })} min={1} max={6} cls="w-10" />
            </div>
          </div>
          <button type="button" onClick={addPotion}
            disabled={player.potions.length >= player.potionBeltSize}
            className="flex items-center gap-1 rounded border border-slate-700/40 bg-slate-800/40 px-2 py-0.5 text-[11px] text-slate-400 transition hover:text-slate-200 disabled:opacity-30">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {player.potions.length > 0 && (
          <ul className="mt-1.5 space-y-1.5">
            {player.potions.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <div className="flex flex-1 flex-col gap-1">
                  <TxtInput value={p.name} onChange={v => updatePotion(i, "name", v)} placeholder="Potion name" />
                  <TxtInput value={p.description} onChange={v => updatePotion(i, "description", v)} placeholder="Effect" />
                </div>
                <button type="button" onClick={() => removePotion(i)}
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-600 hover:text-rose-400 transition">
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* Potion belt slots visual */}
        <div className="mt-1.5 flex gap-1">
          {Array.from({ length: player.potionBeltSize }, (_, i) => (
            <div key={i} className={[
              "h-5 w-5 rounded border text-center text-[10px] leading-5",
              i < player.potions.length
                ? "border-amber-600/50 bg-amber-950/40 text-amber-400"
                : "border-slate-700/40 bg-slate-800/20 text-slate-700",
            ].join(" ")}>
              {i < player.potions.length ? "🧪" : "·"}
            </div>
          ))}
        </div>
      </div>

      <div className={DIVIDER} />

      {/* Start Buffs / Debuffs */}
      <div>
        <div className="flex items-center justify-between">
          <span className={LABEL_CLS}>Start Buffs / Debuffs</span>
          <button type="button" onClick={addBuff}
            className="flex items-center gap-1 rounded border border-slate-700/40 bg-slate-800/40 px-2 py-0.5 text-[11px] text-slate-400 transition hover:text-slate-200">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {player.buffsDebuffs.length > 0 && (
          <ul className="mt-1.5 space-y-2">
            {player.buffsDebuffs.map((bd, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex gap-1">
                    <TxtInput value={bd.name} onChange={v => updateBuff(i, { name: v })} placeholder="Name" />
                    <NumInput value={bd.stacks} onChange={n => updateBuff(i, { stacks: n })} min={-999} max={999} cls="w-12" />
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="flex rounded-md border border-slate-700/40 overflow-hidden text-[11px]">
                      {(["buff", "debuff"] as const).map(t => (
                        <button key={t} type="button" onClick={() => updateBuff(i, { type: t })}
                          className={["px-2 py-0.5 font-medium transition",
                            bd.type === t
                              ? t === "buff" ? "bg-emerald-700/60 text-emerald-200" : "bg-rose-800/60 text-rose-200"
                              : "bg-slate-800/40 text-slate-500 hover:text-slate-300",
                          ].join(" ")}>{t}</button>
                      ))}
                    </div>
                    <TxtInput value={bd.description} onChange={v => updateBuff(i, { description: v })} placeholder="Description" />
                  </div>
                </div>
                <button type="button" onClick={() => removeBuff(i)}
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-600 hover:text-rose-400 transition">
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
