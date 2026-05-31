"use client";

import { useState, useMemo, useCallback } from "react";
import { getStsCardsRecord } from "@/app/card-design-gallery/stsRecord";
import {
  runManualCluster,
  runComboCluster,
  runKMeans,
  autoK,
  cardHasAllFields,
  CLUSTER_COLORS,
  DEFAULT_APPEARANCE,
} from "./clusterAlgorithm";
import type { ClusterMode, ClusterResult, AppearanceConfig } from "./clusterTypes";
import CardClusterControls from "./CardClusterControls";
import CardClusterAppearance from "./CardClusterAppearance";
import CardClusterFlow from "./CardClusterFlow";
import CardClusterDetail from "./CardClusterDetail";
import { Network } from "lucide-react";

export default function CardClusterClient() {
  const allCards = useMemo(() => getStsCardsRecord(), []);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(Object.keys(getStsCardsRecord())),
  );
  const [mode, setMode]           = useState<ClusterMode>("manual");
  const [fields, setFields]       = useState<string[]>(["type"]);
  const [comboBins, setComboBins] = useState<number>(3);
  const [onlyWithFields, setOnlyWithFields] = useState<boolean>(false);
  const [k, setK]                 = useState<number>(5);

  const [clusterResults, setClusterResults]     = useState<ClusterResult[] | null>(null);
  const [appearance, setAppearance]             = useState<AppearanceConfig>(DEFAULT_APPEARANCE);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [isRunning, setIsRunning]               = useState(false);
  const [warning, setWarning]                   = useState<string | null>(null);

  const handleRun = useCallback(() => {
    let ids = Array.from(selectedIds);
    if (ids.length === 0) { setWarning("Select at least one card."); return; }
    if (fields.length === 0) { setWarning("Select at least one field."); return; }

    // Pre-filter: drop cards that don't have all selected fields
    if (onlyWithFields && mode !== "manual") {
      ids = ids.filter(id => {
        const card = allCards[id] as Record<string, unknown> | undefined;
        return card ? cardHasAllFields(card, fields) : false;
      });
      if (ids.length === 0) {
        setWarning("No cards have all selected fields. Turn off the filter or pick different fields.");
        setIsRunning(false);
        return;
      }
    }
    setWarning(null);
    setIsRunning(true);
    setSelectedClusterId(null);

    let results: ClusterResult[];
    try {
      if (mode === "manual") {
        results = runManualCluster(ids, allCards as Record<string, unknown>, fields[0]!);
      } else if (mode === "combo") {
        results = runComboCluster(ids, allCards as Record<string, unknown>, fields, comboBins);
      } else {
        const ck = Math.max(1, Math.min(k, ids.length));
        results = runKMeans(ids, allCards as Record<string, unknown>, fields, ck);
      }
    } catch {
      setWarning("Clustering failed — try different fields.");
      setIsRunning(false);
      return;
    }

    // Assign colors: keep existing overrides, fill new clusters from palette
    const newColors = { ...appearance.clusterColors };
    results.forEach((r, i) => {
      if (!(r.clusterId in newColors)) {
        newColors[r.clusterId] = CLUSTER_COLORS[i % CLUSTER_COLORS.length]!;
      }
    });

    setAppearance(prev => ({ ...prev, clusterColors: newColors }));
    setClusterResults(results);
    setIsRunning(false);
  }, [selectedIds, fields, mode, k, allCards, appearance.clusterColors]);

  const handleFieldsChange = useCallback((newFields: string[]) => {
    setFields(newFields);
    // Auto-include any newly selected clustering field in the tooltip
    setAppearance(prev => ({
      ...prev,
      tooltipFields: Array.from(new Set([...prev.tooltipFields, ...newFields])),
    }));
  }, []);

  const handleAutoK = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0 || fields.length === 0) return;
    setK(autoK(ids, allCards as Record<string, unknown>, fields[0]!));
  }, [selectedIds, allCards, fields]);

  const handleClusterClick = useCallback((id: number) => {
    setSelectedClusterId(prev => (prev === id ? null : id));
  }, []);

  const selectedCluster = clusterResults?.find(r => r.clusterId === selectedClusterId) ?? null;
  const selectedClusterColor =
    selectedCluster
      ? (appearance.clusterColors[selectedCluster.clusterId] ??
         CLUSTER_COLORS[selectedCluster.clusterId % CLUSTER_COLORS.length] ?? "#6366f1")
      : "#6366f1";

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left panel */}
      <div className="flex w-80 shrink-0 flex-col border-r border-slate-800 overflow-y-auto">
        <CardClusterControls
          allCards={allCards as Record<string, unknown>}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          mode={mode}
          onModeChange={setMode}
          fields={fields}
          onFieldsChange={handleFieldsChange}
          comboBins={comboBins}
          onComboBinsChange={setComboBins}
          onlyWithFields={onlyWithFields}
          onOnlyWithFieldsChange={setOnlyWithFields}
          k={k}
          onKChange={setK}
          onAutoK={handleAutoK}
          onRun={handleRun}
          isRunning={isRunning}
          warning={warning}
        />
        <CardClusterAppearance
          appearance={appearance}
          onAppearanceChange={setAppearance}
          clusterResults={clusterResults}
        />
      </div>

      {/* Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {clusterResults ? (
          <CardClusterFlow
            clusterResults={clusterResults}
            allCards={allCards as Record<string, unknown>}
            appearance={appearance}
            fields={fields}
            selectedClusterId={selectedClusterId}
            onClusterClick={handleClusterClick}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-600">
            <Network className="h-10 w-10 opacity-30" strokeWidth={1.5} />
            <p className="text-sm">Select fields and click <strong className="text-slate-500">Run</strong></p>
          </div>
        )}
      </div>

      {/* Right detail panel — slides in when a cluster is selected */}
      {selectedCluster && (
        <CardClusterDetail
          cluster={selectedCluster}
          color={selectedClusterColor}
          allCards={allCards as Record<string, unknown>}
          fields={fields}
          appearance={appearance}
          onClose={() => setSelectedClusterId(null)}
        />
      )}
    </div>
  );
}
