/**
 * Workflow document → Nice-DAG hierarchical model (SPEC-010 / R10-01).
 *
 * Nice-DAG expects nodes with `id`, optional `dependencies` (step.needs),
 * and optional `data` for labels / metadata.
 */
/* global window, module */
(function (root) {
    function workflowToNiceDagModel(doc) {
        if (!doc || !Array.isArray(doc.steps)) {
            throw new Error('workflowToNiceDagModel: doc.steps array required');
        }
        return doc.steps.map(function (step) {
            if (!step || typeof step.id !== 'string' || !step.id) {
                throw new Error('workflowToNiceDagModel: each step needs a string id');
            }
            var needs = Array.isArray(step.needs) ? step.needs.slice() : [];
            var exportMode = 'none';
            if (step.context && typeof step.context.export === 'string') {
                exportMode = step.context.export;
            }
            return {
                id: step.id,
                dependencies: needs,
                data: {
                    label: step.id,
                    uses: step.uses || null,
                    export: exportMode,
                },
            };
        });
    }

    var api = { workflowToNiceDagModel: workflowToNiceDagModel };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    var w = typeof window !== 'undefined' ? window : root;
    if (w) {
        w.Widgets = w.Widgets || {};
        w.Widgets.WorkflowDag = w.Widgets.WorkflowDag || {};
        w.Widgets.WorkflowDag.workflowToNiceDagModel = workflowToNiceDagModel;
    }

    return api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
