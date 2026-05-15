"use client";

import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import {
  getOrbDefaults,
  saveOrbDefaults,
  BUILTIN_ORBS,
  DEFAULT_ORB_VALUES,
  type OrbTypeDefaults,
} from "@/app/utils/orbDefaults";

export default function OrbEditor() {
  const [defaults, setDefaults] = useState<Record<string, OrbTypeDefaults>>(DEFAULT_ORB_VALUES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDefaults(getOrbDefaults());
  }, []);

  const update = (type: string, field: keyof OrbTypeDefaults, raw: string | boolean) => {
    const value = typeof raw === "boolean" ? raw : Math.max(0, Number(raw) || 0);
    const next = { ...defaults, [type]: { ...defaults[type], [field]: value } };
    setDefaults(next);
    saveOrbDefaults(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const reset = () => {
    setDefaults({ ...DEFAULT_ORB_VALUES });
    saveOrbDefaults({ ...DEFAULT_ORB_VALUES });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const inputCls =
    "w-16 rounded-lg border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-center text-sm font-semibold text-slate-100 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden focus:outline-none focus:border-purple-500/70 transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400 leading-relaxed">
          These values pre-fill each orb slot&apos;s passive and evoke trackers when you channel that orb type. The <span className="font-semibold text-purple-300">Focus</span> toggle marks whether the value should be increased by the current Focus stat in the main planner.
        </p>
        <button
          type="button"
          onClick={reset}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-600/60 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:bg-slate-700/70"
          title="Restore all values to STS defaults"
        >
          <RotateCcw className="h-3 w-3" strokeWidth={2.25} />
          Reset defaults
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60 bg-slate-900/60">
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Orb</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Passive default</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-purple-400/80" title="Adds current Focus value to passive">+Focus</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Evoke default</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-purple-400/80" title="Adds current Focus value to evoke">+Focus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {BUILTIN_ORBS.map(({ type, label, emoji }) => {
              const row = defaults[type] ?? DEFAULT_ORB_VALUES[type];
              return (
                <tr key={type} className="bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <span className="text-base">{emoji}</span>
                      {label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={0}
                      value={row?.passiveDmg ?? 0}
                      onChange={e => update(type, "passiveDmg", e.target.value)}
                      className={inputCls}
                      aria-label={`${label} passive default`}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => update(type, "passiveFocus", !(row?.passiveFocus ?? false))}
                      title={row?.passiveFocus ? "Passive is affected by Focus — click to disable" : "Passive is NOT affected by Focus — click to enable"}
                      className={`inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors ${
                        row?.passiveFocus
                          ? "border-purple-500/60 bg-purple-500/30"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${row?.passiveFocus ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={0}
                      value={row?.evokeDmg ?? 0}
                      onChange={e => update(type, "evokeDmg", e.target.value)}
                      className={inputCls}
                      aria-label={`${label} evoke default`}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => update(type, "evokeFocus", !(row?.evokeFocus ?? false))}
                      title={row?.evokeFocus ? "Evoke is affected by Focus — click to disable" : "Evoke is NOT affected by Focus — click to enable"}
                      className={`inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors ${
                        row?.evokeFocus
                          ? "border-purple-500/60 bg-purple-500/30"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${row?.evokeFocus ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {saved && (
        <p className="text-right text-[10px] text-emerald-400">Saved ✓</p>
      )}
    </div>
  );
}
