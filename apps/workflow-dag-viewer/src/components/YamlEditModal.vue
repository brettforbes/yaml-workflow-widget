<template>
  <div v-if="open" class="wf-yaml-modal-backdrop" @click.self="onCancel">
    <div class="wf-yaml-modal" role="dialog" aria-modal="true">
      <div class="wf-yaml-modal-header">
        <strong>Edit {{ title }}</strong>
        <button type="button" class="wf-yaml-modal-close" @click="onCancel">
          ×
        </button>
      </div>
      <prism-editor
        class="wf-yaml-modal-editor"
        v-model="draft"
        :highlight="highlighter"
        line-numbers
      />
      <p v-if="error" class="wf-yaml-modal-error">{{ error }}</p>
      <div class="wf-yaml-modal-actions">
        <button type="button" @click="onCancel">Cancel</button>
        <button type="button" class="primary" @click="onSave">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import yaml from "js-yaml";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-yaml";

export default {
  name: "YamlEditModal",
  components: { PrismEditor },
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: "" },
    yaml: { type: String, default: "" },
    node: { type: Object, default: null },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const draft = ref(props.yaml || "");
    const error = ref("");

    watch(
      () => [props.open, props.yaml],
      () => {
        if (props.open) {
          draft.value = props.yaml || "";
          error.value = "";
        }
      }
    );

    const highlighter = (code) => {
      try {
        return highlight(code || "", languages.yaml, "yaml");
      } catch (e) {
        return code || "";
      }
    };

    const onCancel = () => {
      error.value = "";
      emit("close");
    };

    const onSave = () => {
      error.value = "";
      const text = (draft.value || "").trim();
      try {
        const parsed = text === "" ? null : yaml.load(text);
        const nextYaml =
          parsed === null || parsed === undefined
            ? ""
            : yaml.dump(parsed, { lineWidth: 120, noRefs: true }).trimEnd();
        // Mutation is intentional — Nice-DAG holds a live node model object.
        // eslint-disable-next-line vue/no-mutating-props
        if (props.node?.data) {
          // eslint-disable-next-line vue/no-mutating-props
          props.node.data.raw = parsed;
          // eslint-disable-next-line vue/no-mutating-props
          props.node.data.yaml = nextYaml;
        }
        emit("saved", { node: props.node, raw: parsed });
        emit("close");
      } catch (e) {
        error.value = e.message || "Invalid YAML";
      }
    };

    return { draft, error, highlighter, onCancel, onSave };
  },
};
</script>

<style scoped>
.wf-yaml-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wf-yaml-modal {
  width: min(560px, 92vw);
  max-height: 80vh;
  background: #1e1e1e;
  color: #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.wf-yaml-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #444;
}
.wf-yaml-modal-close {
  background: transparent;
  border: none;
  color: #aaa;
  font-size: 22px;
  cursor: pointer;
}
.wf-yaml-modal-editor {
  flex: 1;
  min-height: 220px;
  max-height: 50vh;
  background: #2d2d2d;
  color: #ccc;
  font-family: Consolas, Menlo, monospace;
  font-size: 13px;
  padding: 8px;
  overflow: auto;
}
.wf-yaml-modal-error {
  color: #ff8a80;
  margin: 0;
  padding: 8px 16px;
  font-size: 12px;
}
.wf-yaml-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #444;
}
.wf-yaml-modal-actions button {
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid #777;
  background: #444;
  color: #fff;
  cursor: pointer;
}
.wf-yaml-modal-actions button.primary {
  background: #1890ff;
  border-color: #1890ff;
}
</style>
