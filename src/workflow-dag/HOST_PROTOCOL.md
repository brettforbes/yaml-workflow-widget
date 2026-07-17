# Host ↔ iframe postMessage protocol (SPEC-012 E6 / R12-E6-01)

Channel: `window.parent.postMessage` / iframe `message` events.  
Payload: JSON object (or JSON string). Prefer objects; stringified JSON is accepted.

Envelope (compatible with `src/js/#events.js` `compileEventData`):

```json
{
  "type": "<messageType>",
  "action": "<optional alias of type>",
  "payload": {},
  "target": "iframe" | "parent",
  "requestId": "<optional correlation id>"
}
```

Messages with `target: "parent"` are ignored by the iframe listener (loop guard).  
Outbound widget → host messages use `target: "parent"`.

## Host → iframe (inbound)

| type / action | payload | effect |
|---------------|---------|--------|
| `setYaml` | `{ yaml: string }` or string | Replace code-pane YAML; validate; update diagram when valid |
| `getYaml` | `{ requestId?: string }` | Reply with `yamlResult` |
| `setTheme` | `{ theme: "light"\|"dark" }` or `"light"\|"dark"` | Apply E1 theme; emit `themeChanged` |
| `selectStep` | `{ stepId: string }` | Select / scroll to step node when present |
| `mcpExplain` | `{ code?: string }` | Reply `mcpResult` with explain text (E6-S5) |
| `mcpProduce` | `{ intent: string }` | Reply `mcpResult` with produced YAML (E6-S5) |

## Iframe → host (outbound)

| type | payload | when |
|------|---------|------|
| `yamlChanged` | `{ yaml: string }` | Valid YAML applied / diagram→YAML sync |
| `validationResult` | `{ ok: boolean, diagnostics: object[] }` | After debounced validate |
| `yamlResult` | `{ yaml: string, ok: boolean, requestId?: string }` | Response to `getYaml` |
| `stepSelected` | `{ stepId: string }` | User selects a step node |
| `mcpResult` | `{ ok: boolean, text?: string, yaml?: string, requestId?: string, error?: string }` | Response to MCP bridge calls |
| `themeChanged` | `{ theme: "light"\|"dark" }` | After theme applies (host or UI) |

## Step selection (R12-E6-04)

- **Host → iframe `selectStep`**: `{ stepId }` selects the Nice-DAG node (scroll into view when possible) and updates `selectedNodeIds`.
- **Iframe → host `stepSelected`**: emitted when the user clicks a step/start/target/end/collector node (edit mode and read mode).
- Host tabs can drive the diagram; diagram clicks can drive host tabs.


- **`setYaml`**: replaces the code pane and **immediately** validates; valid YAML remounts the diagram; emits `validationResult` and (when ok) `yamlChanged`.
- **`getYaml`**: replies with `yamlResult` containing **last-good validated** YAML (`ok` mirrors validate state). Invalid edits in the pane do not overwrite last-good until validation succeeds.


```js
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({ type: 'setTheme', payload: { theme: 'dark' }, target: 'iframe' }, '*');
iframe.contentWindow.postMessage({ type: 'getYaml', payload: { requestId: '1' }, target: 'iframe' }, '*');
window.addEventListener('message', (e) => console.log('from widget', e.data));
```
