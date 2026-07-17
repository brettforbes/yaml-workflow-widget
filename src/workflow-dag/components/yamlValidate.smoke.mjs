/**
 * Smoke: validateWorkflowYaml happy path + invalid YAML (E5-S2).
 * Run: node src/workflow-dag/components/yamlValidate.smoke.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");

// Load compiled bridge the same way the browser module does.
const {
  yamlTextToSfw,
  looksLikeWorkflowYaml,
} = await import(
  "../../../packages/workflow-lang/out/language/yaml-bridge.js"
);

async function validateWorkflowYaml(text, fileName = "workflow.yaml") {
  const diagnostics = [];
  let doc = null;
  let sfwText = null;
  try {
    doc = yaml.load(text);
  } catch (e) {
    diagnostics.push({
      severity: 1,
      message: `Invalid YAML: ${e.message || String(e)}`,
    });
    return { ok: false, diagnostics };
  }
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    diagnostics.push({
      severity: 1,
      message: "YAML root must be a mapping (workflow document)",
    });
    return { ok: false, diagnostics };
  }
  if (!looksLikeWorkflowYaml(text, fileName) && !doc.apiVersion && !doc.kind) {
    diagnostics.push({
      severity: 2,
      message: "Document does not look like a SpiderFeet workflow YAML",
    });
  }
  if (!Array.isArray(doc.steps) || doc.steps.length < 1) {
    diagnostics.push({ severity: 1, message: "Workflow requires at least one step" });
  }
  try {
    sfwText = yamlTextToSfw(text);
  } catch (e) {
    diagnostics.push({
      severity: 1,
      message: `Invalid YAML workflow: ${e.message || String(e)}`,
    });
  }
  const errors = diagnostics.filter((d) => d.severity === 1);
  return { ok: errors.length === 0, diagnostics, sfwText };
}

const here = dirname(fileURLToPath(import.meta.url));
const yamlPath = join(here, "..", "assets", "12A_Workflow_YAML_Example.yaml");
const text = readFileSync(yamlPath, "utf8");
const good = await validateWorkflowYaml(text);
if (!good.ok) {
  console.error("VALIDATE_SMOKE_FAIL good", good.diagnostics);
  process.exit(1);
}
const bad = await validateWorkflowYaml("apiVersion: [unterminated");
if (bad.ok || !bad.diagnostics.some((d) => /Invalid YAML/i.test(d.message))) {
  console.error("VALIDATE_SMOKE_FAIL bad", bad);
  process.exit(1);
}
console.log("VALIDATE_SMOKE_OK");
