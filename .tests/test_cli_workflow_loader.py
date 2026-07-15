"""E3-S1: YAML load + schema validate + model objects (R7-03-02).

Normative reference: `.seed/SPEC-007-AGENT-PLAN.md` Epic E3-S1.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from cli_workflow.runtime.loader import (
    Step,
    WorkflowDocument,
    WorkflowLoadError,
    load_workflow,
    parse_workflow_dict,
)

ROOT = Path(__file__).resolve().parents[1]
EXAMPLE_12A = ROOT / ".seed" / "12A_Workflow_YAML_Example.yaml"


def _minimal_doc(**overrides) -> dict:
    doc = {
        "apiVersion": "spiderfeet.workflow/v1",
        "kind": "Workflow",
        "id": "workflow--1c51e712-b5b5-4ef2-9967-e11debbcc607",
        "info": {"name": "t"},
        "inputs": {"targets": {"type": "string_list", "default": ["example.com"]}},
        "steps": [
            {
                "id": "sfp_cli_subfinder",
                "uses": "tool.subfinder",
                "needs": [],
                "input": {
                    "type": "string_list",
                    "from": "$workflow.inputs.targets",
                    "empty": "error",
                },
                "config": {
                    "argv": ["-silent"],
                    "files": {
                        "input": {"mode": "none"},
                        "output": {"mode": "auto", "format": "jsonl"},
                    },
                    "capture": {"family": "structured_native", "adapter": "subfinder"},
                },
            }
        ],
    }
    doc.update(overrides)
    return doc


class Test12ALoads:
    @pytest.fixture(scope="class")
    def doc(self) -> WorkflowDocument:
        return load_workflow(EXAMPLE_12A)

    def test_header_fields(self, doc: WorkflowDocument):
        assert doc.api_version == "spiderfeet.workflow/v1"
        assert doc.kind == "Workflow"
        assert doc.id == "workflow--1c51e712-b5b5-4ef2-9967-e11debbcc607"

    def test_inputs_parsed(self, doc: WorkflowDocument):
        assert "targets" in doc.inputs
        assert doc.inputs["targets"].type == "string_list"
        assert doc.inputs["targets"].default == ["https://example.com"]

    def test_all_step_ids_and_order(self, doc: WorkflowDocument):
        assert [step.id for step in doc.steps] == [
            "sfp_cli_subfinder",
            "sfp_cli_nmap",
            "sfp_cli_nerva",
            "sfp_cli_httpx",
            "sfp_cli_katana",
            "sfp_cli_nuclei",
        ]

    def test_step_by_id_lookup(self, doc: WorkflowDocument):
        step = doc.step_by_id("sfp_cli_nmap")
        assert isinstance(step, Step)
        assert step.needs == ["sfp_cli_subfinder"]

    def test_step_by_id_unknown_raises(self, doc: WorkflowDocument):
        with pytest.raises(KeyError):
            doc.step_by_id("does_not_exist")

    def test_step_uses_and_input_ref(self, doc: WorkflowDocument):
        step = doc.step_by_id("sfp_cli_subfinder")
        assert step.uses == "tool.subfinder"
        assert step.input.from_ref == "$workflow.inputs.targets"
        assert step.input.normalize == "hostname_from_url"
        assert step.input.empty == "error"

    def test_step_config_argv_and_files(self, doc: WorkflowDocument):
        step = doc.step_by_id("sfp_cli_nmap")
        assert "$step.files.input" in step.config.argv
        assert step.config.files["input"].mode == "auto"
        assert step.config.files["input"].format == "line_text"
        assert step.config.files["output"].format == "xml"
        assert step.config.capture == {"family": "structured_native", "adapter": "nmap"}

    def test_output_vars_present_for_subfinder(self, doc: WorkflowDocument):
        step = doc.step_by_id("sfp_cli_subfinder")
        assert set(step.output_vars) == {"apex_domains", "subdomains", "all_domains"}

    def test_step_without_output_vars_defaults_empty(self, doc: WorkflowDocument):
        step = doc.step_by_id("sfp_cli_nerva")
        assert step.output_vars == {}

    def test_context_export_flags_match_12b(self, doc: WorkflowDocument):
        exports = {step.id: step.context.export for step in doc.steps}
        assert exports == {
            "sfp_cli_subfinder": "scan_graph",
            "sfp_cli_nmap": "scan_graph",
            "sfp_cli_nerva": "scan_graph",
            "sfp_cli_httpx": "none",
            "sfp_cli_katana": "none",
            "sfp_cli_nuclei": "scan_graph",
        }


class TestLoadErrors:
    def test_missing_file_raises(self, tmp_path: Path):
        with pytest.raises(WorkflowLoadError):
            load_workflow(tmp_path / "does_not_exist.yaml")

    def test_invalid_yaml_raises(self, tmp_path: Path):
        bad = tmp_path / "bad.yaml"
        bad.write_text("apiVersion: [unterminated", encoding="utf-8")
        with pytest.raises(WorkflowLoadError):
            load_workflow(bad)

    def test_non_mapping_document_raises(self, tmp_path: Path):
        bad = tmp_path / "list.yaml"
        bad.write_text("- just\n- a\n- list\n", encoding="utf-8")
        with pytest.raises(WorkflowLoadError):
            load_workflow(bad)

    def test_unknown_api_version_raises(self, tmp_path: Path):
        doc = _minimal_doc(apiVersion="spiderfeet.workflow/v0")
        path = tmp_path / "workflow.yaml"
        path.write_text(yaml.safe_dump(doc), encoding="utf-8")
        with pytest.raises(WorkflowLoadError):
            load_workflow(path)

    def test_unknown_kind_raises(self, tmp_path: Path):
        doc = _minimal_doc(kind="NotAWorkflow")
        path = tmp_path / "workflow.yaml"
        path.write_text(yaml.safe_dump(doc), encoding="utf-8")
        with pytest.raises(WorkflowLoadError):
            load_workflow(path)

    def test_unknown_adapter_in_uses_raises(self):
        doc = _minimal_doc()
        doc["steps"][0]["uses"] = "tool.not_a_real_tool"
        with pytest.raises(WorkflowLoadError):
            parse_workflow_dict(doc)

    def test_error_message_lists_schema_violation_path(self):
        doc = _minimal_doc()
        doc["steps"][0]["uses"] = "tool.not_a_real_tool"
        with pytest.raises(WorkflowLoadError, match="steps/0/uses"):
            parse_workflow_dict(doc)

    def test_non_dict_document_raises(self):
        with pytest.raises(WorkflowLoadError):
            parse_workflow_dict(["not", "a", "mapping"])
