import type { Card } from "@/app/types/gameTypes";

export type CardGalleryFixtureRow = {
  id: string;
  title: string;
  card: Card;
  size?: "small" | "medium" | "large" | "preview";
};

const ADJECTIVES = [
  "Gilded",
  "Fractured",
  "Silent",
  "Volatile",
  "Ancient",
  "Shimmering",
  "Crimson",
  "Echoing",
] as const;

const NOUNS = [
  "Gambit",
  "Veil",
  "Protocol",
  "Ritual",
  "Edge",
  "Anchor",
  "Surge",
  "Ledger",
] as const;

const VERBS = ["Draw", "Strike", "Channel", "Exhaust", "Retain", "Scry"] as const;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function randomTitle(rng: () => number): string {
  return `${pick(rng, ADJECTIVES)} ${pick(rng, NOUNS)}`;
}

/** Build 8 sample cards; pass `seed` for reproducible sets. */
export function randomCardSample(seed?: number): CardGalleryFixtureRow[] {
  const rng = seed === undefined ? () => Math.random() : mulberry32(seed);

  const types = [
    "Attack",
    "Skill",
    "Power",
    "Potion",
    "Curse",
    "Status",
  ] as const;

  return types.map((type, i) => {
    const name = `${pick(rng, VERBS)} — ${randomTitle(rng)}`;
    const base: Card = {
      name,
      type,
      isUpgraded: rng() > 0.55,
      isChanged: rng() > 0.65,
      isSelected: rng() > 0.75,
      cost: { base: Math.floor(rng() * 4), upgraded: Math.floor(rng() * 3) },
      description:
        "Deal [DMG]. Gain [BLOCK] Block. Draw [DRAW]. Cost was [COST].",
    };

    if (type !== "Curse" && type !== "Status") {
      base.damage = { base: 6 + i, upgraded: 9 + i };
      base.block = { base: 4 + Math.floor(rng() * 5), upgraded: 7 + Math.floor(rng() * 4) };
      base.draw = { base: 1, upgraded: 2 };
    } else {
      base.description = "Unplayable. Echoes of a bad draw.";
    }

    if (type === "Attack" || type === "Skill") {
      base.takeDamage = { base: 1, upgraded: 1 };
      base.energyGain = { base: 1, upgraded: 2 };
    }

    if (type === "Power" || type === "Skill") {
      base.blockOnExhaust = { base: 3, upgraded: 5 };
    }

    return {
      id: `random-${i}-${type}`,
      title: `Random · ${type}`,
      card: base,
      size: (["large", "medium", "small"] as const)[Math.floor(rng() * 3)],
    };
  });
}

export const FIXTURE_ROWS: CardGalleryFixtureRow[] = [
  {
    id: "type-attack",
    title: "Type · Attack",
    card: {
      name: "Strike",
      type: "Attack",
      cost: 1,
      damage: 6,
      description: "Deal [DMG] damage.",
    },
    size: "large",
  },
  {
    id: "type-skill",
    title: "Type · Skill",
    card: {
      name: "Defend",
      type: "Skill",
      cost: 1,
      block: 5,
      description: "Gain [BLOCK] Block.",
    },
    size: "large",
  },
  {
    id: "type-power",
    title: "Type · Power",
    card: {
      name: "Inflame",
      type: "Power",
      cost: 1,
      description: "At the start of your turn, gain 2 Strength.",
    },
    size: "large",
  },
  {
    id: "type-potion",
    title: "Type · Potion",
    card: {
      name: "Fruit Juice",
      type: "Potion",
      cost: 0,
      description: "Gain 5 Max HP.",
    },
    size: "large",
  },
  {
    id: "type-curse",
    title: "Type · Curse (no orb)",
    card: {
      name: "Decay",
      type: "Curse",
      description: "Unplayable. At the end of your turn, lose 1 HP.",
    },
    size: "large",
  },
  {
    id: "type-status",
    title: "Type · Status (no orb)",
    card: {
      name: "Burn",
      type: "Status",
      description: "Unplayable. At the end of your turn, take 2 damage.",
    },
    size: "large",
  },
  {
    id: "upgraded",
    title: "Upgraded (+ ValueNode)",
    card: {
      name: "Heavy Blade",
      type: "Attack",
      isUpgraded: true,
      cost: { base: 2, upgraded: 2 },
      damage: { base: 14, upgraded: 20 },
      description: "Deal [DMG] damage.",
    },
    size: "large",
  },
  {
    id: "changed",
    title: "Changed pill",
    card: {
      name: "Modified Bash",
      type: "Attack",
      isChanged: true,
      cost: 2,
      damage: 8,
      vulnerable: 2,
      description: "Deal [DMG] damage. Apply [VULN] Vulnerable.",
    },
    size: "large",
  },
  {
    id: "selected",
    title: "Selected state",
    card: {
      name: "Prepared Strike",
      type: "Attack",
      isSelected: true,
      cost: 1,
      damage: 10,
      description: "Deal [DMG] damage.",
    },
    size: "large",
  },
  {
    id: "dense-stats",
    title: "Dense stats (medium)",
    card: {
      name: "Kitchen Sink",
      type: "Skill",
      cost: { base: 1, upgraded: 0 },
      isUpgraded: true,
      damage: 4,
      block: 6,
      draw: 2,
      takeDamage: 1,
      energyGain: 1,
      blockOnExhaust: 3,
      description:
        "Deal [DMG]. Block [BLOCK]. Draw [DRAW]. Lose [TAKEDMG]. Gain [GAINE] Energy. Exhaust: [BLOCK] Block.",
    },
    size: "medium",
  },
  {
    id: "long-text",
    title: "Long name + description",
    card: {
      name: "The Incomplete Manuscript of the Forgotten Spire Archivist",
      type: "Power",
      cost: 3,
      description:
        "Whenever you play [COST] or more cards in a turn, deal [DMG] to ALL enemies, gain [BLOCK] Block, and draw [DRAW] cards. This card tests wrapping.",
      damage: { base: 3, upgraded: 5 },
      block: { base: 4, upgraded: 6 },
      draw: { base: 1, upgraded: 2 },
    },
    size: "large",
  },
  {
    id: "small",
    title: "Small size",
    card: {
      name: "Slim",
      type: "Attack",
      cost: 0,
      damage: 3,
      description: "Hidden on small.",
    },
    size: "small",
  },
  {
    id: "unknown-type",
    title: "Unknown type → Attack fallback",
    card: {
      name: "Relic Echo",
      type: "Relic",
      cost: 1,
      description: "Falls back to Attack styling for border/gradient.",
    },
    size: "large",
  },
];
