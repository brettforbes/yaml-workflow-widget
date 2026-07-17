/**
 * Lightweight mapper checks for E2-S2 / E2-S3 / E2-S5.
 * Run: node src/workflow-dag/components/mapper.smoke.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import {
  NODE_KIND,
  WORKFLOW_END_ID,
  WORKFLOW_TARGET_ID,
  workflowDocToNiceDagModel,
} from "./mapper.js";
import { EDGE_TYPE, edgeKey } from "./edgeMeta.js";

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
const { nodes: noInputsModel } = workflowDocToNiceDagModel(noInputs);
const hasTarget = noInputsModel.some(
  (n) => n.id === WORKFLOW_TARGET_ID || n.data?.kind === NODE_KIND.TARGET
);
if (hasTarget) {
  console.error("FAIL: no-inputs fixture must omit target node");
  process.exit(1);
}

const sample = yaml.load(fs.readFileSync(samplePath, "utf8"));
const { nodes: sampleModel, edgeMeta } = workflowDocToNiceDagModel(sample);
const sampleHasTarget = sampleModel.some(
  (n) => n.id === WORKFLOW_TARGET_ID || n.data?.kind === NODE_KIND.TARGET
);
if (!sampleHasTarget) {
  console.error("FAIL: 12A sample must include target node");
  process.exit(1);
}

const sampleHasEnd = sampleModel.some(
  (n) => n.id === WORKFLOW_END_ID || n.data?.kind === NODE_KIND.END
);
if (!sampleHasEnd) {
  console.error("FAIL: 12A sample must include end context node");
  process.exit(1);
}

const usedBy = edgeKey("sfp_cli_subfinder", "sfp_cli_nmap");
if (edgeMeta.get(usedBy) !== EDGE_TYPE.USED_BY) {
  console.error("FAIL: subfinder→nmap must be used-by", edgeMeta.get(usedBy));
  process.exit(1);
}

const nmap = sampleModel.find((n) => n.id === "sfp_cli_nmap");
if (!nmap || nmap.dependencies.length !== 1) {
  console.error("FAIL: nmap must have exactly one inbound");
  process.exit(1);
}

if (
  edgeMeta.get(edgeKey("__workflow_start__", WORKFLOW_TARGET_ID)) !==
  EDGE_TYPE.FOLLOWS
) {
  console.error("FAIL: start→target must be follows");
  process.exit(1);
}

const targetSubfinder = edgeKey(WORKFLOW_TARGET_ID, "sfp_cli_subfinder");
if (edgeMeta.get(targetSubfinder) !== EDGE_TYPE.USED_BY) {
  console.error(
    "FAIL: target→subfinder must be used-by",
    edgeMeta.get(targetSubfinder)
  );
  process.exit(1);
}

const semantic = edgeKey("sfp_cli_subfinder", "__ctxcol_sfp_cli_subfinder__");
if (edgeMeta.get(semantic) !== EDGE_TYPE.SEMANTIC) {
  console.error("FAIL: step→collector must be semantic-subgraph");
  process.exit(1);
}

const httpx = sampleModel.find((n) => n.id === "sfp_cli_httpx");
if (!httpx || httpx.data?.lane !== 1 || httpx.data?.contextSide !== "left") {
  console.error("FAIL: httpx (right of split) should be lane 1 / context left", httpx?.data);
  process.exit(1);
}

console.log("OK: target/end + used-by + context rail semantic");
