import packageJson from '@/package.json';
import {
  decodePlannerWorkflowFromPersist,
  encodePlannerWorkflowForPersist,
  type PlannerWorkflowRuntime,
} from '@/app/utils/combatSaveCodec';

/** Discriminant for project files; bump `PROJECT_SAVE_VERSION` when breaking schema. */
export const PROJECT_FILE_FORMAT = 'sts-planner-project' as const;

/** Current on-disk / localStorage schema version for full project saves. */
export const PROJECT_SAVE_VERSION = 2;

/** localStorage key for last opened/saved project (full JSON blob). */
export const STS_LAST_PROJECT_STORAGE_KEY = 'sts_planner_last_project_v2';

export type ProjectMeta = {
  name: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  appVersion?: string;
  summary?: {
    turnCount: number;
    decisionNodeCount: number;
    character?: string;
  };
  lastActiveDecision?: {
    id: string;
    label: string;
  };
};

/** Planner workflow slice persisted in project files (matches historical export shape). */
export type PlannerWorkflowSaveShape = PlannerWorkflowRuntime;

type ProjectSaveFileOnDisk = {
  format: typeof PROJECT_FILE_FORMAT;
  version: number;
  projectMeta: ProjectMeta;
  planner: unknown;
};

export type ProjectSaveFileV1 = {
  format: typeof PROJECT_FILE_FORMAT;
  version: number;
  projectMeta: ProjectMeta;
  planner: PlannerWorkflowSaveShape;
};

function isoNow(): string {
  return new Date().toISOString();
}

export function newProjectMeta(name: string, createdAt?: string): ProjectMeta {
  const t = createdAt ?? isoNow();
  return {
    name: name.trim() || 'Untitled project',
    createdAt: t,
    updatedAt: isoNow(),
    appVersion:
      typeof packageJson.version === 'string' && packageJson.version.trim() !== ''
        ? packageJson.version
        : undefined,
  };
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/** Minimal validation: planner slice usable by GameContext hydrate. */
export function isPlannerWorkflowShape(val: unknown): val is PlannerWorkflowSaveShape {
  return decodePlannerWorkflowFromPersist(val) !== null;
}

/**
 * Normalize arbitrary JSON to ProjectSaveFileV1: full v1 wrapper or legacy planner-only export.
 */
export function normalizeToProjectV1(parsed: unknown, defaultName: string): ProjectSaveFileV1 | null {
  if (!isRecord(parsed)) return null;

  if (parsed.format === PROJECT_FILE_FORMAT && typeof parsed.version === 'number') {
    if (parsed.version !== PROJECT_SAVE_VERSION) {
      console.warn(`Project file version ${String(parsed.version)} may be incompatible (expected ${PROJECT_SAVE_VERSION}).`);
    }
    const meta = parsed.projectMeta;
    const planner = decodePlannerWorkflowFromPersist(parsed.planner);
    if (!isRecord(meta) || typeof meta.name !== 'string') return null;
    if (!planner) return null;
    const createdRaw = typeof meta.createdAt === 'string' ? meta.createdAt : isoNow();
    const projectMeta: ProjectMeta = {
      name: String(meta.name).trim() || defaultName,
      createdAt: createdRaw,
      updatedAt: typeof meta.updatedAt === 'string' ? meta.updatedAt : isoNow(),
      description: typeof meta.description === 'string' ? meta.description : undefined,
      appVersion: typeof meta.appVersion === 'string' ? meta.appVersion : undefined,
      summary:
        isRecord(meta.summary) &&
        typeof meta.summary.turnCount === 'number' &&
        typeof meta.summary.decisionNodeCount === 'number'
          ? {
              turnCount: meta.summary.turnCount,
              decisionNodeCount: meta.summary.decisionNodeCount,
              character: typeof meta.summary.character === 'string' ? meta.summary.character : undefined,
            }
          : undefined,
      lastActiveDecision:
        isRecord(meta.lastActiveDecision) &&
        typeof meta.lastActiveDecision.id === 'string' &&
        typeof meta.lastActiveDecision.label === 'string'
          ? {
              id: meta.lastActiveDecision.id,
              label: meta.lastActiveDecision.label,
            }
          : undefined,
    };
    return {
      format: PROJECT_FILE_FORMAT,
      version: PROJECT_SAVE_VERSION,
      projectMeta,
      planner,
    };
  }

  const legacyPlanner = decodePlannerWorkflowFromPersist(parsed);
  if (legacyPlanner) {
    const t = isoNow();
    return {
      format: PROJECT_FILE_FORMAT,
      version: PROJECT_SAVE_VERSION,
      projectMeta: {
        name: defaultName,
        createdAt: legacyPlanner.exportedAt ?? t,
        updatedAt: t,
      },
      planner: legacyPlanner,
    };
  }

  return null;
}

export function parseProjectJsonString(jsonString: string, defaultName: string): ProjectSaveFileV1 | null {
  try {
    const parsed: unknown = JSON.parse(jsonString);
    return normalizeToProjectV1(parsed, defaultName);
  } catch {
    return null;
  }
}

export function buildProjectSaveFileV1(
  planner: PlannerWorkflowSaveShape,
  meta: ProjectMeta,
): ProjectSaveFileOnDisk {
  return {
    format: PROJECT_FILE_FORMAT,
    version: PROJECT_SAVE_VERSION,
    projectMeta: { ...meta, updatedAt: isoNow() },
    planner: encodePlannerWorkflowForPersist({
      ...planner,
      exportedAt: isoNow(),
    }),
  };
}

export function projectToJsonString(project: ProjectSaveFileOnDisk, pretty = true): string {
  return pretty ? JSON.stringify(project, null, 2) : JSON.stringify(project);
}

export function saveLastProjectToLocalStorage(project: ProjectSaveFileOnDisk): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STS_LAST_PROJECT_STORAGE_KEY, JSON.stringify(project));
}

export function loadLastProjectFromLocalStorage(): ProjectSaveFileV1 | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STS_LAST_PROJECT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return normalizeToProjectV1(parsed, 'Restored project');
  } catch {
    return null;
  }
}

export function normalizePlannerWorkflowSave(parsed: unknown): PlannerWorkflowSaveShape | null {
  return decodePlannerWorkflowFromPersist(parsed);
}

export function clearLastProjectFromLocalStorage(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STS_LAST_PROJECT_STORAGE_KEY);
}
