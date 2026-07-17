/**
 * SfWorkflow MCP server — validate + explain + produce (SPEC-008 / SPEC-012 E5-S5).
 *
 * Tools: sf-workflow-syntax-checker, explain_workflow, produce_workflow
 * Start: `npm run mcp:start` from packages/workflow-lang
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { validateWorkflowCode } from '../out/validate-code.js';
import { explainWorkflow } from '../out/explain-workflow.js';
import { produceWorkflowYaml } from '../out/produce-workflow.js';
import { buildWorkflowDocument } from '../out/build-document.js';

const server = new McpServer({
    name: 'sf-workflow-mcp-server',
    version: '0.2.0',
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

server.registerTool(
    'explain_workflow',
    {
        title: 'Explain Workflow',
        description:
            'Explain a SpiderFeet workflow from YAML or .sfw: inputs, steps, uses/needs, diagnostics.',
        inputSchema: { code: z.string() },
    },
    async ({ code }) => {
        const text = await explainWorkflow(code);
        return { content: [{ type: 'text', text }] };
    },
);

server.registerTool(
    'produce_workflow',
    {
        title: 'Produce Workflow',
        description:
            'Produce a valid SpiderFeet workflow YAML from a short intent (tool keywords optional).',
        inputSchema: { intent: z.string() },
    },
    async ({ intent }) => {
        const yaml = produceWorkflowYaml(intent);
        const { document } = await buildWorkflowDocument(yaml, 'produced.yaml');
        const errors = (document.diagnostics ?? []).filter((d) => d.severity === 1);
        const header =
            errors.length === 0
                ? '# produced YAML (validated)\n'
                : `# produced YAML (warnings/errors present)\n`;
        return {
            content: [{ type: 'text', text: header + yaml }],
        };
    },
);

const transport = new StdioServerTransport();
await server.connect(transport);
