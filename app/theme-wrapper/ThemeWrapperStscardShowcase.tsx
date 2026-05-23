"use client";

import { useMemo } from "react";
import { galleryRowFromStsCardId } from "@/app/card-design-gallery/stsToGalleryRow";
import { inferGalleryCardEffects } from "@/app/card-design-gallery/galleryStsGlyphs";
import { getGalleryCharacterChromeStyle } from "@/app/card-design-gallery/galleryCharacterCardStyles";
import STSCard from "@/app/components/UI/Card";
import { LOCATION } from "@/app/types/types";
import type { GalleryDisplayRow } from "@/app/card-design-gallery/galleryTypes";
import type { Card } from "@/app/types/gameTypes";

/** STS DB ids — mix of damage, block, draw/discard, AoE, orbs, X-cost multihit, curse/status. */
const SHOWCASE_IDS = [
  "Strike_R",
  "Bash",
  "Defend_R",
  "Cleave",
  "Cold Snap",
  "Demon Form",
  "Bludgeon",
  "Pain",
  "Slimed",
  "Acrobatics",
  "Skewer",
  "Ball Lightning",
] as const;

export type ThemeWrapperStscardDensity = "embedded" | "full";

function rowWithPatch(
  row: GalleryDisplayRow,
  idSuffix: string,
  patch: Partial<Card>,
): GalleryDisplayRow {
  return {
    ...row,
    id: `${row.id}${idSuffix}`,
    card: { ...row.card, ...patch },
  };
}

export function ThemeWrapperStscardShowcase({
  density = "full",
}: {
  density?: ThemeWrapperStscardDensity;
}) {
  const baseRows = useMemo(() => {
    const out: GalleryDisplayRow[] = [];
    for (const id of SHOWCASE_IDS) {
      const row = galleryRowFromStsCardId(id);
      if (row) out.push(row);
    }
    return out;
  }, []);

  const interactionRows = useMemo((): GalleryDisplayRow[] => {
    const out: GalleryDisplayRow[] = [];
    const bash = galleryRowFromStsCardId("Bash");
    if (bash) out.push(rowWithPatch(bash, "--selected", { isSelected: true }));

    const strikeUp = galleryRowFromStsCardId("Strike_R", { isUpgraded: true });
    if (strikeUp) out.push(strikeUp);

    const surv = galleryRowFromStsCardId("Survivor");
    if (surv) out.push(rowWithPatch(surv, "--changed", { isChanged: true }));

    return out;
  }, []);

  return (
    <div className={density === "full" ? "mx-auto max-w-6xl px-4 py-6 md:px-6" : ""}>
      {density === "full" ? (
        <div className="mb-6 space-y-2 text-sm text-slate-400">
          <p>
            Same path as the planner and{" "}
            <span className="font-medium text-slate-300">Card design gallery</span>:{" "}
            <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs text-cyan-200/90">STSCard</code>{" "}
            +{" "}
            <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs text-cyan-200/90">
              inferGalleryCardEffects
            </code>{" "}
            with Lucide icons from{" "}
            <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs text-cyan-200/90">
              galleryStsGlyphs.ts
            </code>
            .
          </p>
          <p className="text-xs text-slate-500">
            Legend below matches the <span className="text-slate-400">Card design gallery</span> catalog (
            <span className="font-mono text-slate-400">STS_ICON_GLYPH</span> + stat-row tokens from{" "}
            <span className="font-mono text-slate-400">getEffectDisplay</span>).
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-x-10 gap-y-10">
        {baseRows.map((row) => {
          const { glyphs, suppressStats } = inferGalleryCardEffects(row.card);
          const chromeStyle = getGalleryCharacterChromeStyle(row.card);
          return (
            <div key={row.id} className="flex flex-col items-center gap-2">
              <STSCard
                card={row.card}
                size="medium"
                index={0}
                location={LOCATION.HAND}
                variant="aurora"
                galleryEffectGlyphs={glyphs}
                gallerySuppressStats={suppressStats}
                galleryChromeStyle={chromeStyle}
              />
              <span
                className="max-w-44 truncate text-center text-[10px] font-medium text-slate-500"
                title={row.title}
              >
                {row.title}
              </span>
            </div>
          );
        })}
      </div>

      <h3 className="mb-3 mt-14 text-sm font-semibold text-slate-400">Interaction samples</h3>
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-10">
        {interactionRows.map((row) => {
          const { glyphs, suppressStats } = inferGalleryCardEffects(row.card);
          const chromeStyle = getGalleryCharacterChromeStyle(row.card);
          return (
            <div key={row.id} className="flex flex-col items-center gap-2">
              <STSCard
                card={row.card}
                size="medium"
                index={0}
                location={LOCATION.HAND}
                variant="aurora"
                galleryEffectGlyphs={glyphs}
                gallerySuppressStats={suppressStats}
                galleryChromeStyle={chromeStyle}
              />
              <span
                className="max-w-44 truncate text-center text-[10px] font-medium text-slate-500"
                title={row.title}
              >
                {row.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
