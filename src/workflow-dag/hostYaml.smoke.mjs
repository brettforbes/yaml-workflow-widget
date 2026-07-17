/**
 * Smoke: host YAML validate path used by setYaml (E6-S2).
 * Run: node src/workflow-dag/hostYaml.smoke.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateWorkflowYaml } from "./components/yamlValidate.js";
import { validatedYamlToNiceDagModel } from "./components/yamlToDag.js";
import { HOST_MSG } from "./hostProtocol.js";

const here = dirname(fileURLToPath(import.meta.url));
const good = readFileSync(
  join(here, "assets", "12A_Workflow_YAML_Example.yaml"),
  "utf8"
);

const v = await validateWorkflowYaml(good);
if (!v.ok) {
  console.error("HOST_YAML_SMOKE_FAIL validate 12A", v.diagnostics);
  process.exit(1);
}
const model = validatedYamlToNiceDagModel(good);
if (!model.nodes?.length) {
  console.error("HOST_YAML_SMOKE_FAIL model");
  process.exit(1);
}

const bad = await validateWorkflowYaml("apiVersion: [unterminated");
if (bad.ok) {
  console.error("HOST_YAML_SMOKE_FAIL expected invalid");
  process.exit(1);
}

if (HOST_MSG.SET_YAML !== "setYaml" || HOST_MSG.GET_YAML !== "getYaml") {
  console.error("HOST_YAML_SMOKE_FAIL message names");
  process.exit(1);
}

console.log("HOST_YAML_SMOKE_OK", "nodes=", model.nodes.length);
