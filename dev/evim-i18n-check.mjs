// Checks that every et("…") text in src/ has an English line in src/lang/evim_en.js and that placeholders match.
// Run with `npm run i18n:check` (also in CI). Exit code 1 when something is missing.
import { readdirSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const dict = (await import(pathToFileURL("src/lang/evim_en.js").href)).default;
const used = new Map();   // key → first file that uses it
for (const f of readdirSync("src").filter(f => f.endsWith(".js") && f !== "i18n.js"))
  for (const m of readFileSync(`src/${f}`, "utf8").matchAll(/\bet\("((?:[^"\\]|\\.)+)"/g)) if (!used.has(m[1])) used.set(m[1], f);

const holes = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(",");
const missing = [...used].filter(([k]) => !(k in dict));
const badHoles = [...used].filter(([k]) => k in dict && holes(k) !== holes(dict[k]));

console.log(`evim_en: ${used.size} texts used, ${missing.length} missing, ${badHoles.length} placeholder mismatches`);
for (const [k, f] of missing) console.log(`  missing (${f}): ${JSON.stringify(k)}`);
for (const [k, f] of badHoles) console.log(`  placeholders differ (${f}): ${JSON.stringify(k)}`);
if (missing.length || badHoles.length) process.exit(1);
