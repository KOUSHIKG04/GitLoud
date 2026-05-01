import {
  MotionItem,
  MotionStagger,
} from "@/components/LandingMotion";
import { ScrollToGeneratorButton } from "@/components/ScrollToGeneratorButton";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[68dvh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-sm text-center sm:max-w-2xl lg:max-w-4xl">
        <MotionStagger>
          <MotionItem>
            <p className="mb-4 inline-flex items-center gap-2 border border-border bg-background/60 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-chart-1" />
              Developer PR content assistant
            </p>
          </MotionItem>

          <MotionItem>
            <p className="text-balance mt-4 sm:mt-5 text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Ship it. <span className="text-chart-2">Make noise.</span>
            </p>
          </MotionItem>

          <MotionItem>
            <p className="mt-4 sm:mt-5 mx-auto max-w-md text-pretty text-sm leading-6 text-muted-foreground sm:max-w-2xl sm:text-base lg:text-lg">
              Drop a GitHub PR or commit link. Generate summaries, changelogs,
              and dev-ready posts instantly.
            </p>
          </MotionItem>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <MotionItem>
              <ScrollToGeneratorButton />
            </MotionItem>
          </div>
        </MotionStagger>
      </div>
    </section>
  );
}
