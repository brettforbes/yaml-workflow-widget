/**
 * Smoke: parse 12A YAML via YAML→.sfw bridge into Langium AST.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWorkflowDocument } from './build-document.js';

const here = dirname(fileURLToPath(import.meta.url));
const yamlPath = join(
  here,
  '..',
  '..',
  '..',
  'src',
  'workflow-dag',
  'assets',
  '12A_Workflow_YAML_Example.yaml',
);
const text = readFileSync(yamlPath, 'utf8');
const { document, fromYaml } = await buildWorkflowDocument(
  text,
  '12A_Workflow_YAML_Example.yaml',
);

if (!fromYaml) {
  console.error('YAML_SMOKE_FAIL expected YAML detection');
  process.exit(1);
}

const errors = (document.diagnostics ?? []).filter((d) => d.severity === 1);
if (errors.length) {
  console.error('YAML_SMOKE_FAIL', errors.slice(0, 8));
  process.exit(1);
}

const root = document.parseResult.value as { $type?: string; steps?: unknown[] };
if (root?.$type !== 'Workflow') {
  console.error('YAML_SMOKE_FAIL expected Workflow AST', root?.$type);
  process.exit(1);
}
if (!Array.isArray(root.steps) || root.steps.length < 1) {
  console.error('YAML_SMOKE_FAIL expected steps on AST');
  process.exit(1);
}

console.log('YAML_PARSE_OK', root.$type, 'steps=', root.steps.length);

// Invalid YAML diagnostics
const bad = await buildWorkflowDocument(
  'apiVersion: [unterminated',
  'bad.yaml',
);
const badErrs = (bad.document.diagnostics ?? []).filter((d) => d.severity === 1);
const yamlDiag = badErrs.find((d) => {
  const msg = typeof d.message === 'string' ? d.message : String(d.message);
  return /Invalid YAML/i.test(msg);
});
if (!yamlDiag) {
  console.error(
    'YAML_SMOKE_FAIL expected Invalid YAML diagnostic',
    badErrs.slice(0, 5),
  );
  process.exit(1);
}
const okMsg =
  typeof yamlDiag.message === 'string'
    ? yamlDiag.message
    : String(yamlDiag.message);
console.log('YAML_DIAG_OK', okMsg);
