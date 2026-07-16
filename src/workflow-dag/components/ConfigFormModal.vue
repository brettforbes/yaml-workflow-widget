<template>
  <div v-if="open" class="wf-form-modal-backdrop" @click.self="onCancel">
    <div class="wf-form-modal" role="dialog" aria-modal="true">
      <div class="wf-form-modal-header">
        <strong>Config — {{ toolLabel }}</strong>
        <button type="button" class="wf-form-modal-close" @click="onCancel">
          ×
        </button>
      </div>
      <p class="wf-form-modal-hint">
        Select CLI options from installed docs. Saves into
        <code>config.argv</code>.
      </p>
      <div class="wf-form-modal-body">
        <label
          v-for="opt in options"
          :key="opt.flag"
          class="wf-form-opt"
        >
          <input
            v-model="selected[opt.flag]"
            type="checkbox"
          />
          <code>{{ opt.flag }}</code>
          <input
            v-if="opt.takesValue && selected[opt.flag]"
            v-model="values[opt.flag]"
            type="text"
            class="wf-form-val"
            :placeholder="opt.flag"
          />
          <span class="wf-form-desc">{{ opt.description }}</span>
        </label>
        <p v-if="!options.length" class="wf-form-empty">
          No CLI options found for {{ toolLabel }}.
        </p>
      </div>
      <div class="wf-form-modal-actions">
        <button type="button" @click="onCancel">Cancel</button>
        <button type="button" class="primary" @click="onSave">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from "vue";
import * as yaml from "js-yaml";
import { loadCliOptionsForUses } from "./cliContent";

export default {
  name: "ConfigFormModal",
  props: {
    open: { type: Boolean, default: false },
    node: { type: Object, default: null },
    uses: { type: String, default: "" },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const options = ref([]);
    const selected = reactive({});
    const values = reactive({});
    const toolLabel = ref("");

    const resetFromNode = () => {
      const uses = props.uses || "";
      toolLabel.value = uses || "tool";
      options.value = loadCliOptionsForUses(uses);
      Object.keys(selected).forEach((k) => delete selected[k]);
      Object.keys(values).forEach((k) => delete values[k]);

      const argv = props.node?.data?.raw?.argv;
      if (Array.isArray(argv)) {
        for (let i = 0; i < argv.length; i++) {
          const token = String(argv[i]);
          if (!token.startsWith("-")) continue;
          selected[token] = true;
          const next = argv[i + 1];
          if (next != null && !String(next).startsWith("-")) {
            values[token] = String(next);
            i++;
          }
        }
      }
      for (const opt of options.value) {
        if (selected[opt.flag] === undefined) selected[opt.flag] = false;
        if (values[opt.flag] === undefined) values[opt.flag] = "";
      }
    };

    watch(
      () => [props.open, props.uses, props.node],
      () => {
        if (props.open) resetFromNode();
      }
    );

    const onCancel = () => emit("close");

    const onSave = () => {
      const argv = [];
      for (const opt of options.value) {
        if (!selected[opt.flag]) continue;
        argv.push(opt.flag);
        if (opt.takesValue && values[opt.flag]) {
          argv.push(values[opt.flag]);
        }
      }
      const prev =
        props.node?.data?.raw && typeof props.node.data.raw === "object"
          ? { ...props.node.data.raw }
          : {};
      const next = { ...prev, argv };
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

    return {
      options,
      selected,
      values,
      toolLabel,
      onCancel,
      onSave,
    };
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
  width: min(640px, 94vw);
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
  gap: 6px;
}
.wf-form-opt {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 8px;
  align-items: start;
  font-size: 12px;
}
.wf-form-opt code {
  color: #9cdcfe;
}
.wf-form-desc {
  grid-column: 1 / -1;
  color: #999;
  margin-left: 24px;
}
.wf-form-val {
  grid-column: 3;
  background: #2d2d2d;
  border: 1px solid #555;
  color: #eee;
  border-radius: 3px;
  padding: 2px 6px;
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
