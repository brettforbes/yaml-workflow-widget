/**
 * Orthogonal edge attachment for WorkflowSeed (SPEC-012 L0-S10 / seed §2.5).
 * @param {{ source: object, target: object }} edge
 * @returns {{ source: { x: number, y: number }, target: { x: number, y: number } }}
 */
export function mapWorkflowSeedEdgeToPoints({ source, target }) {
  const srcKind = source.data?.kind;
  const tgtKind = target.data?.kind;
  const srcRole = source.data?.layoutRole;
  const tgtRole = target.data?.layoutRole;

  const centre = (node) => ({
    x: node.x + (node.width || 0) / 2,
    y: node.y + (node.height || 0) / 2,
  });

  const stepPort = (node, which) => {
    const cx = node.x + (node.width || 180) / 2;
    if (which === "in") return { x: cx, y: node.y };
    if (which === "out") return { x: cx, y: node.y + (node.height || 64) };
    if (which === "ctx") {
      const side = node.data?.contextSide === "left" ? "left" : "right";
      if (side === "left") {
        return { x: node.x, y: node.y + (node.height || 64) / 2 };
      }
      return { x: node.x + (node.width || 180), y: node.y + (node.height || 64) / 2 };
    }
    return { x: cx, y: node.y + (node.height || 64) / 2 };
  };

  if (
    srcRole === "default_step" ||
    srcRole === "mirror_step" ||
    srcKind === "cli-step"
  ) {
    if (tgtRole === "collector" || tgtKind === "context-collector") {
      const from = stepPort(source, "ctx");
      const to = centre(target);
      return { source: from, target: to };
    }
    if (
      tgtRole === "default_step" ||
      tgtRole === "mirror_step" ||
      tgtRole === "target" ||
      tgtKind === "cli-step" ||
      tgtKind === "workflow-target"
    ) {
      const from = stepPort(source, "out");
      const to =
        tgtRole === "target" || tgtKind === "workflow-target"
          ? { x: target.x + (target.width || 140) / 2, y: target.y }
          : stepPort(target, "in");
      return { source: from, target: to };
    }
  }

  if (srcRole === "collector" || srcKind === "context-collector") {
    if (tgtRole === "collector" || tgtKind === "context-collector") {
      const from = {
        x: source.x + (source.width || 32) / 2,
        y: source.y + (source.height || 32),
      };
      const to = { x: target.x + (target.width || 32) / 2, y: target.y };
      return { source: from, target: to };
    }
    if (tgtRole === "transition" || tgtKind === "workflow-end") {
      const from = {
        x: source.x + (source.width || 32) / 2,
        y: source.y + (source.height || 32),
      };
      const to = centre(target);
      return { source: from, target: to };
    }
  }

  if (srcKind === "workflow-start" || srcRole === "transition") {
    const from = {
      x: source.x + (source.width || 72) / 2,
      y: source.y + (source.height || 72),
    };
    const to =
      tgtRole === "target" || tgtKind === "workflow-target"
        ? { x: target.x + (target.width || 140) / 2, y: target.y }
        : stepPort(target, "in");
    return { source: from, target: to };
  }

  return { source: centre(source), target: centre(target) };
}

/**
 * Nice-DAG mapEdgeToPoints adapter.
 * @param {{ source: object, target: object }} edge
 */
export function mapWorkflowSeedEdgeToPointsNiceDag(edge) {
  return mapWorkflowSeedEdgeToPoints(edge);
}
