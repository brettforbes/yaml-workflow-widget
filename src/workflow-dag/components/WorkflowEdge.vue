<template>
  <div
    class="wf-edge-label"
    :class="{ mono: !colored }"
    :style="{ color: labelColor }"
  >
    {{ label }}
  </div>
</template>

<script>
import { computed } from "vue";
import {
  EDGE_TYPE,
  edgeKey,
  resolveEdgeColor,
} from "./edgeMeta";

export default {
  name: "WorkflowEdge",
  props: {
    source: { type: Object, required: true },
    target: { type: Object, required: true },
    edgeMeta: { type: Map, default: () => new Map() },
    theme: { type: String, default: "light" },
    colored: { type: Boolean, default: true },
    showLabels: { type: Boolean, default: true },
  },
  setup(props) {
    const edgeType = computed(() => {
      const k = edgeKey(props.source.id, props.target.id);
      return props.edgeMeta.get(k) || EDGE_TYPE.FOLLOWED_BY;
    });
    const label = computed(() =>
      props.showLabels ? edgeType.value : ""
    );
    const labelColor = computed(() =>
      resolveEdgeColor(edgeType.value, props.theme, props.colored)
    );
    return { label, labelColor };
  },
};
</script>

<style scoped>
/*
 * Parent Nice-DAG edge host is already rotated to match the edge angle.
 * translateY offsets the label perpendicular to the line (parallel text, offset).
 */
.wf-edge-label {
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  pointer-events: none;
  transform: translateY(-12px);
  text-shadow: 0 0 3px var(--wd-surface-muted, #fff);
}
.wf-edge-label.mono {
  font-weight: 500;
}
</style>
