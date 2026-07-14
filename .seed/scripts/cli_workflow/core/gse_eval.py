"""Graph Select Language (GSE) v1 evaluator (R7-02, E2 stories).

Normative reference: `.seed/12C_Graph_Select_Language.md`.

Public API:
    eval_binding(binding, env) -> list[str]
    eval_select(select, env) -> list[str]

`env` is a flat mapping from reference strings to their resolved value:
    env["$step.scan_graph"]       -> {"nodes": [...], "edges": [...]}
    env["$steps.<id>.scan_graph"] -> {"nodes": [...], "edges": [...]}
    env["$step.vars.<name>"]      -> ["a", "b", ...]  (string_list)
    env["$steps.<id>.vars.<name>"] -> ["a", "b", ...]

Full `$ref` token resolution (loader-scoped) is E3 scope (`core/variables.py`);
this module only needs the resolved value behind a reference key.

Nested `for_each` (12C §6) is implemented: `reachable_from` may target either
the enclosing `for_each.as` bind or a bind produced by an ancestor `for_each`.
"""

from __future__ import annotations

import itertools
import re
from collections import defaultdict
from typing import Any, Iterable

Node = dict
Edge = dict
Graph = dict


class GseEvalError(Exception):
    """Raised for malformed GSE ASTs, unknown refs, or unresolved binds."""


# ---------------------------------------------------------------------------
# Node identity / graph index
# ---------------------------------------------------------------------------


def get_node_id(node: Node) -> str:
    """Node identity: `id` preferred, `nugget_instance_id` fallback (12C §1)."""
    node_id = node.get("id")
    if node_id is None:
        node_id = node.get("nugget_instance_id")
    if node_id is None:
        raise GseEvalError(f"Node missing 'id'/'nugget_instance_id': {node!r}")
    return str(node_id)


class GraphIndex:
    """Adjacency index over a scan graph, keyed by relation + direction."""

    def __init__(self, graph: Graph) -> None:
        self.nodes_by_id: dict[str, Node] = {}
        for node in graph.get("nodes", []) or []:
            self.nodes_by_id[get_node_id(node)] = node

        self._out: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
        self._in: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
        for edge in graph.get("edges", []) or []:
            relation = edge.get("relation")
            source = edge.get("source")
            target = edge.get("target")
            if relation is None or source is None or target is None:
                raise GseEvalError(f"Edge missing source/target/relation: {edge!r}")
            self._out[relation][str(source)].add(str(target))
            self._in[relation][str(target)].add(str(source))

    def neighbors(self, node_id: str, relation: str, direction: str = "out") -> set[str]:
        """Single-hop neighbors of `node_id` along `relation` in `direction`."""
        table = self._out if direction == "out" else self._in
        return set(table.get(relation, {}).get(node_id, set()))

    def reachable(self, node_id: str, relation: str, direction: str = "out") -> set[str]:
        """BFS over a single relation/direction; excludes the start node."""
        seen: set[str] = set()
        frontier = [node_id]
        while frontier:
            next_frontier: list[str] = []
            for current in frontier:
                for neighbor in self.neighbors(current, relation, direction):
                    if neighbor == node_id or neighbor in seen:
                        continue
                    seen.add(neighbor)
                    next_frontier.append(neighbor)
            frontier = next_frontier
        return seen

    def nodes_for_ids(self, node_ids: Iterable[str]) -> list[Node]:
        return [self.nodes_by_id[nid] for nid in node_ids if nid in self.nodes_by_id]


def _resolve_along(anchor_id: str, along: dict, index: GraphIndex) -> list[Node]:
    """Resolve `reachable_from`'s `along` clause to a candidate node list (12C §5)."""
    relation = along.get("relation")
    if relation is None:
        raise GseEvalError(f"'along' missing required 'relation': {along!r}")
    direction = along.get("direction", "out")
    transitive = bool(along.get("transitive", False))
    if transitive:
        ids = index.reachable(anchor_id, relation, direction)
    else:
        ids = index.neighbors(anchor_id, relation, direction)
    return index.nodes_for_ids(ids)


# ---------------------------------------------------------------------------
# Node matching (`nodes:` + `where:`)
# ---------------------------------------------------------------------------


def _project_raw(node: Node, field: str) -> Any:
    return node.get(field)


def project(node: Node, field: str = "nugget_data") -> str:
    """Project a matched node to its scalar value (default field `nugget_data`)."""
    value = _project_raw(node, field)
    if value is None:
        raise GseEvalError(
            f"Node {get_node_id(node)!r} has no value for project field '{field}'"
        )
    return str(value)


def check_related(node: Node, spec: dict, index: GraphIndex) -> bool:
    """Evaluate a `related:` predicate against `node` (12C §4.1)."""
    relation = spec.get("relation")
    if relation is None:
        raise GseEvalError(f"'related' predicate missing 'relation': {spec!r}")
    direction = spec.get("direction", "out")
    transitive = bool(spec.get("transitive", False))
    node_id = get_node_id(node)
    if transitive:
        neighbor_ids = index.reachable(node_id, relation, direction)
    else:
        neighbor_ids = index.neighbors(node_id, relation, direction)
    if not neighbor_ids:
        return False

    nugget_id = spec.get("nugget_id")
    nugget_id_in = spec.get("nugget_id_in")
    if nugget_id is None and nugget_id_in is None:
        return True

    for neighbor_id in neighbor_ids:
        neighbor = index.nodes_by_id.get(neighbor_id)
        if neighbor is None:
            continue
        neighbor_type = neighbor.get("nugget_id")
        if nugget_id is not None and neighbor_type == nugget_id:
            return True
        if nugget_id_in is not None and neighbor_type in nugget_id_in:
            return True
    return False


def check_attr(node: Node, spec: dict) -> bool:
    """Evaluate an `attr:` predicate against `node` (12C §4.1)."""
    field = spec.get("field")
    op = spec.get("op")
    value = spec.get("value")
    if field is None or op is None or value is None:
        raise GseEvalError(f"'attr' predicate requires field/op/value: {spec!r}")
    actual = _project_raw(node, field)
    if actual is None:
        return False
    actual_str = str(actual)
    if op == "equals":
        return actual_str == value
    if op == "regex":
        return re.search(value, actual_str) is not None
    raise GseEvalError(f"Unsupported attr op '{op}' (expected 'equals' or 'regex')")


def _eval_not_predicate(node: Node, body: dict, index: GraphIndex) -> bool:
    """`not: {related|attr}` — returns True if the predicate passes (negation holds)."""
    if "related" in body:
        return not check_related(node, body["related"], index)
    if "attr" in body:
        return not check_attr(node, body["attr"])
    raise GseEvalError(f"'not' predicate requires related/attr: {body!r}")


def _eval_where_predicate(node: Node, predicate: dict, index: GraphIndex) -> bool:
    """Evaluate a single `where` list entry; True if it passes."""
    if "related" in predicate:
        return check_related(node, predicate["related"], index)
    if "not" in predicate:
        return _eval_not_predicate(node, predicate["not"], index)
    if "attr" in predicate:
        return check_attr(node, predicate["attr"])
    raise GseEvalError(f"Unsupported where predicate: {predicate!r}")


def eval_where(node: Node, where: list[dict], index: GraphIndex) -> bool:
    """AND-list of `where` predicates (12C §4.1)."""
    return all(_eval_where_predicate(node, predicate, index) for predicate in where)


def _matches_node_shape(node: Node, node_match: dict) -> bool:
    """Check the flat `nugget_id*`/`nugget_data_*` predicates (excludes `where`)."""
    nugget_id = node_match.get("nugget_id")
    if nugget_id is not None and node.get("nugget_id") != nugget_id:
        return False
    nugget_id_in = node_match.get("nugget_id_in")
    if nugget_id_in is not None and node.get("nugget_id") not in nugget_id_in:
        return False
    data_equals = node_match.get("nugget_data_equals")
    if data_equals is not None and node.get("nugget_data") != data_equals:
        return False
    data_regex = node_match.get("nugget_data_regex")
    if data_regex is not None:
        data = node.get("nugget_data")
        if data is None or re.search(data_regex, str(data)) is None:
            return False
    return True


def match_nodes(nodes: Iterable[Node], node_match: dict | None, index: GraphIndex) -> list[Node]:
    """Filter `nodes` by a `NodeMatch` mapping (12C §4)."""
    if not node_match:
        return list(nodes)

    where = node_match.get("where")
    matched: list[Node] = []
    for candidate in nodes:
        if not _matches_node_shape(candidate, node_match):
            continue
        if where and not eval_where(candidate, where, index):
            continue
        matched.append(candidate)
    return matched


# ---------------------------------------------------------------------------
# distinct / finalize
# ---------------------------------------------------------------------------


def finalize(values: list[str], distinct: bool = True) -> list[str]:
    """Deterministic output: sorted unique unless `distinct: false` (12C §2.6)."""
    if distinct:
        return sorted(set(values))
    return list(values)


# ---------------------------------------------------------------------------
# emit
# ---------------------------------------------------------------------------


def emit_values(emit: dict, binds: dict[str, list[str]]) -> list[str]:
    """Apply an `emit:` clause to the current binds of a `for_each` root (12C §5)."""
    if "values" in emit:
        name = emit["values"]
        return list(binds.get(name, []))

    if "product" in emit:
        names = emit["product"]
        lists = [binds.get(name, []) for name in names]
        results: list[str] = []
        for combo in itertools.product(*lists):
            if "join" in emit:
                results.append(emit["join"].join(combo))
            elif "format" in emit:
                results.append(emit["format"].format(**dict(zip(names, combo))))
            else:
                raise GseEvalError("emit.product requires 'join' or 'format'")
        return results

    raise GseEvalError(f"Unsupported emit shape: {emit!r}")


# ---------------------------------------------------------------------------
# for_each / collect (cascade)
# ---------------------------------------------------------------------------


def _resolve_for_each_candidates(
    for_each: dict, index: GraphIndex, active_binds: dict[str, Node]
) -> list[Node]:
    """Candidate node pool for a `for_each`: whole graph, or scoped via `reachable_from`."""
    if "reachable_from" not in for_each:
        return list(index.nodes_by_id.values())

    anchor_name = for_each["reachable_from"]
    anchor = active_binds.get(anchor_name)
    if anchor is None:
        raise GseEvalError(
            f"for_each.reachable_from '{anchor_name}' is not bound "
            f"(available binds: {sorted(active_binds)})"
        )
    along = for_each.get("along")
    if along is None:
        raise GseEvalError(f"for_each with reachable_from requires 'along': {for_each!r}")
    return _resolve_along(get_node_id(anchor), along, index)


def _eval_collect_entry(collect: dict, binds: dict[str, Node], index: GraphIndex) -> list[str]:
    """Resolve one `collect:` entry to its projected scalar list (12C §5)."""
    collect_as = collect.get("as")
    reachable_from = collect.get("reachable_from")
    along = collect.get("along")
    if not collect_as or not reachable_from or along is None:
        raise GseEvalError(f"Malformed collect entry: {collect!r}")
    anchor_node = binds.get(reachable_from)
    if anchor_node is None:
        raise GseEvalError(
            f"collect.reachable_from '{reachable_from}' is not bound "
            f"(available binds: {sorted(binds)})"
        )
    candidates = _resolve_along(get_node_id(anchor_node), along, index)
    matched = match_nodes(candidates, collect.get("nodes"), index)
    field = collect.get("project", "nugget_data")
    return [project(n, field) for n in matched]


def _eval_for_each_root(
    for_each: dict, root: Node, index: GraphIndex, active_binds: dict[str, Node]
) -> list[str]:
    """Evaluate `collect`/`emit`/nested `for_each` for a single bound root node."""
    as_name = for_each["as"]
    new_binds = dict(active_binds)
    new_binds[as_name] = root

    collect_binds: dict[str, list[str]] = {as_name: [project(root)]}
    for collect in for_each.get("collect") or []:
        collect_binds[collect["as"]] = _eval_collect_entry(collect, new_binds, index)

    out: list[str] = []
    emit = for_each.get("emit")
    if emit:
        out.extend(emit_values(emit, collect_binds))

    nested = for_each.get("for_each")
    if nested:
        out.extend(eval_for_each(nested, index, new_binds))
    return out


def eval_for_each(
    for_each: dict,
    index: GraphIndex,
    active_binds: dict[str, Node] | None = None,
) -> list[str]:
    """Evaluate a `for_each` clause, recursing into nested `for_each` (12C §5-6)."""
    active_binds = dict(active_binds or {})
    if not for_each.get("as"):
        raise GseEvalError(f"for_each missing required 'as': {for_each!r}")

    candidates = _resolve_for_each_candidates(for_each, index, active_binds)
    roots = match_nodes(candidates, for_each.get("nodes"), index)

    out: list[str] = []
    for root in roots:
        out.extend(_eval_for_each_root(for_each, root, index, active_binds))
    return out


# ---------------------------------------------------------------------------
# select / union / literal / from_var
# ---------------------------------------------------------------------------


def resolve_graph(ref: str, env: dict) -> Graph:
    """Resolve a `source:` reference to a `{nodes, edges}` graph."""
    if ref not in env:
        raise GseEvalError(f"Unknown graph reference: {ref!r}")
    graph = env[ref]
    if not isinstance(graph, dict) or "nodes" not in graph or "edges" not in graph:
        raise GseEvalError(f"Reference {ref!r} does not resolve to a graph {{nodes, edges}}")
    return graph


def resolve_string_list(ref: str, env: dict) -> list[str]:
    """Resolve a variable/list reference (`union`, `from_var`) to a string list."""
    if ref not in env:
        raise GseEvalError(f"Unknown string_list reference: {ref!r}")
    values = env[ref]
    if not isinstance(values, list):
        raise GseEvalError(f"Reference {ref!r} does not resolve to a string_list")
    return list(values)


def eval_select(select: dict, env: dict) -> list[str]:
    """Evaluate a `select:` clause (flat node match or `for_each` cascade)."""
    source = select.get("source")
    if not source:
        raise GseEvalError(f"select missing required 'source': {select!r}")
    graph = resolve_graph(source, env)
    index = GraphIndex(graph)

    if "for_each" in select:
        values = eval_for_each(select["for_each"], index, {})
    elif "nodes" in select:
        matched = match_nodes(graph.get("nodes", []), select["nodes"], index)
        field = select.get("project", "nugget_data")
        values = [project(n, field) for n in matched]
    else:
        raise GseEvalError(f"select requires 'nodes' or 'for_each': {select!r}")

    return finalize(values, select.get("distinct", True))


def eval_binding(binding: dict, env: dict) -> list[str]:
    """Evaluate a top-level GSE variable binding (`select`/`union`/`literal`/`from_var`)."""
    if "select" in binding:
        values = eval_select(binding["select"], env)
    elif "union" in binding:
        values = []
        for ref in binding["union"]:
            values.extend(resolve_string_list(ref, env))
    elif "literal" in binding:
        values = list(binding["literal"])
    elif "from_var" in binding:
        values = resolve_string_list(binding["from_var"], env)
    else:
        raise GseEvalError(
            f"Binding requires exactly one of select/union/literal/from_var: {binding!r}"
        )
    return finalize(values, binding.get("distinct", True))
