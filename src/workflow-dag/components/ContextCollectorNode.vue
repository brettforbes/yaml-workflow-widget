<template>
  <div
    class="wf-context-collector"
    :class="{ 'wf-node-selected': selected }"
    :title="node.data?.label || 'context'"
    @click="(e) => editable && $emit('select', node.id, e)"
  >
    <span class="wf-context-collector-dot" />
    <button
      v-if="editable"
      type="button"
      class="wf-node-delete"
      title="Delete"
      @click.stop="node.remove()"
    >
      ×
    </button>
  </div>
</template>

<script>
export default {
  name: "ContextCollectorNode",
  props: {
    node: { type: Object, required: true },
    editable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
  emits: ["select"],
};
</script>

<style scoped>
.wf-context-collector {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.wf-context-collector-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #009e73;
  background: #e8fff6;
  display: block;
}
</style>
