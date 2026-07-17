/**
 * Rebuild a vertical (TB-oriented) workflow YAML document from Nice-DAG nodes.
 * E4-S5 / E5 precursor — diagram → YAML pretty-print.
 */
import * as yaml from "js-yaml";
import {
  NODE_KIND,
  WORKFLOW_END_ID,
  WORKFLOW_START_ID,
  WORKFLOW_TARGET_ID,
} from "./mapper.js";

/**
 * @param {object[]} allNodes - niceDag.getAllNodes()
 * @param {object} [baseDoc]
 * @returns {string}
 */
export function diagramToWorkflowYaml(allNodes, baseDoc = {}) {
  const nodes = (allNodes || []).filter((n) => !n.parentId);
  const start = nodes.find((n) => n.data?.kind === NODE_KIND.START);
  const target = nodes.find((n) => n.data?.kind === NODE_KIND.TARGET);
  const steps = nodes.filter((n) => n.data?.kind === NODE_KIND.STEP);

  const doc = {
    apiVersion: baseDoc.apiVersion || "spiderfeet.workflow/v1",
    kind: baseDoc.kind || "Workflow",
    id: start?.data?.raw?.id || baseDoc.id || "workflow--edited",
    info: start?.data?.raw?.info ||
      baseDoc.info || { name: "Edited Workflow", description: "" },
  };

  if (target?.data?.raw) {
    doc.inputs =
      target.data.raw.targets || target.data.raw.inputs
        ? target.data.raw.targets
          ? target.data.raw
          : target.data.raw.inputs
        : target.data.raw;
  } else if (baseDoc.inputs) {
    doc.inputs = baseDoc.inputs;
  }

  doc.steps = steps.map((n) => {
    const raw = n.data?.raw && typeof n.data.raw === "object" ? { ...n.data.raw } : {};
    raw.id = n.id;
    if (!raw.uses) raw.uses = n.data?.uses || "tool.unknown";
    // Vertical-friendly: keep needs from dependencies excluding synthetic ids
    const deps = (n.dependencies || []).filter(
      (d) =>
        d !== WORKFLOW_START_ID &&
        d !== WORKFLOW_TARGET_ID &&
        d !== WORKFLOW_END_ID &&
        !String(d).startsWith("__ctxcol_")
    );
    raw.needs = deps;
    return raw;
  });

  return yaml.dump(doc, {
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
  }).trimEnd();
}
