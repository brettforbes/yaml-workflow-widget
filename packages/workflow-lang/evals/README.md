# LAI evaluations (SPEC-008 / R8-04)

## CI / no-LLM baseline

```bash
npm run build
npm run eval:syntax
```

Runs `evals/syntax.baseline.mjs` through the real Langium parser + validators.

## Operator LLM loop

Requires a working provider in `lai.config.jsonc` (`llm.provider` / `model`).

```bash
# optional regenerate/refine
lai gen descriptor
# refine language.descriptor.yml
lai gen sysprompt
# refine language.sysprompt.md
lai evaluate
lai show latest
```

Skills: `.cursor/skills/lai`, `lai-gen-descriptor`, `lai-gen-sysprompt`, `lai-gen-evals`.
