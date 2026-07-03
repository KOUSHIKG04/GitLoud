"use client";
import { MotionItem, MotionStagger } from "@/components/LandingMotion";
import { ScrollToGeneratorButton } from "@/components/ScrollToGeneratorButton";
import { useTheme } from "@/lib/theme-provider";
import { Dithering } from "@paper-design/shaders-react";

export function HeroSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const colorBack = isDark ? "#0a0a0a" : "#ffffff";
  // const colorFront = isDark ? "#fcc800" : "#0284c7";
  const colorFront = isDark ? "#ffdf2082" : "#0284c7";

  return (
    <section className="relative flex min-h-[86dvh] items-center justify-center px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      {/* <div className="absolute inset-0 z-0 mx-auto">
        <Dithering
          // width={880}
          // height={620}
          colorBack={colorBack}
          colorFront={colorFront}
          shape="warp"
          type="4x4"
          size={2}
          speed={1}
          scale={0.6}
          className="absolute inset-0 z-0 mx-auto"
        />
      </div> */}
      <div
        id="hero"
        className="relative z-10 mx-auto w-full max-w-sm scroll-mt-24 text-center sm:max-w-2xl lg:max-w-4xl"
      >
        <div className="">
          <MotionStagger>
            <MotionItem>
              <p className="mb-6 border inline-flex items-center gap-2 bg-background/60 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm sm:text-sm">
                <span className="size-2 rounded-full bg-chart-1" />
                Developer PR content assistant
              </p>
            </MotionItem>

            <MotionItem>
              <p className="text-balance mt-4 sm:mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-6xl">
                Ship it. <span className="text-primary">Make noise.</span>
              </p>
            </MotionItem>

            <MotionItem>
              <p className="mt-4 sm:mt-5 mx-auto max-w-md text-pretty text-sm leading-6 text-muted-foreground sm:max-w-2xl sm:text-base lg:text-md">
                Drop a GitHub PR or commit link. Public repos work instantly,
                and signed-in users can connect selected private repos through
                the GitHub App.
              </p>
            </MotionItem>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <MotionItem>
                <ScrollToGeneratorButton />
              </MotionItem>
            </div>
          </MotionStagger>
        </div>
      </div>
    </section>
  );
}
