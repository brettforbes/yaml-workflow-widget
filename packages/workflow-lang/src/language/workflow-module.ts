/**
 * Custom DI module for SfWorkflow (SPEC-008).
 */
import type { LangiumCoreServices, Module } from 'langium';
import {
    SfWorkflowValidator,
    registerValidationChecks,
} from './validator.js';

export type SfWorkflowAddedServices = {
    validation: {
        SfWorkflowValidator: SfWorkflowValidator;
    };
};

export type SfWorkflowServices = LangiumCoreServices & SfWorkflowAddedServices;

export const SfWorkflowModule: Module<
    SfWorkflowServices,
    SfWorkflowAddedServices
> = {
    validation: {
        SfWorkflowValidator: () => new SfWorkflowValidator(),
    },
};

export function finalizeSfWorkflowServices(services: SfWorkflowServices): void {
    registerValidationChecks(services);
}
