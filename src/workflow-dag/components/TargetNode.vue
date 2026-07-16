<template>
  <div
    class="wf-target-node"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <span class="wf-target-label">target</span>
    <YamlTooltip
      v-if="showTooltip"
      :yaml="node.data?.yaml || ''"
      :title="node.data?.label || 'inputs'"
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
  name: "TargetNode",
  components: { YamlTooltip },
  props: {
    node: { type: Object, required: true },
  },
  emits: ["edit"],
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
        title: props.node.data?.label || "inputs",
      });
    };

    return { showTooltip, keepOpen, onEnter, onLeave, hideSoon, onEdit };
  },
};
</script>

<style scoped>
.wf-target-node {
  position: relative;
  width: 140px;
  height: 48px;
  border-radius: 8px;
  border: 2px solid #555;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.wf-target-label {
  font-size: 12px;
  font-weight: 600;
  color: #222;
  text-transform: lowercase;
}
</style>
