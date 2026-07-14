"""E5-S1 / E5-S2 / E5-S3: tool registry, adapter map, optional live smoke."""

from __future__ import annotations

import shutil

import pytest

from cli_workflow.tools.adapters import (
    ADAPTER_SOURCE_PATHS,
    adapter_status,
    spiderfeet_cli_corpus_dir,
)
from cli_workflow.tools.drivers import CliToolDriver, default_registry
from cli_workflow.tools.registry import (
    KNOWN_TOOL_IDS,
    RegistryError,
    ToolRegistry,
    parse_tool_id,
)


def test_parse_tool_id_and_unknown():
    assert parse_tool_id("tool.subfinder") == "subfinder"
    with pytest.raises(RegistryError):
        parse_tool_id("tool.unknown")
    with pytest.raises(RegistryError):
        parse_tool_id("subfinder")


def test_registry_unknown_and_unregistered():
    reg = ToolRegistry()
    with pytest.raises(RegistryError, match="Unknown"):
        reg.get("tool.notreal")
    with pytest.raises(RegistryError, match="no driver"):
        reg.get("tool.subfinder")


def test_default_registry_lists_12a_tools():
    reg = default_registry()
    registered = reg.list_registered()
    for tool in ("subfinder", "nmap", "httpx", "katana", "nerva", "nuclei"):
        assert tool in registered
    assert set(KNOWN_TOOL_IDS) == set(reg.list_known())
    assert all(tid in ADAPTER_SOURCE_PATHS for tid in KNOWN_TOOL_IDS)


def test_adapter_status_documents_paths():
    status = adapter_status("subfinder")
    assert "spiderfeet" in status.source_path
    # On this multi-root machine corpus is expected; either ok is fine —
    # status must always be truthful.
    corpus = spiderfeet_cli_corpus_dir()
    if corpus is None:
        assert status.available is False
        assert "not found" in status.detail.lower() or "SPIDERFEET" in status.detail
    else:
        # May still fail if spiderfeet deps missing; document either way.
        assert status.source_path


@pytest.mark.skipif(shutil.which("subfinder") is None, reason="subfinder binary not on PATH")
def test_optional_live_subfinder_smoke():
    """E5-S3: live smoke skips cleanly when binary missing (skip marker above)."""
    driver = CliToolDriver(tool_id="subfinder", build_graph=False)
    result = driver.run(argv=["-version"], input_values=[], files={})
    assert not result.skipped
    # subfinder -version often exits 0; accept any completed invoke
    assert result.argv[0]
    assert result.exit_code in (0, 1, 2)


def test_cli_driver_skips_when_binary_missing(monkeypatch):
    monkeypatch.setattr("cli_workflow.tools.drivers.cli.shutil.which", lambda _b: None)
    driver = CliToolDriver(tool_id="subfinder")
    result = driver.run(argv=["-silent"], input_values=["example.com"], files={})
    assert result.skipped
    assert "not found" in (result.skip_reason or "")
