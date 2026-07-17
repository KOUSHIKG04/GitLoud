import { MotionItem, MotionViewportStagger } from "@/components/LandingMotion";

export function WhatGitLoudDoesSection() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-16 lg:py-14">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <MotionViewportStagger className="space-y-3">
          <MotionItem>
            <p className="text-sm font-semibold">WHAT GITLOUD DOES</p>
          </MotionItem>

          {/* <MotionItem>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Turn code changes into clear updates
            </h2>
          </MotionItem> */}

          <MotionItem>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              GitLoud reads public GitHub pull requests and commits, plus
              authorized private repository changes, summarizes the technical
              work, and creates platform-ready content for sharing progress.
            </p>
          </MotionItem>
        </MotionViewportStagger>

        <MotionViewportStagger className="grid items-stretch gap-5 md:grid-cols-3">
          <MotionItem>
            <FeatureBlock
              title="Reads and combines changes"
              description="Generate from one GitHub link or combine up to five PRs or commits from one connected repository into a single update."
            />
          </MotionItem>
          <MotionItem>
            <FeatureBlock
              title="Generates useful summaries"
              description="Creates short summaries, technical notes, feature lists, tech used, and beginner-friendly explanations."
            />
          </MotionItem>
          <MotionItem>
            <FeatureBlock
              title="Prepares share posts"
              description="Builds copy-ready content for X, LinkedIn, Reddit, portfolio updates, and changelogs."
            />
          </MotionItem>
        </MotionViewportStagger>
      </div>
    </section>
  );
}

function FeatureBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="h-full min-h-52 bg-card p-7 text-card-foreground shadow-sm sm:p-8">
      <h3 className="text-xl font-semibold leading-8">{title}</h3>
      <p className="mt-4 text-[17px] leading-8 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
