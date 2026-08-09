/**
 * Y3-1 / R13-23 — verify computeDagGeometry against SPEC-012 LAYOUT-RULES §5 goldens.
 */
import {
  computeDagGeometry,
  GOLDEN_GEOMETRY,
  SEED_CX,
} from "../src/workflow-dag/dagGeometry.js";

const COLLECTOR = 32;
const COLLAPSED_W = 180;
const COLLAPSED_H = 64;
const START = 72;
const TARGET_W = 140;
const TARGET_H = 48;
const END = 72;

/** LAYOUT-RULES §5.1 — 12A2 (x,y + size) */
const nodes12A2 = [
  { id: "start", x: 355, y: 0, width: START, height: START },
  { id: "sfp_cli_netdiscover", x: 301, y: 154, width: COLLAPSED_W, height: COLLAPSED_H },
  { id: "context_collector_1", x: 555, y: 170, width: COLLECTOR, height: COLLECTOR },
  { id: "context", x: 355, y: 300, width: END, height: END },
];

/** LAYOUT-RULES §5.2 — 12A */
const nodes12A = [
  { id: "start", x: 355, y: 0, width: START, height: START },
  { id: "target", x: 321, y: 162, width: TARGET_W, height: TARGET_H },
  { id: "sfp_cli_subfinder", x: 301, y: 304, width: COLLAPSED_W, height: COLLAPSED_H },
  { id: "context_collector_1", x: 555, y: 320, width: COLLECTOR, height: COLLECTOR },
  { id: "sfp_cli_httpx", x: 121, y: 484, width: COLLAPSED_W, height: COLLAPSED_H },
  { id: "context_collector_2", x: 375, y: 500, width: COLLECTOR, height: COLLECTOR },
  { id: "sfp_cli_nmap", x: 481, y: 484, width: COLLAPSED_W, height: COLLAPSED_H },
  { id: "sfp_cli_katana", x: 121, y: 634, width: COLLAPSED_W, height: COLLAPSED_H },
  { id: "context_collector_3", x: 375, y: 650, width: COLLECTOR, height: COLLECTOR },
  { id: "sfp_cli_nerva", x: 481, y: 634, width: COLLAPSED_W, height: COLLAPSED_H },
  { id: "sfp_cli_nuclei", x: 121, y: 784, width: COLLAPSED_W, height: COLLAPSED_H },
  { id: "context_collector_4", x: 375, y: 800, width: COLLECTOR, height: COLLECTOR },
  { id: "context", x: 355, y: 930, width: END, height: END },
];

function assertMatch(label, actual, expected) {
  const keys = [
    "centreLineX",
    "leftWidth",
    "rightWidth",
    "top",
    "bottom",
    "width",
    "height",
  ];
  const diffs = [];
  for (const k of keys) {
    if (actual[k] !== expected[k]) {
      diffs.push(`${k}: got ${actual[k]}, want ${expected[k]}`);
    }
  }
  if (diffs.length) {
    console.error(`FAIL ${label}`, diffs.join("; "));
    return false;
  }
  console.log(`OK ${label}`, {
    centreLineX: actual.centreLineX,
    leftWidth: actual.leftWidth,
    rightWidth: actual.rightWidth,
    top: actual.top,
    bottom: actual.bottom,
  });
  return true;
}

let ok = true;
if (SEED_CX !== 391) {
  console.error("FAIL SEED_CX", SEED_CX);
  ok = false;
}
ok =
  assertMatch(
    "12A2",
    computeDagGeometry(nodes12A2),
    GOLDEN_GEOMETRY["12A2"]
  ) && ok;
ok =
  assertMatch("12A", computeDagGeometry(nodes12A), GOLDEN_GEOMETRY["12A"]) &&
  ok;

if (!ok) process.exit(1);
console.log("VERIFIED_OK dag geometry vs LAYOUT-RULES goldens");
