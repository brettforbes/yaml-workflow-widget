<template>
  <div
    class="wf-cli-app-node"
    :class="{ expanded: isExpanded, collapsed: !isExpanded }"
    @mouseenter="onChromeEnter"
    @mouseleave="onChromeLeave"
  >
    <div
      class="wf-connector wf-connector-in"
      @mouseenter.stop="onPortEnter('input')"
      @mouseleave.stop="onPortLeave"
    />
    <div
      class="wf-cli-app-header"
      :class="chromeMirrored ? 'wf-chrome-mirrored' : 'wf-chrome-default'"
    >
      <button
        v-if="isExpanded"
        type="button"
        class="wf-cli-toggle"
        title="Collapse"
        @click.stop="node.shrink()"
      >
        −
      </button>
      <button
        v-else
        type="button"
        class="wf-cli-toggle"
        title="Expand"
        @click.stop="node.expand()"
      >
        +
      </button>
      <span class="wf-cli-app-label">{{ node.data?.label || node.id }}</span>
    </div>
    <div
      class="wf-connector wf-connector-out"
      @mouseenter.stop="onPortEnter('output')"
      @mouseleave.stop="onPortLeave"
    />
    <div
      class="wf-connector wf-connector-context"
      :class="contextSide === 'left' ? 'wf-connector-context-left' : 'wf-connector-context-right'"
      title="context export"
    />
    <YamlTooltip
      v-if="showTooltip"
      :yaml="tooltipYaml"
      :title="tooltipTitle"
      @edit="onEdit"
      @mouseenter="keepOpen = true"
      @mouseleave="hideSoon"
    />
  </div>
</template>

<script>
import { computed, ref } from "vue";
import * as yaml from "js-yaml";
import YamlTooltip from "./YamlTooltip.vue";

function bodyYamlWithoutIO(node) {
  const raw = node?.data?.raw;
  if (raw && typeof raw === "object") {
    const omit = { ...raw };
    delete omit.input;
    delete omit.output;
    return yaml.dump(omit, { lineWidth: 120, noRefs: true }).trimEnd();
  }
  return node?.data?.yaml || "";
}

export default {
  name: "CliAppNode",
  components: { YamlTooltip },
  props: {
    node: { type: Object, required: true },
  },
  emits: ["edit"],
  setup(props, { emit }) {
    const showTooltip = ref(false);
    const keepOpen = ref(false);
    const portMode = ref(null); // 'input' | 'output' | null (body/chrome)
    let hideTimer = null;

    const isExpanded = computed(
      () => props.node.children?.length > 0 && !props.node.collapse
    );

    const contextSide = computed(
      () => props.node.data?.contextSide || "right"
    );
    /** Right-of-split lanes mirror: label left, toggle right (DOM order reversed via CSS). */
    const chromeMirrored = computed(() => contextSide.value === "left");

    const categoryYaml = (category) => {
      const child = props.node.children?.find(
        (c) => c.data?.category === category
      );
      return child?.data?.yaml || "";
    };

    const bodyYaml = computed(() => bodyYamlWithoutIO(props.node));

    const tooltipYaml = computed(() => {
      if (!isExpanded.value && portMode.value === "input") {
        return categoryYaml("input");
      }
      if (!isExpanded.value && portMode.value === "output") {
        return categoryYaml("output");
      }
      if (!isExpanded.value) {
        return bodyYaml.value;
      }
      return props.node.data?.yaml || "";
    });

    const tooltipTitle = computed(() => {
      if (!isExpanded.value && portMode.value === "input") return "input";
      if (!isExpanded.value && portMode.value === "output") return "output";
      if (!isExpanded.value) return `${props.node.id} (body)`;
      return props.node.id;
    });

    const clearHide = () => clearTimeout(hideTimer);
    const scheduleHide = () => {
      hideTimer = setTimeout(() => {
        if (!keepOpen.value) {
          showTooltip.value = false;
          portMode.value = null;
        }
      }, 150);
    };

    const onChromeEnter = () => {
      clearHide();
      if (!isExpanded.value) {
        portMode.value = null;
        showTooltip.value = true;
        return;
      }
      // Expanded: parent body has no tooltip (E2); keep prior chrome behavior until E2-S8.
      portMode.value = null;
      showTooltip.value = true;
    };
    const onChromeLeave = () => scheduleHide();

    const onPortEnter = (kind) => {
      if (isExpanded.value) return;
      clearHide();
      portMode.value = kind;
      showTooltip.value = true;
    };
    const onPortLeave = () => scheduleHide();

    const hideSoon = () => {
      keepOpen.value = false;
      scheduleHide();
    };

    const onEdit = () => {
      showTooltip.value = false;
      const isBody =
        !isExpanded.value && portMode.value !== "input" && portMode.value !== "output";
      emit("edit", {
        node: props.node,
        yaml: isBody ? bodyYaml.value : tooltipYaml.value,
        title: tooltipTitle.value,
      });
    };

    return {
      isExpanded,
      contextSide,
      chromeMirrored,
      showTooltip,
      keepOpen,
      tooltipYaml,
      tooltipTitle,
      onChromeEnter,
      onChromeLeave,
      onPortEnter,
      onPortLeave,
      hideSoon,
      onEdit,
    };
  },
};
</script>

<style scoped>
.wf-cli-app-node {
  position: relative;
  border: 1px solid #999999;
  border-radius: 10px;
  background: #fafafa;
  box-sizing: border-box;
}
.wf-cli-app-node.collapsed {
  width: 180px;
  height: 64px;
}
.wf-cli-app-node.expanded {
  width: 100%;
  height: 100%;
  min-height: 48px;
}
.wf-cli-app-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  height: 100%;
  box-sizing: border-box;
}
.wf-chrome-default {
  flex-direction: row;
}
.wf-chrome-mirrored {
  flex-direction: row-reverse;
}
.wf-cli-app-node.expanded .wf-cli-app-header {
  height: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  border-bottom: 1px solid #eee;
  background: #f0f0f0;
  border-radius: 10px 10px 0 0;
}
.wf-cli-app-label {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wf-cli-toggle {
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
</style>

<style>
.wf-connector-context {
  width: 14px;
  height: 14px;
  border: 2px solid #009e73;
  border-radius: 50%;
  background: #e8fff6;
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
}
.wf-connector-context-right {
  right: -8px;
}
.wf-connector-context-left {
  left: -8px;
}
</style>
