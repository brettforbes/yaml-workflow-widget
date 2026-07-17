/**
 * Explain a workflow document (YAML or .sfw) for MCP (SPEC-012 E5-S5 / R12-E5-05).
 */
import { buildWorkflowDocument } from './build-document.js';
import { looksLikeWorkflowYaml } from './language/yaml-bridge.js';

function diagText(diagnostics: { severity?: number; message?: unknown }[] | undefined): string {
  const errs = (diagnostics ?? []).filter((d) => d.severity === 1);
  if (!errs.length) return '';
  return errs
    .slice(0, 12)
    .map((d) => {
      const msg = typeof d.message === 'string' ? d.message : String(d.message);
      return `- ${msg}`;
    })
    .join('\n');
}

/**
 * @returns human-readable explanation of the workflow AST
 */
export async function explainWorkflow(code: string): Promise<string> {
  const fileName = looksLikeWorkflowYaml(code) ? 'workflow.yaml' : 'workflow.sfw';
  const { document, fromYaml, sfwText } = await buildWorkflowDocument(code, fileName);
  const root = document.parseResult.value as {
    $type?: string;
    name?: string;
    workflowId?: string;
    apiVersion?: string;
    kind?: string;
    inputs?: { name?: string; type?: string }[];
    steps?: {
      name?: string;
      uses?: string;
      needs?: { $refText?: string; name?: string }[];
      context?: { export?: string };
    }[];
  };

  const lines: string[] = [];
  lines.push(`Source: ${fromYaml ? 'YAML (bridged to .sfw)' : '.sfw'}`);
  if (root?.$type !== 'Workflow') {
    lines.push('Parse: failed to obtain Workflow AST');
    const bad = diagText(document.diagnostics);
    if (bad) lines.push('Diagnostics:', bad);
    return lines.join('\n');
  }

  lines.push(`Workflow name: ${root.name || '(unnamed)'}`);
  if (root.workflowId) lines.push(`id: ${root.workflowId}`);
  if (root.apiVersion) lines.push(`apiVersion: ${root.apiVersion}`);
  if (root.kind) lines.push(`kind: ${root.kind}`);

  const inputs = root.inputs || [];
  lines.push(`Inputs (${inputs.length}):`);
  if (!inputs.length) lines.push('  (none)');
  for (const inp of inputs) {
    lines.push(`  - ${inp.name}: ${inp.type || 'string_list'}`);
  }

  const steps = root.steps || [];
  lines.push(`Steps (${steps.length}):`);
  for (const step of steps) {
    const needs = (step.needs || [])
      .map((n) => n.$refText || n.name || '?')
      .join(', ');
    const exportMode = step.context?.export;
    lines.push(
      `  - ${step.name}: uses ${step.uses || '?'}` +
        (needs ? `; needs [${needs}]` : '') +
        (exportMode ? `; context.export=${exportMode}` : ''),
    );
  }

  const bad = diagText(document.diagnostics);
  if (bad) {
    lines.push('Diagnostics:');
    lines.push(bad);
  } else {
    lines.push('Diagnostics: none');
  }

  if (fromYaml && sfwText) {
    lines.push(`Bridged .sfw size: ${sfwText.length} chars`);
  }
  return lines.join('\n');
}
