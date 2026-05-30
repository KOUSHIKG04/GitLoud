import { Minus, Square, X } from "lucide-react";

function TopBar() {
  const showWindowActions = window.gitloud?.platform !== "darwin";

  return (
    <header className="top-bar">
      <div className="drag-region">
        <span className="app-title">GitLoud</span>
      </div>

      {showWindowActions ? (
        <div className="window-actions">
          <button
            type="button"
            aria-label="Minimize window"
            onClick={() => window.gitloud?.windowControls.minimize()}
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            aria-label="Maximize window"
            onClick={() => window.gitloud?.windowControls.maximize()}
          >
            <Square size={14} />
          </button>
          <button
            type="button"
            aria-label="Close window"
            onClick={() => window.gitloud?.windowControls.close()}
          >
            <X size={17} />
          </button>
        </div>
      ) : null}
    </header>
  );
}
export default TopBar;
