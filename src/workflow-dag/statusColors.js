/**
 * SPEC-015 R15-10 — per-theme step-status colors (localStorage + CSS vars on .dag-host).
 * Defaults match theme.css --wd-status-* tokens.
 */

export const STORAGE_KEY = "workflow-dag-status-colors";

export const STATUS_KEYS = ["waiting", "running", "complete", "failed"];

export const DEFAULT_STATUS_COLORS = Object.freeze({
  light: Object.freeze({
    waiting: "#cfe2ff",
    running: "#6ea8fe",
    complete: "#0d6efd",
    failed: "#dc3545",
  }),
  dark: Object.freeze({
    waiting: "#1e3a5f",
    running: "#3d7dd6",
    complete: "#6ea8fe",
    failed: "#e35d6a",
  }),
});

function cloneDefaults() {
  return {
    light: { ...DEFAULT_STATUS_COLORS.light },
    dark: { ...DEFAULT_STATUS_COLORS.dark },
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
  const defaults = DEFAULT_STATUS_COLORS[theme];
  const src = raw && typeof raw === "object" ? raw : {};
  const out = {};
  for (const key of STATUS_KEYS) {
    out[key] = normalizeHex(src[key], defaults[key]);
  }
  return out;
}

export function normalizeStatusColors(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    light: normalizeThemeBucket(src.light, "light"),
    dark: normalizeThemeBucket(src.dark, "dark"),
  };
}

export function readStoredStatusColors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    return normalizeStatusColors(JSON.parse(raw));
  } catch {
    return cloneDefaults();
  }
}

export function writeStoredStatusColors(colors) {
  const normalized = normalizeStatusColors(colors);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    /* ignore quota / private mode */
  }
  return normalized;
}

export function resetStatusColors() {
  const defaults = cloneDefaults();
  writeStoredStatusColors(defaults);
  return defaults;
}

/**
 * Apply the active theme's status colors as CSS variables on a host element.
 * @param {HTMLElement | null | undefined} el
 * @param {"light"|"dark"} theme
 * @param {{ light: object, dark: object }} colors
 */
export function applyStatusColors(el, theme, colors) {
  if (!el || typeof el.style?.setProperty !== "function") return;
  const normalized = normalizeStatusColors(colors);
  const t = theme === "dark" ? "dark" : "light";
  const bucket = normalized[t];
  for (const key of STATUS_KEYS) {
    el.style.setProperty(`--wd-status-${key}`, bucket[key]);
  }
}
