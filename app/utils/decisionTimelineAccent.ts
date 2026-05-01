import type { DecisionNode } from '@/app/types/gameTypes';

export const DECISION_TIMELINE_ACC_HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Golden-angle hue steps (~137.5°) spread sequential picks around the wheel with low overlap. */
const GOLDEN_ANGLE_DEG = 137.50776405003784;

/** Saturated but readable accents (HSL 0–1). */
const ACCENT_S = 0.64;
const ACCENT_L = 0.49;

function componentToHex(x: number): string {
  return Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0').toUpperCase();
}

/** `h` degrees 0–360; `s`, `l` in 0–1. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

export function hslHueToAccentHex(hueDeg: number): string {
  const h = ((hueDeg % 360) + 360) % 360;
  const [r, g, b] = hslToRgb(h, ACCENT_S, ACCENT_L);
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function hexToRgbTuple(hex: string): [number, number, number] | null {
  const t = hex.trim();
  if (!DECISION_TIMELINE_ACC_HEX_RE.test(t)) return null;
  const n = parseInt(t.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** RGB 0–255 → hue degrees 0–360 (gray maps to 0). */
export function rgbToHueDeg(r: number, g: number, b: number): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  if (d < 1e-6) return 0;
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

export function hueAngularDistanceDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

export function normalizeDecisionTimelineAccentHex(raw: string | null | undefined): string | null {
  const t = raw?.trim() ?? '';
  if (!DECISION_TIMELINE_ACC_HEX_RE.test(t)) return null;
  return `#${t.slice(1).toUpperCase()}`;
}

/**
 * `count` hues spaced by the golden angle from a random spin — strongly distinguishable in sequence (import spine).
 */
export function assignDistinctTimelineAccentHexesSequential(count: number): string[] {
  if (count <= 0) return [];
  const base = Math.random() * 360;
  return Array.from({ length: count }, (_, i) =>
    hslHueToAccentHex(base + i * GOLDEN_ANGLE_DEG),
  );
}

/**
 * Pick a hue that maximizes minimum angular separation from existing accents (fork + migration fills).
 */
export function pickDistinctTimelineAccentHex(existingHexes: readonly string[]): string {
  const hues: number[] = [];
  for (const raw of existingHexes) {
    const hex = normalizeDecisionTimelineAccentHex(raw);
    if (!hex) continue;
    const rgb = hexToRgbTuple(hex);
    if (!rgb) continue;
    hues.push(rgbToHueDeg(rgb[0], rgb[1], rgb[2]));
  }

  let bestHue = Math.random() * 360;
  let bestMinSep = -1;
  const trials = 96;
  for (let k = 0; k < trials; k++) {
    const hue = (k * GOLDEN_ANGLE_DEG * 1.309 + hues.length * 19.7 + (k % 7) * 11) % 360;
    const minSep =
      hues.length === 0 ? 180 : Math.min(...hues.map((h) => hueAngularDistanceDeg(hue, h)));
    if (minSep > bestMinSep) {
      bestMinSep = minSep;
      bestHue = hue;
    }
  }
  for (let j = 0; j < 32; j++) {
    const hue = Math.random() * 360;
    const minSep =
      hues.length === 0 ? 180 : Math.min(...hues.map((h) => hueAngularDistanceDeg(hue, h)));
    if (minSep > bestMinSep) {
      bestMinSep = minSep;
      bestHue = hue;
    }
  }
  return hslHueToAccentHex(bestHue);
}

/** Legacy name: single new accent with no peers to avoid (same as empty pool). */
export function randomDecisionTimelineAccentHex(): string {
  return pickDistinctTimelineAccentHex([]);
}

export function timelineAccentRgba(hex: string, alpha: number): string {
  const norm = normalizeDecisionTimelineAccentHex(hex);
  const rgb = hexToRgbTuple(norm ?? hex);
  if (!rgb) return `rgba(100,116,139,${alpha})`;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

export function resolvedDecisionTimelineAccentHex(n: DecisionNode, fallback = '#64748B'): string {
  return normalizeDecisionTimelineAccentHex(n.timelineAccentHex) ?? fallback;
}

/** Assign or repair accents; missing nodes get hues spaced away from already-valid peers (stable sort). */
export function ensureDecisionNodesTimelineAccents(nodes: DecisionNode[]): DecisionNode[] {
  if (nodes.length === 0) return nodes;
  const sorted = [...nodes].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const idToHex = new Map<string, string>();
  const pool: string[] = [];

  for (const n of sorted) {
    const fixed = normalizeDecisionTimelineAccentHex(n.timelineAccentHex);
    if (fixed) {
      idToHex.set(n.id, fixed);
      pool.push(fixed);
    }
  }
  for (const n of sorted) {
    if (idToHex.has(n.id)) continue;
    const next = pickDistinctTimelineAccentHex(pool);
    idToHex.set(n.id, next);
    pool.push(next);
  }
  return nodes.map((n) => ({ ...n, timelineAccentHex: idToHex.get(n.id)! }));
}
