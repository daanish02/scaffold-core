export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "scaffold-theme";

/** Applies a theme mode to the document root and persists it. "system" clears the override. */
export function setTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // localStorage unavailable (private browsing, etc.) — theme just won't persist
  }
}

/** Reads the persisted theme mode, defaulting to "system". */
export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // localStorage unavailable — fall through to default
  }
  return "system";
}

/**
 * Applies the persisted theme immediately, without re-writing storage. Call
 * this in an inline <script> in <head>, before first paint, to avoid a
 * flash of the wrong theme.
 */
export function initTheme(): void {
  const mode = getStoredTheme();
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}
