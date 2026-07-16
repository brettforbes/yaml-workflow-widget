---
name: nice-dag
description: >-
  Build and customize Nice-DAG Vue3 diagrams (read-only and editable): nodes,
  edges, sub-DAGs, drag-drop, create/delete, zoom/minimap, and YAML-DSL-ready
  node data. Use when working with Nice-DAG, @ebay/nice-dag-vue3,
  @ebay/nice-dag-core, DAG views, workflow diagrams, or mapping YAML workflow
  steps onto a DAG canvas.
---

# Nice-DAG Vue System

## Purpose

Use this skill when creating, editing, or extending Nice-DAG diagrams in Vue3 — especially read-only vs editable views that will later host YAML workflow DSL step details on the canvas next to a code window.

## Skill trigger (≤50 words)

Trigger for Nice-DAG / `@ebay/nice-dag-vue3` / `@ebay/nice-dag-core`: read-only or editable DAG, Vue `useNiceDag`, `NiceDagNodes`/`NiceDagEdges`, node/edge DnD, sub-DAG groups, minimap/zoom, or mapping YAML workflow steps onto diagram nodes.

## Meaning and goals

Nice-DAG is not just a layout library. **dagre** computes coordinates; **nice-dag-core** owns the DOM hosts for the diagram, nodes, and edges, plus zoom, minimap, and edit gestures. Framework adaptors (`nice-dag-vue3`, `nice-dag-react`) bind those hosts to components.

**Goals you combine:**

| Goal | Meaning |
|------|---------|
| Present | Show a dependency graph (`id` + `dependencies`) with custom node/edge chrome |
| Navigate | Scale, center, scroll-to-node, optional minimap |
| Structure | Nest sub-DAGs via `children` (HIERARCHY) or `parentId` (FLATTEN) |
| Edit | Move nodes, draw edges, add/remove nodes, re-layout (`prettify`) |
| Extend toward YAML | Store DSL fields on `node.data`; keep View + Edit diagram modes + a YAML code pane as separate surfaces that share one model |

Prefer **workflows** (sequences of operations) over dumping every API call.

## Step-by-step instructions

### A. Bootstrap a Vue3 read-only DAG

1. Install: `npm install @ebay/nice-dag-vue3` (or yarn).
2. Create a Vue component with a sized host: `ref="niceDagEl"` and CSS height/width (e.g. `400px`).
3. Define `initNodes`: array of `{ id, dependencies?, data?, children?, parentId?, collapse? }`.
4. In `setup()`, call `useNiceDag({ initNodes, getNodeSize }, false)` — second arg `false` = read-only.
5. Mount host: `<div ref="niceDagEl" class="…"/>`.
6. Render nodes via `<NiceDagNodes v-slot="slotProps" :niceDagReactive="niceDagReactive">` and a custom node component bound to `slotProps.node`.
7. Implement **mandatory** `getNodeSize(node) => { width, height }` for leaf nodes.
8. On `onMounted`, `niceDagReactive.use()?.center({ width: bounds.width, height })` after checking `niceDag` exists.

**Example — minimal nodes:**

```js
const NodeData = [
  { id: "start" },
  { id: "task", dependencies: ["start"] },
  { id: "end", dependencies: ["task"] },
];

function getNodeSize() {
  return { width: 60, height: 60 };
}
```

**Example — useNiceDag (read-only):**

```js
import { NiceDagNodes, useNiceDag } from "@ebay/nice-dag-vue3";
import { onMounted } from "vue";

const { niceDagEl, niceDagReactive } = useNiceDag(
  { initNodes: NodeData, getNodeSize },
  false
);

onMounted(() => {
  const niceDag = niceDagReactive.use();
  if (!niceDag) return;
  const bounds = niceDagEl.value.getBoundingClientRect();
  niceDag.center({ width: bounds.width, height: 400 });
});
```

### B. Render edge labels

1. Create an edge component receiving `source` / `target` (or `slotProps.edge`).
2. Wrap with `<NiceDagEdges v-slot="slotProps" :niceDagReactive="niceDagReactive">`.
3. Style label position with CSS (often `margin-top: -20px`).

**Example:**

```vue
<NiceDagEdges v-slot="slotProps" :niceDagReactive="niceDagReactive">
  <Edge :source="slotProps.edge.source" :target="slotProps.edge.target" />
</NiceDagEdges>
```

### C. Sub-DAG / node groups

1. Choose model shape:
   - **HIERARCHY** (default): nest `children: Node[]` on the parent.
   - **FLATTEN**: set `modelType: 'FLATTEN'` and use `parentId` on children.
2. Keep every `id` **globally unique** across layers (Vue Teleport keys by id).
3. Group size comes from children + `subViewPadding` (default `{ top:40, bottom:20, left:20, right:20 }`), not `getNodeSize`.
4. In the node renderer: if `node.children?.length && !node.collapse` show group chrome with `node.shrink()`; else show leaf chrome with `node.expand()` when children exist.

**Example — hierarchical:**

```js
{
  id: "task",
  dependencies: ["start"],
  children: [
    { id: "sub-task-1" },
    { id: "sub-task-2", dependencies: ["sub-task-1"] },
  ],
}
```

**Example — flatten:**

```js
useNiceDag({ initNodes: NodeData, getNodeSize, modelType: "FLATTEN" }, false);
// children use parentId: "task"
```

### D. Switch to editable DAG

1. Call `useNiceDag(config, true)` — second argument **must** be `true`.
2. On mount: `niceDag.startEditing()` (editing is off until started).
3. Optionally later: `stopEditing()` to flip back to view-only without remounting.
4. For product UX: treat **View** = read-only (or `stopEditing`) and **Edit** = `startEditing` + DnD/create/delete affordances; keep a separate YAML code window bound to the same logical model (`node.data` / external store).

### E. Node drag-and-drop

1. Editable mode on (`true` + `startEditing`).
2. Bind `@mousedown` on an **inner** DOM (not the outer node root) to `niceDagReactive.use().startNodeDragging(node, e)`.
3. Avoid putting remove/connect handlers on the same element as the drag handle.

**Example:**

```js
startNodeDragging(e) {
  props.niceDagReactive.use().startNodeDragging(props.node, e);
}
```

### F. Edge drag-and-drop (connect nodes)

1. Add a connector child on the node (outbound handle).
2. On connector `@mousedown`: `niceDag.startEdgeDragging(node, e)`.
3. Position connector with absolute CSS (e.g. circle on the right border).

**Example:**

```js
startEdgeDragging(e) {
  if (props.node) props.niceDag.startEdgeDragging(props.node, e);
}
```

### G. Create / delete nodes

**Create:** unique id + `niceDag.addNode(node, { x, y }, targetNodeId?)`  
(`targetNodeId` adds as child of that parent.)

**Delete:** call `node.remove()` from a dedicated control (e.g. “X”), not the drag handle.

**Example — add:**

```js
niceDagReactive.use().addNode(
  { id: `new-node-${n}`, data: { label: "Step" } },
  { x: 40, y: 40 }
);
```

**Example — remove:**

```js
removeNode() {
  props.node.remove();
}
```

### H. Diagram control APIs (both modes)

After `const niceDag = niceDagReactive.use()`:

| Action | Call |
|--------|------|
| Zoom | `setScale(0..1)` |
| Center in parent | `center({ width, height })` |
| Direction | `setDirection('LR'\|'RL'\|'TB'\|'BT')` |
| Replace model | `withNodes(nodes)` |
| Find / scroll | `findNodeById`, `scrollTo(id)`, `getElementByNodeId` |
| Inspect | `getAllNodes()`, `getAllEdges()` |
| Re-layout (edit) | `prettify()` |
| Joint node (edit) | `addJointNode(node, point, targetNodeId?)` |

**Example — direction + scale:**

```js
niceDag.setDirection("TB");
niceDag.setScale(0.8);
niceDag.prettify(); // editable: re-layout; skips node currently being edited
```

### I. Config options (pass into `useNiceDag` first arg)

| Option | When / meaning | Example |
|--------|----------------|---------|
| `getNodeSize` | **Required** leaf sizing | `(node) => ({ width: 120, height: 48 })` |
| `mode` | `DEFAULT` vs `WITH_JOINT_NODES` | `mode: "WITH_JOINT_NODES"` |
| `graphLabel` | dagre layout | `{ rankdir: "LR", ranksep: 60, edgesep: 10 }` |
| `modelType` | `HIERARCHY` \| `FLATTEN` | `modelType: "FLATTEN"` |
| `edgeConnectorType` | Node edge attach point | `"CENTER_OF_BORDER"` or `"CENTER"` |
| `subViewPadding` | Group chrome padding | `{ top: 40, bottom: 20, left: 20, right: 20 }` |
| `gridConfig` | Edit grid | `{ gridSize: 40, color: "blue" }` |
| `minimapConfig` | Minimap classes | `{ className, viewBoxClassName }` |

**Example — denser TB layout with minimap host:**

```js
useNiceDag(
  {
    initNodes,
    getNodeSize,
    graphLabel: { rankdir: "TB", ranksep: 80, edgesep: 16 },
    minimapConfig: { className: "wf-minimap", viewBoxClassName: "wf-minimap-vb" },
  },
  false
);
```

### J. Extending for YAML workflow DSL (product direction)

1. Map each YAML step to a Nice-DAG `Node`: `id` ← step id; `dependencies` ← `needs` / upstream ids.
2. Put DSL payload on `data` (tool, args, export, labels) — do not invent new top-level Node fields the core ignores.
3. Keep three surfaces sharing one model: **View DAG**, **Edit DAG**, **YAML code window**.
4. View: custom renderers show step metadata from `data`. Edit: same renderers + DnD/create/delete; serialize graph back to YAML carefully (preserve unknown fields).
5. For significant UI redesign, still use core hosts + `NiceDagNodes`/`NiceDagEdges`; change chrome, not the layout engine.

**Example — YAML-shaped node:**

```js
{
  id: "sfp_cli_nmap",
  dependencies: ["sfp_cli_subfinder"],
  data: {
    label: "sfp_cli_nmap",
    uses: "tool.nmap",
    export: "scan_graph",
    yamlPath: "steps[1]",
  },
}
```

## If/Then decision rules

| If | Then |
|----|------|
| User only needs to inspect a graph | Read-only: `useNiceDag(..., false)`; skip connectors/add/delete |
| User must rearrange or rewire | Editable: second arg `true` + `startEditing()` |
| Need View/Edit toggle in one page | Keep one instance; `startEditing` / `stopEditing` (or two mounted modes sharing model) |
| Nested workflow / stage groups | Prefer HIERARCHY `children` unless the YAML source is flat — then FLATTEN + `parentId` |
| Node ids collide across groups | Stop and uniquify ids (Teleport / slot rendering breaks otherwise) |
| Group looks wrong size | Adjust `subViewPadding` / children; do not expect `getNodeSize` to size expanded groups |
| Drag conflicts with delete/connect | Move `@mousedown` drag to an inner handle; keep X/connector separate |
| Layout tangled after edits | Call `prettify()`; note: node mid-edit is skipped |
| Want auto joint nodes | `mode: WITH_JOINT_NODES` or `addJointNode` |
| Building React instead of Vue | Same core model/config; use `@ebay/nice-dag-react` hooks (`useNiceDag`, `useNiceDagNode`, `useNiceDagEdge`) — see references |
| Mapping YAML ↔ graph | Round-trip via `data` + explicit serializer; Nice-DAG does not parse YAML |

## Guardrails & pitfalls

- **Do not** skip `getNodeSize` — it is mandatory for leaf layout.
- **Do not** assume default node/edge visuals — you must supply renderers.
- **Do not** put node-drag `@mousedown` on the outermost node root if delete/connector need clicks.
- **Do not** call edit APIs without `useNiceDag(..., true)` and `startEditing()`.
- **Do not** reuse node `id`s within the diagram.
- **Do not** forget a fixed height/width on the DAG host container.
- **Do not** call `center` before `niceDagReactive.use()` is available.
- **Do not** treat edges as user-authored input lists — edges are derived from `dependencies` (then mutated via connect / insert / remove in edit mode).
- **Do not** delete or overwrite repo docs under `docs/` when extending the skill; update skill references instead.
- Spelling note from APIs: method is `destory` in some typings — prefer documented destroy/teardown patterns from the adaptor you use; always clean up on unmount.

## Strategies and tactics

### Strategy 1 — View-first, edit-second

1. Ship read-only with real YAML-mapped `data` and clear node chrome.
2. Validate topology (`dependencies`) and sizing.
3. Layer editable: `true` + `startEditing`, then drag, then connect, then add/delete.
4. Only then wire YAML code-window sync.

*Adapt:* If layout is wrong in view mode, fix `graphLabel` / `getNodeSize` before enabling edit (edit noise hides layout bugs).

### Strategy 2 — Model round-trip loop

1. YAML → nodes (`id`, `dependencies`, `data`).
2. `withNodes` or remount `initNodes`.
3. User edits graph → `getAllNodes` / `getAllEdges` → patch YAML.
4. If patch fails validation, revert with last good `withNodes` snapshot.

*Adapt:* After failed sync, keep diagram on last valid model; show YAML errors in the code pane, not by clearing the DAG.

### Strategy 3 — Progressive disclosure of structure

1. Start collapsed groups (`collapse: true`) for large workflows.
2. `expand` / `withChildren(promise)` for lazy sub-steps.
3. `scrollTo(id)` when the code window selects a step.

*Adapt:* If expand thrashs layout, call `center` or `prettify` after expand completes.

### Strategy 4 — Dual-surface editing

1. Structural edits (add edge, reorder needs) → prefer diagram in Edit mode.
2. Literal argument edits → prefer YAML pane; push into `node.data` and re-render.
3. Use `findNodeById` + `getElementByNodeId` to highlight the node matching the cursor step.

*Adapt:* If diagram and YAML diverge, treat YAML as source of truth for persistence unless the user is mid-gesture on the canvas (then debounce write-back).

### Strategy 5 — Layout recovery

1. Change `rankdir` / `ranksep` via `setDirection` or new `graphLabel`.
2. `prettify()` after bulk edits.
3. `setScale` + `center` for fit-to-viewport.

*Adapt:* If a single node was dragged on purpose, avoid immediate `prettify` (it reflows); offer an explicit “Re-layout” control.

## Comprehensive examples index

| Concern | Example location |
|---------|------------------|
| Read-only Vue DAG | Step A above; [references/vue-readonly.md](references/vue-readonly.md) |
| Edge labels | Step B; [references/vue-edges.md](references/vue-edges.md) |
| Sub-DAG HIERARCHY/FLATTEN | Step C; [references/vue-subview.md](references/vue-subview.md) |
| Editable + node DnD | Steps D–E; [references/vue-editable.md](references/vue-editable.md) |
| Edge connect | Step F; [references/vue-editable.md](references/vue-editable.md) |
| Add/remove node | Step G; [references/vue-editable.md](references/vue-editable.md) |
| Config knobs | Step I; [references/nice-dag-config.md](references/nice-dag-config.md) |
| Core NiceDag API | Step H; [references/nice-dag-api.md](references/nice-dag-api.md) |
| Node/Edge model | [references/dag-model.md](references/dag-model.md) |
| YAML DSL mapping | Step J; [references/yaml-dsl-extension.md](references/yaml-dsl-extension.md) |
| Install / packages | [references/getting-started.md](references/getting-started.md) |
| Mono-repo contrib | [references/contribution.md](references/contribution.md) |

## References directory

Full source-derived detail lives under [`references/`](references/INDEX.md). **Read INDEX first**, then open only the files needed for the current task (progressive disclosure).

Upstream docs in-repo: `docs/` (intro, getting-started, dag-model, api-ref, tutorial-vue3, contribution).
