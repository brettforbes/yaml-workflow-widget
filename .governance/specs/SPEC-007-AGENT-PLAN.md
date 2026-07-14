# SPEC-007 — Agent Execution Plan

| Field | Value |
|-------|-------|
| Spec | [SPEC-007-cli-workflow-dsl.md](SPEC-007-cli-workflow-dsl.md) |
| Seed | [12A](12A_Workflow_YAML_Example.yaml), [12B](12B_Workflow_DSL_Description.md), [12C](12C_Graph_Select_Language.md) |
| Status | Ready for issue-scoped execution |
| Mode | Development |
| Package root | `.seed/scripts/cli_workflow/` |
| Tracking issue | [#3](https://github.com/brettforbes/yaml-workflow-widget/issues/3) |
| Project board | [Spiderfeet — First Four Stages](https://github.com/users/brettforbes/projects/1) |
| Non-goals (this SPEC) | Langium, Monaco, visual DAG sync, `sfp_*` EVENT rewrite, context force-graph UI |

## GitHub issue map

| Plan ID | Issue | Board |
|---------|------:|-------|
| Tracking | [#3](https://github.com/brettforbes/yaml-workflow-widget/issues/3) | Ready |
| E1 | [#4](https://github.com/brettforbes/yaml-workflow-widget/issues/4) | Ready |
| E2 | [#5](https://github.com/brettforbes/yaml-workflow-widget/issues/5) | Backlog |
| E3 | [#6](https://github.com/brettforbes/yaml-workflow-widget/issues/6) | Backlog |
| E4 | [#7](https://github.com/brettforbes/yaml-workflow-widget/issues/7) | Backlog |
| E5 | [#8](https://github.com/brettforbes/yaml-workflow-widget/issues/8) | Backlog |
| E6 | [#9](https://github.com/brettforbes/yaml-workflow-widget/issues/9) | Backlog |
| E7 | [#10](https://github.com/brettforbes/yaml-workflow-widget/issues/10) | Backlog |
| E8 (deferred) | [#11](https://github.com/brettforbes/yaml-workflow-widget/issues/11) | Backlog |
| E1-S1 | [#12](https://github.com/brettforbes/yaml-workflow-widget/issues/12) | **Ready — start here** |
| E1-S2 | [#13](https://github.com/brettforbes/yaml-workflow-widget/issues/13) | Backlog |
| E1-S3 | [#14](https://github.com/brettforbes/yaml-workflow-widget/issues/14) | Backlog |
| E1-S4 | [#15](https://github.com/brettforbes/yaml-workflow-widget/issues/15) | Backlog |
| E1-S5 | [#16](https://github.com/brettforbes/yaml-workflow-widget/issues/16) | Backlog |
| E1-S6 | [#17](https://github.com/brettforbes/yaml-workflow-widget/issues/17) | Backlog |
| E2-S1 | [#18](https://github.com/brettforbes/yaml-workflow-widget/issues/18) | Backlog |
| E2-S2 | [#19](https://github.com/brettforbes/yaml-workflow-widget/issues/19) | Backlog |
| E2-S3 | [#20](https://github.com/brettforbes/yaml-workflow-widget/issues/20) | Backlog |
| E2-S4 | [#21](https://github.com/brettforbes/yaml-workflow-widget/issues/21) | Backlog |
| E2-S5 | [#22](https://github.com/brettforbes/yaml-workflow-widget/issues/22) | Backlog |
| E2-S6 | [#23](https://github.com/brettforbes/yaml-workflow-widget/issues/23) | Backlog |
| E3-S1 | [#24](https://github.com/brettforbes/yaml-workflow-widget/issues/24) | Backlog |
| E3-S2 | [#25](https://github.com/brettforbes/yaml-workflow-widget/issues/25) | Backlog |
| E3-S3 | [#26](https://github.com/brettforbes/yaml-workflow-widget/issues/26) | Backlog |
| E3-S4 | [#27](https://github.com/brettforbes/yaml-workflow-widget/issues/27) | Backlog |
| E3-S5 | [#28](https://github.com/brettforbes/yaml-workflow-widget/issues/28) | Backlog |
| E4-S1 | [#29](https://github.com/brettforbes/yaml-workflow-widget/issues/29) | Backlog |
| E4-S2 | [#30](https://github.com/brettforbes/yaml-workflow-widget/issues/30) | Backlog |
| E4-S3 | [#31](https://github.com/brettforbes/yaml-workflow-widget/issues/31) | Backlog |
| E5-S1 | [#32](https://github.com/brettforbes/yaml-workflow-widget/issues/32) | Backlog |
| E5-S2 | [#33](https://github.com/brettforbes/yaml-workflow-widget/issues/33) | Backlog |
| E5-S3 | [#34](https://github.com/brettforbes/yaml-workflow-widget/issues/34) | Backlog |
| E6-S1 | [#35](https://github.com/brettforbes/yaml-workflow-widget/issues/35) | Backlog |
| E6-S2 | [#36](https://github.com/brettforbes/yaml-workflow-widget/issues/36) | Backlog |
| E7-S1 | [#37](https://github.com/brettforbes/yaml-workflow-widget/issues/37) | Backlog |
| E7-S2 | [#38](https://github.com/brettforbes/yaml-workflow-widget/issues/38) | Backlog |
| E8-S1 | [#39](https://github.com/brettforbes/yaml-workflow-widget/issues/39) | Backlog |
| E8-S2 | [#40](https://github.com/brettforbes/yaml-workflow-widget/issues/40) | Backlog |
| E8-S3 | [#41](https://github.com/brettforbes/yaml-workflow-widget/issues/41) | Backlog |
| E8-S4 | [#42](https://github.com/brettforbes/yaml-workflow-widget/issues/42) | Backlog |
| E8-S5 | [#43](https://github.com/brettforbes/yaml-workflow-widget/issues/43) | Backlog |

## How lesser agents should use this plan

1. Pick the **highest-priority open story** whose dependencies are closed.
2. Create a branch from `develop`: `feature/<issue>-<slug>` (or `fix/` / `docs/` / `chore/`).
3. Implement **only that story’s acceptance criteria**.
4. Verify with the story’s listed checks; paste evidence on the issue.
5. Open a PR into `develop` linking the issue + requirement IDs.
6. Do **not** redesign the DSL. If 12A/12B/12C conflict with code, open a `SPEC_GAP` follow-up — do not invent syntax.

## Program goal

Ship a YAML workflow loader + GSE evaluator + dry-run runtime so `.seed/12A_Workflow_YAML_Example.yaml` validates and executes end-to-end against corpus scan-graph fixtures **without live CLI invocations**.

## Architecture (target)

```text
.seed/scripts/cli_workflow/
  schema/
    workflow_v1.schema.json
    gse_v1.schema.json
  core/
    gse_eval.py
    variables.py
    context_export.py
    dag.py
  runtime/
    loader.py
    files.py
    executor.py          # dry_run + live
  tools/
    registry.py
    drivers/             # thin CLI wrappers → SPEC-004 adapters
  README.md

.tests/
  test_cli_workflow_schema.py
  test_cli_workflow_gse.py
  test_cli_workflow_dag.py
  test_cli_workflow_context.py
  test_cli_workflow_e2e_dry_run.py
```

## Dependency graph (epics)

```text
E1 Schemas + scaffold
 ├─► E2 GSE evaluator
 ├─► E3 Loader / DAG / variables / files / context
 │     └─► E4 Dry-run runtime orchestration
 │           ├─► E5 Tool drivers (live path; optional for program AC)
 │           └─► E6 Tests / E2E dry-run (closes program AC)
 └─► E7 Docs + continuity (after E6)
E8 Langium (DEFERRED — not SPEC-007)
```

## Assumptions (no blocker — agents treat as decided)

| # | Assumption |
|---|------------|
| A1 | Implementation language is **Python 3** (paths in SPEC use `.py`). |
| A2 | Home repo for this package is **yaml-workflow-widget** under `.seed/scripts/cli_workflow/`. |
| A3 | Program acceptance is satisfied by **dry-run / fixture mode** (R7-03-07). Live CLI drivers are valuable but not required to close SPEC-007 program AC. |
| A4 | Corpus graphs for GSE tests are referenced from SpiderFeet / `.docs` structure docs when available; if missing in this workspace, **vendor minimal fixtures** under `.seed/scripts/cli_workflow/fixtures/` copied from known good `*_proposed_nuggets_edges.json`. |
| A5 | SPEC-004 adapters are imported or invoked as an external dependency; if import path is unavailable, drivers return fixture graphs in dry-run and leave a tracked blocker for live adapter wiring. |
| A6 | Nested multi-level `for_each` (12C §6) is **v1-optional**. Prefer single `for_each` + dual `collect` (as in 12A). Document nested as deferred if not implemented. |
| A7 | Langium is **Phase 2** (Epic E8). Do not start it under SPEC-007 issues. |

## Decisions that would change the plan (escalate if contradicted)

- Runtime must live in `spiderfeet` instead of this repo
- Live CLI E2E is mandatory for SPEC-007 close
- JSON Schema is abandoned in favor of Langium-as-parser for v1

---

## Epic E1 — Contract freeze + package scaffold

**Intent:** Make the DSL machine-checkable and give agents a package to land code in.

| Story | Title | Req | Depends | Size |
|-------|-------|-----|---------|------|
| E1-S1 | Scaffold `cli_workflow` package + test harness | R7-03-01, R7-05-* | — | S |
| E1-S2 | Author `workflow_v1.schema.json` from 12B/12A | R7-01-* | E1-S1 | M |
| E1-S3 | Author `gse_v1.schema.json` from 12C | R7-02-01, R7-02-02 | E1-S1 | M |
| E1-S4 | Schema-validate 12A; fix schema or example gaps | R7-01-07, R7-05-02 | E1-S2, E1-S3 | S |
| E1-S5 | Formalize `$ref` token grammar in seed docs | R7-03-03 | E1-S2 | S |
| E1-S6 | Relocate/link SPEC-007 into governance + fix 12B paths | R7-06-01 | — | XS |

### E1-S1 — Scaffold package + test harness

- **Problem:** No `cli_workflow` package or pytest entrypoint exists.
- **Outcome:** Importable package under `.seed/scripts/cli_workflow/` with `README` stub and at least one passing smoke test.
- **AC:**
  - Package layout matches Architecture section (empty modules OK).
  - `pytest` discovers `.tests/test_cli_workflow_*.py`.
  - Smoke test imports package.
- **Verify:** `pytest .tests/test_cli_workflow_smoke.py -q`

### E1-S2 — `workflow_v1.schema.json`

- **Problem:** R7-01 acceptance requires JSON Schema; schema file missing.
- **Outcome:** Schema covers header, info, inputs, steps (`id`, `uses`, `needs`, `input`, `config`, `output.vars`, `context`), enums (`empty`, `normalize`, file modes/formats, `capture.family`, `context.export`).
- **AC:**
  - Schema exists at `schema/workflow_v1.schema.json`.
  - `uses` pattern `^tool\.(nmap|netdiscover|nerva|pius|subfinder|httpx|katana|nuclei)$`.
  - `output.vars` values `$ref` GSE binding schema (or embed).
- **Verify:** Schema loads with `jsonschema`; invalid minimal docs rejected in unit tests.

### E1-S3 — `gse_v1.schema.json`

- **Problem:** GSE bindings have no machine schema.
- **Outcome:** Schema for `select` | `union` | `literal` | `from_var`; node match; `where`/`related`/`not`/`attr`; `for_each`/`collect`/`emit`.
- **AC:** Matches 12C v1 operators; forbids unknown keys where practical (`additionalProperties: false` on core objects).
- **Verify:** Unit tests for valid/invalid GSE snippets from 12C + 12A excerpts.

### E1-S4 — Validate 12A

- **Problem:** Program AC #1 starts with “12A validates”.
- **Outcome:** 12A passes workflow + embedded GSE schema validation.
- **AC:** Test `test_cli_workflow_schema.py` asserts 12A validates; any mismatch fixed in schema (prefer) or documented SPEC_GAP issue if example must change.
- **Verify:** pytest green for schema suite.

### E1-S5 — Reference token grammar

- **Problem:** `$workflow.inputs.*`, `$steps.<id>.vars.*`, `$step.files.*`, `$step.input.values[n]` are informal.
- **Outcome:** Short normative subsection in 12B (or `REFERENCES.md` in package) listing exact patterns + resolution rules.
- **AC:** Loader/variables stories can implement from this text alone; examples from 12A all covered.
- **Verify:** Doc review checklist in PR; later E3 tests bind to these patterns.

### E1-S6 — Governance path hygiene

- **Problem:** 12B links to missing `.governance/specs/SPEC-007...` and gap notes.
- **Outcome:** SPEC linked/copied under `.governance/specs/`; 12B links fixed; create stub or real `SPEC007_SKETCH_GAP_NOTES.md` if still useful.
- **AC:** All 12B companion links resolve.
- **Verify:** Manual link check in PR.

---

## Epic E2 — Graph Select Language evaluator

**Intent:** Implement read-only GSE evaluation against scan graphs (R7-02).

| Story | Title | Req | Depends | Size |
|-------|-------|-----|---------|------|
| E2-S1 | Graph index + node match + project | R7-02-02 | E1-S3 | M |
| E2-S2 | `where` / `related` / `not` / `attr` | R7-02-02 | E2-S1 | M |
| E2-S3 | `reachable_from` + transitive walk | R7-02-02 | E2-S1 | M |
| E2-S4 | `for_each` + `collect` + `emit.product/join/values` | R7-02-02 | E2-S3 | L |
| E2-S5 | `union` / `literal` / `from_var` + `distinct` | R7-02-02 | E2-S1 | S |
| E2-S6 | Corpus tests: subfinder apex/sub + nmap ip:port | R7-02-03, R7-05-01 | E2-S2, E2-S4 | M |

### E2-S1 — Match + project

- **Outcome:** `match_nodes` supports `nugget_id`, `nugget_id_in`, `nugget_data_equals`, `nugget_data_regex`; `project: nugget_data`.
- **AC:** Flat `select` without `where`/`for_each` returns expected list from fixture.
- **Verify:** Unit tests with tiny hand-built graph + one corpus slice.

### E2-S2 — Predicates

- **Outcome:** AND-list `where` with `related` (direction, relation, transitive, nugget_id/_in), `not`, `attr`.
- **AC:** 12A apex/subdomain predicates evaluate correctly on subfinder fixture (or vendored copy).
- **Verify:** `test_cli_workflow_gse.py` cases for apex vs child.

### E2-S3 — Reachability

- **Outcome:** BFS/DFS over single relation; `transitive: true|false`; default direction `out`.
- **AC:** From HOST, transitive `contains` reaches IP and PORT on nmap-shaped fixture.
- **Verify:** Unit tests for depth-1 vs transitive.

### E2-S4 — Cascade emit

- **Outcome:** Implement 12C §5 semantics; empty collect ⇒ no emit for that root; `join` and `format`; `emit.values`.
- **AC:** 12A `ip_port_list` and `live_hosts` shapes evaluate; nested `for_each` either implemented or explicitly rejected with clear error + deferred note (A6).
- **Verify:** nmap cascade yields non-empty `ip:port` strings (program AC #1).

### E2-S5 — Non-select bindings

- **Outcome:** `union`, `literal`, `from_var`; `distinct` default true ⇒ sorted unique.
- **AC:** 12A `all_domains` union works when vars present in env.
- **Verify:** Unit tests.

### E2-S6 — Corpus fixture suite

- **Outcome:** Durable fixtures under package `fixtures/` (or documented external paths) + tests locked to ontology-true nugget ids (no `SUBDOMAIN`).
- **AC:** R7-05-01 satisfied; README notes fixture provenance.
- **Verify:** pytest gse suite green in CI-local run.

---

## Epic E3 — Loader, DAG, variables, files, context

**Intent:** Document → validated DAG + runtime environment primitives (R7-03-02..06 without full executor).

| Story | Title | Req | Depends | Size |
|-------|-------|-----|---------|------|
| E3-S1 | YAML load + schema validate + model objects | R7-03-02 | E1-S4 | M |
| E3-S2 | DAG build: needs resolution, cycles, parallel roots | R7-03-02, R7-05-03 | E3-S1 | M |
| E3-S3 | Variable environment resolver | R7-03-03 | E1-S5, E3-S1 | M |
| E3-S4 | Auto temp file materialization | R7-03-04 | E3-S3 | S |
| E3-S5 | Context merge uniqueness | R7-03-06, R7-05-04 | E3-S1 | S |

### E3-S1 — Loader

- **Outcome:** `load_workflow(path) -> WorkflowDocument`; reject invalid docs with actionable errors.
- **AC:** 12A loads; unknown `apiVersion`/`kind` fail; unknown adapter in `uses` fail.
- **Verify:** loader unit tests.

### E3-S2 — DAG

- **Outcome:** Topological layers; detect cycles; unknown `needs` ids; identify parallel-ready roots.
- **AC:** 12A yields fan-out after `subfinder_enum`; synthetic cycle rejected.
- **Verify:** `test_cli_workflow_dag.py`.

### E3-S3 — Variables

- **Outcome:** Resolve `$workflow.inputs.*`, `$steps.<id>.vars.*`, `$steps.<id>.scan_graph`, `$step.*` in step scope, `$workflow.context`.
- **AC:** All reference forms used in 12A resolve in a mocked env; bad refs error clearly.
- **Verify:** unit tests per reference class.

### E3-S4 — Files

- **Outcome:** `mode: auto` writes UTF-8 `line_text` temp input; exposes `$step.files.input` / `.output`; `mode: none` skips.
- **AC:** Round-trip list → file → read lines equal; cleanup policy documented.
- **Verify:** unit tests with tmp paths.

### E3-S5 — Context export

- **Outcome:** Merge nodes by id, edges by `(source,target,relation)`; `export: none` skips.
- **AC:** Duplicate node/edge appends do not duplicate; export steps vs interim steps behave as 12A.
- **Verify:** `test_cli_workflow_context.py`.

---

## Epic E4 — Dry-run runtime orchestration

**Intent:** Wire step pipeline without live CLIs (R7-03-05, R7-03-07).

| Story | Title | Req | Depends | Size |
|-------|-------|-----|---------|------|
| E4-S1 | Step pipeline interface (resolve → files → graph → GSE → context) | R7-03-05 | E2-*, E3-* | M |
| E4-S2 | Dry-run / fixture mode executor for whole workflow | R7-03-07 | E4-S1 | M |
| E4-S3 | Input policies: `empty: error \| skip_step \| continue` + `normalize` | R7-01 / 12B | E4-S1 | S |

### E4-S1 — Pipeline

- **Outcome:** Per-step function with injectable “graph provider” (fixture or driver).
- **AC:** Given a bound input list + fixture graph, produces `vars` + optional context merge.
- **Verify:** unit test one step (subfinder-shaped).

### E4-S2 — Workflow dry-run

- **Outcome:** Execute 12A DAG order with per-step fixture graphs; collect `steps[id].vars`, `steps[id].scan_graph`, `workflow.context`.
- **AC:** Program AC #2 — context contains merges only for export steps (`subfinder`, `nmap`, `nerva`, `nuclei`), not httpx/katana.
- **Verify:** `test_cli_workflow_e2e_dry_run.py`.

### E4-S3 — Input edge policies

- **Outcome:** `normalize: hostname_from_url`; empty-list policies.
- **AC:** URL defaults become hostnames for subfinder-shaped step; `skip_step` short-circuits without error.
- **Verify:** unit tests.

---

## Epic E5 — Tool drivers (live path)

**Intent:** Registry + thin CLI drivers calling SPEC-004 adapters (R7-04). **Not required to close program AC if E4/E6 green.**

| Story | Title | Req | Depends | Size |
|-------|-------|-----|---------|------|
| E5-S1 | Driver registry + interface contract | R7-04-01 | E4-S1 | S |
| E5-S2 | Wire adapters for tools used in 12A | R7-04-02 | E5-S1 | L |
| E5-S3 | Optional smoke: one live tool behind feature flag | R7-04-01 | E5-S2 | M |

### E5-S1 — Registry

- **Outcome:** `tool.<id>` → driver; dry-run provider remains default in CI.
- **AC:** Unknown tool errors; registered tools list documented in README.
- **Verify:** unit tests.

### E5-S2 — Adapter wiring

- **Outcome:** Drivers invoke existing SPEC-004 adapters (no new `*_to_graph.py`).
- **AC:** For each 12A tool, document import path; if adapter unavailable, issue moved to `Blocked` with exact missing path — do not invent mappers.
- **Verify:** import/smoke or blocker comment with evidence.

### E5-S3 — Live smoke (optional)

- **Outcome:** Manual/optional test running one installed CLI if present.
- **AC:** Skips cleanly when binary missing; never fails CI solely for missing CLI.
- **Verify:** skip markers documented.

---

## Epic E6 — Verification closeout

**Intent:** Prove R7-05 and program acceptance.

| Story | Title | Req | Depends | Size |
|-------|-------|-----|---------|------|
| E6-S1 | Consolidate test suite + CI instructions | R7-05-* | E4-S2, E2-S6 | S |
| E6-S2 | Program acceptance checklist evidence | Acceptance | E6-S1 | S |

### E6-S1 — Suite

- **AC:** All R7-05 test files exist and pass; README documents how to run.
- **Verify:** full `pytest .tests/test_cli_workflow_*.py`.

### E6-S2 — Acceptance packet

- **AC:** Issue comment or continuity note lists: 12A validates; nmap GSE non-empty ip:port; dry-run context export set; PR links.
- **Verify:** checklist complete on tracking issue.

---

## Epic E7 — Documentation + continuity

| Story | Title | Req | Depends | Size |
|-------|-------|-----|---------|------|
| E7-S1 | Package README — run / add driver | R7-06-02 | E6-S1 | S |
| E7-S2 | AGENTS.md + continuity handoff | R7-06-01, R7-06-03 | E7-S1 | S |

---

## Epic E8 — Langium Phase 2 (DEFERRED — not SPEC-007)

Tracked so earlier Langium interest is not lost, but **must not block SPEC-007**.

| Story | Title | Notes |
|-------|-------|-------|
| E8-S1 | Bootstrap Langium project for Workflow+GSE | Separate SPEC later |
| E8-S2 | Grammar 1:1 with YAML AST (12B/12C) | After E1 schemas stabilize |
| E8-S3 | Validators mirroring R7-01/R7-02 | Reuse semantics from Python where possible |
| E8-S4 | LAI descriptor → sysprompt → evals loop | Uses `.cursor/skills/lai*` |
| E8-S5 | Optional MCP validate tool | `lai-gen-mcp` |

---

## Suggested pickup order (first five stories)

1. **E1-S1** scaffold  
2. **E1-S2** + **E1-S3** schemas (can parallel after scaffold)  
3. **E1-S4** validate 12A  
4. **E2-S1** → **E2-S4** GSE core path  
5. **E3-S1** → **E4-S2** loader through dry-run  

## Definition of done (program)

- [x] R7-01..R7-06 requirement rows have PR evidence
- [x] 12A schema-valid
- [x] GSE cascade non-empty `ip:port` on nmap fixture
- [x] Dry-run E2E merges context only for export steps
- [x] README enables a new agent to add a driver without redesigning DSL
- [x] E8 not started unless a new SPEC explicitly opens Langium work

See `.seed/SPEC-007-CONTINUITY.md` for PR links and handoff.
