import { MotionItem, MotionViewportStagger } from "@/components/LandingMotion";

export function HowItWorksSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-20 lg:py-24 ">
      <div className="mx-auto w-full max-w-4xl space-y-7">
        <MotionViewportStagger className="mx-auto  space-y-3 ">
          <MotionItem>
            <p className="text-sm font-semibold">HOW IT WORKS</p>
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
          <div></div>
        </MotionViewportStagger>
      </div>
    </section>
  );
}
