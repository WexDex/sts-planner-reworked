'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  CombatData,
  Card,
  CardReference,
  ActivityLogEntry,
  Turn,
  CombatTurnPhase,
  DecisionNode,
  Enemy,
} from '@/app/types/gameTypes';
import {
  loadFromFile,
  cloneGameData,
  combatSnapshotsEqual,
  saveToLocalStorage,
  loadFromLocalStorage,
  LANTERN_RELIC_NAME,
  LANTERN_ENERGY_GIFT,
  migrateTurnRowsWithUids,
  newPlannerTurnUid,
} from '@/app/utils/gameHelpers';
import {
  buildProjectSaveFileV1,
  clearLastProjectFromLocalStorage,
  loadLastProjectFromLocalStorage,
  normalizeToProjectV1,
  parseProjectJsonString,
  saveLastProjectToLocalStorage,
  newProjectMeta,
  type PlannerWorkflowSaveShape,
  type ProjectMeta,
} from '@/app/utils/projectSave';
import {
  buildActionLogEntry,
  createActivityLogEntry,
  formatCardNames,
  formatPileLabel,
  buildDamageLogEntry,
  buildHealLogEntry,
  buildBlockLogEntry,
  buildBlockLostLogEntry,
  buildEnergyLogEntry,
  buildBuffLogEntry,
  buildDebuffLogEntry,
  buildDebuffRemovedLogEntry,
  formatPlayCardTargets,
} from '@/app/utils/activityLogger';
import {
  buildGameCardFromStsRaw,
  gameCardFromDatabaseId,
  playableCharacterSlug,
  resolveStrikeDefendDatabaseId,
  stsTierDescriptionPatch,
} from '@/app/data/gameCardFromSts';
import { getStsCardsRecord } from '@/app/card-design-gallery/stsRecord';
import { toast } from '@/app/utils/toast';
import {
  activeDecisionCheckpointSnapshotFromPlanner,
  buildTurnStatesFromBranchPath,
  decisionNodeDepthFromRoot,
  defaultForkDecisionLabel,
  eligibleDecisionReparentParents,
  effectivePlannerTurnSlotId,
  getDecisionPathFromRoot,
  isValidDecisionReparent,
  normalizeDecisionNodePlannerSlots,
  migrateDecisionCheckpointLabelsToTurnSlugs,
  getForcedMainTimelineLeafFromStart,
  isApplyDecisionBranchToPlannerSynced as checkApplyDecisionBranchToPlannerSynced,
  pinActiveAlongUniqueChildChainFromNode,
} from '@/app/utils/decisionTreeHelpers';
import {
  buildImportedDecisionTimelineSpine,
  migrateDecisionNodeTimelineRoles,
} from '@/app/utils/decisionTimelineSpine';
import {
  ensureDecisionNodesTimelineAccents,
  normalizeDecisionTimelineAccentHex,
  pickDistinctTimelineAccentHex,
} from '@/app/utils/decisionTimelineAccent';

export type DecisionTimelinePositionMap = Record<string, { x: number; y: number }>;

import {
  decrementIntangibleStacks,
  entityHasIntangible,
  INTANGIBLE_BUFF_DESCRIPTION,
  INTANGIBLE_BUFF_NAME,
  migrateLegacyIntangibleFields,
} from '@/app/utils/intangibleBuff';
import { isEnemyTargetableInPlannerTurn } from '@/app/utils/enemyPlannerTurn';

function cloneEnemyArrayDeep(enemies: Enemy[]): Enemy[] {
  return JSON.parse(JSON.stringify(enemies)) as Enemy[];
}

interface GameContextType {
  gameState: CombatData | null;
  turns: Turn[];
  currentTurnIndex: number;
  /** Start → main (play cards) → enemy within the active planner turn. */
  turnPhase: CombatTurnPhase;
  setCurrentTurn: (turnId: number) => void;
  /** Persist live {@link gameState} into {@link turns}[{@link currentTurnIndex}] (e.g. before opening modals). */
  saveCurrentTurn: () => void;
  /** Player finished their turn: logs, saves, switches to enemy phase (same planner turn). */
  endPlayerTurn: () => void;
  /** Log start-of-turn (relic / draw / ST) and enter main phase. */
  beginTurn: () => void;
  /** Enemy phase finished: logs, saves, advances to the next planner turn (start phase). */
  endEnemyTurn: () => void;
  continueFromTurn: (fromTurnId: number, toTurnId: number) => void;
  resetCurrentTurn: () => void;
  isLoading: boolean;
  error: string | null;
  updateGameState: (newState: Partial<CombatData>) => void;
  /** Push enemy intent scripts to live combat and every planner-slot / decision snapshot (Turn Maker). */
  syncEnemyIntentsGlobally: (enemies: Enemy[]) => void;
  resetGameState: () => void;
  loadGameData: (filePath: string) => Promise<void>;
  loadGameDataFromJson: (data: CombatData) => Promise<void>;
  saveGameData: (key?: string) => void;
  /** Download the same planner snapshot {@link saveGameData} writes to storage, as a `.json` file. */
  downloadPlannerSaveJson: () => void;
  loadSavedGame: (key?: string) => boolean;
  /** Current named project session (Save/Load Project). Null after close or raw combat-only load. */
  activeProject: ProjectMeta | null;
  /** Prompt for name, download `.json`, persist to last-project storage. */
  saveProject: () => void;
  /** Parse full project or legacy planner export; restores workflow and sets active project. */
  loadProjectFromJsonText: (text: string) => boolean;
  /** Clear planner state and last-project storage (confirm in UI). */
  closeProject: () => void;
  toggleRelic: (relicName: string) => void;
  toggleCardSelection: (location: string, index: number) => void;
  playSelectedCards: () => void;
  moveSelectedCards: (toLocation: string) => void;
  removeSelectedCards: () => void;
  spendEnergyOnSelected: () => void;
  deselectAllCards: () => void;
  addToActivityLog: (entry: ActivityLogEntry | string) => void;
  drawCards: (amount: number) => void;
  upgradeSelected: () => void;
  downgradeSelected: () => void;
  duplicateSelected: () => void;
  setSelectedCostZero: () => void;
  setSelectedCustomCost: () => void;
  transformSelectedType: () => void;
  toggleChangedSelected: () => void;
  /** Replace selected card(s) with a card from the database; sets isChanged. */
  transformSelectedFromDatabase: (cardId: string, isUpgraded?: boolean) => void;
  addCardFromDB: (cardId: string | string[], location: string, isUpgraded?: boolean) => void;
  modifyPlayerHp: (delta: number) => void;
  modifyPlayerBlock: (delta: number) => void;
  modifyPlayerEnergy: (delta: number) => void;
  modifyEnemyHp: (enemyIndex: number, delta: number) => void;
  modifyEnemyBlock: (enemyIndex: number, delta: number) => void;
  addBuffDebuff: (target: 'player' | 'enemy', enemyIndex: number, name: string, type: 'buff' | 'debuff', stacks: number, description?: string) => void;
  removeBuffDebuff: (target: 'player' | 'enemy', enemyIndex: number, name: string) => void;
  reduceBuffDebuff: (target: 'player' | 'enemy', enemyIndex: number, name: string) => void;
  updateBuffDebuffStacks: (target: 'player' | 'enemy', enemyIndex: number, name: string, stacks: number) => void;
  /** Card-play targeting (main field): enemy indices + optional self — included in "Played cards" log when set. */
  combatTargetMode: 'single' | 'multi';
  setCombatTargetMode: (mode: 'single' | 'multi') => void;
  combatTargetEnemyIndices: number[];
  toggleCombatEnemyTarget: (enemyIndex: number) => void;
  combatTargetSelf: boolean;
  toggleCombatTargetSelf: () => void;
  clearCombatTargets: () => void;

  /** Branching decision overlay (full snapshots per node). */
  decisionNodes: DecisionNode[];
  activeDecisionNodeId: string | null;
  /**
   * Adds a child under `forkParentCheckpointId`, or under {@link activeDecisionNodeId} when omitted/null.
   * Copies that checkpoint’s snapshot (live combat when it is active) and appends `Copied from "<id>"` to the new branch log.
   * Returns the new child node id, or null on failure.
   */
  forkDecisionBranch: (label?: string, forkParentCheckpointId?: string | null) => string | null;
  /** Restore combat + planner slot from a node’s snapshot (autosaves prior active node). */
  jumpToDecisionNode: (nodeId: string) => void;
  /**
   * Copy live planner combat (`gameState`) into the active decision node (when set) and **persist**
   * the current planner turn row (`turns[currentTurnIndex]`) so slot snapshots stay aligned — use when
   * opening Decision Timeline or the turn timeline panel after editing on the main board.
   */
  syncActiveDecisionNodeFromPlanner: () => void;
  /** Remove a node and all descendants (cannot delete root). */
  deleteDecisionBranch: (nodeId: string) => void;
  updateDecisionNodeLabel: (nodeId: string, label: string) => void;
  /** Per-node accent (`#RRGGBB`) for left timeline stripe + minimap when set. */
  updateDecisionNodeTimelineAccent: (nodeId: string, hex: string) => void;
  /** Pin active node to the deterministic main chain from START (checkpoint-first at forks); refreshes planner sync hint. */
  forceActiveDecisionTimelineMainChain: () => void;
  decisionTimelinePositions: DecisionTimelinePositionMap;
  setDecisionTimelineNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  /** Merge many timeline positions in one update (e.g. scatter layout). */
  mergeDecisionTimelinePositions: (patch: DecisionTimelinePositionMap) => void;
  /** True when apply would not change planner / active pin / live combat for this branch target. */
  isApplyDecisionBranchToPlannerSynced: (targetNodeId: string | null) => boolean;
  /** Hydrate planner turn rows from root→node path; set active node + live combat to target. */
  applyDecisionBranchToPlanner: (nodeId: string) => void;
  /** Point an existing node's parent at another node (keeps START as root); no cycles. */
  linkDecisionTimelineParent: (nodeId: string, newParentId: string) => void;
  /** Detach branch from parent (parentId → null — orphan until relinked). Not allowed for START. */
  unlinkDecisionTimelineBranch: (nodeId: string) => void;
  /** Set planner phase marker on a turn checkpoint; writes a row to that node's snapshot log (and live log if active). */
  updateDecisionNodeTurnPhase: (nodeId: string, phase: CombatTurnPhase) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DEFAULT_SAVE_KEY = 'sts_game_save';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<CombatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<CombatData | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const currentTurnIndexRef = useRef(0);
  currentTurnIndexRef.current = currentTurnIndex;
  const [turnPhase, setTurnPhase] = useState<CombatTurnPhase>('start');
  const [decisionNodes, setDecisionNodes] = useState<DecisionNode[]>([]);
  const turnsRef = useRef<Turn[]>([]);
  const decisionNodesRef = useRef<DecisionNode[]>([]);
  turnsRef.current = turns;
  decisionNodesRef.current = decisionNodes;
  /** Holds latest planner↔timeline sync impl so the sync effect avoids unstable deps (`turns` churn); reads refs inside sync. */
  const syncActiveDecisionNodeFromPlannerRef = useRef<() => void>(() => {});
  const [activeDecisionNodeId, setActiveDecisionNodeId] = useState<string | null>(null);
  const [decisionTimelinePositions, setDecisionTimelinePositions] = useState<DecisionTimelinePositionMap>({});
  const [combatTargetMode, setCombatTargetModeState] = useState<'single' | 'multi'>('single');
  const [combatTargetEnemyIndices, setCombatTargetEnemyIndices] = useState<number[]>([]);
  const [combatTargetSelf, setCombatTargetSelf] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectMeta | null>(null);

  const normalizeRelicEffects = (data: CombatData): CombatData => ({
    ...data,
    player: {
      ...data.player,
      relicEffects:
        data.player.relicEffects?.map((effect) => ({
          ...effect,
          enabled: effect.enabled ?? true,
        })) ?? [],
    },
  });

  const normalizeCard = (card: Card): Card => ({
    ...card,
    isChanged: card.isChanged ?? false,
    isSelected: card.isSelected ?? false,
  });

  const hydrateCardEntry = (
    entry: Card | CardReference,
    playerCharacters?: string,
  ): Card => {
    if ('card_ID' in entry) {
      const { card_ID, ...referenceFields } = entry;
      const ref = referenceFields as CardReference;
      const resolvedId = resolveStrikeDefendDatabaseId(card_ID, playerCharacters);
      const raw =
        getStsCardsRecord()[resolvedId] ?? getStsCardsRecord()[card_ID];
      if (!raw) {
        return Object.assign({ name: resolvedId }, referenceFields as Card);
      }
      const baseCard = buildGameCardFromStsRaw(resolvedId, raw as Record<string, unknown>, {
        isUpgraded: ref.isUpgraded ?? false,
      });
      return Object.assign(baseCard, referenceFields as Card, { name: resolvedId });
    }
    return entry;
  };

  const hydrateCombatData = (data: CombatData): CombatData => {
    const migrated = migrateLegacyIntangibleFields(data);
    const playerCharacters = playableCharacterSlug(migrated.player);
    return {
      ...migrated,
      deck: migrated.deck.map((entry) => hydrateCardEntry(entry, playerCharacters)),
    };
  };

  const ingestCombatPayload = async (data: CombatData) => {
    try {
      setIsLoading(true);
      clearLastProjectFromLocalStorage();
      setActiveProject(null);
      const normalizedData = normalizeRelicEffects(data);
      const hydratedData = hydrateCombatData(normalizedData);
      const withPiles = {
        ...hydratedData,
        draw: (hydratedData.deck as Card[]).map(normalizeCard),
        discard: [],
        exhaust: [],
        hand: [],
        playedCards: [],
        activityLog: [],
        player: {
          ...hydratedData.player,
          currentEnergy: hydratedData.player.energy.base,
        },
      };
      setInitialData(cloneGameData(withPiles));

      const turnNumbers = new Set<number>();
      withPiles.enemies?.forEach((enemy) =>
        enemy.intents?.forEach((intent) => turnNumbers.add(intent.turn)),
      );
      const uniqueTurns = Array.from(turnNumbers).sort((a, b) => a - b);
      const initialTurns = migrateTurnRowsWithUids(
        uniqueTurns.map((id) => ({ id, state: cloneGameData(withPiles) })),
      );
      setTurns(initialTurns);
      setCurrentTurnIndex(0);
      setTurnPhase('start');

      const spine = buildImportedDecisionTimelineSpine(initialTurns, withPiles, () => crypto.randomUUID());
      setDecisionNodes(normalizeDecisionNodePlannerSlots(spine.nodes, initialTurns));
      setActiveDecisionNodeId(spine.activeNodeId);
      setDecisionTimelinePositions({});

      setGameState(cloneGameData(withPiles));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error loading game data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameData = async (filePath: string) => {
    const data = await loadFromFile(filePath);
    await ingestCombatPayload(data);
  };

  const loadGameDataFromJson = async (data: CombatData) => {
    await ingestCombatPayload(cloneGameData(data));
  };

  useEffect(() => {
    const n = gameState?.enemies?.length ?? 0;
    setCombatTargetEnemyIndices((prev) => prev.filter((i) => i >= 0 && i < n));
  }, [gameState?.enemies?.length]);

  useEffect(() => {
    if (!gameState?.enemies) return;
    const plannerTurnId = turns[currentTurnIndex]?.id;
    if (plannerTurnId === undefined || plannerTurnId === null) return;
    setCombatTargetEnemyIndices((prev) =>
      prev.filter((i) => {
        const list = gameState.enemies;
        if (!list) return false;
        const e = list[i];
        return e !== undefined && isEnemyTargetableInPlannerTurn(e, plannerTurnId);
      }),
    );
  }, [gameState, currentTurnIndex, turns]);

  const setCombatTargetMode = useCallback((mode: 'single' | 'multi') => {
    setCombatTargetModeState(mode);
    setCombatTargetEnemyIndices((prev) => {
      if (mode === 'single' && prev.length > 1) {
        return [Math.min(...prev)];
      }
      return prev;
    });
  }, []);

  const toggleCombatEnemyTarget = useCallback(
    (index: number) => {
      setCombatTargetEnemyIndices((prev) => {
        if (combatTargetMode === 'single') {
          return prev.length === 1 && prev[0] === index ? [] : [index];
        }
        if (prev.includes(index)) {
          return prev.filter((i) => i !== index);
        }
        return [...prev, index].sort((a, b) => a - b);
      });
    },
    [combatTargetMode],
  );

  const clearCombatTargets = useCallback(() => {
    setCombatTargetEnemyIndices([]);
    setCombatTargetSelf(false);
  }, []);

  const toggleCombatTargetSelf = useCallback(() => {
    setCombatTargetSelf((s) => !s);
  }, []);

  const saveCurrentTurn = useCallback(() => {
    if (!gameState) return;
    if (currentTurnIndex < 0 || currentTurnIndex >= turns.length) return;
    setTurns((prev) =>
      prev.map((turn, idx) =>
        idx === currentTurnIndex ? { ...turn, state: cloneGameData(gameState) } : turn,
      ),
    );
    toast('Turn saved', 'success');
  }, [gameState, currentTurnIndex, turns.length]);

  const setCurrentTurn = (turnId: number) => {
    const index = turns.findIndex((turn) => turn.id === turnId);
    if (index === -1 || index === currentTurnIndex || !gameState) return;

    const nextTurns = turns.map((turn, idx) =>
      idx === currentTurnIndex ? { ...turn, state: cloneGameData(gameState) } : turn,
    );
    setTurns(nextTurns);
    setCurrentTurnIndex(index);
    setGameState(cloneGameData(nextTurns[index]!.state));
    setTurnPhase('start');
    toast('Turn switched', 'success');
  };

  const endPlayerTurn = () => {
    if (!gameState || turnPhase !== 'player') return;
    const plannerTurnSlotId = turns[currentTurnIndex]?.id ?? currentTurnIndex + 1;
    const stateAfterIntangibleTick: CombatData = {
      ...gameState,
      player: {
        ...gameState.player,
        buffsDebuffs: decrementIntangibleStacks(gameState.player.buffsDebuffs),
      },
    };
    const logEntry = createActivityLogEntry(
      `Player ended main phase — planner turn ${plannerTurnSlotId}`,
      undefined,
      undefined,
      'Enemy phase: resolve intents and damage, then end enemy turn.',
      'system',
      { context: [{ label: 'Phase', value: 'Main → Enemy' }] },
    );
    const stateAfterLog: CombatData = {
      ...stateAfterIntangibleTick,
      activityLog: [...stateAfterIntangibleTick.activityLog, logEntry],
    };
    setGameState(stateAfterLog);
    setTurns((prev) =>
      prev.map((turn, idx) =>
        idx === currentTurnIndex ? { ...turn, state: cloneGameData(stateAfterLog) } : turn,
      ),
    );
    setTurnPhase('enemy');
    toast('Enemy turn', 'info');
  };

  const endEnemyTurn = () => {
    if (!gameState || !initialData || turnPhase !== 'enemy') return;
    const plannerTurnSlotId = turns[currentTurnIndex]?.id ?? currentTurnIndex + 1;
    const enemiesTicked = gameState.enemies?.map((e) => ({
      ...e,
      buffsDebuffs: decrementIntangibleStacks(e.buffsDebuffs),
    }));
    const stateAfterIntangibleTick: CombatData = {
      ...gameState,
      ...(enemiesTicked ? { enemies: enemiesTicked } : {}),
    };
    const logEntry = createActivityLogEntry(
      `Enemy phase ended — planner turn ${plannerTurnSlotId}`,
      undefined,
      undefined,
      'Advancing to the next planner turn. Use Start turn for relic / draw / ST, then Main.',
      'system',
      { context: [{ label: 'Phase', value: 'Enemy → Start (next planner turn)' }] },
    );
    const stateAfterLog: CombatData = {
      ...stateAfterIntangibleTick,
      activityLog: [...stateAfterIntangibleTick.activityLog, logEntry],
    };
    setTurns((prev) => {
      const withSaved = prev.map((turn, idx) =>
        idx === currentTurnIndex ? { ...turn, state: cloneGameData(stateAfterLog) } : turn,
      );
      const nextIndex = currentTurnIndex + 1;
      if (nextIndex >= withSaved.length) {
        const newTurn: Turn = {
          id: withSaved.length > 0 ? Math.max(...withSaved.map((t) => t.id)) + 1 : 1,
          uid: newPlannerTurnUid(),
          state: cloneGameData(initialData),
        };
        return [...withSaved, newTurn];
      }
      return withSaved;
    });
    const nextIndex = currentTurnIndex + 1;
    if (nextIndex >= turns.length) {
      setCurrentTurnIndex(nextIndex);
      setGameState(cloneGameData(initialData));
    } else {
      setCurrentTurnIndex(nextIndex);
      setGameState(cloneGameData(turns[nextIndex].state));
    }
    setTurnPhase('start');
    toast('Next planner turn', 'success');
  };

  const beginTurn = () => {
    if (!gameState || turnPhase !== 'start') return;
    const plannerTurnSlotId = turns[currentTurnIndex]?.id ?? currentTurnIndex + 1;
    const logEntry = createActivityLogEntry(
      `End of start — entering Main · planner turn ${plannerTurnSlotId}`,
      undefined,
      undefined,
      'Start phase is complete; you are now in Main (play cards). Relics / draw / ST should already be logged above.',
      'system',
      {
        context: [
          { label: 'Phase track', value: 'Start → Main' },
          {
            label: 'Tip',
            value: 'Use “Turn start” before this when you want an explicit boundary line in the log.',
          },
        ],
      },
    );
    const stateAfterLog: CombatData = {
      ...gameState,
      activityLog: [...gameState.activityLog, logEntry],
    };
    setGameState(stateAfterLog);
    setTurns((prev) =>
      prev.map((turn, idx) =>
        idx === currentTurnIndex ? { ...turn, state: cloneGameData(stateAfterLog) } : turn,
      ),
    );
    setTurnPhase('player');
    toast('Main phase', 'info');
  };

  const continueFromTurn = (fromTurnId: number, toTurnId: number) => {
    const fromTurnIndex = turns.findIndex(turn => turn.id === fromTurnId);
    const toTurnIndex = turns.findIndex(turn => turn.id === toTurnId);

    if (fromTurnIndex === -1 || toTurnIndex === -1) return;

    const fromCurrentPlanner = fromTurnIndex === currentTurnIndex;
    /** During enemy phase, live {@link gameState} diverges from the slot; use the saved slot (player-end) so enemy resolutions are not copied. */
    const sourceState =
      fromCurrentPlanner && turnPhase !== 'enemy' && gameState
        ? cloneGameData(gameState)
        : cloneGameData(turns[fromTurnIndex].state);

    setTurns((prev) =>
      prev.map((turn, idx) => (idx === toTurnIndex ? { ...turn, state: sourceState } : turn)),
    );
    setCurrentTurnIndex(toTurnIndex);
    setGameState(cloneGameData(sourceState));
    setTurnPhase('start');
  };

  const resetCurrentTurn = () => {
    if (!initialData) return;
    const resetState = cloneGameData(initialData);
    setGameState(resetState);
    setTurns(prev => prev.map((turn, idx) => idx === currentTurnIndex ? { ...turn, state: resetState } : turn));
    setTurnPhase('start');
  };

  const updateGameState = (newState: Partial<CombatData>) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        ...newState,
      };
    });
  };

  const syncEnemyIntentsGlobally = useCallback((enemiesNext: Enemy[]) => {
    setGameState((prev) => (prev ? { ...prev, enemies: cloneEnemyArrayDeep(enemiesNext) } : prev));
    setTurns((prev) =>
      prev.map((t) => ({
        ...t,
        state: {
          ...cloneGameData(t.state),
          enemies: cloneEnemyArrayDeep(enemiesNext),
        },
      })),
    );
    setDecisionNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        snapshot: {
          ...cloneGameData(n.snapshot),
          enemies: cloneEnemyArrayDeep(enemiesNext),
        },
      })),
    );
  }, []);

  const resetGameState = () => {
    if (initialData) {
      setGameState(cloneGameData(initialData));
      setTurnPhase('start');
    }
  };

  const saveGameData = useCallback(
    (key: string = DEFAULT_SAVE_KEY) => {
      if (turns.length > 0) {
        saveToLocalStorage(key, {
          turns,
          currentTurnIndex,
          turnPhase,
          decisionNodes,
          activeDecisionNodeId,
          decisionTimelinePositions,
        });
        if (activeProject) {
          const planner: PlannerWorkflowSaveShape = {
            turns,
            currentTurnIndex,
            turnPhase,
            decisionNodes,
            activeDecisionNodeId,
            decisionTimelinePositions,
          };
          const file = buildProjectSaveFileV1(planner, activeProject);
          saveLastProjectToLocalStorage(file);
        }
      }
    },
    [
      turns,
      currentTurnIndex,
      turnPhase,
      decisionNodes,
      activeDecisionNodeId,
      decisionTimelinePositions,
      activeProject,
    ],
  );

  const downloadPlannerSaveJson = useCallback(() => {
    if (turns.length === 0) {
      toast('Nothing to export yet — load combat first.', 'info');
      return;
    }
    const payload = {
      turns,
      currentTurnIndex,
      turnPhase,
      decisionNodes,
      activeDecisionNodeId,
      decisionTimelinePositions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sts-planner-save-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Save exported as JSON', 'success');
  }, [turns, currentTurnIndex, turnPhase, decisionNodes, activeDecisionNodeId, decisionTimelinePositions]);

  /** Debounced persist of planner rows, timeline tree, and canvas positions to browser storage. */
  useEffect(() => {
    if (isLoading || turns.length === 0) return;
    const t = window.setTimeout(() => saveGameData(), 520);
    return () => window.clearTimeout(t);
  }, [
    isLoading,
    turns,
    currentTurnIndex,
    turnPhase,
    decisionNodes,
    activeDecisionNodeId,
    decisionTimelinePositions,
    saveGameData,
  ]);

  const toggleRelic = (relicName: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;

      const activeRelics = prevState.player.activeRelics ?? [];
      const isActive = activeRelics.includes(relicName);
      const nextActiveRelics = isActive
        ? activeRelics.filter((name) => name !== relicName)
        : [...activeRelics, relicName];

      let bonusEnergy = prevState.player.bonusEnergy ?? 0;
      let bonusBlock = prevState.player.bonusBlock ?? 0;
      let currentEnergy = prevState.player.currentEnergy ?? 0;
      let buffsDebuffs = [...(prevState.player.buffsDebuffs ?? [])];

      if (relicName === LANTERN_RELIC_NAME) {
        if (isActive) {
          if (currentEnergy < LANTERN_ENERGY_GIFT) {
            return prevState;
          }
          currentEnergy -= LANTERN_ENERGY_GIFT;
        } else {
          currentEnergy += LANTERN_ENERGY_GIFT;
        }
      }
      if (relicName === "Captains Wheel") {
        bonusBlock = isActive ? Math.max(0, bonusBlock - 18) : bonusBlock + 18;
      }
      if (relicName === "Incense Burner") {
        if (!isActive) {
          const idx = buffsDebuffs.findIndex(
            (bd) =>
              bd.type === 'buff' &&
              bd.name.trim().toLowerCase() === INTANGIBLE_BUFF_NAME.toLowerCase(),
          );
          if (idx >= 0) {
            const cur = buffsDebuffs[idx];
            buffsDebuffs = [...buffsDebuffs];
            buffsDebuffs[idx] = { ...cur, stacks: cur.stacks + 1 };
          } else {
            buffsDebuffs = [
              ...buffsDebuffs,
              {
                name: INTANGIBLE_BUFF_NAME,
                stacks: 1,
                type: 'buff' as const,
                description: INTANGIBLE_BUFF_DESCRIPTION,
              },
            ];
          }
        } else {
          buffsDebuffs = buffsDebuffs.filter(
            (bd) =>
              !(
                bd.type === 'buff' &&
                bd.name.trim().toLowerCase() === INTANGIBLE_BUFF_NAME.toLowerCase()
              ),
          );
        }
      }

      return {
        ...prevState,
        player: {
          ...prevState.player,
          activeRelics: nextActiveRelics,
          bonusEnergy,
          bonusBlock,
          currentEnergy,
          ...(relicName === "Incense Burner"
            ? { buffsDebuffs: buffsDebuffs.length > 0 ? buffsDebuffs : undefined }
            : {}),
        },
      };
    });
  };

  const applyPlannerWorkflow = useCallback((saved: PlannerWorkflowSaveShape): boolean => {
    if (!saved.turns || !Array.isArray(saved.turns)) {
      return false;
    }
    const migratedTurns = migrateTurnRowsWithUids(saved.turns);
    setTurns(migratedTurns);
    setCurrentTurnIndex(saved.currentTurnIndex || 0);
    const slotState = migratedTurns[saved.currentTurnIndex || 0]?.state;
    setGameState(slotState ? cloneGameData(slotState) : null);
    const phase = saved.turnPhase as CombatTurnPhase | undefined;
    setTurnPhase(phase === 'start' || phase === 'player' || phase === 'enemy' ? phase : 'start');

    setInitialData(
      migratedTurns.length > 0 && migratedTurns[0]?.state
        ? cloneGameData(migratedTurns[0].state)
        : null,
    );

    const rawNodes = saved.decisionNodes;
    if (
      Array.isArray(rawNodes) &&
      rawNodes.length > 0 &&
      rawNodes.every(
        (n: DecisionNode) =>
          n &&
          typeof n.id === 'string' &&
          n.snapshot &&
          typeof n.plannerTurnSlotId === 'number',
      )
    ) {
      const cloned: DecisionNode[] = migrateDecisionNodeTimelineRoles(
        rawNodes.map((n: DecisionNode) => ({
          ...n,
          snapshot: cloneGameData(n.snapshot),
        })),
      );
      const normalizedNodes = migrateDecisionCheckpointLabelsToTurnSlugs(
        normalizeDecisionNodePlannerSlots(cloned, migratedTurns),
        migratedTurns,
      );
      const withAccents = ensureDecisionNodesTimelineAccents(normalizedNodes);
      const preferred = saved.activeDecisionNodeId as string | undefined;
      const active =
        preferred && withAccents.some((n) => n.id === preferred)
          ? preferred
          : getForcedMainTimelineLeafFromStart(withAccents) ?? withAccents[0]!.id;
      setDecisionNodes(withAccents);
      setActiveDecisionNodeId(active);
      const pos = saved.decisionTimelinePositions as DecisionTimelinePositionMap | undefined;
      setDecisionTimelinePositions(pos && typeof pos === 'object' && !Array.isArray(pos) ? pos : {});
    } else {
      const idx = saved.currentTurnIndex || 0;
      const slot = migratedTurns[idx];
      const phaseNow =
        saved.turnPhase === 'start' || saved.turnPhase === 'player' || saved.turnPhase === 'enemy'
          ? saved.turnPhase
          : 'start';
      if (slot) {
        const rootId = crypto.randomUUID();
        const [migrated] = migrateDecisionNodeTimelineRoles([
          {
            id: rootId,
            parentId: null,
            label: 'START',
            timelineRole: 'timeline_start',
            snapshot: cloneGameData(slot.state),
            plannerTurnSlotId: slot.id,
            timelineAccentHex: pickDistinctTimelineAccentHex([]),
            turnPhase: phaseNow,
            createdAt: new Date().toISOString(),
          },
        ]);
        setDecisionNodes([migrated]);
        setActiveDecisionNodeId(rootId);
      } else {
        setDecisionNodes([]);
        setActiveDecisionNodeId(null);
      }
      setDecisionTimelinePositions({});
    }
    setError(null);
    return true;
  }, []);

  const loadSavedGame = (key: string = DEFAULT_SAVE_KEY): boolean => {
    const savedUnknown = loadFromLocalStorage(key) as unknown;
    if (
      savedUnknown &&
      typeof savedUnknown === 'object' &&
      'turns' in savedUnknown &&
      Array.isArray((savedUnknown as PlannerWorkflowSaveShape).turns)
    ) {
      return applyPlannerWorkflow(savedUnknown as PlannerWorkflowSaveShape);
    }
    return false;
  };

  const loadProjectFromJsonText = useCallback(
    (text: string): boolean => {
      const proj = parseProjectJsonString(text, 'Imported project');
      if (!proj) {
        toast('Invalid project file', 'error');
        return false;
      }
      if (!applyPlannerWorkflow(proj.planner)) {
        toast('Project file is missing planner data', 'error');
        return false;
      }
      setActiveProject(proj.projectMeta);
      saveLastProjectToLocalStorage(proj);
      toast(`Loaded project: ${proj.projectMeta.name}`, 'success');
      return true;
    },
    [applyPlannerWorkflow],
  );

  const saveProject = useCallback(() => {
    if (turns.length === 0) {
      toast('Nothing to save — open or start a project first', 'info');
      return;
    }
    const defaultName = activeProject?.name ?? 'Untitled project';
    const nameInput = typeof window !== 'undefined' ? window.prompt('Project name', defaultName) : null;
    if (nameInput === null) {
      return;
    }
    const trimmed = nameInput.trim() || 'Untitled project';
    const meta: ProjectMeta = activeProject
      ? {
          ...activeProject,
          name: trimmed,
          updatedAt: new Date().toISOString(),
        }
      : newProjectMeta(trimmed);
    const planner: PlannerWorkflowSaveShape = {
      turns,
      currentTurnIndex,
      turnPhase,
      decisionNodes,
      activeDecisionNodeId,
      decisionTimelinePositions,
    };
    const file = buildProjectSaveFileV1(planner, meta);
    const json = JSON.stringify(file, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sts-project-${trimmed.replace(/\s+/g, '-').slice(0, 48)}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    saveLastProjectToLocalStorage(file);
    setActiveProject(file.projectMeta);
    toast('Project saved', 'success');
  }, [
    turns,
    currentTurnIndex,
    turnPhase,
    decisionNodes,
    activeDecisionNodeId,
    decisionTimelinePositions,
    activeProject,
  ]);

  const closeProject = useCallback(() => {
    if (turns.length > 0 || gameState) {
      if (typeof window !== 'undefined' && !window.confirm('Close project? Unsaved changes in this tab will be lost.')) {
        return;
      }
    }
    setGameState(null);
    setInitialData(null);
    setTurns([]);
    setCurrentTurnIndex(0);
    setTurnPhase('start');
    setDecisionNodes([]);
    setActiveDecisionNodeId(null);
    setDecisionTimelinePositions({});
    setActiveProject(null);
    setError(null);
    setCombatTargetEnemyIndices([]);
    setCombatTargetSelf(false);
    clearLastProjectFromLocalStorage();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(DEFAULT_SAVE_KEY);
      }
    } catch {
      /* ignore */
    }
    toast('Project closed', 'info');
  }, [turns.length, gameState]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const lastProject = loadLastProjectFromLocalStorage();
        if (lastProject && !cancelled) {
          if (applyPlannerWorkflow(lastProject.planner)) {
            setActiveProject(lastProject.projectMeta);
            toast(`Loaded project: ${lastProject.projectMeta.name}`, 'success');
          }
        } else if (!cancelled) {
          const rawUnknown = loadFromLocalStorage(DEFAULT_SAVE_KEY) as unknown;
          const legacy = normalizeToProjectV1(rawUnknown, 'Previous session');
          if (legacy && applyPlannerWorkflow(legacy.planner)) {
            setActiveProject(legacy.projectMeta);
            saveLastProjectToLocalStorage(legacy);
            toast(`Restored previous session: ${legacy.projectMeta.name}`, 'info');
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyPlannerWorkflow]);

  const forkDecisionBranch = useCallback(
    (optionalLabel?: string, forkParentCheckpointId?: string | null): string | null => {
      if (!gameState) {
        toast('Load combat first', 'error');
        return null;
      }

      const childId = crypto.randomUUID();
      let nodes = [...decisionNodes];
      let effectiveParentId =
        forkParentCheckpointId !== undefined && forkParentCheckpointId !== null
          ? forkParentCheckpointId
          : activeDecisionNodeId;

      if (nodes.length === 0) {
        const rootId = crypto.randomUUID();
        nodes.push({
          id: rootId,
          parentId: null,
          label: 'START',
          timelineRole: 'timeline_start',
          snapshot: cloneGameData(gameState),
          plannerTurnSlotId: turns[0]?.id ?? 1,
          timelineAccentHex: pickDistinctTimelineAccentHex([]),
          turnPhase,
          createdAt: new Date().toISOString(),
        });
        effectiveParentId = rootId;
      } else {
        const rootNode = nodes.find((n) => n.parentId === null);
        if (!effectiveParentId && rootNode) effectiveParentId = rootNode.id;
      }

      if (!effectiveParentId) {
        toast('Click a timeline checkpoint to select it, or activate one on the path.', 'info');
        return null;
      }

      const parentNode = nodes.find((n) => n.id === effectiveParentId);
      if (!parentNode) {
        toast('Selected checkpoint not found.', 'error');
        return null;
      }

      const parentSnapForChild =
        effectiveParentId === activeDecisionNodeId
          ? cloneGameData(gameState)
          : cloneGameData(parentNode.snapshot);

      /** Tree depth below START maps to planner row index `depth - 1`; extend rows so depth N uses slot `turns[N - 1]`. */
      const parentDepth = decisionNodeDepthFromRoot(nodes, effectiveParentId);
      const childDepth = parentDepth + 1;

      let expandedTurns = [...turns];
      while (expandedTurns.length < childDepth) {
        const nextId =
          expandedTurns.length > 0 ? Math.max(...expandedTurns.map((t) => t.id)) + 1 : 1;
        expandedTurns.push({
          id: nextId,
          uid: newPlannerTurnUid(),
          state: cloneGameData(parentSnapForChild),
        });
      }

      nodes = nodes.map((n) =>
        n.id === effectiveParentId
          ? {
              ...n,
              snapshot: parentSnapForChild,
              turnPhase:
                effectiveParentId === activeDecisionNodeId ? turnPhase : n.turnPhase,
            }
          : n,
      );

      const childPhase =
        effectiveParentId === activeDecisionNodeId ? turnPhase : parentNode.turnPhase;

      let childSnap = cloneGameData(parentSnapForChild);
      childSnap.activityLog = [
        ...(childSnap.activityLog ?? []),
        createActivityLogEntry(
          `Copied from "${parentNode.id}"`,
          undefined,
          undefined,
          parentNode.label?.trim()
            ? `Source checkpoint label: ${parentNode.label.trim()}`
            : undefined,
          'system',
        ),
      ];

      const pending: DecisionNode = {
        id: childId,
        parentId: effectiveParentId,
        label: '',
        timelineRole: 'branch',
        snapshot: childSnap,
        plannerTurnSlotId: expandedTurns[0]?.id ?? 1,
        timelineAccentHex: pickDistinctTimelineAccentHex(nodes.map((n) => n.timelineAccentHex ?? '')),
        turnPhase: childPhase,
        createdAt: new Date().toISOString(),
      };
      nodes.push(pending);
      const auto = defaultForkDecisionLabel(nodes, pending, expandedTurns);
      nodes[nodes.length - 1] = {
        ...pending,
        label: optionalLabel?.trim() || auto,
      };

      const normalized = normalizeDecisionNodePlannerSlots(nodes, expandedTurns);
      const childRow = normalized.find((n) => n.id === childId);
      if (!childRow) {
        toast('Branch normalize failed.', 'error');
        return null;
      }

      const turnIdxForChild = Math.max(
        0,
        expandedTurns.findIndex((t) => t.id === childRow.plannerTurnSlotId),
      );
      const expandedTurnsFinal = expandedTurns.map((t, i) =>
        i === turnIdxForChild ? { ...t, state: cloneGameData(childSnap) } : t,
      );

      setTurns(expandedTurnsFinal);
      setDecisionNodes(normalized);
      setActiveDecisionNodeId(childId);
      setCurrentTurnIndex(turnIdxForChild);
      setGameState(cloneGameData(childSnap));
      setTurnPhase(childPhase);

      toast('Branch created', 'success');
      return childId;
    },
    [gameState, activeDecisionNodeId, turns, currentTurnIndex, turnPhase, decisionNodes],
  );

  const jumpToDecisionNode = useCallback(
    (nodeId: string) => {
      if (nodeId === activeDecisionNodeId) return;

      const targetNode = decisionNodes.find((n) => n.id === nodeId);
      if (!targetNode) {
        toast('Node not found', 'error');
        return;
      }

      if (gameState && activeDecisionNodeId && activeDecisionNodeId !== nodeId) {
        const turnsScratchForFlush = turns.map((t, i) =>
          i === currentTurnIndex ? { ...t, state: cloneGameData(gameState) } : t,
        );
        setDecisionNodes((prev) =>
          normalizeDecisionNodePlannerSlots(
            prev.map((n) =>
              n.id === activeDecisionNodeId
                ? {
                    ...n,
                    ...activeDecisionCheckpointSnapshotFromPlanner(
                      n,
                      prev,
                      turnsScratchForFlush,
                      currentTurnIndex,
                      gameState,
                      turnPhase,
                    ),
                  }
                : n,
            ),
            turns,
          ),
        );
        setTurns((prev) =>
          prev.map((t, i) =>
            i === currentTurnIndex ? { ...t, state: cloneGameData(gameState) } : t,
          ),
        );
      }

      const turnIndex = Math.max(0, turns.findIndex((t) => t.id === targetNode.plannerTurnSlotId));

      setTurns((prev) =>
        prev.map((t, i) =>
          i === turnIndex ? { ...t, state: cloneGameData(targetNode.snapshot) } : t,
        ),
      );
      setCurrentTurnIndex(turnIndex);
      setGameState(cloneGameData(targetNode.snapshot));
      setTurnPhase(targetNode.turnPhase);
      setActiveDecisionNodeId(nodeId);
      toast('Switched branch', 'info');
    },
    [activeDecisionNodeId, decisionNodes, gameState, turns, currentTurnIndex, turnPhase],
  );

  /**
   * Keeps the Decision Timeline aligned with the main planner as {@link gameState} changes (plays, activity log, etc.).
   * Mirrors {@link applyDecisionBranchToPlanner}: flush active checkpoint + merge ROOT→active path into planner rows,
   * then write merged snapshots onto every checkpoint on that path so parent/child log diffs stay correct.
   */
  const syncActiveDecisionNodeFromPlanner = useCallback(() => {
    if (!gameState) return;

    const turnsNow = turnsRef.current;
    const nodesNow = decisionNodesRef.current;
    const idx = currentTurnIndexRef.current;

    if (!activeDecisionNodeId || !nodesNow.some((n) => n.id === activeDecisionNodeId)) {
      setTurns((prev) => {
        if (idx < 0 || idx >= prev.length) return prev;
        const slot = prev[idx];
        if (combatSnapshotsEqual(slot.state, gameState)) return prev;
        return prev.map((turn, i) =>
          i === idx ? { ...turn, state: cloneGameData(gameState) } : turn,
        );
      });
      return;
    }

    /**
     * Decision tree must never be deeper than `turns.length`. Reparent / link operations grow the tree
     * without touching `turns`, so depth-N nodes (N > turns.length) get clamped onto the last slot by
     * {@link effectivePlannerTurnSlotId}. That collapses two distinct path nodes onto the same planner
     * slot — {@link buildTurnStatesFromBranchPath}'s `bestBySlot` then drops the older snapshot's
     * `activityLog`. Auto-extend planner rows here (mirroring the fork path) so every depth keeps a
     * unique slot.
     */
    let maxDecisionDepth = 0;
    for (const n of nodesNow) {
      if (n.timelineRole === 'timeline_start' || n.parentId === null) continue;
      const d = decisionNodeDepthFromRoot(nodesNow, n.id);
      if (d > maxDecisionDepth) maxDecisionDepth = d;
    }
    let workingTurns = turnsNow;
    if (maxDecisionDepth > workingTurns.length) {
      const extended = [...workingTurns];
      while (extended.length < maxDecisionDepth) {
        const baseState = extended[extended.length - 1]?.state ?? gameState;
        const nextId =
          extended.length > 0 ? Math.max(...extended.map((t) => t.id)) + 1 : 1;
        extended.push({
          id: nextId,
          uid: newPlannerTurnUid(),
          state: cloneGameData(baseState),
        });
      }
      workingTurns = extended;
    }

    const pathNodes = getDecisionPathFromRoot(nodesNow, activeDecisionNodeId);
    const pathIdSet = new Set(pathNodes.map((p) => p.id));

    let turnsScratch = workingTurns.map((t, i) =>
      i === idx ? { ...t, state: cloneGameData(gameState) } : t,
    );

    /**
     * Planner rows are source-of-truth for each slot the user edited. Previously only {@link activeDecisionNodeId}
     * received {@link gameState}; `buildTurnStatesFromBranchPath` then overwrote other path slots with **stale**
     * checkpoint snapshots (e.g. empty draw / log) after {@link setCurrentTurn}. Align every path checkpoint's
     * snapshot from `turnsScratch` before merging so merged rows match saved planner state.
     */
    let nodesScratch = normalizeDecisionNodePlannerSlots(
      nodesNow.map((n) => {
        if (n.id === activeDecisionNodeId) {
          return {
            ...n,
            ...activeDecisionCheckpointSnapshotFromPlanner(
              n,
              nodesNow,
              turnsScratch,
              idx,
              gameState,
              turnPhase,
            ),
          };
        }
        if (!pathIdSet.has(n.id) || n.timelineRole === 'timeline_start' || n.parentId === null) {
          return n;
        }
        const slotId = effectivePlannerTurnSlotId(nodesNow, n, turnsScratch);
        const row = turnsScratch.find((t) => t.id === slotId);
        if (!row) return n;
        return { ...n, snapshot: cloneGameData(row.state) };
      }),
      turnsScratch,
    );

    const mergedTurns = buildTurnStatesFromBranchPath(
      nodesScratch,
      activeDecisionNodeId,
      turnsScratch,
    );

    const slotSnap = new Map<number, CombatData>();
    for (const t of mergedTurns) {
      slotSnap.set(t.id, cloneGameData(t.state));
    }

    const nextNodes = nodesScratch.map((n) => {
      if (n.timelineRole === 'timeline_start' || n.parentId === null) return n;
      if (!pathIdSet.has(n.id)) return n;
      const slot = effectivePlannerTurnSlotId(nodesScratch, n, mergedTurns);
      const snap = slotSnap.get(slot);
      if (!snap) return n;
      if (n.id === activeDecisionNodeId) {
        return { ...n, snapshot: snap, turnPhase };
      }
      return { ...n, snapshot: snap };
    });

    const normalizedNext = normalizeDecisionNodePlannerSlots(nextNodes, mergedTurns);

    let dirty =
      mergedTurns.length !== turnsNow.length || normalizedNext.length !== nodesNow.length;
    if (!dirty) {
      for (let i = 0; i < mergedTurns.length; i++) {
        const a = mergedTurns[i]!;
        const b = turnsNow[i]!;
        if (a.id !== b.id || !combatSnapshotsEqual(a.state, b.state)) {
          dirty = true;
          break;
        }
      }
    }
    if (!dirty) {
      const prevById = new Map(nodesNow.map((n) => [n.id, n] as const));
      for (const n of normalizedNext) {
        const o = prevById.get(n.id);
        if (
          !o ||
          o.turnPhase !== n.turnPhase ||
          o.plannerTurnSlotId !== n.plannerTurnSlotId ||
          !combatSnapshotsEqual(n.snapshot, o.snapshot)
        ) {
          dirty = true;
          break;
        }
      }
    }
    if (!dirty) return;

    setDecisionNodes(normalizedNext);
    setTurns(mergedTurns);
  }, [gameState, activeDecisionNodeId, turnPhase]);

  syncActiveDecisionNodeFromPlannerRef.current = syncActiveDecisionNodeFromPlanner;

  const forceActiveDecisionTimelineMainChain = useCallback(() => {
    if (decisionNodes.length === 0) {
      toast('No decision timeline nodes', 'info');
      return;
    }
    const leaf = getForcedMainTimelineLeafFromStart(decisionNodes);
    if (!leaf) {
      toast('Could not resolve main chain from START', 'info');
      return;
    }
    setActiveDecisionNodeId(leaf);
    toast('Active path pinned to main chain', 'success');
  }, [decisionNodes]);

  /** Align planner rows + Decision Timeline path with live `gameState` (same outcome as Apply → planner, without switching pin). */
  useEffect(() => {
    if (isLoading || !gameState) return;
    syncActiveDecisionNodeFromPlannerRef.current();
  }, [isLoading, gameState, activeDecisionNodeId, turnPhase]);


  const deleteDecisionBranch = useCallback(
    (nodeId: string) => {
      const target = decisionNodes.find((n) => n.id === nodeId);
      if (target?.timelineRole === 'timeline_start') {
        toast('START is fixed — it cannot be deleted.', 'info');
        return;
      }

      const root = decisionNodes.find((n) => n.parentId === null);
      if (root && nodeId === root.id) {
        toast('Cannot delete the root node', 'info');
        return;
      }

      const next = decisionNodes.filter((n) => n.id !== nodeId);
      setDecisionNodes(next);
      setDecisionTimelinePositions((prev) => {
        const out = { ...prev };
        delete out[nodeId];
        return out;
      });

      toast('Turn removed — children kept as orphans (red) until relinked.', 'info');

      if (!activeDecisionNodeId || activeDecisionNodeId !== nodeId) {
        return;
      }

      const fallback = next.find((n) => n.parentId === null) ?? next[0];
      if (!fallback) {
        setActiveDecisionNodeId(null);
        toast('Turn deleted — tree is empty', 'info');
        return;
      }

      const turnIndex = Math.max(0, turns.findIndex((t) => t.id === fallback.plannerTurnSlotId));
      setTurns((prev) =>
        prev.map((t, i) =>
          i === turnIndex ? { ...t, state: cloneGameData(fallback.snapshot) } : t,
        ),
      );
      setCurrentTurnIndex(turnIndex);
      setGameState(cloneGameData(fallback.snapshot));
      setTurnPhase(fallback.turnPhase);
      setActiveDecisionNodeId(fallback.id);
      toast('Active branch deleted — jumped to fallback. Orphans stay red until relinked.', 'info');
    },
    [decisionNodes, activeDecisionNodeId, turns],
  );

  const updateDecisionNodeLabel = useCallback((nodeId: string, label: string) => {
    setDecisionNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, label: label.trim() || n.label } : n)),
    );
  }, []);

  const updateDecisionNodeTimelineAccent = useCallback((nodeId: string, hex: string) => {
    const normalized = normalizeDecisionTimelineAccentHex(hex);
    if (!normalized) {
      toast('Use a #RRGGBB color', 'error');
      return;
    }
    setDecisionNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, timelineAccentHex: normalized } : n)),
    );
  }, []);

  const updateDecisionNodeTurnPhase = useCallback(
    (nodeId: string, phase: CombatTurnPhase) => {
      const target = decisionNodes.find((n) => n.id === nodeId);
      if (!target || target.timelineRole === 'timeline_start') {
        toast('Phase can only be set on turn checkpoints', 'info');
        return;
      }
      if (target.turnPhase === phase) return;

      if (nodeId === activeDecisionNodeId && gameState) {
        setTurnPhase(phase);
        setDecisionNodes((prev) => {
          const turnsScratch = turns.map((t, i) =>
            i === currentTurnIndex ? { ...t, state: cloneGameData(gameState) } : t,
          );
          return prev.map((n) => {
            if (n.id !== nodeId) return n;
            return {
              ...n,
              ...activeDecisionCheckpointSnapshotFromPlanner(
                n,
                prev,
                turnsScratch,
                currentTurnIndex,
                gameState,
                phase,
              ),
            };
          });
        });
        return;
      }

      setDecisionNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, turnPhase: phase } : n)));
    },
    [decisionNodes, activeDecisionNodeId, gameState, turns, currentTurnIndex],
  );

  const setDecisionTimelineNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setDecisionTimelinePositions((prev) => ({ ...prev, [nodeId]: { ...position } }));
  }, []);

  const mergeDecisionTimelinePositions = useCallback((patch: DecisionTimelinePositionMap) => {
    setDecisionTimelinePositions((prev) => {
      const next = { ...prev };
      for (const [id, pos] of Object.entries(patch)) {
        if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
          next[id] = { x: pos.x, y: pos.y };
        }
      }
      return next;
    });
  }, []);

  const applyDecisionBranchToPlanner = useCallback(
    (nodeId: string) => {
      const targetNodeBare = decisionNodes.find((n) => n.id === nodeId);
      if (!gameState) {
        toast('Load combat first', 'error');
        return;
      }
      if (!targetNodeBare) {
        toast('Node not found', 'error');
        return;
      }

      let nodesForPath = decisionNodes;
      let turnsScratch = turns;

      if (activeDecisionNodeId) {
        const turnsScratchApply = turns.map((t, i) =>
          i === currentTurnIndex ? { ...t, state: cloneGameData(gameState) } : t,
        );
        nodesForPath = normalizeDecisionNodePlannerSlots(
          decisionNodes.map((n) =>
            n.id === activeDecisionNodeId
              ? {
                  ...n,
                  ...activeDecisionCheckpointSnapshotFromPlanner(
                    n,
                    decisionNodes,
                    turnsScratchApply,
                    currentTurnIndex,
                    gameState,
                    turnPhase,
                  ),
                }
              : n,
          ),
          turns,
        );
        turnsScratch = turnsScratchApply;
      }

      const mergedTurns = buildTurnStatesFromBranchPath(nodesForPath, nodeId, turnsScratch);
      const targetNode = nodesForPath.find((n) => n.id === nodeId);
      if (!targetNode) {
        toast('Node not found', 'error');
        return;
      }

      setDecisionNodes(nodesForPath);
      setTurns(mergedTurns);
      const turnIndex = Math.max(0, mergedTurns.findIndex((t) => t.id === targetNode.plannerTurnSlotId));
      setCurrentTurnIndex(turnIndex);
      setGameState(cloneGameData(targetNode.snapshot));
      setTurnPhase(targetNode.turnPhase);
      setActiveDecisionNodeId(nodeId);
      toast('Applied branch to planner', 'success');
    },
    [decisionNodes, gameState, turns, currentTurnIndex, turnPhase, activeDecisionNodeId],
  );

  const isApplyDecisionBranchToPlannerSynced = useCallback(
    (targetNodeId: string | null) => {
      if (!targetNodeId || !gameState) return true;
      return checkApplyDecisionBranchToPlannerSynced(
        decisionNodes,
        activeDecisionNodeId,
        gameState,
        turns,
        currentTurnIndex,
        turnPhase,
        targetNodeId,
      );
    },
    [decisionNodes, activeDecisionNodeId, gameState, turns, currentTurnIndex, turnPhase],
  );

  const linkDecisionTimelineParent = useCallback(
    (nodeId: string, newParentId: string) => {
      if (!isValidDecisionReparent(decisionNodes, nodeId, newParentId)) {
        toast('Cannot relink — invalid parent or would break START / create a cycle.', 'error');
        return;
      }

      /**
       * Reparent design (post-fix):
       *   1. Compute the new tree.
       *   2. Extend `turns` to fit the new max depth (mirrors {@link forkDecisionBranch}) so the deeper
       *      node gets its OWN planner slot instead of clamping onto the existing last slot.
       *   3. Rebuild every planner row's state from the canonical path node's `snapshot` via
       *      {@link buildTurnStatesFromBranchPath}. This preserves each per-UID snapshot across the
       *      relink — without it, the OLD active row's data would clobber the now-canonical
       *      (formerly sibling) node's snapshot when the next sync overwrites path nodes from rows.
       */
      const reparentedNodes = decisionNodes.map((n) =>
        n.id === nodeId ? { ...n, parentId: newParentId } : n,
      );

      let extendedTurns = [...turns];
      let maxDepth = 0;
      for (const n of reparentedNodes) {
        if (n.timelineRole === 'timeline_start' || n.parentId === null) continue;
        const d = decisionNodeDepthFromRoot(reparentedNodes, n.id);
        if (d > maxDepth) maxDepth = d;
      }
      while (extendedTurns.length < maxDepth) {
        const baseState =
          extendedTurns[extendedTurns.length - 1]?.state ?? gameState ?? null;
        const nextId =
          extendedTurns.length > 0 ? Math.max(...extendedTurns.map((t) => t.id)) + 1 : 1;
        extendedTurns.push({
          id: nextId,
          uid: newPlannerTurnUid(),
          state: baseState ? cloneGameData(baseState) : (extendedTurns[0]?.state as never),
        });
      }

      const nextDecisionNodes = normalizeDecisionNodePlannerSlots(
        reparentedNodes,
        extendedTurns,
      );
      const pinnedActiveId = pinActiveAlongUniqueChildChainFromNode(nextDecisionNodes, nodeId);
      const targetNode = nextDecisionNodes.find((n) => n.id === pinnedActiveId);

      const rebuiltTurns = buildTurnStatesFromBranchPath(
        nextDecisionNodes,
        pinnedActiveId,
        extendedTurns,
      );

      let saveTurnIndex = currentTurnIndex;
      let savePhase = turnPhase;
      if (targetNode && targetNode.timelineRole !== 'timeline_start') {
        const turnIndex = Math.max(
          0,
          rebuiltTurns.findIndex((t) => t.id === targetNode.plannerTurnSlotId),
        );
        saveTurnIndex = turnIndex;
        savePhase = targetNode.turnPhase;
        setTurns(rebuiltTurns);
        setCurrentTurnIndex(turnIndex);
        setGameState(cloneGameData(targetNode.snapshot));
        setTurnPhase(targetNode.turnPhase);
      } else {
        setTurns(rebuiltTurns);
      }

      setDecisionNodes(nextDecisionNodes);
      setActiveDecisionNodeId(pinnedActiveId);

      if (rebuiltTurns.length > 0) {
        saveToLocalStorage(DEFAULT_SAVE_KEY, {
          turns: rebuiltTurns,
          currentTurnIndex: saveTurnIndex,
          turnPhase: savePhase,
          decisionNodes: nextDecisionNodes,
          activeDecisionNodeId: pinnedActiveId,
          decisionTimelinePositions,
        });
      }
      toast('Timeline parent updated', 'success');
    },
    [
      decisionNodes,
      turns,
      currentTurnIndex,
      turnPhase,
      decisionTimelinePositions,
    ],
  );

  const unlinkDecisionTimelineBranch = useCallback(
    (nodeId: string) => {
      const target = decisionNodes.find((n) => n.id === nodeId);
      if (!target) {
        toast('Node not found', 'error');
        return;
      }
      if (target.timelineRole === 'timeline_start') {
        toast('START cannot be unlinked.', 'info');
        return;
      }
      if (target.parentId === null) {
        toast('This branch is already unlinked.', 'info');
        return;
      }
      const nextDecisionNodes = normalizeDecisionNodePlannerSlots(
        decisionNodes.map((n) => (n.id === nodeId ? { ...n, parentId: null } : n)),
        turns,
      );
      setDecisionNodes(nextDecisionNodes);
      if (turns.length > 0) {
        saveToLocalStorage(DEFAULT_SAVE_KEY, {
          turns,
          currentTurnIndex,
          turnPhase,
          decisionNodes: nextDecisionNodes,
          activeDecisionNodeId,
          decisionTimelinePositions,
        });
      }
      toast('Branch unlinked — orphan until you relink.', 'success');
    },
    [
      decisionNodes,
      turns,
      currentTurnIndex,
      turnPhase,
      activeDecisionNodeId,
      decisionTimelinePositions,
    ],
  );

  const getSelectedCards = (state: CombatData) => {
    const locations = ['draw', 'discard', 'exhaust', 'hand', 'playedCards'];
    const selected: { card: Card; location: string; index: number }[] = [];
    locations.forEach(loc => {
      const pile = state[loc as keyof CombatData] as Card[];
      pile.forEach((card, idx) => {
        if (card.isSelected) {
          selected.push({ card, location: loc, index: idx });
        }
      });
    });
    return selected;
  };

  const addToActivityLog = (entry: ActivityLogEntry | string) => {
    const logEntry =
      typeof entry === 'string' ? createActivityLogEntry(entry) : entry;

    setGameState((prevState) => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const clearSelectionState = (state: CombatData): CombatData => ({
    ...state,
    draw: state.draw.map((card) => ({ ...card, isSelected: false })),
    discard: state.discard.map((card) => ({ ...card, isSelected: false })),
    exhaust: state.exhaust.map((card) => ({ ...card, isSelected: false })),
    hand: state.hand.map((card) => ({ ...card, isSelected: false })),
    playedCards: state.playedCards.map((card) => ({ ...card, isSelected: false })),
  });

  const sortSelectedForRemoval = (selected: { card: Card; location: string; index: number }[]) =>
    [...selected].sort((a, b) => {
      if (a.location === b.location) return b.index - a.index;
      return a.location.localeCompare(b.location);
    });

  const modifySelectedCards = (
    updater: (card: Card) => Card,
    actionLabel: string | ((args: { selected: { card: Card; location: string; index: number }[] }) => string),
  ) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = {
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      };

      selected.forEach(({ location, index }) => {
        const pile = (newState as any)[location] as Card[];
        pile[index] = updater(pile[index]);
      });

      const stateWithSelectionCleared = clearSelectionState(newState);
      const label =
        typeof actionLabel === 'function' ? actionLabel({ selected }) : actionLabel;
      return {
        ...stateWithSelectionCleared,
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLogEntry(label, selected)],
      };
    });
  };

  const setSelectedCostZero = () => {
    modifySelectedCards((card) => ({ ...card, cost: 0, isChanged: true }), 'Set cost to 0');
  };

  const setSelectedCustomCost = () => {
    const promptValue = window.prompt('Enter custom cost for selected cards:', '0');
    if (promptValue === null) return;
    const value = Number(promptValue);
    if (Number.isNaN(value)) return;
    modifySelectedCards((card) => ({ ...card, cost: value, isChanged: true }), `Set cost to ${value}`);
  };

  const transformSelectedType = () => {
    const newType = window.prompt('Enter a new type for selected cards (Attack, Skill, Power, Status, Curse):', 'Attack');
    if (!newType) return;
    modifySelectedCards((card) => ({ ...card, type: newType, isChanged: true }), `Changed type to ${newType}`);
  };

  const toggleChangedSelected = () => {
    modifySelectedCards((card) => ({ ...card, isChanged: !card.isChanged }), 'Toggled changed flag');
  };

  const playSelectedCards = () => {
    const enemyIndicesSnapshot = combatTargetEnemyIndices;
    const targetSelfSnapshot = combatTargetSelf;
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = clearSelectionState({
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      });
      const newPlayedCards = [...newState.playedCards];

      const sortedSelected = sortSelectedForRemoval(selected);
      sortedSelected.forEach(({ card }) => {
        newPlayedCards.push({ ...card, isSelected: false });
      });

      const playTargetsLabel = formatPlayCardTargets(
        prevState.enemies,
        enemyIndicesSnapshot,
        targetSelfSnapshot,
      );

      return {
        ...newState,
        playedCards: newPlayedCards,
        activityLog: [
          ...newState.activityLog,
          buildActionLogEntry('Played cards', selected, {
            context: [{ label: 'Destination', value: 'Played area' }],
            ...(playTargetsLabel ? { playTargetsLabel } : {}),
          }),
        ],
      };
    });
  };

  const moveSelectedCards = (toLocation: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = clearSelectionState({
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      });
      const toPile = (newState as any)[toLocation] as Card[];

      const sortedSelected = sortSelectedForRemoval(selected);
      sortedSelected.forEach(({ card, location, index }) => {
        const fromPile = (newState as any)[location] as Card[];
        fromPile.splice(index, 1);
        toPile.push({ ...card, isSelected: false });
      });

      return {
        ...newState,
        activityLog: [...newState.activityLog, buildActionLogEntry('Moved cards', selected, { toPile: toLocation })],
      };
    });
  };

  const removeSelectedCards = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = clearSelectionState({
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      });

      const sortedSelected = sortSelectedForRemoval(selected);
      sortedSelected.forEach(({ location, index }) => {
        const pile = (newState as any)[location] as Card[];
        pile.splice(index, 1);
      });

      return {
        ...newState,
        activityLog: [...newState.activityLog, buildActionLogEntry('Removed cards', selected)],
      };
    });
  };

  const spendEnergyOnSelected = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;
      let totalCost = 0;
      selected.forEach(({ card }) => {
        const cost = card.cost && typeof card.cost === 'object' ? (card.isUpgraded && card.cost.upgraded !== undefined ? card.cost.upgraded : card.cost.base) : card.cost;
        if (typeof cost === 'number') totalCost += cost;
      });
      if (prevState.player.currentEnergy! < totalCost) return prevState;

      const newState = clearSelectionState(prevState);
      return {
        ...newState,
        player: {
          ...newState.player,
          currentEnergy: newState.player.currentEnergy! - totalCost,
        },
        activityLog: [
          ...newState.activityLog,
          buildEnergyLogEntry(prevState.player.currentEnergy ?? 0, newState.player.currentEnergy! - totalCost, {
            reason: `Paid ${totalCost} energy for ${selected.length} card(s)`,
            cards: selected.map(({ card }) => card),
          }),
        ],
      };
    });
  };

  const deselectAllCards = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      return clearSelectionState(prevState);
    });
  };

  const drawCards = (amount: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const cardsToDraw = prevState.draw.slice(0, amount);
      const remainingDraw = prevState.draw.slice(amount);
      const newHand = [...prevState.hand, ...cardsToDraw];
      return {
        ...prevState,
        draw: remainingDraw,
        hand: newHand,
        activityLog: [
          ...prevState.activityLog,
          createActivityLogEntry(
            `Drew ${cardsToDraw.length} card${cardsToDraw.length === 1 ? '' : 's'}`,
            `Draw pile: ${prevState.draw.length} cards`,
            `Draw pile: ${remainingDraw.length} cards`,
            `Drawn: ${formatCardNames(cardsToDraw)}`,
            'state-change',
            {
              cardsInvolved: cardsToDraw.map((c) => ({ name: c.name, cardType: c.type })),
              context: [
                { label: 'Draw pile', value: `${prevState.draw.length} → ${remainingDraw.length}` },
                { label: 'Hand size', value: `${prevState.hand.length} → ${newHand.length}` },
              ],
            },
          ),
        ],
      };
    });
  };

  const upgradeSelected = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = {
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      };
      selected.forEach(({ location, index }) => {
        const pile = (newState as any)[location] as Card[];
        const cur = pile[index];
        const name = cur?.name ?? '';
        pile[index] = {
          ...cur,
          isUpgraded: true,
          isChanged: true,
          ...stsTierDescriptionPatch(name, true),
        };
      });
      const stateWithSelectionCleared = clearSelectionState(newState);
      return {
        ...stateWithSelectionCleared,
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLogEntry('Upgraded', selected)],
      };
    });
  };

  const downgradeSelected = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = {
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      };
      selected.forEach(({ location, index }) => {
        const pile = (newState as any)[location] as Card[];
        const cur = pile[index];
        const name = cur?.name ?? '';
        pile[index] = {
          ...cur,
          isUpgraded: false,
          isChanged: true,
          ...stsTierDescriptionPatch(name, false),
        };
      });
      const stateWithSelectionCleared = clearSelectionState(newState);
      return {
        ...stateWithSelectionCleared,
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLogEntry('Downgraded', selected)],
      };
    });
  };

  const duplicateSelected = () => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const selected = getSelectedCards(prevState);
      if (!selected.length) return prevState;

      const newState = {
        ...prevState,
        draw: [...prevState.draw],
        discard: [...prevState.discard],
        exhaust: [...prevState.exhaust],
        hand: [...prevState.hand],
        playedCards: [...prevState.playedCards],
      };
      selected.forEach(({ card, location }) => {
        const pile = (newState as any)[location] as Card[];
        pile.push({ ...card, isSelected: false, isChanged: true });
      });
      const stateWithSelectionCleared = clearSelectionState(newState);
      return {
        ...stateWithSelectionCleared,
        activityLog: [...stateWithSelectionCleared.activityLog, buildActionLogEntry('Duplicated', selected)],
      };
    });
  };

  const toggleCardSelection = (location: string, index: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const pile = prevState[location as keyof CombatData] as Card[];
      if (!Array.isArray(pile) || index < 0 || index >= pile.length) return prevState;
      const newPile = [...pile];
      newPile[index] = { ...newPile[index], isSelected: !newPile[index].isSelected };
      return {
        ...prevState,
        [location]: newPile,
      };
    });
  };

  const buildCardFromDatabase = (cardId: string, isUpgraded: boolean): Card | null => {
    const card = gameCardFromDatabaseId(cardId, { isUpgraded });
    if (!card) return null;
    return { ...card, isChanged: true, isSelected: false };
  };

  const transformSelectedFromDatabase = (cardId: string, isUpgraded = false) => {
    const template = buildCardFromDatabase(cardId, isUpgraded);
    if (!template) return;
    const newName = `${cardId}${isUpgraded ? '+' : ''}`;
    modifySelectedCards(
      (card) => ({ ...template, isSelected: card.isSelected, isChanged: true }),
      ({ selected }) => {
        const oldPart = selected.map(({ card }) => card.name || '—').join(', ');
        return `Transformed : ${oldPart} → ${newName} x${selected.length}`;
      },
    );
  };

  const addCardFromDB = (cardId: string | string[], location: string, isUpgraded = false) => {
    const ids = (Array.isArray(cardId) ? cardId : [cardId]).filter(Boolean);
    if (ids.length === 0) return;

    const built: Card[] = [];
    for (const id of ids) {
      const c = buildCardFromDatabase(id, isUpgraded);
      if (c) built.push(c);
    }
    if (built.length === 0) return;

    const suffix = isUpgraded ? '+' : '';
    const builtNames = built.map((c) => `${c.name ?? '—'}${suffix}`);
    const title =
      built.length === 1
        ? `Added ${builtNames[0]}`
        : `Added ${built.length} cards (${builtNames.join(', ')})`;

    setGameState((prevState) => {
      if (!prevState) return prevState;
      const pile = (prevState as any)[location] as Card[];
      if (!Array.isArray(pile)) return prevState;

      const newPile = [...pile, ...built];
      return {
        ...prevState,
        [location]: newPile,
        activityLog: [
          ...prevState.activityLog,
          createActivityLogEntry(
            title,
            undefined,
            undefined,
            undefined,
            'info',
            {
              cardsInvolved: built.map((c) => ({
                name: c.name ?? '—',
                cardType: c.type,
              })),
              context: [
                { label: 'Pile', value: formatPileLabel(location) },
                { label: 'Cards added', value: String(built.length) },
                { label: 'Unique ids', value: String(new Set(ids).size) },
                { label: 'Upgraded', value: isUpgraded ? 'Yes' : 'No' },
              ],
            },
          ),
        ],
      };
    });
  };

  const modifyPlayerHp = (delta: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const appliedDelta =
        delta < 0 && entityHasIntangible(prevState.player.buffsDebuffs)
          ? -Math.min(Math.abs(delta), 1)
          : delta;
      const beforeHp = prevState.player.hp ?? 0;
      const newHp = Math.max(0, beforeHp + appliedDelta);
      
      if (beforeHp === newHp) return prevState;
      
      const maxHp = prevState.player.maxHp;
      const logEntry =
        appliedDelta > 0
          ? buildHealLogEntry('player', appliedDelta, beforeHp, newHp, undefined, maxHp)
          : buildDamageLogEntry('player', Math.abs(appliedDelta), beforeHp, newHp, undefined, maxHp);
      
      return {
        ...prevState,
        player: {
          ...prevState.player,
          hp: newHp,
        },
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const modifyPlayerBlock = (delta: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const beforeBlock = prevState.player.currentBlock ?? 0;
      const newBlock = Math.max(0, beforeBlock + delta);
      
      if (beforeBlock === newBlock) return prevState;
      
      const logEntry = delta > 0
        ? buildBlockLogEntry('player', delta, beforeBlock, newBlock)
        : buildBlockLostLogEntry('player', Math.abs(delta), beforeBlock, newBlock);
      
      return {
        ...prevState,
        player: {
          ...prevState.player,
          currentBlock: newBlock,
        },
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const modifyPlayerEnergy = (delta: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const beforeEnergy = prevState.player.currentEnergy ?? 0;
      const newEnergy = Math.max(0, beforeEnergy + delta);
      
      if (beforeEnergy === newEnergy) return prevState;
      
      const logEntry = buildEnergyLogEntry(beforeEnergy, newEnergy);
      
      return {
        ...prevState,
        player: {
          ...prevState.player,
          currentEnergy: newEnergy,
        },
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const modifyEnemyHp = (enemyIndex: number, delta: number) => {
    setGameState((prevState) => {
      if (!prevState || !prevState.enemies) return prevState;
      const nextEnemies = [...prevState.enemies];
      if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;

      const enemy = nextEnemies[enemyIndex];
      const appliedDelta =
        delta < 0 && entityHasIntangible(enemy.buffsDebuffs)
          ? -Math.min(Math.abs(delta), 1)
          : delta;

      const beforeHp = enemy.hp;
      const newHp = Math.max(0, beforeHp + appliedDelta);

      if (beforeHp === newHp) return prevState;

      const enemyName = enemy.name || `Enemy ${enemyIndex + 1}`;
      const maxHp = enemy.maxHp;
      const logEntry =
        appliedDelta > 0
          ? buildHealLogEntry('enemy', appliedDelta, beforeHp, newHp, enemyName, maxHp)
          : buildDamageLogEntry(
              'enemy',
              Math.abs(appliedDelta),
              beforeHp,
              newHp,
              enemyName,
              maxHp,
            );
      
      nextEnemies[enemyIndex] = {
        ...nextEnemies[enemyIndex],
        hp: newHp,
      };
      
      return { 
        ...prevState, 
        enemies: nextEnemies,
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const modifyEnemyBlock = (enemyIndex: number, delta: number) => {
    setGameState((prevState) => {
      if (!prevState || !prevState.enemies) return prevState;
      const nextEnemies = [...prevState.enemies];
      if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
      
      const beforeBlock = nextEnemies[enemyIndex].currentBlock ?? 0;
      const newBlock = Math.max(0, beforeBlock + delta);
      
      if (beforeBlock === newBlock) return prevState;
      
      const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
      const logEntry = delta > 0
        ? buildBlockLogEntry('enemy', delta, beforeBlock, newBlock, enemyName)
        : buildBlockLostLogEntry('enemy', Math.abs(delta), beforeBlock, newBlock, enemyName);
      
      nextEnemies[enemyIndex] = {
        ...nextEnemies[enemyIndex],
        currentBlock: newBlock,
      };
      
      return { 
        ...prevState, 
        enemies: nextEnemies,
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  /** Stack additional amounts onto an existing buff/debuff with the same name + kind (case-insensitive). */
  const findBuffDebuffMergeIndex = (
    list: { name: string; type: string }[],
    incomingName: string,
    incomingType: "buff" | "debuff",
  ) =>
    list.findIndex(
      (bd) =>
        bd.type === incomingType &&
        bd.name.trim().toLowerCase() === incomingName.trim().toLowerCase(),
    );

  const addBuffDebuff = (target: 'player' | 'enemy', enemyIndex: number, name: string, type: 'buff' | 'debuff', stacks: number, description?: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      if (target === 'player') {
        const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
        const existingIndex = findBuffDebuffMergeIndex(buffsDebuffs, name, type);
        let nextBuffsDebuffs: typeof buffsDebuffs;
        let logEntry: ActivityLogEntry;
        
        if (existingIndex >= 0) {
          const previousStacks = buffsDebuffs[existingIndex].stacks;
          const mergedStacks = previousStacks + stacks;
          nextBuffsDebuffs = [...buffsDebuffs];
          nextBuffsDebuffs[existingIndex] = {
            ...nextBuffsDebuffs[existingIndex],
            stacks: mergedStacks,
            description: description ?? nextBuffsDebuffs[existingIndex].description,
          };
          
          logEntry = type === 'buff'
            ? buildBuffLogEntry(name, mergedStacks, 'player', undefined, previousStacks)
            : buildDebuffLogEntry(name, mergedStacks, 'player', undefined, previousStacks);
        } else {
          nextBuffsDebuffs = [...buffsDebuffs, { name, stacks, type, description }];
          
          logEntry = type === 'buff'
            ? buildBuffLogEntry(name, stacks, 'player')
            : buildDebuffLogEntry(name, stacks, 'player');
        }
        
        return {
          ...prevState,
          player: { ...prevState.player, buffsDebuffs: nextBuffsDebuffs },
          activityLog: [...prevState.activityLog, logEntry],
        };
      } else {
        if (!prevState.enemies) return prevState;
        const nextEnemies = [...prevState.enemies];
        if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
        
        const buffsDebuffs = nextEnemies[enemyIndex].buffsDebuffs ?? [];
        const existingIndex = findBuffDebuffMergeIndex(buffsDebuffs, name, type);
        let nextBuffsDebuffs: typeof buffsDebuffs;
        let logEntry: ActivityLogEntry;
        
        if (existingIndex >= 0) {
          const previousStacks = buffsDebuffs[existingIndex].stacks;
          const mergedStacks = previousStacks + stacks;
          nextBuffsDebuffs = [...buffsDebuffs];
          nextBuffsDebuffs[existingIndex] = {
            ...nextBuffsDebuffs[existingIndex],
            stacks: mergedStacks,
            description: description ?? nextBuffsDebuffs[existingIndex].description,
          };
          
          const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
          logEntry = type === 'buff'
            ? buildBuffLogEntry(name, mergedStacks, 'enemy', enemyName, previousStacks)
            : buildDebuffLogEntry(name, mergedStacks, 'enemy', enemyName, previousStacks);
        } else {
          nextBuffsDebuffs = [...buffsDebuffs, { name, stacks, type, description }];
          
          const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
          logEntry = type === 'buff'
            ? buildBuffLogEntry(name, stacks, 'enemy', enemyName)
            : buildDebuffLogEntry(name, stacks, 'enemy', enemyName);
        }
        
        nextEnemies[enemyIndex] = { ...nextEnemies[enemyIndex], buffsDebuffs: nextBuffsDebuffs };
        return { 
          ...prevState, 
          enemies: nextEnemies,
          activityLog: [...prevState.activityLog, logEntry],
        };
      }
    });
  };

  const removeBuffDebuff = (target: 'player' | 'enemy', enemyIndex: number, name: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      if (target === 'player') {
        const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
        const logEntry = buildDebuffRemovedLogEntry(name, 'player');
        
        return {
          ...prevState,
          player: {
            ...prevState.player,
            buffsDebuffs: buffsDebuffs.filter((bd) => bd.name !== name),
          },
          activityLog: [...prevState.activityLog, logEntry],
        };
      } else {
        if (!prevState.enemies) return prevState;
        const nextEnemies = [...prevState.enemies];
        if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
        
        const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
        const logEntry = buildDebuffRemovedLogEntry(name, 'enemy', enemyName);
        
        
        nextEnemies[enemyIndex] = {
          ...nextEnemies[enemyIndex],
          buffsDebuffs: (nextEnemies[enemyIndex].buffsDebuffs ?? []).filter((bd) => bd.name !== name),
        };
        return { 
          ...prevState, 
          enemies: nextEnemies,
          activityLog: [...prevState.activityLog, logEntry],
        };
      }
    });
  };

  const reduceBuffDebuff = (target: 'player' | 'enemy', enemyIndex: number, name: string) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const isPlayer = target === 'player';
      const enemyName = !isPlayer ? prevState.enemies?.[enemyIndex].name || `Enemy ${enemyIndex + 1}` : undefined;

      if (isPlayer) {
        const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
        const existingIndex = buffsDebuffs.findIndex((bd) => bd.name === name);
        if (existingIndex < 0) return prevState;

        const existing = buffsDebuffs[existingIndex];
        const currentStacks = existing.stacks;
        let logEntry: ActivityLogEntry;
        let nextBuffsDebuffs;

        if (currentStacks <= 1) {
          nextBuffsDebuffs = buffsDebuffs.filter((bd) => bd.name !== name);
          
        logEntry = buildDebuffRemovedLogEntry(name, isPlayer ? 'player' : 'enemy', enemyName);
        } else {
          const newStacks = currentStacks - 1;
          nextBuffsDebuffs = [...buffsDebuffs];
          nextBuffsDebuffs[existingIndex] = { ...existing, stacks: newStacks };
          logEntry = existing.type === 'buff'
            ? buildBuffLogEntry(name, newStacks, target, enemyName, currentStacks)
            : buildDebuffLogEntry(name, newStacks, target, enemyName, currentStacks);
        }

        return {
          ...prevState,
          player: {
            ...prevState.player,
            buffsDebuffs: nextBuffsDebuffs,
          },
          activityLog: [...prevState.activityLog, logEntry],
        };
      }

      if (!prevState.enemies) return prevState;
      const nextEnemies = [...prevState.enemies];
      if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;

      const buffsDebuffs = nextEnemies[enemyIndex].buffsDebuffs ?? [];
      const existingIndex = buffsDebuffs.findIndex((bd) => bd.name === name);
      if (existingIndex < 0) return prevState;

      const existing = buffsDebuffs[existingIndex];
      const currentStacks = existing.stacks;
      let logEntry: ActivityLogEntry;
      let nextBuffsDebuffs;

      if (currentStacks <= 1) {
        nextBuffsDebuffs = buffsDebuffs.filter((bd) => bd.name !== name);
        logEntry = createActivityLogEntry(
          `${enemyName}'s ${name} was removed`,
          `Stacks: ${currentStacks}`,
          `Stacks: 0`,
          `Last stack of ${name} cleared`,
          existing.type === 'buff' ? 'buff' : 'debuff',
          {
            target: 'enemy',
            context: [
              { label: 'Effect', value: name },
              { label: 'Stacks', value: `${currentStacks} → 0` },
            ],
          },
        );
      } else {
        const newStacks = currentStacks - 1;
        nextBuffsDebuffs = [...buffsDebuffs];
        nextBuffsDebuffs[existingIndex] = { ...existing, stacks: newStacks };
        logEntry = existing.type === 'buff'
          ? buildBuffLogEntry(name, newStacks, target, enemyName, currentStacks)
          : buildDebuffLogEntry(name, newStacks, target, enemyName, currentStacks);
      }

      nextEnemies[enemyIndex] = {
        ...nextEnemies[enemyIndex],
        buffsDebuffs: nextBuffsDebuffs,
      };

      return {
        ...prevState,
        enemies: nextEnemies,
        activityLog: [...prevState.activityLog, logEntry],
      };
    });
  };

  const updateBuffDebuffStacks = (target: 'player' | 'enemy', enemyIndex: number, name: string, stacks: number) => {
    addBuffDebuff(target, enemyIndex, name, 'buff', stacks);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        turns,
        currentTurnIndex,
        turnPhase,
        setCurrentTurn,
        saveCurrentTurn,
        endPlayerTurn,
        beginTurn,
        endEnemyTurn,
        continueFromTurn,
        resetCurrentTurn,
        isLoading,
        error,
        updateGameState,
        syncEnemyIntentsGlobally,
        resetGameState,
        loadGameData,
        loadGameDataFromJson,
        saveGameData,
        downloadPlannerSaveJson,
        loadSavedGame,
        activeProject,
        saveProject,
        loadProjectFromJsonText,
        closeProject,
        toggleRelic,
        toggleCardSelection,
        playSelectedCards,
        moveSelectedCards,
        removeSelectedCards,
        spendEnergyOnSelected,
        deselectAllCards,
        addToActivityLog,
        drawCards,
        upgradeSelected,
        downgradeSelected,
        duplicateSelected,
        setSelectedCostZero,
        setSelectedCustomCost,
        transformSelectedType,
        toggleChangedSelected,
        transformSelectedFromDatabase,
        addCardFromDB,
        modifyPlayerHp,
        modifyPlayerBlock,
        modifyPlayerEnergy,
        modifyEnemyHp,
        modifyEnemyBlock,
        addBuffDebuff,
        removeBuffDebuff,
        reduceBuffDebuff,
        updateBuffDebuffStacks,
        combatTargetMode,
        setCombatTargetMode,
        combatTargetEnemyIndices,
        toggleCombatEnemyTarget,
        combatTargetSelf,
        toggleCombatTargetSelf,
        clearCombatTargets,
        decisionNodes,
        activeDecisionNodeId,
        forkDecisionBranch,
        jumpToDecisionNode,
        syncActiveDecisionNodeFromPlanner,
        forceActiveDecisionTimelineMainChain,
        deleteDecisionBranch,
        updateDecisionNodeLabel,
        updateDecisionNodeTimelineAccent,
        decisionTimelinePositions,
        setDecisionTimelineNodePosition,
        mergeDecisionTimelinePositions,
        applyDecisionBranchToPlanner,
        isApplyDecisionBranchToPlannerSynced,
        linkDecisionTimelineParent,
        unlinkDecisionTimelineBranch,
        updateDecisionNodeTurnPhase,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook to access the game state globally
 * @returns GameContextType object with gameState and utility functions
 */
export function useGameManager() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameManager must be used within a GameProvider');
  }
  return context;
}
