/**
 * Host postMessage contract helpers (SPEC-012 E6-S1 / R12-E6-01).
 * See HOST_PROTOCOL.md
 */

export const HOST_MSG = {
  SET_YAML: "setYaml",
  GET_YAML: "getYaml",
  YAML_CHANGED: "yamlChanged",
  YAML_RESULT: "yamlResult",
  VALIDATION_RESULT: "validationResult",
  SET_THEME: "setTheme",
  THEME_CHANGED: "themeChanged",
  SELECT_STEP: "selectStep",
  STEP_SELECTED: "stepSelected",
  MCP_EXPLAIN: "mcpExplain",
  MCP_PRODUCE: "mcpProduce",
  MCP_RESULT: "mcpResult",
  READY: "ready",
};

export const PROTOCOL_VERSION = "1.0.0";

/**
 * @param {unknown} raw
 * @returns {{ type: string, payload: any, requestId?: string, target?: string } | null}
 */
export function normalizeHostMessage(raw) {
  let data = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== "object") return null;
  if (data.target === "parent") return null;
  const type = data.type || data.action;
  if (!type || typeof type !== "string") return null;
  return {
    type,
    payload: data.payload !== undefined ? data.payload : data,
    requestId: data.requestId ?? data.payload?.requestId,
    target: data.target,
  };
}

/**
 * Post a message to the embedding host (parent).
 * @param {string} type
 * @param {object} payload
 */
export function postToHost(type, payload = {}) {
  const msg = {
    type,
    action: type,
    payload,
    target: "parent",
  };
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(msg, "*");
    }
  } catch (e) {
    console.warn("[hostProtocol] postToHost failed", e);
  }
  // Also raise via legacy Widgets.Events when present.
  try {
    const ev = window.Widgets?.Events;
    if (ev?.raiseEvent) {
      ev.raiseEvent(type, msg);
    }
  } catch (_) {
    /* ignore */
  }
}

export function postReady() {
  postToHost(HOST_MSG.READY, { version: PROTOCOL_VERSION });
}
