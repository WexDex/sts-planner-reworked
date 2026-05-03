import raw from "@/app/data/db/STS_CARDS_DB.json";

type StsCardEntry = Record<string, unknown>;

type StsRoot = {
  cards?: Record<string, StsCardEntry>;
} & Record<string, unknown>;

export function getStsCardsRecord(): Record<string, StsCardEntry> {
  const root = raw as StsRoot;
  if (root.cards && typeof root.cards === "object" && !Array.isArray(root.cards)) {
    return root.cards;
  }
  const out: Record<string, StsCardEntry> = {};
  for (const [k, v] of Object.entries(root)) {
    if (k.startsWith("_") || k === "iconCatalog") continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = v as StsCardEntry;
    }
  }
  return out;
}

export function listStsCardIdsSorted(): string[] {
  return Object.keys(getStsCardsRecord()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

/** Uniform sample without replacement; count clamps to available cards. */
export function pickRandomStsCardIds(count: number): string[] {
  const all = listStsCardIdsSorted();
  if (all.length === 0) return [];
  const n = Math.max(0, Math.min(Math.floor(count), all.length));
  const copy = [...all];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, n);
}
