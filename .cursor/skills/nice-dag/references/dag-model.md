# DAG model

Sources: `docs/dag-model/node.md`, `edge.md`, `geometry.md`

## Geometry

### Size

| Property | Type |
|----------|------|
| width | number |
| height | number |

### Point

| Property | Type |
|----------|------|
| x | number |
| y | number |

### Padding

| Property | Type |
|----------|------|
| top, bottom, left, right | number |

## Node (input model)

Unit of the diagram (activity, task, workflow step).

| Property | Required | Description |
|----------|----------|-------------|
| id | Yes | Unique identifier |
| dependencies | No | IDs this node depends on (upstream) |
| data | No | Flexible JSON (labels, YAML DSL fields, etc.) |
| children | No | Child nodes (group / sub-DAG) |
| parentId | No | Parent id when using FLATTEN model |
| collapse | No | Hide children when true |
| edgeConnectorType | No | `CENTER_OF_BORDER` (default) or `CENTER` |

### EdgeConnectorType

| Enum | Meaning |
|------|---------|
| CENTER_OF_BORDER | Attach at center of node border |
| CENTER | Attach at node center |

## IViewNode (runtime)

After init, each Node is wrapped as `IViewNode`:

| API | Signature | Purpose |
|-----|-----------|---------|
| shrink | `() => void` | Hide children |
| expand | `() => void` | Show children |
| remove | `() => void` | Delete node |
| withChildren | `(promise: Promise<Node[]>, useCache?: boolean) => void` | Replace/load children |
| joint | `boolean` | Joint-node flag |
| setPoint | `(point: Point) => void` | Position |
| connect | `(node: IViewNode) => void` | Create edge to node |
| addChildNode | `(node: Node, point: Point) => void` | Add child |

## Edge

Edges are **not** authored as a separate input list. Nice-DAG builds them from `dependencies`.

| Property | Description |
|----------|-------------|
| source | IViewNode |
| target | IViewNode |

### IEdge API

| API | Signature | Purpose |
|-----|-----------|---------|
| remove | `() => void` | Delete edge |
| insertNodes | `(nodes: Node[], offset?: number) => void` | Insert nodes between source and target |

## Examples

**Leaf with metadata:**

```js
{ id: "sfp_cli_httpx", dependencies: ["sfp_cli_subfinder"], data: { uses: "tool.httpx", export: "none" } }
```

**Group (hierarchy):**

```js
{ id: "scan", children: [{ id: "a" }, { id: "b", dependencies: ["a"] }] }
```

**Group (flatten child):**

```js
{ id: "a", parentId: "scan" }
```
