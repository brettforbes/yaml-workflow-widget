/**
 * Smoke: status color normalize + CSS var apply (SPEC-015 B4 / R15-10).
 * Run: node src/workflow-dag/statusColors.smoke.mjs
 */
import {
  DEFAULT_STATUS_COLORS,
  STATUS_KEYS,
  applyStatusColors,
  normalizeStatusColors,
  resetStatusColors,
} from "./statusColors.js";

const normalized = normalizeStatusColors({
  light: { waiting: "#abc", running: "nope", complete: "#112233" },
  dark: null,
});
if (normalized.light.waiting !== "#aabbcc") {
  console.error("STATUS_COLORS_SMOKE_FAIL short hex", normalized.light.waiting);
  process.exit(1);
}
if (normalized.light.running !== DEFAULT_STATUS_COLORS.light.running) {
  console.error("STATUS_COLORS_SMOKE_FAIL invalid fallback");
  process.exit(1);
}
if (normalized.light.complete !== "#112233") {
  console.error("STATUS_COLORS_SMOKE_FAIL long hex");
  process.exit(1);
}
for (const key of STATUS_KEYS) {
  if (normalized.dark[key] !== DEFAULT_STATUS_COLORS.dark[key]) {
    console.error("STATUS_COLORS_SMOKE_FAIL dark default", key);
    process.exit(1);
  }
}

const props = {};
const el = {
  style: {
    setProperty(name, value) {
      props[name] = value;
    },
  },
};
applyStatusColors(el, "light", normalized);
for (const key of STATUS_KEYS) {
  if (props[`--wd-status-${key}`] !== normalized.light[key]) {
    console.error("STATUS_COLORS_SMOKE_FAIL apply", key, props);
    process.exit(1);
  }
}

const reset = resetStatusColors();
if (reset.light.failed !== DEFAULT_STATUS_COLORS.light.failed) {
  console.error("STATUS_COLORS_SMOKE_FAIL reset");
  process.exit(1);
}

console.log("STATUS_COLORS_SMOKE_OK");
