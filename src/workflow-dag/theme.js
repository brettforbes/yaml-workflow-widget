const STORAGE_KEY = "workflow-dag-theme";

export function normalizeTheme(value) {
  return value === "dark" ? "dark" : "light";
}

export function readStoredTheme() {
  try {
    return normalizeTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return "light";
  }
}

export function applyTheme(theme) {
  const t = normalizeTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", t);
  }
  return t;
}
