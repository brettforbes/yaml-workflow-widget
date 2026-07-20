/**
 * WorkflowSeed layout metadata (SPEC-012 L0-S4).
 * Annotates mapped Nice-DAG nodes with layoutRole / layoutRank / layoutChain / collector centres.
 */

import {
  NODE_KIND,
  WORKFLOW_END_ID,
  WORKFLOW_START_ID,
  WORKFLOW_TARGET_ID,
} from "./mapper.js";
import { collectorId, topoStepIds } from "./contextRail.js";

/** Horizontal inset from canvas left so the spine clears chrome (was 291). */
export const DIAGRAM_X_OFFSET = 100;
export const CX = 291 + DIAGRAM_X_OFFSET;
/** Default Δcy between successive rows. */
export const ROW_PITCH = 150;
/** Δcy from a centre default_step into the first fan-out (split) row — looser diagonals. */
export const FIRST_SPLIT_PITCH = 180;
export const COLLECTOR_GAP = 90;
export const LEFT_CHAIN_CX = 111 + DIAGRAM_X_OFFSET;
export const RIGHT_CHAIN_CX = 471 + DIAGRAM_X_OFFSET;

const STEP_W = 180;

/**
 * Longest-path rank from workflow entry (start or target).
 * @param {object[]} stepNodes
 * @param {string} entryParentId
 * @returns {Map<string, number>}
 */
export function assignLayoutRanks(stepNodes, entryParentId) {
  const byId = new Map(stepNodes.map((n) => [n.id, n]));
  const ranks = new Map();

  const depth = (id, seen = new Set()) => {
    if (ranks.has(id)) return ranks.get(id);
    if (seen.has(id)) return 0;
    seen.add(id);
    const node = byId.get(id);
    if (!node) return 0;
    const deps = (node.dependencies || []).filter((d) => byId.has(d));
    let base = 0;
    if (deps.length === 0) {
      base = entryParentId === WORKFLOW_START_ID ? 1 : 2;
    } else {
      base = Math.max(...deps.map((d) => depth(d, seen))) + 1;
    }
    ranks.set(id, base);
    return base;
  };

  for (const n of stepNodes) depth(n.id);
  return ranks;
}

/**
 * Chain length downstream (for fan-out left/right pick).
 * @param {string} id
 * @param {Map<string, string[]>} childrenOf
 * @returns {number}
 */
function chainLength(id, childrenOf) {
  const kids = (childrenOf.get(id) || []).filter((k) => childrenOf.has(k) || true);
  const stepKids = kids;
  if (!stepKids.length) return 1;
  return 1 + Math.max(...stepKids.map((k) => chainLength(k, childrenOf)));
}

/**
 * Assign layoutChain + layoutRole for steps.
 * @param {object[]} stepNodes
 * @returns {Map<string, { chain: string, role: string }>}
 */
export function assignLayoutChains(stepNodes) {
  const byId = new Map(stepNodes.map((n) => [n.id, n]));
  const childrenOf = new Map();
  for (const n of stepNodes) {
    for (const dep of n.dependencies || []) {
      if (!byId.has(dep)) continue;
      if (!childrenOf.has(dep)) childrenOf.set(dep, []);
      childrenOf.get(dep).push(n.id);
    }
  }

  const chains = new Map();

  const visit = (id, chain) => {
    const kids = (childrenOf.get(id) || []).slice();
    if (!chains.has(id)) {
      chains.set(id, {
        chain: chain || "centre",
        role: chain === "right" ? "mirror_step" : "default_step",
      });
    }

    if (kids.length <= 1) {
      if (kids[0]) visit(kids[0], chains.get(id).chain);
      return;
    }

    const scored = kids.map((kid, idx) => ({
      id: kid,
      idx,
      len: chainLength(kid, childrenOf),
    }));
    scored.sort((a, b) => b.len - a.len || a.idx - b.idx);
    scored.forEach((entry, pos) => {
      const kidChain =
        kids.length === 2
          ? pos === 0
            ? "left"
            : "right"
          : pos % 2 === 0
            ? "left"
            : "right";
      chains.set(entry.id, {
        chain: kidChain,
        role: kidChain === "right" ? "mirror_step" : "default_step",
      });
      visit(entry.id, kidChain);
    });
  };

  const roots = stepNodes.filter(
    (n) => !(n.dependencies || []).some((d) => byId.has(d))
  );
  for (const r of roots) visit(r.id, "centre");

  for (const n of stepNodes) {
    if (!chains.has(n.id)) {
      chains.set(n.id, { chain: "centre", role: "default_step" });
    }
  }
  return chains;
}

function stepCenterX(chain) {
  if (chain === "left") return LEFT_CHAIN_CX;
  if (chain === "right") return RIGHT_CHAIN_CX;
  return CX;
}

function collectorCenter(stepCx, chain, role, sharedCx) {
  if (sharedCx != null) return sharedCx;
  if (role === "mirror_step" || chain === "right") {
    return stepCx - STEP_W / 2 - COLLECTOR_GAP;
  }
  return stepCx + STEP_W / 2 + COLLECTOR_GAP;
}

/**
 * Mutate mapped nodes with WorkflowSeed layout metadata.
 * @param {object[]} nodes
 * @param {string} entryParentId
 */
export function annotateWorkflowSeedLayout(nodes, entryParentId) {
  const start = nodes.find((n) => n.id === WORKFLOW_START_ID);
  const target = nodes.find((n) => n.id === WORKFLOW_TARGET_ID);
  const end = nodes.find((n) => n.id === WORKFLOW_END_ID);
  const stepNodes = nodes.filter((n) => n.data?.kind === NODE_KIND.STEP);
  const ranks = assignLayoutRanks(stepNodes, entryParentId);
  const chains = assignLayoutChains(stepNodes);

  const maxStepRank = stepNodes.length
    ? Math.max(...stepNodes.map((s) => ranks.get(s.id) || 0))
    : 0;
  const endRank = maxStepRank + 1;

  const splitRows = new Map();
  for (const step of stepNodes) {
    const rank = ranks.get(step.id) || 0;
    if (!splitRows.has(rank)) splitRows.set(rank, []);
    splitRows.get(rank).push(step);
  }

  let firstSplitRank = null;
  for (const [rank, stepsAtRank] of [...splitRows.entries()].sort(
    (a, b) => a[0] - b[0]
  )) {
    if (stepsAtRank.length >= 2) {
      firstSplitRank = rank;
      break;
    }
  }

  /** cy by layoutRank — ROW_PITCH normally; FIRST_SPLIT_PITCH into first fan-out row. */
  const rankCy = new Map([[0, 36]]);
  for (let r = 1; r <= endRank; r++) {
    const prev = rankCy.get(r - 1) ?? 36;
    const pitch = r === firstSplitRank ? FIRST_SPLIT_PITCH : ROW_PITCH;
    rankCy.set(r, prev + pitch);
  }

  if (start) {
    start.data.layoutRole = "transition";
    start.data.layoutRank = 0;
    start.data.layoutChain = "centre";
    start.data.layoutCx = CX;
    start.data.layoutCy = rankCy.get(0);
  }

  if (target) {
    target.data.layoutRole = "target";
    target.data.layoutRank = 1;
    target.data.layoutChain = "centre";
    target.data.layoutCx = CX;
    target.data.layoutCy = rankCy.get(1);
  }

  for (const step of stepNodes) {
    const rank = ranks.get(step.id) || 0;
    const { chain, role } = chains.get(step.id) || {
      chain: "centre",
      role: "default_step",
    };
    const cy = rankCy.get(rank) ?? 36 + rank * ROW_PITCH;
    const cx = stepCenterX(chain);
    step.data.layoutRole = role;
    step.data.layoutRank = rank;
    step.data.layoutChain = chain;
    step.data.layoutCx = cx;
    step.data.layoutCy = cy;
    step.data.collapsed = step.collapse !== false;
    step.data.contextSide = chain === "right" ? "left" : "right";
  }

  const sharedCollectorCxByRank = new Map();
  for (const [rank, stepsAtRank] of splitRows) {
    if (stepsAtRank.length >= 2) sharedCollectorCxByRank.set(rank, CX);
  }

  // One layout pass per collector node (shared split rows already merged in mapper).
  const placedCollectors = new Set();
  for (const step of stepNodes) {
    const rank = ranks.get(step.id) || 0;
    const { chain, role } = chains.get(step.id) || {
      chain: "centre",
      role: "default_step",
    };
    const cy = rankCy.get(rank) ?? 36 + rank * ROW_PITCH;
    const cx = stepCenterX(chain);
    const colNode = nodes.find(
      (n) =>
        n.data?.kind === NODE_KIND.CONTEXT_COLLECTOR &&
        (n.id === collectorId(step.id) ||
          (Array.isArray(n.data?.forSteps) &&
            n.data.forSteps.includes(step.id)))
    );
    if (!colNode || placedCollectors.has(colNode.id)) continue;
    placedCollectors.add(colNode.id);
    const shared = sharedCollectorCxByRank.get(rank);
    const ccx = collectorCenter(cx, chain, role, shared);
    colNode.data.layoutRole = "collector";
    colNode.data.layoutRank = rank;
    colNode.data.layoutChain = shared ? "centre" : chain;
    colNode.data.layoutCx = ccx;
    colNode.data.layoutCy = cy;
  }

  if (end) {
    end.data.layoutRole = "transition";
    end.data.layoutRank = endRank;
    end.data.layoutChain = "centre";
    end.data.layoutCx = CX;
    end.data.layoutCy = rankCy.get(endRank);
  }

  // Nested category leaves (Nice-DAG subview children) — not top-level nodes.
  for (const step of stepNodes) {
    for (const child of step.children || []) {
      if (!child.data) child.data = {};
      child.data.layoutRole = "sub_step";
      child.data.contextSide = step.data.contextSide;
    }
  }
}
