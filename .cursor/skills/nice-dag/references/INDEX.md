# Nice-DAG skill references

Index of detailed material for [SKILL.md](../SKILL.md). Open only what the current task needs.

| File | Covers | Upstream docs |
|------|--------|----------------|
| [overview.md](overview.md) | What Nice-DAG is; core vs adaptors; read-only vs editable | `docs/intro.md` |
| [getting-started.md](getting-started.md) | Install Vue3/React; first DAG pointer | `docs/getting-started.md` |
| [dag-model.md](dag-model.md) | Node, IViewNode, Edge, IEdge, geometry, connectors | `docs/dag-model/*` |
| [nice-dag-config.md](nice-dag-config.md) | NiceDagConfig, enums, graphLabel, grid, minimap | `docs/api-ref/nice-dag-config.md`, `api-ref.md` |
| [nice-dag-api.md](nice-dag-api.md) | NiceDag control + editable APIs | `docs/api-ref/nice-dag.md` |
| [vue-readonly.md](vue-readonly.md) | Vue3 read-only workflow end-to-end | `docs/tutorial-vue3/read-only-dag.md` |
| [vue-edges.md](vue-edges.md) | NiceDagEdges edge rendering | `docs/tutorial-vue3/render-edge.md` |
| [vue-subview.md](vue-subview.md) | Sub-DAG groups HIERARCHY / FLATTEN | `docs/tutorial-vue3/subview.md` |
| [vue-editable.md](vue-editable.md) | Edit mode, node/edge DnD, add, delete | `docs/tutorial-vue3/node-*.md`, `edge-drag-drop.md` |
| [react-hooks.md](react-hooks.md) | React adaptor hooks (parity reference) | `docs/api-ref/useNiceDag*.md` |
| [yaml-dsl-extension.md](yaml-dsl-extension.md) | Mapping YAML workflow DSL onto Nice-DAG | Product direction + model fields |
| [contribution.md](contribution.md) | PNPM mono-repo build & examples | `docs/contribution/contribution.md` |

## How to use

1. Match the user goal to a row above.
2. Read that reference file.
3. Apply the matching workflow in `SKILL.md`.
4. If implementing library changes, also inspect `packages/nice-dag-core` and `packages/nice-dag-vue3`.
