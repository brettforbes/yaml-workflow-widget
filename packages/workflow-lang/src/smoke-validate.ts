/**
 * Smoke: valid minimal.sfw parses clean; invalid uses emits R7-01-03 diagnostic.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EmptyFileSystem, URI } from 'langium';
import { createSfWorkflowServices } from './language/main.js';

const here = dirname(fileURLToPath(import.meta.url));

async function validateText(text: string, name: string) {
    const { shared } = createSfWorkflowServices(EmptyFileSystem);
    const document = shared.workspace.LangiumDocumentFactory.fromString(
        text,
        URI.file(join(here, name)),
    );
    await shared.workspace.DocumentBuilder.build([document], { validation: true });
    return document.diagnostics ?? [];
}

const good = readFileSync(join(here, '..', 'examples', 'minimal.sfw'), 'utf8');
const goodDiags = await validateText(good, 'minimal.sfw');
const goodErrors = goodDiags.filter((d) => d.severity === 1);
if (goodErrors.length) {
    console.error('VALID_FAIL', goodErrors);
    process.exit(1);
}
console.log('VALID_OK minimal.sfw');

const bad = good.replace('tool.subfinder', 'tool.nope');
const badDiags = await validateText(bad, 'bad-uses.sfw');
const usesError = badDiags.find((d) => {
    const msg = typeof d.message === 'string' ? d.message : '';
    return d.severity === 1 && /ADAPTER_TOOLS|uses must be/i.test(msg);
});
if (!usesError) {
    console.error('VALID_FAIL expected uses diagnostic', badDiags);
    process.exit(1);
}
console.log('VALID_OK rejects tool.nope');
