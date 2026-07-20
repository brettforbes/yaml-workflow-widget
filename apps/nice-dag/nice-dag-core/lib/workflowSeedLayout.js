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

/**
 * Sub-step positions relative to Nice-DAG *content* origin (inside subViewPadding).
 * With padding { top:56, left:36, right:18, bottom:80 } these match seed §2.4
 * visual offsets (36,56)/(36,168)/(36,280)/(36,392) inside a 214×528 host.
 */
const SUB_STEP_CONTENT_OFFSETS = {
  input: { x: 0, y: 0 },
  config: { x: 0, y: 112 },
  context: { x: 0, y: 224 },
  output: { x: 0, y: 336 },
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

/**
 * Push nodes whose top is below the collapsed step bottom down by EXPAND_DELTA.
 * Expanded host grows downward from the collapsed top edge.
 * @param {object[]} vNodes
 */
function applyExpandPushDown(vNodes) {
  const expanded = vNodes.filter(isExpandedStep);
  if (!expanded.length) return;

  for (const exp of expanded) {
    const collapsedTop =
      (exp.data?.layoutCy != null ? exp.data.layoutCy - 32 : exp.y) ;
    const pushFromY = collapsedTop + 64;
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
      const off = SUB_STEP_CONTENT_OFFSETS[cat];
      if (off) {
        node.x = off.x;
        node.y = off.y;
        node.width = size.width || 160;
        node.height = size.height || 56;
      }
      continue;
    }

    let cx = node.data.layoutCx ?? CX;
    let cy =
      node.data.layoutCy ??
      36 + (node.data.layoutRank ?? 0) * ROW_PITCH;

    if (isExpandedStep(node)) {
      // Subview size comes from child VM + padding; never shrink below seed min.
      // Grow downward from collapsed top (do not re-centre on layoutCy).
      const w = Math.max(node.width || 0, EXPANDED_MIN_W, size.width);
      const h = Math.max(node.height || 0, EXPANDED_MIN_H, size.height);
      const collapsedTop = cy - 32;
      node.width = w;
      node.height = h;
      node.x = cx - w / 2;
      node.y = collapsedTop;
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
