# workflow-lang (SPEC-008)

Langium package for SpiderFeet **Workflow + GSE** editor/AST tooling.

| Contract | Path |
|----------|------|
| Spec | `../../.seed/SPEC-008-langium-workflow-gse.md` |
| YAML DSL truth | `../../.seed/12A…` / `12B…` / `12C…` |
| JSON Schema | `../../.seed/scripts/cli_workflow/schema/` |
| Skills | `../../.cursor/skills/langium`, `lai*` |

## Setup

```bash
cd packages/workflow-lang
npm install
npm run build
```

## Layout

- `langium-config.json` — language id `sf-workflow`, extension `.sfw`
- `src/language/workflow.langium` — stub grammar (E8-S1); expand in E8-S2
- Generated sources: `src/language/generated/` (gitignored; produced by `langium generate`)

## Notes

- Does **not** replace the Python `cli_workflow` dry-run runtime (SPEC-007).
- Do not invent grammar constructs absent from SPEC-007 schemas / seed docs.
