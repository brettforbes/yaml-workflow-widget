# Agent guide — yaml-workflow-widget

## SPEC-007 — CLI Workflow DSL + Runtime Foundation

Canonical seed docs (do not delete; treat as source of truth):

| Doc | Path |
|-----|------|
| Example workflow | `.seed/12A_Workflow_YAML_Example.yaml` |
| Workflow DSL | `.seed/12B_Workflow_DSL_Description.md` |
| Graph Select Language | `.seed/12C_Graph_Select_Language.md` |
| Spec | `.seed/SPEC-007-cli-workflow-dsl.md` |
| Agent plan / issue map | `.seed/SPEC-007-AGENT-PLAN.md` |

Implementation package: `.seed/scripts/cli_workflow/`

| Concern | Location |
|---------|----------|
| Schemas | `schema/workflow_v1.schema.json`, `schema/gse_v1.schema.json` |
| GSE evaluator | `core/gse_eval.py` |
| Loader / DAG / vars / files / context | `runtime/loader.py`, `core/dag.py`, `core/variables.py`, `runtime/files.py`, `core/context_export.py` |
| Dry-run executor | `runtime/executor.py` |
| Tool registry / adapters | `tools/registry.py`, `tools/adapters.py`, `tools/drivers/` |
| How to run / add a driver | [`.seed/scripts/cli_workflow/README.md`](.seed/scripts/cli_workflow/README.md) |
| Continuity handoff | [`.seed/SPEC-007-CONTINUITY.md`](.seed/SPEC-007-CONTINUITY.md) |

### Verify

```bash
python -m pip install pytest pyyaml jsonschema referencing
python -m pytest .tests -k cli_workflow -q
```

### Langium

Langium Phase 2 is **deferred** (Epic E8 / issues #11, #39–#43). Project skills live under `.cursor/skills/` (`langium`, `lai`, `lai-gen-*`). Do not start Langium under SPEC-007 unless a new SPEC opens that work.

### Governance

VibeGov rules: `.cursor/rules/gov-*.mdc`. Branch from `develop`, PR into `develop`, do not delete seed/skill docs.
