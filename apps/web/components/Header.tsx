"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { HomeLink } from "@/components/HomeLink";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { AppLogo } from "@/assets/AppLogo";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

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
  const { push } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed left-1/2 top-0 z-50 flex h-16 w-full -translate-x-1/2 items-center justify-between rounded-xs border border-border bg-background px-12 py-0 shadow-lg dark:border-white/10 dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
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
            href="/examples"
            className="transition-colors hover:text-foreground"
          >
            Examples
          </Link>
          <Link
            href="/feedback"
            className="transition-colors hover:text-foreground"
            onClick={() => push("/feedback")}
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

          {isSignedIn ? (
            <UserProfileMenu
              accountMenu
              side="bottom"
              sideOffset={24}
              className="hidden md:flex"
            />
          ) : null}


          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 pt-14 flex flex-col h-full">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav className="flex flex-col items-center text-sm font-medium uppercase tracking-wide w-full">
                <HomeLink
                  className="w-full text-center px-6 py-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={(event) => {
                    setMobileOpen(false);
                    scrollToLandingSection(event, "home");
                  }}
                >
                  Home
                </HomeLink>
                <Link
                  href="/#generator"
                  className="w-full text-center px-6 py-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={(event) => {
                    setMobileOpen(false);
                    scrollToLandingSection(event, "generator");
                  }}
                >
                  Generator
                </Link>
                <Link
                  href="/examples"
                  className="w-full text-center px-6 py-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Examples
                </Link>
                <Link
                  href="/feedback"
                  className="w-full text-center px-6 py-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setMobileOpen(false);
                    push("/feedback");
                  }}
                >
                  Feedback
                </Link>
              </nav>

              {isLoaded && !isSignedIn ? (
                <div className="mt-auto p-6 border-t border-border flex flex-col gap-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                    >
                      SIGN IN
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileOpen(false)}
                    >
                      SIGN UP
                    </Link>
                  </Button>
                </div>
              ) : isSignedIn ? (
                <div className="mt-auto p-6 border-t border-border w-full flex items-center justify-center">
                  <UserProfileMenu
                    accountMenu
                    showLabel
                    side="top"
                    variant="ghost"
                    className="w-full h-10 justify-start gap-3 px-3"
                  />
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="h-14" aria-hidden="true" />
    </>
  );
}
