/**
 * generate-card-actions.mjs
 *
 * Parses STS_CARDS_DB.json and writes auto-derived quick actions into
 * custom_card_actions.json. Run with:
 *
 *   node scripts/generate-card-actions.mjs
 *
 * Fields handled:
 *   block, draw, gainEnergy, heal, focus, mantra  → numeric value actions
 *   selfExhaustOnPlay, ethereal                   → move_to_pile exhaust (boolean)
 *
 * Existing entries are preserved. Auto entries are only added when no entry
 * with the same (actionType + buffName + pile) already exists for that card.
 * The "__global__" key is never touched.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const DB_PATH     = join(root, "app/data/db/STS_CARDS_DB.json");
const TARGET_PATH = join(root, "app/data/custom_card_actions.json");

const db      = JSON.parse(readFileSync(DB_PATH, "utf-8"));
const current = JSON.parse(readFileSync(TARGET_PATH, "utf-8"));

/** Resolve a ValueNode to its base number (> 0), or null. */
function baseNum(node) {
  if (node == null) return null;
  const v = typeof node === "number" ? node : (node.base ?? null);
  return typeof v === "number" && v > 0 ? v : null;
}

/** Resolve a boolean ValueNode — true when base tier is truthy. */
function baseBool(node) {
  if (node == null || node === false) return false;
  if (node === true) return true;
  return Boolean(node.base);
}

/** True when a matching entry (actionType + optional buffName + optional pile) already exists. */
function hasAction(list, actionType, buffName, pile) {
  return list.some(
    (a) =>
      a.actionType === actionType &&
      (buffName == null || a.buffName === buffName) &&
      (pile    == null || a.pile    === pile),
  );
}

const cards = db.cards ?? {};
let added = 0;
let touched = 0;

for (const [id, card] of Object.entries(cards)) {
  const derived = [];

  // ── Numeric fields ────────────────────────────────────────────────────────
  const blockVal  = baseNum(card.block);
  const drawVal   = baseNum(card.draw);
  const energyVal = baseNum(card.gainEnergy);
  const healVal   = baseNum(card.heal);
  const focusVal  = baseNum(card.focus);
  const mantraVal = baseNum(card.mantra);

  if (blockVal  !== null) derived.push({ label: "Add Block",   actionType: "modify_block",  hasInput: true, defaultValue: blockVal });
  if (drawVal   !== null) derived.push({ label: "Draw Cards",  actionType: "draw_cards",    hasInput: true, defaultValue: drawVal });
  if (energyVal !== null) derived.push({ label: "Gain Energy", actionType: "modify_energy", hasInput: true, defaultValue: energyVal });
  if (healVal   !== null) derived.push({ label: "Heal",        actionType: "modify_hp",     hasInput: true, defaultValue: healVal });
  if (focusVal  !== null) derived.push({ label: "Gain Focus",  actionType: "give_buff",  buffName: "Focus",  buffType: "buff", hasInput: true, defaultValue: focusVal });
  if (mantraVal !== null) derived.push({ label: "Gain Mantra", actionType: "give_buff",  buffName: "Mantra", buffType: "buff", hasInput: true, defaultValue: mantraVal });

  // ── Boolean fields (exhaust pile actions) ─────────────────────────────────
  if (baseBool(card.selfExhaustOnPlay)) {
    derived.push({ label: "Self Exhaust", actionType: "move_to_pile", pile: "exhaust", hasInput: false });
  }
  if (baseBool(card.ethereal)) {
    derived.push({ label: "Ethereal",     actionType: "move_to_pile", pile: "exhaust", hasInput: false });
  }

  if (derived.length === 0) continue;

  const existing = current[id] ?? [];
  const toAdd = derived.filter(
    (d) => !hasAction(existing, d.actionType, d.buffName ?? null, d.pile ?? null),
  );

  if (toAdd.length === 0) continue;

  current[id] = [...existing, ...toAdd];
  added += toAdd.length;
  touched++;
}

// Sort keys: __global__ first, then alphabetical
const sorted = {};
if (current["__global__"]) sorted["__global__"] = current["__global__"];
for (const key of Object.keys(current).filter((k) => k !== "__global__").sort()) {
  sorted[key] = current[key];
}

writeFileSync(TARGET_PATH, JSON.stringify(sorted, null, 2), "utf-8");
console.log(`Done. Added ${added} actions across ${touched} cards.`);
console.log(`Total cards with config: ${Object.keys(sorted).filter((k) => k !== "__global__").length}`);
