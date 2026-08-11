<template>
  <div
    class="wf-context-collector"
    :class="{ 'wf-node-selected': selected }"
    :title="node.data?.label || 'context'"
    @click="(e) => editable && $emit('select', node.id, e)"
  >
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
/* Seed §2.1: collector 32×32 circle (ports are 12×12). */
.wf-context-collector {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  /* Match semantic-export edge color (settings-driven). */
  border: 2px solid var(--wd-edge-semantic-export, #78206e);
  background: color-mix(
    in srgb,
    var(--wd-edge-semantic-export, #78206e) 22%,
    var(--wd-surface, #ffffff)
  );
  box-sizing: border-box;
  position: relative;
}
</style>
