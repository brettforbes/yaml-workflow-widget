"""tool.<id> → driver registry (R7-04-01, E5-S1).

Dry-run remains the CI default via `runtime.executor.fixture_graph_provider`.
This registry is the live-path contract: resolve `uses: tool.<id>` to a
`ToolDriver` that can invoke a CLI and (when SPEC-004 adapters are on
`sys.path`) build a scan graph. See `ADAPTERS.md` for per-tool import paths.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol

KNOWN_TOOL_IDS: tuple[str, ...] = (
    "nmap",
    "netdiscover",
    "nerva",
    "pius",
    "subfinder",
    "httpx",
    "katana",
    "nuclei",
)


class RegistryError(Exception):
    """Unknown or unregistered tool reference."""


@dataclass
class DriverResult:
    """Outcome of a live (or dry) tool driver invocation."""

    tool_id: str
    exit_code: int = 0
    argv: list[str] = field(default_factory=list)
    output_path: str | None = None
    scan_graph: dict[str, Any] | None = None
    error: str | None = None
    skipped: bool = False
    skip_reason: str | None = None


class ToolDriver(Protocol):
    """Thin CLI wrapper that optionally builds a scan graph via SPEC-004."""

    tool_id: str

    def run(
        self,
        *,
        argv: list[str],
        input_values: list[str],
        files: dict[str, str],
    ) -> DriverResult: ...


@dataclass
class ToolRegistry:
    """Maps `tool.<id>` / bare ids to registered drivers."""

    _drivers: dict[str, ToolDriver] = field(default_factory=dict)

    def register(self, driver: ToolDriver) -> None:
        tool_id = driver.tool_id
        if tool_id not in KNOWN_TOOL_IDS:
            raise RegistryError(
                f"Cannot register unknown tool id {tool_id!r}; "
                f"known ids: {', '.join(KNOWN_TOOL_IDS)}"
            )
        self._drivers[tool_id] = driver

    def get(self, uses_or_id: str) -> ToolDriver:
        tool_id = uses_or_id[len("tool.") :] if uses_or_id.startswith("tool.") else uses_or_id
        if tool_id not in KNOWN_TOOL_IDS:
            raise RegistryError(f"Unknown tool reference: {uses_or_id!r}")
        try:
            return self._drivers[tool_id]
        except KeyError as exc:
            raise RegistryError(
                f"Tool {tool_id!r} is known but no driver is registered"
            ) from exc

    def list_registered(self) -> list[str]:
        return sorted(self._drivers)

    def list_known(self) -> list[str]:
        return list(KNOWN_TOOL_IDS)


def parse_tool_id(uses: str) -> str:
    """Extract bare adapter id from `tool.<id>` (raises if malformed/unknown)."""
    if not uses.startswith("tool."):
        raise RegistryError(f"Tool uses must look like 'tool.<id>', got {uses!r}")
    tool_id = uses[len("tool.") :]
    if tool_id not in KNOWN_TOOL_IDS:
        raise RegistryError(f"Unknown tool id in uses: {uses!r}")
    return tool_id
