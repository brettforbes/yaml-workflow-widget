# SPEC-007 — CLI Workflow DSL + Runtime Foundation

| Field | Value |
|-------|-------|
| Status | Active |
| Created | 2026-07-13 |
| Seed docs | `.seed/12A_Workflow_YAML_Example.yaml`, `.seed/12B_Workflow_DSL_Description.md`, `.seed/12C_Graph_Select_Language.md` |
| Agent plan | `.seed/SPEC-007-AGENT-PLAN.md` (epics/stories + GitHub issue map) |
| Tracking | https://github.com/brettforbes/yaml-workflow-widget/issues/3 |
| Depends on | SPEC-004 (adapters/graphs), SPEC-005 (narrative — not required for runtime), SPEC-006 (structure docs — ontology truth) |
| Out of scope | Langium, Monaco, visual schematic, AST↔diagram sync, legacy `sfp_*` EVENT rewrite, context force-graph UI |

## Intent

Establish a **YAML-driven workflow DSL** and **runtime foundation** that sequences CLI apps, passes **string lists** between steps, extracts those lists via **Graph Select Language (GSE)** from scan graphs, and optionally merges step graphs into a **context** `{nodes, edges}` store.

This replaces the old SpiderFeet pattern of modules listening for EVENTS with little semantic structure. Workflow YAML is the contract; adapters remain the structured→graph path.

## Requirements

### R7-01 — DSL document contract

- **R7-01-01** Workflow documents MUST declare `apiVersion: spiderfeet.workflow/v1` and `kind: Workflow`.
- **R7-01-02** Steps MUST form a DAG via `needs` (empty list = roots).
- **R7-01-03** Tool references MUST use `uses: tool.<adapter_id>` where `<adapter_id>` is an ADAPTER_TOOLS id (nmap, netdiscover, nerva, pius, subfinder, httpx, katana, nuclei).
- **R7-01-04** Inter-step interchange MUST be `string_list` (UTF-8 values). Paired values are ordinary strings (e.g. `1.2.3.4:443`) produced by GSE.
- **R7-01-05** `config.argv` MUST be a YAML list (not a shell string). File placeholders `$step.files.input` / `$step.files.output` are allowed.
- **R7-01-06** Structured capture is mandatory when the tool supports it (proj-06 structured-first).
- **R7-01-07** Canonical example `.seed/12A_Workflow_YAML_Example.yaml` MUST validate against the workflow JSON Schema.

### R7-02 — Graph Select Language (GSE)

- **R7-02-01** Output variables MUST be expressed as GSE bindings per `.seed/12C_Graph_Select_Language.md`.
- **R7-02-02** GSE MUST support: node match, `where`/`related`/`not`, `for_each`, `reachable_from` with transitive `contains`, `emit.product` + `join`/`format`, `union`, `distinct`.
- **R7-02-03** GSE MUST evaluate against real corpus `*_proposed_nuggets_edges.json` fixtures without inventing nugget ids.
- **R7-02-04** Informal sketch forms (`concat({{IP_ADDRESS}},…)`, `{{SUBDOMAIN}}`, `sum(...)`) are forbidden in validated workflows.

### R7-03 — Runtime foundation

- **R7-03-01** Package root: `.seed/scripts/cli_workflow/`.
- **R7-03-02** Loader MUST parse YAML, validate schema, resolve DAG, reject cycles / unknown step refs / unknown adapters.
- **R7-03-03** Variable environment MUST resolve `$workflow.inputs.*`, `$step.*`, `$steps.<id>.vars.*`, `$steps.<id>.scan_graph`, `$workflow.context`.
- **R7-03-04** Auto temp files MUST write `line_text` input lists and capture structured output paths for adapters.
- **R7-03-05** Step execution MUST: resolve input → files → invoke tool driver → adapter graph → GSE vars → optional context merge.
- **R7-03-06** Context export `scan_graph` MUST merge full `nodes` and `edges` (unique by node id / edge triple). `export: none` MUST skip merge.
- **R7-03-07** A `dry_run` / fixture mode MUST execute GSE + context merge from existing corpus graphs **without** invoking live CLIs (for CI).

### R7-04 — Tool drivers (CLI only)

- **R7-04-01** Registry maps `tool.<id>` → driver that runs the CLI with resolved argv and returns structured artifact path + exit code.
- **R7-04-02** Drivers MUST call existing SPEC-004 adapters to build scan graphs (no new hardcoded `*_to_graph.py`).
- **R7-04-03** SpiderFeet `sfp_*` module bridging is **out of scope** for SPEC-007 (tracked as future SPEC).

### R7-05 — Governance / tests

- **R7-05-01** Unit tests for GSE against nmap + subfinder corpus fixtures.
- **R7-05-02** Schema validation test for 12A example.
- **R7-05-03** DAG loader tests (cycle detection, needs resolution, parallel roots).
- **R7-05-04** Context merge uniqueness tests.
- **R7-05-05** End-to-end dry-run of 12A using corpus graphs for each step (mocked tool outputs).

### R7-06 — Documentation

- **R7-06-01** Keep 12A/12B/12C as canonical seed docs; update AGENTS.md pointer.
- **R7-06-02** Package README with lesser-agent “how to run / how to add a tool driver”.
- **R7-06-03** Continuity handoff when foundation lands.

## Non-goals

- Langium grammar, Monaco embed, workflow visualisation library, bidirectional diagram sync
- Context UI behaviours (select icons, RMB connect/disconnect/delete)
- Rewriting Enrichments / EVENT bus modules
- Inventing Nexus

## Traceability

| Requirement | Primary implementation |
|-------------|------------------------|
| R7-01-* | `schema/workflow_v1.schema.json`, loader |
| R7-02-* | `core/gse_eval.py`, `schema/gse_v1.schema.json`, 12C |
| R7-03-* | `runtime/*`, `core/variables.py`, `core/context_export.py` |
| R7-04-* | `tools/registry.py`, per-tool drivers |
| R7-05-* | `.tests/test_cli_workflow_*.py` |
| R7-06-* | README, AGENTS.md, continuity |

## Acceptance (program)

1. 12A validates; GSE cascade yields non-empty `ip:port` from nmap fixture
2. Dry-run E2E of example workflow with mocked step graphs merges context for export steps only
3. Agent plan children closed with PR evidence
4. Operator can read 12A/12B/12C and understand how to author a new two-step chain
