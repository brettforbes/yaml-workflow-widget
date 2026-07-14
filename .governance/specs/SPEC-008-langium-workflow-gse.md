# SPEC-008 — Langium Phase 2 for Workflow + GSE

| Field | Value |
|-------|-------|
| Status | Active |
| Created | 2026-07-14 |
| Depends on | SPEC-007 (schemas + runtime foundation closed) |
| Seed / contracts | `.seed/12A…`, `.seed/12B…`, `.seed/12C…`, `.seed/scripts/cli_workflow/schema/*.json` |
| Tracking epic | [#11](https://github.com/brettforbes/yaml-workflow-widget/issues/11) |
| Stories | [#39](https://github.com/brettforbes/yaml-workflow-widget/issues/39)–[#43](https://github.com/brettforbes/yaml-workflow-widget/issues/43) |
| Skills | `.cursor/skills/langium`, `.cursor/skills/lai*` |

## Intent

Provide a **Langium** language engineering surface for the SpiderFeet Workflow + Graph Select Language (GSE) AST so editors and agents can parse, validate, and (later) generate Workflow documents with LSP support.

YAML remains the **canonical interchange** (SPEC-007). Langium models the same AST for tooling; it does **not** replace the Python dry-run runtime.

## Requirements

### R8-01 — Project bootstrap

- **R8-01-01** Package root: `packages/workflow-lang/` (isolated from the webpack widget root).
- **R8-01-02** Must include `langium-config.json`, TypeScript build, and `langium generate` script.
- **R8-01-03** Must include a stub grammar file whose entry rule is `Workflow` (or documented rename).

### R8-02 — Grammar ↔ YAML AST

- **R8-02-01** Grammar rule shape MUST track `workflow_v1.schema.json` + `gse_v1.schema.json` (1:1 AST concepts).
- **R8-02-02** Must not invent DSL constructs absent from 12A/12B/12C / JSON Schema.
- **R8-02-03** Surface syntax MAY be Langium-native for v1 editing; YAML round-trip is a later story (`SPEC_GAP` until specified).

### R8-03 — Validators

- **R8-03-01** Validators MUST mirror R7-01 / R7-02 constraints already machine-checkable in SPEC-007 schemas (apiVersion/kind, uses enum, DAG basics, GSE operators).

### R8-04 — LAI loop

- **R8-04-01** After grammar stabilizes: `lai init` → descriptor → sysprompt → evals using project skills under `.cursor/skills/lai*`.

### R8-05 — Optional MCP

- **R8-05-01** Optional MCP validate tool via `lai-gen-mcp` (non-blocking).

## Non-goals

- Replacing Python `cli_workflow` dry-run / executor
- Monaco embed / visual DAG sync (still deferred)
- Changing 12A/12B/12C semantics

## Acceptance (program)

1. [x] `packages/workflow-lang` builds and `langium generate` succeeds
2. [x] Grammar covers workflow header + step + GSE shapes with parse/validate smokes
3. [x] Stories #39–#43 closed with PR evidence; epic #11 closable (R8-01–R8-05 done)
