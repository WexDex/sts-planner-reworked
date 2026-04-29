/**
 * Sets `canAddCards` on each card from description text:
 * - add … into/to hand / discard / draw pile
 * - put … into your hand (from discard, exhaust, draw, etc.)
 * - put a copy of this card on top of your draw pile (Pride)
 * - shuffle … into draw/discard except pile recycle / reboot / Tantrum self-shuffle
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../app/data/STS_CARDS_DB.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const cards = db.cards;

/** @param {Record<string, unknown>} o */
function shouldCanAddCards(o) {
  const d = `${o.description ?? ""} ${o.descriptionUpgraded ?? ""}`;

  if (/shuffle your discard pile into your draw pile/i.test(d)) return false;
  if (/shuffle all your cards into your draw pile/i.test(d)) return false;
  if (/shuffle this card into your draw pile/i.test(d)) return false;

  if (/\badd\b/i.test(d)) {
    if (
      /into your hand|to your hand|into your discard pile|into your draw pile/i.test(
        d,
      )
    ) {
      return true;
    }
  }

  if (/put\b[\s\S]{0,180}?into your hand/i.test(d)) return true;

  if (/put a copy of this card on top of your draw pile/i.test(d)) return true;

  if (/\bshuffle\b/i.test(d)) {
    if (/into your draw pile|into your discard pile/i.test(d)) return true;
  }

  return false;
}

let setTrue = 0;
let cleared = 0;

for (const [_name, o] of Object.entries(cards)) {
  const want = shouldCanAddCards(o);
  const has = o.canAddCards === true;

  if (want && !has) setTrue++;
  if (!want && has) cleared++;

  if (want) o.canAddCards = true;
  else delete o.canAddCards;
}

if (db._meta?.galleryFieldGuide && typeof db._meta.galleryFieldGuide === "object") {
  db._meta.galleryFieldGuide.canAddCards =
    "Boolean — true when the card adds or inserts cards (hand / draw pile / discard): \"Add …\", \"Put … into your hand\", token shuffle into pile; false for recycle-only shuffles (Deep Breath, Reboot), self-shuffle (Tantrum), or reorder-only moves.";
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + "\n", "utf8");

console.log(JSON.stringify({ setTrueNew: setTrue, clearedWrong: cleared }, null, 2));
