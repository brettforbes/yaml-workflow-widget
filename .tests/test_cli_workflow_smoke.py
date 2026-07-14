"""E1-S1 smoke: package imports (R7-03-01)."""

from __future__ import annotations


def test_import_cli_workflow_package():
    import cli_workflow

    assert cli_workflow.__version__ == "0.1.0"


def test_import_core_and_runtime_modules():
    import cli_workflow.core.gse_eval  # noqa: F401
    import cli_workflow.core.variables  # noqa: F401
    import cli_workflow.core.context_export  # noqa: F401
    import cli_workflow.core.dag  # noqa: F401
    import cli_workflow.runtime.loader  # noqa: F401
    import cli_workflow.runtime.files  # noqa: F401
    import cli_workflow.runtime.executor  # noqa: F401
    import cli_workflow.tools.registry  # noqa: F401
