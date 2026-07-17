/**
 * In-iframe MCP-style bridge for host postMessage (SPEC-012 E6-S5).
 * Full Langium MCP lives in packages/workflow-lang/mcp; this bridge exposes
 * produce (shared helper) + a YAML explain suitable for the browser bundle.
 */
import * as yaml from "js-yaml";
import { produceWorkflowYaml } from "../../../packages/workflow-lang/out/produce-workflow.js";
import { yamlTextToSfw } from "../../../packages/workflow-lang/out/language/yaml-bridge.js";

/**
 * Lightweight explain for host bridge (browser-safe).
 * @param {string} code
 * @returns {string}
 */
export function explainWorkflowYaml(code) {
  let doc;
  try {
    doc = yaml.load(code);
  } catch (e) {
    return `Explain failed: Invalid YAML: ${e.message || String(e)}`;
  }
  if (!doc || typeof doc !== "object") {
    return "Explain failed: YAML root must be a mapping";
  }
  const lines = [];
  lines.push(`Source: YAML`);
  lines.push(`id: ${doc.id || "(none)"}`);
  lines.push(`info.name: ${doc.info?.name || "(none)"}`);
  const inputs = doc.inputs && typeof doc.inputs === "object" ? Object.keys(doc.inputs) : [];
  lines.push(`Inputs (${inputs.length}): ${inputs.join(", ") || "(none)"}`);
  const steps = Array.isArray(doc.steps) ? doc.steps : [];
  lines.push(`Steps (${steps.length}):`);
  for (const s of steps) {
    lines.push(
      `  - ${s.id}: uses ${s.uses || "?"}` +
        (Array.isArray(s.needs) && s.needs.length
          ? `; needs [${s.needs.join(", ")}]`
          : "")
    );
  }
  try {
    const sfw = yamlTextToSfw(code);
    lines.push(`Bridge .sfw chars: ${sfw.length}`);
    lines.push("Diagnostics: bridge conversion OK");
  } catch (e) {
    lines.push(`Diagnostics: ${e.message || String(e)}`);
  }
  return lines.join("\n");
}

export function produceWorkflowForHost(intent) {
  return produceWorkflowYaml(intent || "generated workflow");
}
