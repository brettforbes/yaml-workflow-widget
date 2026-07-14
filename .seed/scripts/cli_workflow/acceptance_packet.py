"""Collect program-acceptance evidence for SPEC-007 (E6-S2).

Run from repo root:

```bash
python .seed/scripts/cli_workflow/acceptance_packet.py
```
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / ".seed" / "scripts"))

import yaml

from cli_workflow.core.fixtures import load_fixture_graph
from cli_workflow.core.gse_eval import eval_binding
from cli_workflow.runtime.executor import dry_run_workflow
from cli_workflow.runtime.loader import load_workflow
from cli_workflow.schema_util import workflow_validator

EXAMPLE = ROOT / ".seed" / "12A_Workflow_YAML_Example.yaml"


def main() -> None:
    raw = yaml.safe_load(EXAMPLE.read_text(encoding="utf-8"))
    workflow_validator().validate(raw)
    print("OK 12A schema validates")

    nmap_step = next(s for s in load_workflow(EXAMPLE).steps if s.id == "nmap_ports")
    binding = nmap_step.output_vars["ip_port_list"]
    graph = load_fixture_graph("nmap_sample")
    values = eval_binding(binding, {"$step.scan_graph": graph})
    assert values and any(":" in v for v in values)
    print(f"OK nmap GSE ip:port count={len(values)} sample={values[:3]}")

    result = dry_run_workflow(EXAMPLE)
    ids = {n["id"] for n in result.env.context["nodes"]}
    assert "nerva--svc-1" in ids and "nuclei--finding-1" in ids
    assert "host--live-a" not in ids and "url--internal-1" not in ids
    print(
        "OK dry-run context: "
        f"nodes={len(result.env.context['nodes'])} "
        f"order={result.order}"
    )
    print("ACCEPTANCE_PACKET_OK")


if __name__ == "__main__":
    main()
