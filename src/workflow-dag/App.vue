<template>
  <div
    class="dag-host"
    :class="{ embed: isEmbed }"
    :data-theme="theme"
  >
    <div class="toolbar border-bottom px-2 py-1 d-flex align-items-center gap-2">
      <strong class="me-auto">CLI Workflow DAG</strong>
      <button
        type="button"
        class="icon-btn"
        :title="`Theme: ${theme} (click to toggle)`"
        aria-label="Toggle theme"
        @click="toggleTheme"
      >
        ⚙
      </button>
      <button
        type="button"
        class="icon-btn"
        title="Reset view"
        aria-label="Reset diagram view"
        @click="resetView"
      >
        ⌖
      </button>
      <a
        v-if="!isEmbed"
        class="btn btn-sm btn-outline-secondary"
        href="?embed=1"
        >Embed mode</a
      >
      <a v-else class="btn btn-sm btn-outline-secondary" href="?">Full page</a>
    </div>
    <div class="split-layout flex-grow-1 overflow-hidden">
      <aside
        v-if="!isEmbed && !codeCollapsed"
        class="code-pane d-flex flex-column"
        :style="{ width: codePaneWidth + 'px' }"
      >
        <div class="px-2 py-1 small code-pane-label border-bottom">
          12A_Workflow_YAML_Example.yaml
        </div>
        <prism-editor
          class="yaml-editor flex-grow-1"
          v-model="yamlText"
          :highlight="highlightYaml"
          line-numbers
        />
        <!-- E1-S2: editable in-memory YAML. Diagram refresh from code is E5 (Langium sync). -->
      </aside>
      <div
        v-if="!isEmbed && !codeCollapsed"
        class="split-divider"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize code and diagram panes"
        @mousedown.prevent="startDividerDrag"
      >
        <button
          type="button"
          class="split-collapse-btn"
          title="Collapse code pane"
          aria-label="Collapse code pane"
          @mousedown.stop
          @click.stop="codeCollapsed = true"
        >
          ‹
        </button>
      </div>
      <button
        v-if="!isEmbed && codeCollapsed"
        type="button"
        class="split-reopen-btn"
        title="Show code pane"
        aria-label="Show code pane"
        @click="codeCollapsed = false"
      >
        ›
      </button>
      <div
        class="diagram-column"
        :class="{ 'embed-diagram': isEmbed }"
      >
        <div
          class="diagram-pane h-100 position-relative"
          ref="niceDagEl"
          @wheel="onDiagramWheel"
          @mousedown="onDiagramPanStart"
        />
        <NiceDagNodes v-slot="slotProps" :niceDagReactive="niceDagReactive">
          <StartNode
            v-if="slotProps.node.data?.kind === 'workflow-start'"
            :node="slotProps.node"
            @edit="openEdit"
          />
          <TargetNode
            v-else-if="slotProps.node.data?.kind === 'workflow-target'"
            :node="slotProps.node"
            @edit="openEdit"
          />
          <EndContextNode
            v-else-if="slotProps.node.data?.kind === 'workflow-end'"
            :node="slotProps.node"
            @edit="openEdit"
          />
          <CategoryNode
            v-else-if="slotProps.node.data?.category"
            :node="slotProps.node"
            @edit="openEdit"
          />
          <CliAppNode v-else :node="slotProps.node" @edit="openEdit" />
        </NiceDagNodes>
        <NiceDagEdges :niceDagReactive="niceDagReactive" />
      </div>
    </div>
    <YamlEditModal
      :open="modalOpen"
      :title="modalTitle"
      :yaml="modalYaml"
      :node="modalNode"
      @close="modalOpen = false"
    />
  </div>
</template>

<script>
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import * as yaml from "js-yaml";
import { NiceDagNodes, NiceDagEdges, useNiceDag } from "@ebay/nice-dag-vue3";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-yaml";
import "bootstrap/dist/css/bootstrap.min.css";
import sampleYaml from "./assets/12A_Workflow_YAML_Example.yaml";
import { workflowDocToNiceDagModel, NODE_KIND } from "./components/mapper";
import CategoryNode from "./components/CategoryNode.vue";
import CliAppNode from "./components/CliAppNode.vue";
import StartNode from "./components/StartNode.vue";
import TargetNode from "./components/TargetNode.vue";
import EndContextNode from "./components/EndContextNode.vue";
import YamlEditModal from "./components/YamlEditModal.vue";
import "./components/CliWorkflowView.css";
import "./theme.css";
import { applyTheme, normalizeTheme, readStoredTheme } from "./theme";

const CATEGORY_W = 160;
const CATEGORY_H = 56;
const COLLAPSED_W = 180;
const COLLAPSED_H = 64;
const START_SIZE = 72;
const TARGET_W = 140;
const TARGET_H = 48;
const END_SIZE = 88;
const CODE_PANE_WIDTH_KEY = "workflow-dag:codePaneWidth";
const CODE_PANE_MIN = 200;
const CODE_PANE_MAX_RATIO = 0.75;
const CODE_PANE_DEFAULT = 480;
const DEFAULT_DAG_SCALE = 1;
const MIN_DAG_SCALE = 0.25;
const MAX_DAG_SCALE = 1;

function readStoredCodePaneWidth() {
  try {
    const raw = sessionStorage.getItem(CODE_PANE_WIDTH_KEY);
    const n = Number(raw);
    if (Number.isFinite(n) && n >= CODE_PANE_MIN) return Math.round(n);
  } catch (_) {
    /* ignore */
  }
  return CODE_PANE_DEFAULT;
}

function clampCodePaneWidth(width, hostWidth) {
  const max = Math.max(
    CODE_PANE_MIN,
    Math.floor((hostWidth || window.innerWidth) * CODE_PANE_MAX_RATIO)
  );
  return Math.min(max, Math.max(CODE_PANE_MIN, Math.round(width)));
}

function getNodeSize(node) {
  if (node.data?.kind === NODE_KIND.START) {
    return { width: START_SIZE, height: START_SIZE };
  }
  if (node.data?.kind === NODE_KIND.TARGET) {
    return { width: TARGET_W, height: TARGET_H };
  }
  if (node.data?.kind === NODE_KIND.END) {
    return { width: END_SIZE, height: END_SIZE };
  }
  if (node.data?.category) {
    return { width: CATEGORY_W, height: CATEGORY_H };
  }
  return { width: COLLAPSED_W, height: COLLAPSED_H };
}

export default {
  name: "App",
  components: {
    PrismEditor,
    NiceDagNodes,
    NiceDagEdges,
    StartNode,
    TargetNode,
    EndContextNode,
    CategoryNode,
    CliAppNode,
    YamlEditModal,
  },
  setup() {
    const isEmbed = computed(() => {
      const q = new URLSearchParams(window.location.search);
      return q.get("embed") === "1";
    });
    const codeCollapsed = ref(false);
    const codePaneWidth = ref(readStoredCodePaneWidth());
    const dagScale = ref(DEFAULT_DAG_SCALE);
    const theme = ref(readStoredTheme());
    const yamlText = ref(sampleYaml);
    const workflowDoc = yaml.load(sampleYaml);
    const initNodes = workflowDocToNiceDagModel(workflowDoc || {});

    const modalOpen = ref(false);
    const modalTitle = ref("");
    const modalYaml = ref("");
    const modalNode = ref(null);

    const { niceDagEl, niceDagReactive } = useNiceDag(
      {
        initNodes,
        getNodeSize,
        graphLabel: { rankdir: "TB", ranksep: 48, edgesep: 24 },
        subViewPadding: { top: 48, bottom: 24, left: 24, right: 24 },
      },
      false
    );

    const setTheme = (next) => {
      theme.value = normalizeTheme(next);
    };

    const toggleTheme = () => {
      setTheme(theme.value === "dark" ? "light" : "dark");
    };

    /** E1 stub / E6 host contract: listen for setTheme from parent */
    const onHostMessage = (event) => {
      const data = event?.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "setTheme" || data.action === "setTheme") {
        const value = data.payload?.theme ?? data.theme ?? data.payload;
        if (value) setTheme(value);
      }
    };

    watch(
      theme,
      (t) => {
        applyTheme(t);
      },
      { immediate: true }
    );

    const persistCodePaneWidth = (width) => {
      codePaneWidth.value = width;
      try {
        sessionStorage.setItem(CODE_PANE_WIDTH_KEY, String(width));
      } catch (_) {
        /* ignore */
      }
    };

    const startDividerDrag = (event) => {
      const startX = event.clientX;
      const startWidth = codePaneWidth.value;
      const onMove = (e) => {
        const hostWidth = document.querySelector(".split-layout")?.clientWidth;
        persistCodePaneWidth(
          clampCodePaneWidth(startWidth + (e.clientX - startX), hostWidth)
        );
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.classList.remove("wd-divider-dragging");
      };
      document.body.classList.add("wd-divider-dragging");
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };

    const getMainLayer = () =>
      niceDagEl.value?.querySelector(".nice-dag-main-layer");

    const applyCenter = () => {
      const niceDag = niceDagReactive.use();
      if (!niceDag || !niceDagEl.value) return;
      const bounds = niceDagEl.value.getBoundingClientRect();
      niceDag.center({
        width: bounds.width,
        height: Math.max(bounds.height, 500),
      });
    };

    const resetView = () => {
      const niceDag = niceDagReactive.use();
      if (!niceDag) return;
      dagScale.value = DEFAULT_DAG_SCALE;
      niceDag.setScale(DEFAULT_DAG_SCALE);
      applyCenter();
      const main = getMainLayer();
      if (main) {
        main.scrollLeft = 0;
        main.scrollTop = 0;
      }
    };

    const onDiagramWheel = (event) => {
      const niceDag = niceDagReactive.use();
      if (!niceDag) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.06 : 0.06;
      const next = Math.min(
        MAX_DAG_SCALE,
        Math.max(MIN_DAG_SCALE, +(dagScale.value + delta).toFixed(2))
      );
      if (next === dagScale.value) return;
      dagScale.value = next;
      niceDag.setScale(next);
    };

    const onDiagramPanStart = (event) => {
      if (event.button !== 0 && event.button !== 1) return;
      if (
        event.target.closest(
          ".wf-cli-app-node, .wf-category-node, button, .wf-yaml-tooltip, .wf-connector"
        )
      ) {
        return;
      }
      const main = getMainLayer();
      if (!main) return;
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = main.scrollLeft;
      const startTop = main.scrollTop;
      main.classList.add("wd-panning");
      const onMove = (e) => {
        main.scrollLeft = startLeft - (e.clientX - startX);
        main.scrollTop = startTop - (e.clientY - startY);
      };
      const onUp = () => {
        main.classList.remove("wd-panning");
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };

    onMounted(() => {
      window.addEventListener("message", onHostMessage);
      const hostWidth = document.querySelector(".split-layout")?.clientWidth;
      persistCodePaneWidth(clampCodePaneWidth(codePaneWidth.value, hostWidth));
      const niceDag = niceDagReactive.use();
      if (niceDag) {
        niceDag.setScale(DEFAULT_DAG_SCALE);
        applyCenter();
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener("message", onHostMessage);
    });

    const highlightYaml = (code) => {
      try {
        return highlight(code || "", languages.yaml, "yaml");
      } catch (e) {
        return code || "";
      }
    };

    const openEdit = ({ node, yaml: y, title }) => {
      modalNode.value = node;
      modalYaml.value = y || "";
      modalTitle.value = title || node?.id || "";
      modalOpen.value = true;
    };

    return {
      isEmbed,
      codeCollapsed,
      codePaneWidth,
      startDividerDrag,
      theme,
      toggleTheme,
      resetView,
      onDiagramWheel,
      onDiagramPanStart,
      yamlText,
      niceDagEl,
      niceDagReactive,
      highlightYaml,
      modalOpen,
      modalTitle,
      modalYaml,
      modalNode,
      openEdit,
    };
  },
};
</script>

<style>
html,
body,
#workflow-dag-root {
  height: 100%;
  margin: 0;
}
.dag-host {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--wd-bg);
  color: var(--wd-text);
}
.toolbar {
  background: var(--wd-toolbar-bg);
  border-color: var(--wd-border) !important;
}
.icon-btn {
  border: none;
  background: transparent;
  color: var(--wd-text-muted);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0.25rem 0.4rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
.icon-btn:hover {
  color: var(--wd-text);
  background: var(--wd-surface-muted);
}
.split-layout {
  display: flex;
  flex-direction: row;
  min-height: 0;
  width: 100%;
}
.split-divider {
  flex: 0 0 10px;
  cursor: col-resize;
  background: var(--wd-border);
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.split-divider:hover,
body.wd-divider-dragging .split-divider {
  background: var(--wd-text-muted);
}
.split-collapse-btn,
.split-reopen-btn {
  border: none;
  background: var(--wd-toolbar-bg);
  color: var(--wd-text-muted);
  width: 16px;
  height: 36px;
  padding: 0;
  line-height: 1;
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
  box-shadow: 0 0 0 1px var(--wd-border);
}
.split-collapse-btn:hover,
.split-reopen-btn:hover {
  color: var(--wd-text);
  background: var(--wd-surface-muted);
}
.split-reopen-btn {
  flex: 0 0 16px;
  align-self: center;
  margin: 0 2px;
  z-index: 2;
}
body.wd-divider-dragging {
  cursor: col-resize;
  user-select: none;
}
.yaml-editor {
  background: var(--wd-code-bg);
  color: var(--wd-code-fg);
  font-family: Consolas, Menlo, monospace;
  font-size: 12px;
  line-height: 1.45;
  overflow: auto;
  height: 100%;
}
.diagram-column {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.diagram-pane {
  min-height: 480px;
  height: 100%;
  background: var(--wd-surface-muted);
  overflow: hidden;
}
.diagram-pane .nice-dag-main-layer {
  overflow: auto !important;
  cursor: grab;
}
.diagram-pane .nice-dag-main-layer.wd-panning {
  cursor: grabbing;
}
.dag-host.embed .embed-diagram {
  max-width: 33.333%;
  margin: 0 auto;
}
.code-pane {
  flex: 0 0 auto;
  background: var(--wd-code-bg);
  height: 100%;
  color: var(--wd-code-fg);
  border-right: 1px solid var(--wd-border);
  min-width: 0;
  overflow: hidden;
}
.code-pane-label {
  color: var(--wd-text-muted);
  border-color: var(--wd-border) !important;
}
.prism-editor__textarea:focus {
  outline: none;
}
</style>
