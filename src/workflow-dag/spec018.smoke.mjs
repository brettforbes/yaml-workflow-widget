/**
 * SPEC-018 Epic C smoke bundle (R18-14).
 * Run: node src/workflow-dag/spec018.smoke.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scripts = [
  "components/mapper.smoke.mjs",
  "components/stepStatus.smoke.mjs",
  "hostStepStatuses.smoke.mjs",
];

for (const rel of scripts) {
  const script = path.join(__dirname, rel);
  const r = spawnSync(process.execPath, [script], {
    stdio: "inherit",
    cwd: __dirname,
  });
  if (r.status !== 0) {
    console.error(`SPEC018_SMOKE_FAIL ${rel}`);
    process.exit(r.status || 1);
  }
}

console.log("SPEC018_SMOKE_OK");
