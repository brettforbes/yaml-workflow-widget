# CLI App Sequencing — Workflow DSL Description (v1)

**Companion docs**

| Doc | Role |
|-----|------|
| [12A_Workflow_YAML_Example.yaml](12A_Workflow_YAML_Example.yaml) | Canonical example workflow (corrected) |
| [12C_Graph_Select_Language.md](12C_Graph_Select_Language.md) | Graph Select Language (GSE) for output variables |
| [SPEC007_SKETCH_GAP_NOTES.md](../.governance/project/SPEC007_SKETCH_GAP_NOTES.md) | Sketch → v1 defect inventory (review before schema/GSE changes) |
| [SPEC-007](../.governance/specs/SPEC-007-cli-workflow-dsl.md) | Implementation requirements |
| [SPEC-007 agent plan](../.governance/specs/SPEC-007-AGENT-PLAN.md) | Epics / stories / GitHub issue map |

This document is the **logic master** for the Workflow YAML DSL. The example YAML must encode everything described here. Informal sketch expressions such as `concat({{IP_ADDRESS}}, ":", {{PORT}})` are **invalid** — use GSE (12C).

---

## 1. Aim

Design a DSL that defines, for any scanning operation (CLI app now; SpiderFeet API / `sfp_*` modules later):

1. **Inputs** — string lists (or empty) feeding a step
2. **Config** — argv templates, auto input/output files, tool options
3. **Output variables** — GSE projections from the step’s scan graph into named string lists for downstream steps
4. **Context export** — whether the step’s full `{nodes, edges}` is merged into the investigation context graph

The DSL is the **interface standard** between tools. Tool-specific code only:

- runs the CLI / API
- converts structured capture → scan graph (existing SPEC-004 adapters)
- maps GSE string lists ↔ tool-specific argv / `-l` files

New tools onboard **without** changing the DSL grammar.

---

## 2. Background — single CLI step

### 2.1 Inputs

Most tools take:

- one nugget value, or a **list** of values (`DOMAIN_NAME`, `INTERNET_NAME`, `IP_ADDRESS`, …)
- occasionally a **paired** value (`IP_ADDRESS:PORT`) as one string or a list of such strings
- rarely **no** input (LAN discovery)

Lists are the interchange type. Pairing is a **string convention** produced by GSE (`emit.join`), not a separate YAML type in v1.

### 2.2 Input files

Some CLIs require a file (`-l`, `-oJ` host lists). The DSL supports:

| Mode | Behaviour |
|------|-----------|
| `auto` | Runtime writes a temp file from the bound string list; path injected into argv |
| `path` | Explicit path (UI / operator supplied) |

### 2.3 Command line

One argv template per step. Placeholders resolve from:

- `$step.files.input` / `$step.files.output` (auto temps)
- `$step.input.values` (rarely inlined; prefer files for large lists)
- `$workflow.inputs.*`

### 2.4 Output = scan graph + GSE variables

Every step produces a **scan graph** via the existing adapter path (`nodes` + `edges`).  
Output **variables** are **not** free-form templates over nugget names. They are **GSE select/union** expressions (see 12C) that:

- walk `contains` / `had` / `listens-to`
- support nested / cascade scopes (`for_each`)
- project `nugget_data` into `string_list` variables

Example cascade (nmap → nerva):

```text
for each HOST|SYSTEM|DEVICE|CDN
  collect IPs reachable via contains*
  collect PORTs reachable via contains*
  emit cartesian IP:PORT pairs
```

### 2.5 Context

| `context.export` | Meaning |
|------------------|---------|
| `scan_graph` | Merge this step’s full `nodes` + `edges` into `$workflow.context` |
| `none` / omitted | Interim step — variables may still flow; graph does not enter context |

v1 context merge = **append unique nodes by id + append unique edges by (source,target,relation)**. No UI connect/disconnect yet.

---

## 3. Example workflow intent (attack surface)

Two logical chains after subdomain enum:

```text
subfinder_enum ─┬─► nmap_ports ─► nerva_services        (ports/services → context)
                └─► httpx_live ─► katana_crawl ─► nuclei_vulns
                      (httpx/katana interim; nuclei → context)
```

| Step id | Tool | Context export | Downstream vars |
|---------|------|----------------|-----------------|
| `subfinder_enum` | subfinder | yes | `apex_domains`, `subdomains`, `all_domains` |
| `nmap_ports` | nmap | yes | `ip_port_list` |
| `nerva_services` | nerva | yes | (none required) |
| `httpx_live` | httpx | no | `live_hosts` |
| `katana_crawl` | katana | no | `crawl_urls` |
| `nuclei_vulns` | nuclei | yes | (none required) |

**Ontology note (sketch fix):** There is no `SUBDOMAIN` nugget in `nuggets.json`. Subfinder emits `DOMAIN_NAME` (+ `DOMAIN_NAME_PARENT` for children). GSE must filter on that reality — see 12C §4.1.

Tool ids in v1 are **adapter tool names** (`subfinder`, `nmap`, …), not `sfp_*`. A later epic maps `uses: tool.subfinder` → `sfp_tool_subfinder` without changing workflow authoring.

---

## 4. Workflow document structure

### 4.1 Header

```yaml
apiVersion: spiderfeet.workflow/v1
kind: Workflow
id: workflow--1c51e712-b5b5-4ef2-9967-e11debbcc607
```

`id` = `workflow--` + UUID4.

### 4.2 `info`

```yaml
info:
  name: Recon Attack Surface
  description: Recon the attack surface of a target domain.
  author: Modeller
  created: "2026-07-07T21:58:32+10:00"
```

Human metadata only. Machine start/targets live under `inputs` + `steps` + `needs` DAG (not a flat `modules`/`start` list — those are derived).

### 4.3 `inputs`

```yaml
inputs:
  targets:
    type: string_list
    description: Seed domains or URLs
    default:
      - https://example.com
```

Runtime may override `default`. Normalization (URL → hostname) is declared on the consuming step’s `input.normalize`.

### 4.4 `steps` (DAG)

Each step:

| Field | Required | Meaning |
|-------|----------|---------|
| `id` | yes | Unique step id (variable namespace) |
| `uses` | yes | `tool.<adapter_id>` |
| `needs` | no | List of step ids that must complete first |
| `input` | yes | How string-list values are bound |
| `config` | yes | Argv + temp files |
| `output.vars` | no | Named GSE bindings |
| `context.export` | no | `scan_graph` or omit |

Parallelism: steps with disjoint `needs` may run concurrently once dependencies complete.

### 4.5 `input` block

```yaml
input:
  type: string_list
  from: $workflow.inputs.targets          # or $steps.<id>.vars.<name>
  normalize: hostname_from_url            # optional enum
  empty: error                            # error | skip_step | continue
```

### 4.6 `config` block

```yaml
config:
  argv:
    - "-d"
    - "$step.input.values[0]"             # single-value tools
    # OR file-oriented:
    # - "-l"
    # - "$step.files.input"
    - "-oJ"
    - "-cs"
    - "-o"
    - "$step.files.output"
    - "-silent"
  files:
    input:
      mode: auto                          # auto | none
      format: line_text                   # one value per line
    output:
      mode: auto
      format: jsonl                       # tool-native structured
  capture:
    family: structured_native             # same families as cli_corpus
    adapter: subfinder                    # SPEC-004 adapter id
```

**Rules**

- Prefer argv **list** form (AST-friendly) over a single shell string.
- Always capture **structured** output when the tool supports it (proj-06 structured-first).
- `adapter` names the existing graph builder; workflow runtime does not re-implement mapping YAML.

### 4.7 `output.vars` block

Each key is a variable name. Value is a GSE binding (`select` | `union` | `from_var` | `literal`). See 12C.

Variables are addressed downstream as `$steps.<step_id>.vars.<name>`.

### 4.8 `context` block

```yaml
context:
  export: scan_graph    # full nodes[] + edges[] into $workflow.context
```

---

## 5. Per-step logic (example workflow)

### 5.1 `subfinder_enum`

- **Input:** `$workflow.inputs.targets` → normalize hostname
- **Config:** subfinder JSONL → adapter `subfinder`
- **Output vars:**
  - `apex_domains` — `DOMAIN_NAME` without `DOMAIN_NAME_PARENT`
  - `subdomains` — `DOMAIN_NAME` with `DOMAIN_NAME_PARENT`
  - `all_domains` — union of both
- **Context:** export scan graph

### 5.2 `nmap_ports`

- **Input:** `$steps.subfinder_enum.vars.all_domains`
- **Config:** nmap `-oX` → adapter `nmap`
- **Output vars:**
  - `ip_port_list` — GSE `for_each` endpoint → product `IP` × `PORT` joined by `:`
- **Context:** export

### 5.3 `nerva_services`

- **Input:** `$steps.nmap_ports.vars.ip_port_list`
- **Config:** nerva `--json` → adapter `nerva`
- **Output vars:** none required for this example
- **Context:** export

### 5.4 `httpx_live`

- **Input:** `$steps.subfinder_enum.vars.all_domains`
- **Config:** httpx JSON → adapter `httpx`
- **Output vars:**
  - `live_hosts` — host/domain values under successful probes (GSE with `where` on status/liveness)
- **Context:** none (interim)

### 5.5 `katana_crawl`

- **Input:** `$steps.httpx_live.vars.live_hosts`
- **Config:** katana JSON → adapter `katana`
- **Output vars:**
  - `crawl_urls` — URL-bearing `nugget_data` values from crawl graph (exact `nugget_id`s per katana structure doc)
- **Context:** none (interim)

### 5.6 `nuclei_vulns`

- **Input:** `$steps.katana_crawl.vars.crawl_urls`
- **Config:** nuclei JSONL → adapter `nuclei`
- **Context:** export

---

## 6. Runtime data plane (v1)

```text
WorkflowDocument (YAML)
    → Loader + JSON Schema validate
    → DAG scheduler
         → for each step:
              resolve input string_list
              materialize auto files
              invoke tool driver (CLI)
              adapter: structured → scan_graph
              GSE eval → step.vars
              optional context merge
    → Result bundle:
         steps[id].scan_graph
         steps[id].vars
         workflow.context   # merged graphs
```

Interchange list encoding for files: UTF-8, one value per line, no shell quoting inside values. Drivers that need CSV/JSON arrays transform at the tool boundary.

---

## 7. Gaps fixed vs original sketch (12A)

**Full inventory:** [SPEC007_SKETCH_GAP_NOTES.md](../.governance/project/SPEC007_SKETCH_GAP_NOTES.md) (per-step table + archived invalid sketch).

| Sketch problem | v1 fix |
|----------------|--------|
| `concat({{IP_ADDRESS}}, ":", {{PORT}})` ignores host scope | GSE `for_each` + `product` |
| `{{DOMAIN_NAME}}` / `{{SUBDOMAIN}}` | Match + `where related` on real nugget ids |
| `sum(...)` | `union` |
| Flat `sequence` with broken YAML indent | `steps` list + `needs` DAG |
| `sfp_*` before adapters exist | `uses: tool.<adapter_id>` |
| `cli_options` shell string | `config.argv` list + file placeholders |
| Implicit `{{scan_graph}}` | `context.export: scan_graph` |
| Linear only | Parallel branches via `needs` |
| Targets as URLs for hostname tools | `normalize: hostname_from_url` |

---

## 8. Non-goals (this phase)

- Langium grammar / Monaco editor (phase 2)
- Visual schematic + AST sync (phases 3–4)
- Context force-graph UI connect/disconnect/delete
- Rewriting legacy `sfp_*` EVENT listeners
- Inventing Nexus or new ontology nuggets for convenience

---

## 9. Acceptance for the DSL design itself

1. 12A validates against `workflow_v1.schema.json`
2. Every `output.vars` entry is valid GSE (`gse_v1.schema.json`)
3. GSE cascade example evaluates against a real nmap corpus graph and yields `ip:port` strings
4. Subfinder GSE example evaluates against a real subfinder corpus graph without referencing `SUBDOMAIN`
5. SPEC-007 agent plan decomposes implementation so lesser agents can land loader → GSE → runtime → example E2E without redesigning the language
