export type ClusterMode = "manual" | "combo" | "kmeans";
export type NodeShape = "circle" | "square" | "diamond";

export type ClusterFieldDef = {
  key: string;
  label: string;
  kind: "categorical" | "numeric" | "boolean";
};

export type ClusterResult = {
  clusterId: number;
  label: string;
  cardIds: string[];
  centroid?: number[];
};

export type AppearanceConfig = {
  // Node
  nodeSize: number;
  nodeShape: NodeShape;
  nodeBorderWidth: number;
  nodeOpacity: number;
  showNodeLabel: boolean;
  // Cluster background
  clusterBgOpacity: number;
  showClusterBorder: boolean;
  clusterBorderWidth: number;
  // Cluster label
  showClusterLabel: boolean;
  clusterLabelSize: number;
  clusterLabelColor: string;
  // Layout spacing
  nodeSpacing: number;
  clusterSpacing: number;
  clusterPadding: number;
  // Canvas
  canvasBg: string;
  // Tooltip
  tooltipFields: string[];
  tooltipMaxWidth: number;
  // Per-cluster color overrides (keyed by clusterId)
  clusterColors: Record<number, string>;
};
