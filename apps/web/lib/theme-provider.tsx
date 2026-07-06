"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import type { ThemeMode as Theme, ResolvedTheme } from "@repo/shared/app-state";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme): ResolvedTheme {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;

  return resolvedTheme;
}

// NOTE: GitLoud is currently hardcoded to dark mode only.
export function ThemeProvider({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
  const theme: Theme = "dark";
  const resolvedTheme: ResolvedTheme = "dark";

  useEffect(() => {
    applyTheme("dark");
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setTheme = useCallback((nextTheme: Theme) => {
    // App is locked to dark mode, theme toggling is disabled.
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

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
