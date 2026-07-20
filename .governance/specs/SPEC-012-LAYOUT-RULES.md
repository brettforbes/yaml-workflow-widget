# SPEC-012 — Layout rules (WorkflowSeed)

| Field | Value |
|-------|-------|
| Status | Active — Epic L0 |
| Product seed | [`.seed/03_Workflow_Refinements.md`](../../.seed/03_Workflow_Refinements.md) |
| Engine home | `apps/nice-dag/nice-dag-core` — `layout: "WORKFLOW_SEED"` **replaces dagre** |
| App topology | `src/workflow-dag/` annotates roles; does not invent joints |
| Epic | [#194](https://github.com/brettforbes/yaml-workflow-widget/issues/194) |
| Start story | [L0-S0 #195](https://github.com/brettforbes/yaml-workflow-widget/issues/195) |

Seed **overrides** prior UI layout/edge contracts. Tweak this file when seed changes.

---

## 1. Constants

| Name | Value | Notes |
|------|------:|-------|
| `CX` | 391 | Vertical centreline (`cx` of start / target / centre steps / end); `291 + DIAGRAM_X_OFFSET` |
| `DIAGRAM_X_OFFSET` | 100 | Global horizontal shift right from legacy spine at 291 |
| `ROW_PITCH` | 150 | Δ`cy` between successive rows |
| `FIRST_SPLIT_PITCH` | 180 | Δ`cy` from centre default_step into first fan-out row |
| `COLLECTOR_GAP` | 90 | Step edge → **collector centre** |
| `TRANSITION` | 72×72 | start / context end |
| `TARGET` | 140×48 | |
| `STEP` | 180×64 | default_step / mirror_step |
| `SUB_STEP` | 160×56 | expanded children |
| `COLLECTOR` | 32×32 | |
| `PORT` | 12×12 | |
| `EXPANDED_MIN` | 214×528 | expanded step host |
| `EXPAND_DELTA` | 464 | `528 − 64` push-down |

Top-left from centre: `x = cx − width/2`, `y = cy − height/2`.

---

## 2. Edge types (canonical UI strings)

| Type | When |
|------|------|
| `followed-by` | Sequence into a step that has **no input** |
| `used-by` | Edge into a step/target that **has input**; overwrites followed-by |
| `semantic-export` | Context port → collector; collector → collector; last collector → context transition |

Prefer orthogonal H/V edges; attach to port / collector / transition **perimeters** (ray through centre).

---

## 3. Node metadata contract (app → core)

Each Nice-DAG node `data` should include:

| Field | Values |
|-------|--------|
| `layoutRole` | `transition` \| `target` \| `default_step` \| `mirror_step` \| `collector` \| `sub_step` |
| `layoutRank` | integer row index (0 = start) |
| `layoutChain` | `centre` \| `left` \| `right` \| `pair:<n>` for §3.4 |
| `collapsed` | boolean (steps) |

No `joint-*` nodes. `mode: "DEFAULT"`.

---

## 4. WorkflowSeed algorithm (for `doLayout`)

1. Place `start` at `cx=CX`, `cy=36` (x=255, y=0).
2. If workflow has `inputs` → place `target` at `cy=152`. Else first step at `cy=152`.
3. Build step DAG from `needs` + `input.from` (`$steps.*` ⇒ data dep).
4. Layer into ranks; each rank `cy += ROW_PITCH`, except the first fan-out (split) rank uses `FIRST_SPLIT_PITCH` (180).
5. Fan-out (2 consumers): longest chain **left** (`default_step`), shortest **right** (`mirror_step`); equal length → first in YAML order left.
6. Align left chain right-edge to splitter left-edge; right chain left-edge to splitter right-edge.
7. Collectors: default → right of step (`COLLECTOR_GAP` from right edge to collector centre); mirror → left; split → **one shared** collector on centreline.
8. Chain collectors with `semantic-export`; last → `context` transition on `CX`.
9. Expand: host ≥ `EXPANDED_MIN`; children at §2.4 offsets; push all nodes with `y` below expanded top by `EXPAND_DELTA`.

§3.4: odd chains = `default_step`, even = `mirror_step`; centralise around `CX`. No numeric golden yet (SPEC_GAP L0-S11).

---

## 5. Golden fixtures (must match ±1px)

### 5.1 Simple — `.seed/12A2_Workflow_YAML_Example.yaml`

| workflow-icon | type | x | y | cx | cy |
| --- | --- | ---: | ---: | ---: | ---: |
| start | transition | 355 | 0 | 391 | 36 |
| sfp_cli_netdiscover | default_step | 301 | 154 | 391 | 186 |
| context_collector_1 | collector | 555 | 170 | 571 | 186 |
| context | transition | 355 | 300 | 391 | 336 |

### 5.2 Complex — `.seed/12A_Workflow_YAML_Example.yaml`

| workflow-icon | type | x | y | cx | cy |
| --- | --- | ---: | ---: | ---: | ---: |
| start | transition | 355 | 0 | 391 | 36 |
| target | target | 321 | 162 | 391 | 186 |
| sfp_cli_subfinder | default_step | 301 | 304 | 391 | 336 |
| context_collector_1 | collector | 555 | 320 | 571 | 336 |
| sfp_cli_httpx | default_step | 121 | 484 | 211 | 516 |
| context_collector_2 | collector | 375 | 500 | 391 | 516 |
| sfp_cli_nmap | mirror_step | 481 | 484 | 571 | 516 |
| sfp_cli_katana | default_step | 121 | 634 | 211 | 666 |
| context_collector_3 | collector | 375 | 650 | 391 | 666 |
| sfp_cli_nerva | mirror_step | 481 | 634 | 571 | 666 |
| sfp_cli_nuclei | default_step | 121 | 784 | 211 | 816 |
| context_collector_4 | collector | 375 | 800 | 391 | 816 |
| context | transition | 355 | 930 | 391 | 966 |

---

## 6. Expanded children offsets (§2.4)

Relative to expanded step top-left:

| label | w | h | x | y |
| --- | ---: | ---: | ---: | ---: |
| input | 160 | 56 | 36 | 56 |
| config | 160 | 56 | 36 | 168 |
| context | 160 | 56 | 36 | 280 |
| output | 160 | 56 | 36 | 392 |

Internal edges: used-by input→config→context→output. Outer semantic-export: expanded context port → collector. **Do not** implement truncated inner semantic-export bullet until seed finishes §3.3 (L0-S11).

---

## 7. Core integration

```js
useNiceDag({
  editable: true,
  mode: "DEFAULT",
  layout: "WORKFLOW_SEED", // NOT dagre
  getNodeSize,
  initNodes,
});
```

- `doLayout` / `prettify` → `WorkflowSeedLayout` when `layout === "WORKFLOW_SEED"`.
- App **Pretty Print** button → `niceDag.prettify()`.
- YAML dump toolbar label: **Pretty-print YAML** (distinct).

---

## 8. Issue map (Epic L0)

| ID | Issue |
|----|------:|
| Epic L0 | [#194](https://github.com/brettforbes/yaml-workflow-widget/issues/194) |
| L0-S0 edit fix | [#195](https://github.com/brettforbes/yaml-workflow-widget/issues/195) |
| L0-S1 this doc | [#196](https://github.com/brettforbes/yaml-workflow-widget/issues/196) |
| L0-S2 edge rename | [#197](https://github.com/brettforbes/yaml-workflow-widget/issues/197) |
| L0-S3 engine + goldens | [#198](https://github.com/brettforbes/yaml-workflow-widget/issues/198) |
| L0-S4 fromWorkflow | [#199](https://github.com/brettforbes/yaml-workflow-widget/issues/199) |
| L0-S5 doLayout branch | [#200](https://github.com/brettforbes/yaml-workflow-widget/issues/200) |
| L0-S6 app wire | [#201](https://github.com/brettforbes/yaml-workflow-widget/issues/201) |
| L0-S7 chrome | [#202](https://github.com/brettforbes/yaml-workflow-widget/issues/202) |
| L0-S8 expand | [#203](https://github.com/brettforbes/yaml-workflow-widget/issues/203) |
| L0-S9 Pretty Print | [#204](https://github.com/brettforbes/yaml-workflow-widget/issues/204) |
| L0-S10 edges §2.5 | [#205](https://github.com/brettforbes/yaml-workflow-widget/issues/205) |
| L0-S11 SPEC_GAP | [#206](https://github.com/brettforbes/yaml-workflow-widget/issues/206) |
| L0-S12 gov/smokes | [#207](https://github.com/brettforbes/yaml-workflow-widget/issues/207) |

**Execution:** `S0 → S1∥S2 → S3∥S4 → S5 → S6 → S7∥S8∥S9 → S10 → S11∥S12`

---

## 9. Verify

```bash
.\start.ps1
# http://localhost:4009 — load 12A2 then 12A; edit pencil; Pretty Print (▦)

node src/workflow-dag/components/mapper.smoke.mjs
node src/workflow-dag/components/workflowSeedGolden.smoke.mjs
```

---

## 10. SPEC_GAP (L0-S11)

| Gap | Status |
|-----|--------|
| §3.3 inner `semantic-export` from expanded context sub-step → parent context port | **Deferred** — seed sentence truncated; outer semantic-export only |
| §3.4 multi-chain (>2) numeric golden fixture | **Deferred** — algorithm stubbed via odd/even chains; no ±1px table yet |
