"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  TUTORIAL_DOC_PASS_VERSION,
  TUTORIAL_DOC_UPDATE_NOTICE_CLASS,
  tutorialNavHrefHasDocPassHighlights,
} from "@/app/tutorial/docUpdateHighlight";
import type { TutorialSearchEntry } from "@/app/tutorial/search-index";

const NAV: { href: string; label: string }[] = [
  { href: "/tutorial", label: "Home" },
  { href: "/tutorial/glyphs", label: "Glyphs & stats" },
  { href: "/tutorial/turn-maker", label: "Turn maker" },
  { href: "/tutorial/decision-timeline", label: "Timeline" },
  { href: "/tutorial/cards", label: "Cards" },
  { href: "/tutorial/theme", label: "Theme" },
];

function navActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/tutorial") return pathname === "/tutorial";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TutorialGlobalSearch({ index }: { index: TutorialSearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    if (trimmed.length < 2) return [];
    const parts = trimmed.split(/\s+/).filter(Boolean);
    return index.filter((e) =>
      parts.every((p) => e.matchText.includes(p)),
    ).slice(0, 42);
  }, [index, q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onKeyNav = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-md min-w-[12rem]" onKeyDown={onKeyNav}>
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search tutorial & glossary…"
        autoComplete="off"
        aria-label="Search tutorial and glossary entries"
        className="w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 shadow-inner outline-none placeholder:text-slate-500 focus:border-violet-500/55 focus:ring-1 focus:ring-violet-500/40"
      />
      {open && q.trim().length >= 2 ? (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-[min(70dvh,28rem)] w-[min(100vw-2rem,26rem)] overflow-y-auto rounded-xl border border-slate-600/80 bg-slate-900/98 py-1 shadow-xl shadow-black/50 ring-1 ring-slate-500/20"
          role="listbox"
        >
          {hits.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">No matches</p>
          ) : (
            <ul className="divide-y divide-slate-800/90">
              {hits.map((h) => (
                <li key={h.id} role="option">
                  <Link
                    href={h.href}
                    className="block px-3 py-2.5 text-left transition hover:bg-slate-800/80"
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                    }}
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {h.bucket}
                    </span>
                    <span className="mt-0.5 block text-sm font-medium text-slate-100">{h.title}</span>
                    <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-400">{h.preview}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function TutorialChrome({
  searchIndex,
  children,
}: {
  searchIndex: TutorialSearchEntry[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = (): void => {
      const h = Math.round(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--tutorial-header-h", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100">
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40 shrink-0 border-b border-slate-800/90 bg-slate-900/95 shadow-md shadow-black/25 backdrop-blur-md supports-backdrop-filter:bg-slate-900/90"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-600/60 bg-slate-800/80 px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              ← Planner
            </Link>
            <span className="text-slate-600" aria-hidden>
              |
            </span>
            <span className="inline-flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-200">Tutorial</span>
              <span
                className="rounded-md border border-amber-600/40 bg-amber-950/35 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-amber-200/95"
                title="Tutorial doc pass revision id"
              >
                v{TUTORIAL_DOC_PASS_VERSION}
              </span>
            </span>
          </div>
          <nav
            className="flex flex-wrap gap-1.5 text-[11px] font-semibold sm:text-xs"
            aria-label="Tutorial sections"
          >
            {NAV.map(({ href, label }) => {
              const active = navActive(pathname, href);
              const docPassStripe = tutorialNavHrefHasDocPassHighlights(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg border px-2.5 py-1.5 transition sm:px-3 ${
                    docPassStripe ? "tutorial-doc-update-nav-link " : ""
                  }${
                    active
                      ? "border-violet-500/50 bg-violet-950/40 text-violet-100"
                      : "border-slate-700/70 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex w-full justify-end lg:max-w-sm lg:flex-1">
            <TutorialGlobalSearch index={searchIndex} />
          </div>
        </div>
      </header>
      <div className="shrink-0" style={{ height: "var(--tutorial-header-h, 5.5rem)" }} aria-hidden />
      <aside
        className={`${TUTORIAL_DOC_UPDATE_NOTICE_CLASS} shrink-0 px-4`}
        aria-label="Latest tutorial doc changes"
      >
        <div className="mx-auto max-w-6xl">
          <strong className="font-semibold text-amber-100">Docs highlight (v{TUTORIAL_DOC_PASS_VERSION}):</strong> Panels with the
          amber left stripe are new or revised in this pass — Card Actions rail (left-rail swap, persistent selection), Quick
          Actions per card (block, draw, energy, heal, focus, mantra, exhaust, Power apply/remove), and the new{" "}
          <code className="font-mono text-[10px] text-amber-200/90">/editors/card-actions</code> route for configuring custom
          per-card actions. Next doc update: remove old stripes, bump version, sync route list in{" "}
          <code className="font-mono text-[10px] text-amber-200/90">docUpdateHighlight.ts</code>, then restripe only what changed.
        </div>
      </aside>
      {children}
    </div>
  );
}
