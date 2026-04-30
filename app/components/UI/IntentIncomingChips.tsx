"use client";

import type { ReactNode } from "react";
import { AlertCircle, DoorOpen, HelpCircle, Minus } from "lucide-react";
import type { EnemyIntentAction, EnemyIntentStatusLocation } from "@/app/types/gameTypes";
import { getSingleAttackDamage } from "@/app/utils/enemyIntentActionHelpers";
import type { EffectType } from "@/app/utils/effectDisplay";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import {
  applyIncomingEnemyAttackDamage,
  type IncomingDamageContext,
} from "@/app/utils/intentFormat";

const ICON_SZ = "h-3 w-3 shrink-0 stroke-[2]";

function statusZoneShort(loc?: EnemyIntentStatusLocation): string {
  const zone = loc ?? "hand";
  if (zone === "hand") return "hand";
  if (zone === "draw") return "draw";
  return "discard";
}

function debuffStacksLabel(value: number | undefined): string {
  const v = value ?? 1;
  return v === 1 ? "" : String(v);
}

/** Map free-text enemy debuff labels to damage/stat icons used on cards. */
function displayForDebuff(effect: string) {
  const t = effect.trim().toLowerCase();
  const rules: [RegExp, EffectType][] = [
    [/\bweak(en(ed)?)?\b|^weakened$/i, "weak"],
    [/vulnerable|^vuln/, "vulnerable"],
    [/frail/, "frail"],
    [/poison|^poisoned/, "poison"],
    [/strength|^str\b|buff.*str/i, "strength_buff"],
    [/entangle/, "entangle"],
    [/wound/, "wound"],
  ];
  for (const [re, ty] of rules) {
    if (re.test(t)) return getEffectDisplay(ty);
  }
  return {
    label: "?",
    color: "text-fuchsia-200/85",
    fullLabel: effect,
    icon: AlertCircle,
  };
}

/** Self-buffs on enemies — prefer strength trending icon like card buff row. */
function displayForEnemyBuff(effect: string) {
  const t = effect.trim().toLowerCase();
  if (/block|armor| plating/i.test(t)) return getEffectDisplay("block");
  if (/artifact/i.test(t)) return getEffectDisplay("focus");
  if (/metal| plating| curl/i.test(t)) return getEffectDisplay("block");
  if (/str| strength| empowered| rage/i.test(t)) return getEffectDisplay("strength_buff");
  return getEffectDisplay("strength_buff");
}

export function IntentIncomingChips({
  actions,
  ctx,
}: {
  actions: EnemyIntentAction[];
  ctx: IncomingDamageContext;
}) {
  const list = actions ?? [];
  if (list.length === 0) return <span className="text-[10px] text-slate-500">—</span>;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-1">
      {list.flatMap((action, i) => {
        const sep =
          i > 0 ? (
            <span key={`sep-${i}`} className="text-[9px] text-slate-600" aria-hidden>
              ·
            </span>
          ) : null;
        const chips: ReactNode[] = [];
        if (sep) chips.push(sep);

        const chipShell =
          "inline-flex items-center gap-0.5 rounded border border-white/12 bg-black/30 px-1 py-0.5";

        switch (action.type) {
          case "attack": {
            const base = getSingleAttackDamage(action);
            const mod = applyIncomingEnemyAttackDamage(base, ctx);
            const dd = getEffectDisplay("damage");
            chips.push(
              <span key={`a-${i}`} className={chipShell} title={dd.fullLabel}>
                <dd.icon className={`${ICON_SZ} ${dd.color}`} aria-hidden />
                <span className="tabular-nums text-[10px] text-slate-100">
                  {mod !== base ? (
                    <>
                      {mod}{" "}
                      <span className="font-normal text-slate-500">({base})</span>
                    </>
                  ) : (
                    mod
                  )}
                </span>
              </span>,
            );
            break;
          }
          case "multi_attack": {
            const per = applyIncomingEnemyAttackDamage(action.dmg, ctx);
            const showsDetail = per !== action.dmg;
            const dd = getEffectDisplay("damage");
            chips.push(
              <span key={`ma-${i}`} className={chipShell} title={dd.fullLabel}>
                <dd.icon className={`${ICON_SZ} ${dd.color}`} aria-hidden />
                <span className="tabular-nums text-[10px] text-slate-100">
                  {showsDetail ? (
                    <>
                      {per}×{action.count}{" "}
                      <span className="font-normal text-slate-500">
                        ({action.dmg}×{action.count})
                      </span>
                    </>
                  ) : (
                    <>
                      {action.dmg}×{action.count}
                    </>
                  )}
                </span>
              </span>,
            );
            break;
          }
          case "block": {
            const bd = getEffectDisplay("block");
            chips.push(
              <span key={`b-${i}`} className={chipShell} title={bd.fullLabel}>
                <bd.icon className={`${ICON_SZ} ${bd.color}`} aria-hidden />
                <span className="tabular-nums text-[10px] text-slate-100">{action.amount}</span>
              </span>,
            );
            break;
          }
          case "debuff": {
            const d = displayForDebuff(action.effect);
            const stacks = debuffStacksLabel(action.value);
            chips.push(
              <span key={`db-${i}`} className={chipShell} title={action.description ?? d.fullLabel}>
                <d.icon className={`${ICON_SZ} ${d.color}`} aria-hidden />
                <span className="max-w-[9rem] truncate text-[10px] text-slate-200">
                  {action.effect}
                  {stacks}
                </span>
              </span>,
            );
            break;
          }
          case "buff": {
            const d = displayForEnemyBuff(action.effect);
            chips.push(
              <span key={`bf-${i}`} className={chipShell} title={action.description ?? d.fullLabel}>
                <d.icon className={`${ICON_SZ} ${d.color}`} aria-hidden />
                <span className="max-w-[9rem] truncate text-[10px] text-slate-200">
                  {action.effect} {action.value}
                </span>
              </span>,
            );
            break;
          }
          case "status": {
            const woundish = /\bwound\b|burn| slime| parasite| dazed| injury/i.test(action.effect)
              ? getEffectDisplay("wound")
              : getEffectDisplay("draw");
            chips.push(
              <span key={`st-${i}`} className={chipShell} title={action.description ?? woundish.fullLabel}>
                <woundish.icon className={`${ICON_SZ} ${woundish.color}`} aria-hidden />
                <span className="tabular-nums text-[10px] text-slate-200">
                  {action.effect}×{action.value}
                </span>
                <span className="text-[9px] text-slate-500"> · {statusZoneShort(action.location)}</span>
              </span>,
            );
            break;
          }
          case "cowardly": {
            chips.push(
              <span key={`cw-${i}`} className={chipShell} title={action.description ?? "Escape"}>
                <DoorOpen className={`${ICON_SZ} text-slate-300`} aria-hidden />
                <span className="text-[10px] text-slate-200">Escape</span>
              </span>,
            );
            break;
          }
          case "stunned": {
            chips.push(
              <span key={`stn-${i}`} className={chipShell} title={action.description ?? "Stunned"}>
                <HelpCircle className={`${ICON_SZ} text-violet-300/90`} aria-hidden />
                <span className="tabular-nums text-[10px] text-violet-200/90">{action.value}</span>
              </span>,
            );
            break;
          }
          case "no_action": {
            chips.push(
              <span key={`na-${i}`} className={chipShell} title={action.description ?? "In combat, no intent this beat"}>
                <Minus className={`${ICON_SZ} text-slate-400`} aria-hidden />
                <span className="text-[10px] text-slate-300">No action</span>
              </span>,
            );
            break;
          }
          default: {
            chips.push(
              <span key={`uk-${i}`} className={chipShell} title="Unknown intent piece">
                <AlertCircle className={`${ICON_SZ} text-slate-500`} aria-hidden />
                <span className="font-mono text-[9px] text-slate-500">{JSON.stringify(action)}</span>
              </span>,
            );
          }
        }
        return chips;
      })}
    </span>
  );
}
