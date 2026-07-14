"""E1-S2: workflow_v1.schema.json loads and rejects invalid docs (R7-01)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / ".seed" / "scripts" / "cli_workflow" / "schema" / "workflow_v1.schema.json"


@pytest.fixture(scope="module")
def workflow_validator() -> Draft202012Validator:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema)


def test_schema_file_exists():
    assert SCHEMA_PATH.is_file()


def test_minimal_valid_workflow(workflow_validator: Draft202012Validator):
    doc = {
        "apiVersion": "spiderfeet.workflow/v1",
        "kind": "Workflow",
        "id": "workflow--1c51e712-b5b5-4ef2-9967-e11debbcc607",
        "info": {"name": "t"},
        "inputs": {"targets": {"type": "string_list", "default": ["example.com"]}},
        "steps": [
            {
                "id": "subfinder_enum",
                "uses": "tool.subfinder",
                "needs": [],
                "input": {
                    "type": "string_list",
                    "from": "$workflow.inputs.targets",
                    "empty": "error",
                },
                "config": {
                    "argv": ["-silent"],
                    "files": {
                        "input": {"mode": "none"},
                        "output": {"mode": "auto", "format": "jsonl"},
                    },
                    "capture": {"family": "structured_native", "adapter": "subfinder"},
                },
            }
        ],
    }
    workflow_validator.validate(doc)


def test_rejects_unknown_api_version(workflow_validator: Draft202012Validator):
    doc = {
        "apiVersion": "spiderfeet.workflow/v0",
        "kind": "Workflow",
        "id": "workflow--1c51e712-b5b5-4ef2-9967-e11debbcc607",
        "info": {"name": "t"},
        "inputs": {"targets": {"type": "string_list"}},
        "steps": [
            {
                "id": "x",
                "uses": "tool.nmap",
                "input": {"type": "string_list", "from": "$workflow.inputs.targets"},
                "config": {
                    "argv": ["-oX"],
                    "files": {
                        "input": {"mode": "auto", "format": "line_text"},
                        "output": {"mode": "auto", "format": "xml"},
                    },
                    "capture": {"family": "structured_native", "adapter": "nmap"},
                },
            }
        ],
    }
    assert not workflow_validator.is_valid(doc)


def test_rejects_unknown_adapter_uses(workflow_validator: Draft202012Validator):
    doc = {
        "apiVersion": "spiderfeet.workflow/v1",
        "kind": "Workflow",
        "id": "workflow--1c51e712-b5b5-4ef2-9967-e11debbcc607",
        "info": {"name": "t"},
        "inputs": {"targets": {"type": "string_list"}},
        "steps": [
            {
                "id": "bad",
                "uses": "tool.not_a_real_tool",
                "input": {"type": "string_list", "from": "$workflow.inputs.targets"},
                "config": {
                    "argv": ["x"],
                    "files": {
                        "input": {"mode": "none"},
                        "output": {"mode": "auto", "format": "jsonl"},
                    },
                    "capture": {
                        "family": "structured_native",
                        "adapter": "subfinder",
                    },
                },
            }
        ],
    }
    assert not workflow_validator.is_valid(doc)
