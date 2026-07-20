<template>
  <div
    class="wf-end-node"
    :class="{ 'wf-node-selected': selected }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="(e) => editable && $emit('select', node.id, e)"
  >
    <span class="wf-end-label">context</span>
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
      :title="node.data?.label || 'final context'"
      @edit="onEdit"
      @mouseenter="keepOpen = true"
      @mouseleave="hideSoon"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import YamlTooltip from "./YamlTooltip.vue";

export default {
  name: "EndContextNode",
  components: { YamlTooltip },
  props: {
    node: { type: Object, required: true },
    editable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
  emits: ["edit", "select"],
  setup(props, { emit }) {
    const showTooltip = ref(false);
    const keepOpen = ref(false);
    let hideTimer = null;

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
        title: props.node.data?.label || "final context",
      });
    };

    return { showTooltip, keepOpen, onEnter, onLeave, hideSoon, onEdit };
  },
};
</script>

<style scoped>
/* Seed §2.1: transition = 72×72 (same as start). Must match getNodeSize or CX spine drifts. */
.wf-end-node {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid #222;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.wf-end-label {
  font-size: 11px;
  font-weight: 700;
  color: #111;
  text-transform: lowercase;
}
</style>
