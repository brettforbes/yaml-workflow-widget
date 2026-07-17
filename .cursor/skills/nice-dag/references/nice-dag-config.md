# NiceDagConfig

Sources: `docs/api-ref/nice-dag-config.md`, `docs/api-ref/api-ref.md`

Passed as the first argument to Vue `useNiceDag(config, editable)` (and React `useNiceDag`).

## Properties

| Property | Optional | Description | Default |
|----------|----------|-------------|---------|
| mode | Yes | `DEFAULT` or `WITH_JOINT_NODES` | DEFAULT |
| graphLabel | Yes | dagre GraphLabel | `{ rankdir: "LR", ranksep: 60, edgesep: 10 }` |
| gridConfig | Yes | Edit-mode grid | `{ color: "blue", size: 40 }` |
| modelType | Yes | `HIERARCHY` or `FLATTEN` | HIERARCHY |
| edgeConnectorType | Yes | Default node connector | CENTER_OF_BORDER |
| jointEdgeConnectorType | Yes | Joint node connector | CENTER |
| subViewPadding | Yes | Padding inside groups | `{ top:40, bottom:20, left:20, right:20 }` |
| minimapConfig | Yes | Minimap CSS class names | — |
| getNodeSize | **No** | `(node: Node) => Size` | mandatory |

Vue also takes `initNodes: Node[]` (required) and optional scroll position via adaptor args.

## Enums

### NiceDagMode

| Value | Meaning |
|-------|---------|
| DEFAULT | No auto joint nodes |
| WITH_JOINT_NODES | Create joint nodes by default |

### NiceDagModelType

| Value | Meaning |
|-------|---------|
| HIERARCHY | `children` defines groups |
| FLATTEN | `parentId` associates group members |

### NiceDagDirection

| Value | Meaning |
|-------|---------|
| LR | Left → right |
| RL | Right → left |
| TB | Top → bottom |
| BT | Bottom → top |

## GraphLabel (common fields)

| Property | Description | Default |
|----------|-------------|---------|
| ranksep | Distance between ranks | 60 |
| edgesep | Distance between edges | 10 |
| rankdir | `LR` `RL` `TB` `BT` | LR |

Other dagre fields (`nodesep`, `marginx`, `align`, `ranker`, …) are available; see dagre docs when needed.

## GridConfig (editable only)

| Property | Description |
|----------|-------------|
| gridSize | Width & height of grid cell |
| color | Grid color |

## MinimapConfig

| Property | Description |
|----------|-------------|
| className | Minimap container class |
| viewBoxClassName | View-box class inside minimap |

## EdgeAttributes

| Property | Type | Description |
|----------|------|-------------|
| color | string | Edge color |
| hideArrow | boolean | Hide arrowhead |

## Examples

**TB workflow layout:**

```js
{
  initNodes,
  getNodeSize: () => ({ width: 140, height: 56 }),
  graphLabel: { rankdir: "TB", ranksep: 72, edgesep: 12 },
}
```

**Flatten model + group padding:**

```js
{
  initNodes,
  getNodeSize,
  modelType: "FLATTEN",
  subViewPadding: { top: 48, bottom: 24, left: 24, right: 24 },
}
```

**Edit grid:**

```js
{
  initNodes,
  getNodeSize,
  gridConfig: { gridSize: 20, color: "#ccd" },
}
```
