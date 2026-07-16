# NiceDag API

Source: `docs/api-ref/nice-dag.md`, summary tables in `docs/api-ref/api-ref.md`

Obtain via Vue: `const niceDag = niceDagReactive.use()`.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| id | string | Diagram id |
| config | NiceDagConfig | Active configuration |

## Read / navigate (all modes)

### setScale

`(scale: number) => void` — scale from 0 to 1.

```js
niceDag.setScale(0.75);
```

### center

`(size: Size) => NiceDag` — center diagram in parent size.

```js
niceDag.center({ width: bounds.width, height: 400 });
```

### scrollTo

`(id: string) => void` — scroll main layer to node element.

```js
niceDag.scrollTo("sfp_cli_nmap");
```

### setDirection

`(direction: NiceDagDirection) => void`

```js
niceDag.setDirection("TB");
```

### getScrollPosition

`() => Point`

### getAllNodes / getAllEdges

```js
const nodes = niceDag.getAllNodes();
const edges = niceDag.getAllEdges();
```

### withNodes

`(nodes: Node[]) => NiceDag` — replace model and rebuild view.

```js
niceDag.withNodes(nextNodes);
```

### findNodeById / getElementByNodeId / getEdgeLabel

```js
const n = niceDag.findNodeById("task");
const el = niceDag.getElementByNodeId("task");
const labelEl = niceDag.getEdgeLabel("start", "task");
```

### fireNiceDagChange / fireMinimapChange

`() => void` — notify listeners / refresh minimap.

### render

`() => void` — render diagram (adaptor-managed in Vue/React).

## Editable-only APIs

Require editable construction + usually `startEditing()`.

### startEditing / stopEditing

```js
niceDag.startEditing();
niceDag.stopEditing();
```

### prettify

`() => void` — re-layout from dependencies. Skips a node currently being edited.

```js
niceDag.prettify();
```

### addNode

`(node: Node, point: Point, targetNodeId?: string) => void`

```js
niceDag.addNode({ id: "new-1", data: { label: "Step" } }, { x: 40, y: 40 });
// as child:
niceDag.addNode({ id: "child-1" }, { x: 10, y: 10 }, "parent-id");
```

### addJointNode

`(node: Node, point: Point, targetNodeId?: string) => void` — same pattern for joint nodes.

### startNodeDragging / startEdgeDragging

Bound from node/connector mousedown in Vue renderers (see [vue-editable.md](vue-editable.md)):

```js
niceDag.startNodeDragging(node, mouseEvent);
niceDag.startEdgeDragging(node, mouseEvent);
```
