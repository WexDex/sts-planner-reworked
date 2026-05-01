import type { ReactElement } from "react";
import { GlossaryTable } from "@/app/tutorial/GlossaryTable";
import {
  BUFF_DEBUFF_TUTORIAL_ROWS,
  effectTutorialRows,
  enemyIntentTutorialRows,
  stsGlyphTutorialRows,
} from "@/app/tutorial/reference";

export function TutorialEffectsGlossary(): ReactElement {
  const rows = effectTutorialRows();
  return (
    <GlossaryTable
      headers={["Icon", "Key", "Field", "Label", "Description"]}
      identifierColumnIndices={[0]}
      codeColumnIndex={1}
      proseEmphasisColumnIndices={[2]}
      glossaryPreviewKind="effect"
      rows={rows.map((r) => ({
        rowKey: r.id,
        icon: <r.Icon className={`h-4 w-4 shrink-0 ${r.iconClass}`} strokeWidth={2.25} aria-hidden />,
        cells: [r.id, r.relatedField, r.fullLabel, r.gist],
      }))}
    />
  );
}

export function TutorialStsGlyphGlossary(): ReactElement {
  const rows = stsGlyphTutorialRows();
  return (
    <GlossaryTable
      headers={["Icon", "Catalog key", "Field", "Label", "Description"]}
      identifierColumnIndices={[0]}
      codeColumnIndex={1}
      proseEmphasisColumnIndices={[2]}
      glossaryPreviewKind="glyph"
      rows={rows.map((r) => ({
        rowKey: r.catalogKey,
        icon: <r.Icon className={`h-4 w-4 shrink-0 ${r.iconClass}`} strokeWidth={2.25} aria-hidden />,
        cells: [r.catalogKey, r.relatedField, r.shortLabel, r.gist],
      }))}
    />
  );
}

export function TutorialBuffDebuffGlossary(): ReactElement {
  return (
    <GlossaryTable
      headers={["Kind", "Name", "Meaning"]}
      proseEmphasisColumnIndices={[0]}
      rows={BUFF_DEBUFF_TUTORIAL_ROWS.map((r) => ({
        rowKey: `${r.kind}-${r.name}`,
        icon: (
          <span
            className={`inline-flex h-7 min-w-[2.75rem] items-center justify-center rounded-md border px-1.5 text-[10px] font-bold uppercase tracking-wide ${
              r.kind === "buff"
                ? "border-teal-500/40 bg-teal-950/40 text-teal-100"
                : "border-rose-500/40 bg-rose-950/35 text-rose-100"
            }`}
          >
            {r.kind}
          </span>
        ),
        cells: [r.name, r.gist],
      }))}
    />
  );
}

export function TutorialIntentGlossary(): ReactElement {
  const intentRows = enemyIntentTutorialRows();
  return (
    <GlossaryTable
      headers={["Glyph", "Type", "Title", "Meaning"]}
      identifierColumnIndices={[0]}
      proseEmphasisColumnIndices={[1]}
      rows={intentRows.map((r) => ({
        rowKey: r.type,
        icon: (
          <span className="inline-flex min-w-[2rem] justify-center text-base" aria-hidden>
            {r.emoji}
          </span>
        ),
        cells: [r.type, r.title, r.gist],
      }))}
    />
  );
}
