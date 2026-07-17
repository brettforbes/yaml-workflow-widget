/**
 * Smoke: host setTheme message normalize (E6-S3).
 * Run: node src/workflow-dag/hostTheme.smoke.mjs
 */
import { HOST_MSG, normalizeHostMessage } from "./hostProtocol.js";
import { normalizeTheme } from "./theme.js";

if (HOST_MSG.SET_THEME !== "setTheme") {
  console.error("HOST_THEME_SMOKE_FAIL");
  process.exit(1);
}
const msg = normalizeHostMessage({
  type: "setTheme",
  payload: { theme: "dark" },
  target: "iframe",
});
if (msg?.type !== "setTheme" || msg.payload?.theme !== "dark") {
  console.error("HOST_THEME_SMOKE_FAIL msg", msg);
  process.exit(1);
}
if (normalizeTheme("dark") !== "dark" || normalizeTheme("light") !== "light") {
  console.error("HOST_THEME_SMOKE_FAIL normalizeTheme");
  process.exit(1);
}
if (normalizeTheme("DARK") !== "light") {
  // Only exact "dark" is dark mode; anything else is light (E1 contract).
  console.error("HOST_THEME_SMOKE_FAIL unexpected DARK handling");
  process.exit(1);
}
console.log("HOST_THEME_SMOKE_OK");
