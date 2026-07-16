/**
 * Lightweight mapper checks for E2-S2 (no-inputs fixture omits target).
 * Run: node src/workflow-dag/components/mapper.smoke.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import {
  NODE_KIND,
  WORKFLOW_TARGET_ID,
  workflowDocToNiceDagModel,
} from "./mapper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(
  __dirname,
  "../assets/fixtures/workflow-no-inputs.yaml"
);
const samplePath = path.join(
  __dirname,
  "../assets/12A_Workflow_YAML_Example.yaml"
);

const noInputs = yaml.load(fs.readFileSync(fixturePath, "utf8"));
const noInputsModel = workflowDocToNiceDagModel(noInputs);
const hasTarget = noInputsModel.some(
  (n) => n.id === WORKFLOW_TARGET_ID || n.data?.kind === NODE_KIND.TARGET
);
if (hasTarget) {
  console.error("FAIL: no-inputs fixture must omit target node");
  process.exit(1);
}

const sample = yaml.load(fs.readFileSync(samplePath, "utf8"));
const sampleModel = workflowDocToNiceDagModel(sample);
const sampleHasTarget = sampleModel.some(
  (n) => n.id === WORKFLOW_TARGET_ID || n.data?.kind === NODE_KIND.TARGET
);
if (!sampleHasTarget) {
  console.error("FAIL: 12A sample must include target node");
  process.exit(1);
}

console.log("OK: target omitted for no-inputs; present for 12A");
