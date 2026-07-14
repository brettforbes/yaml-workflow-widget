# SPEC-010 — Widget read-only Workflow DAG visualization

| Field | Value |
|-------|-------|
| Status | Active |
| Created | 2026-07-14 |
| Tracking | [#74](https://github.com/brettforbes/yaml-workflow-widget/issues/74) |
| Depends on | SPEC-007 (`needs` DAG), Nice-DAG (`yaml-workflow-dag` / `@ebay/nice-dag-core`) |
| Non-goals | Monaco, editable bidirectional sync, browser-side live CLI |

## Intent

Show operators the Workflow step DAG (from YAML / model) inside the iframe widget using Nice-DAG **read-only** view.

## Requirements

### R10-01 — Model mapper

- **R10-01-01** Map `{ steps: [{ id, needs, uses?, context? }] }` → Nice-DAG hierarchical model (`id`, `dependencies`, `data`).
- **R10-01-02** Preserve 12A topology (subfinder fan-out to nmap + httpx chains).

### R10-02 — Widget mount

- **R10-02-01** Widget hosts a read-only Nice-DAG for a 12A-derived fixture.
- **R10-02-02** Production `npm run build` succeeds.

### R10-03 — Dry-run overlay

- **R10-03-01** Node chrome indicates `context.export: scan_graph` vs `none` using a static dry-run snapshot (no Python in the browser).

## Stories

| ID | Issue |
|----|------:|
| S1 Mapper | [#75](https://github.com/brettforbes/yaml-workflow-widget/issues/75) |
| S2 Widget mount | [#76](https://github.com/brettforbes/yaml-workflow-widget/issues/76) |
| S3 Overlay | [#77](https://github.com/brettforbes/yaml-workflow-widget/issues/77) |
