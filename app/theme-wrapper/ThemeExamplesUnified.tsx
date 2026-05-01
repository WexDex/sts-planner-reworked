"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/app/utils/withBasePath";
import { ThemeWrapperDecisionTopologyDemo } from "@/app/theme-wrapper/ThemeWrapperDecisionTopologyDemo";
import { ThemeWrapperStscardShowcase } from "@/app/theme-wrapper/ThemeWrapperStscardShowcase";
import { splitThemeExamplesHtml } from "@/app/theme-wrapper/themeExamplesHtml";

const SHADOW_SCOPE_CSS = `
:host {
  display: block;
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}
.sts-shadow-root {
  font-size: var(--font-size);
  color: var(--app-fg);
  background: transparent;
}
.sts-shadow-root:not(.dark) .token-strip.light .token-strip-title {
  color: #0f172a;
}
.sts-shadow-root.dark .token-strip.light {
  display: none;
}
.sts-shadow-root.dark .token-strip.dark-only {
  display: block;
}
`;

function attachThemeShadow(
  host: HTMLElement,
  pageFragmentHtml: string,
  wireToggle: boolean,
): () => void {
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  shadow.replaceChildren();

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${window.location.origin}${withBasePath("/theme-wrapper/sts-theme.css")}`;

  const scopeStyle = document.createElement("style");
  scopeStyle.textContent = SHADOW_SCOPE_CSS;

  const root = document.createElement("div");
  root.className = "sts-shadow-root dark";
  root.innerHTML = `<div class="page-wrap">${pageFragmentHtml}</div>`;

  shadow.append(link, scopeStyle, root);

  if (!wireToggle) return () => {};

  const btn = shadow.querySelector("#toggleDark");
  if (!(btn instanceof HTMLButtonElement) || !root) return () => {};

  const sync = () => {
    const dark = root.classList.contains("dark");
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.textContent = dark
      ? "Preview: design tokens (dark)"
      : "Preview: design tokens (light)";
  };

  const onClick = () => {
    root.classList.toggle("dark");
    sync();
  };

  btn.addEventListener("click", onClick);
  sync();

  return () => btn.removeEventListener("click", onClick);
}

export function ThemeExamplesUnified() {
  const topHostRef = useRef<HTMLDivElement>(null);
  const nodesHostRef = useRef<HTMLDivElement>(null);
  const bottomHostRef = useRef<HTMLDivElement>(null);
  const [parts, setParts] = useState<{
    before: string;
    midTail: string;
    dtlSection: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    (async () => {
      try {
        const res = await fetch(withBasePath("/theme-wrapper/theme.html"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const split = splitThemeExamplesHtml(html);
        if (cancelled) return;
        if (!split) throw new Error("Could not parse theme.html (.page-wrap)");
        setParts(split);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load theme examples.");
          setParts(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!parts || !topHostRef.current || !bottomHostRef.current) return;

    const unTop = attachThemeShadow(topHostRef.current, parts.before, true);

    let unNodes = () => {};
    if (parts.dtlSection.trim() && nodesHostRef.current) {
      unNodes = attachThemeShadow(nodesHostRef.current, parts.dtlSection, false);
    }

    const unBot = attachThemeShadow(bottomHostRef.current, parts.midTail, false);

    return () => {
      unTop();
      unNodes();
      unBot();
    };
  }, [parts]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-red-400 md:px-6">
        {loadError}
      </div>
    );
  }

  if (!parts) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 md:px-6">
        Loading theme examples…
      </div>
    );
  }

  return (
    <div className="bg-[#020617]">
      <div ref={topHostRef} />

      <section
        aria-label="Live STSCard previews and icon catalog"
        className="border-y border-slate-800 bg-slate-950 py-10"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <header className="mb-8">
            <h2 className="text-lg font-semibold text-slate-100 md:text-xl">Game cards (STSCard)</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Lucide glyphs via{" "}
              <code className="rounded bg-slate-900 px-1 py-0.5 text-xs text-cyan-200/90">
                inferGalleryCardEffects
              </code>{" "}
              and{" "}
              <code className="rounded bg-slate-900 px-1 py-0.5 text-xs text-cyan-200/90">
                galleryStsGlyphs.ts
              </code>
              — same previews and effect catalog as the card design gallery.
            </p>
          </header>
          <ThemeWrapperStscardShowcase density="embedded" />
        </div>
      </section>

      {parts.dtlSection.trim() ? (
        <section
          aria-label="Decision Timeline checkpoint nodes"
          className="border-t border-slate-800 bg-[#020617] py-10"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <p className="mb-6 max-w-3xl text-sm text-slate-400">
              Checkpoint nodes and summary chrome use{" "}
              <code className="rounded bg-slate-900 px-1 py-0.5 text-xs text-cyan-200/90">.dtl-*</code>{" "}
              in{" "}
              <code className="rounded bg-slate-900 px-1 py-0.5 text-xs text-slate-400">
                sts-theme.css
              </code>{" "}
              — pulled from the same block as standalone{" "}
              <code className="rounded bg-slate-900 px-1 py-0.5 text-xs text-slate-400">
                theme.html
              </code>
              .
            </p>
            <div ref={nodesHostRef} />
          </div>
        </section>
      ) : null}

      <section
        aria-label="Decision Timeline graph topology"
        className="border-t border-slate-800 bg-slate-950 py-10"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <header className="mb-6">
            <h2 className="text-lg font-semibold text-slate-100 md:text-xl">Graph topology</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Live canvas uses{" "}
              <code className="rounded bg-slate-900 px-1 py-0.5 text-xs text-cyan-200/90">@xyflow/react</code>{" "}
              in{" "}
              <code className="rounded bg-slate-900 px-1 py-0.5 text-xs text-slate-400">
                DecisionTimelineFlow.tsx
              </code>
              . Handles sit on START (source) and checkpoints (targets); edges are smooth steps between parents and
              children. Violet ring = graph-selected node; cyan glow = active planner pin; neutral = sibling fork.
            </p>
          </header>
          <ThemeWrapperDecisionTopologyDemo />
        </div>
      </section>

      <div ref={bottomHostRef} />
    </div>
  );
}
