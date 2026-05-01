import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Scan } from "lucide-react";
import {
  TutorialBuffDebuffGlossary,
  TutorialEffectsGlossary,
  TutorialStsGlyphGlossary,
} from "@/app/tutorial/TutorialGlossaryChunks";
import { TutorialPageShell } from "@/app/tutorial/TutorialScrollNav.client";

export const metadata: Metadata = {
  title: "Tutorial · Glyphs & stats · Slay the Spire Combat Planner",
  description:
    "Planner legend vs catalog icons, STS card glyph keys, bundled effect/stat colors, curated buff/debuff glossary.",
};

const TOC = [
  { id: "legend-depth", label: "Legend vs catalog" },
  { id: "icon-reading", label: "Reading iconography" },
  { id: "glossary-effects", label: "Stats / effects" },
  { id: "glossary-glyphs", label: "Card glyphs" },
  { id: "glossary-status", label: "Buffs & debuffs" },
] as const;

export default function TutorialGlyphsPage() {
  return (
    <TutorialPageShell toc={TOC}>
      <header className="space-y-2 border-b border-slate-800/80 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">Glyphs & stats</p>
        <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-50">
          <Layers className="h-6 w-6 shrink-0 text-violet-400" strokeWidth={2} aria-hidden />
          Icons &amp; status language
        </h1>
        <p className="max-w-3xl text-sm text-slate-400">
          These tables mirror <code className="font-mono text-[11px] text-slate-500">getEffectDisplay</code>, bundled{" "}
          <code className="font-mono text-[11px] text-slate-500">STS_ICON_GLYPH</code> metadata (merged with STS icon catalog
          copy), plus curated combat statuses. Enemy intent emojis remain on the{" "}
          <Link href="/tutorial/turn-maker" className="text-violet-300 underline-offset-2 hover:underline">
            Turn maker
          </Link>{" "}
          guide.
        </p>
      </header>

      <section id="legend-depth" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Legend vs full glyph catalog</h2>
        <p className="text-sm leading-relaxed text-slate-300">
          Hover / pin chips in <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[11px]">TopBarBlock</code> pull
          from <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[11px]">getCardEffectLegendItems()</code>: a trimmed
          STS subset tuned for readability at a glance — most damage / block stats plus high-traffic keyword icons such as orb
          evoke markers, AoE overlays, ethereal/retain, etc. Anything missing there still binds through{" "}
          <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-[11px]">STS_CARDS_DB.json</code>; every catalog key our
          gallery knows how to rasterize Lucide glyphs for is enumerated in the tables below so you do not guess encoding names.
        </p>
      </section>

      <section id="icon-reading" className="scroll-mt-28 space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <Scan className="h-4 w-4 text-emerald-300" aria-hidden /> Reading stacked iconography
        </h2>
        <ul className="list-disc space-y-2 ps-5 text-sm leading-relaxed text-slate-300">
          <li>
            Numeric stats (<em>damage, block, draw, heal, poison…</em>) render beside their icon class so color matches both the{" "}
            card row and transient floating combat text.
          </li>
          <li>
            <strong className="text-slate-200">CONDITIONAL_MARKER</strong> prefixes describe rules gated by clauses in card JSON —
            pairing with textual description is still authoritative.
          </li>
          <li>
            AoE overlays highlight when base damage intends to splash all foes; planner gallery uses rose tints aligned with STS
            card templates.
          </li>
          <li>
            Orbs reuse Defect evoke colors; <strong className="text-slate-200">DRAW_ICON</strong> overlaps with cyan stat rows —
            intentional parity with in-game shorthand.
          </li>
          <li>
            When migrating custom card JSON, normalize icon keys via the STS editor bundle so future glyph exports remain
            diffable.
          </li>
        </ul>
      </section>

      <section id="glossary-effects" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Stats &amp; effect icons</h2>
        <p className="text-sm text-slate-400">
          Source of truth:{" "}
          <code className="rounded bg-slate-900 px-1 font-mono text-[11px]">app/utils/effectDisplay.ts</code> &
          neighboring color tokens. <strong className="text-slate-300">Code</strong> lists the primary{" "}
          <code className="font-mono text-[11px]">Card</code> JSON path (or player readout) that backs the icon;{" "}
          <span className="font-mono text-[11px]">—</span> when it is presentation-only or multi-field.
        </p>
        <TutorialEffectsGlossary />
      </section>

      <section id="glossary-glyphs" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Planner-bound STS glyph ids</h2>
        <p className="text-sm text-slate-400">
          Keys originate in <code className="rounded bg-slate-900 px-1 font-mono text-[11px]">STS_ICON_GLYPH</code> with textual
          merge from STS icon catalog fallback when bundled JSON lacks a verbose line.{" "}
          <strong className="text-slate-300">Code</strong> maps to card JSON paths (
          <code className="font-mono text-[11px]">reference.ts · GLYPH_RELATED_FIELD</code>) — e.g.{" "}
          <code className="font-mono text-[11px]">CAN_ADD_CARDS</code> →{" "}
          <code className="font-mono text-[11px]">canAddCards</code>, <code className="font-mono text-[11px]">KEY_INNATE</code> →{" "}
          <code className="font-mono text-[11px]">innate</code>, <code className="font-mono text-[11px]">DRAW_ICON</code> →{" "}
          <code className="font-mono text-[11px]">draw</code>.
        </p>
        <TutorialStsGlyphGlossary />
      </section>

      <section id="glossary-status" className="scroll-mt-28 space-y-4">
        <h2 className="text-base font-bold text-slate-100">Common buff / debuff chips</h2>
        <p className="text-sm text-slate-400">
          Stacks render inside <code className="rounded bg-slate-900 px-1 font-mono text-[11px]">BuffDebuffItem.tsx</code>. Your
          import payload can include arbitrary STS strings — this list documents the shorthand we explain in onboarding.
        </p>
        <TutorialBuffDebuffGlossary />
      </section>
    </TutorialPageShell>
  );
}
