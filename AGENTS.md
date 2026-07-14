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

### Langium (SPEC-008)

| Doc | Path |
|-----|------|
| Spec | `.seed/SPEC-008-langium-workflow-gse.md` |
| Package | `packages/workflow-lang/` |
| Skills | `.cursor/skills/langium`, `.cursor/skills/lai*` |

Epic [#11](https://github.com/brettforbes/yaml-workflow-widget/issues/11); start at [#39](https://github.com/brettforbes/yaml-workflow-widget/issues/39).

```bash
cd packages/workflow-lang && npm install && npm run build
```

### Governance

VibeGov rules: `.cursor/rules/gov-*.mdc`. Branch from `develop`, PR into `develop`, do not delete seed/skill docs.
