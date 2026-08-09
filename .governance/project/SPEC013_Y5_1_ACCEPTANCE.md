# SPEC-013 Y5-1 — YAML widget acceptance (R13-27)

**Date:** 2026-08-09  
**Mode:** Exploration (operator gate)  
**Review unit:** yaml-workflow-widget embed + standalone (`:4009`, `:4009/?embed=1`)  
**Completeness label:** Complete-with-blockers

## Preconditions

- `develop` includes Y1–Y4 merges (#244–#250)
- Dev server reachable at `http://localhost:4009`
- Geometry goldens: `node scripts/verify_dag_geometry.mjs` → `VERIFIED_OK`

## Scenario matrix

| Scenario | Classification | Evidence |
|----------|----------------|----------|
| No "CLI Workflow DAG" title bar (standalone) | Validated | HTML fetch: title string absent |
| No title bar (embed) | Validated | HTML fetch: title string absent |
| Embed full-bleed (no 33% shrink) | Validated | Bundled `workflow-dag.js` has no `33.333%` |
| Host `setEditMode` / `openSettings` / `setLegendVisible` present | Validated | JS contains `setEditMode`, settings + `Show legend` |
| Default 50% / fit-scale helpers | Validated | `verify_dag_geometry.mjs` fit-scale OK (narrow 0.3519, wide 0.5) |
| CTRL zoom + plain-wheel pan code paths | Validated | JS contains `ctrlKey` zoom branch (Y4-1) |
| Visual: Start at top, scrollbar far-right, legend position | Blocked | Requires operator visual smoke in browser |
| Visual: CTRL+/- / wheel / drag feel | Blocked | Requires operator visual smoke |
| Screenshots 12A / 12A2 embed+standalone | Blocked | Not captured in this automated pass |

## Follow-ups

1. Operator: open `:4009` and `:4009/?embed=1`, confirm Start-at-top default view, scrollbar, legend, zoom/pan feel; attach screenshots to #242.
2. Optional: close #242 after visual sign-off.

## Evidence commands

```text
node scripts/verify_dag_geometry.mjs   # VERIFIED_OK
Invoke-WebRequest http://localhost:4009/
Invoke-WebRequest http://localhost:4009/?embed=1
# inspect workflow-dag.js for setEditMode / Show legend / absence of 33.333%
```
