# Agent guide — yaml-workflow-widget

## SPEC-007 — CLI Workflow DSL + Runtime Foundation

Canonical seed docs (do not delete; treat as source of truth):

| Doc | Path |
|-----|------|
| Example workflow | `.seed/12A_Workflow_YAML_Example.yaml` |
| Workflow DSL | `.seed/12B_Workflow_DSL_Description.md` |
| Graph Select Language | `.seed/12C_Graph_Select_Language.md` |
| Spec | `.governance/specs/SPEC-007-cli-workflow-dsl.md` |
| Agent plan / issue map | `.governance/specs/SPEC-007-AGENT-PLAN.md` |

Implementation package: `.seed/scripts/cli_workflow/`

| Concern | Location |
|---------|----------|
| Schemas | `schema/workflow_v1.schema.json`, `schema/gse_v1.schema.json` |
| GSE evaluator | `core/gse_eval.py` |
| Loader / DAG / vars / files / context | `runtime/loader.py`, `core/dag.py`, `core/variables.py`, `runtime/files.py`, `core/context_export.py` |
| Dry-run executor | `runtime/executor.py` |
| Tool registry / adapters | `tools/registry.py`, `tools/adapters.py`, `tools/drivers/` |
| How to run / add a driver | [`.seed/scripts/cli_workflow/README.md`](.seed/scripts/cli_workflow/README.md) |
| Continuity handoff | [`.governance/specs/SPEC-007-CONTINUITY.md`](.governance/specs/SPEC-007-CONTINUITY.md) |

### Verify

```bash
python -m pip install pytest pyyaml jsonschema referencing
python -m pytest .tests -k cli_workflow -q
```

### Langium (SPEC-008)

| Doc | Path |
|-----|------|
| Spec | `.governance/specs/SPEC-008-langium-workflow-gse.md` |
| Package | `packages/workflow-lang/` |
| Skills | `.cursor/skills/langium`, `.cursor/skills/lai*` (never `.agents/`) |

Epic [#11](https://github.com/brettforbes/yaml-workflow-widget/issues/11) closed. YAML-as-Langium-document work continues under SPEC-012 Epic E5.

```bash
cd packages/workflow-lang && npm install && npm run build
```

### SPEC-012 — Update Widget Requirements (active)

Source: `.seed/02_Update_Widget_Requirements.md`  
Spec: [`.governance/specs/SPEC-012-update-widget.md`](.governance/specs/SPEC-012-update-widget.md)  
Agent plan / issue map: [`.governance/specs/SPEC-012-AGENT-PLAN.md`](.governance/specs/SPEC-012-AGENT-PLAN.md)

**Active epic L0 (start here):** WorkflowSeed layout replaces dagre in nice-dag-core.

| Doc / issue | Link |
|-------------|------|
| Layout rules (executable) | [`.governance/specs/SPEC-012-LAYOUT-RULES.md`](.governance/specs/SPEC-012-LAYOUT-RULES.md) |
| Seed rules | [`.seed/03_Workflow_Refinements.md`](.seed/03_Workflow_Refinements.md) |
| Epic L0 | [#194](https://github.com/brettforbes/yaml-workflow-widget/issues/194) |
| Start story L0-S0 (edit fix) | [#195](https://github.com/brettforbes/yaml-workflow-widget/issues/195) |

| Epic | Issue | Start story |
|------|------:|-------------|
| **L0 WorkflowSeed layout** | [#194](https://github.com/brettforbes/yaml-workflow-widget/issues/194) | [#195](https://github.com/brettforbes/yaml-workflow-widget/issues/195) |
| F0–E6 (landed) | [#100](https://github.com/brettforbes/yaml-workflow-widget/issues/100)–[#106](https://github.com/brettforbes/yaml-workflow-widget/issues/106) | closed |

**F0 landed:** Product UI is `src/workflow-dag/` in the webpack iframe. Launcher: `.\start.ps1` → `http://localhost:4009`. Nice-DAG library only under `apps/nice-dag/`. The Vite app `apps/workflow-dag-viewer` is retired. Do not add features in `yaml-workflow-dag`.

| Concern | Path |
|---------|------|
| Vue UI | `src/workflow-dag/` |
| 12A asset (runtime) | `src/workflow-dag/assets/12A_Workflow_YAML_Example.yaml` |
| Nice-DAG lib | `apps/nice-dag/` |
| Host postMessage helpers | `src/js/#events.js` |

Nice-DAG skill: [`.cursor/skills/nice-dag/SKILL.md`](.cursor/skills/nice-dag/SKILL.md).

### Governance

VibeGov rules: `.cursor/rules/gov-*.mdc`. Branch from `develop`, PR into `develop`. Canonical specs live under `.governance/specs/`; do not delete `.seed` DSL seed docs (12A/12B/12C) or `.cursor/skills` docs.
