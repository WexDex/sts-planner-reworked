"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CalendarClock, CircleHelp, FileDown, FolderOpen, GitBranch, Plus, X } from "lucide-react";
import { useGameManager } from "@/app/context/GameContext";
import { importGameData, hasValidPlannerTurnSelection } from "@/app/utils/gameHelpers";
import CardDBModal from "@/app/components/CardDBModal";
import PlannerPhaseActionsBar from "@/app/components/UI/PlannerPhaseActionsBar";

export default function MobileNavPanel() {
  const {
    saveProject,
    loadProjectFromJsonText,
    closeProject,
    loadGameDataFromJson,
    isLoading,
    turns,
    currentTurnIndex,
    activeProject,
    addCardFromDB,
    gameState,
  } = useGameManager();

  const [fileError, setFileError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const plannerTurnReady = hasValidPlannerTurnSelection(turns, currentTurnIndex);
  const showNoPlannerTurn = !(gameState && plannerTurnReady);
  const noPlannerRows = turns.length === 0;

  const addCardBlockedTitle = !gameState
    ? "Load project or combat data first"
    : !plannerTurnReady
      ? noPlannerRows
        ? "No data — add planner turns in Turns first"
        : "Select or add a planner turn row in Turns first"
      : "Add cards or potions from the database";

  const handleJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileError(null);
    try {
      const text = await file.text();
      const data = importGameData(text);
      await loadGameDataFromJson(data);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not read combat JSON");
    }
  };

  const handleProjectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileError(null);
    try {
      const text = await file.text();
      const ok = loadProjectFromJsonText(text);
      if (!ok) setFileError("Could not load project file");
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not read project file");
    }
  };

  return (
    <div className="space-y-5 px-3 py-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={handleJsonFile}
        tabIndex={-1}
        aria-label="Load combat JSON file"
      />
      <input
        ref={projectFileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={handleProjectFile}
        tabIndex={-1}
        aria-label="Load project JSON file"
      />

      {/* Navigate */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Navigate</p>
        <div className="flex flex-col gap-2">
          <Link
            href="/turn-maker"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-amber-400/55 bg-amber-950/50 px-4 text-sm font-bold text-amber-50 shadow-md shadow-amber-950/25 ring-1 ring-amber-500/20 active:scale-[0.99]"
          >
            <CalendarClock className="h-5 w-5 shrink-0 text-amber-200" strokeWidth={2.25} aria-hidden />
            Turns
          </Link>
          <Link
            href="/decision-timeline"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-cyan-400/55 bg-cyan-950/45 px-4 text-sm font-bold text-cyan-50 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/25 active:scale-[0.99]"
          >
            <GitBranch className="h-5 w-5 shrink-0 text-cyan-200" strokeWidth={2.25} aria-hidden />
            Decision Timeline
          </Link>
          <Link
            href="/tutorial"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-slate-600/70 bg-slate-900/80 px-4 text-sm font-bold text-violet-100 shadow-md shadow-black/20 ring-1 ring-slate-500/20 active:scale-[0.99]"
          >
            <CircleHelp className="h-5 w-5 shrink-0 text-violet-300" strokeWidth={2.25} aria-hidden />
            Tutorial
          </Link>
        </div>
      </section>

      {/* Phase */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Phase</p>
        <PlannerPhaseActionsBar variant="inline" />
      </section>

      {/* Project */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Project</p>
        {activeProject ? (
          <p
            className="mb-2 truncate rounded-lg border border-violet-500/40 bg-violet-950/45 px-3 py-2 text-xs font-bold uppercase tracking-wide text-violet-100"
            title={`Project: ${activeProject.name}`}
          >
            {activeProject.name}
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => saveProject()}
            disabled={turns.length === 0}
            title="Save full project as JSON"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-violet-500/50 bg-violet-950/45 px-4 text-sm font-bold text-violet-50 shadow-md ring-1 ring-violet-400/25 transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FileDown className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
            Save project
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => projectFileInputRef.current?.click()}
            title="Load a saved project file"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-fuchsia-500/45 bg-fuchsia-950/35 px-4 text-sm font-bold text-fuchsia-50 shadow-md ring-1 ring-fuchsia-400/20 transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FolderOpen className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
            Load project
          </button>
          <button
            type="button"
            onClick={() => closeProject()}
            title="Close project and clear saved last project"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-slate-600/80 bg-slate-900/80 px-4 text-sm font-bold text-slate-200 shadow-md transition hover:border-rose-500/45 hover:bg-rose-950/35 hover:text-rose-100"
          >
            <X className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
            Close project
          </button>
        </div>
      </section>

      {/* Data */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Data</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            title="Load combat from a JSON file"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-sky-500/50 bg-sky-800/90 px-4 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? "Loading…" : "Load combat data"}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={!gameState || showNoPlannerTurn}
            title={addCardBlockedTitle}
            className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-emerald-500/50 bg-emerald-700/90 px-4 text-sm font-semibold text-white shadow-sm transition disabled:opacity-40"
          >
            <Plus className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
            Add card / potion
          </button>
        </div>
        {fileError ? (
          <p className="mt-2 text-[10px] text-red-400">{fileError}</p>
        ) : null}
      </section>

      <CardDBModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddCard={addCardFromDB} />
    </div>
  );
}
