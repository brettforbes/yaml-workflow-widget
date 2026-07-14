"""Dry-run / live step pipeline + workflow executor (R7-03-05, R7-03-07, E4).

Pipeline (per step)
-------------------
1. Resolve `input.from` against the current `WorkflowEnv`.
2. Apply `normalize` (e.g. `hostname_from_url`).
3. Apply `empty` policy (`error` | `skip_step` | `continue`).
4. Materialize auto temp files; register `$step.files.*`.
5. Obtain a scan graph from an injectable **graph provider** (fixture in dry-run,
   live driver later).
6. Evaluate `output.vars` GSE bindings in declaration order.
7. Optionally merge into `$workflow.context` when `context.export: scan_graph`.
8. Expand `config.argv` refs for diagnostics / live drivers (optional).

Dry-run
-------
`dry_run_workflow` walks the DAG in ready order, using fixture graphs per
`capture.adapter` / `uses` tool id, and never invokes live CLIs (R7-03-07).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Mapping
from urllib.parse import urlparse

from cli_workflow.core.context_export import maybe_merge_step, new_context
from cli_workflow.core.dag import build_dag
from cli_workflow.core.fixtures import load_fixture_graph
from cli_workflow.core.gse_eval import GseEvalError, eval_binding
from cli_workflow.core.variables import (
    StepRuntime,
    VariableError,
    WorkflowEnv,
    build_gse_env,
    expand_argv,
    resolve_string_list,
)
from cli_workflow.runtime.files import materialize_step_files
from cli_workflow.runtime.loader import Step, WorkflowDocument, load_workflow

Graph = dict[str, Any]
GraphProvider = Callable[[Step, WorkflowEnv, list[str]], Graph]


class ExecutorError(Exception):
    """Raised for step input/policy / pipeline failures."""


@dataclass
class StepResult:
    """Outcome of one step pipeline run."""

    step_id: str
    skipped: bool = False
    skip_reason: str | None = None
    input_values: list[str] = field(default_factory=list)
    vars: dict[str, list[str]] = field(default_factory=dict)
    scan_graph: Graph = field(default_factory=lambda: {"nodes": [], "edges": []})
    argv: list[str] = field(default_factory=list)
    files: dict[str, str] = field(default_factory=dict)


@dataclass
class WorkflowResult:
    """Outcome of a full workflow dry-run / execution."""

    document: WorkflowDocument
    env: WorkflowEnv
    step_results: dict[str, StepResult] = field(default_factory=dict)
    order: list[str] = field(default_factory=list)


def normalize_hostname_from_url(values: list[str]) -> list[str]:
    """Strip URL schemes/paths to hostnames (`normalize: hostname_from_url`).

    Bare hostnames / domains pass through unchanged. `http://x/y` → `x`.
    """
    out: list[str] = []
    for value in values:
        raw = value.strip()
        if not raw:
            continue
        if "://" in raw:
            parsed = urlparse(raw)
            host = parsed.hostname or parsed.netloc.split("@")[-1].split(":")[0]
            if host:
                out.append(host)
            else:
                out.append(raw)
        else:
            # Strip accidental path/query from bare hosts
            host = raw.split("/")[0].split("?")[0]
            if "@" in host:
                host = host.split("@", 1)[-1]
            if host.count(":") == 1 and not host.startswith("["):
                # hostname:port — keep host only for DNS tools
                maybe_host, maybe_port = host.rsplit(":", 1)
                if maybe_port.isdigit():
                    host = maybe_host
            out.append(host)
    return out


def apply_normalize(values: list[str], normalize: str | None) -> list[str]:
    """Apply a named `input.normalize` policy, or return values unchanged."""
    if not normalize:
        return list(values)
    if normalize == "hostname_from_url":
        return normalize_hostname_from_url(values)
    raise ExecutorError(f"Unsupported input.normalize: {normalize!r}")


def apply_empty_policy(
    values: list[str], empty: str | None, *, step_id: str
) -> tuple[list[str], bool]:
    """Apply `input.empty` policy.

    Returns `(values, skipped)`.
    - `error` (default): empty list raises `ExecutorError`
    - `skip_step`: empty list ⇒ skip without error
    - `continue`: proceed with empty list
    """
    policy = empty or "error"
    if values:
        return values, False
    if policy == "continue":
        return [], False
    if policy == "skip_step":
        return [], True
    if policy == "error":
        raise ExecutorError(f"Step {step_id!r} input is empty (empty: error)")
    raise ExecutorError(f"Unsupported input.empty: {policy!r}")


def _adapter_key(step: Step) -> str:
    adapter = (step.config.capture or {}).get("adapter")
    if adapter:
        return str(adapter)
    uses = step.uses
    if uses.startswith("tool."):
        return uses[len("tool.") :]
    return uses


# Default dry-run fixture names under cli_workflow/fixtures/
DEFAULT_DRY_RUN_FIXTURES: dict[str, str] = {
    "subfinder": "subfinder_sample",
    "nmap": "nmap_sample",
    "httpx": "httpx_sample",
    "katana": "katana_sample",
    "nerva": "nerva_sample",
    "nuclei": "nuclei_sample",
}


def fixture_graph_provider(
    fixture_map: Mapping[str, str] | None = None,
) -> GraphProvider:
    """Build a graph provider that loads package fixtures by adapter/tool id."""
    mapping = dict(DEFAULT_DRY_RUN_FIXTURES)
    if fixture_map:
        mapping.update(fixture_map)

    def provider(step: Step, _env: WorkflowEnv, _values: list[str]) -> Graph:
        key = _adapter_key(step)
        name = mapping.get(key)
        if name is None:
            raise ExecutorError(
                f"No dry-run fixture mapped for adapter/tool {key!r} "
                f"(step {step.id!r})"
            )
        return load_fixture_graph(name)

    return provider


def run_step(
    step: Step,
    env: WorkflowEnv,
    graph_provider: GraphProvider,
    *,
    expand_argv_refs: bool = True,
) -> StepResult:
    """Execute the resolve→files→graph→GSE→context pipeline for one step."""
    try:
        raw_values = resolve_string_list(step.input.from_ref, env)
    except VariableError as exc:
        raise ExecutorError(f"Step {step.id!r} input.from failed: {exc}") from exc

    values = apply_normalize(raw_values, step.input.normalize)
    values, skipped = apply_empty_policy(values, step.input.empty, step_id=step.id)
    if skipped:
        runtime = StepRuntime(step_id=step.id, input_values=[])
        env.steps[step.id] = runtime
        return StepResult(step_id=step.id, skipped=True, skip_reason="empty_input")

    runtime = StepRuntime(step_id=step.id, input_values=list(values))
    env.steps[step.id] = runtime
    env.current_step_id = step.id

    step_files = materialize_step_files(step.config.files, values)
    try:
        if step_files.input is not None:
            runtime.files["input"] = str(step_files.input)
        if step_files.output is not None:
            runtime.files["output"] = str(step_files.output)

        try:
            scan_graph = graph_provider(step, env, values)
        except Exception as exc:  # noqa: BLE001 — surface as ExecutorError
            raise ExecutorError(
                f"Step {step.id!r} graph provider failed: {exc}"
            ) from exc
        if not isinstance(scan_graph, dict):
            raise ExecutorError(
                f"Step {step.id!r} graph provider must return a dict graph"
            )
        runtime.scan_graph = {
            "nodes": list(scan_graph.get("nodes") or []),
            "edges": list(scan_graph.get("edges") or []),
        }

        # Evaluate vars in declaration order so later bindings can `$step.vars.*`
        for var_name, binding in step.output_vars.items():
            gse_env = build_gse_env(env)
            try:
                result = eval_binding(binding, gse_env)
            except GseEvalError as exc:
                raise ExecutorError(
                    f"Step {step.id!r} output.vars.{var_name} GSE failed: {exc}"
                ) from exc
            runtime.vars[var_name] = list(result)

        maybe_merge_step(env.context, runtime.scan_graph, step.context)

        argv: list[str] = []
        if expand_argv_refs:
            try:
                argv = expand_argv(list(step.config.argv), env)
            except VariableError as exc:
                raise ExecutorError(
                    f"Step {step.id!r} argv expansion failed: {exc}"
                ) from exc

        return StepResult(
            step_id=step.id,
            input_values=list(values),
            vars={k: list(v) for k, v in runtime.vars.items()},
            scan_graph=runtime.scan_graph,
            argv=argv,
            files=dict(runtime.files),
        )
    finally:
        step_files.cleanup()
        env.current_step_id = None


def _resolve_workflow_inputs(
    document: WorkflowDocument, inputs: Mapping[str, list[str]] | None
) -> dict[str, list[str]]:
    resolved: dict[str, list[str]] = {}
    overrides = dict(inputs or {})
    for name, spec in document.inputs.items():
        if name in overrides:
            resolved[name] = list(overrides[name])
        else:
            resolved[name] = list(spec.default)
    return resolved


def dry_run_workflow(
    document: WorkflowDocument | str | Path,
    *,
    inputs: Mapping[str, list[str]] | None = None,
    graph_provider: GraphProvider | None = None,
    fixture_map: Mapping[str, str] | None = None,
) -> WorkflowResult:
    """Execute a workflow in dry-run / fixture mode (R7-03-07).

    Does not invoke live CLIs. Graphs come from `graph_provider` or the default
    fixture map (`DEFAULT_DRY_RUN_FIXTURES`).
    """
    if not isinstance(document, WorkflowDocument):
        document = load_workflow(document)

    dag = build_dag(document.steps)
    env = WorkflowEnv(
        inputs=_resolve_workflow_inputs(document, inputs),
        context=new_context(),
    )
    provider = graph_provider or fixture_graph_provider(fixture_map)
    steps_by_id = {step.id: step for step in document.steps}
    results: dict[str, StepResult] = {}
    order = dag.ready_order()

    for step_id in order:
        step = steps_by_id[step_id]
        # If any dependency was skipped and this step's input.from targets a
        # missing var, empty policy handles it; otherwise run normally.
        results[step_id] = run_step(step, env, provider)

    return WorkflowResult(
        document=document,
        env=env,
        step_results=results,
        order=order,
    )
