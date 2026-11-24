"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  DEMO_LINK,
  PipelineFigure,
  type PipelinePhase,
} from "@/features/landing/components/pipeline-figure";

const TYPE_MS = 45; // per character
const AFTER_TYPING_MS = 400; // beat before GitLoud starts
const READING_MS = 1600;
const DONE_MS = 2800; // the finished posts hold longest

// The typing demo loop with a pause control. Reduced motion starts paused,
// showing the finished state.
export function DiagramFigure() {
  const reducedMotion = useReducedMotion() ?? false;
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reducedMotion;
  const [phase, setPhase] = useState<PipelinePhase>("typing");
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (paused) return;

    let delay: number;
    let next: () => void;

    if (phase === "typing" && typed < DEMO_LINK.length) {
      delay = TYPE_MS;
      next = () => setTyped((count) => count + 1);
    } else if (phase === "typing") {
      delay = AFTER_TYPING_MS;
      next = () => setPhase("reading");
    } else if (phase === "reading") {
      delay = READING_MS;
      next = () => setPhase("done");
    } else {
      delay = DONE_MS;
      next = () => {
        setTyped(0);
        setPhase("typing");
      };
    }

    const timer = window.setTimeout(next, delay);
    return () => window.clearTimeout(timer);
  }, [paused, phase, typed]);

  return (
    <figure className="my-10">
      <div className="flex items-center justify-end text-sm">
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
        <PipelineFigure phase={paused ? null : phase} typed={typed} />
      </div>

      {/* No visible caption; screen readers still get what the figure shows. */}
      <figcaption className="sr-only">
        A GitHub pull request link goes into GitLoud and becomes posts for X,
        LinkedIn, Reddit and Discord.
      </figcaption>
    </figure>
  );
}
