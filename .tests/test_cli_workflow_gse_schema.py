"""E1-S3: gse_v1.schema.json loads and validates GSE bindings."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_DIR = ROOT / ".seed" / "scripts" / "cli_workflow" / "schema"
GSE_SCHEMA_PATH = SCHEMA_DIR / "gse_v1.schema.json"
WORKFLOW_SCHEMA_PATH = SCHEMA_DIR / "workflow_v1.schema.json"


def _load_gse_schema() -> dict:
    return json.loads(GSE_SCHEMA_PATH.read_text(encoding="utf-8"))


def _schema_registry() -> Registry:
    gse = _load_gse_schema()
    workflow = json.loads(WORKFLOW_SCHEMA_PATH.read_text(encoding="utf-8"))
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
def gse_validator() -> Draft202012Validator:
    schema = _load_gse_schema()
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema)


@pytest.fixture(scope="module")
def workflow_validator() -> Draft202012Validator:
    workflow = json.loads(WORKFLOW_SCHEMA_PATH.read_text(encoding="utf-8"))
    registry = _schema_registry()
    Draft202012Validator.check_schema(workflow)
    return Draft202012Validator(workflow, registry=registry)


def test_gse_schema_file_exists():
    assert GSE_SCHEMA_PATH.is_file()


def test_gse_schema_check_schema(gse_validator: Draft202012Validator):
    assert gse_validator.schema["$id"] == "https://spiderfeet.local/schemas/gse_v1.schema.json"


def test_valid_flat_select_domain_name(gse_validator: Draft202012Validator):
    binding = {
        "type": "string_list",
        "select": {
            "source": "$step.scan_graph",
            "nodes": {"nugget_id": "DOMAIN_NAME"},
            "project": "nugget_data",
            "distinct": True,
        },
        "distinct": True,
    }
    gse_validator.validate(binding)


def test_valid_for_each_ip_port_list(gse_validator: Draft202012Validator):
    binding = {
        "type": "string_list",
        "select": {
            "source": "$step.scan_graph",
            "for_each": {
                "as": "endpoint",
                "nodes": {
                    "nugget_id_in": ["HOST", "SYSTEM", "DEVICE", "CDN", "SERVER"]
                },
                "collect": [
                    {
                        "as": "ip",
                        "reachable_from": "endpoint",
                        "along": {"relation": "contains", "transitive": True},
                        "nodes": {"nugget_id_in": ["IP_ADDRESS", "IPV6_ADDRESS"]},
                        "project": "nugget_data",
                    },
                    {
                        "as": "port",
                        "reachable_from": "endpoint",
                        "along": {"relation": "contains", "transitive": True},
                        "nodes": {"nugget_id": "PORT"},
                        "project": "nugget_data",
                    },
                ],
                "emit": {"product": ["ip", "port"], "join": ":"},
            },
            "distinct": True,
        },
        "distinct": True,
    }
    gse_validator.validate(binding)


def test_valid_union(gse_validator: Draft202012Validator):
    binding = {
        "type": "string_list",
        "union": ["$step.vars.domains", "$step.vars.subdomains"],
        "distinct": True,
    }
    gse_validator.validate(binding)


def test_invalid_unknown_key(gse_validator: Draft202012Validator):
    binding = {
        "type": "string_list",
        "select": {
            "source": "$step.scan_graph",
            "nodes": {"nugget_id": "DOMAIN_NAME"},
            "project": "nugget_data",
        },
        "bogus": True,
    }
    assert not gse_validator.is_valid(binding)


def test_invalid_missing_type(gse_validator: Draft202012Validator):
    binding = {
        "select": {
            "source": "$step.scan_graph",
            "nodes": {"nugget_id": "DOMAIN_NAME"},
            "project": "nugget_data",
        }
    }
    assert not gse_validator.is_valid(binding)


def test_invalid_both_select_and_union(gse_validator: Draft202012Validator):
    binding = {
        "type": "string_list",
        "select": {
            "source": "$step.scan_graph",
            "nodes": {"nugget_id": "DOMAIN_NAME"},
            "project": "nugget_data",
        },
        "union": ["$step.vars.domains"],
    }
    assert not gse_validator.is_valid(binding)


def test_workflow_schema_resolves_gse_ref(workflow_validator: Draft202012Validator):
    doc = {
        "apiVersion": "spiderfeet.workflow/v1",
        "kind": "Workflow",
        "id": "workflow--1c51e712-b5b5-4ef2-9967-e11debbcc607",
        "info": {"name": "gse-ref"},
        "inputs": {"targets": {"type": "string_list", "default": ["example.com"]}},
        "steps": [
            {
                "id": "sfp_cli_subfinder",
                "uses": "tool.subfinder",
                "input": {
                    "type": "string_list",
                    "from": "$workflow.inputs.targets",
                },
                "config": {
                    "argv": ["-silent"],
                    "files": {
                        "input": {"mode": "none"},
                        "output": {"mode": "auto", "format": "jsonl"},
                    },
                    "capture": {"family": "structured_native", "adapter": "subfinder"},
                },
                "output": {
                    "vars": {
                        "domains": {
                            "type": "string_list",
                            "select": {
                                "source": "$step.scan_graph",
                                "nodes": {"nugget_id": "DOMAIN_NAME"},
                                "project": "nugget_data",
                            },
                        }
                    }
                },
            }
        ],
    }
    workflow_validator.validate(doc)
