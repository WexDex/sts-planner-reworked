// ─── ID generation ────────────────────────────────────────────────────────────
export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Filter expression types ──────────────────────────────────────────────────
export type FilterOp =
  | "eq" | "neq"
  | "gt" | "gte" | "lt" | "lte"
  | "contains" | "notContains"
  | "isTrue" | "isFalse"
  | "exists" | "notExists";

export type FilterCondition = {
  kind: "condition";
  id: string;
  field: string;
  op: FilterOp;
  value: string | number | boolean;
};

export type FilterGroup = {
  kind: "group";
  id: string;
  logic: "AND" | "OR";
  children: FilterNode[];
};

export type FilterNode = FilterCondition | FilterGroup;

export type SavedFilter = {
  id: string;
  name: string;
  expr: FilterGroup;
  active: boolean;
};

// ─── Sort types ───────────────────────────────────────────────────────────────
export type SortField = "name" | "character" | "type" | "cost" | "rarity";
export type SortDir   = "asc" | "desc";

// ─── Advanced filter definitions ─────────────────────────────────────────────
export type AdvancedFilterGroup = "Mechanics" | "Scales" | "Has" | "Card Actions";
export type AdvancedFilterType  = "boolean" | "exists" | "custom";

export type AdvancedFilterDef = {
  key: string;
  label: string;
  group: AdvancedFilterGroup;
  filterType: AdvancedFilterType;
};

export const ADV_FILTER_DEFS: AdvancedFilterDef[] = [
  // ── Mechanics ───────────────────────────────────────────────────────────────
  { key: "innate",                label: "Innate",            group: "Mechanics",    filterType: "boolean" },
  { key: "ethereal",              label: "Ethereal",          group: "Mechanics",    filterType: "boolean" },
  { key: "retain",                label: "Retain",            group: "Mechanics",    filterType: "boolean" },
  { key: "selfExhaustOnPlay",     label: "Exhaust (self)",    group: "Mechanics",    filterType: "boolean" },
  { key: "xCost",                 label: "X-Cost",            group: "Mechanics",    filterType: "boolean" },
  { key: "unplayable",            label: "Unplayable",        group: "Mechanics",    filterType: "boolean" },
  { key: "costManipulation",      label: "Cost Manip.",       group: "Mechanics",    filterType: "boolean" },
  { key: "cannotBeRemoved",       label: "Cannot Remove",     group: "Mechanics",    filterType: "boolean" },
  { key: "conditioned",           label: "Conditioned",       group: "Mechanics",    filterType: "custom"  },
  { key: "aoe",                   label: "AoE",               group: "Mechanics",    filterType: "custom"  },
  { key: "random",                label: "Random",            group: "Mechanics",    filterType: "custom"  },
  // ── Scales ──────────────────────────────────────────────────────────────────
  { key: "scalesWithStrength",    label: "Scales w/ Str",     group: "Scales",       filterType: "boolean" },
  { key: "scalesWithDexterity",   label: "Scales w/ Dex",     group: "Scales",       filterType: "boolean" },
  { key: "scalesWithMantraTotal", label: "Scales w/ Mantra",  group: "Scales",       filterType: "boolean" },
  { key: "is_claw",               label: "Is Claw",           group: "Scales",       filterType: "boolean" },
  // ── Has (presence) ──────────────────────────────────────────────────────────
  { key: "damage",                label: "Damage",            group: "Has",          filterType: "exists"  },
  { key: "block",                 label: "Block",             group: "Has",          filterType: "exists"  },
  { key: "draw",                  label: "Draw",              group: "Has",          filterType: "exists"  },
  { key: "scry",                  label: "Scry",              group: "Has",          filterType: "exists"  },
  { key: "heal",                  label: "Heal",              group: "Has",          filterType: "exists"  },
  { key: "hpcost",                label: "HP Cost",           group: "Has",          filterType: "exists"  },
  { key: "gainEnergy",            label: "Energy Gain",       group: "Has",          filterType: "exists"  },
  { key: "focus",                 label: "Focus",             group: "Has",          filterType: "exists"  },
  { key: "mantra",                label: "Mantra",            group: "Has",          filterType: "exists"  },
  { key: "multiHit",              label: "Multi-Hit",         group: "Has",          filterType: "exists"  },
  { key: "orbInteractions",       label: "Orb Interaction",   group: "Has",          filterType: "exists"  },
  { key: "change_stance",         label: "Stance Change",     group: "Has",          filterType: "exists"  },
  { key: "discardEffect",         label: "Discard Effect",    group: "Has",          filterType: "exists"  },
  { key: "appliesDebuffs",        label: "Applies Debuffs",   group: "Has",          filterType: "exists"  },
  { key: "vulnerable",            label: "Applies Vuln.",     group: "Has",          filterType: "exists"  },
  { key: "strength_gain",         label: "Str Gain",          group: "Has",          filterType: "exists"  },
  { key: "dexterity_gain",        label: "Dex Gain",          group: "Has",          filterType: "exists"  },
  // ── Card Actions ────────────────────────────────────────────────────────────
  { key: "canAddCards",           label: "Adds Cards",        group: "Card Actions", filterType: "boolean" },
  { key: "canExhaustCards",       label: "Exhausts Cards",    group: "Card Actions", filterType: "boolean" },
  { key: "canDoublePlayCards",    label: "Double Play",       group: "Card Actions", filterType: "boolean" },
  { key: "canUpgradeCards",       label: "Upgrades Cards",    group: "Card Actions", filterType: "boolean" },
  { key: "canAddPotions",         label: "Adds Potions",      group: "Card Actions", filterType: "boolean" },
];

export const ADV_FILTER_MAP = new Map<string, AdvancedFilterDef>(
  ADV_FILTER_DEFS.map(d => [d.key, d]),
);

// ─── Field definitions (for filter builder UI) ────────────────────────────────
export type FieldType = "string" | "number" | "boolean" | "enum";

export type FilterFieldDef = {
  key: string;
  label: string;
  type: FieldType;
  group: string;
  values?: string[];
};

export const FILTER_FIELD_DEFS: FilterFieldDef[] = [
  { key: "name",               label: "Name",             type: "string",  group: "Basic" },
  { key: "description",        label: "Description",      type: "string",  group: "Basic" },
  { key: "type",               label: "Type",             type: "enum",    group: "Basic",    values: ["Attack","Skill","Power","Curse","Status","Potion"] },
  { key: "rarity",             label: "Rarity",           type: "enum",    group: "Basic",    values: ["Common","Uncommon","Rare","Special"] },
  { key: "characters",         label: "Character",        type: "enum",    group: "Basic",    values: ["ironclad","silent","defect","watcher","colorless"] },
  { key: "cost",               label: "Cost",             type: "number",  group: "Stats" },
  { key: "damage",             label: "Damage",           type: "number",  group: "Stats" },
  { key: "block",              label: "Block",            type: "number",  group: "Stats" },
  { key: "draw",               label: "Draw",             type: "number",  group: "Stats" },
  { key: "scry",               label: "Scry",             type: "number",  group: "Stats" },
  { key: "heal",               label: "Heal",             type: "number",  group: "Stats" },
  { key: "energyGain",         label: "Energy Gain",      type: "number",  group: "Stats" },
  { key: "focus",              label: "Focus",            type: "number",  group: "Stats" },
  { key: "mantra",             label: "Mantra",           type: "number",  group: "Stats" },
  { key: "hitCount",           label: "Hit Count",        type: "number",  group: "Stats" },
  { key: "hpcost",             label: "HP Cost",          type: "number",  group: "Stats" },
  { key: "takeDamage",         label: "Take Damage",      type: "number",  group: "Stats" },
  { key: "innate",             label: "Innate",           type: "boolean", group: "Keywords" },
  { key: "ethereal",           label: "Ethereal",         type: "boolean", group: "Keywords" },
  { key: "retain",             label: "Retain",           type: "boolean", group: "Keywords" },
  { key: "selfExhaustOnPlay",  label: "Exhaust (self)",   type: "boolean", group: "Keywords" },
  { key: "xCost",              label: "X-Cost",           type: "boolean", group: "Keywords" },
  { key: "scalesWithStrength", label: "Scales w/ Str",    type: "boolean", group: "Keywords" },
  { key: "scalesWithDexterity",label: "Scales w/ Dex",    type: "boolean", group: "Keywords" },
];

export const FILTER_FIELD_MAP = new Map<string, FilterFieldDef>(
  FILTER_FIELD_DEFS.map(f => [f.key, f])
);

export const FILTER_OPS_FOR_TYPE: Record<FieldType, { op: FilterOp; label: string }[]> = {
  string: [
    { op: "contains",    label: "contains" },
    { op: "notContains", label: "doesn't contain" },
    { op: "eq",          label: "is exactly" },
    { op: "neq",         label: "is not" },
    { op: "exists",      label: "exists" },
    { op: "notExists",   label: "doesn't exist" },
  ],
  number: [
    { op: "gte", label: "≥" },
    { op: "lte", label: "≤" },
    { op: "eq",  label: "=" },
    { op: "neq", label: "≠" },
    { op: "gt",  label: ">" },
    { op: "lt",  label: "<" },
    { op: "exists",    label: "exists" },
    { op: "notExists", label: "doesn't exist" },
  ],
  boolean: [
    { op: "isTrue",  label: "is true" },
    { op: "isFalse", label: "is false" },
    { op: "exists",  label: "exists" },
  ],
  enum: [
    { op: "eq",        label: "is" },
    { op: "neq",       label: "is not" },
    { op: "exists",    label: "exists" },
    { op: "notExists", label: "doesn't exist" },
  ],
};

// ─── Value resolution helpers ─────────────────────────────────────────────────
export function resolveBaseNumber(rec: Record<string, unknown>, field: string): number | undefined {
  const val = rec[field];
  if (typeof val === "number") return val;
  if (val != null && typeof val === "object" && !Array.isArray(val)) {
    const o = val as Record<string, unknown>;
    if (typeof o.base === "number") return o.base;
  }
  return undefined;
}

export function resolveBaseBool(rec: Record<string, unknown>, field: string): boolean {
  const val = rec[field];
  if (typeof val === "boolean") return val;
  if (val != null && typeof val === "object" && !Array.isArray(val)) {
    const o = val as Record<string, unknown>;
    if (typeof o.base === "boolean") return o.base;
  }
  return Boolean(val);
}

export function resolveBaseCostBucket(rec: Record<string, unknown>): string {
  if (rec.xCost === true) return "X";
  const n = resolveBaseNumber(rec, "cost");
  if (n == null) return "?";
  if (n <= 0) return "0";
  if (n === 1) return "1";
  if (n === 2) return "2";
  return "3+";
}

// ─── DB range computation ─────────────────────────────────────────────────────
export type DbFieldRanges = Record<string, { min: number; max: number; label: string }>;

const NUMERIC_RANGE_FIELDS: { key: string; label: string }[] = [
  { key: "damage",         label: "Damage" },
  { key: "block",          label: "Block" },
  { key: "draw",           label: "Draw" },
  { key: "cost",           label: "Cost" },
  { key: "takeDamage",     label: "Take Dmg" },
  { key: "energyGain",     label: "Energy Gain" },
  { key: "heal",           label: "Heal" },
  { key: "focus",          label: "Focus" },
  { key: "mantra",         label: "Mantra" },
  { key: "scry",           label: "Scry" },
  { key: "hpcost",         label: "HP Cost" },
  { key: "artifact",       label: "Artifact" },
  { key: "buffer",         label: "Buffer" },
  { key: "hitCount",       label: "Hit Count" },
  { key: "strength_gain",  label: "Str Gain" },
  { key: "dexterity_gain", label: "Dex Gain" },
  { key: "plated_armor",   label: "Plated Armor" },
  { key: "shiv_dmg",       label: "Shiv Dmg" },
  { key: "bonusDamage",    label: "Bonus Dmg" },
];

export function computeDbFieldRanges(records: Record<string, Record<string, unknown>>): DbFieldRanges {
  const result: DbFieldRanges = {};
  for (const rec of Object.values(records)) {
    for (const { key, label } of NUMERIC_RANGE_FIELDS) {
      const v = resolveBaseNumber(rec, key);
      if (v == null) continue;
      if (!result[key]) {
        result[key] = { min: v, max: v, label };
      } else {
        if (v < result[key].min) result[key].min = v;
        if (v > result[key].max) result[key].max = v;
      }
    }
  }
  return result;
}

// ─── Filter state types ───────────────────────────────────────────────────────
export type RangeFilters = Partial<Record<string, { min?: number; max?: number }>>;

/** Dynamic: keys match ADV_FILTER_DEFS[].key, values are true when that filter is active. */
export type AdvancedFilters = Record<string, boolean>;

export type GalleryFilterState = {
  search: string;
  selChars: string[];
  selTypes: string[];
  selRarities: string[];
  selCosts: string[];
  selGlyphs: string[];
  showPotions: boolean;
  selPotionTags: string[];
  advFilters: AdvancedFilters;
  rangeFilters: RangeFilters;
  savedFilters: SavedFilter[];
};

// ─── Sort helpers ─────────────────────────────────────────────────────────────
const CHARACTER_ORDER = ["ironclad", "silent", "defect", "watcher", "colorless"];
const TYPE_ORDER      = ["Attack", "Skill", "Power", "Curse", "Status", "Potion"];
const RARITY_ORDER    = ["Common", "Uncommon", "Rare", "Special"];

function sortIndex(order: string[], val: unknown): number {
  const i = order.indexOf(String(val ?? ""));
  return i === -1 ? 999 : i;
}

// ─── applyGalleryFilters ──────────────────────────────────────────────────────
export function applyGalleryFilters(
  ids: string[],
  records: Record<string, Record<string, unknown>>,
  state: GalleryFilterState,
  pinnedIds: Set<string>,
  ignoredIds: Set<string>,
  sortBy: SortField = "name",
  sortDir: SortDir  = "asc",
): string[] {
  const {
    search, selChars, selTypes, selRarities, selCosts, selGlyphs,
    showPotions, selPotionTags, advFilters, rangeFilters, savedFilters,
  } = state;
  const q = search.trim().toLowerCase();
  const activeSaved = savedFilters.filter(f => f.active);

  const passing = ids.filter(id => {
    if (ignoredIds.has(id)) return false;
    const rec = records[id];
    if (!rec) return false;

    const isPotion = rec.type === "Potion";
    if (isPotion && !showPotions) return false;
    if (isPotion && showPotions && selPotionTags.length > 0) {
      const tags = rec.potionTags as string[] | undefined;
      if (!tags || !selPotionTags.some(t => tags.includes(t))) return false;
    }

    if (selChars.length > 0) {
      const ch = typeof rec.characters === "string" ? rec.characters.toLowerCase() : "";
      if (!selChars.includes(ch)) return false;
    }

    if (selTypes.length > 0) {
      if (!selTypes.includes(rec.type as string)) return false;
    }

    if (selRarities.length > 0) {
      if (!selRarities.includes(rec.rarity as string)) return false;
    }

    if (selCosts.length > 0) {
      if (!selCosts.includes(resolveBaseCostBucket(rec))) return false;
    }

    for (const field of selGlyphs) {
      if (!resolveBaseBool(rec, field)) return false;
    }

    for (const [key, active] of Object.entries(advFilters)) {
      if (!active) continue;
      const def = ADV_FILTER_MAP.get(key);
      if (!def) continue;
      if (def.filterType === "boolean") {
        if (!resolveBaseBool(rec, key)) return false;
      } else if (def.filterType === "exists") {
        if (rec[key] == null) return false;
      } else if (def.filterType === "custom") {
        if (key === "conditioned") {
          const dmg = rec.damage as Record<string, unknown> | undefined;
          const drw = rec.draw as Record<string, unknown> | undefined;
          if (!dmg?.conditioned && !drw?.conditioned) return false;
        } else if (key === "aoe") {
          const dmg = rec.damage as Record<string, unknown> | undefined;
          if (dmg?.target !== "all enemies") return false;
        } else if (key === "random") {
          // True if any direct field value is an object containing random: true
          const hasRandom = Object.values(rec).some(v => {
            if (!v || typeof v !== "object" || Array.isArray(v)) return false;
            const obj = v as Record<string, unknown>;
            if (obj.random === true) return true;
            // one level deeper (e.g. appliesDebuffs.poison.random)
            return Object.values(obj).some(sub =>
              sub != null && typeof sub === "object" && !Array.isArray(sub) &&
              (sub as Record<string, unknown>).random === true,
            );
          });
          if (!hasRandom) return false;
        }
      }
    }

    if (q) {
      const nameMatch = id.toLowerCase().includes(q);
      const descMatch = typeof rec.description === "string" && rec.description.toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }

    for (const [field, range] of Object.entries(rangeFilters)) {
      if (!range) continue;
      const { min, max } = range;
      if (min == null && max == null) continue;
      const v = resolveBaseNumber(rec, field);
      if (v == null) return false;
      if (min != null && v < min) return false;
      if (max != null && v > max) return false;
    }

    for (const sf of activeSaved) {
      if (!evaluateFilterExpr(rec, id, sf.expr)) return false;
    }

    return true;
  });

  const dir = sortDir === "asc" ? 1 : -1;
  return passing.sort((a, b) => {
    // Pinned always first regardless of sort
    const ap = pinnedIds.has(a);
    const bp = pinnedIds.has(b);
    if (ap && !bp) return -1;
    if (!ap && bp) return 1;

    const recA = records[a];
    const recB = records[b];
    const nameCmp = a.localeCompare(b, undefined, { sensitivity: "base" });

    switch (sortBy) {
      case "character": {
        const d = (sortIndex(CHARACTER_ORDER, (recA?.characters as string ?? "").toLowerCase())
                 - sortIndex(CHARACTER_ORDER, (recB?.characters as string ?? "").toLowerCase())) * dir;
        return d !== 0 ? d : nameCmp;
      }
      case "type": {
        const d = (sortIndex(TYPE_ORDER, recA?.type) - sortIndex(TYPE_ORDER, recB?.type)) * dir;
        return d !== 0 ? d : nameCmp;
      }
      case "cost": {
        const costVal = (rec: Record<string, unknown> | undefined) => {
          if (!rec) return 999;
          if (rec.xCost) return -1;
          return resolveBaseNumber(rec, "cost") ?? 999;
        };
        const d = (costVal(recA) - costVal(recB)) * dir;
        return d !== 0 ? d : nameCmp;
      }
      case "rarity": {
        const d = (sortIndex(RARITY_ORDER, recA?.rarity) - sortIndex(RARITY_ORDER, recB?.rarity)) * dir;
        return d !== 0 ? d : nameCmp;
      }
      default: // "name"
        return nameCmp * dir;
    }
  });
}

// ─── Expression evaluator ─────────────────────────────────────────────────────
export function evaluateFilterExpr(
  rec: Record<string, unknown>,
  id: string,
  node: FilterNode,
): boolean {
  if (node.kind === "group") {
    if (node.children.length === 0) return true;
    const results = node.children.map(c => evaluateFilterExpr(rec, id, c));
    return node.logic === "AND" ? results.every(Boolean) : results.some(Boolean);
  }
  return evaluateCondition(rec, id, node);
}

function resolveFieldRaw(rec: Record<string, unknown>, id: string, field: string): unknown {
  if (field === "name") return id;
  const def = FILTER_FIELD_MAP.get(field);
  if (def?.type === "number") return resolveBaseNumber(rec, field);
  if (def?.type === "boolean") return resolveBaseBool(rec, field);
  return rec[field];
}

function evaluateCondition(
  rec: Record<string, unknown>,
  id: string,
  cond: FilterCondition,
): boolean {
  const { op, field, value } = cond;

  if (op === "exists")    return rec[field] != null;
  if (op === "notExists") return rec[field] == null;
  if (op === "isTrue")    return resolveBaseBool(rec, field);
  if (op === "isFalse")   return !resolveBaseBool(rec, field);

  const raw = resolveFieldRaw(rec, id, field);

  if (typeof raw === "number" && typeof value === "number") {
    if (op === "eq")  return raw === value;
    if (op === "neq") return raw !== value;
    if (op === "gt")  return raw > value;
    if (op === "gte") return raw >= value;
    if (op === "lt")  return raw < value;
    if (op === "lte") return raw <= value;
  }

  const sRaw = raw == null ? "" : String(raw).toLowerCase();
  const sVal = String(value ?? "").toLowerCase();

  if (op === "eq")          return sRaw === sVal;
  if (op === "neq")         return sRaw !== sVal;
  if (op === "contains")    return sRaw.includes(sVal);
  if (op === "notContains") return !sRaw.includes(sVal);

  const nRaw = parseFloat(sRaw);
  const nVal = parseFloat(sVal);
  if (!isNaN(nRaw) && !isNaN(nVal)) {
    if (op === "gt")  return nRaw > nVal;
    if (op === "gte") return nRaw >= nVal;
    if (op === "lt")  return nRaw < nVal;
    if (op === "lte") return nRaw <= nVal;
  }

  return false;
}

// ─── Tree blank constructors ──────────────────────────────────────────────────
export function makeBlankCondition(field = "type"): FilterCondition {
  const def = FILTER_FIELD_MAP.get(field);
  const defaultOp: FilterOp =
    def?.type === "boolean" ? "isTrue" :
    def?.type === "number"  ? "gte" :
    def?.type === "enum"    ? "eq" : "contains";
  const defaultValue: string | number | boolean =
    def?.type === "number" ? 1 :
    def?.type === "boolean" ? true :
    (def?.values?.[0] ?? "");
  return { kind: "condition", id: genId(), field, op: defaultOp, value: defaultValue };
}

export function makeBlankGroup(logic: "AND" | "OR" = "AND"): FilterGroup {
  return { kind: "group", id: genId(), logic, children: [makeBlankCondition()] };
}

// ─── Tree mutation helpers ────────────────────────────────────────────────────
export function treeAddCondition(tree: FilterGroup, groupId: string): FilterGroup {
  if (tree.id === groupId) {
    return { ...tree, children: [...tree.children, makeBlankCondition()] };
  }
  return { ...tree, children: tree.children.map(c => c.kind === "group" ? treeAddCondition(c, groupId) : c) };
}

export function treeAddGroup(tree: FilterGroup, parentId: string): FilterGroup {
  const newGroup = makeBlankGroup(tree.logic === "AND" ? "OR" : "AND");
  if (tree.id === parentId) {
    return { ...tree, children: [...tree.children, newGroup] };
  }
  return { ...tree, children: tree.children.map(c => c.kind === "group" ? treeAddGroup(c, parentId) : c) };
}

export function treeRemoveNode(tree: FilterGroup, nodeId: string): FilterGroup {
  return {
    ...tree,
    children: tree.children
      .filter(c => c.id !== nodeId)
      .map(c => c.kind === "group" ? treeRemoveNode(c, nodeId) : c),
  };
}

export function treeUpdateCondition(
  tree: FilterGroup,
  condId: string,
  patch: Partial<Pick<FilterCondition, "field" | "op" | "value">>,
): FilterGroup {
  return {
    ...tree,
    children: tree.children.map(c => {
      if (c.kind === "condition" && c.id === condId) return { ...c, ...patch };
      if (c.kind === "group") return treeUpdateCondition(c, condId, patch);
      return c;
    }),
  };
}

export function treeToggleLogic(tree: FilterGroup, groupId: string): FilterGroup {
  if (tree.id === groupId) return { ...tree, logic: tree.logic === "AND" ? "OR" : "AND" };
  return { ...tree, children: tree.children.map(c => c.kind === "group" ? treeToggleLogic(c, groupId) : c) };
}

function treeFindNode(tree: FilterGroup, nodeId: string): FilterNode | null {
  if (tree.id === nodeId) return tree;
  for (const c of tree.children) {
    if (c.id === nodeId) return c;
    if (c.kind === "group") {
      const found = treeFindNode(c, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function treeAddNodeTo(tree: FilterGroup, groupId: string, node: FilterNode): FilterGroup {
  if (tree.id === groupId) return { ...tree, children: [...tree.children, node] };
  return { ...tree, children: tree.children.map(c => c.kind === "group" ? treeAddNodeTo(c, groupId, node) : c) };
}

export function treeMoveNode(tree: FilterGroup, nodeId: string, targetGroupId: string): FilterGroup {
  if (nodeId === targetGroupId) return tree;
  const node = treeFindNode(tree, nodeId);
  if (!node) return tree;
  const without = treeRemoveNode(tree, nodeId);
  return treeAddNodeTo(without, targetGroupId, node);
}
