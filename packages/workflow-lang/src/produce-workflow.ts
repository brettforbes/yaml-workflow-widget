/**
 * Produce a valid workflow YAML document from a short intent (SPEC-012 E5-S5).
 * Deterministic template — not an LLM; tools inferred from keywords when possible.
 */
import { yamlTextToSfw } from './language/yaml-bridge.js';

const TOOL_KEYWORDS: { re: RegExp; uses: string; id: string }[] = [
  { re: /\bsubfinder\b/i, uses: 'tool.subfinder', id: 'sfp_cli_subfinder' },
  { re: /\bnmap\b/i, uses: 'tool.nmap', id: 'sfp_cli_nmap' },
  { re: /\bnerva\b/i, uses: 'tool.nerva', id: 'sfp_cli_nerva' },
  { re: /\bhttpx\b/i, uses: 'tool.httpx', id: 'sfp_cli_httpx' },
  { re: /\bkatana\b/i, uses: 'tool.katana', id: 'sfp_cli_katana' },
  { re: /\bnuclei\b/i, uses: 'tool.nuclei', id: 'sfp_cli_nuclei' },
];

function defaultStep(): { id: string; uses: string } {
  return { id: 'sfp_cli_subfinder', uses: 'tool.subfinder' };
}

/**
 * Build a minimal valid SpiderFeet Workflow YAML from an intent string.
 */
export function produceWorkflowYaml(intent: string): string {
  const found = TOOL_KEYWORDS.filter((t) => t.re.test(intent || ''));
  const steps = found.length ? found : [defaultStep()];

  const stepBlocks = steps.map((s, i) => {
    const needs =
      i === 0
        ? ''
        : `  needs:\n    - ${steps[i - 1].id}\n`;
    return (
      `- id: ${s.id}\n` +
      `  uses: ${s.uses}\n` +
      needs +
      `  input:\n` +
      `    type: string_list\n` +
      `    from: $workflow.inputs.targets\n` +
      `  config:\n` +
      `    argv: []\n` +
      `  context:\n` +
      `    export: none\n`
    );
  });

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  const name = (intent || 'generated').trim().slice(0, 60) || 'generated';
  const yaml = [
    'apiVersion: spiderfeet.workflow/v1',
    'kind: Workflow',
    `id: workflow--${uuid}`,
    'info:',
    `  name: ${JSON.stringify(name)}`,
    '  description: Produced by produce_workflow MCP tool',
    'inputs:',
    '  targets:',
    '    type: string_list',
    '    description: Seed targets',
    '    default:',
    '      - https://example.com',
    'steps:',
    ...stepBlocks.map((b) => b.trimEnd()),
  ].join('\n');

  // Ensure bridge can convert (throws if structurally invalid).
  yamlTextToSfw(yaml);
  return yaml.trimEnd() + '\n';
}
