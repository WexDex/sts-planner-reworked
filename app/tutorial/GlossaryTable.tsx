"use client";

import type { ReactNode } from "react";
import { useTutorialGlossaryPreview } from "@/app/tutorial/TutorialGlossaryPreview.client";

type GlossaryRow = {
  rowKey: string;
  icon: ReactNode;
  cells: string[];
};

function cellVariant(
  colIndex: number,
  opts: {
    identifierColumns?: ReadonlySet<number>;
    codeColumnIndex?: number;
  },
): "body" | "identifier" | "code" {
  if (opts.codeColumnIndex === colIndex) return "code";
  if (opts.identifierColumns?.has(colIndex)) return "identifier";
  return "body";
}

function CellBlock({
  text,
  variant,
  proseEmphasis,
}: {
  text: string;
  variant: "body" | "identifier" | "code";
  proseEmphasis?: boolean;
}) {
  if (variant === "code") {
    const isPlaceholder = text === "—" || text.trim() === "";
    return (
      <code
        className={
          isPlaceholder
            ? `inline-flex max-w-[min(100%,22rem)] items-center rounded-lg border border-slate-800/95 bg-slate-900/50 px-2.5 py-1.5 font-mono text-[11px] font-medium leading-snug text-slate-500`
            : `inline-flex max-w-[min(100%,24rem)] break-words rounded-lg border border-cyan-500/25 bg-linear-to-br from-cyan-950/50 to-slate-950/90 px-2.5 py-1.5 font-mono text-[11px] font-medium leading-snug text-cyan-100 shadow-[inset_0_1px_0_rgba(34,211,238,0.07)] ring-1 ring-cyan-500/10`
        }
      >
        {text}
      </code>
    );
  }
  if (variant === "identifier") {
    return (
      <span className="inline-block max-w-[min(100%,15rem)] break-words rounded-md border border-violet-500/20 bg-violet-950/22 px-1.5 py-0.5 font-mono text-[11px] font-medium leading-snug text-violet-200/90 shadow-[inset_0_1px_0_rgba(167,139,250,0.06)]">
        {text}
      </span>
    );
  }
  return (
    <span
      className={
        proseEmphasis
          ? "text-[13px] font-medium leading-[1.55] text-slate-100"
          : "text-[13px] leading-[1.55] text-slate-300"
      }
    >
      {text}
    </span>
  );
}

export function GlossaryTable({
  headers,
  rows,
  identifierColumnIndices,
  codeColumnIndex,
  proseEmphasisColumnIndices,
  glossaryPreviewKind,
}: {
  headers: readonly string[];
  rows: GlossaryRow[];
  /** Mono slug chips (catalog keys, effect ids). */
  identifierColumnIndices?: readonly number[];
  /** STS JSON path column — elevated `code` appearance. */
  codeColumnIndex?: number;
  /** Body columns with slightly stronger label weight (e.g. Label / Short label / Title). */
  proseEmphasisColumnIndices?: readonly number[];
  glossaryPreviewKind?: "glyph" | "effect";
}) {
  const idSet = identifierColumnIndices ? new Set(identifierColumnIndices) : undefined;
  const emphasisSet = proseEmphasisColumnIndices ? new Set(proseEmphasisColumnIndices) : undefined;
  const glossaryPreview = useTutorialGlossaryPreview();

  const rowPreviewIds =
    glossaryPreviewKind && glossaryPreview
      ? (key: string) =>
          glossaryPreviewKind === "glyph"
            ? glossaryPreview.index.byGlyphCatalogKey[key]
            : glossaryPreview.index.byEffectId[key]
      : undefined;

  const onRowMouseEnter =
    glossaryPreviewKind && glossaryPreview && rowPreviewIds
      ? (rowKey: string): void => {
          const ids = rowPreviewIds(rowKey);
          if (ids && ids.length > 0) glossaryPreview.setHover({ kind: glossaryPreviewKind, key: rowKey });
        }
      : undefined;

  const onRowActivate =
    glossaryPreviewKind && glossaryPreview && rowPreviewIds
      ? (rowKey: string): void => {
          const ids = rowPreviewIds(rowKey);
          if (!ids?.length) return;
          const next = { kind: glossaryPreviewKind, key: rowKey };
          const cur = glossaryPreview.selection;
          if (cur?.kind === next.kind && cur.key === next.key) {
            glossaryPreview.setSelection(null);
          } else {
            glossaryPreview.setSelection(next);
          }
        }
      : undefined;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-950/50 shadow-lg shadow-black/30 ring-1 ring-white/[0.04]">
      <table className="w-full min-w-[min(100%,54rem)] border-separate border-spacing-0 text-left">
        <thead>
          <tr className="bg-linear-to-b from-slate-800/90 to-slate-900/95">
            <th
              scope="col"
              className="w-14 rounded-tl-2xl border-b border-slate-700/80 px-3 py-3 text-left align-bottom"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {headers[0] ?? ""}
              </span>
            </th>
            {headers.slice(1).map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b border-slate-700/80 px-4 py-3 text-left align-bottom last:rounded-tr-2xl"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className="text-sm text-slate-200"
          onMouseLeave={
            glossaryPreviewKind && glossaryPreview ? () => glossaryPreview.setHover(null) : undefined
          }
        >
          {rows.map((r, ri) => {
            const selectable = Boolean(onRowActivate && rowPreviewIds?.(r.rowKey)?.length);
            const isSelected =
              Boolean(glossaryPreviewKind && glossaryPreview?.selection &&
                glossaryPreview.selection.kind === glossaryPreviewKind &&
                glossaryPreview.selection.key === r.rowKey);
            return (
            <tr
              key={r.rowKey}
              onMouseEnter={onRowMouseEnter ? (): void => onRowMouseEnter(r.rowKey) : undefined}
              tabIndex={selectable ? 0 : undefined}
              onClick={
                selectable && onRowActivate
                  ? (e): void => {
                      e.preventDefault();
                      onRowActivate(r.rowKey);
                    }
                  : undefined
              }
              onKeyDown={
                selectable && onRowActivate
                  ? (e): void => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      onRowActivate(r.rowKey);
                    }
                  : undefined
              }
              aria-selected={selectable ? isSelected : undefined}
              aria-label={selectable ? "Click to pin card examples beside the tutorial" : undefined}
              className={`border-b border-slate-800/70 transition-colors last:border-b-0 ${
                ri % 2 === 1 ? "bg-slate-950/55" : "bg-slate-950/25"
              } hover:bg-slate-900/65 ${selectable ? "cursor-pointer" : ""} ${
                isSelected
                  ? "bg-violet-950/30 ring-1 ring-inset ring-violet-500/45 hover:bg-violet-950/35 focus-visible:bg-violet-950/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-500/60"
                  : ""
              }`}
            >
              <td className="align-top px-3 py-3.5">
                <div className="flex min-h-[2rem] items-start justify-center pt-0.5">{r.icon}</div>
              </td>
              {r.cells.map((c, i) => {
                const v = cellVariant(i, { identifierColumns: idSet, codeColumnIndex });
                const nextHeader = headers[i + 1];
                const isMeaning =
                  typeof nextHeader === "string" && nextHeader.toLowerCase().includes("meaning");
                return (
                  <td key={i} className={`align-top px-4 py-3.5 ${isMeaning ? "max-w-md" : ""}`}>
                    <CellBlock
                      text={c}
                      variant={v}
                      proseEmphasis={v === "body" && emphasisSet?.has(i) === true}
                    />
                  </td>
                );
              })}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
