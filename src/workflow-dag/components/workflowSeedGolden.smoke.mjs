/**
 * Golden layout checks for WorkflowSeed (L0-S3 / SPEC-012-LAYOUT-RULES §5).
 * Run: node src/workflow-dag/components/workflowSeedGolden.smoke.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { applyWorkflowSeedLayout } from "../../../apps/nice-dag/nice-dag-core/lib/workflowSeedLayout.js";
import { workflowDocToNiceDagModel, WORKFLOW_END_ID, WORKFLOW_START_ID } from "./mapper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadYaml(rel) {
  return yaml.load(fs.readFileSync(path.join(__dirname, rel), "utf8"));
}

function getNodeSize(node) {
  const role = node.data?.layoutRole;
  if (role === "transition") return { width: 72, height: 72 };
  if (role === "target") return { width: 140, height: 48 };
  if (role === "collector") return { width: 32, height: 32 };
  if (role === "sub_step") return { width: 160, height: 56 };
  return { width: 180, height: 64 };
}

function toViewNodes(modelNodes) {
  return modelNodes.map((n) => {
    const node = {
      id: n.id,
      data: n.data,
      collapse: n.collapse !== false,
      children: n.children,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      doLayoutCalls: 0,
      doLayout() {
        this.doLayoutCalls += 1;
        // Mirror ViewNode.doLayout: positions must already be set.
        if (
          !Number.isFinite(this.x) ||
          !Number.isFinite(this.y) ||
          !this.width ||
          !this.height
        ) {
          throw new Error(
            `doLayout before seed coords for ${this.id}: ${this.x},${this.y},${this.width}x${this.height}`
          );
        }
      },
    };
    return node;
  });
}

/** Same sequence as ViewModel.doLayout WORKFLOW_SEED branch. */
function applySeedLikeCore(vNodes) {
  applyWorkflowSeedLayout(vNodes, { getNodeSize });
  vNodes.forEach((h) => {
    if (!h.editing) h.doLayout();
  });
}

function layoutDoc(yamlRel, expected) {
  const doc = loadYaml(yamlRel);
  const { nodes } = workflowDocToNiceDagModel(doc);
  const vNodes = toViewNodes(nodes);
  applySeedLikeCore(vNodes);

  const missingDomSync = vNodes.filter((n) => n.doLayoutCalls < 1);
  if (missingDomSync.length) {
    console.error(
      "FAIL: ViewNode.doLayout not invoked after seed layout:",
      missingDomSync.map((n) => n.id)
    );
    process.exit(1);
  }

  for (const row of expected) {
    const node = vNodes.find((n) => n.id === row.id || n.data?.label === row.id);
    if (!node) {
      console.error(`FAIL: missing node ${row.id}`);
      process.exit(1);
    }
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    if (Math.abs(node.x - row.x) > 1 || Math.abs(node.y - row.y) > 1) {
      console.error(
        `FAIL: ${row.id} xy expected (${row.x},${row.y}) got (${node.x},${node.y})`
      );
      process.exit(1);
    }
    if (Math.abs(cx - row.cx) > 1 || Math.abs(cy - row.cy) > 1) {
      console.error(
        `FAIL: ${row.id} centre expected (${row.cx},${row.cy}) got (${cx},${cy})`
      );
      process.exit(1);
    }
  }
}

// ROW_PITCH=150; FIRST_SPLIT_PITCH=180 into first fan-out row.
layoutDoc("../assets/12A2_Workflow_YAML_Example.yaml", [
  { id: WORKFLOW_START_ID, x: 255, y: 0, cx: 291, cy: 36 },
  { id: "sfp_cli_netdiscover", x: 201, y: 154, cx: 291, cy: 186 },
  { id: "__ctxcol_sfp_cli_netdiscover__", x: 455, y: 170, cx: 471, cy: 186 },
  { id: WORKFLOW_END_ID, x: 255, y: 300, cx: 291, cy: 336 },
]);

layoutDoc("../assets/12A_Workflow_YAML_Example.yaml", [
  { id: WORKFLOW_START_ID, x: 255, y: 0, cx: 291, cy: 36 },
  { id: "__workflow_target__", x: 221, y: 162, cx: 291, cy: 186 },
  { id: "sfp_cli_subfinder", x: 201, y: 304, cx: 291, cy: 336 },
  { id: "__ctxcol_sfp_cli_subfinder__", x: 455, y: 320, cx: 471, cy: 336 },
  { id: "sfp_cli_httpx", x: 21, y: 484, cx: 111, cy: 516 },
  { id: "__ctxcol_rank_3__", x: 275, y: 500, cx: 291, cy: 516 },
  { id: "sfp_cli_nmap", x: 381, y: 484, cx: 471, cy: 516 },
  { id: "sfp_cli_katana", x: 21, y: 634, cx: 111, cy: 666 },
  { id: "__ctxcol_rank_4__", x: 275, y: 650, cx: 291, cy: 666 },
  { id: "sfp_cli_nerva", x: 381, y: 634, cx: 471, cy: 666 },
  { id: "sfp_cli_nuclei", x: 21, y: 784, cx: 111, cy: 816 },
  { id: "__ctxcol_sfp_cli_nuclei__", x: 275, y: 800, cx: 291, cy: 816 },
  { id: WORKFLOW_END_ID, x: 255, y: 930, cx: 291, cy: 966 },
]);

// Strong CX spine: start, target, subfinder, collectors 2–4, context end.
{
  const doc = loadYaml("../assets/12A_Workflow_YAML_Example.yaml");
  const { nodes } = workflowDocToNiceDagModel(doc);
  const vNodes = toViewNodes(nodes);
  applySeedLikeCore(vNodes);
  const spineIds = [
    WORKFLOW_START_ID,
    "__workflow_target__",
    "sfp_cli_subfinder",
    "__ctxcol_rank_3__",
    "__ctxcol_rank_4__",
    "__ctxcol_sfp_cli_nuclei__",
    WORKFLOW_END_ID,
  ];
  for (const id of spineIds) {
    const n = vNodes.find((v) => v.id === id);
    const cx = n.x + n.width / 2;
    if (Math.abs(cx - 291) > 0.5) {
      console.error(`FAIL: spine ${id} cx=${cx}, expected 291`);
      process.exit(1);
    }
  }
}

console.log("OK: WorkflowSeed golden layouts (12A2 + 12A) + CX spine");
