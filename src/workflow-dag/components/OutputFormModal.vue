<template>
  <div v-if="open" class="wf-form-modal-backdrop" @click.self="onCancel">
    <div class="wf-form-modal" role="dialog" aria-modal="true">
      <div class="wf-form-modal-header">
        <strong>Output — select nuggets</strong>
        <button type="button" class="wf-form-modal-close" @click="onCancel">
          ×
        </button>
      </div>
      <p class="wf-form-modal-hint">
        Choose nugget ids from installed graph-structure content. Builds
        <code>output.vars</code> GSE stubs.
      </p>
      <div class="wf-form-modal-body">
        <label class="wf-form-row">
          <span>Variable name</span>
          <input v-model="varName" type="text" placeholder="my_var" />
        </label>
        <label
          v-for="id in nuggetIds"
          :key="id"
          class="wf-form-opt"
        >
          <input v-model="selected[id]" type="checkbox" />
          <code>{{ id }}</code>
        </label>
        <p v-if="!nuggetIds.length" class="wf-form-empty">
          No nugget ids found for this tool.
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
import { loadNuggetIdsForUses } from "./nuggetContent";

export default {
  name: "OutputFormModal",
  props: {
    open: { type: Boolean, default: false },
    node: { type: Object, default: null },
    uses: { type: String, default: "" },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const nuggetIds = ref([]);
    const selected = reactive({});
    const varName = ref("selected_nuggets");

    const reset = () => {
      nuggetIds.value = loadNuggetIdsForUses(props.uses || "");
      Object.keys(selected).forEach((k) => delete selected[k]);
      for (const id of nuggetIds.value) selected[id] = false;
      const vars = props.node?.data?.raw?.vars;
      if (vars && typeof vars === "object") {
        const keys = Object.keys(vars);
        if (keys.length) varName.value = keys[0];
        const first = vars[keys[0]];
        const nugget =
          first?.select?.nodes?.nugget_id || first?.select?.nodes?.nuggetId;
        if (nugget && selected[nugget] !== undefined) selected[nugget] = true;
      }
    };

    watch(
      () => [props.open, props.uses],
      () => {
        if (props.open) reset();
      }
    );

    const onCancel = () => emit("close");
    const onSave = () => {
      const chosen = nuggetIds.value.filter((id) => selected[id]);
      const name = (varName.value || "selected_nuggets").trim();
      const vars = {};
      if (chosen.length === 1) {
        vars[name] = {
          type: "string_list",
          select: {
            source: "$step.scan_graph",
            nodes: { nugget_id: chosen[0] },
            project: "nugget_data",
            distinct: true,
          },
        };
      } else if (chosen.length > 1) {
        chosen.forEach((id, i) => {
          vars[`${name}_${i + 1}`] = {
            type: "string_list",
            select: {
              source: "$step.scan_graph",
              nodes: { nugget_id: id },
              project: "nugget_data",
              distinct: true,
            },
          };
        });
      }
      const next = { vars };
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

    return { nuggetIds, selected, varName, onCancel, onSave };
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
  gap: 6px;
}
.wf-form-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}
.wf-form-row input {
  flex: 1;
  background: #2d2d2d;
  border: 1px solid #555;
  color: #eee;
  border-radius: 3px;
  padding: 4px 8px;
}
.wf-form-opt {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}
.wf-form-opt code {
  color: #9cdcfe;
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
