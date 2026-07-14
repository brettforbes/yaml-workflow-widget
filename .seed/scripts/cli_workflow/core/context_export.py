"""Context graph merge (R7-03-06, E3-S5).

`context.export: scan_graph` merges a step's full `{nodes, edges}` scan
graph into the accumulated `$workflow.context` graph; `export: none` (or an
omitted `context` block) skips the merge entirely — the decision belongs to
the caller (`should_export`), the merge itself (`merge_into_context`) is
always additive.

Merge semantics (12B §2.5): **append unique**, not update-in-place.
- Nodes are unique by identity: `id` preferred, `nugget_instance_id`
  fallback (mirrors `core.gse_eval.get_node_id`).
- Edges are unique by the `(source, target, relation)` triple.
- A duplicate node/edge (by that identity) is dropped; the first copy
  merged in wins and is never overwritten by a later duplicate.
"""

from __future__ import annotations

from typing import Any, Mapping

from cli_workflow.core.gse_eval import get_node_id

Node = dict
Edge = dict
Graph = dict


class ContextExportError(Exception):
    """Raised for malformed graphs passed to context merge."""


def _edge_key(edge: Edge) -> tuple[str, str, str]:
    source = edge.get("source")
    target = edge.get("target")
    relation = edge.get("relation")
    if source is None or target is None or relation is None:
        raise ContextExportError(f"Edge missing source/target/relation: {edge!r}")
    return (str(source), str(target), str(relation))


def new_context() -> Graph:
    """A fresh, empty `{nodes, edges}` context graph."""
    return {"nodes": [], "edges": []}


def merge_into_context(context: Graph, step_graph: Graph) -> Graph:
    """Append-unique merge of `step_graph` into `context` (mutates and returns `context`).

    Nodes unique by id (`get_node_id`); edges unique by
    `(source, target, relation)`. Safe to call repeatedly with overlapping
    graphs — duplicates are silently skipped, never duplicated or replaced.
    """
    context.setdefault("nodes", [])
    context.setdefault("edges", [])

    existing_node_ids = {get_node_id(node) for node in context["nodes"]}
    for node in step_graph.get("nodes", []) or []:
        node_id = get_node_id(node)
        if node_id in existing_node_ids:
            continue
        existing_node_ids.add(node_id)
        context["nodes"].append(node)

    existing_edge_keys = {_edge_key(edge) for edge in context["edges"]}
    for edge in step_graph.get("edges", []) or []:
        key = _edge_key(edge)
        if key in existing_edge_keys:
            continue
        existing_edge_keys.add(key)
        context["edges"].append(edge)

    return context


def should_export(context_spec: Mapping[str, Any] | Any | None) -> bool:
    """Whether a step's `context:` block requests `export: scan_graph` (R7-03-06)."""
    if context_spec is None:
        return False
    if isinstance(context_spec, Mapping):
        export = context_spec.get("export", "none")
    else:
        export = getattr(context_spec, "export", "none")
    return export == "scan_graph"


def maybe_merge_step(
    context: Graph, step_graph: Graph, context_spec: Mapping[str, Any] | Any | None
) -> Graph:
    """Merge `step_graph` into `context` only when `context_spec` requests export."""
    if should_export(context_spec):
        merge_into_context(context, step_graph)
    return context
