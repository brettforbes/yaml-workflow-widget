/**
 * Node smoke for SPEC-017 edge color defaults + normalize.
 * Run: node src/workflow-dag/edgeColors.smoke.mjs
 */
import assert from "node:assert/strict";
import {
  DEFAULT_EDGE_COLORS,
  EDGE_COLOR_KEYS,
  normalizeEdgeColors,
  resolveStoredEdgeColor,
} from "./edgeColors.js";

assert.equal(DEFAULT_EDGE_COLORS.light["followed-by"], "#156082");
assert.equal(DEFAULT_EDGE_COLORS.dark["used-by"], "#e97132");
assert.equal(DEFAULT_EDGE_COLORS.light["semantic-export"], "#78206e");
assert.deepEqual(EDGE_COLOR_KEYS.length, 3);

const normalized = normalizeEdgeColors({
  light: { "followed-by": "#156082", "used-by": "bad", "semantic-export": "#782" },
});
assert.equal(normalized.light["followed-by"], "#156082");
assert.equal(normalized.light["used-by"], "#e97132"); // fallback
assert.equal(normalized.light["semantic-export"], "#778822"); // #782 → expanded? 3-digit #782 → #778822

const color = resolveStoredEdgeColor(
  "followed-by",
  "light",
  true,
  DEFAULT_EDGE_COLORS
);
assert.equal(color, "#156082");

console.log("edgeColors.smoke.mjs OK");
