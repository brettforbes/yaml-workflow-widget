<template>
  <div
    class="wf-start-node"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
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
import { ref } from "vue";
import YamlTooltip from "./YamlTooltip.vue";

export default {
  name: "StartNode",
  components: { YamlTooltip },
  props: {
    node: { type: Object, required: true },
    editable: { type: Boolean, default: false },
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
        title: props.node.data?.label || "workflow start",
      });
    };

    return { showTooltip, keepOpen, onEnter, onLeave, hideSoon, onEdit };
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
  font-size: 12px;
  font-weight: 600;
  color: #222;
  text-transform: lowercase;
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
