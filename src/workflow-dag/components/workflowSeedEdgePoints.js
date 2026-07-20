/**
 * Seed §2.5 edge attachment + orthogonal routing.
 * Edges attach to port / collector / transition *perimeters* (ray through centre).
 */

const PORT_R = 6;
const COLLECTOR_R = 16;
const TRANSITION_R = 36;

function nodeCentre(node) {
  return {
    x: node.x + (node.width || 0) / 2,
    y: node.y + (node.height || 0) / 2,
  };
}

/** Point on circle perimeter of `node` toward `other`. */
function perimeterToward(node, other, radius) {
  const a = nodeCentre(node);
  const b = nodeCentre(other);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const r = radius ?? Math.min(node.width || 0, node.height || 0) / 2;
  return { x: a.x + (dx / len) * r, y: a.y + (dy / len) * r };
}

/**
 * Port centre in diagram coords (seed §2.2–2.3 relative to shape top-left).
 * @param {object} node
 * @param {'in'|'out'|'ctx'} which
 */
export function portCentre(node, which) {
  const w = node.width || 180;
  const h = node.height || 64;
  const role = node.data?.layoutRole;
  const side = node.data?.contextSide === "left" ? "left" : "right";

  if (which === "in") {
    return { x: node.x + w / 2, y: node.y };
  }
  if (which === "out") {
    return { x: node.x + w / 2, y: node.y + h };
  }
  // context port: centre of 12px circle on left/right edge mid
  if (role === "mirror_step" || side === "left") {
    return { x: node.x, y: node.y + h / 2 };
  }
  return { x: node.x + w, y: node.y + h / 2 };
}

function portPerimeter(node, which, towardNode) {
  const c = portCentre(node, which);
  const t = nodeCentre(towardNode);
  const dx = t.x - c.x;
  const dy = t.y - c.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: c.x + (dx / len) * PORT_R, y: c.y + (dy / len) * PORT_R };
}

/** Orthogonal SVG path (H/V only). Prefer vertical-then-horizontal elbow. */
export function orthogonalSvgPath(from, to) {
  if (Math.abs(from.x - to.x) < 0.5) {
    return `M${from.x},${from.y} L${to.x},${to.y}`;
  }
  if (Math.abs(from.y - to.y) < 0.5) {
    return `M${from.x},${from.y} L${to.x},${to.y}`;
  }
  const midY = (from.y + to.y) / 2;
  return `M${from.x},${from.y} L${from.x},${midY} L${to.x},${midY} L${to.x},${to.y}`;
}

function isStep(node) {
  const r = node.data?.layoutRole;
  return (
    r === "default_step" ||
    r === "mirror_step" ||
    node.data?.kind === "cli-step"
  );
}

function isSubStep(node) {
  return (
    node.data?.layoutRole === "sub_step" || node.data?.kind === "category"
  );
}

function isCollector(node) {
  return (
    node.data?.layoutRole === "collector" ||
    node.data?.kind === "context-collector"
  );
}

function isTransition(node) {
  return (
    node.data?.layoutRole === "transition" ||
    node.data?.kind === "workflow-start" ||
    node.data?.kind === "workflow-end"
  );
}

function isTarget(node) {
  return (
    node.data?.layoutRole === "target" ||
    node.data?.kind === "workflow-target"
  );
}

/**
 * @param {{ source: object, target: object }} edge
 * @returns {{ source: {x:number,y:number}, target: {x:number,y:number}, path: string }}
 */
export function mapWorkflowSeedEdgeToPoints({ source, target }) {
  let from;
  let to;

  if (isSubStep(source) && isSubStep(target)) {
    from = portPerimeter(source, "out", target);
    to = portPerimeter(target, "in", source);
  } else if (isStep(source) && isCollector(target)) {
    from = portPerimeter(source, "ctx", target);
    to = perimeterToward(target, source, COLLECTOR_R);
  } else if (isCollector(source) && isCollector(target)) {
    from = perimeterToward(source, target, COLLECTOR_R);
    to = perimeterToward(target, source, COLLECTOR_R);
  } else if (isCollector(source) && isTransition(target)) {
    from = perimeterToward(source, target, COLLECTOR_R);
    to = perimeterToward(target, source, TRANSITION_R);
  } else if (isTransition(source) && isTarget(target)) {
    from = perimeterToward(source, target, TRANSITION_R);
    to = portPerimeter(target, "in", source);
  } else if (isTransition(source) && isStep(target)) {
    from = perimeterToward(source, target, TRANSITION_R);
    to = portPerimeter(target, "in", source);
  } else if (isTarget(source) && isStep(target)) {
    from = portPerimeter(source, "out", target);
    to = portPerimeter(target, "in", source);
  } else if (isStep(source) && isStep(target)) {
    from = portPerimeter(source, "out", target);
    to = portPerimeter(target, "in", source);
  } else if (isStep(source) && isTarget(target)) {
    from = portPerimeter(source, "out", target);
    to = portPerimeter(target, "in", source);
  } else if (isTransition(source) || isTransition(target)) {
    from = isTransition(source)
      ? perimeterToward(source, target, TRANSITION_R)
      : portPerimeter(source, "out", target);
    to = isTransition(target)
      ? perimeterToward(target, source, TRANSITION_R)
      : portPerimeter(target, "in", source);
  } else {
    from = nodeCentre(source);
    to = nodeCentre(target);
  }

  return {
    source: from,
    target: to,
    path: orthogonalSvgPath(from, to),
  };
}

export function mapWorkflowSeedEdgeToPointsNiceDag(edge) {
  return mapWorkflowSeedEdgeToPoints(edge);
}
