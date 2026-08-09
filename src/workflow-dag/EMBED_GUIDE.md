# Embedding the CLI Workflow DAG iframe

Guide for **host applications** (another repo) that embed the yaml-workflow-widget as an iframe and drive it via `postMessage`.

| Topic | Where it lives |
|-------|----------------|
| Message types & payloads | [`HOST_PROTOCOL.md`](HOST_PROTOCOL.md) |
| Constants / helpers | [`hostProtocol.js`](hostProtocol.js) |
| Widget UI | `src/workflow-dag/App.vue` |
| Legacy jQuery helpers | `src/js/#events.js` (`Widgets.Events.compileEventData`, `raiseEvent`) |

---

## 1. Quick start

**Dev URL** (this repo): run `.\start.ps1` → `http://localhost:4009/`  
**Production**: serve the webpack build (`dist/index.html`) from your host origin or a trusted CDN.

```html
<iframe
  id="workflow-dag"
  src="https://your-host.example/workflows/widget/?embed=1"
  title="Workflow diagram"
  style="width: 420px; height: 100vh; border: none;"
></iframe>
```

```js
const iframe = document.getElementById("workflow-dag");

function postToWidget(type, payload = {}, requestId) {
  iframe.contentWindow.postMessage(
    { type, action: type, payload, target: "iframe", requestId },
    "*" // replace with widget origin in production
  );
}

window.addEventListener("message", (event) => {
  // if (event.origin !== WIDGET_ORIGIN) return;
  const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  if (!data || data.target !== "parent") return;
  console.log("widget → host", data.type, data.payload);
});
```

Wait for the widget **`ready`** message (`payload.version`, currently `1.0.0`) before sending commands.

---

## 2. YAML: send, receive, and execute

The widget validates YAML with Langium, updates the diagram only when validation succeeds, and keeps a **last-good** copy for export.

### Host → iframe

| Message | Payload | Effect |
|---------|---------|--------|
| `setYaml` | `{ yaml: string }` or raw string | Replace editor text; validate immediately; remount diagram if valid |
| `getYaml` | `{ requestId?: string }` | Reply with `yamlResult` |

```js
postToWidget("setYaml", {
  yaml: `apiVersion: workflow/v1
kind: Workflow
id: my-run
steps:
  sfp_cli_subfinder:
    uses: tool.subfinder
    needs: []
`,
});

postToWidget("getYaml", {}, "exec-1");
```

### Iframe → host

| Message | When | Use for execution |
|---------|------|-------------------|
| `validationResult` | After validate (typing debounced ~400ms; immediate on `setYaml`) | Gate run buttons on `ok` |
| `yamlChanged` | Valid YAML applied to diagram (host push or user edit) | **Preferred trigger** to refresh runner state |
| `yamlResult` | Response to `getYaml` | Pull YAML on demand before execute |

```js
window.addEventListener("message", (event) => {
  const data = parse(event.data);
  if (data?.target !== "parent") return;

  switch (data.type) {
    case "ready":
      postToWidget("setYaml", { yaml: initialWorkflowYaml });
      break;

    case "yamlChanged":
      runner.loadWorkflow(data.payload.yaml);
      break;

    case "yamlResult":
      if (data.payload.requestId === "exec-1" && data.payload.ok) {
        runner.execute(data.payload.yaml);
      }
      break;

    case "validationResult":
      runButton.disabled = !data.payload.ok;
      break;
  }
});
```

**Important**

- `getYaml` / `yamlResult.yaml` returns **last validated** YAML only. Invalid in-progress edits in the code pane are not exported (`ok: false`).
- Diagram edits in **edit mode** (✎) sync back to YAML and eventually emit `yamlChanged` after re-validation.
- For execution, either listen for `yamlChanged` or call `getYaml` immediately before run.

Canonical sample: `src/workflow-dag/assets/12A_Workflow_YAML_Example.yaml`.

---

## 3. Layout modes (iframe + host container)

Several UX modes are **split between the widget URL/query params and the host page layout**. The host always controls iframe `width`, `height`, and visibility.

### 3.1 Diagram-only (narrow strip)

**Goal:** Show only the workflow diagram — no YAML code column.

**Widget:** load with **`?embed=1`**

- Hides the YAML code pane and split divider.
- Diagram column uses full-bleed `.embed-diagram` styling (fills the iframe; no ⅓-width shrink — R13-22).
- Embed chrome is host-driven (`setEditMode` / `openSettings`); settings can still open inside the iframe.

**Host:** size the iframe to the Composer column width (partial or full); min height **~520px** because `.diagram-pane` min-height is 480px.

```html
<iframe src="/workflows/widget/?embed=1" style="width: 440px; height: 100%; border: 0;"></iframe>
```

### 3.2 Full page (diagram + YAML)

**Goal:** Two-column layout with YAML editor and diagram (as in local dev).

**Widget:** load **without** `embed` (or `?embed=0`).

```html
<iframe src="/workflows/widget/" style="width: 100%; height: 100vh; border: 0;"></iframe>
```

Inside the widget, users can collapse the code pane with the **‹** control on the split divider; the host can also widen the iframe to full viewport.

To open full page from embed mode programmatically, navigate the iframe:

```js
iframe.src = iframe.src.replace(/\?embed=1&?|\?&embed=1|embed=1&?/g, "").replace(/\?$/, "");
```

### 3.3 Collapsed to zero width (launcher tab)

**Not implemented inside the widget.** The host shell provides a **left-edge tab / icon** and toggles iframe width between `0` (or a few pixels) and the open width.

```html
<div class="host-shell">
  <button type="button" id="wf-toggle" class="wf-launcher" title="Workflow">⎘</button>
  <iframe id="workflow-dag" class="wf-panel" src="…?embed=1"></iframe>
  <main class="host-content">…</main>
</div>
```

```css
.host-shell { display: flex; height: 100vh; }
.wf-launcher {
  flex: 0 0 28px;
  writing-mode: vertical-rl;
  border: none;
  background: var(--sidebar-bg);
  cursor: pointer;
}
.wf-panel {
  flex: 0 0 auto;
  width: 440px;
  border: none;
  transition: width 0.2s ease, opacity 0.2s ease;
}
.host-shell.wf-collapsed .wf-panel {
  width: 0;
  opacity: 0;
  pointer-events: none;
}
.host-content { flex: 1 1 auto; min-width: 0; }
```

```js
const shell = document.querySelector(".host-shell");
document.getElementById("wf-toggle").addEventListener("click", () => {
  shell.classList.toggle("wf-collapsed");
});
```

When collapsed, keep the iframe in the DOM (or `display:none`) so `postMessage` still works when re-opened; re-send `setYaml` if you destroy/recreate the iframe.

---

## 4. Light / dark theme

### Host → iframe

```js
postToWidget("setTheme", { theme: "dark" }); // or "light"
```

Payload may also be the string `"dark"` / `"light"` directly.

### Iframe → host

After theme applies (host command or in-widget Settings):

```js
// { type: "themeChanged", payload: { theme: "dark" }, target: "parent" }
```

Persist theme in the host and re-apply on iframe load:

```js
case "ready":
  postToWidget("setTheme", { theme: hostStoredTheme });
  break;
case "themeChanged":
  hostStoredTheme = data.payload.theme;
  break;
```

Widget storage key (standalone): `workflow-dag-theme` in `localStorage` (`theme.js`).

---

## 5. Step selection → open another iframe / tab

When the user clicks a diagram node, the widget emits **`stepSelected`**. Host tabs, detail panes, or secondary iframes should subscribe to this.

### Iframe → host

```js
// { type: "stepSelected", payload: { stepId: "sfp_cli_subfinder" }, target: "parent" }
```

**`stepId` values** (examples):

| Node | Typical `stepId` |
|------|------------------|
| CLI step | YAML step key, e.g. `sfp_cli_subfinder`, `sfp_cli_httpx` |
| Start transition | `__workflow_start__` |
| Target step | `__workflow_target__` |
| End context transition | `__workflow_end__` |
| Context collector | `__ctxcol_<stepId>__` or `__ctxcol_rank_<n>__` |
| Expanded category sub-step | `<parentId>__input` / `__config` / `__context` / `__output` (child node ids) |

Works in **read and edit** mode (single-select; shift-click multi-select in edit mode still emits for the clicked node).

### Host → iframe (sync selection from tabs)

```js
postToWidget("selectStep", { stepId: "sfp_cli_nmap" });
```

Selects the node and scrolls it into view when possible.

### Example: open a detail iframe per step

```js
const detailFrame = document.getElementById("step-detail");

window.addEventListener("message", (event) => {
  const data = parse(event.data);
  if (data?.type !== "stepSelected") return;

  const { stepId } = data.payload;
  if (stepId.startsWith("__")) return;

  detailFrame.src = `/tools/detail/?step=${encodeURIComponent(stepId)}`;
  detailFrame.hidden = false;
});
```

---

## 6. Optional: MCP bridge (in-iframe)

| Host → iframe | Iframe → host |
|---------------|---------------|
| `mcpExplain` `{ code?: string }` | `mcpResult` `{ ok, text?, error? }` |
| `mcpProduce` `{ intent: string }` | `mcpResult` `{ ok, yaml?, error? }` |

Prefer the stdio MCP server in `packages/workflow-lang/mcp` when the host runs outside the browser.

---

## 7. Message envelope (reference)

All messages use the same shape (see [`HOST_PROTOCOL.md`](HOST_PROTOCOL.md)):

```json
{
  "type": "setYaml",
  "action": "setYaml",
  "payload": { "yaml": "…" },
  "target": "iframe",
  "requestId": "optional-correlation-id"
}
```

- Host → widget: `"target": "iframe"`.
- Widget → host: `"target": "parent"` (widget ignores inbound messages with `target: "parent"`).
- JSON string bodies are accepted.

Legacy hosts may use `Widgets.Events.compileEventData(payload, type, type, null, null, "iframe")` from `src/js/#events.js`.

---

## 8. Security checklist

1. **Validate `event.origin`** against the widget deployment origin before handling messages.
2. **Pass a specific target origin** to `postMessage` instead of `"*"` in production.
3. **Do not execute YAML** from the widget without your own validation pipeline; treat `yamlChanged` as untrusted input until your runner accepts it.
4. Use **HTTPS** for both host and iframe when deployed.

---

## 9. Host layout summary

| User goal | Widget URL | Host responsibility |
|-----------|------------|---------------------|
| Send/receive YAML | any | `setYaml`, `getYaml`, listen for `yamlChanged` / `yamlResult` |
| Diagram-only width | `?embed=1` | Set iframe width ~400–520px, full height |
| Full page + YAML | no `embed` param | Full-viewport iframe |
| Zero-width launcher | `?embed=1` (recommended) | Collapse iframe width; show left-edge icon/button |
| Theme | any | `setTheme` on load; listen for `themeChanged` |
| Step → tab/iframe | any | Listen for `stepSelected`; `selectStep` to sync back |

---

## 10. Verification (this repo)

```bash
node src/workflow-dag/hostProtocol.smoke.mjs
node src/workflow-dag/hostYaml.smoke.mjs
node src/workflow-dag/hostSelection.smoke.mjs
node src/workflow-dag/hostTheme.smoke.mjs
```

Manual: embed `http://localhost:4009/?embed=1` in a test HTML page and exercise the flows above in DevTools.
