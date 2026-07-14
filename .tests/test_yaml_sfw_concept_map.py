"""SPEC-009 / #69: concept map documents YAML↔.sfw bridge without a mapper."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / ".seed" / "YAML_SFW_CONCEPT_MAP.md"
SPEC = ROOT / ".seed" / "SPEC-009-post-foundation.md"
GRAMMAR = ROOT / "packages" / "workflow-lang" / "src" / "language" / "workflow.langium"


def test_yaml_sfw_concept_map_present_and_mentions_core_rows():
    text = MAP.read_text(encoding="utf-8")
    for needle in (
        "apiVersion",
        "steps[].uses",
        "GSE `select.for_each`",
        "StepContext.export",
        "No automatic mapper",
    ):
        assert needle in text, f"missing {needle!r} in concept map"


def test_spec009_records_defer_decision():
    text = SPEC.read_text(encoding="utf-8")
    assert "Defer a mechanical YAML" in text
    assert "Canonical interchange" in text


def test_grammar_still_has_mapped_rules():
    grammar = GRAMMAR.read_text(encoding="utf-8")
    for rule in ("entry Workflow", "Step:", "GseBinding:", "ForEach:", "StepContext:"):
        assert rule in grammar
