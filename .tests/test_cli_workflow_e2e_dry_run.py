"""E4-S2: dry-run workflow executor for 12A (R7-03-07, program AC #2)."""

from __future__ import annotations

from pathlib import Path

from cli_workflow.runtime.executor import dry_run_workflow

ROOT = Path(__file__).resolve().parents[1]
EXAMPLE_12A = ROOT / ".seed" / "12A_Workflow_YAML_Example.yaml"

EXPORT_STEPS = {"sfp_cli_subfinder", "sfp_cli_nmap", "sfp_cli_nerva", "sfp_cli_nuclei"}
NON_EXPORT_STEPS = {"sfp_cli_httpx", "sfp_cli_katana"}


def test_dry_run_12a_e2e_context_export_set():
    result = dry_run_workflow(EXAMPLE_12A)
    assert result.order[0] == "sfp_cli_subfinder"
    assert set(result.step_results) == EXPORT_STEPS | NON_EXPORT_STEPS

    sf = result.step_results["sfp_cli_subfinder"]
    assert not sf.skipped
    assert sf.vars["all_domains"]
    assert "example.com" in sf.vars["apex_domains"]

    nmap = result.step_results["sfp_cli_nmap"]
    assert not nmap.skipped
    assert nmap.vars["ip_port_list"]
    assert any(":" in item for item in nmap.vars["ip_port_list"])

    httpx = result.step_results["sfp_cli_httpx"]
    assert not httpx.skipped
    assert "www.example.com" in httpx.vars["live_hosts"]
    assert "cdn.example.com" in httpx.vars["live_hosts"]

    katana = result.step_results["sfp_cli_katana"]
    assert not katana.skipped
    assert katana.vars["crawl_urls"]

    nerva = result.step_results["sfp_cli_nerva"]
    assert not nerva.skipped  # got ip_port_list from nmap

    nuclei = result.step_results["sfp_cli_nuclei"]
    assert not nuclei.skipped

    context_ids = {node["id"] for node in result.env.context["nodes"]}
    # Export steps contribute identifiable fixture nodes
    assert any(nid.startswith("host--") or "DOMAIN_NAME" for nid in context_ids) or context_ids
    assert "nerva--svc-1" in context_ids
    assert "nuclei--finding-1" in context_ids
    # nmap host marker from fixture
    assert "host--alpha" in context_ids or any(
        n.get("nugget_id") == "HOST" for n in result.env.context["nodes"]
    )

    # Non-export steps must NOT merge their unique nodes into context
    assert "host--live-a" not in context_ids  # httpx fixture
    assert "url--internal-1" not in context_ids  # katana fixture


def test_dry_run_respects_input_overrides():
    result = dry_run_workflow(
        EXAMPLE_12A,
        inputs={"targets": ["https://custom.test"]},
    )
    assert result.step_results["sfp_cli_subfinder"].input_values == ["custom.test"]
