import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Glyphs · Card workbench",
  description:
    "Glyph tutorials and references for the STS card database (Planner).",
};

export default function CardWorkbenchGlyphsPage() {
  return (
    <main className="mx-auto max-w-xl flex-1 space-y-4 px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/85">
        Card workbench — Glyphs
      </p>
      <h1 className="text-xl font-semibold text-white">
        Glyph content lives in the tutorial
      </h1>
      <p className="text-sm leading-relaxed text-slate-400">
        Open the glossary and glyph primer in the planner tutorial, or inspect
        icon catalog prose in{" "}
        <Link
          href="/tutorial/glyphs"
          className="font-medium text-fuchsia-300 underline-offset-2 hover:underline"
        >
          /tutorial/glyphs
        </Link>{" "}
        and{" "}
        <Link
          href="/card-design-gallery"
          className="font-medium text-amber-300 underline-offset-2 hover:underline"
        >
          Card design gallery
        </Link>
        .
      </p>
    </main>
  );
}
