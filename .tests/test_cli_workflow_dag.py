"""E3-S2: workflow step DAG build / cycle detection (R7-03-02, R7-05-03).

Normative reference: `.seed/SPEC-007-AGENT-PLAN.md` Epic E3-S2.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from cli_workflow.core.dag import (
    Dag,
    DagCycleError,
    DagError,
    UnknownStepReferenceError,
    build_dag,
)
from cli_workflow.runtime.loader import load_workflow

ROOT = Path(__file__).resolve().parents[1]
EXAMPLE_12A = ROOT / ".seed" / "12A_Workflow_YAML_Example.yaml"


def _step(id_: str, needs: list[str] | None = None) -> dict:
    return {"id": id_, "needs": needs or []}


class Test12AFanOut:
    @pytest.fixture(scope="class")
    def dag(self) -> Dag:
        doc = load_workflow(EXAMPLE_12A)
        return build_dag(doc.steps)

    def test_all_step_ids_present(self, dag: Dag):
        assert set(dag.step_ids) == {
            "subfinder_enum",
            "nmap_ports",
            "nerva_services",
            "httpx_live",
            "katana_crawl",
            "nuclei_vulns",
        }

    def test_single_root(self, dag: Dag):
        """Only subfinder_enum has no `needs` (12A DAG)."""
        assert dag.roots == ("subfinder_enum",)

    def test_first_layer_is_the_root(self, dag: Dag):
        assert dag.layers[0] == ("subfinder_enum",)

    def test_fan_out_after_subfinder_enum(self, dag: Dag):
        """nmap_ports and httpx_live both only need subfinder_enum -> same
        (parallel-ready) layer, one after the root."""
        assert dag.layer_of("nmap_ports") == dag.layer_of("httpx_live") == 1
        assert set(dag.layers[1]) == {"nmap_ports", "httpx_live"}

    def test_second_fan_out_layer(self, dag: Dag):
        """nerva_services needs nmap_ports; katana_crawl needs httpx_live ->
        both ready together in the next layer."""
        assert dag.layer_of("nerva_services") == dag.layer_of("katana_crawl") == 2
        assert set(dag.layers[2]) == {"nerva_services", "katana_crawl"}

    def test_nuclei_vulns_is_last(self, dag: Dag):
        assert dag.layer_of("nuclei_vulns") == 3
        assert dag.layers[3] == ("nuclei_vulns",)

    def test_ready_order_respects_dependencies(self, dag: Dag):
        order = dag.ready_order()
        assert len(order) == 6
        assert order.index("subfinder_enum") < order.index("nmap_ports")
        assert order.index("subfinder_enum") < order.index("httpx_live")
        assert order.index("nmap_ports") < order.index("nerva_services")
        assert order.index("httpx_live") < order.index("katana_crawl")
        assert order.index("katana_crawl") < order.index("nuclei_vulns")

    def test_needs_map_matches_source(self, dag: Dag):
        assert dag.needs["nmap_ports"] == ("subfinder_enum",)
        assert dag.needs["subfinder_enum"] == ()


class TestCycleRejection:
    def test_direct_cycle_is_rejected(self):
        steps = [_step("a", ["b"]), _step("b", ["a"])]
        with pytest.raises(DagCycleError):
            build_dag(steps)

    def test_self_referencing_cycle_is_rejected(self):
        steps = [_step("a", ["a"])]
        with pytest.raises(DagCycleError):
            build_dag(steps)

    def test_longer_cycle_is_rejected(self):
        steps = [_step("a", ["c"]), _step("b", ["a"]), _step("c", ["b"])]
        with pytest.raises(DagCycleError):
            build_dag(steps)

    def test_acyclic_graph_with_shared_dependency_is_accepted(self):
        steps = [_step("root"), _step("a", ["root"]), _step("b", ["root"]), _step("c", ["a", "b"])]
        dag = build_dag(steps)
        assert dag.roots == ("root",)
        assert dag.layer_of("c") == 2


class TestUnknownAndDuplicateSteps:
    def test_unknown_needs_id_is_rejected(self):
        steps = [_step("a", ["ghost"])]
        with pytest.raises(UnknownStepReferenceError):
            build_dag(steps)

    def test_duplicate_step_id_is_rejected(self):
        steps = [_step("a"), _step("a")]
        with pytest.raises(DagError):
            build_dag(steps)

    def test_empty_steps_yields_empty_dag(self):
        dag = build_dag([])
        assert dag.step_ids == ()
        assert dag.layers == ()
        assert dag.roots == ()
