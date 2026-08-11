/**
 * SPEC-017 R17-12 — per-theme edge-type colors (localStorage + resolveEdgeColor).
 */

import { EDGE_TYPE } from "./components/edgeMeta.js";

export const EDGE_COLOR_STORAGE_KEY = "workflow-dag-edge-colors";

export const EDGE_COLOR_KEYS = [
  EDGE_TYPE.FOLLOWED_BY,
  EDGE_TYPE.USED_BY,
  EDGE_TYPE.SEMANTIC_EXPORT,
];

const SHARED_EDGE_DEFAULTS = Object.freeze({
  [EDGE_TYPE.FOLLOWED_BY]: "#156082",
  [EDGE_TYPE.USED_BY]: "#e97132",
  [EDGE_TYPE.SEMANTIC_EXPORT]: "#78206e",
});

export const DEFAULT_EDGE_COLORS = Object.freeze({
  light: Object.freeze({ ...SHARED_EDGE_DEFAULTS }),
  dark: Object.freeze({ ...SHARED_EDGE_DEFAULTS }),
});

function cloneDefaults() {
  return {
    light: { ...DEFAULT_EDGE_COLORS.light },
    dark: { ...DEFAULT_EDGE_COLORS.dark },
  };
}

function normalizeHex(value, fallback) {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [, a, b, c] = v;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  return fallback;
}

function normalizeThemeBucket(raw, theme) {
  const defaults = DEFAULT_EDGE_COLORS[theme];
  const src = raw && typeof raw === "object" ? raw : {};
  const out = {};
  for (const key of EDGE_COLOR_KEYS) {
    out[key] = normalizeHex(src[key], defaults[key]);
  }
  return out;
}

export function normalizeEdgeColors(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    light: normalizeThemeBucket(src.light, "light"),
    dark: normalizeThemeBucket(src.dark, "dark"),
  };
}

export function readStoredEdgeColors() {
  try {
    const raw = localStorage.getItem(EDGE_COLOR_STORAGE_KEY);
    if (!raw) return cloneDefaults();
    return normalizeEdgeColors(JSON.parse(raw));
  } catch {
    return cloneDefaults();
  }
}

export function writeStoredEdgeColors(colors) {
  const normalized = normalizeEdgeColors(colors);
  try {
    localStorage.setItem(EDGE_COLOR_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    /* ignore */
  }
  return normalized;
}

export function resetEdgeColors() {
  const defaults = cloneDefaults();
  writeStoredEdgeColors(defaults);
  return defaults;
}

export function resolveStoredEdgeColor(edgeType, theme, colored, colors) {
  const t = theme === "dark" ? "dark" : "light";
  if (!colored) return t === "dark" ? "#aaaaaa" : "#666666";
  const bucket = normalizeEdgeColors(colors)[t];
  return bucket[edgeType] || SHARED_EDGE_DEFAULTS[edgeType] || "#666666";
}

/**
 * Apply active theme edge colors as CSS variables (context ports/circles use semantic-export).
 * @param {HTMLElement | null | undefined} el
 * @param {"light"|"dark"} theme
 * @param {{ light: object, dark: object }} colors
 */
export function applyEdgeColors(el, theme, colors) {
  if (!el || typeof el.style?.setProperty !== "function") return;
  const normalized = normalizeEdgeColors(colors);
  const t = theme === "dark" ? "dark" : "light";
  const bucket = normalized[t];
  el.style.setProperty(
    "--wd-edge-followed-by",
    bucket[EDGE_TYPE.FOLLOWED_BY]
  );
  el.style.setProperty("--wd-edge-used-by", bucket[EDGE_TYPE.USED_BY]);
  el.style.setProperty(
    "--wd-edge-semantic-export",
    bucket[EDGE_TYPE.SEMANTIC_EXPORT]
  );
}
