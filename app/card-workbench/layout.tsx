"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastStack } from "@/app/components/UI/NotificationProvider";

const TABS = [
  { href: "/card-workbench/cards", label: "Cards" },
  { href: "/card-workbench/glyphs", label: "Glyphs" },
] as const;

function tabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function CardWorkbenchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950">
      <div className="shrink-0 border-b border-white/10 bg-linear-to-r from-violet-950/80 via-slate-950 to-fuchsia-950/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/tutorial"
            className="mr-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
          >
            ← Tutorial
          </Link>
          <span className="text-sm font-semibold tracking-tight text-white">
            Card workbench
          </span>
          <nav className="flex flex-wrap gap-1.5 border-l border-white/15 pl-4">
            {TABS.map(({ href, label }) => {
              const active = tabActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-violet-400/40 shadow-[0_0_24px_-4px_rgba(167,139,250,0.45)]"
                      : "rounded-full px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/6 hover:text-slate-200"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <ToastStack placement="topRight" />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
