"use client";

import { useMemo } from "react";
import {
  readStsIconCatalog,
  STS_ICON_GLYPH,
} from "@/app/card-design-gallery/galleryStsGlyphs";
import { getEffectDisplay } from "@/app/utils/effectDisplay";

/** Extra legend lines for derived keys (shortLabel stays the title). */
const DERIVED_GLYPH_NOTES: Partial<Record<string, string>> = {
  CONDITIONAL_MARKER:
    "Shown when an effect is gated (e.g. damage / draw / block / discard / energyGain conditioned in JSON).",
  AOE_ICON:
    "AoE damage marker: Attack + damage + “all enemies” in description. Bundled with the damage stat in one rose-tinted group.",
  AOE_DAMAGE:
    "Optional multi-hit cluster icon (legacy skewer-style); not the main lightning damage icon.",
  RANDOM_ICON:
    "Random targeting (e.g. discard at random). Pairs with discard icon in the same pill.",
  EXHAUST_SELF: "Card exhausts on play when selfExhaustOnPlay is true.",
  ANY_ORB: "Generic orb when the interaction does not fix a color.",
  SAME_ORB_AS_EVOKED: "Matches the orb type from the previous evoke.",
};

export function GalleryIconCatalogPanel({ className = "" }: { className?: string }) {
  const stsEntries = useMemo(() => readStsIconCatalog(), []);

  const extraDerivedKeys = useMemo(() => {
    const fromJson = new Set(stsEntries.map((e) => e.key));
    return Object.keys(STS_ICON_GLYPH).filter((k) => !fromJson.has(k));
  }, [stsEntries]);

  return (
    <aside
      className={`border-slate-800 bg-slate-950/95 text-slate-200 lg:border-l ${className}`}
    >
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-3 py-3 backdrop-blur-sm">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Effect &amp; icon catalog
        </h2>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          Keys from <code className="text-slate-400">STS_CARDS_DB.json</code>{" "}
          <code className="text-slate-400">iconCatalog</code> when present, else the built-in
          fallback. In-card clusters prepend{" "}
          <span className="text-amber-200/80">conditional</span>,{" "}
          <span className="text-rose-200/80">AoE</span>, or{" "}
          <span className="text-violet-200/80">random</span> when{" "}
          <code className="text-slate-400">*.conditioned</code>, attack text says{" "}
          <code className="text-slate-400">all enemies</code>, or{" "}
          <code className="text-slate-400">discardEffect.random</code> (etc.). Base numbers stay
          in the stat row (damage shows weak / vuln / both); AoE attacks get one shared rose
          tint behind modifiers + damage. Orbs, exhaust, and debuff stacks use the keys below.
        </p>
      </div>

      <div className="space-y-6 px-3 py-4">
        <section aria-labelledby="catalog-sts-heading">
          <h3
            id="catalog-sts-heading"
            className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Database icon keys
          </h3>
          <ul className="space-y-2">
            {stsEntries.map(({ key, description }) => {
              const g = STS_ICON_GLYPH[key];
              const Icon = g?.Icon;
              return (
                <li
                  key={key}
                  className="flex gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950">
                    {Icon ? (
                      <Icon className={`h-4 w-4 ${g.iconClass}`} aria-hidden />
                    ) : (
                      <span className="text-[9px] text-slate-600">—</span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold text-cyan-200/90">
                      {key}
                    </p>
                    <p className="text-[10px] leading-snug text-slate-500">{description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {extraDerivedKeys.length > 0 ? (
          <section aria-labelledby="catalog-derived-heading">
            <h3
              id="catalog-derived-heading"
              className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              Derived / UI-only
            </h3>
            <ul className="space-y-2">
              {extraDerivedKeys.map((key) => {
                const g = STS_ICON_GLYPH[key]!;
                return (
                  <li
                    key={key}
                    className="flex gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950">
                      <g.Icon className={`h-4 w-4 ${g.iconClass}`} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-semibold text-amber-200/90">
                        {key}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-300">{g.shortLabel}</p>
                      {DERIVED_GLYPH_NOTES[key] ? (
                        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                          {DERIVED_GLYPH_NOTES[key]}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="catalog-stats-heading">
          <h3
            id="catalog-stats-heading"
            className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Card stat row (gallery)
          </h3>
          <p className="mb-2 text-[10px] leading-snug text-slate-500">
            Same icons as the main planner card: primary value plus side columns where applicable.
          </p>
          <ul className="space-y-2">
            {(
              [
                {
                  id: "damage-row",
                  title: "Damage",
                  lines: [
                    "Lightning: base damage.",
                    "Down arrow / alert / dumbbell: damage under weak, vulnerable, and both.",
                  ],
                  tokens: ["damage", "weak", "vulnerable", "strength"] as const,
                },
                {
                  id: "block-row",
                  title: "Block",
                  lines: ["Shield: block. Struck shield: value under frail."],
                  tokens: ["block", "frail"] as const,
                },
                {
                  id: "draw-row",
                  title: "Draw",
                  lines: ["Page icon + count."],
                  tokens: ["draw"] as const,
                },
                {
                  id: "energy-row",
                  title: "Energy",
                  lines: ["Lightning + energy gain value."],
                  tokens: ["energygain"] as const,
                },
                {
                  id: "hp-loss-row",
                  title: "HP loss",
                  lines: ["Self-hit when takeDamage is present."],
                  tokens: ["takedamage"] as const,
                },
              ] as const
            ).map((group) => (
              <li
                key={group.id}
                className="rounded-lg border border-slate-800/80 bg-slate-900/50 px-2 py-2"
              >
                <p className="text-[10px] font-semibold text-slate-300">{group.title}</p>
                {group.lines.map((line) => (
                  <p key={line} className="text-[10px] leading-snug text-slate-500">
                    {line}
                  </p>
                ))}
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.tokens.map((t) => {
                    const d = getEffectDisplay(t);
                    const Icon = d.icon;
                    return (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950/80 px-1.5 py-1"
                        title={d.fullLabel}
                      >
                        <Icon className={`h-3.5 w-3.5 ${d.color}`} aria-hidden />
                        <span className="text-[9px] font-mono text-slate-500">{t}</span>
                      </span>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
