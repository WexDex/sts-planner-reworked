"use client";

import { memo, useMemo } from "react";
import STSCard from "@/app/components/UI/Card";
import { LOCATION } from "@/app/types/types";
import { galleryRowFromStsCardId } from "./stsToGalleryRow";
import { inferGalleryCardEffects } from "./galleryStsGlyphs";
import { getGalleryCharacterChromeStyle } from "./galleryCharacterCardStyles";
import type { STSCardSize } from "@/app/components/UI/Card";
import { Star, ArrowUpCircle, EyeOff } from "lucide-react";

interface GalleryCardBoxProps {
  cardId: string;
  globalSize: STSCardSize;
  isUpgraded: boolean;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  onToggleUpgrade: (id: string) => void;
  onIgnore: (id: string) => void;
}

function GalleryCardBoxInner({
  cardId,
  globalSize,
  isUpgraded,
  isPinned,
  onTogglePin,
  onToggleUpgrade,
  onIgnore,
}: GalleryCardBoxProps) {
  const row = useMemo(
    () => galleryRowFromStsCardId(cardId, { isUpgraded }),
    [cardId, isUpgraded],
  );

  const { glyphs, suppressStats } = useMemo(
    () =>
      row
        ? inferGalleryCardEffects(row.card)
        : { glyphs: [] as ReturnType<typeof inferGalleryCardEffects>["glyphs"], suppressStats: {} as ReturnType<typeof inferGalleryCardEffects>["suppressStats"] },
    [row],
  );

  const chromeStyle = useMemo(
    () => (row ? getGalleryCharacterChromeStyle(row.card) : undefined),
    [row],
  );

  if (!row) return null;

  return (
    <div
      className={[
        "relative group rounded-xl transition-all duration-150",
        isPinned
          ? "ring-2 ring-yellow-400/60 shadow-lg shadow-yellow-900/25"
          : "hover:ring-1 hover:ring-slate-600/40",
      ].join(" ")}
    >
      {/* Pin badge — always visible when pinned */}
      {isPinned && (
        <div className="pointer-events-none absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 shadow-md shadow-yellow-900/40">
          <Star className="h-3 w-3 fill-white text-white" />
        </div>
      )}


      <STSCard
        card={row.card}
        size={globalSize}
        index={0}
        location={LOCATION.HAND}
        interactive={false}
        variant="aurora"
        galleryEffectGlyphs={glyphs}
        gallerySuppressStats={suppressStats}
        galleryChromeStyle={chromeStyle}
      />

      {/* Hover action bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center pb-2 pt-8 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 z-10 rounded-b-xl bg-gradient-to-t from-black/75 via-black/40 to-transparent">
        <div className="flex gap-1.5">
          <button
            type="button"
            title={isPinned ? "Unpin" : "Pin to top"}
            onClick={() => onTogglePin(cardId)}
            className={[
              "flex h-7 w-7 items-center justify-center rounded-full border shadow transition",
              isPinned
                ? "border-yellow-500/70 bg-yellow-500/80 text-white hover:bg-yellow-500"
                : "border-slate-600/60 bg-slate-800/80 text-slate-300 hover:border-yellow-400/50 hover:text-yellow-300",
            ].join(" ")}
          >
            <Star className={`h-3.5 w-3.5 ${isPinned ? "fill-white" : ""}`} />
          </button>

          <button
            type="button"
            title={isUpgraded ? "Show base version" : "Show upgraded version"}
            onClick={() => onToggleUpgrade(cardId)}
            className={[
              "flex h-7 w-7 items-center justify-center rounded-full border shadow transition",
              isUpgraded
                ? "border-sky-500/70 bg-sky-500/80 text-white hover:bg-sky-500"
                : "border-slate-600/60 bg-slate-800/80 text-slate-300 hover:border-sky-400/50 hover:text-sky-300",
            ].join(" ")}
          >
            <ArrowUpCircle className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Hide this card"
            onClick={() => onIgnore(cardId)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-600/60 bg-slate-800/80 text-slate-400 shadow transition hover:border-rose-400/50 hover:text-rose-300"
          >
            <EyeOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const GalleryCardBox = memo(GalleryCardBoxInner);
export default GalleryCardBox;
