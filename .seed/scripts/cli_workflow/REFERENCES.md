# Workflow / GSE reference token grammar (v1)

Normative patterns for placeholders resolved by the runtime variable environment (R7-03-03).
All forms used in `.seed/12A_Workflow_YAML_Example.yaml` are covered.

## Tokens

| Pattern | Resolves to | Context |
|---------|-------------|---------|
| `$workflow.inputs.<name>` | Workflow input `string_list` (override or `default`) | Any step `input.from`, argv (rare) |
| `$workflow.context` | Accumulated context graph `{nodes, edges}` | GSE `select.source` only |
| `$step.scan_graph` | Current step scan graph after adapter | GSE `select.source` |
| `$step.vars.<name>` | Variable already bound on current step | GSE `union` / later vars |
| `$step.files.input` | Temp or declared input file path | `config.argv` |
| `$step.files.output` | Temp or declared output file path | `config.argv` |
| `$step.input.values` | Full resolved input string list | Rare; prefer files |
| `$step.input.values[<n>]` | Single element (`n` = non-negative integer) | Single-value CLIs |
| `$steps.<step_id>.vars.<name>` | Completed upstream step variable | Downstream `input.from`, `from_var`, `union` |
| `$steps.<step_id>.scan_graph` | Completed upstream step graph | GSE `select.source` |

## Lexical rules

```text
NAME       := [a-z][a-z0-9_]*
STEP_ID    := NAME
INDEX      := [0-9]+
REF_WORKFLOW_INPUT   := '$workflow.inputs.' NAME
REF_WORKFLOW_CONTEXT := '$workflow.context'
REF_STEP_SCAN        := '$step.scan_graph'
REF_STEP_VAR         := '$step.vars.' NAME
REF_STEP_FILE        := '$step.files.' ('input' | 'output')
REF_STEP_VALUES      := '$step.input.values' ('[' INDEX ']')?
REF_STEPS_VAR        := '$steps.' STEP_ID '.vars.' NAME
REF_STEPS_SCAN       := '$steps.' STEP_ID '.scan_graph'
```

## Resolution rules

1. `$step.*` is valid only inside the step currently executing.
2. `$steps.<id>.*` requires `<id>` to appear in `needs` (directly or transitively completed) except when reading the current step via `$step`.
3. Unknown names / out-of-scope step ids are hard errors.
4. Graph refs (`scan_graph`, `context`) must not be used where a `string_list` is required (`input.from`, `union` items, `from_var`).
5. List/index refs that are out of range are hard errors (caller may use `empty` policy before argv expansion).
6. Values are UTF-8 strings; no shell quoting is applied by the resolver.

## Non-goals

- Shell expression evaluation (`$(...)`, pipes)
- Arbitrary JSONPath / JMESPath
- Writing through references (read-only)
