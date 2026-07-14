"""E6-S1: R7-05 test surface inventory — every required suite file exists."""

from __future__ import annotations

from pathlib import Path

TESTS = Path(__file__).resolve().parent

REQUIRED = [
    "test_cli_workflow_smoke.py",
    "test_cli_workflow_schema.py",
    "test_cli_workflow_gse_schema.py",
    "test_cli_workflow_gse.py",
    "test_cli_workflow_loader.py",
    "test_cli_workflow_dag.py",
    "test_cli_workflow_variables.py",
    "test_cli_workflow_files.py",
    "test_cli_workflow_context.py",
    "test_cli_workflow_executor.py",
    "test_cli_workflow_e2e_dry_run.py",
    "test_cli_workflow_tools.py",
]


def test_r7_05_test_files_present():
    missing = [name for name in REQUIRED if not (TESTS / name).is_file()]
    assert missing == [], f"Missing R7-05 test files: {missing}"
