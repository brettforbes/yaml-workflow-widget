"""Ensure `.seed/scripts` is on sys.path for cli_workflow imports."""

from __future__ import annotations

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parents[1] / ".seed" / "scripts"
_scripts_str = str(_SCRIPTS)
if _scripts_str not in sys.path:
    sys.path.insert(0, _scripts_str)
