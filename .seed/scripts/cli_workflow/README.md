# cli_workflow (SPEC-007)

YAML workflow DSL + GSE + dry-run runtime foundation.

Package root for SPEC-007. See `.seed/SPEC-007-cli-workflow-dsl.md` and
`.seed/SPEC-007-AGENT-PLAN.md`.

**Reference grammar:** [REFERENCES.md](REFERENCES.md) (R7-03-03).

## Run tests

From repo root:

```bash
python -m pip install pytest pyyaml jsonschema referencing
python -m pytest .tests/test_cli_workflow_*.py -q
```

## Layout

See agent plan Architecture section. Modules are filled by E2–E5 stories.
