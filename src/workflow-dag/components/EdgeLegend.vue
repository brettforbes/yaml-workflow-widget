<template>
  <div class="wf-edge-legend" aria-label="Edge type legend">
    <div
      v-for="row in rows"
      :key="row.type"
      class="wf-edge-legend-row"
    >
      <span
        class="wf-edge-legend-swatch"
        :style="{ background: row.color }"
      />
      <span class="wf-edge-legend-label">{{ row.type }}</span>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { EDGE_TYPE, resolveEdgeColor } from "./edgeMeta";

export default {
  name: "EdgeLegend",
  props: {
    theme: { type: String, default: "light" },
    colored: { type: Boolean, default: true },
  },
  setup(props) {
    const rows = computed(() =>
      [EDGE_TYPE.FOLLOWED_BY, EDGE_TYPE.USED_BY, EDGE_TYPE.SEMANTIC_EXPORT].map(
        (type) => ({
          type,
          color: resolveEdgeColor(type, props.theme, props.colored),
        })
      )
    );
    return { rows };
  },
};
</script>

<style scoped>
.wf-edge-legend {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 5;
  background: var(--wd-surface);
  border: 1px solid var(--wd-border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  color: var(--wd-text);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.wf-edge-legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 3px 0;
}
.wf-edge-legend-swatch {
  width: 14px;
  height: 3px;
  border-radius: 1px;
  flex-shrink: 0;
}
.wf-edge-legend-label {
  font-family: Consolas, Menlo, monospace;
}
</style>
