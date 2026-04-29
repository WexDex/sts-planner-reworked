module.exports = [
"[project]/app/utils/descriptionPlaceholders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DESCRIPTION_PLACEHOLDER_RULES",
    ()=>DESCRIPTION_PLACEHOLDER_RULES,
    "DESCRIPTION_PLACEHOLDER_TOKENS",
    ()=>DESCRIPTION_PLACEHOLDER_TOKENS,
    "applyDescriptionPlaceholders",
    ()=>applyDescriptionPlaceholders,
    "getDescriptionPlaceholderMap",
    ()=>getDescriptionPlaceholderMap,
    "getFormattedDescription",
    ()=>getFormattedDescription,
    "tieredNumeric",
    ()=>tieredNumeric
]);
function tieredNumeric(card, node) {
    if (node === undefined || node === null) return 0;
    if (typeof node === "number" && !Number.isNaN(node)) return node;
    if (typeof node === "object" && !Array.isArray(node)) {
        const o = node;
        if (card.isUpgraded && o.upgraded !== undefined) return o.upgraded;
        if (o.base !== undefined) return o.base;
        if (o.upgraded !== undefined) return o.upgraded;
    }
    return 0;
}
function tieredField(card, field) {
    return tieredNumeric(card, field);
}
function energyGainSource(card) {
    const c = card;
    return c.energyGain ?? c.gainEnergy;
}
function debuffStacks(card, kind) {
    const c = card;
    const debuffs = c.appliesDebuffs;
    const nested = debuffs?.[kind];
    if (nested !== undefined) return tieredNumeric(card, nested);
    return tieredNumeric(card, c[kind]);
}
/** `[W]` in STS: Mantra when `mantra` is present, otherwise Weak stacks. */ function weakOrMantraW(card) {
    const c = card;
    if (c.mantra !== undefined && c.mantra !== null) return tieredNumeric(card, c.mantra);
    return debuffStacks(card, "weak");
}
function discardDisplayCount(card) {
    const d = card.discardEffect;
    if (!d || typeof d !== "object" || Array.isArray(d)) return 0;
    const n = tieredNumeric(card, d);
    return n > 0 ? n : 1;
}
function multiHitCount(card) {
    const c = card;
    const multi = c.multiHit;
    if (!multi || typeof multi !== "object" || Array.isArray(multi)) return 0;
    const mhRaw = multi.multiHitCount;
    if (mhRaw === undefined) return 0;
    return tieredNumeric(card, mhRaw);
}
const PLACEHOLDER_RULES_UNSORTED = [
    {
        token: "[DMG]",
        label: "Damage",
        resolve: (c)=>tieredField(c, c.damage)
    },
    {
        token: "[BLOCK]",
        label: "Block",
        resolve: (c)=>tieredField(c, c.block)
    },
    {
        token: "[B]",
        label: "Block (short)",
        resolve: (c)=>tieredField(c, c.block)
    },
    {
        token: "[DRAW]",
        label: "Draw",
        resolve: (c)=>tieredField(c, c.draw)
    },
    {
        token: "[COST]",
        label: "Cost",
        resolve: (c)=>tieredField(c, c.cost)
    },
    {
        token: "[TAKEDMG]",
        label: "Lose HP / self-hit",
        resolve: (c)=>tieredField(c, c.takeDamage)
    },
    {
        token: "[GAINE]",
        label: "Gain energy (explicit)",
        resolve: (c)=>tieredNumeric(c, energyGainSource(c))
    },
    {
        token: "[G]",
        label: "Gain energy (Ui shorthand)",
        resolve: (c)=>tieredNumeric(c, energyGainSource(c))
    },
    {
        token: "[R]",
        label: "Energy (STS red pip text)",
        resolve: (c)=>tieredNumeric(c, energyGainSource(c))
    },
    {
        token: "[VULN]",
        label: "Vulnerable stacks",
        resolve: (c)=>debuffStacks(c, "vulnerable")
    },
    {
        token: "[WEAK]",
        label: "Weak stacks",
        resolve: (c)=>debuffStacks(c, "weak")
    },
    {
        token: "[W]",
        label: "Mantra or Weak (see card.mantra)",
        resolve: weakOrMantraW
    },
    {
        token: "[MANTRA]",
        label: "Mantra stacks",
        resolve: (c)=>tieredNumeric(c, c.mantra)
    },
    {
        token: "[PSN]",
        label: "Poison stacks",
        resolve: (c)=>debuffStacks(c, "poison")
    },
    {
        token: "[POISON]",
        label: "Poison stacks (long)",
        resolve: (c)=>debuffStacks(c, "poison")
    },
    {
        token: "[WOUND]",
        label: "Wound stacks",
        resolve: (c)=>debuffStacks(c, "wound")
    },
    {
        token: "[FRAIL]",
        label: "Frail stacks",
        resolve: (c)=>debuffStacks(c, "frail")
    },
    {
        token: "[DISCARD]",
        label: "Discard count (discardEffect)",
        resolve: discardDisplayCount
    },
    {
        token: "[HITS]",
        label: "Multi-hit count",
        resolve: multiHitCount
    },
    {
        token: "[HEAL]",
        label: "Heal (optional card.heal)",
        resolve: (c)=>tieredNumeric(c, c.heal)
    },
    {
        token: "[STR]",
        label: "Strength (optional card.strength)",
        resolve: (c)=>tieredNumeric(c, c.strength)
    },
    {
        token: "[DEX]",
        label: "Dexterity (optional card.dexterity)",
        resolve: (c)=>tieredNumeric(c, c.dexterity)
    },
    {
        token: "[FOCUS]",
        label: "Focus (card.focus)",
        resolve: (c)=>tieredNumeric(c, c.focus)
    },
    {
        token: "[LOCK]",
        label: "Lock-On (optional appliesDebuffs.lockOn)",
        resolve: (c)=>debuffStacks(c, "lockOn")
    },
    {
        token: "[ART]",
        label: "Artifact (optional card.artifact)",
        resolve: (c)=>tieredNumeric(c, c.artifact)
    }
];
const DESCRIPTION_PLACEHOLDER_RULES = [
    ...PLACEHOLDER_RULES_UNSORTED
].sort((a, b)=>b.token.length - a.token.length);
const DESCRIPTION_PLACEHOLDER_TOKENS = DESCRIPTION_PLACEHOLDER_RULES.map((r)=>r.token);
function getDescriptionPlaceholderMap(card) {
    const m = new Map();
    for (const r of DESCRIPTION_PLACEHOLDER_RULES){
        m.set(r.token, String(r.resolve(card)));
    }
    return m;
}
function applyDescriptionPlaceholders(description, card) {
    let result = description;
    for (const r of DESCRIPTION_PLACEHOLDER_RULES){
        result = result.replaceAll(r.token, String(r.resolve(card)));
    }
    return result;
}
function getFormattedDescription(description, card) {
    if (!description) return "";
    return applyDescriptionPlaceholders(description, card);
}
}),
"[project]/app/utils/utils.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBlockStats",
    ()=>getBlockStats,
    "getDamageStats",
    ()=>getDamageStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$descriptionPlaceholders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/descriptionPlaceholders.ts [app-ssr] (ecmascript)");
;
const weakMultiplier = 0.75;
const vulnerableMultiplier = 1.75;
const frailMultiplier = 0.75;
function getDamageStats(dmg) {
    if (!dmg) return null;
    return {
        dmg,
        weak: Math.floor(dmg * weakMultiplier),
        vulnerable: Math.floor(dmg * vulnerableMultiplier),
        both: Math.floor(dmg * weakMultiplier * vulnerableMultiplier)
    };
}
function getBlockStats(block) {
    if (!block) return null;
    return {
        block,
        frail: Math.floor(block * frailMultiplier)
    };
}
}),
"[project]/app/components/UI/cardVisualVariants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CARD_VISUAL_VARIANTS",
    ()=>CARD_VISUAL_VARIANTS,
    "DEFAULT_CARD_VISUAL_VARIANT",
    ()=>DEFAULT_CARD_VISUAL_VARIANT,
    "getCardVariantChrome",
    ()=>getCardVariantChrome
]);
const CARD_VISUAL_VARIANTS = [
    "aurora",
    "flat",
    "neon",
    "paper",
    "mono"
];
const DEFAULT_CARD_VISUAL_VARIANT = "aurora";
function interactiveMotion(interactive, isSelected) {
    if (!interactive) {
        if (isSelected) {
            return "cursor-default ring-[3px] ring-amber-400/90 shadow-amber-400/40 animate-pulse-glow -translate-y-2 scale-[1.03]";
        }
        return "cursor-default";
    }
    if (isSelected) {
        return "cursor-pointer ring-[3px] ring-amber-400/90 shadow-amber-400/40 animate-pulse-glow -translate-y-2 scale-[1.03]";
    }
    return "cursor-pointer hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl hover:brightness-110 hover:ring-2 hover:ring-white/30";
}
function getCardVariantChrome(args) {
    const { variant, typeStyles, interactive, isSelected } = args;
    const motion = interactiveMotion(interactive, isSelected);
    if (variant === "aurora") {
        return {
            root: `relative overflow-hidden border-2 ${typeStyles.border} ${typeStyles.glow} bg-gradient-to-b ${typeStyles.gradient} shadow-xl backdrop-blur-sm transition-all duration-300 animate-slide-in-up ${motion}`,
            topLine: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent",
            innerRim: `pointer-events-none absolute inset-[3px] rounded-[inherit] border ${typeStyles.accentBorder} opacity-35 transition-opacity duration-300`,
            bottomLine: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent",
            nameBandExtra: "",
            descBoxExtra: "",
            typeLabelExtra: "",
            costOrbExtra: "animate-bounce-pop hover:animate-pulse-glow"
        };
    }
    if (variant === "flat") {
        return {
            root: `relative overflow-hidden border-2 ${typeStyles.border} bg-gradient-to-b ${typeStyles.gradient} shadow-md transition-all duration-200 ${motion}`,
            topLine: "pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10",
            innerRim: `pointer-events-none absolute inset-[2px] rounded-[inherit] border ${typeStyles.accentBorder} opacity-25`,
            bottomLine: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/20",
            nameBandExtra: "",
            descBoxExtra: "",
            typeLabelExtra: "",
            costOrbExtra: ""
        };
    }
    if (variant === "neon") {
        return {
            root: `relative overflow-hidden border border-white/20 ${typeStyles.glow} bg-gradient-to-b ${typeStyles.gradient} shadow-2xl brightness-95 transition-all duration-300 ${motion}`,
            topLine: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent",
            innerRim: `pointer-events-none absolute inset-[4px] rounded-[inherit] border ${typeStyles.accentBorder} opacity-50`,
            bottomLine: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent",
            nameBandExtra: "",
            descBoxExtra: "",
            typeLabelExtra: "",
            costOrbExtra: "ring-2 ring-white/25 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
        };
    }
    if (variant === "paper") {
        return {
            root: `relative overflow-hidden border-2 ${typeStyles.border} bg-gradient-to-b ${typeStyles.gradient} shadow-lg saturate-75 contrast-95 ring-1 ring-amber-950/40 transition-all duration-300 ${motion}`,
            topLine: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/15 to-transparent",
            innerRim: `pointer-events-none absolute inset-[3px] rounded-[inherit] border ${typeStyles.accentBorder} opacity-30`,
            bottomLine: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-stone-900/50 to-transparent",
            nameBandExtra: "",
            descBoxExtra: "",
            typeLabelExtra: "",
            costOrbExtra: ""
        };
    }
    /* mono */ return {
        root: `relative overflow-hidden border-2 border-slate-600/90 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-lg transition-all duration-300 ${motion}`,
        topLine: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/20 to-transparent",
        innerRim: "pointer-events-none absolute inset-[3px] rounded-[inherit] border border-slate-500/50 opacity-40",
        bottomLine: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-600/25 to-transparent",
        nameBandExtra: "!bg-slate-800/95 !border-slate-500/80",
        descBoxExtra: "!bg-slate-800/95 !border-slate-500/80 !text-stone-200/95",
        typeLabelExtra: "!text-slate-400 opacity-100",
        costOrbExtra: ""
    };
}
}),
"[project]/app/types/types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LOCATION",
    ()=>LOCATION,
    "cardTypeStyles",
    ()=>cardTypeStyles
]);
var LOCATION = /*#__PURE__*/ function(LOCATION) {
    LOCATION["HAND"] = "hand";
    LOCATION["DRAW"] = "draw";
    LOCATION["DISCARD"] = "discard";
    LOCATION["EXHAUST"] = "exhaust";
    LOCATION["PLAYED"] = "playedCards";
    return LOCATION;
}({});
const cardTypeStyles = {
    Attack: {
        gradient: 'from-red-950 via-red-900/90 to-red-950',
        border: 'border-red-600/60',
        glow: 'shadow-red-900/50',
        accentBorder: 'border-red-500/80',
        costBg: 'bg-gradient-to-br from-red-600 to-red-800',
        costGlow: 'shadow-red-500/60',
        nameBg: 'bg-red-950/80',
        statColor: 'text-red-300',
        typeColor: 'text-red-400'
    },
    Skill: {
        gradient: 'from-emerald-950 via-emerald-900/90 to-emerald-950',
        border: 'border-emerald-600/60',
        glow: 'shadow-emerald-900/50',
        accentBorder: 'border-emerald-500/80',
        costBg: 'bg-gradient-to-br from-emerald-600 to-emerald-800',
        costGlow: 'shadow-emerald-500/60',
        nameBg: 'bg-emerald-950/80',
        statColor: 'text-emerald-300',
        typeColor: 'text-emerald-400'
    },
    Power: {
        gradient: 'from-violet-950 via-violet-900/90 to-violet-950',
        border: 'border-violet-600/60',
        glow: 'shadow-violet-900/50',
        accentBorder: 'border-violet-500/80',
        costBg: 'bg-gradient-to-br from-violet-600 to-violet-800',
        costGlow: 'shadow-violet-500/60',
        nameBg: 'bg-violet-950/80',
        statColor: 'text-violet-300',
        typeColor: 'text-violet-400'
    },
    Potion: {
        gradient: 'from-amber-950 via-amber-900/90 to-amber-950',
        border: 'border-amber-600/60',
        glow: 'shadow-amber-900/50',
        accentBorder: 'border-amber-500/80',
        costBg: 'bg-gradient-to-br from-amber-600 to-amber-800',
        costGlow: 'shadow-amber-500/60',
        nameBg: 'bg-amber-950/80',
        statColor: 'text-amber-300',
        typeColor: 'text-amber-400'
    },
    Curse: {
        gradient: 'from-slate-950 via-purple-950/90 to-slate-950',
        border: 'border-purple-900/80',
        glow: 'shadow-purple-950/70',
        accentBorder: 'border-purple-700/70',
        costBg: 'bg-gradient-to-br from-purple-800 to-purple-950',
        costGlow: 'shadow-purple-700/60',
        nameBg: 'bg-purple-950/80',
        statColor: 'text-purple-300',
        typeColor: 'text-purple-400'
    },
    Status: {
        gradient: 'from-slate-900 via-slate-800/90 to-slate-900',
        border: 'border-slate-600/60',
        glow: 'shadow-slate-900/50',
        accentBorder: 'border-slate-500/70',
        costBg: 'bg-gradient-to-br from-slate-600 to-slate-800',
        costGlow: 'shadow-slate-500/60',
        nameBg: 'bg-slate-900/80',
        statColor: 'text-slate-300',
        typeColor: 'text-slate-400'
    }
};
}),
"[project]/app/card-design-gallery/galleryCharacterCardStyles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGalleryCharacterChromeStyle",
    ()=>getGalleryCharacterChromeStyle,
    "resolveGameCardChromeStyle",
    ()=>resolveGameCardChromeStyle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/types.ts [app-ssr] (ecmascript)");
;
const IRONCLAD = {
    gradient: "from-rose-950 via-red-900/92 to-rose-950",
    border: "border-red-700/55",
    glow: "shadow-red-950/45",
    accentBorder: "border-rose-500/75",
    costBg: "bg-gradient-to-br from-rose-600 to-red-900",
    costGlow: "shadow-rose-500/55",
    nameBg: "bg-red-950/85",
    statColor: "text-rose-200",
    typeColor: "text-rose-300"
};
const SILENT = {
    gradient: "from-emerald-950 via-green-900/90 to-emerald-950",
    border: "border-emerald-600/55",
    glow: "shadow-emerald-950/45",
    accentBorder: "border-emerald-400/75",
    costBg: "bg-gradient-to-br from-emerald-600 to-emerald-900",
    costGlow: "shadow-emerald-500/50",
    nameBg: "bg-emerald-950/85",
    statColor: "text-emerald-200",
    typeColor: "text-emerald-300"
};
const DEFECT = {
    gradient: "from-sky-950 via-cyan-900/88 to-sky-950",
    border: "border-sky-600/55",
    glow: "shadow-sky-950/45",
    accentBorder: "border-sky-400/75",
    costBg: "bg-gradient-to-br from-sky-600 to-blue-900",
    costGlow: "shadow-sky-500/50",
    nameBg: "bg-sky-950/85",
    statColor: "text-sky-200",
    typeColor: "text-sky-300"
};
const WATCHER = {
    gradient: "from-violet-950 via-purple-900/90 to-violet-950",
    border: "border-violet-500/55",
    glow: "shadow-violet-950/45",
    accentBorder: "border-fuchsia-400/70",
    costBg: "bg-gradient-to-br from-violet-600 to-purple-900",
    costGlow: "shadow-violet-500/50",
    nameBg: "bg-violet-950/85",
    statColor: "text-violet-200",
    typeColor: "text-fuchsia-300"
};
/** Neutral / merchant / shared pool — lighter gray chrome */ const COLORLESS = {
    gradient: "from-zinc-600 via-zinc-500/88 to-zinc-600",
    border: "border-zinc-400/45",
    glow: "shadow-zinc-900/35",
    accentBorder: "border-zinc-300/55",
    costBg: "bg-gradient-to-br from-zinc-500 to-zinc-700",
    costGlow: "shadow-zinc-400/35",
    nameBg: "bg-zinc-700/88",
    statColor: "text-zinc-100",
    typeColor: "text-zinc-200"
};
const STATUS = {
    gradient: "from-slate-700 via-slate-600/92 to-slate-700",
    border: "border-slate-500/55",
    glow: "shadow-slate-900/40",
    accentBorder: "border-slate-400/65",
    costBg: "bg-gradient-to-br from-slate-500 to-slate-700",
    costGlow: "shadow-slate-500/40",
    nameBg: "bg-slate-800/90",
    statColor: "text-slate-200",
    typeColor: "text-slate-300"
};
const CURSE = {
    gradient: "from-neutral-950 via-black/96 to-neutral-950",
    border: "border-zinc-900/85",
    glow: "shadow-black/55",
    accentBorder: "border-zinc-700/55",
    costBg: "bg-gradient-to-br from-zinc-800 to-black",
    costGlow: "shadow-zinc-900/50",
    nameBg: "bg-black/80",
    statColor: "text-zinc-400",
    typeColor: "text-zinc-500"
};
function getGalleryCharacterChromeStyle(card) {
    const raw = card.character;
    const c = typeof raw === "string" ? raw.toLowerCase() : undefined;
    const t = card.type;
    const key = c ?? (t === "Curse" ? "curse" : t === "Status" ? "status" : undefined);
    switch(key){
        case "ironclad":
            return IRONCLAD;
        case "silent":
            return SILENT;
        case "defect":
            return DEFECT;
        case "watcher":
            return WATCHER;
        case "colorless":
            return COLORLESS;
        case "status":
            return STATUS;
        case "curse":
            return CURSE;
        default:
            return COLORLESS;
    }
}
function resolveGameCardChromeStyle(card, galleryChromeStyle) {
    if (galleryChromeStyle) return galleryChromeStyle;
    const hasChar = typeof card.character === "string";
    if (hasChar || card.type === "Curse" || card.type === "Status") {
        return getGalleryCharacterChromeStyle(card);
    }
    const validTypes = [
        "Attack",
        "Skill",
        "Power",
        "Potion",
        "Curse",
        "Status"
    ];
    const cardType = validTypes.includes(card.type || "") ? card.type : "Attack";
    return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cardTypeStyles"][cardType];
}
}),
"[project]/app/components/UI/Card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>STSCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/effectDisplay.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/utils/utils.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$descriptionPlaceholders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/descriptionPlaceholders.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/GameContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$LegendHighlightContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/LegendHighlightContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardVisualVariants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/cardVisualVariants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryCharacterCardStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryCharacterCardStyles.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
const SIZE_STYLES = {
    small: {
        frame: "w-[6.25rem] h-[8.5rem] rounded-xl",
        costOrb: "h-7 w-7 -left-1.5 -top-1.5 ring-2 ring-slate-950/80",
        costText: "text-sm font-extrabold tabular-nums",
        bodyPad: "px-1.5 pb-1 pt-1",
        nameBand: "mt-2.5 rounded-md px-1.5 py-1",
        name: "text-[10px] font-bold leading-tight tracking-tight",
        upgradedBadge: "text-[9px]",
        changedPill: "mt-0.5 px-1 py-px text-[8px] font-semibold tracking-wide",
        typeLabel: "pt-1 text-[8px] font-semibold uppercase tracking-widest",
        galleryIcon: "h-3 w-3",
        galleryText: "text-[10px] font-bold"
    },
    medium: {
        frame: "w-[8.25rem] h-[12rem] rounded-xl",
        costOrb: "h-8 w-8 -left-1.5 -top-1.5 ring-[2.5px] ring-slate-950/85",
        costText: "text-base font-extrabold tabular-nums",
        bodyPad: "px-2 pb-1.5 pt-1",
        nameBand: "mt-3.5 rounded-md px-2 py-1",
        name: "text-[11px] font-bold leading-tight tracking-tight",
        upgradedBadge: "text-[10px]",
        changedPill: "mt-0.5 px-1.5 py-px text-[9px] font-semibold tracking-wide",
        statMain: "text-[13px] font-bold tabular-nums",
        statSide: "text-[10px] font-semibold tabular-nums leading-none",
        statIcon: "h-3.5 w-3.5 shrink-0",
        midGap: "my-1 gap-1",
        descBox: "rounded-md px-1.5 py-1.5 text-[10px] font-medium leading-snug tracking-tight",
        typeLabel: "pt-1 text-[9px] font-semibold uppercase tracking-[0.1em]",
        galleryIcon: "h-3.5 w-3.5",
        galleryText: "text-[13px] font-bold"
    },
    large: {
        frame: "w-[10.5rem] h-[15.25rem] rounded-2xl",
        costOrb: "h-9 w-9 -left-1.5 -top-1.5 ring-[3px] ring-slate-950/90",
        costText: "text-lg font-extrabold tabular-nums",
        bodyPad: "px-2 pb-1.5 pt-1",
        nameBand: "mt-5 rounded-lg px-2 py-1.5",
        name: "text-[13px] font-bold leading-snug tracking-tight",
        upgradedBadge: "text-xs",
        changedPill: "mt-1 px-1.5 py-0.5 text-[9px] font-bold tracking-wide",
        statMain: "text-[15px] font-bold tabular-nums",
        statSide: "text-[11px] font-semibold tabular-nums leading-none",
        statIcon: "h-4 w-4 shrink-0",
        midGap: "my-1.5 gap-1",
        descBox: "rounded-md px-2 py-2 text-[11px] font-medium leading-snug tracking-tight",
        typeLabel: "pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        galleryIcon: "h-4 w-4",
        galleryText: "text-[15px] font-bold"
    }
};
function renderGalleryGlyphCluster(g, iconCls, textBaseCls, opts) {
    const fallbackShell = "rounded-md border border-white/15 bg-black/20 px-1 py-0.5 shadow-sm";
    const shell = opts?.stripClusterShell ? "" : g.clusterClass ?? fallbackShell;
    const row = [
        "inline-flex",
        "items-center",
        "gap-0.5",
        shell,
        textBaseCls
    ].filter(Boolean).join(" ");
    if (g.segments?.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            title: g.label,
            className: row,
            children: g.segments.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                    children: [
                        s.Icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(s.Icon, {
                            className: `${iconCls} shrink-0 ${s.iconClass ?? ""}`,
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 123,
                            columnNumber: 15
                        }, this) : null,
                        s.text != null && s.text !== "" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: s.textClass ?? "",
                            children: s.text
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 129,
                            columnNumber: 15
                        }, this) : null
                    ]
                }, i, true, {
                    fileName: "[project]/app/components/UI/Card.tsx",
                    lineNumber: 121,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/app/components/UI/Card.tsx",
            lineNumber: 119,
            columnNumber: 7
        }, this);
    }
    if (g.Icon) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            title: g.label,
            className: [
                "inline-flex",
                "items-center",
                "gap-0.5",
                shell,
                g.iconClass ?? "",
                textBaseCls
            ].filter(Boolean).join(" "),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(g.Icon, {
                className: `${iconCls} shrink-0`,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 145,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/UI/Card.tsx",
            lineNumber: 139,
            columnNumber: 7
        }, this);
    }
    return null;
}
function STSCard({ card, index, location, size = "large", interactive = true, legendHover = true, variant = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardVisualVariants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CARD_VISUAL_VARIANT"], galleryEffectGlyphs, gallerySuppressStats, galleryChromeStyle }) {
    const { toggleCardSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameManager"])();
    const { setHoveredLegendCard } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$LegendHighlightContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLegendHighlight"])();
    const inferredGallery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inferGalleryCardEffects"])(card), [
        card
    ]);
    const mergedEffectGlyphs = galleryEffectGlyphs ?? (inferredGallery.glyphs.length > 0 ? inferredGallery.glyphs : undefined);
    const mergedSuppressStats = gallerySuppressStats ?? (Object.keys(inferredGallery.suppressStats).length > 0 ? inferredGallery.suppressStats : undefined);
    const styles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryCharacterCardStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveGameCardChromeStyle"])(card, galleryChromeStyle);
    const sz = size === "small" ? SIZE_STYLES.small : size === "medium" ? SIZE_STYLES.medium : SIZE_STYLES.large;
    /** Stats + description typography (only for medium & large — small is name + type only). */ const stat = size === "small" ? null : size === "medium" ? SIZE_STYLES.medium : SIZE_STYLES.large;
    function getValue(field) {
        const c = card;
        const raw = field === "energyGain" ? card.energyGain ?? c.gainEnergy : field === "hpcost" ? c.hpcost ?? c.hpCost : c[field];
        if (raw === undefined) return undefined;
        if (typeof raw === "number") {
            return raw;
        }
        if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
            const v = raw;
            if (card.isUpgraded && v.upgraded !== undefined) {
                return v.upgraded;
            }
            if (v.base !== undefined) return v.base;
            if (v.upgraded !== undefined) return v.upgraded;
        }
        return undefined;
    }
    function getFullDamage() {
        if (card.damage === undefined) return undefined;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDamageStats"])(getValue("damage"));
    }
    function getFullBlock() {
        if (card.block === undefined) return undefined;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getBlockStats"])(getValue("block"));
    }
    /** Root `xCost` takes priority over numeric `cost` for the orb (Slay-the-Spire-style X cards). */ function cardUsesXCost() {
        const v = card.xCost;
        if (v === undefined || v === null || v === false) return false;
        if (typeof v === "number" && v === 0) return false;
        if (typeof v === "string" && v.trim() === "") return false;
        return true;
    }
    /** Hide cost orb for curse / status / STS `unplayable` (Necronomicurse, etc.). */ const hideCostOrb = card.type === "Curse" || card.type === "Status" || card.unplayable === true;
    const chrome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardVisualVariants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCardVariantChrome"])({
        variant,
        typeStyles: styles,
        interactive,
        isSelected: !!card.isSelected
    });
    const rawGalleryGlyphs = mergedEffectGlyphs ?? [];
    const prefixDamageGlyphs = stat ? rawGalleryGlyphs.filter((g)=>g.prefixDamageRow) : [];
    const suffixGalleryGlyphs = stat ? rawGalleryGlyphs.filter((g)=>!g.prefixDamageRow) : rawGalleryGlyphs;
    const showDamageStatBlock = card.damage !== undefined && !mergedSuppressStats?.damage;
    const showDamageRow = showDamageStatBlock || prefixDamageGlyphs.length > 0;
    const unifiedDamageAoE = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["galleryDamageRowIsAoE"])(card) && showDamageRow;
    const damageAoEGroupClass = unifiedDamageAoE ? "inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-rose-400/25 bg-rose-950/45 px-1.5 py-1 shadow-sm" : "flex flex-wrap items-center justify-center gap-1";
    const blockConditionalShell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["galleryBlockRowIsConditional"])(card) && card.block !== undefined;
    const blockRowGroupClass = blockConditionalShell ? "inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-blue-400/25 bg-blue-950/40 px-1.5 py-1 shadow-sm" : "flex items-center gap-1";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-sts-card": "",
        onMouseEnter: legendHover ? ()=>{
            setHoveredLegendCard(card);
        } : undefined,
        onMouseLeave: legendHover ? ()=>{
            setHoveredLegendCard(null);
        } : undefined,
        onClick: interactive ? (e)=>{
            e.stopPropagation();
            toggleCardSelection(location, index);
        } : undefined,
        className: `${sz.frame} ${chrome.root}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: chrome.topLine
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 307,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: chrome.innerRim
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 309,
                columnNumber: 7
            }, this),
            !hideCostOrb && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute z-10 flex items-center justify-center rounded-full border-2 border-slate-950 ${sz.costOrb} ${styles.costBg} ${styles.costGlow} shadow-lg ${chrome.costOrbExtra}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `${sz.costText} text-white drop-shadow-md`,
                    children: cardUsesXCost() ? "X" : getValue("cost")
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/Card.tsx",
                    lineNumber: 315,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 312,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative flex h-full flex-col ${sz.bodyPad}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${styles.nameBg} ${sz.nameBand} border ${styles.accentBorder} backdrop-blur-sm transition-all duration-300 hover:brightness-125 ${chrome.nameBandExtra}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${sz.name} flex flex-col items-center justify-center text-center text-white`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: card.isUpgraded ? "text-emerald-300 animate-pulse" : "",
                                            children: card.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/Card.tsx",
                                            lineNumber: 329,
                                            columnNumber: 15
                                        }, this),
                                        card.isUpgraded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `${sz.upgradedBadge} ml-0.5 text-emerald-400`,
                                            children: "+"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/Card.tsx",
                                            lineNumber: 337,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 328,
                                    columnNumber: 13
                                }, this),
                                card.isChanged && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${sz.changedPill} inline-block rounded-full bg-amber-400/25 text-amber-200 animate-bounce-pop`,
                                    children: "CHANGED"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 343,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 325,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 322,
                        columnNumber: 9
                    }, this),
                    !stat && rawGalleryGlyphs.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-1 flex-col items-center justify-center gap-0.5 py-0.5",
                        "aria-label": "Extra effects",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center justify-center gap-1",
                            children: rawGalleryGlyphs.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: renderGalleryGlyphCluster(g, SIZE_STYLES.small.galleryIcon, "text-[10px]")
                                }, g.id, false, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 359,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 357,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 353,
                        columnNumber: 11
                    }, this) : null,
                    stat && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex flex-1 flex-col items-center justify-center ${stat.midGap}`,
                        children: [
                            showDamageRow ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: damageAoEGroupClass,
                                children: [
                                    prefixDamageGlyphs.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                            children: renderGalleryGlyphCluster(g, stat.galleryIcon, stat.galleryText, unifiedDamageAoE ? {
                                                stripClusterShell: true
                                            } : undefined)
                                        }, g.id, false, {
                                            fileName: "[project]/app/components/UI/Card.tsx",
                                            lineNumber: 374,
                                            columnNumber: 19
                                        }, this)),
                                    showDamageStatBlock ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statMain} inline-flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").color}`,
                                        children: [
                                            /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").icon, {
                                                className: `${stat.statIcon} inline`
                                            }),
                                            getFullDamage()?.dmg
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 384,
                                        columnNumber: 19
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 372,
                                columnNumber: 15
                            }, this) : null,
                            card.block !== undefined && !mergedSuppressStats?.block && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: blockRowGroupClass,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block").color}`,
                                        children: [
                                            /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block").icon, {
                                                className: `${stat.statIcon} inline`
                                            }),
                                            getFullBlock()?.block
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 397,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statSide} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("frail").color}`,
                                        children: getFullBlock()?.frail
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 405,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 396,
                                columnNumber: 15
                            }, this),
                            card.blockOnExhaust !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block").color}`,
                                        children: [
                                            /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block").icon, {
                                                className: `${stat.statIcon} inline`
                                            }),
                                            getValue("blockOnExhaust")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 414,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statSide} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("frail").color}`,
                                        children: getFullBlock()?.frail
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 422,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 413,
                                columnNumber: 15
                            }, this),
                            card.draw !== undefined && !mergedSuppressStats?.draw && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").color}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("draw")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 431,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 430,
                                columnNumber: 15
                            }, this),
                            card.takeDamage !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${styles.statColor}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("takedamage").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("takeDamage")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 443,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 442,
                                columnNumber: 15
                            }, this),
                            getValue("hpcost") !== undefined && !mergedSuppressStats?.hpcost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("hpcost").color}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("hpcost").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("hpcost")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 455,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 454,
                                columnNumber: 15
                            }, this),
                            (card.energyGain != null || card.gainEnergy != null) && !mergedSuppressStats?.energyGain && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${styles.statColor}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("energygain").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("energyGain")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 469,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 468,
                                columnNumber: 15
                            }, this),
                            card.heal != null && !mergedSuppressStats?.heal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("heal").color}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("heal").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("heal")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 481,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 480,
                                columnNumber: 15
                            }, this),
                            card.focus != null && !mergedSuppressStats?.focus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("focus").color}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("focus").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("focus")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 493,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 492,
                                columnNumber: 15
                            }, this),
                            suffixGalleryGlyphs.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center justify-center gap-x-2 gap-y-1",
                                "aria-label": "Extra effects",
                                children: suffixGalleryGlyphs.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                        children: renderGalleryGlyphCluster(g, stat.galleryIcon, stat.galleryText)
                                    }, g.id, false, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 509,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 504,
                                columnNumber: 15
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 368,
                        columnNumber: 11
                    }, this),
                    stat && card.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${styles.nameBg} ${stat.descBox} border ${styles.accentBorder} text-center text-slate-200/95 backdrop-blur-sm ${chrome.descBoxExtra}`,
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$descriptionPlaceholders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFormattedDescription"])(card.description, card)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 523,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${sz.typeLabel} ${styles.typeColor} mt-auto text-center opacity-80 ${chrome.typeLabelExtra}`,
                        children: card.type
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 530,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 321,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: chrome.bottomLine
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 537,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/Card.tsx",
        lineNumber: 281,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/components/CardDBModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CardDBModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/gameCardFromSts.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
'use client';
;
;
;
;
;
;
;
;
const LOCATIONS = [
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].DRAW,
        label: 'Draw',
        sub: 'pile',
        activeClass: 'border-sky-500/80 bg-sky-950/50',
        ringClass: 'ring-sky-500/40',
        dotClass: 'bg-sky-400'
    },
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].HAND,
        label: 'Hand',
        sub: '',
        activeClass: 'border-emerald-500/80 bg-emerald-950/40',
        ringClass: 'ring-emerald-500/40',
        dotClass: 'bg-emerald-400'
    },
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].DISCARD,
        label: 'Discard',
        sub: 'pile',
        activeClass: 'border-rose-500/80 bg-rose-950/45',
        ringClass: 'ring-rose-500/40',
        dotClass: 'bg-rose-400'
    },
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].EXHAUST,
        label: 'Exhaust',
        sub: 'pile',
        activeClass: 'border-amber-500/80 bg-amber-950/35',
        ringClass: 'ring-amber-500/35',
        dotClass: 'bg-amber-400'
    }
];
function typeBadgeClass(type) {
    switch(type){
        case 'Attack':
            return 'bg-red-950/90 text-red-200 border-red-800/60';
        case 'Skill':
            return 'bg-blue-950/90 text-blue-200 border-blue-800/60';
        case 'Power':
            return 'bg-violet-950/90 text-violet-200 border-violet-800/60';
        case 'Curse':
            return 'bg-orange-950/90 text-orange-200 border-orange-800/60';
        case 'Status':
            return 'bg-slate-800 text-slate-200 border-slate-600/60';
        default:
            return 'bg-slate-800 text-slate-300 border-slate-600/60';
    }
}
function CardDBModal({ isOpen, onClose, variant = 'add', onAddCard, onTransform }) {
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedCard, setSelectedCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedLocation, setSelectedLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].DRAW);
    const [isUpgraded, setIsUpgraded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedType, setSelectedType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    const stsCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStsCardsRecord"])(), []);
    const cardEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return Object.entries(stsCards).filter(([cardId, cardData])=>{
            const desc = String(cardData.description ?? '');
            const matchesSearch = cardId.toLowerCase().includes(searchTerm.toLowerCase()) || desc.toLowerCase().includes(searchTerm.toLowerCase());
            const t = cardData.type;
            const matchesType = selectedType === 'all' || t?.toLowerCase() === selectedType.toLowerCase();
            return matchesSearch && matchesType;
        });
    }, [
        stsCards,
        searchTerm,
        selectedType
    ]);
    const cardTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const types = new Set();
        Object.values(stsCards).forEach((card)=>{
            const t = card.type;
            if (t) types.add(t);
        });
        return Array.from(types).sort();
    }, [
        stsCards
    ]);
    const typeRadioOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            {
                value: 'all',
                label: 'All'
            },
            ...cardTypes.map((t)=>({
                    value: t.toLowerCase(),
                    label: t
                }))
        ], [
        cardTypes
    ]);
    const handleConfirm = ()=>{
        if (!selectedCard) return;
        if (variant === 'transform' && onTransform) {
            onTransform(selectedCard, isUpgraded);
        } else if (onAddCard) {
            onAddCard(selectedCard, selectedLocation, isUpgraded);
        }
        onClose();
        setSelectedCard(null);
        setIsUpgraded(false);
    };
    const previewCard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!selectedCard) return null;
        const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["gameCardFromDatabaseId"])(selectedCard, {
            isUpgraded
        });
        if (!c) return null;
        return {
            ...c,
            isChanged: variant === 'transform',
            isSelected: false
        };
    }, [
        selectedCard,
        isUpgraded,
        variant
    ]);
    if (!isOpen || !mounted) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "card-db-modal-title",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "absolute inset-0 z-0 bg-slate-950/75 backdrop-blur-sm",
                "aria-label": "Close modal",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/app/components/CardDBModal.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-600/50 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl shadow-black/50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0 border-b border-slate-700/80 bg-slate-900/95 px-5 py-4 sm:px-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 flex items-start justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                id: "card-db-modal-title",
                                                className: "text-lg font-bold tracking-tight text-white sm:text-xl",
                                                children: variant === 'transform' ? 'Transform into…' : 'Add card'
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 166,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-0.5 text-xs text-slate-500",
                                                children: variant === 'transform' ? 'Choose a card from the database. Selected cards in play become that card (marked changed).' : 'Search the database, pick a destination pile, then add.'
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 169,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                        lineNumber: 165,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: onClose,
                                        className: "rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CardDBModal.tsx",
                                            lineNumber: 180,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/CardDBModal.tsx",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4 lg:flex-row lg:items-end",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative min-w-0 flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 186,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "search",
                                                placeholder: "Search by name or description…",
                                                value: searchTerm,
                                                onChange: (e)=>setSearchTerm(e.target.value),
                                                className: "w-full rounded-xl border border-slate-600/80 bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none ring-0 transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 187,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                        lineNumber: 185,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
                                                children: "Type"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 197,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                role: "radiogroup",
                                                "aria-label": "Filter by card type",
                                                className: "flex flex-wrap gap-1.5 rounded-xl border border-slate-700/80 bg-slate-950/50 p-1.5",
                                                children: typeRadioOptions.map((opt)=>{
                                                    const checked = selectedType === opt.value;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: `relative cursor-pointer select-none rounded-lg px-3 py-1.5 text-xs font-medium transition ${checked ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "radio",
                                                                name: "card-db-type",
                                                                value: opt.value,
                                                                checked: checked,
                                                                onChange: ()=>setSelectedType(opt.value),
                                                                className: "sr-only"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                                lineNumber: 214,
                                                                columnNumber: 23
                                                            }, this),
                                                            opt.label
                                                        ]
                                                    }, opt.value, true, {
                                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                                        lineNumber: 206,
                                                        columnNumber: 21
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 198,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                        lineNumber: 196,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/CardDBModal.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            selectedCard && previewCard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-5 flex flex-col gap-5 rounded-xl border border-slate-700/60 bg-slate-950/40 p-4 sm:flex-row sm:items-start",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
                                                children: "Preview"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 233,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "origin-top-left scale-[0.72] sm:scale-75",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    card: previewCard,
                                                    index: 0,
                                                    location: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].DRAW,
                                                    size: "small",
                                                    interactive: false
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/CardDBModal.tsx",
                                                    lineNumber: 235,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 234,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                        lineNumber: 232,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0 flex-1 space-y-4",
                                        children: [
                                            variant === 'add' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
                                                        children: "Destination"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                                        lineNumber: 248,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        role: "radiogroup",
                                                        "aria-label": "Pile to add card to",
                                                        className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
                                                        children: LOCATIONS.map((loc)=>{
                                                            const checked = selectedLocation === loc.id;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: `relative flex cursor-pointer flex-col rounded-xl border-2 p-3 transition ${checked ? `${loc.activeClass} ${loc.ringClass} ring-2` : 'border-slate-700/80 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'}`,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "radio",
                                                                        name: "card-db-location",
                                                                        value: loc.id,
                                                                        checked: checked,
                                                                        onChange: ()=>setSelectedLocation(loc.id),
                                                                        className: "sr-only"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                                                        lineNumber: 263,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${checked ? `border-white/50 ${loc.dotClass} shadow-[0_0_8px_rgba(255,255,255,0.12)]` : 'border-slate-600 bg-slate-900'}`,
                                                                                children: checked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "h-1.5 w-1.5 rounded-full bg-white"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/components/CardDBModal.tsx",
                                                                                    lineNumber: 280,
                                                                                    columnNumber: 33
                                                                                }, this) : null
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                                                lineNumber: 272,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-sm font-semibold text-slate-100",
                                                                                children: loc.label
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                                                lineNumber: 283,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                                                        lineNumber: 271,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    loc.sub ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "mt-0.5 pl-6 text-[10px] uppercase tracking-wide text-slate-500",
                                                                        children: loc.sub
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                                                        lineNumber: 286,
                                                                        columnNumber: 29
                                                                    }, this) : null
                                                                ]
                                                            }, loc.id, true, {
                                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                                lineNumber: 255,
                                                                columnNumber: 25
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                                        lineNumber: 251,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 247,
                                                columnNumber: 17
                                            }, this) : null,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap items-center gap-6 border-t border-slate-800/80 pt-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        role: "radiogroup",
                                                        "aria-label": "Card upgrade",
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] font-semibold uppercase tracking-wider text-slate-500",
                                                                children: "Version"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                                lineNumber: 299,
                                                                columnNumber: 21
                                                            }, this),
                                                            [
                                                                {
                                                                    value: false,
                                                                    label: 'Base'
                                                                },
                                                                {
                                                                    value: true,
                                                                    label: 'Upgraded'
                                                                }
                                                            ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: `flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${isUpgraded === opt.value ? 'border-violet-500/70 bg-violet-950/50 text-violet-100' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`,
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "radio",
                                                                            name: "card-db-upgrade",
                                                                            checked: isUpgraded === opt.value,
                                                                            onChange: ()=>setIsUpgraded(opt.value),
                                                                            className: "sr-only"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/CardDBModal.tsx",
                                                                            lineNumber: 312,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: `flex h-3.5 w-3.5 items-center justify-center rounded-full border ${isUpgraded === opt.value ? 'border-violet-400 bg-violet-500' : 'border-slate-500 bg-slate-900'}`,
                                                                            children: isUpgraded === opt.value ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "h-1 w-1 rounded-full bg-white"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                                                lineNumber: 327,
                                                                                columnNumber: 29
                                                                            }, this) : null
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/CardDBModal.tsx",
                                                                            lineNumber: 319,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        opt.label
                                                                    ]
                                                                }, String(opt.value), true, {
                                                                    fileName: "[project]/app/components/CardDBModal.tsx",
                                                                    lineNumber: 304,
                                                                    columnNumber: 23
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                                        lineNumber: 298,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleConfirm,
                                                        className: "ml-auto rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-500",
                                                        children: variant === 'transform' ? 'Transform' : 'Add to pile'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/CardDBModal.tsx",
                                                lineNumber: 297,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CardDBModal.tsx",
                                        lineNumber: 245,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/CardDBModal.tsx",
                                lineNumber: 231,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CardDBModal.tsx",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
                            children: cardEntries.map(([cardId, raw])=>{
                                const cardData = raw;
                                const picked = selectedCard === cardId;
                                const desc = String(cardData.description ?? '');
                                const snippet = desc.slice(0, 72);
                                const ellipsize = desc.length > 72;
                                const cost = cardData.cost;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setSelectedCard(cardId),
                                    className: `rounded-xl border-2 p-3 text-left transition ${picked ? 'border-cyan-500 bg-cyan-950/25 shadow-md shadow-cyan-950/20' : 'border-slate-700/80 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-1.5 font-medium leading-tight text-white",
                                            children: cardId
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CardDBModal.tsx",
                                            lineNumber: 369,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `mb-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeBadgeClass(cardData.type)}`,
                                            children: cardData.type ?? '—'
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CardDBModal.tsx",
                                            lineNumber: 370,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] leading-snug text-slate-400",
                                            children: [
                                                snippet,
                                                ellipsize ? '…' : ''
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/CardDBModal.tsx",
                                            lineNumber: 375,
                                            columnNumber: 19
                                        }, this),
                                        cost != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 text-[11px] font-mono tabular-nums text-amber-200/90",
                                            children: [
                                                "Cost",
                                                ' ',
                                                typeof cost === 'object' && cost !== null && 'base' in cost ? String(cost.base) : String(cost)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/CardDBModal.tsx",
                                            lineNumber: 380,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, cardId, true, {
                                    fileName: "[project]/app/components/CardDBModal.tsx",
                                    lineNumber: 359,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/components/CardDBModal.tsx",
                            lineNumber: 350,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/CardDBModal.tsx",
                        lineNumber: 349,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/CardDBModal.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/CardDBModal.tsx",
        lineNumber: 148,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/app/components/UI/cardIconLegend.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCardEffectLegendItems",
    ()=>getCardEffectLegendItems
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/effectDisplay.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-ssr] (ecmascript)");
;
;
const STAT_KEYS = [
    "damage",
    "block",
    "draw",
    "energygain",
    "heal",
    "focus",
    "weak",
    "vulnerable",
    "poison",
    "hpcost"
];
/** Short labels shown in the top-bar legend (catalog `shortLabel` is often terse). */ const LEGEND_LABEL_OVERRIDES = {
    COST_MANIP: "Cost manipulation",
    UPGRADE_CARD: "Upgrade cards"
};
/** Stable STS catalog keys; skips DRAW_ICON (same meaning as stat “Draw”). */ const STS_LEGEND_KEYS = [
    "LIGHTNING_ORB",
    "FROST_ORB",
    "DARK_ORB",
    "PLASMA_ORB",
    "KEY_INNATE",
    "KEY_ETHEREAL",
    "KEY_RETAIN",
    "DISCARD_ICON",
    "EVOKE_ICON",
    "CONDITIONAL_MARKER",
    "AOE_ICON",
    "AOE_DAMAGE",
    "RANDOM_ICON",
    "EXHAUST_SELF",
    "ANY_ORB",
    "SAME_ORB_AS_EVOKED",
    "COST_MANIP",
    "UPGRADE_CARD",
    "ADD_CARD",
    "SCRY_ICON",
    "LOSE_STRENGTH"
];
function getCardEffectLegendItems() {
    const fromStats = STAT_KEYS.map((k)=>{
        const d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])(k);
        return {
            id: `stat-${k}`,
            Icon: d.icon,
            iconClass: d.color,
            label: k === "hpcost" ? "HP cost" : d.fullLabel
        };
    });
    const fromSts = STS_LEGEND_KEYS.map((key)=>{
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STS_ICON_GLYPH"][key];
        return {
            id: key,
            Icon: meta.Icon,
            iconClass: meta.iconClass,
            label: LEGEND_LABEL_OVERRIDES[key] ?? meta.shortLabel
        };
    });
    return [
        ...fromStats,
        ...fromSts
    ];
}
}),
"[project]/app/components/UI/TopBarBlock.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TopBarBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/effectDisplay.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/gameHelpers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/GameContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$LegendHighlightContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/LegendHighlightContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CardDBModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/CardDBModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardIconLegend$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/cardIconLegend.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.mjs [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.mjs [app-ssr] (ecmascript) <export default as ChevronUp>");
"use client";
;
;
;
;
;
;
;
;
;
const CARD_EFFECT_LEGEND = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardIconLegend$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCardEffectLegendItems"])();
function clampPct(n) {
    return Math.max(0, Math.min(100, n));
}
function TopBarLegendChip({ item, hoverSync, highlighted, showAllLabels, size }) {
    const pinLabel = hoverSync && highlighted;
    const labelForced = pinLabel || showAllLabels;
    const iconSize = size === "desktop" ? "h-3.5 w-3.5" : "h-3 w-3";
    const idleBorder = size === "mobile" ? "border-slate-600/50" : "border-slate-600/45";
    const labelTextCls = size === "desktop" ? "truncate text-[9px] font-medium leading-none text-slate-200/95" : "truncate text-[8px] font-medium text-slate-200";
    const labelRevealCls = size === "desktop" ? labelForced ? "max-w-[10rem] opacity-100" : "max-w-0 opacity-0 overflow-hidden group-hover/chip:max-w-[10rem] group-hover/chip:opacity-100" : labelForced ? "max-w-[5.5rem] opacity-100" : "max-w-0 opacity-0 overflow-hidden group-hover/chip:max-w-[5.5rem] group-hover/chip:opacity-100";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        title: item.label,
        "aria-label": item.label,
        className: `group/chip inline-flex items-center rounded-md border shadow-sm shadow-black/20 transition-[opacity,box-shadow,border-color,background-color,gap,padding,max-width] ${labelForced ? "gap-1 px-1.5 py-0.5" : "justify-center p-1 group-hover/chip:gap-1 group-hover/chip:px-1.5 group-hover/chip:py-0.5"} ${!hoverSync ? `${idleBorder} bg-slate-900/55 group-hover/chip:bg-slate-900/70` : highlighted ? "border-cyan-400/55 bg-cyan-950/45 ring-1 ring-cyan-400/35 shadow-[0_0_12px_rgba(34,211,238,0.14)]" : "border-slate-700/35 bg-slate-950/35 opacity-45 group-hover/chip:opacity-90"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.Icon, {
                className: `${iconSize} shrink-0 ${item.iconClass}`,
                strokeWidth: 2.25,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `${labelTextCls} transition-[max-width,opacity] duration-200 ${labelRevealCls}`,
                children: item.label
            }, void 0, false, {
                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
function TopBarBlock() {
    const { gameState, addCardFromDB, loadGameDataFromJson, isLoading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameManager"])();
    const { hoveredCard, highlightIds } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$LegendHighlightContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLegendHighlight"])();
    const sortedLegend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!hoveredCard) return CARD_EFFECT_LEGEND;
        const hi = [];
        const lo = [];
        for (const item of CARD_EFFECT_LEGEND){
            (highlightIds.has(item.id) ? hi : lo).push(item);
        }
        return [
            ...hi,
            ...lo
        ];
    }, [
        hoveredCard,
        highlightIds
    ]);
    const [legendShowAllLabels, setLegendShowAllLabels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fileError, setFileError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mobileVitalsOpen, setMobileVitalsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const playerHp = gameState?.player.hp ?? 0;
    const playerMaxHp = gameState?.player.maxHp ?? 0;
    const baseEnergy = gameState?.player.energy.base ?? 0;
    const energyMax = gameState?.player ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPlayerMaxEnergy"])(gameState.player) : 0;
    const currentEnergy = gameState?.player.currentEnergy ?? 0;
    /** Pip rows when over max (e.g. 4/3), still at most 9 pips */ const energyPipSlots = energyMax > 0 ? Math.min(9, Math.max(energyMax, currentEnergy)) : 0;
    const currentBlock = gameState?.player.currentBlock ?? 0;
    const hpPct = playerMaxHp > 0 ? clampPct(playerHp / playerMaxHp * 100) : 0;
    const lowHp = playerMaxHp > 0 && (playerHp === 0 || playerHp > 0 && hpPct < 30);
    const energyPct = energyMax > 0 ? clampPct(currentEnergy / energyMax * 100) : 0;
    const showEnergyPips = energyMax > 0 && energyMax <= 9;
    const hpEffect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("health", playerHp);
    const energyEffect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("energy", baseEnergy);
    const blockEffect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block", currentBlock);
    const HpIcon = hpEffect.icon;
    const EnergyIcon = energyEffect.icon;
    const BlockIcon = blockEffect.icon;
    const loadError = fileError ?? error;
    const handleJsonFile = async (e)=>{
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setFileError(null);
        try {
            const text = await file.text();
            const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["importGameData"])(text);
            await loadGameDataFromJson(data);
        } catch (err) {
            setFileError(err instanceof Error ? err.message : "Could not read combat JSON");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-b border-slate-800/90 bg-gradient-to-b from-slate-900/98 via-slate-950 to-slate-950/95 text-slate-200 shadow-md shadow-slate-950/40 max-md:border-b-2 max-md:border-cyan-500/35 max-md:bg-gradient-to-b max-md:from-cyan-950/45 max-md:via-slate-900 max-md:to-slate-950 max-md:shadow-md max-md:shadow-cyan-900/20 md:px-3 md:py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: fileInputRef,
                type: "file",
                accept: "application/json,.json",
                className: "fixed left-0 top-0 m-0 h-px w-px overflow-hidden border-0 p-0 opacity-0",
                onChange: handleJsonFile,
                tabIndex: -1,
                "aria-label": "Load combat JSON file"
            }, void 0, false, {
                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:block",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex max-w-[1600px] flex-col items-stretch gap-3 px-0 py-0 lg:flex-row lg:items-center lg:gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `min-w-0 flex-1 rounded-2xl border bg-slate-950/60 p-2 shadow-inner shadow-black/20 ring-1 ring-inset sm:p-2.5 ${lowHp ? "border-rose-500/45 ring-rose-500/20" : "border-slate-700/80 ring-slate-500/5"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mb-1.5 flex items-center gap-1.5 px-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                            className: "h-3 w-3 text-slate-500",
                                            strokeWidth: 2.5,
                                            "aria-hidden": true
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 165,
                                            columnNumber: 13
                                        }, this),
                                        "Player"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 164,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 gap-2 min-[400px]:grid-cols-3 sm:gap-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex flex-col rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 ${lowHp ? "border-rose-500/50 bg-rose-950/35 shadow-md shadow-rose-950/20" : "border-rose-500/20 bg-rose-950/25"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-1.5 flex items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex min-w-0 items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-950/50 shadow-sm ${lowHp ? "ring-1 ring-rose-400/30" : ""}`,
                                                                    "aria-hidden": true,
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HpIcon, {
                                                                        className: `${hpEffect.color} h-4 w-4`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                        lineNumber: 185,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 179,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[9px] font-bold uppercase leading-none tracking-wider text-rose-200/80",
                                                                            children: "Health"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                            lineNumber: 188,
                                                                            columnNumber: 21
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[9px] text-rose-100/50",
                                                                            children: "Pool"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                            lineNumber: 189,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 187,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 178,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "shrink-0 text-right",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xl font-bold tabular-nums leading-none text-rose-50 sm:text-2xl",
                                                                    children: playerHp
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 193,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-medium tabular-nums text-rose-200/50",
                                                                    children: [
                                                                        "/",
                                                                        playerMaxHp || "—"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 194,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 192,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 177,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-2.5 w-full overflow-hidden rounded-full border border-rose-900/50 bg-rose-950/80",
                                                    role: "progressbar",
                                                    "aria-valuenow": Math.round(hpPct),
                                                    "aria-valuemin": 0,
                                                    "aria-valuemax": 100,
                                                    "aria-label": `Health ${Math.round(hpPct)} percent`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `h-full rounded-full bg-gradient-to-r from-rose-800 to-rose-500 transition-[width] duration-500 ${lowHp ? "shadow-[0_0_12px_rgba(244,63,94,0.45)]" : ""}`,
                                                        style: {
                                                            width: `${hpPct}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 205,
                                                        columnNumber: 17
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 197,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 170,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col rounded-xl border border-amber-500/25 bg-amber-950/30 px-2.5 py-2 sm:px-3 sm:py-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-1.5 flex items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex min-w-0 items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-950/50 shadow-sm",
                                                                    "aria-hidden": true,
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EnergyIcon, {
                                                                        className: `${energyEffect.color} h-4 w-4`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                        lineNumber: 222,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 218,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[9px] font-bold uppercase leading-none tracking-wider text-amber-200/90",
                                                                            children: "Energy"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                            lineNumber: 225,
                                                                            columnNumber: 21
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[9px] text-amber-100/45",
                                                                            children: "This turn"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                            lineNumber: 226,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 224,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 217,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "shrink-0 text-right",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xl font-bold tabular-nums leading-none text-amber-50 sm:text-2xl",
                                                                    children: currentEnergy
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 230,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-medium tabular-nums text-amber-200/50",
                                                                    children: [
                                                                        "/",
                                                                        energyMax || "—"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 233,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 229,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 15
                                                }, this),
                                                energyMax > 0 ? showEnergyPips ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center justify-center gap-1",
                                                    "aria-label": `Energy pips ${currentEnergy} of ${energyMax}`,
                                                    children: Array.from({
                                                        length: energyPipSlots
                                                    }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `h-2.5 w-2.5 rounded-sm border-2 ${i < currentEnergy ? "border-amber-300 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "border-amber-700/50 bg-amber-950/60"}`
                                                        }, i, false, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 240,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 238,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-2.5 w-full overflow-hidden rounded-full border border-amber-900/50 bg-amber-950/80",
                                                    role: "progressbar",
                                                    "aria-valuenow": Math.round(energyPct),
                                                    "aria-valuemin": 0,
                                                    "aria-valuemax": 100,
                                                    "aria-label": `Energy ${Math.round(energyPct)} percent`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full rounded-full bg-gradient-to-r from-amber-800 to-amber-400 transition-[width] duration-300",
                                                        style: {
                                                            width: `${energyPct}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 259,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 251,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-center text-[10px] text-amber-200/40",
                                                    children: "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 266,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 215,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex flex-col rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 ${currentBlock > 0 ? "border-sky-400/45 bg-sky-950/40 shadow-md shadow-sky-950/30" : "border-slate-600/50 bg-slate-900/40"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-1.5 flex items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex min-w-0 items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm ${currentBlock > 0 ? "border-sky-500/40 bg-sky-950/55" : "border-slate-600/60 bg-slate-800/50"}`,
                                                                    "aria-hidden": true,
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockIcon, {
                                                                        className: `${blockEffect.color} h-4 w-4`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                        lineNumber: 288,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 280,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: `text-[9px] font-bold uppercase leading-none tracking-wider ${currentBlock > 0 ? "text-sky-200/90" : "text-slate-500"}`,
                                                                            children: "Block"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                            lineNumber: 291,
                                                                            columnNumber: 21
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[9px] text-slate-500",
                                                                            children: "Defense"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                            lineNumber: 298,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 290,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 279,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: `shrink-0 text-2xl font-bold tabular-nums leading-none sm:text-3xl ${currentBlock > 0 ? "text-sky-100" : "text-slate-500"}`,
                                                            children: currentBlock
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 301,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 278,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `h-1.5 w-full overflow-hidden rounded-full border ${currentBlock > 0 ? "border-sky-800/50 bg-sky-950/80" : "border-slate-700/40 bg-slate-900/50"}`,
                                                    "aria-hidden": true,
                                                    children: currentBlock > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full w-full min-w-[20%] rounded-full bg-gradient-to-r from-sky-700 to-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.35)]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 19
                                                    }, this) : null
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 271,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 168,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                            lineNumber: 157,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex w-full min-w-0 flex-1 flex-col gap-2 lg:max-w-none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex min-w-0 flex-col items-stretch gap-2 min-[1000px]:flex-row min-[1000px]:items-stretch min-[1000px]:gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 flex-1 rounded-2xl border border-cyan-500/30 bg-cyan-950/25 p-2.5 ring-1 ring-cyan-500/10 sm:p-3",
                                            role: "region",
                                            "aria-label": "Card effect icons legend",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-2 flex items-center justify-between gap-2 px-0.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "flex min-w-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/85",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                    className: "h-3 w-3 shrink-0 text-cyan-400/90",
                                                                    strokeWidth: 2.5,
                                                                    "aria-hidden": true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 337,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "truncate",
                                                                    children: "Symbols legend"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 338,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 336,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>setLegendShowAllLabels((v)=>!v),
                                                            "aria-pressed": legendShowAllLabels,
                                                            "aria-label": legendShowAllLabels ? "Collapse legend to icons only" : "Expand all legend names",
                                                            className: "shrink-0 rounded-md border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-100/95 shadow-sm transition hover:border-cyan-400/55 hover:bg-cyan-900/50",
                                                            children: legendShowAllLabels ? "Icons only" : "Show all"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 340,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 335,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex min-h-[4rem] max-h-[9rem] flex-wrap content-start gap-1.5 overflow-y-auto pr-0.5 [scrollbar-width:thin] sm:max-h-[10rem] md:max-h-[11rem]",
                                                    children: sortedLegend.map((item)=>{
                                                        const hoverSync = hoveredCard != null;
                                                        const highlighted = highlightIds.has(item.id);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TopBarLegendChip, {
                                                            item: item,
                                                            hoverSync: hoverSync,
                                                            highlighted: highlighted,
                                                            showAllLabels: legendShowAllLabels,
                                                            size: "desktop"
                                                        }, item.id, false, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 355,
                                                            columnNumber: 21
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 350,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 330,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 min-[1000px]:flex-col min-[1000px]:items-stretch min-[1000px]:justify-center min-[1000px]:self-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    disabled: isLoading,
                                                    onClick: ()=>fileInputRef.current?.click(),
                                                    className: "rounded-xl border border-sky-500/45 bg-sky-800/80 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-950/30 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
                                                    title: "Load combat from a JSON file (replaces current combat)",
                                                    children: isLoading ? "Loading…" : "Load data"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 368,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setIsModalOpen(true),
                                                    disabled: !gameState,
                                                    className: "rounded-xl border border-emerald-500/50 bg-emerald-700/85 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-950/40 transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40",
                                                    children: "Add Card"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 377,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 367,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 329,
                                    columnNumber: 11
                                }, this),
                                loadError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "w-full text-right text-[10px] text-red-400",
                                    title: loadError,
                                    children: loadError
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 388,
                                    columnNumber: 13
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                            lineNumber: 328,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-2xl space-y-2 px-2 py-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-slate-900/90 shadow-md shadow-cyan-950/30",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between border-b border-cyan-800/30 bg-cyan-950/40 px-2.5 py-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/90",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                    className: "h-3.5 w-3.5",
                                                    strokeWidth: 2.5,
                                                    "aria-hidden": true
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 402,
                                                    columnNumber: 17
                                                }, this),
                                                "Player"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 401,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setMobileVitalsOpen((o)=>!o),
                                            className: "inline-flex h-8 items-center gap-1 rounded-lg border border-cyan-600/50 bg-cyan-950/60 px-2.5 text-[10px] font-semibold text-cyan-200/90",
                                            "aria-expanded": mobileVitalsOpen,
                                            "aria-label": mobileVitalsOpen ? "Hide stat details" : "Show full stat details",
                                            children: mobileVitalsOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Less"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 414,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                        className: "h-3.5 w-3.5",
                                                        strokeWidth: 2.5
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 415,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Details"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 419,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                        className: "h-3.5 w-3.5",
                                                        strokeWidth: 2.5
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 420,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 405,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 400,
                                    columnNumber: 13
                                }, this),
                                !mobileVitalsOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-3 gap-1.5 p-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `rounded-xl border px-1.5 py-1.5 ${lowHp ? "border-rose-500/45 bg-rose-950/40" : "border-rose-500/25 bg-rose-950/20"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[8px] font-bold uppercase text-rose-300/90",
                                                    children: "HP"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 433,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-center text-sm font-bold tabular-nums text-rose-50",
                                                    children: [
                                                        playerHp,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] font-medium text-rose-300/50",
                                                            children: [
                                                                "/",
                                                                playerMaxHp || "—"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 436,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 434,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-0.5 h-1 w-full overflow-hidden rounded-full bg-rose-950/80",
                                                    role: "progressbar",
                                                    "aria-label": `Health ${Math.round(hpPct)}%`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-500",
                                                        style: {
                                                            width: `${hpPct}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 443,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 438,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 428,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-xl border border-amber-500/30 bg-amber-950/25 px-1.5 py-1.5 text-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[8px] font-bold uppercase text-amber-200/80",
                                                    children: "NRG"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-bold tabular-nums text-amber-50",
                                                    children: [
                                                        currentEnergy,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-amber-200/50",
                                                            children: [
                                                                "/",
                                                                energyMax || "—"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 453,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 451,
                                                    columnNumber: 19
                                                }, this),
                                                showEnergyPips && energyMax > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-0.5 flex flex-wrap justify-center gap-0.5",
                                                    children: Array.from({
                                                        length: Math.min(5, energyPipSlots)
                                                    }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `h-1.5 w-1.5 rounded-sm border ${i < currentEnergy ? "border-amber-300 bg-amber-400" : "border-amber-800/50 bg-amber-950/60"}`
                                                        }, i, false, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 458,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 456,
                                                    columnNumber: 21
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 449,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `rounded-xl border px-1.5 py-1.5 text-center ${currentBlock > 0 ? "border-sky-400/45 bg-sky-950/35" : "border-slate-600/50 bg-slate-900/50"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `text-[8px] font-bold uppercase ${currentBlock > 0 ? "text-sky-200/90" : "text-slate-500"}`,
                                                    children: "Blk"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 475,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `text-lg font-bold tabular-nums ${currentBlock > 0 ? "text-sky-100" : "text-slate-500"}`,
                                                    children: currentBlock
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 482,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 470,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 427,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-h-[70vh] space-y-2 overflow-y-auto p-2 [scrollbar-width:thin]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `rounded-xl border p-2.5 ${lowHp ? "border-rose-500/50 bg-rose-950/35" : "border-rose-500/20 bg-rose-950/25"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-1.5 flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-950/50 ${lowHp ? "ring-1 ring-rose-400/30" : ""}`,
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HpIcon, {
                                                                        className: `${hpEffect.color} h-3.5 w-3.5`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                        lineNumber: 507,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 502,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[9px] font-bold uppercase text-rose-200/80",
                                                                    children: "Health"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 509,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 501,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-right text-sm font-bold tabular-nums text-rose-50",
                                                            children: [
                                                                playerHp,
                                                                "/",
                                                                playerMaxHp || "—"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 511,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 500,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-2.5 w-full overflow-hidden rounded-full border border-rose-900/50 bg-rose-950/80",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full rounded-full bg-gradient-to-r from-rose-800 to-rose-500",
                                                        style: {
                                                            width: `${hpPct}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 516,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 493,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-xl border border-amber-500/25 bg-amber-950/30 p-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-1 flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-950/50",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EnergyIcon, {
                                                                        className: `${energyEffect.color} h-3.5 w-3.5`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                        lineNumber: 523,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 522,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[9px] font-bold uppercase text-amber-200/90",
                                                                    children: "Energy"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 525,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 521,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-right text-sm font-bold tabular-nums text-amber-50",
                                                            children: [
                                                                currentEnergy,
                                                                "/",
                                                                energyMax || "—"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 527,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 520,
                                                    columnNumber: 19
                                                }, this),
                                                energyMax > 0 && showEnergyPips ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap justify-center gap-1",
                                                    children: Array.from({
                                                        length: energyPipSlots
                                                    }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `h-2 w-2 rounded-sm border-2 ${i < currentEnergy ? "border-amber-300 bg-amber-400" : "border-amber-700/50 bg-amber-950/60"}`
                                                        }, i, false, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 534,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 532,
                                                    columnNumber: 21
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 519,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `rounded-xl border p-2.5 ${currentBlock > 0 ? "border-sky-400/45 bg-sky-950/40" : "border-slate-600/50 bg-slate-900/40"}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `flex h-7 w-7 items-center justify-center rounded-lg border ${currentBlock > 0 ? "border-sky-500/40 bg-sky-950/55" : "border-slate-600/60 bg-slate-800/50"}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockIcon, {
                                                                    className: `${blockEffect.color} h-3.5 w-3.5`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                    lineNumber: 562,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                lineNumber: 555,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[9px] font-bold uppercase text-slate-400",
                                                                children: "Block"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                                lineNumber: 564,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 554,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-xl font-bold tabular-nums ${currentBlock > 0 ? "text-sky-100" : "text-slate-500"}`,
                                                        children: currentBlock
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                        lineNumber: 566,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                lineNumber: 553,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 546,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 492,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                            lineNumber: 399,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-2.5 ring-1 ring-cyan-500/15",
                                    role: "region",
                                    "aria-label": "Card effect icons legend",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-1.5 flex items-center justify-between gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-cyan-200/90",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                            className: "h-3 w-3 shrink-0 text-cyan-400/90",
                                                            strokeWidth: 2.5,
                                                            "aria-hidden": true
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 587,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "truncate",
                                                            children: "Symbols"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                            lineNumber: 588,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 586,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setLegendShowAllLabels((v)=>!v),
                                                    "aria-pressed": legendShowAllLabels,
                                                    "aria-label": legendShowAllLabels ? "Collapse legend to icons only" : "Expand all legend names",
                                                    className: "shrink-0 rounded-md border border-cyan-500/40 bg-cyan-950/55 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-cyan-100/95",
                                                    children: legendShowAllLabels ? "Icons" : "All"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 590,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 585,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex max-h-40 flex-wrap gap-1 overflow-y-auto [scrollbar-width:thin]",
                                            children: sortedLegend.map((item)=>{
                                                const hoverSync = hoveredCard != null;
                                                const highlighted = highlightIds.has(item.id);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TopBarLegendChip, {
                                                    item: item,
                                                    hoverSync: hoverSync,
                                                    highlighted: highlighted,
                                                    showAllLabels: legendShowAllLabels,
                                                    size: "mobile"
                                                }, item.id, false, {
                                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                                    lineNumber: 605,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 600,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 580,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-stretch gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: isLoading,
                                            onClick: ()=>fileInputRef.current?.click(),
                                            className: "min-w-0 flex-1 rounded-lg border border-sky-500/50 bg-sky-800/90 px-2 py-2.5 text-[11px] font-semibold text-white active:scale-[0.99] disabled:opacity-50",
                                            children: isLoading ? "…" : "Load data"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 618,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setIsModalOpen(true),
                                            disabled: !gameState,
                                            className: "min-w-0 flex-1 rounded-lg border border-emerald-500/50 bg-emerald-700/90 px-2 py-2.5 text-[11px] font-semibold text-white active:scale-[0.99] disabled:opacity-40",
                                            children: "Add card"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                            lineNumber: 626,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                                    lineNumber: 617,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                            lineNumber: 579,
                            columnNumber: 11
                        }, this),
                        loadError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-center text-[10px] text-red-400",
                            title: loadError,
                            children: loadError
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                            lineNumber: 638,
                            columnNumber: 13
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                    lineNumber: 398,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                lineNumber: 397,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CardDBModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isModalOpen,
                onClose: ()=>setIsModalOpen(false),
                onAddCard: addCardFromDB
            }, void 0, false, {
                fileName: "[project]/app/components/UI/TopBarBlock.tsx",
                lineNumber: 645,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/TopBarBlock.tsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/utils/intentFormat.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyIncomingEnemyAttackDamage",
    ()=>applyIncomingEnemyAttackDamage,
    "buildIncomingDamageContext",
    ()=>buildIncomingDamageContext,
    "describeIncomingModifiers",
    ()=>describeIncomingModifiers,
    "enemyHasWeakForIncoming",
    ()=>enemyHasWeakForIncoming,
    "formatIntentActionParts",
    ()=>formatIntentActionParts,
    "formatIntentActionsLine",
    ()=>formatIntentActionsLine,
    "formatIntentActionsLineIncoming",
    ()=>formatIntentActionsLineIncoming,
    "isEnemyActiveForIntents",
    ()=>isEnemyActiveForIntents,
    "playerHasVulnerableForIncoming",
    ()=>playerHasVulnerableForIncoming,
    "sumAttackDamageFromActions",
    ()=>sumAttackDamageFromActions,
    "sumIncomingAttackDamageFromActions",
    ()=>sumIncomingAttackDamageFromActions
]);
/** STS-style: Vulnerable on you → +50% damage taken from enemy hits. */ const INCOMING_VULNERABLE_MULT = 1.5;
/** Weak on the attacker → 25% less damage dealt. */ const INCOMING_ATTACKER_WEAK_MULT = 0.75;
function playerHasVulnerableForIncoming(player) {
    if (!player?.buffsDebuffs?.length) return false;
    return player.buffsDebuffs.some((b)=>b.type === "debuff" && /vulnerable/i.test(b.name.trim()));
}
function enemyHasWeakForIncoming(enemy) {
    if (!enemy.buffsDebuffs?.length) return false;
    return enemy.buffsDebuffs.some((b)=>b.type === "debuff" && /^(weak|weakened)$/i.test(b.name.trim()));
}
function buildIncomingDamageContext(player, enemy) {
    return {
        playerVulnerable: playerHasVulnerableForIncoming(player),
        enemyWeak: enemyHasWeakForIncoming(enemy),
        playerIntangible: player?.intangible ?? false
    };
}
function isEnemyActiveForIntents(enemy) {
    return enemy.hp > 0;
}
function applyIncomingEnemyAttackDamage(baseDamage, ctx) {
    let d = baseDamage;
    if (ctx.enemyWeak) d *= INCOMING_ATTACKER_WEAK_MULT;
    if (ctx.playerVulnerable) d *= INCOMING_VULNERABLE_MULT;
    if (ctx.playerIntangible) d = Math.min(d, 1);
    return Math.floor(d);
}
function describeIncomingModifiers(ctx) {
    const bits = [];
    if (ctx.playerVulnerable) bits.push("You: Vulnerable (+50% damage taken)");
    if (ctx.enemyWeak) bits.push("Attacker: Weak (−25% damage dealt)");
    if (ctx.playerIntangible) bits.push("You: Intangible (all damage is reduced to 1)");
    return bits.join(" · ");
}
function formatIntentActionParts(actions) {
    const parts = [];
    for (const action of actions ?? []){
        if (action.type === "attack") {
            parts.push(`⚔️ ${action.value}`);
        }
        if (action.type === "debuff" || action.type === "status") {
            parts.push(`❗ ${action.effect}${action.value ? ` ${action.value}` : ""}`);
        }
        if (action.type === "buff") {
            parts.push(`📈 ${action.effect}${action.value ? ` ${action.value}` : ""}`);
        }
    }
    return parts;
}
function formatIntentActionsLine(actions) {
    return formatIntentActionParts(actions).join(" · ");
}
function formatIntentActionsLineIncoming(actions, ctx) {
    const parts = [];
    for (const action of actions ?? []){
        if (action.type === "attack") {
            const base = action.value ?? 0;
            const mod = applyIncomingEnemyAttackDamage(base, ctx);
            parts.push(mod !== base ? `⚔️ ${mod} (${base})` : `⚔️ ${base}`);
        }
        if (action.type === "debuff" || action.type === "status") {
            parts.push(`❗ ${action.effect}${action.value ? ` ${action.value}` : ""}`);
        }
        if (action.type === "buff") {
            parts.push(`📈 ${action.effect}${action.value ? ` ${action.value}` : ""}`);
        }
    }
    return parts.join(" · ");
}
function sumAttackDamageFromActions(actions) {
    let damage = 0;
    for (const action of actions ?? []){
        if (action.type === "attack") {
            damage += action.value ?? 0;
        }
    }
    return damage;
}
function sumIncomingAttackDamageFromActions(actions, ctx) {
    let damage = 0;
    for (const action of actions ?? []){
        if (action.type === "attack") {
            damage += applyIncomingEnemyAttackDamage(action.value ?? 0, ctx);
        }
    }
    return damage;
}
}),
"[project]/app/components/UI/TimelineBlock.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TimelineBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/GameContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/intentFormat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.mjs [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarClock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-clock.mjs [app-ssr] (ecmascript) <export default as CalendarClock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.mjs [app-ssr] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-forward.mjs [app-ssr] (ecmascript) <export default as SkipForward>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.mjs [app-ssr] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skull.mjs [app-ssr] (ecmascript) <export default as Skull>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/toast.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const TIMELINE_ZONE = "animate-sts-panel-in rounded-2xl border-2 border-cyan-500/25 bg-linear-to-b from-cyan-950/35 via-slate-950 to-slate-950 p-3 shadow-[inset_0_1px_0_0_rgba(34,211,238,0.06)] shadow-lg shadow-cyan-950/25 ring-1 ring-cyan-400/10 transition-all duration-300";
const ACTIONS_ZONE = "animate-sts-panel-in rounded-2xl border-2 border-slate-600/40 bg-linear-to-b from-slate-900/90 via-slate-950 to-slate-950 p-3 shadow-lg shadow-slate-950/40 ring-1 ring-slate-500/10";
const actionTone = {
    cyan: "border-cyan-500/45 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-100 shadow-sm shadow-cyan-950/20",
    amber: "border-amber-500/45 bg-amber-950/40 hover:bg-amber-900/45 text-amber-100 shadow-sm shadow-amber-950/20",
    rose: "border-rose-500/45 bg-rose-950/40 hover:bg-rose-900/45 text-rose-100 shadow-sm shadow-rose-950/20",
    slate: "border-slate-600 bg-slate-800/85 hover:bg-slate-800 text-slate-200"
};
function ActionBtn({ children, onClick, tone = "slate", icon: Icon, className = "", disabled = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        disabled: disabled,
        onClick: onClick,
        className: `flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98] hover:brightness-110 ${actionTone[tone]} ${disabled ? "pointer-events-none cursor-not-allowed opacity-45" : ""} ${className}`,
        children: [
            Icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: "h-3.5 w-3.5 shrink-0 opacity-90",
                strokeWidth: 2
            }, void 0, false, {
                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                lineNumber: 81,
                columnNumber: 15
            }, this) : null,
            children
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
const INTENT_PREVIEW_MAX = 4;
/** Combat snapshot for a given intent turn: frozen slot in the planner, except the active turn uses live gameState. */ function snapshotForIntentTurn(intentTurnId, turns, currentTurnIndex, liveState) {
    if (!liveState) return null;
    const liveTurnId = turns[currentTurnIndex]?.id;
    if (liveTurnId != null && intentTurnId === liveTurnId) {
        return liveState;
    }
    return turns.find((t)=>t.id === intentTurnId)?.state ?? liveState;
}
function TimelineBlock() {
    const { gameState, turns, currentTurnIndex, turnPhase, setCurrentTurn, beginTurn, endPlayerTurn, endEnemyTurn, continueFromTurn, resetCurrentTurn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameManager"])();
    const activeTurnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [expandedTurns, setExpandedTurns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const turnsData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        if (!gameState) return [];
        const turnIds = new Set();
        for (const t of turns){
            turnIds.add(t.id);
            for (const e of t.state?.enemies ?? []){
                for (const it of e.intents ?? [])turnIds.add(it.turn);
            }
        }
        for (const e of gameState.enemies ?? []){
            for (const it of e.intents ?? [])turnIds.add(it.turn);
        }
        for (const turn of turnIds){
            const snap = snapshotForIntentTurn(turn, turns, currentTurnIndex, gameState);
            if (!snap?.player) continue;
            for (const enemySnap of snap.enemies ?? []){
                for (const intent of enemySnap.intents ?? []){
                    if (intent.turn !== turn) continue;
                    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isEnemyActiveForIntents"])(enemySnap)) continue;
                    if (!map.has(turn)) {
                        map.set(turn, {
                            turn,
                            totalDamage: 0,
                            enemySummaries: []
                        });
                    }
                    const entry = map.get(turn);
                    const incomingCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildIncomingDamageContext"])(snap.player, enemySnap);
                    const line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatIntentActionsLineIncoming"])(intent.actions, incomingCtx);
                    const damage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sumIncomingAttackDamageFromActions"])(intent.actions, incomingCtx);
                    const modifierHint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["describeIncomingModifiers"])(incomingCtx);
                    entry.enemySummaries.push({
                        name: enemySnap.name,
                        line,
                        damage,
                        modifierHint
                    });
                    entry.totalDamage += damage;
                }
            }
        }
        return Array.from(map.values()).sort((a, b)=>a.turn - b.turn);
    }, [
        gameState,
        turns,
        currentTurnIndex
    ]);
    const summariesByTurn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>new Map(turnsData.map((s)=>[
                s.turn,
                s
            ])), [
        turnsData
    ]);
    const plannerRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>turns.map((t)=>({
                id: t.id,
                summary: summariesByTurn.get(t.id) ?? null
            })), [
        turns,
        summariesByTurn
    ]);
    const currentTurnId = turns[currentTurnIndex]?.id ?? plannerRows[0]?.id ?? 1;
    const selected = turnsData.find((t)=>t.turn === currentTurnId) ?? turnsData[0];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        activeTurnRef.current?.scrollIntoView({
            block: "nearest",
            behavior: "smooth"
        });
    }, [
        currentTurnId
    ]);
    const toggleTurnExpanded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((turnId)=>{
        setExpandedTurns((prev)=>({
                ...prev,
                [turnId]: !prev[turnId]
            }));
    }, []);
    const isExpanded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((turnId, lineCount)=>{
        if (lineCount <= INTENT_PREVIEW_MAX) return true;
        return expandedTurns[turnId] ?? false;
    }, [
        expandedTurns
    ]);
    const handleReset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (("TURBOPACK compile-time value", "undefined") !== "undefined" && !window.confirm("Reset this turn to the initial combat snapshot?")) //TURBOPACK unreachable
        ;
        resetCurrentTurn();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"])('Turn reset', 'warning');
    }, [
        resetCurrentTurn
    ]);
    if (!gameState) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-sm font-semibold tracking-tight text-slate-100",
                            children: "Turn timeline"
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                            lineNumber: 199,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-slate-500",
                            children: "Load combat data to plan turns."
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                            lineNumber: 200,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                    lineNumber: 198,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-1 items-center justify-center p-6 text-sm text-slate-500",
                    children: "Loading…"
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                    lineNumber: 202,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/UI/TimelineBlock.tsx",
            lineNumber: 197,
            columnNumber: 7
        }, this);
    }
    const player = gameState.player;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-slate-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarClock$3e$__["CalendarClock"], {
                                className: "h-4 w-4 shrink-0 text-cyan-400/90",
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 213,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "truncate text-sm font-semibold tracking-tight",
                                        children: "Turn timeline"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 215,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "truncate text-[11px] text-slate-500",
                                        children: [
                                            player.combatName,
                                            " · Fl ",
                                            player.floor,
                                            " · ",
                                            plannerRows.length,
                                            " turn",
                                            plannerRows.length === 1 ? "" : "s",
                                            " in planner"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 216,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 214,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 rounded-xl border-2 border-slate-600/50 bg-slate-950/80 p-1.5 shadow-inner shadow-black/20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-1.5 px-1 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-500",
                                children: "Phase track"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-3 gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-2 py-2 transition-colors ${turnPhase === "start" ? "border-amber-500/60 bg-amber-950/40 shadow-md shadow-amber-950/25" : "border-transparent bg-slate-900/40 opacity-60"}`,
                                        title: "Draw, Standby, start-of-turn relics & powers (YGO-style opening)",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                className: `h-4 w-4 ${turnPhase === "start" ? "text-amber-200" : "text-slate-500"}`,
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 235,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-center text-[9px] font-bold uppercase tracking-wide text-slate-200",
                                                children: "Start"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 239,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-center text-[8px] leading-tight text-slate-500",
                                                children: "Draw · ST"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 240,
                                                columnNumber: 15
                                            }, this),
                                            turnPhase === "start" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rounded bg-amber-500/25 px-1 py-px text-[8px] font-semibold text-amber-100",
                                                children: "Active"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 242,
                                                columnNumber: 17
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 227,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-2 py-2 transition-colors ${turnPhase === "player" ? "border-emerald-500/60 bg-emerald-950/45 shadow-md shadow-emerald-950/20" : "border-transparent bg-slate-900/40 opacity-60"}`,
                                        title: "Main phase — play cards, spend energy",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                className: `h-4 w-4 ${turnPhase === "player" ? "text-emerald-300" : "text-slate-500"}`,
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 255,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-center text-[9px] font-bold uppercase tracking-wide text-slate-200",
                                                children: "Main"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 259,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-center text-[8px] leading-tight text-slate-500",
                                                children: "Play cards"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 260,
                                                columnNumber: 15
                                            }, this),
                                            turnPhase === "player" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rounded bg-emerald-500/25 px-1 py-px text-[8px] font-semibold text-emerald-200",
                                                children: "Active"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 262,
                                                columnNumber: 17
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-2 py-2 transition-colors ${turnPhase === "enemy" ? "border-rose-500/55 bg-rose-950/40 shadow-md shadow-rose-950/25" : "border-transparent bg-slate-900/40 opacity-60"}`,
                                        title: "Enemy phase — resolve intents",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__["Skull"], {
                                                className: `h-4 w-4 ${turnPhase === "enemy" ? "text-rose-300" : "text-slate-500"}`,
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 275,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-center text-[9px] font-bold uppercase tracking-wide text-slate-200",
                                                children: "Enemy"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 279,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-center text-[8px] leading-tight text-slate-500",
                                                children: "Resolve"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 280,
                                                columnNumber: 15
                                            }, this),
                                            turnPhase === "enemy" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rounded bg-rose-500/25 px-1 py-px text-[8px] font-semibold text-rose-200",
                                                children: "Active"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 282,
                                                columnNumber: 17
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 267,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 226,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1.5 flex items-center justify-center gap-0.5 px-1 text-[8px] text-slate-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Start"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 289,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        className: "h-3 w-3 shrink-0 opacity-70",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 290,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Main"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 291,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        className: "h-3 w-3 shrink-0 opacity-70",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 292,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Enemy"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 293,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-1 text-slate-500",
                                        children: "· similar to YGO flow"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 294,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 288,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-2.5 py-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                className: "h-3.5 w-3.5 shrink-0 text-cyan-300/80",
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 298,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] font-medium tabular-nums text-cyan-100/95",
                                children: [
                                    "Round ",
                                    currentTurnId,
                                    " ·",
                                    " ",
                                    turnPhase === "start" ? "Start (relics / draw / ST)" : turnPhase === "player" ? "Main phase" : "Enemy phase",
                                    selected?.totalDamage != null && selected.totalDamage > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-normal text-slate-500",
                                        children: [
                                            " · ",
                                            selected.totalDamage,
                                            " incoming atk"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 307,
                                        columnNumber: 15
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 299,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                        lineNumber: 297,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                lineNumber: 211,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: TIMELINE_ZONE,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                        className: "h-3 w-3 text-cyan-500/80",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 316,
                                        columnNumber: 13
                                    }, this),
                                    "Intent preview by turn"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 315,
                                columnNumber: 11
                            }, this),
                            plannerRows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "rounded-xl border border-dashed border-slate-700/80 py-6 text-center text-[11px] text-slate-500",
                                children: "No turns loaded yet."
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 321,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                children: plannerRows.map((row, index)=>{
                                    const isActive = row.id === currentTurnId;
                                    const summary = row.summary;
                                    const lines = summary?.enemySummaries ?? [];
                                    const expanded = isExpanded(row.id, lines.length);
                                    const visibleLines = expanded ? lines : lines.slice(0, INTENT_PREVIEW_MAX);
                                    const hiddenCount = lines.length - visibleLines.length;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: isActive ? activeTurnRef : undefined,
                                        className: "w-full",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setCurrentTurn(row.id),
                                                className: `w-full max-w-full rounded-xl border-2 p-2.5 text-left transition-all duration-200 ${isActive ? "border-cyan-500/70 bg-slate-900/95 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-400/15" : "border-slate-700/80 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/50"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-start justify-between gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-1.5",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                                                                className: `h-3.5 w-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-600"}`,
                                                                                strokeWidth: 2
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                                lineNumber: 348,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-sm font-bold tabular-nums text-slate-100",
                                                                                children: [
                                                                                    "Turn ",
                                                                                    row.id
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                                lineNumber: 352,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "rounded-md bg-cyan-500/20 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-cyan-200",
                                                                                children: "Active"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                                lineNumber: 354,
                                                                                columnNumber: 31
                                                                            }, this) : null
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                        lineNumber: 347,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "mt-0.5 text-[10px] text-slate-500",
                                                                        children: summary ? `${summary.enemySummaries.length} intent line${summary.enemySummaries.length === 1 ? "" : "s"}` : "No intents in data for this turn"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                        lineNumber: 359,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                lineNumber: 346,
                                                                columnNumber: 25
                                                            }, this),
                                                            summary && summary.totalDamage > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "shrink-0 rounded-full border border-rose-500/35 bg-rose-950/40 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-rose-200",
                                                                children: [
                                                                    summary.totalDamage,
                                                                    " dmg"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                lineNumber: 366,
                                                                columnNumber: 27
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                        lineNumber: 345,
                                                        columnNumber: 23
                                                    }, this),
                                                    lines.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 space-y-1 border-t border-slate-800/80 pt-2",
                                                        children: [
                                                            visibleLines.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-0.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex gap-2 text-[10px] leading-snug text-slate-400",
                                                                            title: s.modifierHint ? `${s.name}: ${s.line} — ${s.modifierHint}. (n) = base attack.` : `${s.name}: ${s.line || "No intent"}`,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "shrink-0 font-medium text-slate-500",
                                                                                    children: s.name
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                                    lineNumber: 384,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "min-w-0 text-slate-300",
                                                                                    children: s.line || "—"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                                    lineNumber: 385,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                            lineNumber: 376,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        s.modifierHint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[9px] leading-tight text-amber-200/75",
                                                                            children: s.modifierHint
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                            lineNumber: 388,
                                                                            columnNumber: 33
                                                                        }, this) : null
                                                                    ]
                                                                }, `${row.id}-${s.name}-${s.line}`, true, {
                                                                    fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                    lineNumber: 375,
                                                                    columnNumber: 29
                                                                }, this)),
                                                            hiddenCount > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: (e)=>{
                                                                    e.stopPropagation();
                                                                    toggleTurnExpanded(row.id);
                                                                },
                                                                className: "flex w-full items-center justify-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/50 py-1 text-[10px] font-medium text-cyan-300/90 transition hover:bg-slate-800/80",
                                                                children: expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                            className: "h-3 w-3",
                                                                            strokeWidth: 2
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                            lineNumber: 403,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        "Show less"
                                                                    ]
                                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                            className: "h-3 w-3",
                                                                            strokeWidth: 2
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                            lineNumber: 408,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        "+",
                                                                        hiddenCount,
                                                                        " more"
                                                                    ]
                                                                }, void 0, true)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                lineNumber: 393,
                                                                columnNumber: 29
                                                            }, this) : lines.length > INTENT_PREVIEW_MAX ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: (e)=>{
                                                                    e.stopPropagation();
                                                                    toggleTurnExpanded(row.id);
                                                                },
                                                                className: "flex w-full items-center justify-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-400",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                        className: "h-3 w-3",
                                                                        strokeWidth: 2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                        lineNumber: 422,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    "Collapse"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                                lineNumber: 414,
                                                                columnNumber: 29
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                        lineNumber: 373,
                                                        columnNumber: 25
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 336,
                                                columnNumber: 21
                                            }, this),
                                            index < plannerRows.length - 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>continueFromTurn(row.id, plannerRows[index + 1].id),
                                                className: "mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-600/40 bg-cyan-950/25 py-1.5 text-[11px] font-semibold text-cyan-200/95 transition hover:bg-cyan-900/35 hover:text-cyan-50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                        className: "h-3.5 w-3.5",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                        lineNumber: 436,
                                                        columnNumber: 25
                                                    }, this),
                                                    "Copy state → Turn ",
                                                    plannerRows[index + 1].id
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                                lineNumber: 431,
                                                columnNumber: 23
                                            }, this) : null
                                        ]
                                    }, row.id, true, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 335,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 325,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: ACTIONS_ZONE,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
                                children: "Quick actions"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 448,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionBtn, {
                                        tone: "cyan",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
                                        onClick: beginTurn,
                                        disabled: turnPhase !== "start",
                                        children: "Start turn"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 450,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionBtn, {
                                        tone: "amber",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__["SkipForward"],
                                        onClick: endPlayerTurn,
                                        disabled: turnPhase !== "player",
                                        children: "End main phase"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 458,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionBtn, {
                                        tone: "rose",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"],
                                        onClick: endEnemyTurn,
                                        disabled: turnPhase !== "enemy",
                                        children: "End enemy turn"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 466,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionBtn, {
                                        tone: "slate",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"],
                                        onClick: handleReset,
                                        children: "Reset turn data"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                        lineNumber: 474,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 449,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-[10px] leading-relaxed text-slate-600",
                                children: "Tip: Each round begins in Start — click Start turn to log and enter Main (play cards). End main phase → Enemy. End enemy turn → next round (Start again). “Copy state” uses the player-end snapshot during Enemy. Reset restores the initial snapshot."
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                                lineNumber: 478,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                        lineNumber: 447,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/TimelineBlock.tsx",
                lineNumber: 313,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/TimelineBlock.tsx",
        lineNumber: 210,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/components/UI/MainFieldBlock.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MainFieldBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/GameContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/constants/colors.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/intentFormat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$columns$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Columns2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/columns-2.mjs [app-ssr] (ecmascript) <export default as Columns2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crosshair.mjs [app-ssr] (ecmascript) <export default as Crosshair>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hand$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hand.mjs [app-ssr] (ecmascript) <export default as Hand>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs [app-ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-tree.mjs [app-ssr] (ecmascript) <export default as ListTree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.mjs [app-ssr] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.mjs [app-ssr] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scroll-text.mjs [app-ssr] (ecmascript) <export default as ScrollText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$stack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareStack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-stack.mjs [app-ssr] (ecmascript) <export default as SquareStack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
"use client";
;
;
;
;
;
;
;
;
;
function cyclePileViewSize(s) {
    return s === "small" ? "medium" : s === "medium" ? "large" : "small";
}
function CardSizeCycleButton({ size, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>onChange(cyclePileViewSize(size)),
        className: "flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800",
        title: "Cycle card size: small → medium → large",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                className: `h-4 w-4 ${size === "small" ? "text-cyan-300" : "text-slate-500"}`,
                strokeWidth: 2
            }, void 0, false, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$columns$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Columns2$3e$__["Columns2"], {
                className: `h-4 w-4 ${size === "medium" ? "text-cyan-300" : "text-slate-500"}`,
                strokeWidth: 2
            }, void 0, false, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$stack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareStack$3e$__["SquareStack"], {
                className: `h-4 w-4 ${size === "large" ? "text-cyan-300" : "text-slate-500"}`,
                strokeWidth: 2
            }, void 0, false, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "hidden sm:inline",
                children: "Size"
            }, void 0, false, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
const ACTIVITY_LOG_DENSITY_KEY = "sts-activity-log-inline-density";
function currentTurnIntentLine(enemy, intents, turnId, player) {
    const intent = intents.find((i)=>i.turn === turnId);
    if (!intent) return {
        line: null,
        modifierHint: ""
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isEnemyActiveForIntents"])(enemy)) return {
        line: null,
        modifierHint: ""
    };
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildIncomingDamageContext"])(player, enemy);
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatIntentActionsLineIncoming"])(intent.actions, ctx);
    const line = raw.length > 0 ? raw : null;
    const modifierHint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$intentFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["describeIncomingModifiers"])(ctx);
    return {
        line,
        modifierHint
    };
}
function getActivityLogColors(type) {
    const logType = type || "info";
    return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ACTIVITY_LOG_COLORS"][logType] || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ACTIVITY_LOG_COLORS"].info;
}
function getActivityLogIcon(type) {
    const logType = type || "info";
    return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ACTIVITY_LOG_ICONS"][logType] || "•";
}
function cardTypeClasses(cardType) {
    const t = cardType;
    const text = t && __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD_TYPE_COLORS"][t] || "text-slate-200";
    const bg = t && __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CARD_TYPE_BG"][t] || "bg-slate-800/80";
    return {
        text,
        bg
    };
}
function ActivityLogCardChips({ cards, size = "sm" }) {
    const md = size === "md";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-1.5",
        "aria-label": "Cards involved",
        children: cards.map((c, i)=>{
            const { text, bg } = cardTypeClasses(c.cardType);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                title: c.cardType ? `${c.name} · ${c.cardType}` : c.name,
                className: `inline-flex max-w-full items-baseline gap-1 truncate rounded-lg border border-white/10 font-semibold shadow-sm ${text} ${bg} ${md ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-[11px]"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate",
                        children: c.name
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 131,
                        columnNumber: 13
                    }, this),
                    c.cardType ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "shrink-0 text-[9px] font-bold uppercase tracking-wide opacity-85",
                        children: [
                            "(",
                            c.cardType,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 133,
                        columnNumber: 15
                    }, this) : null
                ]
            }, `${c.name}-${i}`, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 126,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
function ActivityLogContextRows({ context, dense }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
        className: `grid gap-1.5 ${dense ? "" : "sm:grid-cols-2"}`,
        children: context.map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `rounded-lg border border-slate-700/55 bg-slate-950/40 ${dense ? "px-2 py-1.5" : "px-3 py-2"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                        className: "text-[10px] font-semibold uppercase tracking-wide text-slate-500",
                        children: row.label
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                        className: `mt-0.5 break-words text-slate-200 ${dense ? "text-xs" : "text-sm"}`,
                        children: row.value
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this)
                ]
            }, `${row.label}-${i}`, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 146,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
function logEntryMatchesFilter(entry, q) {
    if (entry.title.toLowerCase().includes(q) || (entry.details?.toLowerCase().includes(q) ?? false) || (entry.before?.toLowerCase().includes(q) ?? false) || (entry.after?.toLowerCase().includes(q) ?? false)) {
        return true;
    }
    if (entry.cardsInvolved?.some((c)=>c.name.toLowerCase().includes(q) || (c.cardType?.toLowerCase().includes(q) ?? false))) {
        return true;
    }
    if (entry.context?.some((c)=>c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q))) {
        return true;
    }
    return false;
}
/** Hide raw "Cards: …" line when structured chips are shown. */ function shouldShowDetailsText(entry) {
    if (!entry.details?.trim()) return false;
    if (entry.cardsInvolved?.length && /^cards:\s/i.test(entry.details.trim())) return false;
    return true;
}
/** Single-line + optional meta; card names use type colors when present. */ function ActivityLogRowMinimal({ entry }) {
    const colors = getActivityLogColors(entry.type);
    const icon = getActivityLogIcon(entry.type);
    const metaLine = entry.after || entry.before || entry.context?.map((c)=>`${c.label}: ${c.value}`).join(" · ") || (shouldShowDetailsText(entry) ? entry.details : undefined);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `group flex gap-2 border-b border-slate-800/50 border-l-2 py-2 pl-2 pr-2 transition-colors last:border-b-0 hover:bg-slate-900/35 ${colors.border}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-w-0 flex-1 items-start gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "shrink-0 text-sm leading-none opacity-90",
                    "aria-hidden": true,
                    children: icon
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                    lineNumber: 198,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-w-0 flex-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-baseline justify-between gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: `min-w-0 truncate text-[13px] font-semibold leading-tight ${colors.text}`,
                                    children: entry.title
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                    lineNumber: 203,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                    className: "shrink-0 text-[10px] tabular-nums text-slate-500",
                                    children: entry.timestamp
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                    lineNumber: 204,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                            lineNumber: 202,
                            columnNumber: 11
                        }, this),
                        entry.cardsInvolved && entry.cardsInvolved.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-0.5 min-w-0 truncate text-[11px] leading-tight",
                            children: entry.cardsInvolved.map((c, i)=>{
                                const { text } = cardTypeClasses(c.cardType);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-medium ${text}`,
                                    children: [
                                        i > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-normal text-slate-600",
                                            children: ", "
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                            lineNumber: 212,
                                            columnNumber: 30
                                        }, this) : null,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline max-w-[12rem] truncate align-bottom",
                                            children: c.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                            lineNumber: 213,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, `${c.name}-${i}`, true, {
                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                    lineNumber: 211,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                            lineNumber: 207,
                            columnNumber: 13
                        }, this) : metaLine ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-0.5 truncate text-[11px] text-slate-500",
                            title: metaLine,
                            children: metaLine
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                            lineNumber: 219,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-0.5 text-[10px] uppercase tracking-wide text-slate-600",
                            children: (entry.type ?? "info").replace(/-/g, " ")
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                            lineNumber: 223,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                    lineNumber: 201,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
            lineNumber: 197,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 194,
        columnNumber: 5
    }, this);
}
function ActivityLogRowDetailed({ entry }) {
    const colors = getActivityLogColors(entry.type);
    const icon = getActivityLogIcon(entry.type);
    const hasDelta = Boolean(entry.before || entry.after);
    const showDetails = shouldShowDetailsText(entry);
    const hasBody = Boolean(hasDelta || showDetails || entry.context && entry.context.length > 0 || entry.cardsInvolved && entry.cardsInvolved.length > 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "group relative flex gap-3 py-2 pl-1 pr-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex w-5 shrink-0 flex-col items-center pt-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm shadow-sm transition-transform duration-200 group-hover:scale-105 ${colors.border} ${colors.bg}`,
                    "aria-hidden": true,
                    children: icon
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                    lineNumber: 245,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 244,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `min-w-0 flex-1 rounded-xl border px-3 py-2 transition-shadow duration-200 group-hover:shadow-md ${colors.border} ${colors.bg}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `min-w-0 text-sm font-semibold leading-snug ${colors.text}`,
                                children: entry.title
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 256,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex shrink-0 items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors.badge} ${colors.text}`,
                                        children: (entry.type ?? "info").replace(/-/g, " ")
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 258,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                        className: "text-[11px] tabular-nums text-slate-500",
                                        children: entry.timestamp
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 261,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 257,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 255,
                        columnNumber: 9
                    }, this),
                    entry.cardsInvolved && entry.cardsInvolved.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 border-t border-slate-700/30 pt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500",
                                children: "Cards"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 267,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogCardChips, {
                                cards: entry.cardsInvolved
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 268,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 266,
                        columnNumber: 11
                    }, this) : null,
                    entry.context && entry.context.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 border-t border-slate-700/30 pt-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogContextRows, {
                            context: entry.context,
                            dense: true
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                            lineNumber: 274,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 273,
                        columnNumber: 11
                    }, this) : null,
                    hasBody && (hasDelta || showDetails) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 space-y-1.5 border-t border-slate-700/40 pt-2 text-[11px]",
                        children: [
                            hasDelta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-stretch gap-2",
                                children: [
                                    entry.before != null && entry.before !== "" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0 flex-1 rounded-lg border border-slate-700/60 bg-slate-950/40 px-2 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-medium uppercase tracking-wide text-slate-500",
                                                children: "Before"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 284,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-0.5 font-mono text-xs text-slate-300 break-words",
                                                children: entry.before
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 285,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 283,
                                        columnNumber: 19
                                    }, this),
                                    entry.before && entry.after ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden shrink-0 self-center text-slate-600 sm:inline",
                                        "aria-hidden": true,
                                        children: "→"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 289,
                                        columnNumber: 19
                                    }, this) : null,
                                    entry.after != null && entry.after !== "" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0 flex-1 rounded-lg border border-slate-700/60 bg-slate-950/40 px-2 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-medium uppercase tracking-wide text-slate-500",
                                                children: "After"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 295,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `mt-0.5 font-mono text-xs font-semibold break-words ${colors.text}`,
                                                children: entry.after
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 296,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 294,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 281,
                                columnNumber: 15
                            }, this) : null,
                            showDetails ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none",
                                children: entry.details
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 302,
                                columnNumber: 15
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 279,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 243,
        columnNumber: 5
    }, this);
}
function ActivityLogRowInline({ entry, density }) {
    if (density === "minimal") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogRowMinimal, {
        entry: entry
    }, void 0, false, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 318,
        columnNumber: 37
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogRowDetailed, {
        entry: entry
    }, void 0, false, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 319,
        columnNumber: 10
    }, this);
}
function ActivityLogRowExpanded({ entry }) {
    const colors = getActivityLogColors(entry.type);
    const icon = getActivityLogIcon(entry.type);
    const showDetails = shouldShowDetailsText(entry);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: `rounded-2xl border-2 p-5 md:p-6 ${colors.border} ${colors.bg}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-start gap-3 border-b border-slate-700/50 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-600/50 bg-slate-950/50 text-2xl shadow-inner",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 330,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: `text-lg font-bold leading-snug md:text-xl ${colors.text}`,
                                children: entry.title
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 334,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex flex-wrap items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide ${colors.badge} ${colors.text}`,
                                        children: (entry.type ?? "info").replace(/-/g, " ")
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 336,
                                        columnNumber: 13
                                    }, this),
                                    entry.target ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-lg border border-slate-600 bg-slate-900/80 px-2 py-1 text-xs text-slate-300",
                                        children: entry.target
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 340,
                                        columnNumber: 15
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                        className: "text-sm tabular-nums text-slate-400",
                                        children: entry.timestamp
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 344,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 335,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 333,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 329,
                columnNumber: 7
            }, this),
            entry.cardsInvolved && entry.cardsInvolved.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500",
                        children: "Cards"
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 351,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogCardChips, {
                        cards: entry.cardsInvolved,
                        size: "md"
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 352,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 350,
                columnNumber: 9
            }, this) : null,
            entry.context && entry.context.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500",
                        children: "Context"
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 358,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogContextRows, {
                        context: entry.context
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 359,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 357,
                columnNumber: 9
            }, this) : null,
            (entry.before || entry.after) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex flex-col gap-3 md:flex-row md:items-stretch",
                children: [
                    entry.before != null && entry.before !== "" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1 rounded-xl border border-slate-700/70 bg-slate-950/55 p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold uppercase tracking-wide text-slate-500",
                                children: "Before"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 367,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 font-mono text-base leading-relaxed text-slate-200 whitespace-pre-wrap break-words",
                                children: entry.before
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 368,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 366,
                        columnNumber: 13
                    }, this),
                    entry.before && entry.after ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex shrink-0 items-center justify-center md:px-1",
                        "aria-hidden": true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-400",
                            children: "→"
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                            lineNumber: 375,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 374,
                        columnNumber: 13
                    }, this) : null,
                    entry.after != null && entry.after !== "" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1 rounded-xl border border-slate-700/70 bg-slate-950/55 p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold uppercase tracking-wide text-slate-500",
                                children: "After"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 380,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `mt-2 font-mono text-base font-semibold leading-relaxed whitespace-pre-wrap break-words ${colors.text}`,
                                children: entry.after
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 381,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 379,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 364,
                columnNumber: 9
            }, this),
            showDetails ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 rounded-xl border border-slate-700/70 bg-slate-950/40 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-wide text-slate-500",
                        children: "Details"
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 391,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-base leading-relaxed text-slate-200 whitespace-pre-wrap break-words",
                        children: entry.details
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 392,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 390,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 328,
        columnNumber: 5
    }, this);
}
const SHELL = "rounded-2xl border border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-xl shadow-slate-950/25";
function MainFieldBlock() {
    const { gameState, turns, currentTurnIndex, saveCurrentTurn, combatTargetMode: targetMode, setCombatTargetMode, combatTargetEnemyIndices: selectedEnemyIndices, toggleCombatEnemyTarget, combatTargetSelf, toggleCombatTargetSelf, clearCombatTargets } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameManager"])();
    const [activityLogOpen, setActivityLogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activityLogFilter, setActivityLogFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [activityLogModalTurnIndex, setActivityLogModalTurnIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [activityLogDensity, setActivityLogDensity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("detailed");
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [handCardSize, setHandCardSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("medium");
    const [playedCardSize, setPlayedCardSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("small");
    const enemies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>gameState?.enemies ?? [], [
        gameState?.enemies
    ]);
    const logEntriesNewestFirst = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...gameState?.activityLog ?? []
        ].reverse(), [
        gameState?.activityLog
    ]);
    const anyTurnHasLogEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>turns.some((t)=>(t.state?.activityLog?.length ?? 0) > 0), [
        turns
    ]);
    const safeModalLogTurnIndex = Math.min(activityLogModalTurnIndex, Math.max(0, turns.length - 1));
    const activityLogForModalTurn = turns[safeModalLogTurnIndex]?.state?.activityLog;
    const modalLogEntriesNewestFirst = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...activityLogForModalTurn ?? []
        ].reverse(), [
        activityLogForModalTurn
    ]);
    const filteredModalLogEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const q = activityLogFilter.trim().toLowerCase();
        if (!q) return modalLogEntriesNewestFirst;
        return modalLogEntriesNewestFirst.filter((e)=>logEntryMatchesFilter(e, q));
    }, [
        modalLogEntriesNewestFirst,
        activityLogFilter
    ]);
    const modalTurnMeta = turns[safeModalLogTurnIndex];
    const isViewingCurrentTurnInModal = safeModalLogTurnIndex === currentTurnIndex;
    const currentTurnId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const fromTurn = turns[currentTurnIndex]?.id;
        if (fromTurn != null) return fromTurn;
        let minT = null;
        for (const e of enemies){
            for (const intent of e.intents ?? []){
                if (minT == null || intent.turn < minT) minT = intent.turn;
            }
        }
        return minT ?? 1;
    }, [
        turns,
        currentTurnIndex,
        enemies
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>setMounted(true), []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const raw = localStorage.getItem(ACTIVITY_LOG_DENSITY_KEY);
            if (raw === "minimal" || raw === "detailed") setActivityLogDensity(raw);
        } catch  {
        /* ignore */ }
    }, []);
    const setInlineLogDensity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((d)=>{
        setActivityLogDensity(d);
        try {
            localStorage.setItem(ACTIVITY_LOG_DENSITY_KEY, d);
        } catch  {
        /* ignore */ }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!activityLogOpen) {
            setActivityLogFilter("");
            return;
        }
        const isTypingInField = (t)=>{
            const el = t;
            if (!el) return false;
            const tag = el.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
            return el.isContentEditable;
        };
        const onKey = (e)=>{
            if (e.key === "Escape") {
                e.preventDefault();
                setActivityLogOpen(false);
                return;
            }
            if (turns.length < 2 || isTypingInField(e.target)) return;
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                setActivityLogModalTurnIndex((i)=>{
                    const max = Math.max(0, turns.length - 1);
                    const c = Math.min(Math.max(0, i), max);
                    if (e.key === "ArrowLeft") return Math.max(0, c - 1);
                    return Math.min(max, c + 1);
                });
            }
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return ()=>{
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [
        activityLogOpen,
        turns.length
    ]);
    const setMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((mode)=>{
        setCombatTargetMode(mode);
    }, [
        setCombatTargetMode
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "sts-battle-focus",
        className: "mx-auto w-full max-w-6xl scroll-mt-2 space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: `${SHELL} border-cyan-500/15 ring-1 ring-cyan-500/5`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 flex flex-wrap items-center justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-950/40 text-cyan-400",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__["Crosshair"], {
                                            className: "h-4 w-4",
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                            lineNumber: 531,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 530,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-base font-semibold tracking-tight text-slate-100",
                                                children: "Target selection"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 534,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-slate-500",
                                                children: "Single or multi-select for card actions"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 535,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 533,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 529,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center gap-2",
                                children: [
                                    (selectedEnemyIndices.length > 0 || combatTargetSelf) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: clearCombatTargets,
                                        className: "rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800",
                                        children: "Clear"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 540,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-medium uppercase tracking-wide text-slate-500 ms-4",
                                        children: "Mode"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 548,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inline-flex rounded-xl border border-slate-700 bg-slate-900/80 p-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setMode("single"),
                                                className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${targetMode === "single" ? "bg-rose-600 text-white shadow-md shadow-rose-950/30" : "text-slate-400 hover:text-slate-200"}`,
                                                children: "Single"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 552,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setMode("multi"),
                                                className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${targetMode === "multi" ? "bg-rose-600 text-white shadow-md shadow-rose-950/30" : "text-slate-400 hover:text-slate-200"}`,
                                                children: "Multi"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 562,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 549,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>toggleCombatTargetSelf(),
                                        title: "Mark yourself as the target (self-targeting cards)",
                                        className: `inline-flex items-center gap-0.5 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${combatTargetSelf ? "border-sky-500/70 bg-sky-950/45 text-sky-200 shadow-sm shadow-sky-950/30" : "border-slate-600/90 bg-slate-900/70 text-slate-500 hover:border-slate-500 hover:text-slate-300"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                className: "h-3 w-3 shrink-0 opacity-90",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 582,
                                                columnNumber: 15
                                            }, this),
                                            "Self"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 573,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 538,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 528,
                        columnNumber: 9
                    }, this),
                    (selectedEnemyIndices.length > 0 || combatTargetSelf) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-3 truncate rounded-lg border border-rose-500/20 bg-rose-950/25 px-3 py-2 text-xs text-slate-300",
                        title: [
                            ...combatTargetSelf ? [
                                "Self"
                            ] : [],
                            ...selectedEnemyIndices.map((i)=>enemies[i]?.name ?? `#${i}`)
                        ].join(", ") || undefined,
                        children: [
                            "Selected",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-mono font-medium text-rose-200",
                                children: [
                                    ...combatTargetSelf ? [
                                        "Self"
                                    ] : [],
                                    ...selectedEnemyIndices.map((i)=>enemies[i]?.name ?? `Enemy #${i + 1}`)
                                ].join(" · ")
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 599,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-slate-500",
                                children: [
                                    " ",
                                    "· ",
                                    selectedEnemyIndices.length + (combatTargetSelf ? 1 : 0)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 605,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 589,
                        columnNumber: 11
                    }, this),
                    enemies.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "rounded-xl border border-dashed border-slate-700 py-8 text-center text-sm text-slate-500",
                        children: "No enemies in this combat."
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 613,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
                        children: enemies.map((enemy, index)=>{
                            const selected = selectedEnemyIndices.includes(index);
                            const hpPct = enemy.maxHp > 0 ? Math.max(0, Math.min(100, enemy.hp / enemy.maxHp * 100)) : 0;
                            const block = enemy.currentBlock ?? 0;
                            const buffs = enemy.buffsDebuffs ?? [];
                            const { line: intentLine, modifierHint } = currentTurnIntentLine(enemy, enemy.intents ?? [], currentTurnId, gameState?.player);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleCombatEnemyTarget(index),
                                className: `rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${selected ? "border-rose-500 bg-rose-950/35 shadow-md shadow-rose-950/20 ring-1 ring-rose-400/20" : "border-slate-700/90 bg-slate-900/50 hover:border-rose-500/45"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2 flex items-start justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "line-clamp-2 text-base font-bold leading-tight text-slate-100",
                                                children: enemy.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 639,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${selected ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"}`,
                                                children: [
                                                    "#",
                                                    index + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 640,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 638,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-0.5 flex justify-between text-[10px] text-slate-500",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "HP"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                lineNumber: 651,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-mono tabular-nums text-rose-300",
                                                                children: [
                                                                    enemy.hp,
                                                                    "/",
                                                                    enemy.maxHp
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                lineNumber: 652,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 650,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-2 w-full overflow-hidden rounded-full bg-slate-800",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-500 transition-[width]",
                                                            style: {
                                                                width: `${hpPct}%`
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                            lineNumber: 657,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 656,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 649,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-800/60 px-2 py-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-500",
                                                        children: "Block"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 665,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-sm font-semibold tabular-nums text-sky-300",
                                                        children: block
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 666,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 664,
                                                columnNumber: 21
                                            }, this),
                                            buffs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-1",
                                                children: buffs.map((bd, bi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        title: bd.description,
                                                        className: `rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-none ${bd.type === "buff" ? "border border-emerald-800 bg-emerald-950/80 text-emerald-300" : "border border-amber-800 bg-amber-950/80 text-amber-200"}`,
                                                        children: [
                                                            bd.name,
                                                            bd.stacks !== 1 ? `×${bd.stacks}` : ""
                                                        ]
                                                    }, bi, true, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 672,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 670,
                                                columnNumber: 23
                                            }, this),
                                            intentLine != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 flex items-start gap-2 border-t border-slate-800/90 pt-2 text-[11px] leading-snug",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-slate-400",
                                                        children: [
                                                            "T",
                                                            currentTurnId
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 689,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "min-w-0 text-slate-300",
                                                        title: modifierHint ? `Turn ${currentTurnId} — ${modifierHint}. Numbers in ( ) are base attack before modifiers.` : `Turn ${currentTurnId}: ${intentLine}`,
                                                        children: [
                                                            intentLine,
                                                            modifierHint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "mt-0.5 block text-[9px] font-normal leading-tight text-amber-200/80",
                                                                children: modifierHint
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                lineNumber: 702,
                                                                columnNumber: 29
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 692,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 688,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 648,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, `${enemy.name}-${index}`, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 629,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 615,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 527,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 xl:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: `${SHELL}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 flex flex-wrap items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-950/35 text-emerald-400",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hand$3e$__["Hand"], {
                                                    className: "h-4 w-4",
                                                    strokeWidth: 2
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                    lineNumber: 723,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 722,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-base font-semibold tracking-tight text-slate-100",
                                                        children: "Hand"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 726,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[11px] text-slate-500",
                                                        children: [
                                                            (gameState?.hand ?? []).length,
                                                            " cards"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 727,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 725,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 721,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CardSizeCycleButton, {
                                        size: handCardSize,
                                        onChange: setHandCardSize
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 730,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 720,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-4",
                                children: (gameState?.hand ?? []).map((card, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        size: handCardSize,
                                        card: card,
                                        index: index,
                                        location: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].HAND
                                    }, `hand-${index}-${card.name}`, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 734,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 732,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 719,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: `${SHELL}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 flex flex-wrap items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-950/35 text-violet-400",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                                    className: "h-4 w-4",
                                                    strokeWidth: 2
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                    lineNumber: 749,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 748,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-base font-semibold tracking-tight text-slate-100",
                                                        children: "Played"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 752,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[11px] text-slate-500",
                                                        children: [
                                                            (gameState?.playedCards ?? []).length,
                                                            " cards"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 753,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 751,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 747,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CardSizeCycleButton, {
                                        size: playedCardSize,
                                        onChange: setPlayedCardSize
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 756,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 746,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-4",
                                children: (gameState?.playedCards ?? []).map((card, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        size: playedCardSize,
                                        card: card,
                                        index: index,
                                        location: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].PLAYED
                                    }, `played-${index}-${card.name}`, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 760,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 758,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 745,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 718,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: `${SHELL} border-violet-500/20 bg-linear-to-br from-slate-950 via-slate-900/98 to-violet-950/20 ring-1 ring-violet-500/10`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 flex flex-wrap items-center justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-950/40 text-violet-300",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__["ScrollText"], {
                                            className: "h-4 w-4",
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                            lineNumber: 779,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 778,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-base font-semibold tracking-tight text-slate-100",
                                                children: "Activity log"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 782,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-slate-500",
                                                children: [
                                                    logEntriesNewestFirst.length,
                                                    " ",
                                                    logEntriesNewestFirst.length === 1 ? "entry" : "entries",
                                                    " · newest first"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 783,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 781,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 777,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inline-flex rounded-xl border border-slate-700 bg-slate-900/80 p-0.5",
                                        role: "group",
                                        "aria-label": "Inline log detail level",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setInlineLogDensity("minimal"),
                                                className: `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${activityLogDensity === "minimal" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                                        className: "h-3.5 w-3.5",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 802,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Minimal"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 794,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setInlineLogDensity("detailed"),
                                                className: `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${activityLogDensity === "detailed" ? "bg-violet-600/90 text-white shadow-sm shadow-violet-950/30" : "text-slate-400 hover:text-slate-200"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"], {
                                                        className: "h-3.5 w-3.5",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 813,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Detailed"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 805,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 789,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            saveCurrentTurn();
                                            setActivityLogModalTurnIndex(currentTurnIndex);
                                            setActivityLogOpen(true);
                                        },
                                        disabled: !anyTurnHasLogEntries,
                                        className: "inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-950/50 px-3 py-2 text-xs font-semibold text-violet-100 shadow-sm transition-all hover:bg-violet-900/50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                                className: "h-3.5 w-3.5",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 827,
                                                columnNumber: 15
                                            }, this),
                                            "Big view"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 817,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 788,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 776,
                        columnNumber: 9
                    }, this),
                    logEntriesNewestFirst.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative max-h-80 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/40 pr-1 [scrollbar-width:thin]",
                        children: [
                            activityLogDensity === "detailed" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pointer-events-none absolute bottom-0 left-[21px] top-8 w-px bg-slate-700/80",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 836,
                                columnNumber: 15
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative py-1",
                                children: logEntriesNewestFirst.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogRowInline, {
                                        entry: entry,
                                        density: activityLogDensity
                                    }, entry.id, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 840,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 838,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 834,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl border border-dashed border-slate-700 py-10 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-400",
                                children: "No activity recorded yet."
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 846,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-slate-600",
                                children: "Plays, moves, and stat changes will show up here."
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 847,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 845,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 773,
                columnNumber: 7
            }, this),
            mounted && activityLogOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[200] flex flex-col",
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": "activity-log-expanded-title",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "absolute inset-0 bg-slate-950/85 backdrop-blur-md",
                        "aria-label": "Close activity log",
                        onClick: ()=>setActivityLogOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 856,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col px-3 pb-4 pt-4 md:px-6 md:pb-8 md:pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex shrink-0 flex-col gap-3 rounded-t-2xl border border-b-0 border-violet-500/25 bg-slate-950/95 px-4 py-4 shadow-2xl shadow-black/40 md:flex-row md:items-center md:justify-between md:px-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/35 bg-violet-950/50 text-violet-300 sm:flex",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__["ScrollText"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                    lineNumber: 866,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 865,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        id: "activity-log-expanded-title",
                                                        className: "text-lg font-bold text-slate-50 md:text-xl",
                                                        children: "Activity log"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 869,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-500",
                                                        children: [
                                                            "Larger type and full text — Esc to close.",
                                                            " ",
                                                            turns.length > 1 ? "←/→ to change turn when not typing in the filter." : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 872,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 868,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 864,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setActivityLogOpen(false),
                                        className: "inline-flex items-center justify-center gap-2 self-end rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 md:self-auto",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 883,
                                                columnNumber: 19
                                            }, this),
                                            "Close"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 878,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 863,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl border border-t-0 border-violet-500/25 bg-slate-950/90 shadow-2xl shadow-black/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "shrink-0 space-y-3 border-b border-slate-800 p-4 md:px-6",
                                        children: [
                                            turns.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-medium uppercase tracking-wide text-slate-500",
                                                            children: "Log from"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                            lineNumber: 893,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 p-0.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setActivityLogModalTurnIndex((i)=>{
                                                                            const max = Math.max(0, turns.length - 1);
                                                                            const c = Math.min(Math.max(0, i), max);
                                                                            return Math.max(0, c - 1);
                                                                        }),
                                                                    disabled: safeModalLogTurnIndex <= 0,
                                                                    className: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35",
                                                                    "aria-label": "Previous turn log",
                                                                    title: "Previous turn (←)",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                                        className: "h-4 w-4",
                                                                        strokeWidth: 2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                        lineNumber: 909,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                    lineNumber: 895,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "min-w-[7.5rem] select-none text-center text-sm font-semibold tabular-nums text-slate-100",
                                                                    title: modalTurnMeta ? `Turn id ${modalTurnMeta.id}` : undefined,
                                                                    children: [
                                                                        "Turn ",
                                                                        modalTurnMeta?.id ?? "—",
                                                                        turns.length > 1 ? ` · ${safeModalLogTurnIndex + 1}/${turns.length}` : null,
                                                                        !isViewingCurrentTurnInModal && turns.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "ms-1 text-[10px] font-medium uppercase text-amber-400/90",
                                                                            children: "(not current)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                            lineNumber: 918,
                                                                            columnNumber: 31
                                                                        }, this) : null
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                    lineNumber: 911,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setActivityLogModalTurnIndex((i)=>{
                                                                            const max = Math.max(0, turns.length - 1);
                                                                            const c = Math.min(Math.max(0, i), max);
                                                                            return Math.min(max, c + 1);
                                                                        }),
                                                                    disabled: safeModalLogTurnIndex >= turns.length - 1,
                                                                    className: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35",
                                                                    "aria-label": "Next turn log",
                                                                    title: "Next turn (→)",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                        className: "h-4 w-4",
                                                                        strokeWidth: 2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                        lineNumber: 935,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                                    lineNumber: 921,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                            lineNumber: 894,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>setActivityLogModalTurnIndex(currentTurnIndex),
                                                            disabled: isViewingCurrentTurnInModal,
                                                            className: "rounded-lg border border-violet-500/35 bg-violet-950/40 px-2.5 py-1.5 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-900/50 disabled:cursor-not-allowed disabled:opacity-40",
                                                            title: "Jump to the turn you are playing",
                                                            children: "Current turn"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                            lineNumber: 938,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                    lineNumber: 892,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 891,
                                                columnNumber: 21
                                            }, this) : null,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "relative block",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 951,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "search",
                                                        value: activityLogFilter,
                                                        onChange: (e)=>setActivityLogFilter(e.target.value),
                                                        placeholder: "Filter by title or details…",
                                                        className: "w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 pl-10 pr-4 text-base text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                        lineNumber: 952,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 950,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-500",
                                                children: [
                                                    "Showing ",
                                                    filteredModalLogEntries.length,
                                                    " of ",
                                                    modalLogEntriesNewestFirst.length,
                                                    " entries",
                                                    turns.length > 1 && modalTurnMeta ? ` · Turn ${modalTurnMeta.id}` : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                lineNumber: 960,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 889,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 [scrollbar-width:thin]",
                                        children: filteredModalLogEntries.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-5 pb-8",
                                            children: filteredModalLogEntries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogRowExpanded, {
                                                    entry: entry
                                                }, entry.id, false, {
                                                    fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                                    lineNumber: 969,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                            lineNumber: 967,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "py-12 text-center text-slate-500",
                                            children: modalLogEntriesNewestFirst.length === 0 ? "No activity for this turn." : "No entries match your filter."
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                            lineNumber: 973,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                        lineNumber: 965,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                                lineNumber: 888,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                        lineNumber: 862,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
                lineNumber: 855,
                columnNumber: 11
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/MainFieldBlock.tsx",
        lineNumber: 525,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/components/UI/BottomBlock.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BottomBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/GameContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.mjs [app-ssr] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$columns$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Columns2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/columns-2.mjs [app-ssr] (ecmascript) <export default as Columns2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.mjs [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs [app-ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$library$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Library$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/library.mjs [app-ssr] (ecmascript) <export default as Library>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$stack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareStack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-stack.mjs [app-ssr] (ecmascript) <export default as SquareStack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-ssr] (ecmascript) <export default as Trash2>");
"use client";
;
;
;
;
;
;
const PILES = [
    {
        id: "draw",
        label: "Draw",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$library$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Library$3e$__["Library"],
        idle: "border-slate-600/80 bg-slate-800/60 text-slate-200 hover:border-blue-400/50 hover:bg-blue-950/40",
        active: "border-blue-400/90 bg-blue-950/55 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-2 ring-blue-400/40"
    },
    {
        id: "discard",
        label: "Discard",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"],
        idle: "border-slate-600/80 bg-slate-800/60 text-slate-200 hover:border-rose-400/50 hover:bg-rose-950/35",
        active: "border-rose-400/90 bg-rose-950/45 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)] ring-2 ring-rose-400/35"
    },
    {
        id: "exhaust",
        label: "Exhaust",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"],
        idle: "border-slate-600/80 bg-slate-800/60 text-slate-200 hover:border-amber-400/45 hover:bg-amber-950/30",
        active: "border-amber-400/85 bg-amber-950/40 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.18)] ring-2 ring-amber-400/35"
    },
    {
        id: "playedCards",
        label: "Played",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"],
        idle: "border-slate-600/80 bg-slate-800/60 text-slate-200 hover:border-violet-400/50 hover:bg-violet-950/35",
        active: "border-violet-400/90 bg-violet-950/45 text-violet-100 shadow-[0_0_20px_rgba(167,139,250,0.22)] ring-2 ring-violet-400/35"
    }
];
function BottomBlock() {
    const { gameState, drawCards } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameManager"])();
    const [expandedPile, setExpandedPile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [drawAmount, setDrawAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(5);
    const [show_size, setShowSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("small");
    const toggleExpand = (pile)=>{
        setExpandedPile((prev)=>prev === pile ? null : pile);
    };
    const handleDraw = ()=>{
        drawCards(drawAmount);
    };
    const handleDrawOne = ()=>{
        drawCards(1);
    };
    const DRAW_MIN = 1;
    const DRAW_MAX = 9;
    const clampDrawAmount = (n)=>Math.min(Math.max(n, DRAW_MIN), DRAW_MAX);
    const getPileCards = (pile)=>{
        return gameState?.[pile] || [];
    };
    const getPileCount = (pile)=>{
        return getPileCards(pile).length;
    };
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (expandedPile == null) return;
        const isInBounds = (t)=>{
            if (!(t instanceof Node)) return false;
            if (ref.current?.contains(t)) return true;
            if (t instanceof Element) {
                if (t.closest?.("[data-bottom-deck-skip-outside]")) return true;
                if (t.closest?.("aside")) return true;
                if (t.closest?.("header")) return true;
                if (t.closest?.('[role="dialog"]')) return true;
            }
            return false;
        };
        const handleClickOutside = (event)=>{
            if (isInBounds(event.target)) return;
            setExpandedPile(null);
        };
        // Bubble (default) so the pile / skip-zone controls handle the click first; then we close
        // if the user actually clicked “outside” (avoids the old mousedown race with the actions bar)
        document.addEventListener("click", handleClickOutside);
        return ()=>document.removeEventListener("click", handleClickOutside);
    }, [
        expandedPile
    ]);
    const expandedLabel = PILES.find((p)=>p.id === expandedPile)?.label ?? "Pile";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "sts-deck-zone",
        ref: ref,
        className: "relative scroll-mt-2 border-t border-slate-700/90 bg-slate-900/95 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md max-md:border-t-2 max-md:border-emerald-500/30 max-md:bg-gradient-to-b max-md:from-emerald-950/20 max-md:via-slate-900/95 max-md:to-slate-900/95 max-md:shadow-[0_-8px_32px_rgba(16,185,129,0.08)]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${expandedPile ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-h-0 overflow-hidden border-b border-slate-800/80",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-h-[min(46vh,22rem)] overflow-y-auto px-4 pt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3 flex flex-wrap items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "whitespace-nowrap text-sm font-semibold tracking-tight text-white",
                                        children: [
                                            expandedLabel,
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-normal text-slate-500",
                                                children: [
                                                    "(",
                                                    expandedPile ? getPileCount(expandedPile) : 0,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 135,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 133,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setShowSize((s)=>s === "small" ? "medium" : s === "medium" ? "large" : "small"),
                                        className: "flex items-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800",
                                        title: "Cycle card size: small → medium → large",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                                className: `h-4 w-4 ${show_size === "small" ? "text-cyan-300" : "text-slate-500"}`,
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 147,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$columns$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Columns2$3e$__["Columns2"], {
                                                className: `h-4 w-4 ${show_size === "medium" ? "text-cyan-300" : "text-slate-500"}`,
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 151,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$stack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareStack$3e$__["SquareStack"], {
                                                className: `h-4 w-4 ${show_size === "large" ? "text-cyan-300" : "text-slate-500"}`,
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 155,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden sm:inline",
                                                children: "Size"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 159,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 139,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2 pb-3",
                                children: expandedPile && getPileCards(expandedPile).map((card, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        card: card,
                                        index: index,
                                        location: expandedPile === "playedCards" ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].PLAYED : __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"][expandedPile.toUpperCase()],
                                        size: show_size
                                    }, `${expandedPile}-${index}-${card.name}`, false, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 165,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                        lineNumber: 131,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/BottomBlock.tsx",
                    lineNumber: 130,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1.5 px-2 py-2 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3 md:px-3 md:py-2.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid w-full max-md:max-w-full max-md:grid-cols-2 max-md:gap-1.5 md:flex md:w-auto md:flex-wrap md:items-center md:gap-2",
                        children: PILES.map(({ id, label, Icon, idle, active })=>{
                            const isOpen = expandedPile === id;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleExpand(id),
                                className: `flex min-h-[2.5rem] items-center justify-between gap-1 rounded-xl border px-2 py-1.5 text-left text-xs font-medium transition-all duration-200 max-md:min-w-0 max-md:pr-1.5 md:gap-2 md:px-3 md:py-2 md:text-sm ${isOpen ? active : idle} `,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex min-w-0 items-center gap-1.5 md:gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                className: "h-3.5 w-3.5 shrink-0 opacity-90 md:h-4 md:w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 197,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "min-w-0 truncate max-md:max-w-[4.2rem] md:whitespace-nowrap",
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 198,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 196,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex shrink-0 items-center gap-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `min-w-[1.5rem] rounded-md px-1 py-0.5 text-center text-[10px] tabular-nums md:min-w-[1.75rem] md:px-1.5 md:text-xs ${isOpen ? "bg-black/25" : "bg-black/20"}`,
                                                children: getPileCount(id)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 201,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                className: `h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-200 md:h-4 md:w-4 ${isOpen ? "rotate-0" : "-rotate-180"}`
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                                lineNumber: 208,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 200,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, id, true, {
                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                lineNumber: 188,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex w-full min-w-0 max-md:max-w-full max-md:flex-nowrap max-md:items-center max-md:justify-between max-md:gap-1.5 max-md:overflow-x-auto max-md:pb-0.5 md:w-auto md:flex-wrap md:items-center md:gap-2 md:overflow-visible",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:mr-0.5 md:inline",
                                children: "Draw"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "shrink-0 text-[9px] font-bold uppercase tracking-wide text-slate-500 md:hidden",
                                children: "Dr"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                lineNumber: 221,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-9 items-center justify-center gap-0.5 rounded-xl border border-slate-800 bg-slate-900/60 p-0.5 transition-colors focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20",
                                role: "group",
                                "aria-label": "Cards to draw",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-label": "Draw fewer cards",
                                        disabled: drawAmount <= DRAW_MIN,
                                        className: "rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30",
                                        onClick: ()=>setDrawAmount((a)=>clampDrawAmount(a - 1)),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                            className: "h-4 w-4",
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                            lineNumber: 234,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 227,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "min-w-[2rem] text-center text-sm font-mono font-bold tabular-nums text-emerald-200",
                                        children: drawAmount
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 236,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "draw-amount",
                                        type: "number",
                                        value: drawAmount,
                                        onChange: (e)=>{
                                            const value = parseInt(e.target.value, 10);
                                            setDrawAmount(Number.isNaN(value) ? DRAW_MIN : clampDrawAmount(value));
                                        },
                                        className: "sr-only",
                                        min: DRAW_MIN,
                                        max: DRAW_MAX,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                        "aria-label": "Cards to draw (or use the arrows). Current value is shown in the group."
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 239,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-label": "Draw more cards",
                                        disabled: drawAmount >= DRAW_MAX,
                                        className: "rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30",
                                        onClick: ()=>setDrawAmount((a)=>clampDrawAmount(a + 1)),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                            className: "h-4 w-4",
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                            lineNumber: 261,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                        lineNumber: 254,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                lineNumber: 222,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleDraw,
                                className: "h-9 whitespace-nowrap rounded-lg border-2 border-emerald-500/60 bg-emerald-700/85 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-950/30 transition hover:bg-emerald-600 active:scale-[0.98]",
                                children: [
                                    "Draw ",
                                    drawAmount
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                lineNumber: 264,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleDrawOne,
                                className: "h-9 whitespace-nowrap rounded-lg border border-emerald-500/45 bg-emerald-950/50 px-3 text-sm font-semibold text-emerald-100 shadow-sm transition hover:bg-emerald-900/55 active:scale-[0.98]",
                                title: "Draw a single card",
                                children: "Draw 1"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                                lineNumber: 271,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/BottomBlock.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/BottomBlock.tsx",
                lineNumber: 183,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/BottomBlock.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/components/UI/ActionsBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActionsBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$big$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowBigDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-big-down.mjs [app-ssr] (ecmascript) <export default as ArrowBigDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$big$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowBigUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-big-up.mjs [app-ssr] (ecmascript) <export default as ArrowBigUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-down.mjs [app-ssr] (ecmascript) <export default as ChevronsDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-up.mjs [app-ssr] (ecmascript) <export default as ChevronsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.mjs [app-ssr] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.mjs [app-ssr] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.mjs [app-ssr] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$library$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Library$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/library.mjs [app-ssr] (ecmascript) <export default as Library>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.mjs [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$redo$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Redo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/redo-2.mjs [app-ssr] (ecmascript) <export default as Redo2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/undo-2.mjs [app-ssr] (ecmascript) <export default as Undo2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wand-sparkles.mjs [app-ssr] (ecmascript) <export default as Wand2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/GameContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CardDBModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/CardDBModal.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const SECT = "rounded-xl border border-slate-800/90 bg-slate-950/50 p-3 ring-1 ring-slate-500/5";
const SECT_LBL = "mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500";
const pill = "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40";
function ActionsBar() {
    const { gameState, playSelectedCards, moveSelectedCards, removeSelectedCards, spendEnergyOnSelected, deselectAllCards, upgradeSelected, downgradeSelected, duplicateSelected, setSelectedCostZero, setSelectedCustomCost, transformSelectedType, toggleChangedSelected, transformSelectedFromDatabase } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameManager"])();
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [transformDbOpen, setTransformDbOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedCount = gameState ? gameState.draw.filter((c)=>c.isSelected).length + gameState.discard.filter((c)=>c.isSelected).length + gameState.exhaust.filter((c)=>c.isSelected).length + gameState.hand.filter((c)=>c.isSelected).length + gameState.playedCards.filter((c)=>c.isSelected).length : 0;
    const totalEnergyCost = gameState ? [
        ...gameState.draw,
        ...gameState.discard,
        ...gameState.exhaust,
        ...gameState.hand,
        ...gameState.playedCards
    ].filter((c)=>c.isSelected).reduce((sum, card)=>{
        const cost = typeof card.cost === "object" ? card.isUpgraded && card.cost.upgraded !== undefined ? card.cost.upgraded : card.cost.base : card.cost;
        return sum + (typeof cost === "number" ? cost : 0);
    }, 0) : 0;
    const currentEnergy = gameState?.player.currentEnergy ?? 0;
    const hasEnoughEnergy = currentEnergy >= totalEnergyCost;
    if (selectedCount === 0) return null;
    if (collapsed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "shrink-0 border-t-2 border-amber-500/25 bg-gradient-to-b from-amber-950/25 to-slate-950/95 px-4 py-2 shadow-[0_-6px_30px_rgba(0,0,0,0.45)] backdrop-blur-md max-md:min-h-0 max-md:overflow-x-auto max-md:overscroll-x-contain max-md:touch-pan-x",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto flex w-full max-w-6xl min-w-0 flex-wrap items-center justify-between gap-2 max-md:flex-nowrap max-md:gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 shrink items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-950/40 text-amber-200",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                    className: "h-4 w-4",
                                    strokeWidth: 2
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                    lineNumber: 87,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 86,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-bold text-slate-100",
                                        children: [
                                            selectedCount,
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-slate-400",
                                                children: "selected"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 91,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 90,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-amber-200/60",
                                        children: [
                                            currentEnergy,
                                            " energy · ",
                                            totalEnergyCost,
                                            " to pay"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 93,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:thin] max-md:max-w-[55vw]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: playSelectedCards,
                                className: "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-950/50 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-900/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                        className: "h-3.5 w-3.5",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 104,
                                        columnNumber: 15
                                    }, this),
                                    "Play"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 99,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: deselectAllCards,
                                className: "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "h-3.5 w-3.5",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 112,
                                        columnNumber: 15
                                    }, this),
                                    "Clear"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 107,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setCollapsed(false),
                                className: "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-900/30 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-800/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUp$3e$__["ChevronsUp"], {
                                        className: "h-3.5 w-3.5",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 120,
                                        columnNumber: 15
                                    }, this),
                                    "All"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 115,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                        lineNumber: 98,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                lineNumber: 84,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/UI/ActionsBar.tsx",
            lineNumber: 83,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-auto relative z-20 min-h-0 max-md:max-h-[min(52dvh,28rem)] max-md:overflow-y-auto max-md:overscroll-y-contain max-md:touch-pan-y shrink-0 border-t-2 border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-950/98 to-slate-950 px-4 py-2.5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md max-md:pb-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto w-full min-h-0 max-w-6xl space-y-2.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-md:sticky max-md:top-0 z-[2] -mx-1 max-md:rounded-b-lg max-md:border-b max-md:border-amber-500/20 max-md:bg-gradient-to-b max-md:from-amber-950/90 max-md:via-amber-950/75 max-md:to-slate-950/95 max-md:px-1 max-md:pb-2 max-md:pt-0.5 max-md:backdrop-blur",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-start justify-between gap-2 sm:items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex min-w-0 items-center gap-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-200 shadow-sm shadow-amber-950/30",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                                className: "h-5 w-5",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 136,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                            lineNumber: 135,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-sm font-bold tracking-tight text-slate-100",
                                                    children: "Card actions"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                    lineNumber: 139,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-slate-500",
                                                    children: "Above the draw row · applies to the selected stack"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                    lineNumber: 140,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                            lineNumber: 138,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-xs font-bold tabular-nums text-emerald-300",
                                            children: [
                                                selectedCount,
                                                " sel"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                            lineNumber: 142,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `shrink-0 rounded-lg border px-2 py-1 text-xs font-bold tabular-nums ${hasEnoughEnergy ? "border-amber-500/30 bg-amber-950/35 text-amber-200" : "border-rose-500/35 bg-rose-950/30 text-rose-300"}`,
                                            children: [
                                                currentEnergy,
                                                " / ",
                                                totalEnergyCost,
                                                " e"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                            lineNumber: 145,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                    lineNumber: 134,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setCollapsed(true),
                                    className: "inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-900/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:bg-slate-800",
                                    title: "Collapse to a thin strip (more board space)",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsDown$3e$__["ChevronsDown"], {
                                            className: "h-3.5 w-3.5",
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                            lineNumber: 161,
                                            columnNumber: 13
                                        }, this),
                                        "Minimize"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                    lineNumber: 155,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/ActionsBar.tsx",
                            lineNumber: 133,
                            columnNumber: 9
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid min-h-0 grid-cols-1 gap-3 min-[500px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: SECT,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: SECT_LBL,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                className: "h-3 w-3 text-cyan-400",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 170,
                                                columnNumber: 15
                                            }, this),
                                            "Play"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 169,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: playSelectedCards,
                                                className: "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-cyan-500/50 bg-cyan-950/45 py-2.5 text-sm font-bold text-cyan-50 shadow-md shadow-cyan-950/30 transition hover:bg-cyan-900/50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                        className: "h-4 w-4",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 179,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Play cards"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 174,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: spendEnergyOnSelected,
                                                disabled: !hasEnoughEnergy,
                                                className: `flex w-full items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-bold transition ${hasEnoughEnergy ? "border-amber-500/55 bg-amber-950/40 text-amber-50 shadow-sm shadow-amber-950/25 hover:bg-amber-900/40" : "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                        className: "h-4 w-4",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 192,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Pay ",
                                                    totalEnergyCost,
                                                    " energy"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 182,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 173,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 168,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: SECT,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: SECT_LBL,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$library$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Library$3e$__["Library"], {
                                                className: "h-3 w-3 text-slate-400",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 200,
                                                columnNumber: 15
                                            }, this),
                                            "Move to"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>moveSelectedCards("hand"),
                                                className: `${pill} border-emerald-500/40 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900/50`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                                        className: "h-3.5 w-3.5 opacity-90",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 209,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Hand"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 204,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>moveSelectedCards("draw"),
                                                className: `${pill} border-blue-500/45 bg-blue-950/50 text-blue-100 hover:bg-blue-900/50`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$library$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Library$3e$__["Library"], {
                                                        className: "h-3.5 w-3.5 opacity-90",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 217,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Draw"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 212,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>moveSelectedCards("discard"),
                                                className: `${pill} border-rose-500/45 bg-rose-950/40 text-rose-100 hover:bg-rose-900/50`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                        className: "h-3.5 w-3.5 opacity-90",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Discard"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 220,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>moveSelectedCards("exhaust"),
                                                className: `${pill} border-amber-500/40 bg-amber-950/40 text-amber-100 hover:bg-amber-900/50`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                        className: "h-3.5 w-3.5 opacity-90",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 233,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Exhaust"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 228,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 203,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 198,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: SECT,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: SECT_LBL,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                className: "h-3 w-3 text-violet-400",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 241,
                                                columnNumber: 15
                                            }, this),
                                            "Modify"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 240,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: upgradeSelected,
                                                className: `${pill} border-emerald-500/45 bg-emerald-950/50 text-emerald-50 ring-1 ring-inset ring-emerald-500/20 shadow-sm shadow-emerald-950/25 hover:bg-emerald-900/55 hover:ring-emerald-400/25`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$big$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowBigUp$3e$__["ArrowBigUp"], {
                                                        className: "h-3.5 w-3.5 shrink-0 text-emerald-300",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 250,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "min-w-0",
                                                        children: "Upgrade"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 251,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 245,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: downgradeSelected,
                                                className: `${pill} border-rose-500/45 bg-rose-950/45 text-rose-50 ring-1 ring-inset ring-rose-500/20 shadow-sm shadow-rose-950/25 hover:bg-rose-900/50 hover:ring-rose-400/25`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$big$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowBigDown$3e$__["ArrowBigDown"], {
                                                        className: "h-3.5 w-3.5 shrink-0 text-rose-300",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 258,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "min-w-0",
                                                        children: "Downgrade"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 259,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 253,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: duplicateSelected,
                                                className: `${pill} border-cyan-500/40 bg-cyan-950/50 text-cyan-100 ring-1 ring-inset ring-cyan-500/15 shadow-sm shadow-cyan-950/20 hover:bg-cyan-900/50 hover:ring-cyan-400/20`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                        className: "h-3.5 w-3.5 shrink-0 text-cyan-300",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 266,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "min-w-0",
                                                        children: "Copy"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 267,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 261,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 244,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 239,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: SECT,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: SECT_LBL,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                className: "h-3 w-3 text-amber-400/80",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 274,
                                                columnNumber: 15
                                            }, this),
                                            "Cost & type"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 273,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 gap-2 min-[480px]:grid-cols-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: setSelectedCostZero,
                                                className: `${pill} border-amber-500/40 bg-amber-950/45 text-amber-100 hover:bg-amber-900/50`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-black",
                                                        children: "0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 283,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Cost"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 278,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: setSelectedCustomCost,
                                                className: `${pill} border-lime-500/40 bg-lime-950/35 text-lime-100 hover:bg-lime-900/30`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"], {
                                                        className: "h-3 w-3",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 291,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Custom"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 286,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: transformSelectedType,
                                                className: `${pill} border-fuchsia-500/40 bg-fuchsia-950/40 text-fuchsia-100 hover:bg-fuchsia-900/50`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$redo$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Redo2$3e$__["Redo2"], {
                                                        className: "h-3 w-3",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 299,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Type"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 294,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: toggleChangedSelected,
                                                className: `${pill} border-slate-500/50 bg-slate-800/80 text-slate-200 hover:bg-slate-700`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__["Undo2"], {
                                                        className: "h-3 w-3",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 307,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Changed"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 302,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setTransformDbOpen(true),
                                                className: `${pill} col-span-full border-teal-500/45 bg-teal-950/40 text-teal-100 hover:bg-teal-900/50`,
                                                title: "Replace selected with a card from the database (marked changed)",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                        className: "h-3.5 w-3.5",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Transform"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 310,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 277,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 272,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: SECT,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: SECT_LBL,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                className: "h-3 w-3 text-rose-400",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 324,
                                                columnNumber: 15
                                            }, this),
                                            "Manage"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 323,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: removeSelectedCards,
                                                className: "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-500/50 bg-rose-950/45 py-2.5 text-sm font-bold text-rose-50 shadow-sm shadow-rose-950/25 transition hover:bg-rose-900/50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                        className: "h-4 w-4",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 333,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Remove"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 328,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: deselectAllCards,
                                                className: "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                        className: "h-4 w-4",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                        lineNumber: 341,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Deselect all"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                                lineNumber: 336,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                        lineNumber: 327,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                                lineNumber: 322,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/ActionsBar.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CardDBModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: transformDbOpen,
                onClose: ()=>setTransformDbOpen(false),
                variant: "transform",
                onTransform: (cardId, isUpgraded)=>{
                    transformSelectedFromDatabase(cardId, isUpgraded);
                }
            }, void 0, false, {
                fileName: "[project]/app/components/UI/ActionsBar.tsx",
                lineNumber: 349,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/ActionsBar.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/components/UI/BuffDebuffItem.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BuffDebuffItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.mjs [app-ssr] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skull.mjs [app-ssr] (ecmascript) <export default as Skull>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-ssr] (ecmascript) <export default as Trash2>");
'use client';
;
;
function BuffDebuffItem({ bd, onReduce, onRemove }) {
    const isBuff = bd.type === 'buff';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        title: bd.description || `${bd.name} (${bd.type})`,
        className: `animate-sts-buff-in group relative flex items-stretch gap-0 overflow-hidden rounded-xl border text-xs shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-[1.03] ${isBuff ? 'border-emerald-500/35 bg-linear-to-r from-emerald-950/50 to-slate-900/80 text-emerald-100' : 'border-rose-500/35 bg-linear-to-r from-rose-950/45 to-slate-900/80 text-rose-100'} `,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `w-1 shrink-0 rounded-l-xl ${isBuff ? 'bg-linear-to-b from-emerald-400 to-emerald-700 animate-sts-buff-accent' : 'bg-linear-to-b from-rose-400 to-rose-800 animate-sts-buff-accent'}`,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-w-0 flex-1 items-center gap-2 py-2 pl-2.5 pr-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105 ${isBuff ? 'border-emerald-500/30 bg-emerald-900/40 text-emerald-300' : 'border-rose-500/30 bg-rose-900/40 text-rose-300'}`,
                        children: isBuff ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                            className: "h-4 w-4",
                            strokeWidth: 2
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                            lineNumber: 42,
                            columnNumber: 21
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__["Skull"], {
                            className: "h-4 w-4",
                            strokeWidth: 2
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                            lineNumber: 42,
                            columnNumber: 72
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "truncate font-semibold tracking-tight text-slate-50",
                                children: bd.name
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            bd.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-400 transition-colors group-hover:text-slate-300",
                                children: bd.description
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `shrink-0 rounded-lg border px-2 py-1 font-mono text-[11px] font-bold tabular-nums transition-transform duration-200 group-hover:scale-105 ${isBuff ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-200' : 'border-rose-500/40 bg-rose-950/60 text-rose-200'}`,
                        children: [
                            "×",
                            bd.stacks
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 flex-col justify-center gap-1 border-l border-slate-700/50 bg-slate-950/30 p-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onReduce,
                        className: "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600/60 bg-slate-800/80 text-slate-300 transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:bg-slate-700 hover:text-white active:scale-95",
                        "aria-label": `Reduce ${bd.name}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onRemove,
                        className: "flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/50 bg-red-950/50 text-red-300 transition-all duration-200 hover:scale-105 hover:border-red-500/50 hover:bg-red-900/60 hover:text-red-100 active:scale-95",
                        "aria-label": `Remove ${bd.name}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/BuffDebuffItem.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/components/UI/RightBlock.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RightBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/GameContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/gameHelpers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$BuffDebuffItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/BuffDebuffItem.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.mjs [app-ssr] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.mjs [app-ssr] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.mjs [app-ssr] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.mjs [app-ssr] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-ssr] (ecmascript) <export default as Zap>");
'use client';
;
;
;
;
;
;
const BUFF_COMPOSER_ZONE = 'animate-sts-panel-in rounded-2xl border-2 border-amber-500/25 bg-linear-to-b from-amber-950/40 via-slate-950 to-slate-950 p-4 shadow-[inset_0_1px_0_0_rgba(251,251,113,0.08)] shadow-lg shadow-amber-950/30 ring-1 ring-amber-400/10 transition-all duration-300';
const RELICS_ZONE = 'animate-sts-panel-in rounded-2xl border-2 border-lime-500/25 bg-linear-to-b from-lime-950/40 via-slate-950 to-slate-950 p-4 shadow-lg shadow-lime-950/30 ring-1 ring-lime-400/10 transition-all duration-300';
/** Visually separated “combatants” zone vs generic tool panels */ const PLAYER_ZONE = 'animate-sts-panel-in rounded-2xl border-2 border-blue-500/25 bg-linear-to-b from-blue-950/40 via-slate-950 to-slate-950 p-4 shadow-[inset_0_1px_0_0_rgba(113,113,251,0.08)] shadow-lg shadow-blue-950/30 ring-1 ring-blue-400/10 transition-all duration-300';
const ENEMIES_ZONE = 'animate-sts-panel-in rounded-2xl border-2 border-rose-500/25 bg-linear-to-b from-rose-950/40 via-slate-950 to-slate-950 p-4 shadow-[inset_0_1px_0_0_rgba(251,113,133,0.08)] shadow-lg shadow-rose-950/30 ring-1 ring-rose-400/10 transition-all duration-300';
const QUICK_DEBUFFS = [
    'Vulnerable',
    'Weak',
    'Poison',
    'Frail'
];
const QUICK_BUFFS = [
    'Strength',
    'Dexterity',
    'Focus',
    'Artifact'
];
const toneRing = {
    rose: 'border-rose-500/40 bg-rose-950/35 hover:bg-rose-900/45 text-rose-100',
    sky: 'border-sky-500/40 bg-sky-950/35 hover:bg-sky-900/45 text-sky-100',
    amber: 'border-amber-500/40 bg-amber-950/35 hover:bg-amber-900/45 text-amber-100',
    slate: 'border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-slate-200',
    emerald: 'border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-100',
    violet: 'border-violet-500/40 bg-violet-950/35 hover:bg-violet-900/45 text-violet-100'
};
function StepBtn({ children, onClick, tone = 'slate', className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        className: `min-w-[2.25rem] rounded-lg border px-2 py-1.5 text-center text-[11px] font-semibold tabular-nums transition-all duration-150 active:scale-95 hover:brightness-110 ${toneRing[tone]} ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/components/UI/RightBlock.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
function RightBlock() {
    const { gameState, turns, currentTurnIndex, modifyPlayerHp, modifyPlayerBlock, modifyPlayerEnergy, modifyEnemyHp, modifyEnemyBlock, addBuffDebuff, removeBuffDebuff, reduceBuffDebuff, toggleRelic } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameManager"])();
    const [buffName, setBuffName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [buffStacks, setBuffStacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [buffDescription, setBuffDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [buffTarget, setBuffTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('player');
    const [selectedEnemyIdx, setSelectedEnemyIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [playerHpAmt, setPlayerHpAmt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [playerBlkAmt, setPlayerBlkAmt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [playerNrgAmt, setPlayerNrgAmt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [enemyHpAmt, setEnemyHpAmt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [enemyBlkAmt, setEnemyBlkAmt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [buffAdvancedOpen, setBuffAdvancedOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const enemies = gameState?.enemies;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!enemies?.length) return;
        setSelectedEnemyIdx((i)=>Math.min(Math.max(0, i), enemies.length - 1));
    }, [
        enemies?.length
    ]);
    const activeRelics = gameState?.player.activeRelics ?? [];
    const currentTurn = Number(turns[currentTurnIndex]?.id ?? 1);
    const relicTooltips = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!gameState) return [];
        const turnEffects = gameState.player.relicEffects?.filter((effect)=>effect.enabled !== false && Number(effect.turn) === currentTurn) ?? [];
        return turnEffects.map((effect, i)=>({
                key: `relic-effect-${currentTurn}-${i}-${effect.effect}`,
                label: effect.effect,
                tooltip: effect.effect
            }));
    }, [
        currentTurn,
        gameState
    ]);
    const handleAddBuff = (type)=>{
        if (!buffName.trim()) return;
        if (buffTarget === 'player') {
            addBuffDebuff('player', 0, buffName.trim(), type, buffStacks, buffDescription.trim() || undefined);
        } else {
            addBuffDebuff('enemy', selectedEnemyIdx, buffName.trim(), type, buffStacks, buffDescription.trim() || undefined);
        }
        setBuffName('');
        setBuffStacks(1);
        setBuffDescription('');
    };
    const quickAdd = (name, type)=>{
        const stacks = Math.max(1, buffStacks);
        if (buffTarget === 'player') {
            addBuffDebuff('player', 0, name, type, stacks);
        } else {
            addBuffDebuff('enemy', selectedEnemyIdx, name, type, stacks);
        }
    };
    const enemyHpKey = (idx)=>enemyHpAmt[idx] ?? '';
    const enemyBlkKey = (idx)=>enemyBlkAmt[idx] ?? '';
    if (!gameState) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-slate-800 bg-linear-to-b from-slate-950 to-slate-900",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-sm font-semibold tracking-tight text-slate-100",
                            children: "Combat tools"
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                            lineNumber: 154,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-slate-500",
                            children: "Load combat data to use this panel."
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                            lineNumber: 155,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/UI/RightBlock.tsx",
                    lineNumber: 153,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-1 items-center justify-center p-6 text-sm text-slate-500",
                    children: "Loading…"
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/RightBlock.tsx",
                    lineNumber: 157,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/UI/RightBlock.tsx",
            lineNumber: 152,
            columnNumber: 7
        }, this);
    }
    const player = gameState.player;
    const hpPct = player.maxHp > 0 ? Math.min(100, Math.max(0, player.hp / player.maxHp * 100)) : 0;
    const energyCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPlayerMaxEnergy"])(player);
    const parseUnsigned = (s)=>Math.max(0, parseInt(s, 10) || 0);
    const parseSigned = (s)=>parseInt(s, 10) || 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-slate-800/90 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 [scrollbar-width:thin]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "sticky top-0 z-10 shrink-0 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 text-slate-100",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                            className: "h-4 w-4 shrink-0 text-cyan-500/90"
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                            lineNumber: 173,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "truncate text-sm font-semibold tracking-tight",
                                    children: "Combat tools"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/RightBlock.tsx",
                                    lineNumber: 175,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "truncate text-[11px] text-slate-500",
                                    children: [
                                        player.combatName,
                                        " · ",
                                        player.combatType,
                                        " · Fl ",
                                        player.floor
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/RightBlock.tsx",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                            lineNumber: 174,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/UI/RightBlock.tsx",
                    lineNumber: 172,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/UI/RightBlock.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 p-3",
                children: [
                    player.relics?.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: RELICS_ZONE,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        className: "h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 188,
                                        columnNumber: 15
                                    }, this),
                                    " Relics (tap to toggle bonus)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 187,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-1.5",
                                children: player.relics.map((r)=>{
                                    const on = activeRelics.includes(r.name);
                                    const lanternLockedOff = r.name === __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LANTERN_RELIC_NAME"] && on && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$gameHelpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canTurnOffLantern"])(player);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        title: lanternLockedOff ? `Need at least 1 energy to turn off. ${r.description ?? ''}`.trim() : r.description ?? undefined,
                                        disabled: lanternLockedOff,
                                        onClick: ()=>toggleRelic(r.name),
                                        className: `max-w-full truncate rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition ${on ? 'border-cyan-500/60 bg-cyan-950/50 text-cyan-100 shadow-sm shadow-cyan-950/30' : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'} ${lanternLockedOff ? 'cursor-not-allowed opacity-60' : ''}`,
                                        children: r.name
                                    }, r.name, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 196,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 190,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                        lineNumber: 186,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: PLAYER_ZONE,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        className: "h-3.5 w-3.5 text-slate-400"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 222,
                                        columnNumber: 13
                                    }, this),
                                    "You"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 221,
                                columnNumber: 11
                            }, this),
                            relicTooltips.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 rounded-xl border border-violet-500/35 bg-violet-950/30 px-2.5 py-2 ring-1 ring-violet-500/10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-300/90",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                className: "h-3 w-3 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 229,
                                                columnNumber: 17
                                            }, this),
                                            "This turn (relic effects)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 228,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mb-1.5 text-[9px] text-violet-200/55",
                                        children: [
                                            "Round ",
                                            currentTurn,
                                            " — encounter relic timing from combat JSON"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 232,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1.5",
                                        children: relicTooltips.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-w-full truncate rounded-md border border-violet-500/45 bg-violet-950/55 px-2 py-1 text-[10px] font-medium text-violet-100",
                                                title: entry.tooltip,
                                                children: entry.label
                                            }, entry.key, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 235,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 233,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 227,
                                columnNumber: 13
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-1 flex justify-between text-[10px] text-slate-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                        className: "h-3 w-3 text-rose-400/90"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 250,
                                                        columnNumber: 17
                                                    }, this),
                                                    " HP"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 249,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono tabular-nums text-rose-200",
                                                children: [
                                                    player.hp,
                                                    " / ",
                                                    player.maxHp
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 252,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 248,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2 h-1.5 overflow-hidden rounded-full bg-slate-800",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-500",
                                            style: {
                                                width: `${hpPct}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                                            lineNumber: 257,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 256,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500",
                                        children: "Quick"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 259,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2 flex flex-wrap gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "rose",
                                                onClick: ()=>modifyPlayerHp(-10),
                                                children: "-10"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 261,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "rose",
                                                onClick: ()=>modifyPlayerHp(-5),
                                                children: "-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 262,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "rose",
                                                onClick: ()=>modifyPlayerHp(-1),
                                                children: "-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 263,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "emerald",
                                                onClick: ()=>modifyPlayerHp(1),
                                                children: "+1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 264,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "emerald",
                                                onClick: ()=>modifyPlayerHp(5),
                                                children: "+5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 265,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "emerald",
                                                onClick: ()=>modifyPlayerHp(10),
                                                children: "+10"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 266,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                min: 0,
                                                value: playerHpAmt,
                                                onChange: (e)=>setPlayerHpAmt(e.target.value),
                                                onKeyDown: (e)=>{
                                                    if (e.key === 'Enter') {
                                                        const n = parseUnsigned(playerHpAmt);
                                                        if (n) {
                                                            modifyPlayerHp(-n);
                                                            setPlayerHpAmt('');
                                                        }
                                                    }
                                                },
                                                placeholder: "Amount…",
                                                className: "min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 269,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rounded-xl border border-rose-600/50 bg-rose-900/40 px-3 text-[11px] font-semibold text-rose-100 hover:bg-rose-900/60",
                                                onClick: ()=>{
                                                    const n = parseUnsigned(playerHpAmt);
                                                    if (n) {
                                                        modifyPlayerHp(-n);
                                                        setPlayerHpAmt('');
                                                    }
                                                },
                                                children: "Dmg"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 286,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rounded-xl border border-emerald-600/50 bg-emerald-900/35 px-3 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-900/55",
                                                onClick: ()=>{
                                                    const n = parseUnsigned(playerHpAmt);
                                                    if (n) {
                                                        modifyPlayerHp(n);
                                                        setPlayerHpAmt('');
                                                    }
                                                },
                                                children: "Heal"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 299,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 268,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 247,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 border-t border-slate-800/80 pt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2 flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1 text-[10px] text-slate-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                        className: "h-3 w-3 text-sky-400/90"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Block"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 317,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-xs font-semibold tabular-nums text-sky-200",
                                                        children: player.currentBlock ?? 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 321,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>modifyPlayerBlock(-(player.currentBlock ?? 0)),
                                                        className: "text-[10px] font-medium text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline",
                                                        children: "Clear"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 320,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 316,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2 flex flex-wrap gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "sky",
                                                onClick: ()=>modifyPlayerBlock(-10),
                                                children: "-10"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 332,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "sky",
                                                onClick: ()=>modifyPlayerBlock(-5),
                                                children: "-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 333,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "sky",
                                                onClick: ()=>modifyPlayerBlock(5),
                                                children: "+5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 334,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "sky",
                                                onClick: ()=>modifyPlayerBlock(10),
                                                children: "+10"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 335,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 331,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                value: playerBlkAmt,
                                                onChange: (e)=>setPlayerBlkAmt(e.target.value),
                                                onKeyDown: (e)=>{
                                                    if (e.key === 'Enter') {
                                                        const n = parseSigned(playerBlkAmt);
                                                        if (n) {
                                                            modifyPlayerBlock(n);
                                                            setPlayerBlkAmt('');
                                                        }
                                                    }
                                                },
                                                placeholder: "± block",
                                                className: "min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/25"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 338,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rounded-xl border border-sky-600/50 bg-sky-900/40 px-3 text-[11px] font-semibold text-sky-100 hover:bg-sky-900/60",
                                                onClick: ()=>{
                                                    const n = parseSigned(playerBlkAmt);
                                                    if (n) {
                                                        modifyPlayerBlock(n);
                                                        setPlayerBlkAmt('');
                                                    }
                                                },
                                                children: "Apply"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 354,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 337,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 315,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-slate-800/80 pt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2 flex justify-between text-[10px] text-slate-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                        className: "h-3 w-3 text-amber-400/90"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 373,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Energy"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 372,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono tabular-nums text-amber-200",
                                                children: [
                                                    player.currentEnergy ?? 0,
                                                    " / ",
                                                    energyCap
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 375,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 371,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2 flex flex-wrap gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "amber",
                                                onClick: ()=>modifyPlayerEnergy(-3),
                                                children: "-3"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 380,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "amber",
                                                onClick: ()=>modifyPlayerEnergy(-1),
                                                children: "-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 381,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "amber",
                                                onClick: ()=>modifyPlayerEnergy(1),
                                                children: "+1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 382,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                tone: "amber",
                                                onClick: ()=>modifyPlayerEnergy(3),
                                                children: "+3"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 383,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 379,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                value: playerNrgAmt,
                                                onChange: (e)=>setPlayerNrgAmt(e.target.value),
                                                onKeyDown: (e)=>{
                                                    if (e.key === 'Enter') {
                                                        const n = parseSigned(playerNrgAmt);
                                                        if (n) {
                                                            modifyPlayerEnergy(n);
                                                            setPlayerNrgAmt('');
                                                        }
                                                    }
                                                },
                                                placeholder: "± energy",
                                                className: "min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 386,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rounded-xl border border-amber-600/50 bg-amber-900/35 px-3 text-[11px] font-semibold text-amber-100 hover:bg-amber-900/55",
                                                onClick: ()=>{
                                                    const n = parseSigned(playerNrgAmt);
                                                    if (n) {
                                                        modifyPlayerEnergy(n);
                                                        setPlayerNrgAmt('');
                                                    }
                                                },
                                                children: "Apply"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 402,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 385,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 370,
                                columnNumber: 11
                            }, this),
                            (player.bonusBlock ?? 0) > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-3 text-[11px] text-emerald-400/90",
                                children: [
                                    "Bonus block: ",
                                    player.bonusBlock
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 419,
                                columnNumber: 13
                            }, this),
                            player.intangible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 rounded-lg border border-violet-500/40 bg-violet-950/40 px-2 py-1.5 text-[11px] text-violet-200",
                                children: "Intangible"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 422,
                                columnNumber: 13
                            }, this),
                            player.buffsDebuffs && player.buffsDebuffs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 space-y-1.5 border-t border-slate-800/80 pt-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-semibold uppercase tracking-wide text-slate-500",
                                        children: "Your buffs"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 427,
                                        columnNumber: 15
                                    }, this),
                                    player.buffsDebuffs.map((bd, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$BuffDebuffItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            bd: bd,
                                            onReduce: ()=>reduceBuffDebuff('player', 0, bd.name),
                                            onRemove: ()=>removeBuffDebuff('player', 0, bd.name)
                                        }, `${bd.name}-${idx}`, false, {
                                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                                            lineNumber: 429,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 426,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                        lineNumber: 220,
                        columnNumber: 9
                    }, this),
                    enemies && enemies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: ENEMIES_ZONE,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/15 pb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "flex items-center gap-2 text-xs font-semibold text-rose-100/95",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                                className: "h-3.5 w-3.5 text-rose-400"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 445,
                                                columnNumber: 17
                                            }, this),
                                            "Enemies",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rounded-md border border-rose-500/30 bg-rose-950/50 px-1.5 py-0.5 font-mono text-[10px] font-normal tabular-nums text-rose-200/90",
                                                children: enemies.length
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 447,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 444,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-rose-200/50",
                                        children: "Each row is one combatant"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 451,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 443,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-3",
                                children: enemies.map((enemy, idx)=>{
                                    const eHpPct = enemy.maxHp > 0 ? Math.min(100, Math.max(0, enemy.hp / enemy.maxHp * 100)) : 0;
                                    const isBuffFocus = buffTarget === 'enemy' && selectedEnemyIdx === idx;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `rounded-xl border bg-slate-900/55 p-3 transition-all duration-200 ${isBuffFocus ? 'border-rose-400/55 shadow-md shadow-rose-950/25 ring-1 ring-rose-400/25' : 'border-slate-700/80 hover:border-slate-600'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-2 flex items-start justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "truncate font-medium text-slate-50",
                                                                children: enemy.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                                lineNumber: 468,
                                                                columnNumber: 25
                                                            }, this),
                                                            isBuffFocus ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-0.5 text-[10px] font-medium text-rose-300/80",
                                                                children: "Status target"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                                lineNumber: 470,
                                                                columnNumber: 27
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 467,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "shrink-0 rounded-md border border-slate-600/80 bg-slate-950/70 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-slate-400",
                                                        children: [
                                                            "#",
                                                            idx + 1
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 473,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 466,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-1 flex justify-between text-[10px] text-slate-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "HP"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 478,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono tabular-nums text-rose-200",
                                                        children: [
                                                            enemy.hp,
                                                            " / ",
                                                            enemy.maxHp
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 479,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 477,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-2 h-1 overflow-hidden rounded-full bg-slate-800",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full bg-rose-600",
                                                    style: {
                                                        width: `${eHpPct}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                    lineNumber: 484,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 483,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-2 flex flex-wrap gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                        tone: "rose",
                                                        onClick: ()=>modifyEnemyHp(idx, -10),
                                                        children: "-10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 487,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                        tone: "rose",
                                                        onClick: ()=>modifyEnemyHp(idx, -5),
                                                        children: "-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 488,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                        tone: "emerald",
                                                        onClick: ()=>modifyEnemyHp(idx, 5),
                                                        children: "+5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 489,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                        tone: "emerald",
                                                        onClick: ()=>modifyEnemyHp(idx, 10),
                                                        children: "+10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 490,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 486,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4 flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: enemyHpKey(idx),
                                                        onChange: (e)=>setEnemyHpAmt((m)=>({
                                                                    ...m,
                                                                    [idx]: e.target.value
                                                                })),
                                                        placeholder: "Amount…",
                                                        className: "min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 493,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "rounded-lg bg-rose-700/80 px-2.5 text-[11px] font-semibold hover:bg-rose-600",
                                                        onClick: ()=>{
                                                            const n = parseUnsigned(enemyHpKey(idx));
                                                            if (n) {
                                                                modifyEnemyHp(idx, -n);
                                                                setEnemyHpAmt((m)=>({
                                                                        ...m,
                                                                        [idx]: ''
                                                                    }));
                                                            }
                                                        },
                                                        children: "Dmg"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 500,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "rounded-lg bg-emerald-800/80 px-2.5 text-[11px] font-semibold hover:bg-emerald-700",
                                                        onClick: ()=>{
                                                            const n = parseUnsigned(enemyHpKey(idx));
                                                            if (n) {
                                                                modifyEnemyHp(idx, n);
                                                                setEnemyHpAmt((m)=>({
                                                                        ...m,
                                                                        [idx]: ''
                                                                    }));
                                                            }
                                                        },
                                                        children: "Heal"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 513,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 492,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-2 flex items-center justify-between text-[10px] text-slate-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Block"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 529,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-mono text-sky-200",
                                                                children: enemy.currentBlock ?? 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                                lineNumber: 531,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>modifyEnemyBlock(idx, -(enemy.currentBlock ?? 0)),
                                                                className: "text-[10px] text-slate-500 hover:text-slate-300 hover:underline",
                                                                children: "Clear"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                                lineNumber: 532,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 530,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 528,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-2 flex flex-wrap gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                        tone: "sky",
                                                        onClick: ()=>modifyEnemyBlock(idx, -10),
                                                        children: "-10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 542,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                        tone: "sky",
                                                        onClick: ()=>modifyEnemyBlock(idx, 5),
                                                        children: "+5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 543,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepBtn, {
                                                        tone: "sky",
                                                        onClick: ()=>modifyEnemyBlock(idx, 10),
                                                        children: "+10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 544,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 541,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: enemyBlkKey(idx),
                                                        onChange: (e)=>setEnemyBlkAmt((m)=>({
                                                                    ...m,
                                                                    [idx]: e.target.value
                                                                })),
                                                        placeholder: "± block",
                                                        className: "min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 547,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "rounded-lg border border-sky-600/50 bg-sky-900/40 px-3 text-[11px] font-semibold text-sky-100",
                                                        onClick: ()=>{
                                                            const n = parseSigned(enemyBlkKey(idx));
                                                            if (n) {
                                                                modifyEnemyBlock(idx, n);
                                                                setEnemyBlkAmt((m)=>({
                                                                        ...m,
                                                                        [idx]: ''
                                                                    }));
                                                            }
                                                        },
                                                        children: "Apply"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 554,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 546,
                                                columnNumber: 21
                                            }, this),
                                            enemy.buffsDebuffs && enemy.buffsDebuffs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-3 space-y-1 border-t border-slate-800/80 pt-3",
                                                children: enemy.buffsDebuffs.map((bd, buffIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$BuffDebuffItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        bd: bd,
                                                        onReduce: ()=>reduceBuffDebuff('enemy', idx, bd.name),
                                                        onRemove: ()=>removeBuffDebuff('enemy', idx, bd.name)
                                                    }, `${bd.name}-${buffIdx}`, false, {
                                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                        lineNumber: 572,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                                lineNumber: 570,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, `${enemy.name}-${idx}`, true, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 459,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 454,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                        lineNumber: 442,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: BUFF_COMPOSER_ZONE,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                        className: "h-3.5 w-3.5 text-violet-400/90"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 591,
                                        columnNumber: 13
                                    }, this),
                                    "Status"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 590,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500",
                                children: "Target"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 595,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3 flex flex-wrap gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 p-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setBuffTarget('player'),
                                        className: `rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${buffTarget === 'player' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`,
                                        children: "You"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 597,
                                        columnNumber: 13
                                    }, this),
                                    enemies?.map((enemy, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>{
                                                setBuffTarget('enemy');
                                                setSelectedEnemyIdx(idx);
                                            },
                                            className: `max-w-[10rem] truncate rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${buffTarget === 'enemy' && selectedEnemyIdx === idx ? 'bg-rose-600/90 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`,
                                            children: enemy.name
                                        }, `bt-${idx}`, false, {
                                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                                            lineNumber: 608,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 596,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500",
                                children: [
                                    "Stacks ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-normal normal-case text-slate-600",
                                        children: "(quick + custom)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 626,
                                        columnNumber: 20
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 625,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3 flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 transition-colors duration-300 focus-within:border-violet-500/35 focus-within:ring-1 focus-within:ring-violet-500/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-label": "Fewer stacks",
                                        className: "rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-90",
                                        onClick: ()=>setBuffStacks((s)=>Math.max(1, s - 1)),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                                            lineNumber: 635,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 629,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "min-w-[2rem] text-center text-sm font-mono font-bold tabular-nums text-violet-200 transition-transform duration-200",
                                        children: buffStacks
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 637,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-label": "More stacks",
                                        className: "rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-90",
                                        onClick: ()=>setBuffStacks((s)=>s + 1),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                                            lineNumber: 646,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 640,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 628,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500",
                                children: "Quick add"
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 650,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3 flex flex-wrap gap-1.5",
                                children: [
                                    QUICK_DEBUFFS.map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>quickAdd(name, 'debuff'),
                                            className: "rounded-lg border border-amber-900/50 bg-amber-950/40 px-2.5 py-1.5 text-[10px] font-medium text-amber-200/90 shadow-sm transition-all duration-200 hover:bg-amber-950/65 hover:shadow-md active:scale-95",
                                            children: [
                                                "+ ",
                                                name
                                            ]
                                        }, name, true, {
                                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                                            lineNumber: 653,
                                            columnNumber: 15
                                        }, this)),
                                    QUICK_BUFFS.map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>quickAdd(name, 'buff'),
                                            className: "rounded-lg border border-emerald-900/50 bg-emerald-950/35 px-2.5 py-1.5 text-[10px] font-medium text-emerald-200/90 shadow-sm transition-all duration-200 hover:bg-emerald-950/55 hover:shadow-md active:scale-95",
                                            children: [
                                                "+ ",
                                                name
                                            ]
                                        }, name, true, {
                                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                                            lineNumber: 663,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 651,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: buffName,
                                    onChange: (e)=>setBuffName(e.target.value),
                                    placeholder: "Custom name…",
                                    className: "w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs outline-none transition-all duration-200 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/RightBlock.tsx",
                                    lineNumber: 675,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 674,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setBuffAdvancedOpen((o)=>!o),
                                className: "mb-2 flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/70 active:scale-[0.99]",
                                children: [
                                    "Notes (optional)",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `transition-transform duration-200 ${buffAdvancedOpen ? 'rotate-180' : ''}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                            className: "h-3 w-3"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/RightBlock.tsx",
                                            lineNumber: 691,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 690,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 684,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `grid transition-[grid-template-rows] duration-300 ease-out ${buffAdvancedOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-h-0 overflow-hidden",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: buffDescription,
                                        onChange: (e)=>setBuffDescription(e.target.value),
                                        placeholder: "Tooltip / description",
                                        className: "mb-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs transition-all duration-200 focus:border-violet-500/40"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 698,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/RightBlock.tsx",
                                    lineNumber: 697,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 694,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: !buffName.trim(),
                                        onClick: ()=>handleAddBuff('buff'),
                                        className: "flex-1 rounded-xl border border-emerald-600/50 bg-emerald-800/50 py-2 text-[11px] font-semibold text-emerald-100 transition-all duration-200 hover:bg-emerald-800/70 hover:shadow-lg hover:shadow-emerald-950/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
                                        children: "Add buff"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 709,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: !buffName.trim(),
                                        onClick: ()=>handleAddBuff('debuff'),
                                        className: "flex-1 rounded-xl border border-amber-600/50 bg-amber-900/45 py-2 text-[11px] font-semibold text-amber-100 transition-all duration-200 hover:bg-amber-900/65 hover:shadow-lg hover:shadow-amber-950/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
                                        children: "Add debuff"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                                        lineNumber: 717,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 708,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-[10px] text-slate-600",
                                children: "Quick chips use the stacks value above. Custom add uses the same stacks and needs a name."
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/RightBlock.tsx",
                                lineNumber: 726,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/RightBlock.tsx",
                        lineNumber: 589,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/RightBlock.tsx",
                lineNumber: 183,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/RightBlock.tsx",
        lineNumber: 170,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/components/layout/ResponsiveAppShell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ResponsiveAppShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-branch.mjs [app-ssr] (ecmascript) <export default as GitBranch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hand$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hand.mjs [app-ssr] (ecmascript) <export default as Hand>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.mjs [app-ssr] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.mjs [app-ssr] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$TopBarBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/TopBarBlock.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$TimelineBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/TimelineBlock.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$MainFieldBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/MainFieldBlock.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$BottomBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/BottomBlock.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$ActionsBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/ActionsBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$RightBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/RightBlock.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$NotificationProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/NotificationProvider.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
const MD_UP = "(min-width: 768px)";
function subscribeMdUp(onChange) {
    if ("TURBOPACK compile-time truthy", 1) return ()=>{};
    //TURBOPACK unreachable
    ;
    const mq = undefined;
}
function getMdUpSnapshot() {
    if ("TURBOPACK compile-time truthy", 1) return false;
    //TURBOPACK unreachable
    ;
}
const RAIL_INNER = "min-h-0 w-full min-w-0 max-w-md flex-1";
const RAIL_L = "sticky top-0 z-20 h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-hidden border-r-2 border-cyan-500/55 bg-linear-to-b from-gray-900 to-gray-950";
const RAIL_R = "sticky top-0 z-20 h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-hidden border-l-2 border-amber-600/70 bg-linear-to-b from-gray-900 to-gray-950";
function scrollToAnchor(id) {
    requestAnimationFrame(()=>{
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}
function ResponsiveAppShell() {
    const isMdUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribeMdUp, getMdUpSnapshot, ()=>false);
    const [panel, setPanel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("none");
    const sheetTitleId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    /** When desktop layout is active, sheets must not use `panel` (stale) state. */ const mobileSheet = isMdUp ? "none" : panel;
    const closePanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setPanel("none"), []);
    const openTimeline = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setPanel((p)=>p === "timeline" ? "none" : "timeline");
    }, []);
    const openTools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setPanel((p)=>p === "tools" ? "none" : "tools");
    }, []);
    const goBoard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setPanel("none");
        scrollToAnchor("sts-battle-focus");
    }, []);
    const goDeck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setPanel("none");
        scrollToAnchor("sts-deck-zone");
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (mobileSheet === "none") return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return ()=>{
            document.body.style.overflow = prev;
        };
    }, [
        mobileSheet
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (mobileSheet === "none") return;
        const onKey = (e)=>{
            if (e.key === "Escape") {
                e.preventDefault();
                closePanel();
            }
        };
        window.addEventListener("keydown", onKey);
        return ()=>window.removeEventListener("keydown", onKey);
    }, [
        mobileSheet,
        closePanel
    ]);
    const showLeftRail = isMdUp;
    const showRightRail = isMdUp;
    const showMobileBar = !isMdUp;
    const showTimelineSheet = mobileSheet === "timeline";
    const showToolsSheet = mobileSheet === "tools";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-950 text-gray-100 md:flex-row",
                children: [
                    showLeftRail ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: `${RAIL_L} flex w-[min(15rem,34vw)] shrink-0 sm:w-[min(16rem,32vw)] md:w-[min(17rem,30vw)] lg:w-[min(18rem,28vw)] xl:w-[min(19rem,26vw)] 2xl:w-80 2xl:max-w-[20rem]`,
                        "aria-label": "Turn timeline",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${RAIL_INNER} overflow-hidden`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$TimelineBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 105,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                            lineNumber: 104,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                        lineNumber: 100,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: showMobileBar ? "flex min-h-0 min-w-0 flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:ring-1 md:ring-cyan-500/[0.07] md:ring-inset" : "flex min-h-0 min-w-0 flex-1 flex-col md:ring-1 md:ring-cyan-500/[0.07] md:ring-inset",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                                className: "z-40 shrink-0 border-b border-slate-800/80 bg-slate-950/80 shadow-md shadow-black/30 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/70 max-md:shadow-md max-md:shadow-cyan-950/20 max-md:backdrop-blur-md",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$TopBarBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-3 sm:px-3 md:px-4 md:py-4 [scrollbar-gutter:stable]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$MainFieldBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex min-h-0 shrink-0 flex-col",
                                "data-bottom-deck-skip-outside": true,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$ActionsBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 126,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative z-30 shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$NotificationProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastStack"], {}, void 0, false, {
                                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                                lineNumber: 128,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$BottomBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                                lineNumber: 129,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 127,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this),
                    showRightRail ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: `${RAIL_R} flex w-[min(16rem,36vw)] shrink-0 sm:w-[min(17rem,34vw)] md:w-[min(18.5rem,32vw)] lg:w-[min(20rem,30vw)] xl:min-w-[20rem] 2xl:w-[22rem] 2xl:max-w-[24rem]`,
                        "aria-label": "Combat tools",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${RAIL_INNER} overflow-y-auto overflow-x-hidden`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$RightBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 140,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                            lineNumber: 139,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            showTimelineSheet || showToolsSheet ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] flex-col md:hidden",
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": sheetTitleId,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `animate-sts-mobile-sheet flex min-h-0 w-full flex-1 flex-col border-x border-t-2 bg-slate-900 shadow-[0_0_0_1px_rgba(0,0,0,0.3)] ${showTimelineSheet ? "border-cyan-500/50 shadow-[0_0_48px_-8px_rgba(34,211,238,0.25),inset_0_1px_0_0_rgba(34,211,238,0.2)]" : "border-amber-500/50 shadow-[0_0_48px_-8px_rgba(245,158,11,0.2),inset_0_1px_0_0_rgba(245,158,11,0.2)]"}`,
                    style: {
                        paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))",
                        paddingBottom: "env(safe-area-inset-bottom, 0px)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `shrink-0 border-b px-3 pb-2.5 pt-1 ${showTimelineSheet ? "border-cyan-600/40 bg-cyan-950/50" : "border-amber-600/40 bg-amber-950/40"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-1.5 flex justify-center",
                                    "aria-hidden": true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "h-1 w-10 rounded-full bg-white/20"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 170,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                    lineNumber: 169,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex min-w-0 flex-1 items-center gap-2",
                                            children: [
                                                showTimelineSheet ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-cyan-400/50 bg-cyan-950/70 text-cyan-300 shadow-lg shadow-cyan-950/40",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__["GitBranch"], {
                                                        className: "h-5 w-5",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                                        lineNumber: 176,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-amber-400/50 bg-amber-950/70 text-amber-300 shadow-lg shadow-amber-950/40",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                                        className: "h-5 w-5",
                                                        strokeWidth: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                                        lineNumber: 180,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                                    lineNumber: 179,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    id: sheetTitleId,
                                                    className: "min-w-0 truncate text-base font-semibold text-slate-50",
                                                    children: showTimelineSheet ? "Turn timeline" : "Combat tools"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                            lineNumber: 173,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: closePanel,
                                            className: "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-500/60 bg-slate-800 text-slate-100 shadow-md active:scale-95",
                                            "aria-label": "Close",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                className: "h-5 w-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                                lineNumber: 193,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                            lineNumber: 187,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                    lineNumber: 172,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                            lineNumber: 164,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-950/90 [scrollbar-width:thin]",
                            children: showTimelineSheet ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$TimelineBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 198,
                                columnNumber: 36
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$RightBlock$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 198,
                                columnNumber: 56
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                            lineNumber: 197,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                    lineNumber: 153,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this) : null,
            showMobileBar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "fixed bottom-0 left-0 right-0 z-40 border-t-2 border-cyan-500/35 bg-gradient-to-t from-slate-950 via-slate-900 to-cyan-950/40 shadow-[0_-6px_28px_rgba(34,211,238,0.12)] backdrop-blur-md md:shadow-none",
                style: {
                    paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))"
                },
                "aria-label": "Quick navigation",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "mx-auto flex max-w-lg items-stretch justify-between gap-0 px-1 pt-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "min-w-0 flex-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: openTimeline,
                                className: `flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors ${panel === "timeline" ? "bg-cyan-500/25 text-cyan-100 ring-1 ring-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]" : "text-cyan-100/60 active:bg-cyan-950/40"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__["GitBranch"], {
                                        className: "h-5 w-5 shrink-0",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 221,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: "Turns"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 222,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 212,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                            lineNumber: 211,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "min-w-0 flex-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: goBoard,
                                className: "flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold text-cyan-100/60 transition-colors active:bg-cyan-950/40",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
                                        className: "h-5 w-5 shrink-0",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 231,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: "Board"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 232,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 226,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                            lineNumber: 225,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "min-w-0 flex-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: goDeck,
                                className: "flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold text-cyan-100/60 transition-colors active:bg-cyan-950/40",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hand$3e$__["Hand"], {
                                        className: "h-5 w-5 shrink-0",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 241,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: "Deck"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 242,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 236,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                            lineNumber: 235,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "min-w-0 flex-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: openTools,
                                className: `flex w-full touch-manipulation flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors ${panel === "tools" ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]" : "text-amber-100/60 active:bg-amber-950/40"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                        className: "h-5 w-5 shrink-0",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 255,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: "Tools"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                        lineNumber: 256,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                                lineNumber: 246,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                            lineNumber: 245,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                    lineNumber: 210,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/layout/ResponsiveAppShell.tsx",
                lineNumber: 205,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=app_0mzit-s._.js.map