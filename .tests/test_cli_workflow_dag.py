"""E3-S2: workflow step DAG build / cycle detection (R7-03-02, R7-05-03).

Normative reference: `.governance/specs/SPEC-007-AGENT-PLAN.md` Epic E3-S2.
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
            "sfp_cli_subfinder",
            "sfp_cli_nmap",
            "sfp_cli_nerva",
            "sfp_cli_httpx",
            "sfp_cli_katana",
            "sfp_cli_nuclei",
        }

    def test_single_root(self, dag: Dag):
        """Only sfp_cli_subfinder has no `needs` (12A DAG)."""
        assert dag.roots == ("sfp_cli_subfinder",)

    def test_first_layer_is_the_root(self, dag: Dag):
        assert dag.layers[0] == ("sfp_cli_subfinder",)

    def test_fan_out_after_sfp_cli_subfinder(self, dag: Dag):
        """sfp_cli_nmap and sfp_cli_httpx both only need sfp_cli_subfinder -> same
        (parallel-ready) layer, one after the root."""
        assert dag.layer_of("sfp_cli_nmap") == dag.layer_of("sfp_cli_httpx") == 1
        assert set(dag.layers[1]) == {"sfp_cli_nmap", "sfp_cli_httpx"}

    def test_second_fan_out_layer(self, dag: Dag):
        """sfp_cli_nerva needs sfp_cli_nmap; sfp_cli_katana needs sfp_cli_httpx ->
        both ready together in the next layer."""
        assert dag.layer_of("sfp_cli_nerva") == dag.layer_of("sfp_cli_katana") == 2
        assert set(dag.layers[2]) == {"sfp_cli_nerva", "sfp_cli_katana"}

    def test_sfp_cli_nuclei_is_last(self, dag: Dag):
        assert dag.layer_of("sfp_cli_nuclei") == 3
        assert dag.layers[3] == ("sfp_cli_nuclei",)

    def test_ready_order_respects_dependencies(self, dag: Dag):
        order = dag.ready_order()
        assert len(order) == 6
        assert order.index("sfp_cli_subfinder") < order.index("sfp_cli_nmap")
        assert order.index("sfp_cli_subfinder") < order.index("sfp_cli_httpx")
        assert order.index("sfp_cli_nmap") < order.index("sfp_cli_nerva")
        assert order.index("sfp_cli_httpx") < order.index("sfp_cli_katana")
        assert order.index("sfp_cli_katana") < order.index("sfp_cli_nuclei")

    def test_needs_map_matches_source(self, dag: Dag):
        assert dag.needs["sfp_cli_nmap"] == ("sfp_cli_subfinder",)
        assert dag.needs["sfp_cli_subfinder"] == ()


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
