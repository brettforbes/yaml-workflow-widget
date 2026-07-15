"""E2-S1..S6: Graph Select Language (GSE) evaluator (R7-02).

Normative reference: `.seed/12C_Graph_Select_Language.md`.
"""

from __future__ import annotations

import pytest

from cli_workflow.core.fixtures import load_fixture_graph
from cli_workflow.core.gse_eval import (
    GraphIndex,
    GseEvalError,
    check_related,
    eval_binding,
    eval_select,
)


def node(node_id: str, nugget_id: str, nugget_data: str, **extra) -> dict:
    return {"id": node_id, "nugget_id": nugget_id, "nugget_data": nugget_data, **extra}


def edge(source: str, target: str, relation: str) -> dict:
    return {"source": source, "target": target, "relation": relation}


# ---------------------------------------------------------------------------
# E2-S1 — flat select: match / project / distinct
# ---------------------------------------------------------------------------


class TestFlatSelectMatchProject:
    @pytest.fixture
    def graph(self) -> dict:
        return {
            "nodes": [
                node("d1", "DOMAIN_NAME", "a.com"),
                node("d2", "DOMAIN_NAME", "b.com"),
                node("d3", "DOMAIN_NAME", "b.com"),  # duplicate value, distinct node
                node("h1", "HOST", "host1"),
            ],
            "edges": [],
        }

    def test_nugget_id_match_and_default_project(self, graph):
        env = {"$step.scan_graph": graph}
        binding = {
            "type": "string_list",
            "select": {
                "source": "$step.scan_graph",
                "nodes": {"nugget_id": "DOMAIN_NAME"},
            },
        }
        assert eval_binding(binding, env) == ["a.com", "b.com"]

    def test_nugget_id_in_match(self, graph):
        env = {"$step.scan_graph": graph}
        binding = {
            "type": "string_list",
            "select": {
                "source": "$step.scan_graph",
                "nodes": {"nugget_id_in": ["DOMAIN_NAME", "HOST"]},
                "project": "nugget_data",
            },
        }
        assert eval_binding(binding, env) == ["a.com", "b.com", "host1"]

    def test_nugget_data_equals(self, graph):
        env = {"$step.scan_graph": graph}
        binding = {
            "type": "string_list",
            "select": {
                "source": "$step.scan_graph",
                "nodes": {"nugget_id": "DOMAIN_NAME", "nugget_data_equals": "b.com"},
            },
        }
        assert eval_binding(binding, env) == ["b.com"]

    def test_nugget_data_regex(self, graph):
        env = {"$step.scan_graph": graph}
        binding = {
            "type": "string_list",
            "select": {
                "source": "$step.scan_graph",
                "nodes": {"nugget_id": "DOMAIN_NAME", "nugget_data_regex": "^a"},
            },
        }
        assert eval_binding(binding, env) == ["a.com"]

    def test_distinct_false_preserves_order_and_duplicates(self, graph):
        env = {"$step.scan_graph": graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {"nugget_id": "DOMAIN_NAME"},
            "distinct": False,
        }
        assert eval_select(select, env) == ["a.com", "b.com", "b.com"]

    def test_no_match_returns_empty_list(self, graph):
        env = {"$step.scan_graph": graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {"nugget_id": "PORT"},
        }
        assert eval_select(select, env) == []

    def test_unknown_graph_reference_raises(self, graph):
        env = {"$step.scan_graph": graph}
        select = {"source": "$step.does_not_exist", "nodes": {"nugget_id": "DOMAIN_NAME"}}
        with pytest.raises(GseEvalError):
            eval_select(select, env)


# ---------------------------------------------------------------------------
# E2-S2 — where / related / not / attr (apex vs. subdomain)
# ---------------------------------------------------------------------------


class TestWherePredicates:
    @pytest.fixture
    def domain_graph(self) -> dict:
        return {
            "nodes": [
                node("apex1", "DOMAIN_NAME", "example.com"),
                node("apex2", "DOMAIN_NAME", "another.org"),
                node("sub1", "DOMAIN_NAME", "www.example.com"),
                node("sub2", "DOMAIN_NAME", "api.example.com"),
                node("parent1", "DOMAIN_NAME_PARENT", "example.com"),
                node("parent2", "DOMAIN_NAME_PARENT", "another.org"),
            ],
            "edges": [
                edge("sub1", "parent1", "had"),
                edge("sub2", "parent1", "had"),
            ],
        }

    def test_apex_domains_have_no_outbound_had(self, domain_graph):
        """12C §4.1: apex domains never carry an invented SUBDOMAIN nugget_id."""
        env = {"$step.scan_graph": domain_graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {
                "nugget_id": "DOMAIN_NAME",
                "where": [
                    {
                        "not": {
                            "related": {
                                "direction": "out",
                                "relation": "had",
                                "nugget_id": "DOMAIN_NAME_PARENT",
                            }
                        }
                    }
                ],
            },
        }
        result = eval_select(select, env)
        assert result == ["another.org", "example.com"]
        # ontology-true: no nugget_id in this graph is "SUBDOMAIN"
        assert all(n.get("nugget_id") != "SUBDOMAIN" for n in domain_graph["nodes"])

    def test_child_domains_have_outbound_had_to_parent(self, domain_graph):
        env = {"$step.scan_graph": domain_graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {
                "nugget_id": "DOMAIN_NAME",
                "where": [
                    {
                        "related": {
                            "direction": "out",
                            "relation": "had",
                            "nugget_id": "DOMAIN_NAME_PARENT",
                        }
                    }
                ],
            },
        }
        assert eval_select(select, env) == ["api.example.com", "www.example.com"]

    def test_related_direction_in(self, domain_graph):
        """Incoming direction: parent1 is 'had' by two children."""
        env = {"$step.scan_graph": domain_graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {
                "nugget_id": "DOMAIN_NAME_PARENT",
                "where": [
                    {
                        "related": {
                            "direction": "in",
                            "relation": "had",
                            "nugget_id": "DOMAIN_NAME",
                        }
                    }
                ],
            },
        }
        assert eval_select(select, env) == ["example.com"]

    def test_attr_regex_predicate(self):
        graph = {
            "nodes": [
                node("u1", "LINKED_URL_INTERNAL", "https://a.com/"),
                node("u2", "LINKED_URL_INTERNAL", "a.com"),
            ],
            "edges": [],
        }
        env = {"$step.scan_graph": graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {
                "nugget_id": "LINKED_URL_INTERNAL",
                "where": [
                    {"attr": {"field": "nugget_data", "op": "regex", "value": "^https?://"}}
                ],
            },
        }
        assert eval_select(select, env) == ["https://a.com/"]

    def test_attr_not_predicate(self):
        graph = {
            "nodes": [
                node("u1", "LINKED_URL_INTERNAL", "https://a.com/"),
                node("u2", "LINKED_URL_INTERNAL", "a.com"),
            ],
            "edges": [],
        }
        env = {"$step.scan_graph": graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {
                "nugget_id": "LINKED_URL_INTERNAL",
                "where": [
                    {"not": {"attr": {"field": "nugget_data", "op": "regex", "value": "^https?://"}}}
                ],
            },
        }
        assert eval_select(select, env) == ["a.com"]

    def test_related_with_no_nugget_filter_checks_existence(self, domain_graph):
        env = {"$step.scan_graph": domain_graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {
                "nugget_id": "DOMAIN_NAME",
                "where": [{"related": {"direction": "out", "relation": "had"}}],
            },
        }
        assert eval_select(select, env) == ["api.example.com", "www.example.com"]


# ---------------------------------------------------------------------------
# E2-S3 — reachable_from + transitive walk
# ---------------------------------------------------------------------------


class TestTransitiveReachability:
    @pytest.fixture
    def cascade_graph(self) -> dict:
        return {
            "nodes": [
                node("h1", "HOST", "host1"),
                node("net1", "NETWORKS", "eth0"),
                node("ip1", "IP_ADDRESS", "10.0.0.1"),
            ],
            "edges": [
                edge("h1", "net1", "contains"),
                edge("net1", "ip1", "contains"),
            ],
        }

    def test_index_reachable_multi_hop(self, cascade_graph):
        index = GraphIndex(cascade_graph)
        assert index.reachable("h1", "contains", "out") == {"net1", "ip1"}

    def test_index_neighbors_single_hop_only(self, cascade_graph):
        index = GraphIndex(cascade_graph)
        assert index.neighbors("h1", "contains", "out") == {"net1"}

    def test_check_related_transitive_true_reaches_grandchild(self, cascade_graph):
        index = GraphIndex(cascade_graph)
        host = cascade_graph["nodes"][0]
        spec = {"direction": "out", "relation": "contains", "transitive": True, "nugget_id": "IP_ADDRESS"}
        assert check_related(host, spec, index) is True

    def test_check_related_transitive_false_misses_grandchild(self, cascade_graph):
        index = GraphIndex(cascade_graph)
        host = cascade_graph["nodes"][0]
        spec = {"direction": "out", "relation": "contains", "transitive": False, "nugget_id": "IP_ADDRESS"}
        assert check_related(host, spec, index) is False

    def test_for_each_transitive_reachable_from_reaches_grandchild(self, cascade_graph):
        env = {"$step.scan_graph": cascade_graph}
        select = {
            "source": "$step.scan_graph",
            "for_each": {
                "as": "endpoint",
                "nodes": {"nugget_id": "HOST"},
                "collect": [
                    {
                        "as": "ip",
                        "reachable_from": "endpoint",
                        "along": {"relation": "contains", "transitive": True},
                        "nodes": {"nugget_id": "IP_ADDRESS"},
                        "project": "nugget_data",
                    }
                ],
                "emit": {"values": "ip"},
            },
        }
        assert eval_select(select, env) == ["10.0.0.1"]

    def test_for_each_non_transitive_reachable_from_misses_grandchild(self, cascade_graph):
        env = {"$step.scan_graph": cascade_graph}
        select = {
            "source": "$step.scan_graph",
            "for_each": {
                "as": "endpoint",
                "nodes": {"nugget_id": "HOST"},
                "collect": [
                    {
                        "as": "ip",
                        "reachable_from": "endpoint",
                        "along": {"relation": "contains", "transitive": False},
                        "nodes": {"nugget_id": "IP_ADDRESS"},
                        "project": "nugget_data",
                    }
                ],
                "emit": {"values": "ip"},
            },
        }
        assert eval_select(select, env) == []


# ---------------------------------------------------------------------------
# E2-S4 — for_each + collect + emit (product/join/format, values, empty collect)
# ---------------------------------------------------------------------------


class TestForEachCollectEmit:
    @pytest.fixture
    def endpoints_graph(self) -> dict:
        return {
            "nodes": [
                node("hostA", "HOST", "hostA-data"),
                node("ipA1", "IP_ADDRESS", "10.0.0.1"),
                node("ipA2", "IP_ADDRESS", "10.0.0.2"),
                node("portA1", "PORT", "80"),
                node("portA2", "PORT", "443"),
                # hostB has no IP and no PORT reachable -> empty collect
                node("hostB", "HOST", "hostB-data"),
            ],
            "edges": [
                edge("hostA", "ipA1", "contains"),
                edge("hostA", "ipA2", "contains"),
                edge("hostA", "portA1", "contains"),
                edge("hostA", "portA2", "contains"),
            ],
        }

    def _ip_port_for_each(self) -> dict:
        return {
            "as": "endpoint",
            "nodes": {"nugget_id_in": ["HOST"]},
            "collect": [
                {
                    "as": "ip",
                    "reachable_from": "endpoint",
                    "along": {"relation": "contains", "transitive": True},
                    "nodes": {"nugget_id": "IP_ADDRESS"},
                    "project": "nugget_data",
                },
                {
                    "as": "port",
                    "reachable_from": "endpoint",
                    "along": {"relation": "contains", "transitive": True},
                    "nodes": {"nugget_id": "PORT"},
                    "project": "nugget_data",
                },
            ],
            "emit": {"product": ["ip", "port"], "join": ":"},
        }

    def test_product_join(self, endpoints_graph):
        env = {"$step.scan_graph": endpoints_graph}
        select = {"source": "$step.scan_graph", "for_each": self._ip_port_for_each()}
        result = eval_select(select, env)
        assert result == sorted(
            {"10.0.0.1:80", "10.0.0.1:443", "10.0.0.2:80", "10.0.0.2:443"}
        )

    def test_product_format(self, endpoints_graph):
        env = {"$step.scan_graph": endpoints_graph}
        fe = self._ip_port_for_each()
        fe["emit"] = {"product": ["ip", "port"], "format": "{ip}:{port}"}
        select = {"source": "$step.scan_graph", "for_each": fe}
        result = eval_select(select, env)
        assert result == sorted(
            {"10.0.0.1:80", "10.0.0.1:443", "10.0.0.2:80", "10.0.0.2:443"}
        )

    def test_empty_collect_yields_no_emission_for_that_root(self, endpoints_graph):
        """hostB has no reachable IP/PORT -> contributes zero strings, no error."""
        env = {"$step.scan_graph": endpoints_graph}
        select = {"source": "$step.scan_graph", "for_each": self._ip_port_for_each()}
        result = eval_select(select, env)
        assert all(not value.startswith("hostB") for value in result)
        assert len(result) == 4

    def test_emit_values_single_collect_list(self, endpoints_graph):
        """12A live_hosts shape: emit.values re-emits one collect list, no product."""
        env = {"$step.scan_graph": endpoints_graph}
        select = {
            "source": "$step.scan_graph",
            "for_each": {
                "as": "endpoint",
                "nodes": {"nugget_id": "HOST"},
                "collect": [
                    {
                        "as": "ip",
                        "reachable_from": "endpoint",
                        "along": {"relation": "contains", "transitive": True},
                        "nodes": {"nugget_id": "IP_ADDRESS"},
                        "project": "nugget_data",
                    }
                ],
                "emit": {"values": "ip"},
            },
        }
        result = eval_select(select, env)
        assert result == ["10.0.0.1", "10.0.0.2"]

    def test_emit_referencing_for_each_bind_directly(self, endpoints_graph):
        """emit.product may reference the for_each's own 'as' bind (12C §6)."""
        env = {"$step.scan_graph": endpoints_graph}
        select = {
            "source": "$step.scan_graph",
            "for_each": {
                "as": "endpoint",
                "nodes": {"nugget_id": "HOST", "nugget_data_equals": "hostA-data"},
                "collect": [
                    {
                        "as": "ip",
                        "reachable_from": "endpoint",
                        "along": {"relation": "contains", "transitive": True},
                        "nodes": {"nugget_id": "IP_ADDRESS"},
                        "project": "nugget_data",
                    }
                ],
                "emit": {"product": ["endpoint", "ip"], "join": "/"},
            },
        }
        result = eval_select(select, env)
        assert result == sorted({"hostA-data/10.0.0.1", "hostA-data/10.0.0.2"})

    def test_nested_for_each_scopes_descendant_reachability(self):
        """12C §6: nested for_each; inner collect scoped under the ip bind, not the host."""
        graph = {
            "nodes": [
                node("h1", "HOST", "h1-data"),
                node("ip1", "IP_ADDRESS", "10.0.0.1"),
                node("ip2", "IP_ADDRESS", "10.0.0.2"),
                node("port_ip1", "PORT", "80"),  # only reachable from ip1, not ip2
            ],
            "edges": [
                edge("h1", "ip1", "contains"),
                edge("h1", "ip2", "contains"),
                edge("ip1", "port_ip1", "contains"),
            ],
        }
        env = {"$step.scan_graph": graph}
        select = {
            "source": "$step.scan_graph",
            "for_each": {
                "as": "endpoint",
                "nodes": {"nugget_id": "HOST"},
                "for_each": {
                    "as": "ip",
                    "reachable_from": "endpoint",
                    "along": {"relation": "contains", "transitive": True},
                    "nodes": {"nugget_id": "IP_ADDRESS"},
                    "collect": [
                        {
                            "as": "port",
                            "reachable_from": "ip",
                            "along": {"relation": "contains", "transitive": True},
                            "nodes": {"nugget_id": "PORT"},
                            "project": "nugget_data",
                        }
                    ],
                    "emit": {"product": ["ip", "port"], "join": ":"},
                },
            },
        }
        result = eval_select(select, env)
        assert result == ["10.0.0.1:80"]

    def test_unbound_reachable_from_raises(self, endpoints_graph):
        env = {"$step.scan_graph": endpoints_graph}
        select = {
            "source": "$step.scan_graph",
            "for_each": {
                "as": "endpoint",
                "nodes": {"nugget_id": "HOST"},
                "collect": [
                    {
                        "as": "ip",
                        "reachable_from": "not_a_bind",
                        "along": {"relation": "contains", "transitive": True},
                        "nodes": {"nugget_id": "IP_ADDRESS"},
                    }
                ],
                "emit": {"values": "ip"},
            },
        }
        with pytest.raises(GseEvalError):
            eval_select(select, env)


# ---------------------------------------------------------------------------
# E2-S5 — union / literal / from_var / distinct
# ---------------------------------------------------------------------------


class TestUnionLiteralFromVar:
    def test_union_dedups_and_sorts(self):
        env = {
            "$step.vars.apex_domains": ["b.com", "a.com"],
            "$step.vars.subdomains": ["a.com", "c.example.com"],
        }
        binding = {
            "type": "string_list",
            "union": ["$step.vars.apex_domains", "$step.vars.subdomains"],
        }
        assert eval_binding(binding, env) == ["a.com", "b.com", "c.example.com"]

    def test_union_distinct_false_preserves_order(self):
        env = {
            "$step.vars.a": ["b", "a"],
            "$step.vars.b": ["a", "c"],
        }
        binding = {
            "type": "string_list",
            "union": ["$step.vars.a", "$step.vars.b"],
            "distinct": False,
        }
        assert eval_binding(binding, env) == ["b", "a", "a", "c"]

    def test_literal(self):
        binding = {"type": "string_list", "literal": ["z", "a", "a"]}
        assert eval_binding(binding, {}) == ["a", "z"]

    def test_literal_distinct_false(self):
        binding = {"type": "string_list", "literal": ["z", "a", "a"], "distinct": False}
        assert eval_binding(binding, {}) == ["z", "a", "a"]

    def test_from_var_alias(self):
        env = {"$steps.sfp_cli_subfinder.vars.all_domains": ["b.com", "a.com"]}
        binding = {
            "type": "string_list",
            "from_var": "$steps.sfp_cli_subfinder.vars.all_domains",
        }
        assert eval_binding(binding, env) == ["a.com", "b.com"]

    def test_unknown_var_reference_raises(self):
        binding = {"type": "string_list", "from_var": "$step.vars.missing"}
        with pytest.raises(GseEvalError):
            eval_binding(binding, {})

    def test_binding_missing_shape_raises(self):
        with pytest.raises(GseEvalError):
            eval_binding({"type": "string_list"}, {})


# ---------------------------------------------------------------------------
# E2-S6 — corpus-shaped fixtures (R7-02-03, R7-05-01)
# ---------------------------------------------------------------------------


class TestCorpusFixtures:
    def test_nmap_fixture_yields_non_empty_ip_port_list(self):
        """Program AC #1: GSE cascade yields non-empty ip:port from nmap fixture."""
        graph = load_fixture_graph("nmap_sample")
        env = {"$step.scan_graph": graph}
        select = {
            "source": "$step.scan_graph",
            "for_each": {
                "as": "endpoint",
                "nodes": {"nugget_id_in": ["HOST", "SYSTEM", "DEVICE", "CDN", "SERVER"]},
                "collect": [
                    {
                        "as": "ip",
                        "reachable_from": "endpoint",
                        "along": {"relation": "contains", "transitive": True},
                        "nodes": {"nugget_id_in": ["IP_ADDRESS", "IPV6_ADDRESS"]},
                        "project": "nugget_data",
                    },
                    {
                        "as": "port",
                        "reachable_from": "endpoint",
                        "along": {"relation": "contains", "transitive": True},
                        "nodes": {"nugget_id": "PORT"},
                        "project": "nugget_data",
                    },
                ],
                "emit": {"product": ["ip", "port"], "join": ":"},
            },
            "distinct": True,
        }
        result = eval_select(select, env)
        assert len(result) > 0
        expected = {
            "10.0.0.5:22",
            "10.0.0.5:80",
            "10.0.0.5:443",
            "10.0.0.6:22",
            "10.0.0.6:80",
            "10.0.0.6:443",
            "192.168.1.10:8080",
        }
        assert set(result) == expected
        # host--gamma (no reachable IP/PORT) contributes nothing
        assert not any("gamma" in v for v in result)

    def test_subfinder_fixture_apex_and_subdomains(self):
        """12A shape: apex_domains / subdomains via DOMAIN_NAME + DOMAIN_NAME_PARENT."""
        graph = load_fixture_graph("subfinder_sample")
        env = {"$step.scan_graph": graph}

        apex_select = {
            "source": "$step.scan_graph",
            "nodes": {
                "nugget_id": "DOMAIN_NAME",
                "where": [
                    {
                        "not": {
                            "related": {
                                "direction": "out",
                                "relation": "had",
                                "nugget_id": "DOMAIN_NAME_PARENT",
                            }
                        }
                    }
                ],
            },
            "project": "nugget_data",
            "distinct": True,
        }
        subdomain_select = {
            "source": "$step.scan_graph",
            "nodes": {
                "nugget_id": "DOMAIN_NAME",
                "where": [
                    {
                        "related": {
                            "direction": "out",
                            "relation": "had",
                            "nugget_id": "DOMAIN_NAME_PARENT",
                        }
                    }
                ],
            },
            "project": "nugget_data",
            "distinct": True,
        }

        apex = eval_select(apex_select, env)
        subdomains = eval_select(subdomain_select, env)

        assert apex == ["another.org", "example.com"]
        assert subdomains == ["api.example.com", "shop.another.org", "www.example.com"]
        # ontology-true: neither result set came from a fictional SUBDOMAIN nugget_id
        assert all(n.get("nugget_id") != "SUBDOMAIN" for n in graph["nodes"])
        # all_domains union (12A shape)
        union_binding = {
            "type": "string_list",
            "union": ["$step.vars.apex_domains", "$step.vars.subdomains"],
            "distinct": True,
        }
        union_env = {
            "$step.vars.apex_domains": apex,
            "$step.vars.subdomains": subdomains,
        }
        all_domains = eval_binding(union_binding, union_env)
        assert all_domains == sorted(set(apex) | set(subdomains))

    def test_tiny_id_variants_fixture_supports_nugget_instance_id(self):
        graph = load_fixture_graph("tiny_id_variants")
        env = {"$step.scan_graph": graph}
        select = {
            "source": "$step.scan_graph",
            "nodes": {"nugget_id": "IP_ADDRESS"},
            "project": "nugget_data",
        }
        assert eval_select(select, env) == ["1.2.3.4"]
