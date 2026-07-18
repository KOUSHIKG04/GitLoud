"use client";

import { MotionItem, MotionViewportStagger } from "@/components/LandingMotion";
import { WorkflowDiagram } from "./WorkflowDiagram";

export function HowItWorksSection() {
  return (
    <section className="overflow-hidden px-4 py-16 sm:px-6 lg:px-20 lg:py-20">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <MotionViewportStagger className="mx-auto max-w-4xl space-y-3">
          <MotionItem>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                How It Works
              </p>
            </div>
          </MotionItem>

          <MotionItem>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Turns code changes into clear updates
            </h2>
          </MotionItem>

          <MotionItem>
            <p className="max-w-4xl text-sm leading-6 text-muted-foreground tracking-tight">
              GitLoud reads one GitHub pull request or commit, or uses a
              connected repository to combine up to five pull requests or
              commits. It summarizes the complete technical work and creates
              platform-ready content for sharing your progress.
            </p>
          </MotionItem>
        </MotionViewportStagger>

        <WorkflowDiagram />
      </div>
    </section>
  );
}
