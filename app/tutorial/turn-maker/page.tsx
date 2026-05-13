import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { TutorialIntentGlossary } from "@/app/tutorial/TutorialGlossaryChunks";
import { TutorialPageShell } from "@/app/tutorial/TutorialScrollNav.client";

export const metadata: Metadata = {
  title: "Tutorial · Turn maker · Slay the Spire Combat Planner",
  description:
    "Author enemy intents JSON, planner slot alignment, and enemy action glossary aligned with EnemyIntent types.",
};

const TOC = [
  { id: "authoring", label: "Authoring loop" },
  { id: "json-shape", label: "Enemy JSON hints" },
  { id: "tips", label: "Quality tips" },
  { id: "glossary-intents", label: "Intent glossary" },
] as const;

export default function TutorialTurnMakerPage() {
  return (
    <TutorialPageShell toc={TOC}>
      <header className="space-y-2 border-b border-slate-800/80 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">Turn maker</p>
        <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-50">
          <CalendarClock className="h-6 w-6 shrink-0 text-amber-300" strokeWidth={2} aria-hidden />
          Scripting intents for planner slots
        </h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Dedicated route for planners who bounce between `/turn-maker` and the planner shell daily: how rows map onto enemy JSON,
          pitfalls when aligning multi-hit debuffs with UI chips, plus the exhaustive glossary of supported{" "}
          <code className="font-mono text-[11px] text-slate-500">EnemyIntentAction</code> payloads.
        </p>
      </header>

      <div className="mt-6 space-y-2">
        <p className="max-w-3xl text-sm text-slate-300">
          After you land intents in the main planner, use header <strong className="text-slate-100">Save project</strong> if you want a
          single file that restores rows, timeline, layout, and combat together; <strong className="text-slate-100">Load project</strong> /
          last-session restore replaces starting from an empty shell.
        </p>
      </div>

      <section id="authoring" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Authoring loop</h2>
        <ol className="list-decimal space-y-2 ps-5 text-sm leading-relaxed text-slate-300">
          <li>Load enemy definitions from canonical combat dumps or handcrafted JSON.</li>
          <li>Align numeric <code className="font-mono text-[11px]">turn</code> ids with sequential planner ids (see shape below).</li>
          <li>
            Compose each intent line as discrete <code className="font-mono text-[11px]">EnemyIntentAction</code> structs — stacking
            many actions retains evaluation order downstream.
          </li>
          <li>Use Turn maker clipboard output to splice back into bundled combat payloads or share diffs.</li>
          <li>Return to the planner, refresh rows via JSON import where necessary, Save row snapshots after validation.</li>
        </ol>
      </section>

      <section id="json-shape" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Enemy JSON hints</h2>
        <p className="text-sm leading-relaxed text-slate-300">
          Each enemy owns an array of <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[11px]">intents</code> with{" "}
          <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[11px]">turn: number</code> values. Planner rows recreate
          that ordering as stable ids (<code className="font-mono text-[11px]">Turn.id</code>) so bridging JSON → planner never
          reindexes silently. Missing turns simply skip timelines until authored.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-slate-700/75 bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-300">
{`"intents": [
  {
    "turn": 1,
    "actions": [
      { "type": "attack", "dmg": 12 },
      { "type": "debuff", "effect": "Weak", "value": 2 }
    ]
  }
]`}
        </pre>
        <p className="text-sm text-slate-400">
          Multi-hit intents require explicit <code className="font-mono text-[11px]">multi_attack</code> plus count — avoid faking sequence by duplicating lone attacks unless you want independent resolution quirks.
        </p>
      </section>

      <section id="tips" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Quality tips</h2>
        <ul className="list-disc space-y-2 ps-5 text-sm text-slate-300">
          <li>Prefer semantic <code className="font-mono text-[11px]">status</code> entries for curse injection with explicit piles.</li>
          <li>Document unusual sequences (stun bridging two slots) inline via description props for readability in transcripts.</li>
          <li>When intents mirror multi-phase bosses, replicate row boundaries so phase shifts stay obvious visually.</li>
          <li>Validate Turn maker previews against live combat overlays when skepticism emerges — STS edge cases abound.</li>
        </ul>
      </section>

      <section id="glossary-intents" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Intent action glossary</h2>
        <p className="text-sm text-slate-400">
          Mirrors emoji chips from Turn maker timelines; payloads align with typings in{" "}
          <code className="font-mono text-[11px]">app/types/gameTypes.ts</code>.
        </p>
        <TutorialIntentGlossary />
        <Link
          href="/turn-maker"
          className="inline-flex rounded-lg border border-amber-500/45 bg-amber-950/30 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-950/55"
        >
          Open planner Turn maker →
        </Link>
      </section>
    </TutorialPageShell>
  );
}
