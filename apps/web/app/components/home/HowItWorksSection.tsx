import {
  MotionItem,
  MotionViewportStagger,
} from "@/components/LandingMotion";

export function HowItWorksSection() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 lg:px-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <MotionViewportStagger className="max-w-3xl space-y-3">
          <MotionItem>
            <p className="text-sm font-semibold">HOW IT WORKS</p>
          </MotionItem>

          <MotionItem>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              From code change to share-ready update
            </h2>
          </MotionItem>

          <MotionItem>
            <p className="max-w-2xl text-xs leading-6 text-muted-foreground sm:text-sm">
              Paste a public GitHub link once. GitLoud reads changed files,
              stats, commit messages, and PR descriptions when available, then
              turns that context into every format you need.
            </p>
          </MotionItem>
        </MotionViewportStagger>

        <MotionViewportStagger className="grid items-stretch gap-4 md:grid-cols-3">
          <MotionItem>
            <HowItWorksStep
              title="Paste a PR or commit link"
              description="Use any public GitHub pull request or commit URL. No GitHub connection is required."
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
    <article className="h-full border bg-card p-5 text-card-foreground shadow-sm">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
