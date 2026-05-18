"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  Hash,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { STS_ICON_GLYPH } from "@/app/card-design-gallery/galleryStsGlyphs";
import type { CustomGlyph, CustomGlyphFieldLink, CustomGlyphSource } from "@/app/types/glyphTypes";
import {
  loadCustomGlyphs,
  saveCustomGlyphs,
  resetCustomGlyphs,
  loadBuiltinGlyphOverrides,
  saveBuiltinGlyphOverrides,
} from "@/app/utils/customGlyphRegistry";
import rawDb from "@/app/data/db/STS_CARDS_DB.json";

// ─── Color palette ────────────────────────────────────────────────────────────

const COLOR_SWATCHES: { cls: string; label: string; hex: string }[] = [
  { cls: "text-amber-300",   label: "Amber",    hex: "#fcd34d" },
  { cls: "text-yellow-300",  label: "Yellow",   hex: "#fde047" },
  { cls: "text-orange-300",  label: "Orange",   hex: "#fdba74" },
  { cls: "text-rose-400",    label: "Rose",     hex: "#fb7185" },
  { cls: "text-red-400",     label: "Red",      hex: "#f87171" },
  { cls: "text-emerald-300", label: "Emerald",  hex: "#6ee7b7" },
  { cls: "text-lime-300",    label: "Lime",     hex: "#bef264" },
  { cls: "text-teal-300",    label: "Teal",     hex: "#5eead4" },
  { cls: "text-cyan-300",    label: "Cyan",     hex: "#67e8f9" },
  { cls: "text-sky-300",     label: "Sky",      hex: "#7dd3fc" },
  { cls: "text-blue-400",    label: "Blue",     hex: "#60a5fa" },
  { cls: "text-indigo-300",  label: "Indigo",   hex: "#a5b4fc" },
  { cls: "text-violet-300",  label: "Violet",   hex: "#c4b5fd" },
  { cls: "text-fuchsia-300", label: "Fuchsia",  hex: "#f0abfc" },
  { cls: "text-pink-300",    label: "Pink",     hex: "#f9a8d4" },
  { cls: "text-slate-300",   label: "Slate",    hex: "#cbd5e1" },
  { cls: "text-slate-500",   label: "Muted",    hex: "#64748b" },
  { cls: "text-white",       label: "White",    hex: "#ffffff" },
];

// ─── Built-in glyph list ──────────────────────────────────────────────────────

const BUILTIN_GLYPHS = Object.entries(STS_ICON_GLYPH).map(([key, meta]) => ({
  key,
  shortLabel: meta.shortLabel,
  Icon: meta.Icon,
  iconClass: meta.iconClass,
}));

// ─── Dynamic card field list (derived from DB) ────────────────────────────────

const SKIP_FIELDS = new Set([
  "_uid","name","type","isUpgraded","isChanged","isSelected","isXCost",
  "potionTags","description","descriptionUpgraded","iconCatalog","id",
  "character","rarity","color","pool",
]);

type KnownFieldType = "boolean" | "numeric" | "presence";
type KnownField = { name: string; type: KnownFieldType };

function inferFieldType(val: unknown): KnownFieldType | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "number") return "numeric";
  if (typeof val === "object" && !Array.isArray(val)) {
    const o = val as Record<string, unknown>;
    if (typeof o.base === "boolean") return "boolean";
    if (typeof o.base === "number") return "numeric";
    return "presence";
  }
  return null;
}

function buildKnownCardFields(): KnownField[] {
  const typeMap = new Map<string, KnownFieldType>();
  const db = rawDb as Record<string, unknown>;
  const cards = (Array.isArray(db.cards) ? db.cards : Object.values(db)) as Record<string, unknown>[];
  for (const card of cards) {
    if (typeof card !== "object" || !card) continue;
    for (const [key, val] of Object.entries(card)) {
      if (SKIP_FIELDS.has(key) || typeMap.has(key)) continue;
      const t = inferFieldType(val);
      if (t) typeMap.set(key, t);
    }
  }
  return [...typeMap.entries()]
    .map(([name, type]) => ({ name, type }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const KNOWN_CARD_FIELDS: KnownField[] = buildKnownCardFields();

// ─── Lucide icon categories ───────────────────────────────────────────────────

type LucideCategory = { label: string; keywords: string[] };

const LUCIDE_CATEGORIES: LucideCategory[] = [
  { label: "All",       keywords: [] },
  { label: "Shapes",    keywords: ["circle","square","triangle","diamond","hexagon","star","heart","cross","ring","globe"] },
  { label: "Arrows",    keywords: ["arrow","chevron","corner","return","turn","move","drag","sort","swap","pointer"] },
  { label: "Files",     keywords: ["file","folder","document","page","note","book","clipboard","paper","archive","zip","text"] },
  { label: "People",    keywords: ["user","person","people","contact","profile","account","avatar","group","team","human"] },
  { label: "Nature",    keywords: ["leaf","tree","flower","sun","moon","cloud","wind","rain","snow","flame","droplet","wave","mountain","bug","fish","bird","plant","seedling"] },
  { label: "Media",     keywords: ["play","pause","stop","skip","rewind","volume","mute","audio","video","camera","image","photo","film","mic","speaker","music","podcast","headphone"] },
  { label: "Tech",      keywords: ["code","terminal","cpu","server","database","network","wifi","bluetooth","monitor","laptop","phone","tablet","keyboard","chip","circuit","robot","bot","qr"] },
  { label: "Actions",   keywords: ["edit","delete","trash","save","download","upload","share","copy","paste","refresh","search","filter","lock","unlock","flag","pin","bookmark","send","mail","bell","calendar","clock","timer","alarm","settings","tool","wrench","gear","key","shield","eye","ban","check","plus","minus","slash"] },
  { label: "Charts",    keywords: ["chart","graph","bar","pie","line","trending","analytics","report","stat","activity","percent"] },
];

function matchesCategory(name: string, cat: LucideCategory): boolean {
  if (cat.keywords.length === 0) return true;
  const lower = name.replace(/([A-Z])/g, " $1").toLowerCase();
  return cat.keywords.some((kw) => lower.includes(kw));
}

// ─── Blank custom glyph ───────────────────────────────────────────────────────

function blankGlyph(): CustomGlyph {
  return {
    key: "",
    shortLabel: "",
    iconClass: "text-amber-300",
    source: { type: "lucide", iconName: "Star" },
    fieldLink: { mode: "none" },
    hideNumber: false,
    tooltip: "",
  };
}

// ─── SVG sanitize ─────────────────────────────────────────────────────────────

function sanitizeSvg(raw: string): string {
  return raw.replace(/<script[\s\S]*?<\/script>/gi, "").trim();
}

// ─── Chip preview component ───────────────────────────────────────────────────

function GlyphChip({
  source,
  iconClass,
  shortLabel,
  numericValue,
  iconCls = "h-4 w-4",
  resolvedIcon,
}: {
  source: CustomGlyphSource;
  iconClass: string;
  shortLabel: string;
  numericValue?: number;
  iconCls?: string;
  resolvedIcon?: LucideIcon;
}) {
  const svgData =
    source.type === "svg"
      ? source.svgData
      : source.type === "url"
        ? source.cachedSvg
        : undefined;

  return (
    <span
      title={shortLabel}
      className="inline-flex items-center gap-0.5 rounded-md border border-white/15 bg-black/20 px-1.5 py-0.5 text-xs"
    >
      {source.type === "lucide" && resolvedIcon ? (
        <span className={`${iconClass} ${iconCls} shrink-0 inline-flex items-center`}>
          {(() => { const Ic = resolvedIcon; return <Ic className={`${iconClass} ${iconCls}`} />; })()}
        </span>
      ) : svgData ? (
        <span
          className={`${iconClass} ${iconCls} inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full`}
          dangerouslySetInnerHTML={{ __html: svgData }}
        />
      ) : (
        <span className={`${iconClass} ${iconCls} inline-block rounded bg-white/10`} />
      )}
      {shortLabel && <span className="text-slate-300">{shortLabel}</span>}
      {numericValue !== undefined && (
        <span className="tabular-nums font-bold text-slate-200">{numericValue}</span>
      )}
    </span>
  );
}

// ─── Lucide icon picker ────────────────────────────────────────────────────────

const PAGE_SIZE = 48;

function LucideIconPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState("All");
  const [allNames, setAllNames] = useState<string[]>([]);
  const [resolvedIcons, setResolvedIcons] = useState<Record<string, LucideIcon>>({});

  useEffect(() => {
    import("lucide-react").then((mod) => {
      const names = Object.entries(mod)
        .filter(([, v]) => typeof v === "function")
        .map(([k]) => k)
        .filter((k) => k !== "default" && /^[A-Z]/.test(k))
        .sort();
      setAllNames(names);
      const resolved: Record<string, LucideIcon> = {};
      for (const [k, v] of Object.entries(mod)) {
        if (typeof v === "function" && /^[A-Z]/.test(k)) {
          resolved[k] = v as LucideIcon;
        }
      }
      setResolvedIcons(resolved);
    });
  }, []);

  const activeCat = LUCIDE_CATEGORIES.find((c) => c.label === category) ?? LUCIDE_CATEGORIES[0];

  const filtered = useMemo(() => {
    let names = allNames;
    if (activeCat.keywords.length > 0) names = names.filter((n) => matchesCategory(n, activeCat));
    if (search.trim()) names = names.filter((n) => n.toLowerCase().includes(search.toLowerCase()));
    return names;
  }, [allNames, activeCat, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageNames = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleCategoryChange(label: string) {
    setCategory(label);
    setPage(0);
  }

  return (
    <div className="space-y-2">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {LUCIDE_CATEGORIES.map(({ label }) => (
          <button
            key={label}
            onClick={() => handleCategoryChange(label)}
            className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${
              category === label
                ? "bg-violet-600/40 text-violet-200"
                : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
          placeholder="Search icons…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {/* Grid */}
      <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-700/60 bg-slate-900/60 p-1">
        {allNames.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-500">Loading icons…</p>
        ) : pageNames.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-500">No icons match</p>
        ) : (
          <div className="grid grid-cols-8 gap-0.5">
            {pageNames.map((name) => {
              const Ic = resolvedIcons[name];
              const isSel = name === selected;
              return (
                <button
                  key={name}
                  title={name}
                  onClick={() => onSelect(name)}
                  className={`flex flex-col items-center gap-0.5 rounded p-1.5 transition ${
                    isSel
                      ? "bg-violet-600/40 ring-1 ring-violet-400/60"
                      : "hover:bg-slate-700/60"
                  }`}
                >
                  {Ic ? <Ic className="h-4 w-4 text-slate-300" /> : <span className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded px-2 py-0.5 hover:bg-slate-700 disabled:opacity-30"
          >
            ← Prev
          </button>
          <span>{page + 1} / {pageCount}</span>
          <button
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded px-2 py-0.5 hover:bg-slate-700 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      {selected && (
        <p className="text-[10px] text-slate-400">
          Selected: <span className="font-mono text-violet-300">{selected}</span>
        </p>
      )}
    </div>
  );
}

// ─── Color picker row ─────────────────────────────────────────────────────────

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (cls: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {COLOR_SWATCHES.map((s) => (
          <button
            key={s.cls}
            title={`${s.label} — ${s.cls}`}
            onClick={() => onChange(s.cls)}
            className={`h-5 w-5 rounded-full border-2 transition ${
              value === s.cls ? "border-white/80 scale-110" : "border-transparent hover:border-white/40"
            }`}
            style={{ backgroundColor: s.hex }}
          />
        ))}
      </div>
      <input
        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-mono text-slate-300 focus:border-violet-500 focus:outline-none"
        placeholder="text-amber-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Field link section ────────────────────────────────────────────────────────

const TYPE_BADGE: Record<KnownFieldType, string> = {
  boolean:  "bg-lime-900/50 text-lime-300 border-lime-700/50",
  numeric:  "bg-blue-900/50 text-blue-300 border-blue-700/50",
  presence: "bg-slate-800 text-slate-400 border-slate-700/50",
};

function FieldLinkEditor({
  value,
  onChange,
}: {
  value: CustomGlyphFieldLink;
  onChange: (v: CustomGlyphFieldLink) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const MODES: { mode: CustomGlyphFieldLink["mode"]; label: string; desc: string }[] = [
    { mode: "none",     label: "None (decorative)", desc: "Never auto-shown on cards" },
    { mode: "boolean",  label: "Boolean field",     desc: "Show when field is truthy (e.g. innate, ethereal)" },
    { mode: "numeric",  label: "Numeric field",     desc: "Show when field has a number (e.g. draw, block)" },
    { mode: "presence", label: "Presence field",    desc: "Show when field is not null/undefined" },
  ];

  const fieldName = value.mode !== "none" ? value.fieldName : "";
  const showNumber = value.mode === "numeric" ? value.showNumber : false;

  const suggestions = useMemo(() => {
    if (!fieldName.trim()) return KNOWN_CARD_FIELDS.slice(0, 12);
    return KNOWN_CARD_FIELDS.filter((f) =>
      f.name.toLowerCase().includes(fieldName.toLowerCase()),
    ).slice(0, 12);
  }, [fieldName]);

  function applyFieldName(fn: string) {
    const known = KNOWN_CARD_FIELDS.find((f) => f.name === fn);
    if (known) {
      if (known.type === "boolean") onChange({ mode: "boolean", fieldName: fn });
      else if (known.type === "numeric") onChange({ mode: "numeric", fieldName: fn, showNumber });
      else onChange({ mode: "presence", fieldName: fn });
    } else {
      if (value.mode === "numeric") onChange({ mode: "numeric", fieldName: fn, showNumber });
      else if (value.mode !== "none") onChange({ mode: value.mode, fieldName: fn } as CustomGlyphFieldLink);
      else onChange({ mode: "boolean", fieldName: fn });
    }
    setShowSuggestions(false);
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {MODES.map(({ mode, label, desc }) => (
          <label key={mode} className="flex cursor-pointer items-start gap-2.5">
            <input
              type="radio"
              name="fieldlink-mode"
              value={mode}
              checked={value.mode === mode}
              onChange={() => {
                if (mode === "none") onChange({ mode: "none" });
                else if (mode === "numeric") onChange({ mode: "numeric", fieldName, showNumber });
                else onChange({ mode, fieldName } as CustomGlyphFieldLink);
              }}
              className="mt-0.5 accent-violet-500"
            />
            <span>
              <span className="text-xs font-semibold text-slate-200">{label}</span>
              <span className="ml-1.5 text-[10px] text-slate-500">{desc}</span>
            </span>
          </label>
        ))}
      </div>

      {value.mode !== "none" && (
        <div className="space-y-2 rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Card field name
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="e.g. innate, draw, canAddPotions"
                value={fieldName}
                autoComplete="off"
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onChange={(e) => {
                  const fn = e.target.value;
                  setShowSuggestions(true);
                  if (value.mode === "numeric") onChange({ mode: "numeric", fieldName: fn, showNumber });
                  else onChange({ mode: value.mode, fieldName: fn } as CustomGlyphFieldLink);
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-20 mt-0.5 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
                  {suggestions.map((f) => (
                    <li key={f.name}>
                      <button
                        type="button"
                        onMouseDown={() => applyFieldName(f.name)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-800"
                      >
                        <span className="flex-1 font-mono text-slate-200">{f.name}</span>
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[f.type]}`}>
                          {f.type}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Matched field type badge */}
            {fieldName && (() => {
              const match = KNOWN_CARD_FIELDS.find((f) => f.name === fieldName);
              return match ? (
                <p className="mt-1 text-[10px] text-slate-500">
                  Known field type:{" "}
                  <span className={`rounded border px-1 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[match.type]}`}>
                    {match.type}
                  </span>
                </p>
              ) : null;
            })()}
          </div>

          {value.mode === "numeric" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showNumber}
                onChange={(e) =>
                  onChange({ mode: "numeric", fieldName, showNumber: e.target.checked })
                }
                className="accent-violet-500"
              />
              Show numeric value alongside icon
            </label>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Custom glyph form ─────────────────────────────────────────────────────────

type SourceTab = "lucide" | "svg" | "url";

function CustomGlyphForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: CustomGlyph;
  onSave: (g: CustomGlyph) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<CustomGlyph>(initial);
  const [tab, setTab] = useState<SourceTab>(
    initial.source.type === "svg"
      ? "svg"
      : initial.source.type === "url"
        ? "url"
        : "lucide",
  );
  const [svgText, setSvgText] = useState(
    initial.source.type === "svg" ? initial.source.svgData : "",
  );
  const [urlText, setUrlText] = useState(
    initial.source.type === "url" ? initial.source.url : "",
  );
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [resolvedIcon, setResolvedIcon] = useState<LucideIcon | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const lucideName =
    draft.source.type === "lucide" ? draft.source.iconName : "Star";

  useEffect(() => {
    if (tab !== "lucide") return;
    import("lucide-react").then((mod) => {
      const ic = (mod as Record<string, unknown>)[lucideName];
      setResolvedIcon(typeof ic === "function" ? (ic as LucideIcon) : undefined);
    });
  }, [lucideName, tab]);

  function setSource(src: CustomGlyphSource) {
    setDraft((d) => ({ ...d, source: src }));
  }

  function handleTabChange(t: SourceTab) {
    setTab(t);
    if (t === "lucide") setSource({ type: "lucide", iconName: lucideName });
    else if (t === "svg")
      setSource({ type: "svg", svgData: sanitizeSvg(svgText) });
    else
      setSource({
        type: "url",
        url: urlText,
        cachedSvg:
          draft.source.type === "url" ? draft.source.cachedSvg : undefined,
      });
  }

  function handleSvgChange(raw: string) {
    setSvgText(raw);
    setSource({ type: "svg", svgData: sanitizeSvg(raw) });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      handleSvgChange(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleUrlFetch() {
    if (!urlText.trim()) return;
    setUrlFetching(true);
    setUrlError("");
    try {
      const res = await fetch(urlText.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const cached = sanitizeSvg(text);
      setSource({ type: "url", url: urlText.trim(), cachedSvg: cached });
      setUrlError("");
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setUrlFetching(false);
    }
  }

  const previewSource: CustomGlyphSource =
    tab === "lucide"
      ? { type: "lucide", iconName: lucideName }
      : tab === "svg"
        ? { type: "svg", svgData: sanitizeSvg(svgText) }
        : {
            type: "url",
            url: urlText,
            cachedSvg:
              draft.source.type === "url" ? draft.source.cachedSvg : undefined,
          };

  const previewNumeric =
    draft.fieldLink.mode === "numeric" && draft.fieldLink.showNumber ? 3 : undefined;

  const keyError =
    draft.key && !/^[A-Z][A-Z0-9_]*$/.test(draft.key)
      ? "Use SCREAMING_SNAKE_CASE (A–Z, 0–9, _)"
      : "";

  function handleSave() {
    if (!draft.key || !draft.shortLabel || keyError) return;
    const finalSource: CustomGlyphSource =
      tab === "lucide"
        ? { type: "lucide", iconName: lucideName }
        : tab === "svg"
          ? { type: "svg", svgData: sanitizeSvg(svgText) }
          : {
              type: "url",
              url: urlText,
              cachedSvg:
                draft.source.type === "url" ? draft.source.cachedSvg : undefined,
            };
    onSave({ ...draft, source: finalSource });
  }

  const TABS: { id: SourceTab; label: string }[] = [
    { id: "lucide", label: "Lucide icon" },
    { id: "svg",    label: "Inline SVG" },
    { id: "url",    label: "URL fetch" },
  ];

  return (
    <div className="space-y-5">
      {/* Live chip preview */}
      <div className="flex items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-950/15 p-4">
        <span className="text-xs text-slate-500">Preview:</span>
        <GlyphChip
          source={previewSource}
          iconClass={draft.iconClass}
          shortLabel={draft.shortLabel || "Label"}
          numericValue={previewNumeric}
          iconCls="h-5 w-5"
          resolvedIcon={tab === "lucide" ? resolvedIcon : undefined}
        />
      </div>

      {/* Key + label */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Key <span className="text-rose-400">*</span>
          </label>
          <input
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 ${
              keyError
                ? "border-rose-500 focus:border-rose-400 focus:ring-rose-500"
                : "border-slate-700 focus:border-violet-500 focus:ring-violet-500"
            }`}
            placeholder="MY_CUSTOM_ICON"
            value={draft.key}
            onChange={(e) => setDraft((d) => ({ ...d, key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))}
          />
          {keyError && <p className="text-xs text-rose-400">{keyError}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Short label <span className="text-rose-400">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="My icon"
            value={draft.shortLabel}
            onChange={(e) => setDraft((d) => ({ ...d, shortLabel: e.target.value }))}
          />
        </div>
      </div>

      {/* Tooltip */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">
          Tooltip <span className="text-[11px] font-normal text-slate-500">(hover text — leave blank to use short label)</span>
        </label>
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="e.g. Intangible (reduces damage taken)"
          value={draft.tooltip ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, tooltip: e.target.value }))}
        />
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Color</label>
        <ColorPicker
          value={draft.iconClass}
          onChange={(cls) => setDraft((d) => ({ ...d, iconClass: cls }))}
        />
      </div>

      {/* Icon source tabs */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Icon source
        </label>
        <div className="flex gap-1.5">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                tab === id
                  ? "border-violet-500/60 bg-violet-950/50 text-violet-200"
                  : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "lucide" && (
          <LucideIconPicker
            selected={lucideName}
            onSelect={(name) => {
              setSource({ type: "lucide", iconName: name });
              import("lucide-react").then((mod) => {
                const ic = (mod as Record<string, unknown>)[name];
                setResolvedIcon(typeof ic === "function" ? (ic as LucideIcon) : undefined);
              });
            }}
          />
        )}

        {tab === "svg" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-slate-100"
              >
                <Upload className="h-3.5 w-3.5" /> Upload .svg
              </button>
              <span className="text-[10px] text-slate-500">or paste below</span>
            </div>
            <textarea
              rows={5}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 font-mono text-[11px] text-slate-300 focus:border-violet-500 focus:outline-none"
              placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  …\n</svg>'}
              value={svgText}
              onChange={(e) => handleSvgChange(e.target.value)}
            />
          </div>
        )}

        {tab === "url" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
                placeholder="https://lucide.dev/icons/star.svg"
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
              />
              <button
                onClick={handleUrlFetch}
                disabled={urlFetching || !urlText.trim()}
                className="rounded-lg border border-violet-600/60 bg-violet-950/40 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-950/60 disabled:opacity-50"
              >
                {urlFetching ? "Fetching…" : "Fetch"}
              </button>
            </div>
            {urlError && <p className="text-[10px] text-rose-400">{urlError}</p>}
            {draft.source.type === "url" && draft.source.cachedSvg && (
              <p className="text-[10px] text-emerald-400">✓ SVG cached ({draft.source.cachedSvg.length} chars)</p>
            )}
          </div>
        )}
      </div>

      {/* Field link */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Card field link</label>
        <FieldLinkEditor
          value={draft.fieldLink}
          onChange={(fl) => setDraft((d) => ({ ...d, fieldLink: fl }))}
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={draft.hideNumber === true}
            onChange={(e) => setDraft((d) => ({ ...d, hideNumber: e.target.checked }))}
            className="accent-violet-500"
          />
          <span>
            Hide number{" "}
            <span className="text-xs text-slate-500">— suppress numeric display even when field has a value</span>
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-slate-800 pt-4">
        <button
          onClick={handleSave}
          disabled={!draft.key || !draft.shortLabel || !!keyError}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-600/60 bg-emerald-950/40 px-4 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/60 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-4 py-1.5 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Built-in detail panel ─────────────────────────────────────────────────────

function BuiltinDetailPanel({
  glyphKey,
  meta,
}: {
  glyphKey: string;
  meta: { shortLabel: string; Icon: LucideIcon; iconClass: string };
}) {
  const [overrides, setOverrides] = useState<Record<string, { hideNumber?: boolean }>>({});

  useEffect(() => {
    setOverrides(loadBuiltinGlyphOverrides());
  }, [glyphKey]);

  function toggleHideNumber(checked: boolean) {
    const next = { ...overrides, [glyphKey]: { ...overrides[glyphKey], hideNumber: checked || undefined } };
    if (!checked) delete next[glyphKey]?.hideNumber;
    if (next[glyphKey] && Object.keys(next[glyphKey]).length === 0) delete next[glyphKey];
    setOverrides(next);
    saveBuiltinGlyphOverrides(next);
  }

  const hideNumber = overrides[glyphKey]?.hideNumber === true;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
        <span className="text-xs text-slate-500">Preview:</span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/20 px-2 py-1 text-xs ${meta.iconClass}`}
        >
          <meta.Icon className="h-4 w-4" />
          <span className="text-slate-300">{meta.shortLabel}</span>
        </span>
      </div>

      <dl className="grid gap-2 text-xs">
        {[
          { label: "Key",         value: glyphKey,          mono: true },
          { label: "Short label", value: meta.shortLabel,   mono: false },
          { label: "Color class", value: meta.iconClass,    mono: true },
          { label: "Icon",        value: meta.Icon.displayName ?? meta.Icon.name ?? "Lucide", mono: false },
          { label: "Field link",  value: "(built-in logic)", mono: false },
        ].map(({ label, value, mono }) => (
          <div key={label} className="flex items-baseline gap-2">
            <dt className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {label}
            </dt>
            <dd className={mono ? "font-mono text-violet-300" : "text-slate-300"}>{value}</dd>
          </div>
        ))}
      </dl>

      {/* Override: hideNumber */}
      <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Display overrides</p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={hideNumber}
            onChange={(e) => toggleHideNumber(e.target.checked)}
            className="accent-violet-500"
          />
          <span>
            Hide number{" "}
            <span className="text-xs text-slate-500">— suppress numeric value in this glyph&apos;s chip</span>
          </span>
        </label>
        {hideNumber && (
          <p className="mt-1.5 text-[10px] text-amber-400/80">
            Override saved — takes effect after page refresh in the planner.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main editor ───────────────────────────────────────────────────────────────

type PanelMode =
  | { kind: "idle" }
  | { kind: "builtin"; key: string }
  | { kind: "add" }
  | { kind: "edit"; index: number };

export default function GlyphEditorClient() {
  const [customGlyphs, setCustomGlyphs] = useState<CustomGlyph[]>([]);
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<PanelMode>({ kind: "idle" });
  const [showBuiltinCollapsed, setShowBuiltinCollapsed] = useState(false);

  useEffect(() => {
    setCustomGlyphs(loadCustomGlyphs());
  }, []);

  function persist(next: CustomGlyph[]) {
    setCustomGlyphs(next);
    saveCustomGlyphs(next);
  }

  function handleSave(g: CustomGlyph) {
    if (panel.kind === "add") {
      persist([...customGlyphs, g]);
    } else if (panel.kind === "edit") {
      const next = [...customGlyphs];
      next[panel.index] = g;
      persist(next);
    }
    setPanel({ kind: "idle" });
  }

  function handleDelete(index: number) {
    const next = customGlyphs.filter((_, i) => i !== index);
    persist(next);
    if (panel.kind === "edit" && panel.index === index) setPanel({ kind: "idle" });
  }

  function handleDownload() {
    const blob = new Blob([JSON.stringify(customGlyphs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom_glyphs.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (!confirm("Reset to the baseline JSON? This clears all local edits.")) return;
    const base = resetCustomGlyphs();
    setCustomGlyphs(base);
    setPanel({ kind: "idle" });
  }

  const filteredBuiltin = useMemo(
    () =>
      BUILTIN_GLYPHS.filter(
        (g) =>
          !search.trim() ||
          g.key.toLowerCase().includes(search.toLowerCase()) ||
          g.shortLabel.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const filteredCustom = useMemo(
    () =>
      customGlyphs.filter(
        (g) =>
          !search.trim() ||
          g.key.toLowerCase().includes(search.toLowerCase()) ||
          g.shortLabel.toLowerCase().includes(search.toLowerCase()),
      ),
    [customGlyphs, search],
  );

  const editingInitial: CustomGlyph | null =
    panel.kind === "edit" ? (customGlyphs[panel.index] ?? null) : null;

  const selectedBuiltinMeta =
    panel.kind === "builtin"
      ? BUILTIN_GLYPHS.find((g) => g.key === panel.key) ?? null
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link
            href="/editors"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Editors
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-bold text-slate-100">Glyph Editor</span>
          <span className="rounded-md border border-violet-500/30 bg-violet-950/40 px-2 py-0.5 text-[10px] font-bold text-violet-300">
            {BUILTIN_GLYPHS.length} built-in · {customGlyphs.length} custom
          </span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleReset}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200"
            >
              Reset
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-violet-600/50 bg-violet-950/40 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-950/60"
            >
              <Download className="h-3.5 w-3.5" /> Download JSON
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-0 px-4 py-6">
        {/* Left: glyph list */}
        <aside className="w-72 shrink-0 pr-4">
          <div className="sticky top-20 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                placeholder="Search glyphs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Built-in section */}
            <div>
              <button
                onClick={() => setShowBuiltinCollapsed((v) => !v)}
                className="flex w-full items-center justify-between py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                <span>Built-in ({filteredBuiltin.length})</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showBuiltinCollapsed ? "-rotate-90" : ""}`}
                />
              </button>
              {!showBuiltinCollapsed && (
                <div className="max-h-72 space-y-0.5 overflow-y-auto">
                  {filteredBuiltin.map(({ key, shortLabel, Icon, iconClass }) => (
                    <button
                      key={key}
                      onClick={() => setPanel({ kind: "builtin", key })}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                        panel.kind === "builtin" && panel.key === key
                          ? "bg-violet-950/50 text-violet-100"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
                      <span className="min-w-0 flex-1 truncate">{shortLabel}</span>
                      <span className="shrink-0 font-mono text-[9px] text-slate-600">{key}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom section */}
            <div>
              <p className="py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Custom ({filteredCustom.length})
              </p>
              <div className="space-y-0.5">
                {filteredCustom.map((g, i) => {
                  const realIdx = customGlyphs.indexOf(g);
                  const isEditing = panel.kind === "edit" && panel.index === realIdx;
                  return (
                    <div
                      key={g.key || i}
                      className={`group flex items-center gap-1 rounded-lg px-2 py-1 transition ${
                        isEditing ? "bg-violet-950/40" : "hover:bg-slate-800/50"
                      }`}
                    >
                      <button
                        onClick={() => setPanel({ kind: "edit", index: realIdx })}
                        className="flex flex-1 items-center gap-2 min-w-0 text-left text-xs text-slate-400 hover:text-slate-200"
                      >
                        {g.source.type === "lucide" ? (
                          <CustomLucidePreview name={g.source.iconName} cls={g.iconClass} />
                        ) : (
                          <span
                            className={`h-4 w-4 shrink-0 inline-flex items-center justify-center ${g.iconClass} [&>svg]:h-4 [&>svg]:w-4`}
                            dangerouslySetInnerHTML={{
                              __html:
                                g.source.type === "svg"
                                  ? g.source.svgData
                                  : (g.source.cachedSvg ?? ""),
                            }}
                          />
                        )}
                        <span className="flex-1 truncate">{g.shortLabel}</span>
                        <span className="shrink-0 font-mono text-[9px] text-slate-600">{g.key}</span>
                      </button>
                      <button
                        onClick={() => setPanel({ kind: "edit", index: realIdx })}
                        className="hidden shrink-0 rounded p-0.5 text-slate-600 hover:text-slate-300 group-hover:block"
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(realIdx)}
                        className="hidden shrink-0 rounded p-0.5 text-slate-600 hover:text-rose-400 group-hover:block"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setPanel({ kind: "add" })}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-700 py-2 text-xs text-slate-500 hover:border-violet-500/50 hover:text-violet-300"
              >
                <Plus className="h-3.5 w-3.5" /> Add custom glyph
              </button>
            </div>
          </div>
        </aside>

        {/* Right: detail / editor */}
        <main className="min-w-0 flex-1 border-l border-slate-800 pl-6">
          {panel.kind === "idle" && (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-600">
              <Hash className="h-8 w-8" />
              <p className="text-sm">Select a glyph or add a custom one</p>
            </div>
          )}

          {panel.kind === "builtin" && selectedBuiltinMeta && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-100">
                Built-in glyph
                <span className="ml-2 font-mono text-[11px] text-violet-400">{panel.key}</span>
              </h2>
              <BuiltinDetailPanel glyphKey={panel.key} meta={selectedBuiltinMeta} />
            </div>
          )}

          {panel.kind === "add" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-100">New custom glyph</h2>
              <CustomGlyphForm
                initial={blankGlyph()}
                onSave={handleSave}
                onCancel={() => setPanel({ kind: "idle" })}
              />
            </div>
          )}

          {panel.kind === "edit" && editingInitial && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-100">
                Edit glyph
                <span className="ml-2 font-mono text-[11px] text-violet-400">{editingInitial.key}</span>
              </h2>
              <CustomGlyphForm
                key={panel.index}
                initial={editingInitial}
                onSave={handleSave}
                onCancel={() => setPanel({ kind: "idle" })}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Small helper to render a Lucide icon by name in the custom glyph list
function CustomLucidePreview({ name, cls }: { name: string; cls: string }) {
  const [Ic, setIc] = useState<LucideIcon | null>(null);
  useEffect(() => {
    import("lucide-react").then((mod) => {
      const ic = (mod as Record<string, unknown>)[name];
      if (typeof ic === "function") setIc(() => ic as LucideIcon);
    });
  }, [name]);
  if (!Ic) return <span className={`h-4 w-4 shrink-0 rounded bg-white/10 ${cls}`} />;
  return <Ic className={`h-4 w-4 shrink-0 ${cls}`} />;
}
