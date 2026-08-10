/**
 * Smoke: setStepStatuses contract (SPEC-015 B5 / R15-11).
 * Run: node src/workflow-dag/hostStepStatuses.smoke.mjs
 */
import { HOST_MSG, normalizeHostMessage } from "./hostProtocol.js";

if (HOST_MSG.SET_STEP_STATUSES !== "setStepStatuses") {
  console.error("HOST_STEP_STATUSES_SMOKE_FAIL constant");
  process.exit(1);
}

const msg = normalizeHostMessage({
  type: "setStepStatuses",
  payload: {
    statuses: {
      sfp_cli_nmap: "running",
      sfp_cli_httpx: "waiting",
    },
  },
  target: "iframe",
});
if (
  !msg ||
  msg.type !== "setStepStatuses" ||
  msg.payload?.statuses?.sfp_cli_nmap !== "running"
) {
  console.error("HOST_STEP_STATUSES_SMOKE_FAIL normalize", msg);
  process.exit(1);
}

const clear = normalizeHostMessage({
  action: "setStepStatuses",
  payload: { statuses: {} },
});
if (!clear || clear.type !== "setStepStatuses") {
  console.error("HOST_STEP_STATUSES_SMOKE_FAIL clear envelope", clear);
  process.exit(1);
}

console.log("HOST_STEP_STATUSES_SMOKE_OK");
