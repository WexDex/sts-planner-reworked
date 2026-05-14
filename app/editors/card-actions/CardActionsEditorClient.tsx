"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Download,
  Plus,
  ChevronDown,
  RotateCcw,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import CardPickerModal from "@/app/components/UI/CardPickerModal";
import stsBundle from "@/app/data/db/STS_CARDS_DB.json";
import baseActionsData from "@/app/data/custom_card_actions.json";
import backupActionsData from "@/app/data/custom_card_actions.backup.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActionType =
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
  | "adjust_orb_slots";

type CustomAction = {
  label: string;
  actionType: ActionType;
  buffName?: string;
  buffType?: "buff" | "debuff";
  hasInput?: boolean;
  defaultValue?: number;
  pile?: string;
  cardNames?: string[];
  cardCount?: number;
  orbType?: "lightning" | "dark" | "frost" | "plasma";
  orbCount?: number;
  stance?: "neutral" | "wrath" | "calm" | "divinity";
  enemyIndex?: number;
  allEnemies?: boolean;
};

type CustomActionsMap = Record<string, CustomAction[]>;

const ACTION_TYPES: { value: ActionType; label: string; description: string; color: string; activeClass: string; inactiveClass: string }[] = [
  {
    value: "give_buff", label: "Give Buff", description: "Apply a named buff",
    color: "emerald",
    activeClass: "border-emerald-500/70 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-500/30",
    inactiveClass: "border-emerald-500/40 bg-emerald-900/30 text-emerald-400/80 ring-1 ring-emerald-500/20",
  },
  {
    value: "give_debuff", label: "Give Debuff", description: "Apply a named debuff",
    color: "orange",
    activeClass: "border-orange-500/70 bg-orange-950/60 text-orange-200 ring-1 ring-orange-500/30",
    inactiveClass: "border-orange-500/40 bg-orange-900/30 text-orange-400/80 ring-1 ring-orange-500/20",
  },
  {
    value: "remove_buff", label: "Remove Buff", description: "Remove buff/debuff",
    color: "rose",
    activeClass: "border-rose-500/70 bg-rose-950/60 text-rose-200 ring-1 ring-rose-500/30",
    inactiveClass: "border-rose-500/40 bg-rose-900/30 text-rose-400/80 ring-1 ring-rose-500/20",
  },
  {
    value: "modify_hp", label: "Modify HP", description: "Change player HP",
    color: "red",
    activeClass: "border-red-500/70 bg-red-950/60 text-red-200 ring-1 ring-red-500/30",
    inactiveClass: "border-red-500/40 bg-red-900/30 text-red-400/80 ring-1 ring-red-500/20",
  },
  {
    value: "modify_block", label: "Modify Block", description: "Add/remove block",
    color: "sky",
    activeClass: "border-sky-500/70 bg-sky-950/60 text-sky-200 ring-1 ring-sky-500/30",
    inactiveClass: "border-sky-500/40 bg-sky-900/30 text-sky-400/80 ring-1 ring-sky-500/20",
  },
  {
    value: "modify_energy", label: "Modify Energy", description: "Add/remove energy",
    color: "amber",
    activeClass: "border-amber-500/70 bg-amber-950/60 text-amber-200 ring-1 ring-amber-500/30",
    inactiveClass: "border-amber-500/40 bg-amber-900/30 text-amber-400/80 ring-1 ring-amber-500/20",
  },
  {
    value: "draw_cards", label: "Draw Cards", description: "Draw N cards",
    color: "violet",
    activeClass: "border-violet-500/70 bg-violet-950/60 text-violet-200 ring-1 ring-violet-500/30",
    inactiveClass: "border-violet-500/40 bg-violet-900/30 text-violet-400/80 ring-1 ring-violet-500/20",
  },
  {
    value: "move_to_pile", label: "Move to Pile", description: "Move card to a pile",
    color: "slate",
    activeClass: "border-slate-400/60 bg-slate-700/60 text-slate-200 ring-1 ring-slate-400/25",
    inactiveClass: "border-slate-400/40 bg-slate-900/30 text-slate-400/80 ring-1 ring-slate-400/20",
  },
  {
    value: "add_card", label: "Add Card", description: "Add a DB card to a pile",
    color: "fuchsia",
    activeClass: "border-fuchsia-500/70 bg-fuchsia-950/60 text-fuchsia-200 ring-1 ring-fuchsia-500/30",
    inactiveClass: "border-fuchsia-500/40 bg-fuchsia-900/30 text-fuchsia-400/80 ring-1 ring-fuchsia-500/20",
  },
  {
    value: "channel_orb", label: "Channel Orb", description: "Channel orb type N times",
    color: "blue",
    activeClass: "border-blue-500/70 bg-blue-950/60 text-blue-200 ring-1 ring-blue-500/30",
    inactiveClass: "border-blue-500/40 bg-blue-900/30 text-blue-400/80 ring-1 ring-blue-500/20",
  },
  {
    value: "evoke_orbs", label: "Evoke Orbs", description: "Evoke N orbs",
    color: "cyan",
    activeClass: "border-cyan-500/70 bg-cyan-950/60 text-cyan-200 ring-1 ring-cyan-500/30",
    inactiveClass: "border-cyan-500/40 bg-cyan-900/30 text-cyan-400/80 ring-1 ring-cyan-500/20",
  },
  {
    value: "set_stance", label: "Set Stance", description: "Change Watcher stance",
    color: "purple",
    activeClass: "border-purple-500/70 bg-purple-950/60 text-purple-200 ring-1 ring-purple-500/30",
    inactiveClass: "border-purple-500/40 bg-purple-900/30 text-purple-400/80 ring-1 ring-purple-500/20",
  },
  {
    value: "give_enemy_buff", label: "Enemy Buff", description: "Give buff to enemy",
    color: "teal",
    activeClass: "border-teal-500/70 bg-teal-950/60 text-teal-200 ring-1 ring-teal-500/30",
    inactiveClass: "border-teal-500/40 bg-teal-900/30 text-teal-400/80 ring-1 ring-teal-500/20",
  },
  {
    value: "give_enemy_debuff", label: "Enemy Debuff", description: "Debuff an enemy",
    color: "yellow",
    activeClass: "border-yellow-500/70 bg-yellow-950/60 text-yellow-200 ring-1 ring-yellow-500/30",
    inactiveClass: "border-yellow-500/40 bg-yellow-900/30 text-yellow-400/80 ring-1 ring-yellow-500/20",
  },
  {
    value: "modify_enemy_hp", label: "Enemy HP", description: "Damage or heal enemy",
    color: "pink",
    activeClass: "border-pink-500/70 bg-pink-950/60 text-pink-200 ring-1 ring-pink-500/30",
    inactiveClass: "border-pink-500/40 bg-pink-900/30 text-pink-400/80 ring-1 ring-pink-500/20",
  },
  {
    value: "modify_enemy_block", label: "Enemy Block", description: "Add/remove enemy block",
    color: "indigo",
    activeClass: "border-indigo-500/70 bg-indigo-950/60 text-indigo-200 ring-1 ring-indigo-500/30",
    inactiveClass: "border-indigo-500/40 bg-indigo-900/30 text-indigo-400/80 ring-1 ring-indigo-500/20",
  },
  {
    value: "remove_enemy_buff", label: "Remove Enemy Buff", description: "Remove enemy buff/debuff",
    color: "lime",
    activeClass: "border-lime-500/70 bg-lime-950/60 text-lime-200 ring-1 ring-lime-500/30",
    inactiveClass: "border-lime-500/40 bg-lime-900/30 text-lime-400/80 ring-1 ring-lime-500/20",
  },
  {
    value: "trigger_orb_passive", label: "Orb Passive", description: "Trigger all orb passives",
    color: "sky",
    activeClass: "border-sky-400/70 bg-sky-950/60 text-sky-200 ring-1 ring-sky-400/30",
    inactiveClass: "border-sky-400/40 bg-sky-900/30 text-sky-400/80 ring-1 ring-sky-400/20",
  },
  {
    value: "discard_hand", label: "Discard Hand", description: "Discard all cards in hand",
    color: "orange",
    activeClass: "border-orange-400/70 bg-orange-950/60 text-orange-200 ring-1 ring-orange-400/30",
    inactiveClass: "border-orange-400/40 bg-orange-900/30 text-orange-400/80 ring-1 ring-orange-400/20",
  },
  {
    value: "reshuffle_discard", label: "Reshuffle Discard", description: "Shuffle discard into draw",
    color: "slate",
    activeClass: "border-slate-300/70 bg-slate-700/60 text-slate-100 ring-1 ring-slate-300/30",
    inactiveClass: "border-slate-300/40 bg-slate-900/30 text-slate-400/80 ring-1 ring-slate-300/20",
  },
  {
    value: "set_orb_slots", label: "Set Orb Slots", description: "Set orb slot count exactly",
    color: "violet",
    activeClass: "border-violet-400/70 bg-violet-950/60 text-violet-200 ring-1 ring-violet-400/30",
    inactiveClass: "border-violet-400/40 bg-violet-900/30 text-violet-400/80 ring-1 ring-violet-400/20",
  },
  {
    value: "adjust_orb_slots", label: "Adjust Orb Slots", description: "+/− orb slot count",
    color: "violet",
    activeClass: "border-violet-300/60 bg-violet-900/40 text-violet-300 ring-1 ring-violet-300/25",
    inactiveClass: "border-violet-300/40 bg-violet-900/30 text-violet-400/80 ring-1 ring-violet-300/20",
  },
];

const PILE_OPTIONS: { value: string; label: string; activeClass: string }[] = [
  { value: "hand",    label: "Hand",    activeClass: "border-emerald-500/70 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-500/30" },
  { value: "draw",    label: "Draw",    activeClass: "border-sky-500/70 bg-sky-950/60 text-sky-200 ring-1 ring-sky-500/30" },
  { value: "discard", label: "Discard", activeClass: "border-rose-500/70 bg-rose-950/60 text-rose-200 ring-1 ring-rose-500/30" },
  { value: "exhaust", label: "Exhaust", activeClass: "border-amber-500/70 bg-amber-950/60 text-amber-200 ring-1 ring-amber-500/30" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type CardData = {
  type?: string;
  rarity?: string;
  characters?: string;
  description?: string;
  [key: string]: any;
};

const allCards: { id: string; data: CardData }[] = Object.entries(
  (stsBundle as any).cards ?? {} as Record<string, CardData>,
)
  .map(([id, data]) => ({ id, data: data as CardData }))
  .sort((a, b) => a.id.localeCompare(b.id));

type CharFilter = "all" | "ironclad" | "silent" | "defect" | "watcher" | "colorless" | "status" | "curse";

const CHAR_FILTERS: { value: CharFilter; label: string; pill: string; activePill: string; rowBg: string; selectedRowBg: string; charChip: string }[] = [
  { value: "all",       label: "All",       pill: "border-slate-600/60 text-slate-400 hover:bg-slate-800/50",                       activePill: "border-slate-400/70 bg-slate-700/70 text-slate-100",              rowBg: "",                        selectedRowBg: "bg-slate-800/90 ring-inset ring-1 ring-cyan-500/40",      charChip: "border-slate-700/50 bg-slate-800/50 text-slate-400" },
  { value: "ironclad",  label: "Ironclad",  pill: "border-rose-900/50 text-rose-400/80 hover:bg-rose-950/30",                       activePill: "border-rose-500/65 bg-rose-950/60 text-rose-200",                 rowBg: "bg-rose-950/10",          selectedRowBg: "bg-rose-950/45 ring-inset ring-1 ring-rose-500/50",       charChip: "border-rose-700/50 bg-rose-950/50 text-rose-300" },
  { value: "silent",    label: "Silent",    pill: "border-teal-900/50 text-teal-400/80 hover:bg-teal-950/30",                       activePill: "border-teal-500/65 bg-teal-950/60 text-teal-200",                 rowBg: "bg-teal-950/10",          selectedRowBg: "bg-teal-950/45 ring-inset ring-1 ring-teal-500/50",       charChip: "border-teal-700/50 bg-teal-950/50 text-teal-300" },
  { value: "defect",    label: "Defect",    pill: "border-blue-900/50 text-blue-400/80 hover:bg-blue-950/30",                       activePill: "border-blue-500/65 bg-blue-950/60 text-blue-200",                 rowBg: "bg-blue-950/10",          selectedRowBg: "bg-blue-950/45 ring-inset ring-1 ring-blue-500/50",       charChip: "border-blue-700/50 bg-blue-950/50 text-blue-300" },
  { value: "watcher",   label: "Watcher",   pill: "border-purple-900/50 text-purple-400/80 hover:bg-purple-950/30",                 activePill: "border-purple-500/65 bg-purple-950/60 text-purple-200",           rowBg: "bg-purple-950/10",        selectedRowBg: "bg-purple-950/45 ring-inset ring-1 ring-purple-500/50",   charChip: "border-purple-700/50 bg-purple-950/50 text-purple-300" },
  { value: "colorless", label: "Colorless", pill: "border-slate-700/50 text-slate-400/80 hover:bg-slate-800/30",                    activePill: "border-slate-400/65 bg-slate-700/60 text-slate-200",              rowBg: "bg-slate-800/15",         selectedRowBg: "bg-slate-700/60 ring-inset ring-1 ring-slate-400/50",     charChip: "border-slate-600/50 bg-slate-700/50 text-slate-300" },
  { value: "status",    label: "Status",    pill: "border-amber-900/50 text-amber-400/80 hover:bg-amber-950/30",                    activePill: "border-amber-500/65 bg-amber-950/60 text-amber-200",              rowBg: "bg-amber-950/10",         selectedRowBg: "bg-amber-950/45 ring-inset ring-1 ring-amber-500/50",     charChip: "border-amber-700/50 bg-amber-950/50 text-amber-300" },
  { value: "curse",     label: "Curses",    pill: "border-indigo-900/50 text-indigo-400/80 hover:bg-indigo-950/30",                 activePill: "border-indigo-500/65 bg-indigo-950/60 text-indigo-200",           rowBg: "bg-indigo-950/10",        selectedRowBg: "bg-indigo-950/45 ring-inset ring-1 ring-indigo-500/50",   charChip: "border-indigo-700/50 bg-indigo-950/50 text-indigo-300" },
];

function getCharStyle(characters?: string) {
  return CHAR_FILTERS.find((f) => f.value === characters?.toLowerCase()) ?? CHAR_FILTERS[0];
}

const ACTION_TYPE_ROW: Record<ActionType, { border: string; bg: string; header: string }> = {
  give_buff:          { border: "border-emerald-600/65", bg: "bg-emerald-950/45", header: "text-emerald-400" },
  give_debuff:        { border: "border-orange-600/65",  bg: "bg-orange-950/45",  header: "text-orange-400" },
  remove_buff:        { border: "border-rose-600/65",    bg: "bg-rose-950/45",    header: "text-rose-400" },
  modify_hp:          { border: "border-red-600/65",     bg: "bg-red-950/45",     header: "text-red-400" },
  modify_block:       { border: "border-sky-600/65",     bg: "bg-sky-950/45",     header: "text-sky-400" },
  modify_energy:      { border: "border-amber-600/65",   bg: "bg-amber-950/45",   header: "text-amber-400" },
  draw_cards:         { border: "border-violet-600/65",  bg: "bg-violet-950/45",  header: "text-violet-400" },
  move_to_pile:       { border: "border-slate-500/65",   bg: "bg-slate-800/55",   header: "text-slate-300" },
  add_card:           { border: "border-fuchsia-600/65", bg: "bg-fuchsia-950/45", header: "text-fuchsia-400" },
  channel_orb:        { border: "border-blue-600/65",    bg: "bg-blue-950/45",    header: "text-blue-400" },
  evoke_orbs:         { border: "border-cyan-600/65",    bg: "bg-cyan-950/45",    header: "text-cyan-400" },
  set_stance:         { border: "border-purple-600/65",  bg: "bg-purple-950/45",  header: "text-purple-400" },
  give_enemy_buff:    { border: "border-teal-600/65",    bg: "bg-teal-950/45",    header: "text-teal-400" },
  give_enemy_debuff:  { border: "border-yellow-600/65",  bg: "bg-yellow-950/45",  header: "text-yellow-400" },
  modify_enemy_hp:    { border: "border-pink-600/65",    bg: "bg-pink-950/45",    header: "text-pink-400" },
  modify_enemy_block: { border: "border-indigo-600/65",  bg: "bg-indigo-950/45",  header: "text-indigo-400" },
  remove_enemy_buff:  { border: "border-lime-600/65",    bg: "bg-lime-950/45",    header: "text-lime-400" },
  trigger_orb_passive:{ border: "border-sky-500/55",     bg: "bg-sky-950/30",     header: "text-sky-300" },
  discard_hand:       { border: "border-orange-500/55",  bg: "bg-orange-950/30",  header: "text-orange-300" },
  reshuffle_discard:  { border: "border-slate-400/55",   bg: "bg-slate-800/40",   header: "text-slate-200" },
  set_orb_slots:      { border: "border-violet-500/55",  bg: "bg-violet-950/30",  header: "text-violet-300" },
  adjust_orb_slots:   { border: "border-violet-400/45",  bg: "bg-violet-900/25",  header: "text-violet-300" },
};

function typeChipCls(type?: string): string {
  switch (type?.toLowerCase()) {
    case "attack": return "border-rose-500/50 bg-rose-950/50 text-rose-300";
    case "skill": return "border-teal-500/50 bg-teal-950/50 text-teal-300";
    case "power": return "border-violet-500/50 bg-violet-950/50 text-violet-300";
    default: return "border-slate-600/50 bg-slate-800/50 text-slate-400";
  }
}

function rarityChipCls(rarity?: string): string {
  switch (rarity?.toLowerCase()) {
    case "rare": return "border-amber-500/45 bg-amber-950/40 text-amber-300";
    case "uncommon": return "border-blue-500/45 bg-blue-950/40 text-blue-300";
    case "common": return "border-slate-600/45 bg-slate-800/40 text-slate-400";
    default: return "border-slate-700/40 bg-slate-900/40 text-slate-500";
  }
}

function blankAction(): CustomAction {
  return { label: "", actionType: "give_buff", buffName: "", buffType: "buff", hasInput: true, defaultValue: 1 };
}

function actionSummary(a: CustomAction): string {
  switch (a.actionType) {
    case "give_buff":         return `Give buff: ${a.buffName || "?"} ×${a.defaultValue ?? 1}`;
    case "give_debuff":       return `Give debuff: ${a.buffName || "?"} ×${a.defaultValue ?? 1}`;
    case "remove_buff":       return `Remove buff: ${a.buffName || "?"}`;
    case "modify_hp":         return `Modify HP (${a.defaultValue ?? 0})`;
    case "modify_block":      return `Modify Block (${a.defaultValue ?? 0})`;
    case "modify_energy":     return `Modify Energy (${a.defaultValue ?? 0})`;
    case "draw_cards":        return `Draw ${a.defaultValue ?? 1} cards`;
    case "move_to_pile":      return `Move → ${a.pile ?? "hand"}`;
    case "add_card":          return `Add card → ${a.pile ?? "hand"}`;
    case "channel_orb":       return `Channel ${a.orbCount ?? 1}× ${a.orbType ?? "lightning"}`;
    case "evoke_orbs":        return `Evoke ${a.defaultValue ?? 1} orb(s)`;
    case "set_stance":        return `Set stance: ${a.stance ?? "neutral"}`;
    case "give_enemy_buff":   return `Enemy buff: ${a.buffName || "?"} (${a.allEnemies ? "all" : `#${a.enemyIndex ?? 0}`})`;
    case "give_enemy_debuff": return `Enemy debuff: ${a.buffName || "?"} (${a.allEnemies ? "all" : `#${a.enemyIndex ?? 0}`})`;
    case "modify_enemy_hp":   return `Enemy HP (${a.allEnemies ? "all" : `#${a.enemyIndex ?? 0}`})`;
    case "modify_enemy_block":return `Enemy Block (${a.allEnemies ? "all" : `#${a.enemyIndex ?? 0}`})`;
    case "remove_enemy_buff": return `Remove enemy buff: ${a.buffName || "?"} (${a.allEnemies ? "all" : `#${a.enemyIndex ?? 0}`})`;
    case "trigger_orb_passive":return "Trigger orb passives";
    case "discard_hand":      return "Discard hand";
    case "reshuffle_discard": return "Reshuffle discard";
    case "set_orb_slots":     return `Set orb slots: ${a.defaultValue ?? 3}`;
    case "adjust_orb_slots":  return `Adjust orb slots: ${(a.defaultValue ?? 1) >= 0 ? `+${a.defaultValue ?? 1}` : a.defaultValue}`;
  }
}

const PILE_ADD_OPTIONS: { value: string; label: string; activeClass: string }[] = [
  { value: "hand",    label: "Hand",    activeClass: "border-emerald-500/70 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-500/30" },
  { value: "draw",    label: "Draw",    activeClass: "border-sky-500/70 bg-sky-950/60 text-sky-200 ring-1 ring-sky-500/30" },
  { value: "discard", label: "Discard", activeClass: "border-rose-500/70 bg-rose-950/60 text-rose-200 ring-1 ring-rose-500/30" },
  { value: "exhaust", label: "Exhaust", activeClass: "border-amber-500/70 bg-amber-950/60 text-amber-200 ring-1 ring-amber-500/30" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ActionRow({
  action,
  index,
  onChange,
  onDelete,
}: {
  action: CustomAction;
  index: number;
  onChange: (idx: number, updated: CustomAction) => void;
  onDelete: (idx: number) => void;
}) {
  const set = (patch: Partial<CustomAction>) => onChange(index, { ...action, ...patch });
  const rowTheme = ACTION_TYPE_ROW[action.actionType];
  const [showPicker, setShowPicker] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`rounded-xl border ${rowTheme.border} ${rowTheme.bg}`}>
      {/* Row header — always visible, click to toggle */}
      <div
        className="flex cursor-pointer items-center gap-2 px-3 py-2.5 select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${rowTheme.header} ${collapsed ? "-rotate-90" : ""}`}
          strokeWidth={2.5}
        />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${rowTheme.header}`}>
          #{index + 1}
        </span>
        {collapsed ? (
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-300">
            {action.label ? (
              <>{action.label} <span className="text-slate-500">— {actionSummary(action)}</span></>
            ) : (
              <span className="text-slate-500 italic">{actionSummary(action)}</span>
            )}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(index); }}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-rose-700/50 bg-rose-950/50 text-rose-400 transition hover:bg-rose-900/60 hover:text-rose-200"
          title="Remove action"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Collapsible body */}
      {!collapsed && <div className="space-y-2.5 border-t border-white/5 px-3 pb-3 pt-2.5">

      {/* Label */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Button label
        </label>
        <input
          type="text"
          value={action.label}
          placeholder="e.g. Give Accuracy"
          onChange={(e) => set({ label: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
        />
      </div>

      {/* Action type */}
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Action type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {ACTION_TYPES.map((at) => {
            const active = action.actionType === at.value;
            return (
              <button
                key={at.value}
                type="button"
                onClick={() => {
                  const t = at.value;
                  const patch: Partial<CustomAction> = { actionType: t };
                  if (t === "move_to_pile") patch.pile = action.pile ?? "hand";
                  if (t === "give_buff" || t === "give_debuff" || t === "remove_buff") {
                    patch.buffName = action.buffName ?? "";
                    patch.buffType = t === "give_debuff" ? "debuff" : "buff";
                  }
                  if (t === "channel_orb") { patch.orbType = action.orbType ?? "lightning"; patch.orbCount = action.orbCount ?? 1; }
                  if (t === "set_stance") patch.stance = action.stance ?? "neutral";
                  if (t === "evoke_orbs" || t === "set_orb_slots" || t === "adjust_orb_slots") {
                    patch.hasInput = action.hasInput ?? true;
                    patch.defaultValue = action.defaultValue ?? (t === "set_orb_slots" ? 3 : 1);
                  }
                  if (t === "give_enemy_buff" || t === "give_enemy_debuff") {
                    patch.buffName = action.buffName ?? ""; patch.allEnemies = action.allEnemies ?? false;
                    patch.enemyIndex = action.enemyIndex ?? 0; patch.hasInput = action.hasInput ?? true; patch.defaultValue = action.defaultValue ?? 1;
                  }
                  if (t === "modify_enemy_hp" || t === "modify_enemy_block") {
                    patch.allEnemies = action.allEnemies ?? false; patch.enemyIndex = action.enemyIndex ?? 0;
                    patch.hasInput = action.hasInput ?? true; patch.defaultValue = action.defaultValue ?? 5;
                  }
                  if (t === "remove_enemy_buff") {
                    patch.buffName = action.buffName ?? ""; patch.allEnemies = action.allEnemies ?? false; patch.enemyIndex = action.enemyIndex ?? 0;
                  }
                  set(patch);
                }}
                className={`flex flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left transition ${
                  active
                    ? at.activeClass + "border-4 ring-4"
                    : at.inactiveClass
                }`}
              >
                <span className="text-[11px] font-semibold leading-none">{at.label}</span>
                <span className="text-[9px] leading-snug opacity-70">{at.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Buff/debuff name */}
      {(action.actionType === "give_buff" || action.actionType === "give_debuff" || action.actionType === "remove_buff") && (
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Buff / debuff name
          </label>
          <input
            type="text"
            value={action.buffName ?? ""}
            placeholder="e.g. Accuracy"
            onChange={(e) => set({ buffName: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
      )}

      {/* Pile selector */}
      {action.actionType === "move_to_pile" && (
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Destination pile
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PILE_OPTIONS.map((p) => {
              const active = (action.pile ?? "hand") === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set({ pile: p.value })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? p.activeClass
                      : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* add_card fields */}
      {action.actionType === "add_card" && (
        <div className="space-y-2.5">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Cards to add
              </label>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-fuchsia-700/50 bg-fuchsia-950/40 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-300 transition hover:bg-fuchsia-900/50"
              >
                <Search className="h-3 w-3" strokeWidth={2} />
                Browse &amp; add
              </button>
            </div>
            {(action.cardNames ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-700/60 py-3 text-center text-[10px] text-slate-600">
                No cards selected — click Browse to add
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(action.cardNames ?? []).map((name, ci) => (
                  <span
                    key={`${name}-${ci}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-fuchsia-700/40 bg-fuchsia-950/35 py-0.5 pl-2 pr-1 text-[11px] font-medium text-fuchsia-200"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => set({ cardNames: (action.cardNames ?? []).filter((_, i) => i !== ci) })}
                      className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-md text-fuchsia-400 hover:bg-fuchsia-800/50 hover:text-fuchsia-100"
                    >
                      <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {showPicker && (
            <CardPickerModal
              title="Pick cards to add"
              multiSelect
              initialSelected={action.cardNames ?? []}
              onSelect={(cardIds) => set({ cardNames: [...new Set([...(action.cardNames ?? []), ...cardIds])] })}
              onClose={() => setShowPicker(false)}
            />
          )}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Add to pile
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PILE_ADD_OPTIONS.map((p) => {
                const active = (action.pile ?? "hand") === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set({ pile: p.value })}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? p.activeClass
                        : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Count
            </label>
            <input
              type="number"
              min={1}
              value={action.cardCount ?? 1}
              onChange={(e) => set({ cardCount: Math.max(1, Number(e.target.value)) })}
              className="w-32 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm tabular-nums text-slate-100 outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/30"
            />
          </div>
          {/* Prompt on click toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Prompt on click
            </label>
            <button
              type="button"
              onClick={() => set({ hasInput: !action.hasInput })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
                action.hasInput
                  ? "border-fuchsia-500/60 bg-fuchsia-500/30"
                  : "border-slate-600 bg-slate-800"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 -translate-y-px rounded-full bg-white shadow transition-transform ${
                  action.hasInput ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-[10px] text-slate-600">
              {action.hasInput ? "Lets you edit card & count before adding" : "Uses preset values directly"}
            </span>
          </div>
        </div>
      )}

      {/* channel_orb: orb type pills + count */}
      {action.actionType === "channel_orb" && (
        <div className="space-y-2.5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Orb type</label>
            <div className="flex flex-wrap gap-1.5">
              {([ { value: "lightning", label: "⚡ Lightning" }, { value: "dark", label: "🌑 Dark" }, { value: "frost", label: "🔵 Frost" }, { value: "plasma", label: "⬜ Plasma" } ] as const).map((o) => (
                <button key={o.value} type="button" onClick={() => set({ orbType: o.value })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${action.orbType === o.value ? "border-blue-500/70 bg-blue-950/60 text-blue-200 ring-1 ring-blue-500/30" : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Times to channel</label>
            <input type="number" min={1} value={action.orbCount ?? 1}
              onChange={(e) => set({ orbCount: Math.max(1, Number(e.target.value) || 1) })}
              className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm tabular-nums text-slate-100 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30" />
          </div>
        </div>
      )}

      {/* set_stance: stance pills */}
      {action.actionType === "set_stance" && (
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Stance</label>
          <div className="flex flex-wrap gap-1.5">
            {([ { value: "neutral", label: "Neutral" }, { value: "wrath", label: "Wrath" }, { value: "calm", label: "Calm" }, { value: "divinity", label: "Divinity" } ] as const).map((s) => (
              <button key={s.value} type="button" onClick={() => set({ stance: s.value })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${action.stance === s.value ? "border-purple-500/70 bg-purple-950/60 text-purple-200 ring-1 ring-purple-500/30" : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enemy target selector (all-enemies toggle + index) */}
      {(action.actionType === "give_enemy_buff" || action.actionType === "give_enemy_debuff" || action.actionType === "modify_enemy_hp" || action.actionType === "modify_enemy_block" || action.actionType === "remove_enemy_buff") && (
        <div className="space-y-2.5">
          {/* Buff name for enemy buff/debuff/remove */}
          {(action.actionType === "give_enemy_buff" || action.actionType === "give_enemy_debuff" || action.actionType === "remove_enemy_buff") && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Buff / debuff name</label>
              <input type="text" value={action.buffName ?? ""} placeholder="e.g. Strength"
                onChange={(e) => set({ buffName: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30" />
            </div>
          )}
          {/* All-enemies toggle */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Target</label>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => set({ allEnemies: false })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${!action.allEnemies ? "border-slate-400/70 bg-slate-700/60 text-slate-100 ring-1 ring-slate-400/30" : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300"}`}>
                Single enemy
              </button>
              <button type="button" onClick={() => set({ allEnemies: true })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${action.allEnemies ? "border-slate-400/70 bg-slate-700/60 text-slate-100 ring-1 ring-slate-400/30" : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300"}`}>
                All enemies
              </button>
            </div>
          </div>
          {/* Enemy index (only when single) */}
          {!action.allEnemies && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Enemy # (0-indexed)</label>
              <input type="number" min={0} value={action.enemyIndex ?? 0}
                onChange={(e) => set({ enemyIndex: Math.max(0, Number(e.target.value) || 0) })}
                className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm tabular-nums text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30" />
            </div>
          )}
          {/* Stacks hasInput + defaultValue for enemy buff/debuff */}
          {(action.actionType === "give_enemy_buff" || action.actionType === "give_enemy_debuff" || action.actionType === "modify_enemy_hp" || action.actionType === "modify_enemy_block") && (
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Show input</label>
                <button type="button" onClick={() => set({ hasInput: !action.hasInput })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${action.hasInput ? "border-cyan-500/60 bg-cyan-500/30" : "border-slate-600 bg-slate-800"}`}>
                  <span className={`inline-block h-3.5 w-3.5 -translate-y-px rounded-full bg-white shadow transition-transform ${action.hasInput ? "translate-x-3.5" : "translate-x-0"}`} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Default value</label>
                <input type="number" value={action.defaultValue ?? 1} onChange={(e) => set({ defaultValue: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm tabular-nums text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* set_orb_slots / adjust_orb_slots / evoke_orbs: hasInput + defaultValue (handled by generic block below) */}

      {/* No-input types: info note */}
      {(action.actionType === "trigger_orb_passive" || action.actionType === "discard_hand" || action.actionType === "reshuffle_discard") && (
        <p className="rounded-lg border border-dashed border-slate-700/60 py-2.5 text-center text-[10px] text-slate-500">
          No inputs — fires immediately when clicked
        </p>
      )}

      {/* Has input + default value — only for simple numeric action types */}
      {(action.actionType === "give_buff" || action.actionType === "give_debuff" || action.actionType === "modify_hp" || action.actionType === "modify_block" || action.actionType === "modify_energy" || action.actionType === "draw_cards" || action.actionType === "evoke_orbs" || action.actionType === "set_orb_slots" || action.actionType === "adjust_orb_slots") && (
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Show input
            </label>
            <button
              type="button"
              onClick={() => set({ hasInput: !action.hasInput })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
                action.hasInput
                  ? "border-cyan-500/60 bg-cyan-500/30"
                  : "border-slate-600 bg-slate-800"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 -translate-y-px rounded-full bg-white shadow transition-transform ${
                  action.hasInput ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Default value
            </label>
            <input
              type="number"
              value={action.defaultValue ?? 1}
              onChange={(e) => set({ defaultValue: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm tabular-nums text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>
      )}
    </div>}
  </div>
  );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────

function ExportModal({
  data,
  initialSelected,
  onExport,
  onClose,
}: {
  data: CustomActionsMap;
  initialSelected: Set<string>;
  onExport: (ids: Set<string>) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const configuredCards = useMemo(
    () => Object.keys(data).filter((k) => k !== "__global__" && data[k].length > 0).sort(),
    [data],
  );

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? configuredCards.filter((id) => id.toLowerCase().includes(q)) : configuredCards;
  }, [configuredCards, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex h-[70vh] w-md max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-800 px-4 py-3">
          <p className="flex-1 text-sm font-bold text-slate-100">Export cards</p>
          {selected.size > 0 && (
            <span className="rounded-md border border-emerald-500/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              {selected.size} selected
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
        {/* Search */}
        <div className="shrink-0 border-b border-slate-800 p-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter configured cards…"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-slate-600">
              {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""} with custom actions
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(new Set(filteredCards))}
                className="text-[10px] font-semibold text-cyan-500 hover:text-cyan-300"
              >
                Select all
              </button>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Card list */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
          {filteredCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-slate-600">No configured cards found.</p>
            </div>
          ) : filteredCards.map((id) => {
            const isChecked = selected.has(id);
            const actionCount = data[id]?.length ?? 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={`flex w-full items-center gap-2.5 border-b border-slate-800/40 px-3 py-2.5 text-left last:border-0 transition ${
                  isChecked ? "bg-emerald-950/30 ring-inset ring-1 ring-emerald-500/30" : "hover:bg-slate-800/40"
                }`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                  isChecked ? "border-emerald-500/70 bg-emerald-500/30 text-emerald-200" : "border-slate-600 bg-slate-800 text-transparent"
                }`}>
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                <span className={`min-w-0 flex-1 truncate text-xs font-semibold ${isChecked ? "text-emerald-100" : "text-slate-100"}`}>
                  {id}
                </span>
                <span className="shrink-0 rounded-md bg-amber-950/70 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                  {actionCount}
                </span>
              </button>
            );
          })}
        </div>
        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800 p-3">
          <div className="flex items-center gap-3">
            <p className="flex-1 text-[10px] text-slate-500">
              {selected.size === 0
                ? "Select cards to export"
                : `${selected.size} card${selected.size !== 1 ? "s" : ""} will be exported`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { onExport(selected); onClose(); }}
              disabled={selected.size === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/50 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-900/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              Export {selected.size > 0 ? selected.size : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export default function CardActionsEditorClient() {
  const [data, setData] = useState<CustomActionsMap>(baseActionsData as CustomActionsMap);
  const [saved, setSaved] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [search, setSearch] = useState("");
  const [charFilter, setCharFilter] = useState<CharFilter>("all");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCards.filter(({ id, data }) => {
      if (charFilter !== "all" && (data.characters ?? "").toLowerCase() !== charFilter) return false;
      if (!q) return true;
      return (
        id.toLowerCase().includes(q) ||
        (data.type ?? "").toLowerCase().includes(q) ||
        (data.rarity ?? "").toLowerCase().includes(q) ||
        (data.characters ?? "").toLowerCase().includes(q) ||
        (data.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, charFilter]);

  const currentActions: CustomAction[] = selectedCard ? (data[selectedCard] ?? []) : [];

  function setCardActions(actions: CustomAction[]) {
    if (!selectedCard) return;
    setData((prev) => ({ ...prev, [selectedCard]: actions }));
  }

  function addAction() {
    setCardActions([...currentActions, blankAction()]);
  }

  function updateAction(idx: number, updated: CustomAction) {
    const next = [...currentActions];
    next[idx] = updated;
    setCardActions(next);
  }

  function deleteAction(idx: number) {
    setCardActions(currentActions.filter((_, i) => i !== idx));
  }

  function deleteCardConfig() {
    if (!selectedCard) return;
    setData((prev) => {
      const next = { ...prev };
      delete next[selectedCard];
      return next;
    });
    setSelectedCard(null);
    setSearch("");
  }

  function save() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom_card_actions.json";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function resetToOriginal() {
    if (!confirm("Reset to the original? This will reset your editor view AND download custom_card_actions.json so you can replace the file.")) return;
    const backup = backupActionsData as CustomActionsMap;
    setData(backup);
    setSelectedCard(null);
    setSearch("");
    // Download the backup as the replacement JSON file
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom_card_actions.json";
    a.click();
    URL.revokeObjectURL(url);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  }

  const configuredCardCount = Object.keys(data).filter((k) => k !== "__global__").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/editors"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Editors
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-700/60 hover:text-slate-300"
            >
              Planner
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-950/40 text-amber-300">
                <Zap className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-100">Quick Actions Editor</p>
                <p className="text-[10px] text-slate-500">
                  {configuredCardCount} card{configuredCardCount !== 1 ? "s" : ""} configured
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600/60 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-violet-500/50 hover:bg-violet-950/30 hover:text-violet-200"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              Select to export
            </button>
            <button
              type="button"
              onClick={resetToOriginal}
              title="Reset to the original backup (loses unsaved session edits)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600/60 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-950/40 hover:text-rose-200"
            >
              {resetDone ? (
                <Check className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2.5} />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              {resetDone ? "Reset!" : "Reset to original"}
            </button>
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-950/50 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-900/60"
            >
              {saved ? (
                <Check className="h-4 w-4 text-emerald-300" strokeWidth={2.5} />
              ) : (
                <Download className="h-4 w-4" strokeWidth={2} />
              )}
              {saved ? "Downloaded!" : "Export JSON"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[22rem_1fr]">
            {/* Left: card list */}
            <aside className="flex flex-col gap-2">
              {/* Character filter chips */}
              <div className="flex flex-wrap gap-1">
                {CHAR_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setCharFilter(f.value)}
                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition ${
                      charFilter === f.value ? f.activePill : f.pill
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, type, rarity…"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
              />
              <p className="text-[10px] font-semibold text-slate-600">
                {filtered.length} card{filtered.length !== 1 ? "s" : ""} shown
              </p>
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/50 [scrollbar-width:thin] md:max-h-[calc(100vh-12rem)]"
              >
                {/* Pinned: Global Actions */}
                {(() => {
                  const gid = "__global__";
                  const isSelected = selectedCard === gid;
                  const count = data[gid]?.length ?? 0;
                  return (
                    <button
                      key={gid}
                      type="button"
                      onClick={() => setSelectedCard(gid)}
                      className={`flex w-full flex-col gap-1 border-b-2 border-amber-500/30 px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "bg-amber-950/40 ring-inset ring-1 ring-amber-500/50"
                          : "bg-amber-950/10 hover:bg-amber-950/25"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3 shrink-0 text-amber-400" strokeWidth={2} />
                        <span className={`text-xs font-bold ${isSelected ? "text-amber-200" : "text-amber-300/90"}`}>
                          Global Actions
                        </span>
                        {count > 0 && (
                          <span className="ml-auto shrink-0 rounded-md bg-amber-950/70 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                            {count}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">Apply to any selected card</p>
                    </button>
                  );
                })()}
                {filtered.map(({ id, data: card }) => {
                  const isSelected = selectedCard === id;
                  const hasConfig = Boolean(data[id]?.length);
                  const typeStr = card.type ?? "";
                  const rarityStr = card.rarity ?? "";
                  const charStyle = getCharStyle(card.characters);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedCard(id)}
                      className={`flex w-full flex-col gap-1 border-b border-slate-800/40 px-3 py-2.5 text-left last:border-0 transition ${
                        isSelected ? charStyle.selectedRowBg : `${charStyle.rowBg} hover:brightness-125`
                      }`}
                    >
                      {/* Name row */}
                      <div className="flex items-center gap-1.5">
                        <span className={`min-w-0 truncate text-xs font-semibold ${isSelected ? "text-white" : "text-slate-100"}`}>
                          {id}
                        </span>
                        {hasConfig && (
                          <span className="ml-auto shrink-0 rounded-md bg-amber-950/70 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                            {data[id].length}
                          </span>
                        )}
                      </div>
                      {/* Chips row */}
                      <div className="flex flex-wrap items-center gap-1">
                        {typeStr && (
                          <span className={`rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide ${typeChipCls(typeStr)}`}>
                            {typeStr}
                          </span>
                        )}
                        {rarityStr && (
                          <span className={`rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide ${rarityChipCls(rarityStr)}`}>
                            {rarityStr}
                          </span>
                        )}
                        {card.characters && (
                          <span className={`rounded border px-1 py-px text-[9px] font-medium capitalize ${charStyle.charChip}`}>
                            {card.characters}
                          </span>
                        )}
                      </div>
                      {/* Description */}
                      {card.description && (
                        <p className="line-clamp-2 text-[10px] leading-snug text-slate-400">
                          {card.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right: action editor */}
            <div>
              {!selectedCard ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/30 py-20 text-center">
                  <Zap className="mb-3 h-8 w-8 text-slate-700" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-slate-500">No card selected</p>
                  <p className="mt-1 text-xs text-slate-600">Search and select a card on the left to edit its custom actions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {selectedCard === "__global__" ? (
                          <>
                            <Zap className="h-4 w-4 text-amber-400" strokeWidth={2} />
                            <h2 className="text-base font-bold text-amber-200">Global Actions</h2>
                            <span className="rounded border border-amber-500/40 bg-amber-950/40 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
                              All cards
                            </span>
                          </>
                        ) : (
                          <>
                            <h2 className="text-base font-bold text-slate-100">{selectedCard}</h2>
                            {(() => {
                              const card = (stsBundle as any).cards?.[selectedCard] as CardData | undefined;
                              if (!card) return null;
                              return (
                                <>
                                  {card.type && <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${typeChipCls(card.type)}`}>{card.type}</span>}
                                  {card.rarity && <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${rarityChipCls(card.rarity)}`}>{card.rarity}</span>}
                                  {card.characters && <span className="rounded border border-slate-700/50 bg-slate-800/50 px-1.5 py-0.5 text-[9px] font-medium capitalize text-slate-400">{card.characters}</span>}
                                </>
                              );
                            })()}
                          </>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {selectedCard === "__global__"
                          ? `${currentActions.length} global action${currentActions.length !== 1 ? "s" : ""} — shown for every selected card`
                          : `${currentActions.length} custom action${currentActions.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {data[selectedCard] !== undefined && selectedCard !== "__global__" && (
                        <button
                          type="button"
                          onClick={deleteCardConfig}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-700/50 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-900/60"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          Delete config
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={addAction}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/45 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-900/50"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Add action
                      </button>
                    </div>
                  </div>

                  {currentActions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/20 py-12 text-center">
                      <p className="text-sm text-slate-600">No custom actions yet.</p>
                      <p className="mt-1 text-xs text-slate-700">Click <strong className="text-slate-500">Add action</strong> to create one.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentActions.map((action, i) => (
                        <ActionRow
                          key={i}
                          action={action}
                          index={i}
                          onChange={updateAction}
                          onDelete={deleteAction}
                        />
                      ))}
                    </div>
                  )}

                  {currentActions.length > 0 && (
                    <div className="pt-2">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Preview JSON
                      </p>
                      <pre className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[10px] leading-relaxed text-slate-400 [scrollbar-width:thin]">
                        {JSON.stringify(currentActions, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
      </main>

      {showExportModal && (
        <ExportModal
          data={data}
          initialSelected={new Set(selectedCard && data[selectedCard] ? [selectedCard] : [])}
          onExport={(ids) => {
            const subset: CustomActionsMap = {};
            for (const id of ids) {
              if (data[id]) subset[id] = data[id];
            }
            const json = JSON.stringify(subset, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `card_actions_export_${ids.size}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
