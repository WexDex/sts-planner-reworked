"use client";

import type { ReactNode } from "react";
import type { EnemyIntentAction, EnemyIntentStatusLocation } from "@/app/types/gameTypes";
import { IntentIconGlyph } from "@/app/components/UI/IntentIconGlyph";
import { getSingleAttackDamage } from "@/app/utils/enemyIntentActionHelpers";
import type { EffectType } from "@/app/utils/effectDisplay";
import { getEffectDisplay } from "@/app/utils/effectDisplay";
import {
  applyIncomingEnemyAttackDamage,
  type IncomingDamageContext,
} from "@/app/utils/intentFormat";

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

/** Map free-text enemy debuff labels to tooltip copy used on cards. */
function debuffTitle(effect: string): string {
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
    if (re.test(t)) return getEffectDisplay(ty).fullLabel;
  }
  return effect;
}

/** Self-buffs on enemies — tooltip line. */
function buffTitle(effect: string): string {
  const t = effect.trim().toLowerCase();
  if (/block|armor| plating/i.test(t)) return getEffectDisplay("block").fullLabel;
  if (/artifact/i.test(t)) return getEffectDisplay("focus").fullLabel;
  if (/metal| plating| curl/i.test(t)) return getEffectDisplay("block").fullLabel;
  if (/str| strength| empowered| rage/i.test(t)) return getEffectDisplay("strength_buff").fullLabel;
  return getEffectDisplay("strength_buff").fullLabel;
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

        const iconCls = "h-3.5 w-3.5 shrink-0";

        switch (action.type) {
          case "attack": {
            const base = getSingleAttackDamage(action);
            const mod = applyIncomingEnemyAttackDamage(base, ctx);
            const dmgMeta = getEffectDisplay("damage");
            chips.push(
              <span key={`a-${i}`} className={`${chipShell} text-rose-300/90`} title={dmgMeta.fullLabel}>
                <IntentIconGlyph type="attack" className={iconCls} strokeWidth={1.75} />
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
            const dmgMeta = getEffectDisplay("damage");
            chips.push(
              <span key={`ma-${i}`} className={`${chipShell} text-orange-300/90`} title={dmgMeta.fullLabel}>
                <IntentIconGlyph type="multi_attack" className={iconCls} strokeWidth={1.75} />
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
              <span key={`b-${i}`} className={`${chipShell} text-sky-300/90`} title={bd.fullLabel}>
                <IntentIconGlyph type="block" className={iconCls} strokeWidth={1.75} />
                <span className="tabular-nums text-[10px] text-slate-100">{action.amount}</span>
              </span>,
            );
            break;
          }
          case "debuff": {
            const stacks = debuffStacksLabel(action.value);
            const title = action.description ?? debuffTitle(action.effect);
            chips.push(
              <span key={`db-${i}`} className={`${chipShell} text-violet-300/90`} title={title}>
                <IntentIconGlyph type="debuff" className={iconCls} strokeWidth={1.75} />
                <span className="max-w-[9rem] truncate text-[10px] text-slate-200">
                  {action.effect}
                  {stacks}
                </span>
              </span>,
            );
            break;
          }
          case "buff": {
            const title = action.description ?? buffTitle(action.effect);
            chips.push(
              <span key={`bf-${i}`} className={`${chipShell} text-emerald-300/90`} title={title}>
                <IntentIconGlyph type="buff" className={iconCls} strokeWidth={1.75} />
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
              <span key={`st-${i}`} className={`${chipShell} text-cyan-300/90`} title={action.description ?? woundish.fullLabel}>
                <IntentIconGlyph type="status" className={iconCls} strokeWidth={1.75} />
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
              <span key={`cw-${i}`} className={`${chipShell} text-amber-300/90`} title={action.description ?? "Escape"}>
                <IntentIconGlyph type="cowardly" className={iconCls} strokeWidth={1.75} />
                <span className="text-[10px] text-slate-200">Escape</span>
              </span>,
            );
            break;
          }
          case "stunned": {
            chips.push(
              <span key={`stn-${i}`} className={`${chipShell} text-indigo-300/90`} title={action.description ?? "Stunned"}>
                <IntentIconGlyph type="stunned" className={iconCls} strokeWidth={1.75} />
                <span className="tabular-nums text-[10px] text-violet-200/90">{action.value}</span>
              </span>,
            );
            break;
          }
          case "no_action": {
            chips.push(
              <span key={`na-${i}`} className={`${chipShell} text-slate-400/80`} title={action.description ?? "In combat, no intent this beat"}>
                <IntentIconGlyph type="no_action" className={iconCls} strokeWidth={1.75} />
                <span className="text-[10px] text-slate-300">No action</span>
              </span>,
            );
            break;
          }
          default: {
            chips.push(
              <span key={`uk-${i}`} className={chipShell} title="Unknown intent piece">
                <span className="h-3.5 w-3.5 shrink-0 font-mono text-[10px] text-slate-500" aria-hidden>?</span>
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
