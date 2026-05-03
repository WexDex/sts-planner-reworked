import {
  readStsIconCatalog,
  STS_ICON_GLYPH,
} from "@/app/card-design-gallery/galleryStsGlyphs";
import type { EnemyIntentAction } from "@/app/types/gameTypes";
import { ENEMY_INTENT_ACTION_TYPES } from "@/app/types/gameTypes";
import {
  EFFECT_TYPES_ALL,
  type EffectType,
  getEffectDisplay,
} from "@/app/utils/effectDisplay";
import { enemyIntentActionGlyph } from "@/app/utils/enemyIntentGlyphs";

/** Planner-centric blurbs for each effect/stat icon key (STS-aligned where applicable). */
export const EFFECT_TUTORIAL_NOTES: Record<EffectType, string> = {
  weak:
    "Debuff: attacker deals less damage per hit (player/enemy). Stacks usually extend duration.",
  vulnerable:
    "Debuff: target takes increased damage from Attack sources. Stacks often extend duration.",
  frail:
    "Debuff: gained Block from cards is reduced. Stacks typically extend duration.",
  damage:
    "Attack damage amount before enemy-specific mitigation; combined with vuln/weak modifiers in planner math.",
  block:
    "Mitigation shield that absorbs incoming damage until consumed at end of turn.",
  wound:
    "Status / curse card that clogs your hand; not a combat rule by itself in the planner besides being a card token.",
  strength:
    "Buff: flat damage added to each hit of Attacks (unless a special case says otherwise).",
  strength_buff:
    "Planner UI variant for Strength-style buff presentation on some effects.",
  entangle:
    "Debuff / effect: you cannot play Attacks for a turn (enemy entangle pattern).",
  takedamage:
    "Direct HP loss (hits through Block unless specified as HP loss). Distinct from Attack damage in edge cases.",
  energygain:
    "Gain Energy this turn (orb / ritual / potion-style effects).",
  draw:
    "Draw N cards from draw pile (reshuffle discard when needed in full sims).",
  intangible:
    "Take at most 1 damage per hit instance (stacks = turns). Planner ticks stacks on turn boundaries where implemented.",
  hp: "Current hit points (vitals readout and damage reconciliation).",
  maxHp: "Maximum HP cap (max HP changes, Melange, etc.).",
  health: "Generic health presentation in some UI contexts.",
  attack: "Attack stat / Attack card type context in UI coloring.",
  energy: "Energy for playing cards (base + relic modifiers + bonus energy).",
  heal: "Restore HP (blocked by some effects in real STS; planner follows loaded JSON).",
  focus: "Defect: powers orb damage / evoke scaling.",
  poison:
    "Debuff: damage over time at turn start; stacks accumulate damage in real STS (planner shows stacks from JSON).",
  hpcost:
    "Pay HP to play or trigger an effect (Blood for Blood, Offering-style costs).",
};

export type EffectTutorialRow = {
  id: string;
  Icon: ReturnType<typeof getEffectDisplay>["icon"];
  iconClass: string;
  fullLabel: string;
  gist: string;
  /** Primary `Card` JSON (or player readout) path when the icon maps to data; "—" when not direct. */
  relatedField: string;
};

/** Card / DB field paths aligned with `galleryStsGlyphs` + `Card` in gameTypes. */
const EFFECT_JSON_FIELD: Record<EffectType, string> = {
  weak: "appliesDebuffs.weak",
  vulnerable: "appliesDebuffs.vulnerable",
  frail: "appliesDebuffs.frail",
  damage: "damage (+ bonusDamage)",
  block: "block (+ bonusBlock)",
  wound: "appliesDebuffs.wound",
  strength: "appliesDebuffs (Strength grant)",
  strength_buff: "appliesDebuffs / buff lines",
  entangle: "appliesDebuffs.entangle",
  takedamage: "takeDamage",
  energygain: "energyGain",
  draw: "draw",
  intangible: "—",
  hp: "player.hp",
  maxHp: "player.maxHp",
  health: "player.hp (health readout)",
  attack: "damage (Attack rows)",
  energy: "energyGain, cost",
  heal: "heal",
  focus: "focus",
  poison: "appliesDebuffs.poison",
  hpcost: "hpcost · hpCost",
};

export function effectTutorialRows(): EffectTutorialRow[] {
  return EFFECT_TYPES_ALL.map((id) => {
    const d = getEffectDisplay(id);
    return {
      id,
      Icon: d.icon,
      iconClass: d.color,
      fullLabel: d.fullLabel,
      gist: EFFECT_TUTORIAL_NOTES[id],
      relatedField: EFFECT_JSON_FIELD[id],
    };
  });
}

export type StsGlyphTutorialRow = {
  catalogKey: string;
  shortLabel: string;
  Icon: (typeof STS_ICON_GLYPH)[string]["Icon"];
  iconClass: string;
  gist: string;
  /** Primary card JSON field(s) when glyph is data-driven; "—" when presentation-only or multi-source. */
  relatedField: string;
};

/**
 * Maps `STS_ICON_GLYPH` catalog keys to STS card JSON paths (camelCase) or short multi-field notes.
 * See `STS_CARDS_DB._meta.galleryFieldGuide` & `attributeIconLinks`.
 */
export const GLYPH_RELATED_FIELD: Record<string, string> = {
  LIGHTNING_ORB: "orbInteractions",
  FROST_ORB: "orbInteractions",
  DARK_ORB: "orbInteractions",
  PLASMA_ORB: "orbInteractions",
  DRAW_ICON: "draw",
  DISCARD_ICON: "discardEffect",
  EVOKE_ICON: "orbInteractions",
  CONDITIONAL_MARKER: "conditioned · trigger (tier nodes)",
  ANY_ORB: "orbInteractions",
  SAME_ORB_AS_EVOKED: "orbInteractions",
  AOE_ICON: "damage.target · appliesDebuffs[].target",
  AOE_DAMAGE: "multiHit · bonusDamage",
  RANDOM_ICON: "discardEffect.random · shuffle rules",
  EXHAUST_SELF: "selfExhaustOnPlay",
  SCRY_ICON: "scry",
  LOSE_STRENGTH: "appliesDebuffs.losestrength",
  KEY_INNATE: "innate",
  KEY_ETHEREAL: "ethereal",
  KEY_RETAIN: "retain",
  KEY_UNPLAYABLE: "unplayable",
  COST_MANIP: "costManipulation",
  UPGRADE_CARD: "canUpgradeCards",
  ADD_CARD: "addCard",
  CAN_ADD_CARDS: "canAddCards",
  CAN_ADD_POTIONS: "canAddPotions",
  HP_COST: "hpcost · hpCost",
  GAIN_ENERGY_ICON: "energyGain",
};

function glyphRelatedField(catalogKey: string): string {
  return GLYPH_RELATED_FIELD[catalogKey] ?? "—";
}

/** Optional longer copy layered on top of STS_CARDS_DB.json `iconCatalog` prose when present. */
const GLYPH_EXTRA: Partial<Record<string, string>> = {
  KEY_INNATE:
    "Starts each combat in your opening hand draw (Innate keyword).",
  KEY_ETHEREAL:
    "If retained in hand at end of turn, Ethereal cards exhaust instead of discarding.",
  KEY_RETAIN:
    "Not discarded at end of turn if unused (Retain keyword).",
  KEY_UNPLAYABLE:
    "Cannot be played from hand; usually a curse, status, or transient token.",
  EXHAUST_SELF:
    "This card exhausts itself when played (or when triggering its clause).",
  ADD_CARD:
    "Places a specific card into hand / deck per card JSON (distinct from generic draw).",
  COST_MANIP:
    "Changes energy cost (X costs, cost reduction, skewing).",
  UPGRADE_CARD:
    "Upgrades a card or applies upgrade-like transforms.",
  AOE_DAMAGE:
    "Gallery / planner: multi-hit sequence or secondary damage row (paired with main damage line).",
  SAME_ORB_AS_EVOKED:
    "Defect: orb effect references the type you just evoked.",
  GAIN_ENERGY_ICON:
    "+Energy shown on card body (same family as energygain stat row).",
};

export function stsGlyphTutorialRows(): StsGlyphTutorialRow[] {
  const cat = new Map(readStsIconCatalog().map((x) => [x.key, x.description]));
  const keys = Object.keys(STS_ICON_GLYPH).sort((a, b) => a.localeCompare(b));
  return keys.map((catalogKey) => {
    const meta = STS_ICON_GLYPH[catalogKey]!;
    const fromDb = cat.get(catalogKey);
    const extra = GLYPH_EXTRA[catalogKey];
    const gist =
      extra ??
      fromDb ??
      "Shown on card chrome when the bundled card data references this icon catalog key.";
    return {
      catalogKey,
      shortLabel: meta.shortLabel,
      Icon: meta.Icon,
      iconClass: meta.iconClass,
      gist,
      relatedField: glyphRelatedField(catalogKey),
    };
  });
}

export type EnemyIntentTutorialRow = {
  type: EnemyIntentAction["type"];
  emoji: string;
  title: string;
  gist: string;
};

const ENEMY_INTENT_TITLE: Record<EnemyIntentAction["type"], string> = {
  attack: "Single hit",
  multi_attack: "Multi-hit",
  block: "Enemy block",
  debuff: "Debuff on player",
  buff: "Buff on enemy",
  status: "Status cards / tokens",
  cowardly: "Flee / cowardly",
  stunned: "Stunned / idle",
  no_action: "No action",
};

const ENEMY_INTENT_GIST: Record<EnemyIntentAction["type"], string> = {
  attack:
    "One damage packet. `dmg` or legacy `value` names the amount; combined with player block/vuln/weak in planner resolution.",
  multi_attack:
    "`count` identical hits for `dmg` each; each hit runs through defensive modifiers separately in intent chips / logs.",
  block:
    "`amount` block the enemy gains for that intent line (stacks with other parts of the intent).",
  debuff:
    "`effect` names the debuff; optional `value` stacks (omit for default 1). Used for Weak, Vulnerable, etc.",
  buff:
    "`effect` + `value` stacks on the enemy (e.g. Strength, Metallicize-style buff names from JSON).",
  status:
    "`effect` names card/token type; `value` quantity; optional `location` — hand | draw | discard (defaults hand).",
  cowardly:
    "Enemy intends escape when conditions match (Looters-style); descriptive text optional.",
  stunned:
    "`value` turns stunned — shown on intent timeline / chips.",
  no_action:
    "Explicit idle intent (distinct from missing data): enemy takes no scripted actions this slot.",
};

export function enemyIntentTutorialRows(): EnemyIntentTutorialRow[] {
  return ENEMY_INTENT_ACTION_TYPES.map((type) => ({
    type,
    emoji: enemyIntentActionGlyph(type),
    title: ENEMY_INTENT_TITLE[type],
    gist: ENEMY_INTENT_GIST[type],
  }));
}

export type BuffDebuffTutorialRow = {
  name: string;
  kind: "buff" | "debuff";
  gist: string;
};

/** Common STS statuses — planner also accepts arbitrary names/stacks from imported combat JSON. */
export const BUFF_DEBUFF_TUTORIAL_ROWS: BuffDebuffTutorialRow[] = [
  {
    name: "Weak",
    kind: "debuff",
    gist: "Fewer attack damage instances from the affected character.",
  },
  {
    name: "Vulnerable",
    kind: "debuff",
    gist: "Takes extra damage from Attacks.",
  },
  {
    name: "Frail",
    kind: "debuff",
    gist: "Block gained from cards is reduced.",
  },
  {
    name: "Poison",
    kind: "debuff",
    gist: "Turn-start damage based on stacks; interacts with Artifact in real STS.",
  },
  {
    name: "Strength",
    kind: "buff",
    gist: "Bonus damage per Attack hit.",
  },
  {
    name: "Dexterity",
    kind: "buff",
    gist: "Bonus Block from Block-granting cards.",
  },
  {
    name: "Focus",
    kind: "buff",
    gist: "Defect: scales passive orb damage and evoke.",
  },
  {
    name: "Buffer",
    kind: "buff",
    gist: "Negates the next N instances of damage / loss (stack count).",
  },
  {
    name: "Artifact",
    kind: "buff",
    gist: "Negates the next N debuffs applied (stacks consumed per application).",
  },
  {
    name: "Intangible",
    kind: "buff",
    gist: "Cap damage taken per hit at 1 for stacked turns.",
  },
  {
    name: "Barricade",
    kind: "buff",
    gist: "Block persists between turns (rules follow loaded JSON / planner handling).",
  },
  {
    name: "Metallicize",
    kind: "buff",
    gist: "Gain block at end of turn per stacks.",
  },
  {
    name: "Plated Armor",
    kind: "buff",
    gist: "Block at end of turn; may decay when taking damage (per STS rules).",
  },
];
