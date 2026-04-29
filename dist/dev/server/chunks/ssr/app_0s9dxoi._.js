module.exports = [
"[project]/app/card-design-gallery/galleryRarity.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/app/card-design-gallery/stsToGalleryRow.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "galleryRowFromStsCardId",
    ()=>galleryRowFromStsCardId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/gameCardFromSts.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-ssr] (ecmascript)");
;
;
function galleryRowFromStsCardId(cardId, opts) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStsCardsRecord"])();
    const raw = db[cardId];
    if (!raw) return null;
    const card = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$gameCardFromSts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildGameCardFromStsRaw"])(cardId, raw, opts);
    const rarityStr = typeof raw.rarity === "string" ? raw.rarity : "—";
    return {
        id: `sts-${cardId}`,
        title: `${cardId} · ${rarityStr}`,
        card,
        size: "large"
    };
}
}),
"[project]/app/card-design-gallery/galleryQuickTemplates.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GALLERY_QUICK_TEMPLATES",
    ()=>GALLERY_QUICK_TEMPLATES,
    "galleryRowsFromTemplate",
    ()=>galleryRowsFromTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsToGalleryRow.ts [app-ssr] (ecmascript)");
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
        id: "compact-smoke",
        title: "Compact smoke",
        blurb: "Ironclad attack + Defect basic — quick layout check",
        cardIds: [
            "Anger",
            "Zap"
        ]
    }
];
function galleryRowsFromTemplate(template, opts) {
    const isUpgraded = opts?.isUpgraded ?? false;
    return template.cardIds.map((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["galleryRowFromStsCardId"])(id, {
            isUpgraded
        })).filter((r)=>r != null);
}
}),
"[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GalleryQuickTemplateBar",
    ()=>GalleryQuickTemplateBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryQuickTemplates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryQuickTemplates.ts [app-ssr] (ecmascript)");
"use client";
;
;
function GalleryQuickTemplateBar({ onPick, className = "", size = "default", showFooterHint = true }) {
    const btn = size === "compact" ? "rounded-md border border-slate-600/90 bg-slate-800/90 px-2 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700/90" : "rounded-lg border border-slate-600/80 bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryQuickTemplates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GALLERY_QUICK_TEMPLATES"].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            showFooterHint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] leading-snug text-slate-600",
                children: [
                    "Loads preset sets from STS_CARDS_DB. Use ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
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
}),
"[project]/app/card-design-gallery/GalleryCardSelectModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GalleryCardSelectModal",
    ()=>GalleryCardSelectModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryRarity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryRarity.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryQuickTemplateBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function GalleryCardSelectModal({ open, onClose, onApply, previewUpgraded, onPreviewUpgradedChange, resetKey = 0 }) {
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [q, setQ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        const t = (e)=>{
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", t);
        return ()=>window.removeEventListener("keydown", t);
    }, [
        open,
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (resetKey === 0) return;
        setQ("");
        setSelected(new Set());
        onPreviewUpgradedChange(false);
    }, [
        resetKey,
        onPreviewUpgradedChange
    ]);
    const ids = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listStsCardIdsSorted"])(), [
        resetKey
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const s = q.trim().toLowerCase();
        if (!s) return ids;
        return ids.filter((id)=>id.toLowerCase().includes(s));
    }, [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "gallery-card-modal-title",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "absolute inset-0 bg-black/70 backdrop-blur-[2px]",
                "aria-label": "Close",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "shrink-0 border-b border-slate-800 px-4 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: "gallery-card-modal-title",
                                className: "text-base font-bold text-white",
                                children: "Select cards"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-slate-500",
                                children: "Gallery only · any number of cards · STS_CARDS_DB"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-300",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            selected.size,
                                            " selected"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0 border-b border-slate-800 px-3 py-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryQuickTemplateBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GalleryQuickTemplateBar"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-h-0 flex-1 overflow-y-auto px-2 py-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-0.5",
                                children: filtered.map((id)=>{
                                    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStsCardsRecord"])()[id];
                                    const rarity = raw && typeof raw.rarity === "string" ? raw.rarity : "—";
                                    const band = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryRarity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stsStringToRarityBand"])(raw && typeof raw.rarity === "string" ? raw.rarity : undefined);
                                    const isOn = selected.has(id);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>toggle(id),
                                            className: `flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${isOn ? "bg-amber-500/20 text-amber-50 ring-1 ring-amber-500/40" : "text-slate-200 hover:bg-slate-800/80"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${isOn ? "border-amber-400 bg-amber-500/30 text-amber-100" : "border-slate-600 bg-slate-950 text-slate-600"}`,
                                                    children: isOn ? "✓" : ""
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                                    lineNumber: 163,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "min-w-0 flex-1 truncate font-medium",
                                                    children: id
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                                    lineNumber: 172,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryRarity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["galleryRarityPillClass"])(band)}`,
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
                            filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        className: "shrink-0 flex gap-2 border-t border-slate-800 px-4 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onClose,
                                className: "flex-1 rounded-lg border border-slate-600 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryCardSelectModal.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
}),
"[project]/app/utils/effectDisplay.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEffectDisplay",
    ()=>getEffectDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down.mjs [app-ssr] (ecmascript) <export default as ArrowDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.mjs [app-ssr] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dumbbell$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dumbbell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dumbbell.mjs [app-ssr] (ecmascript) <export default as Dumbbell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.mjs [app-ssr] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ghost.mjs [app-ssr] (ecmascript) <export default as Ghost>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.mjs [app-ssr] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$crack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartCrack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart-crack.mjs [app-ssr] (ecmascript) <export default as HeartCrack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/link.mjs [app-ssr] (ecmascript) <export default as Link>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.mjs [app-ssr] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-off.mjs [app-ssr] (ecmascript) <export default as ShieldOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skull.mjs [app-ssr] (ecmascript) <export default as Skull>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.mjs [app-ssr] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$orbit$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Orbit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/orbit.mjs [app-ssr] (ecmascript) <export default as Orbit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/constants/colors.ts [app-ssr] (ecmascript)");
;
;
const ICONS = {
    weak: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"],
    vulnerable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
    frail: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__["ShieldOff"],
    damage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
    block: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
    wound: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$crack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartCrack$3e$__["HeartCrack"],
    strength: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dumbbell$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dumbbell$3e$__["Dumbbell"],
    strength_buff: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
    entangle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__["Link"],
    takedamage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$crack$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartCrack$3e$__["HeartCrack"],
    energygain: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$orbit$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Orbit$3e$__["Orbit"],
    draw: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
    intangible: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__["Ghost"],
    hp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
    maxHp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
    health: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
    attack: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
    energy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
    heal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
    focus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
    poison: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__["Skull"],
    hpcost: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"]
};
function getEffectDisplay(type, value) {
    switch(type){
        case 'weak':
            return {
                label: `W${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].weak,
                fullLabel: 'Weak',
                icon: ICONS.weak
            };
        case 'vulnerable':
            return {
                label: `V${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].vulnerable,
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
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].damage,
                fullLabel: 'Damage',
                icon: ICONS.damage
            };
        case 'block':
            return {
                label: `B${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].block,
                fullLabel: value ? `Gain ${value} Block` : 'Block',
                icon: ICONS.block
            };
        case 'wound':
            return {
                label: `W${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].wound,
                fullLabel: 'Wound',
                icon: ICONS.wound
            };
        case 'strength':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].strength,
                fullLabel: 'Strength',
                icon: ICONS.strength
            };
        case 'strength_buff':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].strength,
                fullLabel: 'Strength Buff',
                icon: ICONS.strength_buff
            };
        case 'entangle':
            return {
                label: 'Entangle',
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].entangle,
                fullLabel: 'Entangle',
                icon: ICONS.entangle
            };
        case 'takedamage':
            return {
                label: `-${value ?? ''} HP`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].takedamage,
                fullLabel: `Take ${value ?? ''} Damage`,
                icon: ICONS.takedamage
            };
        case 'energygain':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].energygain,
                fullLabel: `Gain ${value ?? ''} Energy`,
                icon: ICONS.energygain
            };
        case 'draw':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].draw,
                fullLabel: `Draw ${value ?? ''} Card${value === 1 ? '' : 's'}`,
                icon: ICONS.draw
            };
        case 'intangible':
            return {
                label: `${value ?? 1}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].intangible,
                fullLabel: `Gain ${value ?? 1} Intangible`,
                icon: ICONS.intangible
            };
        case 'hp':
            return {
                label: `HP ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_COLORS"].hp,
                fullLabel: 'HP',
                icon: ICONS.hp
            };
        case 'maxHp':
            return {
                label: `Max HP ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_COLORS"].maxHp,
                fullLabel: 'Max HP',
                icon: ICONS.maxHp
            };
        case 'health':
            return {
                label: `Health ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_COLORS"].health,
                fullLabel: 'Health',
                icon: ICONS.health
            };
        case 'attack':
            return {
                label: `Attack ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_COLORS"].attack,
                fullLabel: 'Attack',
                icon: ICONS.attack
            };
        case 'energy':
            return {
                label: `Energy ${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STAT_COLORS"].energy,
                fullLabel: 'Energy',
                icon: ICONS.energy
            };
        case 'heal':
            return {
                label: `+${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].heal,
                fullLabel: 'Heal',
                icon: ICONS.heal
            };
        case 'focus':
            return {
                label: `${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].focus,
                fullLabel: 'Focus',
                icon: ICONS.focus
            };
        case 'poison':
            return {
                label: `P${value ?? ''}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].poison,
                fullLabel: 'Poison',
                icon: ICONS.poison
            };
        case 'hpcost':
            return {
                label: `-${value ?? ''} HP`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EFFECT_COLORS"].hpcost,
                fullLabel: `Lose ${value ?? ''} HP`,
                icon: ICONS.hpcost
            };
        default:
            return {
                label: `?${value ?? ''}`,
                color: 'text-gray-400',
                fullLabel: 'Unknown',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"]
            };
    }
}
}),
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
"[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bookmark.mjs [app-ssr] (ecmascript) <export default as Bookmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-up.mjs [app-ssr] (ecmascript) <export default as ChevronsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$dot$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleDot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-dot.mjs [app-ssr] (ecmascript) <export default as CircleDot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coins.mjs [app-ssr] (ecmascript) <export default as Coins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.mjs [app-ssr] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crosshair.mjs [app-ssr] (ecmascript) <export default as Crosshair>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.mjs [app-ssr] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ghost.mjs [app-ssr] (ecmascript) <export default as Ghost>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.mjs [app-ssr] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.mjs [app-ssr] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scan$2d$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScanSearch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scan-search.mjs [app-ssr] (ecmascript) <export default as ScanSearch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shuffle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shuffle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shuffle.mjs [app-ssr] (ecmascript) <export default as Shuffle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/snowflake.mjs [app-ssr] (ecmascript) <export default as Snowflake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SquarePlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-plus.mjs [app-ssr] (ecmascript) <export default as SquarePlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.mjs [app-ssr] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-down.mjs [app-ssr] (ecmascript) <export default as TrendingDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.mjs [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.mjs [app-ssr] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$orbit$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Orbit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/orbit.mjs [app-ssr] (ecmascript) <export default as Orbit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/effectDisplay.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$STS_CARDS_DB$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/data/STS_CARDS_DB.json.[json].cjs [app-ssr] (ecmascript)");
;
;
;
const STS_ICON_GLYPH = {
    LIGHTNING_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
        iconClass: "text-amber-300",
        shortLabel: "Lightning orb"
    },
    FROST_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__["Snowflake"],
        iconClass: "text-sky-300",
        shortLabel: "Frost orb"
    },
    DARK_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"],
        iconClass: "text-violet-300",
        shortLabel: "Dark orb"
    },
    PLASMA_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
        iconClass: "text-yellow-200",
        shortLabel: "Plasma orb"
    },
    DRAW_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
        iconClass: "text-cyan-300",
        shortLabel: "Draw"
    },
    DISCARD_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"],
        iconClass: "text-orange-300",
        shortLabel: "Discard"
    },
    EVOKE_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$dot$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleDot$3e$__["CircleDot"],
        iconClass: "text-amber-200",
        shortLabel: "Evoke"
    },
    CONDITIONAL_MARKER: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
        iconClass: "text-amber-200/90",
        shortLabel: "Conditional"
    },
    ANY_ORB: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"],
        iconClass: "text-slate-300",
        shortLabel: "Any orb"
    },
    SAME_ORB_AS_EVOKED: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"],
        iconClass: "text-slate-300",
        shortLabel: "Same as evoked"
    },
    /** Area-of-effect marker paired with damage icon */ AOE_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__["Crosshair"],
        iconClass: "text-rose-200",
        shortLabel: "AoE"
    },
    /** Gallery: legacy multi-hit row (distinct from main damage stat icon). */ AOE_DAMAGE: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"],
        iconClass: "text-rose-300",
        shortLabel: "Multi-hit"
    },
    RANDOM_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shuffle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shuffle$3e$__["Shuffle"],
        iconClass: "text-violet-300",
        shortLabel: "Random"
    },
    EXHAUST_SELF: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"],
        iconClass: "text-orange-400",
        shortLabel: "Exhaust (self)"
    },
    SCRY_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scan$2d$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScanSearch$3e$__["ScanSearch"],
        iconClass: "text-fuchsia-300",
        shortLabel: "Scry"
    },
    LOSE_STRENGTH: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__["TrendingDown"],
        iconClass: "text-orange-300",
        shortLabel: "Lose Strength"
    },
    KEY_INNATE: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"],
        iconClass: "text-amber-200",
        shortLabel: "Innate"
    },
    KEY_ETHEREAL: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__["Ghost"],
        iconClass: "text-slate-400",
        shortLabel: "Ethereal"
    },
    KEY_RETAIN: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"],
        iconClass: "text-lime-200",
        shortLabel: "Retain"
    },
    COST_MANIP: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"],
        iconClass: "text-amber-300",
        shortLabel: "Cost"
    },
    UPGRADE_CARD: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUp$3e$__["ChevronsUp"],
        iconClass: "text-violet-300",
        shortLabel: "Upgrade"
    },
    ADD_CARD: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SquarePlus$3e$__["SquarePlus"],
        iconClass: "text-cyan-300",
        shortLabel: "Add card"
    },
    HP_COST: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"],
        iconClass: "text-rose-400",
        shortLabel: "HP cost"
    },
    GAIN_ENERGY_ICON: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$orbit$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Orbit$3e$__["Orbit"],
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
    const root = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$data$2f$STS_CARDS_DB$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
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
    const dmgD = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("damage");
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
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"],
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
        const enD = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("energygain");
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
            Icon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").icon,
            iconClass: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").color,
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
                Icon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").icon,
                iconClass: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").color
            });
        }
    } else if (legacyDraw) {
        const key = typeof c.drawUsesIcon === "string" ? String(c.drawUsesIcon) : "DRAW_ICON";
        const drawMeta = STS_ICON_GLYPH[key] ?? {
            Icon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").icon,
            iconClass: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("draw").color,
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
            Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"],
            iconClass: "text-orange-400"
        });
    }
    const eg = energyGainNode(card);
    if (eg != null) {
        const egObj = eg !== null && typeof eg === "object" && !Array.isArray(eg) ? eg : null;
        const cond = egObj?.conditioned === true;
        const trigger = typeof egObj?.trigger === "string" ? egObj.trigger : undefined;
        const egDisplay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("energygain");
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
        const h = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("heal");
        push({
            id: "heal-main",
            label: "Heal",
            Icon: h.icon,
            iconClass: h.color
        });
    }
    const focusRaw = c.focus;
    if (focusRaw != null) {
        const f = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("focus");
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
            label: "Cost manipulation",
            Icon: cm.Icon,
            iconClass: cm.iconClass
        });
    }
    if (c.canUpgradeCards === true) {
        const up = STS_ICON_GLYPH.UPGRADE_CARD;
        push({
            id: "upgrade-cards",
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
                const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("poison");
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
                    label,
                    clusterClass: clusterShellField("neutral"),
                    segments
                });
                continue;
            }
            const eff = kind === "vulnerable" || kind === "weak" ? kind : "wound";
            const d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])(eff);
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
        const blk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("block");
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
                            lineNumber: 120,
                            columnNumber: 15
                        }, this) : null,
                        s.text != null && s.text !== "" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: s.textClass ?? "",
                            children: s.text
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 126,
                            columnNumber: 15
                        }, this) : null
                    ]
                }, i, true, {
                    fileName: "[project]/app/components/UI/Card.tsx",
                    lineNumber: 118,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/app/components/UI/Card.tsx",
            lineNumber: 116,
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
                lineNumber: 142,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/UI/Card.tsx",
            lineNumber: 136,
            columnNumber: 7
        }, this);
    }
    return null;
}
function STSCard({ card, index, location, size = "large", interactive = true, variant = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$cardVisualVariants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CARD_VISUAL_VARIANT"], galleryEffectGlyphs, gallerySuppressStats, galleryChromeStyle }) {
    const { toggleCardSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameManager"])();
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
                lineNumber: 287,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: chrome.innerRim
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 289,
                columnNumber: 7
            }, this),
            !hideCostOrb && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute z-10 flex items-center justify-center rounded-full border-2 border-slate-950 ${sz.costOrb} ${styles.costBg} ${styles.costGlow} shadow-lg ${chrome.costOrbExtra}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `${sz.costText} text-white drop-shadow-md`,
                    children: cardUsesXCost() ? "X" : getValue("cost")
                }, void 0, false, {
                    fileName: "[project]/app/components/UI/Card.tsx",
                    lineNumber: 295,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 292,
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
                                            lineNumber: 309,
                                            columnNumber: 15
                                        }, this),
                                        card.isUpgraded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `${sz.upgradedBadge} ml-0.5 text-emerald-400`,
                                            children: "+"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/UI/Card.tsx",
                                            lineNumber: 317,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 308,
                                    columnNumber: 13
                                }, this),
                                card.isChanged && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `${sz.changedPill} inline-block rounded-full bg-amber-400/25 text-amber-200 animate-bounce-pop`,
                                    children: "CHANGED"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/UI/Card.tsx",
                                    lineNumber: 323,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 305,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 302,
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
                                    lineNumber: 339,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/components/UI/Card.tsx",
                            lineNumber: 337,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 333,
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
                                            lineNumber: 354,
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
                                        lineNumber: 364,
                                        columnNumber: 19
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 352,
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
                                        lineNumber: 377,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statSide} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("frail").color}`,
                                        children: getFullBlock()?.frail
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 385,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 376,
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
                                        lineNumber: 394,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${stat.statSide} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])("frail").color}`,
                                        children: getFullBlock()?.frail
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 402,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 393,
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
                                    lineNumber: 411,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 410,
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
                                    lineNumber: 423,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 422,
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
                                    lineNumber: 435,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 434,
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
                                    lineNumber: 449,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 448,
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
                                    lineNumber: 461,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 460,
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
                                    lineNumber: 473,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 472,
                                columnNumber: 15
                            }, this),
                            suffixGalleryGlyphs.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center justify-center gap-x-2 gap-y-1",
                                "aria-label": "Extra effects",
                                children: suffixGalleryGlyphs.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                        children: renderGalleryGlyphCluster(g, stat.galleryIcon, stat.galleryText)
                                    }, g.id, false, {
                                        fileName: "[project]/app/components/UI/Card.tsx",
                                        lineNumber: 489,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/components/UI/Card.tsx",
                                lineNumber: 484,
                                columnNumber: 15
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 348,
                        columnNumber: 11
                    }, this),
                    stat && card.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${styles.nameBg} ${stat.descBox} border ${styles.accentBorder} text-center text-slate-200/95 backdrop-blur-sm ${chrome.descBoxExtra}`,
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$descriptionPlaceholders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFormattedDescription"])(card.description, card)
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 503,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${sz.typeLabel} ${styles.typeColor} mt-auto text-center opacity-80 ${chrome.typeLabelExtra}`,
                        children: card.type
                    }, void 0, false, {
                        fileName: "[project]/app/components/UI/Card.tsx",
                        lineNumber: 510,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 301,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: chrome.bottomLine
            }, void 0, false, {
                fileName: "[project]/app/components/UI/Card.tsx",
                lineNumber: 517,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/UI/Card.tsx",
        lineNumber: 276,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/card-design-gallery/GalleryCardPreview.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GalleryCardPreview",
    ()=>GalleryCardPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/UI/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryCharacterCardStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryCharacterCardStyles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function GalleryCardPreview({ row, variant, displaySize }) {
    const { glyphs, suppressStats } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inferGalleryCardEffects"])(row.card);
    const hasSuppress = Object.keys(suppressStats).length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$UI$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            card: row.card,
            index: 0,
            location: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCATION"].HAND,
            size: displaySize,
            interactive: false,
            variant: variant,
            galleryChromeStyle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryCharacterCardStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGalleryCharacterChromeStyle"])(row.card),
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
}),
"[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GalleryIconCatalogPanel",
    ()=>GalleryIconCatalogPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryStsGlyphs.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/effectDisplay.ts [app-ssr] (ecmascript)");
"use client";
;
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
    const stsEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readStsIconCatalog"])(), []);
    const extraDerivedKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const fromJson = new Set(stsEntries.map((e)=>e.key));
        return Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STS_ICON_GLYPH"]).filter((k)=>!fromJson.has(k));
    }, [
        stsEntries
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `border-slate-800 bg-slate-950/95 text-slate-200 lg:border-l ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-3 py-3 backdrop-blur-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xs font-bold uppercase tracking-widest text-slate-500",
                        children: "Effect & icon catalog"
                    }, void 0, false, {
                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-[11px] leading-snug text-slate-500",
                        children: [
                            "Keys from ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "STS_CARDS_DB.json"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 42,
                                columnNumber: 21
                            }, this),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "iconCatalog"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, this),
                            " when present, else the built-in fallback. In-card clusters prepend",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-amber-200/80",
                                children: "conditional"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            ",",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-rose-200/80",
                                children: "AoE"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            ", or",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-violet-200/80",
                                children: "random"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 47,
                                columnNumber: 11
                            }, this),
                            " when",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "*.conditioned"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this),
                            ", attack text says",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-slate-400",
                                children: "all enemies"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            ", or",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6 px-3 py-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": "catalog-sts-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                id: "catalog-sts-heading",
                                className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500",
                                children: "Database icon keys"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-2",
                                children: stsEntries.map(({ key, description })=>{
                                    const g = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STS_ICON_GLYPH"][key];
                                    const Icon = g?.Icon;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "flex gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950",
                                                children: Icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: `h-4 w-4 ${g.iconClass}`,
                                                    "aria-hidden": true
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                    lineNumber: 75,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-mono text-[10px] font-semibold text-cyan-200/90",
                                                        children: key
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 81,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                    extraDerivedKeys.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": "catalog-derived-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                id: "catalog-derived-heading",
                                className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500",
                                children: "Derived / UI-only"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-2",
                                children: extraDerivedKeys.map((key)=>{
                                    const g = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryStsGlyphs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STS_ICON_GLYPH"][key];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "flex gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(g.Icon, {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-mono text-[10px] font-semibold text-amber-200/90",
                                                        children: key
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 112,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-semibold text-slate-300",
                                                        children: g.shortLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                        lineNumber: 115,
                                                        columnNumber: 23
                                                    }, this),
                                                    DERIVED_GLYPH_NOTES[key] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": "catalog-stats-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                id: "catalog-stats-heading",
                                className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500",
                                children: "Card stat row (gallery)"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-2 text-[10px] leading-snug text-slate-500",
                                children: "Same icons as the main planner card: primary value plus side columns where applicable."
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                lineNumber: 136,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
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
                                ].map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] font-semibold text-slate-300",
                                                children: group.title
                                            }, void 0, false, {
                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                lineNumber: 181,
                                                columnNumber: 17
                                            }, this),
                                            group.lines.map((line)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] leading-snug text-slate-500",
                                                    children: line
                                                }, line, false, {
                                                    fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 19
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 flex flex-wrap gap-2",
                                                children: group.tokens.map((t)=>{
                                                    const d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$effectDisplay$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEffectDisplay"])(t);
                                                    const Icon = d.icon;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950/80 px-1.5 py-1",
                                                        title: d.fullLabel,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                className: `h-3.5 w-3.5 ${d.color}`,
                                                                "aria-hidden": true
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx",
                                                                lineNumber: 197,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/app/card-design-gallery/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CardDesignGalleryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryCardSelectModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryCardSelectModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryCardPreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryCardPreview.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryIconCatalogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryIconCatalogPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryQuickTemplateBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/GalleryQuickTemplateBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryQuickTemplates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/galleryQuickTemplates.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsToGalleryRow.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/card-design-gallery/stsRecord.ts [app-ssr] (ecmascript)");
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
    const [pickerOpen, setPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pickerResetKey, setPickerResetKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [sizeMode, setSizeMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("auto");
    const [previewUpgraded, setPreviewUpgraded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gridRows, setGridRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const orderedGridRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (sizeMode !== "auto") return gridRows;
        return sortRowsByCardSize(gridRows);
    }, [
        gridRows,
        sizeMode
    ]);
    const clearGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setGridRows([]);
    }, []);
    const resetGallery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setPreviewUpgraded(false);
        setGridRows([]);
        setSizeMode("auto");
        setPickerOpen(false);
        setPickerResetKey((k)=>k + 1);
    }, []);
    const applyPreviewUpgraded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((v)=>{
        setPreviewUpgraded(v);
        setGridRows((prev)=>{
            if (prev.length === 0) return prev;
            return prev.map((row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["galleryRowFromStsCardId"])(row.card.name, {
                    isUpgraded: v
                })).filter((r)=>r != null);
        });
    }, []);
    const loadRandomCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const ids = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsRecord$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickRandomStsCardIds"])(RANDOM_CARD_COUNT);
        const rows = ids.map((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["galleryRowFromStsCardId"])(id, {
                isUpgraded: previewUpgraded
            })).filter((r)=>r != null);
        setGridRows(rows);
    }, [
        previewUpgraded
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-dvh flex-col bg-slate-950 text-slate-100 lg:flex-row",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryCardSelectModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GalleryCardSelectModal"], {
                open: pickerOpen,
                resetKey: pickerResetKey,
                previewUpgraded: previewUpgraded,
                onPreviewUpgradedChange: applyPreviewUpgraded,
                onClose: ()=>setPickerOpen(false),
                onApply: (ids)=>{
                    const rows = ids.map((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$stsToGalleryRow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["galleryRowFromStsCardId"])(id, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-0 flex-1 overflow-x-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/95 px-4 py-4 backdrop-blur-md",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto flex max-w-7xl flex-col gap-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-lg font-bold tracking-tight text-white",
                                                children: "Card design gallery"
                                            }, void 0, false, {
                                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                                lineNumber: 120,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/60 p-1",
                                                        role: "group",
                                                        "aria-label": "Card preview size",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "px-2 text-[10px] font-bold uppercase tracking-wide text-slate-500",
                                                                children: "Size"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                                                lineNumber: 136,
                                                                columnNumber: 21
                                                            }, this),
                                                            SIZE_MODE_OPTIONS.map(({ id, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setPickerOpen(true),
                                                        className: "rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25",
                                                        children: "Select cards…"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/card-design-gallery/page.tsx",
                                                        lineNumber: 165,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-auto max-w-7xl space-y-10 px-4 py-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryQuickTemplateBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GalleryQuickTemplateBar"], {
                                onPick: (t)=>setGridRows((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$galleryQuickTemplates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["galleryRowsFromTemplate"])(t, {
                                        isUpgraded: previewUpgraded
                                    })),
                                className: "max-w-3xl"
                            }, void 0, false, {
                                fileName: "[project]/app/card-design-gallery/page.tsx",
                                lineNumber: 203,
                                columnNumber: 11
                            }, this),
                            gridRows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-12 text-center text-sm text-slate-500",
                                children: [
                                    "No cards selected. Use a quick template above or",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
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
                            }, this) : GALLERY_VARIANTS.map((variant)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    className: "space-y-4",
                                    "aria-labelledby": `variant-${variant}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    id: `variant-${variant}`,
                                                    className: "text-base font-bold capitalize text-white",
                                                    children: variant
                                                }, void 0, false, {
                                                    fileName: "[project]/app/card-design-gallery/page.tsx",
                                                    lineNumber: 224,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
                                            children: orderedGridRows.map((row)=>{
                                                const sz = effectiveDisplaySize(row, sizeMode);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "min-h-8 max-w-[11rem] text-center text-[10px] font-medium leading-tight text-slate-500",
                                                            children: [
                                                                row.title,
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryCardPreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GalleryCardPreview"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$card$2d$design$2d$gallery$2f$GalleryIconCatalogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GalleryIconCatalogPanel"], {
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
}),
];

//# sourceMappingURL=app_0s9dxoi._.js.map