<template>
  <div
    class="wf-category-node"
    :class="{ 'wf-category-context': isContext }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <!-- Category ports are silent (no tooltips) per E2-S8. -->
    <div class="wf-connector wf-connector-in" />
    <span class="wf-category-label">{{ node.data?.label || node.data?.category }}</span>
    <div class="wf-connector wf-connector-out" />
    <div
      v-if="isContext"
      class="wf-connector wf-connector-context"
      :class="
        contextSide === 'left'
          ? 'wf-connector-context-left'
          : 'wf-connector-context-right'
      "
      title="context export"
    />
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
import { computed, ref } from "vue";
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

    const isContext = computed(() => props.node.data?.category === "context");
    const contextSide = computed(() => {
      // Prefer parent step side when available via data; default right.
      return props.node.data?.contextSide || "right";
    });

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

    return {
      showTooltip,
      keepOpen,
      isContext,
      contextSide,
      onEnter,
      onLeave,
      hideSoon,
      onEdit,
    };
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
.wf-category-context {
  border-color: #009e73;
}
.wf-category-label {
  font-size: 13px;
  color: #333;
  text-transform: lowercase;
}
</style>
