/** SPEC-015 / SPEC-018 R18-13 — live step status + optional input progress. */

export const ALLOWED_STEP_STATUSES = new Set([
  "waiting",
  "running",
  "complete",
  "failed",
]);

/**
 * @param {unknown} state - string status or `{ status, input_done?, input_total? }`
 * @returns {{ status: string, input_done?: number, input_total?: number } | null}
 */
export function normalizeStepStatusEntry(state) {
  if (typeof state === "string") {
    const status = state.trim();
    if (!ALLOWED_STEP_STATUSES.has(status)) return null;
    return { status };
  }
  if (state && typeof state === "object" && !Array.isArray(state)) {
    const status =
      typeof state.status === "string" ? state.status.trim() : "";
    if (!ALLOWED_STEP_STATUSES.has(status)) return null;
    const entry = { status };
    if (Number.isFinite(state.input_total) && state.input_total >= 0) {
      entry.input_total = Math.floor(state.input_total);
      const done = Number.isFinite(state.input_done) ? state.input_done : 0;
      entry.input_done = Math.max(
        0,
        Math.min(Math.floor(done), entry.input_total)
      );
    }
    return entry;
  }
  return null;
}

/**
 * @param {{ status?: string, input_done?: number, input_total?: number } | null | undefined} entry
 * @returns {string}
 */
export function stepStatusLabel(entry) {
  const status = entry?.status;
  return typeof status === "string" && ALLOWED_STEP_STATUSES.has(status)
    ? status
    : "";
}

/**
 * @param {{ input_done?: number, input_total?: number } | null | undefined} entry
 * @returns {string} e.g. `0/12` or empty when no progress fields
 */
export function stepProgressLabel(entry) {
  if (!entry || entry.input_total == null || entry.input_total <= 0) return "";
  const total = entry.input_total;
  const done = entry.input_done ?? 0;
  return `${done}/${total}`;
}
