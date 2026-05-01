"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardCopy } from "lucide-react";
import { toast } from "@/app/utils/toast";
import {
  collectDottedPathsFromCard,
  globalPathCatalog,
  hasPath,
  renameLeafAtPath,
  setLeafValue,
  setPathPresent,
} from "@/lib/sts-field-paths";
import {
  AddFieldForm,
  FieldEditorTree,
  pathForcedSortLast,
  type BranchSortMode,
} from "../field-schema-editors";
import type { PlannerCardWorkbenchViewProps } from "./planner-types";

/** Re-declare locally so importing page can pass inferred JSON root. */
function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function cardsFromBundle(
  bundle: Record<string, unknown>,
): Record<string, Record<string, unknown>> {
  const nested = bundle.cards;
  if (
    nested &&
    typeof nested === "object" &&
    !Array.isArray(nested) &&
    nested !== null
  ) {
    return nested as Record<string, Record<string, unknown>>;
  }
  const out: Record<string, Record<string, unknown>> = {};
  const skip = new Set([
    "_meta",
    "iconCatalog",
    "attributeIconLinks",
    "lucideByIconKey",
    "fieldIconGroups",
    "fieldIconRules",
    "cards",
  ]);
  for (const [k, v] of Object.entries(bundle)) {
    if (skip.has(k)) continue;
    if (isRecord(v)) out[k] = v;
  }
  return out;
}

function sortedCardIds(cards: Record<string, Record<string, unknown>>): string[] {
  return Object.keys(cards).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

function costBadge(raw: Record<string, unknown>): string {
  if (raw.unplayable === true) return "—";
  if (raw.xCost === true) return "X";
  const cost = raw.cost as { base?: number; upgraded?: number } | undefined;
  if (cost?.base !== undefined) return String(cost.base);
  return "?";
}

function shellForCharacters(charRaw: unknown): string {
  const primary =
    typeof charRaw === "string" ?
      charRaw.split(/[,\|]/)[0]?.trim().toLowerCase() ?? ""
    : "";

  const map: Record<string, string> = {
    ironclad:
      "border-rose-500/35 bg-linear-to-br from-rose-950/90 via-slate-950/95 to-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    silent:
      "border-emerald-500/35 bg-linear-to-br from-emerald-950/70 via-slate-950/95 to-slate-950",
    defect:
      "border-sky-500/35 bg-linear-to-br from-sky-950/75 via-slate-950/95 to-slate-950",
    watcher:
      "border-violet-500/35 bg-linear-to-br from-violet-950/80 via-slate-950/95 to-slate-950",
    colorless:
      "border-slate-500/35 bg-linear-to-br from-slate-800/60 via-slate-950 to-slate-950",
    curse:
      "border-zinc-600/55 bg-linear-to-br from-zinc-900 via-black to-black",
    status:
      "border-slate-600/35 bg-linear-to-br from-slate-800/80 via-slate-950 to-black",
    general:
      "border-fuchsia-500/30 bg-linear-to-br from-fuchsia-950/40 via-slate-950 to-slate-950",
    red:
      "border-rose-500/35 bg-linear-to-br from-rose-950/90 via-slate-950/95 to-slate-950",
    green:
      "border-emerald-500/35 bg-linear-to-br from-emerald-950/70 via-slate-950/95 to-slate-950",
    blue:
      "border-sky-500/35 bg-linear-to-br from-sky-950/75 via-slate-950/95 to-slate-950",
    purple:
      "border-violet-500/35 bg-linear-to-br from-violet-950/80 via-slate-950/95 to-slate-950",
  };

  const k = primary.toLowerCase();
  return (
    map[k] ??
    "border-white/15 bg-linear-to-br from-slate-900/95 via-slate-950 to-slate-980"
  );
}

function primaryCharacterKey(charRaw: unknown): string {
  return typeof charRaw === "string" ?
      charRaw.split(/[,\|]/)[0]?.trim().toLowerCase() ?? ""
    : "";
}

/** Tint + left stripe for cards-rail rows (mirrors preview character palette). */
function railAccentForCharacters(charRaw: unknown): string {
  const k = primaryCharacterKey(charRaw);
  const map: Record<string, string> = {
    ironclad:
      "border-l-rose-500/85 bg-rose-950/28 hover:bg-rose-950/38",
    silent:
      "border-l-emerald-500/85 bg-emerald-950/28 hover:bg-emerald-950/38",
    defect:
      "border-l-sky-500/85 bg-sky-950/35 hover:bg-sky-950/45",
    watcher:
      "border-l-violet-500/85 bg-violet-950/38 hover:bg-violet-950/48",
    colorless:
      "border-l-slate-500/80 bg-slate-800/43 hover:bg-slate-800/52",
    curse:
      "border-l-zinc-500/95 bg-zinc-900/55 hover:bg-zinc-900/65",
    status:
      "border-l-slate-500 bg-slate-800/41 hover:bg-slate-800/52",
    general:
      "border-l-fuchsia-500/82 bg-fuchsia-950/30 hover:bg-fuchsia-950/40",
    red:
      "border-l-rose-500/85 bg-rose-950/28 hover:bg-rose-950/38",
    green:
      "border-l-emerald-500/85 bg-emerald-950/28 hover:bg-emerald-950/38",
    blue:
      "border-l-sky-500/85 bg-sky-950/35 hover:bg-sky-950/45",
    purple:
      "border-l-violet-500/85 bg-violet-950/38 hover:bg-violet-950/48",
  };
  return (
    map[k] ??
    "border-l-fuchsia-500/72 bg-fuchsia-950/25 hover:bg-fuchsia-950/34"
  );
}

function cardTypeLabel(raw: Record<string, unknown>): string {
  const t = raw.type;
  if (typeof t === "string" && t.trim()) return t.trim();
  return "Card";
}

function badgeForCharacters(charRaw: unknown): string {
  const primary = primaryCharacterKey(charRaw);
  const map: Record<string, string> = {
    ironclad: "bg-rose-500/20 text-rose-100 ring-rose-400/35",
    silent: "bg-emerald-500/20 text-emerald-50 ring-emerald-400/35",
    defect: "bg-sky-500/20 text-sky-50 ring-sky-400/35",
    watcher: "bg-violet-500/20 text-violet-50 ring-violet-400/35",
    colorless: "bg-slate-600/35 text-slate-100 ring-slate-400/35",
    curse: "bg-black/65 text-zinc-200 ring-zinc-500/40",
    status: "bg-slate-700/55 text-slate-100 ring-slate-500/35",
  };
  return (
    map[primary] ?? "bg-fuchsia-500/15 text-fuchsia-50 ring-fuchsia-400/35"
  );
}

function rarityChip(rarity: unknown): string {
  const r = typeof rarity === "string" ? rarity.toLowerCase() : "";
  const map: Record<string, string> = {
    basic: "text-slate-200 ring-white/18 bg-slate-800/85",
    common: "text-slate-50 ring-emerald-500/35 bg-emerald-900/39",
    uncommon: "text-emerald-100 ring-emerald-400/42 bg-emerald-950/72",
    rare: "text-sky-100 ring-sky-400/43 bg-sky-950/70",
    special: "text-amber-100 ring-amber-400/43 bg-amber-950/60",
    curse: "text-zinc-500 ring-zinc-600 bg-zinc-900/75",
  };
  return map[r] ?? "text-slate-100 ring-white/22 bg-white/9";
}

function typingTarget(t: EventTarget | null): boolean {
  return (
    t instanceof HTMLInputElement ||
    t instanceof HTMLTextAreaElement ||
    t instanceof HTMLSelectElement ||
    (t instanceof HTMLElement && t.isContentEditable)
  );
}

function mergeCardsIntoBundle(
  bundle: Record<string, unknown>,
  cards: Record<string, Record<string, unknown>>,
): Record<string, unknown> {
  return { ...bundle, cards };
}

function galleryFieldKeysFromBundle(
  bundle: Record<string, unknown>,
): string[] {
  const meta = bundle._meta;
  if (!isRecord(meta)) return [];
  const g = meta.galleryFieldGuide;
  if (!isRecord(g)) return [];
  return Object.keys(g);
}

export function PlannerCardWorkbenchView({
  initialBundle,
}: PlannerCardWorkbenchViewProps) {
  const [bundle, setBundle] = useState<Record<string, unknown>>(initialBundle);

  const cardMap = useMemo(() => cardsFromBundle(bundle), [bundle]);

  const orderedIds = useMemo(() => sortedCardIds(cardMap), [cardMap]);

  const [index, setIndex] = useState(0);
  const n = orderedIds.length;
  const selectedId =
    n > 0 ? orderedIds[Math.min(Math.max(0, index), n - 1)] ?? "" : "";
  const selectedRaw =
    selectedId ? cardMap[selectedId] : null;

  const [cardJson, setCardJson] = useState("");
  const [cardJsonErr, setCardJsonErr] = useState<string | null>(null);
  const bundleRef = useRef(bundle);
  bundleRef.current = bundle;

  const galleryFieldKeys = useMemo(
    () => galleryFieldKeysFromBundle(bundle),
    [bundle],
  );

  const [tagListFilter, setTagListFilter] = useState("");
  const [pathFilters, setPathFilters] = useState<Set<string>>(() => new Set());
  const [fieldBranchesCollapsed, setFieldBranchesCollapsed] = useState<
    Set<string>
  >(() => new Set());

  const pathCatalog = useMemo(
    () => globalPathCatalog(cardMap, orderedIds, galleryFieldKeys),
    [cardMap, orderedIds, galleryFieldKeys],
  );

  const filteredPathCatalog = useMemo(() => {
    const q = tagListFilter.trim().toLowerCase();
    if (!q) return pathCatalog;
    return pathCatalog.filter((p) => p.toLowerCase().includes(q));
  }, [pathCatalog, tagListFilter]);

  const pathUsageCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const id of orderedIds) {
      const row = cardMap[id];
      if (!row) continue;
      for (const p of collectDottedPathsFromCard(row)) {
        m.set(p, (m.get(p) ?? 0) + 1);
      }
    }
    return m;
  }, [cardMap, orderedIds]);

  const [branchSortMode, setBranchSortMode] =
    useState<BranchSortMode>("alpha");

  const [ignoredSortPrefixes, setIgnoredSortPrefixes] = useState<
    Set<string>
  >(() => new Set());

  const ignoredPrefixesSortedList = useMemo(
    () => [...ignoredSortPrefixes].sort((a, b) => a.localeCompare(b)),
    [ignoredSortPrefixes],
  );

  const toggleIgnoreSortPrefix = useCallback((pathStr: string) => {
    setIgnoredSortPrefixes((prev) => {
      const next = new Set(prev);
      if (next.has(pathStr)) next.delete(pathStr);
      else next.add(pathStr);
      return next;
    });
  }, []);

  const clearIgnoredSortPrefixes = useCallback(() => {
    setIgnoredSortPrefixes(new Set());
  }, []);

  const sortedFilteredPathCatalog = useMemo(() => {
    const list = [...filteredPathCatalog];
    const cmpLast = (a: string, b: string): number => {
      const ia = pathForcedSortLast(a, ignoredSortPrefixes);
      const ib = pathForcedSortLast(b, ignoredSortPrefixes);
      if (ia !== ib) return ia ? 1 : -1;
      return 0;
    };

    if (branchSortMode === "alpha") {
      return list.sort((a, b) => {
        const c = cmpLast(a, b);
        if (c !== 0) return c;
        return a.localeCompare(b);
      });
    }
    if (!selectedRaw) {
      return list.sort((a, b) => {
        const c = cmpLast(a, b);
        if (c !== 0) return c;
        return a.localeCompare(b);
      });
    }
    if (branchSortMode === "activeFirst") {
      return list.sort((a, b) => {
        const c = cmpLast(a, b);
        if (c !== 0) return c;
        const partsA = a.split(".").filter(Boolean);
        const partsB = b.split(".").filter(Boolean);
        const ea = hasPath(selectedRaw, partsA);
        const eb = hasPath(selectedRaw, partsB);
        if (ea !== eb) return ea ? -1 : 1;
        return a.localeCompare(b);
      });
    }
    return list.sort((a, b) => {
      const c = cmpLast(a, b);
      if (c !== 0) return c;
      const ca = pathUsageCounts.get(a) ?? 0;
      const cb = pathUsageCounts.get(b) ?? 0;
      if (ca !== cb) return cb - ca;
      return a.localeCompare(b);
    });
  }, [
    filteredPathCatalog,
    branchSortMode,
    selectedRaw,
    pathUsageCounts,
    ignoredSortPrefixes,
  ]);

  const [cardRailFilter, setCardRailFilter] = useState("");

  const filteredOrderedIds = useMemo(() => {
    const q = cardRailFilter.trim().toLowerCase();
    if (!q) return orderedIds;
    return orderedIds.filter((id) => id.toLowerCase().includes(q));
  }, [orderedIds, cardRailFilter]);

  const toggleFieldBranch = useCallback((pathStr: string) => {
    setFieldBranchesCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(pathStr)) next.delete(pathStr);
      else next.add(pathStr);
      return next;
    });
  }, []);

  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect -- hydrate raw JSON pane only when changing card */
  useEffect(() => {
    if (!selectedId) {
      setCardJson("{}");
      setCardJsonErr(null);
      return;
    }
    const cards = cardsFromBundle(bundleRef.current);
    const row = cards[selectedId];
    setCardJson(row ? JSON.stringify(row, null, 2) : "{}");
    setCardJsonErr(null);
  }, [selectedId]);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- reset tree expansion */
  useEffect(() => {
    setFieldBranchesCollapsed(new Set());
  }, [selectedId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typingTarget(e.target)) return;
      if (!e.key || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === "g" || k === "G") {
        e.preventDefault();
        document.getElementById("pw-add-field")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }
      if (k === "f" || k === "F") {
        e.preventDefault();
        document.getElementById("pw-field-anchor")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }
      if (k === "d" || k === "D") {
        if (e.repeat) return;
        e.preventDefault();
        setBranchSortMode((m) => {
          const next = m === "activeFirst" ? "alpha" : "activeFirst";
          queueMicrotask(() =>
            toast(
              next === "activeFirst" ?
                "Path order: active on this card first (D on)"
              : "Path order: alphabetical (D off)",
              "info",
            ),
          );
          return next;
        });
        return;
      }
      if (k === "s" || k === "S") {
        if (e.repeat) return;
        e.preventDefault();
        setBranchSortMode((m) => {
          const next = m === "usageDesc" ? "alpha" : "usageDesc";
          queueMicrotask(() =>
            toast(
              next === "usageDesc" ?
                "Path order: most common across loaded cards first (S on)"
              : "Path order: alphabetical (S off)",
              "info",
            ),
          );
          return next;
        });
        return;
      }
      if (n === 0) return;
      if (k === "ArrowRight" || k === "]") {
        e.preventDefault();
        setIndex((i) => Math.min(n - 1, i + 1));
      }
      if (k === "ArrowLeft" || k === "[") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(Math.max(0, n - 1), i + 1)),
    [n],
  );

  const togglePathFilter = useCallback((pathStr: string) => {
    setPathFilters((prev) => {
      const next = new Set(prev);
      if (next.has(pathStr)) next.delete(pathStr);
      else next.add(pathStr);
      return next;
    });
  }, []);

  const clearPathFilters = useCallback(() => {
    setPathFilters(new Set());
  }, []);

  const updatePathForCard = useCallback(
    (pathStr: string, present: boolean) => {
      if (!selectedId) return;
      const parts = pathStr.split(".").filter(Boolean);
      if (parts.length === 0 || (parts[0] === "id" && parts.length === 1))
        return;
      setBundle((prev) => {
        const prevCards = cardsFromBundle(prev);
        const cur = prevCards[selectedId];
        if (!cur) return prev;
        const nextRow = setPathPresent(
          cur,
          parts,
          present,
          prevCards,
          orderedIds,
        );
        return mergeCardsIntoBundle(prev, {
          ...prevCards,
          [selectedId]: nextRow,
        });
      });
    },
    [selectedId, orderedIds],
  );

  const setValueForPath = useCallback(
    (pathStr: string, value: unknown) => {
      if (!selectedId) return;
      const parts = pathStr.split(".").filter(Boolean);
      if (parts.length === 0 || (parts[0] === "id" && parts.length === 1))
        return;
      setBundle((prev) => {
        const prevCards = cardsFromBundle(prev);
        const cur = prevCards[selectedId];
        if (!cur) return prev;
        const nextRow = setLeafValue(cur, parts, value);
        return mergeCardsIntoBundle(prev, {
          ...prevCards,
          [selectedId]: nextRow,
        });
      });
    },
    [selectedId],
  );

  const renamePathForCard = useCallback(
    (pathStr: string, newLeaf: string) => {
      if (!selectedId) return;
      const parts = pathStr.split(".").filter(Boolean);
      if (parts.length === 0 || parts[0] === "id") return;
      setBundle((prev) => {
        const prevCards = cardsFromBundle(prev);
        const cur = prevCards[selectedId];
        if (!cur) return prev;
        const nextRow = renameLeafAtPath(cur, parts, newLeaf);
        return mergeCardsIntoBundle(prev, {
          ...prevCards,
          [selectedId]: nextRow,
        });
      });
    },
    [selectedId],
  );

  const addFieldForCard = useCallback(
    (fullPath: string, value: unknown) => {
      if (!selectedId) return;
      const parts = fullPath.split(".").filter(Boolean);
      if (parts.length === 0 || (parts[0] === "id" && parts.length === 1))
        return;
      setBundle((prev) => {
        const prevCards = cardsFromBundle(prev);
        const cur = prevCards[selectedId];
        if (!cur) return prev;
        const nextRow = setLeafValue(cur, parts, value);
        return mergeCardsIntoBundle(prev, {
          ...prevCards,
          [selectedId]: nextRow,
        });
      });
    },
    [selectedId],
  );

  const reloadCardJsonFromState = useCallback(() => {
    if (!selectedId) return;
    const row = cardsFromBundle(bundle)[selectedId];
    setCardJson(row ? JSON.stringify(row, null, 2) : "{}");
    setCardJsonErr(null);
    toast("Card JSON pane synced from edited fields", "info");
  }, [bundle, selectedId]);

  const applyCardJson = useCallback(() => {
    if (!selectedId) return;
    try {
      const parsed = JSON.parse(cardJson) as Record<string, unknown>;
      parsed.id = selectedId;
      setCardJsonErr(null);
      setBundle((prev) => {
        const prevCards = cardsFromBundle(prev);
        const nextCards = { ...prevCards, [selectedId]: parsed };
        return mergeCardsIntoBundle(prev, nextCards);
      });
      toast("Card merged into bundle (in-memory)", "success");
    } catch (err) {
      setCardJsonErr(err instanceof Error ? err.message : "Invalid JSON");
      toast(
        err instanceof Error ? err.message : "Invalid JSON",
        "error",
      );
    }
  }, [cardJson, selectedId]);

  const fullBundlePretty = useMemo(
    () => JSON.stringify(bundle, null, 2),
    [bundle],
  );

  const topKeys = useMemo(() => Object.keys(bundle).slice(0, 16), [bundle]);

  const copyFullBundle = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullBundlePretty);
      toast("Copied full STS_CARDS_DB snapshot", "success");
    } catch {
      toast("Could not copy to clipboard", "error");
    }
  }, [fullBundlePretty]);

  const pathFilterRibbon =
    pathFilters.size > 0 ?
      <div className="mb-4 space-y-1.5 rounded-xl bg-teal-950/35 px-3 py-2 ring-1 ring-teal-500/25">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-200/90">
            Path highlights (tree)
          </span>
          <button
            type="button"
            className="text-[10px] font-medium text-teal-400 hover:underline"
            onClick={clearPathFilters}
          >
            Clear all
          </button>
        </div>
        <ul className="flex max-h-16 flex-wrap gap-1 overflow-y-auto">
          {[...pathFilters].sort().map((p) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => togglePathFilter(p)}
                className="inline-flex items-center gap-1 rounded-full border border-teal-800/58 bg-teal-950/60 px-2 py-0.5 font-mono text-[10px] text-teal-100 hover:bg-teal-900/50"
              >
                <span className="max-w-[18rem] truncate">{p}</span>
                <span className="text-teal-400" aria-hidden>
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    : null;

  const fieldEditorPane = (
    <section
      className={`rounded-3xl border border-white/14 bg-linear-to-br from-white/[0.06] via-slate-900/92 to-violet-950/22 p-[1px] shadow-[0_26px_60px_-32px_rgba(109,44,246,0.55)]`}
    >
      <div className="rounded-[22px] bg-slate-950/93 p-4 sm:p-5">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300/90">
            Field editor
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            Structured paths · add field · tree
          </h2>
          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
            {selectedId ?
              selectedId
            : "Select a card — use Prev / Next"}
          </p>
        </div>

        {!selectedRaw || !selectedId ?
          <p className="rounded-xl border border-dashed border-white/15 py-14 text-center text-sm text-slate-500">
            No card loaded.
          </p>
        : (
          <>
            {pathFilterRibbon}
            <details className="mb-4 rounded-xl border border-white/13 bg-black/52">
              <summary className="cursor-pointer select-none px-3 py-2.5 text-xs font-medium text-slate-200 marker:content-none sm:px-4 [&::-webkit-details-marker]:hidden">
                <span className="font-bold uppercase tracking-wide text-slate-500">
                  Path catalog
                </span>
                <span className="ml-2 font-normal text-slate-600">
                  — tap path to highlight tree · ◇ pushes path (and nested fields) to{" "}
                  <span className="text-amber-200/85">sort last</span> (
                  {sortedFilteredPathCatalog.length}/{pathCatalog.length})
                </span>
              </summary>
              <div className="border-t border-white/10 px-3 pb-4 pt-3 sm:px-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-white/11 pb-3">
                  <input
                    type="search"
                    value={tagListFilter}
                    placeholder="Filter path list…"
                    onChange={(e) => setTagListFilter(e.target.value)}
                    className="min-w-[10rem] flex-1 rounded-lg border border-white/14 bg-black/72 px-2 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-violet-500/55 focus:outline-none"
                  />
                </div>
                <ul className="mt-2 max-h-48 space-y-0.5 overflow-y-auto lg:max-h-60">
                  {sortedFilteredPathCatalog.map((pathStr) => {
                    const active = pathFilters.has(pathStr);
                    const sortPinned = ignoredSortPrefixes.has(pathStr);
                    const sortMuted = pathForcedSortLast(
                      pathStr,
                      ignoredSortPrefixes,
                    );
                    return (
                      <li key={pathStr}>
                        <div
                          className={`flex gap-1 rounded-lg px-1 py-0.5 ${
                            sortMuted ?
                              sortPinned ?
                                "bg-amber-950/35 ring-1 ring-amber-500/25"
                              : "opacity-92"
                            : ""
                          }`}
                        >
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={() => togglePathFilter(pathStr)}
                            className={`min-w-0 flex-1 items-start rounded-md px-2 py-1.5 text-left font-mono text-[10px] leading-snug transition-colors ${
                              active ?
                                "bg-violet-900/73 text-white ring-1 ring-violet-400/40"
                              : "text-slate-500 hover:bg-white/9 hover:text-slate-200"
                            }`}
                          >
                            <span className="break-all">{pathStr}</span>
                          </button>
                          <button
                            type="button"
                            title="Sort last · this path and all nested fields appear after others"
                            aria-pressed={sortPinned}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleIgnoreSortPrefix(pathStr);
                            }}
                            className={`shrink-0 self-start rounded-md px-1.5 py-1.5 text-[11px] font-semibold transition-colors ${
                              sortMuted ?
                                "text-amber-200 ring-1 ring-amber-500/45 hover:bg-amber-950/50"
                              : "text-slate-600 hover:bg-white/8 hover:text-amber-200/95"
                            }`}
                          >
                            ◇
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>

            <AddFieldForm
              anchorId="pw-add-field"
              pathCatalog={pathCatalog}
              pathUsageCounts={pathUsageCounts}
              selectedRaw={selectedRaw}
              onAdd={(fullPath, value) =>
                addFieldForCard(fullPath, value)
              }
            />

            <div id="pw-field-anchor" className="mt-5 scroll-mt-28">
              <h3 className="text-sm font-semibold text-slate-200">Fields</h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Toggle paths, rename, edit primitives. Root rows: teal = on card · rose ={" "}
                <span className="font-medium text-rose-300/90">Later</span> (sort subtree last).
              </p>
              <div className="mt-3 rounded-xl border border-white/13 bg-black/44 p-3 sm:p-4">
                <FieldEditorTree
                  parentPath=""
                  depth={0}
                  pathCatalog={pathCatalog}
                  selectedRaw={selectedRaw}
                  onSetPath={(pathStr, present) =>
                    updatePathForCard(pathStr, present)
                  }
                  onSetValue={(pathStr, v) =>
                    setValueForPath(pathStr, v)
                  }
                  onRenameLeaf={(pathStr, leaf) =>
                    renamePathForCard(pathStr, leaf)
                  }
                  collapsedBranches={fieldBranchesCollapsed}
                  onToggleBranch={toggleFieldBranch}
                  pathFilters={pathFilters}
                  branchSortMode={branchSortMode}
                  pathUsageCounts={pathUsageCounts}
                  ignoredSortPrefixes={ignoredSortPrefixes}
                  onToggleIgnoreSortPrefix={toggleIgnoreSortPrefix}
                />
              </div>
            </div>
          </>
        )}

        <div className="mt-8 border-t border-white/10 pt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Bundle top-level keys
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {topKeys.map((key) => (
              <li
                key={key}
                className="rounded-full border border-white/12 bg-black/41 px-2.5 py-1 font-mono text-[10px] text-violet-200/93"
              >
                {key}
              </li>
            ))}
            {Object.keys(bundle).length > topKeys.length ?
              <li className="rounded-full px-2 py-1 text-[10px] text-slate-500">
                +{Object.keys(bundle).length - topKeys.length} more
              </li>
            : null}
          </ul>
        </div>
      </div>
    </section>
  );

  const cardRecordJsonPane = (
    <section className="shrink-0 overflow-hidden rounded-3xl border border-white/14 bg-linear-to-br from-black/71 via-violet-950/18 to-black/71 p-[1px] shadow-[0_24px_70px_-40px_rgb(147,116,246)] backdrop-blur-sm">
      <div className="rounded-[22px] bg-slate-950/93 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3 gap-y-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300/90">
              Card record
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
              Raw JSON (this card only)
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500">
              {selectedId ||
                "—"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!selectedId}
              onClick={reloadCardJsonFromState}
              className="rounded-full border border-white/18 px-3 py-2 text-[11px] font-medium text-slate-200 hover:bg-white/9 disabled:opacity-35"
            >
              Sync from field editor
            </button>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-violet-500/90 px-3 py-2 text-[11px] font-semibold text-white hover:bg-violet-400 disabled:opacity-35"
              disabled={!selectedId}
              onClick={applyCardJson}
            >
              Apply to bundle · Ctrl+Enter
            </button>
          </div>
        </div>

        <textarea
          value={cardJson}
          spellCheck={false}
          rows={14}
          onChange={(e) => setCardJson(e.target.value)}
          className="mt-4 w-full min-h-[220px] resize-y rounded-xl border border-white/12 bg-black/71 px-3 py-3 font-mono text-[11px] leading-snug text-slate-200 shadow-inner outline-none placeholder:text-slate-600 focus:border-violet-500/54 focus:ring-1 focus:ring-violet-500/30"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              applyCardJson();
            }
          }}
        />
        {cardJsonErr ?
          <p className="mt-2 text-xs text-red-400">{cardJsonErr}</p>
        : (
          <p className="mt-2 text-[11px] text-slate-400">
            In-memory only · does not overwrite{" "}
            <code className="font-mono text-slate-400">STS_CARDS_DB.json</code> —
            paste from &quot;Copy all&quot; below if you replace the file.
          </p>
        )}
      </div>
    </section>
  );

  const cardPane =
    selectedRaw ?
      <article
        className={`rounded-3xl border p-[1px] ${shellForCharacters(selectedRaw.characters ?? selectedRaw.character)}`}
      >
        <div className="rounded-[23px] p-6 sm:p-8">
          <header className="flex flex-wrap items-start gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 uppercase ${badgeForCharacters(selectedRaw.characters ?? selectedRaw.character)}`}
            >
              {String(selectedRaw.characters ?? selectedRaw.character ?? "—")}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ring-1 ${rarityChip(selectedRaw.rarity)}`}
            >
              {String(selectedRaw.rarity ?? "—")}
            </span>
            <span className="ml-auto rounded-lg bg-black/53 px-2.5 py-1 font-mono text-[11px] text-slate-200 ring-1 ring-white/15 tabular-nums">
              Cost {costBadge(selectedRaw)}
            </span>
          </header>

          <h1 className="mt-6 text-balance bg-linear-to-br from-white via-white to-violet-200/88 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
            {String(selectedRaw.name ?? selectedId)}
          </h1>
          <p className="mt-1 font-mono text-[11px] tracking-wide text-violet-200/76">
            {String(selectedRaw.type ?? "Card")}
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-white/[0.06] bg-black/35 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-100/93">
                {typeof selectedRaw.description === "string" ?
                  selectedRaw.description
                : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Upgraded
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
                {typeof selectedRaw.descriptionUpgraded === "string" ?
                  selectedRaw.descriptionUpgraded
                : "Same as base or not set"}
              </p>
            </div>
          </div>
        </div>
      </article>
    : (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-900/92 p-12 text-center text-sm text-slate-500">
        No card data.
      </div>
    );

  return (
    <main className="relative isolate flex min-h-0 flex-1 flex-col">
      {/* Ambient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-36 -z-10 h-[min(55vh,620px)] bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.34),transparent_62%),radial-gradient(ellipse_at_80%_50%,rgba(232,121,249,0.15),transparent_48%)]"
      />

      <div className="mx-auto flex w-full max-w-[min(112rem,calc(100vw-1.5rem))] min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-6 lg:gap-6 lg:pb-8 xl:pr-10">
        <header className="shrink-0 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-300/88">
            Planner · STS_CARDS_DB
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4 lg:max-w-[min(48rem,calc(100vw-26rem))]">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Browse & patch cards
            </h2>
            <p className="hidden text-[11px] text-slate-500 sm:block lg:hidden">
              Tip: widen the window for a fixed shortcut panel bottom-right.
            </p>
          </div>

          {/* Collapsible shortcuts on small screens */}
          <details className="rounded-xl border border-white/11 bg-black/40 px-3 py-2 backdrop-blur-sm lg:hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer select-none text-[11px] font-semibold tracking-wide text-slate-400 marker:content-none">
              Keyboard shortcuts
            </summary>
            <dl className="mt-2 space-y-1 border-t border-white/10 pt-2 text-[11px] text-slate-400">
              <div>
                ← / → or [ ] · cards ·{" "}
                <span className="text-slate-500">G</span> add field ·{" "}
                <span className="text-slate-500">F</span> fields ·{" "}
                <span className="text-slate-500">D</span> active first (again A→Z) ·{" "}
                <span className="text-slate-500">S</span> most-used (again A→Z) · Path catalog{" "}
                <span className="text-amber-500/90">◇</span> sort last
              </div>
            </dl>
          </details>
        </header>

        {/* Fixed sort-last paths + shortcuts (desktop) */}
        <aside
          aria-label="Sort-last paths and shortcuts"
          className="pointer-events-none fixed bottom-6 right-6 z-40 hidden w-[min(19.75rem,calc(100vw-8rem))] lg:flex lg:flex-col lg:gap-3 xl:w-[21rem]"
        >
          <div className="pointer-events-auto flex max-h-36 flex-col rounded-2xl border border-amber-500/22 bg-slate-950/94 px-3.5 py-3 shadow-[0_24px_50px_-18px_rgba(245,158,11,0.22)] backdrop-blur-md ring-1 ring-amber-500/15">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/90">
                Sort last
              </p>
              {ignoredPrefixesSortedList.length > 0 ?
                <button
                  type="button"
                  onClick={clearIgnoredSortPrefixes}
                  className="shrink-0 text-[10px] font-medium text-amber-400/90 hover:underline"
                >
                  Clear
                </button>
              : null}
            </div>
            <p className="mt-1 text-[10px] leading-snug text-slate-500">
              Prefixes from path catalog (◇). Nested paths follow the same rule.
            </p>
            {ignoredPrefixesSortedList.length === 0 ?
              <p className="mt-2 text-[11px] text-slate-500">None — use ◇ in Path catalog.</p>
            : (
              <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto pr-0.5 font-mono text-[10px] leading-snug text-amber-100/95">
                {ignoredPrefixesSortedList.map((p) => (
                  <li key={p} className="flex items-start gap-1">
                    <span className="min-w-0 flex-1 break-all">{p}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${p} from sort-last`}
                      onClick={() => toggleIgnoreSortPrefix(p)}
                      className="shrink-0 text-amber-400/90 hover:text-amber-200"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pointer-events-auto rounded-2xl border border-white/16 bg-slate-950/92 px-3.5 py-3 shadow-[0_28px_60px_-20px_rgba(109,42,246,0.42)] backdrop-blur-md ring-1 ring-violet-500/18">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Shortcuts
            </p>
            <dl className="mt-2 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex gap-2">
                <dt className="shrink-0">
                  <kbd className="rounded border border-white/18 bg-black/72 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                    ←
                  </kbd>
                  /
                  <kbd className="ml-px rounded border border-white/18 bg-black/72 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                    →
                  </kbd>
                </dt>
                <dd className="text-slate-400">Cards</dd>
              </div>
              <div className="flex gap-2">
                <dt>
                  <kbd className="rounded border border-white/18 bg-black/72 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                    G
                  </kbd>
                </dt>
                <dd className="text-slate-400">Add field</dd>
              </div>
              <div className="flex gap-2">
                <dt>
                  <kbd className="rounded border border-white/18 bg-black/72 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                    F
                  </kbd>
                </dt>
                <dd className="text-slate-400">Field tree</dd>
              </div>
              <div className="flex gap-2">
                <dt>
                  <kbd className="rounded border border-white/18 bg-black/72 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                    D
                  </kbd>
                </dt>
                <dd className="text-slate-400">
                  Active paths first (again → A→Z)
                </dd>
              </div>
              <div className="flex gap-2">
                <dt>
                  <kbd className="rounded border border-white/18 bg-black/72 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                    S
                  </kbd>
                </dt>
                <dd className="text-slate-400">
                  Most-used paths first (again → A→Z)
                </dd>
              </div>
              <div className="flex gap-2">
                <dt>
                  <kbd className="rounded border border-white/18 bg-black/72 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                    [ ]
                  </kbd>
                </dt>
                <dd className="text-slate-400">Prev / next card</dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Toolbar */}
        <div className="shrink-0 flex flex-wrap items-center gap-2 rounded-3xl border border-white/13 bg-black/52 px-3 py-2.5 shadow-[0_20px_50px_-40px_rgb(147,112,246)] backdrop-blur-md sm:px-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={n <= 1}
            className="rounded-xl border border-white/18 bg-black/62 px-2.5 py-2 text-[11px] font-medium text-slate-100 hover:bg-black/73 disabled:opacity-35 sm:py-2"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={n <= 1}
            className="rounded-xl border border-white/18 bg-black/62 px-2.5 py-2 text-[11px] font-medium text-slate-100 hover:bg-black/73 disabled:opacity-35 sm:py-2"
          >
            Next
          </button>
          <span className="min-w-[52px] text-center font-mono text-[11px] tabular-nums text-slate-400">
            {n ? `${index + 1}/${n}` : "—"}
          </span>

          <span className="mx-1 hidden h-6 w-px bg-white/12 sm:inline" />

          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Path order
          </span>
          <button
            type="button"
            title="Active fields first — press again for A→Z · D"
            onClick={() => {
              setBranchSortMode((m) =>
                m === "activeFirst" ? "alpha" : "activeFirst",
              );
            }}
            className={`rounded-2xl px-2.5 py-2 text-[11px] font-semibold sm:px-3 ${
              branchSortMode === "activeFirst" ?
                "bg-teal-600/85 text-white ring-1 ring-teal-400/60"
              : "text-slate-400 ring-1 ring-white/12 hover:bg-white/8"
            }`}
          >
            Active first · D
          </button>
          <button
            type="button"
            title="Most-used fields first — press again for A→Z · S"
            onClick={() => {
              setBranchSortMode((m) =>
                m === "usageDesc" ? "alpha" : "usageDesc",
              );
            }}
            className={`rounded-2xl px-2.5 py-2 text-[11px] font-semibold sm:px-3 ${
              branchSortMode === "usageDesc" ?
                "bg-indigo-600/85 text-white ring-1 ring-indigo-400/55"
              : "text-slate-400 ring-1 ring-white/12 hover:bg-white/8"
            }`}
          >
            Most used · S
          </button>
          {branchSortMode === "alpha" ?
            <span className="text-[10px] text-slate-500">A→Z</span>
          : null}
          {ignoredPrefixesSortedList.length > 0 ?
            <button
              type="button"
              onClick={clearIgnoredSortPrefixes}
              className="text-[10px] font-medium text-amber-400/90 hover:underline"
            >
              Clear sort-last ({ignoredPrefixesSortedList.length})
            </button>
          : null}
        </div>

        {/* Left rail · wide field column · sticky preview column (shortcut panel sits bottom-right fixed) */}
        {/* Let the page scroll container (outer div) handle vertical wheel; nested overflow-y traps events. */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-7">
          <aside className="flex max-h-[13rem] min-h-0 w-full shrink-0 flex-col gap-2 rounded-2xl border border-white/12 bg-black/45 p-3 backdrop-blur-sm lg:max-h-none lg:w-[min(19rem,24vw)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Cards
              </span>
              <span className="font-mono text-[10px] tabular-nums text-slate-500">
                {filteredOrderedIds.length}/{n}
              </span>
            </div>
            <input
              type="search"
              value={cardRailFilter}
              placeholder="Filter list…"
              onChange={(e) => setCardRailFilter(e.target.value)}
              className="rounded-lg border border-white/14 bg-black/72 px-2 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-violet-500/55 focus:outline-none"
            />
            {cardRailFilter.trim() &&
            selectedId &&
            !filteredOrderedIds.includes(selectedId) ?
              <p className="text-[10px] text-amber-400/95">
                Current card hidden by filter — clear search or pick another id.
              </p>
            : null}
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
              {filteredOrderedIds.map((id) => {
                const selected = id === selectedId;
                const listIndex = orderedIds.indexOf(id) + 1;
                const rowRaw = cardMap[id];
                const accent =
                  rowRaw ?
                    railAccentForCharacters(rowRaw.characters ?? rowRaw.character)
                  : "border-l-slate-600 bg-slate-900/50";
                const typeStr = rowRaw ? cardTypeLabel(rowRaw) : "—";
                const costStr = rowRaw ? costBadge(rowRaw) : "—";
                return (
                  <li key={id}>
                    <button
                      type="button"
                      data-planner-card-rail-selected={selected ? "true" : undefined}
                      onClick={() =>
                        setIndex(orderedIds.indexOf(id))
                      }
                      title={id}
                      className={`flex w-full flex-col gap-1 rounded-lg border border-white/11 border-l-[3px] py-2 pl-2 pr-2 text-left text-[11px] transition-colors ${
                        selected ?
                          `${accent} text-white shadow-[inset_0_0_0_1px_rgba(167,139,250,0.35)] ring-2 ring-violet-400/55 ring-offset-2 ring-offset-slate-950`
                        : `${accent} text-slate-300`
                      }`}
                    >
                      <div className="flex items-stretch gap-2.5">
                        <span
                          className={`flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center rounded-xl border-2 font-mono text-lg font-bold tabular-nums leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:min-w-[3rem] sm:text-xl ${
                            selected ?
                              "border-violet-300/75 bg-violet-950/95 text-white ring-2 ring-violet-400/50"
                            : "border-white/25 bg-black/70 text-slate-50"
                          }`}
                          title={`#${listIndex} of ${n} in bundle order`}
                        >
                          {listIndex}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                                selected ?
                                  "bg-violet-200 shadow-[0_0_8px_rgba(196,181,253,0.9)]"
                                : "bg-white/35"
                              }`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-medium leading-tight tracking-tight text-slate-100">
                              {id}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1 pl-5">
                            <span
                              className="inline-flex max-w-full truncate rounded-md bg-black/52 px-1.5 py-0.5 text-[9px] font-semibold capitalize leading-none text-violet-100 ring-1 ring-white/14"
                              title={typeStr}
                            >
                              {typeStr}
                            </span>
                            <span className="inline-flex rounded-md bg-black/62 px-1.5 py-0.5 font-mono text-[9px] font-semibold leading-none tracking-tight text-slate-100 ring-1 ring-white/14 tabular-nums">
                              {costStr}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="min-h-0 min-w-0 flex-1">{fieldEditorPane}</div>

          {/* Mobile / tablet: preview in document flow */}
          <div className="w-full shrink-0 lg:hidden">{cardPane}</div>

          {/* Desktop: spacer matches fixed preview width so layout stays balanced */}
          <div
            className="pointer-events-none hidden shrink-0 select-none lg:block lg:w-[min(26rem,32vw)]"
            aria-hidden
          />

          {/* Desktop: fixed preview follows viewport while main column scrolls */}
          <div className="pointer-events-none fixed top-[5.15rem] right-4 z-[26] hidden w-[min(26rem,calc(100vw-11rem))] max-w-[min(32vw,26rem)] lg:block xl:right-8">
            <div className="pointer-events-auto max-h-[calc(100dvh-6rem)] overflow-y-auto pr-1 [scrollbar-gutter:stable]">
              {cardPane}
            </div>
          </div>
        </div>

        {/* Per-card raw JSON (bottom, above full bundle) */}
        {cardRecordJsonPane}

        {/* Full-imported JSON */}
        <section className="shrink-0 overflow-hidden rounded-3xl border border-white/13 bg-black/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/13 px-5 py-3.5 sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Full imported snapshot
              </p>
              <p className="mt-1 text-[13px] font-medium text-slate-200">
                <code className="font-mono text-violet-200/95">STS_CARDS_DB.json</code>{" "}
                after in-memory merges
              </p>
            </div>
            <button
              type="button"
              onClick={copyFullBundle}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-white/20 bg-linear-to-br from-violet-400/94 to-indigo-500/98 px-3 py-2 text-[11px] font-semibold text-white shadow-xl shadow-violet-900/72 hover:from-violet-300 hover:to-indigo-400"
            >
              <ClipboardCopy className="h-4 w-4" aria-hidden /> Copy all
            </button>
          </div>
          <div className="relative max-h-[min(440px,calc(100dvh-16rem))] overflow-auto px-5 py-5">
            <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-snug text-slate-300">
              <code>{fullBundlePretty}</code>
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
