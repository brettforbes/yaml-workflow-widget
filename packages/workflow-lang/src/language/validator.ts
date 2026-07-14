/**
 * Validators mirroring SPEC-007 R7-01 / R7-02 (SPEC-008 / R8-03).
 */
import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type {
    GseBinding,
    Step,
    Workflow,
    WorkflowAstType,
} from './generated/ast.js';
import type { SfWorkflowServices } from './workflow-module.js';

const API_VERSION = 'spiderfeet.workflow/v1';
const KIND = 'Workflow';
const USES_RE =
    /^tool\.(nmap|netdiscover|nerva|pius|subfinder|httpx|katana|nuclei)$/;
const STEP_ID_RE = /^[a-z][a-z0-9_]*$/;
const WORKFLOW_ID_RE =
    /^workflow--[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const EMPTY_POLICIES = new Set(['error', 'skip_step', 'continue']);
const CONTEXT_EXPORTS = new Set(['scan_graph', 'none']);

export function registerValidationChecks(services: SfWorkflowServices): void {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SfWorkflowValidator;
    const checks: ValidationChecks<WorkflowAstType> = {
        Workflow: validator.checkWorkflow.bind(validator),
        Step: validator.checkStep.bind(validator),
        GseBinding: validator.checkGseBinding.bind(validator),
    };
    registry.register(checks, validator);
}

export class SfWorkflowValidator {
    checkWorkflow(workflow: Workflow, accept: ValidationAcceptor): void {
        if (workflow.apiVersion !== API_VERSION) {
            accept('error', `apiVersion must be "${API_VERSION}" (R7-01-01)`, {
                node: workflow,
                property: 'apiVersion',
            });
        }
        if (workflow.kind !== KIND) {
            accept('error', `kind must be "${KIND}" (R7-01-01)`, {
                node: workflow,
                property: 'kind',
            });
        }
        if (workflow.workflowId && !WORKFLOW_ID_RE.test(workflow.workflowId)) {
            accept(
                'error',
                'id must match workflow--<uuid> (workflow_v1.schema.json)',
                { node: workflow, property: 'workflowId' },
            );
        }
        if (!workflow.steps || workflow.steps.length < 1) {
            accept('error', 'Workflow must declare at least one step (R7-01)', {
                node: workflow,
                property: 'steps',
            });
        }
        const seen = new Set<string>();
        for (const step of workflow.steps ?? []) {
            if (seen.has(step.name)) {
                accept('error', `Duplicate step id "${step.name}"`, {
                    node: step,
                    property: 'name',
                });
            }
            seen.add(step.name);
        }
    }

    checkStep(step: Step, accept: ValidationAcceptor): void {
        if (!STEP_ID_RE.test(step.name)) {
            accept(
                'error',
                'step id must match ^[a-z][a-z0-9_]*$ (workflow schema)',
                { node: step, property: 'name' },
            );
        }
        if (step.uses && !USES_RE.test(step.uses)) {
            accept(
                'error',
                `uses must be tool.<adapter_id> from ADAPTER_TOOLS (R7-01-03); got "${step.uses}"`,
                { node: step, property: 'uses' },
            );
        }
        const empty = step.input?.empty;
        if (empty && !EMPTY_POLICIES.has(empty)) {
            accept(
                'error',
                `input.empty must be one of error|skip_step|continue; got "${empty}"`,
                { node: step.input!, property: 'empty' },
            );
        }
        const exportMode = step.context?.export;
        if (exportMode && !CONTEXT_EXPORTS.has(exportMode)) {
            accept(
                'error',
                `context.export must be scan_graph|none; got "${exportMode}"`,
                { node: step.context!, property: 'export' },
            );
        }
    }

    checkGseBinding(binding: GseBinding, accept: ValidationAcceptor): void {
        const shapes = [
            binding.select ? 'select' : null,
            binding.unionRefs?.length ? 'union' : null,
            binding.literals?.length ? 'literal' : null,
            binding.fromVar ? 'from_var' : null,
        ].filter(Boolean);
        // Grammar makes shape exclusive; still guard empty select path.
        if (shapes.length === 0) {
            accept(
                'error',
                'GSE binding must provide select, union, literal, or from_var (R7-02-01)',
                { node: binding },
            );
        }
        if (binding.select) {
            const sel = binding.select;
            const hasNodes = !!sel.nodes;
            const hasForEach = !!sel.forEach;
            if (hasNodes === hasForEach) {
                accept(
                    'error',
                    'GSE select requires exactly one of nodes | for_each (R7-02-02)',
                    { node: sel },
                );
            }
        }
    }
}
