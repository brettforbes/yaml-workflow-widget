# Graph Select Language (GSE) v1

**Status:** design contract for SPEC-007  
**Operates on:** SpiderFeet scan graphs `{ "nodes": [...], "edges": [...] }`  
**Purpose:** Declarative extraction of **string lists** (and later typed lists) from scan graphs for CLI workflow chaining.

This language replaces informal sketch expressions such as `concat({{IP_ADDRESS}}, ":", {{PORT}})` and `{{DOMAIN_NAME}}`, which cannot express scoped cascade walks.

---

## 1. Graph data contract (input)

Every scan graph must satisfy the corpus graph shape:

| Field | Location | Role |
|-------|----------|------|
| `id` / `nugget_instance_id` | node | Stable node identity |
| `nugget_id` | node | Archetype (`HOST`, `IP_ADDRESS`, `PORT`, …) |
| `nugget_data` | node | Scalar value used for CLI chaining |
| `source`, `target`, `relation` | edge | `contains` \| `had` \| `listens-to` |

GSE **never** parses native CLI text. It only reads nodes/edges.

**Transitive `contains`:** walking `along: contains` with `transitive: true` follows any length path of `contains` edges (e.g. `HOST → NETWORKS → IP_ADDRESS`, `HOST → TRANSPORT → PORT`).

---

## 2. Design principles

1. **YAML-native AST** — no embedded mini-language strings. Every operator is a YAML mapping/list so Langium can map 1:1 later.
2. **Scoped cascades** — nested `for_each` binds an ancestor; nested collects are restricted to descendants of that ancestor.
3. **Cartesian product under a scope** — `emit.product` joins sibling collections under the same `for_each` bind (host × ip × port).
4. **Project to scalars** — CLI tools consume string lists; default project field is `nugget_data`.
5. **Ontology-true** — `nugget_id` values must exist in `nuggets.json` / `nuggets_extension.json`. Do not invent `SUBDOMAIN` if graphs emit `DOMAIN_NAME` + `DOMAIN_NAME_PARENT`.
6. **Deterministic** — sorted unique output unless `distinct: false`.

---

## 3. Top-level select shapes

A variable binding uses exactly one of:

| Shape | Use |
|-------|-----|
| `select` | Query the scan graph (or another graph variable) |
| `union` | Concatenate existing string-list variables |
| `literal` | Constant list |
| `from_var` | Alias / copy another variable |

```yaml
# Shape A — select
domains:
  type: string_list
  select:
    source: $step.scan_graph
    nodes:
      nugget_id: DOMAIN_NAME
    project: nugget_data
    distinct: true

# Shape B — union
all_domains:
  type: string_list
  union:
    - $step.vars.domains
    - $step.vars.subdomains
  distinct: true

# Shape C — from prior step
hosts_in:
  type: string_list
  from_var: $steps.subfinder_enum.vars.all_domains
```

---

## 4. Node match predicates

Under `nodes:` (or nested collect `nodes:`):

| Key | Meaning |
|-----|---------|
| `nugget_id` | Exact archetype match |
| `nugget_id_in` | Any of listed archetypes |
| `nugget_data_equals` | Exact value match |
| `nugget_data_regex` | Regex against `nugget_data` |
| `where` | List of relational/value predicates (AND) |

### 4.1 `where` predicates

```yaml
where:
  # Outgoing related node exists
  - related:
      direction: out          # out | in
      relation: had           # contains | had | listens-to
      transitive: false
      nugget_id: DOMAIN_NAME_PARENT

  # Incoming related node exists
  - related:
      direction: in
      relation: contains
      transitive: true
      nugget_id_in: [HOST, SYSTEM, DEVICE, CDN]

  # Attribute compare on the matched node itself
  - attr:
      field: nugget_data
      op: regex
      value: "^https?://"
```

**Example — apex vs child domains (subfinder reality):**

Subfinder graphs emit `DOMAIN_NAME` for both apex and children. Children typically `had` a `DOMAIN_NAME_PARENT`.

```yaml
apex_domains:
  type: string_list
  select:
    source: $step.scan_graph
    nodes:
      nugget_id: DOMAIN_NAME
      where:
        - not:
            related:
              direction: out
              relation: had
              nugget_id: DOMAIN_NAME_PARENT
    project: nugget_data

subdomains:
  type: string_list
  select:
    source: $step.scan_graph
    nodes:
      nugget_id: DOMAIN_NAME
      where:
        - related:
            direction: out
            relation: had
            nugget_id: DOMAIN_NAME_PARENT
    project: nugget_data
```

---

## 5. Cascade / nested selection (`for_each`)

This is the formalisation of:

```text
for each HOST
  for each IP under that HOST
    for each PORT under that HOST
      emit IP + ":" + PORT
```

```yaml
ip_port_list:
  type: string_list
  select:
    source: $step.scan_graph
    for_each:
      as: endpoint
      nodes:
        nugget_id_in: [HOST, SYSTEM, DEVICE, CDN, SERVER]
      collect:
        - as: ip
          reachable_from: endpoint
          along:
            relation: contains
            transitive: true
          nodes:
            nugget_id_in: [IP_ADDRESS, IPV6_ADDRESS]
          project: nugget_data
        - as: port
          reachable_from: endpoint
          along:
            relation: contains
            transitive: true
          nodes:
            nugget_id: PORT
          project: nugget_data
      emit:
        product: [ip, port]
        join: ":"
    distinct: true
```

### Semantics

1. Resolve all `endpoint` nodes matching `nodes`.
2. For each `endpoint` independently:
   - Resolve each `collect` entry as a **list of projected scalars** restricted to nodes reachable from that endpoint.
   - Apply `emit.product` as the Cartesian product of those lists.
   - Join product tuples with `emit.join` (or `emit.format`).
3. Flatten all endpoint products into one list.
4. Apply `distinct` / sort.

Empty collect under an endpoint → no emissions for that endpoint (not an error).

### `reachable_from`

| Field | Required | Meaning |
|-------|----------|---------|
| `reachable_from` | yes | Bind name from enclosing `for_each.as` |
| `along.relation` | yes | Edge relation to walk |
| `along.transitive` | no (default false) | Follow multi-hop paths |
| `along.direction` | no (default `out`) | `out` = source→target, `in` = reverse |

### `emit` forms

| Form | Meaning |
|------|---------|
| `product` + `join` | Cartesian product; join parts with separator |
| `product` + `format` | Cartesian product; `{name}` placeholders |
| `values` | Emit a single collect list (no product) |

```yaml
emit:
  product: [ip, port]
  format: "{ip}:{port}"
```

---

## 6. Multi-level cascade

Nest `for_each` when intermediate entities matter:

```yaml
# HOST → IP → PORT where PORT must be under same HOST as IP
# (equivalent to single for_each + product when both are descendants of HOST)
select:
  source: $step.scan_graph
  for_each:
    as: endpoint
    nodes: { nugget_id_in: [HOST, SYSTEM, DEVICE] }
    for_each:
      as: ip
      reachable_from: endpoint
      along: { relation: contains, transitive: true }
      nodes: { nugget_id: IP_ADDRESS }
      collect:
        - as: port
          reachable_from: endpoint
          along: { relation: contains, transitive: true }
          nodes: { nugget_id: PORT }
          project: nugget_data
      emit:
        product: [ip, port]   # ip here is the for_each bind's nugget_data
        join: ":"
```

Prefer the flatter single-`for_each` + dual `collect` form when all leaves share one ancestor.

---

## 7. Source references

| Reference | Resolves to |
|-----------|-------------|
| `$step.scan_graph` | Graph produced by the current step |
| `$steps.<step_id>.scan_graph` | Graph from a completed step |
| `$workflow.context` | Accumulated context graph (nodes+edges union) |
| `$workflow.inputs.<name>` | Workflow input string list (not a graph) |

`source` on `select` must be a **graph**. List sources use `from_var` / `union` instead.

---

## 8. Evaluation algorithm (normative)

```
eval_select(select, env):
  graph = resolve_graph(select.source, env)
  index = build_adjacency(graph)  # out/in by relation

  if select.for_each:
    return eval_for_each(select.for_each, graph, index, env)
  else:
    nodes = match_nodes(graph.nodes, select.nodes, index, scope=None)
    values = [project(n, select.project) for n in nodes]
    return finalize(values, select.distinct)

eval_for_each(fe, graph, index, env):
  roots = match_nodes(graph.nodes, fe.nodes, index, scope=None)
  out = []
  for root in roots:
    binds = {}
    for c in fe.collect:
      scoped = reachable(root, c.along, index)
      matched = match_nodes(scoped, c.nodes, index, scope=root)
      binds[c.as] = [project(n, c.project) for n in matched]
    out.extend(emit_product(fe.emit, binds, root))
  if fe.for_each:  # nested
    ...
  return finalize(out, distinct)
```

`reachable` with `transitive: true` is BFS/DFS over edges of the given relation only (do not mix `contains` and `had` in one walk unless `along.relations: [contains, had]` is specified — v1 allows a single relation).

---

## 9. Forbidden / deferred (v1)

| Forbidden | Why |
|-----------|-----|
| Selecting from native CLI text | Structured-first / graph-mandatory |
| Cypher / SPARQL string embeds | Breaks Langium 1:1 AST goal |
| Mutating the scan graph inside `select` | GSE is read-only projection |
| Implicit global Cartesian across unrelated hosts | Must use `for_each` scope |

| Deferred to later SPEC | Notes |
|------------------------|-------|
| Typed list outputs (`ip_port_pair` objects) | v1 = `string_list` only |
| Writing derived nodes back into graph | Context UI work |
| Aggregation (`count`, `group_by`) | Not needed for CLI chaining v1 |

---

## 10. Worked examples tied to corpus graphs

### 10.1 Nmap → `ip:port` list

Uses real topology: `HOST contains NETWORKS contains IP_ADDRESS`; `HOST contains TRANSPORT contains PORT` (and/or `APPLICATIONS → SERVICE listens-to PORT`). Transitive `contains` from `HOST` reaches both `IP_ADDRESS` and `PORT`.

Fixture to validate:  
`.docs/docs-for-cli-tools/nugget_structure/nmap_tcp_top_ports_permissive_proposed_nuggets_edges.json`

### 10.2 Subfinder → domain lists

Fixture:  
`.docs/docs-for-cli-tools/nugget_structure/subfinder_corporate_upside_au_passive_cs_proposed_nuggets_edges.json`

Use `DOMAIN_NAME` + `DOMAIN_NAME_PARENT` predicates — **not** a fictional `SUBDOMAIN` nugget_id.

### 10.3 httpx → live URL / host list

Emit `DOMAIN_NAME` or `HOST` `nugget_data` values that have successful probe descriptors (e.g. related `HTTP_STATUS_CODE` via `contains`/`had` under the same host tree). Exact filter is tool-pack specific; workflow YAML must name real `nugget_id`s from the httpx structure doc.

---

## 11. JSON Schema

Machine schema: `.seed/scripts/cli_workflow/schema/gse_v1.schema.json`  
Workflow embedding: variables under `steps[].output.vars.*` must validate as GSE binding objects.
