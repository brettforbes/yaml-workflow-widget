/**
 * Smoke: host MCP bridge explain + produce (E6-S5).
 * Run: node src/workflow-dag/components/hostMcp.smoke.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { explainWorkflowYaml, produceWorkflowForHost } from "./hostMcp.js";

const here = dirname(fileURLToPath(import.meta.url));
const yaml12a = readFileSync(
  join(here, "..", "assets", "12A_Workflow_YAML_Example.yaml"),
  "utf8"
);
const explained = explainWorkflowYaml(yaml12a);
if (!/Steps \(6\)/.test(explained) || !/sfp_cli_subfinder/.test(explained)) {
  console.error("HOST_MCP_SMOKE_FAIL explain", explained.slice(0, 400));
  process.exit(1);
}
const produced = produceWorkflowForHost("nmap and httpx recon");
if (!/tool\.nmap/.test(produced) || !/tool\.httpx/.test(produced)) {
  console.error("HOST_MCP_SMOKE_FAIL produce", produced);
  process.exit(1);
}
console.log("HOST_MCP_SMOKE_OK");
