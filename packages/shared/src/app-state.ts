export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = Exclude<ThemeMode, "system">;
export type AppTab = "home" | "generate" | "history" | "settings";
