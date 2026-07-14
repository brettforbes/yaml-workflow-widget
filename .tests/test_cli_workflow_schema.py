"""E1-S2: workflow_v1.schema.json loads and rejects invalid docs (R7-01)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_DIR = ROOT / ".seed" / "scripts" / "cli_workflow" / "schema"
SCHEMA_PATH = SCHEMA_DIR / "workflow_v1.schema.json"
GSE_SCHEMA_PATH = SCHEMA_DIR / "gse_v1.schema.json"


def _workflow_schema_registry() -> Registry:
    workflow = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    gse = json.loads(GSE_SCHEMA_PATH.read_text(encoding="utf-8"))
    return Registry().with_resources(
        [
            (gse["$id"], Resource.from_contents(gse, default_specification=DRAFT202012)),
            (
                workflow["$id"],
                Resource.from_contents(workflow, default_specification=DRAFT202012),
            ),
        ]
    )


@pytest.fixture(scope="module")
def workflow_validator() -> Draft202012Validator:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    registry = _workflow_schema_registry()
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema, registry=registry)


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
