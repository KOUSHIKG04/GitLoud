"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ThemeMode as Theme, ResolvedTheme } from "@repo/shared/app-state";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const themeChangeEvent = "gitloud-theme-change";

/**
 * Determines the resolved theme based on the user's system preferences.
 *
 * @returns The resolved theme string ("dark" or "light").
 */
function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Retrieves the preferred theme from document cookies.
 * Falls back to "system" if no valid cookie is found.
 *
 * @returns The client theme preference.
 */
function getCookieTheme(): Theme {
  const themeCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("theme="))
    ?.split("=")[1];

  if (
    themeCookie === "light" ||
    themeCookie === "dark" ||
    themeCookie === "system"
  ) {
    return themeCookie;
  }

  return "system";
}

/**
 * Updates the document body class and colorScheme style properties to match the selected theme.
 *
 * @param theme - The theme key to apply.
 * @returns The resolved theme applied to the document.
 */
function applyTheme(theme: Theme): ResolvedTheme {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;

  return resolvedTheme;
}

/**
 * Subscribes to changes in system theme preferences or custom change events.
 *
 * @param callback - Event handler invoked when a theme change occurs.
 * @returns A cleanup function to unsubscribe from listeners.
 */
function subscribeToThemeChange(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener(themeChangeEvent, callback);
  mediaQuery.addEventListener("change", callback);

  return () => {
    window.removeEventListener(themeChangeEvent, callback);
    mediaQuery.removeEventListener("change", callback);
  };
}

/**
 * Provides context values for the theme and resolvedTheme state variables.
 *
 * @param props - React element properties.
 * @param props.children - Child elements to render.
 * @param props.initialTheme - The default theme to render initially.
 * @returns ThemeContext provider container.
 */
export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
  const theme: Theme = "dark";
  const resolvedTheme: ResolvedTheme = "dark";

  /*
  const theme = useSyncExternalStore<Theme>(
    subscribeToThemeChange,
    getCookieTheme,
    () => initialTheme,
  );
  const systemTheme = useSyncExternalStore<ResolvedTheme>(
    subscribeToThemeChange,
    getSystemTheme,
    () => "light",
  );
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme;
  */

  useEffect(() => {
    applyTheme("dark");
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    // document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
    // window.dispatchEvent(new Event(themeChangeEvent));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Custom React Hook to consume the ThemeContext.
 * Throws an error if used outside a ThemeProvider.
 *
 * @returns The ThemeContext context value.
 */
export function useTheme() {
  const context = use(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
