"""SPEC-010 / #75: workflow → Nice-DAG mapper topology tests."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / ".tests" / "fixtures" / "workflow_12a_steps.json"
MAPPER = ROOT / "src" / "js" / "workflowDagModel.js"


def _run_mapper() -> list[dict]:
    script = f"""
const fs = require('fs');
const path = require('path');
const {{ workflowToNiceDagModel }} = require({json.dumps(str(MAPPER))});
const doc = JSON.parse(fs.readFileSync({json.dumps(str(FIXTURE))}, 'utf8'));
const model = workflowToNiceDagModel(doc);
process.stdout.write(JSON.stringify(model));
"""
    proc = subprocess.run(
        ["node", "-e", script],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise AssertionError(proc.stderr or proc.stdout)
    return json.loads(proc.stdout)


def test_mapper_preserves_12a_fanout_topology():
    model = _run_mapper()
    by_id = {n["id"]: n for n in model}
    assert set(by_id) == {
        "subfinder_enum",
        "nmap_ports",
        "nerva_services",
        "httpx_live",
        "katana_crawl",
        "nuclei_vulns",
    }
    assert by_id["subfinder_enum"]["dependencies"] == []
    assert by_id["nmap_ports"]["dependencies"] == ["subfinder_enum"]
    assert by_id["httpx_live"]["dependencies"] == ["subfinder_enum"]
    assert by_id["nerva_services"]["dependencies"] == ["nmap_ports"]
    assert by_id["katana_crawl"]["dependencies"] == ["httpx_live"]
    assert by_id["nuclei_vulns"]["dependencies"] == ["katana_crawl"]


def test_mapper_carries_export_and_uses_metadata():
    model = _run_mapper()
    by_id = {n["id"]: n for n in model}
    assert by_id["subfinder_enum"]["data"]["export"] == "scan_graph"
    assert by_id["httpx_live"]["data"]["export"] == "none"
    assert by_id["katana_crawl"]["data"]["export"] == "none"
    assert by_id["nmap_ports"]["data"]["uses"] == "tool.nmap"


def test_mapper_rejects_missing_steps():
    script = f"""
const {{ workflowToNiceDagModel }} = require({json.dumps(str(MAPPER))});
try {{
  workflowToNiceDagModel({{}});
  process.exit(2);
}} catch (e) {{
  process.stdout.write(String(e.message || e));
  process.exit(0);
}}
"""
    proc = subprocess.run(["node", "-e", script], cwd=str(ROOT), capture_output=True, text=True)
    assert proc.returncode == 0
    assert "steps" in proc.stdout
