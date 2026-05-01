import {
  MotionItem,
  MotionSection,
  MotionViewportStagger,
} from "@/components/LandingMotion";
import { DashboardGetStartedButton } from "@/components/DashboardGetStartedButton";
import { Button } from "@/components/ui/button";

export function GeneratorSection() {
  return (
    <section
      id="generator"
      className="border-y bg-background px-4 pt-16 pb-12 sm:px-6 lg:px-16"
    >
      <MotionViewportStagger className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <MotionViewportStagger className="space-y-3">
          <MotionItem>
            <p className="text-sm font-semibold">DASHBOARD</p>
          </MotionItem>

          <MotionItem>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Paste a PR or commit and generate content
            </h2>
          </MotionItem>

          <MotionItem>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              This is the same public repository workflow from the dashboard.
              After the content is created, GitLoud opens a separate result
              page where you can copy and share each format.
            </p>
          </MotionItem>
        </MotionViewportStagger>

        <MotionItem>
          <GeneratorPreview />

          <MotionSection className="mx-auto flex w-full max-w-6xl justify-center mt-10">
            <DashboardGetStartedButton />
          </MotionSection>
        </MotionItem>
      </MotionViewportStagger>
    </section>
  );
}

function GeneratorPreview() {
  return (
    <div className="w-full space-y-6">
      <div className="border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col">
          <div className="space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <div className="flex min-h-10 items-center justify-center border bg-background px-3 py-2 text-sm text-muted-foreground rounded-none">
                <QuestionMarkIcon />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex min-h-36 items-center justify-center border bg-background p-3 text-sm leading-6 text-muted-foreground">
                <QuestionMarkIcon />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end border-t bg-muted/20 px-4 py-3 sm:px-6">
            <Button type="button" disabled className="min-w-32">
              GENERATE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionMarkIcon() {
  return (
    <svg
      className="animate-pulse"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4" />
      <path d="M12 19l0 .01" />
    </svg>
  );
}
