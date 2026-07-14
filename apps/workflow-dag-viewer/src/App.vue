<template>
  <div class="dag-host" :class="{ embed: isEmbed }">
    <div class="toolbar border-bottom px-2 py-1 d-flex align-items-center gap-2">
      <strong class="me-auto">CLI Workflow DAG</strong>
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
      <a
        v-else
        class="btn btn-sm btn-outline-secondary"
        href="?"
        >Full page</a
      >
    </div>
    <div class="container-fluid g-0 flex-grow-1 overflow-hidden">
      <div class="row g-0 h-100">
        <div
          v-if="!isEmbed"
          class="h-100 border-end"
          :class="codeCollapsed ? 'col-0 d-none' : 'col-6'"
        >
          <div class="code-pane h-100 d-flex flex-column">
            <div class="px-2 py-1 small text-muted border-bottom">
              12A_Workflow_YAML_Example.yaml
            </div>
            <prism-editor
              class="yaml-editor flex-grow-1"
              v-model="yamlText"
              :highlight="highlightYaml"
              line-numbers
              readonly
            />
          </div>
        </div>
        <div
          class="h-100"
          :class="
            isEmbed
              ? 'col-12 embed-diagram'
              : codeCollapsed
                ? 'col-12'
                : 'col-6'
          "
        >
          <div class="diagram-pane h-100 position-relative" ref="niceDagEl" />
          <NiceDagNodes v-slot="slotProps" :niceDagReactive="niceDagReactive">
            <CategoryNode
              v-if="slotProps.node.data?.category"
              :node="slotProps.node"
              @edit="openEdit"
            />
            <CliAppNode
              v-else
              :node="slotProps.node"
              @edit="openEdit"
            />
          </NiceDagNodes>
          <NiceDagEdges :niceDagReactive="niceDagReactive" />
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
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import yaml from "js-yaml";
import { NiceDagNodes, NiceDagEdges, useNiceDag } from "@ebay/nice-dag-vue3";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-yaml";
import sampleYaml from "./assets/12A_Workflow_YAML_Example.yaml?raw";
import { workflowStepsToNiceDagModel } from "./components/mapper";
import CategoryNode from "./components/CategoryNode.vue";
import CliAppNode from "./components/CliAppNode.vue";
import YamlEditModal from "./components/YamlEditModal.vue";
import "./components/CliWorkflowView.css";

const CATEGORY_W = 160;
const CATEGORY_H = 56;
const COLLAPSED_W = 180;
const COLLAPSED_H = 64;

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

    onMounted(() => {
      const niceDag = niceDagReactive.use();
      if (niceDag && niceDagEl.value) {
        const bounds = niceDagEl.value.getBoundingClientRect();
        niceDag.center({
          width: bounds.width,
          height: Math.max(bounds.height, 500),
        });
      }
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
#app {
  height: 100%;
  margin: 0;
}
.dag-host {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f7f7;
}
.yaml-editor {
  background: #2d2d2d;
  color: #ccc;
  font-family: Consolas, Menlo, monospace;
  font-size: 12px;
  line-height: 1.45;
  overflow: auto;
  height: 100%;
}
.diagram-pane {
  min-height: 480px;
  background: #fafafa;
}
.dag-host.embed .embed-diagram {
  max-width: 33.333%; /* ~4 bootstrap cols */
  margin: 0 auto;
}
.code-pane {
  background: #1e1e1e;
  height: 100%;
}
.prism-editor__textarea:focus {
  outline: none;
}
</style>
