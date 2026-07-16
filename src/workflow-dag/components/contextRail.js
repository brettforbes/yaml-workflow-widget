/**
 * Lane + context-rail helpers for SPEC-012 E2-S6.
 * Odd lanes (1,3,5…) mirror chrome (context port on left).
 */

/**
 * Assign lane indices: children of the same parent get 0..n-1 in encounter order.
 * @param {object[]} stepNodes - mapped step nodes with dependencies
 * @returns {Map<string, number>}
 */
export function assignLanes(stepNodes) {
  const lanes = new Map();
  const byId = new Map(stepNodes.map((n) => [n.id, n]));
  const childrenOf = new Map();

  for (const n of stepNodes) {
    for (const dep of n.dependencies || []) {
      if (!byId.has(dep)) continue; // ignore start/target
      if (!childrenOf.has(dep)) childrenOf.set(dep, []);
      childrenOf.get(dep).push(n.id);
    }
  }

  // Roots among steps
  const roots = stepNodes.filter(
    (n) =>
      !(n.dependencies || []).some((d) => byId.has(d))
  );

  const visit = (id, lane) => {
    if (lanes.has(id)) return;
    lanes.set(id, lane);
    const kids = childrenOf.get(id) || [];
    kids.forEach((kid, i) => visit(kid, kids.length > 1 ? i : lane));
  };

  roots.forEach((r, i) => visit(r.id, i));
  // orphans
  for (const n of stepNodes) {
    if (!lanes.has(n.id)) lanes.set(n.id, 0);
  }
  return lanes;
}

/**
 * Topological order of step ids (dependencies first).
 * @param {object[]} stepNodes
 * @returns {string[]}
 */
export function topoStepIds(stepNodes) {
  const byId = new Map(stepNodes.map((n) => [n.id, n]));
  const remaining = new Set(stepNodes.map((n) => n.id));
  const done = new Set();
  const order = [];

  while (remaining.size) {
    let progressed = false;
    for (const id of [...remaining]) {
      const deps = (byId.get(id).dependencies || []).filter((d) => byId.has(d));
      if (deps.every((d) => done.has(d))) {
        order.push(id);
        done.add(id);
        remaining.delete(id);
        progressed = true;
      }
    }
    if (!progressed) {
      // cycle fallback
      for (const id of remaining) order.push(id);
      break;
    }
  }
  return order;
}

export function collectorId(stepId) {
  return `__ctxcol_${stepId}__`;
}

export function contextSideForLane(lane) {
  return lane % 2 === 1 ? "left" : "right";
}
