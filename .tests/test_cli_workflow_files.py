"""E3-S4: auto temp file materialization (R7-03-04).

Normative reference: `.seed/SPEC-007-AGENT-PLAN.md` Epic E3-S4.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from cli_workflow.runtime.files import (
    FilesError,
    StepFiles,
    materialize_input_file,
    materialize_step_files,
    read_line_text_file,
    reserve_output_path,
    step_files,
    write_line_text_file,
)


class TestLineTextRoundTrip:
    def test_write_then_read_round_trips_values(self):
        values = ["10.0.0.1:80", "10.0.0.1:443", "10.0.0.2:80"]
        path = write_line_text_file(values)
        try:
            assert path.is_file()
            assert read_line_text_file(path) == values
        finally:
            path.unlink(missing_ok=True)

    def test_file_is_utf8_one_value_per_line(self):
        values = ["example.com", "\u00fcnicode.example"]
        path = write_line_text_file(values)
        try:
            text = path.read_text(encoding="utf-8")
            assert text == "example.com\n\u00fcnicode.example\n"
        finally:
            path.unlink(missing_ok=True)

    def test_empty_values_round_trips_to_empty_list(self):
        path = write_line_text_file([])
        try:
            assert read_line_text_file(path) == []
        finally:
            path.unlink(missing_ok=True)


class TestMaterializeInputFile:
    def test_mode_none_returns_none(self):
        assert materialize_input_file({"mode": "none"}, ["a"]) is None

    def test_mode_auto_line_text_writes_values(self):
        path = materialize_input_file({"mode": "auto", "format": "line_text"}, ["a", "b"])
        try:
            assert path is not None
            assert read_line_text_file(path) == ["a", "b"]
        finally:
            path.unlink(missing_ok=True)

    def test_mode_auto_non_line_text_format_raises(self):
        with pytest.raises(FilesError):
            materialize_input_file({"mode": "auto", "format": "jsonl"}, ["a"])

    def test_mode_path_returns_explicit_path(self, tmp_path: Path):
        target = tmp_path / "explicit_input.txt"
        target.write_text("preexisting\n", encoding="utf-8")
        path = materialize_input_file({"mode": "path", "path": str(target)}, ["a"])
        assert path == target
        # mode: path must not overwrite an operator-supplied file's contents.
        assert target.read_text(encoding="utf-8") == "preexisting\n"

    def test_mode_path_without_path_raises(self):
        with pytest.raises(FilesError):
            materialize_input_file({"mode": "path"}, ["a"])

    def test_unsupported_mode_raises(self):
        with pytest.raises(FilesError):
            materialize_input_file({"mode": "bogus"}, ["a"])


class TestReserveOutputPath:
    def test_mode_none_returns_none(self):
        assert reserve_output_path({"mode": "none"}) is None

    def test_mode_auto_reserves_empty_file_with_format_suffix(self):
        path = reserve_output_path({"mode": "auto", "format": "xml"})
        try:
            assert path is not None
            assert path.is_file()
            assert path.stat().st_size == 0
            assert path.suffix == ".xml"
        finally:
            path.unlink(missing_ok=True)

    def test_mode_path_returns_explicit_path(self, tmp_path: Path):
        target = tmp_path / "explicit_output.jsonl"
        path = reserve_output_path({"mode": "path", "path": str(target)})
        assert path == target

    def test_unsupported_mode_raises(self):
        with pytest.raises(FilesError):
            reserve_output_path({"mode": "bogus"})


class TestMaterializeStepFilesAndCleanup:
    def test_nmap_shaped_config_round_trip(self):
        """Mirrors 12A sfp_cli_nmap: auto line_text input, auto xml output."""
        files_config = {
            "input": {"mode": "auto", "format": "line_text"},
            "output": {"mode": "auto", "format": "xml"},
        }
        values = ["example.com", "www.example.com"]
        resolved = materialize_step_files(files_config, values)
        try:
            assert isinstance(resolved, StepFiles)
            assert read_line_text_file(resolved.input) == values
            assert resolved.output is not None and resolved.output.is_file()
            refs = resolved.as_refs()
            assert refs["input"] == str(resolved.input)
            assert refs["output"] == str(resolved.output)
        finally:
            resolved.cleanup()
        assert not resolved.input.exists()
        assert not resolved.output.exists()

    def test_subfinder_shaped_config_input_none(self):
        """Mirrors 12A sfp_cli_subfinder: files.input.mode: none, output auto jsonl."""
        files_config = {
            "input": {"mode": "none"},
            "output": {"mode": "auto", "format": "jsonl"},
        }
        resolved = materialize_step_files(files_config, [])
        try:
            assert resolved.input is None
            assert resolved.output is not None
            assert "input" not in resolved.as_refs()
            assert "output" in resolved.as_refs()
        finally:
            resolved.cleanup()

    def test_cleanup_does_not_delete_operator_path_files(self, tmp_path: Path):
        explicit_in = tmp_path / "in.txt"
        explicit_out = tmp_path / "out.jsonl"
        explicit_in.write_text("keep-me\n", encoding="utf-8")
        files_config = {
            "input": {"mode": "path", "path": str(explicit_in)},
            "output": {"mode": "path", "path": str(explicit_out)},
        }
        resolved = materialize_step_files(files_config, ["a"])
        resolved.cleanup()
        assert explicit_in.exists()
        assert explicit_in.read_text(encoding="utf-8") == "keep-me\n"

    def test_cleanup_is_idempotent(self):
        files_config = {
            "input": {"mode": "auto", "format": "line_text"},
            "output": {"mode": "auto", "format": "json"},
        }
        resolved = materialize_step_files(files_config, ["a"])
        resolved.cleanup()
        resolved.cleanup()  # must not raise on missing files


class TestStepFilesContextManager:
    def test_cleans_up_owned_temp_files_on_normal_exit(self):
        files_config = {
            "input": {"mode": "auto", "format": "line_text"},
            "output": {"mode": "auto", "format": "jsonl"},
        }
        with step_files(files_config, ["a", "b"]) as resolved:
            input_path, output_path = resolved.input, resolved.output
            assert input_path.is_file()
            assert output_path.is_file()
        assert not input_path.exists()
        assert not output_path.exists()

    def test_cleans_up_owned_temp_files_on_exception(self):
        files_config = {
            "input": {"mode": "auto", "format": "line_text"},
            "output": {"mode": "none"},
        }
        captured_path = None
        with pytest.raises(RuntimeError):
            with step_files(files_config, ["a"]) as resolved:
                captured_path = resolved.input
                raise RuntimeError("boom")
        assert captured_path is not None
        assert not captured_path.exists()
