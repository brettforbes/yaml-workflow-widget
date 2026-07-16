"""E3-S5: context graph merge uniqueness (R7-03-06, R7-05-04).

Normative reference: `.governance/specs/SPEC-007-AGENT-PLAN.md` Epic E3-S5,
`.seed/12B_Workflow_DSL_Description.md` §2.5.
"""

from __future__ import annotations

import pytest

from cli_workflow.core.context_export import (
    ContextExportError,
    maybe_merge_step,
    merge_into_context,
    new_context,
    should_export,
)
from cli_workflow.core.gse_eval import GseEvalError


def node(node_id: str, nugget_id: str = "DOMAIN_NAME", **extra) -> dict:
    return {"id": node_id, "nugget_id": nugget_id, **extra}


def edge(source: str, target: str, relation: str) -> dict:
    return {"source": source, "target": target, "relation": relation}


class TestNodeUniqueness:
    def test_merging_disjoint_graphs_appends_all_nodes(self):
        context = new_context()
        merge_into_context(context, {"nodes": [node("a"), node("b")], "edges": []})
        assert [n["id"] for n in context["nodes"]] == ["a", "b"]

    def test_duplicate_node_id_is_not_appended_twice(self):
        context = new_context()
        merge_into_context(context, {"nodes": [node("a")], "edges": []})
        merge_into_context(context, {"nodes": [node("a"), node("b")], "edges": []})
        assert [n["id"] for n in context["nodes"]] == ["a", "b"]

    def test_first_write_wins_on_duplicate_id(self):
        """A later node with the same id but different data does not replace the first."""
        context = new_context()
        merge_into_context(context, {"nodes": [node("a", nugget_data="first")], "edges": []})
        merge_into_context(context, {"nodes": [node("a", nugget_data="second")], "edges": []})
        assert context["nodes"][0]["nugget_data"] == "first"

    def test_nugget_instance_id_fallback_identity(self):
        context = new_context()
        n1 = {"nugget_instance_id": "x1", "nugget_id": "IP_ADDRESS"}
        n2 = {"nugget_instance_id": "x1", "nugget_id": "IP_ADDRESS"}
        merge_into_context(context, {"nodes": [n1], "edges": []})
        merge_into_context(context, {"nodes": [n2], "edges": []})
        assert len(context["nodes"]) == 1

    def test_node_missing_identity_raises(self):
        context = new_context()
        with pytest.raises(GseEvalError):
            merge_into_context(context, {"nodes": [{"nugget_id": "DOMAIN_NAME"}], "edges": []})


class TestEdgeUniqueness:
    def test_merging_disjoint_edges_appends_all(self):
        context = new_context()
        merge_into_context(
            context,
            {"nodes": [], "edges": [edge("a", "b", "had"), edge("b", "c", "contains")]},
        )
        assert len(context["edges"]) == 2

    def test_duplicate_triple_is_not_appended_twice(self):
        context = new_context()
        merge_into_context(context, {"nodes": [], "edges": [edge("a", "b", "had")]})
        merge_into_context(context, {"nodes": [], "edges": [edge("a", "b", "had")]})
        assert context["edges"] == [edge("a", "b", "had")]

    def test_same_endpoints_different_relation_are_distinct(self):
        """Uniqueness key is (source, target, relation), not just (source, target)."""
        context = new_context()
        merge_into_context(context, {"nodes": [], "edges": [edge("a", "b", "had")]})
        merge_into_context(context, {"nodes": [], "edges": [edge("a", "b", "contains")]})
        assert len(context["edges"]) == 2

    def test_malformed_edge_raises(self):
        context = new_context()
        with pytest.raises(ContextExportError):
            merge_into_context(context, {"nodes": [], "edges": [{"source": "a", "target": "b"}]})


class TestShouldExport:
    def test_none_spec_does_not_export(self):
        assert should_export(None) is False

    def test_missing_export_key_defaults_to_none(self):
        assert should_export({}) is False

    def test_export_none_string_does_not_export(self):
        assert should_export({"export": "none"}) is False

    def test_export_scan_graph_exports(self):
        assert should_export({"export": "scan_graph"}) is True

    def test_attribute_style_spec_supported(self):
        class ContextSpec:
            export = "scan_graph"

        assert should_export(ContextSpec()) is True


class TestMaybeMergeStepExportNoneSkips:
    def test_export_none_skips_merge_entirely(self):
        """12A shape: sfp_cli_httpx / sfp_cli_katana are interim (`export: none`)."""
        context = new_context()
        step_graph = {"nodes": [node("live-host")], "edges": [edge("a", "b", "contains")]}
        maybe_merge_step(context, step_graph, {"export": "none"})
        assert context["nodes"] == []
        assert context["edges"] == []

    def test_omitted_context_spec_skips_merge(self):
        context = new_context()
        step_graph = {"nodes": [node("x")], "edges": []}
        maybe_merge_step(context, step_graph, None)
        assert context["nodes"] == []

    def test_export_scan_graph_merges(self):
        context = new_context()
        step_graph = {"nodes": [node("x")], "edges": []}
        maybe_merge_step(context, step_graph, {"export": "scan_graph"})
        assert [n["id"] for n in context["nodes"]] == ["x"]


class TestMultiStepMergeSequence:
    def test_export_steps_only_accumulate_12a_shape(self):
        """Mirrors 12A: subfinder/nmap/nerva/nuclei export; httpx/katana are interim."""
        context = new_context()
        step_specs = {
            "sfp_cli_subfinder": "scan_graph",
            "sfp_cli_nmap": "scan_graph",
            "sfp_cli_nerva": "scan_graph",
            "sfp_cli_httpx": "none",
            "sfp_cli_katana": "none",
            "sfp_cli_nuclei": "scan_graph",
        }
        for step_id, export in step_specs.items():
            step_graph = {"nodes": [node(step_id)], "edges": []}
            maybe_merge_step(context, step_graph, {"export": export})

        merged_ids = {n["id"] for n in context["nodes"]}
        assert merged_ids == {"sfp_cli_subfinder", "sfp_cli_nmap", "sfp_cli_nerva", "sfp_cli_nuclei"}
        assert "sfp_cli_httpx" not in merged_ids
        assert "sfp_cli_katana" not in merged_ids
