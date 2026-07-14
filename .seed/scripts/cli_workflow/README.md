# cli_workflow (SPEC-007)

YAML workflow DSL + GSE + dry-run runtime foundation.

Package root for SPEC-007. See `.seed/SPEC-007-cli-workflow-dsl.md` and
`.seed/SPEC-007-AGENT-PLAN.md`.

**Reference grammar:** [REFERENCES.md](REFERENCES.md) (R7-03-03).

**SPEC-004 adapters (live path):** [tools/ADAPTERS.md](tools/ADAPTERS.md).

## Run tests

From repo root:

```bash
python -m pip install pytest pyyaml jsonschema referencing
python -m pytest .tests -k cli_workflow -q
```

## Dry-run a workflow

```bash
python -c "from pathlib import Path; from cli_workflow.runtime.executor import dry_run_workflow; r=dry_run_workflow(Path('.seed/12A_Workflow_YAML_Example.yaml')); print(r.order); print(len(r.env.context['nodes']), 'context nodes')"
```

(Requires `.seed/scripts` on `PYTHONPATH`, or run via pytest/`conftest` path setup.)

## Registered tool drivers (live path)

Known `uses: tool.<id>` ids:

`nmap`, `netdiscover`, `nerva`, `pius`, `subfinder`, `httpx`, `katana`, `nuclei`

```python
from cli_workflow.tools.drivers import default_registry
reg = default_registry()
print(reg.list_registered())
```

CI default remains **fixture dry-run** (`runtime.executor.dry_run_workflow`).
Live drivers skip cleanly when the CLI binary is missing.

## Add a tool driver

1. Confirm the adapter id is in `tools.registry.KNOWN_TOOL_IDS` (schema enum too).
2. Document the SPEC-004 import path in `tools/adapters.py` (`ADAPTER_SOURCE_PATHS`).
3. Register a `CliToolDriver` (or custom driver) in `tools.drivers.cli.default_registry`.
4. Do **not** invent `*_to_graph.py` here — wire SpiderFeet `cli_corpus` adapters.

## Layout

See agent plan Architecture section. Epics E1–E4 fill schema / GSE / loader /
dry-run; E5 fills `tools/`.
