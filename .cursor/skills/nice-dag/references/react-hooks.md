# React adaptor hooks (parity)

Sources: `docs/api-ref/useNiceDag.md`, `useNiceDagNode.md`, `useNiceDagEdge.md`

Use when the consumer is React. Core model/config/API are the same as Vue.

## useNiceDag

```ts
useNiceDag(args: UseNiceDagArgs): UseNiceDagType
```

Extends NiceDagConfig plus:

| Name | Required | Description |
|------|----------|-------------|
| editable | No | default `false` |
| initNodes | Yes | Node[] |
| scrollPosition | No | Point |
| renderNode | Yes | `(props) => ReactNode` |
| renderEdge | No | edge renderer |
| onMount | No | callback after init |

Returns: `niceDagEl`, `minimapEl`, `nicedag`, `render()`, `reset()`.

**Note:** `render()` must be called inside the DAG container.

## useNiceDagNode

```ts
useNiceDagNode({ node, niceDag }) => {
  onNodeRemove,
  startEdgeDragging,
  startNodeDragging,
}
```

Wire to mouse handlers on node/connector DOM.

## useNiceDagEdge

```ts
useNiceDagEdge(edge) => { onEdgeRemove, onNodeInsert }
```

- `onEdgeRemove()` — delete edge
- `onNodeInsert(nodes, offset?)` — insert between source and target

## Example — editable node drag (React)

```jsx
const { startNodeDragging, onNodeRemove } = useNiceDagNode({ node, niceDag });
return (
  <div>
    <div onMouseDown={startNodeDragging}>{node.id}</div>
    <button onClick={onNodeRemove}>X</button>
  </div>
);
```
