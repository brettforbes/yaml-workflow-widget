<template>
  <div
    class="dag-host"
    :class="{ embed: isEmbed }"
    :data-theme="theme"
  >
    <div class="toolbar border-bottom px-2 py-1 d-flex align-items-center gap-2">
      <strong class="me-auto">CLI Workflow DAG</strong>
      <div class="settings-wrap">
        <button
          type="button"
          class="icon-btn"
          title="Settings"
          aria-label="Settings"
          :aria-expanded="settingsOpen ? 'true' : 'false'"
          @click="settingsOpen = !settingsOpen"
        >
          ⚙
        </button>
        <div v-if="settingsOpen" class="settings-panel" @click.stop>
          <label class="settings-row">
            <span>Theme</span>
            <select v-model="theme" @change="setTheme(theme)">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label class="settings-row">
            <input v-model="edgeColored" type="checkbox" />
            <span>Colored edges + labels</span>
          </label>
          <p class="settings-hint">
            Off = single-color edges with labels only
          </p>
        </div>
      </div>
      <button
        type="button"
        class="icon-btn"
        title="Pretty-print YAML from diagram"
        aria-label="Pretty-print YAML from diagram"
        @click="prettyPrintYaml"
      >
        ☰
      </button>
      <button
        type="button"
        class="icon-btn"
        :title="editMode ? 'Exit edit mode' : 'Enter edit mode'"
        :aria-pressed="editMode ? 'true' : 'false'"
        aria-label="Toggle diagram edit mode"
        @click="toggleEditMode"
      >
        ✎
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
        <div class="px-2 py-1 small code-pane-label border-bottom d-flex align-items-center gap-2">
          <span class="me-auto">12A_Workflow_YAML_Example.yaml</span>
          <span
            class="validate-badge"
            :class="yamlValid ? 'is-ok' : 'is-err'"
            :title="yamlValid ? 'YAML valid' : 'YAML has errors'"
            aria-live="polite"
          >{{ yamlValid ? '✓' : '!' }}</span>
        </div>
        <prism-editor
          class="yaml-editor flex-grow-1"
          v-model="yamlText"
          :highlight="highlightYaml"
          line-numbers
        />
        <div
          v-if="yamlDiagnostics.length"
          class="yaml-diagnostics"
          role="status"
          aria-label="YAML diagnostics"
        >
          <div
            v-for="(d, i) in yamlDiagnostics.slice(0, 8)"
            :key="i"
            class="yaml-diag-row"
            :class="d.severity === 1 ? 'is-error' : 'is-warn'"
          >
            <span class="yaml-diag-loc" v-if="d.line != null"
              >L{{ (d.line || 0) + 1 }}</span
            >
            <span class="yaml-diag-msg">{{ d.message }}</span>
          </div>
        </div>
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
        :class="{ 'embed-diagram': isEmbed, 'edit-mode': editMode }"
        @click="settingsOpen = false"
      >
        <div
          class="diagram-pane h-100 position-relative"
          ref="niceDagEl"
          @wheel="onDiagramWheel"
          @mousedown="onDiagramPanStart"
          @contextmenu.prevent="onDiagramContextMenu"
        />
        <div
          v-if="edgeMenu.open"
          class="edge-context-menu"
          :style="{ left: edgeMenu.x + 'px', top: edgeMenu.y + 'px' }"
          @click.stop
        >
          <button type="button" @click="connectSelected('follows')">
            follows
          </button>
          <button type="button" @click="connectSelected('used-by')">
            used-by
          </button>
          <button type="button" @click="connectSelected('semantic-subgraph')">
            semantic-subgraph
          </button>
        </div>
        <NiceDagNodes v-slot="slotProps" :niceDagReactive="niceDagReactive">
          <StartNode
            v-if="slotProps.node.data?.kind === 'workflow-start'"
            :node="slotProps.node"
            :editable="editMode"
            :selected="selectedNodeIds.includes(slotProps.node.id)"
            @edit="openEdit"
            @select="onNodeSelect"
          />
          <TargetNode
            v-else-if="slotProps.node.data?.kind === 'workflow-target'"
            :node="slotProps.node"
            :editable="editMode"
            :selected="selectedNodeIds.includes(slotProps.node.id)"
            @edit="openEdit"
            @select="onNodeSelect"
          />
          <EndContextNode
            v-else-if="slotProps.node.data?.kind === 'workflow-end'"
            :node="slotProps.node"
            :editable="editMode"
            :selected="selectedNodeIds.includes(slotProps.node.id)"
            @edit="openEdit"
            @select="onNodeSelect"
          />
          <ContextCollectorNode
            v-else-if="slotProps.node.data?.kind === 'context-collector'"
            :node="slotProps.node"
            :editable="editMode"
            :selected="selectedNodeIds.includes(slotProps.node.id)"
            @select="onNodeSelect"
          />
          <CategoryNode
            v-else-if="slotProps.node.data?.category"
            :node="slotProps.node"
            :editable="editMode"
            :selected="selectedNodeIds.includes(slotProps.node.id)"
            @edit="openEdit"
            @form="openCategoryForm"
            @select="onNodeSelect"
          />
          <CliAppNode
            v-else
            :node="slotProps.node"
            :editable="editMode"
            :selected="selectedNodeIds.includes(slotProps.node.id)"
            @edit="openEdit"
            @select="onNodeSelect"
          />
        </NiceDagNodes>
        <NiceDagEdges v-slot="slotProps" :niceDagReactive="niceDagReactive">
          <WorkflowEdge
            :source="slotProps.edge.source"
            :target="slotProps.edge.target"
            :edge-meta="edgeMeta"
            :theme="theme"
            :colored="edgeColored"
            :show-labels="true"
          />
        </NiceDagEdges>
        <EdgeLegend :theme="theme" :colored="edgeColored" />
        <div v-if="editMode" class="edit-palette" @click.stop>
          <button type="button" title="Add step" @click="addNodeKind('step')">
            + step
          </button>
          <button type="button" title="Add start" @click="addNodeKind('start')">
            + start
          </button>
          <button type="button" title="Add target" @click="addNodeKind('target')">
            + target
          </button>
          <button type="button" title="Add collector" @click="addNodeKind('collector')">
            + ctx
          </button>
          <button type="button" title="Add end" @click="addNodeKind('end')">
            + end
          </button>
        </div>
      </div>
    </div>
    <YamlEditModal
      :open="modalOpen"
      :title="modalTitle"
      :yaml="modalYaml"
      :node="modalNode"
      @close="modalOpen = false"
    />
    <ConfigFormModal
      :open="configFormOpen"
      :node="configFormNode"
      :uses="configFormUses"
      @close="configFormOpen = false"
    />
    <OutputFormModal
      :open="outputFormOpen"
      :node="outputFormNode"
      :uses="outputFormUses"
      @close="outputFormOpen = false"
    />
    <InputFormModal
      :open="inputFormOpen"
      :node="inputFormNode"
      :sources="inputSources"
      @close="inputFormOpen = false"
    />
    <ContextFormModal
      :open="contextFormOpen"
      :node="contextFormNode"
      @close="contextFormOpen = false"
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
import { EDGE_TYPE, edgeKey, resolveEdgeColor } from "./components/edgeMeta";
import { diagramToWorkflowYaml } from "./components/diagramYaml";
import CategoryNode from "./components/CategoryNode.vue";
import CliAppNode from "./components/CliAppNode.vue";
import StartNode from "./components/StartNode.vue";
import TargetNode from "./components/TargetNode.vue";
import EndContextNode from "./components/EndContextNode.vue";
import ContextCollectorNode from "./components/ContextCollectorNode.vue";
import WorkflowEdge from "./components/WorkflowEdge.vue";
import EdgeLegend from "./components/EdgeLegend.vue";
import YamlEditModal from "./components/YamlEditModal.vue";
import {
  createCollectorNode,
  createEndNode,
  createStartNode,
  createStepNode,
  createTargetNode,
} from "./components/nodeFactories";
import OutputFormModal from "./components/OutputFormModal.vue";
import InputFormModal from "./components/InputFormModal.vue";
import ContextFormModal from "./components/ContextFormModal.vue";
import ConfigFormModal from "./components/ConfigFormModal.vue";
import "./components/CliWorkflowView.css";
import "./theme.css";
import { applyTheme, normalizeTheme, readStoredTheme } from "./theme";
import { validateWorkflowYaml } from "./components/yamlValidate";

const CATEGORY_W = 160;
const CATEGORY_H = 56;
const COLLAPSED_W = 180;
const COLLAPSED_H = 64;
const START_SIZE = 72;
const TARGET_W = 140;
const TARGET_H = 48;
const END_SIZE = 88;
const COLLECTOR_SIZE = 28;
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
  if (node.data?.kind === NODE_KIND.CONTEXT_COLLECTOR) {
    return { width: COLLECTOR_SIZE, height: COLLECTOR_SIZE };
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
    ContextCollectorNode,
    CategoryNode,
    CliAppNode,
    WorkflowEdge,
    EdgeLegend,
    YamlEditModal,
    ConfigFormModal,
    OutputFormModal,
    InputFormModal,
    ContextFormModal,
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
    const settingsOpen = ref(false);
    const edgeColored = ref(true);
    const editMode = ref(false);
    const selectedNodeIds = ref([]);
    const edgeMenu = ref({ open: false, x: 0, y: 0 });
    const yamlText = ref(sampleYaml);
    /** Last YAML that successfully validated — diagram must not use invalid edits (R12-E5-02). */
    const lastGoodYaml = ref(sampleYaml);
    const yamlValid = ref(true);
    const yamlDiagnostics = ref([]);
    let validateSeq = 0;
    let validateTimer = null;

    const workflowDoc = yaml.load(sampleYaml);
    const mapped = workflowDocToNiceDagModel(workflowDoc || {});
    const initNodes = mapped.nodes;
    const edgeMeta = ref(mapped.edgeMeta);

    const runYamlValidate = async (text) => {
      const my = ++validateSeq;
      const result = await validateWorkflowYaml(text);
      if (my !== validateSeq) return;
      yamlDiagnostics.value = result.diagnostics || [];
      yamlValid.value = !!result.ok;
      if (result.ok) {
        lastGoodYaml.value = text;
        // Diagram remount from YAML is E5-S3; keep last-good only here so invalid never clobbers.
      }
    };

    const scheduleYamlValidate = (text) => {
      if (validateTimer) clearTimeout(validateTimer);
      validateTimer = setTimeout(() => {
        validateTimer = null;
        runYamlValidate(text);
      }, 400);
    };

    watch(yamlText, (text) => {
      scheduleYamlValidate(text);
    });

    const modalOpen = ref(false);
    const modalTitle = ref("");
    const modalYaml = ref("");
    const modalNode = ref(null);
    const configFormOpen = ref(false);
    const configFormNode = ref(null);
    const configFormUses = ref("");
    const outputFormOpen = ref(false);
    const outputFormNode = ref(null);
    const outputFormUses = ref("");
    const inputFormOpen = ref(false);
    const inputFormNode = ref(null);
    const contextFormOpen = ref(false);
    const contextFormNode = ref(null);

    const inputSources = computed(() => {
      const doc = (() => {
        try {
          return yaml.load(lastGoodYaml.value) || {};
        } catch {
          try {
            return yaml.load(yamlText.value) || {};
          } catch {
            return workflowDoc || {};
          }
        }
      })();
      const sources = [];
      const inputs = doc.inputs;
      if (inputs && typeof inputs === "object") {
        for (const key of Object.keys(inputs)) {
          sources.push({
            value: `$workflow.inputs.${key}`,
            label: `workflow input: ${key}`,
          });
        }
      }
      for (const step of doc.steps || []) {
        const vars = step.output?.vars;
        if (!vars || typeof vars !== "object") continue;
        for (const key of Object.keys(vars)) {
          sources.push({
            value: `$steps.${step.id}.vars.${key}`,
            label: `${step.id} → ${key}`,
          });
        }
      }
      return sources;
    });

    const getEdgeAttributes = (edge) => {
      const type =
        edgeMeta.value.get(edgeKey(edge.source.id, edge.target.id)) ||
        EDGE_TYPE.FOLLOWS;
      return {
        color: resolveEdgeColor(type, theme.value, edgeColored.value),
      };
    };

    const { niceDagEl, niceDagReactive } = useNiceDag(
      {
        initNodes,
        getNodeSize,
        graphLabel: { rankdir: "TB", ranksep: 56, edgesep: 28, nodesep: 36 },
        subViewPadding: { top: 56, bottom: 36, left: 36, right: 48 },
        gridConfig: { size: 20, color: "rgba(128,128,128,0.35)" },
        getEdgeAttributes,
      },
      true
    );

    const setTheme = (next) => {
      theme.value = normalizeTheme(next);
    };

    const prettyPrintYaml = () => {
      const niceDag = niceDagReactive.use();
      if (!niceDag?.getAllNodes) return;
      let base = {};
      try {
        // Prefer last-good so invalid pane text cannot poison pretty-print.
        base = yaml.load(lastGoodYaml.value) || {};
      } catch {
        try {
          base = yaml.load(yamlText.value) || {};
        } catch {
          base = {};
        }
      }
      yamlText.value = diagramToWorkflowYaml(niceDag.getAllNodes(), base);
    };

    const toggleEditMode = () => {
      const niceDag = niceDagReactive.use();
      if (!niceDag) return;
      if (editMode.value) {
        niceDag.stopEditing();
        editMode.value = false;
      } else {
        niceDag.startEditing();
        if ("gridVisible" in niceDag) niceDag.gridVisible = true;
        editMode.value = true;
      }
    };

    const refreshEdgeStrokes = () => {
      const niceDag = niceDagReactive.use();
      if (!niceDag?.getAllEdges) return;
      for (const edge of niceDag.getAllEdges()) {
        const path = edge.pathRef;
        if (!path) continue;
        const type =
          edgeMeta.value.get(edgeKey(edge.source.id, edge.target.id)) ||
          EDGE_TYPE.FOLLOWS;
        path.setAttribute(
          "stroke",
          resolveEdgeColor(type, theme.value, edgeColored.value)
        );
      }
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
        refreshEdgeStrokes();
      },
      { immediate: true }
    );

    watch(edgeColored, () => {
      refreshEdgeStrokes();
    });

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
      runYamlValidate(yamlText.value);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("message", onHostMessage);
      if (validateTimer) clearTimeout(validateTimer);
    });

    const highlightYaml = (code) => {
      try {
        return highlight(code || "", languages.yaml, "yaml");
      } catch (e) {
        return code || "";
      }
    };

    const onNodeSelect = (nodeId, event) => {
      if (!editMode.value) return;
      edgeMenu.value = { open: false, x: 0, y: 0 };
      const id = typeof nodeId === "string" ? nodeId : nodeId?.id;
      if (!id) return;
      if (event?.shiftKey) {
        const set = new Set(selectedNodeIds.value);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        selectedNodeIds.value = [...set].slice(-2);
      } else {
        selectedNodeIds.value = [id];
      }
    };

    const onDiagramContextMenu = (event) => {
      if (!editMode.value || selectedNodeIds.value.length !== 2) return;
      const col = event.currentTarget?.closest(".diagram-column");
      const bounds = col?.getBoundingClientRect() || { left: 0, top: 0 };
      edgeMenu.value = {
        open: true,
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
    };

    const connectSelected = (edgeType) => {
      const niceDag = niceDagReactive.use();
      const [srcId, tgtId] = selectedNodeIds.value;
      edgeMenu.value = { open: false, x: 0, y: 0 };
      if (!niceDag || !srcId || !tgtId) return;
      const source = niceDag.findNodeById(srcId);
      const target = niceDag.findNodeById(tgtId);
      if (!source || !target || typeof source.connect !== "function") return;
      const prior = [...(target.dependencies || [])];
      for (const depId of prior) {
        const dep = niceDag.findNodeById(depId);
        if (dep) target.removeDependency(dep);
      }
      source.connect(target);
      edgeMeta.value.set(edgeKey(srcId, tgtId), edgeType);
      refreshEdgeStrokes();
    };

    const addNodeKind = (kind) => {
      const niceDag = niceDagReactive.use();
      if (!niceDag || !editMode.value) return;
      const point = { x: 48, y: 48 };
      let node;
      if (kind === "step") node = createStepNode();
      else if (kind === "start") node = createStartNode();
      else if (kind === "target") node = createTargetNode();
      else if (kind === "end") node = createEndNode();
      else if (kind === "collector") node = createCollectorNode();
      else return;
      niceDag.addNode(node, point);
      if (kind === "step") {
        const col = createCollectorNode(node.id);
        niceDag.addNode(col, { x: point.x + 220, y: point.y });
      }
    };

    const openEdit = ({ node, yaml: y, title }) => {
      modalNode.value = node;
      modalYaml.value = y || "";
      modalTitle.value = title || node?.id || "";
      modalOpen.value = true;
    };

    const openCategoryForm = ({ node, uses, category }) => {
      const cat = category || node?.data?.category;
      const u = uses || node?.data?.uses || "";
      if (cat === "config") {
        configFormNode.value = node;
        configFormUses.value = u;
        configFormOpen.value = true;
        return;
      }
      if (cat === "output") {
        outputFormNode.value = node;
        outputFormUses.value = u;
        outputFormOpen.value = true;
        return;
      }
      if (cat === "input") {
        inputFormNode.value = node;
        inputFormOpen.value = true;
        return;
      }
      if (cat === "context") {
        contextFormNode.value = node;
        contextFormOpen.value = true;
      }
    };

    return {
      isEmbed,
      codeCollapsed,
      codePaneWidth,
      startDividerDrag,
      theme,
      setTheme,
      settingsOpen,
      edgeColored,
      editMode,
      toggleEditMode,
      prettyPrintYaml,
      edgeMeta,
      resetView,
      onDiagramWheel,
      onDiagramPanStart,
      yamlText,
      yamlValid,
      yamlDiagnostics,
      lastGoodYaml,
      niceDagEl,
      niceDagReactive,
      highlightYaml,
      modalOpen,
      modalTitle,
      modalYaml,
      modalNode,
      openEdit,
      configFormOpen,
      configFormNode,
      configFormUses,
      outputFormOpen,
      outputFormNode,
      outputFormUses,
      inputFormOpen,
      inputFormNode,
      inputSources,
      contextFormOpen,
      contextFormNode,
      openCategoryForm,
      selectedNodeIds,
      edgeMenu,
      onNodeSelect,
      onDiagramContextMenu,
      connectSelected,
      addNodeKind,
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
.settings-wrap {
  position: relative;
}
.settings-panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 20;
  min-width: 220px;
  padding: 10px 12px;
  background: var(--wd-surface);
  border: 1px solid var(--wd-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  color: var(--wd-text);
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  margin-bottom: 8px;
}
.settings-row select {
  font-size: 12px;
}
.settings-hint {
  margin: 0;
  font-size: 10px;
  color: var(--wd-text-muted);
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
.diagram-column.edit-mode .diagram-pane {
  outline: 1px dashed var(--wd-border);
}
.diagram-column.edit-mode .nice-dag-editor-bkg {
  opacity: 1;
}
.edit-palette {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 6;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 220px;
}
.edit-palette button {
  border: 1px solid var(--wd-border);
  background: var(--wd-surface);
  color: var(--wd-text-muted);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
}
.edit-palette button:hover {
  color: var(--wd-text);
}
.edge-context-menu {
  position: absolute;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--wd-surface);
  border: 1px solid var(--wd-border);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.edge-context-menu button {
  border: none;
  background: transparent;
  color: var(--wd-text);
  font-size: 11px;
  font-family: Consolas, Menlo, monospace;
  text-align: left;
  padding: 4px 8px;
  cursor: pointer;
}
.edge-context-menu button:hover {
  background: var(--wd-surface-muted);
}
.wf-node-selected {
  outline: 2px solid var(--wd-accent);
  outline-offset: 2px;
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
.validate-badge {
  font-size: 0.75rem;
  line-height: 1;
  padding: 0.15rem 0.35rem;
  border-radius: 0.25rem;
  font-weight: 600;
  user-select: none;
}
.validate-badge.is-ok {
  color: var(--wd-text-muted);
  opacity: 0.85;
}
.validate-badge.is-err {
  color: #b42318;
  background: rgba(180, 35, 24, 0.12);
}
[data-theme="dark"] .validate-badge.is-err {
  color: #f97066;
  background: rgba(249, 112, 102, 0.15);
}
.yaml-diagnostics {
  flex: 0 0 auto;
  max-height: 7.5rem;
  overflow: auto;
  border-top: 1px solid var(--wd-border);
  background: var(--wd-toolbar-bg);
  font-size: 0.72rem;
  line-height: 1.35;
  padding: 0.35rem 0.5rem;
}
.yaml-diag-row {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.2rem;
}
.yaml-diag-row.is-error {
  color: #b42318;
}
.yaml-diag-row.is-warn {
  color: #b54708;
}
[data-theme="dark"] .yaml-diag-row.is-error {
  color: #f97066;
}
[data-theme="dark"] .yaml-diag-row.is-warn {
  color: #fdb022;
}
.yaml-diag-loc {
  flex: 0 0 auto;
  opacity: 0.75;
  font-variant-numeric: tabular-nums;
}
.yaml-diag-msg {
  min-width: 0;
  word-break: break-word;
}
.prism-editor__textarea:focus {
  outline: none;
}
</style>
