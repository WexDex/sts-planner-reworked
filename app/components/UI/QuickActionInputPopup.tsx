"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  defaultValue: number;
  onApply: (value: number) => void;
  onClose: () => void;
}

export default function QuickActionInputPopup({ title, defaultValue, onApply, onClose }: Props) {
  const [value, setValue] = useState(String(defaultValue));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") handleApply();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function handleApply() {
    const n = parseFloat(value);
    if (!Number.isNaN(n)) {
      onApply(n);
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-72 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/60">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-100">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-center text-lg font-bold tabular-nums text-slate-100 outline-none ring-0 focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/40"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 rounded-xl border border-cyan-500/50 bg-cyan-950/50 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-900/60"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
