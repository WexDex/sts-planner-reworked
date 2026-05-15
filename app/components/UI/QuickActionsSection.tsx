"use client";

import { useEffect, useState } from "react";
import customCardActionsData from "@/app/data/custom_card_actions.json";
import stsBundle from "@/app/data/db/STS_CARDS_DB.json";
import {
  Activity,
  Battery,
  BookOpen,
  Flame,
  Heart,
  Info,
  Shield,
  Sparkles,
  Star,
  Wind,
  Zap,
} from "lucide-react";
import { useGameManager } from "@/app/context/GameContext";
import QuickActionInputPopup from "@/app/components/UI/QuickActionInputPopup";
import CardPickerModal from "@/app/components/UI/CardPickerModal";

// ─── Filter types (mirrored from CardActionsEditorClient) ────────────────────

type FilterOperator = "eq" | "neq" | "contains" | "notContains" | "gt" | "lt" | "gte" | "lte" | "isTrue" | "isFalse";
type FilterValue = { kind: "literal"; value: string } | { kind: "field"; field: string };
type FilterLeaf = { type: "leaf"; id: string; field: string; operator: FilterOperator; value: FilterValue };
type FilterGroup = { type: "group"; id: string; conjunction: "AND" | "OR"; children: FilterNode[] };
type FilterNode = FilterLeaf | FilterGroup;
type ActionFilter = FilterGroup;

function getNestedField(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc === null || acc === undefined) return undefined;
    const match = k.match(/^(\w+)\[(\d+)\]$/);
    if (match) return (acc as Record<string, unknown[]>)[match[1]]?.[Number(match[2])];
    return (acc as Record<string, unknown>)[k];
  }, obj);
}

// Evaluate a filter against a full context object (card data merged with live game state).
// No runtime auto-pass — every field resolves from ctx.
function evaluateFilterLeaf(leaf: FilterLeaf, ctx: Record<string, unknown>): boolean {
  const lhsRaw = getNestedField(ctx, leaf.field);
  const rhs = leaf.value.kind === "literal"
    ? leaf.value.value
    : String(getNestedField(ctx, leaf.value.field) ?? "");
  const lhs = String(lhsRaw ?? "").toLowerCase();
  const rhsLow = rhs.toLowerCase();
  switch (leaf.operator) {
    case "eq": return lhs === rhsLow;
    case "neq": return lhs !== rhsLow;
    case "contains": return lhs.includes(rhsLow);
    case "notContains": return !lhs.includes(rhsLow);
    case "gt": return Number(lhsRaw) > Number(rhs);
    case "lt": return Number(lhsRaw) < Number(rhs);
    case "gte": return Number(lhsRaw) >= Number(rhs);
    case "lte": return Number(lhsRaw) <= Number(rhs);
    case "isTrue": return Boolean(lhsRaw);
    case "isFalse": return !Boolean(lhsRaw);
    default: return true;
  }
}

function evaluateFilterNode(node: FilterNode, ctx: Record<string, unknown>): boolean {
  if (node.type === "leaf") return evaluateFilterLeaf(node, ctx);
  const results = node.children.map(c => evaluateFilterNode(c, ctx));
  return node.conjunction === "AND" ? results.every(Boolean) : results.some(Boolean);
}

// Build a merged evaluation context: card DB data + live game state fields.
// Filter paths like draw.length, player.hp, stance, etc. resolve to real values.
function buildEvalContext(cardData: Record<string, unknown>, gs: Record<string, unknown>): Record<string, unknown> {
  const player = (gs.player ?? {}) as Record<string, unknown>;
  const energy = (player.energy ?? {}) as Record<string, unknown>;
  return {
    ...cardData,
    player: {
      hp:     player.hp     ?? 0,
      maxHp:  player.maxHp  ?? 0,
      block:  player.currentBlock ?? 0,
      energy: player.currentEnergy ?? energy.base ?? 0,
    },
    hand:    { length: ((gs.hand    as unknown[]) ?? []).length },
    draw:    { length: ((gs.draw    as unknown[]) ?? []).length },
    discard: { length: ((gs.discard as unknown[]) ?? []).length },
    exhaust: { length: ((gs.exhaust as unknown[]) ?? []).length },
    enemies: Object.assign(
      ((gs.enemies as Record<string, unknown>[]) ?? []).map(e => ({ hp: e.hp, maxHp: e.maxHp })),
      { length: ((gs.enemies as unknown[]) ?? []).length },
    ),
    stance: gs.stance ?? "neutral",
    orbs:   { length: ((gs.orbs as unknown[]) ?? []).length },
  };
}

// ─── Filter expression renderer ──────────────────────────────────────────────

const OP_LABELS: Record<string, string> = {
  eq: "=", neq: "≠", contains: "∋", notContains: "∌",
  gt: ">", lt: "<", gte: "≥", lte: "≤", isTrue: "is true", isFalse: "is false",
};

const FIELD_LABELS: Record<string, string> = {
  "type": "Type", "rarity": "Rarity", "characters": "Character", "name": "Name",
  "damage.base": "Damage", "block.base": "Block", "draw": "Draw",
  "cost.base": "Energy", "selfExhaustOnPlay": "Exhausts", "ethereal": "Ethereal",
  "innate": "Innate", "retain": "Retain",
};

function filterExpr(node: FilterNode): string {
  if (node.type === "leaf") {
    const lhs = FIELD_LABELS[node.field] ?? node.field;
    const op = OP_LABELS[node.operator] ?? node.operator;
    const rhs = node.value.kind === "literal" ? node.value.value : `[${node.value.field}]`;
    return `${lhs} ${op} ${rhs}`;
  }
  if (node.children.length === 0) return "(empty)";
  const parts = node.children.map(c => filterExpr(c));
  const joined = parts.join(` ${node.conjunction} `);
  return node.children.length > 1 ? `( ${joined} )` : joined;
}

function FilterExprColored({ node, cardData }: { node: FilterNode; cardData: Record<string, unknown> }): React.ReactElement {
  if (node.type === "leaf") {
    const fLabel = FIELD_LABELS[node.field] ?? node.field;
    const op = OP_LABELS[node.operator] ?? node.operator;
    const expectedVal = node.value.kind === "literal" ? node.value.value : `[${node.value.field}]`;
    const actualRaw = getNestedField(cardData, node.field);
    const matches = evaluateFilterLeaf(node, cardData);
    const actualStr = actualRaw === undefined || actualRaw === null ? "—" : String(actualRaw);
    return (
      <span className="inline-flex flex-wrap items-baseline gap-x-0.5">
        <span className="text-sky-300">{fLabel}</span>
        {!matches && <span className="text-rose-400 text-[8px] font-mono">[{actualStr}]</span>}
        <span className="text-slate-500 px-0.5">{op}</span>
        <span className={matches ? "text-amber-300" : "text-amber-500/70"}>{expectedVal}</span>
      </span>
    );
  }
  if (node.children.length === 0) return <span className="text-slate-600 text-[9px]">(empty)</span>;
  const conjCls = node.conjunction === "AND" ? "text-rose-400 font-bold" : "text-sky-400 font-bold";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-0.5">
      {node.children.length > 1 && <span className="text-slate-600">(</span>}
      {node.children.map((child, i) => (
        <span key={i} className="inline-flex items-baseline gap-x-0.5">
          {i > 0 && <span className={conjCls}>{node.conjunction}</span>}
          <FilterExprColored node={child} cardData={cardData} />
        </span>
      ))}
      {node.children.length > 1 && <span className="text-slate-600">)</span>}
    </span>
  );
}

// ─── STS DB card lookup ───────────────────────────────────────────────────────

const STS_CARDS = (stsBundle as unknown as { cards: Record<string, Record<string, unknown>> }).cards ?? {};

function getCardData(name: string): Record<string, unknown> {
  return STS_CARDS[name] ?? {};
}

// ─── Enemy action types ───────────────────────────────────────────────────────

const ENEMY_ACTION_TYPES = new Set([
  "give_enemy_buff",
  "give_enemy_debuff",
  "modify_enemy_hp",
  "modify_enemy_block",
  "remove_enemy_buff",
]);

// ─── Enemy picker popup ───────────────────────────────────────────────────────

function EnemyPickerPopup({ title, enemies, onApply, onCancel }: {
  title: string;
  enemies: Array<{ name: string; hp: number; maxHp: number }>;
  onApply: (indices: number[]) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [allSelected, setAllSelected] = useState(false);

  const canApply = allSelected || selected.size > 0;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/70" onClick={onCancel}>
      <div className="w-95 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="border-b border-slate-700/60 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">{title}</p>
          <p className="text-[10px] text-slate-500">Select target enemies</p>
        </div>
        <div className="max-h-72 space-y-1.5 overflow-y-auto p-3">
          <button type="button" onClick={() => { setAllSelected(v => !v); setSelected(new Set()); }}
            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] transition ${allSelected ? "border-rose-500/60 bg-rose-950/40 text-rose-100" : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-slate-500/60"}`}
          >
            <span className={`h-3.5 w-3.5 shrink-0 rounded border-2 ${allSelected ? "border-rose-400 bg-rose-400" : "border-slate-500"}`} aria-hidden />
            <span className="font-semibold">All enemies</span>
          </button>
          {enemies.map((e, i) => {
            const isSel = selected.has(i) || allSelected;
            return (
              <button key={i} type="button" onClick={() => {
                setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
                setAllSelected(false);
              }}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] transition ${isSel ? "border-rose-500/60 bg-rose-950/40 text-rose-100" : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-slate-500/60"}`}
              >
                <span className={`h-3.5 w-3.5 shrink-0 rounded border-2 ${isSel ? "border-rose-400 bg-rose-400" : "border-slate-500"}`} aria-hidden />
                <span className="flex-1 font-medium">{e.name || `Enemy ${i + 1}`}</span>
                <span className="tabular-nums text-slate-400"><span className="text-emerald-300">{e.hp}</span><span className="text-slate-600">/</span>{e.maxHp} HP</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-700/60 px-4 py-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700/60">Cancel</button>
          <button type="button" disabled={!canApply} onClick={() => onApply(allSelected ? enemies.map((_, i) => i) : Array.from(selected))}
            className="rounded-lg border border-rose-500/50 bg-rose-950/50 px-3 py-1.5 text-[11px] font-bold text-rose-100 hover:bg-rose-900/60 disabled:cursor-not-allowed disabled:opacity-40"
          >Apply</button>
        </div>
      </div>
    </div>
  );
}

type ValueNode = number | { base: number; upgraded?: number };

type CustomAction = {
  label: string;
  actionType:
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
  buffName?: string;
  buffType?: "buff" | "debuff";
  hasInput?: boolean;
  defaultValue?: number;
  pile?: string;
  cardName?: string;
  cardCount?: number;
  orbType?: "lightning" | "dark" | "frost" | "plasma";
  orbCount?: number;
  stance?: "neutral" | "wrath" | "calm" | "divinity";
  enemyIndex?: number;
  allEnemies?: boolean;
  filter?: ActionFilter;
};

type CustomActionsMap = Record<string, CustomAction[]>;

type PopupState = {
  title: string;
  defaultValue: number;
  onApply: (v: number) => void;
} | null;

type CardPickerState = {
  pile: string;
  defaultCount: number;
  initialSelected: string[];
} | null;

function resolveValue(node: ValueNode | undefined, isUpgraded: boolean): number | null {
  if (node === undefined || node === null) return null;
  if (typeof node === "number") return node;
  return isUpgraded && node.upgraded !== undefined ? node.upgraded : node.base;
}

function isTrueTier(
  node: { base?: boolean; upgraded?: boolean } | boolean | undefined,
  isUpgraded: boolean,
): boolean {
  if (!node) return false;
  if (typeof node === "boolean") return node;
  return isUpgraded ? (node.upgraded ?? node.base ?? false) : (node.base ?? false);
}

function customActionTooltip(ca: CustomAction): string {
  switch (ca.actionType) {
    case "give_buff":
      return `Gives the player the "${ca.buffName}" buff${ca.hasInput ? " — enter stacks in the popup" : ""}.`;
    case "give_debuff":
      return `Applies the "${ca.buffName}" debuff to the player${ca.hasInput ? " — enter stacks in the popup" : ""}.`;
    case "remove_buff":
      return `Removes "${ca.buffName}" from the player's buffs/debuffs entirely.`;
    case "modify_hp":
      return `Changes player HP (positive = heal, negative = damage)${ca.hasInput ? " — enter value in the popup" : `by ${ca.defaultValue}`}.`;
    case "modify_block":
      return `Adds or removes player block${ca.hasInput ? " — enter value in the popup" : ` by ${ca.defaultValue}`}.`;
    case "modify_energy":
      return `Adjusts current energy${ca.hasInput ? " — enter value in the popup" : ` by ${ca.defaultValue}`}.`;
    case "draw_cards":
      return `Draws cards from the draw pile into hand${ca.hasInput ? " — enter count in the popup" : ` (${ca.defaultValue})`}.`;
    case "move_to_pile":
      return `Moves this card directly to the ${ca.pile ?? "hand"} pile.`;
    case "add_card": {
      const names = (ca as any).cardNames as string[] | undefined ?? (ca.cardName ? [ca.cardName] : []);
      const pile = ca.pile ?? "hand";
      const count = ca.cardCount ?? 1;
      if (names.length === 0) return `Opens card picker to add cards to ${pile}.`;
      const preview = names.slice(0, 4).join(", ") + (names.length > 4 ? ` +${names.length - 4} more` : "");
      if (!ca.hasInput) return `→ ${pile}: ${preview}${count > 1 ? ` (×${count} each)` : ""}`;
      return `Opens picker · ${preview} pre-selected → ${pile}`;
    }
    case "channel_orb":
      return `Channels ${ca.orbCount ?? 1}× ${ca.orbType ?? "lightning"} orb${(ca.orbCount ?? 1) > 1 ? "s" : ""} into the orb slots.`;
    case "evoke_orbs":
      return `Evokes ${ca.hasInput ? "N" : ca.defaultValue ?? 1} orb${ca.hasInput || (ca.defaultValue ?? 1) > 1 ? "s" : ""} from the leftmost slot.`;
    case "set_stance":
      return `Changes Watcher stance to ${ca.stance ?? "neutral"}.`;
    case "give_enemy_buff":
      return `Gives "${ca.buffName}" buff to selected enemies${ca.hasInput ? " — enter stacks" : ""}.`;
    case "give_enemy_debuff":
      return `Applies "${ca.buffName}" debuff to selected enemies${ca.hasInput ? " — enter stacks" : ""}.`;
    case "modify_enemy_hp":
      return `Changes HP of selected enemies${ca.hasInput ? " — enter value" : ` by ${ca.defaultValue}`}.`;
    case "modify_enemy_block":
      return `Modifies block of selected enemies${ca.hasInput ? " — enter value" : ` by ${ca.defaultValue}`}.`;
    case "remove_enemy_buff":
      return `Removes "${ca.buffName}" from selected enemies.`;
    case "trigger_orb_passive":
      return "Triggers the passive effect of all channeled orbs.";
    case "discard_hand":
      return "Discards all cards currently in hand.";
    case "reshuffle_discard":
      return "Shuffles the discard pile back into the draw pile.";
    case "set_orb_slots":
      return `Sets orb slot count to ${ca.hasInput ? "N" : ca.defaultValue ?? 3} (max 10).`;
    case "adjust_orb_slots":
      return `Adjusts orb slot count by ${ca.hasInput ? "N" : (ca.defaultValue ?? 1) >= 0 ? `+${ca.defaultValue ?? 1}` : ca.defaultValue ?? 1}.`;
    default:
      return "";
  }
}

// ─── Action button with 2-line layout + native tooltip ───────────────────────

function QAButton({
  icon,
  label,
  hint,
  color,
  badge,
  filter,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  color: string;
  badge?: string;
  filter?: ActionFilter;
  onClick: () => void;
}) {
  const expr = filter ? filterExpr(filter) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={`group relative flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${color}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-xs font-bold leading-tight">{label}</span>
          {badge && (
            <span className="rounded-md bg-black/20 px-1.5 py-px text-[9px] font-bold tabular-nums opacity-80">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[10px] leading-snug opacity-60">{hint}</span>
        {expr && (
          <span className="mt-1 block truncate font-mono text-[9px] text-sky-400/70" title={expr}>
            if {expr}
          </span>
        )}
      </span>
      <Info
        className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-40"
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}

// ─── Grayed-out action (filter doesn't match current card) ───────────────────

function GrayedQAButton({ label, filter, cardData }: {
  label: string;
  filter?: ActionFilter;
  cardData: Record<string, unknown>;
}) {
  return (
    <div className="group relative flex w-full flex-col rounded-lg border border-slate-700/30 bg-slate-900/20 px-3 py-1.5 opacity-50 transition-colors hover:border-slate-600/50 hover:bg-slate-800/40 hover:opacity-100">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded-full border border-slate-600/50 bg-slate-800" />
        <span className="text-[10px] font-semibold text-slate-500 line-through">{label}</span>
        <span className="ml-auto shrink-0 text-[9px] text-slate-600">filter</span>
      </div>
      {filter && (
        <div className="mt-1.5 hidden flex-wrap gap-x-1 gap-y-0.5 font-mono text-[9px] leading-relaxed group-hover:flex">
          <FilterExprColored node={filter} cardData={cardData} />
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuickActionsSection() {
  const {
    gameState,
    useSelectedPower,
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
    triggerOrbPassive,
    discardWholeHand,
    shuffleDiscardIntoDraw,
    setOrbChannelSize,
  } = useGameManager();

  const [popup, setPopup] = useState<PopupState>(null);
  const [cardPicker, setCardPicker] = useState<CardPickerState>(null);
  const [customActions, setCustomActions] = useState<CustomActionsMap>(customCardActionsData as CustomActionsMap);
  const [enemyPickerPending, setEnemyPickerPending] = useState<{ action: CustomAction; preValue?: number } | null>(null);

  useEffect(() => {
    fetch("/api/card-actions")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setCustomActions(d); })
      .catch(() => {});
  }, []);

  if (!gameState) return null;

  const allCards = [
    ...gameState.hand,
    ...gameState.draw,
    ...gameState.discard,
    ...gameState.exhaust,
    ...gameState.playedCards,
  ];
  const selected = allCards.filter((c) => c.isSelected);
  if (selected.length !== 1) return null;

  const card = selected[0];
  const upg = card.isUpgraded ?? false;
  const sourceCard = { name: card.name, character: card.characters as string | undefined, cardType: card.type as string | undefined };
  const evalCtx = buildEvalContext(getCardData(card.name), gameState as unknown as Record<string, unknown>);

  function openPopup(title: string, defaultValue: number, onApply: (v: number) => void) {
    setPopup({ title, defaultValue, onApply });
  }

  function closePopup() {
    setPopup(null);
  }

  type DbAction = {
    label: string;
    hint: string;
    badge?: string;
    icon: React.ReactNode;
    color: string;
    action: () => void;
  };

  const dbActions: DbAction[] = [];

  // Block
  const blockVal = resolveValue(card.block, upg);
  if (blockVal !== null) {
    dbActions.push({
      label: "Add Block",
      hint: `Adds block to the player. Block absorbs incoming damage before HP. Base: ${blockVal}.`,
      badge: `${blockVal}`,
      icon: <Shield className="h-4 w-4" strokeWidth={2} />,
      color: "border-sky-500/50 bg-sky-950/40 text-sky-100 hover:bg-sky-900/55 hover:border-sky-400/65",
      action: () => openPopup("Add Block", blockVal, (v) => modifyPlayerBlock(v, sourceCard)),
    });
  }

  // Draw
  const drawVal = resolveValue(card.draw, upg);
  if (drawVal !== null) {
    dbActions.push({
      label: "Draw Cards",
      hint: `Draws cards from the draw pile into your hand. Base: ${drawVal}.`,
      badge: `${drawVal}`,
      icon: <BookOpen className="h-4 w-4" strokeWidth={2} />,
      color: "border-violet-500/50 bg-violet-950/40 text-violet-100 hover:bg-violet-900/55 hover:border-violet-400/65",
      action: () => openPopup("Draw Cards", drawVal, (v) => drawCards(Math.round(v), sourceCard)),
    });
  }

  // Energy gain
  const energyVal = resolveValue(card.energyGain, upg);
  if (energyVal !== null) {
    dbActions.push({
      label: "Gain Energy",
      hint: `Adds to the player's current energy pool for this turn. Base: ${energyVal}.`,
      badge: `+${energyVal}`,
      icon: <Zap className="h-4 w-4" strokeWidth={2} />,
      color: "border-amber-500/50 bg-amber-950/40 text-amber-100 hover:bg-amber-900/55 hover:border-amber-400/65",
      action: () => openPopup("Gain Energy", energyVal, (v) => modifyPlayerEnergy(v, sourceCard)),
    });
  }

  // Heal
  const healVal = resolveValue(card.heal, upg);
  if (healVal !== null) {
    dbActions.push({
      label: "Heal",
      hint: `Restores player HP. Will not exceed max HP. Base: ${healVal}.`,
      badge: `+${healVal}`,
      icon: <Heart className="h-4 w-4" strokeWidth={2} />,
      color: "border-rose-400/50 bg-rose-950/40 text-rose-100 hover:bg-rose-900/55 hover:border-rose-400/65",
      action: () => openPopup("Heal", healVal, (v) => modifyPlayerHp(v, sourceCard)),
    });
  }

  // HP cost
  const hpCostVal = resolveValue(card.takeDamage, upg);
  if (hpCostVal !== null) {
    dbActions.push({
      label: "Pay HP",
      hint: `Spends player HP as a cost. Bypasses block — goes directly to HP. Cost: ${hpCostVal}.`,
      badge: `−${hpCostVal}`,
      icon: <Activity className="h-4 w-4" strokeWidth={2} />,
      color: "border-red-600/50 bg-red-950/40 text-red-100 hover:bg-red-900/55 hover:border-red-500/65",
      action: () => openPopup("Pay HP", -hpCostVal, (v) => modifyPlayerHp(v, sourceCard)),
    });
  }

  // Focus (Defect)
  const focusVal = resolveValue(card.focus, upg);
  if (focusVal !== null) {
    dbActions.push({
      label: "Gain Focus",
      hint: `Gives the player Focus buff. Each stack increases orb passive and evoke effects. Base: ${focusVal}.`,
      badge: `+${focusVal}`,
      icon: <Battery className="h-4 w-4" strokeWidth={2} />,
      color: "border-cyan-500/50 bg-cyan-950/40 text-cyan-100 hover:bg-cyan-900/55 hover:border-cyan-400/65",
      action: () => openPopup("Gain Focus", focusVal, (v) => addBuffDebuff("player", -1, "Focus", "buff", v, undefined, sourceCard)),
    });
  }

  // Mantra (Watcher)
  const mantraVal = resolveValue(card.mantra, upg);
  if (mantraVal !== null) {
    dbActions.push({
      label: "Gain Mantra",
      hint: `Gives the player Mantra stacks. At 10 stacks, enters Divinity stance (3 energy, +3 damage multiplier). Base: ${mantraVal}.`,
      badge: `+${mantraVal}`,
      icon: <Wind className="h-4 w-4" strokeWidth={2} />,
      color: "border-purple-500/50 bg-purple-950/40 text-purple-100 hover:bg-purple-900/55 hover:border-purple-400/65",
      action: () => openPopup("Gain Mantra", mantraVal, (v) => addBuffDebuff("player", -1, "Mantra", "buff", v, undefined, sourceCard)),
    });
  }

  // Self Exhaust on Play
  if (isTrueTier(card.selfExhaustOnPlay, upg)) {
    dbActions.push({
      label: "Self Exhaust",
      hint: "Moves this card to the Exhaust pile when played. Exhausted cards are removed for the rest of combat.",
      icon: <Flame className="h-4 w-4" strokeWidth={2} />,
      color: "border-orange-500/50 bg-orange-950/40 text-orange-100 hover:bg-orange-900/55 hover:border-orange-400/65",
      action: () => moveSelectedCards("exhaust"),
    });
  }

  // Ethereal
  if (isTrueTier(card.ethereal, upg)) {
    dbActions.push({
      label: "Ethereal",
      hint: "Will exhaust this card — Ethereal cards are sent to the Exhaust pile at the end of your turn if still in hand.",
      icon: <Sparkles className="h-4 w-4" strokeWidth={2} />,
      color: "border-indigo-500/50 bg-indigo-950/40 text-indigo-100 hover:bg-indigo-900/55 hover:border-indigo-400/65",
      action: () => moveSelectedCards("exhaust"),
    });
  }

  // Power type
  if (card.type === "Power") {
    dbActions.push({
      label: "Use Power",
      hint: "Moves this Power card out of its current pile and into the Played area. The card stays selected so you can apply its effects separately.",
      icon: <Star className="h-4 w-4" strokeWidth={2} />,
      color: "border-emerald-500/50 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900/55 hover:border-emerald-400/65",
      action: () => useSelectedPower(),
    });
  }

  const cardSpecificActions: CustomAction[] = customActions[card.name] ?? [];
  const globalActions: CustomAction[] = (customActions as Record<string, CustomAction[]>)["__global__"] ?? [];
  const cardCustomActions: CustomAction[] = [...cardSpecificActions, ...globalActions];

  // When the JSON has entries for this card (card-specific or global), those are authoritative —
  // skip the runtime DB-derived actions to avoid showing duplicates.
  const visibleDbActions = cardCustomActions.length > 0 ? [] : dbActions;

  if (visibleDbActions.length === 0 && cardCustomActions.length === 0) return null;

  const NO_INPUT_TYPES = new Set<CustomAction["actionType"]>([
    "channel_orb", "set_stance", "trigger_orb_passive", "discard_hand", "reshuffle_discard", "remove_buff", "remove_enemy_buff",
  ]);

  function triggerCustomAction(ca: CustomAction) {
    if (ca.actionType === "add_card") {
      if (!ca.hasInput) { fireCustomAction(ca); return; }
      const preSelected = (ca as any).cardNames as string[] | undefined ?? (ca.cardName ? [ca.cardName] : []);
      setCardPicker({ pile: ca.pile ?? "hand", defaultCount: ca.cardCount ?? 1, initialSelected: preSelected });
      return;
    }
    if (ENEMY_ACTION_TYPES.has(ca.actionType)) {
      const enemies = gameState?.enemies ?? [];
      if (enemies.length === 0) { fireCustomAction(ca); return; }
      if (ca.hasInput) {
        openPopup(ca.label, ca.defaultValue ?? 1, (v) => setEnemyPickerPending({ action: ca, preValue: v }));
      } else {
        setEnemyPickerPending({ action: ca });
      }
      return;
    }
    if (NO_INPUT_TYPES.has(ca.actionType)) { fireCustomAction(ca); return; }
    if (ca.hasInput) {
      openPopup(ca.label, ca.defaultValue ?? 1, (v) => fireCustomAction(ca, v));
      return;
    }
    fireCustomAction(ca);
  }

  function fireCustomAction(ca: CustomAction, value?: number, targetIndices?: number[]) {
    const v = value ?? ca.defaultValue ?? 0;
    const targets = targetIndices ?? (ca.allEnemies ? (gameState?.enemies ?? []).map((_, i) => i) : [ca.enemyIndex ?? 0]);
    switch (ca.actionType) {
      case "give_buff":
        addBuffDebuff("player", -1, ca.buffName ?? "", "buff", v, undefined, sourceCard);
        break;
      case "give_debuff":
        addBuffDebuff("player", -1, ca.buffName ?? "", "debuff", v, undefined, sourceCard);
        break;
      case "remove_buff":
        removeBuffDebuff("player", -1, ca.buffName ?? "");
        break;
      case "modify_hp":
        modifyPlayerHp(v, sourceCard);
        break;
      case "modify_block":
        modifyPlayerBlock(v, sourceCard);
        break;
      case "modify_energy":
        modifyPlayerEnergy(v, sourceCard);
        break;
      case "draw_cards":
        drawCards(Math.round(v), sourceCard);
        break;
      case "move_to_pile":
        moveSelectedCards(ca.pile ?? "hand");
        break;
      case "add_card": {
        const names = (ca as any).cardNames as string[] | undefined ?? (ca.cardName ? [ca.cardName] : []);
        if (names.length > 0) {
          addCardFromDB(
            names.flatMap((id) => Array(Math.max(1, ca.cardCount ?? 1)).fill(id)),
            ca.pile ?? "hand",
            false,
          );
        }
        break;
      }
      case "channel_orb":
        for (let i = 0; i < (ca.orbCount ?? 1); i++) channelOrb(ca.orbType ?? "lightning");
        break;
      case "evoke_orbs":
        evokeOrb(Math.max(1, Math.round(v)));
        break;
      case "set_stance":
        setStance(ca.stance ?? "neutral");
        break;
      case "give_enemy_buff":
        targets.forEach(i => addBuffDebuff("enemy", i, ca.buffName ?? "", "buff", v, undefined, sourceCard));
        break;
      case "give_enemy_debuff":
        targets.forEach(i => addBuffDebuff("enemy", i, ca.buffName ?? "", "debuff", v, undefined, sourceCard));
        break;
      case "modify_enemy_hp":
        targets.forEach(i => modifyEnemyHp(i, v));
        break;
      case "modify_enemy_block":
        targets.forEach(i => modifyEnemyBlock(i, v));
        break;
      case "remove_enemy_buff":
        targets.forEach(i => removeBuffDebuff("enemy", i, ca.buffName ?? ""));
        break;
      case "trigger_orb_passive":
        triggerOrbPassive();
        break;
      case "discard_hand":
        discardWholeHand();
        break;
      case "reshuffle_discard":
        shuffleDiscardIntoDraw(gameState?.discard ?? []);
        break;
      case "set_orb_slots":
        setOrbChannelSize(Math.max(1, Math.min(10, Math.round(v))));
        break;
      case "adjust_orb_slots":
        setOrbChannelSize(Math.max(1, Math.min(10, (gameState?.orbSlots?.length ?? 3) + Math.round(v))));
        break;
    }
  }

  const totalCount = visibleDbActions.length + cardCustomActions.length;

  return (
    <>
      {/* Outer glow wrapper */}
      <div className="relative rounded-2xl p-px shadow-[0_0_20px_-4px_rgba(251,191,36,0.25)]"
        style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.35) 0%, rgba(251,191,36,0.08) 50%, rgba(99,102,241,0.15) 100%)" }}
      >
        <div className="rounded-[15px] bg-slate-950/95 p-3">

          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-amber-500/50 bg-amber-950/60 text-amber-300 shadow-sm shadow-amber-900/40">
              <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">
              Quick Actions
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="rounded-md border border-amber-500/30 bg-amber-950/50 px-1.5 py-0.5 text-[9px] font-bold text-amber-300/80 tabular-nums">
                {totalCount}
              </span>
              <span className="max-w-28 truncate rounded-md bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                {card.name}
              </span>
            </span>
          </div>

          {/* Divider */}
          <div className="mb-3 h-px bg-linear-to-r from-amber-500/30 via-amber-500/10 to-transparent" />

          {/* DB-derived actions (only for cards without JSON config) */}
          <div className="space-y-1.5">
            {visibleDbActions.map((a) => (
              <QAButton
                key={a.label}
                icon={a.icon}
                label={a.label}
                hint={a.hint}
                badge={a.badge}
                color={a.color}
                onClick={a.action}
              />
            ))}

            {/* Card-specific custom actions */}
            {cardSpecificActions.length > 0 && (
              <>
                {visibleDbActions.length > 0 && (
                  <div className="my-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-800/60" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Custom</span>
                    <div className="h-px flex-1 bg-slate-800/60" />
                  </div>
                )}
                {cardSpecificActions.map((ca, i) => {
                  const filterPass = !ca.filter || evaluateFilterNode(ca.filter, evalCtx);
                  if (!filterPass) return <GrayedQAButton key={`${ca.label}-${i}`} label={ca.label} filter={ca.filter} cardData={evalCtx} />;
                  return (
                    <QAButton
                      key={`${ca.label}-${i}`}
                      icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}
                      label={ca.label}
                      hint={customActionTooltip(ca)}
                      badge={ca.actionType === "add_card" ? (ca.cardCount ?? 1) > 1 ? `×${ca.cardCount}` : undefined : (ca.hasInput && ca.defaultValue !== undefined ? `${ca.defaultValue}` : undefined)}
                      filter={ca.filter}
                      color="border-teal-500/50 bg-teal-950/40 text-teal-100 hover:bg-teal-900/55 hover:border-teal-400/65"
                      onClick={() => triggerCustomAction(ca)}
                    />
                  );
                })}
              </>
            )}

            {/* Global actions (from __global__ key — apply to every card) */}
            {globalActions.length > 0 && (
              <>
                <div className="my-2 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-800/60" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600/80">Global</span>
                  <div className="h-px flex-1 bg-slate-800/60" />
                </div>
                {globalActions.map((ca, i) => {
                  const filterPass = !ca.filter || evaluateFilterNode(ca.filter, evalCtx);
                  if (!filterPass) return <GrayedQAButton key={`global-${ca.label}-${i}`} label={ca.label} filter={ca.filter} cardData={evalCtx} />;
                  return (
                    <QAButton
                      key={`global-${ca.label}-${i}`}
                      icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}
                      label={ca.label}
                      hint={customActionTooltip(ca)}
                      badge={ca.actionType === "add_card" ? (ca.cardCount ?? 1) > 1 ? `×${ca.cardCount}` : undefined : (ca.hasInput && ca.defaultValue !== undefined ? `${ca.defaultValue}` : undefined)}
                      filter={ca.filter}
                      color="border-amber-500/50 bg-amber-950/40 text-amber-100 hover:bg-amber-900/55 hover:border-amber-400/65"
                      onClick={() => triggerCustomAction(ca)}
                    />
                  );
                })}
              </>
            )}

          </div>

        </div>
      </div>

      {popup && (
        <QuickActionInputPopup
          title={popup.title}
          defaultValue={popup.defaultValue}
          onApply={popup.onApply}
          onClose={closePopup}
        />
      )}

      {cardPicker && (
        <CardPickerModal
          title={`Add cards → ${cardPicker.pile}`}
          multiSelect
          showCount
          defaultCount={cardPicker.defaultCount}
          pile={cardPicker.pile}
          initialSelected={cardPicker.initialSelected}
          onSelect={(cardIds, count) => {
            addCardFromDB(
              cardIds.flatMap((id) => Array(count).fill(id)),
              cardPicker.pile,
              false,
            );
          }}
          onClose={() => setCardPicker(null)}
        />
      )}

      {enemyPickerPending && (
        <EnemyPickerPopup
          title={enemyPickerPending.action.label}
          enemies={(gameState?.enemies ?? []).map(e => ({ name: (e as any).name ?? "", hp: (e as any).hp ?? 0, maxHp: (e as any).maxHp ?? 0 }))}
          onApply={indices => { fireCustomAction(enemyPickerPending.action, enemyPickerPending.preValue, indices); setEnemyPickerPending(null); }}
          onCancel={() => setEnemyPickerPending(null)}
        />
      )}
    </>
  );
}
