import { getStsCardsRecord } from '@/app/card-design-gallery/stsRecord';
import {
  buildGameCardFromStsRaw,
  playableCharacterSlug,
  resolveStrikeDefendDatabaseId,
} from '@/app/data/gameCardFromSts';
import type {
  Card,
  CardReference,
  CombatData,
  CombatTurnPhase,
  DecisionNode,
  Turn,
} from '@/app/types/gameTypes';
import { cloneGameData, combatSnapshotsEqual, migrateTurnRowsWithUids } from '@/app/utils/gameHelpers';
import { migrateLegacyIntangibleFields } from '@/app/utils/intangibleBuff';

export const PLANNER_PERSIST_SCHEMA_VERSION = 2 as const;

/** Never persisted — transient UI / editor flags restored at runtime. */
const TRANSIENT_CARD_UI_KEYS = ['isSelected', 'isChanged'] as const;

type DecisionTimelinePositionMap = Record<string, { x: number; y: number }>;

export type PlannerWorkflowRuntime = {
  turns: Turn[];
  currentTurnIndex: number;
  turnPhase: CombatTurnPhase | string;
  decisionNodes?: DecisionNode[];
  activeDecisionNodeId?: string | null;
  decisionTimelinePositions?: DecisionTimelinePositionMap;
  exportedAt?: string;
};

type SaveableCardReference = CardReference & {
  __embeddedCard?: Card;
};

type SaveableCardEntry = SaveableCardReference;

type SaveableCombatData = Omit<
  CombatData,
  'deck' | 'draw' | 'discard' | 'exhaust' | 'hand' | 'playedCards'
> & {
  deck: SaveableCardEntry[];
  draw: SaveableCardEntry[];
  discard: SaveableCardEntry[];
  exhaust: SaveableCardEntry[];
  hand: SaveableCardEntry[];
  playedCards: SaveableCardEntry[];
};

type SaveableTurn = Omit<Turn, 'state'> & { state: SaveableCombatData };

type SaveableDecisionNode = Omit<DecisionNode, 'snapshot'> & {
  snapshot?: SaveableCombatData;
  snapshotRef?: {
    kind: 'planner_row';
    turnUid: string;
  };
};

export type PlannerWorkflowPersistV2 = Omit<PlannerWorkflowRuntime, 'turns' | 'decisionNodes'> & {
  persistSchemaVersion: typeof PLANNER_PERSIST_SCHEMA_VERSION;
  turns: SaveableTurn[];
  decisionNodes?: SaveableDecisionNode[];
};

function isRecord(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function capitalizeStsWord(word: string): string {
  if (!word) return word;
  const lower = word.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function toGenericStrikeDefendId(cardId: string): string {
  const trimmed = cardId.trim();
  const variant = trimmed.match(/^(strike|defend)_([RGBP])$/i);
  if (!variant) return trimmed;
  return capitalizeStsWord(variant[1]);
}

function normalizeCardRuntimeFlags(card: Card): Card {
  return {
    ...card,
    isChanged: card.isChanged ?? false,
    isSelected: card.isSelected ?? false,
  };
}

function stripTransientCardUiForPersist(card: Card): Card {
  const next = { ...card };
  for (const k of TRANSIENT_CARD_UI_KEYS) {
    delete (next as Record<string, unknown>)[k];
  }
  return next;
}

function omitTransientFromReferenceFields(fields: Record<string, unknown>): Record<string, unknown> {
  const out = { ...fields };
  for (const k of TRANSIENT_CARD_UI_KEYS) {
    delete out[k];
  }
  return out;
}

function serializeCardEntry(entry: Card | CardReference, playerCharacters?: string): SaveableCardEntry {
  if ('card_ID' in entry) {
    const ref = entry as CardReference;
    return {
      card_ID: toGenericStrikeDefendId(ref.card_ID),
      isUpgraded: ref.isUpgraded ?? false,
    };
  }

  const card = entry as Card;
  const cardId = toGenericStrikeDefendId(typeof card.name === 'string' ? card.name : 'Unknown Card');
  const resolvedId = resolveStrikeDefendDatabaseId(cardId, playerCharacters);
  const raw = getStsCardsRecord()[resolvedId] ?? getStsCardsRecord()[cardId];
  if (!raw) {
    return {
      card_ID: cardId,
      __embeddedCard: stripTransientCardUiForPersist(card),
    };
  }

  const baseCard = buildGameCardFromStsRaw(resolvedId, raw as Record<string, unknown>, {
    isUpgraded: card.isUpgraded ?? false,
  });
  const compact: SaveableCardEntry = {
    card_ID: cardId,
    isUpgraded: card.isUpgraded ?? false,
  };
  for (const [k, v] of Object.entries(card)) {
    if (k === 'name' || k === 'isUpgraded') continue;
    if ((TRANSIENT_CARD_UI_KEYS as readonly string[]).includes(k)) continue;
    const baseValue = (baseCard as Record<string, unknown>)[k];
    if (JSON.stringify(v) !== JSON.stringify(baseValue)) {
      (compact as Record<string, unknown>)[k] = v;
    }
  }
  return compact;
}

function deserializeCardEntry(entry: unknown, playerCharacters?: string): Card {
  if (!isRecord(entry)) {
    return normalizeCardRuntimeFlags({ name: 'Unknown Card' });
  }
  if (!('card_ID' in entry) || typeof entry.card_ID !== 'string') {
    return normalizeCardRuntimeFlags(entry as Card);
  }

  const { card_ID, __embeddedCard, ...referenceFieldsRest } = entry as SaveableCardEntry;
  const referenceFields = omitTransientFromReferenceFields(referenceFieldsRest as Record<string, unknown>) as Card;

  if (__embeddedCard && isRecord(__embeddedCard)) {
    const cleanedEmbed = stripTransientCardUiForPersist(__embeddedCard as Card);
    return normalizeCardRuntimeFlags(
      Object.assign({}, cleanedEmbed, referenceFields as Card),
    );
  }

  const resolvedId = resolveStrikeDefendDatabaseId(card_ID, playerCharacters);
  const raw = getStsCardsRecord()[resolvedId] ?? getStsCardsRecord()[card_ID];
  if (!raw) {
    return normalizeCardRuntimeFlags(
      Object.assign({ name: resolvedId }, referenceFields as Card),
    );
  }
  const baseCard = buildGameCardFromStsRaw(resolvedId, raw as Record<string, unknown>, {
    isUpgraded: typeof referenceFields.isUpgraded === 'boolean' ? referenceFields.isUpgraded : false,
  });
  return normalizeCardRuntimeFlags(
    Object.assign(baseCard, referenceFields as Card, { name: resolvedId }),
  );
}

function mapCardZoneToSaveable(
  zone: Array<Card | CardReference>,
  playerCharacters?: string,
): SaveableCardEntry[] {
  return zone.map((entry) => serializeCardEntry(entry, playerCharacters));
}

function mapCardZoneToRuntime(zone: unknown, playerCharacters?: string): Card[] {
  if (!Array.isArray(zone)) return [];
  return zone.map((entry) => deserializeCardEntry(entry, playerCharacters));
}

export function combatDataToSaveable(data: CombatData): SaveableCombatData {
  const playerCharacters = playableCharacterSlug(data.player);
  return {
    ...data,
    deck: mapCardZoneToSaveable(data.deck, playerCharacters),
    draw: mapCardZoneToSaveable(data.draw, playerCharacters),
    discard: mapCardZoneToSaveable(data.discard, playerCharacters),
    exhaust: mapCardZoneToSaveable(data.exhaust, playerCharacters),
    hand: mapCardZoneToSaveable(data.hand, playerCharacters),
    playedCards: mapCardZoneToSaveable(data.playedCards, playerCharacters),
  };
}

export function combatDataFromSaveable(data: unknown): CombatData {
  const fallback: CombatData = {
    player: {
      hp: 0,
      maxHp: 0,
      energy: { base: 0, turn1Bonus: 0 },
      combatType: '',
      combatName: '',
      floor: 0,
      drawPerTurn: 0,
      modifiers: { vulnerableMultiplier: 1.5, weakMultiplier: 0.75 },
      relics: [],
      relicEffects: [],
    },
    deck: [],
    draw: [],
    discard: [],
    exhaust: [],
    hand: [],
    playedCards: [],
    activityLog: [],
  };
  if (!isRecord(data)) return fallback;

  const migrated = migrateLegacyIntangibleFields(data as CombatData);
  const playerCharacters = playableCharacterSlug(migrated.player);
  return {
    ...migrated,
    deck: mapCardZoneToRuntime(migrated.deck, playerCharacters),
    draw: mapCardZoneToRuntime(migrated.draw, playerCharacters),
    discard: mapCardZoneToRuntime(migrated.discard, playerCharacters),
    exhaust: mapCardZoneToRuntime(migrated.exhaust, playerCharacters),
    hand: mapCardZoneToRuntime(migrated.hand, playerCharacters),
    playedCards: mapCardZoneToRuntime(migrated.playedCards, playerCharacters),
  };
}

function decodePlannerTurns(input: unknown): Turn[] | null {
  if (!Array.isArray(input)) return null;
  const decoded: Turn[] = [];
  for (const rawTurn of input) {
    if (!isRecord(rawTurn) || typeof rawTurn.id !== 'number') return null;
    decoded.push({
      id: rawTurn.id,
      uid: typeof rawTurn.uid === 'string' ? rawTurn.uid : '',
      state: combatDataFromSaveable(rawTurn.state),
    });
  }
  return migrateTurnRowsWithUids(decoded);
}

function decodePlannerDecisionNodes(input: unknown, turns: Turn[]): DecisionNode[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const byTurnUid = new Map(turns.map((t) => [t.uid, t] as const));
  const decoded: DecisionNode[] = [];
  for (const rawNode of input) {
    if (
      !isRecord(rawNode) ||
      typeof rawNode.id !== 'string' ||
      typeof rawNode.parentId !== 'string' && rawNode.parentId !== null ||
      typeof rawNode.plannerTurnSlotId !== 'number'
    ) {
      continue;
    }

    let snapshot: CombatData | null = null;
    if (isRecord(rawNode.snapshotRef) && rawNode.snapshotRef.kind === 'planner_row' && typeof rawNode.snapshotRef.turnUid === 'string') {
      const referenced = byTurnUid.get(rawNode.snapshotRef.turnUid);
      if (referenced) {
        snapshot = cloneGameData(referenced.state);
      }
    }
    if (!snapshot && rawNode.snapshot !== undefined) {
      snapshot = combatDataFromSaveable(rawNode.snapshot);
    }
    if (!snapshot) continue;

    decoded.push({
      ...(rawNode as Omit<DecisionNode, 'snapshot'>),
      snapshot,
    });
  }
  return decoded;
}

export function encodePlannerWorkflowForPersist(runtime: PlannerWorkflowRuntime): PlannerWorkflowPersistV2 {
  const saveableTurns: SaveableTurn[] = runtime.turns.map((turn) => ({
    ...turn,
    state: combatDataToSaveable(turn.state),
  }));

  const turnBySlot = new Map(runtime.turns.map((turn) => [turn.id, turn] as const));
  const saveableNodes = runtime.decisionNodes?.map((node): SaveableDecisionNode => {
    const { snapshot, ...nodeWithoutSnapshot } = node;
    const baseNode: SaveableDecisionNode = { ...nodeWithoutSnapshot };
    const matchingTurn = turnBySlot.get(node.plannerTurnSlotId);
    if (matchingTurn && combatSnapshotsEqual(matchingTurn.state, snapshot)) {
      baseNode.snapshotRef = {
        kind: 'planner_row',
        turnUid: matchingTurn.uid,
      };
      return baseNode;
    }
    baseNode.snapshot = combatDataToSaveable(snapshot);
    return baseNode;
  });

  return {
    persistSchemaVersion: PLANNER_PERSIST_SCHEMA_VERSION,
    turns: saveableTurns,
    currentTurnIndex: runtime.currentTurnIndex,
    turnPhase: runtime.turnPhase,
    decisionNodes: saveableNodes,
    activeDecisionNodeId: runtime.activeDecisionNodeId,
    decisionTimelinePositions: runtime.decisionTimelinePositions,
    exportedAt: runtime.exportedAt,
  };
}

export function decodePlannerWorkflowFromPersist(input: unknown): PlannerWorkflowRuntime | null {
  if (!isRecord(input)) return null;
  if (!Array.isArray(input.turns) || typeof input.currentTurnIndex !== 'number' || typeof input.turnPhase !== 'string') {
    return null;
  }

  const decodedTurns = decodePlannerTurns(input.turns);
  if (!decodedTurns) return null;

  const decisionNodes = decodePlannerDecisionNodes(input.decisionNodes, decodedTurns);
  return {
    turns: decodedTurns,
    currentTurnIndex: input.currentTurnIndex,
    turnPhase: input.turnPhase,
    decisionNodes,
    activeDecisionNodeId:
      typeof input.activeDecisionNodeId === 'string' || input.activeDecisionNodeId === null
        ? input.activeDecisionNodeId
        : null,
    decisionTimelinePositions:
      isRecord(input.decisionTimelinePositions)
        ? (input.decisionTimelinePositions as DecisionTimelinePositionMap)
        : {},
    exportedAt: typeof input.exportedAt === 'string' ? input.exportedAt : undefined,
  };
}
