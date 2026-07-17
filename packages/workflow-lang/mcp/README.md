# SfWorkflow MCP tools (SPEC-008 / SPEC-012 E5-S5)

## Tools

| Tool | Input | Output |
|------|--------|--------|
| `sf-workflow-syntax-checker` | `{ code }` | diagnostics or “no issues” |
| `explain_workflow` | `{ code }` | YAML/.sfw explanation (inputs, steps, diagnostics) |
| `produce_workflow` | `{ intent }` | valid workflow YAML |

## Smoke

```bash
npm run mcp:smoke
```

## Start (stdio)

```bash
npm run mcp:start
```

## Cursor MCP snippet

Add under `.cursor/mcp.json` `mcpServers` (adjust path):

```json
"sf-workflow": {
  "type": "stdio",
  "command": "npx",
  "args": ["tsx", "packages/workflow-lang/mcp/mcp-server.ts"],
  "cwd": "C:/projects/yaml-workflow-widget"
}
```

Requires `tsx` on PATH/npx. Uses real Langium services from this package.
