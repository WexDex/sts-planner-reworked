(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/card-design-gallery/galleryRarity.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "galleryRarityPillClass",
    ()=>galleryRarityPillClass,
    "stsStringToRarityBand",
    ()=>stsStringToRarityBand
]);
function stsStringToRarityBand(rarity) {
    const r = (rarity ?? "Common").toLowerCase();
    if (r === "uncommon") return "uncommon";
    if (r === "rare" || r === "special") return "rare";
    return "common";
}
function galleryRarityPillClass(band) {
    switch(band){
        case "uncommon":
            return "border-sky-500/45 bg-sky-600/28 text-sky-50";
        case "rare":
            return "border-amber-500/45 bg-amber-600/28 text-amber-50";
        default:
            return "border-slate-500/45 bg-slate-600/35 text-slate-100";
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/stsToGalleryRow.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "galleryRowFromStsCardId",
    ()=>galleryRowFromStsCardId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/gameCardFromSts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-client] (ecmascript)");
;
;
function galleryRowFromStsCardId(cardId, opts) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStsCardsRecord"])();
    const raw = db[cardId];
    if (!raw) return null;
    const card = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildGameCardFromStsRaw"])(cardId, raw, opts);
    const rarityStr = typeof raw.rarity === "string" ? raw.rarity : "—";
    return {
        id: `sts-${cardId}`,
        title: `${cardId} · ${rarityStr}`,
        card,
        size: "large"
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/galleryQuickTemplates.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GALLERY_QUICK_TEMPLATES",
    ()=>GALLERY_QUICK_TEMPLATES,
    "galleryRowsFromTemplate",
    ()=>galleryRowsFromTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsToGalleryRow.ts [app-client] (ecmascript)");
;
const GALLERY_QUICK_TEMPLATES = [
    {
        id: "by-character",
        title: "All characters",
        blurb: "Ironclad, Silent, Defect, Watcher, Colorless, Curse, Status",
        cardIds: [
            "Anger",
            "Acrobatics",
            "Zap",
            "Alpha",
            "Apotheosis",
            "Ascender's Bane",
            "Burn"
        ]
    },
    {
        id: "effect-kitchen-sink",
        title: "Heavy effects",
        blurb: "Conditional draw/energy, AoE + discard, orbs, draw+discard, exhaust",
        cardIds: [
            "Dropkick",
            "All-Out Attack",
            "Darkness",
            "Acrobatics",
            "Pummel",
            "Dark Embrace",
            "Adrenaline",
            "Dualcast"
        ]
    },
    {
        id: "diri",
        title: "DORO MONSTA CARDO",
        blurb: "",
        cardIds: [
            "Pommel Strike",
            "Acrobatics",
            "Evolve",
            "Dark Embrace",
            "Prepared",
            "Calculated Gamble",
            "Dagger Throw"
        ]
    },
    {
        id: "multihit",
        title: "Multi hit",
        blurb: "MULTIIII",
        cardIds: [
            "Dagger Spray",
            "Whirlwind",
            "Glass Knife",
            "Tantrum",
            "Skewer",
            "Ragnarok"
        ]
    }
];
function galleryRowsFromTemplate(template, opts) {
    const isUpgraded = opts?.isUpgraded ?? false;
    return template.cardIds.map((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryRowFromStsCardId"])(id, {
            isUpgraded
        })).filter((r)=>r != null);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GalleryQuickTemplateBar",
    ()=>GalleryQuickTemplateBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryQuickTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryQuickTemplates.ts [app-client] (ecmascript)");
"use client";
;
;
function GalleryQuickTemplateBar({ onPick, className = "", size = "default", showFooterHint = true }) {
    const btn = size === "compact" ? "rounded-md border border-slate-600/90 bg-slate-800/90 px-2 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700/90" : "rounded-lg border border-slate-600/80 bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[10px] font-bold uppercase tracking-wider text-slate-500",
                    children: "Quick templates"
                }, void 0, false, {
                    fileName: "[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryQuickTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GALLERY_QUICK_TEMPLATES"].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        title: t.blurb,
                        onClick: ()=>onPick(t),
                        className: btn,
                        children: t.title
                    }, t.id, false, {
                        fileName: "[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx",
                        lineNumber: 36,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            showFooterHint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] leading-snug text-slate-600",
                children: [
                    "Loads preset sets from STS_CARDS_DB. Use ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        className: "text-slate-500",
                        children: "Select cards…"
                    }, void 0, false, {
                        fileName: "[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx",
                        lineNumber: 49,
                        columnNumber: 52
                    }, this),
                    " ",
                    "to add, remove, or search the full list."
                ]
            }, void 0, true, {
                fileName: "[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c = GalleryQuickTemplateBar;
var _c;
__turbopack_context__.k.register(_c, "GalleryQuickTemplateBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/GalleryCardSelectModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GalleryCardSelectModal",
    ()=>GalleryCardSelectModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryRarity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryRarity.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryQuickTemplateBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function GalleryCardSelectModal({ open, onClose, onApply, previewUpgraded, onPreviewUpgradedChange, resetKey = 0 }) {
    _s();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [q, setQ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GalleryCardSelectModal.useEffect": ()=>{
            setMounted(true);
        }
    }["GalleryCardSelectModal.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GalleryCardSelectModal.useEffect": ()=>{
            if (!open) return;
            const t = {
                "GalleryCardSelectModal.useEffect.t": (e)=>{
                    if (e.key === "Escape") onClose();
                }
            }["GalleryCardSelectModal.useEffect.t"];
            window.addEventListener("keydown", t);
            return ({
                "GalleryCardSelectModal.useEffect": ()=>window.removeEventListener("keydown", t)
            })["GalleryCardSelectModal.useEffect"];
        }
    }["GalleryCardSelectModal.useEffect"], [
        open,
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GalleryCardSelectModal.useEffect": ()=>{
            if (resetKey === 0) return;
            setQ("");
            setSelected(new Set());
            onPreviewUpgradedChange(false);
        }
    }["GalleryCardSelectModal.useEffect"], [
        resetKey,
        onPreviewUpgradedChange
    ]);
    const ids = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GalleryCardSelectModal.useMemo[ids]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listStsCardIdsSorted"])()
    }["GalleryCardSelectModal.useMemo[ids]"], [
        resetKey
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GalleryCardSelectModal.useMemo[filtered]": ()=>{
            const s = q.trim().toLowerCase();
            if (!s) return ids;
            return ids.filter({
                "GalleryCardSelectModal.useMemo[filtered]": (id)=>id.toLowerCase().includes(s)
            }["GalleryCardSelectModal.useMemo[filtered]"]);
        }
    }["GalleryCardSelectModal.useMemo[filtered]"], [
        ids,
        q
    ]);
    if (!mounted || !open) return null;
    function toggle(id) {
        setSelected((prev)=>{
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }
    function clearSel() {
        setSelected(new Set());
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "gallery-card-modal-title",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "absolute inset-0 bg-black/70 backdrop-blur-[2px]",
                "aria-label": "Close",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "shrink-0 border-b border-slate-800 px-4 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: "gallery-card-modal-title",
                                className: "text-base font-bold text-white",
                                children: "Select cards"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-slate-500",
                                children: "Gallery only · any number of cards · STS_CARDS_DB"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-300",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: previewUpgraded,
                                        onChange: (e)=>onPreviewUpgradedChange(e.target.checked),
                                        className: "rounded border-slate-600"
                                    }, void 0, false, {
                                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                        lineNumber: 97,
                                        columnNumber: 13
                                    }, this),
                                    "Preview upgraded (same as header toggle)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "search",
                                        value: q,
                                        onChange: (e)=>setQ(e.target.value),
                                        placeholder: "Filter by name…",
                                        className: "min-w-0 w-full flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600",
                                        "aria-describedby": "gallery-card-search-count"
                                    }, void 0, false, {
                                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                        lineNumber: 106,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        id: "gallery-card-search-count",
                                        className: "shrink-0 text-xs tabular-nums text-slate-500 min-[400px]:text-right",
                                        children: [
                                            "Found ",
                                            filtered.length,
                                            " of ",
                                            ids.length
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                        lineNumber: 114,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            selected.size,
                                            " selected"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: clearSel,
                                        className: "rounded border border-slate-700 px-2 py-0.5 text-slate-400 hover:bg-slate-800",
                                        children: "Clear"
                                    }, void 0, false, {
                                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0 border-b border-slate-800 px-3 py-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryQuickTemplateBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GalleryQuickTemplateBar"], {
                            size: "compact",
                            showFooterHint: false,
                            onPick: (t)=>setSelected(new Set(t.cardIds)),
                            className: "!border-0 !bg-transparent !p-0"
                        }, void 0, false, {
                            fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                            lineNumber: 134,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-h-0 flex-1 overflow-y-auto px-2 py-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-0.5",
                                children: filtered.map((id)=>{
                                    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStsCardsRecord"])()[id];
                                    const rarity = raw && typeof raw.rarity === "string" ? raw.rarity : "—";
                                    const band = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryRarity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stsStringToRarityBand"])(raw && typeof raw.rarity === "string" ? raw.rarity : undefined);
                                    const isOn = selected.has(id);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>toggle(id),
                                            className: `flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${isOn ? "bg-amber-500/20 text-amber-50 ring-1 ring-amber-500/40" : "text-slate-200 hover:bg-slate-800/80"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${isOn ? "border-amber-400 bg-amber-500/30 text-amber-100" : "border-slate-600 bg-slate-950 text-slate-600"}`,
                                                    children: isOn ? "✓" : ""
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                                    lineNumber: 163,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "min-w-0 flex-1 truncate font-medium",
                                                    children: id
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                                    lineNumber: 172,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryRarity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryRarityPillClass"])(band)}`,
                                                    children: rarity
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                                    lineNumber: 173,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                            lineNumber: 154,
                                            columnNumber: 19
                                        }, this)
                                    }, id, false, {
                                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                        lineNumber: 153,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this),
                            filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "py-8 text-center text-sm text-slate-500",
                                children: "No matches."
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        className: "shrink-0 flex gap-2 border-t border-slate-800 px-4 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onClose,
                                className: "flex-1 rounded-lg border border-slate-600 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    onApply(Array.from(selected));
                                    setSelected(new Set());
                                    setQ("");
                                },
                                disabled: selected.size === 0,
                                className: "flex-1 rounded-lg bg-amber-500/90 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-40",
                                children: [
                                    "Show in grid (",
                                    selected.size,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_s(GalleryCardSelectModal, "PdS5dPiXOF4xfCqLoClskPMCHZc=");
_c = GalleryCardSelectModal;
var _c;
__turbopack_context__.k.register(_c, "GalleryCardSelectModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/utils/descriptionPlaceholders.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
].sort(_c = (a, b)=>b.token.length - a.token.length);
_c1 = DESCRIPTION_PLACEHOLDER_RULES;
const DESCRIPTION_PLACEHOLDER_TOKENS = DESCRIPTION_PLACEHOLDER_RULES.map(_c2 = (r)=>r.token);
_c3 = DESCRIPTION_PLACEHOLDER_TOKENS;
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
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "DESCRIPTION_PLACEHOLDER_RULES$[...PLACEHOLDER_RULES_UNSORTED].sort");
__turbopack_context__.k.register(_c1, "DESCRIPTION_PLACEHOLDER_RULES");
__turbopack_context__.k.register(_c2, "DESCRIPTION_PLACEHOLDER_TOKENS$DESCRIPTION_PLACEHOLDER_RULES.map");
__turbopack_context__.k.register(_c3, "DESCRIPTION_PLACEHOLDER_TOKENS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/utils/utils.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatBlockStatTitle",
    ()=>formatBlockStatTitle,
    "formatDamageStatTitle",
    ()=>formatDamageStatTitle,
    "getBlockStats",
    ()=>getBlockStats,
    "getDamageStats",
    ()=>getDamageStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$descriptionPlaceholders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/descriptionPlaceholders.ts [app-client] (ecmascript)");
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
function formatDamageStatTitle(baseDamage, cardType) {
    if (baseDamage === undefined) return undefined;
    if (cardType !== "Attack") return `DMG ${baseDamage}`;
    const s = getDamageStats(baseDamage);
    if (!s) return `DMG ${baseDamage}`;
    return `DMG ${s.dmg} · WEAK ${s.weak} ↓ · VULN ${s.vulnerable} ↑ · BOTH ${s.both}`;
}
function formatBlockStatTitle(baseBlock, cardType) {
    if (baseBlock === undefined) return undefined;
    if (cardType === "Attack" || cardType === "Skill") {
        const s = getBlockStats(baseBlock);
        if (!s) return String(baseBlock);
        return `BLOCK ${s.block} · FRAIL ${s.frail}`;
    }
    return String(baseBlock);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/UI/cardVisualVariants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/galleryCharacterCardStyles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGalleryCharacterChromeStyle",
    ()=>getGalleryCharacterChromeStyle,
    "resolveGameCardChromeStyle",
    ()=>resolveGameCardChromeStyle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/types.ts [app-client] (ecmascript)");
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cardTypeStyles"][cardType];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/UI/Card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>STSCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/effectDisplay.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/utils/utils.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$descriptionPlaceholders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/descriptionPlaceholders.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$LegendHighlightContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/LegendHighlightContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardVisualVariants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/cardVisualVariants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryCharacterCardStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryCharacterCardStyles.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
function usesEnergyScalingDamageMultihit(card) {
    const mh = card.multiHit;
    return mh != null && typeof mh === "object" && !Array.isArray(mh) && mh.multiHitEnergyScaling === true;
}
function cardUsesXCostOrb(card) {
    const v = card.xCost;
    if (v === undefined || v === null || v === false) return false;
    if (typeof v === "number" && v === 0) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
}
function renderLeadingGlyphSegments(segments, iconCls) {
    return segments.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
            children: [
                s.Icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(s.Icon, {
                    className: `${iconCls} shrink-0 ${s.iconClass ?? ""}`,
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/Card.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this) : null,
                s.text != null && s.text !== "" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: s.textClass ?? "",
                    children: s.text
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/Card.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this) : null
            ]
        }, i, true, {
            fileName: "[project]/app/components/UI/Card.tsx",
            lineNumber: 81,
            columnNumber: 5
        }, this));
}
/** Tier-resolved damage number only (multihit count is shown separately after the icon). */ function attackDamageStatDisplay(card) {
    const n = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryTierNumber"])(card, card.damage);
    if (n != null) {
        return String(n);
    }
    const raw = card.damage;
    if (typeof raw === "number" && !Number.isNaN(raw)) return String(raw);
    return undefined;
}
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
/** Block + optional frail tier: dark clustered chip (aligned with gallery glyph fallback shell). */ const BLOCK_FRAIL_CLUSTER_CLASS = "inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-white/15 bg-black/20 px-1 py-0.5 shadow-sm";
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            title: g.label,
            className: row,
            children: g.segments.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                    children: [
                        s.Icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(s.Icon, {
                            className: `${iconCls} shrink-0 ${s.iconClass ?? ""}`,
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 181,
                            columnNumber: 15
                        }, this) : null,
                        s.text != null && s.text !== "" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: s.textClass ?? "",
                            children: s.text
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 187,
                            columnNumber: 15
                        }, this) : null
                    ]
                }, i, true, {
                    fileName: "[project]/app/components/UI/Card.tsx",
                    lineNumber: 179,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/app/components/UI/Card.tsx",
            lineNumber: 177,
            columnNumber: 7
        }, this);
    }
    if (g.Icon) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            title: g.label,
            className: [
                "inline-flex",
                "items-center",
                "gap-0.5",
                shell,
                g.iconClass ?? "",
                textBaseCls
            ].filter(Boolean).join(" "),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(g.Icon, {
                className: `${iconCls} shrink-0`,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 203,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/UI/Card.tsx",
            lineNumber: 197,
            columnNumber: 7
        }, this);
    }
    return null;
}
function STSCard({ card, index, location, size = "large", interactive = true, legendHover = true, variant = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardVisualVariants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CARD_VISUAL_VARIANT"], galleryEffectGlyphs, gallerySuppressStats, galleryChromeStyle }) {
    _s();
    const { toggleCardSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameManager"])();
    const { setHoveredLegendCard } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$LegendHighlightContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLegendHighlight"])();
    const inferredGallery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "STSCard.useMemo[inferredGallery]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inferGalleryCardEffects"])(card)
    }["STSCard.useMemo[inferredGallery]"], [
        card
    ]);
    const mergedEffectGlyphs = galleryEffectGlyphs ?? (inferredGallery.glyphs.length > 0 ? inferredGallery.glyphs : undefined);
    const mergedSuppressStats = gallerySuppressStats ?? (Object.keys(inferredGallery.suppressStats).length > 0 ? inferredGallery.suppressStats : undefined);
    const styles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryCharacterCardStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveGameCardChromeStyle"])(card, galleryChromeStyle);
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
    function getFullBlock() {
        if (card.block === undefined) return undefined;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getBlockStats"])(getValue("block"));
    }
    /** Hide cost orb for curse / status / STS `unplayable` (Necronomicurse, etc.). */ const hideCostOrb = card.type === "Curse" || card.type === "Status" || card.unplayable === true;
    const chrome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardVisualVariants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCardVariantChrome"])({
        variant,
        typeStyles: styles,
        interactive,
        isSelected: !!card.isSelected
    });
    const rawGalleryGlyphs = mergedEffectGlyphs ?? [];
    const prefixDamageGlyphs = stat ? rawGalleryGlyphs.filter((g)=>g.prefixDamageRow) : [];
    const prefixDamageGlyphsFiltered = prefixDamageGlyphs.filter((g)=>!(g.id === "multi-hit" && usesEnergyScalingDamageMultihit(card) && cardUsesXCostOrb(card)));
    const suffixGalleryGlyphs = stat ? rawGalleryGlyphs.filter((g)=>!g.prefixDamageRow) : rawGalleryGlyphs;
    const statStripLeadingAndRest = stat == null ? {
        keywordLeading: [],
        rest: []
    } : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryStatStripKeywordLeadingAndRest"])(suffixGalleryGlyphs);
    // #region agent log
    if (stat && card.name === "Boot Sequence") {
        fetch("http://127.0.0.1:7283/ingest/08b9d505-d660-4eb9-b23f-47e9eb90cb11", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "2826d0"
            },
            body: JSON.stringify({
                sessionId: "2826d0",
                runId: "post-fix",
                hypothesisId: "A",
                location: "Card.tsx:statStripPartition",
                message: "keywordLeading before stats; rest after",
                data: {
                    keywordLeadingIds: statStripLeadingAndRest.keywordLeading.map((g)=>g.id),
                    restIds: statStripLeadingAndRest.rest.map((g)=>g.id),
                    hasBlockStatJsxAfterKeywords: card.block !== undefined,
                    statSize: size
                },
                timestamp: Date.now()
            })
        }).catch(()=>{});
    }
    // #endregion
    const damageStatLabel = attackDamageStatDisplay(card);
    const damageFormulaBase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryTierNumber"])(card, card.damage);
    const attackDamageBreakdown = card.type === "Attack" && typeof damageFormulaBase === "number" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDamageStats"])(damageFormulaBase) : null;
    const damageStatTooltip = (()=>{
        const formula = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatDamageStatTitle"])(typeof damageFormulaBase === "number" ? damageFormulaBase : undefined, card.type);
        if (damageStatLabel && formula) return `${damageStatLabel} — ${formula}`;
        if (formula) return formula;
        return damageStatLabel ? `Damage ${damageStatLabel}` : undefined;
    })();
    const multihitHitLabel = stat ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["damageMultihitInlineHitLabel"])(card) : null;
    const multihitLeadSegs = multihitHitLabel != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["multihitDamageRowLeadingSegments"])(card) : [];
    const showDamageStatBlock = card.damage !== undefined && !mergedSuppressStats?.damage;
    const showDamageRow = showDamageStatBlock || prefixDamageGlyphsFiltered.length > 0;
    const unifiedDamageAoE = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryDamageRowIsAoE"])(card) && showDamageRow;
    const damageAoEGroupClass = unifiedDamageAoE ? "inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-rose-400/25 bg-rose-950/45 px-1.5 py-1 shadow-sm" : "flex flex-wrap items-center justify-center gap-1";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: chrome.topLine
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 408,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: chrome.innerRim
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 410,
                columnNumber: 7
            }, this),
            !hideCostOrb && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute z-10 flex items-center justify-center rounded-full border-2 border-slate-950 ${sz.costOrb} ${styles.costBg} ${styles.costGlow} shadow-lg ${chrome.costOrbExtra}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `${sz.costText} text-white drop-shadow-md`,
                    children: cardUsesXCostOrb(card) ? "X" : getValue("cost")
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/Card.tsx",
                    lineNumber: 416,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 413,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative flex h-full flex-col ${sz.bodyPad}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${styles.nameBg} ${sz.nameBand} border ${styles.accentBorder} backdrop-blur-sm transition-all duration-300 hover:brightness-125 ${chrome.nameBandExtra}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${sz.name} flex flex-col items-center justify-center text-center text-white`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: card.isUpgraded ? "text-emerald-300 animate-pulse" : "",
                                            children: card.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/Card.tsx",
                                            lineNumber: 430,
                                            columnNumber: 15
                                        }, this),
                                        card.isUpgraded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `${sz.upgradedBadge} ml-0.5 text-emerald-400`,
                                            children: "+"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/Card.tsx",
                                            lineNumber: 438,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 429,
                                    columnNumber: 13
                                }, this),
                                card.isChanged && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${sz.changedPill} inline-block rounded-full bg-amber-400/25 text-amber-200 animate-bounce-pop`,
                                    children: "CHANGED"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 444,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 426,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 423,
                        columnNumber: 9
                    }, this),
                    !stat && rawGalleryGlyphs.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-1 flex-col items-center justify-center gap-0.5 py-0.5",
                        "aria-label": "Extra effects",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center justify-center gap-1",
                            children: rawGalleryGlyphs.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: renderGalleryGlyphCluster(g, SIZE_STYLES.small.galleryIcon, "text-[10px]")
                                }, g.id, false, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 460,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 458,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 454,
                        columnNumber: 11
                    }, this) : null,
                    stat && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex flex-1 flex-wrap items-center justify-center content-center gap-x-2 gap-y-1 ${stat.midGap}`,
                        "aria-label": "Card stats",
                        children: [
                            statStripLeadingAndRest.keywordLeading.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: renderGalleryGlyphCluster(g, stat.galleryIcon, stat.galleryText)
                                }, g.id, false, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 474,
                                    columnNumber: 15
                                }, this)),
                            showDamageRow ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: damageAoEGroupClass,
                                children: [
                                    prefixDamageGlyphsFiltered.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                            children: renderGalleryGlyphCluster(g, stat.galleryIcon, stat.galleryText, unifiedDamageAoE ? {
                                                stripClusterShell: true
                                            } : undefined)
                                        }, g.id, false, {
                                            fileName: "[project]/app/components/UI/Card.tsx",
                                            lineNumber: 485,
                                            columnNumber: 19
                                        }, this)),
                                    showDamageStatBlock ? multihitHitLabel != null ? attackDamageBreakdown ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryDamageClusterShellClass"]} inline-flex max-w-full flex-row items-center gap-x-0.5 ${stat.statMain}`,
                                        title: damageStatTooltip,
                                        children: [
                                            renderLeadingGlyphSegments(multihitLeadSegs, stat.galleryIcon),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `inline-flex items-center gap-0.5 text-lg ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").color}`,
                                                children: [
                                                    /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").icon, {
                                                        className: `${stat.statIcon} inline shrink-0`
                                                    }),
                                                    damageStatLabel ?? "?"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 502,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex flex-col items-center justify-center leading-none text-sm font-semibold tabular-nums tracking-tight",
                                                title: "Weak (top) · Vulnerable (bottom)",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("weak").color,
                                                        children: attackDamageBreakdown.weak
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/Card.tsx",
                                                        lineNumber: 514,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("vulnerable").color,
                                                        children: attackDamageBreakdown.vulnerable
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/Card.tsx",
                                                        lineNumber: 517,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 510,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-slate-200/95 tabular-nums text-lg",
                                                title: "Weak + Vulnerable",
                                                children: attackDamageBreakdown.both
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 521,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MULTIHIT_INLINE_TIMES_CLASS"],
                                                children: "×"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 527,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MULTIHIT_INLINE_COUNT_CLASS"],
                                                children: multihitHitLabel
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 528,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 497,
                                        columnNumber: 23
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryDamageClusterShellClass"]} inline-flex max-w-full flex-row items-center gap-x-0.5 ${stat.statMain}`,
                                        title: damageStatTooltip,
                                        children: [
                                            renderLeadingGlyphSegments(multihitLeadSegs, stat.galleryIcon),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `inline-flex items-center gap-0.5 text-lg ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").color}`,
                                                children: [
                                                    /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").icon, {
                                                        className: `${stat.statIcon} inline shrink-0`
                                                    }),
                                                    damageStatLabel ?? "?"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 536,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MULTIHIT_INLINE_TIMES_CLASS"],
                                                children: "×"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 544,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MULTIHIT_INLINE_COUNT_CLASS"],
                                                children: multihitHitLabel
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 545,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 531,
                                        columnNumber: 23
                                    }, this) : attackDamageBreakdown ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryDamageClusterShellClass"]} inline-flex max-w-full flex-row items-center gap-x-0.5 ${stat.statMain}`,
                                        title: damageStatTooltip,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `inline-flex items-center gap-0.5 text-lg ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").color}`,
                                                children: [
                                                    /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").icon, {
                                                        className: `${stat.statIcon} inline shrink-0`
                                                    }),
                                                    damageStatLabel ?? "?"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 553,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex flex-col items-center justify-center leading-none text-sm font-semibold tabular-nums tracking-tight",
                                                title: "Weak (top) · Vulnerable (bottom)",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("weak").color,
                                                        children: attackDamageBreakdown.weak
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/Card.tsx",
                                                        lineNumber: 565,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("vulnerable").color,
                                                        children: attackDamageBreakdown.vulnerable
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/UI/Card.tsx",
                                                        lineNumber: 568,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 561,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-slate-200/95 tabular-nums text-lg",
                                                title: "Weak + Vulnerable",
                                                children: attackDamageBreakdown.both
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/UI/Card.tsx",
                                                lineNumber: 572,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 549,
                                        columnNumber: 21
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        title: damageStatTooltip,
                                        className: `${stat.statMain} inline-flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").color}`,
                                        children: [
                                            /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage").icon, {
                                                className: `${stat.statIcon} inline`
                                            }),
                                            damageStatLabel ?? "?"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 580,
                                        columnNumber: 21
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 483,
                                columnNumber: 15
                            }, this) : null,
                            card.block !== undefined && !mergedSuppressStats?.block && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: BLOCK_FRAIL_CLUSTER_CLASS,
                                title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatBlockStatTitle"])(getValue("block"), card.type),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block").color}`,
                                        children: [
                                            /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block").icon, {
                                                className: `${stat.statIcon} inline`
                                            }),
                                            getFullBlock()?.block
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 598,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statSide} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("frail").color}`,
                                        children: getFullBlock()?.frail
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 606,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 594,
                                columnNumber: 15
                            }, this),
                            card.blockOnExhaust !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: BLOCK_FRAIL_CLUSTER_CLASS,
                                title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatBlockStatTitle"])(getValue("blockOnExhaust"), card.type),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block").color}`,
                                        children: [
                                            /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block").icon, {
                                                className: `${stat.statIcon} inline`
                                            }),
                                            getValue("blockOnExhaust")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 618,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statSide} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("frail").color}`,
                                        children: getFullBlock()?.frail
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 626,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 614,
                                columnNumber: 15
                            }, this),
                            card.draw !== undefined && !mergedSuppressStats?.draw && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex flex-wrap items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").color}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("draw")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 635,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 634,
                                columnNumber: 15
                            }, this),
                            card.takeDamage !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex flex-wrap items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${styles.statColor}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("takedamage").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("takeDamage")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 647,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 646,
                                columnNumber: 15
                            }, this),
                            getValue("hpcost") !== undefined && !mergedSuppressStats?.hpcost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex flex-wrap items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("hpcost").color}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("hpcost").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("hpcost")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 659,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 658,
                                columnNumber: 15
                            }, this),
                            (card.energyGain != null || card.gainEnergy != null) && !mergedSuppressStats?.energyGain && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex flex-wrap items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${styles.statColor}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("energygain").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("energyGain")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 673,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 672,
                                columnNumber: 15
                            }, this),
                            card.heal != null && !mergedSuppressStats?.heal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex flex-wrap items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("heal").color}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("heal").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("heal")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 685,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 684,
                                columnNumber: 15
                            }, this),
                            card.focus != null && !mergedSuppressStats?.focus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex flex-wrap items-center gap-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${stat.statMain} flex items-center gap-0.5 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("focus").color}`,
                                    children: [
                                        /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])("focus").icon, {
                                            className: `${stat.statIcon} inline`
                                        }),
                                        getValue("focus")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 697,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 696,
                                columnNumber: 15
                            }, this),
                            statStripLeadingAndRest.rest.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: renderGalleryGlyphCluster(g, stat.galleryIcon, stat.galleryText)
                                }, g.id, false, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 708,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 469,
                        columnNumber: 11
                    }, this),
                    stat && card.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${styles.nameBg} ${stat.descBox} border ${styles.accentBorder} text-center text-slate-200/95 backdrop-blur-sm ${chrome.descBoxExtra}`,
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$descriptionPlaceholders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFormattedDescription"])(card.description, card)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 720,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${sz.typeLabel} ${styles.typeColor} mt-auto text-center opacity-80 ${chrome.typeLabelExtra}`,
                        children: card.type
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 727,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 422,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: chrome.bottomLine
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 734,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/Card.tsx",
        lineNumber: 382,
        columnNumber: 5
    }, this);
}
_s(STSCard, "QGPG4XRWLPVKyt/U1C2Qolczkig=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameManager"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$LegendHighlightContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLegendHighlight"]
    ];
});
_c = STSCard;
var _c;
__turbopack_context__.k.register(_c, "STSCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/GalleryCardPreview.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GalleryCardPreview",
    ()=>GalleryCardPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryCharacterCardStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryCharacterCardStyles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function GalleryCardPreview({ row, variant, displaySize }) {
    const { glyphs, suppressStats } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inferGalleryCardEffects"])(row.card);
    const hasSuppress = Object.keys(suppressStats).length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            card: row.card,
            index: 0,
            location: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCATION"].HAND,
            size: displaySize,
            interactive: false,
            legendHover: false,
            variant: variant,
            galleryChromeStyle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryCharacterCardStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGalleryCharacterChromeStyle"])(row.card),
            galleryEffectGlyphs: glyphs.length > 0 ? glyphs : undefined,
            gallerySuppressStats: hasSuppress ? suppressStats : undefined
        }, void 0, false, {
            fileName: "[project]/app/card-design-gallery/GalleryCardPreview.tsx",
            lineNumber: 25,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/card-design-gallery/GalleryCardPreview.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = GalleryCardPreview;
var _c;
__turbopack_context__.k.register(_c, "GalleryCardPreview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GalleryIconCatalogPanel",
    ()=>GalleryIconCatalogPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/effectDisplay.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
/** Extra legend lines for derived keys (shortLabel stays the title). */ const DERIVED_GLYPH_NOTES = {
    CONDITIONAL_MARKER: "Shown when an effect is gated (e.g. damage / draw / block / discard / energyGain conditioned in JSON).",
    AOE_ICON: "AoE damage marker: Attack + damage + “all enemies” in description. Bundled with the damage stat in one rose-tinted group.",
    AOE_DAMAGE: "Optional multi-hit cluster icon (legacy skewer-style); not the main lightning damage icon.",
    RANDOM_ICON: "Random targeting (e.g. discard at random). Pairs with discard icon in the same pill.",
    EXHAUST_SELF: "Card exhausts on play when selfExhaustOnPlay is true.",
    ANY_ORB: "Generic orb when the interaction does not fix a color.",
    SAME_ORB_AS_EVOKED: "Matches the orb type from the previous evoke."
};
function GalleryIconCatalogPanel({ className = "" }) {
    _s();
    const stsEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GalleryIconCatalogPanel.useMemo[stsEntries]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readStsIconCatalog"])()
    }["GalleryIconCatalogPanel.useMemo[stsEntries]"], []);
    const extraDerivedKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GalleryIconCatalogPanel.useMemo[extraDerivedKeys]": ()=>{
            const fromJson = new Set(stsEntries.map({
                "GalleryIconCatalogPanel.useMemo[extraDerivedKeys]": (e)=>e.key
            }["GalleryIconCatalogPanel.useMemo[extraDerivedKeys]"]));
            return Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STS_ICON_GLYPH"]).filter({
                "GalleryIconCatalogPanel.useMemo[extraDerivedKeys]": (k)=>!fromJson.has(k)
            }["GalleryIconCatalogPanel.useMemo[extraDerivedKeys]"]);
        }
    }["GalleryIconCatalogPanel.useMemo[extraDerivedKeys]"], [
        stsEntries
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `border-slate-800 bg-slate-950/95 text-slate-200 lg:border-l ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-3 py-3 backdrop-blur-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xs font-bold uppercase tracking-widest text-slate-500",
                        children: "Effect & icon catalog"
                    }, void 0, false, {
                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-[11px] leading-snug text-slate-500",
                        children: [
                            "Keys from ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "STS_CARDS_DB.json"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 42,
                                columnNumber: 21
                            }, this),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "iconCatalog"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, this),
                            " when present, else the built-in fallback. In-card clusters prepend",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-amber-200/80",
                                children: "conditional"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            ",",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-rose-200/80",
                                children: "AoE"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            ", or",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-violet-200/80",
                                children: "random"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 47,
                                columnNumber: 11
                            }, this),
                            " when",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "*.conditioned"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this),
                            ", attack text says",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "all enemies"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            ", or",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "discardEffect.random"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            " (etc.). Base numbers stay in the stat row (damage shows weak / vuln / both); AoE attacks get one shared rose tint behind modifiers + damage. Orbs, exhaust, and debuff stacks use the keys below."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6 px-3 py-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": "catalog-sts-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                id: "catalog-sts-heading",
                                className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500",
                                children: "Database icon keys"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-2",
                                children: stsEntries.map(({ key, description })=>{
                                    const g = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STS_ICON_GLYPH"][key];
                                    const Icon = g?.Icon;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "flex gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950",
                                                children: Icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: `h-4 w-4 ${g.iconClass}`,
                                                    "aria-hidden": true
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                    lineNumber: 75,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] text-slate-600",
                                                    children: "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                    lineNumber: 77,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                lineNumber: 73,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-mono text-[10px] font-semibold text-cyan-200/90",
                                                        children: key
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 81,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] leading-snug text-slate-500",
                                                        children: description
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 84,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                lineNumber: 80,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, key, true, {
                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                        lineNumber: 69,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    extraDerivedKeys.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": "catalog-derived-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                id: "catalog-derived-heading",
                                className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500",
                                children: "Derived / UI-only"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-2",
                                children: extraDerivedKeys.map((key)=>{
                                    const g = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STS_ICON_GLYPH"][key];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "flex gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(g.Icon, {
                                                    className: `h-4 w-4 ${g.iconClass}`,
                                                    "aria-hidden": true
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                    lineNumber: 109,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                lineNumber: 108,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-mono text-[10px] font-semibold text-amber-200/90",
                                                        children: key
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 112,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-semibold text-slate-300",
                                                        children: g.shortLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 115,
                                                        columnNumber: 23
                                                    }, this),
                                                    DERIVED_GLYPH_NOTES[key] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-0.5 text-[10px] leading-snug text-slate-500",
                                                        children: DERIVED_GLYPH_NOTES[key]
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 25
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                lineNumber: 111,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, key, true, {
                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                        lineNumber: 104,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                        lineNumber: 93,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": "catalog-stats-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                id: "catalog-stats-heading",
                                className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500",
                                children: "Card stat row (gallery)"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-2 text-[10px] leading-snug text-slate-500",
                                children: "Same icons as the main planner card: primary value plus side columns where applicable."
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 136,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-2",
                                children: [
                                    {
                                        id: "damage-row",
                                        title: "Damage",
                                        lines: [
                                            "Lightning: base damage.",
                                            "Down arrow / alert / dumbbell: damage under weak, vulnerable, and both."
                                        ],
                                        tokens: [
                                            "damage",
                                            "weak",
                                            "vulnerable",
                                            "strength"
                                        ]
                                    },
                                    {
                                        id: "block-row",
                                        title: "Block",
                                        lines: [
                                            "Shield: block. Struck shield: value under frail."
                                        ],
                                        tokens: [
                                            "block",
                                            "frail"
                                        ]
                                    },
                                    {
                                        id: "draw-row",
                                        title: "Draw",
                                        lines: [
                                            "Page icon + count."
                                        ],
                                        tokens: [
                                            "draw"
                                        ]
                                    },
                                    {
                                        id: "energy-row",
                                        title: "Energy",
                                        lines: [
                                            "Lightning + energy gain value."
                                        ],
                                        tokens: [
                                            "energygain"
                                        ]
                                    },
                                    {
                                        id: "hp-loss-row",
                                        title: "HP loss",
                                        lines: [
                                            "Self-hit when takeDamage is present."
                                        ],
                                        tokens: [
                                            "takedamage"
                                        ]
                                    }
                                ].map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] font-semibold text-slate-300",
                                                children: group.title
                                            }, void 0, false, {
                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                lineNumber: 181,
                                                columnNumber: 17
                                            }, this),
                                            group.lines.map((line)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] leading-snug text-slate-500",
                                                    children: line
                                                }, line, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 19
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 flex flex-wrap gap-2",
                                                children: group.tokens.map((t)=>{
                                                    const d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEffectDisplay"])(t);
                                                    const Icon = d.icon;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950/80 px-1.5 py-1",
                                                        title: d.fullLabel,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                className: `h-3.5 w-3.5 ${d.color}`,
                                                                "aria-hidden": true
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                                lineNumber: 197,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] font-mono text-slate-500",
                                                                children: t
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                                lineNumber: 198,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, t, true, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 192,
                                                        columnNumber: 23
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                lineNumber: 187,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, group.id, true, {
                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                        lineNumber: 177,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_s(GalleryIconCatalogPanel, "6lHWbL9zYul5Ks0VSpiO3xHE+zc=");
_c = GalleryIconCatalogPanel;
var _c;
__turbopack_context__.k.register(_c, "GalleryIconCatalogPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/card-design-gallery/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CardDesignGalleryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryCardSelectModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryCardSelectModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryCardPreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryCardPreview.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryIconCatalogPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryQuickTemplateBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryQuickTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryQuickTemplates.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsToGalleryRow.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
const RANDOM_CARD_COUNT = 10;
const GALLERY_VARIANTS = [
    "aurora",
    "neon"
];
const VARIANT_BLURB = {
    aurora: "Baseline glossy gradient, glass highlights, strong hover lift.",
    neon: "Tighter border, heavier outer glow, brighter rim lines."
};
const SIZE_ORDER = {
    small: 0,
    medium: 1,
    large: 2
};
function effectiveDisplaySize(row, mode) {
    return mode === "auto" ? row.size ?? "large" : mode;
}
function sortRowsByCardSize(rows) {
    return [
        ...rows
    ].sort((a, b)=>SIZE_ORDER[a.size ?? "large"] - SIZE_ORDER[b.size ?? "large"]);
}
const SIZE_MODE_OPTIONS = [
    {
        id: "auto",
        label: "Auto"
    },
    {
        id: "small",
        label: "S"
    },
    {
        id: "medium",
        label: "M"
    },
    {
        id: "large",
        label: "L"
    }
];
function CardDesignGalleryPage() {
    _s();
    const [pickerOpen, setPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pickerResetKey, setPickerResetKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [sizeMode, setSizeMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("auto");
    const [previewUpgraded, setPreviewUpgraded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gridRows, setGridRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const orderedGridRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CardDesignGalleryPage.useMemo[orderedGridRows]": ()=>{
            if (sizeMode !== "auto") return gridRows;
            return sortRowsByCardSize(gridRows);
        }
    }["CardDesignGalleryPage.useMemo[orderedGridRows]"], [
        gridRows,
        sizeMode
    ]);
    const clearGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CardDesignGalleryPage.useCallback[clearGrid]": ()=>{
            setGridRows([]);
        }
    }["CardDesignGalleryPage.useCallback[clearGrid]"], []);
    const resetGallery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CardDesignGalleryPage.useCallback[resetGallery]": ()=>{
            setPreviewUpgraded(false);
            setGridRows([]);
            setSizeMode("auto");
            setPickerOpen(false);
            setPickerResetKey({
                "CardDesignGalleryPage.useCallback[resetGallery]": (k)=>k + 1
            }["CardDesignGalleryPage.useCallback[resetGallery]"]);
        }
    }["CardDesignGalleryPage.useCallback[resetGallery]"], []);
    const applyPreviewUpgraded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CardDesignGalleryPage.useCallback[applyPreviewUpgraded]": (v)=>{
            setPreviewUpgraded(v);
            setGridRows({
                "CardDesignGalleryPage.useCallback[applyPreviewUpgraded]": (prev)=>{
                    if (prev.length === 0) return prev;
                    return prev.map({
                        "CardDesignGalleryPage.useCallback[applyPreviewUpgraded]": (row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryRowFromStsCardId"])(row.card.name, {
                                isUpgraded: v
                            })
                    }["CardDesignGalleryPage.useCallback[applyPreviewUpgraded]"]).filter({
                        "CardDesignGalleryPage.useCallback[applyPreviewUpgraded]": (r)=>r != null
                    }["CardDesignGalleryPage.useCallback[applyPreviewUpgraded]"]);
                }
            }["CardDesignGalleryPage.useCallback[applyPreviewUpgraded]"]);
        }
    }["CardDesignGalleryPage.useCallback[applyPreviewUpgraded]"], []);
    const loadRandomCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CardDesignGalleryPage.useCallback[loadRandomCards]": ()=>{
            const ids = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickRandomStsCardIds"])(RANDOM_CARD_COUNT);
            const rows = ids.map({
                "CardDesignGalleryPage.useCallback[loadRandomCards].rows": (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryRowFromStsCardId"])(id, {
                        isUpgraded: previewUpgraded
                    })
            }["CardDesignGalleryPage.useCallback[loadRandomCards].rows"]).filter({
                "CardDesignGalleryPage.useCallback[loadRandomCards].rows": (r)=>r != null
            }["CardDesignGalleryPage.useCallback[loadRandomCards].rows"]);
            setGridRows(rows);
        }
    }["CardDesignGalleryPage.useCallback[loadRandomCards]"], [
        previewUpgraded
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-dvh flex-col bg-slate-950 text-slate-100 lg:flex-row",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryCardSelectModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GalleryCardSelectModal"], {
                open: pickerOpen,
                resetKey: pickerResetKey,
                previewUpgraded: previewUpgraded,
                onPreviewUpgradedChange: applyPreviewUpgraded,
                onClose: ()=>setPickerOpen(false),
                onApply: (ids)=>{
                    const rows = ids.map((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryRowFromStsCardId"])(id, {
                            isUpgraded: previewUpgraded
                        })).filter((r)=>r != null);
                    setGridRows(rows);
                    setPickerOpen(false);
                }
            }, void 0, false, {
                fileName: "[project]/app/card-design-gallery/page.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-0 flex-1 overflow-x-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/95 px-4 py-4 backdrop-blur-md",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto flex max-w-7xl flex-col gap-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-lg font-bold tracking-tight text-white",
                                                children: "Card design gallery"
                                            }, void 0, false, {
                                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                                lineNumber: 120,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-slate-400",
                                                children: "Aurora & Neon · quick templates or pick from the database · effect icons in-card (see catalog →). Rarity appears only in the picker list. Size: Auto sorts small → large; S/M/L forces one size."
                                            }, void 0, false, {
                                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                                lineNumber: 123,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                        lineNumber: 119,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/60 p-1",
                                                        role: "group",
                                                        "aria-label": "Card preview size",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "px-2 text-[10px] font-bold uppercase tracking-wide text-slate-500",
                                                                children: "Size"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                                                lineNumber: 136,
                                                                columnNumber: 21
                                                            }, this),
                                                            SIZE_MODE_OPTIONS.map(({ id, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setSizeMode(id),
                                                                    className: `rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${sizeMode === id ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-500/40" : "text-slate-400 hover:text-slate-200"}`,
                                                                    children: label
                                                                }, id, false, {
                                                                    fileName: "[project]/app/card-design-gallery/page.tsx",
                                                                    lineNumber: 140,
                                                                    columnNumber: 23
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                                        lineNumber: 131,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "checkbox",
                                                                checked: previewUpgraded,
                                                                onChange: (e)=>applyPreviewUpgraded(e.target.checked),
                                                                className: "rounded border-slate-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                                                lineNumber: 155,
                                                                columnNumber: 21
                                                            }, this),
                                                            "Upgraded"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                                        lineNumber: 154,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                                lineNumber: 130,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setPickerOpen(true),
                                                        className: "rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25",
                                                        children: "Select cards…"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                                        lineNumber: 165,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: loadRandomCards,
                                                        title: `Load ${RANDOM_CARD_COUNT} random cards from the current database`,
                                                        className: "rounded-lg border border-violet-500/45 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/20",
                                                        children: [
                                                            "Random (",
                                                            RANDOM_CARD_COUNT,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: clearGrid,
                                                        disabled: gridRows.length === 0,
                                                        className: "rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40",
                                                        children: "Clear grid"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                                        lineNumber: 180,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: resetGallery,
                                                        title: "Clear grid, set size to Auto, close picker, reset picker search/selection (use after editing STS_CARDS_DB)",
                                                        className: "rounded-lg border border-amber-600/50 bg-amber-950/40 px-4 py-2 text-sm font-semibold text-amber-100/95 transition hover:bg-amber-950/70",
                                                        children: "Reset"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                                        lineNumber: 188,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                                lineNumber: 164,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                        lineNumber: 129,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                lineNumber: 118,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/card-design-gallery/page.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/card-design-gallery/page.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-auto max-w-7xl space-y-10 px-4 py-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryQuickTemplateBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GalleryQuickTemplateBar"], {
                                onPick: (t)=>setGridRows((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryQuickTemplates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["galleryRowsFromTemplate"])(t, {
                                        isUpgraded: previewUpgraded
                                    })),
                                className: "max-w-3xl"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                lineNumber: 203,
                                columnNumber: 11
                            }, this),
                            gridRows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-12 text-center text-sm text-slate-500",
                                children: [
                                    "No cards selected. Use a quick template above or",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        className: "text-slate-300",
                                        children: "Select cards…"
                                    }, void 0, false, {
                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                        lineNumber: 213,
                                        columnNumber: 15
                                    }, this),
                                    " to load previews from STS_CARDS_DB."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                lineNumber: 211,
                                columnNumber: 13
                            }, this) : GALLERY_VARIANTS.map((variant)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    className: "space-y-4",
                                    "aria-labelledby": `variant-${variant}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    id: `variant-${variant}`,
                                                    className: "text-base font-bold capitalize text-white",
                                                    children: variant
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/page.tsx",
                                                    lineNumber: 224,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-slate-500",
                                                    children: VARIANT_BLURB[variant]
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/page.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/card-design-gallery/page.tsx",
                                            lineNumber: 223,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
                                            children: orderedGridRows.map((row)=>{
                                                const sz = effectiveDisplaySize(row, sizeMode);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "min-h-8 max-w-[11rem] text-center text-[10px] font-medium leading-tight text-slate-500",
                                                            children: [
                                                                row.title,
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "block text-[9px] text-slate-600",
                                                                    children: sizeMode === "auto" ? `size: ${sz}` : `forced: ${sz}`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/card-design-gallery/page.tsx",
                                                                    lineNumber: 242,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/card-design-gallery/page.tsx",
                                                            lineNumber: 240,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryCardPreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GalleryCardPreview"], {
                                                            row: row,
                                                            variant: variant,
                                                            displaySize: sz
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/card-design-gallery/page.tsx",
                                                            lineNumber: 246,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, `${variant}-${row.id}`, true, {
                                                    fileName: "[project]/app/card-design-gallery/page.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 23
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/card-design-gallery/page.tsx",
                                            lineNumber: 232,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, variant, true, {
                                    fileName: "[project]/app/card-design-gallery/page.tsx",
                                    lineNumber: 218,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/card-design-gallery/page.tsx",
                        lineNumber: 202,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/card-design-gallery/page.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryIconCatalogPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GalleryIconCatalogPanel"], {
                className: "max-h-[50vh] overflow-y-auto lg:max-h-none lg:w-80 lg:shrink-0 lg:overflow-y-auto"
            }, void 0, false, {
                fileName: "[project]/app/card-design-gallery/page.tsx",
                lineNumber: 257,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/card-design-gallery/page.tsx",
        lineNumber: 99,
        columnNumber: 5
    }, this);
}
_s(CardDesignGalleryPage, "fHyzb3e8dOQvwhwolqjGeZfRv50=");
_c = CardDesignGalleryPage;
var _c;
__turbopack_context__.k.register(_c, "CardDesignGalleryPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_0nra70x._.js.map