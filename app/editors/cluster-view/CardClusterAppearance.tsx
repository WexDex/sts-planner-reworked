"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CLUSTER_FIELDS, CLUSTER_COLORS } from "./clusterAlgorithm";
import type { AppearanceConfig, NodeShape, ClusterResult } from "./clusterTypes";

type Props = {
  appearance: AppearanceConfig;
  onAppearanceChange: (a: AppearanceConfig) => void;
  clusterResults: ClusterResult[] | null;
};

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex w-full items-center justify-between border-b border-slate-800 bg-slate-900/40 px-4 py-2 text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {open ? <ChevronUp className="h-3 w-3 text-slate-600" /> : <ChevronDown className="h-3 w-3 text-slate-600" />}
      </button>
      {open && <div className="border-b border-slate-800/60 px-3 py-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-[11px] text-slate-400">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-violet-500"
      />
      <span className="w-9 shrink-0 text-right text-[11px] text-slate-400">
        {value}{unit}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-400">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-4 w-7 rounded-full transition-colors ${value ? "bg-violet-600" : "bg-slate-700"}`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${value ? "translate-x-3.5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-600 font-mono">{value}</span>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-5 w-8 cursor-pointer rounded border border-slate-700 bg-slate-900 p-0 outline-none"
        />
      </div>
    </div>
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-400">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-right text-[11px] text-slate-200 focus:outline-none focus:border-slate-600"
      />
    </div>
  );
}

export default function CardClusterAppearance({ appearance, onAppearanceChange, clusterResults }: Props) {
  const set = useCallback(
    <K extends keyof AppearanceConfig>(key: K, value: AppearanceConfig[K]) => {
      onAppearanceChange({ ...appearance, [key]: value });
    },
    [appearance, onAppearanceChange],
  );

  const setClusterColor = useCallback(
    (id: number, color: string) => {
      onAppearanceChange({
        ...appearance,
        clusterColors: { ...appearance.clusterColors, [id]: color },
      });
    },
    [appearance, onAppearanceChange],
  );

  const resetClusterColors = useCallback(() => {
    if (!clusterResults) return;
    const colors: Record<number, string> = {};
    clusterResults.forEach((r, i) => {
      colors[r.clusterId] = CLUSTER_COLORS[i % CLUSTER_COLORS.length]!;
    });
    onAppearanceChange({ ...appearance, clusterColors: colors });
  }, [appearance, clusterResults, onAppearanceChange]);

  const tooltipFieldKeys = CLUSTER_FIELDS.map(f => f.key);

  return (
    <div className="flex flex-col">
      {/* Appearance header */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appearance</span>
      </div>

      {/* Node */}
      <Section title="Node">
        <SliderRow label="Node size" value={appearance.nodeSize} min={6} max={40} onChange={v => set("nodeSize", v)} unit="px" />
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-[11px] text-slate-400">Shape</span>
          <div className="flex gap-1">
            {(["circle", "square", "diamond"] as NodeShape[]).map(s => (
              <button
                key={s}
                onClick={() => set("nodeShape", s)}
                className={`rounded px-2 py-0.5 text-[10px] font-medium border transition-colors capitalize ${
                  appearance.nodeShape === s
                    ? "border-violet-500/60 bg-violet-950/50 text-violet-300"
                    : "border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <SliderRow label="Border width" value={appearance.nodeBorderWidth} min={0} max={6} onChange={v => set("nodeBorderWidth", v)} unit="px" />
        <SliderRow label="Opacity" value={appearance.nodeOpacity} min={10} max={100} onChange={v => set("nodeOpacity", v)} unit="%" />
        <ToggleRow label="Show name label" value={appearance.showNodeLabel} onChange={v => set("showNodeLabel", v)} />
      </Section>

      {/* Cluster */}
      <Section title="Cluster">
        <SliderRow label="Bg opacity" value={appearance.clusterBgOpacity} min={0} max={100} onChange={v => set("clusterBgOpacity", v)} unit="%" />
        <ToggleRow label="Show border" value={appearance.showClusterBorder} onChange={v => set("showClusterBorder", v)} />
        {appearance.showClusterBorder && (
          <SliderRow label="Border width" value={appearance.clusterBorderWidth} min={1} max={6} onChange={v => set("clusterBorderWidth", v)} unit="px" />
        )}
        <ToggleRow label="Show label" value={appearance.showClusterLabel} onChange={v => set("showClusterLabel", v)} />
        {appearance.showClusterLabel && (
          <>
            <SliderRow label="Label size" value={appearance.clusterLabelSize} min={9} max={24} onChange={v => set("clusterLabelSize", v)} unit="px" />
            <ColorRow label="Label color" value={appearance.clusterLabelColor} onChange={v => set("clusterLabelColor", v)} />
          </>
        )}
      </Section>

      {/* Layout */}
      <Section title="Layout & Spacing">
        <SliderRow label="Node spacing" value={appearance.nodeSpacing} min={2} max={40} onChange={v => set("nodeSpacing", v)} unit="px" />
        <SliderRow label="Cluster spacing" value={appearance.clusterSpacing} min={20} max={300} onChange={v => set("clusterSpacing", v)} unit="px" />
        <SliderRow label="Cluster padding" value={appearance.clusterPadding} min={8} max={80} onChange={v => set("clusterPadding", v)} unit="px" />
        <ColorRow label="Canvas bg" value={appearance.canvasBg} onChange={v => set("canvasBg", v)} />
      </Section>

      {/* Tooltip */}
      <Section title="Tooltip" defaultOpen={false}>
        <p className="text-[10px] text-slate-600 mb-1">Fields shown on hover</p>
        <div className="flex flex-wrap gap-1">
          {CLUSTER_FIELDS.map(f => {
            const active = appearance.tooltipFields.includes(f.key);
            return (
              <button
                key={f.key}
                onClick={() => {
                  const next = active
                    ? appearance.tooltipFields.filter(x => x !== f.key)
                    : [...appearance.tooltipFields, f.key];
                  set("tooltipFields", next);
                }}
                className={`rounded px-1.5 py-0.5 text-[10px] border transition-colors ${
                  active
                    ? "border-violet-500/50 bg-violet-950/40 text-violet-300"
                    : "border-slate-700 bg-slate-800/40 text-slate-600 hover:text-slate-400"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <NumberRow
          label="Max width (px)"
          value={appearance.tooltipMaxWidth}
          min={120}
          max={500}
          onChange={v => set("tooltipMaxWidth", v)}
        />
      </Section>

      {/* Cluster colors — only after clusters are computed */}
      {clusterResults && clusterResults.length > 0 && (
        <Section title="Cluster Colors">
          <div className="space-y-1.5">
            {clusterResults.map((r, i) => (
              <ColorRow
                key={r.clusterId}
                label={r.label}
                value={appearance.clusterColors[r.clusterId] ?? CLUSTER_COLORS[i % CLUSTER_COLORS.length] ?? "#6366f1"}
                onChange={v => setClusterColor(r.clusterId, v)}
              />
            ))}
          </div>
          <button
            onClick={resetClusterColors}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800/60 py-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset to defaults
          </button>
        </Section>
      )}

      <div className="h-6" />
    </div>
  );
}
