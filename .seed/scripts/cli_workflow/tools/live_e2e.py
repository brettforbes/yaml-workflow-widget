"""Optional live / SPEC-004 adapter E2E helpers (SPEC-009 / #68).

Primary CI path remains fixture dry-run. These helpers exercise real SpiderFeet
`cli_corpus` adapters when present; callers must skip when unavailable.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from cli_workflow.core.fixtures import FIXTURES_DIR
from cli_workflow.tools.adapters import adapter_status, load_to_graph

SUBFINDER_LIVE_JSONL = FIXTURES_DIR / "subfinder_live_sample.jsonl"


def subfinder_adapter_available() -> bool:
    return adapter_status("subfinder").available


def run_subfinder_adapter_on_fixture(
    path: Path | None = None,
    *,
    target: str = "example.com",
) -> dict[str, Any]:
    """Call SPEC-004 ``subfinder.to_graph`` on a JSONL fixture (no CLI invoke)."""
    fixture = path or SUBFINDER_LIVE_JSONL
    if not fixture.is_file():
        raise FileNotFoundError(fixture)
    raw = fixture.read_text(encoding="utf-8")
    to_graph = load_to_graph("subfinder")
    graph = to_graph(raw, target=target)
    if not isinstance(graph, dict):
        raise TypeError(f"to_graph returned {type(graph)!r}, expected dict")
    return graph
