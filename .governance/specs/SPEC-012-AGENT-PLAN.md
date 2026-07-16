# SPEC-012 — Agent plan / GitHub issue map

| Field | Value |
|-------|-------|
| Spec | [SPEC-012-update-widget.md](SPEC-012-update-widget.md) |
| Source requirements | `.seed/02_Update_Widget_Requirements.md` |
| Product surface after F0 | `src/` webpack iframe — `.\start.ps1` → `http://localhost:4001` |
| Nice-DAG library | `apps/nice-dag/` only |
| Langium package | `packages/workflow-lang/` |
| Nice-DAG skill (read-only) | `yaml-workflow-dag/.cursor/skills/nice-dag/SKILL.md` |
| Skills | `.cursor/skills/langium`, `.cursor/skills/lai*` — **never** `.agents/` |

## Execution order

`Prep → F0 → E1 → E2 → E3 → E4 → E5 → E6`

Do **not** start an epic until the previous epic’s acceptance is met (E3 may overlap E4 only for form work after E2; edit chrome does not wait on E3).

**Start here:** [F0-S1 #107](https://github.com/brettforbes/yaml-workflow-widget/issues/107) after reading the F0 epic [#100](https://github.com/brettforbes/yaml-workflow-widget/issues/100).

## Locked decisions (repeat for lesser agents)

- No feature work in `yaml-workflow-dag`.
- Diagram edge labels: `follows` | `used-by` | `semantic-subgraph`. YAML `uses: tool.*` unchanged.
- Langium must parse **YAML**.
- MCP: `explain_workflow` + `produce_workflow`.
- Subtle icons only; no header button bars.
- Layout 2c: product in webpack `src/`; `apps/` = Nice-DAG library only.

## Issue map

| ID | Title | Req | Depends | Issue |
|----|-------|-----|---------|------:|
| Epic F0 | Layout: webpack src + Nice-DAG in apps | R12-F0-* | Prep | [#100](https://github.com/brettforbes/yaml-workflow-widget/issues/100) |
| F0-S1 | Vendor Nice-DAG into apps/nice-dag | R12-F0-01 | Epic F0 | [#107](https://github.com/brettforbes/yaml-workflow-widget/issues/107) |
| F0-S2 | Vue3 + SFC in root webpack; mount root | R12-F0-02 | F0-S1 | [#108](https://github.com/brettforbes/yaml-workflow-widget/issues/108) |
| F0-S3 | Move UI into src/workflow-dag | R12-F0-03 | F0-S2 | [#109](https://github.com/brettforbes/yaml-workflow-widget/issues/109) |
| F0-S4 | Retire Vite app; start.ps1 acceptance | R12-F0-04 | F0-S3 | [#110](https://github.com/brettforbes/yaml-workflow-widget/issues/110) |
| Epic E1 | Chrome / UX | R12-E1-* | F0 done | [#101](https://github.com/brettforbes/yaml-workflow-widget/issues/101) |
| E1-S1 | Theme tokens + settings + setTheme stub | R12-E1-01 | Epic E1 | [#111](https://github.com/brettforbes/yaml-workflow-widget/issues/111) |
| E1-S2 | Editable code window | R12-E1-02 | Epic E1 | [#112](https://github.com/brettforbes/yaml-workflow-widget/issues/112) |
| E1-S3 | Draggable divider + sessionStorage | R12-E1-03 | Epic E1 | [#113](https://github.com/brettforbes/yaml-workflow-widget/issues/113) |
| E1-S4 | Divider collapse/reopen arrows | R12-E1-04 | E1-S3 | [#114](https://github.com/brettforbes/yaml-workflow-widget/issues/114) |
| E1-S5 | Pan/zoom + reset view | R12-E1-05 | Epic E1 | [#115](https://github.com/brettforbes/yaml-workflow-widget/issues/115) |
| E1-S6 | Collapsed body tooltip sans I/O | R12-E1-06 | Epic E1 | [#116](https://github.com/brettforbes/yaml-workflow-widget/issues/116) |
| Epic E2 | Workflow model v2 | R12-E2-* | E1 done | [#102](https://github.com/brettforbes/yaml-workflow-widget/issues/102) |
| E2-S1 | Start circle | R12-E2-01 | Epic E2 | [#117](https://github.com/brettforbes/yaml-workflow-widget/issues/117) |
| E2-S2 | Target node | R12-E2-02 | E2-S1 | [#118](https://github.com/brettforbes/yaml-workflow-widget/issues/118) |
| E2-S3 | End context circle | R12-E2-03 | E2-S1 | [#119](https://github.com/brettforbes/yaml-workflow-widget/issues/119) |
| E2-S4 | Edge labels + colors + legend | R12-E2-04 | E2-S1 | [#120](https://github.com/brettforbes/yaml-workflow-widget/issues/120) |
| E2-S5 | used-by vs follows priority | R12-E2-05 | E2-S4 | [#121](https://github.com/brettforbes/yaml-workflow-widget/issues/121) |
| E2-S6 | Context rail layout | R12-E2-06 | E2-S4, E2-S3 | [#122](https://github.com/brettforbes/yaml-workflow-widget/issues/122) |
| E2-S7 | Collapsed chrome icon/label swap | R12-E2-07 | E2-S6 | [#123](https://github.com/brettforbes/yaml-workflow-widget/issues/123) |
| E2-S8 | True sub-DAG expand | R12-E2-08 | E2-S6, E2-S7 | [#124](https://github.com/brettforbes/yaml-workflow-widget/issues/124) |
| Epic E3 | Category form UIs | R12-E3-* | E2 done | [#103](https://github.com/brettforbes/yaml-workflow-widget/issues/103) |
| E3-S1 | Install CLI-options content | R12-E3-01 | Epic E3 | [#125](https://github.com/brettforbes/yaml-workflow-widget/issues/125) |
| E3-S2 | Config form modal | R12-E3-02,07 | E3-S1 | [#126](https://github.com/brettforbes/yaml-workflow-widget/issues/126) |
| E3-S3 | Install nugget_structure content | R12-E3-03 | Epic E3 | [#127](https://github.com/brettforbes/yaml-workflow-widget/issues/127) |
| E3-S4 | Output GSE form | R12-E3-04,07 | E3-S3 | [#128](https://github.com/brettforbes/yaml-workflow-widget/issues/128) |
| E3-S5 | Input form | R12-E3-05,07 | Epic E3 | [#129](https://github.com/brettforbes/yaml-workflow-widget/issues/129) |
| E3-S6 | Context boolean form | R12-E3-06,07 | Epic E3 | [#130](https://github.com/brettforbes/yaml-workflow-widget/issues/130) |
| Epic E4 | Diagram edit mode | R12-E4-* | E2 done | [#104](https://github.com/brettforbes/yaml-workflow-widget/issues/104) |
| E4-S1 | Edit/read toggle + mesh | R12-E4-01 | Epic E4 | [#131](https://github.com/brettforbes/yaml-workflow-widget/issues/131) |
| E4-S2 | Delete shapes | R12-E4-02 | E4-S1 | [#132](https://github.com/brettforbes/yaml-workflow-widget/issues/132) |
| E4-S3 | Add node types | R12-E4-03 | E4-S1 | [#133](https://github.com/brettforbes/yaml-workflow-widget/issues/133) |
| E4-S4 | RMB typed edges | R12-E4-04 | E4-S1, E2-S5 | [#134](https://github.com/brettforbes/yaml-workflow-widget/issues/134) |
| E4-S5 | Vertical YAML pretty-print | R12-E4-05 | E4-S3 | [#135](https://github.com/brettforbes/yaml-workflow-widget/issues/135) |
| Epic E5 | Langium YAML sync + MCP | R12-E5-* | E2; E4 for diagram→YAML | [#105](https://github.com/brettforbes/yaml-workflow-widget/issues/105) |
| E5-S1 | YAML Langium documents | R12-E5-01 | Epic E5 | [#136](https://github.com/brettforbes/yaml-workflow-widget/issues/136) |
| E5-S2 | Code window validate UI | R12-E5-02 | E5-S1 | [#137](https://github.com/brettforbes/yaml-workflow-widget/issues/137) |
| E5-S3 | YAML→AST→DAG | R12-E5-03 | E5-S1, E2 | [#138](https://github.com/brettforbes/yaml-workflow-widget/issues/138) |
| E5-S4 | Diagram→AST→YAML | R12-E5-04 | E5-S3, E4 | [#139](https://github.com/brettforbes/yaml-workflow-widget/issues/139) |
| E5-S5 | MCP explain + produce | R12-E5-05 | E5-S1 | [#140](https://github.com/brettforbes/yaml-workflow-widget/issues/140) |
| Epic E6 | Embed / host protocol | R12-E6-* | E1, E5 | [#106](https://github.com/brettforbes/yaml-workflow-widget/issues/106) |
| E6-S1 | postMessage contract | R12-E6-01 | Epic E6 | [#141](https://github.com/brettforbes/yaml-workflow-widget/issues/141) |
| E6-S2 | Host YAML in/out | R12-E6-02 | E6-S1, E5-S2 | [#142](https://github.com/brettforbes/yaml-workflow-widget/issues/142) |
| E6-S3 | Host theme | R12-E6-03 | E6-S1, E1-S1 | [#143](https://github.com/brettforbes/yaml-workflow-widget/issues/143) |
| E6-S4 | Step selection sync | R12-E6-04 | E6-S1 | [#144](https://github.com/brettforbes/yaml-workflow-widget/issues/144) |
| E6-S5 | Host MCP bridge | R12-E6-05 | E6-S1, E5-S5 | [#145](https://github.com/brettforbes/yaml-workflow-widget/issues/145) |
| E6-S6 | Content install audit | R12-E6-06 | Epic E6 | [#146](https://github.com/brettforbes/yaml-workflow-widget/issues/146) |

## Verify (global)

```bash
# Widget (after F0)
.\start.ps1
# open http://localhost:4001

# Langium (E5)
cd packages/workflow-lang && npm install && npm run build && npm run mcp:smoke

# Python DSL still green
python -m pytest .tests -k cli_workflow -q
```

## Story body checklist

Every story issue includes: problem, outcome, non-goals, OpenSpec IDs, depends-on, touch files, AC checkboxes, verify commands, Nice-DAG skill reminder when diagram-related.

## Continuity

When an epic lands, comment on the epic with PR links. Optional closeout: `.governance/specs/SPEC-012-CONTINUITY.md` (E6-S6).
