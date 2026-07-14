"""Variable / reference environment resolver (R7-03-03, E3-S3).

Normative reference: `cli_workflow/REFERENCES.md`. This module resolves the
full token grammar defined there against a runtime `WorkflowEnv`:

    $workflow.inputs.<name>
    $workflow.context
    $step.scan_graph
    $step.vars.<name>
    $step.files.input | $step.files.output
    $step.input.values | $step.input.values[<n>]
    $steps.<step_id>.vars.<name>
    $steps.<step_id>.scan_graph

Environment shape
------------------
`WorkflowEnv` is the runtime state for one workflow execution:

- `inputs`: resolved workflow input `string_list`s, keyed by input name
  (override-or-default already applied by the caller).
- `context`: the accumulated `$workflow.context` graph (`{nodes, edges}`),
  merged by `core.context_export`.
- `steps`: completed steps' runtime state (`StepRuntime`), keyed by step id.
  A step is only visible under `$steps.<id>.*` once it has been recorded
  here (REFERENCES.md rule 2).
- `current_step_id`: the step currently executing, if any. `$step.*` tokens
  resolve against `steps[current_step_id]` and are a hard error outside a
  step's execution scope (REFERENCES.md rule 1). Callers execute a step by
  registering a `StepRuntime` under `current_step_id` (or reusing the
  entry in `steps` while it is being populated) before resolving its refs.

`StepRuntime` bundles the four kinds of state a step's refs may address:
`input_values` (`$step.input.values[*]`), `files` (`$step.files.*`), `vars`
(`$step.vars.*` / `$steps.<id>.vars.*`), and `scan_graph`
(`$step.scan_graph` / `$steps.<id>.scan_graph`).

Two consumption modes are provided on top of `resolve_ref`:

- `resolve_string_list(ref, env)`: for contexts that require a
  `string_list` (`input.from`, `union` items, `from_var`) — hard errors if
  the ref resolves to something else (REFERENCES.md rule 4).
- `expand_argv(argv, env)`: substitutes every ref token embedded in each
  `config.argv` string with its resolved scalar value (R7-01-05).
- `build_gse_env(env)`: flattens `WorkflowEnv` into the `env` mapping shape
  `core.gse_eval` expects (`env["$step.scan_graph"]`, etc.) for evaluating
  `output.vars` GSE bindings.

All resolution is read-only; there is no write-through form (REFERENCES.md
non-goals).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any


class VariableError(Exception):
    """Unknown, out-of-scope, or wrongly-typed reference (R7-03-03)."""


@dataclass
class StepRuntime:
    """Runtime state captured for one step (current or completed)."""

    step_id: str
    input_values: list[str] = field(default_factory=list)
    files: dict[str, str] = field(default_factory=dict)
    vars: dict[str, list[str]] = field(default_factory=dict)
    scan_graph: dict[str, Any] = field(default_factory=lambda: {"nodes": [], "edges": []})


@dataclass
class WorkflowEnv:
    """Runtime variable environment for one workflow execution."""

    inputs: dict[str, list[str]] = field(default_factory=dict)
    context: dict[str, Any] = field(default_factory=lambda: {"nodes": [], "edges": []})
    steps: dict[str, StepRuntime] = field(default_factory=dict)
    current_step_id: str | None = None

    def current(self) -> StepRuntime:
        """The step currently executing; hard error if none is set (rule 1)."""
        if self.current_step_id is None:
            raise VariableError("$step.* is out of scope: no step is currently executing")
        if self.current_step_id not in self.steps:
            raise VariableError(
                f"Current step {self.current_step_id!r} has no registered runtime state"
            )
        return self.steps[self.current_step_id]

    def step(self, step_id: str) -> StepRuntime:
        """A completed (or currently registered) step's runtime state by id."""
        if step_id not in self.steps:
            raise VariableError(f"Unknown or not-yet-completed step id: {step_id!r}")
        return self.steps[step_id]


# ---------------------------------------------------------------------------
# Reference token grammar (REFERENCES.md)
# ---------------------------------------------------------------------------

_NAME = r"[a-z][a-z0-9_]*"

_WORKFLOW_INPUT = re.compile(rf"^\$workflow\.inputs\.({_NAME})$")
_WORKFLOW_CONTEXT = re.compile(r"^\$workflow\.context$")
_STEP_SCAN = re.compile(r"^\$step\.scan_graph$")
_STEP_VAR = re.compile(rf"^\$step\.vars\.({_NAME})$")
_STEP_FILE = re.compile(r"^\$step\.files\.(input|output)$")
_STEP_VALUES_IDX = re.compile(r"^\$step\.input\.values\[(\d+)\]$")
_STEP_VALUES = re.compile(r"^\$step\.input\.values$")
_STEPS_VAR = re.compile(rf"^\$steps\.({_NAME})\.vars\.({_NAME})$")
_STEPS_SCAN = re.compile(rf"^\$steps\.({_NAME})\.scan_graph$")

# Catch-all used to find ref-shaped substrings embedded in argv strings.
# `resolve_ref` is the single source of truth for which tokens are actually
# valid; anything this matches but `resolve_ref` doesn't recognize raises a
# clear "unknown reference" error rather than being left as literal text.
_EMBEDDED_REF_RE = re.compile(r"\$[a-z][a-z0-9_]*(?:\.[a-z0-9_]+(?:\[\d+\])?)*")


def _resolve_workflow_input(match: re.Match[str], env: WorkflowEnv) -> list[str]:
    name = match.group(1)
    if name not in env.inputs:
        raise VariableError(f"Unknown workflow input: {name!r}")
    return list(env.inputs[name])


def _resolve_workflow_context(_match: re.Match[str], env: WorkflowEnv) -> dict[str, Any]:
    return env.context


def _resolve_step_scan(_match: re.Match[str], env: WorkflowEnv) -> dict[str, Any]:
    return env.current().scan_graph


def _resolve_step_var(match: re.Match[str], env: WorkflowEnv) -> list[str]:
    name = match.group(1)
    current = env.current()
    if name not in current.vars:
        raise VariableError(f"Current step has no var {name!r}")
    return list(current.vars[name])


def _resolve_step_file(match: re.Match[str], env: WorkflowEnv) -> str:
    which = match.group(1)
    current = env.current()
    if which not in current.files:
        raise VariableError(f"Step {current.step_id!r} has no files.{which} bound")
    return current.files[which]


def _resolve_step_values_idx(match: re.Match[str], env: WorkflowEnv) -> str:
    index = int(match.group(1))
    values = env.current().input_values
    if index >= len(values):
        raise VariableError(f"$step.input.values[{index}] out of range (len={len(values)})")
    return values[index]


def _resolve_step_values(_match: re.Match[str], env: WorkflowEnv) -> list[str]:
    return list(env.current().input_values)


def _resolve_steps_var(match: re.Match[str], env: WorkflowEnv) -> list[str]:
    step_id, name = match.group(1), match.group(2)
    step = env.step(step_id)
    if name not in step.vars:
        raise VariableError(f"Step {step_id!r} has no var {name!r}")
    return list(step.vars[name])


def _resolve_steps_scan(match: re.Match[str], env: WorkflowEnv) -> dict[str, Any]:
    step_id = match.group(1)
    return env.step(step_id).scan_graph


_RESOLVERS: tuple[tuple[re.Pattern[str], Any], ...] = (
    (_WORKFLOW_INPUT, _resolve_workflow_input),
    (_WORKFLOW_CONTEXT, _resolve_workflow_context),
    (_STEP_SCAN, _resolve_step_scan),
    (_STEP_VAR, _resolve_step_var),
    (_STEP_FILE, _resolve_step_file),
    (_STEP_VALUES_IDX, _resolve_step_values_idx),
    (_STEP_VALUES, _resolve_step_values),
    (_STEPS_VAR, _resolve_steps_var),
    (_STEPS_SCAN, _resolve_steps_scan),
)


def resolve_ref(ref: str, env: WorkflowEnv) -> Any:
    """Resolve one full reference token (REFERENCES.md) to its runtime value.

    Returns a `str` (files, single values), a `list[str]` (workflow inputs,
    vars, full input values), or a graph `dict` (`scan_graph`, `context`).
    Raises `VariableError` for unknown names, out-of-scope step ids, or
    out-of-range indices.
    """
    for pattern, resolver in _RESOLVERS:
        match = pattern.match(ref)
        if match:
            return resolver(match, env)
    raise VariableError(f"Unrecognized reference token: {ref!r}")


def resolve_string_list(ref: str, env: WorkflowEnv) -> list[str]:
    """Resolve `ref` where a `string_list` is required (`input.from`, `union`,
    `from_var`). Graph refs (`scan_graph`, `context`) are a hard error here
    (REFERENCES.md rule 4).
    """
    value = resolve_ref(ref, env)
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise VariableError(
            f"Reference {ref!r} does not resolve to a string_list "
            "(graph refs cannot be used where a string_list is required)"
        )
    return value


def build_gse_env(env: WorkflowEnv) -> dict[str, Any]:
    """Flatten `WorkflowEnv` into the `env` mapping `core.gse_eval` expects.

    Keys mirror the REFERENCES.md tokens GSE bindings actually consume:
    `$step.scan_graph`, `$step.vars.<name>`, `$steps.<id>.scan_graph`,
    `$steps.<id>.vars.<name>`, and `$workflow.context`.
    """
    flat: dict[str, Any] = {"$workflow.context": env.context}

    if env.current_step_id is not None and env.current_step_id in env.steps:
        current = env.current()
        flat["$step.scan_graph"] = current.scan_graph
        for name, values in current.vars.items():
            flat[f"$step.vars.{name}"] = list(values)

    for step_id, step in env.steps.items():
        flat[f"$steps.{step_id}.scan_graph"] = step.scan_graph
        for name, values in step.vars.items():
            flat[f"$steps.{step_id}.vars.{name}"] = list(values)

    return flat


def expand_argv(argv: list[str], env: WorkflowEnv) -> list[str]:
    """Expand every `$ref` token embedded in each `config.argv` string (R7-01-05).

    Only refs that resolve to a scalar `str` may be embedded (file paths,
    `$step.input.values[<n>]`); refs resolving to a list or graph raise
    `VariableError` since they cannot be spliced into a single argv string.
    """

    def _replace(match: re.Match[str]) -> str:
        ref = match.group(0)
        value = resolve_ref(ref, env)
        if not isinstance(value, str):
            raise VariableError(
                f"Reference {ref!r} does not resolve to a single value; "
                "only file paths / indexed values may be embedded in argv"
            )
        return value

    return [_EMBEDDED_REF_RE.sub(_replace, item) for item in argv]
