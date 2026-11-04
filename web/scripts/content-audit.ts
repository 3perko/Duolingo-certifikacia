/**
 * Content audit (section 11): what we have, what is unreviewed, and what was
 * written against an older version of the official documentation.
 *
 *   npm run content:audit                      summary per track and domain
 *   npm run content:audit -- --stale 2026-10   items whose docVersion is older
 *   npm run content:audit -- --export out.json export all items (for the pipeline's --existing)
 */
import { writeFileSync } from "node:fs";
import { ITEMS, TRACKS } from "../src/content";

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const exportPath = arg("--export");
if (exportPath) {
  writeFileSync(exportPath, JSON.stringify(ITEMS, null, 2));
  console.log(`Exported ${ITEMS.length} items to ${exportPath}`);
  process.exit(0);
}

for (const track of TRACKS) {
  console.log(`\n${track.name}${track.preliminary ? "  (preliminary curriculum)" : ""}`);
  for (const d of track.domains) {
    const items = ITEMS.filter((i) => i.domain === d.id);
    const kinds = items.reduce<Record<string, number>>((a, i) => ((a[i.kind] = (a[i.kind] ?? 0) + 1), a), {});
    const unreviewed = items.filter((i) => !i.meta?.reviewed).length;
    console.log(`  ${d.id.padEnd(18)} ${String(d.weight).padStart(3)} %  items ${String(items.length).padStart(3)}  ${JSON.stringify(kinds)}  unreviewed ${unreviewed}`);
  }
}

const stale = arg("--stale");
if (stale) {
  const old = ITEMS.filter((i) => (i.meta?.docVersion ?? "") < stale);
  console.log(`\n${old.length} item(s) written against documentation older than ${stale}:`);
  for (const i of old) console.log(`  ${i.id}  ${i.domain}  ${i.meta?.docVersion}  ${i.meta?.source}`);
}

const total = ITEMS.length;
const reviewed = ITEMS.filter((i) => i.meta?.reviewed).length;
console.log(`\nTotal ${total} items, ${reviewed} reviewed, ${total - reviewed} awaiting expert review.`);
