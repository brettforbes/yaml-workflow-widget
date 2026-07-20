/**
 * WorkflowSeed layout engine (SPEC-012 L0-S3).
 * Applies seed positions when init config layout === "WORKFLOW_SEED".
 */

export const CX = 291;
export const ROW_PITCH = 150;
export const FIRST_SPLIT_PITCH = 180;
export const COLLECTOR_GAP = 90;
export const EXPAND_DELTA = 464;
export const EXPANDED_MIN_W = 214;
export const EXPANDED_MIN_H = 528;

const SUB_STEP_OFFSETS = {
  input: { x: 36, y: 56 },
  config: { x: 36, y: 168 },
  context: { x: 36, y: 280 },
  output: { x: 36, y: 392 },
};

function shapeSize(node, getNodeSize) {
  if (typeof getNodeSize === "function") {
    const s = getNodeSize(node);
    if (s?.width && s?.height) return s;
  }
  const role = node.data?.layoutRole;
  if (role === "transition") return { width: 72, height: 72 };
  if (role === "target") return { width: 140, height: 48 };
  if (role === "collector") return { width: 32, height: 32 };
  if (role === "sub_step") return { width: 160, height: 56 };
  return { width: 180, height: 64 };
}

function placeFromCenter(node, cx, cy, size) {
  node.x = cx - size.width / 2;
  node.y = cy - size.height / 2;
  node.width = size.width;
  node.height = size.height;
}

function isExpandedStep(node) {
  return (
    node.data?.layoutRole === "default_step" ||
    node.data?.layoutRole === "mirror_step"
  ) && node.children?.length && node.collapse === false;
}

function layoutExpandedChildren(stepNode) {
  for (const child of stepNode.children || []) {
    const cat = child.data?.category;
    const off = SUB_STEP_OFFSETS[cat];
    if (off) {
      child.x = off.x;
      child.y = off.y;
      const sz = { width: 160, height: 56 };
      child.width = sz.width;
      child.height = sz.height;
    }
  }
}

/**
 * Push nodes whose top is below expanded step top down by EXPAND_DELTA.
 * @param {object[]} vNodes
 */
function applyExpandPushDown(vNodes) {
  const expanded = vNodes.filter(isExpandedStep);
  if (!expanded.length) return;

  for (const exp of expanded) {
    const expBottom = exp.y + (exp.height || EXPANDED_MIN_H);
    const pushFromY = exp.y + 64;
    for (const node of vNodes) {
      if (node.id === exp.id) continue;
      if (node.y >= pushFromY - 0.5) {
        node.y += EXPAND_DELTA;
        if (node.data?.layoutCy != null) node.data.layoutCy += EXPAND_DELTA;
      }
    }
  }
}

/**
 * @param {object[]} vNodes
 * @param {{ getNodeSize?: (node: object) => { width: number, height: number } }} config
 */
export function applyWorkflowSeedLayout(vNodes, config = {}) {
  const { getNodeSize } = config;
  const seedNodes = vNodes.filter((n) => n.data?.layoutRole);

  for (const node of seedNodes) {
    const role = node.data?.layoutRole;
    const size = shapeSize(node, getNodeSize);

    if (role === "sub_step") {
      const cat = node.data?.category;
      const off = SUB_STEP_OFFSETS[cat];
      if (off) {
        node.x = off.x;
        node.y = off.y;
        node.width = size.width;
        node.height = size.height;
      }
      continue;
    }

    let cx = node.data.layoutCx ?? CX;
    let cy =
      node.data.layoutCy ??
      36 + (node.data.layoutRank ?? 0) * ROW_PITCH;

    if (isExpandedStep(node)) {
      size.width = Math.max(size.width, EXPANDED_MIN_W);
      size.height = Math.max(size.height, EXPANDED_MIN_H);
      placeFromCenter(node, cx, cy, size);
      layoutExpandedChildren(node);
      continue;
    }

    placeFromCenter(node, cx, cy, size);
  }

  applyExpandPushDown(vNodes);
}

/**
 * Golden fixture helper for tests.
 * @param {object} node
 * @returns {{ x: number, y: number, cx: number, cy: number } | null}
 */
export function nodeLayoutCenter(node) {
  if (!node?.data?.layoutRole) return null;
  const w = node.width ?? shapeSize(node).width;
  const h = node.height ?? shapeSize(node).height;
  return {
    x: node.x,
    y: node.y,
    cx: node.x + w / 2,
    cy: node.y + h / 2,
  };
}
