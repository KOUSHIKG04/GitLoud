import "./App.css";
import { useEffect } from "react";
import { HistoryIcon, Home, PlusCircle, SettingsIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import TopBar from "./components/topBar";
import HomeScreen from "./screens/Home";
import GenerateScreen from "./screens/Generate";
import HistoryScreen from "./screens/History";
import SettingsScreen from "./screens/Settings";
import { useAppStore } from "./stores/app-store";
import type { GitLoudElectronApi } from "@repo/shared/electron";

declare global {
  interface Window {
    gitloud?: GitLoudElectronApi;
  }
}

export default function App() {
  const tab = useAppStore((state) => state.tab);
  const themeMode = useAppStore((state) => state.themeMode);
  const setTab = useAppStore((state) => state.setTab);
  const setResolvedTheme = useAppStore((state) => state.setResolvedTheme);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedTheme =
        themeMode === "system"
          ? systemDark.matches
            ? "dark"
            : "light"
          : themeMode;

      root.classList.toggle("dark", resolvedTheme === "dark");
      root.classList.toggle("light", resolvedTheme === "light");
      root.style.colorScheme = resolvedTheme;
      setResolvedTheme(resolvedTheme);
    };

    applyTheme();
    systemDark.addEventListener("change", applyTheme);

    return () => {
      systemDark.removeEventListener("change", applyTheme);
    };
  }, [setResolvedTheme, themeMode]);

  return (
    <TooltipProvider>
      <main className="app-shell">
        <TopBar />
        <section className="screen">
          {tab === "home" && <HomeScreen />}
          {tab === "generate" && <GenerateScreen />}
          {tab === "history" && <HistoryScreen />}
          {tab === "settings" && <SettingsScreen />}
        </section>

        <nav className="bottom-tabs" aria-label="Primary">
          <Button
            variant={tab === "home" ? "default" : "outline"}
            size="icon"
            onClick={() => setTab("home")}
            className={
              tab === "home"
                ? "dock-item dock-home active"
                : "dock-item dock-home"
            }
            aria-label="Home"
            title="Home"
          >
            <Home />
          </Button>

          <Button
            variant={tab === "generate" ? "default" : "outline"}
            size="icon"
            onClick={() => setTab("generate")}
            className={
              tab === "generate"
                ? "dock-item dock-generate active"
                : "dock-item dock-generate"
            }
            aria-label="Generate"
            title="Generate"
          >
            <PlusCircle />
          </Button>

          <Button
            variant={tab === "history" ? "default" : "outline"}
            size="icon"
            onClick={() => setTab("history")}
            className={
              tab === "history"
                ? "dock-item dock-history active"
                : "dock-item dock-history"
            }
            aria-label="History"
            title="History"
          >
            <HistoryIcon />
          </Button>

          <Button
            variant={tab === "settings" ? "default" : "outline"}
            size="icon"
            onClick={() => setTab("settings")}
            className={
              tab === "settings"
                ? "dock-item dock-settings active"
                : "dock-item dock-settings"
            }
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon />
          </Button>
        </nav>
      </main>
    </TooltipProvider>
  );
}
