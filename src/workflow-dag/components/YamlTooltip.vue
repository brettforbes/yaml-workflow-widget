<template>
  <div class="wf-yaml-tooltip" @click.stop>
    <div class="wf-yaml-tooltip-title">
      <span>{{ title }}</span>
      <span class="wf-yaml-tooltip-actions">
        <button
          v-if="showForm"
          type="button"
          class="wf-yaml-tooltip-edit"
          @click="$emit('form')"
        >
          Form
        </button>
        <button type="button" class="wf-yaml-tooltip-edit" @click="$emit('edit')">
          Edit
        </button>
      </span>
    </div>
    <pre class="wf-yaml-tooltip-body" v-html="highlighted" />
  </div>
</template>

<script>
import { computed } from "vue";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-yaml";
import "prismjs/themes/prism.css";

export default {
  name: "YamlTooltip",
  props: {
    yaml: { type: String, default: "" },
    title: { type: String, default: "" },
    showForm: { type: Boolean, default: false },
  },
  emits: ["edit", "form"],
  setup(props) {
    const highlighted = computed(() => {
      const code = props.yaml || "";
      if (!code) {
        return '<span class="token comment">(empty)</span>';
      }
      try {
        return highlight(code, languages.yaml, "yaml");
      } catch (e) {
        return code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
    });
    return { highlighted };
  },
};
</script>

<style scoped>
.wf-yaml-tooltip {
  position: absolute;
  z-index: 1000;
  left: 50%;
  top: calc(100% + 10px);
  transform: translateX(-50%);
  min-width: 220px;
  max-width: 360px;
  max-height: 280px;
  background: #2d2d2d;
  color: #ccc;
  border: 1px solid #555;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.wf-yaml-tooltip-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #3a3a3a;
  font-size: 12px;
  color: #eee;
}
.wf-yaml-tooltip-actions {
  display: flex;
  gap: 6px;
}
.wf-yaml-tooltip-edit {
  border: 1px solid #888;
  background: #555;
  color: #fff;
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
}
.wf-yaml-tooltip-body {
  margin: 0;
  padding: 8px 10px;
  overflow: auto;
  font-family: Consolas, Menlo, monospace;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
