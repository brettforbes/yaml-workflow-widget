# GSE test fixtures (E2-S6)

## Provenance

Real corpus `*_proposed_nuggets_edges.json` files (SPEC-006 structure docs) are
not vendored into this workspace (Assumption A4 in
`.seed/SPEC-007-AGENT-PLAN.md`). These fixtures are **synthetic**, hand-built
to mirror the corpus graph shape documented in `.seed/12C_Graph_Select_Language.md`
§1 and the tool-specific topology notes in §10:

- node identity: `id` (fallback `nugget_instance_id`)
- node archetype: `nugget_id` (ontology-true values only — no invented types)
- node value: `nugget_data`
- edge shape: `source`, `target`, `relation`

No `nugget_id` value here is invented; all match the archetypes named in 12C
(`DOMAIN_NAME`, `DOMAIN_NAME_PARENT`, `HOST`, `NETWORKS`, `IP_ADDRESS`,
`TRANSPORT`, `PORT`). If/when real corpus graphs are vendored, these fixtures
should be swapped or supplemented — the GSE evaluator itself makes no
assumptions beyond the documented graph contract.

## Files

### `subfinder_sample.json`

Mirrors 12C §4.1 / §10.2 (subfinder apex vs. child domain reality):

- 2 apex `DOMAIN_NAME` nodes (`example.com`, `another.org`) with **no**
  outbound `had` edge.
- 3 child `DOMAIN_NAME` nodes (`www.example.com`, `api.example.com`,
  `shop.another.org`) each with an outbound `had` edge to a
  `DOMAIN_NAME_PARENT` node.
- Deliberately has **no** `SUBDOMAIN` nugget — that archetype does not exist
  in the ontology (R7-02-03 / 12C §2.5).

Used for: flat select, `where.related` / `where.not.related` apex-vs-child
predicates.

### `nmap_sample.json`

Mirrors 12C §10.1 (`HOST → NETWORKS → IP_ADDRESS`, `HOST → TRANSPORT → PORT`,
both via transitive `contains`):

- `host--alpha`: 2 `IP_ADDRESS` × 3 `PORT` reachable via transitive
  `contains` (exercises `for_each` + `collect` + `emit.product`/`join`
  cardinality > 1).
- `host--beta`: 1 IP × 1 PORT (single-combo case).
- `host--gamma`: has a `NETWORKS` child but **no** reachable `IP_ADDRESS` or
  `PORT` at all — exercises "empty collect under a root → no emissions for
  that root" (12C §5, "Semantics" step 2).

Used for: transitive reachability, cascade `for_each`/`collect`/`emit`.

### `tiny_id_variants.json`

Minimal 2-node/1-edge graph using `nugget_instance_id` instead of `id`, to
exercise the node-identity fallback (12C §1) and a single-hop (non-transitive)
`contains` walk independent of the larger fixtures.

### `httpx_sample.json`

Dry-run fixture for 12A `httpx_live` (`live_hosts` cascade): `HOST`/`CDN`
roots with transitive `contains` to `DOMAIN_NAME` + `HTTP_STATUS_CODE`, plus
one HOST without status (no emit).

### `katana_sample.json`

Dry-run fixture for 12A `katana_crawl` (`crawl_urls`): `LINKED_URL_INTERNAL`,
`LINKED_URL_EXTERNAL`, and a `DOMAIN_NAME` fallback node.

### `nerva_sample.json` / `nuclei_sample.json`

Minimal unique-node graphs so dry-run context export merges are observable
for `nerva_services` / `nuclei_vulns` (no GSE vars in 12A for these steps).
