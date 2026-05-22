"use client";

import { useRef, useState } from "react";

interface FieldSuggestInputProps {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
  /** Applied to the outer relative wrapper div (use for flex sizing, e.g. "flex-1 min-w-0") */
  wrapperClassName?: string;
  /** Applied to the <input> element */
  className?: string;
  onEnter?: () => void;
  autoFocus?: boolean;
}

export default function FieldSuggestInput({
  value,
  onChange,
  suggestions,
  placeholder,
  wrapperClassName = "",
  className = "",
  onEnter,
  autoFocus,
}: FieldSuggestInputProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const q = value.toLowerCase();
  const filtered = suggestions
    .filter((s) => s.toLowerCase().includes(q))
    .sort((a, b) => {
      const aS = a.toLowerCase().startsWith(q) ? 0 : 1;
      const bS = b.toLowerCase().startsWith(q) ? 0 : 1;
      return aS - bS || a.localeCompare(b);
    })
    .slice(0, 10);

  function pick(s: string) {
    onChange(s);
    setOpen(false);
  }

  function handleFocus() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleBlur() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter") { onEnter?.(); return; }
  }

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-0.5 max-h-48 w-full min-w-40 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl [scrollbar-width:thin]">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => pick(s)}
              className="flex w-full items-center px-2.5 py-1 text-left font-mono text-[11px] text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
