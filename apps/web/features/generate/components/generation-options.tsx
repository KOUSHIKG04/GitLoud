"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { cn } from "@repo/ui/lib/utils";
import type { XPostLength } from "@repo/shared/generations";
import type { GenerationOptions } from "@/features/generate/lib/use-generate";

const X_LENGTH_KEY = "gitloud:x-post-length:v1";

/**
 * Optional settings for a generation. Closed by default; X post length is
 * remembered in this browser, context is per generation.
 */
export function useGenerationOptions() {
  const [context, setContext] = useState("");
  const [xPostLength, setXPostLength] = useState<XPostLength>("standard");

  useEffect(() => {
    try {
      if (window.localStorage.getItem(X_LENGTH_KEY) === "premium") {
        setXPostLength("premium");
      }
    } catch {
      /* storage unavailable: keep the default */
    }
  }, []);

  function updateXPostLength(next: XPostLength) {
    setXPostLength(next);
    try {
      window.localStorage.setItem(X_LENGTH_KEY, next);
    } catch {
      /* storage unavailable: the choice lasts for this visit */
    }
  }

  const options: GenerationOptions = { context, xPostLength };

  return { options, setContext, setXPostLength: updateXPostLength };
}

export function GenerationOptionsPanel({
  options,
  setContext,
  setXPostLength,
  disabled,
}: {
  options: GenerationOptions;
  setContext: (value: string) => void;
  setXPostLength: (value: XPostLength) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const isPremium = options.xPostLength === "premium";
  const summary = [
    options.context.trim() ? "Context added" : null,
    isPremium ? "X Premium length" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-sm border border-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm"
      >
        <span>
          Options
          {summary ? (
            <span className="ml-2 text-muted-foreground">{summary}</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className="space-y-4 border-t border-border px-4 py-4"
        >
          <label className="block space-y-2">
            <span className="text-sm text-muted-foreground">
              Extra context: tone, audience, or what you learned
            </span>
            <textarea
              value={options.context}
              onChange={(event) => setContext(event.target.value)}
              maxLength={1000}
              disabled={disabled}
              placeholder='e.g. "Explain it as a learning update"'
              className="min-h-24 w-full resize-y border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">
              Write X posts for X Premium (long posts)
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isPremium}
              aria-label="Write X posts for X Premium"
              disabled={disabled}
              onClick={() => setXPostLength(isPremium ? "standard" : "premium")}
              className={cn(
                "relative flex h-5 w-9 shrink-0 items-center rounded-full border p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
                isPremium
                  ? "border-foreground bg-foreground"
                  : "border-border bg-muted",
              )}
            >
              <span
                className={cn(
                  "block size-3.5 rounded-full shadow-sm transition-transform",
                  isPremium
                    ? "translate-x-4 bg-background"
                    : "translate-x-0 bg-foreground/70",
                )}
              />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
