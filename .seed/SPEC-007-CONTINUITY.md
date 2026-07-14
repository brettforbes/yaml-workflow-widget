# SPEC-007 — Continuity handoff

| Field | Value |
|-------|-------|
| Status | Foundation landed on `develop` |
| Date | 2026-07-14 |
| Tracking | [#3](https://github.com/brettforbes/yaml-workflow-widget/issues/3) |

## What landed

| Epic | Stories | Evidence |
|------|---------|----------|
| E1 Schemas + scaffold | #12–#17 | Package + schemas + 12A validate |
| E2 GSE evaluator | #18–#23 | `core/gse_eval.py` + corpus fixtures |
| E3 Loader / DAG / vars / files / context | #24–#28 | [PR #51](https://github.com/brettforbes/yaml-workflow-widget/pull/51) |
| E4 Dry-run orchestration | #29–#31 | [PR #54](https://github.com/brettforbes/yaml-workflow-widget/pull/54) |
| E5 Tool drivers | #32–#34 | [PR #55](https://github.com/brettforbes/yaml-workflow-widget/pull/55) |
| E6 Verification closeout | #35–#36 | This handoff + pytest suite |
| E7 Docs + continuity | #37–#38 | README + `AGENTS.md` + this note |

## Program acceptance

1. **12A validates** — `test_cli_workflow_schema.py`
2. **GSE nmap cascade yields non-empty `ip:port`** — `test_cli_workflow_gse.py` / dry-run e2e
3. **Dry-run E2E context merges only export steps** (`subfinder_enum`, `nmap_ports`, `nerva_services`, `nuclei_vulns`; not `httpx_live` / `katana_crawl`) — `test_cli_workflow_e2e_dry_run.py`
4. Operator docs: 12A/12B/12C + package README + `AGENTS.md`

## How to run

See `.seed/scripts/cli_workflow/README.md`.

```bash
python -m pytest .tests -k cli_workflow -q
```

## Next work (out of SPEC-007)

- **E8 Langium Phase 2** (deferred): issues #11, #39–#43 — use `.cursor/skills/lai*` / `langium`
- Promote `develop` → `main` when operators want the default branch updated
- Optional: deeper live adapter E2E against real CLI binaries + SpiderFeet harvest fixtures

## Non-goals still deferred

Langium grammar, Monaco, visual DAG sync, `sfp_*` EVENT rewrite, context force-graph UI.
