"use client";

import Link from "next/link";
import { ArrowRight, Clipboard, Zap } from "lucide-react";

const EDITORS = [
  {
    href: "/editors/card-actions",
    icon: <Zap className="h-5 w-5" strokeWidth={2} />,
    iconCls: "border-amber-500/50 bg-amber-950/60 text-amber-300",
    title: "Card Actions Editor",
    description:
      "Configure per-card quick-action buttons — buffs, debuffs, HP, block, energy, orbs, stance, and more. Actions appear in the Quick Actions panel when a card is selected in the planner.",
    badge: "22 action types",
    badgeCls: "border-amber-500/30 bg-amber-950/50 text-amber-300/80",
    border: "border-amber-500/25 hover:border-amber-400/45",
    bg: "bg-amber-950/10 hover:bg-amber-950/20",
  },
  {
    href: "/editors/card-fields",
    icon: <Clipboard className="h-5 w-5" strokeWidth={2} />,
    iconCls: "border-sky-500/50 bg-sky-950/60 text-sky-300",
    title: "Card Field Editor",
    description:
      "Browse all 370 cards and fill in missing field values — damage, block, draw, cost, descriptions, flags and more. Keyboard-navigable list, live description preview, per-card undo/redo, and JSON download.",
    badge: "370 cards",
    badgeCls: "border-sky-500/30 bg-sky-950/50 text-sky-300/80",
    border: "border-sky-500/25 hover:border-sky-400/45",
    bg: "bg-sky-950/10 hover:bg-sky-950/20",
  },
];

export default function EditorHubClient() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Editors</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Tools for configuring card data and per-card behaviour used by the planner.
          </p>
        </div>

        {/* Editor cards */}
        <div className="space-y-4">
          {EDITORS.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className={`group flex items-start gap-4 rounded-2xl border p-5 transition ${e.border} ${e.bg}`}
            >
              {/* Icon */}
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${e.iconCls}`}
              >
                {e.icon}
              </span>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[15px] font-bold text-slate-100">{e.title}</span>
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${e.badgeCls}`}
                  >
                    {e.badge}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{e.description}</p>
              </div>

              {/* Arrow */}
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-400"
                strokeWidth={2}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
