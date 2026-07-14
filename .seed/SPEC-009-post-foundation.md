# SPEC-009 — Post-foundation hardening

| Field | Value |
|-------|-------|
| Status | Active → completing |
| Created | 2026-07-14 |
| Tracking | [#66](https://github.com/brettforbes/yaml-workflow-widget/issues/66) |
| Depends on | SPEC-007, SPEC-008 |

## Intent

Land continuity follow-ups after SPEC-007/008 without reopening Monaco / visual DAG / `sfp_*` work.

## Stories

| ID | Issue | Outcome |
|----|------:|---------|
| S1 | [#67](https://github.com/brettforbes/yaml-workflow-widget/issues/67) | `.gitignore` hygiene |
| S2 | [#68](https://github.com/brettforbes/yaml-workflow-widget/issues/68) | Optional SPEC-004 adapter E2E |
| S3 | [#69](https://github.com/brettforbes/yaml-workflow-widget/issues/69) | YAML ↔ `.sfw` decision + concept map |

## R8-02-03 decision (S3)

**Decision:** Defer a mechanical YAML ↔ `.sfw` round-trip mapper to a future SPEC.

| Layer | Role |
|-------|------|
| YAML (`12A` / schema) | **Canonical interchange** for runtime (`cli_workflow`) |
| `.sfw` (Langium) | **Editor/LSP/agent** surface over the same AST concepts |

Rationale:
1. SPEC-007 dry-run acceptance already binds to YAML.
2. Full bidirectional sync risks inventing constructs or losing GSE fidelity.
3. Operators and agents already have MCP validate + YAML schema tests.

**Ship now:** a concept map documenting YAML paths ↔ Langium grammar rules
(`.seed/YAML_SFW_CONCEPT_MAP.md`) so E8-S2 grammar work stays aligned.

**Out of scope still:** Monaco embed, diagram sync, automatic format converters.
