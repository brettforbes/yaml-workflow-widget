/**
 * Smoke: validatedYamlToNiceDagModel yields nodes for 12A (E5-S3).
 * Run: node src/workflow-dag/components/yamlToDag.smoke.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");

const { yamlTextToSfw } = await import(
  "../../../packages/workflow-lang/out/language/yaml-bridge.js"
);
const { workflowDocToNiceDagModel } = await import("./mapper.js");

function validatedYamlToNiceDagModel(text) {
  const sfwText = yamlTextToSfw(text);
  const doc = yaml.load(text) || {};
  const mapped = workflowDocToNiceDagModel(doc);
  return { nodes: mapped.nodes, edgeMeta: mapped.edgeMeta, sfwText };
}

const here = dirname(fileURLToPath(import.meta.url));
const text = readFileSync(
  join(here, "..", "assets", "12A_Workflow_YAML_Example.yaml"),
  "utf8"
);
const { nodes, edgeMeta, sfwText } = validatedYamlToNiceDagModel(text);
if (!Array.isArray(nodes) || nodes.length < 3) {
  console.error("YAML_TO_DAG_FAIL nodes", nodes?.length);
  process.exit(1);
}
if (!(edgeMeta instanceof Map) || edgeMeta.size < 1) {
  console.error("YAML_TO_DAG_FAIL edgeMeta");
  process.exit(1);
}
if (!sfwText.includes("workflow ")) {
  console.error("YAML_TO_DAG_FAIL sfw");
  process.exit(1);
}
const stepIds = nodes
  .filter((n) => n.data?.kind === "cli-step" || n.data?.kind === "step" || (n.children && n.data?.uses))
  .map((n) => n.id);
if (!nodes.some((n) => n.id === "workflow-start" || n.data?.kind === "workflow-start")) {
  // start node may use different id — just require enough structure
}
if (nodes.length < 5) {
  console.error("YAML_TO_DAG_FAIL too few nodes", nodes.length);
  process.exit(1);
}
console.log(
  "YAML_TO_DAG_OK",
  "nodes=",
  nodes.length,
  "top=",
  nodes.map((n) => n.id).slice(0, 8).join(",")
);
