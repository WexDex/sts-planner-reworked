import Link from "next/link";
import {
  Activity,
  BookOpen,
  CalendarClock,
  ChevronDown,
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
  Target,
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
          What&apos;s new — 2026.05.18
        </h2>
        <p className="text-sm text-slate-400">
          Card-action targeting overhaul, new action types, hover highlight, and per-card UUID stamping.
        </p>

        {/* ── Card Action Target System ── */}
        <div className="rounded-xl border border-cyan-400/30 bg-cyan-950/20 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            <Target className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
            Card Action — Target selector
          </p>
          <p className="mb-3 text-xs leading-relaxed text-slate-400">
            Card-affecting quick actions now declare <strong className="text-slate-200">who they act on</strong> — not just the card the action is attached to. Open the Card Actions editor (<code className="font-mono text-[10px]">/editors/card-actions</code>) to configure targets on any card-affecting action type.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-cyan-500/20 bg-slate-900/60 p-3 text-xs">
              <p className="mb-1 font-bold text-cyan-200">Self (default)</p>
              <p className="leading-relaxed text-slate-400">
                No change from previous behavior. Actions without a target field default to self — all existing JSON actions are unaffected.
              </p>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-slate-900/60 p-3 text-xs">
              <p className="mb-1 font-bold text-cyan-200">Filter mode</p>
              <p className="leading-relaxed text-slate-400">
                Choose one or more <strong className="text-slate-300">source piles</strong> (hand / draw / discard / exhaust / played), add optional <strong className="text-slate-300">conditions</strong> (type, cost, keywords…), and optionally <strong className="text-slate-300">exclude self</strong>. Every card that matches is targeted.
              </p>
            </div>
          </div>
        </div>

        {/* ── New action types + hover highlight ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-violet-500/30 bg-slate-900/50 p-4 text-sm">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-violet-300">
              <Zap className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              6 new action types
            </p>
            <ul className="space-y-1 text-slate-400 text-xs leading-relaxed">
              <li><strong className="text-slate-200">Upgrade Card</strong> — upgrade target card(s) to their + version. Ex: Armaments.</li>
              <li><strong className="text-slate-200">Downgrade Card</strong> — revert target card(s) to base (un-upgraded) version.</li>
              <li><strong className="text-slate-200">Exhaust Card</strong> — send target card(s) to the exhaust pile.</li>
              <li><strong className="text-slate-200">Mark as Played</strong> — move target card(s) to the Played Cards pile (Power tracking).</li>
              <li><strong className="text-slate-200">Duplicate Card</strong> — copy target card(s) into a destination pile.</li>
              <li><strong className="text-slate-200">Remove Card</strong> — permanently remove target card(s) from the game.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/50 p-4 text-sm">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              Hover highlight &amp; UUID stamping
            </p>
            <ul className="space-y-1 text-slate-400 text-xs leading-relaxed">
              <li><strong className="text-slate-200">Action hover glow</strong> — hovering a card quick-action button highlights every card that would be affected with a cyan ring. Collapsed pile buttons also glow if they contain affected cards.</li>
              <li><strong className="text-slate-200">Per-card UUID</strong> — every card now receives a unique <code className="font-mono text-[10px]">_uid</code> on load. This lets the engine target a specific copy of a card even when multiple identical cards are in the same pile. Older saves without UIDs are stamped automatically on next load.</li>
              <li><strong className="text-slate-200">Exclude self (precise)</strong> — the "Exclude self" toggle skips only the exact card instance the action is attached to, not all cards with that name.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-slate-900/50 p-4 text-sm">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-300">
              <FileCode2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              Editor — context notes
            </p>
            <ul className="space-y-1 text-slate-400 text-xs leading-relaxed">
              <li><strong className="text-slate-200">Action Filter</strong> — italic note clarifies that <em>"The card"</em> in field descriptions refers to the <strong className="text-slate-300">trigger card</strong> (the one the action is attached to).</li>
              <li><strong className="text-slate-200">Card Picker Filter</strong> — matching note clarifies that <em>"The card"</em> refers to each DB card being evaluated in the picker.</li>
              <li><strong className="text-slate-200">Target Filter</strong> — in the new CardTargetEditor, the note explains <em>"The card"</em> is each card found in the selected source piles.</li>
            </ul>
          </div>
        </div>

        {/* ── Previous releases (collapsible) ── */}
        <details className="group rounded-xl border border-slate-700/50 bg-slate-900/40">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-400 hover:text-slate-200">
            <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" strokeWidth={2.5} aria-hidden />
            Previous releases — 2026.05.14
          </summary>
          <div className="space-y-3 border-t border-slate-700/40 px-4 pb-4 pt-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-indigo-500/25 bg-slate-900/60 p-3 text-xs">
                <p className="mb-1 flex items-center gap-1 font-bold text-indigo-200">
                  <Zap className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                  Quick Actions panel
                </p>
                <p className="leading-relaxed text-slate-400">
                  Collapsible panel in the topbar (indigo button). Houses orb channel, stance toggle, hand discard tools,
                  scry, and shuffle discard → draw — all logged.
                </p>
              </div>
              <div className="rounded-lg border border-sky-500/25 bg-slate-900/60 p-3 text-xs">
                <p className="mb-1 flex items-center gap-1 font-bold text-sky-200">
                  <Layers className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                  Pile Order Modal
                </p>
                <p className="leading-relaxed text-slate-400">
                  Shared drag-sort dialog used by Scry, Shuffle discard → draw, and auto-reshuffle on deck exhaustion.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/25 bg-slate-900/60 p-3 text-xs">
                <p className="mb-1 flex items-center gap-1 font-bold text-emerald-200">
                  <FlaskConical className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                  Potion belt
                </p>
                <p className="leading-relaxed text-slate-400">
                  Belt strip in the bottom pile bar — 1–5 slots. Add potions via the DB picker. Tap a slot to Use or Discard; both log.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-indigo-500/20 bg-slate-900/40 p-3 text-xs">
                <p className="mb-1 font-bold text-indigo-300">Quick Actions — detail</p>
                <ul className="space-y-0.5 text-slate-400 leading-relaxed">
                  <li><strong className="text-slate-300">Orb channel</strong> — Lightning ⚡, Dark 🌑, Frost 🔵, Plasma. Evoke N; Trigger All Passives.</li>
                  <li><strong className="text-slate-300">Stance toggle</strong> — Neutral / Wrath / Calm / Divinity.</li>
                  <li><strong className="text-slate-300">Discard whole hand / with exceptions</strong> — chip-picker to keep specific cards.</li>
                  <li><strong className="text-slate-300">Scry N / Shuffle discard → draw</strong> — both open the order modal.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-slate-900/40 p-3 text-xs">
                <p className="mb-1 font-bold text-amber-300">Deck, draw &amp; Turn maker</p>
                <ul className="space-y-0.5 text-slate-400 leading-relaxed">
                  <li><strong className="text-slate-300">Smart draw</strong> — detects exhaustion mid-draw, logs both phases, opens order modal.</li>
                  <li><strong className="text-slate-300">Card play order</strong> — numbered badges; play resolves in badge order.</li>
                  <li><strong className="text-slate-300">Drag-reorder intents</strong>, <strong className="text-slate-300">Duplicate turn</strong>, <strong className="text-slate-300">HP overrides</strong> in Turn maker.</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
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
