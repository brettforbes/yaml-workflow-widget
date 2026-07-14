"""YAML workflow loader (R7-03-02, E3-S1).

`load_workflow(path)` parses a workflow YAML document, validates it against
`schema/workflow_v1.schema.json` (which enforces `apiVersion`/`kind`
constants, the `uses: tool.<adapter>` enum, and embeds `gse_v1.schema.json`
for `output.vars`), and returns a `WorkflowDocument` of light dataclasses.
Schema validation rejects unknown `apiVersion`/`kind` and unknown adapters
in `uses`; this module surfaces those (and any other schema violation) as a
single `WorkflowLoadError` listing every violation found.

DAG resolution (`needs` cycle / unknown-reference checks) is deliberately
out of scope here — see `core.dag.build_dag`, which consumes
`WorkflowDocument.steps` directly.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

from cli_workflow.schema_util import workflow_validator


class WorkflowLoadError(Exception):
    """Raised when a workflow document cannot be read, parsed, or validated."""


@dataclass(frozen=True)
class WorkflowInput:
    type: str
    description: str | None = None
    default: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class StepInput:
    type: str
    from_ref: str
    normalize: str | None = None
    empty: str | None = None


@dataclass(frozen=True)
class FileSpec:
    mode: str
    format: str | None = None
    path: str | None = None


@dataclass(frozen=True)
class StepConfig:
    argv: list[str]
    files: dict[str, FileSpec]
    capture: dict[str, str]


@dataclass(frozen=True)
class StepContext:
    export: str = "none"


@dataclass(frozen=True)
class Step:
    id: str
    uses: str
    needs: list[str]
    input: StepInput
    config: StepConfig
    output_vars: dict[str, dict[str, Any]]
    context: StepContext
    raw: dict[str, Any]


@dataclass(frozen=True)
class WorkflowDocument:
    api_version: str
    kind: str
    id: str
    info: dict[str, Any]
    inputs: dict[str, WorkflowInput]
    steps: list[Step]
    raw: dict[str, Any]

    def step_by_id(self, step_id: str) -> Step:
        for step in self.steps:
            if step.id == step_id:
                return step
        raise KeyError(f"Unknown step id: {step_id!r}")


def _format_error(error: Any) -> str:
    location = "/".join(str(part) for part in error.path) or "<root>"
    return f"{location}: {error.message}"


def _parse_input(raw: dict[str, Any]) -> WorkflowInput:
    return WorkflowInput(
        type=raw["type"],
        description=raw.get("description"),
        default=list(raw.get("default", [])),
    )


def _parse_step_input(raw: dict[str, Any]) -> StepInput:
    return StepInput(
        type=raw["type"],
        from_ref=raw["from"],
        normalize=raw.get("normalize"),
        empty=raw.get("empty"),
    )


def _parse_file_spec(raw: dict[str, Any]) -> FileSpec:
    return FileSpec(mode=raw["mode"], format=raw.get("format"), path=raw.get("path"))


def _parse_step_config(raw: dict[str, Any]) -> StepConfig:
    files_raw = raw.get("files", {}) or {}
    files = {name: _parse_file_spec(spec) for name, spec in files_raw.items()}
    return StepConfig(
        argv=list(raw["argv"]),
        files=files,
        capture=dict(raw.get("capture", {})),
    )


def _parse_step(raw: dict[str, Any]) -> Step:
    output_raw = raw.get("output") or {}
    context_raw = raw.get("context") or {}
    return Step(
        id=raw["id"],
        uses=raw["uses"],
        needs=list(raw.get("needs", [])),
        input=_parse_step_input(raw["input"]),
        config=_parse_step_config(raw["config"]),
        output_vars=dict(output_raw.get("vars") or {}),
        context=StepContext(export=context_raw.get("export", "none")),
        raw=raw,
    )


def _parse_document(doc: dict[str, Any]) -> WorkflowDocument:
    inputs = {name: _parse_input(spec) for name, spec in (doc.get("inputs") or {}).items()}
    steps = [_parse_step(step) for step in doc.get("steps", [])]
    return WorkflowDocument(
        api_version=doc["apiVersion"],
        kind=doc["kind"],
        id=doc["id"],
        info=dict(doc.get("info", {})),
        inputs=inputs,
        steps=steps,
        raw=doc,
    )


def parse_workflow_dict(doc: Any) -> WorkflowDocument:
    """Validate an already-parsed workflow mapping and build a `WorkflowDocument`.

    Split out from `load_workflow` so callers with an in-memory dict (tests,
    generated docs) can skip the file I/O step.
    """
    if not isinstance(doc, dict):
        raise WorkflowLoadError(
            f"Workflow document must be a mapping, got {type(doc).__name__}"
        )

    validator = workflow_validator()
    errors = sorted(validator.iter_errors(doc), key=lambda e: list(e.path))
    if errors:
        details = "; ".join(_format_error(e) for e in errors)
        raise WorkflowLoadError(f"Workflow document failed schema validation: {details}")

    return _parse_document(doc)


def load_workflow(path: str | Path) -> WorkflowDocument:
    """Load, parse, and schema-validate a workflow YAML file (R7-03-02).

    Rejects unknown `apiVersion`/`kind` and unknown `uses` adapters via
    schema validation (R7-01-01, R7-01-03), and raises `WorkflowLoadError`
    with an actionable message for any I/O, YAML, or schema problem.
    """
    resolved_path = Path(path)
    try:
        text = resolved_path.read_text(encoding="utf-8")
    except OSError as exc:
        raise WorkflowLoadError(f"Cannot read workflow file {resolved_path}: {exc}") from exc

    try:
        doc = yaml.safe_load(text)
    except yaml.YAMLError as exc:
        raise WorkflowLoadError(f"Invalid YAML in {resolved_path}: {exc}") from exc

    try:
        return parse_workflow_dict(doc)
    except WorkflowLoadError as exc:
        raise WorkflowLoadError(f"{resolved_path}: {exc}") from exc
