"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  PipelineFigure,
  type PipelineStage,
} from "@/features/landing/components/pipeline-figure";

// Hold each stage long enough to read it; the finished posts hold longest.
const STAGE_MS: Record<PipelineStage, number> = { 0: 1400, 1: 1600, 2: 2600 };

const captions: Record<PipelineStage, string> = {
  0: "A pull request or commit link goes in…",
  1: "GitLoud reads the diff…",
  2: "Posts go out to every channel.",
};

// The illustration: the keycap pipeline steps through its stages on its own,
// with a pause control. Reduced motion starts paused with every stage lit.
export function DiagramFigure() {
  const reducedMotion = useReducedMotion() ?? false;
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reducedMotion;
  const [stage, setStage] = useState<PipelineStage>(0);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      setStage((current) => ((current + 1) % 3) as PipelineStage);
    }, STAGE_MS[stage]);
    return () => window.clearTimeout(timer);
  }, [paused, stage]);

  return (
    <figure className="my-10">
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>Paste a link. Publish everywhere.</span>
        <button
          type="button"
          onClick={() => setUserPaused(!paused)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          aria-pressed={paused}
        >
          {paused ? (
            <Play className="size-3.5" aria-hidden="true" />
          ) : (
            <Pause className="size-3.5" aria-hidden="true" />
          )}
          <span>{paused ? "Play" : "Pause"}</span>
        </button>
      </div>

      <div className="mt-6">
        <PipelineFigure stage={paused ? null : stage} />
      </div>

      <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground" aria-live="polite">
          {paused
            ? "GitHub to GitLoud to Reddit, X, LinkedIn and Discord."
            : captions[stage]}
        </span>
        <a
          href="#how-it-works"
          className="shrink-0 text-primary underline-offset-4 hover:underline"
        >
          How it works
        </a>
      </figcaption>
    </figure>
  );
}
