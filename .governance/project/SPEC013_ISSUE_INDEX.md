# SPEC-013 issue index — YAML DSL Workflow iFrame (`yaml-workflow-widget`)

**Spec:** `@spiderfeet/.governance/specs/SPEC-013-projects-composer-refinement.md`
**Repo:** `brettforbes/yaml-workflow-widget` · integration branch `develop`
**Builds on:** SPEC-012 (`update-widget` + `LAYOUT-RULES` WorkflowSeed goldens). Layout goldens for `12A`/`12A2` are frozen — do not change node coordinates.

Status legend: `planned` → `open` → `in progress` → `in review` → `done`.

| Code | Issue | Requirement | Depends on | Status |
|------|-------|-------------|------------|--------|
| Epic Y1 — Remove DAG title bar + host-driven controls | [#230](https://github.com/brettforbes/yaml-workflow-widget/issues/230) | R13-20..21 | — | done |
| Y1-1 — Remove "CLI Workflow DAG" title bar in all modes | [#235](https://github.com/brettforbes/yaml-workflow-widget/issues/235) | R13-20 | — | done ([#244](https://github.com/brettforbes/yaml-workflow-widget/pull/244)) |
| Y1-2 — Add host messages `setEditMode`/`openSettings`/`setLegendVisible` + docs | [#236](https://github.com/brettforbes/yaml-workflow-widget/issues/236) | R13-21 | Y1-1 | done ([#245](https://github.com/brettforbes/yaml-workflow-widget/pull/245)) |
| Epic Y2 — Embed layout fix | [#231](https://github.com/brettforbes/yaml-workflow-widget/issues/231) | R13-22 | — | done |
| Y2-1 — Remove 33% embed shrink + overlays; full-bleed centered diagram | [#237](https://github.com/brettforbes/yaml-workflow-widget/issues/237) | R13-22 | — | done |
| Epic Y3 — Dimensions + fit rules | [#232](https://github.com/brettforbes/yaml-workflow-widget/issues/232) | R13-23..24 | Y2 | open |
| Y3-1 — Track DAG bbox/centre-line at 100% zoom | [#238](https://github.com/brettforbes/yaml-workflow-widget/issues/238) | R13-23 | Y2-1 | open |
| Y3-2 — Default 50%/fit-to-width view + on-canvas reset | [#239](https://github.com/brettforbes/yaml-workflow-widget/issues/239) | R13-24 | Y3-1 | open |
| Epic Y4 — Zoom/pan rework + legend toggle | [#233](https://github.com/brettforbes/yaml-workflow-widget/issues/233) | R13-25..26 | Y3 | open |
| Y4-1 — CTRL+/-/CTRL-wheel zoom; wheel=vertical pan; drag=pan | [#240](https://github.com/brettforbes/yaml-workflow-widget/issues/240) | R13-25 | Y3-2 | open |
| Y4-2 — Settings "Show legend" toggle + host `setLegendVisible` | [#241](https://github.com/brettforbes/yaml-workflow-widget/issues/241) | R13-26 | Y1-2 | open |
| Epic Y5 — YAML widget acceptance | [#234](https://github.com/brettforbes/yaml-workflow-widget/issues/234) | R13-27 | Y1–Y4 | open |
| Y5-1 — Smoke + visual verification on 12A/12A2 (embed + standalone) — OPERATOR GATE | [#242](https://github.com/brettforbes/yaml-workflow-widget/issues/242) | R13-27 | all above | open |

## Execution order

```
Y1-1 → Y1-2 → Y2-1 → Y3-1 → Y3-2 → Y4-1 ∥ Y4-2 → Y5-1 [OPERATOR GATE]
```

`Y1-2` (host `setEditMode`/`openSettings`/`setLegendVisible`) is the cross-repo dependency for the widget's `W4-2` — land it early.

## Per-issue detail

Key files (from the exploration): `src/workflow-dag/App.vue` (title bar L7–81, embed detection L425–428, embed CSS L1321–1324, zoom/pan handlers L767–817, host message listener L610–686), `src/workflow-dag/hostProtocol.js` (L6–20), `src/workflow-dag/components/EdgeLegend.vue` (position L42–46), `HOST_PROTOCOL.md`, `EMBED_GUIDE.md`.

### Y1-1 — Remove title bar (R13-20)
- **Do:** delete the `.dag-toolbar` title bar (`App.vue` L7–81) in embed **and** standalone. Preserve edit-mode + settings state; expose them via host messages (Y1-2) and minimal on-canvas affordances for standalone use. Ensure no dead references to removed toolbar buttons.
- **Verify:** `start.ps1` → `:4009` and `:4009/?embed=1` show no title bar; app still renders 12A.

### Y1-2 — Host control messages (R13-21)
- **Files:** `hostProtocol.js`, `App.vue` `onHostMessage` (L610–686), `HOST_PROTOCOL.md`.
- **Do:** inbound `setEditMode {editing}` → `startEditing()/stopEditing()` + outbound `editModeChanged {editing}`; `openSettings` → open settings panel; `setLegendVisible {visible}` → toggle legend. Keep existing `setYaml/getYaml/setTheme/selectStep` + outbound events. Update `HOST_PROTOCOL.md`.
- **Verify:** postMessage smoke (or manual) toggles edit/settings/legend from a host stub.

### Y2-1 — Embed layout fix (R13-22)
- **Files:** `App.vue` embed CSS (L1321–1324), `.embed-diagram` class usage (L151–153), main-layer overflow (L1243–1247), `EdgeLegend.vue` position.
- **Do:** remove `max-width:33.333%; margin:0 auto` and any viewport-reduction so the diagram fills the iframe centered; scrollbar at far-right; legend anchored to the diagram, not floating over it. Fix the 5 symptoms in `.seed/18` §2.2.5.
- **Verify:** `:4009/?embed=1` at full width — no left/right empty thirds, scrollbar far right, legend correct, whole diagram reachable.

### Y3-1 — Dimensions tracking (R13-23)
- **Files:** post-layout hook near `applyCenter` (L743–751); use `rootView.model.size()` / aggregate node x/y/w/h; seed centre `CX=391`.
- **Do:** compute + store bbox at 100%: centre line, left/right widths from centre, top/bottom; recompute on layout change.
- **Verify:** logged/inspectable dimensions match 12A/12A2 goldens.

### Y3-2 — Fit rules + reset (R13-24)
- **Files:** `resetView` (L754–765), scale refs (`dagScale` L431, clamps L358–360), `applyCenter`.
- **Do:** default view = 50% zoom, centered, Start at top, vertical scroll for the rest; if wider than host at 50%, zoom out until L/R edges are 5px inside; on-canvas reset restores this default.
- **Verify:** both workflows open at the default view per the rules in host partial-width and standalone.

### Y4-1 — Zoom/pan inputs (R13-25)
- **Files:** `onDiagramWheel` (L767–787), `onDiagramPanStart` (L789–817), key handlers.
- **Do:** `CTRL +`/`CTRL -` keys and `CTRL`+wheel = zoom; plain wheel = vertical pan (right scrollbar); click-drag = pan both axes. Preserve clamps compatible with fit rules.
- **Verify:** each input behaves as specified; no accidental zoom on plain wheel.

### Y4-2 — Legend toggle (R13-26)
- **Files:** settings panel (`App.vue` L20–35), `EdgeLegend.vue`, `showLegend` ref, host `setLegendVisible`.
- **Do:** add "Show legend" checkbox (default on) wrapping `<EdgeLegend v-if="showLegend">`; also driven by host message. Keep theme + coloured-edges options.
- **Verify:** toggling hides/shows the legend from settings and from a host message.

### Y5-1 — Acceptance (R13-27) — OPERATOR GATE
- **Do:** smoke + screenshots on 12A/12A2 in embed + standalone: no title bar; full-bleed embed with correct scrollbar/legend; default 50%/fit view; CTRL zoom + wheel/drag pan; host edit/settings/legend messages. Attach evidence.

## Governance
Branch from `develop`; PR into `develop`; close each issue with a completion note + evidence; merge before the next. Do not alter the SPEC-012 WorkflowSeed golden coordinates. Confirm autonomous self-merge posture with the operator (non-gate issues) before starting.
