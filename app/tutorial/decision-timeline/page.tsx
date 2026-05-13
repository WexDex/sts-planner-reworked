import type { Metadata } from "next";
import Link from "next/link";
import { GitBranch, Network } from "lucide-react";
import { TutorialPageShell } from "@/app/tutorial/TutorialScrollNav.client";

export const metadata: Metadata = {
  title: "Tutorial · Decision timeline · Slay the Spire Combat Planner",
  description:
    "Branching timelines, checkpoint apply vs unsync warnings, planner export, project file (sts-planner-project v1) and autosave keys.",
};

const TOC = [
  { id: "branching", label: "Branching" },
  { id: "apply-sync", label: "Apply & sync" },
  { id: "graph-layout", label: "Graph layout" },
  { id: "export-json", label: "Export payload" },
  { id: "persist", label: "Persistence" },
] as const;

export default function TutorialDecisionTimelinePage() {
  return (
    <TutorialPageShell toc={TOC}>
      <header className="space-y-2 border-b border-slate-800/80 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">Decision timeline</p>
        <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-50">
          <GitBranch className="h-6 w-6 shrink-0 text-cyan-300" strokeWidth={2} aria-hidden />
          Parallel rehearsal trees
        </h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Iterate unwinnables: fork hypothetical checkpoints without trashing planner rows prematurely, then reconcile once a branch survives scrutiny.
        </p>
      </header>

      <section id="branching" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Branching checkpoints</h2>
        <p className="text-sm leading-relaxed text-slate-300">
          Every node stores a label and shorthand nicknames referencing planner slot ids plus phase metadata. Forking captures the current simulated board (<code className="font-mono text-[11px]">snapshot</code>) so sub-trees diverge cleanly; START acts as deterministic root tying back to whichever row you initialized.
        </p>
        <p className="text-sm text-slate-400">
          UI emphasizes whether you fork from the pinned active timeline leaf or a graph-selected node — mismatches are the top source of confusing breadcrumbs.
        </p>
      </section>

      <section id="apply-sync" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Apply branch &amp; sync indicators</h2>
        <p className="text-sm leading-relaxed text-slate-300">
          Applying overwrites planner rows intersecting captured ancestors, snaps <code className="font-mono text-[11px]">currentTurnIndex</code>, rewires <code className="font-mono text-[11px]">turnPhase</code>, and aligns <code className="font-mono text-[11px]">activeDecisionNodeId</code>.
        </p>
        <p className="text-sm text-slate-400">
          <code className="rounded bg-slate-950 px-1 font-mono text-[11px]">isApplyDecisionBranchToPlannerSynced</code> warns when live sandbox differs from the checkpoint snapshot you are about to apply.
        </p>
      </section>

      <section id="graph-layout" className="scroll-mt-28 space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <Network className="h-4 w-4 text-violet-300" aria-hidden />
          XY graph retention
        </h2>
        <p className="text-sm text-slate-300">
          The flow canvas stores optional positions inside planner exports so reopened saves preserve layout. Clearing graph data falls back to auto-layout stacks that still obey parent/child lineage.
        </p>
      </section>

      <section id="export-json" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Downloadable planner JSON</h2>
        <ul className="list-disc space-y-2 ps-5 text-sm text-slate-300">
          <li>
            Includes <code className="font-mono text-[11px]">turns</code>, <code className="font-mono text-[11px]">currentTurnIndex</code>,{" "}
            <code className="font-mono text-[11px]">turnPhase</code>, <code className="font-mono text-[11px]">decisionNodes</code>,{" "}
            <code className="font-mono text-[11px]">activeDecisionNodeId</code>, <code className="font-mono text-[11px]">decisionTimelinePositions</code>,{" "}
            <code className="font-mono text-[11px]">exportedAt</code>.
          </li>
          <li>Combat JSON stays separate — joining them intentionally manual.</li>
          <li>Filename pattern <code className="font-mono text-[11px]">sts-planner-save-*.json</code> aids versioning.</li>
        </ul>
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">Project file (header)</p>
          <p className="text-sm text-slate-300">
            <strong className="text-slate-100">Save project</strong> downloads <code className="rounded bg-slate-950 px-1 font-mono text-[11px]">sts-planner-project</code>{" "}
            v1: the same planner slice as above plus <code className="rounded bg-slate-950 px-1 font-mono text-[11px]">projectMeta</code> (name,
            timestamps) and the embedded combat snapshot the session was using.
          </p>
        </div>
      </section>

      <section id="persist" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-amber-50">Persistence</h2>
        <p className="text-sm text-amber-100/85">
          On load, the app tries <code className="font-mono text-[11px] text-amber-200">localStorage</code> key{" "}
          <code className="font-mono text-[11px] text-amber-200">sts_planner_last_project_v1</code> first (full{" "}
          <code className="font-mono text-[11px] text-amber-200">sts-planner-project</code> file). If absent, it may restore a
          legacy snapshot from <code className="font-mono text-[11px] text-amber-200">sts_game_save</code>. There is no bundled
          default combat on first visit — use header <strong className="text-amber-50">Load project</strong> or{" "}
          <strong className="text-amber-50">Load data</strong>.
        </p>
        <p className="text-sm text-amber-100/85">
          <code className="font-mono text-[11px] text-amber-200">sts_game_save</code> still debounces (~520ms) after planner
          mutations. While a <strong className="text-amber-50">named</strong> project session is open, the same workflow is also
          written back to <code className="font-mono text-[11px] text-amber-200">sts_planner_last_project_v1</code> so refresh
          keeps parity. <strong className="text-amber-50">Close project</strong> clears the last-project key and autosave; keep
          downloaded exports as backups.
        </p>
      </section>

      <div className="pt-6">
        <Link
          href="/decision-timeline"
          className="inline-flex rounded-lg border border-cyan-500/45 bg-cyan-950/30 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-950/55"
        >
          Open Decision timeline →
        </Link>
      </div>
    </TutorialPageShell>
  );
}
