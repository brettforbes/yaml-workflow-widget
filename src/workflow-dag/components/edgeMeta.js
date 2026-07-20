/** Diagram edge kinds (SPEC-012). YAML field `uses: tool.*` is unrelated. */
export const EDGE_TYPE = {
  FOLLOWED_BY: "followed-by",
  USED_BY: "used-by",
  SEMANTIC_EXPORT: "semantic-export",
};

/** @deprecated use EDGE_TYPE.FOLLOWED_BY */
export const LEGACY_FOLLOWS = "follows";
/** @deprecated use EDGE_TYPE.SEMANTIC_EXPORT */
export const LEGACY_SEMANTIC = "semantic-subgraph";

/** Colorblind-safe Okabe–Ito inspired palettes */
export const EDGE_COLORS = {
  light: {
    [EDGE_TYPE.FOLLOWED_BY]: "#0072B2",
    [EDGE_TYPE.USED_BY]: "#E69F00",
    [EDGE_TYPE.SEMANTIC_EXPORT]: "#009E73",
  },
  dark: {
    [EDGE_TYPE.FOLLOWED_BY]: "#56B4E9",
    [EDGE_TYPE.USED_BY]: "#F0E442",
    [EDGE_TYPE.SEMANTIC_EXPORT]: "#3DDBA8",
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
 * Default: every Nice-DAG dependency edge is `followed-by`.
 * E2-S5 upgrades some to `used-by`; E2-S6 adds `semantic-export`.
 */
export function buildEdgeMetaFromNodes(nodes) {
  const meta = new Map();
  const walk = (list) => {
    for (const n of list || []) {
      for (const dep of n.dependencies || []) {
        meta.set(edgeKey(dep, n.id), EDGE_TYPE.FOLLOWED_BY);
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
