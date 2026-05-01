"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TocSection = { id: string; label: string };

/**
 * Sticky sidebar TOC with scroll-spy highlighting; sidebar scrolls when TOC exceeds viewport (`max-h` + `overflow-y-auto`).
 */
export function TutorialScrollNav({ sections }: { sections: readonly TocSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

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

  return (
    <aside className="lg:sticky lg:top-[calc(var(--tutorial-header-h,5.5rem)+0.75rem)] lg:max-h-[calc(100dvh-var(--tutorial-header-h,5.5rem)-2.5rem)] lg:self-start">
      <details className="rounded-xl border border-slate-700/70 bg-slate-900/40 lg:hidden">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-slate-200 [&::-webkit-details-marker]:hidden">
          On this page
        </summary>
        <nav
          aria-label="On this page"
          className="max-h-[50dvh] overflow-y-auto overscroll-contain border-t border-slate-800/80 px-2 py-2"
        >
          <TocUl sections={sections} active={active} />
        </nav>
      </details>
      <nav
        aria-label="On this page"
        className="hidden max-h-[calc(100dvh-var(--tutorial-header-h,5.5rem)-2.5rem)] overflow-y-auto overscroll-contain pr-2 lg:block"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          On this page
        </p>
        <TocUl className="mt-3 border-l border-slate-800/90 pl-3" sections={sections} active={active} />
      </nav>
    </aside>
  );
}

function TocUl({
  sections,
  active,
  className,
}: {
  sections: readonly TocSection[];
  active: string;
  className?: string;
}) {
  return (
    <ul className={`space-y-1 text-sm ${className ?? ""}`}>
      {sections.map(({ id, label }) => {
        const isOn = active === id;
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block rounded-md py-1 pl-2 transition ${
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

/** Two-column doc layout: sidebar + main prose (children). */
export function TutorialPageShell({
  toc,
  children,
}: {
  toc: readonly TocSection[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[minmax(0,228px)_minmax(0,1fr)] lg:gap-10 lg:py-10">
      <TutorialScrollNav sections={toc} />
      <main className="min-w-0 space-y-10 pb-20">{children}</main>
    </div>
  );
}
