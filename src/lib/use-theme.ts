import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "sapiens-theme";
const LIGHT_CLASS = "light-theme";

// The `light-theme` class on <html> is the source of truth at runtime; the
// inline script in layout.tsx applies it before first paint, and localStorage
// persists the choice across sessions. This store reads that class and lets
// components subscribe so a toggle anywhere updates every consumer at once.

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", syncStoredTheme);
    // A different tab may have changed the preference between the pre-paint
    // script and hydration, before this document had a storage subscriber.
    try {
      document.documentElement.classList.toggle(LIGHT_CLASS, localStorage.getItem(STORAGE_KEY) === "light");
    } catch {
      // Keep the applied class when storage is unavailable.
    }
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", syncStoredTheme);
  };
}

function syncStoredTheme(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  if (event.storageArea && event.storageArea !== localStorage) return;
  document.documentElement.classList.toggle(LIGHT_CLASS, event.newValue === "light");
  emit();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains(LIGHT_CLASS)
    ? "light"
    : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add(LIGHT_CLASS);
  } else {
    root.classList.remove(LIGHT_CLASS);
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures (private mode, etc.); the class still applies.
  }
  emit();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as Theme);

  // Read the live snapshot at call time so rapid toggles before a re-render
  // don't act on a stale closured value.
  const toggleTheme = useCallback(() => {
    applyTheme(getSnapshot() === "dark" ? "light" : "dark");
  }, []);
  const setTheme = useCallback((next: Theme) => applyTheme(next), []);

  return { theme, toggleTheme, setTheme };
}
