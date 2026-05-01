import {
  CombatData,
  PlayerData,
  Card,
  Relic,
  ValueNode,
  Turn,
  TurnRowMigrateInput,
} from '@/app/types/gameTypes';
import { migrateLegacyIntangibleFields } from '@/app/utils/intangibleBuff';

/** Fresh planner-row UUID (works outside secure contexts via fallback). */
export function newPlannerTurnUid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `turn-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Ensures each planner row has a stable unique {@link Turn.uid}; fixes missing / duplicate ids from legacy saves or imports. */
export function migrateTurnRowsWithUids(turns: readonly TurnRowMigrateInput[]): Turn[] {
  const seen = new Set<string>();
  return turns.map((t) => {
    let uid = typeof t.uid === 'string' && t.uid.trim().length > 0 ? t.uid.trim() : '';
    if (!uid || seen.has(uid)) {
      uid = newPlannerTurnUid();
    }
    seen.add(uid);
    return { ...t, uid };
  });
}

/** Short monospace-friendly preview for UI chips (`xxxxxxxx…`). */
export function formatTurnUidShort(uid: string): string {
  const u = uid.trim();
  if (u.length <= 8) return u;
  return `${u.slice(0, 8)}…`;
}

function numericValue(value?: ValueNode): number {
  if (typeof value === 'number') return value;
  if (value && typeof value.base === 'number') return value.base;
  return 0;
}

/**
 * Load game data from a JSON file
 * Useful for loading different combat scenarios
 */
export async function loadFromFile(filePath: string): Promise<CombatData> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${filePath}`);
    }
    const data: CombatData = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading from file:', error);
    throw error;
  }
}

/**
 * Save game data to localStorage
 * Note: Browser localStorage has ~5-10MB limit
 */
export function saveToLocalStorage(key: string, data: any): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
}

/**
 * Load game data from localStorage
 */
export function loadFromLocalStorage(key: string): CombatData | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

/**
 * Export game data as JSON string (for download/external storage)
 */
export function exportGameData(data: CombatData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Import game data from JSON string
 */
export function importGameData(jsonString: string): CombatData {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw error;
  }
}

/**
 * Download game data as a JSON file
 */
export function downloadGameData(data: CombatData, filename: string = 'game-save.json'): void {
  try {
    const jsonString = exportGameData(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading game data:', error);
    throw error;
  }
}

/**
 * Update player health
 */
export function takeDamage(player: PlayerData, damage: number): PlayerData {
  return {
    ...player,
    hp: Math.max(0, player.hp - damage),
  };
}

/**
 * Heal player
 */
export function healPlayer(player: PlayerData, amount: number): PlayerData {
  return {
    ...player,
    hp: Math.min(player.maxHp, player.hp + amount),
  };
}

/**
 * Apply vulnerable modifier to damage
 */
export function applyVulnerable(damage: number, modifiers: PlayerData['modifiers']): number {
  return Math.floor(damage * modifiers.vulnerableMultiplier);
}

/**
 * Apply weak modifier to damage
 */
export function applyWeak(damage: number, modifiers: PlayerData['modifiers']): number {
  return Math.floor(damage * modifiers.weakMultiplier);
}

/**
 * Calculate total damage from all cards in deck with a specific keyword
 */
export function calculateDamageByType(deck: Card[], type: string): number {
  return deck
    .filter((card) => card.name.includes(type))
    .reduce((total, card) => total + numericValue(card.damage), 0);
}

/**
 * Get all cards of a specific type
 */
export function getCardsByType(deck: Card[], type: string): Card[] {
  return deck.filter((card) => card.name.includes(type));
}

/**
 * Add card to deck
 */
export function addCardToDeck(deck: Card[], card: Card): Card[] {
  return [...deck, card];
}

/**
 * Remove card from deck by index
 */
export function removeCardFromDeck(deck: Card[], index: number): Card[] {
  return deck.filter((_, i) => i !== index);
}

/**
 * Add relic to player
 */
export function addRelic(player: PlayerData, relic: Relic): PlayerData {
  return {
    ...player,
    relics: [...player.relics, relic],
  };
}

/**
 * Remove relic by name
 */
export function removeRelic(player: PlayerData, relicName: string): PlayerData {
  return {
    ...player,
    relics: player.relics.filter((r) => r.name !== relicName),
  };
}

/**
 * Get relic by name
 */
export function getRelic(player: PlayerData, relicName: string): Relic | undefined {
  return player.relics.find((r) => r.name === relicName);
}

/**
 * Update energy
 */
export function setEnergy(player: PlayerData, energy: number): PlayerData {
  return {
    ...player,
    energy: {
      ...player.energy,
      base: energy,
    },
  };
}

/**
 * Get total initial energy for a turn
 */
export function getTotalInitialEnergy(player: PlayerData, turn: number): number {
  let total = player.energy.base;
  if (turn === 1) {
    total += player.energy.turn1Bonus;
  }
  // Add energy bonuses from relic effects
  const energyBonus = player.relicEffects
    .filter((effect) => effect.turn === turn && effect.effect.includes('energy'))
    .reduce((sum) => sum + 1, 0);
  return total + energyBonus;
}

export const LANTERN_RELIC_NAME = "Lantern" as const;
/** Energy from toggling Lantern on (current may exceed {@link getPlayerMaxEnergy}, e.g. 4/3). */
export const LANTERN_ENERGY_GIFT = 1;

/**
 * Max energy for the bar / gains: base + other bonuses (Lantern is not a max increase; it only adds to current on toggle when on).
 */
export function getPlayerMaxEnergy(player: PlayerData): number {
  return player.energy.base + (player.bonusEnergy ?? 0);
}

/** If Lantern is active, you cannot turn it off while current energy is below what it added (1). */
export function canTurnOffLantern(player: PlayerData): boolean {
  if (!player.activeRelics?.includes(LANTERN_RELIC_NAME)) return true;
  return (player.currentEnergy ?? 0) >= LANTERN_ENERGY_GIFT;
}

/**
 * Deep clone game data (migrates legacy Intangible flags → buff rows).
 */
export function cloneGameData(data: CombatData): CombatData {
  return migrateLegacyIntangibleFields(JSON.parse(JSON.stringify(data)) as CombatData);
}

/** Deep equality for combat snapshots (used for dirty / unsaved UI checks). */
export function combatSnapshotsEqual(
  a: CombatData | null | undefined,
  b: CombatData | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

/** True when live combat differs from the frozen snapshot on the current planner turn row. */
export function liveCombatDiffersFromPlannerRow(
  gameState: CombatData | null,
  turns: readonly Turn[],
  currentTurnIndex: number,
): boolean {
  if (!gameState || currentTurnIndex < 0 || currentTurnIndex >= turns.length) return false;
  const slotState = turns[currentTurnIndex]?.state;
  if (!slotState) return false;
  return !combatSnapshotsEqual(gameState, slotState);
}

/** `currentTurnIndex` references a real planner row from {@link Turn} list (Turn Maker). */
export function hasValidPlannerTurnSelection(turns: readonly Turn[], currentTurnIndex: number): boolean {
  return turns.length > 0 && currentTurnIndex >= 0 && currentTurnIndex < turns.length;
}

/**
 * Get game statistics
 */
export function getGameStats(gameState: CombatData): {
  totalDamageInDeck: number;
  totalBlockInDeck: number;
  totalRelics: number;
  deckSize: number;
  hpPercent: number;
} {
  const totalDamage = gameState.deck.reduce((sum, card) => sum + numericValue(card.damage), 0);
  const totalBlock = gameState.deck.reduce((sum, card) => sum + numericValue(card.block), 0);
  const hpPercent = (gameState.player.hp / gameState.player.maxHp) * 100;

  return {
    totalDamageInDeck: totalDamage,
    totalBlockInDeck: totalBlock,
    totalRelics: gameState.player.relics.length,
    deckSize: gameState.deck.length,
    hpPercent,
  };
}

/**
 * Reset player to max health
 */
export function resetPlayerHealth(player: PlayerData): PlayerData {
  return {
    ...player,
    hp: player.maxHp,
  };
}

/**
 * Apply damage with modifiers
 */
export function applyDamageWithModifiers(
  player: PlayerData,
  baseDamage: number,
  isVulnerable: boolean = false,
  isWeak: boolean = false
): PlayerData {
  let damage = baseDamage;

  if (isVulnerable) {
    damage = applyVulnerable(damage, player.modifiers);
  }
  if (isWeak) {
    damage = applyWeak(damage, player.modifiers);
  }

  return takeDamage(player, damage);
}
