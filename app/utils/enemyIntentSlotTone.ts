/** Per-enemy accent for intent rows / target tiles — stable hash from display name (matches Timeline). */
export const ENEMY_INTENT_SLOT_STYLES = [
  { card: "border-rose-500/45 bg-rose-950/20", name: "text-rose-100/95" },
  { card: "border-amber-500/45 bg-amber-950/20", name: "text-amber-100/95" },
  { card: "border-violet-500/45 bg-violet-950/20", name: "text-violet-100/95" },
  { card: "border-teal-500/45 bg-teal-950/20", name: "text-teal-100/95" },
  { card: "border-orange-500/45 bg-orange-950/20", name: "text-orange-100/95" },
  { card: "border-sky-500/45 bg-sky-950/20", name: "text-sky-100/95" },
] as const;

export type EnemyIntentSlotTone = (typeof ENEMY_INTENT_SLOT_STYLES)[number];

export function enemyIntentSlotTone(name: string): EnemyIntentSlotTone {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ENEMY_INTENT_SLOT_STYLES[h % ENEMY_INTENT_SLOT_STYLES.length]!;
}
