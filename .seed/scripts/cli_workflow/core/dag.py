"""Workflow step DAG build / cycle detection (R7-03-02, E3-S2).

Builds a validated DAG from workflow steps' `needs` lists: topological
layers (steps in a layer have every dependency satisfied by an earlier
layer, so a layer's members may run in parallel), the set of dependency-free
"root" steps, and a flattened ready order.

Input steps may be any object exposing `id` / `needs` via mapping access
(`step["id"]`, `step.get("needs")`) or attribute access (`step.id`,
`step.needs`) — this lets callers pass either raw YAML step dicts or
`runtime.loader.Step` dataclasses without adapting shapes.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Mapping


class DagError(ValueError):
    """Base error for workflow DAG construction problems."""


class UnknownStepReferenceError(DagError):
    """A step's `needs` references a step id that does not exist."""


class DagCycleError(DagError):
    """The step graph is not acyclic."""


def _step_id(step: Any) -> str:
    if isinstance(step, Mapping):
        return step["id"]
    return step.id


def _step_needs(step: Any) -> list[str]:
    if isinstance(step, Mapping):
        needs = step.get("needs") or []
    else:
        needs = getattr(step, "needs", None) or []
    return list(needs)


@dataclass(frozen=True)
class Dag:
    """Resolved step DAG: ids, needs, topological layers, and roots."""

    step_ids: tuple[str, ...]
    needs: dict[str, tuple[str, ...]]
    layers: tuple[tuple[str, ...], ...]
    roots: tuple[str, ...]

    def layer_of(self, step_id: str) -> int:
        """Index of the layer containing `step_id` (0 = first ready layer)."""
        for idx, layer in enumerate(self.layers):
            if step_id in layer:
                return idx
        raise KeyError(f"Unknown step id: {step_id!r}")

    def ready_order(self) -> list[str]:
        """Flatten layers into one valid (dependency-respecting) execution order."""
        return [step_id for layer in self.layers for step_id in layer]


def build_dag(steps: Iterable[Any]) -> Dag:
    """Build a validated DAG from workflow `steps` (R7-03-02, R7-05-03).

    Raises:
        UnknownStepReferenceError: a step's `needs` names a step id that is
            not present among `steps`.
        DagCycleError: the `needs` graph contains a cycle (no step in the
            remaining set has all dependencies satisfied).
        DagError: duplicate step ids.
    """
    ids: list[str] = []
    needs_map: dict[str, list[str]] = {}
    for step in steps:
        step_id = _step_id(step)
        if step_id in needs_map:
            raise DagError(f"Duplicate step id: {step_id!r}")
        ids.append(step_id)
        needs_map[step_id] = _step_needs(step)

    known_ids = set(ids)
    for step_id, needs in needs_map.items():
        for need in needs:
            if need not in known_ids:
                raise UnknownStepReferenceError(
                    f"Step {step_id!r} needs unknown step id {need!r}"
                )

    layers: list[list[str]] = []
    resolved: set[str] = set()
    remaining = set(ids)
    while remaining:
        layer = sorted(
            step_id for step_id in remaining if set(needs_map[step_id]).issubset(resolved)
        )
        if not layer:
            raise DagCycleError(f"Cycle detected among steps: {sorted(remaining)!r}")
        layers.append(layer)
        resolved.update(layer)
        remaining.difference_update(layer)

    roots = tuple(sorted(step_id for step_id in ids if not needs_map[step_id]))

    return Dag(
        step_ids=tuple(ids),
        needs={step_id: tuple(needs_map[step_id]) for step_id in ids},
        layers=tuple(tuple(layer) for layer in layers),
        roots=roots,
    )
