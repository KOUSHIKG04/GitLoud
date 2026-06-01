import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Info, Upload } from "lucide-react";
import { useAppStore } from "../stores/app-store";

const Generate = () => {
  const xContentMode = useAppStore((state) => state.xContentMode);
  const isPremium = xContentMode === "premium";
  const xModeLabel = isPremium ? "Premium X" : "Standard X";

  return (
    <section className="generate-screen">
      <h1>
        Generate content through <span>PR</span> below
      </h1>

      <div className="generate-card">
        <div className="generate-body">
          <label className="generate-field">
            <span>&gt; Paste a Github pull request or commit link.</span>
            <div className="generate-url-field">
              <Input aria-label="GitHub PR or commit URL" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="generate-info"
                    aria-label="Show supported link examples"
                  >
                    <Info aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" sideOffset={8}>
                  Supported: github.com/owner/repo/pull/123 or
                  github.com/owner/repo/commit/sha
                </TooltipContent>
              </Tooltip>
            </div>
          </label>

          <label className="generate-field">
            <span className="generate-helper">
              Extra context: Add tone, audience, or what you learned.
            </span>
            <textarea
              aria-label="Extra context"
              placeholder='> Add tone, audience, or what you learned (e.g., "I learned this today explain it as a learning update")'
            />
          </label>
        </div>

        <div className="generate-footer">
          <div className="generate-footer-left">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Upload attachment"
                >
                  <Upload />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" sideOffset={8}>
                Upload extra files that will be carried into sharable post.
              </TooltipContent>
            </Tooltip>
            <div className="generate-divider" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="x-mode-indicator" tabIndex={0}>
                  {xModeLabel}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" sideOffset={8}>
                Using {xModeLabel} for this generation. Change it from Settings.
              </TooltipContent>
            </Tooltip>
          </div>

          <Button type="button" className="generate-submit">
            Generate
          </Button>
        </div>
      </div>

      <p className="generate-note">
        Paste a public GitHub pull request link to start generating summaries
        and share-ready posts.
      </p>
    </section>
  );
};

export default Generate;
