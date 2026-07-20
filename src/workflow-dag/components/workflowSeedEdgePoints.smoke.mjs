/**
 * Edge endpoints must follow expand push-down (y moves; layoutCy stays seed).
 * Run: node src/workflow-dag/components/workflowSeedEdgePoints.smoke.mjs
 */
import { mapWorkflowSeedEdgeToPoints } from "./workflowSeedEdgePoints.js";

const EXPAND_DELTA = 464;
const CX = 291;

function step(id, cy, { expanded = false, y = cy - 32 } = {}) {
  return {
    id,
    x: CX - 90,
    y,
    width: expanded ? 214 : 180,
    height: expanded ? 528 : 64,
    collapse: !expanded,
    children: expanded ? [{ id: `${id}__input` }] : [],
    data: {
      layoutRole: "default_step",
      kind: "cli-step",
      layoutCx: CX,
      layoutCy: cy,
      contextSide: "right",
    },
  };
}

function collector(id, cy, { y = cy - 16 } = {}) {
  return {
    id,
    x: CX + 90 + 90 - 16,
    y,
    width: 32,
    height: 32,
    data: {
      layoutRole: "collector",
      kind: "context-collector",
      layoutCx: CX + 180,
      layoutCy: cy,
    },
  };
}

function endTransition(cy, { y = cy - 36 } = {}) {
  return {
    id: "__workflow_end__",
    x: CX - 36,
    y,
    width: 72,
    height: 72,
    data: {
      layoutRole: "transition",
      kind: "workflow-end",
      layoutCx: CX,
      layoutCy: cy,
    },
  };
}

// Collapsed: semantic step→collector on shared row
{
  const s = step("a", 200);
  const c = collector("__ctx_a__", 200);
  const { source, target } = mapWorkflowSeedEdgeToPoints({ source: s, target: c });
  if (Math.abs(source.y - 200) > 0.5 || Math.abs(target.y - 200) > 0.5) {
    console.error("FAIL: collapsed semantic row must sit on cy=200", source, target);
    process.exit(1);
  }
}

// After push-down: collector+end moved by EXPAND_DELTA; edges must follow visual y
{
  const seedCy = 350;
  const pushedY = seedCy - 16 + EXPAND_DELTA;
  const c = collector("__ctx_b__", seedCy, { y: pushedY });
  const e = endTransition(500, { y: 500 - 36 + EXPAND_DELTA });
  const { source, target, path } = mapWorkflowSeedEdgeToPoints({
    source: c,
    target: e,
  });
  const colVisualCy = seedCy + EXPAND_DELTA;
  const endVisualCy = e.y + e.height / 2;
  // Must not remain stuck on seed layoutCy (pre-push row)
  if (Math.abs(source.y - seedCy) < 8) {
    console.error("FAIL: collector endpoint still on seed cy", source.y, seedCy);
    process.exit(1);
  }
  if (Math.abs(target.y - 500) < 8) {
    console.error("FAIL: end endpoint still on seed cy", target.y);
    process.exit(1);
  }
  // Perimeter points must sit on the circles at visual centres
  const colC = { x: c.x + 16, y: colVisualCy };
  const endC = { x: e.x + 36, y: endVisualCy };
  const dCol = Math.hypot(source.x - colC.x, source.y - colC.y);
  const dEnd = Math.hypot(target.x - endC.x, target.y - endC.y);
  if (Math.abs(dCol - 16) > 1 || Math.abs(dEnd - 36) > 1) {
    console.error("FAIL: push-down perimeter attach", { dCol, dEnd, path });
    process.exit(1);
  }
}

// Pushed step→collector horizontal semantic follows visual row
{
  const seedCy = 350;
  const s = step("pushed", seedCy, {
    y: seedCy - 32 + EXPAND_DELTA,
  });
  const c = collector("__ctx_pushed__", seedCy, {
    y: seedCy - 16 + EXPAND_DELTA,
  });
  const { source, target } = mapWorkflowSeedEdgeToPoints({ source: s, target: c });
  const expectCy = seedCy + EXPAND_DELTA;
  if (Math.abs(source.y - expectCy) > 0.5 || Math.abs(target.y - expectCy) > 0.5) {
    console.error("FAIL: pushed horizontal semantic must sit on visual cy", source, target);
    process.exit(1);
  }
}

// Expanded step keeps context centreline at seed layoutCy (not mid-host)
{
  const s = step("exp", 200, { expanded: true, y: 200 - 32 });
  const c = collector("__ctx_exp__", 200);
  const { source, target } = mapWorkflowSeedEdgeToPoints({ source: s, target: c });
  if (Math.abs(source.y - 200) > 0.5 || Math.abs(target.y - 200) > 0.5) {
    console.error("FAIL: expanded step context edge must stay on seed cy", source, target);
    process.exit(1);
  }
}

console.log("OK: workflowSeedEdgePoints expand push-down + expanded host centreline");
