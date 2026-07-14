/**
 * YAML workflow steps → Nice-DAG hierarchical model.
 * Spec: .seed/CLI_WORKFLOW_VIEW_DESIGN.md §2
 */

import yaml from "js-yaml";

const CATEGORIES = ["input", "config", "output", "context"];

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
  const steps = workflowDoc?.steps || [];
  const model = workflowStepsToNiceDagModel(steps);
  const topLevel = model.length;
  const categories = model.reduce(
    (n, node) => n + (node.children?.length || 0),
    0
  );
  console.log("[cli-workflow mapper] top-level nodes:", topLevel);
  console.log("[cli-workflow mapper] category leaves:", categories);
  console.log("[cli-workflow mapper] model:", model);
  model.forEach((node) => {
    const emptyOutput = node.children?.find(
      (c) => c.data.category === "output" && c.data.raw === null
    );
    if (emptyOutput) {
      console.log(
        `[cli-workflow mapper] empty output category on: ${node.id}`
      );
    }
  });
  return model;
}

export { CATEGORIES };
