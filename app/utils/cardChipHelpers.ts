import stsBundle from "@/app/data/db/STS_CARDS_DB.json";

export type CardEntry = {
  id: string;
  type?: string;
  rarity?: string;
  characters?: string;
  description?: string;
};

export const ALL_CARDS: CardEntry[] = Object.entries((stsBundle as any).cards ?? {})
  .map(([id, data]: [string, any]) => ({
    id,
    type: data.type as string | undefined,
    rarity: data.rarity as string | undefined,
    characters: data.characters as string | undefined,
    description: data.description as string | undefined,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

export const CARD_BY_ID: Map<string, CardEntry> = new Map(ALL_CARDS.map((c) => [c.id, c]));

export function typeChipCls(type?: string): string {
  switch (type?.toLowerCase()) {
    case "attack":  return "border-rose-500/50 bg-rose-950/50 text-rose-300";
    case "skill":   return "border-teal-500/50 bg-teal-950/50 text-teal-300";
    case "power":   return "border-violet-500/50 bg-violet-950/50 text-violet-300";
    default:        return "border-slate-600/50 bg-slate-800/50 text-slate-400";
  }
}

export function charPillCls(characters?: string): string {
  switch (characters?.toLowerCase()) {
    case "ironclad":  return "border-rose-900/50 text-rose-400";
    case "silent":    return "border-teal-900/50 text-teal-400";
    case "defect":    return "border-blue-900/50 text-blue-400";
    case "watcher":   return "border-purple-900/50 text-purple-400";
    case "colorless": return "border-slate-700/50 text-slate-400";
    case "status":    return "border-amber-900/50 text-amber-400";
    case "curse":     return "border-indigo-900/50 text-indigo-400";
    default:          return "border-slate-800/50 text-slate-500";
  }
}
