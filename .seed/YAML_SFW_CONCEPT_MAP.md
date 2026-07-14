# YAML ↔ `.sfw` concept map (SPEC-009 / R8-02-03)

Canonical document: `.seed/12A_Workflow_YAML_Example.yaml`  
Langium surface: `packages/workflow-lang/src/language/workflow.langium`  
Example: `packages/workflow-lang/examples/minimal.sfw`

## Decision

No automatic mapper in this SPEC. YAML remains interchange; `.sfw` is tooling surface.
See `.seed/SPEC-009-post-foundation.md`.

## Concept map

| YAML path / concept | Langium rule / shape | Notes |
|---------------------|----------------------|-------|
| `apiVersion` | `Workflow.apiVersion` | const `spiderfeet.workflow/v1` |
| `kind` | `Workflow.kind` | const `Workflow` |
| `id` | `Workflow.workflowId` | optional `workflow--<uuid>` |
| `info.*` | `Info` | name/description/author/created |
| `inputs.<name>` | `InputDecl` | `type string_list` + defaults |
| `steps[]` | `Step` | DAG via `needs` cross-refs |
| `steps[].uses` | `Step.uses` | `tool.<adapter>` |
| `steps[].input` | `StepInput` | `from` / `normalize` / `empty` |
| `steps[].config.argv` | `StepConfig.argv` | string list |
| `steps[].config.files` | `FileSpec` | mode/format/path |
| `steps[].config.capture` | `StepConfig` capture block | family/adapter |
| `steps[].output.vars.<name>` | `OutputVar` + `GseBinding` | GSE select/union/literal/from_var |
| GSE `select.nodes` | `NodeMatch` | nugget_id / where |
| GSE `select.for_each` | `ForEach` + `Collect` + `Emit` | cascade |
| `steps[].context.export` | `StepContext.export` | `scan_graph` \| `none` |

## Tests

`packages/workflow-lang` parse/validate smokes prove the `.sfw` column.
`.tests/test_cli_workflow_schema.py` proves the YAML column.
This map is the bridge contract until a future converter SPEC opens.
