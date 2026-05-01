import type { CardGalleryFixtureRow } from "@/app/data/cardGalleryFixtures";

export type GalleryRarityBand = "common" | "uncommon" | "rare";

export type GalleryDisplayRow = CardGalleryFixtureRow;

export type GalleryCardSize = "small" | "medium" | "large" | "preview";

export type GallerySizeMode = "auto" | GalleryCardSize;
