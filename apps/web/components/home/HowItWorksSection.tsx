import { MotionItem, MotionViewportStagger } from "@/components/LandingMotion";

export function HowItWorksSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-20 lg:py-24 ">
      <div className="mx-auto w-full max-w-4xl space-y-7">
        <MotionViewportStagger className="mx-auto  space-y-3 ">
          <MotionItem>
            <p className="text-sm font-semibold ">HOW IT WORKS</p>
          </MotionItem>

          <MotionItem>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl ">
              Turns code changes into clear updates
            </h2>
          </MotionItem>

          <MotionItem>
            <p className="mx-auto  text-sm leading-6 text-muted-foreground sm:text-sm">
              GitLoud reads public GitHub pull requests and commits, plus
              authorized private repository changes, summarizes the technical
              work, and creates platform-ready content for sharing your
              progress.
            </p>
          </MotionItem>
        </MotionViewportStagger>

        <MotionViewportStagger className="grid items-stretch gap-5 md:grid-cols-3">
          <MotionItem>
            <HowItWorksStep
              title="Paste a PR or commit link"
              description="Use public GitHub links without setup, or connect the GitHub App for selected private repositories."
            />
          </MotionItem>

          <MotionItem>
            <HowItWorksStep
              title="GitLoud reads the changes"
              description="It fetches diffs, file stats, commit messages, PR descriptions when available, and repository context automatically."
            />
          </MotionItem>

          <MotionItem>
            <HowItWorksStep
              title="Get every format at once"
              description="A results page opens with technical summaries, changelog entries, portfolio bullets, and social posts ready to copy or share."
            />
          </MotionItem>
        </MotionViewportStagger>
      </div>
    </section>
  );
}

function HowItWorksStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="h-full min-h-52 border bg-card p-7 text-card-foreground shadow-sm sm:p-8">
      <h3 className="text-xl font-semibold leading-8">{title}</h3>
      <p className="mt-4 text-[17px] leading-8 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
