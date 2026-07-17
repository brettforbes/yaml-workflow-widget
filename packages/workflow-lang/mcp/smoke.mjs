/**
 * MCP smoke — validate + explain_workflow + produce_workflow (SPEC-012 E5-S5).
 * Run: npm run mcp:smoke
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateWorkflowCode } from '../out/validate-code.js';
import { explainWorkflow } from '../out/explain-workflow.js';
import { produceWorkflowYaml } from '../out/produce-workflow.js';
import { buildWorkflowDocument } from '../out/build-document.js';

const here = dirname(fileURLToPath(import.meta.url));
const minimal = readFileSync(join(here, '..', 'examples', 'minimal.sfw'), 'utf8');
const yaml12a = readFileSync(
    join(
        here,
        '..',
        '..',
        '..',
        'src',
        'workflow-dag',
        'assets',
        '12A_Workflow_YAML_Example.yaml',
    ),
    'utf8',
);

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

const explained = await explainWorkflow(yaml12a);
if (!/Steps \(6\)/i.test(explained) && !/sfp_cli_subfinder/i.test(explained)) {
    console.error('MCP_SMOKE_FAIL explain_workflow 12A', explained.slice(0, 500));
    process.exit(1);
}
console.log('MCP_SMOKE_OK explain_workflow 12A');

const produced = produceWorkflowYaml('recon with nmap and httpx');
if (!/uses: tool\.nmap/.test(produced) || !/uses: tool\.httpx/.test(produced)) {
    console.error('MCP_SMOKE_FAIL produce_workflow tools', produced);
    process.exit(1);
}
const { document } = await buildWorkflowDocument(produced, 'produced.yaml');
const errs = (document.diagnostics ?? []).filter((d) => d.severity === 1);
if (errs.length) {
    console.error('MCP_SMOKE_FAIL produce_workflow diagnostics', errs.slice(0, 5));
    process.exit(1);
}
console.log('MCP_SMOKE_OK produce_workflow valid YAML');
console.log('MCP_SMOKE_SUITE_OK');
