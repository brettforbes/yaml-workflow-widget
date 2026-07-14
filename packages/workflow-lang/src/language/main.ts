/**
 * SfWorkflow language entry — service construction (SPEC-008 / R8-01 / R8-03).
 */
import {
    EmptyFileSystem,
    createDefaultCoreModule,
    createDefaultSharedCoreModule,
    inject,
    type DefaultSharedCoreModuleContext,
} from 'langium';
import {
    SfWorkflowGeneratedModule,
    WorkflowGeneratedSharedModule,
} from './generated/module.js';
import {
    SfWorkflowModule,
    finalizeSfWorkflowServices,
    type SfWorkflowServices,
} from './workflow-module.js';

export function createSfWorkflowServices(
    context: DefaultSharedCoreModuleContext = EmptyFileSystem,
): { shared: ReturnType<typeof createShared>; Workflow: SfWorkflowServices } {
    const shared = createShared(context);
    const Workflow = inject(
        createDefaultCoreModule({ shared }),
        SfWorkflowGeneratedModule,
        SfWorkflowModule,
    );
    shared.ServiceRegistry.register(Workflow);
    finalizeSfWorkflowServices(Workflow);
    return { shared, Workflow };
}

function createShared(context: DefaultSharedCoreModuleContext) {
    return inject(
        createDefaultSharedCoreModule(context),
        WorkflowGeneratedSharedModule,
    );
}

export type { SfWorkflowServices } from './workflow-module.js';
