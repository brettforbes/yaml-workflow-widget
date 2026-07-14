"""Load synthetic scan-graph fixtures used by GSE tests (E2-S6).

Fixtures live under `<package_root>/fixtures/*.json` and are documented in
`fixtures/README.md`. Each file is a plain `{"nodes": [...], "edges": [...]}`
scan graph — the same shape `GraphIndex` expects.
"""

from __future__ import annotations

import json
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
FIXTURES_DIR = PACKAGE_ROOT / "fixtures"


def fixture_path(name: str) -> Path:
    """Resolve a fixture filename (with or without `.json`) to its full path."""
    filename = name if name.endswith(".json") else f"{name}.json"
    return FIXTURES_DIR / filename


def load_fixture_graph(name: str) -> dict:
    """Load a `{"nodes": [...], "edges": [...]}` fixture graph by name."""
    path = fixture_path(name)
    if not path.is_file():
        raise FileNotFoundError(f"Unknown GSE fixture: {name!r} (looked for {path})")
    return json.loads(path.read_text(encoding="utf-8"))
