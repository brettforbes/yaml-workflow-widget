# Vue3 editable DAG

Sources: `docs/tutorial-vue3/node-drag-drop.md`, `edge-drag-drop.md`, `node-creation.md`, `node-deletion.md`

## Enable editing

1. Second argument to `useNiceDag` must be `true`.
2. Call `startEditing()` after mount (editing starts disabled).

```js
const { niceDagEl, niceDagReactive } = useNiceDag(
  { initNodes: NodeData, getNodeSize },
  true
);

onMounted(() => {
  const niceDag = niceDagReactive.use();
  if (!niceDag) return;
  niceDag.startEditing();
  const bounds = niceDagEl.value.getBoundingClientRect();
  niceDag.center({ width: bounds.width, height: 400 });
});
```

View/Edit product toggle: `startEditing()` / `stopEditing()` on the same instance.

## Node drag-and-drop

Bind mousedown on an **inner** handle, not the outer node root (avoids fighting delete/connector clicks).

```vue
<template>
  <div class="my-first-dag-node">
    <div @mousedown="startNodeDragging">
      <span>{{ node.data?.label || node.id }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "EditableNode",
  props: ["node", "niceDagReactive"],
  setup(props) {
    return {
      startNodeDragging(e) {
        props.niceDagReactive.use().startNodeDragging(props.node, e);
      },
    };
  },
};
</script>
```

```css
.my-first-dag-node > span {
  display: block;
  height: 100%;
  width: 100%;
}
```

## Edge drag-and-drop (connect)

Connector component on the node:

```vue
<template>
  <div class="my-first-dag-connector" @mousedown="startEdgeDragging" />
</template>
<script>
export default {
  name: "EditableConnector",
  props: ["node", "niceDag"],
  setup(props) {
    return {
      startEdgeDragging(e) {
        if (props.node) props.niceDag.startEdgeDragging(props.node, e);
      },
    };
  },
};
</script>
```

```css
.my-first-dag-connector {
  width: 16px;
  height: 16px;
  border: 1px solid black;
  border-radius: 50%;
  position: absolute;
  top: 0;
  bottom: 0;
  right: -8px;
  background: white;
  cursor: pointer;
}
```

Compose into the node:

```vue
<div class="my-first-dag-node">
  <div @mousedown="startNodeDragging">
    <span>{{ node.data?.label || node.id }}</span>
  </div>
  <EditableConnector :node="node" :niceDag="niceDagReactive.use()" />
</div>
```

## Add node

Unique id required.

```js
let nodeCtnRef = 0;
function addNode() {
  niceDagReactive.use().addNode(
    { id: `new-node-${nodeCtnRef}` },
    { x: 40, y: 40 }
  );
  nodeCtnRef += 1;
}
```

Optional third arg `targetNodeId` adds as child of that parent.

## Delete node

Dedicated control calling `node.remove()`:

```vue
<a @click="removeNode">X</a>
```

```js
removeNode() {
  props.node.remove();
}
```

```css
.my-first-dag-node > a {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 1;
}
```

## After bulk edits

```js
niceDag.prettify();
```

## Editable checklist

- [ ] `useNiceDag(..., true)`
- [ ] `startEditing()`
- [ ] Inner drag handle
- [ ] Connector for edge DnD
- [ ] Unique ids on create
- [ ] Delete control separate from drag handle
