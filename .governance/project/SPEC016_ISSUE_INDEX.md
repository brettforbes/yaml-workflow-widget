# SPEC-016 issue index — YAML DSL Workflow iFrame (`yaml-workflow-widget`)

**Spec:** `@spiderfeet/.governance/specs/SPEC-016-workflow-run-robustness-and-per-project-context.md`
**Repo:** `brettforbes/yaml-workflow-widget` · integration branch `develop`
**Builds on:** SPEC-012 (`LAYOUT-RULES` WorkflowSeed goldens). Layout goldens for `12A`/`12A2` are frozen — do not change existing node coordinates. Only add the target context port + collector.

Status legend: `open` → `in progress` → `in review` → `done`.

## Cross-repo map

| Repo | Epic | Issue index |
|------|------|-------------|
| `yaml-workflow-widget` | C (target port + collector) | this file |
| `spiderfeet` | A (backend), D (integration) | `@spiderfeet/.governance/project/SPEC016_ISSUE_INDEX.md` |
| `spiderfeet-widget` | B (host viewer) | `@spiderfeet-widget/.governance/project/SPEC016_WIDGET_ISSUE_INDEX.md` |

## Epic C — Target context port + target-seeded collector

| Code | Issue | Requirement | Depends on | Status |
|------|-------|-------------|------------|--------|
| Epic C | [#267](https://github.com/brettforbes/yaml-workflow-widget/issues/267) | R16-09..11 | — | open |
| C1 — Right-edge context port on Target box | [#268](https://github.com/brettforbes/yaml-workflow-widget/issues/268) | R16-09 | — | done |
| C2 — Target context collector seeded from `inputs.targets` | [#269](https://github.com/brettforbes/yaml-workflow-widget/issues/269) | R16-10 | C1 | done |
| C3 — Docs + smoke for target port/collector | [#270](https://github.com/brettforbes/yaml-workflow-widget/issues/270) | R16-11 | C2 | done |

## Execution order

```
C1 → C2 → C3
```

## Key files (from exploration)
- `src/workflow-dag/components/TargetNode.vue` — add right-edge context port (C1)
- `src/workflow-dag/components/ports.css` — reuse `.wf-connector-context-right` (C1)
- `src/workflow-dag/components/mapper.js` — `workflowDocToNiceDagModel` target collector node/edge (~L146-165) (C2)
- `src/workflow-dag/components/workflowSeedRoles.js` — position collector `CX + TARGET_W/2 + COLLECTOR_GAP` on target row (~L210) (C2)
- `src/workflow-dag/components/workflowSeedEdgePoints.js` — anchor `Target.ctx -> collector` (C2)
- `src/workflow-dag/components/diagramYaml.js` — collector stripped from YAML round-trip (C2)
- `.governance/specs/SPEC-012-LAYOUT-RULES.md`, `HOST_PROTOCOL.md`, `EMBED_GUIDE.md` — docs (C3)

## Governance
Branch from `develop`; PR into `develop`; close each issue with a completion note + evidence; merge before the next. One issue at a time. Commit/merge per operator-approved policy.
