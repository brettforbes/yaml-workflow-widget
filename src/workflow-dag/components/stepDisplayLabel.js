/**
 * SPEC-018 R18-09 — collapsed step label (last token of sfp_cli_* / tool.*).
 * Full step id remains in tooltip and YAML.
 *
 * @param {string} stepId
 * @param {string|undefined} uses
 * @returns {string}
 */
export function shortStepLabel(stepId, uses) {
  const id = typeof stepId === "string" ? stepId : "";
  const raw =
    typeof uses === "string" && uses.trim() ? uses.trim() : id;
  if (/^(?:sfp_cli_|tool\.)/.test(raw)) {
    const tail = raw.replace(/^sfp_cli_/, "").replace(/^tool\./, "");
    const tokens = tail.split(/[._-]/).filter(Boolean);
    if (tokens.length) return tokens[tokens.length - 1];
  }
  return id || raw;
}

/**
 * @param {object} step - workflow step from YAML
 * @returns {string}
 */
export function stepDisplayLabel(step) {
  if (!step || typeof step !== "object") return "";
  return shortStepLabel(step.id, step.uses);
}

/**
 * @param {unknown} exportValue - step.context.export
 * @returns {boolean}
 */
export function stepExportsScanGraph(exportValue) {
  return exportValue === "scan_graph" || exportValue === true;
}
