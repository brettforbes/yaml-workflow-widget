# Vue3 sub-DAG (node groups)

Source: `docs/tutorial-vue3/subview.md`

## Two model shapes

Controlled by `modelType` on `useNiceDag` config (`HIERARCHY` default, or `FLATTEN`).

### Hierarchical

```js
const NodeData = [
  { id: "start" },
  {
    id: "task",
    dependencies: ["start"],
    children: [
      { id: "sub-task-1" },
      { id: "sub-task-2", dependencies: ["sub-task-1"] },
    ],
  },
  { id: "end", dependencies: ["task"] },
];
// modelType defaults to HIERARCHY — no change required
```

### Flatten

```js
const NodeData = [
  { id: "start" },
  { id: "task", dependencies: ["start"] },
  { id: "sub-task1", parentId: "task" },
  { id: "sub-task2", parentId: "task", dependencies: ["sub-task1"] },
  { id: "end", dependencies: ["task"] },
];

useNiceDag({ initNodes: NodeData, getNodeSize, modelType: "FLATTEN" }, false);
```

## Critical rules

1. **All `id`s must be unique** across the whole diagram (including nested). `NiceDagNodes` uses Vue Teleport keyed by id.
2. After init, detect groups via **`children`** on `IViewNode` even if you authored FLATTEN `parentId`.
3. Expanded group size is driven by children + **`subViewPadding`**, not `getNodeSize`.

Default padding:

```js
{ top: 40, bottom: 20, left: 20, right: 20 }
```

## Renderer pattern

```js
const GroupControl = {
  props: ["node"],
  render() {
    return (
      <div className="my-first-dag-node-group-content">
        <div>
          {this.node.data?.label || this.node.id}
          <button onClick={() => this.node.shrink()}>-</button>
        </div>
      </div>
    );
  },
};

const NodeControl = {
  props: ["node"],
  render() {
    return (
      <div>
        <span>{this.node.data?.label || this.node.id}</span>
        {this.node.children?.length > 0 && (
          <button onClick={() => this.node.expand()}>+</button>
        )}
      </div>
    );
  },
};

export const SampleNode = {
  props: ["node", "niceDagReactive"],
  render() {
    const expanded = this.node.children?.length > 0 && !this.node.collapse;
    return (
      <div className="my-first-dag-node">
        {expanded ? (
          <GroupControl node={this.node} />
        ) : (
          <NodeControl node={this.node} />
        )}
      </div>
    );
  },
};
```

## Lazy children

`IViewNode.withChildren(promise, useCache?)` loads children asynchronously — useful for large YAML workflows.
