import Link from "next/link";
import {
  Activity,
  BookOpen,
  CalendarClock,
  FileCode2,
  GitBranch,
  Hand,
  LayoutDashboard,
  Layers,
  Map,
  Puzzle,
  Save,
  Shuffle,
  Sparkles,
  Swords,
  Wrench,
} from "lucide-react";
import { TutorialPageShell } from "@/app/tutorial/TutorialScrollNav.client";

const HUB_TOC = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick start" },
  { id: "phases", label: "Turn phases" },
  { id: "ui-map", label: "Planner UI map" },
  { id: "saves", label: "Saves quick ref" },
  { id: "topic-guides", label: "In-depth guides" },
  { id: "disclaimer", label: "Disclaimer" },
] as const;

export default function TutorialHub() {
  return (
    <TutorialPageShell toc={HUB_TOC}>
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-50">
          <Puzzle className="h-6 w-6 shrink-0 text-violet-400" strokeWidth={2} aria-hidden />
          Tutorial hub
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
          Core planner orientation lives here — open the section tabs above for glossary tables, Turn maker authoring,
          timeline persistence, cards, and theme exports. Search indexes every glossary cell site-wide.
        </p>
      </div>

      <section id="overview" className="scroll-mt-28 space-y-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <Sparkles className="h-4 w-4 text-amber-400" strokeWidth={2} aria-hidden />
          Overview
        </h2>
        <p className="text-sm leading-relaxed text-slate-300">
          The planner merges a hydrated <strong className="text-slate-200">combat JSON</strong> baseline with numbered{" "}
          <strong className="text-slate-200">planner rows</strong>. Each row stores a frozen{" "}
          <code className="rounded bg-slate-900 px-1 font-mono text-[11px]">CombatData</code> snapshot: when selected,
          the board, piles, intents, relic toggles you see are that snapshot unless you deliberately mutate and{" "}
          <strong className="text-slate-200">Save row</strong>. The branching{" "}
          <strong className="text-cyan-200">decision timeline</strong> attaches alternate snapshots without overwriting
          your main chain until you apply.
        </p>
      </section>

      <section id="quick-start" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Quick start</h2>
        <ol className="list-decimal space-y-2 ps-5 text-sm leading-relaxed text-slate-300">
          <li>
            Tap <strong className="text-slate-200">Load</strong> and pick combat JSON validated for this importer.
          </li>
          <li>
            Build or revise enemy scripts in{" "}
            <Link href="/turn-maker" className="font-semibold text-amber-200 underline-offset-2 hover:underline">
              Turn maker
            </Link>
            ; copy / apply intents so each planner row aligns with monster telegraphs you care about.
          </li>
          <li>Select the numbered row in the left rail whenever you change scripted turns.</li>
          <li>
            Watch for drift cues (timeline + banner text derived from{" "}
            <code className="rounded bg-slate-950 px-1 font-mono text-[11px] text-slate-400">
              liveCombatDiffersFromPlannerRow
            </code>
            ): press <strong className="text-slate-200">Save row</strong> before changing rows so snapshots stay truthful.
          </li>
          <li>
            When you fork ideas in{" "}
            <Link href="/decision-timeline" className="font-semibold text-cyan-200 underline-offset-2 hover:underline">
              Decision timeline
            </Link>
            , periodically <strong className="text-slate-200">Download planner JSON</strong> — localStorage alone is not a
            restore guarantee today.
          </li>
        </ol>
      </section>

      <section id="phases" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Turn phases</h2>
        <p className="text-sm leading-relaxed text-slate-300">
          Rows advance through{" "}
          <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[11px]">start</code> →{" "}
          <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[11px]">player</code> →{" "}
          <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[11px]">enemy</code>. The compact phase cluster
          in the header logs START boundaries, swings you into playable main phase interactions, transitions to scripted
          enemy resolution for the highlighted planner row, then either chains or waits for explicit advance depending on
          your workflow.
        </p>
      </section>

      <section id="ui-map" className="scroll-mt-28 space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <Map className="h-4 w-4 text-violet-400" strokeWidth={2} aria-hidden />
          Planner shell map
        </h2>
        <ul className="space-y-3 text-sm leading-relaxed text-slate-300">
          <li className="flex gap-3">
            <Activity className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
            <span>
              <strong className="text-slate-100">Top chrome</strong> — vitals, legend chips, minimized rail, Loads / Saves,
              Turns &amp; Timeline shortcuts, Tutorial search.
            </span>
          </li>
          <li className="flex gap-3">
            <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" strokeWidth={2} aria-hidden />
            <span>
              <strong className="text-slate-100">Timeline rail</strong> — row stack, reorder controls, UID badges, drift
              warnings.
            </span>
          </li>
          <li className="flex gap-3">
            <LayoutDashboard className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" strokeWidth={2} aria-hidden />
            <span>
              <strong className="text-slate-100">Battlefield</strong> anchors <code className="font-mono text-[11px]">sts-battle-focus</code> —
              intents, targeting, relic toggles surfaced near enemies.
            </span>
          </li>
          <li className="flex gap-3">
            <Hand className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" strokeWidth={2} aria-hidden />
            <span>
              <strong className="text-slate-100">Piles &amp; hand rail</strong> anchored{" "}
              <code className="font-mono text-[11px]">sts-deck-zone</code> jumps on mobile shortcuts.
            </span>
          </li>
          <li className="flex gap-3">
            <Swords className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} aria-hidden />
            <span>
              <strong className="text-slate-100">Actions bar</strong> orchestrates playable flow + modal entries.
            </span>
          </li>
          <li className="flex gap-3">
            <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
            <span>
              <strong className="text-slate-100">Right dock</strong> holds deck tooling; becomes a swipe sheet labelled{" "}
              <em>Tools</em> on phones.
            </span>
          </li>
          <li className="flex gap-3">
            <Layers className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
            <span>
              <strong className="text-slate-100">Bottom nav pills</strong> jump Board / Deck / Timeline / Tools with scroll
              lock while sheets open (<code className="font-mono text-[11px]">ResponsiveAppShell.tsx</code>).
            </span>
          </li>
        </ul>
      </section>

      <section id="saves" className="scroll-mt-28 space-y-4 rounded-2xl border border-slate-700/75 bg-slate-900/30 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <Save className="h-4 w-4 text-amber-300" strokeWidth={2} aria-hidden />
          Saves quick reference
        </h2>
        <div className="flex gap-3 text-sm text-slate-300">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-500/35 bg-sky-950/40 text-sky-300">
            <Shuffle className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <p>
            <strong className="text-slate-100">Combat JSON</strong> resets baselines whenever you reload a file — keep authored
            copies under version control.
          </p>
        </div>
        <div className="flex gap-3 text-sm text-slate-300">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-950/35 text-amber-200">
            <Save className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <p>
            <strong className="text-slate-100">Planner JSON</strong> contains rows + timeline checkpoints + layout metadata.
          </p>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          Prefer downloads over hoping <code className="font-mono text-slate-400">sts_game_save</code> survives refresh — see{" "}
          <Link href="/tutorial/decision-timeline#persist" className="text-violet-300 underline-offset-2 hover:underline">
            Timeline → Persistence
          </Link>
          .
        </p>
      </section>

      <section id="topic-guides" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">In-depth guides</h2>
        <p className="text-sm leading-relaxed text-slate-400">
          Tables, JSON notes, exports, chrome wiring — jump into whichever subsystem you&apos;re inspecting.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/tutorial/glyphs"
            className="rounded-xl border border-violet-500/35 bg-violet-950/20 p-4 text-sm shadow-sm transition hover:border-violet-400/60 hover:bg-violet-950/40"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide text-violet-300">Glyphs &amp; stats</span>
            <span className="mt-1 block font-semibold text-violet-100">Effects, STS catalog keys, status glossary</span>
          </Link>
          <Link
            href="/tutorial/turn-maker"
            className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-4 text-sm shadow-sm transition hover:border-amber-400/60 hover:bg-amber-950/40"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide text-amber-300">Turn maker</span>
            <span className="mt-1 block font-semibold text-amber-50">Intent JSON, enemy payloads, glossary</span>
          </Link>
          <Link
            href="/tutorial/decision-timeline"
            className="rounded-xl border border-cyan-500/35 bg-cyan-950/20 p-4 text-sm shadow-sm transition hover:border-cyan-400/55 hover:bg-cyan-950/35"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide text-cyan-300">Timeline</span>
            <span className="mt-1 block font-semibold text-cyan-50">Branches, apply, exports, autosave caveat</span>
          </Link>
          <Link
            href="/tutorial/cards"
            className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-4 text-sm shadow-sm transition hover:border-emerald-400/60 hover:bg-emerald-950/35"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide text-emerald-300">Cards</span>
            <span className="mt-1 block font-semibold text-emerald-50">Chrome pipeline + gallery tooling</span>
          </Link>
          <Link
            href="/tutorial/theme"
            className="rounded-xl border border-slate-600/75 bg-slate-900/50 p-4 text-sm shadow-sm transition hover:border-slate-500"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Theme wrapper</span>
            <span className="mt-1 block font-semibold text-slate-100">HTML/CSS pack export &amp; embedding ideas</span>
          </Link>
          <Link
            href="/card-design-gallery"
            className="rounded-xl border border-slate-600/75 bg-slate-950/60 p-4 text-sm shadow-sm transition hover:border-slate-500"
          >
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <BookOpen className="h-3.5 w-3.5" aria-hidden /> Live gallery
            </span>
            <span className="mt-1 block font-semibold text-slate-100">Opens the interactive preview app route</span>
          </Link>
          <Link
            href="/card-workbench/cards"
            className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/20 p-4 text-sm shadow-sm transition hover:border-fuchsia-400/60 hover:bg-fuchsia-950/40"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide text-fuchsia-300">Card workbench</span>
            <span className="mt-1 block font-semibold text-fuchsia-50">
              Browse bundled <code className="font-mono text-fuchsia-100/90">STS_CARDS_DB.json</code>; patch records; copy export
            </span>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 text-xs">
          <Link
            href="/turn-maker"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-900"
          >
            <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Open planner Turn maker →
          </Link>
          <Link
            href="/decision-timeline"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-900"
          >
            <GitBranch className="h-3.5 w-3.5" aria-hidden /> Open Decision timeline →
          </Link>
          <Link
            href="/card-workbench/cards"
            className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-800/60 px-3 py-1.5 font-medium text-fuchsia-200/95 hover:bg-fuchsia-950/40"
          >
            Card workbench →
          </Link>
          <Link
            href="/theme-wrapper"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-900"
          >
            <FileCode2 className="h-3.5 w-3.5" aria-hidden /> Open Theme wrapper →
          </Link>
        </div>
      </section>

      <section id="disclaimer" className="scroll-mt-28 border-t border-slate-800 pt-10 text-xs leading-relaxed text-slate-500">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">Disclaimer</h2>
        <p>
          Unofficial fan tooling — not associated with Mega Crit Games. Mechanics notes are abbreviated; confirm edge cases in
          the live game whenever stakes are high.
        </p>
      </section>
    </TutorialPageShell>
  );
}
