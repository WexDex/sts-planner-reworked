import type { Card } from '@/app/types/gameTypes';
import raw from '@/app/data/db/POTIONS_DB.json';

export type PotionDbEntry = {
  name: string;
  rarity: string;
  character?: string;
  effect: string;
  tags: string[];
};

function slugPlayableCharacter(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined;
  const u = raw.trim();
  const lower = u.toLowerCase();
  const map: Record<string, string> = {
    ironclad: 'ironclad',
    silent: 'silent',
    defect: 'defect',
    watcher: 'watcher',
  };
  return map[lower] ?? lower;
}

export function getPotionsList(): PotionDbEntry[] {
  return Array.isArray(raw.potions) ? (raw.potions as PotionDbEntry[]) : [];
}

export function getPotionByName(name: string): PotionDbEntry | undefined {
  const q = name.trim();
  if (!q) return undefined;
  return getPotionsList().find((p) => p.name === q);
}

/** Sorted potion names for pickers (gallery, etc.). */
export function listPotionNamesSorted(): string[] {
  return getPotionsList()
    .map((p) => p.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** Uniform sample without replacement; count clamps to available potions. */
export function pickRandomPotionNames(count: number): string[] {
  const all = listPotionNamesSorted();
  if (all.length === 0) return [];
  const n = Math.max(0, Math.min(Math.floor(count), all.length));
  const copy = [...all];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, n);
}

/** Runtime {@link Card} for planner piles — chrome uses {@link cardTypeStyles.Potion} (amber). */
export function buildCardFromPotion(entry: PotionDbEntry): Card {
  const character = slugPlayableCharacter(entry.character);
  return {
    name: entry.name,
    type: 'Potion',
    description: entry.effect,
    rarity: entry.rarity,
    ...(character ? { character } : {}),
    potionTags: [...entry.tags],
  };
}
