# SPEC-007 — Sketch → v1 gap notes

Companion to `.seed/12B_Workflow_DSL_Description.md` §7.

Informal sketch forms **forbidden** in validated workflows:

| Sketch | Why invalid | v1 replacement |
|--------|-------------|----------------|
| `concat({{IP_ADDRESS}}, ":", {{PORT}})` | Ignores host scope; invents templates | GSE `for_each` + `emit.product` + `join` |
| `{{DOMAIN_NAME}}` / `{{SUBDOMAIN}}` | `SUBDOMAIN` not in ontology | `DOMAIN_NAME` + `where related` / `not related` `DOMAIN_NAME_PARENT` |
| `sum(...)` | Not defined | `union` of string lists |
| Flat `sequence` with broken indent | Not a DAG | `steps` + `needs` |
| `sfp_*` module ids | Adapters first | `uses: tool.<adapter_id>` |
| `cli_options` shell string | Not AST-friendly | `config.argv` list |
| Implicit `{{scan_graph}}` | Ambiguous | `context.export: scan_graph` |

See also `.seed/SPEC-007-AGENT-PLAN.md` for execution epics.
