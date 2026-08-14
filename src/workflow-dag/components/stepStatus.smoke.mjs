/**
 * Smoke: step status normalization (SPEC-018 R18-13).
 * Run: node src/workflow-dag/components/stepStatus.smoke.mjs
 */
import {
  normalizeStepStatusEntry,
  stepProgressLabel,
  stepStatusLabel,
} from "./stepStatus.js";

const stringEntry = normalizeStepStatusEntry("running");
if (!stringEntry || stringEntry.status !== "running") {
  console.error("STEP_STATUS_SMOKE_FAIL string", stringEntry);
  process.exit(1);
}

const objectEntry = normalizeStepStatusEntry({
  status: "running",
  input_done: 0,
  input_total: 12,
});
if (
  !objectEntry ||
  objectEntry.status !== "running" ||
  objectEntry.input_done !== 0 ||
  objectEntry.input_total !== 12
) {
  console.error("STEP_STATUS_SMOKE_FAIL object", objectEntry);
  process.exit(1);
}

if (stepProgressLabel(objectEntry) !== "0/12") {
  console.error("STEP_STATUS_SMOKE_FAIL progress label");
  process.exit(1);
}

if (stepStatusLabel(stringEntry) !== "running") {
  console.error("STEP_STATUS_SMOKE_FAIL status label");
  process.exit(1);
}

if (normalizeStepStatusEntry({ status: "bogus" }) !== null) {
  console.error("STEP_STATUS_SMOKE_FAIL reject unknown status");
  process.exit(1);
}

console.log("STEP_STATUS_SMOKE_OK");
