"use client";

import STSCard from "@/app/components/UI/Card";
import type { CardVisualVariant } from "@/app/components/UI/cardVisualVariants";
import { LOCATION } from "@/app/types/types";
import type { GalleryCardSize } from "@/app/card-design-gallery/galleryTypes";
import type { GalleryDisplayRow } from "@/app/card-design-gallery/galleryTypes";
import { getGalleryCharacterChromeStyle } from "@/app/card-design-gallery/galleryCharacterCardStyles";
import { inferGalleryCardEffects } from "@/app/card-design-gallery/galleryStsGlyphs";

export function GalleryCardPreview({
  row,
  variant,
  displaySize,
}: {
  row: GalleryDisplayRow;
  variant: CardVisualVariant;
  displaySize: GalleryCardSize;
}) {
  const { glyphs, suppressStats } = inferGalleryCardEffects(row.card);
  const hasSuppress = Object.keys(suppressStats).length > 0;

  return (
    <div className="flex flex-col items-center">
      <STSCard
        card={row.card}
        index={0}
        location={LOCATION.HAND}
        size={displaySize}
        interactive={false}
        variant={variant}
        galleryChromeStyle={getGalleryCharacterChromeStyle(row.card)}
        galleryEffectGlyphs={glyphs.length > 0 ? glyphs : undefined}
        gallerySuppressStats={hasSuppress ? suppressStats : undefined}
      />
    </div>
  );
}
