import Link from "next/link";
import {
  Activity,
  BookOpen,
  CalendarClock,
  FileCode2,
  FlaskConical,
  FolderOpen,
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
  Zap,
} from "lucide-react";
import { TutorialPageShell } from "@/app/tutorial/TutorialScrollNav.client";
import { TUTORIAL_DOC_UPDATE_CLASS } from "@/app/tutorial/docUpdateHighlight";
import OrbEditor from "@/app/tutorial/OrbEditor.client";

const HUB_TOC = [
  { id: "whats-new", label: "What's new" },
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick start" },
  { id: "phases", label: "Turn phases" },
  { id: "ui-map", label: "Planner UI map" },
  { id: "saves", label: "Saves quick ref" },
  { id: "topic-guides", label: "In-depth guides" },
  { id: "orb-editor", label: "Orb defaults" },
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

      <section id="whats-new" className={`scroll-mt-28 space-y-4 rounded-2xl border border-indigo-500/35 bg-indigo-950/20 p-5 sm:p-6 ${TUTORIAL_DOC_UPDATE_CLASS}`}>
        <h2 className="flex items-center gap-2 text-base font-bold text-indigo-100">
          <Sparkles className="h-4 w-4 text-indigo-400" strokeWidth={2} aria-hidden />
          What&apos;s new — 2026.05.14
        </h2>
        <p className="text-sm text-slate-400">
          Feature expansion shipped in this pass. All items below are live from the main planner shell.
        </p>

        {/* ── Latest drop ── */}
        <div className="rounded-xl border border-indigo-400/40 bg-indigo-950/30 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
            <Sparkles className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
            Latest additions
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-indigo-500/25 bg-slate-900/60 p-3 text-xs">
              <p className="mb-1 flex items-center gap-1 font-bold text-indigo-200">
                <Zap className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                Quick Actions panel
              </p>
              <p className="leading-relaxed text-slate-400">
                Collapsible panel in the topbar (indigo button). Houses orb channel, stance toggle, hand discard tools,
                scry, and shuffle discard → draw — all logged. Click the button to expand; click again to dismiss.
              </p>
            </div>
            <div className="rounded-lg border border-sky-500/25 bg-slate-900/60 p-3 text-xs">
              <p className="mb-1 flex items-center gap-1 font-bold text-sky-200">
                <Layers className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                Pile Order Modal
              </p>
              <p className="leading-relaxed text-slate-400">
                Shared drag-sort dialog used by Scry, Shuffle discard → draw, and the auto-reshuffle on deck exhaustion.
                Drag rows to set the final sequence before confirming.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/25 bg-slate-900/60 p-3 text-xs">
              <p className="mb-1 flex items-center gap-1 font-bold text-emerald-200">
                <FlaskConical className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                Potion belt
              </p>
              <p className="leading-relaxed text-slate-400">
                Belt strip in the bottom pile bar — 1–5 slots (default 2, +/− to resize). Add potions via the card
                DB picker. Tap a filled slot to <strong className="text-slate-300">Use</strong> or{" "}
                <strong className="text-slate-300">Discard</strong>; both log the action.
              </p>
            </div>
          </div>
        </div>

        {/* ── Full feature grid ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-indigo-500/30 bg-slate-900/50 p-4 text-sm">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-300">
              <Zap className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              Quick Actions — detail
            </p>
            <ul className="space-y-1 text-slate-400 text-xs leading-relaxed">
              <li><strong className="text-slate-200">Orb channel</strong> — channel Lightning ⚡, Dark 🌑, Frost 🔵, or Plasma orbs. Evoke N (configurable); Trigger All Passives. Channel size displayed as filled/total.</li>
              <li><strong className="text-slate-200">Stance toggle</strong> — 4-button row: Neutral / Wrath / Calm / Divinity. Active stance highlighted; switches logged.</li>
              <li><strong className="text-slate-200">Discard whole hand</strong> — dumps all cards to discard in one click.</li>
              <li><strong className="text-slate-200">Discard with exceptions</strong> — chip-picker lets you keep specific cards; rest go to discard.</li>
              <li><strong className="text-slate-200">Scry N</strong> — peek and reorder the top N cards of your draw pile via the order modal.</li>
              <li><strong className="text-slate-200">Shuffle discard → draw</strong> — opens the order modal to set the resulting draw sequence.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-slate-900/50 p-4 text-sm">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-300">
              <Hand className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              Deck &amp; draw improvements
            </p>
            <ul className="space-y-1 text-slate-400 text-xs leading-relaxed">
              <li><strong className="text-slate-200">Smart draw</strong> — detects deck exhaustion mid-draw, logs both phases, opens the order modal to set reshuffle sequence before drawing the remainder.</li>
              <li><strong className="text-slate-200">Card play order</strong> — multi-selected cards show numbered indigo badges (1, 2, 3…). Deselecting renumbers. Play resolves in badge order.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-teal-500/30 bg-slate-900/50 p-4 text-sm">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-300">
              <CalendarClock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              Turn maker upgrades
            </p>
            <ul className="space-y-1 text-slate-400 text-xs leading-relaxed">
              <li><strong className="text-slate-200">Drag-reorder</strong> — drag intent rows in the sidebar to rearrange sequence; turn numbers renumber automatically.</li>
              <li><strong className="text-slate-200">Duplicate turn</strong> — one-click clone of the selected turn appended at the next slot.</li>
              <li><strong className="text-slate-200">HP overrides</strong> — collapsible section per enemy: define <em>If HP ≤ X% → use Turn N</em> conditional rules. Affected turns show a ⚠ badge.</li>
            </ul>
          </div>
        </div>
      </section>

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
        <div>
          <ol className="list-decimal space-y-2 ps-5 text-sm leading-relaxed text-slate-300">
          <li>
            Open or create work in the planner: use header{" "}
            <strong className="text-slate-200">Load project</strong> (full rows + decision timeline + layout),{" "}
            <strong className="text-slate-200">Load data</strong> (combat JSON only), or continue from the last session if
            the app restored one. There is no bundled default combat on first visit.
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
            Use <strong className="text-slate-200">Save project</strong> for a named downloadable copy and to pin the session
            in <code className="rounded bg-slate-950 px-1 font-mono text-[11px] text-slate-400">sts_planner_last_project_v1</code>
            . <strong className="text-slate-200">Close project</strong> clears that slot and returns to an empty planner.
          </li>
          <li>
            When you fork ideas in{" "}
            <Link href="/decision-timeline" className="font-semibold text-cyan-200 underline-offset-2 hover:underline">
              Decision timeline
            </Link>
            , keep <strong className="text-slate-200">Export JSON</strong> / project files as backups — browser storage can be
            cleared.
          </li>
        </ol>
        </div>
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
              <strong className="text-slate-100">Top chrome</strong> — vitals, legend chips, project name,{" "}
              <strong className="text-slate-200">Save project</strong> / <strong className="text-slate-200">Load project</strong> /{" "}
              <strong className="text-slate-200">Close project</strong>, combat <strong className="text-slate-200">Load data</strong>,{" "}
              Save row, Turns &amp; Timeline shortcuts, tutorial search.
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
          <li className={`flex gap-3 ${TUTORIAL_DOC_UPDATE_CLASS}`}>
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} aria-hidden />
            <span>
              <strong className="text-slate-100">Card Actions rail</strong> — selecting a card swaps the left timeline rail into
              a vertical actions panel (Play, Quick Actions, Move to, Modify, Cost &amp; type, Manage). Deselecting or moving
              cards to Hand / Draw / Discard / Exhaust closes it and restores the timeline. See{" "}
              <Link href="/editors" className="font-semibold text-amber-200 underline-offset-2 hover:underline">
                Editors
              </Link>{" "}
              to configure per-card custom actions.
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
        <div className="space-y-4">
          <div className="flex gap-3 text-sm text-slate-300">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-500/35 bg-violet-950/40 text-violet-200">
            <FolderOpen className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <p>
            <strong className="text-slate-100">Project file</strong> (
            <code className="font-mono text-[11px] text-slate-400">format: sts-planner-project</code>,{" "}
            <code className="font-mono text-[11px] text-slate-400">version: 1</code>) bundles planner rows, phases, decision
            nodes, active checkpoint, timeline XY positions, and <code className="font-mono text-[11px] text-slate-400">projectMeta</code>{" "}
            (name, timestamps). Header actions: <strong className="text-slate-200">Save project</strong>,{" "}
            <strong className="text-slate-200">Load project</strong>, <strong className="text-slate-200">Close project</strong>. The
            last session is stored under{" "}
            <code className="font-mono text-[11px] text-slate-400">sts_planner_last_project_v1</code>; legacy planner-only JSON
            exports still load and are upgraded in-memory.
          </p>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          Prefer downloadable <strong className="text-slate-400">project</strong> or planner saves over relying only on{" "}
          <code className="font-mono text-slate-400">sts_game_save</code> — see{" "}
          <Link href="/tutorial/decision-timeline#persist" className="text-violet-300 underline-offset-2 hover:underline">
            Timeline → Persistence
          </Link>
          .
        </p>
        </div>
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
            <span className="mt-1 block font-semibold text-cyan-50">
              Branches, apply, exports — named project files and browser persistence
            </span>
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
            <span className="mt-1 block font-semibold text-slate-100">
              STS + potion previews, PTAG catalog, aurora/neon skins
            </span>
          </Link>
          <Link
            href="/card-workbench/cards"
            className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/20 p-4 text-sm shadow-sm transition hover:border-fuchsia-400/60 hover:bg-fuchsia-950/40"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wide text-fuchsia-300">Card workbench</span>
            <span className="mt-1 block font-semibold text-fuchsia-50">
              Browse bundled <code className="font-mono text-fuchsia-100/90">app/data/db/STS_CARDS_DB.json</code>; patch records; copy export
            </span>
          </Link>
          <Link
            href="/editors"
            className={`rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-sm shadow-sm transition hover:border-amber-400/60 hover:bg-amber-950/35 ${TUTORIAL_DOC_UPDATE_CLASS}`}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-300">
              <Zap className="h-3.5 w-3.5" aria-hidden /> Editors
            </span>
            <span className="mt-1 block font-semibold text-amber-50">
              Card Actions editor (per-card quick actions → <code className="font-mono text-amber-100/80">custom_card_actions.json</code>) and Card Field editor (browse &amp; patch all 370 card records in <code className="font-mono text-amber-100/80">STS_CARDS_DB.json</code>)
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
          <Link
            href="/editors"
            className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-700/60 px-3 py-1.5 font-medium text-amber-200/95 hover:bg-amber-950/40 ${TUTORIAL_DOC_UPDATE_CLASS}`}
          >
            <Zap className="h-3.5 w-3.5" aria-hidden /> Editors →
          </Link>
        </div>
      </section>

      <section id="orb-editor" className="scroll-mt-28 space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <span className="text-lg" aria-hidden>⚡</span>
          Orb default values
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Configure the starting passive and evoke tracker values for each orb type. These are the numbers
          that pre-fill the orb slot trackers in the topbar whenever you channel that orb — useful if
          your character&apos;s Focus or relics modify the base amounts.
        </p>
        <OrbEditor />
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
