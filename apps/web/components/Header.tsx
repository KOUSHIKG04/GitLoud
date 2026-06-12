"use client";

import { ThemeToggle } from "@/components/ToggleThemeBtn";
import { Button } from "@repo/ui/components/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { HomeLink } from "@/components/HomeLink";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { AppLogo } from "@/assets/AppLogo";
import type { MouseEvent } from "react";

function scrollToLandingSection(
  event: MouseEvent<HTMLAnchorElement>,
  sectionId: string,
) {
  if (window.location.pathname !== "/") {
    return;
  }

  event.preventDefault();

  if (sectionId === "home") {
    const appScrollViewport = document.querySelector<HTMLElement>(
      "#app-scroll-area [data-main-viewport]",
    );

    appScrollViewport?.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function Header() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <>
      <header className="fixed left-1/2 top-5.5 z-50 flex h-14 w-[80%] -translate-x-1/2 items-center justify-between rounded-xs border border-border bg-background px-5 py-0 shadow-lg dark:border-white/10 dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-center">
          <HomeLink className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <AppLogo className="size-6" />
            <span>GitLoud</span>
          </HomeLink>
        </div>

        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:flex"
        >
          <HomeLink
            className="transition-colors hover:text-foreground"
            onClick={(event) => scrollToLandingSection(event, "home")}
          >
            Home
          </HomeLink>
          <Link
            href="/#generator"
            className="transition-colors hover:text-foreground"
            onClick={(event) => scrollToLandingSection(event, "generator")}
          >
            Generator
          </Link>
          <Link
            href="/#pricing"
            className="transition-colors hover:text-foreground"
            onClick={(event) => scrollToLandingSection(event, "pricing")}
          >
            Pricing
          </Link>
          <Link
            href="/examples"
            className="transition-colors hover:text-foreground"
          >
            Examples
          </Link>
          <Link
            href="/#feedback"
            className="transition-colors hover:text-foreground"
            onClick={(event) => scrollToLandingSection(event, "feedback")}
          >
            Feedback
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isLoaded && !isSignedIn ? (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/sign-in">SIGN IN</Link>
              </Button>

              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/sign-up">SIGN UP</Link>
              </Button>
            </>
          ) : null}

          {isSignedIn ? <UserProfileMenu /> : null}

          <ThemeToggle />
        </div>
      </header>
      <div className="h-18" aria-hidden="true" />
    </>
  );
}
