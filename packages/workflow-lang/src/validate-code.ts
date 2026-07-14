/**
 * Shared validate helper used by MCP tool + smoke (SPEC-008 / R8-05).
 */
import { EmptyFileSystem, URI } from 'langium';
import { createSfWorkflowServices } from './language/main.js';

export async function validateWorkflowCode(code: string): Promise<string | undefined> {
    const { shared } = createSfWorkflowServices(EmptyFileSystem);
    const document = shared.workspace.LangiumDocumentFactory.fromString(
        code,
        URI.file('/memory/mcp-validate.sfw'),
    );
    await shared.workspace.DocumentBuilder.build([document], { validation: true });
    const diagnostics = document.diagnostics ?? [];
    if (diagnostics.length === 0) {
        return undefined;
    }
    return diagnostics
        .map((d) => {
            const sev = severityText(d.severity);
            const line = (d.range?.start.line ?? 0) + 1;
            const col = (d.range?.start.character ?? 0) + 1;
            const msg = typeof d.message === 'string' ? d.message : String(d.message);
            return `${sev}: ${msg} at line ${line}, column ${col}`;
        })
        .join('\n');
}

function severityText(severity: number | undefined): string {
    switch (severity) {
        case 1:
            return 'Error';
        case 2:
            return 'Warning';
        case 3:
            return 'Information';
        case 4:
            return 'Hint';
        default:
            return 'Unknown';
    }
}
