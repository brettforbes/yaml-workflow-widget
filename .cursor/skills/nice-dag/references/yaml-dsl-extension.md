# YAML workflow DSL extension

Product direction (from skill prompt): significantly customize the diagram so it can carry YAML DSL DAG details, with **View** and **Edit** diagram modes plus a **YAML code window**.

Nice-DAG does not parse YAML. Extension is a mapping + UX layer on top of the core model.

## Mapping

| YAML idea | Nice-DAG field |
|-----------|----------------|
| Step id | `Node.id` (unique) |
| `needs` / upstream | `Node.dependencies` |
| Tool, args, export, labels | `Node.data` (flexible JSON) |
| Nested stages / groups | `children` or `parentId` + `modelType` |

### Example document → nodes

```yaml
steps:
  - id: sfp_cli_subfinder
    uses: tool.subfinder
    needs: []
  - id: sfp_cli_nmap
    uses: tool.nmap
    needs: [sfp_cli_subfinder]
```

```js
[
  {
    id: "sfp_cli_subfinder",
    dependencies: [],
    data: { uses: "tool.subfinder", label: "sfp_cli_subfinder" },
  },
  {
    id: "sfp_cli_nmap",
    dependencies: ["sfp_cli_subfinder"],
    data: { uses: "tool.nmap", label: "sfp_cli_nmap" },
  },
]
```

## Three surfaces

1. **View DAG** — `useNiceDag(..., false)` or `stopEditing()`; rich read-only chrome from `data`.
2. **Edit DAG** — `true` + `startEditing()`; structural changes (deps, add/remove, move).
3. **YAML code window** — text editor; source of truth for persistence when not mid-canvas gesture.

Share one in-memory model; serialize carefully (preserve unknown YAML keys).

## Renderer responsibilities

- Show `data.label` / `data.uses` / export badges on nodes.
- Do not fork Nice-DAG layout; customize slot components only.
- Highlight selection: `scrollTo(id)` / `getElementByNodeId` when YAML cursor moves.

## Sync tactics

1. YAML → graph: parse → `withNodes` (or remount `initNodes`).
2. Graph → YAML: `getAllNodes` + edges/`dependencies` → emit steps.
3. On conflict: keep last valid graph; surface YAML diagnostics in the code pane.
4. Debounce write-back while dragging.

## What to change in this library vs consumer app

| In nice-dag packages | In consumer (widget / app) |
|----------------------|----------------------------|
| Core gestures, layout, hosts | YAML parse/serialize |
| Vue/React adaptors | View/Edit/Code chrome |
| Optional helpers for step-shaped `data` | Domain validation |

Prefer extending **renderers and mapping** before changing core layout unless a proven gap exists in `nice-dag-core`.
