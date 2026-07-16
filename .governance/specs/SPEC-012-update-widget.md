# SPEC-012 — Update Widget Requirements

| Field | Value |
|-------|-------|
| Status | Active |
| Created | 2026-07-16 |
| Source | `.seed/02_Update_Widget_Requirements.md` |
| Agent plan | `.governance/specs/SPEC-012-AGENT-PLAN.md` |
| Depends on | SPEC-007 (YAML DSL), SPEC-008 (Langium package), SPEC-011 (vertical DAG viewer foundation — closed) |
| Supersedes (non-goals of) | SPEC-011 deferred items: bi-di sync, diagram edit, Langium wiring, host protocol |
| Tracking | Epic F0 [#100](https://github.com/brettforbes/yaml-workflow-widget/issues/100) … E6 [#106](https://github.com/brettforbes/yaml-workflow-widget/issues/106); stories [#107](https://github.com/brettforbes/yaml-workflow-widget/issues/107)–[#146](https://github.com/brettforbes/yaml-workflow-widget/issues/146). Full map: SPEC-012-AGENT-PLAN.md |
| Out of scope | Feature work in `yaml-workflow-dag`; renaming YAML `steps[].uses: tool.*`; Monaco (unless a later story opts in) |

## Intent

Evolve the webpack iframe widget under `src/` into the production YAML + Nice-DAG workflow surface: chrome polish, workflow model v2 (start/target/end, three edge types, context rails, true sub-DAG expand), category form UIs, diagram edit mode, Langium **YAML** parse + bi-directional sync, MCP explain/produce tools, and host postMessage embed protocol.

SPEC-011 delivered a standalone Vite app (`apps/workflow-dag-viewer`). SPEC-012 **migrates that UI into `src/`** and restricts `apps/` to the Nice-DAG library only.

## Locked decisions

1. **Repo:** all delivery in `yaml-workflow-widget`. Read Nice-DAG skill/docs from `yaml-workflow-dag` only; do not add features there.
2. **Layout:** product UI in webpack iframe (`src/html`, `src/js`, Vue under `src/workflow-dag/`). Nice-DAG library under `apps/nice-dag/`. Retire `apps/workflow-dag-viewer` after F0.
3. **Edge labels (diagram only):** `follows`, `used-by`, `semantic-subgraph`. YAML tool field `uses: tool.*` unchanged.
4. **Inbound rule:** at most one edge into a step input port; `used-by` overrides `follows`.
5. **Langium:** must parse the **YAML** DSL as first-class documents (not `.sfw` only).
6. **MCP:** explain any YAML workflow; produce valid YAML workflows.
7. **Chrome:** subtle icons only (settings, code collapse, edit mode, reset zoom) — no header button bars.
8. **Seed:** temporary; install runtime content into `src/` and `packages/workflow-lang` as needed. Do not delete 12A/12B/12C until migrated and referenced.

## Requirements

### R12-00 — Skills and docs hygiene

- **R12-00-01** Langium/`lai*` skills live only under `.cursor/skills/`. `.agents/` must not exist.
- **R12-00-02** This SPEC and the agent plan are the single copy under `.governance/specs/`.

### R12-F0 — Layout migration

- **R12-F0-01** Vendor Nice-DAG into `apps/nice-dag/`; webpack resolves `@ebay/nice-dag-core` and `@ebay/nice-dag-vue3` from there.
- **R12-F0-02** Root webpack builds Vue3 SFCs; `content.html` mounts the workflow widget (preserve `#events.js` postMessage helpers).
- **R12-F0-03** UI from former `apps/workflow-dag-viewer` lives under `src/workflow-dag/` (or equivalent under `src/`).
- **R12-F0-04** `.\start.ps1` → `http://localhost:4001` shows 12A YAML + vertical DAG. Standalone Vite app and `start-workflow-dag-viewer.ps1` removed.

### R12-E1 — Chrome / UX

- **R12-E1-01** Light/dark theme for code pane + DAG; settings gear; host `setTheme` stub until E6.
- **R12-E1-02** Code window editable; in-memory YAML updates; diagram refresh may wait for E5 (document gap).
- **R12-E1-03** Draggable divider; width persisted in `sessionStorage`.
- **R12-E1-04** Divider arrows collapse/reopen code pane (no Hide button cluster).
- **R12-E1-05** Pan/zoom on DAG; reset-view control restores default center/scale.
- **R12-E1-06** Collapsed node body hover: YAML without input/output; circle tooltips unchanged; body editable via modal.

### R12-E2 — Workflow model v2

- **R12-E2-01** Start circle (top): tooltip = workflow header YAML (`apiVersion`/`kind`/`id`/`info`).
- **R12-E2-02** Target node when `inputs` exist: tooltip = inputs YAML; omit when no inputs.
- **R12-E2-03** End context circle (bottom): merged context outcome.
- **R12-E2-04** Labeled edges `follows` \| `used-by` \| `semantic-subgraph`; colorblind-safe light+dark palettes; legend; settings toggle labels+color vs labels+single-color.
- **R12-E2-05** One inbound to input port; `used-by` from `$steps.<id>.vars.*` in `input.from` wins over `follows`.
- **R12-E2-06** Context rail: collapsed right/left context ports, collector circles, single/dual/N-line layout per `.seed/02_Update_Widget_Requirements.md` §2.3.
- **R12-E2-07** Collapsed chrome icon/label swap rules for left vs right-of-split columns.
- **R12-E2-08** True Nice-DAG sub-DAG expand: parent outline + collapse; children Input→Config→Context→Output with `used-by`; context child → parent context port → collector via `semantic-subgraph`; no parent tooltip when expanded; category ports silent; category body tooltip+edit only.

### R12-E3 — Category form UIs

- **R12-E3-01** Install CLI-options markdown into `src/content/cli_app_arguments/` and `packages/workflow-lang` content.
- **R12-E3-02** Config form driven by CLI-options content; writes `config`.
- **R12-E3-03** Install curated `*_nugget_graph_structure.md` (+ minimal samples) into `src/content/nugget_structure/` and langium content.
- **R12-E3-04** Output form: simplified GSE builder → `output.vars`.
- **R12-E3-05** Input form: targets + upstream step vars.
- **R12-E3-06** Context form: boolean `export: scan_graph | none`.
- **R12-E3-07** Keep YAML tooltip + edit; add Form button to category-specific modal.

### R12-E4 — Diagram edit mode

- **R12-E4-01** Edit/read toggle icon; `startEditing`/`stopEditing`; mesh background in edit mode.
- **R12-E4-02** Delete affordance on shapes; safe model update.
- **R12-E4-03** Add start, target, step (+4 children + context port), context collector, end.
- **R12-E4-04** RMB between two selected nodes: create `follows` \| `used-by` \| `semantic-subgraph` with port rules.
- **R12-E4-05** Vertical pretty-print of YAML from diagram staging model (full sync in E5).

### R12-E5 — Langium YAML sync + MCP

- **R12-E5-01** `.yaml`/`.yml` workflow docs parse via Langium DocumentBuilder to AST + diagnostics for 12A (follow `.cursor/skills/langium`).
- **R12-E5-02** Code window debounce validate; invalid YAML does not clobber diagram.
- **R12-E5-03** Valid YAML → AST → Nice-DAG model.
- **R12-E5-04** Diagram/model → AST → YAML in code window.
- **R12-E5-05** MCP tools `explain_workflow` and `produce_workflow` with smoke tests.

### R12-E6 — Embed / host protocol

- **R12-E6-01** postMessage contract: `setYaml`, `getYaml`, `yamlChanged`, `validationResult`, `setTheme`, `selectStep`, `stepSelected`.
- **R12-E6-02** Host YAML in/out with validation.
- **R12-E6-03** Host theme drives E1 theme.
- **R12-E6-04** Step selection bidirectional with host tabs.
- **R12-E6-05** Bridge MCP explain/produce availability to host.
- **R12-E6-06** Runtime content has no `.seed` path dependency; continuity note recorded.

## Acceptance (program)

1. `.\start.ps1` serves the workflow widget on `:4001` with 12A.
2. Model v2 renders start/target/steps/context rail/end with correct edge labels on 12A.
3. Edit mode can add/delete nodes and typed edges; YAML round-trips via Langium.
4. MCP explain/produce work on YAML workflows.
5. Embed postMessage contract documented and smoke-tested.

## Traceability

See [SPEC-012-AGENT-PLAN.md](SPEC-012-AGENT-PLAN.md) for epic/story → requirement → issue mapping.
