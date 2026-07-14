"""E3-S3: variable / reference environment resolver (R7-03-03).

Normative reference: `cli_workflow/REFERENCES.md`. Covers every reference
form used in `.seed/12A_Workflow_YAML_Example.yaml` against a mocked
`WorkflowEnv`, plus the hard-error cases REFERENCES.md requires.
"""

from __future__ import annotations

import pytest

from cli_workflow.core.variables import (
    StepRuntime,
    VariableError,
    WorkflowEnv,
    build_gse_env,
    expand_argv,
    resolve_ref,
    resolve_string_list,
)


def make_env() -> WorkflowEnv:
    subfinder = StepRuntime(
        step_id="subfinder_enum",
        input_values=["example.com"],
        files={"output": "/tmp/subfinder_out.jsonl"},
        vars={
            "apex_domains": ["example.com"],
            "subdomains": ["www.example.com"],
            "all_domains": ["example.com", "www.example.com"],
        },
        scan_graph={"nodes": [{"id": "d1", "nugget_id": "DOMAIN_NAME", "nugget_data": "example.com"}], "edges": []},
    )
    env = WorkflowEnv(
        inputs={"targets": ["https://example.com"]},
        context={"nodes": [], "edges": []},
        steps={"subfinder_enum": subfinder},
    )
    return env


class TestWorkflowInputs:
    def test_resolves_known_input(self):
        env = make_env()
        assert resolve_ref("$workflow.inputs.targets", env) == ["https://example.com"]

    def test_unknown_input_raises(self):
        env = make_env()
        with pytest.raises(VariableError):
            resolve_ref("$workflow.inputs.does_not_exist", env)


class TestWorkflowContext:
    def test_resolves_context_graph(self):
        env = make_env()
        env.context["nodes"].append({"id": "n1"})
        assert resolve_ref("$workflow.context", env) == {"nodes": [{"id": "n1"}], "edges": []}


class TestCurrentStepRefs:
    def test_step_scan_graph_requires_current_step(self):
        env = make_env()
        with pytest.raises(VariableError):
            resolve_ref("$step.scan_graph", env)

    def test_step_scan_graph_resolves_when_current(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        result = resolve_ref("$step.scan_graph", env)
        assert result["nodes"][0]["nugget_data"] == "example.com"

    def test_step_vars_resolves(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        assert resolve_ref("$step.vars.apex_domains", env) == ["example.com"]

    def test_step_vars_unknown_name_raises(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        with pytest.raises(VariableError):
            resolve_ref("$step.vars.does_not_exist", env)

    def test_step_files_output_resolves(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        assert resolve_ref("$step.files.output", env) == "/tmp/subfinder_out.jsonl"

    def test_step_files_input_missing_raises(self):
        """subfinder_enum's fixture only bound `files.output` (mode: none for input)."""
        env = make_env()
        env.current_step_id = "subfinder_enum"
        with pytest.raises(VariableError):
            resolve_ref("$step.files.input", env)

    def test_step_input_values_full_list(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        assert resolve_ref("$step.input.values", env) == ["example.com"]

    def test_step_input_values_indexed(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        assert resolve_ref("$step.input.values[0]", env) == "example.com"

    def test_step_input_values_index_out_of_range_raises(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        with pytest.raises(VariableError):
            resolve_ref("$step.input.values[5]", env)

    def test_step_ref_out_of_scope_without_current_step(self):
        """REFERENCES.md rule 1: $step.* only valid inside the executing step."""
        env = make_env()
        assert env.current_step_id is None
        with pytest.raises(VariableError):
            resolve_ref("$step.vars.apex_domains", env)


class TestStepsRefs:
    def test_steps_vars_resolves_completed_step(self):
        env = make_env()
        assert resolve_ref("$steps.subfinder_enum.vars.all_domains", env) == [
            "example.com",
            "www.example.com",
        ]

    def test_steps_vars_unknown_step_id_raises(self):
        env = make_env()
        with pytest.raises(VariableError):
            resolve_ref("$steps.nmap_ports.vars.ip_port_list", env)

    def test_steps_vars_unknown_var_name_raises(self):
        env = make_env()
        with pytest.raises(VariableError):
            resolve_ref("$steps.subfinder_enum.vars.does_not_exist", env)

    def test_steps_scan_graph_resolves(self):
        env = make_env()
        graph = resolve_ref("$steps.subfinder_enum.scan_graph", env)
        assert graph["nodes"][0]["id"] == "d1"

    def test_steps_scan_graph_unknown_step_raises(self):
        env = make_env()
        with pytest.raises(VariableError):
            resolve_ref("$steps.ghost.scan_graph", env)


class TestUnrecognizedTokens:
    def test_unrecognized_pattern_raises(self):
        env = make_env()
        with pytest.raises(VariableError):
            resolve_ref("$bogus.thing", env)

    def test_malformed_token_raises(self):
        env = make_env()
        with pytest.raises(VariableError):
            resolve_ref("$workflow.unknown_section.x", env)


class TestResolveStringList:
    def test_accepts_string_list_ref(self):
        env = make_env()
        assert resolve_string_list("$workflow.inputs.targets", env) == ["https://example.com"]

    def test_rejects_graph_ref_context(self):
        """REFERENCES.md rule 4: graph refs must not satisfy a string_list requirement."""
        env = make_env()
        with pytest.raises(VariableError):
            resolve_string_list("$workflow.context", env)

    def test_rejects_graph_ref_scan_graph(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        with pytest.raises(VariableError):
            resolve_string_list("$step.scan_graph", env)


class TestBuildGseEnv:
    def test_includes_completed_step_scan_graph_and_vars(self):
        env = make_env()
        flat = build_gse_env(env)
        assert flat["$steps.subfinder_enum.scan_graph"]["nodes"][0]["id"] == "d1"
        assert flat["$steps.subfinder_enum.vars.apex_domains"] == ["example.com"]
        assert flat["$workflow.context"] == {"nodes": [], "edges": []}

    def test_includes_current_step_shorthand_keys(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        flat = build_gse_env(env)
        assert flat["$step.scan_graph"]["nodes"][0]["id"] == "d1"
        assert flat["$step.vars.subdomains"] == ["www.example.com"]

    def test_no_current_step_omits_shorthand_keys(self):
        env = make_env()
        flat = build_gse_env(env)
        assert "$step.scan_graph" not in flat
        assert "$step.vars.apex_domains" not in flat


class TestExpandArgv:
    def test_literal_strings_pass_through(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        assert expand_argv(["-silent", "-oJ"], env) == ["-silent", "-oJ"]

    def test_expands_whole_token_file_ref(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        assert expand_argv(["$step.files.output"], env) == ["/tmp/subfinder_out.jsonl"]

    def test_expands_indexed_value_ref(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        assert expand_argv(["-d", "$step.input.values[0]"], env) == ["-d", "example.com"]

    def test_expands_embedded_ref_within_larger_string(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        result = expand_argv(["prefix-$step.files.output-suffix"], env)
        assert result == ["prefix-/tmp/subfinder_out.jsonl-suffix"]

    def test_multiple_argv_items_all_expanded(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        argv = ["-d", "$step.input.values[0]", "-o", "$step.files.output", "-silent"]
        assert expand_argv(argv, env) == [
            "-d",
            "example.com",
            "-o",
            "/tmp/subfinder_out.jsonl",
            "-silent",
        ]

    def test_non_scalar_ref_in_argv_raises(self):
        """$step.input.values (no index) resolves to a list -> cannot embed in argv."""
        env = make_env()
        env.current_step_id = "subfinder_enum"
        with pytest.raises(VariableError):
            expand_argv(["$step.input.values"], env)

    def test_unknown_ref_in_argv_raises(self):
        env = make_env()
        env.current_step_id = "subfinder_enum"
        with pytest.raises(VariableError):
            expand_argv(["$step.vars.does_not_exist"], env)
