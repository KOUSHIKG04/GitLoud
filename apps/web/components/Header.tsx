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
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ToggleThemeBtn";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";

type NavItem = {
  label: string;
  href: string;
  component: typeof Link | typeof HomeLink;
  section?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    component: HomeLink,
    section: "home",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    component: Link,
  },
  {
    label: "Examples",
    href: "/examples",
    component: Link,
  },
  {
    label: "Feedback",
    href: "/feedback",
    component: Link,
  },
];

import { scrollToTop } from "@/lib/scroll";

function scrollToLandingSection(
  event: MouseEvent<HTMLAnchorElement>,
  sectionId: string,
) {
  if (window.location.pathname !== "/") {
    return;
  }

  event.preventDefault();

  if (sectionId === "home") {
    scrollToTop();
    return;
  }

  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

type NavigationProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function Navigation({ mobile = false, onNavigate }: NavigationProps) {
  const { isSignedIn } = useUser();

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.href === "/dashboard") {
      return isSignedIn;
    }
    return true;
  });

  return (
    <>
      {filteredNavItems.map((item) => {
        const Component = item.component;

        return (
          <Component
            key={item.label}
            href={item.href}
            className={
              mobile
                ? "w-full px-6 py-4 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                : "text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-chart-2"
            }
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
              onNavigate?.();

              if (item.section) {
                scrollToLandingSection(event, item.section);
              }
            }}
          >
            {item.label}
          </Component>
        );
      })}
    </>
  );
}

export function Header() {
  const { isLoaded, isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 lg:px-12 py-0 shadow-xs backdrop-blur-md dark:border-white/10">
        <div className="flex items-center">
          <HomeLink className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <AppLogo className="size-6" />
            <span>GitLoud</span>
          </HomeLink>
        </div>

        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 md:flex"
        >
          <Navigation />
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground rounded-full"
          >
            <a
              href="https://github.com/KOUSHIKG04/GitLoud"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <GithubIconIcon className="size-5" />
            </a>
          </Button>
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
            <SheetContent
              side="left"
              className="w-72 p-0 pt-14 flex flex-col h-full"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav className="flex w-full flex-col">
                <Navigation mobile onNavigate={() => setMobileOpen(false)} />
              </nav>

              <div className="mt-auto p-6 border-t border-border w-full flex flex-col gap-4">
                {isLoaded && !isSignedIn ? (
                  <div className="flex flex-col gap-3">
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
                  <UserProfileMenu
                    accountMenu
                    showLabel
                    side="top"
                    variant="outline"
                    className="w-full h-10 justify-start gap-3 px-3"
                  />
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
