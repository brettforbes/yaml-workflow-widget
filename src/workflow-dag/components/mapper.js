/**
 * YAML workflow document → Nice-DAG hierarchical model (SPEC-012 E2+).
 * Spec: .seed/02_Update_Widget_Requirements.md §2
 */

import * as yaml from "js-yaml";

const CATEGORIES = ["input", "config", "output", "context"];

export const NODE_KIND = {
  START: "workflow-start",
  TARGET: "workflow-target",
  END: "workflow-end",
  STEP: "cli-step",
  CATEGORY: "category",
  CONTEXT_COLLECTOR: "context-collector",
};

export const WORKFLOW_START_ID = "__workflow_start__";
export const WORKFLOW_TARGET_ID = "__workflow_target__";
export const WORKFLOW_END_ID = "__workflow_end__";

/**
 * Header YAML shown on the start-circle tooltip (apiVersion/kind/id/info).
 * @param {object} doc
 * @returns {string}
 */
export function dumpWorkflowHeaderYaml(doc) {
  if (!doc || typeof doc !== "object") return "";
  const header = {};
  for (const key of ["apiVersion", "kind", "id", "info"]) {
    if (doc[key] !== undefined) header[key] = doc[key];
  }
  return yaml.dump(header, { lineWidth: 120, noRefs: true }).trimEnd();
}

/**
 * @param {object} doc - full workflow document
 * @returns {object[]} Nice-DAG initNodes
 */
export function workflowDocToNiceDagModel(doc) {
  const steps = Array.isArray(doc?.steps) ? doc.steps : [];
  const stepNodes = workflowStepsToNiceDagModel(steps);
  const hasInputs =
    doc?.inputs !== undefined &&
    doc?.inputs !== null &&
    !(
      typeof doc.inputs === "object" &&
      !Array.isArray(doc.inputs) &&
      Object.keys(doc.inputs).length === 0
    );

  const startNode = {
    id: WORKFLOW_START_ID,
    dependencies: [],
    data: {
      kind: NODE_KIND.START,
      label: "start",
      yaml: dumpWorkflowHeaderYaml(doc || {}),
      raw: {
        apiVersion: doc?.apiVersion,
        kind: doc?.kind,
        id: doc?.id,
        info: doc?.info,
      },
    },
  };

  const nodes = [startNode];
  let entryParentId = WORKFLOW_START_ID;

  if (hasInputs) {
    const targetNode = {
      id: WORKFLOW_TARGET_ID,
      dependencies: [WORKFLOW_START_ID],
      data: {
        kind: NODE_KIND.TARGET,
        label: "target",
        yaml: yaml
          .dump({ inputs: doc.inputs }, { lineWidth: 120, noRefs: true })
          .trimEnd(),
        raw: doc.inputs,
      },
    };
    nodes.push(targetNode);
    entryParentId = WORKFLOW_TARGET_ID;
  }

  // Entry steps (no needs) hang off start or target.
  const entryIds = new Set(
    stepNodes
      .filter((n) => !n.dependencies || n.dependencies.length === 0)
      .map((n) => n.id)
  );
  for (const node of stepNodes) {
    if (entryIds.has(node.id)) {
      node.dependencies = [entryParentId];
    }
  }

  nodes.push(...stepNodes);

  // Final context circle depends on leaf steps (no other step depends on them).
  const dependedOn = new Set();
  for (const node of stepNodes) {
    for (const dep of node.dependencies || []) {
      if (dep !== WORKFLOW_START_ID && dep !== WORKFLOW_TARGET_ID) {
        dependedOn.add(dep);
      }
    }
  }
  const leafIds = stepNodes
    .map((n) => n.id)
    .filter((id) => !dependedOn.has(id));
  const endDeps =
    leafIds.length > 0
      ? leafIds
      : entryParentId
        ? [entryParentId]
        : [WORKFLOW_START_ID];

  nodes.push({
    id: WORKFLOW_END_ID,
    dependencies: endDeps,
    data: {
      kind: NODE_KIND.END,
      label: "final context",
      yaml: "context:\n  # Aggregated semantic-subgraph outcomes (E2-S6+)",
      raw: null,
    },
  });

  return nodes;
}

/**
 * @param {object[]} steps - workflow.steps from parsed YAML
 * @returns {object[]} Nice-DAG initNodes (HIERARCHY groups with 4 children each)
 */
export function workflowStepsToNiceDagModel(steps) {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step, index) => {
    const needs = step.needs;
    let dependencies = [];
    if (Array.isArray(needs) && needs.length > 0) {
      dependencies = [...needs];
    } else if (index > 0) {
      dependencies = [steps[index - 1].id];
    }

    const children = CATEGORIES.map((category, catIndex) => {
      const raw =
        step[category] !== undefined && step[category] !== null
          ? step[category]
          : null;
      const yamlText =
        raw === null
          ? ""
          : yaml.dump(raw, { lineWidth: 120, noRefs: true }).trimEnd();

      const childDeps =
        catIndex === 0 ? [] : [`${step.id}__${CATEGORIES[catIndex - 1]}`];

      return {
        id: `${step.id}__${category}`,
        dependencies: childDeps,
        data: {
          kind: NODE_KIND.CATEGORY,
          category,
          raw,
          yaml: yamlText,
          label: category,
        },
      };
    });

    return {
      id: step.id,
      dependencies,
      collapse: true,
      children,
      data: {
        kind: NODE_KIND.STEP,
        stepId: step.id,
        uses: step.uses,
        raw: step,
        yaml: yaml.dump(step, { lineWidth: 120, noRefs: true }).trimEnd(),
        label: step.id,
      },
    };
  });
}

/**
 * Inline harness — logs mapped model for manual verification (D1-S2).
 * Call from browser console: window.__runCliWorkflowMapperHarness()
 */
export function runMapperHarness(workflowDoc) {
  const model = workflowDocToNiceDagModel(workflowDoc || {});
  const topLevel = model.length;
  const categories = model.reduce(
    (n, node) => n + (node.children?.length || 0),
    0
  );
  console.log("[cli-workflow mapper] top-level nodes:", topLevel);
  console.log("[cli-workflow mapper] category leaves:", categories);
  console.log("[cli-workflow mapper] model:", model);
  return model;
}

export { CATEGORIES };
