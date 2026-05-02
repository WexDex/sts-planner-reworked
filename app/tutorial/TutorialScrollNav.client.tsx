"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  TUTORIAL_DOC_PASS_VERSION,
  TUTORIAL_DOC_UPDATE_CLASS,
} from "@/app/tutorial/docUpdateHighlight";

export type TocSection = { id: string; label: string };

function computeSectionIdsWithDocUpdates(
  root: HTMLElement,
  sections: readonly { id: string }[],
): Set<string> {
  const result = new Set<string>();
  const ids = sections.map((s) => s.id);
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!;
    const start = root.querySelector(`#${CSS.escape(id)}`);
    if (!(start instanceof HTMLElement)) continue;

    let nextEl: HTMLElement | null = null;
    for (let j = i + 1; j < ids.length; j++) {
      const cand = root.querySelector(`#${CSS.escape(ids[j]!)}`);
      if (cand instanceof HTMLElement) {
        nextEl = cand;
        break;
      }
    }

    const range = document.createRange();
    range.setStart(start, 0);
    if (nextEl) range.setEndBefore(nextEl);
    else range.setEnd(root, root.childNodes.length);

    const probe = document.createElement("div");
    probe.appendChild(range.cloneContents());
    if (probe.querySelector(`.${TUTORIAL_DOC_UPDATE_CLASS}`)) {
      result.add(id);
    }
  }
  return result;
}

function scanDocRoot(root: HTMLElement | null, sections: readonly { id: string }[]): {
  pageHas: boolean;
  sectionIds: Set<string>;
} {
  if (!root) {
    return { pageHas: false, sectionIds: new Set() };
  }
  const pageHas = root.querySelector(`.${TUTORIAL_DOC_UPDATE_CLASS}`) != null;
  const sectionIds = computeSectionIdsWithDocUpdates(root, sections);
  return { pageHas, sectionIds };
}

function TutorialPageDocStatusBanner({ pageHasUpdates }: { pageHasUpdates: boolean }) {
  const v = TUTORIAL_DOC_PASS_VERSION;
  if (pageHasUpdates) {
    return (
      <div
        className="tutorial-doc-update-page-strip-yes px-4 py-3 text-sm text-amber-50/95"
        role="status"
      >
        <strong className="font-semibold text-amber-100">This page includes revised docs.</strong>{" "}
        Amber-bordered panels mark updated copy for doc pass{" "}
        <span className="font-mono text-xs text-amber-200/90">{v}</span>.
      </div>
    );
  }
  return (
    <div
      className="tutorial-doc-update-page-strip-no px-4 py-2.5 text-xs text-slate-500"
      role="status"
    >
      No amber-highlighted revisions on this page for doc pass{" "}
      <span className="font-mono text-slate-400">{v}</span>.
    </div>
  );
}

/**
 * Sticky sidebar TOC with scroll-spy highlighting; sidebar scrolls when TOC exceeds viewport (`max-h` + `overflow-y-auto`).
 */
export function TutorialScrollNav({
  sections,
  highlightOnThisPageHeading = false,
  sectionIdsWithDocUpdates,
}: {
  sections: readonly TocSection[];
  /** Amber “On this page” chrome when ≥1 TOC-range contains a `.tutorial-doc-update` panel. */
  highlightOnThisPageHeading?: boolean;
  sectionIdsWithDocUpdates?: ReadonlySet<string>;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const tocStripeSet = sectionIdsWithDocUpdates ?? new Set<string>();

  const observer = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.target.id)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).getBoundingClientRect().top -
              (b.target as HTMLElement).getBoundingClientRect().top,
          );
        const id = visible[0]?.target.id;
        if (id) setActive(id);
      },
      { root: null, rootMargin: "-10% 0px -62% 0px", threshold: [0.02, 0.12, 0.55] },
    );
  }, []);

  useEffect(() => {
    if (!observer) return;
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [observer, sections]);

  useEffect(() => {
    const sync = (): void => {
      const headerVar = getComputedStyle(document.documentElement).getPropertyValue(
        "--tutorial-header-h",
      );
      const headerPx = parseFloat(headerVar) || 88;
      const cushion = window.scrollY + headerPx + 24;
      let lastSeen: string | undefined;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= cushion) lastSeen = id;
      }
      if (lastSeen) setActive(lastSeen);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [sections]);

  const sidebarHeadingChrome = highlightOnThisPageHeading ? "tutorial-doc-update-sidebar-heading" : "";

  return (
    <aside className="lg:sticky lg:top-[calc(var(--tutorial-header-h,5.5rem)+0.75rem)] lg:max-h-[calc(100dvh-var(--tutorial-header-h,5.5rem)-2.5rem)] lg:self-start">
      <details className="rounded-xl border border-slate-700/70 bg-slate-900/40 lg:hidden">
        <summary
          className={`cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-slate-200 [&::-webkit-details-marker]:hidden ${sidebarHeadingChrome}`}
        >
          On this page
        </summary>
        <nav
          aria-label="On this page"
          className="max-h-[50dvh] overflow-y-auto overscroll-contain border-t border-slate-800/80 px-2 py-2"
        >
          <TocUl sections={sections} active={active} sectionIdsWithDocUpdates={tocStripeSet} />
        </nav>
      </details>
      <nav
        aria-label="On this page"
        className="hidden max-h-[calc(100dvh-var(--tutorial-header-h,5.5rem)-2.5rem)] overflow-y-auto overscroll-contain pr-2 lg:block"
      >
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.14em] ${sidebarHeadingChrome || "text-slate-500"}`}
        >
          On this page
        </p>
        <TocUl
          className="mt-3 border-l border-slate-800/90 pl-3"
          sections={sections}
          active={active}
          sectionIdsWithDocUpdates={tocStripeSet}
        />
      </nav>
    </aside>
  );
}

function TocUl({
  sections,
  active,
  sectionIdsWithDocUpdates,
  className,
}: {
  sections: readonly TocSection[];
  active: string;
  sectionIdsWithDocUpdates: ReadonlySet<string>;
  className?: string;
}) {
  return (
    <ul className={`space-y-1 text-sm ${className ?? ""}`}>
      {sections.map(({ id, label }) => {
        const isOn = active === id;
        const sectionStripe = sectionIdsWithDocUpdates.has(id);
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block rounded-md py-1 pl-2 transition ${
                sectionStripe ? "tutorial-doc-update-toc-link " : ""
              }${
                isOn
                  ? "border-l-2 border-violet-400 bg-violet-950/30 font-semibold text-violet-100"
                  : "border-l-2 border-transparent text-slate-400 hover:bg-slate-800/55 hover:text-slate-100"
              }`}
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function TutorialDocLayoutShell({
  toc,
  children,
}: {
  toc: readonly TocSection[];
  children: ReactNode;
}) {
  const docRootRef = useRef<HTMLDivElement>(null);
  const [pageHasDocUpdates, setPageHasDocUpdates] = useState(false);
  const [sectionIdsWithUpdates, setSectionIdsWithUpdates] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const runScan = useCallback(() => {
    const root = docRootRef.current;
    const { pageHas, sectionIds } = scanDocRoot(root, toc);
    setPageHasDocUpdates(pageHas);
    setSectionIdsWithUpdates(sectionIds);
  }, [toc]);

  useLayoutEffect(() => {
    runScan();
  }, [runScan]);

  useEffect(() => {
    const root = docRootRef.current;
    if (!root) return;
    const mo = new MutationObserver(() => {
      runScan();
    });
    mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [runScan]);

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[minmax(0,228px)_minmax(0,1fr)] lg:gap-10 lg:py-10">
      <TutorialScrollNav
        sections={toc}
        highlightOnThisPageHeading={sectionIdsWithUpdates.size > 0}
        sectionIdsWithDocUpdates={sectionIdsWithUpdates}
      />
      <main className="min-w-0 pb-20">
        <div className="space-y-10">
          <TutorialPageDocStatusBanner pageHasUpdates={pageHasDocUpdates} />
          <div ref={docRootRef} className="space-y-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Two-column doc layout: sidebar + main prose (children). */
export function TutorialPageShell({
  toc,
  children,
}: {
  toc: readonly TocSection[];
  children: ReactNode;
}) {
  return <TutorialDocLayoutShell toc={toc}>{children}</TutorialDocLayoutShell>;
}
