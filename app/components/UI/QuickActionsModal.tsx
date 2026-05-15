"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Battery,
  BookOpen,
  ChevronRight,
  CircleOff,
  Copy,
  Eye,
  Flame,
  Heart,
  HeartCrack,
  LayoutGrid,
  ListOrdered,
  PackagePlus,
  Play,
  RefreshCw,
  Shield,
  Shuffle,
  Skull,
  Sparkles,
  Swords,
  Trash2,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { useGameManager } from "@/app/context/GameContext";
import QuickActionInputPopup from "@/app/components/UI/QuickActionInputPopup";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QAMActionType =
  | "give_buff"
  | "give_debuff"
  | "remove_buff"
  | "modify_hp"
  | "modify_block"
  | "modify_energy"
  | "draw_cards"
  | "move_to_pile"
  | "add_card"
  | "channel_orb"
  | "evoke_orbs"
  | "set_stance"
  | "give_enemy_buff"
  | "give_enemy_debuff"
  | "modify_enemy_hp"
  | "modify_enemy_block"
  | "remove_enemy_buff"
  | "trigger_orb_passive"
  | "discard_hand"
  | "reshuffle_discard"
  | "set_orb_slots"
  | "adjust_orb_slots"
  | "exhaust_card"
  | "copy_card_to_hand"
  | "exhaust_hand"
  | "shuffle_hand_to_draw"
  | "scry"
  | "apply_burn"
  | "trigger_enemy_intent"
  | "set_enemy_intent";

export type QAMAction = {
  label: string;
  actionType: QAMActionType;
  buffName?: string;
  buffType?: "buff" | "debuff";
  hasInput?: boolean;
  defaultValue?: number;
  pile?: string;
  cardName?: string;
  cardNames?: string[];
  cardCount?: number;
  orbType?: "lightning" | "dark" | "frost" | "plasma";
  orbCount?: number;
  stance?: "neutral" | "wrath" | "calm" | "divinity";
  enemyIndex?: number;
  allEnemies?: boolean;
};

type PopupState = { title: string; defaultValue: number; onApply: (v: number) => void } | null;
type EnemyPickerState = { action: QAMAction; preValue?: number } | null;

// ─── Enemy action types ───────────────────────────────────────────────────────

const ENEMY_ACTION_TYPES = new Set<QAMActionType>([
  "give_enemy_buff",
  "give_enemy_debuff",
  "modify_enemy_hp",
  "modify_enemy_block",
  "remove_enemy_buff",
]);

const NO_INPUT_TYPES = new Set<QAMActionType>([
  "channel_orb",
  "set_stance",
  "discard_hand",
  "reshuffle_discard",
  "remove_buff",
  "exhaust_card",
  "exhaust_hand",
  "copy_card_to_hand",
]);

// ─── Tooltip helper ───────────────────────────────────────────────────────────

export function qaTooltip(a: QAMAction): string {
  switch (a.actionType) {
    case "give_buff": return `Give player "${a.buffName}" buff${a.hasInput ? " (enter stacks)" : ""}.`;
    case "give_debuff": return `Apply "${a.buffName}" debuff to player${a.hasInput ? " (enter stacks)" : ""}.`;
    case "remove_buff": return `Remove "${a.buffName}" from player.`;
    case "modify_hp": return `Change player HP${a.hasInput ? " (enter value)" : ` by ${a.defaultValue}`}.`;
    case "modify_block": return `Modify player block${a.hasInput ? " (enter value)" : ` by ${a.defaultValue}`}.`;
    case "modify_energy": return `Adjust energy${a.hasInput ? " (enter value)" : ` by ${a.defaultValue}`}.`;
    case "draw_cards": return `Draw ${a.hasInput ? "N" : a.defaultValue} cards.`;
    case "move_to_pile": return `Move selected card to ${a.pile ?? "hand"}.`;
    case "add_card": return `Add card to ${a.pile ?? "hand"}.`;
    case "channel_orb": return `Channel ${a.orbCount ?? 1}x ${a.orbType ?? "lightning"} orb.`;
    case "evoke_orbs": return `Evoke ${a.hasInput ? "N" : a.defaultValue ?? 1} orb(s).`;
    case "set_stance": return `Set stance to ${a.stance ?? "neutral"}.`;
    case "give_enemy_buff": return `Give "${a.buffName}" buff to ${a.allEnemies ? "all enemies" : "selected enemies"}${a.hasInput ? " (enter stacks)" : ""}.`;
    case "give_enemy_debuff": return `Apply "${a.buffName}" debuff to ${a.allEnemies ? "all enemies" : "selected enemies"}${a.hasInput ? " (enter stacks)" : ""}.`;
    case "modify_enemy_hp": return `Change HP of ${a.allEnemies ? "all enemies" : "selected enemies"}${a.hasInput ? " (enter value)" : ` by ${a.defaultValue}`}.`;
    case "modify_enemy_block": return `Modify block of ${a.allEnemies ? "all enemies" : "selected enemies"}${a.hasInput ? " (enter value)" : ` by ${a.defaultValue}`}.`;
    case "remove_enemy_buff": return `Remove "${a.buffName}" from ${a.allEnemies ? "all enemies" : "selected enemies"}.`;
    case "trigger_orb_passive": return "Trigger passive of selected orb slots.";
    case "discard_hand": return "Discard all hand cards.";
    case "reshuffle_discard": return "Shuffle discard into draw pile.";
    case "set_orb_slots": return `Set orb slot count to ${a.hasInput ? "N" : a.defaultValue ?? 3}.`;
    case "adjust_orb_slots": return `Adjust orb slots by ${a.hasInput ? "N" : a.defaultValue ?? 1}.`;
    case "exhaust_card": return "Exhaust selected card.";
    case "exhaust_hand": return "Exhaust all hand cards.";
    case "copy_card_to_hand": return "Add a copy of selected card to hand.";
    case "shuffle_hand_to_draw": return "Shuffle hand back into draw pile.";
    case "scry": return `Scry ${a.hasInput ? "N" : a.defaultValue ?? 1} (log-only peek).`;
    case "apply_burn": return "Add a Burn card to discard pile.";
    case "trigger_enemy_intent": return "Trigger selected enemy's current intent.";
    case "set_enemy_intent": return "Change an enemy's intent (log only).";
    default: return "";
  }
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

export function OrbSvgIcon({ type }: { type: "lightning" | "dark" | "frost" | "plasma" }) {
  const colors: Record<string, string> = {
    lightning: "#fbbf24",
    dark: "#a855f7",
    frost: "#22d3ee",
    plasma: "#f43f5e",
  };
  const c = colors[type] ?? "#94a3b8";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.5" fill={c} fillOpacity="0.85" />
    </svg>
  );
}

function OrbEvokeSvgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3.5" fill="#fbbf24" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={8 + 4.5 * Math.cos(r)} y1={8 + 4.5 * Math.sin(r)}
            x2={8 + 7 * Math.cos(r)} y2={8 + 7 * Math.sin(r)}
            stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function OrbPassiveSvgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3.5" fill="#fbbf24" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="6.5" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.45" strokeDasharray="2 2" />
    </svg>
  );
}

export function StanceSvgIcon({ stance }: { stance: "neutral" | "wrath" | "calm" | "divinity" }) {
  if (stance === "wrath") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5Z" fill="#ef4444" fillOpacity="0.6" stroke="#ef4444" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  }
  if (stance === "calm") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 13C8 13 2 9.5 2 6C2 3.8 4 2.5 6 3.5C7 4 8 5 8 5C8 5 9 4 10 3.5C12 2.5 14 3.8 14 6C14 9.5 8 13 8 13Z" fill="#4ade80" fillOpacity="0.5" stroke="#4ade80" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  }
  if (stance === "divinity") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="3" fill="#fbbf24" fillOpacity="0.5" stroke="#fbbf24" strokeWidth="1.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return <circle key={deg} cx={8 + 5.5 * Math.cos(r)} cy={8 + 5.5 * Math.sin(r)} r="1" fill="#fbbf24" fillOpacity="0.7" />;
        })}
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 8C2 8 4.5 3.5 8 3.5C11.5 3.5 14 8 14 8C14 8 11.5 12.5 8 12.5C4.5 12.5 2 8 2 8Z" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
      <circle cx="8" cy="8" r="2" fill="#94a3b8" />
    </svg>
  );
}

// ─── Action icon + chip helpers ───────────────────────────────────────────────

export function qaActionIcon(a: QAMAction): React.ReactNode {
  switch (a.actionType) {
    case "give_buff": case "give_enemy_buff": return <Sparkles className="h-4 w-4" strokeWidth={2} />;
    case "give_debuff": case "give_enemy_debuff": return <Skull className="h-4 w-4" strokeWidth={2} />;
    case "remove_buff": case "remove_enemy_buff": return <CircleOff className="h-4 w-4" strokeWidth={2} />;
    case "modify_hp": return (a.defaultValue ?? 1) < 0 ? <HeartCrack className="h-4 w-4" strokeWidth={2} /> : <Heart className="h-4 w-4" strokeWidth={2} />;
    case "modify_block": case "modify_enemy_block": return <Shield className="h-4 w-4" strokeWidth={2} />;
    case "modify_energy": return <Zap className="h-4 w-4" strokeWidth={2} />;
    case "modify_enemy_hp": return <Swords className="h-4 w-4" strokeWidth={2} />;
    case "draw_cards": return <BookOpen className="h-4 w-4" strokeWidth={2} />;
    case "discard_hand": case "exhaust_hand": return <Trash2 className="h-4 w-4" strokeWidth={2} />;
    case "exhaust_card": return <Flame className="h-4 w-4" strokeWidth={2} />;
    case "reshuffle_discard": return <RefreshCw className="h-4 w-4" strokeWidth={2} />;
    case "shuffle_hand_to_draw": return <Shuffle className="h-4 w-4" strokeWidth={2} />;
    case "copy_card_to_hand": return <Copy className="h-4 w-4" strokeWidth={2} />;
    case "move_to_pile": return <ArrowRightLeft className="h-4 w-4" strokeWidth={2} />;
    case "add_card": return <PackagePlus className="h-4 w-4" strokeWidth={2} />;
    case "channel_orb": return <OrbSvgIcon type={a.orbType ?? "lightning"} />;
    case "evoke_orbs": return <OrbEvokeSvgIcon />;
    case "trigger_orb_passive": return <OrbPassiveSvgIcon />;
    case "set_orb_slots": case "adjust_orb_slots": return <LayoutGrid className="h-4 w-4" strokeWidth={2} />;
    case "set_stance": return <StanceSvgIcon stance={a.stance ?? "neutral"} />;
    case "scry": return <Eye className="h-4 w-4" strokeWidth={2} />;
    case "apply_burn": return <Flame className="h-4 w-4" strokeWidth={2} />;
    case "trigger_enemy_intent": return <Play className="h-4 w-4" strokeWidth={2} />;
    case "set_enemy_intent": return <ListOrdered className="h-4 w-4" strokeWidth={2} />;
    default: return <Wind className="h-4 w-4" strokeWidth={2} />;
  }
}

export function qaActionIconBg(a: QAMAction): string {
  if (ENEMY_ACTION_TYPES.has(a.actionType)) return "bg-rose-950/60 text-rose-300 border-rose-700/40";
  const orbTypes: QAMActionType[] = ["channel_orb", "evoke_orbs", "trigger_orb_passive", "set_orb_slots", "adjust_orb_slots"];
  if (orbTypes.includes(a.actionType)) return "bg-amber-950/60 text-amber-300 border-amber-700/40";
  if (a.actionType === "set_stance") return "bg-purple-950/60 text-purple-300 border-purple-700/40";
  const utilTypes: QAMActionType[] = ["discard_hand", "exhaust_hand", "exhaust_card", "reshuffle_discard", "copy_card_to_hand", "move_to_pile", "shuffle_hand_to_draw"];
  if (utilTypes.includes(a.actionType)) return "bg-slate-800/60 text-slate-300 border-slate-600/40";
  return "bg-sky-950/60 text-sky-300 border-sky-700/40";
}

// ─── QARow ─────────────────────────────────────────────────────────────────────

function QARow({ icon, iconBg, label, hint, badge, onPick }: {
  icon: React.ReactNode; iconBg: string; label: string; hint: string; badge?: string; onPick: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 transition hover:bg-slate-800/70">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconBg}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-200">{label}</span>
          {badge && <span className="rounded bg-black/30 px-1.5 py-px text-[9px] font-bold tabular-nums text-slate-400">{badge}</span>}
        </div>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{hint}</p>
      </div>
      <button
        type="button"
        onClick={onPick}
        className="shrink-0 rounded-lg border border-slate-600/50 bg-slate-700/60 px-2.5 py-1.5 text-[10px] font-bold text-slate-200 transition hover:border-slate-500/70 hover:bg-slate-600/70 active:scale-95"
      >
        Apply
      </button>
    </div>
  );
}

// ─── Enemy picker ─────────────────────────────────────────────────────────────

function EnemyPickerPopup({ title, enemies, multiSelect = true, onApply, onCancel }: {
  title: string;
  enemies: Array<{ name: string; hp: number; maxHp: number }>;
  multiSelect?: boolean;
  onApply: (result: { indices: number[] }) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [allSelected, setAllSelected] = useState(false);

  function toggleEnemy(i: number) {
    if (multiSelect) {
      setSelected((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
      setAllSelected(false);
    } else {
      setSelected(new Set([i]));
    }
  }

  const canApply = allSelected || selected.size > 0;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70" onClick={onCancel}>
      <div className="w-[380px] rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-700/60 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">{title}</p>
          <p className="text-[10px] text-slate-500">Select target enemies</p>
        </div>
        <div className="max-h-72 space-y-1.5 overflow-y-auto p-3">
          {multiSelect && (
            <button type="button" onClick={() => { setAllSelected(v => !v); setSelected(new Set()); }}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] transition ${allSelected ? "border-rose-500/60 bg-rose-950/40 text-rose-100" : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-slate-500/60"}`}
            >
              <span className={`h-3.5 w-3.5 shrink-0 rounded border-2 ${allSelected ? "border-rose-400 bg-rose-400" : "border-slate-500"}`} aria-hidden />
              <span className="font-semibold">All enemies</span>
            </button>
          )}
          {enemies.map((e, i) => {
            const isSel = selected.has(i) || allSelected;
            return (
              <button key={i} type="button" onClick={() => toggleEnemy(i)}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] transition ${isSel ? "border-rose-500/60 bg-rose-950/40 text-rose-100" : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-slate-500/60"}`}
              >
                <span className={`h-3.5 w-3.5 shrink-0 border-2 ${multiSelect ? "rounded" : "rounded-full"} ${isSel ? "border-rose-400 bg-rose-400" : "border-slate-500"}`} aria-hidden />
                <span className="flex-1 font-medium">{e.name || `Enemy ${i + 1}`}</span>
                <span className="tabular-nums text-slate-400"><span className="text-emerald-300">{e.hp}</span><span className="text-slate-600">/</span>{e.maxHp} HP</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-700/60 px-4 py-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700/60">Cancel</button>
          <button type="button" disabled={!canApply} onClick={() => onApply({ indices: allSelected ? enemies.map((_, i) => i) : Array.from(selected) })}
            className="rounded-lg border border-rose-500/50 bg-rose-950/50 px-3 py-1.5 text-[11px] font-bold text-rose-100 hover:bg-rose-900/60 disabled:cursor-not-allowed disabled:opacity-40"
          >Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Orb slot picker ──────────────────────────────────────────────────────────

function OrbSlotPickerPopup({ orbs, channelSize, onApply, onCancel }: {
  orbs: Array<"lightning" | "dark" | "frost" | "plasma">;
  channelSize: number;
  onApply: (slotIndices: number[]) => void;
  onCancel: () => void;
}) {
  const slots = Array.from({ length: Math.max(channelSize, orbs.length) }, (_, i) => ({
    index: i,
    orb: (orbs[i] ?? null) as "lightning" | "dark" | "frost" | "plasma" | null,
  }));
  const filledIndices = slots.filter((s) => s.orb !== null).map((s) => s.index);
  const [selected, setSelected] = useState<Set<number>>(new Set(filledIndices));
  const allSelected = filledIndices.length > 0 && filledIndices.every((i) => selected.has(i));

  const orbColors: Record<string, { bg: string; border: string; text: string }> = {
    lightning: { bg: "bg-amber-950/50", border: "border-amber-500/50", text: "text-amber-200" },
    dark: { bg: "bg-purple-950/50", border: "border-purple-500/50", text: "text-purple-200" },
    frost: { bg: "bg-cyan-950/50", border: "border-cyan-500/50", text: "text-cyan-200" },
    plasma: { bg: "bg-rose-950/50", border: "border-rose-500/50", text: "text-rose-200" },
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70" onClick={onCancel}>
      <div className="w-[380px] rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-700/60 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Trigger Orb Passives</p>
          <p className="text-[10px] text-slate-500">Select which orb slots trigger their passive</p>
        </div>
        <div className="p-3">
          {filledIndices.length === 0 ? (
            <p className="py-4 text-center text-[11px] text-slate-500">No orbs channeled.</p>
          ) : (
            <>
              <button type="button" onClick={() => allSelected ? setSelected(new Set()) : setSelected(new Set(filledIndices))}
                className={`mb-2 flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] transition ${allSelected ? "border-amber-500/50 bg-amber-950/30 text-amber-200" : "border-slate-600/50 bg-slate-800/60 text-slate-400 hover:border-slate-500/60"}`}
              >
                <span className={`h-3 w-3 rounded border-2 ${allSelected ? "border-amber-400 bg-amber-400" : "border-slate-500"}`} aria-hidden />
                All filled slots
              </button>
              <div className="grid grid-cols-3 gap-1.5">
                {slots.map(({ index, orb }) => {
                  if (!orb) return (
                    <div key={index} className="flex flex-col items-center gap-1 rounded-lg border border-slate-700/40 bg-slate-800/30 px-2 py-2 opacity-30">
                      <span className="h-4 w-4 rounded-full border border-slate-600" aria-hidden />
                      <span className="text-[9px] text-slate-500">Slot {index + 1}</span>
                      <span className="text-[8px] text-slate-600">Empty</span>
                    </div>
                  );
                  const c = orbColors[orb];
                  const isSel = selected.has(index);
                  return (
                    <button key={index} type="button"
                      onClick={() => setSelected((prev) => { const n = new Set(prev); n.has(index) ? n.delete(index) : n.add(index); return n; })}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 transition ${isSel ? `${c.bg} ${c.border} ${c.text}` : "border-slate-600/50 bg-slate-800/50 text-slate-400"}`}
                    >
                      <OrbSvgIcon type={orb} />
                      <span className="text-[9px] font-semibold capitalize">{orb}</span>
                      <span className="text-[8px] opacity-60">Slot {index + 1}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-700/60 px-4 py-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700/60">Cancel</button>
          <button type="button" disabled={selected.size === 0} onClick={() => onApply(Array.from(selected))}
            className="rounded-lg border border-amber-500/50 bg-amber-950/50 px-3 py-1.5 text-[11px] font-bold text-amber-100 hover:bg-amber-900/60 disabled:cursor-not-allowed disabled:opacity-40"
          >Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuickActionsModal({
  cardId,
  actions,
  triggerLabel = "Quick Actions",
}: {
  cardId: string;
  actions: QAMAction[];
  triggerLabel?: string;
}) {
  const {
    gameState,
    moveSelectedCards,
    modifyPlayerBlock,
    modifyPlayerHp,
    modifyPlayerEnergy,
    drawCards,
    addBuffDebuff,
    removeBuffDebuff,
    addCardFromDB,
    channelOrb,
    evokeOrb,
    setStance,
    modifyEnemyHp,
    modifyEnemyBlock,
    triggerSingleOrbPassive,
    discardWholeHand,
    shuffleDiscardIntoDraw,
    setOrbChannelSize,
  } = useGameManager();

  const [modalOpen, setModalOpen] = useState(false);
  const [popup, setPopup] = useState<PopupState>(null);
  const [enemyPickerPending, setEnemyPickerPending] = useState<EnemyPickerState>(null);
  const [orbPickerPending, setOrbPickerPending] = useState(false);

  if (actions.length === 0) return null;

  const sourceCard = { name: cardId };
  const enemies = (gameState?.enemies ?? []) as Array<{ name: string; hp: number; maxHp: number }>;
  const orbs = (gameState?.orbs ?? []) as Array<"lightning" | "dark" | "frost" | "plasma">;
  const channelSize = gameState?.orbChannelSize ?? orbs.length;

  function fireAction(a: QAMAction, value?: number, targetIndices?: number[]) {
    const v = value ?? a.defaultValue ?? 0;
    const enemyLoop = (fn: (i: number) => void) => {
      if (targetIndices !== undefined) { targetIndices.forEach(fn); return; }
      if (a.allEnemies) { (gameState?.enemies ?? []).forEach((_, i) => fn(i)); return; }
      fn(a.enemyIndex ?? 0);
    };

    switch (a.actionType) {
      case "give_buff": addBuffDebuff("player", -1, a.buffName ?? "", "buff", v, undefined, sourceCard); break;
      case "give_debuff": addBuffDebuff("player", -1, a.buffName ?? "", "debuff", v, undefined, sourceCard); break;
      case "remove_buff": removeBuffDebuff("player", -1, a.buffName ?? ""); break;
      case "modify_hp": modifyPlayerHp(v, sourceCard); break;
      case "modify_block": modifyPlayerBlock(v, sourceCard); break;
      case "modify_energy": modifyPlayerEnergy(v, sourceCard); break;
      case "draw_cards": drawCards(Math.round(v), sourceCard); break;
      case "move_to_pile": moveSelectedCards(a.pile ?? "hand"); break;
      case "add_card": {
        const names = a.cardNames ?? (a.cardName ? [a.cardName] : []);
        if (names.length > 0) addCardFromDB(names.flatMap((id) => Array(Math.max(1, a.cardCount ?? 1)).fill(id)), a.pile ?? "hand", false);
        break;
      }
      case "channel_orb": for (let i = 0; i < (a.orbCount ?? 1); i++) channelOrb(a.orbType ?? "lightning"); break;
      case "evoke_orbs": evokeOrb(Math.max(1, Math.round(v))); break;
      case "set_stance": setStance(a.stance ?? "neutral"); break;
      case "give_enemy_buff": enemyLoop((i) => addBuffDebuff("enemy", i, a.buffName ?? "", "buff", v, undefined, sourceCard)); break;
      case "give_enemy_debuff": enemyLoop((i) => addBuffDebuff("enemy", i, a.buffName ?? "", "debuff", v, undefined, sourceCard)); break;
      case "modify_enemy_hp": enemyLoop((i) => modifyEnemyHp(i, v)); break;
      case "modify_enemy_block": enemyLoop((i) => modifyEnemyBlock(i, v)); break;
      case "remove_enemy_buff": enemyLoop((i) => removeBuffDebuff("enemy", i, a.buffName ?? "")); break;
      case "discard_hand": discardWholeHand(); break;
      case "reshuffle_discard": shuffleDiscardIntoDraw(gameState?.discard ?? []); break;
      case "set_orb_slots": setOrbChannelSize(Math.max(1, Math.min(10, Math.round(v)))); break;
      case "adjust_orb_slots": setOrbChannelSize(Math.max(1, Math.min(10, (gameState?.orbSlots?.length ?? 3) + Math.round(v)))); break;
      case "exhaust_card": case "exhaust_hand": moveSelectedCards("exhaust"); break;
      case "copy_card_to_hand": addCardFromDB(cardId, "hand", false); break;
    }
  }

  function handlePick(a: QAMAction) {
    setModalOpen(false);

    if (a.actionType === "trigger_orb_passive") {
      setOrbPickerPending(true);
      return;
    }

    if (ENEMY_ACTION_TYPES.has(a.actionType)) {
      if (enemies.length === 0) { fireAction(a, undefined, []); return; }
      if (a.hasInput) {
        setPopup({ title: a.label, defaultValue: a.defaultValue ?? 1, onApply: (v) => { setEnemyPickerPending({ action: a, preValue: v }); } });
      } else {
        setEnemyPickerPending({ action: a });
      }
      return;
    }

    if (NO_INPUT_TYPES.has(a.actionType)) { fireAction(a); return; }
    if (a.hasInput) { setPopup({ title: a.label, defaultValue: a.defaultValue ?? 1, onApply: (v) => fireAction(a, v) }); return; }
    fireAction(a);
  }

  const actionBadge = (a: QAMAction) =>
    a.actionType === "add_card"
      ? (a.cardCount ?? 1) > 1 ? `x${a.cardCount}` : undefined
      : a.hasInput && a.defaultValue !== undefined ? `${a.defaultValue}` : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-900/50"
      >
        <Zap className="h-3.5 w-3.5 text-amber-400" strokeWidth={2.5} />
        {triggerLabel}
        <span className="rounded bg-black/25 px-1 py-px text-[9px] font-bold tabular-nums text-amber-300/80">{actions.length}</span>
        <ChevronRight className="h-3 w-3 text-amber-400/60" strokeWidth={2} />
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70" onClick={() => setModalOpen(false)}>
          <div className="flex max-h-[82dvh] w-[520px] flex-col rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-700/60 px-4 py-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-500/50 bg-amber-950/60 text-amber-300">
                <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">Quick Actions</span>
              <span className="max-w-[140px] truncate rounded-md bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">{cardId}</span>
              <button type="button" onClick={() => setModalOpen(false)}
                className="ml-auto rounded-lg border border-slate-600/50 bg-slate-800/60 p-1 text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
              {actions.map((a, i) => (
                <QARow
                  key={`${a.label}-${i}`}
                  icon={qaActionIcon(a)}
                  iconBg={qaActionIconBg(a)}
                  label={a.label}
                  hint={qaTooltip(a)}
                  badge={actionBadge(a)}
                  onPick={() => handlePick(a)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enemy picker */}
      {enemyPickerPending && (
        <EnemyPickerPopup
          title={enemyPickerPending.action.label}
          enemies={enemies}
          multiSelect
          onApply={({ indices }) => { fireAction(enemyPickerPending.action, enemyPickerPending.preValue, indices); setEnemyPickerPending(null); }}
          onCancel={() => setEnemyPickerPending(null)}
        />
      )}

      {/* Orb slot picker */}
      {orbPickerPending && (
        <OrbSlotPickerPopup
          orbs={orbs}
          channelSize={channelSize}
          onApply={(slotIndices) => { slotIndices.forEach((i) => triggerSingleOrbPassive(i)); setOrbPickerPending(false); }}
          onCancel={() => setOrbPickerPending(false)}
        />
      )}

      {/* Numeric popup */}
      {popup && (
        <QuickActionInputPopup
          title={popup.title}
          defaultValue={popup.defaultValue}
          onApply={popup.onApply}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
}
