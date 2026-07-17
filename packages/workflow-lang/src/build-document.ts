/**
 * Build a Langium document from .sfw or YAML workflow text (SPEC-012 E5).
 */
import { EmptyFileSystem, URI, type LangiumDocument } from 'langium';
import { createSfWorkflowServices } from './language/main.js';
import {
  looksLikeWorkflowYaml,
  yamlTextToSfw,
} from './language/yaml-bridge.js';

export type BuildResult = {
  document: LangiumDocument;
  sfwText: string;
  fromYaml: boolean;
};

export async function buildWorkflowDocument(
  text: string,
  fileName = 'workflow.sfw',
): Promise<BuildResult> {
  const { shared } = createSfWorkflowServices(EmptyFileSystem);
  const fromYaml = looksLikeWorkflowYaml(text, fileName);
  let sfwText = text;
  const extraDiagnostics: LangiumDocument['diagnostics'] = [];

  if (fromYaml) {
    try {
      sfwText = yamlTextToSfw(text);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      extraDiagnostics.push({
        severity: 1,
        message: `Invalid YAML workflow: ${message}`,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 1 },
        },
      });
      sfwText =
        'workflow invalid { apiVersion "spiderfeet.workflow/v1" kind "Workflow" step placeholder { uses "tool.unknown" } }';
    }
  }

  const uri = URI.file(`/memory/${fileName.replace(/\\/g, '/')}`);
  const document = shared.workspace.LangiumDocumentFactory.fromString(
    sfwText,
    uri,
  );
  await shared.workspace.DocumentBuilder.build([document], {
    validation: true,
  });
  if (extraDiagnostics.length) {
    document.diagnostics = [
      ...(document.diagnostics ?? []),
      ...extraDiagnostics,
    ];
  }
  return { document, sfwText, fromYaml };
}
