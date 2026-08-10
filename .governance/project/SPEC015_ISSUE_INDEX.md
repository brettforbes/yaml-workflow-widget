# SPEC-015 issue index — YAML DSL Workflow widget (`yaml-workflow-widget`)

**Spec:** `@spiderfeet/.governance/specs/SPEC-015-workflow-live-status-viz.md`
**Repo:** `brettforbes/yaml-workflow-widget` · integration branch `develop`
**Backend index:** `@spiderfeet/.governance/project/SPEC015_ISSUE_INDEX.md`
**Host index:** `@spiderfeet-widget/.governance/project/SPEC015_WIDGET_ISSUE_INDEX.md`

Status legend: `open` → `in progress` → `in review` → `done`.

Statuses are keyed by DSL step id (matches `findNodeById(stepId)` / `mapper.js` CLI node id), NOT `${id}__category` child ids. Message payload: `{ statuses: { "<stepId>": "waiting"|"running"|"complete"|"failed" } }` (replace-semantics; empty clears).

## Epic B — DAG widget: step status rendering + themeable colors

| Code | Issue | Requirement | Depends on | Status |
|------|-------|-------------|------------|--------|
| Epic B | [#252](https://github.com/brettforbes/yaml-workflow-widget/issues/252) | R15-07..11 | — | in progress |
| B1 — setStepStatuses postMessage + stepStatuses state | [#253](https://github.com/brettforbes/yaml-workflow-widget/issues/253) | R15-07 | — | in review |
| B2 — Node status rendering (shade + icon) | [#254](https://github.com/brettforbes/yaml-workflow-widget/issues/254) | R15-08 | B1, B3 | open |
| B3 — Theme status color tokens (light + dark) | [#255](https://github.com/brettforbes/yaml-workflow-widget/issues/255) | R15-09 | — | open |
| B4 — Settings: per-theme status color pickers + persistence | [#257](https://github.com/brettforbes/yaml-workflow-widget/issues/257) | R15-10 | B3 | open |
| B5 — Docs (HOST_PROTOCOL/EMBED_GUIDE) + smoke test | [#256](https://github.com/brettforbes/yaml-workflow-widget/issues/256) | R15-11 | B1 | open |

## Execution order

```
B1 → B2 ; B3 → B2 ; B3 → B4 ; B1 → B5
(suggested: B1 → B3 → B2 → B4 → B5)
```

## Key files
- `src/workflow-dag/hostProtocol.js` — `SET_STEP_STATUSES` constant (B1)
- `src/workflow-dag/App.vue` — `onHostMessage` handler + `stepStatuses` ref (B1), node wiring (B2), settings panels + pickers (B4)
- `src/workflow-dag/components/CliAppNode.vue` — status class + icon (B2)
- `src/workflow-dag/theme.css` — `--wd-status-*` tokens light+dark (B3)
- new `src/workflow-dag/statusColors.js` — per-theme color persistence (B4)
- `src/workflow-dag/HOST_PROTOCOL.md`, `EMBED_GUIDE.md`, new `hostStepStatuses.smoke.mjs` (B5)

## Governance
Branch from `develop`; PR into `develop`; close each issue with a completion note + evidence; merge before the next. One issue at a time. Integrate via the documented postMessage contract; update `HOST_PROTOCOL.md`/`EMBED_GUIDE.md` when the contract changes.
