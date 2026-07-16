# Vue3 edge rendering

Source: `docs/tutorial-vue3/render-edge.md`

Extends the read-only DAG. Edges are derived from dependencies; you only customize **labels / chrome**.

## Edge component

```js
export const Edge = {
  props: ["source", "target"],
  render() {
    return (
      <div className="my-first-dag-edge">
        {this.source.id} to {this.target.id}
      </div>
    );
  },
};
```

```css
.my-first-dag-edge {
  text-align: center;
  margin-top: -20px; /* sit label above/below the path */
}
```

## NiceDagEdges

```vue
<template>
  <div>
    <div class="my-first-dag" ref="niceDagEl" />
    <NiceDagNodes v-slot="slotProps" :niceDagReactive="niceDagReactive">
      <SampleNode :node="slotProps.node" />
    </NiceDagNodes>
    <NiceDagEdges v-slot="slotProps" :niceDagReactive="niceDagReactive">
      <Edge
        :source="slotProps.edge.source"
        :target="slotProps.edge.target"
      />
    </NiceDagEdges>
  </div>
</template>
```

```js
import { NiceDagNodes, NiceDagEdges, useNiceDag } from "@ebay/nice-dag-vue3";
```

## YAML-oriented tip

Put edge semantics in node `dependencies` + optional label text from `data` on source/target (e.g. show `uses` on the node, keep edge label short: “needs”).
