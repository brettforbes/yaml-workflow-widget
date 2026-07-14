"""SPEC-004 adapter import map for 12A tools (R7-04-02, E5-S2).

Adapters live in the SpiderFeet repo (`cli_corpus`), not in this package.
This module documents the canonical import targets and optionally loads them
when `SPIDERFEET_ROOT` (or the sibling `../spiderfeet` checkout) is available.

| Tool | Binary | SPEC-004 module (under `.seed/scripts/cli_corpus/`) | `to_graph` |
|------|--------|------------------------------------------------------|------------|
| subfinder | `subfinder` | `adapters/subfinder/__init__.py` | `adapters.subfinder.to_graph` |
| nmap | `nmap` | harvest / nmap structured path (XML) | via harvest `nmap` dispatch — see spiderfeet `cli_corpus/harvest.py` |
| nerva | `nerva` | harvest `nerva_to_graph` / adapters when present | `cli_tool_to_graph.nerva_to_graph` |
| httpx | `httpx` | `adapters/httpx/__init__.py` | `adapters.httpx.to_graph` |
| katana | `katana` | `adapters/katana/__init__.py` | `adapters.katana.to_graph` |
| nuclei | `nuclei` | `adapters/nuclei/` (when present) / harvest dispatch | harvest `nuclei` branch |
| netdiscover | `netdiscover` | harvest / netdiscover JSON path | harvest dispatch |
| pius | `pius` | harvest `pius_to_graph` | `cli_tool_to_graph.pius_to_graph` |

Expected absolute roots on this operator machine (multi-root workspace):

- Widget: `C:\\projects\\yaml-workflow-widget`
- SpiderFeet: `C:\\projects\\spiderfeet`
- Corpus scripts: `C:\\projects\\spiderfeet\\.seed\\scripts\\cli_corpus`

If those paths are missing, live adapter wiring is **Blocked** — do not invent
`*_to_graph.py` inside this repo (R7-04-02). Dry-run fixtures remain the
supported CI path.
"""

from __future__ import annotations

import importlib
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

# Bare tool id → (module_name, attr) preferred for to_graph callables.
ADAPTER_TO_GRAPH: dict[str, tuple[str, str]] = {
    "subfinder": ("adapters.subfinder", "to_graph"),
    "httpx": ("adapters.httpx", "to_graph"),
    "katana": ("adapters.katana", "to_graph"),
    "nerva": ("cli_tool_to_graph", "nerva_to_graph"),
    "pius": ("cli_tool_to_graph", "pius_to_graph"),
    "nuclei": ("adapters.nuclei", "to_graph"),
}

ADAPTER_SOURCE_PATHS: dict[str, str] = {
    "subfinder": "spiderfeet/.seed/scripts/cli_corpus/adapters/subfinder/__init__.py",
    "httpx": "spiderfeet/.seed/scripts/cli_corpus/adapters/httpx/__init__.py",
    "katana": "spiderfeet/.seed/scripts/cli_corpus/adapters/katana/__init__.py",
    "nerva": "spiderfeet/.seed/scripts/cli_corpus/cli_tool_to_graph.py",
    "pius": "spiderfeet/.seed/scripts/cli_corpus/cli_tool_to_graph.py",
    "nmap": "spiderfeet/.seed/scripts/cli_corpus/harvest.py (nmap dispatch)",
    "nuclei": "spiderfeet/.seed/scripts/cli_corpus/adapters/nuclei/ (or harvest)",
    "netdiscover": "spiderfeet/.seed/scripts/cli_corpus/harvest.py (netdiscover dispatch)",
}


@dataclass(frozen=True)
class AdapterLoadStatus:
    tool_id: str
    available: bool
    module: str | None
    source_path: str
    detail: str


def spiderfeet_cli_corpus_dir() -> Path | None:
    """Locate SpiderFeet `cli_corpus` scripts dir if present on disk."""
    env = os.environ.get("SPIDERFEET_ROOT")
    candidates: list[Path] = []
    if env:
        candidates.append(Path(env) / ".seed" / "scripts" / "cli_corpus")
    # Sibling checkout relative to this repo
    here = Path(__file__).resolve()
    # .../yaml-workflow-widget/.seed/scripts/cli_workflow/tools/adapters.py
    widget_root = here.parents[4]
    candidates.append(widget_root.parent / "spiderfeet" / ".seed" / "scripts" / "cli_corpus")
    candidates.append(Path(r"C:\projects\spiderfeet") / ".seed" / "scripts" / "cli_corpus")
    for path in candidates:
        if path.is_dir():
            return path
    return None


def ensure_cli_corpus_on_path() -> Path | None:
    """Insert cli_corpus onto sys.path once; return the path used (or None)."""
    corpus = spiderfeet_cli_corpus_dir()
    if corpus is None:
        return None
    text = str(corpus)
    if text not in sys.path:
        sys.path.insert(0, text)
    return corpus


def adapter_status(tool_id: str) -> AdapterLoadStatus:
    """Report whether a SPEC-004 `to_graph` callable can be imported."""
    source = ADAPTER_SOURCE_PATHS.get(tool_id, "<undocumented>")
    spec = ADAPTER_TO_GRAPH.get(tool_id)
    corpus = ensure_cli_corpus_on_path()
    if corpus is None:
        return AdapterLoadStatus(
            tool_id=tool_id,
            available=False,
            module=spec[0] if spec else None,
            source_path=source,
            detail="SpiderFeet cli_corpus not found (set SPIDERFEET_ROOT or open sibling checkout)",
        )
    if spec is None:
        return AdapterLoadStatus(
            tool_id=tool_id,
            available=False,
            module=None,
            source_path=source,
            detail="No direct to_graph import mapped yet — use harvest dispatch (documented)",
        )
    module_name, attr = spec
    try:
        module = importlib.import_module(module_name)
        fn = getattr(module, attr)
        if not callable(fn):
            raise TypeError(f"{module_name}.{attr} is not callable")
        return AdapterLoadStatus(
            tool_id=tool_id,
            available=True,
            module=f"{module_name}.{attr}",
            source_path=source,
            detail=f"Import ok from {corpus}",
        )
    except Exception as exc:  # noqa: BLE001 — status probe
        return AdapterLoadStatus(
            tool_id=tool_id,
            available=False,
            module=f"{module_name}.{attr}",
            source_path=source,
            detail=f"Import failed: {exc}",
        )


def load_to_graph(tool_id: str) -> Callable[..., dict[str, Any]]:
    """Load the SPEC-004 `to_graph` callable or raise `ImportError` with path hints."""
    status = adapter_status(tool_id)
    if not status.available:
        raise ImportError(
            f"SPEC-004 adapter for {tool_id!r} unavailable: {status.detail} "
            f"(expected source: {status.source_path})"
        )
    module_name, attr = ADAPTER_TO_GRAPH[tool_id]
    return getattr(importlib.import_module(module_name), attr)
