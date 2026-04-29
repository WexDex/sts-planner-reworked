"use client";

import {
  GALLERY_QUICK_TEMPLATES,
  type GalleryQuickTemplate,
} from "@/app/card-design-gallery/galleryQuickTemplates";

export function GalleryQuickTemplateBar({
  onPick,
  className = "",
  size = "default",
  showFooterHint = true,
}: {
  onPick: (template: GalleryQuickTemplate) => void;
  className?: string;
  /** `compact` for tight modal layout */
  size?: "default" | "compact";
  showFooterHint?: boolean;
}) {
  const btn =
    size === "compact"
      ? "rounded-md border border-slate-600/90 bg-slate-800/90 px-2 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700/90"
      : "rounded-lg border border-slate-600/80 bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800";

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Quick templates
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {GALLERY_QUICK_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.blurb}
            onClick={() => onPick(t)}
            className={btn}
          >
            {t.title}
          </button>
        ))}
      </div>
      {showFooterHint ? (
        <p className="text-[10px] leading-snug text-slate-600">
          Loads preset sets from STS_CARDS_DB. Use <strong className="text-slate-500">Select cards…</strong>{" "}
          to add, remove, or search the full list.
        </p>
      ) : null}
    </div>
  );
}
