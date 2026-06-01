import { Button } from "@repo/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useAppStore } from "../stores/app-store";

const Settings = () => {
  const resolvedTheme = useAppStore((state) => state.resolvedTheme);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const xContentMode = useAppStore((state) => state.xContentMode);
  const setXContentMode = useAppStore((state) => state.setXContentMode);
  const isDark = resolvedTheme === "dark";
  const isPremium = xContentMode === "premium";

  return (
    <section className="settings-screen">
      <p className="screen-kicker">Settings</p>
      {/* <h1>Preferences</h1> */}

      <div className="settings-list">
        <div className="settings-row">
          <div>
            <h2>Theme: {isDark ? "Dark appearance" : "Light appearance"}</h2>
            {/* <p>{isDark ? "Dark appearance" : "Light appearance"}</p> */}
          </div>
          <Button
            type="button"
            variant="outline"
            className="theme-toggle"
            aria-pressed={isDark}
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
          >
            {isDark ? <Moon /> : <Sun />}
            {isDark ? "Dark" : "Light"}
          </Button>
        </div>

        <div className="settings-row">
          <div>
            <h2>
              Content generation: {isPremium ? "Premium X" : "Standard X"}
            </h2>
          </div>
          <label className="x-toggle settings-x-toggle">
            <input
              type="checkbox"
              checked={isPremium}
              aria-label="Use Premium X content generation"
              onChange={(event) =>
                setXContentMode(event.target.checked ? "premium" : "standard")
              }
            />
            <span aria-hidden="true" />
            {isPremium ? "Premium X" : "Standard X"}
          </label>
        </div>
      </div>
    </section>
  );
};

export default Settings;
