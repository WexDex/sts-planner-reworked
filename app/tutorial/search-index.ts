import {
  BUFF_DEBUFF_TUTORIAL_ROWS,
  EFFECT_TUTORIAL_NOTES,
  effectTutorialRows,
  enemyIntentTutorialRows,
  stsGlyphTutorialRows,
} from "@/app/tutorial/reference";
import type { EffectType } from "@/app/utils/effectDisplay";

/** Serializable for client-side search — no icons / functions. */
export type TutorialSearchEntry = {
  id: string;
  href: string;
  title: string;
  preview: string;
  bucket: string;
  /** Normalized for client matching */
  matchText: string;
};

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function entry(
  input: Omit<TutorialSearchEntry, "matchText"> & { searchExtra?: string },
): TutorialSearchEntry {
  const { searchExtra, ...rest } = input;
  return {
    ...rest,
    matchText: norm(`${rest.title} ${rest.preview} ${rest.bucket} ${searchExtra ?? ""}`),
  };
}

const PROSE_BLOCKS: Omit<TutorialSearchEntry, "matchText">[] = [
  {
    id: "prose-overview",
    title: "Overview — planner model",
    href: "/tutorial#overview",
    preview:
      "Combat JSON combined with planner rows; active row drives vitals, board, timeline, and optional decision graph.",
    bucket: "Getting started",
  },
  {
    id: "prose-quick",
    title: "Quick start — workflow",
    href: "/tutorial#quick-start",
    preview:
      "Load project or combat JSON, Turn maker intents, Save row drift, Save project, Close project, decision timeline exports.",
    bucket: "Getting started",
  },
  {
    id: "prose-phases",
    title: "Turn phases start → player → enemy",
    href: "/tutorial#phases",
    preview:
      "Phase buttons log turn boundaries; scripted enemy intents for the selected planner slot advance into the next row.",
    bucket: "Getting started",
  },
  {
    id: "prose-ui-map",
    title: "Planner UI map — regions",
    href: "/tutorial#ui-map",
    preview:
      "Top bar, timeline rail, main field, deck strip, actions bar, right dock, mobile shell sheets.",
    bucket: "Getting started",
  },
  {
    id: "prose-legend",
    title: "Legend vs full glyph catalog",
    href: "/tutorial/glyphs#legend-depth",
    preview:
      "Top-bar legend (cardIconLegend) vs full STS_ICON_GLYPH and STS_CARDS_DB iconCatalog keys.",
    bucket: "Glyphs & stats",
  },
  {
    id: "prose-saves-hub",
    title: "Saves — project file, combat, planner JSON",
    href: "/tutorial#saves",
    preview:
      "sts-planner-project v1, sts_planner_last_project_v1, combat JSON, planner export, sts_game_save debounce.",
    bucket: "Getting started",
  },
  {
    id: "prose-icon-reading",
    title: "Reading card iconography",
    href: "/tutorial/glyphs#icon-reading",
    preview:
      "Stat rows, keyword chips, conditioned markers, AoE badges, orb icons on planner cards.",
    bucket: "Glyphs & stats",
  },
  {
    id: "prose-authoring",
    title: "Author intents for planner slots",
    href: "/tutorial/turn-maker#authoring",
    preview:
      "Combine attack, multi_hit, block, debuff, buff, status, stunned, cowardly, no_action tiles; apply to planner.",
    bucket: "Turn maker",
  },
  {
    id: "prose-json-shape",
    title: "Enemy JSON shape — intents array",
    href: "/tutorial/turn-maker#json-shape",
    preview: "Enemy intents keyed by numeric turn; planner rows mirror those slot ids.",
    bucket: "Turn maker",
  },
  {
    id: "prose-intents-guide",
    title: "Turn maker — intent types reference",
    href: "/tutorial/turn-maker#glossary-intents",
    preview: "EnemyIntentAction types, emoji chips, fields dmg count effect value location.",
    bucket: "Turn maker",
  },
  {
    id: "prose-branching",
    title: "Branching checkpoints and timelines",
    href: "/tutorial/decision-timeline#branching",
    preview:
      "Fork from active or selected checkpoint; breadcrumbs; parallel hypotheticals before committing.",
    bucket: "Decision timeline",
  },
  {
    id: "prose-apply",
    title: "Apply branch to planner",
    href: "/tutorial/decision-timeline#apply-sync",
    preview:
      "Apply checkpoint snapshot merges rows; isApplyDecisionBranchToPlannerSynced shows drift warnings.",
    bucket: "Decision timeline",
  },
  {
    id: "prose-export",
    title: "Export planner JSON downloadPlannerSaveJson",
    href: "/tutorial/decision-timeline#export-json",
    preview:
      "Exported payload: turns, currentTurnIndex, turnPhase, decisionNodes, activeDecisionNodeId, graph positions.",
    bucket: "Decision timeline",
  },
  {
    id: "prose-persist",
    title: "Timeline persistence — last project and autosave",
    href: "/tutorial/decision-timeline#persist",
    preview:
      "sts_planner_last_project_v1 auto-restore; sts_game_save debounced; no default combat on boot; Close project clears storage.",
    bucket: "Decision timeline",
  },
  {
    id: "prose-chrome",
    title: "Card chrome — strip layout",
    href: "/tutorial/cards#chrome-strip",
    preview:
      "Cost, upgrade star, rarity, type line, effect glyphs from STS bundle, merged description rendering.",
    bucket: "Cards",
  },
  {
    id: "prose-gallery",
    title: "Card design gallery regression lab",
    href: "/tutorial/cards#gallery",
    preview:
      "Open /card-design-gallery for templates, random STS pulls, rarity filters, aurora/neon skins.",
    bucket: "Cards",
  },
  {
    id: "prose-theme-pack",
    title: "Theme wrapper export pack",
    href: "/tutorial/theme#export-pack",
    preview: "ZIP of theme.html, theme_docs.html, sts-theme.css from /theme-wrapper.",
    bucket: "Theme",
  },
  {
    id: "prose-theme-use",
    title: "When to use theme wraps",
    href: "/tutorial/theme#use-cases",
    preview: "Static HTML/CSS STS-style docs and embeds separate from planner React chrome.",
    bucket: "Theme",
  },
  {
    id: "prose-disclaimer",
    title: "Disclaimer — unofficial fan tool",
    href: "/tutorial#disclaimer",
    preview:
      "Not affiliated with Mega Crit Games; abbreviated mechanics — verify against the vanilla game.",
    bucket: "Getting started",
  },
];

export function getTutorialSearchIndex(): TutorialSearchEntry[] {
  const out: TutorialSearchEntry[] = [];

  PROSE_BLOCKS.forEach((b) => out.push(entry(b)));

  effectTutorialRows().forEach((e) =>
    out.push(
      entry({
        id: `eff-${e.id}`,
        href: `/tutorial/glyphs#glossary-effects`,
        title: `Stat / effect: ${e.fullLabel}`,
        preview: `${e.id} — ${EFFECT_TUTORIAL_NOTES[e.id as EffectType]}`,
        bucket: "Glyphs & stats · effects",
        searchExtra: e.relatedField,
      }),
    ),
  );

  stsGlyphTutorialRows().forEach((g) =>
    out.push(
      entry({
        id: `glyph-${g.catalogKey}`,
        href: `/tutorial/glyphs#glossary-glyphs`,
        title: `Card glyph · ${g.shortLabel}`,
        preview: `${g.catalogKey}: ${g.gist}`,
        bucket: "Glyphs & stats · catalog keys",
        searchExtra: g.relatedField,
      }),
    ),
  );

  enemyIntentTutorialRows().forEach((r) =>
    out.push(
      entry({
        id: `intent-${r.type}`,
        href: `/tutorial/turn-maker#glossary-intents`,
        title: `${r.emoji} Enemy intent · ${r.title}`,
        preview: `${r.type}: ${r.gist}`,
        bucket: "Turn maker · intents",
      }),
    ),
  );

  BUFF_DEBUFF_TUTORIAL_ROWS.forEach((b) =>
    out.push(
      entry({
        id: `bd-${b.name.replace(/\s+/g, "-").toLowerCase()}`,
        href: `/tutorial/glyphs#glossary-status`,
        title: `${b.kind === "buff" ? "Buff" : "Debuff"} · ${b.name}`,
        preview: b.gist,
        bucket: "Glyphs & stats · status",
      }),
    ),
  );

  return out;
}
