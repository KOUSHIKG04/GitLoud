"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const themeChangeEvent = "gitloud-theme-change";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

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

function applyTheme(theme: Theme): ResolvedTheme {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;

  return resolvedTheme;
}

function subscribeToThemeChange(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener(themeChangeEvent, callback);
  mediaQuery.addEventListener("change", callback);

  return () => {
    window.removeEventListener(themeChangeEvent, callback);
    mediaQuery.removeEventListener("change", callback);
  };
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
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

  useEffect(() => {
    applyTheme(theme);
  }, [theme, resolvedTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event(themeChangeEvent));
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

export function useTheme() {
  const context = use(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
