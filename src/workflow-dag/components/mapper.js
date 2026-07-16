/**
 * YAML workflow document → Nice-DAG hierarchical model (SPEC-012 E2+).
 * Spec: .seed/02_Update_Widget_Requirements.md §2
 */

import * as yaml from "js-yaml";
import { EDGE_TYPE, edgeKey } from "./edgeMeta.js";

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

const STEPS_FROM_RE = /\$steps\.([A-Za-z0-9_-]+)\./;

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
 * @param {unknown} from
 * @returns {string|null} producer step id
 */
export function parseStepsFromRef(from) {
  if (typeof from !== "string") return null;
  const m = from.match(STEPS_FROM_RE);
  return m ? m[1] : null;
}

/**
 * @param {unknown} from
 * @returns {boolean}
 */
export function isWorkflowInputsRef(from) {
  return typeof from === "string" && from.includes("$workflow.inputs");
}

/**
 * Resolve a single inbound dependency for a step (used-by wins over follows).
 * @returns {{ dependencies: string[], edgeType: string }}
 */
export function resolveStepInbound(step, steps, index, entryParentId) {
  const from = step?.input?.from;
  const producer = parseStepsFromRef(from);
  if (producer) {
    return {
      dependencies: [producer],
      edgeType: EDGE_TYPE.USED_BY,
    };
  }
  if (isWorkflowInputsRef(from) && entryParentId) {
    return {
      dependencies: [entryParentId],
      edgeType: EDGE_TYPE.USED_BY,
    };
  }

  const needs = step?.needs;
  if (Array.isArray(needs) && needs.length > 0) {
    // At most one inbound: use first needs entry for sequence follows.
    return {
      dependencies: [needs[0]],
      edgeType: EDGE_TYPE.FOLLOWS,
    };
  }
  if (index > 0) {
    return {
      dependencies: [steps[index - 1].id],
      edgeType: EDGE_TYPE.FOLLOWS,
    };
  }
  if (entryParentId) {
    return {
      dependencies: [entryParentId],
      edgeType: EDGE_TYPE.FOLLOWS,
    };
  }
  return { dependencies: [], edgeType: EDGE_TYPE.FOLLOWS };
}

/**
 * @param {object} doc - full workflow document
 * @returns {{ nodes: object[], edgeMeta: Map<string, string> }}
 */
export function workflowDocToNiceDagModel(doc) {
  const steps = Array.isArray(doc?.steps) ? doc.steps : [];
  const hasInputs =
    doc?.inputs !== undefined &&
    doc?.inputs !== null &&
    !(
      typeof doc.inputs === "object" &&
      !Array.isArray(doc.inputs) &&
      Object.keys(doc.inputs).length === 0
    );

  const edgeMeta = new Map();
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
    edgeMeta.set(
      edgeKey(WORKFLOW_START_ID, WORKFLOW_TARGET_ID),
      EDGE_TYPE.FOLLOWS
    );
    entryParentId = WORKFLOW_TARGET_ID;
  }

  const stepNodes = workflowStepsToNiceDagModel(steps, entryParentId, edgeMeta);
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
  for (const dep of endDeps) {
    edgeMeta.set(edgeKey(dep, WORKFLOW_END_ID), EDGE_TYPE.FOLLOWS);
  }

  return { nodes, edgeMeta };
}

/**
 * @param {object[]} steps - workflow.steps from parsed YAML
 * @param {string} entryParentId
 * @param {Map<string, string>} edgeMeta
 * @returns {object[]} Nice-DAG initNodes (HIERARCHY groups with 4 children each)
 */
export function workflowStepsToNiceDagModel(
  steps,
  entryParentId = WORKFLOW_START_ID,
  edgeMeta = new Map()
) {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step, index) => {
    const inbound = resolveStepInbound(step, steps, index, entryParentId);
    const dependencies = inbound.dependencies;
    if (dependencies.length === 1) {
      edgeMeta.set(edgeKey(dependencies[0], step.id), inbound.edgeType);
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

      if (childDeps.length === 1) {
        edgeMeta.set(
          edgeKey(childDeps[0], `${step.id}__${category}`),
          EDGE_TYPE.USED_BY
        );
      }

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
        inboundEdgeType: inbound.edgeType,
      },
    };
  });
}

/**
 * Inline harness — logs mapped model for manual verification (D1-S2).
 * Call from browser console: window.__runCliWorkflowMapperHarness()
 */
export function runMapperHarness(workflowDoc) {
  const { nodes: model, edgeMeta } = workflowDocToNiceDagModel(
    workflowDoc || {}
  );
  const topLevel = model.length;
  const categories = model.reduce(
    (n, node) => n + (node.children?.length || 0),
    0
  );
  console.log("[cli-workflow mapper] top-level nodes:", topLevel);
  console.log("[cli-workflow mapper] category leaves:", categories);
  console.log("[cli-workflow mapper] edgeMeta:", Object.fromEntries(edgeMeta));
  console.log("[cli-workflow mapper] model:", model);
  return model;
}

export { CATEGORIES };
