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
        v-if="!isEmbed"
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="codeCollapsed = !codeCollapsed"
      >
        {{ codeCollapsed ? "Show YAML" : "Hide YAML" }}
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
      />
      <div
        class="diagram-column"
        :class="{ 'embed-diagram': isEmbed }"
      >
        <div class="diagram-pane h-100 position-relative" ref="niceDagEl" />
        <NiceDagNodes v-slot="slotProps" :niceDagReactive="niceDagReactive">
          <CategoryNode
            v-if="slotProps.node.data?.category"
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
import { workflowStepsToNiceDagModel } from "./components/mapper";
import CategoryNode from "./components/CategoryNode.vue";
import CliAppNode from "./components/CliAppNode.vue";
import YamlEditModal from "./components/YamlEditModal.vue";
import "./components/CliWorkflowView.css";
import "./theme.css";
import { applyTheme, normalizeTheme, readStoredTheme } from "./theme";

const CATEGORY_W = 160;
const CATEGORY_H = 56;
const COLLAPSED_W = 180;
const COLLAPSED_H = 64;
const CODE_PANE_WIDTH_KEY = "workflow-dag:codePaneWidth";
const CODE_PANE_MIN = 200;
const CODE_PANE_MAX_RATIO = 0.75;
const CODE_PANE_DEFAULT = 480;

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
    const theme = ref(readStoredTheme());
    const yamlText = ref(sampleYaml);
    const workflowDoc = yaml.load(sampleYaml);
    const initNodes = workflowStepsToNiceDagModel(workflowDoc.steps || []);

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

    onMounted(() => {
      window.addEventListener("message", onHostMessage);
      const hostWidth = document.querySelector(".split-layout")?.clientWidth;
      persistCodePaneWidth(clampCodePaneWidth(codePaneWidth.value, hostWidth));
      const niceDag = niceDagReactive.use();
      if (niceDag && niceDagEl.value) {
        const bounds = niceDagEl.value.getBoundingClientRect();
        niceDag.center({
          width: bounds.width,
          height: Math.max(bounds.height, 500),
        });
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
  flex: 0 0 6px;
  cursor: col-resize;
  background: var(--wd-border);
  position: relative;
  z-index: 2;
}
.split-divider:hover,
body.wd-divider-dragging .split-divider {
  background: var(--wd-text-muted);
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
