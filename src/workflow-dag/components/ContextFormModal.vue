<template>
  <div v-if="open" class="wf-form-modal-backdrop" @click.self="onCancel">
    <div class="wf-form-modal" role="dialog" aria-modal="true">
      <div class="wf-form-modal-header">
        <strong>Context — export</strong>
        <button type="button" class="wf-form-modal-close" @click="onCancel">
          ×
        </button>
      </div>
      <div class="wf-form-modal-body">
        <label class="wf-form-opt">
          <input v-model="exportContext" type="checkbox" />
          <span>Export this step’s semantic subgraph to final context</span>
        </label>
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
  name: "ContextFormModal",
  props: {
    open: { type: Boolean, default: false },
    node: { type: Object, default: null },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const exportContext = ref(true);

    watch(
      () => [props.open, props.node],
      () => {
        if (!props.open) return;
        const raw = props.node?.data?.raw;
        if (raw && typeof raw === "object" && "export" in raw) {
          exportContext.value = !!raw.export;
        } else if (raw === false) {
          exportContext.value = false;
        } else {
          exportContext.value = raw == null ? true : !!raw;
        }
      }
    );

    const onCancel = () => emit("close");
    const onSave = () => {
      const next = { export: !!exportContext.value };
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

    return { exportContext, onCancel, onSave };
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
  width: min(420px, 92vw);
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
.wf-form-modal-body {
  padding: 16px;
}
.wf-form-opt {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
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
