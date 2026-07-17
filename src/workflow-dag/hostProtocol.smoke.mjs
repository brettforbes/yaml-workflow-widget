/**
 * Smoke: host protocol normalize + constants (E6-S1).
 * Run: node src/workflow-dag/hostProtocol.smoke.mjs
 */
import {
  HOST_MSG,
  normalizeHostMessage,
  PROTOCOL_VERSION,
} from "./hostProtocol.js";

const required = [
  "setYaml",
  "getYaml",
  "yamlChanged",
  "validationResult",
  "setTheme",
  "selectStep",
  "stepSelected",
];
for (const key of required) {
  const found = Object.values(HOST_MSG).includes(key);
  if (!found) {
    console.error("HOST_PROTOCOL_SMOKE_FAIL missing", key);
    process.exit(1);
  }
}

const ignored = normalizeHostMessage({
  type: "setTheme",
  target: "parent",
  payload: { theme: "dark" },
});
if (ignored !== null) {
  console.error("HOST_PROTOCOL_SMOKE_FAIL should ignore target=parent");
  process.exit(1);
}

const ok = normalizeHostMessage({
  type: "setYaml",
  payload: { yaml: "a: 1" },
  target: "iframe",
});
if (!ok || ok.type !== "setYaml" || ok.payload?.yaml !== "a: 1") {
  console.error("HOST_PROTOCOL_SMOKE_FAIL normalize", ok);
  process.exit(1);
}

const fromString = normalizeHostMessage(
  JSON.stringify({ action: "getYaml", payload: { requestId: "r1" } })
);
if (!fromString || fromString.type !== "getYaml") {
  console.error("HOST_PROTOCOL_SMOKE_FAIL string envelope", fromString);
  process.exit(1);
}

console.log("HOST_PROTOCOL_SMOKE_OK", PROTOCOL_VERSION);
