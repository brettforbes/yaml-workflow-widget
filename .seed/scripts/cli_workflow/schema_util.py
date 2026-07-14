"""Shared JSON Schema helpers for cli_workflow tests / loader."""

from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

PACKAGE_ROOT = Path(__file__).resolve().parent
SCHEMA_DIR = PACKAGE_ROOT / "schema"
WORKFLOW_SCHEMA_PATH = SCHEMA_DIR / "workflow_v1.schema.json"
GSE_SCHEMA_PATH = SCHEMA_DIR / "gse_v1.schema.json"


def schema_registry() -> Registry:
    workflow = json.loads(WORKFLOW_SCHEMA_PATH.read_text(encoding="utf-8"))
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


def workflow_validator() -> Draft202012Validator:
    schema = json.loads(WORKFLOW_SCHEMA_PATH.read_text(encoding="utf-8"))
    return Draft202012Validator(schema, registry=schema_registry())


def gse_validator() -> Draft202012Validator:
    schema = json.loads(GSE_SCHEMA_PATH.read_text(encoding="utf-8"))
    return Draft202012Validator(schema, registry=schema_registry())
