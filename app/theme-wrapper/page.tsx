"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Download, FileCode2, BookOpen } from "lucide-react";
import { zipSync } from "fflate";
import { withBasePath } from "@/app/utils/withBasePath";
import { ThemeExamplesUnified } from "@/app/theme-wrapper/ThemeExamplesUnified";

type TabId = "examples" | "docs";

const PACK_FILES = [
  { fetchPath: "/theme-wrapper/theme.html", zipPath: "theme.html" },
  { fetchPath: "/theme-wrapper/theme_docs.html", zipPath: "theme_docs.html" },
  { fetchPath: "/theme-wrapper/sts-theme.css", zipPath: "sts-theme.css" },
] as const;

export default function ThemeWrapperPage() {
  const [tab, setTab] = useState<TabId>("examples");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const docsSrc = withBasePath("/theme-wrapper/theme_docs.html");

  const exportPack = useCallback(async () => {
    setExportError(null);
    setExporting(true);
    try {
      const entries: Record<string, Uint8Array> = {};
      for (const { fetchPath, zipPath } of PACK_FILES) {
        const res = await fetch(withBasePath(fetchPath));
        if (!res.ok) {
          throw new Error(`Could not load ${fetchPath} (${res.status})`);
        }
        entries[zipPath] = new Uint8Array(await res.arrayBuffer());
      }
      const zipped = zipSync(entries, { level: 6 });
      const blob = new Blob([new Uint8Array(zipped)], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sts-theme-wrapper.zip";
      a.rel = "noopener";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Export failed.";
      setExportError(msg);
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-cyan-500/35 bg-slate-950/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl">
              Theme wrapper
            </h1>
            <p className="mt-0.5 max-w-xl text-sm text-slate-400">
              Static examples and documentation (
              <code className="rounded bg-slate-900 px-1 py-0.5 text-xs text-cyan-200/90">
                sts-theme.css
              </code>
              ). Export a zip for offline sharing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-600/80 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800"
            >
              ← Planner
            </Link>
            <button
              type="button"
              onClick={() => void exportPack()}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/55 bg-amber-950/40 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-950/65 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="size-4 shrink-0" aria-hidden />
              {exporting ? "Exporting…" : "Export theme-wrapper"}
            </button>
          </div>
        </div>
        {exportError ? (
          <p className="mx-auto mt-2 max-w-6xl text-sm text-red-400">{exportError}</p>
        ) : null}
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-wrap gap-2 border-b border-slate-800/90 px-4 py-2 md:px-6">
        <button
          type="button"
          onClick={() => setTab("examples")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === "examples"
              ? "bg-cyan-950/70 text-cyan-100 ring-1 ring-cyan-500/45"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <FileCode2 className="size-4" aria-hidden />
          Examples
        </button>
        <button
          type="button"
          onClick={() => setTab("docs")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === "docs"
              ? "bg-cyan-950/70 text-cyan-100 ring-1 ring-cyan-500/45"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <BookOpen className="size-4" aria-hidden />
          Docs
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-auto bg-slate-900/40">
        {tab === "examples" ? (
          <ThemeExamplesUnified />
        ) : (
          <iframe
            title="Theme documentation"
            src={docsSrc}
            className="h-[calc(100dvh-140px)] min-h-[480px] w-full border-0 md:h-[calc(100dvh-128px)]"
          />
        )}
      </main>
    </div>
  );
}
