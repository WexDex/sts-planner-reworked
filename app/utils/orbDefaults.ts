export interface OrbTypeDefaults {
  passiveDmg: number;
  evokeDmg: number;
}

export const BUILTIN_ORBS: { type: string; label: string; emoji: string }[] = [
  { type: "lightning", label: "Lightning", emoji: "⚡" },
  { type: "dark",      label: "Dark",      emoji: "🌑" },
  { type: "frost",     label: "Frost",     emoji: "🔵" },
  { type: "plasma",    label: "Plasma",    emoji: "⬜" },
];

export const DEFAULT_ORB_VALUES: Record<string, OrbTypeDefaults> = {
  lightning: { passiveDmg: 3,  evokeDmg: 8  },
  dark:      { passiveDmg: 6,  evokeDmg: 0  },
  frost:     { passiveDmg: 2,  evokeDmg: 11 },
  plasma:    { passiveDmg: 1,  evokeDmg: 2  },
};

const STORAGE_KEY = "sts-orb-defaults";

export function getOrbDefaults(): Record<string, OrbTypeDefaults> {
  if (typeof window === "undefined") return { ...DEFAULT_ORB_VALUES };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_ORB_VALUES };
    return { ...DEFAULT_ORB_VALUES, ...JSON.parse(stored) };
  } catch {
    return { ...DEFAULT_ORB_VALUES };
  }
}

export function saveOrbDefaults(defaults: Record<string, OrbTypeDefaults>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch { /* ignore */ }
}
