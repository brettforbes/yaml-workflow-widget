/**
 * Smoke: selectStep / stepSelected contract names (E6-S4).
 * Run: node src/workflow-dag/hostSelection.smoke.mjs
 */
import { HOST_MSG, normalizeHostMessage } from "./hostProtocol.js";

if (HOST_MSG.SELECT_STEP !== "selectStep" || HOST_MSG.STEP_SELECTED !== "stepSelected") {
  console.error("HOST_SELECTION_SMOKE_FAIL names");
  process.exit(1);
}
const msg = normalizeHostMessage({
  type: "selectStep",
  payload: { stepId: "sfp_cli_nmap" },
});
if (msg?.payload?.stepId !== "sfp_cli_nmap") {
  console.error("HOST_SELECTION_SMOKE_FAIL", msg);
  process.exit(1);
}
console.log("HOST_SELECTION_SMOKE_OK");
