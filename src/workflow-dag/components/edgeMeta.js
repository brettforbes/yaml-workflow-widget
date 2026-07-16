/** Diagram edge kinds (SPEC-012). YAML field `uses: tool.*` is unrelated. */
export const EDGE_TYPE = {
  FOLLOWS: "follows",
  USED_BY: "used-by",
  SEMANTIC: "semantic-subgraph",
};

/** Colorblind-safe Okabe–Ito inspired palettes */
export const EDGE_COLORS = {
  light: {
    [EDGE_TYPE.FOLLOWS]: "#0072B2",
    [EDGE_TYPE.USED_BY]: "#E69F00",
    [EDGE_TYPE.SEMANTIC]: "#009E73",
  },
  dark: {
    [EDGE_TYPE.FOLLOWS]: "#56B4E9",
    [EDGE_TYPE.USED_BY]: "#F0E442",
    [EDGE_TYPE.SEMANTIC]: "#3DDBA8",
  },
};

export const EDGE_MONO = {
  light: "#666666",
  dark: "#aaaaaa",
};

export function edgeKey(sourceId, targetId) {
  return `${sourceId}->${targetId}`;
}

/**
 * Default: every Nice-DAG dependency edge is `follows`.
 * E2-S5 upgrades some to `used-by`; E2-S6 adds `semantic-subgraph`.
 */
export function buildEdgeMetaFromNodes(nodes) {
  const meta = new Map();
  const walk = (list) => {
    for (const n of list || []) {
      for (const dep of n.dependencies || []) {
        meta.set(edgeKey(dep, n.id), EDGE_TYPE.FOLLOWS);
      }
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return meta;
}

export function resolveEdgeColor(edgeType, theme, colored) {
  const t = theme === "dark" ? "dark" : "light";
  if (!colored) return EDGE_MONO[t];
  return EDGE_COLORS[t][edgeType] || EDGE_MONO[t];
}
