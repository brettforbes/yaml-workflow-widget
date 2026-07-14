/**
 * Custom DI module for SfWorkflow (validators land in E8-S3).
 */
import type { LangiumCoreServices, Module } from 'langium';

/** Partial overrides for language-specific services. */
export type SfWorkflowAddedServices = {
    // E8-S3: Validation: { ... }
};

export type SfWorkflowServices = LangiumCoreServices & SfWorkflowAddedServices;

export const SfWorkflowModule: Module<
    SfWorkflowServices,
    Partial<SfWorkflowAddedServices>
> = {
    // E8-S3: register validators mirroring R7-01 / R7-02
};
