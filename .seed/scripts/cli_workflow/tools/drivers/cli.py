"""Thin CLI drivers for live tool invocation (E5)."""

from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from cli_workflow.tools.adapters import load_to_graph
from cli_workflow.tools.registry import DriverResult, ToolDriver, ToolRegistry

# Default binary names on PATH
BINARY_BY_TOOL: dict[str, str] = {
    "nmap": "nmap",
    "netdiscover": "netdiscover",
    "nerva": "nerva",
    "pius": "pius",
    "subfinder": "subfinder",
    "httpx": "httpx",
    "katana": "katana",
    "nuclei": "nuclei",
}


@dataclass
class CliToolDriver:
    """Runs `binary + argv` and optionally builds a scan graph via SPEC-004."""

    tool_id: str
    binary: str | None = None
    build_graph: bool = True

    def __post_init__(self) -> None:
        if self.binary is None:
            self.binary = BINARY_BY_TOOL.get(self.tool_id, self.tool_id)

    def which(self) -> str | None:
        return shutil.which(self.binary)

    def run(
        self,
        *,
        argv: list[str],
        input_values: list[str],
        files: dict[str, str],
    ) -> DriverResult:
        binary_path = self.which()
        if binary_path is None:
            return DriverResult(
                tool_id=self.tool_id,
                skipped=True,
                skip_reason=f"binary {self.binary!r} not found on PATH",
                argv=list(argv),
            )

        cmd = [binary_path, *argv]
        completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
        output_path = files.get("output")
        scan_graph: dict[str, Any] | None = None
        error: str | None = None

        if self.build_graph and output_path and Path(output_path).is_file():
            try:
                to_graph = load_to_graph(self.tool_id)
                raw = Path(output_path).read_text(encoding="utf-8")
                target = input_values[0] if input_values else None
                scan_graph = to_graph(raw, target=target)
            except Exception as exc:  # noqa: BLE001 — surface on result
                error = f"adapter/to_graph failed: {exc}"

        return DriverResult(
            tool_id=self.tool_id,
            exit_code=completed.returncode,
            argv=cmd,
            output_path=output_path,
            scan_graph=scan_graph,
            error=error,
        )


def default_registry(*, include_optional: bool = True) -> ToolRegistry:
    """Register CliToolDriver for every known 12A / ADAPTER_TOOLS id."""
    registry = ToolRegistry()
    for tool_id in (
        "nmap",
        "netdiscover",
        "nerva",
        "pius",
        "subfinder",
        "httpx",
        "katana",
        "nuclei",
    ):
        # nmap/netdiscover may lack a direct to_graph mapping — still register CLI
        build = tool_id not in {"nmap", "netdiscover"}
        if include_optional or tool_id in {"subfinder", "nmap"}:
            registry.register(CliToolDriver(tool_id=tool_id, build_graph=build))
    return registry


# Re-export protocol typing helper
_: type[ToolDriver] = CliToolDriver
