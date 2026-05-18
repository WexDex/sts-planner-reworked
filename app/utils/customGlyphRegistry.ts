import type { CustomGlyph } from "@/app/types/glyphTypes";
import type { LucideIcon } from "lucide-react";
import baseGlyphs from "@/app/data/custom_glyphs.json";

const LS_KEY = "custom_glyphs";

export function loadCustomGlyphs(): CustomGlyph[] {
  if (typeof window === "undefined") return baseGlyphs as CustomGlyph[];
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return JSON.parse(stored) as CustomGlyph[];
  } catch {
    // ignore corrupt storage
  }
  return baseGlyphs as CustomGlyph[];
}

export function saveCustomGlyphs(glyphs: CustomGlyph[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(glyphs));
}

export function resetCustomGlyphs(): CustomGlyph[] {
  localStorage.removeItem(LS_KEY);
  return baseGlyphs as CustomGlyph[];
}

/** Resolve a Lucide icon component by string name at runtime. Returns undefined if not found. */
export async function resolveLucideIconAsync(name: string): Promise<LucideIcon | undefined> {
  const mod = await import("lucide-react");
  const comp = (mod as Record<string, unknown>)[name];
  return typeof comp === "function" ? (comp as LucideIcon) : undefined;
}

const LS_BUILTIN_KEY = "builtin_glyph_overrides";

export function loadBuiltinGlyphOverrides(): Record<string, { hideNumber?: boolean }> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(LS_BUILTIN_KEY);
    if (stored) return JSON.parse(stored) as Record<string, { hideNumber?: boolean }>;
  } catch { /* ignore */ }
  return {};
}

export function saveBuiltinGlyphOverrides(overrides: Record<string, { hideNumber?: boolean }>): void {
  localStorage.setItem(LS_BUILTIN_KEY, JSON.stringify(overrides));
}

/** Synchronous version — works only after lucide-react is already loaded in the bundle. */
export function resolveLucideIconSync(name: string): LucideIcon | undefined {
  // Use require-style access; safe in client bundles where lucide is already chunked in.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("lucide-react") as Record<string, unknown>;
    const comp = mod[name];
    return typeof comp === "function" ? (comp as LucideIcon) : undefined;
  } catch {
    return undefined;
  }
}
