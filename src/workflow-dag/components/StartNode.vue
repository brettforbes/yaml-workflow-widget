<template>
  <div
    class="wf-start-node"
    :class="[statusClass, { 'wf-node-selected': selected }]"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="onSelectClick"
  >
    <span v-if="statusGlyph" class="wf-step-status-icon" aria-hidden="true">{{
      statusGlyph
    }}</span>
    <span class="wf-start-label">start</span>
    <button
      v-if="editable"
      type="button"
      class="wf-node-delete"
      title="Delete"
      @click.stop="node.remove()"
    >
      ×
    </button>
    <YamlTooltip
      v-if="showTooltip"
      :yaml="node.data?.yaml || ''"
      :title="node.data?.label || 'workflow start'"
      @edit="onEdit"
      @mouseenter="keepOpen = true"
      @mouseleave="hideSoon"
    />
  </div>
</template>

<script>
import { computed, ref } from "vue";
import YamlTooltip from "./YamlTooltip.vue";

const ALLOWED = new Set(["waiting", "running", "complete", "failed"]);
const GLYPHS = {
  waiting: "⏱",
  running: "↻",
  complete: "✓",
  failed: "✕",
};

export default {
  name: "StartNode",
  components: { YamlTooltip },
  props: {
    node: { type: Object, required: true },
    editable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    /** SPEC-015 — waiting | running | complete | failed (empty = no status chrome). */
    status: { type: String, default: "" },
  },
  emits: ["edit", "select"],
  setup(props, { emit }) {
    const showTooltip = ref(false);
    const keepOpen = ref(false);
    let hideTimer = null;

    const normalizedStatus = computed(() => {
      const s = typeof props.status === "string" ? props.status.trim() : "";
      return ALLOWED.has(s) ? s : "";
    });
    const statusClass = computed(() =>
      normalizedStatus.value ? `wf-step-status-${normalizedStatus.value}` : ""
    );
    const statusGlyph = computed(() => GLYPHS[normalizedStatus.value] || "");

    const onEnter = () => {
      clearTimeout(hideTimer);
      showTooltip.value = true;
    };
    const onLeave = () => {
      hideTimer = setTimeout(() => {
        if (!keepOpen.value) showTooltip.value = false;
      }, 150);
    };
    const hideSoon = () => {
      keepOpen.value = false;
      hideTimer = setTimeout(() => {
        showTooltip.value = false;
      }, 150);
    };
    const onEdit = () => {
      showTooltip.value = false;
      emit("edit", {
        node: props.node,
        yaml: props.node.data?.yaml || "",
        title: props.node.data?.label || "workflow start",
      });
    };
    const onSelectClick = (e) => {
      if (!props.editable) return;
      emit("select", props.node.id, e);
    };

    return {
      showTooltip,
      keepOpen,
      statusClass,
      statusGlyph,
      onEnter,
      onLeave,
      hideSoon,
      onEdit,
      onSelectClick,
    };
  },
};
</script>

<style scoped>
.wf-start-node {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid #333;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.wf-start-label {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  text-transform: lowercase;
}
.wf-start-node.wf-step-status-waiting {
  background: var(--wd-status-waiting);
  border-color: color-mix(in srgb, var(--wd-status-waiting) 55%, #666);
}
.wf-start-node.wf-step-status-running {
  background: var(--wd-status-running);
  border-color: color-mix(in srgb, var(--wd-status-running) 40%, #333);
}
.wf-start-node.wf-step-status-complete {
  background: var(--wd-status-complete);
  border-color: color-mix(in srgb, var(--wd-status-complete) 35%, #222);
  color: #fff;
}
.wf-start-node.wf-step-status-complete .wf-start-label {
  color: #fff;
}
.wf-start-node.wf-step-status-failed {
  background: var(--wd-status-failed);
  border-color: color-mix(in srgb, var(--wd-status-failed) 35%, #222);
  color: #fff;
}
.wf-start-node.wf-step-status-failed .wf-start-label {
  color: #fff;
}
.wf-step-status-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 3;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.85);
  color: #222;
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
}
</style>

<style>
.wf-node-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 5;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #c00;
  background: #fff;
  color: #c00;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}
</style>
