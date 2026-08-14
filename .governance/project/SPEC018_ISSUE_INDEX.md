# SPEC-018 issue index — YAML DSL Workflow iFrame (`yaml-workflow-widget`)

**Spec:** `@spiderfeet/.governance/specs/SPEC-018-composer-refine.md`  
**Agent plan:** `@spiderfeet/.governance/project/SPEC018_AGENT_PLAN.md`  
**Repo:** `brettforbes/yaml-workflow-widget` · integration branch `develop`

Status legend: `open` → `in progress` → `in review` → `done`.

## Cross-repo map

| Repo | Epic | Issue index |
|------|------|-------------|
| `yaml-workflow-widget` | C (DAG readability + export edges) | this file |
| `spiderfeet` | A, B, E | `@spiderfeet/.governance/project/SPEC018_ISSUE_INDEX.md` |
| `spiderfeet-widget` | D | `@spiderfeet-widget/.governance/project/SPEC018_WIDGET_ISSUE_INDEX.md` |

## Epic C — DAG readability, export-only edges, Target offset, i/n badge

| Code | Issue | Requirement | Depends on | Status |
|------|-------|-------------|------------|--------|
| Epic C | [#283](https://github.com/brettforbes/yaml-workflow-widget/issues/283) | R18-09..14 | — | done |
| C1 — Short step labels | [#284](https://github.com/brettforbes/yaml-workflow-widget/issues/284) | R18-09 | — | done (#290) |
| C2 — Typography + 150% tooltips | [#285](https://github.com/brettforbes/yaml-workflow-widget/issues/285) | R18-10 | — | done (#291) |
| C3 — Export-only semantic-export edges | [#286](https://github.com/brettforbes/yaml-workflow-widget/issues/286) | R18-11 | — | done (#292) |
| C4 — Target collector extra-right align | [#287](https://github.com/brettforbes/yaml-workflow-widget/issues/287) | R18-12 | C3 | done (#293) |
| C5 — setStepStatuses i/n badge | [#288](https://github.com/brettforbes/yaml-workflow-widget/issues/288) | R18-13 | C1 | done (#294) |
| C6 — Docs + smoke | [#289](https://github.com/brettforbes/yaml-workflow-widget/issues/289) | R18-14 | C1–C5 | done |

## Execution order

```
C1 ∥ C2 → C3 → C4 → C5 → C6
```

C1/C2 independent of backend. Host D1 waits on C5.

## Locked layout rules (do not regress)

- Subfinder **does** `export: scan_graph` — keep edge + collector.
- HTTPX / Katana `export: none` — **no** step→collector edge; rank collector remains if Nmap/Nerva on that rank export.
- Target collector extra-right offset **once per workflow**, aligning X with first scan-step collector.

## Key files

- `src/workflow-dag/components/mapper.js` — collectors + semantic-export edges (C3, C4)
- `src/workflow-dag/components/stepDisplayLabel.js` — labels + export helper (C1, C3)
- `src/workflow-dag/components/workflowSeedRoles.js` — Target collector align (C4)
- `src/workflow-dag/components/nodeFactories.js` — labels (C1)
- `src/workflow-dag/App.vue` — type, tooltips, status render (C2, C5)
- `src/workflow-dag/components/stepStatus.js` — progress normalization (C5)
- `src/workflow-dag/HOST_PROTOCOL.md` — `setStepStatuses` (C5, C6)
- `src/workflow-dag/spec018.smoke.mjs` — Epic C smoke bundle (C6)
- `.governance/specs/SPEC-012-LAYOUT-RULES.md` — SPEC-018 addendum (C6)

## Smoke

```bash
node src/workflow-dag/spec018.smoke.mjs
```

## Governance

Branch from `develop`; PR into `develop`; one issue at a time; close with evidence.
