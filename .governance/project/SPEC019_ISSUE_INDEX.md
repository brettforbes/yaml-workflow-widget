# SPEC-019 issue index — YAML DSL Workflow iFrame (`yaml-workflow-widget`)

**Spec:** `@spiderfeet/.governance/specs/SPEC-019-composer-refine-2.md`  
**Agent plan:** `@spiderfeet/.governance/project/SPEC019_AGENT_PLAN.md`  
**Repo:** `brettforbes/yaml-workflow-widget` · integration branch `develop`

Status legend: `open` → `in progress` → `in review` → `done`.

## Cross-repo map

| Repo | Epic | Issue index |
|------|------|-------------|
| `yaml-workflow-widget` | D (collector deps + port geometry) | this file |
| `spiderfeet` | A, B, C, F, E | `@spiderfeet/.governance/project/SPEC019_ISSUE_INDEX.md` |
| `spiderfeet-widget` | — | **no SPEC-019 issues** |

## Epic D — Collector dependencies + port geometry

| Code | Issue | Requirement | Depends on | Status |
|------|-------|-------------|------------|--------|
| Epic D | [#296](https://github.com/brettforbes/yaml-workflow-widget/issues/296) | R19-10..12 | — | open |
| D1 — Collector deps = exporters only | [#297](https://github.com/brettforbes/yaml-workflow-widget/issues/297) | R19-10 | — | done |
| D2 — Vertical vs horizontal ports | [#298](https://github.com/brettforbes/yaml-workflow-widget/issues/298) | R19-11 | D1 | done |
| D3 — Smoke mixed-rank + no httpx/katana deps | [#299](https://github.com/brettforbes/yaml-workflow-widget/issues/299) | R19-12 | D1, D2 | open |

## Execution order

```
D1 → D2 → D3
```

D1 can start immediately (parallel to backend A1). Do not rewrite Nice-DAG expand internals in D2 unless D3 smoke fails after D1.

## Locked layout rules (do not regress)

- Subfinder **does** `export: scan_graph` — keep edge + collector.
- HTTPX / Katana `export: none` — **no** step→collector Nice-DAG dependency and **no** semantic-export edge; rank collector remains if Nmap/Nerva on that rank export.
- `followed-by` / `used-by` use **vertical** ports only. `semantic-export` uses **horizontal** CX ports only.
- Target collector extra-right offset (SPEC-018 C4) unchanged.

## Key files

- `src/workflow-dag/components/mapper.js` — collector `dependencies` (D1)
- `src/workflow-dag/components/workflowSeedEdgePoints.js` — port attachment (D2)
- `src/workflow-dag/components/edgeMeta.js` — default unlabeled = followed-by (D1/D2)
- `src/workflow-dag/spec019.smoke.mjs` (D3)
- `.governance/specs/SPEC-012-LAYOUT-RULES.md` — SPEC-019 addendum (D3)

## Smoke

```bash
node src/workflow-dag/spec019.smoke.mjs
```

(Create this file in D3 if the SPEC-018 smoke bundle should stay frozen.)

## Governance

Branch from `develop`; PR into `develop`; one issue at a time; close with evidence.
