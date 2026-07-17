/**
 * Smoke: no runtime JS/Vue imports from .seed (E6-S6).
 * Run: node src/workflow-dag/contentAudit.smoke.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const roots = [
  join(root, "src", "workflow-dag"),
  join(root, "src", "js"),
  join(root, "apps", "nice-dag"),
];

const IMPORT_RE =
  /(?:import\s+[^;]*?from\s+|require\s*\()\s*['"]([^'"]+\.seed[^'"]*|[^'"]*\/\.seed\/[^'"]*)['"]/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "lib") continue;
      walk(p, out);
    } else if (/\.(js|mjs|cjs|vue|ts)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

const offenders = [];
for (const base of roots) {
  for (const file of walk(base)) {
    const text = readFileSync(file, "utf8");
    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(text))) {
      offenders.push(`${relative(root, file)}: ${m[1]}`);
    }
  }
}

if (offenders.length) {
  console.error("CONTENT_AUDIT_FAIL runtime .seed imports:\n" + offenders.join("\n"));
  process.exit(1);
}
console.log("CONTENT_AUDIT_OK no runtime .seed imports");
