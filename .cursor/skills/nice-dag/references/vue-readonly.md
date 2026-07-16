# Vue3 read-only DAG

Source: `docs/tutorial-vue3/read-only-dag.md`

## Preconditions

1. Vue component with a host div and **explicit** CSS width/height.
2. `initNodes` array with unique `id`s and `dependencies`.

```vue
<template>
  <div>
    <div class="my-first-dag" ref="niceDagEl" />
  </div>
</template>
```

```css
.my-first-dag {
  height: 400px;
  width: 400px;
}
```

## Step 1 — useNiceDag

```js
import { NiceDagNodes, useNiceDag } from "@ebay/nice-dag-vue3";

const NodeData = [
  { id: "start" },
  { id: "task", dependencies: ["start"] },
  { id: "end", dependencies: ["task"] },
];

function getNodeSize() {
  return { width: 60, height: 60 };
}

const { niceDagEl, niceDagReactive } = useNiceDag(
  { initNodes: NodeData, getNodeSize },
  false // read-only
);
```

- `niceDagEl` — ref linked to the DOM host created/used by core.
- `niceDagReactive` — reactive holder; call `.use()` to get `NiceDag`.

## Step 2 — NiceDagNodes + custom renderer

Nice-DAG ships **no** default node chrome. Use `NiceDagNodes` slot:

```vue
<template>
  <div>
    <div class="my-first-dag" ref="niceDagEl" />
    <NiceDagNodes v-slot="slotProps" :niceDagReactive="niceDagReactive">
      <SampleNode :node="slotProps.node" />
    </NiceDagNodes>
  </div>
</template>
```

Sample node (JSX-style component from docs):

```js
export const SampleNode = {
  props: ["node"],
  render() {
    return (
      <div className="my-first-dag-node">
        <span>{this.node.id}</span>
      </div>
    );
  },
};
```

```css
.my-first-dag-node {
  width: 100%;
  height: 100%;
  border: 1px solid black;
}
```

## Step 3 — center on mount

```js
import { onMounted } from "vue";

onMounted(() => {
  const niceDag = niceDagReactive.use();
  if (!niceDag) return;
  const bounds = niceDagEl.value.getBoundingClientRect();
  niceDag.center({ width: bounds.width, height: 400 });
});
```

## Checklist

- [ ] Host sized
- [ ] `getNodeSize` provided
- [ ] Second arg `false`
- [ ] `NiceDagNodes` wired to `niceDagReactive`
- [ ] `center` guarded with null check
