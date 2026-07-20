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
  return modelNodes.map((n) => ({
    id: n.id,
    data: n.data,
    collapse: n.collapse !== false,
    children: n.children,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }));
}

function layoutDoc(yamlRel, expected) {
  const doc = loadYaml(yamlRel);
  const { nodes } = workflowDocToNiceDagModel(doc);
  const vNodes = toViewNodes(nodes);
  applyWorkflowSeedLayout(vNodes, { getNodeSize });

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

layoutDoc("../assets/12A2_Workflow_YAML_Example.yaml", [
  { id: WORKFLOW_START_ID, x: 255, y: 0, cx: 291, cy: 36 },
  { id: "sfp_cli_netdiscover", x: 201, y: 120, cx: 291, cy: 152 },
  { id: "__ctxcol_sfp_cli_netdiscover__", x: 455, y: 136, cx: 471, cy: 152 },
  { id: WORKFLOW_END_ID, x: 255, y: 232, cx: 291, cy: 268 },
]);

layoutDoc("../assets/12A_Workflow_YAML_Example.yaml", [
  { id: WORKFLOW_START_ID, x: 255, y: 0, cx: 291, cy: 36 },
  { id: "__workflow_target__", x: 221, y: 128, cx: 291, cy: 152 },
  { id: "sfp_cli_subfinder", x: 201, y: 236, cx: 291, cy: 268 },
  { id: "__ctxcol_sfp_cli_subfinder__", x: 455, y: 252, cx: 471, cy: 268 },
  { id: "sfp_cli_httpx", x: 21, y: 352, cx: 111, cy: 384 },
  { id: "__ctxcol_sfp_cli_httpx__", x: 275, y: 368, cx: 291, cy: 384 },
  { id: "sfp_cli_nmap", x: 381, y: 352, cx: 471, cy: 384 },
  { id: "sfp_cli_katana", x: 21, y: 468, cx: 111, cy: 500 },
  { id: "__ctxcol_sfp_cli_katana__", x: 275, y: 484, cx: 291, cy: 500 },
  { id: "sfp_cli_nerva", x: 381, y: 468, cx: 471, cy: 500 },
  { id: "sfp_cli_nuclei", x: 21, y: 584, cx: 111, cy: 616 },
  { id: "__ctxcol_sfp_cli_nuclei__", x: 275, y: 600, cx: 291, cy: 616 },
  { id: WORKFLOW_END_ID, x: 255, y: 696, cx: 291, cy: 732 },
]);

console.log("OK: WorkflowSeed golden layouts (12A2 + 12A)");
