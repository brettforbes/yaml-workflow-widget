/**
 * SfWorkflow MCP server — validate tool (SPEC-008 / R8-05).
 *
 * Tool: `sf-workflow-syntax-checker`
 * Start: `npm run mcp:start` from packages/workflow-lang
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { validateWorkflowCode } from '../out/validate-code.js';

const server = new McpServer({
    name: 'sf-workflow-mcp-server',
    version: '0.1.0',
});

server.registerTool(
    'sf-workflow-syntax-checker',
    {
        title: 'SfWorkflow Syntax Checker',
        description:
            'Validates SfWorkflow (.sfw) code and returns diagnostics (errors, warnings, hints).',
        inputSchema: { code: z.string() },
    },
    async ({ code }) => {
        const result = await validateWorkflowCode(code);
        return {
            content: [
                {
                    type: 'text',
                    text: result ?? 'The provided code has no issues.',
                },
            ],
        };
    },
);

const transport = new StdioServerTransport();
await server.connect(transport);
