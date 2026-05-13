"use client";

import { useEffect, useState } from "react";
import customCardActionsData from "@/app/data/custom_card_actions.json";
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
    | "move_to_pile";
  buffName?: string;
  buffType?: "buff" | "debuff";
  hasInput?: boolean;
  defaultValue?: number;
  pile?: string;
};

type CustomActionsMap = Record<string, CustomAction[]>;

type PopupState = {
  title: string;
  defaultValue: number;
  onApply: (v: number) => void;
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  color: string;
  badge?: string;
  onClick: () => void;
}) {
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
      </span>
      <Info
        className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-40"
        strokeWidth={2}
        aria-hidden
      />
    </button>
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
  } = useGameManager();

  const [popup, setPopup] = useState<PopupState>(null);
  const [customActions, setCustomActions] = useState<CustomActionsMap>(customCardActionsData as CustomActionsMap);

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

  const cardCustomActions: CustomAction[] = customActions[card.name] ?? [];

  if (dbActions.length === 0 && cardCustomActions.length === 0) return null;

  function fireCustomAction(ca: CustomAction, value?: number) {
    const v = value ?? ca.defaultValue ?? 0;
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
    }
  }

  const totalCount = dbActions.length + cardCustomActions.length;

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

          {/* DB-derived actions */}
          <div className="space-y-1.5">
            {dbActions.map((a) => (
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

            {/* Custom actions */}
            {cardCustomActions.length > 0 && (
              <>
                {dbActions.length > 0 && (
                  <div className="my-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-800/60" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Custom</span>
                    <div className="h-px flex-1 bg-slate-800/60" />
                  </div>
                )}
                {cardCustomActions.map((ca, i) => (
                  <QAButton
                    key={`${ca.label}-${i}`}
                    icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}
                    label={ca.label}
                    hint={customActionTooltip(ca)}
                    badge={ca.hasInput && ca.defaultValue !== undefined ? `${ca.defaultValue}` : undefined}
                    color="border-teal-500/50 bg-teal-950/40 text-teal-100 hover:bg-teal-900/55 hover:border-teal-400/65"
                    onClick={() => {
                      if (ca.hasInput) {
                        openPopup(ca.label, ca.defaultValue ?? 1, (v) => fireCustomAction(ca, v));
                      } else {
                        fireCustomAction(ca);
                      }
                    }}
                  />
                ))}
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
    </>
  );
}
