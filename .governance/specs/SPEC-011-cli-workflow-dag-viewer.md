# SPEC-011 — CLI Workflow vertical DAG viewer widget

| Field | Value |
|-------|-------|
| Status | Active |
| Created | 2026-07-15 |
| Tracking | [#81](https://github.com/brettforbes/yaml-workflow-widget/issues/81) |
| Depends on | SPEC-007 (workflow DSL / `needs` DAG), Epic D1 in `yaml-workflow-dag` (vertical Nice-DAG model — see `CLI_WORKFLOW_VIEW_DESIGN.md` there) |
| Supersedes (conceptually) | SPEC-010 (reverted — see PR #79; SPEC-010 stays closed, this is a fresh spec number, not a reopen) |
| Non-goals | Bi-directional YAML↔diagram transformer, Monaco/CodeMirror, Langium/AST wiring, drag-and-drop diagram editing, multi-circle output ports |

## Intent

Host a **vertical**, category-structured Nice-DAG visualization of the workflow YAML DSL (`.seed/12A_Workflow_YAML_Example.yaml` / `12B` / `12C`) side by side with a YAML code window, inside a new standalone Vite+Vue3 sub-app (`apps/workflow-dag-viewer/`) — independent of the existing global-script `template-iframe-widget` build (`content.html`/`widget.js` stay untouched).

Each workflow step renders as a collapsible "CLI-app" super-node containing 4 fixed category children (`input`, `config`, `output`, `context` — the four pillars from `12B` §1). Mousing over any category (when expanded) or the whole super-node shows its YAML via tooltip, with an "Edit" action opening a mini modal. Collapsed nodes show a single top (input) and bottom (output) connector, each with a mouseover tooltip. This phase is **1:1 modelling only**: YAML → diagram is one-way; editing updates the in-memory model, not the source file.

The finished Vue components are built first in `yaml-workflow-dag` (Epic D1) as a new example case, then vendored (source-copied, not npm-published) into this sub-app (Epic W1).

## Requirements

### R11-01 — Sub-app scaffold

- **R11-01-01** New independent Vite+Vue3 project at `apps/workflow-dag-viewer/`, own `package.json`/`vite.config.js`/dev server, isolated from the root widget's webpack pipeline.
- **R11-01-02** A new `start-workflow-dag-viewer.ps1` at repo root launches it (`npm install` if needed, then `npm run dev`), printing the local URL. The existing `start.ps1` (template-iframe-widget) is not modified.

### R11-02 — Vendored diagram components

- **R11-02-01** Components (`CliAppNode.vue`, `CategoryNode.vue`, `YamlTooltip.vue`, `YamlEditModal.vue`, `mapper.js`, CSS) are source-copied from `yaml-workflow-dag/example/vue/src/cases/cli-workflow/` (Epic D1 output) into `apps/workflow-dag-viewer/src/components/`.
- **R11-02-02** Diagram follows the node/CSS/dependency model in `yaml-workflow-dag`'s `CLI_WORKFLOW_VIEW_DESIGN.md` exactly (vertical `rankdir: TB`, top/bottom-center connectors, always-4-category children).
- **R11-02-03** Deps added to the sub-app only: `@ebay/nice-dag-vue3`, `@ebay/nice-dag-core`, `vue`, `vue-prism-editor`, `prismjs`, `js-yaml`, `bootstrap` (CSS only).

### R11-03 — Layout

- **R11-03-01** Full page width by default: two Bootstrap containers, each `col-6` — left = YAML code window (Prism, YAML highlighting), right = the vertical diagram.
- **R11-03-02** Code column is collapsible via a toggle; collapsing it expands the diagram column to fill the row.
- **R11-03-03** An embed mode (`?embed=1` or narrow-viewport CSS) hides/collapses the code column and constrains the diagram to ~3–4 Bootstrap columns wide, for use as a small iframe elsewhere.

### R11-04 — Content

- **R11-04-01** Default document on load is the real `.seed/12A_Workflow_YAML_Example.yaml` (copied into the sub-app), parsed with `js-yaml`, mapped, and rendered.

### R11-05 — Verification

- **R11-05-01** Manual acceptance pass: two-column layout, collapse toggle, per-category and per-CLI-app-node tooltip/modal editing, collapsed-node input/output tooltips, embed mode — evidence recorded on the epic issue.

## Non-goals

- Bi-directional YAML ↔ diagram transformer (future phase).
- Monaco / CodeMirror.
- Langium/AST wiring.
- Drag-and-drop editing of the diagram (diagram stays read-only; edits go through the modal only).
- Multi-circle output ports.

## Traceability

| Requirement | Primary implementation |
|-------------|------------------------|
| R11-01-* | `apps/workflow-dag-viewer/` scaffold, `start-workflow-dag-viewer.ps1` |
| R11-02-* | `apps/workflow-dag-viewer/src/components/*` (vendored from `yaml-workflow-dag`) |
| R11-03-* | `apps/workflow-dag-viewer/src/App.vue` |
| R11-04-* | `apps/workflow-dag-viewer/src/assets/12A_Workflow_YAML_Example.yaml` |
| R11-05-* | Manual acceptance pass recorded on Epic W1 |

## Stories

| ID | Issue | Outcome |
|----|------:|---------|
| W1-S1 | [#82](https://github.com/brettforbes/yaml-workflow-widget/issues/82) | Scaffold Vite+Vue3 sub-app |
| W1-S2 | [#83](https://github.com/brettforbes/yaml-workflow-widget/issues/83) | Vendor components from yaml-workflow-dag Epic D1 |
| W1-S3 | [#84](https://github.com/brettforbes/yaml-workflow-widget/issues/84) | Two-column Bootstrap layout + collapse toggle |
| W1-S4 | [#85](https://github.com/brettforbes/yaml-workflow-widget/issues/85) | Load real 12A content |
| W1-S5 | [#86](https://github.com/brettforbes/yaml-workflow-widget/issues/86) | Full-page vs embed modes |
| W1-S6 | [#87](https://github.com/brettforbes/yaml-workflow-widget/issues/87) | `start-workflow-dag-viewer.ps1` |
| W1-S7 | [#88](https://github.com/brettforbes/yaml-workflow-widget/issues/88) | Acceptance pass + promote to main |

## Acceptance (program)

1. `apps/workflow-dag-viewer` runs via `start-workflow-dag-viewer.ps1` and renders the real 12A workflow as a vertical DAG.
2. All 6 steps show correct top-level chaining (needs, else positional fallback) and all 4 category children per step.
3. Tooltip + edit modal work for every category and every CLI-app node.
4. Code pane shows 12A with YAML syntax highlighting and is collapsible.
5. Embed mode renders the diagram alone at ~3–4 Bootstrap columns wide.
