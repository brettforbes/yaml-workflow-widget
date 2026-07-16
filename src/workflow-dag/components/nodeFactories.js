import * as yaml from "js-yaml";
import { NODE_KIND, CATEGORIES } from "./mapper";
import { collectorId } from "./contextRail";

let seq = 0;
function nextId(prefix) {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq}`;
}

export function createStepNode(label) {
  const id = nextId("step");
  const step = {
    id,
    uses: "tool.nmap",
    needs: [],
    input: { type: "string_list", from: "$workflow.inputs.targets" },
    config: { argv: [] },
    context: { export: true },
    output: { vars: {} },
  };
  const children = CATEGORIES.map((category, catIndex) => {
    const raw = step[category] ?? null;
    return {
      id: `${id}__${category}`,
      dependencies: catIndex === 0 ? [] : [`${id}__${CATEGORIES[catIndex - 1]}`],
      data: {
        kind: NODE_KIND.CATEGORY,
        category,
        raw,
        yaml:
          raw == null
            ? ""
            : yaml.dump(raw, { lineWidth: 120, noRefs: true }).trimEnd(),
        label: category,
        uses: step.uses,
        stepId: id,
        contextSide: "right",
      },
    };
  });
  return {
    id,
    dependencies: [],
    collapse: true,
    children,
    data: {
      kind: NODE_KIND.STEP,
      stepId: id,
      uses: step.uses,
      raw: step,
      yaml: yaml.dump(step, { lineWidth: 120, noRefs: true }).trimEnd(),
      label: label || id,
      lane: 0,
      contextSide: "right",
    },
  };
}

export function createStartNode() {
  return {
    id: nextId("start"),
    dependencies: [],
    data: {
      kind: NODE_KIND.START,
      label: "start",
      yaml: "apiVersion: spiderfeet.workflow/v1\nkind: Workflow\nid: new\ninfo:\n  name: New Workflow",
      raw: {},
    },
  };
}

export function createTargetNode() {
  return {
    id: nextId("target"),
    dependencies: [],
    data: {
      kind: NODE_KIND.TARGET,
      label: "target",
      yaml: "inputs:\n  targets:\n    type: string_list\n    default: []",
      raw: { targets: { type: "string_list", default: [] } },
    },
  };
}

export function createEndNode() {
  return {
    id: nextId("end"),
    dependencies: [],
    data: {
      kind: NODE_KIND.END,
      label: "final context",
      yaml: "context: {}",
      raw: null,
    },
  };
}

export function createCollectorNode(forStepId) {
  const stepId = forStepId || nextId("anon");
  return {
    id: collectorId(stepId),
    dependencies: [],
    data: {
      kind: NODE_KIND.CONTEXT_COLLECTOR,
      label: "ctx",
      forStep: stepId,
      lane: 0,
    },
  };
}
