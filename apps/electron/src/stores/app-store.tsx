import { create } from "zustand";
import { persist } from "zustand/middleware";

export type XContentMode = "standard" | "premium";
export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";
export type Tab = "home" | "generate" | "history" | "settings";

type AppStore = {
  tab: Tab;
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  xContentMode: XContentMode;
  setTab: (tab: Tab) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setResolvedTheme: (resolvedTheme: ResolvedTheme) => void;
  setXContentMode: (xContentMode: XContentMode) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      tab: "home",
      themeMode: "system",
      resolvedTheme: "dark",
      xContentMode: "standard",
      setTab: (tab) => set({ tab }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      setXContentMode: (xContentMode) => set({ xContentMode }),
    }),
    {
      name: "gitloud-app-store",
      partialize: (state) => ({
        tab: state.tab,
        themeMode: state.themeMode,
        xContentMode: state.xContentMode,
      }),
    },
  ),
);
