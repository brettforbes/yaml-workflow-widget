/**
 * Seed §2.5: straight edges between port / collector / transition perimeters.
 * If extended, H/V edges pass through the shape centreline (same cx or cy).
 */

const PORT_R = 6;

function nodeCentre(node) {
  return {
    x: node.data?.layoutCx ?? node.x + (node.width || 0) / 2,
    y: node.data?.layoutCy ?? node.y + (node.height || 0) / 2,
  };
}

function circleRadius(node) {
  return Math.min(node.width || 0, node.height || 0) / 2;
}

/** Port centre (seed §2.2–2.3) in diagram coords. */
export function portCentre(node, which) {
  const c = nodeCentre(node);
  const w = node.width || 180;
  const h = node.height || 64;
  const side = node.data?.contextSide === "left" ? "left" : "right";

  if (which === "in") return { x: c.x, y: node.y };
  if (which === "out") return { x: c.x, y: node.y + h };
  if (side === "left") return { x: node.x, y: c.y };
  return { x: node.x + w, y: c.y };
}

/** Move from port centre to port perimeter toward `toward`. */
function portPerimeter(node, which, toward) {
  const c = portCentre(node, which);
  const t = nodeCentre(toward);
  const dx = t.x - c.x;
  const dy = t.y - c.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: c.x + (dx / len) * PORT_R, y: c.y + (dy / len) * PORT_R };
}

/** Circle perimeter point toward other; keeps shared centreline exact. */
function circlePerimeter(node, other) {
  const a = nodeCentre(node);
  const b = nodeCentre(other);
  const r = circleRadius(node);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Shared vertical spine — attach on exact cx
  if (Math.abs(dx) < 0.5) {
    return { x: a.x, y: a.y + (dy >= 0 ? r : -r) };
  }
  // Shared horizontal row — attach on exact cy
  if (Math.abs(dy) < 0.5) {
    return { x: a.x + (dx >= 0 ? r : -r), y: a.y };
  }
  const len = Math.hypot(dx, dy) || 1;
  return { x: a.x + (dx / len) * r, y: a.y + (dy / len) * r };
}

/**
 * When both shapes share layoutCx (or layoutCy), force endpoints onto that axis
 * so the straight edge is a true centreline segment.
 */
function snapToSharedAxis(from, to, source, target) {
  const scx = source.data?.layoutCx;
  const tcx = target.data?.layoutCx;
  if (scx != null && tcx != null && Math.abs(scx - tcx) < 0.5) {
    const x = scx;
    return { source: { x, y: from.y }, target: { x, y: to.y } };
  }
  const scy = source.data?.layoutCy;
  const tcy = target.data?.layoutCy;
  if (scy != null && tcy != null && Math.abs(scy - tcy) < 0.5) {
    const y = scy;
    return { source: { x: from.x, y }, target: { x: to.x, y } };
  }
  // Fallback: geometric centres aligned within 0.5px
  const a = nodeCentre(source);
  const b = nodeCentre(target);
  if (Math.abs(a.x - b.x) < 0.5) {
    const x = a.x;
    return { source: { x, y: from.y }, target: { x, y: to.y } };
  }
  if (Math.abs(a.y - b.y) < 0.5) {
    const y = a.y;
    return { source: { x: from.x, y }, target: { x: to.x, y } };
  }
  return { source: from, target: to };
}

export function straightSvgPath(from, to) {
  return `M${from.x},${from.y} L${to.x},${to.y}`;
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
    to = circlePerimeter(target, source);
  } else if (isCollector(source) && isCollector(target)) {
    from = circlePerimeter(source, target);
    to = circlePerimeter(target, source);
  } else if (isCollector(source) && isTransition(target)) {
    from = circlePerimeter(source, target);
    to = circlePerimeter(target, source);
  } else if (isTransition(source) && isTarget(target)) {
    from = circlePerimeter(source, target);
    to = portPerimeter(target, "in", source);
  } else if (isTransition(source) && isStep(target)) {
    from = circlePerimeter(source, target);
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
      ? circlePerimeter(source, target)
      : portPerimeter(source, "out", target);
    to = isTransition(target)
      ? circlePerimeter(target, source)
      : portPerimeter(target, "in", source);
  } else {
    from = nodeCentre(source);
    to = nodeCentre(target);
  }

  const snapped = snapToSharedAxis(from, to, source, target);
  return {
    source: snapped.source,
    target: snapped.target,
    path: straightSvgPath(snapped.source, snapped.target),
  };
}

export function mapWorkflowSeedEdgeToPointsNiceDag(edge) {
  return mapWorkflowSeedEdgeToPoints(edge);
}
