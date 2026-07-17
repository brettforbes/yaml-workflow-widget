/**
 * Round-trip smoke: 12A YAML → DAG model → YAML → model (E5-S4).
 * Run: node src/workflow-dag/components/diagramYaml.smoke.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { workflowDocToNiceDagModel, NODE_KIND } from "./mapper.js";
import { diagramToWorkflowYaml } from "./diagramYaml.js";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");

const here = dirname(fileURLToPath(import.meta.url));
const text = readFileSync(
  join(here, "..", "assets", "12A_Workflow_YAML_Example.yaml"),
  "utf8"
);
const doc1 = yaml.load(text);
const model1 = workflowDocToNiceDagModel(doc1);
const yaml2 = diagramToWorkflowYaml(model1.nodes, doc1);
const doc2 = yaml.load(yaml2);
const model2 = workflowDocToNiceDagModel(doc2);

const ids1 = model1.nodes
  .filter((n) => n.data?.kind === NODE_KIND.STEP)
  .map((n) => n.id)
  .sort();
const ids2 = model2.nodes
  .filter((n) => n.data?.kind === NODE_KIND.STEP)
  .map((n) => n.id)
  .sort();

if (ids1.length < 1 || ids1.join(",") !== ids2.join(",")) {
  console.error("DIAGRAM_YAML_SMOKE_FAIL step ids", ids1, ids2);
  process.exit(1);
}
if (!Array.isArray(doc2.steps) || doc2.steps.length !== doc1.steps.length) {
  console.error("DIAGRAM_YAML_SMOKE_FAIL step count");
  process.exit(1);
}
console.log("DIAGRAM_YAML_SMOKE_OK", "steps=", ids2.join(","));
