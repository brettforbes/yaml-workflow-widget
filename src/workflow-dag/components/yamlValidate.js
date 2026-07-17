/**
 * Debounced YAML workflow validation for the code pane (SPEC-012 E5-S2 / R12-E5-02).
 * Uses js-yaml + the E5-S1 YAML→.sfw bridge. Invalid text must not clobber the diagram.
 */
import * as yaml from "js-yaml";
import {
  yamlTextToSfw,
  looksLikeWorkflowYaml,
} from "../../../packages/workflow-lang/out/language/yaml-bridge.js";

/**
 * @typedef {{ severity: number, message: string, line?: number, character?: number }} YamlDiagnostic
 */

/**
 * @param {string} text
 * @param {string} [fileName]
 * @returns {Promise<{ ok: boolean, diagnostics: YamlDiagnostic[], doc: object|null, sfwText: string|null }>}
 */
export async function validateWorkflowYaml(
  text,
  fileName = "workflow.yaml"
) {
  /** @type {YamlDiagnostic[]} */
  const diagnostics = [];
  let doc = null;
  let sfwText = null;

  try {
    doc = yaml.load(text);
  } catch (e) {
    const mark = e && e.mark;
    diagnostics.push({
      severity: 1,
      message: `Invalid YAML: ${e.message || String(e)}`,
      line: mark && typeof mark.line === "number" ? mark.line : 0,
      character: mark && typeof mark.column === "number" ? mark.column : 0,
    });
    return { ok: false, diagnostics, doc: null, sfwText: null };
  }

  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    diagnostics.push({
      severity: 1,
      message: "YAML root must be a mapping (workflow document)",
      line: 0,
      character: 0,
    });
    return { ok: false, diagnostics, doc: null, sfwText: null };
  }

  if (!looksLikeWorkflowYaml(text, fileName) && !doc.apiVersion && !doc.kind) {
    diagnostics.push({
      severity: 2,
      message: "Document does not look like a SpiderFeet workflow YAML",
      line: 0,
      character: 0,
    });
  }

  if (!Array.isArray(doc.steps) || doc.steps.length < 1) {
    diagnostics.push({
      severity: 1,
      message: "Workflow requires at least one step",
      line: 0,
      character: 0,
    });
  }

  try {
    sfwText = yamlTextToSfw(text);
  } catch (e) {
    diagnostics.push({
      severity: 1,
      message: `Invalid YAML workflow: ${e.message || String(e)}`,
      line: 0,
      character: 0,
    });
  }

  const errors = diagnostics.filter((d) => d.severity === 1);
  return {
    ok: errors.length === 0,
    diagnostics,
    doc: errors.length === 0 ? doc : doc,
    sfwText: errors.length === 0 ? sfwText : null,
  };
}
