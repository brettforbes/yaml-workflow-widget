# SfWorkflow MCP validate tool (SPEC-008 / R8-05)

## Tool

`sf-workflow-syntax-checker` — accepts `{ code: string }`, returns diagnostics text
or “no issues”.

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
