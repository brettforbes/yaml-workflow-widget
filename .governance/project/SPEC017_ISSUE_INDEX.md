# SPEC-017 issue index — YAML DSL Workflow iFrame (`yaml-workflow-widget`)

**Spec:** `@spiderfeet/.governance/specs/SPEC-017-multi-temporary-subgraphs-and-dag-colors.md`  
**Agent plan:** `@spiderfeet/.governance/project/SPEC017_AGENT_PLAN.md`  
**Repo:** `brettforbes/yaml-workflow-widget` · integration branch `develop`

Status legend: `open` → `in progress` → `in review` → `done`.

## Cross-repo map

| Repo | Epic | Issue index |
|------|------|-------------|
| `yaml-workflow-widget` | C (settings colors) | this file |
| `spiderfeet` | A, D | `@spiderfeet/.governance/project/SPEC017_ISSUE_INDEX.md` |
| `spiderfeet-widget` | B | `@spiderfeet-widget/.governance/project/SPEC017_WIDGET_ISSUE_INDEX.md` |

## Epic C — YAML DSL settings colors

| Code | Issue | Requirement | Depends on | Status |
|------|-------|-------------|------------|--------|
| Epic C | [#274](https://github.com/brettforbes/yaml-workflow-widget/issues/274) | R17-11..13 | — | open |
| C1 — Status hex + picker + defaults | [#275](https://github.com/brettforbes/yaml-workflow-widget/issues/275) | R17-11 | — | open |
| C2 — Edge-type hex + picker + defaults | [#276](https://github.com/brettforbes/yaml-workflow-widget/issues/276) | R17-12 | — | open |
| C3 — Docs + smoke | [#277](https://github.com/brettforbes/yaml-workflow-widget/issues/277) | R17-13 | C1, C2 | open |

## Execution order

```
C1 ∥ C2 → C3
```

Independent of backend A* / host B* — safe first parallel lane.

## Defaults (both themes)

| Token | Hex |
|-------|-----|
| waiting | `#FFFF99` |
| running | `#F2AA84` |
| complete | `#4E95D9` |
| failed | `#FF7979` |
| followed-by | `#156082` |
| used-by | `#E97132` |
| semantic-export | `#78206E` |

## Key files

- `src/workflow-dag/statusColors.js` — status defaults + storage (C1)
- `src/workflow-dag/components/edgeMeta.js` — EDGE_COLORS / resolveEdgeColor (C2)
- `src/workflow-dag/App.vue` — settings panel (C1, C2)

## Governance

Branch from `develop`; PR into `develop`; one issue at a time; close with evidence.
