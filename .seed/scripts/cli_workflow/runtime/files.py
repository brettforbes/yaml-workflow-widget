"""Auto temp file materialization for step input/output (R7-03-04, E3-S4).

Lifecycle
---------
- `files.input.mode: auto` writes a UTF-8 `line_text` temp file (one value
  per line, no shell quoting) from the step's bound `string_list`; the
  returned path is exposed to `config.argv` as `$step.files.input`.
- `files.output.mode: auto` *reserves* an empty temp path (the tool driver
  is responsible for writing to it) and is exposed as `$step.files.output`.
- `mode: none` skips materialization entirely and returns `None` — callers
  must not populate `$step.files.<which>` in that case.
- `mode: path` uses an explicit, caller/operator-supplied path as-is; it is
  never created or deleted by this module.

Only paths actually created here (`mode: auto`) are "owned"; `StepFiles`
tracks ownership so `cleanup()` / the `step_files` context manager never
deletes an operator-supplied `mode: path` file. Callers own the returned
`StepFiles` for the lifetime of the step and should call `cleanup()` (or
use `step_files(...)` as a context manager) once the tool driver has
finished reading/writing, so temp files do not outlive the step.
"""

from __future__ import annotations

import os
import tempfile
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Iterator, Mapping

_SUFFIX_BY_FORMAT = {
    "line_text": ".txt",
    "jsonl": ".jsonl",
    "xml": ".xml",
    "json": ".json",
}


class FilesError(Exception):
    """Raised for unsupported file modes/formats or missing required paths."""


def _get(spec: Any, key: str) -> Any:
    if isinstance(spec, Mapping):
        return spec.get(key)
    return getattr(spec, key, None)


def write_line_text_file(values: Iterable[str], *, suffix: str = ".txt") -> Path:
    """Write `values` UTF-8, one per line, to a new temp file; return its path."""
    fd, name = tempfile.mkstemp(prefix="cli_workflow_in_", suffix=suffix)
    path = Path(name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            for value in values:
                handle.write(f"{value}\n")
    except Exception:
        path.unlink(missing_ok=True)
        raise
    return path


def read_line_text_file(path: str | Path) -> list[str]:
    """Read a `line_text` file back into its list of values (round-trip helper)."""
    text = Path(path).read_text(encoding="utf-8")
    return text.splitlines()


def _materialize_input(spec: Any, values: Iterable[str]) -> tuple[Path | None, bool]:
    mode = _get(spec, "mode")
    if mode == "none":
        return None, False
    if mode == "path":
        path = _get(spec, "path")
        if not path:
            raise FilesError("files.input.mode 'path' requires an explicit 'path'")
        return Path(path), False
    if mode == "auto":
        fmt = _get(spec, "format")
        if fmt != "line_text":
            raise FilesError(
                f"Auto input materialization only supports format 'line_text' (got {fmt!r})"
            )
        return write_line_text_file(values), True
    raise FilesError(f"Unsupported files.input.mode: {mode!r}")


def _reserve_output(spec: Any) -> tuple[Path | None, bool]:
    mode = _get(spec, "mode")
    if mode == "none":
        return None, False
    if mode == "path":
        path = _get(spec, "path")
        if not path:
            raise FilesError("files.output.mode 'path' requires an explicit 'path'")
        return Path(path), False
    if mode == "auto":
        fmt = _get(spec, "format")
        suffix = _SUFFIX_BY_FORMAT.get(fmt, ".out")
        fd, name = tempfile.mkstemp(prefix="cli_workflow_out_", suffix=suffix)
        os.close(fd)
        return Path(name), True
    raise FilesError(f"Unsupported files.output.mode: {mode!r}")


def materialize_input_file(file_spec: Any, values: Iterable[str]) -> Path | None:
    """Materialize (or resolve) a step's input file per its `FileSpec`/mapping."""
    path, _owns = _materialize_input(file_spec, values)
    return path


def reserve_output_path(file_spec: Any) -> Path | None:
    """Reserve (or resolve) a step's output file path per its `FileSpec`/mapping."""
    path, _owns = _reserve_output(file_spec)
    return path


@dataclass
class StepFiles:
    """Resolved `$step.files.input` / `$step.files.output` paths for one step."""

    input: Path | None
    output: Path | None
    owns_input: bool = False
    owns_output: bool = False

    def as_refs(self) -> dict[str, str]:
        """`{"input": str, "output": str}` shape for `$step.files.*` binding (omits `None`)."""
        refs: dict[str, str] = {}
        if self.input is not None:
            refs["input"] = str(self.input)
        if self.output is not None:
            refs["output"] = str(self.output)
        return refs

    def cleanup(self) -> None:
        """Best-effort removal of temp files this step owns; safe to call repeatedly."""
        if self.owns_input and self.input is not None:
            Path(self.input).unlink(missing_ok=True)
        if self.owns_output and self.output is not None:
            Path(self.output).unlink(missing_ok=True)


def materialize_step_files(files_config: Mapping[str, Any], values: Iterable[str]) -> StepFiles:
    """Materialize both input and output files for a step's `config.files` block."""
    input_spec = files_config.get("input", {"mode": "none"})
    output_spec = files_config.get("output", {"mode": "none"})
    input_path, owns_input = _materialize_input(input_spec, values)
    output_path, owns_output = _reserve_output(output_spec)
    return StepFiles(
        input=input_path,
        output=output_path,
        owns_input=owns_input,
        owns_output=owns_output,
    )


@contextmanager
def step_files(files_config: Mapping[str, Any], values: Iterable[str]) -> Iterator[StepFiles]:
    """Materialize a step's files and guarantee cleanup on exit (temp lifecycle)."""
    resolved = materialize_step_files(files_config, values)
    try:
        yield resolved
    finally:
        resolved.cleanup()
