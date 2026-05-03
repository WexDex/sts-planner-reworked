import type { CardTypeStyle } from "@/app/components/UI/cardVisualVariants";
import type { Card } from "@/app/types/gameTypes";
import { cardTypeStyles } from "@/app/types/types";

const IRONCLAD: CardTypeStyle = {
  gradient: "from-rose-950 via-red-900/92 to-rose-950",
  border: "border-red-700/55",
  glow: "shadow-red-950/45",
  accentBorder: "border-rose-500/75",
  costBg: "bg-gradient-to-br from-rose-600 to-red-900",
  costGlow: "shadow-rose-500/55",
  nameBg: "bg-red-950/85",
  statColor: "text-rose-200",
  typeColor: "text-rose-300",
};

const SILENT: CardTypeStyle = {
  gradient: "from-emerald-950 via-green-900/90 to-emerald-950",
  border: "border-emerald-600/55",
  glow: "shadow-emerald-950/45",
  accentBorder: "border-emerald-400/75",
  costBg: "bg-gradient-to-br from-emerald-600 to-emerald-900",
  costGlow: "shadow-emerald-500/50",
  nameBg: "bg-emerald-950/85",
  statColor: "text-emerald-200",
  typeColor: "text-emerald-300",
};

const DEFECT: CardTypeStyle = {
  gradient: "from-sky-950 via-cyan-900/88 to-sky-950",
  border: "border-sky-600/55",
  glow: "shadow-sky-950/45",
  accentBorder: "border-sky-400/75",
  costBg: "bg-gradient-to-br from-sky-600 to-blue-900",
  costGlow: "shadow-sky-500/50",
  nameBg: "bg-sky-950/85",
  statColor: "text-sky-200",
  typeColor: "text-sky-300",
};

const WATCHER: CardTypeStyle = {
  gradient: "from-violet-950 via-purple-900/90 to-violet-950",
  border: "border-violet-500/55",
  glow: "shadow-violet-950/45",
  accentBorder: "border-fuchsia-400/70",
  costBg: "bg-gradient-to-br from-violet-600 to-purple-900",
  costGlow: "shadow-violet-500/50",
  nameBg: "bg-violet-950/85",
  statColor: "text-violet-200",
  typeColor: "text-fuchsia-300",
};

/** Neutral / merchant / shared pool — lighter gray chrome */
const COLORLESS: CardTypeStyle = {
  gradient: "from-zinc-600 via-zinc-500/88 to-zinc-600",
  border: "border-zinc-400/45",
  glow: "shadow-zinc-900/35",
  accentBorder: "border-zinc-300/55",
  costBg: "bg-gradient-to-br from-zinc-500 to-zinc-700",
  costGlow: "shadow-zinc-400/35",
  nameBg: "bg-zinc-700/88",
  statColor: "text-zinc-100",
  typeColor: "text-zinc-200",
};

const STATUS: CardTypeStyle = {
  gradient: "from-slate-700 via-slate-600/92 to-slate-700",
  border: "border-slate-500/55",
  glow: "shadow-slate-900/40",
  accentBorder: "border-slate-400/65",
  costBg: "bg-gradient-to-br from-slate-500 to-slate-700",
  costGlow: "shadow-slate-500/40",
  nameBg: "bg-slate-800/90",
  statColor: "text-slate-200",
  typeColor: "text-slate-300",
};

const CURSE: CardTypeStyle = {
  gradient: "from-neutral-950 via-black/96 to-neutral-950",
  border: "border-zinc-900/85",
  glow: "shadow-black/55",
  accentBorder: "border-zinc-700/55",
  costBg: "bg-gradient-to-br from-zinc-800 to-black",
  costGlow: "shadow-zinc-900/50",
  nameBg: "bg-black/80",
  statColor: "text-zinc-400",
  typeColor: "text-zinc-500",
};

/**
 * Card-design-gallery only: chrome keyed by STS `characters[0]` (ironclad, silent, …).
 * Falls back to colorless when unknown; Curse/Status still use curse/status palettes when set in DB.
 */
export function getGalleryCharacterChromeStyle(card: Card): CardTypeStyle {
  const raw = (card as Record<string, unknown>).character;
  const c = typeof raw === "string" ? raw.toLowerCase() : undefined;
  const t = card.type;

  const key =
    c ??
    (t === "Curse" ? "curse" : t === "Status" ? "status" : undefined);

  switch (key) {
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

/**
 * Combat / planner: character-colored chrome when `card.character` (STS) or Curse/Status type is set;
 * otherwise fall back to type gradients (legacy inline deck cards without STS `characters`).
 */
export function resolveGameCardChromeStyle(
  card: Card,
  galleryChromeStyle?: CardTypeStyle,
): CardTypeStyle {
  if (galleryChromeStyle) return galleryChromeStyle;
  /** Potions always use amber `cardTypeStyles.Potion` chrome, not character gradients. */
  if (card.type === "Potion") {
    return cardTypeStyles.Potion;
  }
  const hasChar = typeof (card as Record<string, unknown>).character === "string";
  if (hasChar || card.type === "Curse" || card.type === "Status") {
    return getGalleryCharacterChromeStyle(card);
  }
  const validTypes = ["Attack", "Skill", "Power", "Potion", "Curse", "Status"];
  const cardType = validTypes.includes(card.type || "") ? card.type! : "Attack";
  return cardTypeStyles[cardType as keyof typeof cardTypeStyles];
}
