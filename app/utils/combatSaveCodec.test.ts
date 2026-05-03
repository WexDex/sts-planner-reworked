import { describe, expect, it } from 'vitest';
import type { CombatData, DecisionNode, Turn } from '@/app/types/gameTypes';
import {
  combatDataFromSaveable,
  combatDataToSaveable,
  decodePlannerWorkflowFromPersist,
  encodePlannerWorkflowForPersist,
} from '@/app/utils/combatSaveCodec';

function makeCombatData(): CombatData {
  return {
    player: {
      hp: 70,
      maxHp: 80,
      energy: { base: 3, turn1Bonus: 1 },
      currentEnergy: 3,
      characters: 'ironclad',
      combatType: 'Elite',
      combatName: 'Test',
      floor: 12,
      drawPerTurn: 5,
      modifiers: { vulnerableMultiplier: 1.75, weakMultiplier: 0.75 },
      relics: [],
      relicEffects: [],
    },
    deck: [
      { name: 'Strike_R', isUpgraded: false },
      { name: 'Bash', isUpgraded: true, isChanged: true },
    ],
    draw: [{ name: 'Defend_R', isUpgraded: true }],
    discard: [{ name: 'Cleave' }],
    exhaust: [],
    hand: [{ name: 'Modded Card', isSelected: true, customField: 42 }],
    playedCards: [],
    activityLog: [],
  };
}

function makeNode(id: string, parentId: string | null, snapshot: CombatData, slotId: number): DecisionNode {
  return {
    id,
    parentId,
    label: id,
    snapshot,
    plannerTurnSlotId: slotId,
    turnPhase: 'start',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('combatSaveCodec', () => {
  it('round-trips saveable cards across deck and piles', () => {
    const runtime = makeCombatData();

    const persisted = combatDataToSaveable(runtime);
    expect(persisted.deck[0]?.card_ID).toBe('Strike');
    expect(persisted.deck[0]?.isUpgraded).toBe(false);
    expect(persisted.deck[1]?.isUpgraded).toBe(true);
    expect((persisted.deck[1] as { isChanged?: boolean }).isChanged).toBeUndefined();
    expect(persisted.draw[0]?.card_ID).toBe('Defend');
    expect(persisted.draw[0]?.isUpgraded).toBe(true);
    expect(persisted.hand[0]?.card_ID).toBe('Modded Card');
    expect(persisted.hand[0]?.__embeddedCard?.name).toBe('Modded Card');
    expect((persisted.hand[0]?.__embeddedCard as { isSelected?: boolean })?.isSelected).toBeUndefined();

    const hydrated = combatDataFromSaveable(persisted);
    expect(hydrated.deck[0]?.name).toBe('Strike_R');
    expect(hydrated.deck[1]?.isUpgraded).toBe(true);
    expect(hydrated.deck[1]?.isChanged).toBe(false);
    expect(hydrated.hand[0]?.name).toBe('Modded Card');
    expect(hydrated.hand[0]?.isSelected).toBe(false);
  });

  it('deduplicates decision snapshots against planner row state', () => {
    const turn1State = makeCombatData();
    const turn2State = {
      ...makeCombatData(),
      player: { ...makeCombatData().player, hp: 65 },
    };
    const turns: Turn[] = [
      { id: 1, uid: 'turn-1', state: turn1State },
      { id: 2, uid: 'turn-2', state: turn2State },
    ];
    const nodes: DecisionNode[] = [
      makeNode('root', null, turn1State, 1),
      makeNode('branch', 'root', { ...turn2State, player: { ...turn2State.player, hp: 61 } }, 2),
    ];

    const encoded = encodePlannerWorkflowForPersist({
      turns,
      currentTurnIndex: 0,
      turnPhase: 'start',
      decisionNodes: nodes,
      activeDecisionNodeId: 'root',
      decisionTimelinePositions: {},
    });

    expect(encoded.decisionNodes?.[0]?.snapshotRef?.turnUid).toBe('turn-1');
    expect(encoded.decisionNodes?.[0]?.snapshot).toBeUndefined();
    expect(encoded.decisionNodes?.[1]?.snapshot).toBeDefined();

    const decoded = decodePlannerWorkflowFromPersist(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.decisionNodes?.[0]?.snapshot.player.hp).toBe(turn1State.player.hp);
    expect(decoded?.decisionNodes?.[1]?.snapshot.player.hp).toBe(61);
  });
});
