"use client";

import { MotionItem, MotionStagger } from "@/components/LandingMotion";
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import { DashboardGetStartedButton } from "../DashboardGetStartedButton";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden py-24 sm:py-28 lg:pb-22 lg:pt-18 w-full">
      <div
        id="hero"
        className=" relative z-10 mx-auto w-full max-w-sm scroll-mt-24 text-center sm:max-w-2xl lg:max-w-4xl px-4 sm:px-6 lg:px-8"
      >
        <div className="relative ">
          <MotionStagger>
            <MotionItem>
              <Button
                variant="outline"
                className="pointer-event-none mb-12 border uppercase inline-flex items-center gap-4 bg-background/60 px-4  py-1.5  font-medium tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm sm:text-sm"
              >
                <span className="size-2 rounded-full bg-chart-1" />
                <span className="text-[13px] text-foreground">
                  Developer content assistant
                </span>
              </Button>
            </MotionItem>

            <MotionItem>
              <h1 className="relative z-10 uppercase text-balance mt-4 sm:mt-5 text-3xl font-bold tracking-tighter sm:text-4xl lg:text-[40px]">
                Ship it,{" "}
                <span
                  className={cn(
                    "after:rotate-5 after:-skew-5 after:absolute after:bg-primary after:-z-10 after:inset-0 after:content-[''] after:w-full after:h-full",
                    "text-center tracking-tight inline-block relative z-10 ",
                  )}
                >
                  Make noise.
                </span>
              </h1>
            </MotionItem>

            <MotionItem>
              <p className="mt-3 sm:mt-5 mx-auto max-w-md text-pretty text-sm leading-5.5 text-muted-foreground sm:max-w-2xl sm:text-base lg:text-md tracking-tighter md:block">
                Paste one GitHub PR or commit link, or connect GitHub to combine
                up to five PRs or commits from one repository. GitLoud turns the
                changes into one publish-ready set of{" "}
                <span className="text-primary/90">social posts</span>,
                summaries, changelog notes and portfolio bullets.
              </p>
            </MotionItem>

            <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MotionItem>
                <Button
                  asChild
                  variant="outline"
                  className="px-6 py-4 active:scale-98 inline-flex items-center gap-2 text-foreground"
                >
                  <a
                    href="https://github.com/KOUSHIKG04/GitLoud"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIconIcon className="size-4" />
                    STAR ON GITHUB
                  </a>
                </Button>
              </MotionItem>{" "}
              <MotionItem>
                <DashboardGetStartedButton />
              </MotionItem>
            </div>
          </MotionStagger>
        </div>
      </div>

      <MotionStagger>
        <MotionItem>
          <div className="relative mx-auto mt-18 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            <Image
              src="/GitLoud-Dashboard-Preview.png"
              alt="GitLoud Dashboard Preview"
              width={1000}
              height={605}
              priority
              className="shadow-2xl shadow-primary/5 select-none h-auto w-full scale-102 object-top-left"
            />
          </div>
        </MotionItem>
      </MotionStagger>
    </section>
  );
}
