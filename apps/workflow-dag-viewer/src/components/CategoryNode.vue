<template>
  <div
    class="wf-category-node"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div class="wf-connector wf-connector-in" />
    <span class="wf-category-label">{{ node.data?.label || node.data?.category }}</span>
    <div class="wf-connector wf-connector-out" />
    <YamlTooltip
      v-if="showTooltip"
      :yaml="node.data?.yaml || ''"
      :title="node.data?.category || 'category'"
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
  name: "CategoryNode",
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
        title: props.node.data?.category || "category",
      });
    };

    return { showTooltip, keepOpen, onEnter, onLeave, hideSoon, onEdit };
  },
};
</script>

<style scoped>
.wf-category-node {
  position: relative;
  width: 160px;
  height: 56px;
  border: 1px solid #999999;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.wf-category-label {
  font-size: 13px;
  color: #333;
  text-transform: lowercase;
}
</style>

<style>
.wf-connector {
  width: 16px;
  height: 16px;
  border: 1px solid black;
  border-radius: 50%;
  background: white;
  position: absolute;
  z-index: 2;
}
.wf-connector-in {
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
}
.wf-connector-out {
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
