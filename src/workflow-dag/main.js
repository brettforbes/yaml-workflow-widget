import { createApp } from "vue";
import App from "./App.vue";

const el = document.getElementById("workflow-dag-root");
if (el) {
  createApp(App).mount(el);
} else {
  console.warn("[workflow-dag] #workflow-dag-root not found");
}
