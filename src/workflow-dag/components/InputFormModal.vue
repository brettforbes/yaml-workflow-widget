<template>
  <div v-if="open" class="wf-form-modal-backdrop" @click.self="onCancel">
    <div class="wf-form-modal" role="dialog" aria-modal="true">
      <div class="wf-form-modal-header">
        <strong>Input — select source</strong>
        <button type="button" class="wf-form-modal-close" @click="onCancel">
          ×
        </button>
      </div>
      <p class="wf-form-modal-hint">
        Pick a workflow input or upstream step output variable list.
      </p>
      <div class="wf-form-modal-body">
        <label
          v-for="src in sources"
          :key="src.value"
          class="wf-form-opt"
        >
          <input v-model="chosen" type="radio" :value="src.value" />
          <code>{{ src.value }}</code>
          <span class="wf-form-desc">{{ src.label }}</span>
        </label>
        <p v-if="!sources.length" class="wf-form-empty">No list sources found.</p>
      </div>
      <div class="wf-form-modal-actions">
        <button type="button" @click="onCancel">Cancel</button>
        <button type="button" class="primary" @click="onSave">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import * as yaml from "js-yaml";

export default {
  name: "InputFormModal",
  props: {
    open: { type: Boolean, default: false },
    node: { type: Object, default: null },
    sources: { type: Array, default: () => [] },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const chosen = ref("");

    watch(
      () => [props.open, props.node, props.sources],
      () => {
        if (!props.open) return;
        chosen.value =
          props.node?.data?.raw?.from ||
          props.sources[0]?.value ||
          "";
      }
    );

    const onCancel = () => emit("close");
    const onSave = () => {
      const prev =
        props.node?.data?.raw && typeof props.node.data.raw === "object"
          ? { ...props.node.data.raw }
          : {};
      const next = {
        ...prev,
        type: prev.type || "string_list",
        from: chosen.value,
      };
      const nextYaml = yaml
        .dump(next, { lineWidth: 120, noRefs: true })
        .trimEnd();
      if (props.node?.data) {
        // eslint-disable-next-line vue/no-mutating-props
        props.node.data.raw = next;
        // eslint-disable-next-line vue/no-mutating-props
        props.node.data.yaml = nextYaml;
      }
      emit("saved", { node: props.node, raw: next });
      emit("close");
    };

    return { chosen, onCancel, onSave };
  },
};
</script>

<style scoped>
.wf-form-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wf-form-modal {
  width: min(560px, 94vw);
  max-height: 85vh;
  background: #1e1e1e;
  color: #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.wf-form-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #444;
}
.wf-form-modal-close {
  background: transparent;
  border: none;
  color: #aaa;
  font-size: 22px;
  cursor: pointer;
}
.wf-form-modal-hint {
  margin: 0;
  padding: 8px 16px;
  font-size: 12px;
  color: #aaa;
}
.wf-form-modal-body {
  flex: 1;
  overflow: auto;
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wf-form-opt {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}
.wf-form-opt code {
  color: #9cdcfe;
}
.wf-form-desc {
  grid-column: 2;
  color: #999;
}
.wf-form-empty {
  color: #ff8a80;
}
.wf-form-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #444;
}
.wf-form-modal-actions button {
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid #777;
  background: #444;
  color: #fff;
  cursor: pointer;
}
.wf-form-modal-actions button.primary {
  background: #1890ff;
  border-color: #1890ff;
}
</style>
