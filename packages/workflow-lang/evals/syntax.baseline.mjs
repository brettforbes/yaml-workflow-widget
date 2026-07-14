/**
 * Baseline syntax evals (no LLM required) — SPEC-008 / R8-04.
 * Run via: npm run eval:syntax
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EmptyFileSystem, URI } from 'langium';
import { createSfWorkflowServices } from '../out/language/main.js';

const here = dirname(fileURLToPath(import.meta.url));

async function diagnosticsFor(text, name) {
    const { shared } = createSfWorkflowServices(EmptyFileSystem);
    const document = shared.workspace.LangiumDocumentFactory.fromString(
        text,
        URI.file(join(here, name)),
    );
    await shared.workspace.DocumentBuilder.build([document], { validation: true });
    return (document.diagnostics ?? []).filter((d) => d.severity === 1);
}

function assert(cond, msg) {
    if (!cond) {
        throw new Error(msg);
    }
}

const minimal = readFileSync(join(here, '..', 'examples', 'minimal.sfw'), 'utf8');
const good = await diagnosticsFor(minimal, 'minimal.sfw');
assert(good.length === 0, `minimal.sfw should be clean, got ${JSON.stringify(good)}`);
console.log('EVAL_PASS minimal.sfw clean');

const badUses = minimal.replace('tool.subfinder', 'tool.nope');
const bad = await diagnosticsFor(badUses, 'bad-uses.sfw');
assert(
    bad.some((d) => /uses must be|ADAPTER_TOOLS/i.test(String(d.message))),
    'expected uses diagnostic for tool.nope',
);
console.log('EVAL_PASS rejects invalid uses');

const badApi = minimal.replace('spiderfeet.workflow/v1', 'other/v0');
const apiDiags = await diagnosticsFor(badApi, 'bad-api.sfw');
assert(
    apiDiags.some((d) => /apiVersion/i.test(String(d.message))),
    'expected apiVersion diagnostic',
);
console.log('EVAL_PASS rejects bad apiVersion');

console.log('EVAL_SUITE_OK');
