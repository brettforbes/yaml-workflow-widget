"""E1-S2/S4: workflow_v1.schema.json loads and validates docs (R7-01)."""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml
from jsonschema import Draft202012Validator

from cli_workflow.schema_util import WORKFLOW_SCHEMA_PATH, workflow_validator as make_validator

ROOT = Path(__file__).resolve().parents[1]
EXAMPLE_12A = ROOT / ".seed" / "12A_Workflow_YAML_Example.yaml"


@pytest.fixture(scope="module")
def workflow_validator() -> Draft202012Validator:
    return make_validator()


def test_schema_file_exists():
    assert WORKFLOW_SCHEMA_PATH.is_file()


def test_12a_example_validates(workflow_validator: Draft202012Validator):
    """R7-01-07 / R7-05-02: canonical example must validate."""
    doc = yaml.safe_load(EXAMPLE_12A.read_text(encoding="utf-8"))
    workflow_validator.validate(doc)

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
