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

/** SPEC-017 R17-12 defaults (same light/dark); settings may override via edgeColors.js */
export const EDGE_COLORS = {
  light: {
    [EDGE_TYPE.FOLLOWED_BY]: "#156082",
    [EDGE_TYPE.USED_BY]: "#E97132",
    [EDGE_TYPE.SEMANTIC_EXPORT]: "#78206E",
  },
  dark: {
    [EDGE_TYPE.FOLLOWED_BY]: "#156082",
    [EDGE_TYPE.USED_BY]: "#E97132",
    [EDGE_TYPE.SEMANTIC_EXPORT]: "#78206E",
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
