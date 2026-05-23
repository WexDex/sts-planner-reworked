"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DbFieldRanges, RangeFilters } from "./galleryFilterUtils";

interface GalleryRightPanelProps {
  dbRanges: DbFieldRanges;
  rangeFilters: RangeFilters;
  onChange: (field: string, bound: "min" | "max", value: string) => void;
  onClear: () => void;
  open: boolean;
  onToggle: () => void;
}

export default function GalleryRightPanel({
  dbRanges,
  rangeFilters,
  onChange,
  onClear,
  open,
  onToggle,
}: GalleryRightPanelProps) {
  const fields = Object.entries(dbRanges);
  const hasAnyRange = Object.values(rangeFilters).some(
    r => r && (r.min != null || r.max != null),
  );

  return (
    <div
      className={`relative shrink-0 border-l border-slate-700/40 bg-slate-900/80 transition-all duration-200 ${open ? "w-56" : "w-7"}`}
    >
      {/* Toggle button on the left edge */}
      <button
        type="button"
        onClick={onToggle}
        title={open ? "Collapse range filters" : "Expand range filters"}
        className="absolute -left-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/60 bg-slate-800 text-slate-400 shadow transition hover:border-slate-600 hover:text-slate-200"
      >
        {open ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {open && (
        <div className="h-full overflow-y-auto p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Range Filters
            </span>
            {hasAnyRange && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-0.5 text-[10px] text-slate-500 transition hover:text-rose-400"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Dynamic field rows */}
          {fields.map(([key, dbRange]) => {
            const rf = rangeFilters[key];
            const isActive = rf && (rf.min != null || rf.max != null);
            return (
              <div key={key} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-medium ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                    {dbRange.label}
                  </label>
                  <span className="text-[9px] text-slate-700">
                    {dbRange.min}–{dbRange.max}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder={String(dbRange.min)}
                    min={dbRange.min}
                    max={dbRange.max}
                    value={rf?.min ?? ""}
                    onChange={e => onChange(key, "min", e.target.value)}
                    className="w-[46px] rounded border border-slate-700/60 bg-slate-800/80 px-1.5 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-700 focus:border-slate-500/60 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-600">—</span>
                  <input
                    type="number"
                    placeholder={String(dbRange.max)}
                    min={dbRange.min}
                    max={dbRange.max}
                    value={rf?.max ?? ""}
                    onChange={e => onChange(key, "max", e.target.value)}
                    className="w-[46px] rounded border border-slate-700/60 bg-slate-800/80 px-1.5 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-700 focus:border-slate-500/60 focus:outline-none"
                  />
                  {isActive && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange(key, "min", "");
                        onChange(key, "max", "");
                      }}
                      className="text-slate-600 transition hover:text-rose-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {fields.length === 0 && (
            <p className="text-[11px] italic text-slate-600">No numeric fields found</p>
          )}
        </div>
      )}

      {/* When collapsed: rotated label */}
      {!open && (
        <div className="flex h-full items-center justify-center pt-8">
          <span
            className="select-none text-[10px] font-semibold uppercase tracking-widest text-slate-600"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {hasAnyRange ? "Filters ●" : "Filters"}
          </span>
        </div>
      )}
    </div>
  );
}
