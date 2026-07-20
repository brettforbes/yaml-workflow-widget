# SPEC-012 continuity (agent handoff)

Updated: 2026-07-20 (Epic L0 opened — WorkflowSeed layout)

## Status: F0–E6 complete on `develop`; **L0 active**

| Epic | Issues | Outcome |
|------|--------|---------|
| **L0 #194** | #195–#207 | WorkflowSeed replaces dagre; edit fix; Pretty Print; seed edge names |

**Start here:** [L0-S0 #195](https://github.com/brettforbes/yaml-workflow-widget/issues/195) — fix `useNiceDag({ editable: true })`.  
**Rules:** [SPEC-012-LAYOUT-RULES.md](SPEC-012-LAYOUT-RULES.md) · seed [`.seed/03_Workflow_Refinements.md`](../../.seed/03_Workflow_Refinements.md)

## Prior: plan complete on `develop` (F0–E6)

| Epic | Issues | Outcome |
|------|--------|---------|
| F0 #100 | #107–#110 | webpack `src/workflow-dag`, Nice-DAG under `apps/nice-dag` only |
| E1 #101 | #111–#116 | theme, editable code, divider, pan/zoom, body tooltip |
| E2 #102 | #117–#124 | start/target/end, edge types, context rail, sub-DAG |
| E3 #103 | #125–#130 | CLI + nugget content under `src/content/`; category forms |
| E4 #104 | #131–#135 | edit mode, delete/add, RMB edges, pretty-print (+ hotfix #177) |
| E5 #105 | #136–#140 | YAML Langium bridge, validate UI, YAML↔DAG, MCP explain/produce |
| E6 #106 | #141–#146 | host postMessage protocol, YAML/theme/selection/MCP bridge, content audit |

## Landmark PRs (E5–E6)

| PR | Story | Notes |
|----|-------|-------|
| #178 | E5-S1 | YAML→`.sfw` DocumentBuilder |
| #179 | E5-S2 | Debounced validate UI + last-good |
| #180 | E5-S3 | Valid YAML → `withNodes` |
| #181 | E5-S4 | Diagram → YAML sync |
| #182 | E5-S5 | MCP explain/produce |
| #183 | E6-S1 | HOST_PROTOCOL + handlers |
| #184 | E6-S2 | Host YAML in/out |
| #185 | E6-S3 | Host theme / themeChanged |
| #186 | E6-S4 | Step selection docs |
| #187 | E6-S5 | Host MCP bridge |
| (this) | E6-S6 | Content audit + this note |

## Product surface

- `.\start.ps1` → `http://localhost:4009`
- UI: `src/workflow-dag/` (+ `HOST_PROTOCOL.md`)
- Content (runtime): `src/content/{cli_app_arguments,nugget_structure}/`
- Sample YAML: `src/workflow-dag/assets/12A_Workflow_YAML_Example.yaml`
- Langium: `packages/workflow-lang/`
- Nice-DAG: `apps/nice-dag/` only — do not edit `yaml-workflow-dag` for product

## Content install audit (R12-E6-06)

**Claim:** Runtime code does not `import` / `require` paths under `.seed/`.

**Evidence (2026-07-17):**
- Grep of `src/workflow-dag/**`, `src/js/**`, `apps/**`, `packages/workflow-lang/src/**` for import/require of `.seed` → **none**.
- Content consumed by webpack is under `src/content/**` (E3).
- Mentions of `.seed` remaining in `src/content/nugget_structure/*.md` are **provenance comments** inside installed content strings, not module resolution paths.
- Mapper comment updated to point at governance specs; seed remains docs-only.

## Locked decisions

- Edge labels: `follows` | `used-by` | `semantic-subgraph`
- YAML tool field stays `uses: tool.*`
- Langium must parse **YAML** (bridge in browser; full DocumentBuilder in Node/MCP)
- Subtle icons only; no header button bars

## Residual risks / follow-ups

- Browser validate uses YAML bridge + structural checks; full Langium validation is Node/MCP (`packages/workflow-lang`).
- Diagram↔YAML round-trip preserves step ids but may drop rich GSE/formatting nuances vs hand-authored 12A.
- Host MCP explain is browser-safe (not full Langium AST); prefer stdio MCP for agents.
- Local untracked moves under `.seed/cli_app_arguments/` are operator workspace noise — do not mix into SPEC-012 PRs.
- Manual :4009 console smoke for host messages still recommended after deploys.

## Verify shortcuts

```bash
cd packages/workflow-lang && npm run smoke:yaml && npm run mcp:smoke
node src/workflow-dag/hostProtocol.smoke.mjs
node src/workflow-dag/hostYaml.smoke.mjs
node src/workflow-dag/components/hostMcp.smoke.mjs
npm run build:dev
```
