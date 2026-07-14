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
- `src/language/workflow.langium` — Workflow + GSE AST coverage (E8-S2)
- `examples/minimal.sfw` — parseable surface sample (YAML truth remains 12A)
- Generated sources: `src/language/generated/` (gitignored; produced by `langium generate`)

## AST coverage (vs JSON Schema)

| Area | Status |
|------|--------|
| Workflow header / info / inputs / steps | covered |
| Step input / config / files / capture / context | covered |
| GSE `select` + `nodes` + `where`/`related`/`not`/`attr` | covered |
| GSE `for_each` / `collect` / `emit` | covered |
| GSE `union` / `literal` / `from_var` | covered |
| Nested multi-level `for_each` | structural (same rules; depth not special-cased) |
| YAML round-trip | deferred (`SPEC_GAP` in SPEC-008 R8-02-03) |

## Parse / validate smoke

```bash
npm run smoke:parse
npm run smoke:validate
```

## LAI loop (R8-04)

| Artifact | Path |
|----------|------|
| Config | `lai.config.jsonc` |
| Descriptor | `language.descriptor.yml` |
| System prompt | `language.sysprompt.md` |
| Baseline evals | `evals/syntax.baseline.mjs` |

```bash
# CI baseline (no LLM)
npm run eval:syntax

# When LLM provider configured in lai.config.jsonc:
lai gen descriptor   # optional refresh
lai gen sysprompt    # optional refresh
lai evaluate
lai show latest
```

See [evals/README.md](evals/README.md).

## Notes

- Does **not** replace the Python `cli_workflow` dry-run runtime (SPEC-007).
- Do not invent grammar constructs absent from SPEC-007 schemas / seed docs.
