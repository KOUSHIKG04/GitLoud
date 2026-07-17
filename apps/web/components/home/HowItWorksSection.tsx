"use client";

import { MotionItem, MotionViewportStagger } from "@/components/LandingMotion";
import { WorkflowDiagram } from "./WorkflowDiagram";

export function HowItWorksSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-20 lg:py-24 overflow-hidden">
      <div className="mx-auto w-full max-w-5xl space-y-12">
        <MotionViewportStagger className="mx-auto space-y-3">
          <MotionItem>
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">
              How It Works
            </p>
          </MotionItem>

          <MotionItem>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Turns code changes into clear updates
            </h2>
          </MotionItem>

          <MotionItem>
            <p className=" max-w-4xl text-sm leading-relaxed text-muted-foreground">
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
