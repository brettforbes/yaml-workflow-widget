/**
 * SPEC-019 D3 — Nice-DAG collector.dependencies (not edgeMeta alone).
 * Run: node src/workflow-dag/spec019.smoke.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { workflowDocToNiceDagModel } from "./components/mapper.js";
import { edgeKey } from "./components/edgeMeta.js";
import { collectorId } from "./components/contextRail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samplePath = path.join(__dirname, "assets/12A_Workflow_YAML_Example.yaml");
const sample = yaml.load(fs.readFileSync(samplePath, "utf8"));
const { nodes } = workflowDocToNiceDagModel(sample);

if (!edgeKey("a", "b").includes("->")) {
  console.error("FAIL: edgeKey must use -> separator");
  process.exit(1);
}

function findStep(id) {
  const n = nodes.find((x) => x.id === id);
  if (!n) {
    console.error("FAIL: missing step", id);
    process.exit(1);
  }
  return n;
}

function findCollectorForStep(stepId) {
  const step = findStep(stepId);
  const rank = step.data?.layoutRank;
  const shared =
    rank != null
      ? nodes.find((n) => n.id === `__ctxcol_rank_${rank}__`)
      : null;
  if (shared) return shared;
  const dedicated = nodes.find((n) => n.id === collectorId(stepId));
  if (!dedicated) {
    console.error("FAIL: no collector for step", stepId, "rank", rank);
    process.exit(1);
  }
  return dedicated;
}

const nmapCol = findCollectorForStep("sfp_cli_nmap");
const depsNmap = nmapCol.dependencies || [];
if (!depsNmap.includes("sfp_cli_nmap")) {
  console.error("FAIL: nmap rank collector must depend on sfp_cli_nmap", depsNmap);
  process.exit(1);
}
if (depsNmap.includes("sfp_cli_httpx")) {
  console.error("FAIL: nmap rank collector must not depend on httpx", depsNmap);
  process.exit(1);
}

const nervaCol = findCollectorForStep("sfp_cli_nerva");
const depsNerva = nervaCol.dependencies || [];
if (!depsNerva.includes("sfp_cli_nerva")) {
  console.error("FAIL: nerva collector must depend on sfp_cli_nerva", depsNerva);
  process.exit(1);
}
if (depsNerva.includes("sfp_cli_katana")) {
  console.error("FAIL: nerva collector must not depend on katana", depsNerva);
  process.exit(1);
}

// Mixed rank: httpx (export none) + nmap (export scan_graph) share a rank collector with nmap only.
const httpx = findStep("sfp_cli_httpx");
const nmap = findStep("sfp_cli_nmap");
if (httpx.data?.layoutRank !== nmap.data?.layoutRank) {
  console.error("FAIL: httpx and nmap should share layout rank for 12A", httpx.data, nmap.data);
  process.exit(1);
}
const exporters = depsNmap.filter((d) => d.startsWith("sfp_cli_"));
if (exporters.includes("sfp_cli_httpx")) {
  console.error("FAIL: shared rank exporter deps must exclude httpx", exporters);
  process.exit(1);
}
if (!exporters.includes("sfp_cli_nmap")) {
  console.error("FAIL: shared rank must list nmap as exporter dependency", exporters);
  process.exit(1);
}

console.log("OK: SPEC-019 collector.dependencies (12A nmap/nerva, no httpx/katana)");
