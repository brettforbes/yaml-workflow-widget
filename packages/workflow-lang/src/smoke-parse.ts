/**
 * Smoke: parse examples/minimal.sfw with generated services.
 * Run: node --experimental-vm-modules out/smoke-parse.js  (after build)
 * Or: npx tsx src/smoke-parse.ts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EmptyFileSystem, URI } from 'langium';
import { createSfWorkflowServices } from './language/main.js';

const here = dirname(fileURLToPath(import.meta.url));
const example = join(here, '..', 'examples', 'minimal.sfw');
const text = readFileSync(example, 'utf8');

const { shared, Workflow } = createSfWorkflowServices(EmptyFileSystem);
const document = shared.workspace.LangiumDocumentFactory.fromString(
    text,
    URI.file(example),
);
await shared.workspace.DocumentBuilder.build([document], { validation: true });

const errors = (document.diagnostics ?? []).filter((d) => d.severity === 1);
if (errors.length) {
    console.error('PARSE_FAIL', errors);
    process.exit(1);
}
console.log('PARSE_OK', document.parseResult.value?.$type);
void Workflow;
