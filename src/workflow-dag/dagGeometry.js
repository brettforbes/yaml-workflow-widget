/**
 * R13-23 — DAG bounding geometry at 100% zoom (WorkflowSeed centreline CX=391).
 * Pure helpers so fit/zoom rules (R13-24) can consume stable dimensions.
 */

/** Vertical centreline from SPEC-012 LAYOUT-RULES / workflowSeedLayout. */
export const SEED_CX = 391;

/**
 * @typedef {object} DagGeometry
 * @property {number} zoomBasis Always 1 — measurements are at 100% zoom.
 * @property {number} centreLineX Seed CX (391) unless overridden.
 * @property {number} leftWidth Distance from centreLineX to leftmost edge.
 * @property {number} rightWidth Distance from centreLineX to rightmost edge.
 * @property {number} top Top edge Y (minY).
 * @property {number} bottom Bottom edge Y (maxY).
 * @property {number} width maxX - minX
 * @property {number} height maxY - minY
 * @property {number} minX
 * @property {number} maxX
 * @property {number} minY
 * @property {number} maxY
 */

/**
 * @param {Iterable<{ x?: number, y?: number, width?: number, height?: number, data?: object, children?: unknown[], collapse?: boolean }>} nodes
 * @param {(node: object) => { width: number, height: number }} [sizeOf]
 * @param {{ centreLineX?: number }} [options]
 * @returns {DagGeometry|null}
 */
export function computeDagGeometry(nodes, sizeOf, options = {}) {
  const list = Array.isArray(nodes) ? nodes : [...(nodes || [])];
  if (!list.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of list) {
    if (!node) continue;
    const x = Number(node.x);
    const y = Number(node.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    let w = Number(node.width);
    let h = Number(node.height);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      const sized = typeof sizeOf === "function" ? sizeOf(node) : null;
      w = Number(sized?.width);
      h = Number(sized?.height);
    }
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;

  const centreLineX =
    Number.isFinite(options.centreLineX) ? options.centreLineX : SEED_CX;

  return {
    zoomBasis: 1,
    centreLineX,
    leftWidth: round2(centreLineX - minX),
    rightWidth: round2(maxX - centreLineX),
    top: round2(minY),
    bottom: round2(maxY),
    width: round2(maxX - minX),
    height: round2(maxY - minY),
    minX: round2(minX),
    maxX: round2(maxX),
    minY: round2(minY),
    maxY: round2(maxY),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Expected geometry from SPEC-012 LAYOUT-RULES §5 goldens (collapsed nodes).
 * Used for unit verification of computeDagGeometry.
 */
export const GOLDEN_GEOMETRY = {
  /** 12A2 simple */
  "12A2": {
    centreLineX: SEED_CX,
    leftWidth: 90, // 391 - 301
    rightWidth: 196, // (555+32) - 391
    top: 0,
    bottom: 372, // 300 + 72
    width: 286,
    height: 372,
  },
  /** 12A complex */
  "12A": {
    centreLineX: SEED_CX,
    leftWidth: 270, // 391 - 121
    rightWidth: 270, // (481+180) - 391
    top: 0,
    bottom: 1002, // 930 + 72
    width: 540,
    height: 1002,
  },
};
