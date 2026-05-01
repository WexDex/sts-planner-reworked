import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Code2 } from "lucide-react";
import { TutorialPageShell } from "@/app/tutorial/TutorialScrollNav.client";

export const metadata: Metadata = {
  title: "Tutorial · Cards & chrome · Slay the Spire Combat Planner",
  description:
    "How planner hydrates STS card JSON into interactive cards: glyphs, rarity chrome, gallery regression workflow.",
};

const TOC = [
  { id: "chrome-strip", label: "Chrome strip" },
  { id: "data-pipeline", label: "Data pipeline" },
  { id: "gallery", label: "Design gallery" },
  { id: "tooling", label: "Tooling integrations" },
] as const;

export default function TutorialCardsPage() {
  return (
    <TutorialPageShell toc={TOC}>
      <header className="space-y-2 border-b border-slate-800/80 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Cards</p>
        <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-50">
          <BookOpen className="h-6 w-6 shrink-0 text-emerald-300" strokeWidth={2} aria-hidden />
          Card chrome &amp; authoring pipeline
        </h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Cards are reconstructed from STS JSON via shared loaders; know which layers hydrate UI before filing visuals vs data bugs.
        </p>
      </header>

      <section id="chrome-strip" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Chrome anatomy</h2>
        <ul className="list-disc space-y-2 ps-5 text-sm text-slate-300">
          <li>Energy / X cost column with upgrade delta tinting when tiered upgrades exist.</li>
          <li>Rarity bezel plus portrait framing derived from type enums.</li>
          <li>Name heading with upgraded star bridging base vs upgraded text lines.</li>
          <li>Effect summary strip injecting glyph spans (AoE overlays, conditioned markers).</li>
        </ul>
      </section>

      <section id="data-pipeline" className="scroll-mt-28 space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <Code2 className="h-4 w-4 text-teal-300" aria-hidden />
          STS JSON ingestion
        </h2>
        <p className="text-sm text-slate-300">
          Bundled <code className="rounded bg-slate-950 px-1 font-mono text-[11px]">STS_CARDS_DB.json</code> contains iconCatalog prose,
          rarity, strike/defend remaps, pooled effects — gallery + planner share loaders for parity fixes.
        </p>
      </section>

      <section id="gallery" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Design gallery ergonomics</h2>
        <ul className="list-disc space-y-2 ps-5 text-sm text-slate-300">
          <li>Template rows plus random STS id draws stress glyphs.</li>
          <li>Icon catalog inspectors compare exported keys versus rendered sprites.</li>
          <li>Size modes validate cramped mobile rails.</li>
        </ul>
        <Link
          href="/card-design-gallery"
          className="inline-flex rounded-lg border border-emerald-500/45 bg-emerald-950/30 px-3 py-2 text-sm font-semibold text-emerald-50 hover:bg-emerald-950/55"
        >
          Open gallery route →
        </Link>
      </section>

      <section id="tooling" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Cross-repo workflows</h2>
        <p className="text-sm text-slate-300">
          Glyph atlas exports from companion DB managers merge into STS bundles — pin versions whenever coordinating scripted updates.
        </p>
      </section>
    </TutorialPageShell>
  );
}
