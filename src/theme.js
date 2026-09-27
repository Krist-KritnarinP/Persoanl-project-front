// Shared theme store — single source of truth across every page.
// Fixes the old bug where each page mounted its own toggle with a hardcoded
// light initial state and forced `data-theme` back to light on navigation.

import { useSyncExternalStore } from "react";

export const THEME_LIGHT = "liquid-glass";
export const THEME_DARK = "liquid-glass-dark";

function readStoredTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === THEME_DARK || saved === THEME_LIGHT) return saved;
  } catch {
    // private mode etc.
  }
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return THEME_DARK;
  }
  return THEME_LIGHT;
}

function readDocumentTheme() {
  try {
    const t = document.documentElement.dataset.theme;
    if (t === THEME_DARK || t === THEME_LIGHT) return t;
  } catch {
    // SSR / prerender
  }
  return null;
}

// index.html already sets data-theme pre-paint, so prefer it on first load
// to avoid any flash or mismatch with what the user sees.
let current = readDocumentTheme() || readStoredTheme() || THEME_LIGHT;

const listeners = new Set();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

export function applyTheme(theme) {
  try {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme =
      theme === THEME_DARK ? "dark" : "light";
  } catch {
    // SSR / prerender
  }
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // ignore
  }
}

export function setTheme(theme) {
  if (theme !== THEME_DARK && theme !== THEME_LIGHT) return;
  if (theme === current) return;
  current = theme;
  applyTheme(theme);
  notify();
}

export function getTheme() {
  return current;
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Cross-tab sync: toggling in one tab updates every open tab.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "theme") return;
    if (event.newValue === THEME_DARK || event.newValue === THEME_LIGHT) {
      if (event.newValue !== current) {
        current = event.newValue;
        applyTheme(event.newValue);
        notify();
      }
    }
  });
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => THEME_LIGHT);
  return {
    theme,
    isDark: theme === THEME_DARK,
    setTheme,
    toggle: () => setTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK),
  };
}
