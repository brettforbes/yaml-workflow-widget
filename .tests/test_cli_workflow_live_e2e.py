"""SPEC-009 / #68: optional SPEC-004 adapter E2E (skip if unavailable)."""

from __future__ import annotations

import shutil

import pytest

from cli_workflow.tools.adapters import adapter_status
from cli_workflow.tools.drivers import CliToolDriver
from cli_workflow.tools.live_e2e import (
    run_subfinder_adapter_on_fixture,
    subfinder_adapter_available,
)


@pytest.mark.skipif(
    not subfinder_adapter_available(),
    reason="SpiderFeet subfinder SPEC-004 adapter not importable",
)
def test_subfinder_adapter_to_graph_on_jsonl_fixture():
    """When cli_corpus is on path, adapter produces a non-empty scan graph."""
    graph = run_subfinder_adapter_on_fixture()
    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or []
    assert nodes, "expected non-empty nodes from subfinder.to_graph"
    assert isinstance(edges, list)
    status = adapter_status("subfinder")
    assert status.available
    assert status.module and "to_graph" in status.module


@pytest.mark.skipif(shutil.which("subfinder") is None, reason="subfinder binary not on PATH")
def test_optional_live_subfinder_version_still_skips_cleanly_when_present():
    driver = CliToolDriver(tool_id="subfinder", build_graph=False)
    result = driver.run(argv=["-version"], input_values=[], files={})
    assert not result.skipped
    assert result.exit_code in (0, 1, 2)
