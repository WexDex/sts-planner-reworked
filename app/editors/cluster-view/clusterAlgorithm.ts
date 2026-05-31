import type { ClusterFieldDef, ClusterResult, AppearanceConfig } from "./clusterTypes";

/** Deterministic organic blob border-radius per cluster id. */
export function blobBorderRadius(clusterId: number): string {
  const b = (clusterId * 7919 + 3571) % 10000;
  const v = (i: number) => 33 + ((b + i * 1481) % 35);
  return `${v(0)}% ${v(1)}% ${v(2)}% ${v(3)}% / ${v(4)}% ${v(5)}% ${v(6)}% ${v(7)}%`;
}

export const CLUSTER_COLORS = [
  "#ef4444", "#3b82f6", "#22c55e", "#f59e0b",
  "#a855f7", "#06b6d4", "#f97316", "#ec4899",
  "#84cc16", "#14b8a6", "#6366f1", "#d946ef",
];

export const CLUSTER_FIELDS: ClusterFieldDef[] = [
  { key: "type",               label: "Card Type",      kind: "categorical" },
  { key: "rarity",             label: "Rarity",         kind: "categorical" },
  { key: "characters",         label: "Character",      kind: "categorical" },
  { key: "cost",               label: "Cost",           kind: "numeric"     },
  { key: "damage",             label: "Damage",         kind: "numeric"     },
  { key: "block",              label: "Block",          kind: "numeric"     },
  { key: "draw",               label: "Draw",           kind: "numeric"     },
  { key: "heal",               label: "Heal",           kind: "numeric"     },
  { key: "energyGain",         label: "Energy Gain",    kind: "numeric"     },
  { key: "focus",              label: "Focus",          kind: "numeric"     },
  { key: "mantra",             label: "Mantra",         kind: "numeric"     },
  { key: "hitCount",           label: "Hit Count",      kind: "numeric"     },
  { key: "innate",             label: "Innate",         kind: "boolean"     },
  { key: "ethereal",           label: "Ethereal",       kind: "boolean"     },
  { key: "retain",             label: "Retain",         kind: "boolean"     },
  { key: "xCost",              label: "X-Cost",         kind: "boolean"     },
  { key: "scalesWithStrength", label: "Scales w/ Str",  kind: "boolean"     },
  { key: "scalesWithDexterity",label: "Scales w/ Dex",  kind: "boolean"     },
  { key: "selfExhaustOnPlay",  label: "Exhaust Self",   kind: "boolean"     },
  { key: "unplayable",         label: "Unplayable",     kind: "boolean"     },
  { key: "canAddCards",        label: "Adds Cards",     kind: "boolean"     },
];

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  nodeSize: 18,
  nodeShape: "circle",
  nodeBorderWidth: 1,
  nodeOpacity: 90,
  showNodeLabel: false,
  clusterBgOpacity: 20,
  showClusterBorder: true,
  clusterBorderWidth: 1,
  showClusterLabel: true,
  clusterLabelSize: 13,
  clusterLabelColor: "#e2e8f0",
  nodeSpacing: 8,
  clusterSpacing: 80,
  clusterPadding: 20,
  canvasBg: "#020617",
  tooltipFields: ["type", "rarity", "characters", "cost", "damage", "block"],
  tooltipMaxWidth: 220,
  clusterColors: {},
};

// ─── Value helpers ────────────────────────────────────────────────────────────

function resolveNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "base" in v) return (v as any).base ?? 0;
  return 0;
}

function resolveBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (v && typeof v === "object" && "base" in v) return !!(v as any).base;
  return !!v;
}

function getFieldStringValue(card: Record<string, unknown>, key: string): string {
  const def = CLUSTER_FIELDS.find(f => f.key === key);
  if (!def) return "(none)";
  const raw = card[key];
  if (def.kind === "categorical") {
    if (raw == null || raw === "") return "(none)";
    if (Array.isArray(raw)) return raw.join(", ");
    return String(raw);
  }
  if (def.kind === "numeric") {
    if (key === "cost" && card["xCost"]) return "X";
    return String(resolveNum(raw));
  }
  if (def.kind === "boolean") return resolveBool(raw) ? "Yes" : "No";
  return "(none)";
}

// ─── Public: get readable field value for tooltips ───────────────────────────

export function getCardFieldDisplay(card: Record<string, unknown>, key: string): string {
  return getFieldStringValue(card, key);
}

// ─── Field stats (used by ClusterDetail) ─────────────────────────────────────

export type NumericFieldStats = {
  min: number;
  avg: number;
  max: number;
  presentCount: number;
};

export type BooleanFieldStats = {
  yesCount: number;
  noCount: number;
};

export function getNumericFieldStats(
  cardIds: string[],
  cards: Record<string, unknown>,
  key: string,
): NumericFieldStats | null {
  const def = CLUSTER_FIELDS.find(f => f.key === key);
  if (!def || def.kind !== "numeric") return null;

  const vals: number[] = [];
  for (const id of cardIds) {
    const raw = (cards[id] as Record<string, unknown> | undefined)?.[key];
    if (raw != null) vals.push(resolveNum(raw));
  }
  if (vals.length === 0) return null;

  const sum = vals.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...vals),
    max: Math.max(...vals),
    avg: sum / vals.length,
    presentCount: vals.length,
  };
}

export function getBooleanFieldStats(
  cardIds: string[],
  cards: Record<string, unknown>,
  key: string,
): BooleanFieldStats | null {
  const def = CLUSTER_FIELDS.find(f => f.key === key);
  if (!def || def.kind !== "boolean") return null;

  let yes = 0, no = 0;
  for (const id of cardIds) {
    const card = cards[id] as Record<string, unknown> | undefined;
    if (!card) continue;
    resolveBool(card[key]) ? yes++ : no++;
  }
  return { yesCount: yes, noCount: no };
}

/** Returns true if the card has a non-null value for every field in the list. */
export function cardHasAllFields(
  card: Record<string, unknown>,
  fields: string[],
): boolean {
  return fields.every(key => card[key] != null);
}

// ─── Manual clustering ────────────────────────────────────────────────────────

export function runManualCluster(
  cardIds: string[],
  cards: Record<string, unknown>,
  field: string,
): ClusterResult[] {
  const groups = new Map<string, string[]>();
  for (const id of cardIds) {
    const card = cards[id] as Record<string, unknown> | undefined;
    if (!card) continue;
    const val = getFieldStringValue(card, field);
    if (!groups.has(val)) groups.set(val, []);
    groups.get(val)!.push(id);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([label, ids], i) => ({ clusterId: i, label, cardIds: ids }));
}

// ─── Auto-k ───────────────────────────────────────────────────────────────────

export function autoK(
  cardIds: string[],
  cards: Record<string, unknown>,
  primaryField: string,
): number {
  const unique = new Set<string>();
  for (const id of cardIds) {
    const card = cards[id] as Record<string, unknown> | undefined;
    if (card) unique.add(getFieldStringValue(card, primaryField));
  }
  return Math.max(2, Math.min(unique.size, 12));
}

// ─── K-Means ──────────────────────────────────────────────────────────────────

function encodeCards(
  cardIds: string[],
  cards: Record<string, unknown>,
  fields: string[],
): number[][] {
  const catValues: Record<string, string[]> = {};
  const numMins: Record<string, number> = {};
  const numMaxs: Record<string, number> = {};

  for (const key of fields) {
    const def = CLUSTER_FIELDS.find(f => f.key === key);
    if (!def) continue;
    if (def.kind === "categorical") {
      const vals = new Set<string>();
      for (const id of cardIds) {
        const c = cards[id] as Record<string, unknown> | undefined;
        if (c) vals.add(c[key] == null ? "(none)" : String(c[key]));
      }
      catValues[key] = Array.from(vals).sort();
    }
    if (def.kind === "numeric") {
      let mn = Infinity, mx = -Infinity;
      for (const id of cardIds) {
        const c = cards[id] as Record<string, unknown> | undefined;
        if (!c) continue;
        const n = resolveNum(c[key]);
        if (n < mn) mn = n;
        if (n > mx) mx = n;
      }
      numMins[key] = mn === Infinity ? 0 : mn;
      numMaxs[key] = mx === -Infinity ? 1 : mx;
    }
  }

  return cardIds.map(id => {
    const card = (cards[id] as Record<string, unknown>) ?? {};
    const vec: number[] = [];
    for (const key of fields) {
      const def = CLUSTER_FIELDS.find(f => f.key === key);
      if (!def) continue;
      if (def.kind === "categorical") {
        const v = card[key] == null ? "(none)" : String(card[key]);
        for (const cv of catValues[key] ?? []) vec.push(v === cv ? 1 : 0);
      } else if (def.kind === "numeric") {
        const mn = numMins[key] ?? 0;
        const mx = numMaxs[key] ?? 1;
        vec.push(mx > mn ? (resolveNum(card[key]) - mn) / (mx - mn) : 0);
      } else if (def.kind === "boolean") {
        vec.push(resolveBool(card[key]) ? 1 : 0);
      }
    }
    return vec;
  });
}

// ─── Combo clustering ─────────────────────────────────────────────────────────

export const COMBO_BIN_LABELS: Record<number, string[]> = {
  2: ["Low", "High"],
  3: ["Low", "Mid", "High"],
  4: ["Low", "Mid-Low", "Mid-High", "High"],
};

/**
 * Builds thresholds from the sorted values of cards that actually have the field.
 * Cards missing the field are assigned to a "None" bin separately.
 * Returns (thresholds, binLabels) where thresholds.length === binLabels.length - 1.
 */
function numericBinSetup(
  presentVals: number[],
  numBins: number,
): { thresholds: number[]; labels: string[] } {
  const labels = COMBO_BIN_LABELS[numBins] ?? COMBO_BIN_LABELS[3]!;
  const sorted = [...presentVals].sort((a, b) => a - b);

  if (sorted.length === 0) return { thresholds: [], labels: [labels[0]!] };

  // Percentile thresholds — deduplicated so equal-value runs don't create empty bins
  const raw: number[] = [];
  for (let i = 1; i < numBins; i++) {
    const idx = Math.floor((i / numBins) * sorted.length);
    raw.push(sorted[Math.min(idx, sorted.length - 1)]!);
  }
  const thresholds = [...new Set(raw)].sort((a, b) => a - b);

  // If dedup collapsed bins, shrink the label set to match
  const effectiveBins = thresholds.length + 1;
  const effectiveLabels = COMBO_BIN_LABELS[effectiveBins] ?? labels.slice(0, effectiveBins);

  return { thresholds, labels: effectiveLabels };
}

/**
 * Splits each field into N quantile bins for numeric fields (cards missing the field
 * land in a dedicated "None" bin), Yes/No for boolean, and exact values for categorical.
 * numBins controls quantile count for numeric/boolean fields (default 3).
 */
export function runComboCluster(
  cardIds: string[],
  cards: Record<string, unknown>,
  fields: string[],
  numBins = 3,
): ClusterResult[] {
  if (fields.length === 0 || cardIds.length === 0) return [];

  type Binner = (card: Record<string, unknown>) => string;
  const binners: Array<{ key: string; label: string; getBin: Binner }> = [];

  for (const key of fields) {
    const def = CLUSTER_FIELDS.find(f => f.key === key);
    if (!def) continue;

    if (def.kind === "numeric") {
      // Only use cards that ACTUALLY have this field to compute thresholds
      const presentVals: number[] = [];
      for (const id of cardIds) {
        const raw = (cards[id] as Record<string, unknown> | undefined)?.[key];
        if (raw != null) presentVals.push(resolveNum(raw));
      }

      const { thresholds, labels } = numericBinSetup(presentVals, numBins);

      binners.push({
        key,
        label: def.label,
        getBin: (card) => {
          const raw = card[key];
          if (raw == null) return "None";
          const v = resolveNum(raw);
          for (let i = 0; i < thresholds.length; i++) {
            if (v < thresholds[i]!) return labels[i]!;
          }
          return labels[thresholds.length]!;
        },
      });
    } else if (def.kind === "boolean") {
      binners.push({
        key,
        label: def.label,
        getBin: (card) => resolveBool(card[key]) ? "Yes" : "No",
      });
    } else {
      // categorical — each unique value is its own bin
      binners.push({
        key,
        label: def.label,
        getBin: (card) => card[key] == null ? "(none)" : String(card[key]),
      });
    }
  }

  const groups = new Map<string, { label: string; ids: string[] }>();

  for (const id of cardIds) {
    const card = (cards[id] as Record<string, unknown>) ?? {};
    const bins = binners.map(b => b.getBin(card));
    const comboKey = bins.join("|||");
    const comboLabel = binners
      .map((b, i) => `${b.label}: ${bins[i]}`)
      .join("  ·  ");

    if (!groups.has(comboKey)) groups.set(comboKey, { label: comboLabel, ids: [] });
    groups.get(comboKey)!.ids.push(id);
  }

  return Array.from(groups.values())
    .filter(g => g.ids.length > 0)
    .sort((a, b) => b.ids.length - a.ids.length)
    .map((g, i) => ({ clusterId: i, label: g.label, cardIds: g.ids }));
}

function euclidean(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    s += d * d;
  }
  return Math.sqrt(s);
}

export function runKMeans(
  cardIds: string[],
  cards: Record<string, unknown>,
  fields: string[],
  k: number,
): ClusterResult[] {
  const n = cardIds.length;
  const ck = Math.max(1, Math.min(k, n));
  const vecs = encodeCards(cardIds, cards, fields);
  const dims = vecs[0]?.length ?? 0;

  if (dims === 0) {
    return [{ clusterId: 0, label: "All Cards", cardIds: [...cardIds] }];
  }

  // Random init: pick ck distinct indices
  const idxs = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idxs[i], idxs[j]] = [idxs[j]!, idxs[i]!];
  }
  let centroids: number[][] = idxs.slice(0, ck).map(i => [...vecs[i]!]);
  let assignments: number[] = new Array(n).fill(0);

  for (let iter = 0; iter < 100; iter++) {
    const next: number[] = vecs.map(v => {
      let best = 0, bestD = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = euclidean(v, centroids[c]!);
        if (d < bestD) { bestD = d; best = c; }
      }
      return best;
    });
    if (next.every((a, i) => a === assignments[i])) break;
    assignments = next;

    const sums: number[][] = Array.from({ length: ck }, () => new Array(dims).fill(0));
    const cnts: number[] = new Array(ck).fill(0);
    for (let i = 0; i < n; i++) {
      const c = assignments[i]!;
      cnts[c]++;
      for (let d = 0; d < dims; d++) sums[c]![d] += vecs[i]![d] ?? 0;
    }
    for (let c = 0; c < ck; c++) {
      if (cnts[c] > 0) centroids[c] = sums[c]!.map(s => s / cnts[c]);
    }
  }

  const map: Record<number, string[]> = {};
  for (let i = 0; i < n; i++) {
    const c = assignments[i]!;
    if (!map[c]) map[c] = [];
    map[c].push(cardIds[i]!);
  }

  return Object.entries(map)
    .filter(([, ids]) => ids.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([c, ids], i) => ({
      clusterId: i,
      label: `Cluster ${i + 1}`,
      cardIds: ids,
      centroid: centroids[Number(c)],
    }));
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export type LayoutCluster = {
  id: number;
  label: string;
  color: string;
  bgX: number;
  bgY: number;
  bgW: number;
  bgH: number;
  cards: Array<{ cardId: string; x: number; y: number }>;
};

// Project high-dimensional centroids to 2D using the two highest-variance axes.
function projectCentroidsTo2D(
  centroids: number[][],
  targetSpread: number,
): Array<{ x: number; y: number }> {
  const n = centroids.length;
  const d = centroids[0]!.length;

  // Mean-center
  const mean = new Array(d).fill(0) as number[];
  for (const c of centroids) c.forEach((v, i) => { mean[i]! += v / n; });
  const centered = centroids.map(c => c.map((v, i) => v - mean[i]!));

  // Pick the 2 dimensions with highest variance across centroids
  const variances = new Array(d).fill(0) as number[];
  for (const c of centered) c.forEach((v, i) => { variances[i]! += v * v; });
  const [d1, d2] = variances
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 2)
    .map(x => x.i) as [number, number];

  const proj = centered.map(c => ({ x: c[d1]!, y: c[d2 ?? d1]! }));

  // Scale so the spread matches targetSpread
  const xs = proj.map(p => p.x);
  const ys = proj.map(p => p.y);
  const rangeX = Math.max(...xs) - Math.min(...xs);
  const rangeY = Math.max(...ys) - Math.min(...ys);
  const range = Math.max(rangeX, rangeY, 1e-9);
  const scale = targetSpread / range;

  return proj.map(p => ({ x: p.x * scale, y: p.y * scale }));
}

// Force-directed repulsion so blobs don't overlap.
// Cluster half-diagonals are used as effective radii.
function repelClusters(
  positions: Array<{ x: number; y: number }>,
  radii: number[],
  gap: number,
  iterations = 180,
): Array<{ x: number; y: number }> {
  const n = positions.length;
  const pos = positions.map(p => ({ ...p }));

  for (let iter = 0; iter < iterations; iter++) {
    const cooling = 1 - iter / iterations;
    const forces: Array<{ fx: number; fy: number }> = Array.from({ length: n }, () => ({ fx: 0, fy: 0 }));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[j]!.x - pos[i]!.x;
        const dy = pos[j]!.y - pos[i]!.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minDist = radii[i]! + radii[j]! + gap;

        if (dist < minDist) {
          const overlap = (minDist - dist) / minDist;
          const strength = overlap * minDist * 0.3 * cooling;
          const nx = dx / dist;
          const ny = dy / dist;
          forces[i]!.fx -= nx * strength;
          forces[i]!.fy -= ny * strength;
          forces[j]!.fx += nx * strength;
          forces[j]!.fy += ny * strength;
        }
      }

      // Weak centripetal pull — keeps the whole layout from drifting
      forces[i]!.fx -= pos[i]!.x * 0.005 * cooling;
      forces[i]!.fy -= pos[i]!.y * 0.005 * cooling;
    }

    for (let i = 0; i < n; i++) {
      pos[i]!.x += forces[i]!.fx;
      pos[i]!.y += forces[i]!.fy;
    }
  }

  return pos;
}

function clusterCenters(
  clusterDims: Array<{ bgW: number; bgH: number }>,
  centroids: Array<number[] | undefined>,
  gap: number,
): Array<{ x: number; y: number }> {
  const n = clusterDims.length;
  if (n === 0) return [];
  if (n === 1) return [{ x: 0, y: 0 }];

  // Half-diagonal of each cluster blob = effective radius for repulsion
  const radii = clusterDims.map(d => Math.sqrt(d.bgW ** 2 + d.bgH ** 2) / 2);
  const avgRadius = radii.reduce((a, b) => a + b, 0) / n;

  // Initial positions: centroid projection (k-means) or evenly-spaced circle (manual)
  const validCentroids = centroids.filter((c): c is number[] => !!c && c.length > 0);
  let initial: Array<{ x: number; y: number }>;

  if (validCentroids.length === n) {
    const targetSpread = avgRadius * Math.max(2.5, n * 0.8);
    initial = projectCentroidsTo2D(validCentroids, targetSpread);
  } else {
    // Evenly on a circle
    const circleR = avgRadius * Math.max(1.2, n * 0.55);
    initial = clusterDims.map((_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return { x: circleR * Math.cos(angle), y: circleR * Math.sin(angle) };
    });
  }

  return repelClusters(initial, radii, gap);
}

// ─── Deterministic scatter placement ─────────────────────────────────────────

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * Places dots randomly within (innerW × innerH), seeded per card+cluster so the
 * layout is deterministic. Rejection-sampling enforces minimum spacing.
 */
function scatterDots(
  cardIds: string[],
  clusterId: number,
  innerW: number,
  innerH: number,
  nodeSize: number,
  nodeSpacing: number,
): Array<{ cardId: string; lx: number; ly: number }> {
  const minDist = nodeSize + nodeSpacing;
  const maxX = Math.max(0, innerW - nodeSize);
  const maxY = Math.max(0, innerH - nodeSize);
  const placed: Array<{ x: number; y: number }> = [];

  return cardIds.map(cardId => {
    // XOR with cluster id so same card gets different position in different clusters
    const rng = lcg(hashStr(cardId) ^ (clusterId * 0x9e3779b9 >>> 0));

    // First candidate (used as fallback if all attempts fail)
    let px = rng() * maxX;
    let py = rng() * maxY;

    for (let attempt = 0; attempt < 80; attempt++) {
      const cx = rng() * maxX;
      const cy = rng() * maxY;
      let ok = true;
      for (const p of placed) {
        const dx = cx - p.x;
        const dy = cy - p.y;
        if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
      }
      if (ok) { px = cx; py = cy; break; }
    }

    placed.push({ x: px, y: py });
    return { cardId, lx: px, ly: py };
  });
}

export function computeLayout(
  results: ClusterResult[],
  appearance: AppearanceConfig,
): LayoutCluster[] {
  if (results.length === 0) return [];

  const {
    nodeSize, nodeSpacing, clusterSpacing, clusterPadding,
    clusterLabelSize, showClusterLabel, clusterColors,
  } = appearance;

  const labelH = showClusterLabel ? clusterLabelSize + 10 : 0;
  const cell = nodeSize + nodeSpacing;

  // Square-ish blob — same approximate area as the old grid but aspect ratio 1:1
  const dims = results.map(r => {
    const side = Math.ceil(Math.sqrt(r.cardIds.length)) * cell;
    return {
      bgW: side + 2 * clusterPadding,
      bgH: side + 2 * clusterPadding + labelH,
    };
  });

  const centers = clusterCenters(dims, results.map(r => r.centroid), clusterSpacing);

  return results.map((r, i) => {
    const { bgW, bgH } = dims[i]!;
    const center = centers[i]!;
    const bgX = center.x - bgW / 2;
    const bgY = center.y - bgH / 2;

    const innerW = bgW - 2 * clusterPadding;
    const innerH = bgH - 2 * clusterPadding - labelH;
    const scattered = scatterDots(r.cardIds, r.clusterId, innerW, innerH, nodeSize, nodeSpacing);

    const cards = scattered.map(({ cardId, lx, ly }) => ({
      cardId,
      x: bgX + clusterPadding + lx,
      y: bgY + clusterPadding + labelH + ly,
    }));

    return {
      id: r.clusterId,
      label: r.label,
      color: clusterColors[r.clusterId] ?? CLUSTER_COLORS[i % CLUSTER_COLORS.length] ?? "#6366f1",
      bgX,
      bgY,
      bgW,
      bgH,
      cards,
    };
  });
}
