import type { Metadata } from "next";
import Link from "next/link";
import { Archive, Layers } from "lucide-react";
import { TutorialPageShell } from "@/app/tutorial/TutorialScrollNav.client";

export const metadata: Metadata = {
  title: "Tutorial · Theme wrapper · Slay the Spire Combat Planner",
  description:
    "Export STS HTML/CSS theme packs via /theme-wrapper: docs, markup, zipped bundle.",
};

const TOC = [
  { id: "export-pack", label: "Export pack" },
  { id: "use-cases", label: "Use cases" },
  { id: "open-wrapper", label: "Launch wrapper UI" },
] as const;

export default function TutorialThemePage() {
  return (
    <TutorialPageShell toc={TOC}>
      <header className="space-y-2 border-b border-slate-800/80 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Theme</p>
        <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-50">
          <Layers className="h-6 w-6 shrink-0 text-slate-300" strokeWidth={2} aria-hidden />
          Static STS theme wrapper
        </h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Ship vanilla HTML previews (docs, itch pages, overlays) without depending on planner React chrome using `/theme-wrapper` exports.
        </p>
      </header>

      <section id="export-pack" className="scroll-mt-28 space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <Archive className="h-4 w-4 text-amber-200" aria-hidden />
          ZIP contents
        </h2>
        <ul className="list-disc space-y-2 ps-5 text-sm text-slate-300">
          <li>
            <code className="font-mono text-[11px]">theme.html</code> interactive samples.
          </li>
          <li>
            <code className="font-mono text-[11px]">theme_docs.html</code> typography walkthrough.
          </li>
          <li>
            <code className="font-mono text-[11px]">sts-theme.css</code> skins + reusable classes.
          </li>
        </ul>
      </section>

      <section id="use-cases" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">When to reach for it</h2>
        <ul className="list-disc space-y-2 ps-5 text-sm text-slate-300">
          <li>Marketing-safe renders without spinning Next builds.</li>
          <li>Modding readme embeds constrained to plain HTML/CSS.</li>
          <li>Collaborators iterating CSS independently from TS loaders.</li>
        </ul>
      </section>

      <section id="open-wrapper" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Open tooling</h2>
        <Link
          href="/theme-wrapper"
          className="inline-flex rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
        >
          Launch /theme-wrapper →
        </Link>
      </section>
    </TutorialPageShell>
  );
}
