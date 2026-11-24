import { Minus, Square, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AppLogo } from "./AppLogo";

function TopBar() {
  const showWindowActions =
    typeof window.gitloud !== "undefined" && window.gitloud.platform !== "darwin";

  return (
    <header className="top-bar">
      <div className="drag-region">
        <AppLogo className="app-logo mt-1" />
        <span className="app-title mt-1">GitLoud</span>
      </div>

      {showWindowActions ? (
        <div className="window-actions">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="window-action"
            aria-label="Minimize window"
            onClick={() => window.gitloud?.windowControls.minimize()}
          >
            <Minus size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="window-action"
            aria-label="Maximize window"
            onClick={() => window.gitloud?.windowControls.maximize()}
          >
            <Square size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="window-action"
            aria-label="Close window"
            onClick={() => window.gitloud?.windowControls.close()}
          >
            <X size={17} />
          </Button>
        </div>
      ) : null}
    </header>
  );
}
export default TopBar;
