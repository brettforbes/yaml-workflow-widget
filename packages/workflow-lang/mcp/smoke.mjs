/**
 * MCP validate smoke (no stdio server) — SPEC-008 / R8-05.
 * Run: npm run mcp:smoke
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateWorkflowCode } from '../out/validate-code.js';

const here = dirname(fileURLToPath(import.meta.url));
const minimal = readFileSync(join(here, '..', 'examples', 'minimal.sfw'), 'utf8');

const clean = await validateWorkflowCode(minimal);
if (clean) {
    console.error('MCP_SMOKE_FAIL expected clean minimal.sfw', clean);
    process.exit(1);
}
console.log('MCP_SMOKE_OK clean');

const bad = await validateWorkflowCode(minimal.replace('tool.subfinder', 'tool.nope'));
if (!bad || !/uses must be|ADAPTER_TOOLS/i.test(bad)) {
    console.error('MCP_SMOKE_FAIL expected uses diagnostic', bad);
    process.exit(1);
}
console.log('MCP_SMOKE_OK returns diagnostics for tool.nope');
console.log('MCP_SMOKE_SUITE_OK');
