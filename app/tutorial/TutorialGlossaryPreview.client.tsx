"use client";

import { galleryRowFromStsCardId } from "@/app/card-design-gallery/stsToGalleryRow";
import { inferGalleryCardEffects } from "@/app/card-design-gallery/galleryStsGlyphs";
import { getGalleryCharacterChromeStyle } from "@/app/card-design-gallery/galleryCharacterCardStyles";
import { DEFAULT_CARD_VISUAL_VARIANT } from "@/app/components/UI/cardVisualVariants";
import STSCard from "@/app/components/UI/Card";
import { LOCATION } from "@/app/types/types";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GLOSSARY_PREVIEW_DISPLAY_MAX,
  type GlossaryExampleIndex,
} from "@/app/tutorial/glossary-example-index";

export type GlossaryPreviewTarget =
  | { kind: "glyph"; key: string }
  | { kind: "effect"; key: string };

/** @deprecated Use {@link GlossaryPreviewTarget} */
export type GlossaryPreviewHover = GlossaryPreviewTarget;

type PreviewContextValue = {
  index: GlossaryExampleIndex;
  hover: GlossaryPreviewTarget | null;
  setHover: (next: GlossaryPreviewTarget | null) => void;
  selection: GlossaryPreviewTarget | null;
  setSelection: (next: GlossaryPreviewTarget | null) => void;
  /** Prefer hover while pointer is over a row with examples; else pinned selection. */
  activePreview: GlossaryPreviewTarget | null;
  /** Bumps on each non-null {@link setHover} so the rail can reshuffle examples. */
  hoverShuffleNonce: number;
};

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function useTutorialGlossaryPreview(): PreviewContextValue | null {
  return useContext(PreviewContext);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleStringsWithSeed(items: readonly string[], seed: number): string[] {
  const rand = mulberry32(seed);
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** While hovering, sample a random subset; pinned selection uses stable lexicographic order. */
function pickPreviewCardIds(
  pool: readonly string[],
  opts: { hovering: boolean; hoverNonce: number },
  maxDisplay: number,
): string[] {
  if (pool.length === 0) return [];
  const n = Math.min(maxDisplay, pool.length);
  if (opts.hovering) {
    const seed = opts.hoverNonce * 0x9e37_79b9 + pool.length * 0x85eb_ca6b + (pool[0]?.length ?? 0);
    return shuffleStringsWithSeed(pool, seed).slice(0, n);
  }
  return [...pool]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .slice(0, n);
}

export function TutorialGlossaryPreviewProvider({
  index,
  children,
}: {
  index: GlossaryExampleIndex;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [hover, setHoverState] = useState<GlossaryPreviewTarget | null>(null);
  const [selection, setSelection] = useState<GlossaryPreviewTarget | null>(null);
  const [hoverShuffleNonce, setHoverShuffleNonce] = useState(0);

  const setHover = useCallback((next: GlossaryPreviewTarget | null) => {
    setHoverState(next);
    if (next !== null) setHoverShuffleNonce((k) => k + 1);
  }, []);

  useEffect(() => {
    setHoverState(null);
    setSelection(null);
  }, [pathname]);

  const value = useMemo(() => {
    const activePreview = hover ?? selection;
    return {
      index,
      hover,
      setHover,
      selection,
      setSelection,
      activePreview,
      hoverShuffleNonce,
    };
  }, [index, hover, setHover, selection, hoverShuffleNonce]);

  return (
    <PreviewContext.Provider value={value}>
      {children}
      <TutorialGlossaryPreviewRail />
    </PreviewContext.Provider>
  );
}

function TutorialGlossaryPreviewRail() {
  const ctx = useContext(PreviewContext);
  const t = ctx?.activePreview ?? null;
  const index = ctx?.index;

  const poolIds = useMemo(() => {
    if (!t || !index) return [];
    if (t.kind === "glyph") return index.byGlyphCatalogKey[t.key] ?? [];
    return index.byEffectId[t.key] ?? [];
  }, [t?.kind, t?.key, index]);

  const hovering = Boolean(ctx?.hover);
  const hoverNonce = ctx?.hoverShuffleNonce ?? 0;

  const cardIds = useMemo(() => {
    if (t == null) return [];
    return pickPreviewCardIds(
      poolIds,
      { hovering, hoverNonce },
      GLOSSARY_PREVIEW_DISPLAY_MAX,
    );
  }, [t, poolIds, hovering, hoverNonce]);

  const rows = useMemo(
    () =>
      cardIds
        .map((id) => galleryRowFromStsCardId(id))
        .filter((r): r is NonNullable<typeof r> => r != null),
    [cardIds],
  );
  if (!ctx?.activePreview || rows.length === 0) return null;

  return (
    <aside
      className="pointer-events-none fixed right-3 top-[calc(var(--tutorial-header-h,5.5rem)+0.75rem)] z-30 hidden min-w-[13.75rem] max-w-[15rem] flex-col gap-3 xl:flex"
      aria-label="Example cards for glossary entry (hover or selected)"
    >
      <p className="pointer-events-auto text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        Examples
      </p>
      <div className="pointer-events-auto flex flex-col gap-4 overflow-y-auto overscroll-contain pr-1">
        {rows.map((row) => {
          const { glyphs, suppressStats } = inferGalleryCardEffects(row.card);
          const chromeStyle = getGalleryCharacterChromeStyle(row.card);
          return (
            <div key={row.id}>
              <STSCard
                card={row.card}
                size="preview"
                index={0}
                location={LOCATION.HAND}
                variant={DEFAULT_CARD_VISUAL_VARIANT}
                galleryEffectGlyphs={glyphs}
                gallerySuppressStats={suppressStats}
                galleryChromeStyle={chromeStyle}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
}
