"""E4-S1 / E4-S3: step pipeline + input normalize / empty policies."""

from __future__ import annotations

from pathlib import Path

import pytest

from cli_workflow.core.fixtures import load_fixture_graph
from cli_workflow.core.variables import WorkflowEnv
from cli_workflow.runtime.executor import (
    ExecutorError,
    apply_empty_policy,
    apply_normalize,
    normalize_hostname_from_url,
    run_step,
)
from cli_workflow.runtime.loader import load_workflow, parse_workflow_dict

ROOT = Path(__file__).resolve().parents[1]
EXAMPLE_12A = ROOT / ".seed" / "12A_Workflow_YAML_Example.yaml"


def test_normalize_hostname_from_url():
    assert normalize_hostname_from_url(
        ["https://example.com/path", "http://www.foo.org:8080/", "bare.com"]
    ) == ["example.com", "www.foo.org", "bare.com"]


def test_apply_normalize_unknown_raises():
    with pytest.raises(ExecutorError, match="Unsupported input.normalize"):
        apply_normalize(["a"], "not_a_policy")


def test_empty_policy_error_skip_continue():
    assert apply_empty_policy(["x"], "error", step_id="s") == (["x"], False)
    assert apply_empty_policy([], "skip_step", step_id="s") == ([], True)
    assert apply_empty_policy([], "continue", step_id="s") == ([], False)
    with pytest.raises(ExecutorError, match="empty"):
        apply_empty_policy([], "error", step_id="s")


def test_run_step_subfinder_shaped_pipeline():
    doc = load_workflow(EXAMPLE_12A)
    step = next(s for s in doc.steps if s.id == "sfp_cli_subfinder")
    env = WorkflowEnv(inputs={"targets": ["https://example.com"]})

    def provider(_step, _env, _values):
        return load_fixture_graph("subfinder_sample")

    result = run_step(step, env, provider)
    assert not result.skipped
    assert result.input_values == ["example.com"]  # hostname_from_url
    assert "example.com" in result.vars["apex_domains"]
    assert "www.example.com" in result.vars["subdomains"]
    assert set(result.vars["all_domains"]) >= {
        "example.com",
        "www.example.com",
        "api.example.com",
        "another.org",
        "shop.another.org",
    }
    # context export
    node_ids = {n["id"] for n in env.context["nodes"]}
    assert "example.com" in {n.get("nugget_data") for n in env.context["nodes"]} or node_ids
    assert any(n.get("nugget_id") == "DOMAIN_NAME" for n in env.context["nodes"])
    assert "$step.files.output" not in result.argv  # expanded
    assert result.files.get("output")
    assert result.files["output"] in result.argv[-2] or any(
        result.files["output"] in a for a in result.argv
    )


def test_run_step_skip_on_empty_input():
    doc = {
        "apiVersion": "spiderfeet.workflow/v1",
        "kind": "Workflow",
        "id": "workflow--00000000-0000-0000-0000-000000000099",
        "info": {"name": "t"},
        "inputs": {"targets": {"type": "string_list", "default": []}},
        "steps": [
            {
                "id": "sfp_cli_nerva",
                "uses": "tool.nerva",
                "needs": [],
                "input": {
                    "type": "string_list",
                    "from": "$workflow.inputs.targets",
                    "empty": "skip_step",
                },
                "config": {
                    "argv": ["--json"],
                    "files": {
                        "input": {"mode": "none"},
                        "output": {"mode": "none"},
                    },
                    "capture": {"family": "structured_native", "adapter": "nerva"},
                },
                "context": {"export": "none"},
            }
        ],
    }
    workflow = parse_workflow_dict(doc)
    step = workflow.steps[0]
    env = WorkflowEnv(inputs={"targets": []})

    def provider(_s, _e, _v):
        raise AssertionError("graph provider must not run when skipped")

    result = run_step(step, env, provider)
    assert result.skipped
    assert result.skip_reason == "empty_input"
    assert env.context["nodes"] == []
