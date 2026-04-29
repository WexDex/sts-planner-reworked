(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/utils/gameHelpers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LANTERN_ENERGY_GIFT",
    ()=>LANTERN_ENERGY_GIFT,
    "LANTERN_RELIC_NAME",
    ()=>LANTERN_RELIC_NAME,
    "addCardToDeck",
    ()=>addCardToDeck,
    "addRelic",
    ()=>addRelic,
    "applyDamageWithModifiers",
    ()=>applyDamageWithModifiers,
    "applyVulnerable",
    ()=>applyVulnerable,
    "applyWeak",
    ()=>applyWeak,
    "calculateDamageByType",
    ()=>calculateDamageByType,
    "canTurnOffLantern",
    ()=>canTurnOffLantern,
    "cloneGameData",
    ()=>cloneGameData,
    "downloadGameData",
    ()=>downloadGameData,
    "exportGameData",
    ()=>exportGameData,
    "getCardsByType",
    ()=>getCardsByType,
    "getGameStats",
    ()=>getGameStats,
    "getPlayerMaxEnergy",
    ()=>getPlayerMaxEnergy,
    "getRelic",
    ()=>getRelic,
    "getTotalInitialEnergy",
    ()=>getTotalInitialEnergy,
    "healPlayer",
    ()=>healPlayer,
    "importGameData",
    ()=>importGameData,
    "loadFromFile",
    ()=>loadFromFile,
    "loadFromLocalStorage",
    ()=>loadFromLocalStorage,
    "removeCardFromDeck",
    ()=>removeCardFromDeck,
    "removeRelic",
    ()=>removeRelic,
    "resetPlayerHealth",
    ()=>resetPlayerHealth,
    "saveToLocalStorage",
    ()=>saveToLocalStorage,
    "setEnergy",
    ()=>setEnergy,
    "takeDamage",
    ()=>takeDamage
]);
function numericValue(value) {
    if (typeof value === 'number') return value;
    if (value && typeof value.base === 'number') return value.base;
    return 0;
}
async function loadFromFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${filePath}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading from file:', error);
        throw error;
    }
}
function saveToLocalStorage(key, data) {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw error;
    }
}
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}
function exportGameData(data) {
    return JSON.stringify(data, null, 2);
}
function importGameData(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        throw error;
    }
}
function downloadGameData(data, filename = 'game-save.json') {
    try {
        const jsonString = exportGameData(data);
        const blob = new Blob([
            jsonString
        ], {
            type: 'application/json'
        });
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
function takeDamage(player, damage) {
    return {
        ...player,
        hp: Math.max(0, player.hp - damage)
    };
}
function healPlayer(player, amount) {
    return {
        ...player,
        hp: Math.min(player.maxHp, player.hp + amount)
    };
}
function applyVulnerable(damage, modifiers) {
    return Math.floor(damage * modifiers.vulnerableMultiplier);
}
function applyWeak(damage, modifiers) {
    return Math.floor(damage * modifiers.weakMultiplier);
}
function calculateDamageByType(deck, type) {
    return deck.filter((card)=>card.name.includes(type)).reduce((total, card)=>total + numericValue(card.damage), 0);
}
function getCardsByType(deck, type) {
    return deck.filter((card)=>card.name.includes(type));
}
function addCardToDeck(deck, card) {
    return [
        ...deck,
        card
    ];
}
function removeCardFromDeck(deck, index) {
    return deck.filter((_, i)=>i !== index);
}
function addRelic(player, relic) {
    return {
        ...player,
        relics: [
            ...player.relics,
            relic
        ]
    };
}
function removeRelic(player, relicName) {
    return {
        ...player,
        relics: player.relics.filter((r)=>r.name !== relicName)
    };
}
function getRelic(player, relicName) {
    return player.relics.find((r)=>r.name === relicName);
}
function setEnergy(player, energy) {
    return {
        ...player,
        energy: {
            ...player.energy,
            base: energy
        }
    };
}
function getTotalInitialEnergy(player, turn) {
    let total = player.energy.base;
    if (turn === 1) {
        total += player.energy.turn1Bonus;
    }
    // Add energy bonuses from relic effects
    const energyBonus = player.relicEffects.filter((effect)=>effect.turn === turn && effect.effect.includes('energy')).reduce((sum)=>sum + 1, 0);
    return total + energyBonus;
}
const LANTERN_RELIC_NAME = "Lantern";
const LANTERN_ENERGY_GIFT = 1;
function getPlayerMaxEnergy(player) {
    return player.energy.base + (player.bonusEnergy ?? 0);
}
function canTurnOffLantern(player) {
    if (!player.activeRelics?.includes(LANTERN_RELIC_NAME)) return true;
    return (player.currentEnergy ?? 0) >= LANTERN_ENERGY_GIFT;
}
function cloneGameData(data) {
    return JSON.parse(JSON.stringify(data));
}
function getGameStats(gameState) {
    const totalDamage = gameState.deck.reduce((sum, card)=>sum + numericValue(card.damage), 0);
    const totalBlock = gameState.deck.reduce((sum, card)=>sum + numericValue(card.block), 0);
    const hpPercent = gameState.player.hp / gameState.player.maxHp * 100;
    return {
        totalDamageInDeck: totalDamage,
        totalBlockInDeck: totalBlock,
        totalRelics: gameState.player.relics.length,
        deckSize: gameState.deck.length,
        hpPercent
    };
}
function resetPlayerHealth(player) {
    return {
        ...player,
        hp: player.maxHp
    };
}
function applyDamageWithModifiers(player, baseDamage, isVulnerable = false, isWeak = false) {
    let damage = baseDamage;
    if (isVulnerable) {
        damage = applyVulnerable(damage, player.modifiers);
    }
    if (isWeak) {
        damage = applyWeak(damage, player.modifiers);
    }
    return takeDamage(player, damage);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/constants/colors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Effect and stat type definitions
__turbopack_context__.s([
    "ACTIVITY_LOG_COLORS",
    ()=>ACTIVITY_LOG_COLORS,
    "ACTIVITY_LOG_ICONS",
    ()=>ACTIVITY_LOG_ICONS,
    "CARD_TYPE_BG",
    ()=>CARD_TYPE_BG,
    "CARD_TYPE_COLORS",
    ()=>CARD_TYPE_COLORS,
    "EFFECT_BORDER",
    ()=>EFFECT_BORDER,
    "EFFECT_COLORS",
    ()=>EFFECT_COLORS,
    "EFFECT_COLORS_BG",
    ()=>EFFECT_COLORS_BG,
    "STAT_COLORS",
    ()=>STAT_COLORS,
    "STAT_COLORS_BG",
    ()=>STAT_COLORS_BG
]);
const EFFECT_COLORS = {
    // Negative effects
    weak: 'text-purple-400',
    vulnerable: 'text-red-500',
    frail: 'text-gray-400',
    wound: 'text-red-600',
    entangle: 'text-yellow-500',
    takedamage: 'text-red-500',
    poison: 'text-emerald-400',
    // Positive effects
    strength: 'text-orange-400',
    strength_buff: 'text-green-500',
    intangible: 'text-teal-400',
    energygain: 'text-yellow-400',
    draw: 'text-indigo-500',
    // Neutral effects
    damage: 'text-red-400',
    block: 'text-blue-400',
    heal: 'text-emerald-400',
    focus: 'text-sky-400',
    hpcost: 'text-rose-400'
};
const EFFECT_COLORS_BG = {
    weak: 'bg-purple-500/20',
    vulnerable: 'bg-red-500/20',
    frail: 'bg-gray-500/20',
    wound: 'bg-red-600/20',
    entangle: 'bg-yellow-500/20',
    takedamage: 'bg-red-500/20',
    poison: 'bg-emerald-500/20',
    strength: 'bg-orange-400/20',
    strength_buff: 'bg-green-500/20',
    intangible: 'bg-teal-400/20',
    energygain: 'bg-yellow-400/20',
    draw: 'bg-indigo-500/20',
    damage: 'bg-red-400/20',
    block: 'bg-blue-400/20',
    heal: 'bg-emerald-400/20',
    focus: 'bg-sky-400/20',
    hpcost: 'bg-rose-500/20'
};
const EFFECT_BORDER = {
    weak: 'border-purple-400',
    vulnerable: 'border-red-500',
    frail: 'border-gray-400',
    wound: 'border-red-600',
    entangle: 'border-yellow-500',
    takedamage: 'border-red-500',
    poison: 'border-emerald-400',
    strength: 'border-orange-400',
    strength_buff: 'border-green-500',
    intangible: 'border-teal-400',
    energygain: 'border-yellow-400',
    draw: 'border-indigo-500',
    damage: 'border-red-400',
    block: 'border-blue-400',
    heal: 'border-emerald-400',
    focus: 'border-sky-400',
    hpcost: 'border-rose-400'
};
const STAT_COLORS = {
    health: 'text-red-500',
    hp: 'text-rec-500',
    maxHp: 'text-red-400',
    attack: 'text-red-500',
    damage: 'text-red-500',
    block: 'text-blue-500',
    energy: 'text-yellow-500',
    strength: 'text-orange-500',
    weakness: 'text-purple-500',
    vulnerable: 'text-red-600',
    draw: 'text-indigo-500',
    intangible: 'text-teal-500'
};
const STAT_COLORS_BG = {
    health: 'bg-red-500/20',
    hp: 'bg-red-500/20',
    maxHp: 'bg-red-400/20',
    attack: 'bg-red-500/20',
    damage: 'bg-red-500/20',
    block: 'bg-blue-500/20',
    energy: 'bg-yellow-500/20',
    strength: 'bg-orange-500/20',
    weakness: 'bg-purple-500/20',
    vulnerable: 'bg-red-600/20',
    draw: 'bg-indigo-500/20',
    intangible: 'bg-teal-500/20'
};
const ACTIVITY_LOG_COLORS = {
    damage: {
        text: 'text-red-400',
        bg: 'bg-red-500/15',
        border: 'border-red-500/30',
        badge: 'bg-red-600/40'
    },
    heal: {
        text: 'text-green-400',
        bg: 'bg-green-500/15',
        border: 'border-green-500/30',
        badge: 'bg-green-600/40'
    },
    block: {
        text: 'text-blue-400',
        bg: 'bg-blue-500/15',
        border: 'border-blue-500/30',
        badge: 'bg-blue-600/40'
    },
    'block-lost': {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/15',
        border: 'border-cyan-500/30',
        badge: 'bg-cyan-600/40'
    },
    energy: {
        text: 'text-yellow-400',
        bg: 'bg-yellow-500/15',
        border: 'border-yellow-500/30',
        badge: 'bg-yellow-600/40'
    },
    buff: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-600/40'
    },
    debuff: {
        text: 'text-orange-400',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/30',
        badge: 'bg-orange-600/40'
    },
    'card-action': {
        text: 'text-purple-400',
        bg: 'bg-purple-500/15',
        border: 'border-purple-500/30',
        badge: 'bg-purple-600/40'
    },
    action: {
        text: 'text-indigo-400',
        bg: 'bg-indigo-500/15',
        border: 'border-indigo-500/30',
        badge: 'bg-indigo-600/40'
    },
    'state-change': {
        text: 'text-violet-400',
        bg: 'bg-violet-500/15',
        border: 'border-violet-500/30',
        badge: 'bg-violet-600/40'
    },
    system: {
        text: 'text-slate-400',
        bg: 'bg-slate-500/15',
        border: 'border-slate-500/30',
        badge: 'bg-slate-600/40'
    },
    info: {
        text: 'text-slate-300',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        badge: 'bg-slate-600/30'
    }
};
const ACTIVITY_LOG_ICONS = {
    damage: '⚔️',
    heal: '❤️',
    block: '🛡️',
    'block-lost': '💔',
    energy: '⚡',
    buff: '✨',
    debuff: '💀',
    'card-action': '🎴',
    action: '➡️',
    'state-change': '📊',
    system: '⚙️',
    info: 'ℹ️'
};
const CARD_TYPE_COLORS = {
    'Attack': 'text-red-500',
    'Skill': 'text-blue-500',
    'Power': 'text-purple-500',
    'Status': 'text-gray-500',
    'Curse': 'text-red-700'
};
const CARD_TYPE_BG = {
    'Attack': 'bg-red-500/20',
    'Skill': 'bg-blue-500/20',
    'Power': 'bg-purple-500/20',
    'Status': 'bg-gray-500/20',
    'Curse': 'bg-red-700/20'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/utils/activityLogger.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildActionLogEntry",
    ()=>buildActionLogEntry,
    "buildBlockLogEntry",
    ()=>buildBlockLogEntry,
    "buildBlockLostLogEntry",
    ()=>buildBlockLostLogEntry,
    "buildBuffLogEntry",
    ()=>buildBuffLogEntry,
    "buildDamageLogEntry",
    ()=>buildDamageLogEntry,
    "buildDebuffLogEntry",
    ()=>buildDebuffLogEntry,
    "buildDebuffRemovedLogEntry",
    ()=>buildDebuffRemovedLogEntry,
    "buildEnergyLogEntry",
    ()=>buildEnergyLogEntry,
    "buildHealLogEntry",
    ()=>buildHealLogEntry,
    "buildStateDiffLogEntry",
    ()=>buildStateDiffLogEntry,
    "createActivityLogEntry",
    ()=>createActivityLogEntry,
    "formatCardNames",
    ()=>formatCardNames,
    "formatCardNamesWithTypeColor",
    ()=>formatCardNamesWithTypeColor,
    "formatPileLabel",
    ()=>formatPileLabel,
    "formatPlayCardTargets",
    ()=>formatPlayCardTargets
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/constants/colors.ts [app-client] (ecmascript)");
;
function formatPileLabel(loc) {
    const map = {
        draw: 'Draw pile',
        discard: 'Discard',
        exhaust: 'Exhaust',
        hand: 'Hand',
        playedCards: 'Played'
    };
    return map[loc] ?? loc;
}
const formatCardNames = (cards)=>cards.map((card)=>card.name).join(', ');
const formatCardNamesWithTypeColor = (cards)=>cards.map((card)=>({
            name: card.name,
            type: card.type,
            colorClass: card.type && __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CARD_TYPE_COLORS"][card.type] || 'text-slate-300'
        }));
const createActivityLogEntry = (title, before, after, details, type = 'info', extras)=>({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date().toLocaleTimeString(),
        title,
        before,
        after,
        details,
        type,
        ...extras
    });
function formatPlayCardTargets(enemies, indices, includeSelf) {
    const parts = [];
    if (includeSelf) parts.push('Self');
    for (const i of indices){
        const name = enemies?.[i]?.name?.trim();
        parts.push(name && name.length > 0 ? name : `Enemy #${i + 1}`);
    }
    if (parts.length === 0) return null;
    return parts.join(' · ');
}
const buildActionLogEntry = (action, selected, extras)=>{
    const cardsInvolved = selected.map(({ card })=>({
            name: card.name,
            cardType: card.type
        }));
    const context = [
        ...extras?.context ?? []
    ];
    if (selected.length && !context.some((c)=>c.label === 'From')) {
        const pileCounts = new Map();
        for (const s of selected){
            const loc = s.location ?? 'unknown';
            pileCounts.set(loc, (pileCounts.get(loc) ?? 0) + 1);
        }
        const fromParts = [
            ...pileCounts.entries()
        ].map(([loc, n])=>`${formatPileLabel(loc)} ×${n}`);
        context.unshift({
            label: 'From',
            value: fromParts.join(' · ')
        });
    }
    if (extras?.toPile) {
        context.push({
            label: 'To',
            value: formatPileLabel(extras.toPile)
        });
    }
    if (extras?.playTargetsLabel) {
        const fromIdx = context.findIndex((c)=>c.label === 'From');
        const row = {
            label: 'Targets',
            value: extras.playTargetsLabel
        };
        if (fromIdx >= 0) {
            context.splice(fromIdx + 1, 0, row);
        } else {
            context.unshift(row);
        }
    }
    const nameList = formatCardNames(selected.map(({ card })=>card));
    return createActivityLogEntry(action, undefined, undefined, nameList ? `Cards: ${nameList}` : undefined, 'card-action', {
        cardsInvolved: cardsInvolved.length ? cardsInvolved : undefined,
        context: context.length ? context : undefined
    });
};
const buildStateDiffLogEntry = (action, before, after, details, extras)=>createActivityLogEntry(action, before, after, details, 'state-change', extras);
const buildDamageLogEntry = (target, damage, beforeHp, afterHp, enemyName, maxHp)=>{
    const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
    const context = [
        {
            label: 'Damage',
            value: String(damage)
        },
        {
            label: 'HP',
            value: maxHp != null && maxHp > 0 ? `${afterHp} / ${maxHp} (${Math.round(afterHp / maxHp * 100)}%)` : String(afterHp)
        }
    ];
    return createActivityLogEntry(`${targetLabel} took ${damage} damage`, `HP: ${beforeHp}`, `HP: ${afterHp}`, maxHp != null ? `${targetLabel} HP ${beforeHp} → ${afterHp} (max ${maxHp})` : undefined, 'damage', {
        target,
        context
    });
};
const buildHealLogEntry = (target, healAmount, beforeHp, afterHp, enemyName, maxHp)=>{
    const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
    const context = [
        {
            label: 'Healing',
            value: `+${healAmount}`
        },
        {
            label: 'HP',
            value: maxHp != null && maxHp > 0 ? `${afterHp} / ${maxHp} (${Math.round(afterHp / maxHp * 100)}%)` : String(afterHp)
        }
    ];
    return createActivityLogEntry(`${targetLabel} gained ${healAmount} HP`, `HP: ${beforeHp}`, `HP: ${afterHp}`, maxHp != null ? `${targetLabel} HP ${beforeHp} → ${afterHp} (max ${maxHp})` : undefined, 'heal', {
        target,
        context
    });
};
const buildBlockLogEntry = (target, blockAmount, beforeBlock, afterBlock, enemyName)=>{
    const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
    return createActivityLogEntry(`${targetLabel} gained ${blockAmount} block`, `Block: ${beforeBlock}`, `Block: ${afterBlock}`, `Block ${beforeBlock} → ${afterBlock} (+${blockAmount})`, 'block', {
        target,
        context: [
            {
                label: 'Block gained',
                value: String(blockAmount)
            },
            {
                label: 'Block total',
                value: `${beforeBlock} → ${afterBlock}`
            }
        ]
    });
};
const buildBlockLostLogEntry = (target, blockAmount, beforeBlock, afterBlock, enemyName)=>{
    const targetLabel = target === 'player' ? 'Your' : (enemyName || 'Enemy') + "'s";
    return createActivityLogEntry(`${targetLabel} block reduced by ${blockAmount}`, `Block: ${beforeBlock}`, `Block: ${afterBlock}`, `Block ${beforeBlock} → ${afterBlock} (−${blockAmount})`, 'block-lost', {
        target,
        context: [
            {
                label: 'Block lost',
                value: String(blockAmount)
            },
            {
                label: 'Block total',
                value: `${beforeBlock} → ${afterBlock}`
            }
        ]
    });
};
const buildEnergyLogEntry = (beforeEnergy, afterEnergy, options)=>{
    const delta = afterEnergy - beforeEnergy;
    const amt = Math.abs(delta);
    const title = options?.summary ?? (delta > 0 ? `Energy +${amt} (${beforeEnergy} → ${afterEnergy})` : delta < 0 ? `Energy −${amt} (${beforeEnergy} → ${afterEnergy})` : `Energy unchanged (${beforeEnergy})`);
    const context = [
        {
            label: 'Energy',
            value: `${beforeEnergy} → ${afterEnergy}`
        }
    ];
    if (options?.reason) context.push({
        label: 'Reason',
        value: options.reason
    });
    const cards = options?.cards;
    return createActivityLogEntry(title, `Energy: ${beforeEnergy}`, `Energy: ${afterEnergy}`, cards?.length ? `Cards: ${formatCardNames(cards)}` : undefined, 'energy', {
        cardsInvolved: cards?.length ? cards.map((c)=>({
                name: c.name,
                cardType: c.type
            })) : undefined,
        context
    });
};
const buildBuffLogEntry = (buffName, stacks, target, enemyName, previousStacks)=>{
    const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
    const action = previousStacks !== undefined ? 'updated' : 'gained';
    const details = previousStacks !== undefined ? `${previousStacks} → ${stacks} stacks` : `${targetLabel} gained ${stacks} stack(s) of ${buffName}`;
    return createActivityLogEntry(`${targetLabel} ${action} ${buffName}`, previousStacks !== undefined ? `Stacks: ${previousStacks}` : undefined, `Stacks: ${stacks}`, details, 'buff', {
        target,
        context: [
            {
                label: 'Effect',
                value: buffName
            },
            {
                label: 'Stacks',
                value: previousStacks !== undefined ? `${previousStacks} → ${stacks}` : String(stacks)
            }
        ]
    });
};
const buildDebuffLogEntry = (debuffName, stacks, target, enemyName, previousStacks)=>{
    const targetLabel = target === 'player' ? 'You' : enemyName || 'Enemy';
    const action = previousStacks !== undefined ? 'updated' : 'gained';
    const details = previousStacks !== undefined ? `${previousStacks} → ${stacks} stacks` : `${targetLabel} gained ${stacks} stack(s) of ${debuffName}`;
    return createActivityLogEntry(`${targetLabel} ${action} ${debuffName}`, previousStacks !== undefined ? `Stacks: ${previousStacks}` : undefined, `Stacks: ${stacks}`, details, 'debuff', {
        target,
        context: [
            {
                label: 'Effect',
                value: debuffName
            },
            {
                label: 'Stacks',
                value: previousStacks !== undefined ? `${previousStacks} → ${stacks}` : String(stacks)
            }
        ]
    });
};
const buildDebuffRemovedLogEntry = (debuffName, target, enemyName)=>{
    const targetLabel = target === 'player' ? 'Your' : (enemyName || 'Enemy') + "'s";
    return createActivityLogEntry(`${targetLabel} ${debuffName} removed`, undefined, undefined, undefined, 'debuff', {
        target,
        context: [
            {
                label: 'Removed',
                value: debuffName
            }
        ]
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/data/combatData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "combatData",
    ()=>combatData
]);
const combatData = {
    player: {
        hp: 30,
        maxHp: 68,
        energy: {
            base: 3,
            turn1Bonus: 1
        },
        combatType: 'Elite',
        combatName: 'Slavers',
        floor: 23,
        drawPerTurn: 5,
        modifiers: {
            vulnerableMultiplier: 1.75,
            weakMultiplier: 0.75
        },
        relics: [
            {
                name: 'Lantern',
                description: 'Gain 1 energy on Turn 1'
            },
            {
                name: 'Strike Dummy',
                description: "All Cards containing 'Strike' on the name gain +3 damage"
            },
            {
                name: 'Paper Phrog',
                description: 'Vulnerable enemies take 75% damage from attacks instead of 50%'
            },
            {
                name: 'Captains Wheel',
                description: 'Turn 3 gain 18 block'
            },
            {
                name: 'Incense Burner',
                description: 'Turn 5 gain 1 intangible'
            }
        ],
        relicEffects: [
            {
                turn: 1,
                effect: 'Gain 1 Energy'
            },
            {
                turn: 3,
                effect: 'Gain 18 Block'
            },
            {
                turn: 5,
                effect: 'Gain 1 Intangible'
            }
        ]
    },
    deck: [
        {
            "card_ID": "Carnage",
            "isUpgraded": true
        },
        {
            "card_ID": "Wild Strike"
        },
        {
            "card_ID": "Corruption"
        },
        {
            "card_ID": "Evolve"
        },
        {
            "card_ID": "Ascender's Bane"
        },
        {
            "card_ID": "Strike",
            "isUpgraded": true
        },
        {
            "card_ID": "Ghostly Armor"
        },
        {
            "card_ID": "Defend",
            "isUpgraded": true
        },
        {
            "card_ID": "Shrug It Off"
        },
        {
            "card_ID": "Defend",
            "isUpgraded": true
        },
        {
            "card_ID": "Bash",
            "isUpgraded": true
        },
        {
            "card_ID": "Havoc"
        },
        {
            "card_ID": "Strike",
            "isUpgraded": true
        },
        {
            "card_ID": "Defend",
            "isUpgraded": true
        },
        {
            "card_ID": "Strike",
            "isUpgraded": true
        },
        {
            "card_ID": "Wound"
        },
        {
            "card_ID": "Pommel Strike"
        },
        {
            "card_ID": "Defend",
            "isUpgraded": true
        },
        {
            "card_ID": "Strike",
            "isUpgraded": true
        },
        {
            "card_ID": "Armaments",
            "isUpgraded": true
        },
        {
            "card_ID": "Dark Embrace"
        },
        {
            "card_ID": "Pommel Strike"
        },
        {
            "card_ID": "Bloodletting"
        },
        {
            "card_ID": "Strike",
            "isUpgraded": true
        },
        {
            "card_ID": "Feel No Pain"
        }
    ],
    potions: [
        {
            name: 'Brutality',
            type: 'Potion',
            cost: {
                base: 0
            },
            takeDamage: {
                base: 1
            },
            draw: {
                base: 1
            },
            description: 'Gain +1 draw each turn. Lose 1 HP. Upgraded: gain Innate.',
            apply: {
                Innate: {
                    base: 1
                }
            }
        },
        {
            name: 'Feel No Pain',
            type: 'Potion',
            cost: {
                base: 0
            },
            blockOnExhaust: {
                base: 3,
                upgraded: 4
            },
            description: 'Whenever a card is Exhausted, gain 3 Block. (Cost 0)',
            isUpgraded: false
        },
        {
            name: 'Juggernaut',
            type: 'Potion',
            cost: {
                base: 2
            },
            damage: {
                base: 5,
                upgraded: 7
            },
            description: 'Deal damage equal to 5(7) each time you block.',
            apply: {
                Juggernaut: {
                    base: 1
                }
            }
        }
    ],
    enemies: [
        {
            name: 'Blue Slaver',
            hp: 50,
            maxHp: 50,
            intents: [
                {
                    turn: 1,
                    actions: [
                        {
                            type: 'attack',
                            value: 8
                        },
                        {
                            type: 'debuff',
                            effect: 'Weak',
                            value: 2
                        }
                    ]
                },
                {
                    turn: 2,
                    actions: [
                        {
                            type: 'attack',
                            value: 13
                        }
                    ]
                },
                {
                    turn: 3,
                    actions: [
                        {
                            type: 'attack',
                            value: 8
                        },
                        {
                            type: 'debuff',
                            effect: 'Weak',
                            value: 2
                        }
                    ]
                },
                {
                    turn: 4,
                    actions: [
                        {
                            type: 'attack',
                            value: 19
                        }
                    ]
                }
            ]
        },
        {
            name: 'Taskmaster',
            hp: 58,
            maxHp: 58,
            intents: [
                {
                    turn: 1,
                    actions: [
                        {
                            type: 'attack',
                            value: 7
                        },
                        {
                            type: 'status',
                            effect: 'Wound',
                            value: 3
                        },
                        {
                            type: 'buff',
                            effect: 'Strength',
                            value: 1
                        }
                    ]
                },
                {
                    turn: 2,
                    actions: [
                        {
                            type: 'attack',
                            value: 8
                        },
                        {
                            type: 'status',
                            effect: 'Wound',
                            value: 3
                        },
                        {
                            type: 'buff',
                            effect: 'Strength',
                            value: 1
                        }
                    ]
                },
                {
                    turn: 3,
                    actions: [
                        {
                            type: 'attack',
                            value: 9
                        },
                        {
                            type: 'status',
                            effect: 'Wound',
                            value: 3
                        },
                        {
                            type: 'buff',
                            effect: 'Strength',
                            value: 1
                        }
                    ]
                },
                {
                    turn: 4,
                    actions: [
                        {
                            type: 'attack',
                            value: 15
                        },
                        {
                            type: 'status',
                            effect: 'Wound',
                            value: 3
                        },
                        {
                            type: 'buff',
                            effect: 'Strength',
                            value: 1
                        }
                    ]
                }
            ]
        },
        {
            name: 'Red Slaver',
            hp: 51,
            maxHp: 51,
            intents: [
                {
                    turn: 1,
                    actions: [
                        {
                            type: 'attack',
                            value: 14
                        }
                    ]
                },
                {
                    turn: 2,
                    actions: [
                        {
                            type: 'debuff',
                            effect: 'Entangle',
                            description: 'Cannot play attacks next turn'
                        }
                    ]
                },
                {
                    turn: 3,
                    actions: [
                        {
                            type: 'attack',
                            value: 9
                        },
                        {
                            type: 'debuff',
                            effect: 'Vulnerable',
                            value: 2
                        }
                    ]
                },
                {
                    turn: 4,
                    actions: [
                        {
                            type: 'attack',
                            value: 21
                        }
                    ]
                }
            ]
        }
    ],
    draw: [],
    discard: [],
    exhaust: [],
    hand: [],
    playedCards: [],
    activityLog: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/data/STS_CARDS_DB.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = JSON.parse("{\"_meta\":{\"schemaVersion\":2,\"generatedAt\":\"2026-04-28T22:16:03.754Z\",\"title\":\"Slay the Spire — card database (full export)\",\"sources\":{\"primaryDb\":\"app/data/STS_CARDS_DB.json\",\"galleryOverlay\":\"app/data/card_design_gallery.json\",\"pipeline\":\"Slay the Spire Reference - Cards.csv → compile:sts-db → sts-description-enrichment\"},\"cardCount\":370,\"galleryFieldGuide\":{\"draw\":\"base/upgraded counts; conditioned + trigger when draw depends on If/Whenever (icons applied at render time).\",\"discardEffect\":\"Flat: base, upgraded, random, fromHand — no icon keys; UI maps discard to DISCARD_ICON; descriptions may use [DISCARD].\",\"orbInteractions\":\"Ordered verbs: channel/evoke/next/repeat; orbIcon + presentation only (no usesIcon).\",\"multiHit\":\"damageUsesMainField binds to STS damage; multiHitCount for numeric repeat 4 upgraded 5; multiHitEnergyScaling + formulaPresentation for X-scaling (e.g. Skewer, Multi-Cast).\",\"multiHitCount\":\"base upgraded when fixed repeat count; Skewer uses multiHitEnergyScaling instead.\",\"multiHitPresentation\":\"formulaPresentation template text for [DMG] times X vs times hit count.\",\"selfExhaustOnPlay\":\"Per tier: base and upgraded booleans — whether playing that copy exhausts the card.\",\"appliesDebuffs\":\"vulnerable, weak, poison etc. with base/upgraded stacks.\",\"heal\":\"Tiered HP healed — card face + [HEAL] placeholder.\",\"focus\":\"Defect Focus (+/- orbs) — card face + [FOCUS] placeholder.\",\"mantra\":\"Watcher Mantra — use [MANTRA] or [W] when card.mantra is set; [W] falls back to Weak if mantra absent.\",\"unplayable\":\"If true, cost orb is hidden (curses / specials).\",\"retain\":\"Tiered boolean — retain in hand.\"}},\"iconCatalog\":{\"LIGHTNING_ORB\":\"Lightning orb (channel / evoke visuals)\",\"FROST_ORB\":\"Frost orb\",\"DARK_ORB\":\"Dark orb\",\"PLASMA_ORB\":\"Plasma orb\",\"DRAW_ICON\":\"Draw from draw pile\",\"DISCARD_ICON\":\"Discard to discard pile\",\"EVOKE_ICON\":\"Evoke orb\",\"CONDITIONAL_MARKER\":\"Effect is conditional (paired with draw, energy, etc.)\",\"ANY_ORB\":\"Generic orb placeholder when color not fixed\",\"SAME_ORB_AS_EVOKED\":\"Echo orb type from prior evoke\",\"AOE_ICON\":\"Hits all enemies (paired with damage icon)\",\"RANDOM_ICON\":\"Random choice (e.g. discard target)\",\"AOE_DAMAGE\":\"AoE damage\",\"EXHAUST_SELF\":\"Exhaust (self)\"},\"attributeIconLinks\":[{\"attribute\":\"draw\",\"iconKey\":\"DRAW_ICON\",\"valueFrom\":[\"base\",\"upgraded\"]},{\"attribute\":\"discardEffect\",\"iconKey\":\"DISCARD_ICON\",\"valueFrom\":[\"base\",\"upgraded\"]},{\"attribute\":\"selfExhaustOnPlay\",\"iconKey\":\"EXHAUST_SELF\",\"valueFrom\":[\"base\",\"upgraded\"]}],\"cards\":{\"A Thousand Cuts\":{\"id\":\"A Thousand Cuts\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Whenever you play a card, Deal [DMG] damage to ALL enemies.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"damage\":{\"base\":1,\"upgraded\":2,\"conditioned\":true,\"trigger\":\"you play a card.\",\"target\":\"all enemies\"}},\"Accuracy\":{\"id\":\"Accuracy\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Shivs deal 4 additional damage.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"descriptionUpgraded\":\"Shivs deal 6 additional damage.\"},\"Acrobatics\":{\"id\":\"Acrobatics\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Draw [DRAW] cards. Discard [DISCARD] card.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"draw\":{\"base\":3,\"upgraded\":4},\"discardEffect\":{\"base\":1,\"random\":false,\"fromHand\":true},\"selfExhaustOnPlay\":{\"base\":false,\"upgraded\":false}},\"Adrenaline\":{\"id\":\"Adrenaline\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Gain [R] Energy. Draw [DRAW] cards. Exhaust.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Gain [R] Energy. Draw [DRAW] cards. Exhaust.\",\"cost\":{\"base\":0},\"draw\":{\"base\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"gainEnergy\":{\"base\":1,\"upgraded\":2}},\"After Image\":{\"id\":\"After Image\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Whenever you play a card, Gain [BLOCK] Block.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Innate. Whenever you play a card, Gain [BLOCK] Block.\",\"cost\":{\"base\":1},\"block\":{\"base\":1,\"conditioned\":true,\"trigger\":\"whenever you play a card.\"},\"innate\":{\"base\":false,\"upgraded\":true}},\"Aggregate\":{\"id\":\"Aggregate\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [B] for every 4 (3) cards in your draw pile.\",\"characters\":\"defect\",\"cost\":{\"base\":1}},\"Alchemize\":{\"id\":\"Alchemize\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Obtain a random potion. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"All for One\":{\"id\":\"All for One\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage. Put all cost 0 cards from your discard pile into your hand.\",\"characters\":\"defect\",\"cost\":{\"base\":2},\"damage\":{\"base\":10,\"upgraded\":14}},\"All-Out Attack\":{\"id\":\"All-Out Attack\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage to ALL enemies. Discard [DISCARD] card at random.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":10,\"upgraded\":14,\"target\":\"all enemies\"},\"discardEffect\":{\"base\":1,\"random\":true,\"fromHand\":true},\"selfExhaustOnPlay\":{\"base\":false,\"upgraded\":false}},\"Alpha\":{\"id\":\"Alpha\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Shuffle a Beta into your draw pile. Exhaust.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Innate. Shuffle a Beta into your draw pile. Exhaust.\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"innate\":{\"base\":false,\"upgraded\":true}},\"Amplify\":{\"id\":\"Amplify\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"This turn, your next Power card is played twice.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"This turn, your next 2 Power cards are played twice.\",\"cost\":{\"base\":1}},\"Anger\":{\"id\":\"Anger\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Add a copy of this card into your discard pile.\",\"characters\":\"ironclad\",\"cost\":{\"base\":0},\"damage\":{\"base\":6,\"upgraded\":8}},\"Apotheosis\":{\"id\":\"Apotheosis\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Upgrade ALL your cards for the rest of combat. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":2,\"upgraded\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"canUpgradeCards\":true},\"Apparition\":{\"id\":\"Apparition\",\"type\":\"Skill\",\"rarity\":\"Special\",\"description\":\"Ethereal. Gain 1 Intangible. Exhaust.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Gain 1 Intangible. Exhaust.\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"ethereal\":{\"base\":true,\"upgraded\":false}},\"Armaments\":{\"id\":\"Armaments\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Upgrade a card in your hand for the rest of combat.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Gain [BLOCK] Block. Upgrade all cards in your hand for the rest of combat.\",\"cost\":{\"base\":1},\"block\":{\"base\":5},\"canUpgradeCards\":true},\"Ascender's Bane\":{\"id\":\"Ascender's Bane\",\"type\":\"Curse\",\"rarity\":\"Special\",\"description\":\"Unplayable. Ethereal. Cannot be removed from your deck.\",\"characters\":\"curse\",\"unplayable\":true},\"Auto-Shields\":{\"id\":\"Auto-Shields\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"If you have no Block, Gain [BLOCK] Block.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"block\":{\"base\":11,\"upgraded\":15,\"conditioned\":true,\"trigger\":\"Have no Block.\"}},\"Backflip\":{\"id\":\"Backflip\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Draw [DRAW] cards.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":8},\"draw\":{\"base\":2}},\"Backstab\":{\"id\":\"Backstab\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Innate. Deal [DMG] damage. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"damage\":{\"base\":11,\"upgraded\":15},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"innate\":{\"base\":true,\"upgraded\":true}},\"Ball Lightning\":{\"id\":\"Ball Lightning\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Channel 1 Lightning.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":10},\"orbInteractions\":{\"verb\":\"channel\",\"orbtype\":\"lightning\",\"amount\":{\"base\":1}}},\"Bandage Up\":{\"id\":\"Bandage Up\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Heal 4 (6) HP. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"heal\":{\"base\":4,\"upgraded\":6}},\"Bane\":{\"id\":\"Bane\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. If the enemy has Poison, Deal [DMG] damage again.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":10}},\"Barrage\":{\"id\":\"Barrage\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage for each Channeled Orb.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":4,\"upgraded\":6}},\"Barricade\":{\"id\":\"Barricade\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Block is not removed at the start of your turn.\",\"characters\":\"ironclad\",\"cost\":{\"base\":3,\"upgraded\":2}},\"Bash\":{\"id\":\"Bash\",\"type\":\"Attack\",\"rarity\":\"Basic\",\"description\":\"Deal [DMG] damage. Apply [VULN] Vulnerable.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":8,\"upgraded\":10},\"appliesDebuffs\":{\"vulnerable\":{\"base\":2,\"upgraded\":3}},\"vulnerable\":{\"base\":2,\"upgraded\":3},\"selfExhaustOnPlay\":{\"base\":false,\"upgraded\":false}},\"Battle Hymn\":{\"id\":\"Battle Hymn\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the start of each turn, add a Smite into your hand.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Innate. At the start of each turn, add a Smite into your hand.\",\"cost\":{\"base\":1},\"innate\":{\"upgraded\":true,\"base\":false}},\"Battle Trance\":{\"id\":\"Battle Trance\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Draw [DRAW] cards. You cannot draw additional cards this turn.\",\"characters\":\"ironclad\",\"cost\":{\"base\":0},\"draw\":{\"base\":3,\"upgraded\":4}},\"Beam Cell\":{\"id\":\"Beam Cell\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Apply [VULN] Vulnerable.\",\"characters\":\"defect\",\"cost\":{\"base\":0},\"damage\":{\"base\":3,\"upgraded\":4},\"appliesDebuffs\":{\"vulnerable\":{\"base\":1,\"upgraded\":2}},\"vulnerable\":{\"base\":1,\"upgraded\":2}},\"Become Almighty\":{\"id\":\"Become Almighty\",\"type\":\"Power\",\"rarity\":\"Special\",\"description\":\"Gain 3 (4) Strength.\",\"characters\":\"colorless\",\"unplayable\":true},\"Berserk\":{\"id\":\"Berserk\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Gain 2 Vulnerable. At the start of your turn, gain [R].\",\"characters\":\"ironclad\",\"cost\":{\"base\":0},\"gainEnergy\":{\"base\":1,\"upgraded\":1},\"descriptionUpgraded\":\"Gain 1 Vulnerable. At the start of your turn, gain [R].\"},\"Beta\":{\"id\":\"Beta\",\"type\":\"Skill\",\"rarity\":\"Special\",\"description\":\"Shuffle an Omega into your draw pile. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":2,\"upgraded\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Biased Cognition\":{\"id\":\"Biased Cognition\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Gain [FOCUS] Focus. At the start of your turn, lose 1 Focus.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"focus\":{\"base\":4,\"upgraded\":5}},\"Bite\":{\"id\":\"Bite\",\"type\":\"Attack\",\"rarity\":\"Special\",\"description\":\"Deal [DMG] damage. Heal [HEAL] HP.\",\"characters\":\"colorless\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":8},\"heal\":{\"base\":2,\"upgraded\":3}},\"Blade Dance\":{\"id\":\"Blade Dance\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Add 3 (4) Shivs into your hand.\",\"characters\":\"silent\",\"cost\":{\"base\":1}},\"Blasphemy\":{\"id\":\"Blasphemy\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Enter Divinity. Die next turn. Exhaust.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Retain. Enter Divinity. Die next turn. Exhaust.\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"retain\":{\"base\":false,\"upgraded\":true}},\"Blind\":{\"id\":\"Blind\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Apply 2 Weak.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Apply 2 Weak to ALL enemies.\",\"cost\":{\"base\":0},\"appliesDebuffs\":{\"weak\":{\"base\":2,\"target\":{\"base\":\"single\",\"upgraded\":\"all enemies\"}}}},\"Blizzard\":{\"id\":\"Blizzard\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal damage equal to [DMG] times the number of Frost Channeled this combat to ALL enemies.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":2,\"upgraded\":3,\"target\":\"all enemies\"}},\"Blood for Blood\":{\"id\":\"Blood for Blood\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Costs 1 less [R] for each time you lose HP this combat. Deal [DMG] damage.\",\"characters\":\"ironclad\",\"cost\":{\"base\":4,\"upgraded\":3},\"damage\":{\"base\":18,\"upgraded\":22}},\"Bloodletting\":{\"id\":\"Bloodletting\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Lose 3 HP. Gain [R] Energy.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Lose 3 HP. Gain [R] Energy.\",\"cost\":{\"base\":0},\"hpcost\":{\"base\":3},\"gainEnergy\":{\"base\":2,\"upgraded\":3}},\"Bludgeon\":{\"id\":\"Bludgeon\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage.\",\"characters\":\"ironclad\",\"cost\":{\"base\":3},\"damage\":{\"base\":32,\"upgraded\":42}},\"Blur\":{\"id\":\"Blur\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. Block is not removed at the start of your next turn.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":8}},\"Body Slam\":{\"id\":\"Body Slam\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal damage equal to your Block.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1,\"upgraded\":0}},\"Boot Sequence\":{\"id\":\"Boot Sequence\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Innate. Gain [BLOCK] Block. Exhaust.\",\"characters\":\"defect\",\"cost\":{\"base\":0},\"block\":{\"base\":10,\"upgraded\":13},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"innate\":{\"base\":true,\"upgraded\":true}},\"Bouncing Flask\":{\"id\":\"Bouncing Flask\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Apply 3 Poison to a random enemy 3 times.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"appliesDebuffs\":{\"poison\":{\"base\":3}},\"descriptionUpgraded\":\"Apply 3 Poison to a random enemy 4 times.\"},\"Bowling Bash\":{\"id\":\"Bowling Bash\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage for each enemy in combat.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":10}},\"Brilliance\":{\"id\":\"Brilliance\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage. Deals additional damage equal to Mantra gained this combat.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":12,\"upgraded\":16}},\"Brutality\":{\"id\":\"Brutality\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"At the start of your turn, lose 1 HP and draw 1 card.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Innate. At the start of your turn, lose 1 HP and draw 1 card.\",\"cost\":{\"base\":0},\"draw\":{\"base\":1,\"conditioned\":true,\"trigger\":\"Start of turn : lose 1hp.\"},\"innate\":{\"upgraded\":true,\"base\":false}},\"Buffer\":{\"id\":\"Buffer\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Prevent the next time you would lose HP.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Prevent the next 2 times you would lose HP.\",\"cost\":{\"base\":2},\"buffer\":{\"base\":1,\"upgraded\":2}},\"Bullet Time\":{\"id\":\"Bullet Time\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"You cannot draw additional cards this turn. Reduce the cost of all cards in your hand to 0 this turn.\",\"characters\":\"silent\",\"cost\":{\"base\":3,\"upgraded\":2},\"costManipulation\":true},\"Bullseye\":{\"id\":\"Bullseye\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Apply 2 (3) Lock-On.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":8,\"upgraded\":11},\"lockon\":{\"base\":2,\"upgraded\":3}},\"Burn\":{\"id\":\"Burn\",\"type\":\"Status\",\"rarity\":\"Common\",\"description\":\"Unplayable. At the end of your turn, take 2 damage.\",\"characters\":\"status\",\"unplayable\":true},\"Burning Pact\":{\"id\":\"Burning Pact\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Exhaust 1 card. Draw [DRAW] cards.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"draw\":{\"base\":2,\"upgraded\":3}},\"Burst\":{\"id\":\"Burst\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"This turn, your next Skill is played twice.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"This turn, your next 2 Skills are played twice.\",\"cost\":{\"base\":1}},\"Calculated Gamble\":{\"id\":\"Calculated Gamble\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Discard your hand, then draw that many cards. Exhaust.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Discard your hand, then draw that many cards.\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":false}},\"Caltrops\":{\"id\":\"Caltrops\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you are attacked, Deal [DMG] damage back.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":3,\"upgraded\":5,\"conditioned\":true,\"trigger\":\"You get attacked.\"}},\"Capacitor\":{\"id\":\"Capacitor\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Gain 2 (3) Orb slots.\",\"characters\":\"defect\",\"cost\":{\"base\":1}},\"Carnage\":{\"id\":\"Carnage\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Ethereal. Deal [DMG] damage.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":20,\"upgraded\":28},\"ethereal\":{\"base\":true,\"upgraded\":true}},\"Carve Reality\":{\"id\":\"Carve Reality\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Add a Smite into your hand.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":10}},\"Catalyst\":{\"id\":\"Catalyst\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Double the enemy's Poison. Exhaust.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Triple the enemy's Poison. Exhaust.\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Chaos\":{\"id\":\"Chaos\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Channel 1 random Orb.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Channel 2 random Orbs.\",\"cost\":{\"base\":1},\"orbInteractions\":{\"verb\":\"channel\",\"orbtype\":\"random\",\"amount\":{\"base\":1,\"upgraded\":2}}},\"Charge Battery\":{\"id\":\"Charge Battery\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Next turn, gain [B].\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"block\":{\"base\":7,\"upgraded\":10}},\"Chill\":{\"id\":\"Chill\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Channel 1 Frost for each enemy in combat. Exhaust.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Innate. Channel 1 Frost for each enemy in combat. Exhaust.\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"orbInteractions\":{\"verb\":\"channel\",\"orbtype\":\"frost\",\"amount\":{\"base\":1}},\"innate\":{\"base\":false,\"upgraded\":true}},\"Choke\":{\"id\":\"Choke\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Whenever you play a card this turn, the enemy loses 3 (5) HP.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"damage\":{\"base\":12}},\"Chrysalis\":{\"id\":\"Chrysalis\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Shuffle 3 (5) random Skills into your draw pile. They cost 0 this combat. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"costManipulation\":true},\"Clash\":{\"id\":\"Clash\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Can only be played if every card in your hand is an Attack. Deal [DMG] damage.\",\"characters\":\"ironclad\",\"cost\":{\"base\":0},\"damage\":{\"base\":14,\"upgraded\":18,\"conditioned\":true,\"trigger\":\"Every card in your hand is an Attack.\"}},\"Claw\":{\"id\":\"Claw\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Increase the damage of ALL Claw cards by 2 this combat.\",\"characters\":\"defect\",\"cost\":{\"base\":0},\"damage\":{\"base\":3,\"upgraded\":5}},\"Cleave\":{\"id\":\"Cleave\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage to ALL enemies.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":8,\"upgraded\":11,\"target\":\"all enemies\"}},\"Cloak and Dagger\":{\"id\":\"Cloak and Dagger\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Add 1 Shiv into your hand.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Gain [BLOCK] Block. Add 2 Shivs into your hand.\",\"cost\":{\"base\":1},\"block\":{\"base\":6}},\"Clothesline\":{\"id\":\"Clothesline\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Apply [WEAK] Weak.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":12,\"upgraded\":14},\"appliesDebuffs\":{\"weak\":{\"base\":2,\"upgraded\":3}}},\"Clumsy\":{\"id\":\"Clumsy\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. Ethereal.\",\"characters\":\"curse\",\"unplayable\":true,\"ethereal\":{\"base\":true,\"upgraded\":true}},\"Cold Snap\":{\"id\":\"Cold Snap\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Channel 1 Frost.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":9},\"orbInteractions\":{\"orbtype\":\"frost\",\"amount\":{\"base\":1},\"verb\":\"channel\"}},\"Collect\":{\"id\":\"Collect\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Put a Miracle+ into your hand at the start of your next X turns. Exhaust.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Put a Miracle+ into your hand at the start of your next X+1 turns. Exhaust.\",\"xCost\":true,\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Combust\":{\"id\":\"Combust\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the end of your turn, lose 1 HP and Deal [DMG] damage to ALL enemies.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":5,\"upgraded\":7,\"conditioned\":true,\"trigger\":\"End of turn : lose 1 HP.\",\"target\":\"all enemies\"}},\"Compile Driver\":{\"id\":\"Compile Driver\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Draw 1 card for each unique Orb you have.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":10},\"draw\":{\"base\":1,\"conditioned\":true,\"trigger\":\"Draw one card for each unique Orb.\"}},\"Concentrate\":{\"id\":\"Concentrate\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Discard [DISCARD] cards. Gain [G] [G].\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"discardEffect\":{\"base\":3,\"upgraded\":2,\"random\":false,\"fromHand\":true}},\"Conclude\":{\"id\":\"Conclude\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage to ALL enemies. End your turn.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":12,\"upgraded\":16,\"target\":\"all enemies\"}},\"Conjure Blade\":{\"id\":\"Conjure Blade\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Shuffle an Expunger into your draw pile. Exhaust.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Shuffle an Expunger with X+1 into your draw pile. Exhaust.\",\"xCost\":true,\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Consecrate\":{\"id\":\"Consecrate\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage to ALL enemies.\",\"characters\":\"watcher\",\"cost\":{\"base\":0},\"damage\":{\"base\":5,\"upgraded\":8,\"target\":\"all enemies\"}},\"Consume\":{\"id\":\"Consume\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [FOCUS] Focus. Lose 1 Orb slot.\",\"characters\":\"defect\",\"cost\":{\"base\":2},\"focus\":{\"base\":2,\"upgraded\":3}},\"Coolheaded\":{\"id\":\"Coolheaded\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Channel 1 Frost. Draw [DRAW] card.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"draw\":{\"base\":1,\"upgraded\":2},\"selfExhaustOnPlay\":{\"base\":false,\"upgraded\":false},\"orbInteractions\":{\"verb\":\"channel\",\"orbtype\":\"frost\",\"amount\":{\"base\":1}}},\"Core Surge\":{\"id\":\"Core Surge\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage. Gain 1 Artifact. Exhaust.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":11,\"upgraded\":15},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"artifact\":{\"base\":1}},\"Corpse Explosion\":{\"id\":\"Corpse Explosion\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Apply 6 (9) Poison. When the enemy dies, deal damage equal to its Max HP to ALL enemies.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"appliesDebuffs\":{\"poison\":{\"base\":6,\"upgraded\":9}},\"selfExhaustOnPlay\":{\"base\":false,\"upgraded\":false}},\"Corruption\":{\"id\":\"Corruption\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Skills cost 0. Whenever you play a Skill, Exhaust it.\",\"characters\":\"ironclad\",\"cost\":{\"base\":3,\"upgraded\":2},\"costManipulation\":true},\"Creative AI\":{\"id\":\"Creative AI\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"At the start of your turn, add a random Power card into your hand.\",\"characters\":\"defect\",\"cost\":{\"base\":3,\"upgraded\":2}},\"Crescendo\":{\"id\":\"Crescendo\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Retain. Enter Wrath. Exhaust.\",\"characters\":\"watcher\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"retain\":{\"base\":true,\"upgraded\":true}},\"Crippling Cloud\":{\"id\":\"Crippling Cloud\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Apply 4 (7) Poison and 2 Weak to ALL enemies. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"appliesDebuffs\":{\"poison\":{\"base\":4,\"upgraded\":7},\"weak\":{\"base\":2,\"target\":{\"base\":\"all enemies\"}}}},\"Crush Joints\":{\"id\":\"Crush Joints\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. If the last card played this combat was a Skill, Apply [VULN] Vulnerable.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":8,\"upgraded\":10},\"appliesDebuffs\":{\"vulnerable\":{\"base\":1,\"upgraded\":2,\"conditioned\":true,\"trigger\":\"Last card played was a Skill.\"}},\"vulnerable\":{\"base\":1,\"upgraded\":2}},\"Curse of the Bell\":{\"id\":\"Curse of the Bell\",\"type\":\"Curse\",\"rarity\":\"Special\",\"description\":\"Unplayable. Cannot be removed from your deck.\",\"characters\":\"curse\",\"unplayable\":true},\"Cut Through Fate\":{\"id\":\"Cut Through Fate\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Scry 2 (3). Draw [DRAW] card.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":9},\"draw\":{\"base\":1},\"scry\":{\"base\":2,\"upgraded\":3}},\"Dagger Spray\":{\"id\":\"Dagger Spray\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage to ALL enemies twice.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":4,\"upgraded\":6},\"multiHit\":{\"damageUsesMainField\":true,\"multiHitCount\":{\"base\":2}}},\"Dagger Throw\":{\"id\":\"Dagger Throw\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Draw [DRAW] card. Discard [DISCARD] card.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":9,\"upgraded\":12},\"draw\":{\"base\":1},\"discardEffect\":{\"base\":1,\"random\":false,\"fromHand\":true}},\"Dark Embrace\":{\"id\":\"Dark Embrace\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever a card is Exhausted, draw 1 card.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2,\"upgraded\":1},\"draw\":{\"base\":1,\"conditioned\":true,\"trigger\":\"Whenever a card is Exhausted.\"}},\"Dark Shackles\":{\"id\":\"Dark Shackles\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Enemy loses 9 (15) Strength this turn. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"appliesDebuffs\":{\"losestrength\":{\"base\":9,\"upgraded\":15}}},\"Darkness\":{\"id\":\"Darkness\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Channel 1 Dark.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Channel 1 Dark. Trigger the passive ability of all Dark orbs.\",\"cost\":{\"base\":1},\"orbInteractions\":{\"orbtype\":\"dark\",\"amount\":{\"base\":1}}},\"Dash\":{\"id\":\"Dash\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. Deal [DMG] damage.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"damage\":{\"base\":10,\"upgraded\":13},\"block\":{\"base\":10,\"upgraded\":13}},\"Dazed\":{\"id\":\"Dazed\",\"type\":\"Status\",\"rarity\":\"Common\",\"description\":\"Unplayable. Ethereal.\",\"characters\":\"status\",\"unplayable\":true,\"ethereal\":{\"base\":true,\"upgraded\":false}},\"Deadly Poison\":{\"id\":\"Deadly Poison\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Apply 5 (7) Poison.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"appliesDebuffs\":{\"poison\":{\"base\":5,\"upgraded\":7}}},\"Decay\":{\"id\":\"Decay\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. At the end of your turn, take 2 damage.\",\"characters\":\"curse\",\"unplayable\":true},\"Deceive Reality\":{\"id\":\"Deceive Reality\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. Add a Safety into your hand.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":4,\"upgraded\":7}},\"Deep Breath\":{\"id\":\"Deep Breath\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Shuffle your discard pile into your draw pile. Draw [DRAW] card.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"draw\":{\"base\":1,\"upgraded\":2}},\"Defend_B\":{\"id\":\"Defend_B\",\"type\":\"Skill\",\"rarity\":\"Basic\",\"description\":\"Gain [BLOCK] Block.\",\"character\":\"defect\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":8}},\"Defend_G\":{\"id\":\"Defend_G\",\"type\":\"Skill\",\"rarity\":\"Basic\",\"description\":\"Gain [BLOCK] Block.\",\"character\":\"silent\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":8}},\"Defend_P\":{\"id\":\"Defend_P\",\"type\":\"Skill\",\"rarity\":\"Basic\",\"description\":\"Gain [BLOCK] Block.\",\"character\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":8}},\"Defend_R\":{\"id\":\"Defend_R\",\"type\":\"Skill\",\"rarity\":\"Basic\",\"description\":\"Gain [BLOCK] Block.\",\"character\":\"ironclad\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":8}},\"Deflect\":{\"id\":\"Deflect\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block.\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"block\":{\"base\":4,\"upgraded\":7}},\"Defragment\":{\"id\":\"Defragment\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Gain 1 (2) Focus.\",\"characters\":\"defect\",\"cost\":{\"base\":1}},\"Demon Form\":{\"id\":\"Demon Form\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"At the start of your turn, gain 2 (3) Strength.\",\"characters\":\"ironclad\",\"cost\":{\"base\":3}},\"Deus Ex Machina\":{\"id\":\"Deus Ex Machina\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Unplayable. When you draw this card, add 2 (3) Miracles to your hand and Exhaust.\",\"characters\":\"watcher\",\"unplayable\":true,\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Deva Form\":{\"id\":\"Deva Form\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Ethereal. At the start of your turn, gain [W] and increase this gain by 1.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"At the start of your turn, gain [W] and increase this gain by 1.\",\"cost\":{\"base\":3},\"mantra\":{\"base\":1,\"upgraded\":1}},\"Devotion\":{\"id\":\"Devotion\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"At the start of your turn, gain 2 (3) Mantra.\",\"characters\":\"watcher\",\"cost\":{\"base\":1}},\"Die Die Die\":{\"id\":\"Die Die Die\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage to ALL enemies. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":13,\"upgraded\":17},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Disarm\":{\"id\":\"Disarm\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Enemy loses 2 (3) Strength. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Discovery\":{\"id\":\"Discovery\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Choose 1 of 3 random cards to add into your hand. It costs 0 this turn. Exhaust.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Choose 1 of 3 random cards to add into your hand. It costs 0 this turn.\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Distraction\":{\"id\":\"Distraction\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Add a random Skill into your hand. It costs 0 this turn. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Dodge and Roll\":{\"id\":\"Dodge and Roll\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Next turn, Gain [BLOCK] Block.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"block\":{\"base\":4,\"upgraded\":6}},\"Doom and Gloom\":{\"id\":\"Doom and Gloom\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage to ALL enemies. Channel 1 Dark.\",\"characters\":\"defect\",\"cost\":{\"base\":2},\"damage\":{\"base\":10,\"upgraded\":14},\"orbInteractions\":[{\"verb\":\"channel\",\"orbIcon\":\"DARK_ORB\",\"presentation\":\"DARK_ORB 1\",\"amount\":{\"base\":1}}]},\"Doppelganger\":{\"id\":\"Doppelganger\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Next turn, draw X cards and gain X [G]. Exhaust.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Next turn, draw X+1 cards and gain X+1 [G]. Exhaust.\",\"xCost\":true,\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Double Energy\":{\"id\":\"Double Energy\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Double your Energy. Exhaust.\",\"characters\":\"defect\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Double Tap\":{\"id\":\"Double Tap\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"This turn, your next Attack is played twice.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"This turn, your next 2 Attacks are played twice.\",\"cost\":{\"base\":1}},\"Doubt\":{\"id\":\"Doubt\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. At the end of your turn, gain 1 Weak.\",\"characters\":\"curse\",\"unplayable\":true},\"Dramatic Entrance\":{\"id\":\"Dramatic Entrance\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Innate. Deal [DMG] damage to ALL enemies. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"damage\":{\"base\":8,\"upgraded\":12},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Dropkick\":{\"id\":\"Dropkick\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. If the enemy has Vulnerable, gain [R] and draw 1 card.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":5,\"upgraded\":8},\"draw\":{\"base\":1,\"conditioned\":true,\"trigger\":\"the enemy has Vulnerable\"}},\"Dual Wield\":{\"id\":\"Dual Wield\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Choose an Attack or Power card. Add a copy of that card into your hand.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Choose an Attack or Power card. Add 2 copies of that card into your hand.\",\"cost\":{\"base\":1}},\"Dualcast\":{\"id\":\"Dualcast\",\"type\":\"Skill\",\"rarity\":\"Basic\",\"description\":\"Evoke your next Orb twice.\",\"characters\":\"defect\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":false,\"upgraded\":false},\"orbInteractions\":{\"verb\":\"evoke\",\"amount\":{\"base\":2}}},\"Echo Form\":{\"id\":\"Echo Form\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Ethereal. The first card you play each turn is played twice.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"The first card you play each turn is played twice.\",\"cost\":{\"base\":3}},\"Electrodynamics\":{\"id\":\"Electrodynamics\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Lightning now hits ALL enemies. Channel 2 (3) Lightning.\",\"characters\":\"defect\",\"cost\":{\"base\":2}},\"Empty Body\":{\"id\":\"Empty Body\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Exit your Stance.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":7,\"upgraded\":10}},\"Empty Fist\":{\"id\":\"Empty Fist\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Exit your Stance.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":9,\"upgraded\":14}},\"Empty Mind\":{\"id\":\"Empty Mind\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Draw 2 (3) cards. Exit your Stance.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"draw\":{\"base\":2,\"upgraded\":3}},\"Endless Agony\":{\"id\":\"Endless Agony\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Whenever you draw this card, add a copy of it into your hand. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"damage\":{\"base\":4,\"upgraded\":6},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Enlightenment\":{\"id\":\"Enlightenment\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Reduce the cost of all cards in your hand to 1 this turn.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Reduce the cost of all cards in your hand to 1 this combat.\",\"cost\":{\"base\":0}},\"Entrench\":{\"id\":\"Entrench\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Double your Block.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2,\"upgraded\":1}},\"Envenom\":{\"id\":\"Envenom\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Whenever an Attack deals unblocked damage, apply 1 Poison.\",\"characters\":\"silent\",\"cost\":{\"base\":2,\"upgraded\":1}},\"Equilibrium\":{\"id\":\"Equilibrium\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. Retain your hand this turn.\",\"characters\":\"defect\",\"cost\":{\"base\":2},\"block\":{\"base\":13,\"upgraded\":16}},\"Eruption\":{\"id\":\"Eruption\",\"type\":\"Attack\",\"rarity\":\"Basic\",\"description\":\"Deal [DMG] damage. Enter Wrath.\",\"characters\":\"watcher\",\"cost\":{\"base\":2,\"upgraded\":1},\"damage\":{\"base\":9}},\"Escape Plan\":{\"id\":\"Escape Plan\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Draw 1 card. If you draw a Skill, Gain [BLOCK] Block.\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"block\":{\"base\":3,\"upgraded\":5},\"draw\":{\"base\":1}},\"Establishment\":{\"id\":\"Establishment\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Whenever a card is Retained, reduce its cost by 1 this combat.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Innate. Whenever a card is Retained, reduce its cost by 1 this combat.\",\"cost\":{\"base\":1}},\"Evaluate\":{\"id\":\"Evaluate\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Shuffle an Insight into your draw pile.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":6,\"upgraded\":10}},\"Eviscerate\":{\"id\":\"Eviscerate\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Costs 1 less [G] for each card discarded this turn. Deal [DMG] damage 3 times.\",\"characters\":\"silent\",\"cost\":{\"base\":3},\"damage\":{\"base\":7,\"upgraded\":9}},\"Evolve\":{\"id\":\"Evolve\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you draw a Status card, draw 1 card.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Whenever you draw a Status card, draw 2 cards.\",\"cost\":{\"base\":1},\"draw\":{\"base\":1,\"upgraded\":2,\"conditioned\":true,\"trigger\":\"Whenever you draw a Status card\"}},\"Exhume\":{\"id\":\"Exhume\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Put a card from your exhaust pile into your hand. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Expertise\":{\"id\":\"Expertise\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Draw cards until you have 6 (7) in your hand.\",\"characters\":\"silent\",\"cost\":{\"base\":1}},\"Expunger\":{\"id\":\"Expunger\",\"type\":\"Attack\",\"rarity\":\"Special\",\"description\":\"Deal [DMG] damage X times.\",\"characters\":\"colorless\",\"cost\":{\"base\":1},\"damage\":{\"base\":9,\"upgraded\":15}},\"Fame and Fortune\":{\"id\":\"Fame and Fortune\",\"type\":\"Skill\",\"rarity\":\"Special\",\"description\":\"Gain 25 (30) Gold.\",\"characters\":\"colorless\",\"unplayable\":true},\"Fasting\":{\"id\":\"Fasting\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Gain 3 (4) Strength. Gain 3 (4) Dexterity. Gain 1 less [W] at the start of each turn.\",\"characters\":\"watcher\",\"cost\":{\"base\":2}},\"Fear No Evil\":{\"id\":\"Fear No Evil\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. If the enemy intends to Attack, enter Calm.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":8,\"upgraded\":11}},\"Feed\":{\"id\":\"Feed\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage. If Fatal, raise your Max HP by 3 (4). Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":10,\"upgraded\":12},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Feel No Pain\":{\"id\":\"Feel No Pain\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever a card is Exhausted, Gain [BLOCK] Block.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"block\":{\"base\":3,\"upgraded\":4}},\"Fiend Fire\":{\"id\":\"Fiend Fire\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Exhaust your hand. Deal [DMG] damage for each card Exhausted. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":7,\"upgraded\":10},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Finesse\":{\"id\":\"Finesse\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. Draw 1 card.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"block\":{\"base\":2,\"upgraded\":4},\"draw\":{\"base\":1}},\"Finisher\":{\"id\":\"Finisher\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage for each Attack played this turn.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":8}},\"Fire Breathing\":{\"id\":\"Fire Breathing\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you draw a Status or Curse card, Deal [DMG] damage to ALL enemies.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":10}},\"Fission\":{\"id\":\"Fission\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Remove all your Orbs. Gain [B] and draw 1 card for each Orb removed. Exhaust.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Evoke all your Orbs. Gain [B] and draw 1 card for each Orb Evoked. Exhaust.\",\"cost\":{\"base\":0},\"draw\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Flame Barrier\":{\"id\":\"Flame Barrier\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. Whenever you are attacked this turn, Deal [DMG] damage back.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":4,\"upgraded\":6},\"block\":{\"base\":12,\"upgraded\":16}},\"Flash of Steel\":{\"id\":\"Flash of Steel\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Draw 1 card.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"damage\":{\"base\":3,\"upgraded\":6},\"draw\":{\"base\":1}},\"Flechettes\":{\"id\":\"Flechettes\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage for each Skill in your hand.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":4,\"upgraded\":6}},\"Flex\":{\"id\":\"Flex\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain 2 (4) Strength. At the end of this turn, lose 2 (4) Strength.\",\"characters\":\"ironclad\",\"cost\":{\"base\":0}},\"Flurry of Blows\":{\"id\":\"Flurry of Blows\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Whenever you change Stances, return this from the discard pile to your hand.\",\"characters\":\"watcher\",\"cost\":{\"base\":0},\"damage\":{\"base\":4,\"upgraded\":6}},\"Flying Knee\":{\"id\":\"Flying Knee\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Next turn, gain [G].\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":8,\"upgraded\":11}},\"Flying Sleeves\":{\"id\":\"Flying Sleeves\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Retain. Deal [DMG] damage twice.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":4,\"upgraded\":6}},\"Follow-Up\":{\"id\":\"Follow-Up\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. If the last card played this combat was an Attack, gain [W].\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":11}},\"Footwork\":{\"id\":\"Footwork\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Gain 2 (3) Dexterity.\",\"characters\":\"silent\",\"cost\":{\"base\":1}},\"Force Field\":{\"id\":\"Force Field\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Costs 1 less [B] for each Power card played this combat. Gain [BLOCK] Block.\",\"characters\":\"defect\",\"cost\":{\"base\":4},\"block\":{\"base\":12,\"upgraded\":16}},\"Foreign Influence\":{\"id\":\"Foreign Influence\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Choose 1 of 3 Attacks of any color to add into your hand. Exhaust.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Choose 1 of 3 Attacks of any color to add into your hand. It costs 0 this turn. Exhaust.\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Foresight\":{\"id\":\"Foresight\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the start of your turn, Scry 3 (4).\",\"characters\":\"watcher\",\"cost\":{\"base\":1}},\"Forethought\":{\"id\":\"Forethought\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Put a card from your hand to the bottom of your draw pile. It costs 0 until played.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Put any number of cards from your hand to the bottom of your draw pile. They cost 0 until played.\",\"cost\":{\"base\":0}},\"FTL\":{\"id\":\"FTL\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. If you have played less than 3 (4) cards this turn, draw 1 card.\",\"characters\":\"defect\",\"cost\":{\"base\":0},\"damage\":{\"base\":5,\"upgraded\":6},\"draw\":{\"base\":1,\"conditioned\":true,\"trigger\":\"you have played less than 3 (4) cards this turn\"}},\"Fusion\":{\"id\":\"Fusion\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Channel 1 Plasma.\",\"characters\":\"defect\",\"cost\":{\"base\":2,\"upgraded\":1},\"orbInteractions\":[{\"verb\":\"channel\",\"orbIcon\":\"PLASMA_ORB\",\"presentation\":\"PLASMA_ORB 1\",\"amount\":{\"base\":1}}]},\"Genetic Algorithm\":{\"id\":\"Genetic Algorithm\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. Permanently increase this card's Block by 2 (3). Exhaust.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"block\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Ghostly Armor\":{\"id\":\"Ghostly Armor\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Ethereal. Gain [BLOCK] Block.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"block\":{\"base\":10,\"upgraded\":13}},\"Glacier\":{\"id\":\"Glacier\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. Channel 2 Frost.\",\"characters\":\"defect\",\"cost\":{\"base\":2},\"block\":{\"base\":7,\"upgraded\":10},\"orbInteractions\":[{\"verb\":\"channel\",\"orbIcon\":\"FROST_ORB\",\"presentation\":\"FROST_ORB 2\",\"amount\":{\"base\":2}}]},\"Glass Knife\":{\"id\":\"Glass Knife\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage twice. Decrease the damage of this card by 2 this combat.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":8,\"upgraded\":12}},\"Go for the Eyes\":{\"id\":\"Go for the Eyes\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. If the enemy intends to attack, apply 1 (2) Weak.\",\"characters\":\"defect\",\"cost\":{\"base\":0},\"damage\":{\"base\":3,\"upgraded\":4},\"appliesDebuffs\":{\"weak\":{\"base\":1,\"upgraded\":2}}},\"Good Instincts\":{\"id\":\"Good Instincts\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"block\":{\"base\":6,\"upgraded\":9}},\"Grand Finale\":{\"id\":\"Grand Finale\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Can only be played if there are no cards in your draw pile. Deal [DMG] damage to ALL enemies.\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"damage\":{\"base\":50,\"upgraded\":60,\"conditioned\":true,\"trigger\":\"there are no cards in your draw pile\"}},\"Halt\":{\"id\":\"Halt\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. If you are in Wrath, gain 9 (14) additional Block.\",\"characters\":\"watcher\",\"cost\":{\"base\":0},\"block\":{\"base\":3,\"upgraded\":4}},\"Hand of Greed\":{\"id\":\"Hand of Greed\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage. If Fatal, gain 20 (25) Gold.\",\"characters\":\"colorless\",\"cost\":{\"base\":2},\"damage\":{\"base\":20,\"upgraded\":25}},\"Havoc\":{\"id\":\"Havoc\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Play the top card of your draw pile and Exhaust it.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1,\"upgraded\":0}},\"Headbutt\":{\"id\":\"Headbutt\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Put a card from your discard pile on top of your draw pile.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":9,\"upgraded\":12}},\"Heatsinks\":{\"id\":\"Heatsinks\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you play a Power card, draw 1 card.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Whenever you play a Power card, draw 2 cards.\",\"cost\":{\"base\":1},\"draw\":{\"base\":1,\"upgraded\":2,\"conditioned\":true,\"trigger\":\"Whenever you play a Power card\"}},\"Heavy Blade\":{\"id\":\"Heavy Blade\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Strength affects this card 3 (5) times.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":14}},\"Heel Hook\":{\"id\":\"Heel Hook\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. If the enemy has Weak, gain [G] and draw 1 card.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":5,\"upgraded\":8},\"draw\":{\"base\":1,\"conditioned\":true,\"trigger\":\"the enemy has Weak\"}},\"Hello World\":{\"id\":\"Hello World\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the start of your turn, add a random Common card into your hand.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Innate. At the start of your turn, add a random Common card into your hand.\",\"cost\":{\"base\":1}},\"Hemokinesis\":{\"id\":\"Hemokinesis\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Lose 2 HP. Deal [DMG] damage.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":15,\"upgraded\":20}},\"Hologram\":{\"id\":\"Hologram\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Put a card from your discard pile into your hand. Exhaust.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Gain [BLOCK] Block. Put a card from your discard pile into your hand.\",\"cost\":{\"base\":1},\"block\":{\"base\":3,\"upgraded\":5},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Hyperbeam\":{\"id\":\"Hyperbeam\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage to ALL enemies. Lose 3 Focus.\",\"characters\":\"defect\",\"cost\":{\"base\":2},\"damage\":{\"base\":26,\"upgraded\":34}},\"Immolate\":{\"id\":\"Immolate\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage to ALL enemies. Add a Burn into your discard pile.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":21,\"upgraded\":28}},\"Impatience\":{\"id\":\"Impatience\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"If you have no Attacks in your hand, draw 2 (3) cards.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"draw\":{\"base\":2,\"upgraded\":3}},\"Impervious\":{\"id\":\"Impervious\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Gain [BLOCK] Block. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"block\":{\"base\":30,\"upgraded\":40},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Indignation\":{\"id\":\"Indignation\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"If you are in Wrath, Apply [VULN] Vulnerable to ALL enemies, otherwise enter Wrath.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"appliesDebuffs\":{\"vulnerable\":{\"base\":3,\"upgraded\":5}},\"vulnerable\":{\"base\":3,\"upgraded\":5}},\"Infernal Blade\":{\"id\":\"Infernal Blade\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Add a random Attack into your hand. It costs 0 this turn. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Infinite Blades\":{\"id\":\"Infinite Blades\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the start of your turn, add a Shiv into your hand.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Innate. At the start of your turn, add a Shiv into your hand.\",\"cost\":{\"base\":1}},\"Inflame\":{\"id\":\"Inflame\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Gain 2 (3) Strength.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1}},\"Injury\":{\"id\":\"Injury\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable.\",\"characters\":\"curse\",\"unplayable\":true},\"Inner Peace\":{\"id\":\"Inner Peace\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"If you are in Calm, draw 3 (4) cards, otherwise enter Calm.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"draw\":{\"base\":3,\"upgraded\":4}},\"Insight\":{\"id\":\"Insight\",\"type\":\"Skill\",\"rarity\":\"Special\",\"description\":\"Retain. Draw 2 (3) cards. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"draw\":{\"base\":2,\"upgraded\":3},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Intimidate\":{\"id\":\"Intimidate\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Apply 1 (2) Weak to ALL enemies. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"appliesDebuffs\":{\"weak\":{\"base\":1,\"upgraded\":2}}},\"Iron Wave\":{\"id\":\"Iron Wave\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Deal [DMG] damage.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":5,\"upgraded\":7},\"block\":{\"base\":5,\"upgraded\":7}},\"J.A.X.\":{\"id\":\"J.A.X.\",\"type\":\"Skill\",\"rarity\":\"Special\",\"description\":\"Lose 3 HP. Gain 2 (3) Strength.\",\"characters\":\"colorless\",\"cost\":{\"base\":0}},\"Jack of All Trades\":{\"id\":\"Jack of All Trades\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Add 1 random Colorless card into your hand. Exhaust.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Add 2 random Colorless cards into your hand. Exhaust.\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Judgment\":{\"id\":\"Judgment\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"If the enemy has 30 (40) or less HP, set their HP to 0.\",\"characters\":\"watcher\",\"cost\":{\"base\":1}},\"Juggernaut\":{\"id\":\"Juggernaut\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Whenever you gain Block, Deal [DMG] damage to a random enemy.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":5,\"upgraded\":7}},\"Just Lucky\":{\"id\":\"Just Lucky\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Scry 1 (2). Gain [BLOCK] Block. Deal [DMG] damage.\",\"characters\":\"watcher\",\"cost\":{\"base\":0},\"damage\":{\"base\":3,\"upgraded\":4},\"block\":{\"base\":2,\"upgraded\":3}},\"Leap\":{\"id\":\"Leap\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"block\":{\"base\":9,\"upgraded\":12}},\"Leg Sweep\":{\"id\":\"Leg Sweep\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Apply 2 (3) Weak. Gain [BLOCK] Block.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"block\":{\"base\":11,\"upgraded\":14},\"appliesDebuffs\":{\"weak\":{\"base\":2,\"upgraded\":3}}},\"Lesson Learned\":{\"id\":\"Lesson Learned\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage. If Fatal, Upgrade a random card in your deck. Exhaust.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"damage\":{\"base\":10,\"upgraded\":13},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Like Water\":{\"id\":\"Like Water\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the end of your turn, if you are in Calm, Gain [BLOCK] Block.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":7}},\"Limit Break\":{\"id\":\"Limit Break\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Double your Strength. Exhaust.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Double your Strength.\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Live Forever\":{\"id\":\"Live Forever\",\"type\":\"Power\",\"rarity\":\"Special\",\"description\":\"Gain 6 (8) Plated Armor.\",\"characters\":\"colorless\",\"unplayable\":true},\"Loop\":{\"id\":\"Loop\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the start of your turn, trigger the passive ability of your next Orb.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"At the start of your turn, trigger the passive ability of your next Orb 2 times.\",\"cost\":{\"base\":1}},\"Machine Learning\":{\"id\":\"Machine Learning\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"At the start of your turn, draw 1 additional card.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Innate. At the start of your turn, draw 1 additional card.\",\"cost\":{\"base\":1}},\"Madness\":{\"id\":\"Madness\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Reduce the cost of a random card in your hand to 0 this combat. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Magnetism\":{\"id\":\"Magnetism\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"At the start of your turn, add a random Colorless card into your hand.\",\"characters\":\"colorless\",\"cost\":{\"base\":2,\"upgraded\":1}},\"Malaise\":{\"id\":\"Malaise\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Enemy loses X Strength. Apply X Weak. Exhaust.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Enemy loses X+1 Strength. Apply X+1 Weak. Exhaust.\",\"xCost\":true,\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Master of Strategy\":{\"id\":\"Master of Strategy\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Draw 3 (4) cards. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"draw\":{\"base\":3,\"upgraded\":4},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Master Reality\":{\"id\":\"Master Reality\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Whenever a card is created during combat, Upgrade it.\",\"characters\":\"watcher\",\"cost\":{\"base\":1,\"upgraded\":0}},\"Masterful Stab\":{\"id\":\"Masterful Stab\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Costs 1 additional [G] for each time you lose HP this combat. Deal [DMG] damage.\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"damage\":{\"base\":12,\"upgraded\":16}},\"Mayhem\":{\"id\":\"Mayhem\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"At the start of your turn, play the top card of your draw pile.\",\"characters\":\"colorless\",\"cost\":{\"base\":2,\"upgraded\":1}},\"Meditate\":{\"id\":\"Meditate\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Put a card from your discard pile into your hand and Retain it. Enter Calm. End your turn.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Put 2 cards from your discard pile into your hand and Retain them. Enter Calm. End your turn.\",\"cost\":{\"base\":1}},\"Melter\":{\"id\":\"Melter\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Remove all Block from the enemy. Deal [DMG] damage.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":10,\"upgraded\":14}},\"Mental Fortress\":{\"id\":\"Mental Fortress\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you change Stances, Gain [BLOCK] Block.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":4,\"upgraded\":6}},\"Metallicize\":{\"id\":\"Metallicize\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the end of your turn, Gain [BLOCK] Block.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"block\":{\"base\":3,\"upgraded\":4}},\"Metamorphosis\":{\"id\":\"Metamorphosis\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Shuffle 3 (5) random Attacks into your draw pile. They cost 0 this combat. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Meteor Strike\":{\"id\":\"Meteor Strike\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage. Channel 3 Plasma.\",\"characters\":\"defect\",\"cost\":{\"base\":5},\"damage\":{\"base\":24,\"upgraded\":30},\"orbInteractions\":[{\"verb\":\"channel\",\"orbIcon\":\"PLASMA_ORB\",\"presentation\":\"PLASMA_ORB 3\",\"amount\":{\"base\":3}}]},\"Mind Blast\":{\"id\":\"Mind Blast\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Innate. Deal damage equal to the number of cards in your draw pile.\",\"characters\":\"colorless\",\"cost\":{\"base\":2,\"upgraded\":1}},\"Miracle\":{\"id\":\"Miracle\",\"type\":\"Skill\",\"rarity\":\"Special\",\"description\":\"Retain. Gain [G] Energy. Exhaust.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Retain. Gain [G] Energy. Exhaust.\",\"cost\":{\"base\":0},\"gainEnergy\":{\"base\":1,\"upgraded\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Multi-Cast\":{\"id\":\"Multi-Cast\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Evoke your next Orb X times.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Evoke your next Orb X+1 times.\",\"xCost\":true,\"orbInteractions\":[],\"multiHit\":{\"damageUsesMainField\":true,\"multiHitEnergyScaling\":true,\"formulaPresentation\":{\"template\":\"[DMG] × X hits\",\"energySymbol\":\"X\"}}},\"Necronomicurse\":{\"id\":\"Necronomicurse\",\"type\":\"Curse\",\"rarity\":\"Special\",\"description\":\"Unplayable. There is no escape from this Curse.\",\"characters\":\"curse\",\"unplayable\":true},\"Neutralize\":{\"id\":\"Neutralize\",\"type\":\"Attack\",\"rarity\":\"Basic\",\"description\":\"Deal [DMG] damage. Apply 1 (2) Weak.\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"damage\":{\"base\":3,\"upgraded\":4},\"appliesDebuffs\":{\"weak\":{\"base\":1,\"upgraded\":2}}},\"Nightmare\":{\"id\":\"Nightmare\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Choose a card. Next turn, add 3 copies of that card into your hand. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":3,\"upgraded\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Nirvana\":{\"id\":\"Nirvana\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you Scry, Gain [BLOCK] Block.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":3,\"upgraded\":4}},\"Normality\":{\"id\":\"Normality\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. While in hand, you cannot play more than 3 cards this turn.\",\"characters\":\"curse\",\"unplayable\":true},\"Noxious Fumes\":{\"id\":\"Noxious Fumes\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the start of your turn, apply 2 (3) Poison to ALL enemies.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"appliesDebuffs\":{\"poison\":{\"base\":2,\"upgraded\":3}}},\"Offering\":{\"id\":\"Offering\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Lose 6 HP. Gain [R] [R]. Draw 3 (5) cards. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":0},\"draw\":{\"base\":3,\"upgraded\":5},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Omega\":{\"id\":\"Omega\",\"type\":\"Power\",\"rarity\":\"Special\",\"description\":\"At the end of your turn, Deal [DMG] damage to ALL enemies.\",\"characters\":\"colorless\",\"cost\":{\"base\":3},\"damage\":{\"base\":50,\"upgraded\":60}},\"Omniscience\":{\"id\":\"Omniscience\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Choose a card in your draw pile. Play the chosen card twice and exhaust it. Exhaust.\",\"characters\":\"watcher\",\"cost\":{\"base\":4,\"upgraded\":3}},\"Outmaneuver\":{\"id\":\"Outmaneuver\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Next turn, gain [G] [G].\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Next turn, gain [G] [G] [G].\",\"cost\":{\"base\":1}},\"Overclock\":{\"id\":\"Overclock\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Draw 2 (3) cards. Add a Burn into your discard pile.\",\"characters\":\"defect\",\"cost\":{\"base\":0},\"draw\":{\"base\":2,\"upgraded\":3}},\"Pain\":{\"id\":\"Pain\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. While in hand, lose 1 HP whenever you play another card.\",\"characters\":\"curse\",\"unplayable\":true},\"Panacea\":{\"id\":\"Panacea\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain 1 (2) Artifact. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Panache\":{\"id\":\"Panache\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Every time you play 5 cards in a single turn, Deal [DMG] damage to ALL enemies.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"damage\":{\"base\":10,\"upgraded\":14}},\"Panic Button\":{\"id\":\"Panic Button\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. You cannot gain Block from cards for 2 turns. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"block\":{\"base\":30,\"upgraded\":40},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Parasite\":{\"id\":\"Parasite\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. If transformed or removed from your deck, lose 3 Max HP.\",\"characters\":\"curse\",\"unplayable\":true},\"Perfected Strike\":{\"id\":\"Perfected Strike\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Deals 2 (3) additional damage for ALL your cards containing \\\"Strike\\\".\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":6}},\"Perseverance\":{\"id\":\"Perseverance\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Retain. Gain [BLOCK] Block. When Retained, increase its Block by 2 (3) this combat.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":7}},\"Phantasmal Killer\":{\"id\":\"Phantasmal Killer\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Next turn, your Attacks deal double damage.\",\"characters\":\"silent\",\"cost\":{\"base\":1,\"upgraded\":0}},\"Piercing Wail\":{\"id\":\"Piercing Wail\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"ALL enemies lose 6 (8) Strength this turn. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Poisoned Stab\":{\"id\":\"Poisoned Stab\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Apply 3 (4) Poison.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":8},\"appliesDebuffs\":{\"poison\":{\"base\":3,\"upgraded\":4}}},\"Pommel Strike\":{\"id\":\"Pommel Strike\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Draw 1 card.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Deal [DMG] damage. Draw 2 cards.\",\"cost\":{\"base\":1},\"damage\":{\"base\":9,\"upgraded\":10},\"draw\":{\"base\":1,\"upgraded\":2}},\"Power Through\":{\"id\":\"Power Through\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Add 2 Wounds into your hand. Gain [BLOCK] Block.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"block\":{\"base\":15,\"upgraded\":20}},\"Pray\":{\"id\":\"Pray\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain 3 (4) Mantra. Shuffle an Insight into your draw pile.\",\"characters\":\"watcher\",\"cost\":{\"base\":1}},\"Predator\":{\"id\":\"Predator\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Next turn, draw 2 additional cards.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"damage\":{\"base\":15,\"upgraded\":20}},\"Prepared\":{\"id\":\"Prepared\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Draw 1 card. Discard 1 card.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Draw 2 cards. Discard 2 cards.\",\"cost\":{\"base\":0},\"draw\":{\"base\":1,\"upgraded\":2},\"discardEffect\":{\"base\":1,\"upgraded\":2,\"random\":false,\"fromHand\":true}},\"Pressure Points\":{\"id\":\"Pressure Points\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Apply 8 (11) Mark. ALL enemies lose HP equal to their Mark.\",\"characters\":\"watcher\",\"cost\":{\"base\":1}},\"Pride\":{\"id\":\"Pride\",\"type\":\"Curse\",\"rarity\":\"Special\",\"description\":\"Innate. At the end of your turn, put a copy of this card on top of your draw pile. Exhaust.\",\"characters\":\"curse\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Prostrate\":{\"id\":\"Prostrate\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain 2 (3) Mantra. Gain [BLOCK] Block.\",\"characters\":\"watcher\",\"cost\":{\"base\":0},\"block\":{\"base\":4}},\"Protect\":{\"id\":\"Protect\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Retain. Gain [BLOCK] Block.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"block\":{\"base\":12,\"upgraded\":16}},\"Pummel\":{\"id\":\"Pummel\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage 4 (5) times. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":2},\"multiHit\":{\"damageUsesMainField\":true,\"multiHitCount\":{\"base\":4,\"upgraded\":5,\"energyScalingColumn\":false}},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Purity\":{\"id\":\"Purity\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Exhaust up to 3 (5) cards in your hand. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0}},\"Quick Slash\":{\"id\":\"Quick Slash\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Draw 1 card.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":8,\"upgraded\":12},\"draw\":{\"base\":1}},\"Rage\":{\"id\":\"Rage\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you play an Attack this turn, Gain [BLOCK] Block.\",\"characters\":\"ironclad\",\"cost\":{\"base\":0},\"block\":{\"base\":3,\"upgraded\":5}},\"Ragnarok\":{\"id\":\"Ragnarok\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage to a random enemy 5 (6) times.\",\"characters\":\"watcher\",\"cost\":{\"base\":3},\"damage\":{\"base\":5,\"upgraded\":6}},\"Rainbow\":{\"id\":\"Rainbow\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Channel 1 Lightning. Channel 1 Frost. Channel 1 Dark. Exhaust.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Channel 1 Lightning. Channel 1 Frost. Channel 1 Dark.\",\"cost\":{\"base\":2},\"orbInteractions\":[{\"verb\":\"channel\",\"orbIcon\":\"LIGHTNING_ORB\",\"presentation\":\"LIGHTNING_ORB 1\",\"amount\":{\"base\":1}}],\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Rampage\":{\"id\":\"Rampage\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Increase this card's damage by 5 (8) this combat.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":8}},\"Reach Heaven\":{\"id\":\"Reach Heaven\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Shuffle a Through Violence into your draw pile.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"damage\":{\"base\":10,\"upgraded\":15}},\"Reaper\":{\"id\":\"Reaper\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage to ALL enemies. Heal HP equal to unblocked damage. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":4,\"upgraded\":5},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Reboot\":{\"id\":\"Reboot\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Shuffle ALL your cards into your draw pile. Draw 4 (6) cards. Exhaust.\",\"characters\":\"defect\",\"cost\":{\"base\":0},\"draw\":{\"base\":4,\"upgraded\":6},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Rebound\":{\"id\":\"Rebound\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Put the next card you play this turn on top of your draw pile.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":9,\"upgraded\":12}},\"Reckless Charge\":{\"id\":\"Reckless Charge\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Shuffle a Dazed into your draw pile.\",\"characters\":\"ironclad\",\"cost\":{\"base\":0},\"damage\":{\"base\":7,\"upgraded\":10}},\"Recursion\":{\"id\":\"Recursion\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Evoke your next Orb. Channel the Orb that was just Evoked.\",\"characters\":\"defect\",\"cost\":{\"base\":1,\"upgraded\":0},\"orbInteractions\":[{\"verb\":\"evokeNext\",\"presentation\":\"Evoke next Orb\"},{\"verb\":\"channelReturned\",\"orbIcon\":\"SAME_ORB_AS_EVOKED\",\"presentation\":\"Channel orb evoked previously\"}]},\"Recycle\":{\"id\":\"Recycle\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Exhaust a card. Gain [B] equal to its cost.\",\"characters\":\"defect\",\"cost\":{\"base\":1,\"upgraded\":0}},\"Reflex\":{\"id\":\"Reflex\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Unplayable. If this card is discarded from your hand, draw 2 cards.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Unplayable. If this card is discarded from your hand, draw 3 cards.\",\"unplayable\":true,\"draw\":{\"base\":2,\"upgraded\":3,\"conditioned\":true,\"trigger\":\"this card is discarded from your hand\"}},\"Regret\":{\"id\":\"Regret\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. At the end of your turn, lose HP equal to the number of cards in your hand.\",\"characters\":\"curse\",\"unplayable\":true},\"Reinforced Body\":{\"id\":\"Reinforced Body\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block X times.\",\"characters\":\"defect\",\"xCost\":true,\"block\":{\"base\":7,\"upgraded\":11},\"multiHit\":{\"damageUsesMainField\":true,\"multiHitEnergyScaling\":true,\"formulaPresentation\":{\"template\":\"[DMG] × X hits\",\"energySymbol\":\"X\"}},\"selfExhaustOnPlay\":{\"base\":false,\"upgraded\":false}},\"Reprogram\":{\"id\":\"Reprogram\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Lose 1 (2) Focus. Gain 1 (2) Strength. Gain 1 (2) Dexterity.\",\"characters\":\"defect\",\"cost\":{\"base\":1}},\"Riddle with Holes\":{\"id\":\"Riddle with Holes\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage 5 times.\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"damage\":{\"base\":3,\"upgraded\":4}},\"Rip and Tear\":{\"id\":\"Rip and Tear\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage to a random enemy twice.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":9}},\"Ritual Dagger\":{\"id\":\"Ritual Dagger\",\"type\":\"Attack\",\"rarity\":\"Special\",\"description\":\"Deal [DMG] damage. If Fatal, permanently increase this card's damage by 3 (5). Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":1},\"damage\":{\"base\":15},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Rupture\":{\"id\":\"Rupture\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you lose HP from a card, gain 1 (2) Strength.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1}},\"Rushdown\":{\"id\":\"Rushdown\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you enter Wrath, draw 2 cards.\",\"characters\":\"watcher\",\"cost\":{\"base\":1,\"upgraded\":0},\"draw\":{\"base\":2,\"conditioned\":true,\"trigger\":\"Whenever you enter Wrath\"}},\"Sadistic Nature\":{\"id\":\"Sadistic Nature\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Whenever you apply a debuff to an enemy, they take 5 (7) damage.\",\"characters\":\"colorless\",\"cost\":{\"base\":0}},\"Safety\":{\"id\":\"Safety\",\"type\":\"Skill\",\"rarity\":\"Special\",\"description\":\"Retain. Gain [BLOCK] Block. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":1},\"block\":{\"base\":12,\"upgraded\":16},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Sanctity\":{\"id\":\"Sanctity\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. If the last card played this combat was a Skill, draw 2 cards.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":6,\"upgraded\":9},\"draw\":{\"base\":2,\"conditioned\":true,\"trigger\":\"the last card played this combat was a Skill\"}},\"Sands of Time\":{\"id\":\"Sands of Time\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Retain. Deal [DMG] damage. When Retained, lower its cost by 1 this combat.\",\"characters\":\"watcher\",\"cost\":{\"base\":4},\"damage\":{\"base\":20,\"upgraded\":26}},\"Sash Whip\":{\"id\":\"Sash Whip\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. If the last card played this combat was an Attack, apply 1 (2) Weak.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":8,\"upgraded\":10},\"appliesDebuffs\":{\"weak\":{\"base\":1,\"upgraded\":2}}},\"Scrape\":{\"id\":\"Scrape\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Draw 4 (5) cards. Discard all cards drawn this way that do not cost 0.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":10},\"draw\":{\"base\":4,\"upgraded\":5}},\"Scrawl\":{\"id\":\"Scrawl\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Draw cards until your hand is full. Exhaust.\",\"characters\":\"watcher\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Searing Blow\":{\"id\":\"Searing Blow\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Can be Upgraded any number of times.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":12,\"upgraded\":16}},\"Second Wind\":{\"id\":\"Second Wind\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Exhaust all non-Attack cards in your hand. Gain [BLOCK] Block for each card Exhausted.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":7}},\"Secret Technique\":{\"id\":\"Secret Technique\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Put a Skill from your draw pile into your hand. Exhaust.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Put a Skill from your draw pile into your hand.\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Secret Weapon\":{\"id\":\"Secret Weapon\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Put an Attack from your draw pile into your hand. Exhaust.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Put an Attack from your draw pile into your hand.\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Seeing Red\":{\"id\":\"Seeing Red\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [R] [R]. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Seek\":{\"id\":\"Seek\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Put 1 card from your draw pile into your hand. Exhaust.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Put 2 cards from your draw pile into your hand. Exhaust.\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Self Repair\":{\"id\":\"Self Repair\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the end of combat, heal 7 (10) HP.\",\"characters\":\"defect\",\"cost\":{\"base\":1}},\"Sentinel\":{\"id\":\"Sentinel\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. If this card is Exhausted, gain [R] [R].\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Gain [BLOCK] Block. If this card is Exhausted, gain [R] [R] [R].\",\"cost\":{\"base\":1},\"block\":{\"base\":5,\"upgraded\":8}},\"Setup\":{\"id\":\"Setup\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Put a card from your hand on top of your draw pile. It costs 0 until played.\",\"characters\":\"silent\",\"cost\":{\"base\":1,\"upgraded\":0}},\"Sever Soul\":{\"id\":\"Sever Soul\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Exhaust all non-Attack cards in your hand. Deal [DMG] damage.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":16,\"upgraded\":22}},\"Shame\":{\"id\":\"Shame\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. At the end of your turn, gain 1 Frail.\",\"characters\":\"curse\",\"unplayable\":true},\"Shiv\":{\"id\":\"Shiv\",\"type\":\"Attack\",\"rarity\":\"Special\",\"description\":\"Deal [DMG] damage. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"damage\":{\"base\":4,\"upgraded\":6},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Shockwave\":{\"id\":\"Shockwave\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Apply 3 (5) Weak and Vulnerable to ALL enemies. Exhaust.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"appliesDebuffs\":{\"weak\":{\"base\":3,\"upgraded\":5},\"vulnerable\":{\"base\":3,\"upgraded\":5}}},\"Shrug It Off\":{\"id\":\"Shrug It Off\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Draw 1 card.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"block\":{\"base\":8,\"upgraded\":11},\"draw\":{\"base\":1}},\"Signature Move\":{\"id\":\"Signature Move\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Can only be played if this is the only Attack in your hand. Deal [DMG] damage.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"damage\":{\"base\":30,\"upgraded\":40}},\"Simmering Fury\":{\"id\":\"Simmering Fury\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"At the start of your next turn, enter Wrath and draw 2 (3) cards.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"draw\":{\"base\":2,\"upgraded\":3}},\"Skewer\":{\"id\":\"Skewer\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage X times.\",\"characters\":\"silent\",\"xCost\":true,\"damage\":{\"base\":7,\"upgraded\":10},\"multiHit\":{\"damageUsesMainField\":true,\"multiHitEnergyScaling\":true,\"formulaPresentation\":{\"template\":\"[DMG] × X hits\",\"energySymbol\":\"X\"}}},\"Skim\":{\"id\":\"Skim\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Draw 3 (4) cards.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"draw\":{\"base\":3,\"upgraded\":4}},\"Slice\":{\"id\":\"Slice\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage.\",\"characters\":\"silent\",\"cost\":{\"base\":0},\"damage\":{\"base\":6,\"upgraded\":9}},\"Slimed\":{\"id\":\"Slimed\",\"type\":\"Status\",\"rarity\":\"Common\",\"description\":\"Exhaust.\",\"characters\":\"status\",\"cost\":{\"base\":1},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Smite\":{\"id\":\"Smite\",\"type\":\"Attack\",\"rarity\":\"Special\",\"description\":\"Retain. Deal [DMG] damage. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":1},\"damage\":{\"base\":12,\"upgraded\":16},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Sneaky Strike\":{\"id\":\"Sneaky Strike\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. If you have discarded a card this turn, gain [G] [G].\",\"characters\":\"silent\",\"cost\":{\"base\":2},\"damage\":{\"base\":12,\"upgraded\":16}},\"Spirit Shield\":{\"id\":\"Spirit Shield\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Gain [BLOCK] Block for each card in your hand.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"block\":{\"base\":3,\"upgraded\":4}},\"Spot Weakness\":{\"id\":\"Spot Weakness\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"If the enemy intends to attack, gain 3 (4) Strength.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1}},\"Stack\":{\"id\":\"Stack\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain Block equal to the number of cards in your discard pile.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Gain Block equal to the number of cards in your discard pile +3.\",\"cost\":{\"base\":1}},\"Static Discharge\":{\"id\":\"Static Discharge\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you receive unblocked attack damage, Channel 1 (2) Lightning.\",\"characters\":\"defect\",\"cost\":{\"base\":1}},\"Steam Barrier\":{\"id\":\"Steam Barrier\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Decrease this card's Block by 1 this combat.\",\"characters\":\"defect\",\"cost\":{\"base\":0},\"block\":{\"base\":6,\"upgraded\":8}},\"Storm\":{\"id\":\"Storm\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you play a Power card, Channel 1 Lightning.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Innate. Whenever you play a Power card, Channel 1 Lightning.\",\"cost\":{\"base\":1},\"orbInteractions\":[{\"verb\":\"channel\",\"orbIcon\":\"LIGHTNING_ORB\",\"presentation\":\"LIGHTNING_ORB 1\",\"amount\":{\"base\":1}}]},\"Storm of Steel\":{\"id\":\"Storm of Steel\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Discard your hand. Add 1 Shiv into your hand for each card discarded.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Discard your hand. Add 1 Shiv+ into your hand for each card discarded.\",\"cost\":{\"base\":1}},\"Streamline\":{\"id\":\"Streamline\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Reduce this card's cost by 1 this combat.\",\"characters\":\"defect\",\"cost\":{\"base\":2},\"damage\":{\"base\":15,\"upgraded\":20}},\"Strike_B\":{\"id\":\"Strike_B\",\"type\":\"Attack\",\"rarity\":\"Basic\",\"description\":\"Deal [DMG] damage.\",\"character\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":9}},\"Strike_G\":{\"id\":\"Strike_G\",\"type\":\"Attack\",\"rarity\":\"Basic\",\"description\":\"Deal [DMG] damage.\",\"character\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":9}},\"Strike_P\":{\"id\":\"Strike_P\",\"type\":\"Attack\",\"rarity\":\"Basic\",\"description\":\"Deal [DMG] damage.\",\"character\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":9}},\"Strike_R\":{\"id\":\"Strike_R\",\"type\":\"Attack\",\"rarity\":\"Basic\",\"description\":\"Deal [DMG] damage.\",\"character\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":9}},\"Study\":{\"id\":\"Study\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the end of your turn, shuffle an Insight into your draw pile.\",\"characters\":\"watcher\",\"cost\":{\"base\":2,\"upgraded\":1}},\"Sucker Punch\":{\"id\":\"Sucker Punch\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Apply 1 (2) Weak.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":7,\"upgraded\":9},\"appliesDebuffs\":{\"weak\":{\"base\":1,\"upgraded\":2}}},\"Sunder\":{\"id\":\"Sunder\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. If this kills an enemy, gain [B] [B] [B].\",\"characters\":\"defect\",\"cost\":{\"base\":3},\"damage\":{\"base\":24,\"upgraded\":32}},\"Survivor\":{\"id\":\"Survivor\",\"type\":\"Skill\",\"rarity\":\"Basic\",\"description\":\"Gain [BLOCK] Block. Discard 1 card.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"block\":{\"base\":8,\"upgraded\":11},\"discardEffect\":{\"base\":1,\"random\":false,\"fromHand\":true}},\"Sweeping Beam\":{\"id\":\"Sweeping Beam\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage to ALL enemies. Draw 1 card.\",\"characters\":\"defect\",\"cost\":{\"base\":1},\"damage\":{\"base\":6,\"upgraded\":9},\"draw\":{\"base\":1}},\"Swift Strike\":{\"id\":\"Swift Strike\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"damage\":{\"base\":7,\"upgraded\":10}},\"Swivel\":{\"id\":\"Swivel\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain [BLOCK] Block. The next Attack you play costs 0.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"block\":{\"base\":8,\"upgraded\":11}},\"Sword Boomerang\":{\"id\":\"Sword Boomerang\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage to a random enemy 3 (4) times.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":3}},\"Tactician\":{\"id\":\"Tactician\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Unplayable. If this card is discarded from your hand, gain [G].\",\"characters\":\"silent\",\"descriptionUpgraded\":\"Unplayable. If this card is discarded from your hand, gain [G] [G].\",\"unplayable\":true},\"Talk to the Hand\":{\"id\":\"Talk to the Hand\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Whenever you attack this enemy, Gain [BLOCK] Block. Exhaust.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":5,\"upgraded\":7},\"block\":{\"base\":2,\"upgraded\":3},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Tantrum\":{\"id\":\"Tantrum\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage 3 (4) times. Enter Wrath. Shuffle this card into your draw pile.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"damage\":{\"base\":3},\"multiHit\":{\"damageUsesMainField\":true,\"multiHitCount\":{\"base\":3,\"upgraded\":4,\"energyScalingColumn\":false}}},\"Tempest\":{\"id\":\"Tempest\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Channel X Lightning. Exhaust.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Channel X+1 Lightning. Exhaust.\",\"xCost\":true,\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Terror\":{\"id\":\"Terror\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Apply [VULN] Vulnerable. Exhaust.\",\"characters\":\"silent\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true},\"appliesDebuffs\":{\"vulnerable\":{\"base\":99}}},\"The Bomb\":{\"id\":\"The Bomb\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"At the end of 3 turns, Deal [DMG] damage to ALL enemies.\",\"characters\":\"colorless\",\"cost\":{\"base\":2},\"damage\":{\"base\":40,\"upgraded\":50}},\"Thinking Ahead\":{\"id\":\"Thinking Ahead\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Draw 2 cards. Put a card from your hand on top of your draw pile. Exhaust.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Draw 2 cards. Put a card from your hand on top of your draw pile.\",\"cost\":{\"base\":0},\"draw\":{\"base\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Third Eye\":{\"id\":\"Third Eye\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Scry 3 (5).\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"block\":{\"base\":7,\"upgraded\":9}},\"Through Violence\":{\"id\":\"Through Violence\",\"type\":\"Attack\",\"rarity\":\"Special\",\"description\":\"Retain. Deal [DMG] damage. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"damage\":{\"base\":20,\"upgraded\":30},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Thunder Strike\":{\"id\":\"Thunder Strike\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage to a random enemy for each Lightning Channeled this combat.\",\"characters\":\"defect\",\"cost\":{\"base\":3},\"damage\":{\"base\":7,\"upgraded\":9}},\"Thunderclap\":{\"id\":\"Thunderclap\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage and Apply [VULN] Vulnerable to ALL enemies.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":4,\"upgraded\":7}},\"Tools of the Trade\":{\"id\":\"Tools of the Trade\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"At the start of your turn, draw 1 card and discard 1 card.\",\"characters\":\"silent\",\"cost\":{\"base\":1,\"upgraded\":0},\"draw\":{\"base\":1},\"discardEffect\":{\"base\":1,\"random\":false,\"fromHand\":true}},\"Tranquility\":{\"id\":\"Tranquility\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Retain. Enter Calm. Exhaust.\",\"characters\":\"watcher\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Transmutation\":{\"id\":\"Transmutation\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Add X random Colorless cards into your hand. They cost 0 this turn. Exhaust.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Add X random Upgraded Colorless cards into your hand. They cost 0 this turn. Exhaust.\",\"xCost\":true,\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Trip\":{\"id\":\"Trip\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Apply [VULN] Vulnerable.\",\"characters\":\"colorless\",\"descriptionUpgraded\":\"Apply [VULN] Vulnerable to ALL enemies.\",\"cost\":{\"base\":0}},\"True Grit\":{\"id\":\"True Grit\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [BLOCK] Block. Exhaust 1 card at random.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Gain [BLOCK] Block. Exhaust 1 card.\",\"cost\":{\"base\":1},\"block\":{\"base\":7,\"upgraded\":9}},\"TURBO\":{\"id\":\"TURBO\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Gain [B] [B]. Add a Void into your discard pile.\",\"characters\":\"defect\",\"descriptionUpgraded\":\"Gain [B] [B] [B]. Add a Void into your discard pile.\",\"cost\":{\"base\":0}},\"Twin Strike\":{\"id\":\"Twin Strike\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage twice.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":5,\"upgraded\":7}},\"Unload\":{\"id\":\"Unload\",\"type\":\"Attack\",\"rarity\":\"Rare\",\"description\":\"Deal [DMG] damage. Discard all non-Attack cards in your hand.\",\"characters\":\"silent\",\"cost\":{\"base\":1},\"damage\":{\"base\":14,\"upgraded\":18}},\"Uppercut\":{\"id\":\"Uppercut\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Apply 1 (2) Weak. Apply [VULN] Vulnerable.\",\"characters\":\"ironclad\",\"cost\":{\"base\":2},\"damage\":{\"base\":13},\"appliesDebuffs\":{\"vulnerable\":{\"base\":1,\"upgraded\":2},\"weak\":{\"base\":1,\"upgraded\":2}},\"vulnerable\":{\"base\":1,\"upgraded\":2}},\"Vault\":{\"id\":\"Vault\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Take an extra turn after this one. End your turn. Exhaust.\",\"characters\":\"watcher\",\"cost\":{\"base\":3,\"upgraded\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Vigilance\":{\"id\":\"Vigilance\",\"type\":\"Skill\",\"rarity\":\"Basic\",\"description\":\"Gain [BLOCK] Block. Enter Calm.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"block\":{\"base\":8,\"upgraded\":12}},\"Violence\":{\"id\":\"Violence\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Put 3 (4) random Attacks from your draw pile into your hand. Exhaust.\",\"characters\":\"colorless\",\"cost\":{\"base\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Void\":{\"id\":\"Void\",\"type\":\"Status\",\"rarity\":\"Common\",\"description\":\"Unplayable. Ethereal. Whenever this card is drawn, lose 1 Energy.\",\"characters\":\"status\",\"unplayable\":true},\"Wallop\":{\"id\":\"Wallop\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Gain Block equal to unblocked damage dealt.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"damage\":{\"base\":9,\"upgraded\":12}},\"Warcry\":{\"id\":\"Warcry\",\"type\":\"Skill\",\"rarity\":\"Common\",\"description\":\"Draw 1 card. Put a card from your hand onto the top of your draw pile. Exhaust.\",\"characters\":\"ironclad\",\"descriptionUpgraded\":\"Draw 2 cards. Put a card from your hand onto the top of your draw pile. Exhaust.\",\"cost\":{\"base\":0},\"draw\":{\"base\":1,\"upgraded\":2},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Wave of the Hand\":{\"id\":\"Wave of the Hand\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Whenever you gain Block this turn, apply 1 (2) Weak to ALL enemies.\",\"characters\":\"watcher\",\"cost\":{\"base\":1},\"appliesDebuffs\":{\"weak\":{\"base\":1,\"upgraded\":2}}},\"Weave\":{\"id\":\"Weave\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Whenever you Scry, return this from the discard pile to your Hand.\",\"characters\":\"watcher\",\"cost\":{\"base\":0},\"damage\":{\"base\":4,\"upgraded\":6}},\"Well-Laid Plans\":{\"id\":\"Well-Laid Plans\",\"type\":\"Power\",\"rarity\":\"Uncommon\",\"description\":\"At the end of your turn, Retain up to 1 card.\",\"characters\":\"silent\",\"descriptionUpgraded\":\"At the end of your turn, Retain up to 2 cards.\",\"cost\":{\"base\":1}},\"Wheel Kick\":{\"id\":\"Wheel Kick\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage. Draw 2 cards.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"damage\":{\"base\":15,\"upgraded\":20},\"draw\":{\"base\":2}},\"Whirlwind\":{\"id\":\"Whirlwind\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Deal [DMG] damage to ALL enemies X times.\",\"characters\":\"ironclad\",\"xCost\":true,\"damage\":{\"base\":5,\"upgraded\":8},\"multiHit\":{\"damageUsesMainField\":true,\"multiHitEnergyScaling\":true,\"formulaPresentation\":{\"template\":\"[DMG] × X hits\",\"energySymbol\":\"X\"}}},\"White Noise\":{\"id\":\"White Noise\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Add a random Power card into your hand. It costs 0 this turn. Exhaust.\",\"characters\":\"defect\",\"cost\":{\"base\":1,\"upgraded\":0},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Wild Strike\":{\"id\":\"Wild Strike\",\"type\":\"Attack\",\"rarity\":\"Common\",\"description\":\"Deal [DMG] damage. Shuffle a Wound into your draw pile.\",\"characters\":\"ironclad\",\"cost\":{\"base\":1},\"damage\":{\"base\":12,\"upgraded\":17}},\"Windmill Strike\":{\"id\":\"Windmill Strike\",\"type\":\"Attack\",\"rarity\":\"Uncommon\",\"description\":\"Retain. Deal [DMG] damage. When Retained, increase its damage by 4 (5) this combat.\",\"characters\":\"watcher\",\"cost\":{\"base\":2},\"damage\":{\"base\":7,\"upgraded\":10}},\"Wish\":{\"id\":\"Wish\",\"type\":\"Skill\",\"rarity\":\"Rare\",\"description\":\"Choose one: Gain 6 (8) Plated Armor, 3 (4) Strength, or 25 (30) Gold. Exhaust.\",\"characters\":\"watcher\",\"cost\":{\"base\":3},\"selfExhaustOnPlay\":{\"base\":true,\"upgraded\":true}},\"Worship\":{\"id\":\"Worship\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Gain 5 Mantra.\",\"characters\":\"watcher\",\"descriptionUpgraded\":\"Retain. Gain 5 Mantra.\",\"cost\":{\"base\":2}},\"Wound\":{\"id\":\"Wound\",\"type\":\"Status\",\"rarity\":\"Common\",\"description\":\"Unplayable.\",\"characters\":\"status\",\"unplayable\":true},\"Wraith Form\":{\"id\":\"Wraith Form\",\"type\":\"Power\",\"rarity\":\"Rare\",\"description\":\"Gain 2 (3) Intangible. At the end of your turn, lose 1 Dexterity.\",\"characters\":\"silent\",\"cost\":{\"base\":3}},\"Wreath of Flame\":{\"id\":\"Wreath of Flame\",\"type\":\"Skill\",\"rarity\":\"Uncommon\",\"description\":\"Your next Attack deals 5 (8) additional damage.\",\"characters\":\"watcher\",\"cost\":{\"base\":1}},\"Writhe\":{\"id\":\"Writhe\",\"type\":\"Curse\",\"rarity\":\"Curse\",\"description\":\"Unplayable. Innate.\",\"characters\":\"curse\",\"unplayable\":true},\"Zap\":{\"id\":\"Zap\",\"type\":\"Skill\",\"rarity\":\"Basic\",\"description\":\"Channel 1 Lightning.\",\"characters\":\"defect\",\"cost\":{\"base\":1,\"upgraded\":0},\"orbInteractions\":[{\"verb\":\"channel\",\"orbIcon\":\"LIGHTNING_ORB\",\"presentation\":\"LIGHTNING_ORB 1\",\"amount\":{\"base\":1}}]}}}");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/stsRecord.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStsCardsRecord",
    ()=>getStsCardsRecord,
    "listStsCardIdsSorted",
    ()=>listStsCardIdsSorted,
    "pickRandomStsCardIds",
    ()=>pickRandomStsCardIds
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$STS_CARDS_DB$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/STS_CARDS_DB.json.[json].cjs [app-client] (ecmascript)");
;
function getStsCardsRecord() {
    const root = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$STS_CARDS_DB$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    if (root.cards && typeof root.cards === "object" && !Array.isArray(root.cards)) {
        return root.cards;
    }
    const out = {};
    for (const [k, v] of Object.entries(root)){
        if (k.startsWith("_") || k === "iconCatalog") continue;
        if (v && typeof v === "object" && !Array.isArray(v)) {
            out[k] = v;
        }
    }
    return out;
}
function listStsCardIdsSorted() {
    return Object.keys(getStsCardsRecord()).sort((a, b)=>a.localeCompare(b, undefined, {
            sensitivity: "base"
        }));
}
function pickRandomStsCardIds(count) {
    const all = listStsCardIdsSorted();
    if (all.length === 0) return [];
    const n = Math.max(0, Math.min(Math.floor(count), all.length));
    const copy = [
        ...all
    ];
    for(let i = copy.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [
            copy[j],
            copy[i]
        ];
    }
    return copy.slice(0, n);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/data/gameCardFromSts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGameCardFromStsRaw",
    ()=>buildGameCardFromStsRaw,
    "gameCardFromDatabaseId",
    ()=>gameCardFromDatabaseId,
    "stsTierDescriptionPatch",
    ()=>stsTierDescriptionPatch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-client] (ecmascript)");
;
/** Fields stored on STS records that are not copied onto {@link Card} (handled separately). */ const OMIT_FROM_CARD = new Set([
    "id",
    "description",
    "descriptionUpgraded",
    "rarity",
    "characters",
    "gainEnergy"
]);
function buildGameCardFromStsRaw(cardId, raw, opts) {
    const isUpgraded = opts?.isUpgraded ?? false;
    const desc = isUpgraded && raw.descriptionUpgraded != null ? String(raw.descriptionUpgraded) : String(raw.description ?? "");
    const card = {
        name: cardId
    };
    for (const [k, v] of Object.entries(raw)){
        if (OMIT_FROM_CARD.has(k)) continue;
        card[k] = v;
    }
    card.description = desc;
    card.isUpgraded = isUpgraded;
    if (typeof raw.character === "string") {
        card.character = raw.character;
    } else if (typeof raw.characters === "string") {
        card.character = raw.characters;
    } else {
        const ch = raw.characters;
        if (Array.isArray(ch) && typeof ch[0] === "string") {
            card.character = ch[0];
        }
    }
    if (raw.gainEnergy != null) {
        card.energyGain = raw.gainEnergy;
    }
    return card;
}
function gameCardFromDatabaseId(cardId, opts) {
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStsCardsRecord"])()[cardId];
    if (!raw) return null;
    return buildGameCardFromStsRaw(cardId, raw, opts);
}
function stsTierDescriptionPatch(cardId, isUpgraded) {
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStsCardsRecord"])()[cardId];
    if (!raw) return {};
    const desc = isUpgraded && raw.descriptionUpgraded != null ? String(raw.descriptionUpgraded) : String(raw.description ?? "");
    return {
        description: desc
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/utils/toast.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "subscribeToasts",
    ()=>subscribeToasts,
    "toast",
    ()=>toast
]);
let subscriber = null;
function subscribeToasts(fn) {
    subscriber = fn;
}
function toast(message, type = "info", options) {
    const durationMs = options?.durationMs ?? 4000;
    subscriber?.({
        message,
        type,
        durationMs
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/context/GameContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameProvider",
    ()=>GameProvider,
    "useGameManager",
    ()=>useGameManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/gameHelpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/activityLogger.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$combatData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/combatData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/gameCardFromSts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/toast.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
const GameContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const DEFAULT_SAVE_KEY = 'sts_game_save';
function GameProvider({ children }) {
    _s();
    const [gameState, setGameState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [initialData, setInitialData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [turns, setTurns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentTurnIndex, setCurrentTurnIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [turnPhase, setTurnPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('start');
    const [combatTargetMode, setCombatTargetModeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('single');
    const [combatTargetEnemyIndices, setCombatTargetEnemyIndices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [combatTargetSelf, setCombatTargetSelf] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const normalizeRelicEffects = (data)=>({
            ...data,
            player: {
                ...data.player,
                relicEffects: data.player.relicEffects?.map((effect)=>({
                        ...effect,
                        enabled: effect.enabled ?? true
                    })) ?? []
            }
        });
    const normalizeCard = (card)=>({
            ...card,
            isChanged: card.isChanged ?? false,
            isSelected: card.isSelected ?? false
        });
    const hydrateCardEntry = (entry)=>{
        if ('card_ID' in entry) {
            const { card_ID, ...referenceFields } = entry;
            const ref = referenceFields;
            const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStsCardsRecord"])()[card_ID];
            if (!raw) {
                return Object.assign({
                    name: card_ID
                }, referenceFields);
            }
            const baseCard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildGameCardFromStsRaw"])(card_ID, raw, {
                isUpgraded: ref.isUpgraded ?? false
            });
            return Object.assign(baseCard, referenceFields, {
                name: card_ID
            });
        }
        return entry;
    };
    const hydrateCombatData = (data)=>({
            ...data,
            deck: data.deck.map((entry)=>hydrateCardEntry(entry))
        });
    const ingestCombatPayload = async (data)=>{
        try {
            setIsLoading(true);
            const normalizedData = normalizeRelicEffects(data);
            const hydratedData = hydrateCombatData(normalizedData);
            const withPiles = {
                ...hydratedData,
                draw: hydratedData.deck.map(normalizeCard),
                discard: [],
                exhaust: [],
                hand: [],
                playedCards: [],
                activityLog: [],
                player: {
                    ...hydratedData.player,
                    currentEnergy: hydratedData.player.energy.base
                }
            };
            setInitialData((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(withPiles));
            const turnNumbers = new Set();
            withPiles.enemies?.forEach((enemy)=>enemy.intents?.forEach((intent)=>turnNumbers.add(intent.turn)));
            const uniqueTurns = Array.from(turnNumbers).sort((a, b)=>a - b);
            const initialTurns = uniqueTurns.map((id)=>({
                    id,
                    state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(withPiles)
                }));
            setTurns(initialTurns);
            setCurrentTurnIndex(0);
            setTurnPhase('start');
            setGameState((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(withPiles));
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            console.error('Error loading game data:', err);
        } finally{
            setIsLoading(false);
        }
    };
    const loadGameData = async (filePath)=>{
        const data = filePath ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadFromFile"])(filePath) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$combatData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["combatData"]);
        await ingestCombatPayload(data);
    };
    const loadGameDataFromJson = async (data)=>{
        await ingestCombatPayload((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(data));
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameProvider.useEffect": ()=>{
            loadGameData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["GameProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameProvider.useEffect": ()=>{
            const n = gameState?.enemies?.length ?? 0;
            setCombatTargetEnemyIndices({
                "GameProvider.useEffect": (prev)=>prev.filter({
                        "GameProvider.useEffect": (i)=>i >= 0 && i < n
                    }["GameProvider.useEffect"])
            }["GameProvider.useEffect"]);
        }
    }["GameProvider.useEffect"], [
        gameState?.enemies?.length
    ]);
    const setCombatTargetMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GameProvider.useCallback[setCombatTargetMode]": (mode)=>{
            setCombatTargetModeState(mode);
            setCombatTargetEnemyIndices({
                "GameProvider.useCallback[setCombatTargetMode]": (prev)=>{
                    if (mode === 'single' && prev.length > 1) {
                        return [
                            Math.min(...prev)
                        ];
                    }
                    return prev;
                }
            }["GameProvider.useCallback[setCombatTargetMode]"]);
        }
    }["GameProvider.useCallback[setCombatTargetMode]"], []);
    const toggleCombatEnemyTarget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GameProvider.useCallback[toggleCombatEnemyTarget]": (index)=>{
            setCombatTargetEnemyIndices({
                "GameProvider.useCallback[toggleCombatEnemyTarget]": (prev)=>{
                    if (combatTargetMode === 'single') {
                        return prev.length === 1 && prev[0] === index ? [] : [
                            index
                        ];
                    }
                    if (prev.includes(index)) {
                        return prev.filter({
                            "GameProvider.useCallback[toggleCombatEnemyTarget]": (i)=>i !== index
                        }["GameProvider.useCallback[toggleCombatEnemyTarget]"]);
                    }
                    return [
                        ...prev,
                        index
                    ].sort({
                        "GameProvider.useCallback[toggleCombatEnemyTarget]": (a, b)=>a - b
                    }["GameProvider.useCallback[toggleCombatEnemyTarget]"]);
                }
            }["GameProvider.useCallback[toggleCombatEnemyTarget]"]);
        }
    }["GameProvider.useCallback[toggleCombatEnemyTarget]"], [
        combatTargetMode
    ]);
    const clearCombatTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GameProvider.useCallback[clearCombatTargets]": ()=>{
            setCombatTargetEnemyIndices([]);
            setCombatTargetSelf(false);
        }
    }["GameProvider.useCallback[clearCombatTargets]"], []);
    const toggleCombatTargetSelf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GameProvider.useCallback[toggleCombatTargetSelf]": ()=>{
            setCombatTargetSelf({
                "GameProvider.useCallback[toggleCombatTargetSelf]": (s)=>!s
            }["GameProvider.useCallback[toggleCombatTargetSelf]"]);
        }
    }["GameProvider.useCallback[toggleCombatTargetSelf]"], []);
    const saveCurrentTurn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GameProvider.useCallback[saveCurrentTurn]": ()=>{
            if (!gameState) return;
            if (currentTurnIndex < 0 || currentTurnIndex >= turns.length) return;
            setTurns({
                "GameProvider.useCallback[saveCurrentTurn]": (prev)=>prev.map({
                        "GameProvider.useCallback[saveCurrentTurn]": (turn, idx)=>idx === currentTurnIndex ? {
                                ...turn,
                                state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(gameState)
                            } : turn
                    }["GameProvider.useCallback[saveCurrentTurn]"])
            }["GameProvider.useCallback[saveCurrentTurn]"]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Turn saved', 'success');
        }
    }["GameProvider.useCallback[saveCurrentTurn]"], [
        gameState,
        currentTurnIndex,
        turns.length
    ]);
    const setCurrentTurn = (turnId)=>{
        const index = turns.findIndex((turn)=>turn.id === turnId);
        if (index !== -1 && index !== currentTurnIndex) {
            // Autosave current turn before switching
            setTurns((prev)=>prev.map((turn, idx)=>idx === currentTurnIndex ? {
                        ...turn,
                        state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(gameState)
                    } : turn));
            setCurrentTurnIndex(index);
            setGameState((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(turns[index].state));
            setTurnPhase('start');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Turn switched', 'success');
        }
    };
    const endPlayerTurn = ()=>{
        if (!gameState || turnPhase !== 'player') return;
        const roundId = turns[currentTurnIndex]?.id ?? currentTurnIndex + 1;
        const logEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createActivityLogEntry"])(`Player ended main phase — round ${roundId}`, undefined, undefined, 'Enemy phase: resolve intents and damage, then end enemy turn.', 'system', {
            context: [
                {
                    label: 'Phase',
                    value: 'Main → Enemy'
                }
            ]
        });
        const stateAfterLog = {
            ...gameState,
            activityLog: [
                ...gameState.activityLog,
                logEntry
            ]
        };
        setGameState(stateAfterLog);
        setTurns((prev)=>prev.map((turn, idx)=>idx === currentTurnIndex ? {
                    ...turn,
                    state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(stateAfterLog)
                } : turn));
        setTurnPhase('enemy');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Enemy turn', 'info');
    };
    const endEnemyTurn = ()=>{
        if (!gameState || !initialData || turnPhase !== 'enemy') return;
        const roundId = turns[currentTurnIndex]?.id ?? currentTurnIndex + 1;
        const logEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createActivityLogEntry"])(`Enemy turn ended — round ${roundId}`, undefined, undefined, 'Advancing to the next planner round. Use Start turn for relic / draw / ST, then Main.', 'system', {
            context: [
                {
                    label: 'Phase',
                    value: 'Enemy → Start (next round)'
                }
            ]
        });
        const stateAfterLog = {
            ...gameState,
            activityLog: [
                ...gameState.activityLog,
                logEntry
            ]
        };
        setTurns((prev)=>{
            const withSaved = prev.map((turn, idx)=>idx === currentTurnIndex ? {
                    ...turn,
                    state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(stateAfterLog)
                } : turn);
            const nextIndex = currentTurnIndex + 1;
            if (nextIndex >= withSaved.length) {
                const newTurn = {
                    id: withSaved.length > 0 ? Math.max(...withSaved.map((t)=>t.id)) + 1 : 1,
                    state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(initialData)
                };
                return [
                    ...withSaved,
                    newTurn
                ];
            }
            return withSaved;
        });
        const nextIndex = currentTurnIndex + 1;
        if (nextIndex >= turns.length) {
            setCurrentTurnIndex(nextIndex);
            setGameState((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(initialData));
        } else {
            setCurrentTurnIndex(nextIndex);
            setGameState((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(turns[nextIndex].state));
        }
        setTurnPhase('start');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Next round', 'success');
    };
    const beginTurn = ()=>{
        if (!gameState || turnPhase !== 'start') return;
        const roundId = turns[currentTurnIndex]?.id ?? currentTurnIndex + 1;
        const logEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createActivityLogEntry"])(`Turn started — round ${roundId}`, undefined, undefined, 'Resolve start-of-turn relics, passive powers, and draw before playing cards (Main phase).', 'system', {
            context: [
                {
                    label: 'Phase track',
                    value: 'Start (Draw · Standby · relics) → Main'
                },
                {
                    label: 'Reminds',
                    value: 'Similar to YGO: finish start-of-turn triggers, then act in Main; End player turn enters Enemy.'
                }
            ]
        });
        const stateAfterLog = {
            ...gameState,
            activityLog: [
                ...gameState.activityLog,
                logEntry
            ]
        };
        setGameState(stateAfterLog);
        setTurns((prev)=>prev.map((turn, idx)=>idx === currentTurnIndex ? {
                    ...turn,
                    state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(stateAfterLog)
                } : turn));
        setTurnPhase('player');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Main phase', 'info');
    };
    const continueFromTurn = (fromTurnId, toTurnId)=>{
        const fromTurnIndex = turns.findIndex((turn)=>turn.id === fromTurnId);
        const toTurnIndex = turns.findIndex((turn)=>turn.id === toTurnId);
        if (fromTurnIndex === -1 || toTurnIndex === -1) return;
        const fromCurrentPlanner = fromTurnIndex === currentTurnIndex;
        /** During enemy phase, live {@link gameState} diverges from the slot; use the saved slot (player-end) so enemy resolutions are not copied. */ const sourceState = fromCurrentPlanner && turnPhase !== 'enemy' && gameState ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(gameState) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(turns[fromTurnIndex].state);
        setTurns((prev)=>prev.map((turn, idx)=>idx === toTurnIndex ? {
                    ...turn,
                    state: sourceState
                } : turn));
        setCurrentTurnIndex(toTurnIndex);
        setGameState((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(sourceState));
        setTurnPhase('start');
    };
    const resetCurrentTurn = ()=>{
        if (!initialData) return;
        const resetState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(initialData);
        setGameState(resetState);
        setTurns((prev)=>prev.map((turn, idx)=>idx === currentTurnIndex ? {
                    ...turn,
                    state: resetState
                } : turn));
        setTurnPhase('start');
    };
    const updateGameState = (newState)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            return {
                ...prevState,
                ...newState
            };
        });
    };
    const resetGameState = ()=>{
        if (initialData) {
            setGameState((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(initialData));
            setTurnPhase('start');
        }
    };
    const saveGameData = (key = DEFAULT_SAVE_KEY)=>{
        if (turns.length > 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveToLocalStorage"])(key, {
                turns,
                currentTurnIndex,
                turnPhase
            });
        }
    };
    const toggleRelic = (relicName)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const activeRelics = prevState.player.activeRelics ?? [];
            const isActive = activeRelics.includes(relicName);
            const nextActiveRelics = isActive ? activeRelics.filter((name)=>name !== relicName) : [
                ...activeRelics,
                relicName
            ];
            let bonusEnergy = prevState.player.bonusEnergy ?? 0;
            let bonusBlock = prevState.player.bonusBlock ?? 0;
            let intangible = prevState.player.intangible ?? false;
            let currentEnergy = prevState.player.currentEnergy ?? 0;
            if (relicName === __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LANTERN_RELIC_NAME"]) {
                if (isActive) {
                    if (currentEnergy < __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LANTERN_ENERGY_GIFT"]) {
                        return prevState;
                    }
                    currentEnergy -= __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LANTERN_ENERGY_GIFT"];
                } else {
                    currentEnergy += __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LANTERN_ENERGY_GIFT"];
                }
            }
            if (relicName === "Captains Wheel") {
                bonusBlock = isActive ? Math.max(0, bonusBlock - 18) : bonusBlock + 18;
            }
            if (relicName === "Incense Burner") {
                intangible = !isActive;
            }
            return {
                ...prevState,
                player: {
                    ...prevState.player,
                    activeRelics: nextActiveRelics,
                    bonusEnergy,
                    bonusBlock,
                    intangible,
                    currentEnergy
                }
            };
        });
    };
    const loadSavedGame = (key = DEFAULT_SAVE_KEY)=>{
        const saved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadFromLocalStorage"])(key);
        if (saved && saved.turns && Array.isArray(saved.turns)) {
            setTurns(saved.turns);
            setCurrentTurnIndex(saved.currentTurnIndex || 0);
            setGameState((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneGameData"])(saved.turns[saved.currentTurnIndex || 0]?.state || null));
            const phase = saved.turnPhase;
            setTurnPhase(phase === 'start' || phase === 'player' || phase === 'enemy' ? phase : 'start');
            return true;
        }
        return false;
    };
    const getSelectedCards = (state)=>{
        const locations = [
            'draw',
            'discard',
            'exhaust',
            'hand',
            'playedCards'
        ];
        const selected = [];
        locations.forEach((loc)=>{
            const pile = state[loc];
            pile.forEach((card, idx)=>{
                if (card.isSelected) {
                    selected.push({
                        card,
                        location: loc,
                        index: idx
                    });
                }
            });
        });
        return selected;
    };
    const addToActivityLog = (entry)=>{
        const logEntry = typeof entry === 'string' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createActivityLogEntry"])(entry) : entry;
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            return {
                ...prevState,
                activityLog: [
                    ...prevState.activityLog,
                    logEntry
                ]
            };
        });
    };
    const clearSelectionState = (state)=>({
            ...state,
            draw: state.draw.map((card)=>({
                    ...card,
                    isSelected: false
                })),
            discard: state.discard.map((card)=>({
                    ...card,
                    isSelected: false
                })),
            exhaust: state.exhaust.map((card)=>({
                    ...card,
                    isSelected: false
                })),
            hand: state.hand.map((card)=>({
                    ...card,
                    isSelected: false
                })),
            playedCards: state.playedCards.map((card)=>({
                    ...card,
                    isSelected: false
                }))
        });
    const sortSelectedForRemoval = (selected)=>[
            ...selected
        ].sort((a, b)=>{
            if (a.location === b.location) return b.index - a.index;
            return a.location.localeCompare(b.location);
        });
    const modifySelectedCards = (updater, actionLabel)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const selected = getSelectedCards(prevState);
            if (!selected.length) return prevState;
            const newState = {
                ...prevState,
                draw: [
                    ...prevState.draw
                ],
                discard: [
                    ...prevState.discard
                ],
                exhaust: [
                    ...prevState.exhaust
                ],
                hand: [
                    ...prevState.hand
                ],
                playedCards: [
                    ...prevState.playedCards
                ]
            };
            selected.forEach(({ location, index })=>{
                const pile = newState[location];
                pile[index] = updater(pile[index]);
            });
            const stateWithSelectionCleared = clearSelectionState(newState);
            const label = typeof actionLabel === 'function' ? actionLabel({
                selected
            }) : actionLabel;
            return {
                ...stateWithSelectionCleared,
                activityLog: [
                    ...stateWithSelectionCleared.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildActionLogEntry"])(label, selected)
                ]
            };
        });
    };
    const setSelectedCostZero = ()=>{
        modifySelectedCards((card)=>({
                ...card,
                cost: 0,
                isChanged: true
            }), 'Set cost to 0');
    };
    const setSelectedCustomCost = ()=>{
        const promptValue = window.prompt('Enter custom cost for selected cards:', '0');
        if (promptValue === null) return;
        const value = Number(promptValue);
        if (Number.isNaN(value)) return;
        modifySelectedCards((card)=>({
                ...card,
                cost: value,
                isChanged: true
            }), `Set cost to ${value}`);
    };
    const transformSelectedType = ()=>{
        const newType = window.prompt('Enter a new type for selected cards (Attack, Skill, Power, Status, Curse):', 'Attack');
        if (!newType) return;
        modifySelectedCards((card)=>({
                ...card,
                type: newType,
                isChanged: true
            }), `Changed type to ${newType}`);
    };
    const toggleChangedSelected = ()=>{
        modifySelectedCards((card)=>({
                ...card,
                isChanged: !card.isChanged
            }), 'Toggled changed flag');
    };
    const playSelectedCards = ()=>{
        const enemyIndicesSnapshot = combatTargetEnemyIndices;
        const targetSelfSnapshot = combatTargetSelf;
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const selected = getSelectedCards(prevState);
            if (!selected.length) return prevState;
            const newState = clearSelectionState({
                ...prevState,
                draw: [
                    ...prevState.draw
                ],
                discard: [
                    ...prevState.discard
                ],
                exhaust: [
                    ...prevState.exhaust
                ],
                hand: [
                    ...prevState.hand
                ],
                playedCards: [
                    ...prevState.playedCards
                ]
            });
            const newPlayedCards = [
                ...newState.playedCards
            ];
            const sortedSelected = sortSelectedForRemoval(selected);
            sortedSelected.forEach(({ card })=>{
                newPlayedCards.push({
                    ...card,
                    isSelected: false
                });
            });
            const playTargetsLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPlayCardTargets"])(prevState.enemies, enemyIndicesSnapshot, targetSelfSnapshot);
            return {
                ...newState,
                playedCards: newPlayedCards,
                activityLog: [
                    ...newState.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildActionLogEntry"])('Played cards', selected, {
                        context: [
                            {
                                label: 'Destination',
                                value: 'Played area'
                            }
                        ],
                        ...playTargetsLabel ? {
                            playTargetsLabel
                        } : {}
                    })
                ]
            };
        });
    };
    const moveSelectedCards = (toLocation)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const selected = getSelectedCards(prevState);
            if (!selected.length) return prevState;
            const newState = clearSelectionState({
                ...prevState,
                draw: [
                    ...prevState.draw
                ],
                discard: [
                    ...prevState.discard
                ],
                exhaust: [
                    ...prevState.exhaust
                ],
                hand: [
                    ...prevState.hand
                ],
                playedCards: [
                    ...prevState.playedCards
                ]
            });
            const toPile = newState[toLocation];
            const sortedSelected = sortSelectedForRemoval(selected);
            sortedSelected.forEach(({ card, location, index })=>{
                const fromPile = newState[location];
                fromPile.splice(index, 1);
                toPile.push({
                    ...card,
                    isSelected: false
                });
            });
            return {
                ...newState,
                activityLog: [
                    ...newState.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildActionLogEntry"])('Moved cards', selected, {
                        toPile: toLocation
                    })
                ]
            };
        });
    };
    const removeSelectedCards = ()=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const selected = getSelectedCards(prevState);
            if (!selected.length) return prevState;
            const newState = clearSelectionState({
                ...prevState,
                draw: [
                    ...prevState.draw
                ],
                discard: [
                    ...prevState.discard
                ],
                exhaust: [
                    ...prevState.exhaust
                ],
                hand: [
                    ...prevState.hand
                ],
                playedCards: [
                    ...prevState.playedCards
                ]
            });
            const sortedSelected = sortSelectedForRemoval(selected);
            sortedSelected.forEach(({ location, index })=>{
                const pile = newState[location];
                pile.splice(index, 1);
            });
            return {
                ...newState,
                activityLog: [
                    ...newState.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildActionLogEntry"])('Removed cards', selected)
                ]
            };
        });
    };
    const spendEnergyOnSelected = ()=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const selected = getSelectedCards(prevState);
            if (!selected.length) return prevState;
            let totalCost = 0;
            selected.forEach(({ card })=>{
                const cost = card.cost && typeof card.cost === 'object' ? card.isUpgraded && card.cost.upgraded !== undefined ? card.cost.upgraded : card.cost.base : card.cost;
                if (typeof cost === 'number') totalCost += cost;
            });
            if (prevState.player.currentEnergy < totalCost) return prevState;
            const newState = clearSelectionState(prevState);
            return {
                ...newState,
                player: {
                    ...newState.player,
                    currentEnergy: newState.player.currentEnergy - totalCost
                },
                activityLog: [
                    ...newState.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildEnergyLogEntry"])(prevState.player.currentEnergy ?? 0, newState.player.currentEnergy - totalCost, {
                        reason: `Paid ${totalCost} energy for ${selected.length} card(s)`,
                        cards: selected.map(({ card })=>card)
                    })
                ]
            };
        });
    };
    const deselectAllCards = ()=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            return clearSelectionState(prevState);
        });
    };
    const drawCards = (amount)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const cardsToDraw = prevState.draw.slice(0, amount);
            const remainingDraw = prevState.draw.slice(amount);
            const newHand = [
                ...prevState.hand,
                ...cardsToDraw
            ];
            return {
                ...prevState,
                draw: remainingDraw,
                hand: newHand,
                activityLog: [
                    ...prevState.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createActivityLogEntry"])(`Drew ${cardsToDraw.length} card${cardsToDraw.length === 1 ? '' : 's'}`, `Draw pile: ${prevState.draw.length} cards`, `Draw pile: ${remainingDraw.length} cards`, `Drawn: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCardNames"])(cardsToDraw)}`, 'state-change', {
                        cardsInvolved: cardsToDraw.map((c)=>({
                                name: c.name,
                                cardType: c.type
                            })),
                        context: [
                            {
                                label: 'Draw pile',
                                value: `${prevState.draw.length} → ${remainingDraw.length}`
                            },
                            {
                                label: 'Hand size',
                                value: `${prevState.hand.length} → ${newHand.length}`
                            }
                        ]
                    })
                ]
            };
        });
    };
    const upgradeSelected = ()=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const selected = getSelectedCards(prevState);
            if (!selected.length) return prevState;
            const newState = {
                ...prevState,
                draw: [
                    ...prevState.draw
                ],
                discard: [
                    ...prevState.discard
                ],
                exhaust: [
                    ...prevState.exhaust
                ],
                hand: [
                    ...prevState.hand
                ],
                playedCards: [
                    ...prevState.playedCards
                ]
            };
            selected.forEach(({ location, index })=>{
                const pile = newState[location];
                const cur = pile[index];
                const name = cur?.name ?? '';
                pile[index] = {
                    ...cur,
                    isUpgraded: true,
                    isChanged: true,
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stsTierDescriptionPatch"])(name, true)
                };
            });
            const stateWithSelectionCleared = clearSelectionState(newState);
            return {
                ...stateWithSelectionCleared,
                activityLog: [
                    ...stateWithSelectionCleared.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildActionLogEntry"])('Upgraded', selected)
                ]
            };
        });
    };
    const downgradeSelected = ()=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const selected = getSelectedCards(prevState);
            if (!selected.length) return prevState;
            const newState = {
                ...prevState,
                draw: [
                    ...prevState.draw
                ],
                discard: [
                    ...prevState.discard
                ],
                exhaust: [
                    ...prevState.exhaust
                ],
                hand: [
                    ...prevState.hand
                ],
                playedCards: [
                    ...prevState.playedCards
                ]
            };
            selected.forEach(({ location, index })=>{
                const pile = newState[location];
                const cur = pile[index];
                const name = cur?.name ?? '';
                pile[index] = {
                    ...cur,
                    isUpgraded: false,
                    isChanged: true,
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stsTierDescriptionPatch"])(name, false)
                };
            });
            const stateWithSelectionCleared = clearSelectionState(newState);
            return {
                ...stateWithSelectionCleared,
                activityLog: [
                    ...stateWithSelectionCleared.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildActionLogEntry"])('Downgraded', selected)
                ]
            };
        });
    };
    const duplicateSelected = ()=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const selected = getSelectedCards(prevState);
            if (!selected.length) return prevState;
            const newState = {
                ...prevState,
                draw: [
                    ...prevState.draw
                ],
                discard: [
                    ...prevState.discard
                ],
                exhaust: [
                    ...prevState.exhaust
                ],
                hand: [
                    ...prevState.hand
                ],
                playedCards: [
                    ...prevState.playedCards
                ]
            };
            selected.forEach(({ card, location })=>{
                const pile = newState[location];
                pile.push({
                    ...card,
                    isSelected: false,
                    isChanged: true
                });
            });
            const stateWithSelectionCleared = clearSelectionState(newState);
            return {
                ...stateWithSelectionCleared,
                activityLog: [
                    ...stateWithSelectionCleared.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildActionLogEntry"])('Duplicated', selected)
                ]
            };
        });
    };
    const toggleCardSelection = (location, index)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const pile = prevState[location];
            if (!Array.isArray(pile) || index < 0 || index >= pile.length) return prevState;
            const newPile = [
                ...pile
            ];
            newPile[index] = {
                ...newPile[index],
                isSelected: !newPile[index].isSelected
            };
            return {
                ...prevState,
                [location]: newPile
            };
        });
    };
    const buildCardFromDatabase = (cardId, isUpgraded)=>{
        const card = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["gameCardFromDatabaseId"])(cardId, {
            isUpgraded
        });
        if (!card) return null;
        return {
            ...card,
            isChanged: true,
            isSelected: false
        };
    };
    const transformSelectedFromDatabase = (cardId, isUpgraded = false)=>{
        const template = buildCardFromDatabase(cardId, isUpgraded);
        if (!template) return;
        const newName = `${cardId}${isUpgraded ? '+' : ''}`;
        modifySelectedCards((card)=>({
                ...template,
                isSelected: card.isSelected,
                isChanged: true
            }), ({ selected })=>{
            const oldPart = selected.map(({ card })=>card.name || '—').join(', ');
            return `Transformed : ${oldPart} → ${newName} x${selected.length}`;
        });
    };
    const addCardFromDB = (cardId, location, isUpgraded = false)=>{
        const newCard = buildCardFromDatabase(cardId, isUpgraded);
        if (!newCard) return;
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const pile = prevState[location];
            if (!Array.isArray(pile)) return prevState;
            const newPile = [
                ...pile,
                newCard
            ];
            return {
                ...prevState,
                [location]: newPile,
                activityLog: [
                    ...prevState.activityLog,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createActivityLogEntry"])(`Added ${cardId}${isUpgraded ? '+' : ''}`, undefined, undefined, undefined, 'info', {
                        cardsInvolved: [
                            {
                                name: cardId,
                                cardType: newCard.type
                            }
                        ],
                        context: [
                            {
                                label: 'Pile',
                                value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPileLabel"])(location)
                            },
                            {
                                label: 'Type',
                                value: newCard.type ?? '—'
                            },
                            {
                                label: 'Upgraded',
                                value: isUpgraded ? 'Yes' : 'No'
                            }
                        ]
                    })
                ]
            };
        });
    };
    const modifyPlayerHp = (delta)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const appliedDelta = delta < 0 && (prevState.player.intangible ?? false) ? -Math.min(Math.abs(delta), 1) : delta;
            const beforeHp = prevState.player.hp ?? 0;
            const newHp = Math.max(0, beforeHp + appliedDelta);
            if (beforeHp === newHp) return prevState;
            const maxHp = prevState.player.maxHp;
            const logEntry = appliedDelta > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildHealLogEntry"])('player', appliedDelta, beforeHp, newHp, undefined, maxHp) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDamageLogEntry"])('player', Math.abs(appliedDelta), beforeHp, newHp, undefined, maxHp);
            return {
                ...prevState,
                player: {
                    ...prevState.player,
                    hp: newHp
                },
                activityLog: [
                    ...prevState.activityLog,
                    logEntry
                ]
            };
        });
    };
    const modifyPlayerBlock = (delta)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const beforeBlock = prevState.player.currentBlock ?? 0;
            const newBlock = Math.max(0, beforeBlock + delta);
            if (beforeBlock === newBlock) return prevState;
            const logEntry = delta > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBlockLogEntry"])('player', delta, beforeBlock, newBlock) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBlockLostLogEntry"])('player', Math.abs(delta), beforeBlock, newBlock);
            return {
                ...prevState,
                player: {
                    ...prevState.player,
                    currentBlock: newBlock
                },
                activityLog: [
                    ...prevState.activityLog,
                    logEntry
                ]
            };
        });
    };
    const modifyPlayerEnergy = (delta)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const beforeEnergy = prevState.player.currentEnergy ?? 0;
            const newEnergy = Math.max(0, beforeEnergy + delta);
            if (beforeEnergy === newEnergy) return prevState;
            const logEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildEnergyLogEntry"])(beforeEnergy, newEnergy);
            return {
                ...prevState,
                player: {
                    ...prevState.player,
                    currentEnergy: newEnergy
                },
                activityLog: [
                    ...prevState.activityLog,
                    logEntry
                ]
            };
        });
    };
    const modifyEnemyHp = (enemyIndex, delta)=>{
        setGameState((prevState)=>{
            if (!prevState || !prevState.enemies) return prevState;
            const nextEnemies = [
                ...prevState.enemies
            ];
            if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
            const beforeHp = nextEnemies[enemyIndex].hp;
            const newHp = Math.max(0, beforeHp + delta);
            if (beforeHp === newHp) return prevState;
            const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
            const maxHp = nextEnemies[enemyIndex].maxHp;
            const logEntry = delta > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildHealLogEntry"])('enemy', delta, beforeHp, newHp, enemyName, maxHp) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDamageLogEntry"])('enemy', Math.abs(delta), beforeHp, newHp, enemyName, maxHp);
            nextEnemies[enemyIndex] = {
                ...nextEnemies[enemyIndex],
                hp: newHp
            };
            return {
                ...prevState,
                enemies: nextEnemies,
                activityLog: [
                    ...prevState.activityLog,
                    logEntry
                ]
            };
        });
    };
    const modifyEnemyBlock = (enemyIndex, delta)=>{
        setGameState((prevState)=>{
            if (!prevState || !prevState.enemies) return prevState;
            const nextEnemies = [
                ...prevState.enemies
            ];
            if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
            const beforeBlock = nextEnemies[enemyIndex].currentBlock ?? 0;
            const newBlock = Math.max(0, beforeBlock + delta);
            if (beforeBlock === newBlock) return prevState;
            const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
            const logEntry = delta > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBlockLogEntry"])('enemy', delta, beforeBlock, newBlock, enemyName) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBlockLostLogEntry"])('enemy', Math.abs(delta), beforeBlock, newBlock, enemyName);
            nextEnemies[enemyIndex] = {
                ...nextEnemies[enemyIndex],
                currentBlock: newBlock
            };
            return {
                ...prevState,
                enemies: nextEnemies,
                activityLog: [
                    ...prevState.activityLog,
                    logEntry
                ]
            };
        });
    };
    const addBuffDebuff = (target, enemyIndex, name, type, stacks, description)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            if (target === 'player') {
                const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
                const existingIndex = buffsDebuffs.findIndex((bd)=>bd.name === name);
                let nextBuffsDebuffs;
                let logEntry;
                if (existingIndex >= 0) {
                    const previousStacks = buffsDebuffs[existingIndex].stacks;
                    nextBuffsDebuffs = [
                        ...buffsDebuffs
                    ];
                    nextBuffsDebuffs[existingIndex] = {
                        ...nextBuffsDebuffs[existingIndex],
                        stacks,
                        description
                    };
                    logEntry = type === 'buff' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBuffLogEntry"])(name, stacks, 'player', undefined, previousStacks) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffLogEntry"])(name, stacks, 'player', undefined, previousStacks);
                } else {
                    nextBuffsDebuffs = [
                        ...buffsDebuffs,
                        {
                            name,
                            stacks,
                            type,
                            description
                        }
                    ];
                    logEntry = type === 'buff' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBuffLogEntry"])(name, stacks, 'player') : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffLogEntry"])(name, stacks, 'player');
                }
                return {
                    ...prevState,
                    player: {
                        ...prevState.player,
                        buffsDebuffs: nextBuffsDebuffs
                    },
                    activityLog: [
                        ...prevState.activityLog,
                        logEntry
                    ]
                };
            } else {
                if (!prevState.enemies) return prevState;
                const nextEnemies = [
                    ...prevState.enemies
                ];
                if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
                const buffsDebuffs = nextEnemies[enemyIndex].buffsDebuffs ?? [];
                const existingIndex = buffsDebuffs.findIndex((bd)=>bd.name === name);
                let nextBuffsDebuffs;
                let logEntry;
                if (existingIndex >= 0) {
                    const previousStacks = buffsDebuffs[existingIndex].stacks;
                    nextBuffsDebuffs = [
                        ...buffsDebuffs
                    ];
                    nextBuffsDebuffs[existingIndex] = {
                        ...nextBuffsDebuffs[existingIndex],
                        stacks,
                        description
                    };
                    const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
                    logEntry = type === 'buff' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBuffLogEntry"])(name, stacks, 'enemy', enemyName, previousStacks) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffLogEntry"])(name, stacks, 'enemy', enemyName, previousStacks);
                } else {
                    nextBuffsDebuffs = [
                        ...buffsDebuffs,
                        {
                            name,
                            stacks,
                            type,
                            description
                        }
                    ];
                    const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
                    logEntry = type === 'buff' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBuffLogEntry"])(name, stacks, 'enemy', enemyName) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffLogEntry"])(name, stacks, 'enemy', enemyName);
                }
                nextEnemies[enemyIndex] = {
                    ...nextEnemies[enemyIndex],
                    buffsDebuffs: nextBuffsDebuffs
                };
                return {
                    ...prevState,
                    enemies: nextEnemies,
                    activityLog: [
                        ...prevState.activityLog,
                        logEntry
                    ]
                };
            }
        });
    };
    const removeBuffDebuff = (target, enemyIndex, name)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            if (target === 'player') {
                const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
                const logEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffRemovedLogEntry"])(name, 'player');
                return {
                    ...prevState,
                    player: {
                        ...prevState.player,
                        buffsDebuffs: buffsDebuffs.filter((bd)=>bd.name !== name)
                    },
                    activityLog: [
                        ...prevState.activityLog,
                        logEntry
                    ]
                };
            } else {
                if (!prevState.enemies) return prevState;
                const nextEnemies = [
                    ...prevState.enemies
                ];
                if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
                const enemyName = nextEnemies[enemyIndex].name || `Enemy ${enemyIndex + 1}`;
                const logEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffRemovedLogEntry"])(name, 'enemy', enemyName);
                nextEnemies[enemyIndex] = {
                    ...nextEnemies[enemyIndex],
                    buffsDebuffs: (nextEnemies[enemyIndex].buffsDebuffs ?? []).filter((bd)=>bd.name !== name)
                };
                return {
                    ...prevState,
                    enemies: nextEnemies,
                    activityLog: [
                        ...prevState.activityLog,
                        logEntry
                    ]
                };
            }
        });
    };
    const reduceBuffDebuff = (target, enemyIndex, name)=>{
        setGameState((prevState)=>{
            if (!prevState) return prevState;
            const isPlayer = target === 'player';
            const enemyName = !isPlayer ? prevState.enemies?.[enemyIndex].name || `Enemy ${enemyIndex + 1}` : undefined;
            if (isPlayer) {
                const buffsDebuffs = prevState.player.buffsDebuffs ?? [];
                const existingIndex = buffsDebuffs.findIndex((bd)=>bd.name === name);
                if (existingIndex < 0) return prevState;
                const existing = buffsDebuffs[existingIndex];
                const currentStacks = existing.stacks;
                let logEntry;
                let nextBuffsDebuffs;
                if (currentStacks <= 1) {
                    nextBuffsDebuffs = buffsDebuffs.filter((bd)=>bd.name !== name);
                    logEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffRemovedLogEntry"])(name, isPlayer ? 'player' : 'enemy', enemyName);
                } else {
                    const newStacks = currentStacks - 1;
                    nextBuffsDebuffs = [
                        ...buffsDebuffs
                    ];
                    nextBuffsDebuffs[existingIndex] = {
                        ...existing,
                        stacks: newStacks
                    };
                    logEntry = existing.type === 'buff' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBuffLogEntry"])(name, newStacks, target, enemyName, currentStacks) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffLogEntry"])(name, newStacks, target, enemyName, currentStacks);
                }
                return {
                    ...prevState,
                    player: {
                        ...prevState.player,
                        buffsDebuffs: nextBuffsDebuffs
                    },
                    activityLog: [
                        ...prevState.activityLog,
                        logEntry
                    ]
                };
            }
            if (!prevState.enemies) return prevState;
            const nextEnemies = [
                ...prevState.enemies
            ];
            if (enemyIndex < 0 || enemyIndex >= nextEnemies.length) return prevState;
            const buffsDebuffs = nextEnemies[enemyIndex].buffsDebuffs ?? [];
            const existingIndex = buffsDebuffs.findIndex((bd)=>bd.name === name);
            if (existingIndex < 0) return prevState;
            const existing = buffsDebuffs[existingIndex];
            const currentStacks = existing.stacks;
            let logEntry;
            let nextBuffsDebuffs;
            if (currentStacks <= 1) {
                nextBuffsDebuffs = buffsDebuffs.filter((bd)=>bd.name !== name);
                logEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createActivityLogEntry"])(`${enemyName}'s ${name} was removed`, `Stacks: ${currentStacks}`, `Stacks: 0`, `Last stack of ${name} cleared`, existing.type === 'buff' ? 'buff' : 'debuff', {
                    target: 'enemy',
                    context: [
                        {
                            label: 'Effect',
                            value: name
                        },
                        {
                            label: 'Stacks',
                            value: `${currentStacks} → 0`
                        }
                    ]
                });
            } else {
                const newStacks = currentStacks - 1;
                nextBuffsDebuffs = [
                    ...buffsDebuffs
                ];
                nextBuffsDebuffs[existingIndex] = {
                    ...existing,
                    stacks: newStacks
                };
                logEntry = existing.type === 'buff' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBuffLogEntry"])(name, newStacks, target, enemyName, currentStacks) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$activityLogger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDebuffLogEntry"])(name, newStacks, target, enemyName, currentStacks);
            }
            nextEnemies[enemyIndex] = {
                ...nextEnemies[enemyIndex],
                buffsDebuffs: nextBuffsDebuffs
            };
            return {
                ...prevState,
                enemies: nextEnemies,
                activityLog: [
                    ...prevState.activityLog,
                    logEntry
                ]
            };
        });
    };
    const updateBuffDebuffStacks = (target, enemyIndex, name, stacks)=>{
        addBuffDebuff(target, enemyIndex, name, 'buff', stacks);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GameContext.Provider, {
        value: {
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
            resetGameState,
            loadGameData,
            loadGameDataFromJson,
            saveGameData,
            loadSavedGame,
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
            clearCombatTargets
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/app/context/GameContext.tsx",
        lineNumber: 1252,
        columnNumber: 5
    }, this);
}
_s(GameProvider, "Gcm938iYLuD/dXHUAyRDVsgAHDA=");
_c = GameProvider;
function useGameManager() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(GameContext);
    if (context === undefined) {
        throw new Error('useGameManager must be used within a GameProvider');
    }
    return context;
}
_s1(useGameManager, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "GameProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/utils/effectDisplay.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEffectDisplay",
    ()=>getEffectDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down.mjs [app-client] (ecmascript) <export default as ArrowDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.mjs [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dumbbell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Dumbbell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dumbbell.mjs [app-client] (ecmascript) <export default as Dumbbell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.mjs [app-client] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ghost.mjs [app-client] (ecmascript) <export default as Ghost>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.mjs [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$crack$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartCrack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart-crack.mjs [app-client] (ecmascript) <export default as HeartCrack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/link.mjs [app-client] (ecmascript) <export default as Link>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.mjs [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-off.mjs [app-client] (ecmascript) <export default as ShieldOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skull.mjs [app-client] (ecmascript) <export default as Skull>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.mjs [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$orbit$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Orbit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/orbit.mjs [app-client] (ecmascript) <export default as Orbit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/constants/colors.ts [app-client] (ecmascript)");
;
;
const ICONS = {
    weak: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"],
    vulnerable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
    frail: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__["ShieldOff"],
    damage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
    block: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
    wound: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$crack$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartCrack$3e$__["HeartCrack"],
    strength: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dumbbell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Dumbbell$3e$__["Dumbbell"],
    strength_buff: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
    entangle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__["Link"],
    takedamage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$crack$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartCrack$3e$__["HeartCrack"],
    energygain: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$orbit$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Orbit$3e$__["Orbit"],
    draw: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
    intangible: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__["Ghost"],
    hp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
    maxHp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
    health: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
    attack: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
    energy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
    heal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
    focus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
    poison: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__["Skull"],
    hpcost: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"]
};
function getEffectDisplay(type, value) {
    switch(type){
        case 'weak':
            return {
                label: `W${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].weak,
                fullLabel: 'Weak',
                icon: ICONS.weak
            };
        case 'vulnerable':
            return {
                label: `V${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].vulnerable,
                fullLabel: 'Vulnerable',
                icon: ICONS.vulnerable
            };
        case 'frail':
            return {
                label: `F${value ?? ''}`,
                color: 'text-gray-400',
                fullLabel: 'Frail',
                icon: ICONS.frail
            };
        case 'damage':
            return {
                label: `D${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].damage,
                fullLabel: 'Damage',
                icon: ICONS.damage
            };
        case 'block':
            return {
                label: `B${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].block,
                fullLabel: value ? `Gain ${value} Block` : 'Block',
                icon: ICONS.block
            };
        case 'wound':
            return {
                label: `W${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].wound,
                fullLabel: 'Wound',
                icon: ICONS.wound
            };
        case 'strength':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].strength,
                fullLabel: 'Strength',
                icon: ICONS.strength
            };
        case 'strength_buff':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].strength,
                fullLabel: 'Strength Buff',
                icon: ICONS.strength_buff
            };
        case 'entangle':
            return {
                label: 'Entangle',
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].entangle,
                fullLabel: 'Entangle',
                icon: ICONS.entangle
            };
        case 'takedamage':
            return {
                label: `-${value ?? ''} HP`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].takedamage,
                fullLabel: `Take ${value ?? ''} Damage`,
                icon: ICONS.takedamage
            };
        case 'energygain':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].energygain,
                fullLabel: `Gain ${value ?? ''} Energy`,
                icon: ICONS.energygain
            };
        case 'draw':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].draw,
                fullLabel: `Draw ${value ?? ''} Card${value === 1 ? '' : 's'}`,
                icon: ICONS.draw
            };
        case 'intangible':
            return {
                label: `${value ?? 1}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].intangible,
                fullLabel: `Gain ${value ?? 1} Intangible`,
                icon: ICONS.intangible
            };
        case 'hp':
            return {
                label: `HP ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STAT_COLORS"].hp,
                fullLabel: 'HP',
                icon: ICONS.hp
            };
        case 'maxHp':
            return {
                label: `Max HP ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STAT_COLORS"].maxHp,
                fullLabel: 'Max HP',
                icon: ICONS.maxHp
            };
        case 'health':
            return {
                label: `Health ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STAT_COLORS"].health,
                fullLabel: 'Health',
                icon: ICONS.health
            };
        case 'attack':
            return {
                label: `Attack ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STAT_COLORS"].attack,
                fullLabel: 'Attack',
                icon: ICONS.attack
            };
        case 'energy':
            return {
                label: `Energy ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STAT_COLORS"].energy,
                fullLabel: 'Energy',
                icon: ICONS.energy
            };
        case 'heal':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].heal,
                fullLabel: 'Heal',
                icon: ICONS.heal
            };
        case 'focus':
            return {
                label: `${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].focus,
                fullLabel: 'Focus',
                icon: ICONS.focus
            };
        case 'poison':
            return {
                label: `P${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].poison,
                fullLabel: 'Poison',
                icon: ICONS.poison
            };
        case 'hpcost':
            return {
                label: `-${value ?? ''} HP`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].hpcost,
                fullLabel: `Lose ${value ?? ''} HP`,
                icon: ICONS.hpcost
            };
        default:
            return {
                label: `?${value ?? ''}`,
                color: 'text-gray-400',
                fullLabel: 'Unknown',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"]
            };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STS_ICON_GLYPH",
    ()=>STS_ICON_GLYPH,
    "cardSelfExhaustsOnPlay",
    ()=>cardSelfExhaustsOnPlay,
    "energyGainNode",
    ()=>energyGainNode,
    "galleryBlockRowIsConditional",
    ()=>galleryBlockRowIsConditional,
    "galleryDamageIsConditional",
    ()=>galleryDamageIsConditional,
    "galleryDamageRowIsAoE",
    ()=>galleryDamageRowIsAoE,
    "galleryDrawIsConditional",
    ()=>galleryDrawIsConditional,
    "galleryGlyphsInsideCardOnly",
    ()=>galleryGlyphsInsideCardOnly,
    "galleryTierNumber",
    ()=>galleryTierNumber,
    "galleryTieredBoolActive",
    ()=>galleryTieredBoolActive,
    "inferCardGalleryGlyphs",
    ()=>inferCardGalleryGlyphs,
    "inferGalleryCardEffects",
    ()=>inferGalleryCardEffects,
    "orbInteractionEntries",
    ()=>orbInteractionEntries,
    "readStsIconCatalog",
    ()=>readStsIconCatalog,
    "resolveOrbCatalogKey",
    ()=>resolveOrbCatalogKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bookmark.mjs [app-client] (ecmascript) <export default as Bookmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-up.mjs [app-client] (ecmascript) <export default as ChevronsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$dot$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleDot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-dot.mjs [app-client] (ecmascript) <export default as CircleDot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coins.mjs [app-client] (ecmascript) <export default as Coins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.mjs [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crosshair.mjs [app-client] (ecmascript) <export default as Crosshair>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.mjs [app-client] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ghost.mjs [app-client] (ecmascript) <export default as Ghost>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.mjs [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.mjs [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scan$2d$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScanSearch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scan-search.mjs [app-client] (ecmascript) <export default as ScanSearch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shuffle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shuffle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shuffle.mjs [app-client] (ecmascript) <export default as Shuffle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/snowflake.mjs [app-client] (ecmascript) <export default as Snowflake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SquarePlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-plus.mjs [app-client] (ecmascript) <export default as SquarePlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.mjs [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-down.mjs [app-client] (ecmascript) <export default as TrendingDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.mjs [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.mjs [app-client] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$orbit$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Orbit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/orbit.mjs [app-client] (ecmascript) <export default as Orbit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/effectDisplay.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$STS_CARDS_DB$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/STS_CARDS_DB.json.[json].cjs [app-client] (ecmascript)");
;
;
;
const STS_ICON_GLYPH = {
    LIGHTNING_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
        iconClass: "text-amber-300",
        shortLabel: "Lightning orb"
    },
    FROST_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__["Snowflake"],
        iconClass: "text-sky-300",
        shortLabel: "Frost orb"
    },
    DARK_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"],
        iconClass: "text-violet-300",
        shortLabel: "Dark orb"
    },
    PLASMA_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
        iconClass: "text-yellow-200",
        shortLabel: "Plasma orb"
    },
    DRAW_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
        iconClass: "text-cyan-300",
        shortLabel: "Draw"
    },
    DISCARD_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"],
        iconClass: "text-orange-300",
        shortLabel: "Discard"
    },
    EVOKE_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$dot$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleDot$3e$__["CircleDot"],
        iconClass: "text-amber-200",
        shortLabel: "Evoke"
    },
    CONDITIONAL_MARKER: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
        iconClass: "text-amber-200/90",
        shortLabel: "Conditional"
    },
    ANY_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"],
        iconClass: "text-slate-300",
        shortLabel: "Any orb"
    },
    SAME_ORB_AS_EVOKED: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"],
        iconClass: "text-slate-300",
        shortLabel: "Same as evoked"
    },
    /** Area-of-effect marker paired with damage icon */ AOE_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__["Crosshair"],
        iconClass: "text-rose-200",
        shortLabel: "AoE"
    },
    /** Gallery: legacy multi-hit row (distinct from main damage stat icon). */ AOE_DAMAGE: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"],
        iconClass: "text-rose-300",
        shortLabel: "Multi-hit"
    },
    RANDOM_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shuffle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shuffle$3e$__["Shuffle"],
        iconClass: "text-violet-300",
        shortLabel: "Random"
    },
    EXHAUST_SELF: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"],
        iconClass: "text-orange-400",
        shortLabel: "Exhaust (self)"
    },
    SCRY_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scan$2d$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScanSearch$3e$__["ScanSearch"],
        iconClass: "text-fuchsia-300",
        shortLabel: "Scry"
    },
    LOSE_STRENGTH: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__["TrendingDown"],
        iconClass: "text-orange-300",
        shortLabel: "Lose Strength"
    },
    KEY_INNATE: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"],
        iconClass: "text-amber-200",
        shortLabel: "Innate"
    },
    KEY_ETHEREAL: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__["Ghost"],
        iconClass: "text-slate-400",
        shortLabel: "Ethereal"
    },
    KEY_RETAIN: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"],
        iconClass: "text-lime-200",
        shortLabel: "Retain"
    },
    COST_MANIP: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"],
        iconClass: "text-amber-300",
        shortLabel: "Cost"
    },
    UPGRADE_CARD: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUp$3e$__["ChevronsUp"],
        iconClass: "text-violet-300",
        shortLabel: "Upgrade"
    },
    ADD_CARD: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SquarePlus$3e$__["SquarePlus"],
        iconClass: "text-cyan-300",
        shortLabel: "Add card"
    },
    HP_COST: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"],
        iconClass: "text-rose-400",
        shortLabel: "HP cost"
    },
    GAIN_ENERGY_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$orbit$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Orbit$3e$__["Orbit"],
        iconClass: "text-yellow-300",
        shortLabel: "Gain energy"
    }
};
const FALLBACK_ICON_CATALOG = {
    LIGHTNING_ORB: "Lightning orb (channel / evoke visuals)",
    FROST_ORB: "Frost orb",
    DARK_ORB: "Dark orb",
    PLASMA_ORB: "Plasma orb",
    DRAW_ICON: "Draw from draw pile",
    DISCARD_ICON: "Discard to discard pile",
    EVOKE_ICON: "Evoke orb",
    CONDITIONAL_MARKER: "Effect is conditional — prepended before draw, damage, discard, block, energy, etc.",
    ANY_ORB: "Generic orb placeholder when color not fixed",
    SAME_ORB_AS_EVOKED: "Echo orb type from prior evoke",
    AOE_ICON: "All-enemies attack marker — grouped with the damage stat row (rose tint in gallery)",
    RANDOM_ICON: "Random choice (e.g. discard target, random hit)"
};
function readStsIconCatalog() {
    const root = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$STS_CARDS_DB$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    const cat = root.iconCatalog && Object.keys(root.iconCatalog).length > 0 ? root.iconCatalog : FALLBACK_ICON_CATALOG;
    return Object.entries(cat).map(([key, description])=>({
            key,
            description
        }));
}
function glyphFromStsKey(id, catalogKey, label) {
    const meta = STS_ICON_GLYPH[catalogKey];
    if (!meta) return null;
    return {
        id,
        catalogKey,
        label: label ?? meta.shortLabel,
        Icon: meta.Icon,
        iconClass: meta.iconClass
    };
}
function fullDesc(card) {
    const c = card;
    const u = c.descriptionUpgraded;
    return `${card.description ?? ""} ${typeof u === "string" ? u : ""}`;
}
function isConditionedField(node) {
    return node !== null && typeof node === "object" && !Array.isArray(node) && node.conditioned === true;
}
function damageTargetIsAllEnemies(card) {
    const d = card.damage;
    if (d == null || typeof d !== "object" || Array.isArray(d)) return false;
    const t = d.target;
    if (typeof t === "string" && /\ball enemies\b/i.test(t)) return true;
    if (t != null && typeof t === "object" && !Array.isArray(t)) {
        const o = t;
        const pick = card.isUpgraded === true && o.upgraded !== undefined ? o.upgraded : o.base;
        if (typeof pick === "string" && /\ball enemies\b/i.test(pick)) return true;
    }
    return false;
}
function damageRowIsAoE(card) {
    return card.type === "Attack" && card.damage != undefined && (damageTargetIsAllEnemies(card) || /\ball enemies\b/i.test(fullDesc(card)));
}
function galleryDamageIsConditional(card) {
    return card.damage != undefined && isConditionedField(card.damage);
}
function blockIsConditional(card) {
    return card.block != undefined && isConditionedField(card.block);
}
function galleryBlockRowIsConditional(card) {
    return blockIsConditional(card);
}
function segmentConditional() {
    const m = STS_ICON_GLYPH.CONDITIONAL_MARKER;
    return {
        Icon: m.Icon,
        iconClass: m.iconClass
    };
}
function segmentAoe() {
    const m = STS_ICON_GLYPH.AOE_ICON;
    return {
        Icon: m.Icon,
        iconClass: m.iconClass
    };
}
function segmentRandom() {
    const m = STS_ICON_GLYPH.RANDOM_ICON;
    return {
        Icon: m.Icon,
        iconClass: m.iconClass
    };
}
function galleryDrawIsConditional(card) {
    const c = card;
    if (card.draw != undefined && isConditionedField(card.draw)) return true;
    const dc = c.drawConditional;
    return Array.isArray(dc) && dc.length > 0;
}
function legacyDrawConditional(card) {
    const dc = card.drawConditional;
    return Array.isArray(dc) && dc.length > 0;
}
function drawUsesCatalogKey(card) {
    const c = card;
    const dRaw = card.draw;
    if (typeof dRaw?.drawUsesIcon === "string") return dRaw.drawUsesIcon;
    if (typeof c.drawUsesIcon === "string") return c.drawUsesIcon;
    return "DRAW_ICON";
}
function energyGainNode(card) {
    const c = card;
    return c.energyGain ?? c.gainEnergy;
}
function cardSelfExhaustsOnPlay(card) {
    const v = card.selfExhaustOnPlay;
    if (v === true) return true;
    if (v === false || v == null) return false;
    if (typeof v === "object" && !Array.isArray(v)) {
        const o = v;
        if (card.isUpgraded === true && o.upgraded !== undefined) return Boolean(o.upgraded);
        return Boolean(o.base);
    }
    return false;
}
function discardIsRandom(discard) {
    return discard.randomTarget === true || discard.random === true;
}
function galleryTierNumber(card, node) {
    if (node === undefined || node === null) return undefined;
    if (typeof node === "number" && !Number.isNaN(node)) return node;
    if (typeof node === "object" && !Array.isArray(node)) {
        const o = node;
        if (card.isUpgraded === true && o.upgraded !== undefined) return o.upgraded;
        if (o.base !== undefined) return o.base;
    }
    return undefined;
}
function galleryNumericField(card, field) {
    if (field === "energyGain") {
        return galleryTierNumber(card, energyGainNode(card));
    }
    return galleryTierNumber(card, card[field]);
}
/** Discard count for glyphs; defaults to 1 when an effect exists but has no numeric tier. */ function galleryDiscardDisplayCount(card) {
    const d = card.discardEffect;
    if (!d || typeof d !== "object" || Array.isArray(d)) return 1;
    const n = galleryTierNumber(card, d);
    return n !== undefined ? n : 1;
}
/** Legacy damage row: optional conditional + AoE markers before the damage icon. */ function buildDamageLegacyGlyph(card) {
    if (card.damage === undefined) return null;
    const dmgD = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage");
    const hasSub = galleryDamageIsConditional(card) || damageRowIsAoE(card);
    const dRaw = card.damage && typeof card.damage === "object" && !Array.isArray(card.damage) ? card.damage : undefined;
    const trigger = typeof dRaw?.trigger === "string" ? String(dRaw.trigger) : undefined;
    if (!hasSub) {
        return {
            id: "damage",
            label: "Damage",
            Icon: dmgD.icon,
            iconClass: dmgD.color
        };
    }
    const segments = [];
    if (galleryDamageIsConditional(card)) segments.push(segmentConditional());
    if (damageRowIsAoE(card)) segments.push(segmentAoe());
    const labelParts = [];
    if (galleryDamageIsConditional(card)) labelParts.push("Conditional");
    if (damageRowIsAoE(card)) labelParts.push("AoE");
    labelParts.push("Damage");
    return {
        id: "damage-combo",
        label: trigger ? `${labelParts.join(" · ")} — ${trigger}` : labelParts.join(" · "),
        clusterClass: clusterShellField("damage"),
        segments,
        prefixDamageRow: true
    };
}
function clusterShellField(field) {
    switch(field){
        case "damage":
            return "rounded-md border border-red-400/30 bg-red-950/40 px-1 py-0.5 shadow-sm";
        case "block":
            return "rounded-md border border-blue-400/30 bg-blue-950/45 px-1 py-0.5 shadow-sm";
        case "draw":
            return "rounded-md border border-indigo-400/30 bg-indigo-950/40 px-1 py-0.5 shadow-sm";
        case "energy":
            return "rounded-md border border-yellow-400/25 bg-yellow-950/35 px-1 py-0.5 shadow-sm";
        default:
            return "rounded-md border border-white/15 bg-black/25 px-1 py-0.5 shadow-sm";
    }
}
const MULTIHIT_TEXT_CLS = "text-[0.65em] font-semibold leading-none text-slate-400 opacity-90 mx-px";
function galleryTieredBoolActive(card, node) {
    if (node === true) return true;
    if (node === false || node == null) return false;
    if (typeof node === "object" && !Array.isArray(node)) {
        const o = node;
        if (card.isUpgraded === true && o.upgraded !== undefined) return Boolean(o.upgraded);
        return Boolean(o.base);
    }
    return false;
}
function buildKeywordGlyphs(card) {
    const c = card;
    const out = [];
    const innate = c.innate ?? c.Innate;
    const ethereal = c.ethereal ?? c.Ethereal;
    const retainField = c.retain ?? c.Retain;
    if (galleryTieredBoolActive(card, innate)) {
        const m = STS_ICON_GLYPH.KEY_INNATE;
        out.push({
            id: "kw-innate",
            label: "Innate",
            Icon: m.Icon,
            iconClass: m.iconClass
        });
    }
    if (galleryTieredBoolActive(card, ethereal)) {
        const m = STS_ICON_GLYPH.KEY_ETHEREAL;
        out.push({
            id: "kw-ethereal",
            label: "Ethereal",
            Icon: m.Icon,
            iconClass: m.iconClass
        });
    }
    if (galleryTieredBoolActive(card, retainField)) {
        const m = STS_ICON_GLYPH.KEY_RETAIN;
        out.push({
            id: "kw-retain",
            label: "Retain",
            Icon: m.Icon,
            iconClass: m.iconClass
        });
    }
    return out;
}
const ORB_TYPE_TO_CATALOG = {
    lightning: "LIGHTNING_ORB",
    frost: "FROST_ORB",
    dark: "DARK_ORB",
    plasma: "PLASMA_ORB"
};
function orbInteractionEntries(root) {
    const o = root.orbInteractions;
    if (Array.isArray(o)) return o;
    if (o && typeof o === "object" && !Array.isArray(o)) return [
        o
    ];
    return [];
}
function resolveOrbCatalogKey(e, verbRaw) {
    if (typeof e.usesIcon === "string") return e.usesIcon;
    if (typeof e.orbIcon === "string") return e.orbIcon;
    const ot = e.orbtype ?? e.orbType;
    if (typeof ot === "string") {
        const k = ORB_TYPE_TO_CATALOG[ot.toLowerCase()];
        if (k) return k;
    }
    if (/^evoke/i.test(verbRaw)) return "EVOKE_ICON";
    return "ANY_ORB";
}
function plusSegment() {
    return {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"],
        iconClass: "text-emerald-300/95"
    };
}
const EXHAUST_GLYPH_IDS = new Set([
    "exhaust-self",
    "structured-exhaust"
]);
function moveExhaustGlyphsLast(glyphs) {
    const tail = [];
    const head = [];
    for (const g of glyphs){
        if (EXHAUST_GLYPH_IDS.has(g.id)) tail.push(g);
        else head.push(g);
    }
    return [
        ...head,
        ...tail
    ];
}
function mergeKeywordGlyphsFirst(card, glyphs) {
    return [
        ...buildKeywordGlyphs(card),
        ...glyphs
    ];
}
/**
 * High-touch layouts: ordered clusters + stat suppression (gallery only).
 * See Dropkick, All-Out Attack, Acrobatics, Pummel patterns.
 */ function tryStructuredGalleryGlyphs(card) {
    const c = card;
    const desc = fullDesc(card);
    const discard = c.discardEffect;
    const multi = c.multiHit;
    const mhRaw = multi && typeof multi === "object" && multi !== null && "multiHitCount" in multi ? multi.multiHitCount : undefined;
    const multiCount = mhRaw !== null && typeof mhRaw === "object" && !Array.isArray(mhRaw) ? mhRaw : null;
    // Pummel-style: multi-hit count + damage
    if (multiCount != null && card.damage !== undefined) {
        const hits = galleryTierNumber(card, multiCount);
        const mhSegments = [];
        if (galleryDamageIsConditional(card)) mhSegments.push(segmentConditional());
        if (damageRowIsAoE(card)) mhSegments.push(segmentAoe());
        mhSegments.push({
            text: "×",
            textClass: "text-[0.65em] font-semibold leading-none text-slate-400 opacity-90 mx-px"
        }, {
            text: hits != null ? String(hits) : "?",
            textClass: "text-[0.72em] font-bold tabular-nums leading-none text-indigo-300"
        });
        const glyphs = [
            {
                id: "structured-multihit",
                label: `Hits ×${hits ?? "?"}`,
                clusterClass: clusterShellField("damage"),
                segments: mhSegments,
                prefixDamageRow: true
            }
        ];
        if (cardSelfExhaustsOnPlay(card)) {
            const ex = STS_ICON_GLYPH.EXHAUST_SELF;
            glyphs.push({
                id: "structured-exhaust",
                label: "Exhaust",
                clusterClass: clusterShellField("neutral"),
                Icon: ex.Icon,
                iconClass: ex.iconClass
            });
        }
        return {
            glyphs,
            suppressStats: {}
        };
    }
    // Dropkick-style: damage + conditional draw + conditional energy (same gate)
    const egNode = energyGainNode(card);
    if (card.damage !== undefined && card.draw !== undefined && galleryDrawIsConditional(card) && egNode != null && isConditionedField(egNode)) {
        const dKey = drawUsesCatalogKey(card);
        const drawMeta = STS_ICON_GLYPH[dKey] ?? STS_ICON_GLYPH.DRAW_ICON;
        const condMeta = STS_ICON_GLYPH.CONDITIONAL_MARKER;
        const enD = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("energygain");
        const drawN = galleryNumericField(card, "draw");
        const enN = galleryNumericField(card, "energyGain");
        const dRaw = card.draw && typeof card.draw === "object" && !Array.isArray(card.draw) ? card.draw : undefined;
        const trigger = typeof dRaw?.trigger === "string" ? String(dRaw.trigger) : egNode !== null && typeof egNode === "object" && typeof egNode.trigger === "string" ? String(egNode.trigger) : undefined;
        const dmgSegs = [];
        if (galleryDamageIsConditional(card)) dmgSegs.push(segmentConditional());
        if (damageRowIsAoE(card)) dmgSegs.push(segmentAoe());
        const glyphs = [];
        if (dmgSegs.length > 0) {
            glyphs.push({
                id: "structured-dmg",
                label: "Damage modifiers",
                clusterClass: clusterShellField("damage"),
                segments: dmgSegs,
                prefixDamageRow: true
            });
        }
        glyphs.push({
            id: "structured-cond-draw",
            label: trigger ? `Draw when ${trigger}` : "Conditional draw",
            clusterClass: clusterShellField("draw"),
            segments: [
                {
                    Icon: condMeta.Icon,
                    iconClass: condMeta.iconClass
                },
                {
                    Icon: drawMeta.Icon,
                    iconClass: drawMeta.iconClass
                },
                {
                    text: drawN != null ? String(drawN) : "?",
                    textClass: `${drawMeta.iconClass} font-bold tabular-nums leading-none`
                }
            ]
        }, {
            id: "structured-cond-energy",
            label: trigger ? `Energy when ${trigger}` : "Conditional energy",
            clusterClass: clusterShellField("energy"),
            segments: [
                {
                    Icon: condMeta.Icon,
                    iconClass: condMeta.iconClass
                },
                {
                    Icon: enD.icon,
                    iconClass: enD.color
                },
                {
                    text: enN != null ? String(enN) : "?",
                    textClass: `${enD.color} font-bold tabular-nums leading-none`
                }
            ]
        });
        return {
            glyphs,
            suppressStats: {
                draw: true,
                energyGain: true
            }
        };
    }
    // All-Out Attack: AoE damage + random discard
    if (card.type === "Attack" && card.damage !== undefined && /\ball enemies\b/i.test(desc) && discard && discardIsRandom(discard)) {
        const aoe = STS_ICON_GLYPH.AOE_ICON;
        const rand = STS_ICON_GLYPH.RANDOM_ICON;
        const dis = STS_ICON_GLYPH.DISCARD_ICON;
        const dCount = galleryDiscardDisplayCount(card);
        const aoeDmgSegs = [];
        if (galleryDamageIsConditional(card)) aoeDmgSegs.push(segmentConditional());
        aoeDmgSegs.push({
            Icon: aoe.Icon,
            iconClass: aoe.iconClass
        });
        const rndDiscSegs = [];
        if (discard.conditioned === true) rndDiscSegs.push(segmentConditional());
        rndDiscSegs.push({
            Icon: rand.Icon,
            iconClass: rand.iconClass
        }, {
            Icon: dis.Icon,
            iconClass: dis.iconClass
        }, {
            text: String(dCount),
            textClass: `${dis.iconClass} font-bold tabular-nums leading-none`
        });
        return {
            glyphs: [
                {
                    id: "structured-aoe-dmg",
                    label: "AoE damage",
                    clusterClass: clusterShellField("damage"),
                    segments: aoeDmgSegs,
                    prefixDamageRow: true
                },
                {
                    id: "structured-random-discard",
                    label: "Random discard",
                    clusterClass: clusterShellField("neutral"),
                    segments: rndDiscSegs
                }
            ],
            suppressStats: {}
        };
    }
    // Acrobatics-style: unconditional draw + hand discard (not random)
    if (card.draw !== undefined && discard && !galleryDrawIsConditional(card) && !discardIsRandom(discard) && discard.fromHand === true) {
        const drawMeta = STS_ICON_GLYPH[drawUsesCatalogKey(card)] ?? STS_ICON_GLYPH.DRAW_ICON;
        const dis = STS_ICON_GLYPH.DISCARD_ICON;
        const drawN = galleryNumericField(card, "draw");
        const dCount = galleryDiscardDisplayCount(card);
        return {
            glyphs: [
                {
                    id: "structured-draw-n",
                    label: "Draw",
                    clusterClass: clusterShellField("draw"),
                    segments: [
                        {
                            Icon: drawMeta.Icon,
                            iconClass: drawMeta.iconClass
                        },
                        {
                            text: drawN != null ? String(drawN) : "?",
                            textClass: `${drawMeta.iconClass} font-bold tabular-nums leading-none`
                        }
                    ]
                },
                {
                    id: "structured-discard-n",
                    label: "Discard",
                    clusterClass: clusterShellField("neutral"),
                    segments: [
                        ...discard.conditioned === true ? [
                            segmentConditional()
                        ] : [],
                        {
                            Icon: dis.Icon,
                            iconClass: dis.iconClass
                        },
                        {
                            text: String(dCount),
                            textClass: `${dis.iconClass} font-bold tabular-nums leading-none`
                        }
                    ]
                }
            ],
            suppressStats: {
                draw: true
            }
        };
    }
    return null;
}
function inferLegacyCardGalleryGlyphs(card) {
    const c = card;
    const out = [];
    const seen = new Set();
    const push = (g)=>{
        if (!g || seen.has(g.id)) return;
        seen.add(g.id);
        out.push(g);
    };
    const drawCond = galleryDrawIsConditional(card);
    const legacyDraw = legacyDrawConditional(card);
    if (card.draw != undefined) {
        const key = drawUsesCatalogKey(card);
        const drawMeta = STS_ICON_GLYPH[key] ?? {
            Icon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").icon,
            iconClass: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").color,
            shortLabel: "Draw"
        };
        const dRaw = card.draw && typeof card.draw === "object" && !Array.isArray(card.draw) ? card.draw : undefined;
        const trigger = typeof dRaw?.trigger === "string" ? dRaw.trigger : undefined;
        const drawN = galleryNumericField(card, "draw");
        if (drawCond) {
            const condM = STS_ICON_GLYPH.CONDITIONAL_MARKER;
            const segs = [
                {
                    Icon: condM.Icon,
                    iconClass: condM.iconClass
                },
                {
                    Icon: drawMeta.Icon,
                    iconClass: drawMeta.iconClass
                }
            ];
            if (drawN != null) {
                segs.push({
                    text: String(drawN),
                    textClass: `${drawMeta.iconClass} font-bold tabular-nums leading-none`
                });
            }
            push({
                id: "draw-cond-draw",
                label: trigger ? `Draw — ${trigger}` : "Draw (conditional)",
                clusterClass: clusterShellField("draw"),
                segments: segs
            });
        } else {
            push(glyphFromStsKey("draw-main", key, "Draw") ?? {
                id: "draw-main",
                label: "Draw",
                Icon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").icon,
                iconClass: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").color
            });
        }
    } else if (legacyDraw) {
        const key = typeof c.drawUsesIcon === "string" ? String(c.drawUsesIcon) : "DRAW_ICON";
        const drawMeta = STS_ICON_GLYPH[key] ?? {
            Icon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").icon,
            iconClass: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").color,
            shortLabel: "Draw"
        };
        const condM = STS_ICON_GLYPH.CONDITIONAL_MARKER;
        push({
            id: "draw-cond-draw",
            label: "Draw (conditional)",
            clusterClass: clusterShellField("draw"),
            segments: [
                {
                    Icon: condM.Icon,
                    iconClass: condM.iconClass
                },
                {
                    Icon: drawMeta.Icon,
                    iconClass: drawMeta.iconClass
                }
            ]
        });
    }
    const discard = c.discardEffect;
    if (discard) {
        const key = typeof discard.usesIcon === "string" ? discard.usesIcon : "DISCARD_ICON";
        const random = discardIsRandom(discard);
        const dn = galleryTierNumber(card, discard);
        const disMeta = STS_ICON_GLYPH[key] ?? STS_ICON_GLYPH.DISCARD_ICON;
        const segs = [];
        if (random) segs.push(segmentRandom());
        if (discard.conditioned === true) segs.push(segmentConditional());
        segs.push({
            Icon: disMeta.Icon,
            iconClass: disMeta.iconClass
        });
        if (dn != null) {
            segs.push({
                text: String(dn),
                textClass: `${disMeta.iconClass} font-bold tabular-nums leading-none`
            });
        }
        const nSuffix = dn != null ? ` ${dn}` : "";
        push({
            id: random ? "discard-random" : "discard-fixed",
            label: random ? `Discard${nSuffix} (random)` : `Discard${nSuffix}`,
            clusterClass: clusterShellField("neutral"),
            segments: segs
        });
    }
    const orbList = orbInteractionEntries(c);
    orbList.forEach((entry, i)=>{
        const e = entry;
        let verb = String(e.verb ?? "").toLowerCase();
        if (!verb && (e.orbtype != null || e.orbType != null || e.amount != null)) {
            verb = "channel";
        }
        const uses = resolveOrbCatalogKey(e, verb);
        const orbMeta = STS_ICON_GLYPH[uses] ?? STS_ICON_GLYPH.ANY_ORB;
        const orbAmt = galleryTierNumber(card, e.amount) ?? galleryTierNumber(card, e.times);
        const isChannel = verb === "channel";
        const isEvoke = /^evoke/i.test(verb);
        if (isChannel) {
            const segs = [
                plusSegment(),
                {
                    Icon: orbMeta.Icon,
                    iconClass: orbMeta.iconClass
                }
            ];
            if (orbAmt != null) {
                segs.push({
                    text: String(orbAmt),
                    textClass: `${orbMeta.iconClass} font-bold tabular-nums leading-none`
                });
            }
            const label = orbAmt != null ? `Channel ${orbAmt} (${uses})` : `Channel (${uses})`;
            push({
                id: `orb-${i}-channel`,
                label,
                clusterClass: clusterShellField("neutral"),
                segments: segs
            });
            return;
        }
        if (isEvoke) {
            const ev = STS_ICON_GLYPH.EVOKE_ICON;
            const segs = [
                {
                    Icon: ev.Icon,
                    iconClass: ev.iconClass
                },
                {
                    Icon: orbMeta.Icon,
                    iconClass: orbMeta.iconClass
                }
            ];
            if (orbAmt != null) {
                segs.push({
                    text: String(orbAmt),
                    textClass: `${orbMeta.iconClass} font-bold tabular-nums leading-none`
                });
            }
            const label = orbAmt != null ? `Evoke ${orbAmt} (${uses})` : `Evoke (${uses})`;
            push({
                id: `orb-${i}-evoke`,
                label,
                clusterClass: clusterShellField("neutral"),
                segments: segs
            });
            return;
        }
        const labelVerb = verb || "Orb";
        const label = orbAmt != null ? `${labelVerb} ${orbAmt} (${uses})` : `${labelVerb} (${uses})`;
        push(glyphFromStsKey(`orb-${i}-${labelVerb}`, uses, label) ?? glyphFromStsKey(`orb-${i}-any`, "ANY_ORB", labelVerb));
    });
    if (cardSelfExhaustsOnPlay(card)) {
        push(glyphFromStsKey("exhaust-self", "EXHAUST_SELF", "Exhaust") ?? {
            id: "exhaust-self",
            label: "Exhaust",
            Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"],
            iconClass: "text-orange-400"
        });
    }
    const eg = energyGainNode(card);
    if (eg != null) {
        const egObj = eg !== null && typeof eg === "object" && !Array.isArray(eg) ? eg : null;
        const cond = egObj?.conditioned === true;
        const trigger = typeof egObj?.trigger === "string" ? egObj.trigger : undefined;
        const egDisplay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("energygain");
        if (cond) {
            const condM = STS_ICON_GLYPH.CONDITIONAL_MARKER;
            const en = galleryTierNumber(card, energyGainNode(card));
            const segs = [
                {
                    Icon: condM.Icon,
                    iconClass: condM.iconClass
                },
                {
                    Icon: egDisplay.icon,
                    iconClass: egDisplay.color
                }
            ];
            if (en != null) {
                segs.push({
                    text: String(en),
                    textClass: `${egDisplay.color} font-bold tabular-nums leading-none`
                });
            }
            push({
                id: "energy-combo",
                label: trigger ? `Energy — ${trigger}` : "Energy (conditional)",
                clusterClass: clusterShellField("energy"),
                segments: segs
            });
        } else {
            const en = galleryNumericField(card, "energyGain");
            if (en != null) {
                push({
                    id: "gain-energy-main",
                    label: `Gain ${en} energy`,
                    clusterClass: clusterShellField("energy"),
                    segments: [
                        {
                            Icon: egDisplay.icon,
                            iconClass: egDisplay.color
                        },
                        {
                            text: String(en),
                            textClass: `${egDisplay.color} font-bold tabular-nums leading-none`
                        }
                    ]
                });
            } else {
                push({
                    id: "gain-energy-main",
                    label: "Gain energy",
                    Icon: egDisplay.icon,
                    iconClass: egDisplay.color
                });
            }
        }
    }
    const healRaw = c.heal;
    if (healRaw != null) {
        const h = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("heal");
        push({
            id: "heal-main",
            label: "Heal",
            Icon: h.icon,
            iconClass: h.color
        });
    }
    const focusRaw = c.focus;
    if (focusRaw != null) {
        const f = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("focus");
        push({
            id: "focus-main",
            label: "Focus",
            Icon: f.icon,
            iconClass: f.color
        });
    }
    const scryRaw = c.scry;
    if (scryRaw != null) {
        const sn = galleryTierNumber(card, scryRaw);
        const sc = STS_ICON_GLYPH.SCRY_ICON;
        if (sn != null) {
            push({
                id: "scry-n",
                catalogKey: "SCRY_ICON",
                label: `Scry ${sn}`,
                clusterClass: clusterShellField("neutral"),
                segments: [
                    {
                        Icon: sc.Icon,
                        iconClass: sc.iconClass
                    },
                    {
                        text: String(sn),
                        textClass: `${sc.iconClass} font-bold tabular-nums leading-none`
                    }
                ]
            });
        } else {
            push({
                id: "scry",
                catalogKey: "SCRY_ICON",
                label: "Scry",
                Icon: sc.Icon,
                iconClass: sc.iconClass
            });
        }
    }
    const hpCostRaw = c.hpcost ?? c.hpCost;
    if (hpCostRaw != null) {
        const hn = galleryTierNumber(card, hpCostRaw);
        const hpMeta = STS_ICON_GLYPH.HP_COST;
        if (hn != null) {
            push({
                id: "hp-cost-n",
                catalogKey: "HP_COST",
                label: `HP cost ${hn}`,
                clusterClass: clusterShellField("neutral"),
                segments: [
                    {
                        Icon: hpMeta.Icon,
                        iconClass: hpMeta.iconClass
                    },
                    {
                        text: String(hn),
                        textClass: `${hpMeta.iconClass} font-bold tabular-nums leading-none`
                    }
                ]
            });
        } else {
            push({
                id: "hp-cost",
                catalogKey: "HP_COST",
                label: "HP cost",
                Icon: hpMeta.Icon,
                iconClass: hpMeta.iconClass
            });
        }
    }
    if (c.costManipulation === true) {
        const cm = STS_ICON_GLYPH.COST_MANIP;
        push({
            id: "cost-manip",
            catalogKey: "COST_MANIP",
            label: "Cost manipulation",
            Icon: cm.Icon,
            iconClass: cm.iconClass
        });
    }
    if (c.canUpgradeCards === true) {
        const up = STS_ICON_GLYPH.UPGRADE_CARD;
        push({
            id: "upgrade-cards",
            catalogKey: "UPGRADE_CARD",
            label: "Upgrade cards",
            Icon: up.Icon,
            iconClass: up.iconClass
        });
    }
    const addCardRaw = c.addCard;
    if (addCardRaw && typeof addCardRaw === "object" && !Array.isArray(addCardRaw)) {
        const ac = addCardRaw;
        const addN = galleryTierNumber(card, ac.count) ?? galleryTierNumber(card, ac.addCount) ?? galleryTierNumber(card, addCardRaw);
        const attr = typeof ac.attribute === "string" ? ac.attribute : typeof ac.cardName === "string" ? ac.cardName : undefined;
        const addMeta = STS_ICON_GLYPH.ADD_CARD;
        const segs = [
            plusSegment(),
            {
                Icon: addMeta.Icon,
                iconClass: addMeta.iconClass
            }
        ];
        if (addN != null) {
            segs.push({
                text: String(addN),
                textClass: `${addMeta.iconClass} font-bold tabular-nums leading-none`
            });
        }
        if (attr) {
            segs.push({
                text: attr,
                textClass: "max-w-[4.5rem] truncate text-[0.65em] font-semibold text-slate-300"
            });
        }
        push({
            id: "add-card",
            catalogKey: "ADD_CARD",
            label: attr ? `Add card (${attr})` : "Add card",
            clusterClass: clusterShellField("neutral"),
            segments: segs
        });
    }
    const debuffs = c.appliesDebuffs;
    if (debuffs && typeof debuffs === "object") {
        for (const kind of [
            "vulnerable",
            "weak",
            "poison",
            "wound",
            "losestrength"
        ]){
            const raw = debuffs[kind];
            if (raw == null) continue;
            if (kind === "losestrength") {
                const stacks = galleryTierNumber(card, raw);
                const m = STS_ICON_GLYPH.LOSE_STRENGTH;
                const label = stacks != null ? `Lose Strength ${stacks}` : "Lose Strength";
                if (stacks != null) {
                    push({
                        id: "debuff-losestrength",
                        catalogKey: "LOSE_STRENGTH",
                        label,
                        clusterClass: clusterShellField("neutral"),
                        segments: [
                            {
                                Icon: m.Icon,
                                iconClass: m.iconClass
                            },
                            {
                                text: String(stacks),
                                textClass: `${m.iconClass} font-bold tabular-nums leading-none`
                            }
                        ]
                    });
                } else {
                    push({
                        id: "debuff-losestrength",
                        catalogKey: "LOSE_STRENGTH",
                        label,
                        Icon: m.Icon,
                        iconClass: m.iconClass
                    });
                }
                continue;
            }
            if (kind === "poison") {
                const poisonObj = typeof raw === "object" && !Array.isArray(raw) ? raw : null;
                const stacks = galleryTierNumber(card, raw);
                const hits = poisonObj != null ? galleryTierNumber(card, poisonObj.hits) ?? galleryTierNumber(card, poisonObj.times) : undefined;
                const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("poison");
                const segments = [
                    {
                        Icon: p.icon,
                        iconClass: p.color
                    }
                ];
                const mult = hits ?? stacks;
                if (mult != null) {
                    segments.push({
                        text: "×",
                        textClass: MULTIHIT_TEXT_CLS
                    }, {
                        text: String(mult),
                        textClass: `${p.color} font-bold tabular-nums leading-none`
                    });
                }
                if (hits != null && stacks != null && hits !== stacks) {
                    segments.push({
                        text: `(${stacks})`,
                        textClass: "text-[0.65em] font-semibold tabular-nums text-slate-400"
                    });
                }
                const label = hits != null && stacks != null ? `Poison ×${hits} (${stacks})` : stacks != null ? `Poison ${stacks}` : "Poison";
                push({
                    id: "debuff-poison",
                    catalogKey: "POISON_STAT",
                    label,
                    clusterClass: clusterShellField("neutral"),
                    segments
                });
                continue;
            }
            const eff = kind === "vulnerable" || kind === "weak" ? kind : "wound";
            const d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])(eff);
            const stacks = galleryTierNumber(card, raw);
            const label = stacks != null ? `${kind} ${stacks}` : kind;
            if (stacks != null) {
                push({
                    id: `debuff-${kind}`,
                    label,
                    clusterClass: clusterShellField("neutral"),
                    segments: [
                        {
                            Icon: d.icon,
                            iconClass: d.color
                        },
                        {
                            text: String(stacks),
                            textClass: `${d.color} font-bold tabular-nums leading-none`
                        }
                    ]
                });
            } else {
                push({
                    id: `debuff-${kind}`,
                    label,
                    Icon: d.icon,
                    iconClass: d.color
                });
            }
        }
    }
    const multi = c.multiHit;
    const hasMulti = multi != null && typeof multi === "object" && !Array.isArray(multi) && Object.keys(multi).length > 0;
    if (hasMulti && card.damage != undefined && !("multiHitCount" in multi)) {
        const mhSegs = [];
        if (galleryDamageIsConditional(card)) mhSegs.push(segmentConditional());
        if (damageRowIsAoE(card)) mhSegs.push(segmentAoe());
        const mhIcon = STS_ICON_GLYPH.AOE_DAMAGE;
        mhSegs.push({
            Icon: mhIcon.Icon,
            iconClass: "text-fuchsia-300"
        });
        push({
            id: "multi-hit",
            label: "Multi-hit",
            clusterClass: clusterShellField("damage"),
            segments: mhSegs,
            prefixDamageRow: true
        });
    } else {
        const dmgG = buildDamageLegacyGlyph(card);
        if (dmgG) push(dmgG);
    }
    if (card.block != undefined) {
        const blk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block");
        if (blockIsConditional(card)) {
            const bRaw = card.block && typeof card.block === "object" && !Array.isArray(card.block) ? card.block : undefined;
            const bTrig = typeof bRaw?.trigger === "string" ? String(bRaw.trigger) : undefined;
            const blkN = galleryNumericField(card, "block");
            const segs = [
                segmentConditional(),
                {
                    Icon: blk.icon,
                    iconClass: blk.color
                }
            ];
            if (blkN != null) {
                segs.push({
                    text: String(blkN),
                    textClass: `${blk.color} font-bold tabular-nums leading-none`
                });
            }
            push({
                id: "block-combo",
                label: bTrig ? `Block — ${bTrig}` : "Block (conditional)",
                clusterClass: clusterShellField("block"),
                segments: segs
            });
        } else {
            push({
                id: "block",
                label: "Block",
                Icon: blk.icon,
                iconClass: blk.color
            });
        }
    }
    return out;
}
/** Stat rows to hide when legacy glyphs already show the same numbers in a cluster. */ function legacyGallerySuppressStats(card) {
    const out = {};
    if (card.draw !== undefined && galleryDrawIsConditional(card)) {
        out.draw = true;
    }
    const eg = energyGainNode(card);
    if (eg !== null && typeof eg === "object" && !Array.isArray(eg) && eg.conditioned === true) {
        out.energyGain = true;
    }
    return out;
}
function galleryGlyphsInsideCardOnly(card, glyphs) {
    const drawCond = galleryDrawIsConditional(card);
    return glyphs.filter((g)=>{
        if (g.id === "draw-main" && card.draw != undefined && !drawCond) return false;
        if (g.id === "block" && card.block != undefined) return false;
        if (g.id === "damage" && card.damage != undefined) return false;
        if (g.id === "heal-main" && card.heal != undefined) return false;
        if (g.id === "focus-main" && card.focus != undefined) return false;
        return true;
    });
}
function inferGalleryCardEffects(card) {
    const structured = tryStructuredGalleryGlyphs(card);
    if (structured) {
        return {
            glyphs: moveExhaustGlyphsLast(mergeKeywordGlyphsFirst(card, structured.glyphs)),
            suppressStats: structured.suppressStats
        };
    }
    const legacyGlyphs = inferLegacyCardGalleryGlyphs(card);
    const insideOnly = galleryGlyphsInsideCardOnly(card, legacyGlyphs);
    const glyphs = moveExhaustGlyphsLast(mergeKeywordGlyphsFirst(card, insideOnly));
    const suppressStats = {
        ...legacyGallerySuppressStats(card)
    };
    if (glyphs.some((g)=>g.id === "gain-energy-main" && (g.segments?.length ?? 0) > 0)) {
        suppressStats.energyGain = true;
    }
    if (glyphs.some((g)=>g.id === "hp-cost-n" && (g.segments?.length ?? 0) > 0)) {
        suppressStats.hpcost = true;
    }
    return {
        glyphs,
        suppressStats
    };
}
function galleryDamageRowIsAoE(card) {
    return damageRowIsAoE(card);
}
function inferCardGalleryGlyphs(card) {
    return inferGalleryCardEffects(card).glyphs;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/utils/legendHighlightFromCard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeLegendHighlightIds",
    ()=>computeLegendHighlightIds
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-client] (ecmascript)");
;
function isConditionedEnergyGain(card) {
    const eg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["energyGainNode"])(card);
    return eg !== null && typeof eg === "object" && !Array.isArray(eg) && eg.conditioned === true;
}
function mapCatalogToLegendId(catalogKey) {
    if (catalogKey === "DRAW_ICON") return "stat-draw";
    if (catalogKey === "HP_COST") return "stat-hpcost";
    if (catalogKey === "POISON_STAT") return "stat-poison";
    return catalogKey;
}
function addOrbLegendKeys(card, ids) {
    const c = card;
    for (const entry of (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orbInteractionEntries"])(c)){
        const e = entry;
        let verb = String(e.verb ?? "").toLowerCase();
        if (!verb && (e.orbtype != null || e.orbType != null || e.amount != null)) {
            verb = "channel";
        }
        ids.add((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveOrbCatalogKey"])(e, verb));
        if (/^evoke/i.test(verb)) ids.add("EVOKE_ICON");
    }
}
function addDiscardLegendKeys(card, ids) {
    const d = card.discardEffect;
    if (!d || typeof d !== "object" || Array.isArray(d)) return;
    ids.add("DISCARD_ICON");
    if (d.randomTarget === true || d.random === true) ids.add("RANDOM_ICON");
}
function addGlyphLegendHints(card, glyphs, ids) {
    for (const g of glyphs){
        if (g.catalogKey) ids.add(mapCatalogToLegendId(g.catalogKey));
        switch(g.id){
            case "kw-innate":
                ids.add("KEY_INNATE");
                break;
            case "kw-ethereal":
                ids.add("KEY_ETHEREAL");
                break;
            case "kw-retain":
                ids.add("KEY_RETAIN");
                break;
            case "multi-hit":
            case "structured-multihit":
                ids.add("AOE_DAMAGE");
                break;
            case "structured-aoe-dmg":
            case "damage-combo":
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryDamageRowIsAoE"])(card)) ids.add("AOE_ICON");
                break;
            case "discard-random":
            case "structured-random-discard":
                ids.add("DISCARD_ICON");
                ids.add("RANDOM_ICON");
                break;
            case "discard-fixed":
            case "structured-discard-n":
                ids.add("DISCARD_ICON");
                break;
            case "debuff-weak":
                ids.add("stat-weak");
                break;
            case "debuff-vulnerable":
                ids.add("stat-vulnerable");
                break;
            case "debuff-poison":
                ids.add("stat-poison");
                break;
            case "cost-manip":
                ids.add("COST_MANIP");
                break;
            case "upgrade-cards":
                ids.add("UPGRADE_CARD");
                break;
            case "add-card":
                ids.add("ADD_CARD");
                break;
            case "scry":
            case "scry-n":
                ids.add("SCRY_ICON");
                break;
            case "debuff-losestrength":
                ids.add("LOSE_STRENGTH");
                break;
            case "hp-cost":
            case "hp-cost-n":
                ids.add("stat-hpcost");
                break;
            default:
                break;
        }
    }
}
function computeLegendHighlightIds(card) {
    const ids = new Set();
    const { glyphs, suppressStats } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inferGalleryCardEffects"])(card);
    const c = card;
    if (card.damage !== undefined && !suppressStats.damage) ids.add("stat-damage");
    if (card.block !== undefined && !suppressStats.block) ids.add("stat-block");
    if (card.blockOnExhaust !== undefined) ids.add("stat-block");
    if (card.draw !== undefined && !suppressStats.draw) ids.add("stat-draw");
    /** Suppression hides duplicate stat row when energy is in a glyph cluster; legend should still match the visible icon. */ if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["energyGainNode"])(card) != null) {
        ids.add("stat-energygain");
    }
    if (c.heal != null && !suppressStats.heal) ids.add("stat-heal");
    if (c.focus != null && !suppressStats.focus) ids.add("stat-focus");
    const hpCostNode = c.hpcost ?? c.hpCost;
    if (hpCostNode != null && !suppressStats.hpcost) ids.add("stat-hpcost");
    if (c.weak != null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryTierNumber"])(card, c.weak) != null) ids.add("stat-weak");
    if (card.vulnerable != null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryTierNumber"])(card, card.vulnerable) != null) {
        ids.add("stat-vulnerable");
    }
    const applies = c.appliesDebuffs;
    if (applies && typeof applies === "object" && applies.poison != null) {
        ids.add("stat-poison");
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryTieredBoolActive"])(card, c.innate ?? c.Innate)) ids.add("KEY_INNATE");
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryTieredBoolActive"])(card, c.ethereal ?? c.Ethereal)) ids.add("KEY_ETHEREAL");
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryTieredBoolActive"])(card, c.retain ?? c.Retain)) ids.add("KEY_RETAIN");
    if (c.costManipulation === true) ids.add("COST_MANIP");
    if (c.canUpgradeCards === true) ids.add("UPGRADE_CARD");
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cardSelfExhaustsOnPlay"])(card)) ids.add("EXHAUST_SELF");
    addDiscardLegendKeys(card, ids);
    addOrbLegendKeys(card, ids);
    addGlyphLegendHints(card, glyphs, ids);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryDamageRowIsAoE"])(card) && card.damage !== undefined && !suppressStats.damage) {
        ids.add("AOE_ICON");
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryDamageIsConditional"])(card) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryDrawIsConditional"])(card) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryBlockRowIsConditional"])(card) || isConditionedEnergyGain(card)) {
        ids.add("CONDITIONAL_MARKER");
    }
    return ids;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/context/LegendHighlightContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LegendHighlightProvider",
    ()=>LegendHighlightProvider,
    "useLegendHighlight",
    ()=>useLegendHighlight
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$legendHighlightFromCard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/legendHighlightFromCard.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const LegendHighlightContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function LegendHighlightProvider({ children }) {
    _s();
    const [hoveredCard, setHoveredCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const setHoveredLegendCard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LegendHighlightProvider.useCallback[setHoveredLegendCard]": (card)=>{
            setHoveredCard(card);
        }
    }["LegendHighlightProvider.useCallback[setHoveredLegendCard]"], []);
    const highlightIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LegendHighlightProvider.useMemo[highlightIds]": ()=>{
            if (!hoveredCard) return new Set();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$legendHighlightFromCard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeLegendHighlightIds"])(hoveredCard);
        }
    }["LegendHighlightProvider.useMemo[highlightIds]"], [
        hoveredCard
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LegendHighlightProvider.useMemo[value]": ()=>({
                hoveredCard,
                setHoveredLegendCard,
                highlightIds
            })
    }["LegendHighlightProvider.useMemo[value]"], [
        hoveredCard,
        setHoveredLegendCard,
        highlightIds
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LegendHighlightContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/context/LegendHighlightContext.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(LegendHighlightProvider, "ZSbdkoQIJ0CC0wL7azLqJnlqZis=");
_c = LegendHighlightProvider;
function useLegendHighlight() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LegendHighlightContext);
    if (!ctx) {
        return {
            hoveredCard: null,
            setHoveredLegendCard: ()=>{},
            highlightIds: new Set()
        };
    }
    return ctx;
}
_s1(useLegendHighlight, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "LegendHighlightProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/UI/NotificationProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationProvider",
    ()=>NotificationProvider,
    "ToastStack",
    ()=>ToastStack
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.mjs [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TriangleAlert$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as TriangleAlert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/toast.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
const TYPE_STYLES = {
    success: {
        bar: "border-emerald-500/50 bg-emerald-950/95 text-emerald-50 shadow-emerald-950/40",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
        IconClass: "text-emerald-400"
    },
    error: {
        bar: "border-rose-500/50 bg-rose-950/95 text-rose-50 shadow-rose-950/40",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
        IconClass: "text-rose-400"
    },
    warning: {
        bar: "border-amber-500/50 bg-amber-950/95 text-amber-50 shadow-amber-950/40",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TriangleAlert$3e$__["TriangleAlert"],
        IconClass: "text-amber-400"
    },
    info: {
        bar: "border-sky-500/50 bg-slate-900/95 text-slate-100 shadow-black/50",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"],
        IconClass: "text-sky-400"
    }
};
const NotificationContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function ToastRow({ item, onRemove }) {
    _s();
    const [entered, setEntered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [exiting, setExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ToastRow.useEffect": ()=>{
            const r = requestAnimationFrame({
                "ToastRow.useEffect.r": ()=>setEntered(true)
            }["ToastRow.useEffect.r"]);
            return ({
                "ToastRow.useEffect": ()=>cancelAnimationFrame(r)
            })["ToastRow.useEffect"];
        }
    }["ToastRow.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ToastRow.useEffect": ()=>{
            const t = window.setTimeout({
                "ToastRow.useEffect.t": ()=>setExiting(true)
            }["ToastRow.useEffect.t"], item.durationMs);
            return ({
                "ToastRow.useEffect": ()=>window.clearTimeout(t)
            })["ToastRow.useEffect"];
        }
    }["ToastRow.useEffect"], [
        item.durationMs
    ]);
    const { bar, icon: Icon, IconClass } = TYPE_STYLES[item.type];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "status",
        "aria-live": "polite",
        onTransitionEnd: (e)=>{
            if (e.propertyName === "opacity" && exiting) {
                onRemove(item.id);
            }
        },
        className: [
            "flex max-w-md min-w-[min(100%,18rem)] items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 ease-out",
            bar,
            entered && !exiting ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        ].join(" "),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: [
                    "mt-0.5 h-5 w-5 shrink-0",
                    IconClass
                ].join(" "),
                strokeWidth: 2,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/app/components/UI/NotificationProvider.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium leading-snug break-words",
                children: item.message
            }, void 0, false, {
                fileName: "[project]/app/components/UI/NotificationProvider.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/NotificationProvider.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_s(ToastRow, "03lJqW2/uUwOyYMqbZBM+PRo4KM=");
_c = ToastRow;
function ToastStack() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(NotificationContext);
    if (!ctx) {
        throw new Error("ToastStack must be used within NotificationProvider");
    }
    const { items, remove } = ctx;
    if (items.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none absolute bottom-full left-1/2 z-[500] mb-1 flex w-[min(100%,28rem)] -translate-x-1/2 flex-col items-stretch gap-2 px-2",
        "aria-label": "Notifications",
        children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-auto flex justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastRow, {
                    item: item,
                    onRemove: remove
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/NotificationProvider.tsx",
                    lineNumber: 108,
                    columnNumber: 11
                }, this)
            }, item.id, false, {
                fileName: "[project]/app/components/UI/NotificationProvider.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/app/components/UI/NotificationProvider.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
_s1(ToastStack, "/dMy7t63NXD4eYACoT93CePwGrg=");
_c1 = ToastStack;
function NotificationProvider({ children }) {
    _s2();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const push = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationProvider.useCallback[push]": (payload)=>{
            const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            setItems({
                "NotificationProvider.useCallback[push]": (prev)=>[
                        ...prev,
                        {
                            id,
                            ...payload
                        }
                    ]
            }["NotificationProvider.useCallback[push]"]);
        }
    }["NotificationProvider.useCallback[push]"], []);
    const remove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationProvider.useCallback[remove]": (id)=>{
            setItems({
                "NotificationProvider.useCallback[remove]": (prev)=>prev.filter({
                        "NotificationProvider.useCallback[remove]": (t)=>t.id !== id
                    }["NotificationProvider.useCallback[remove]"])
            }["NotificationProvider.useCallback[remove]"]);
        }
    }["NotificationProvider.useCallback[remove]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationProvider.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["subscribeToasts"])(push);
            return ({
                "NotificationProvider.useEffect": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["subscribeToasts"])(null)
            })["NotificationProvider.useEffect"];
        }
    }["NotificationProvider.useEffect"], [
        push
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NotificationContext.Provider, {
        value: {
            items,
            remove
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/app/components/UI/NotificationProvider.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this);
}
_s2(NotificationProvider, "65hr/Gi7sDiKmsBS0p3GsO+mW/c=");
_c2 = NotificationProvider;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ToastRow");
__turbopack_context__.k.register(_c1, "ToastStack");
__turbopack_context__.k.register(_c2, "NotificationProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_0o5_x4d._.js.map