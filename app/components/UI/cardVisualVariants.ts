import { cardTypeStyles } from "@/app/types/types";

export type CardTypeStyle = (typeof cardTypeStyles)[keyof typeof cardTypeStyles];

export const CARD_VISUAL_VARIANTS = [
  "aurora",
  "flat",
  "neon",
  "paper",
  "mono",
] as const;

export type CardVisualVariant = (typeof CARD_VISUAL_VARIANTS)[number];

export const DEFAULT_CARD_VISUAL_VARIANT: CardVisualVariant = "aurora";

type Chrome = {
  root: string;
  topLine: string;
  innerRim: string;
  bottomLine: string;
  nameBandExtra: string;
  descBoxExtra: string;
  typeLabelExtra: string;
  costOrbExtra: string;
};

function interactiveMotion(interactive: boolean, isSelected: boolean): string {
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

export function getCardVariantChrome(args: {
  variant: CardVisualVariant;
  typeStyles: CardTypeStyle;
  interactive: boolean;
  isSelected: boolean;
}): Chrome {
  const { variant, typeStyles, interactive, isSelected } = args;
  const motion = interactiveMotion(interactive, isSelected);

  if (variant === "aurora") {
    return {
      root: `relative overflow-hidden border-2 ${typeStyles.border} ${typeStyles.glow} bg-gradient-to-b ${typeStyles.gradient} shadow-xl backdrop-blur-sm transition-all duration-300 animate-slide-in-up ${motion}`,
      topLine:
        "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent",
      innerRim: `pointer-events-none absolute inset-[3px] rounded-[inherit] border ${typeStyles.accentBorder} opacity-35 transition-opacity duration-300`,
      bottomLine:
        "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent",
      nameBandExtra: "",
      descBoxExtra: "",
      typeLabelExtra: "",
      costOrbExtra: "animate-bounce-pop hover:animate-pulse-glow",
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
      costOrbExtra: "",
    };
  }

  if (variant === "neon") {
    return {
      root: `relative overflow-hidden border border-white/20 ${typeStyles.glow} bg-gradient-to-b ${typeStyles.gradient} shadow-2xl brightness-95 transition-all duration-300 ${motion}`,
      topLine:
        "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent",
      innerRim: `pointer-events-none absolute inset-[4px] rounded-[inherit] border ${typeStyles.accentBorder} opacity-50`,
      bottomLine:
        "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent",
      nameBandExtra: "",
      descBoxExtra: "",
      typeLabelExtra: "",
      costOrbExtra: "ring-2 ring-white/25 shadow-[0_0_12px_rgba(255,255,255,0.15)]",
    };
  }

  if (variant === "paper") {
    return {
      root: `relative overflow-hidden border-2 ${typeStyles.border} bg-gradient-to-b ${typeStyles.gradient} shadow-lg saturate-75 contrast-95 ring-1 ring-amber-950/40 transition-all duration-300 ${motion}`,
      topLine:
        "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/15 to-transparent",
      innerRim: `pointer-events-none absolute inset-[3px] rounded-[inherit] border ${typeStyles.accentBorder} opacity-30`,
      bottomLine:
        "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-stone-900/50 to-transparent",
      nameBandExtra: "",
      descBoxExtra: "",
      typeLabelExtra: "",
      costOrbExtra: "",
    };
  }

  /* mono */
  return {
    root: `relative overflow-hidden border-2 border-slate-600/90 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-lg transition-all duration-300 ${motion}`,
    topLine:
      "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/20 to-transparent",
    innerRim:
      "pointer-events-none absolute inset-[3px] rounded-[inherit] border border-slate-500/50 opacity-40",
    bottomLine:
      "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-600/25 to-transparent",
    nameBandExtra: "!bg-slate-800/95 !border-slate-500/80",
    descBoxExtra: "!bg-slate-800/95 !border-slate-500/80 !text-stone-200/95",
    typeLabelExtra: "!text-slate-400 opacity-100",
    costOrbExtra: "",
  };
}
