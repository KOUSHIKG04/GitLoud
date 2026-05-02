"use client";

import { ThemeToggle } from "@/components/ToggleThemeBtn";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { ChevronLeft, History, Home } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = pathname !== "/";
  const { isLoaded, isSignedIn } = useUser();
  const isHomePage = pathname === "/";
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!isHomePage) {
      setHasScrolled(true);
      return;
    }

    function handleScroll() {
      setHasScrolled(window.scrollY > 16);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  function navigateBack() {
    if (pathname.startsWith("/dashboard/generations/")) {
      router.push("/dashboard");
      return;
    }

    if (pathname === "/dashboard/history") {
      router.push("/dashboard");
      return;
    }

    if (pathname === "/dashboard") {
      router.push("/");
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    // <header
    //   className={[
    //     "fixed left-1/2 z-50 flex items-center justify-between px-5 py-3 will-change-[top,width,background-color,box-shadow,border-color] transition-[top,width,background-color,box-shadow,border-color,backdrop-filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
    //     hasScrolled
    //       ? "top-5.5 w-[80%] -translate-x-1/2 border border-border/70 bg-background/65 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45 dark:border-white/10 dark:bg-background/35 dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
    //       : "top-0 w-full -translate-x-1/2 border border-transparent bg-transparent shadow-[0_0_0_rgba(0,0,0,0)] backdrop-blur-0",
    //   ].join(" ")}
    // >
    <header className="fixed rounded-xs left-1/2 top-5.5 z-50 flex w-[80%] -translate-x-1/2 items-center justify-between border border-border/70 bg-background/65 px-5 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45 dark:border-white/10 dark:bg-background/35 dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-[min(var(--radius-md),10px)]"
            onClick={navigateBack}
            aria-label="Go back"
            title="Go back"
          >
            <ChevronLeft className="size-6 mt-0.25" />
          </Button>
        ) : null}

        <Link href="/" className="text-lg font-bold tracking-tight">
          GitLoud
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {isLoaded && !isSignedIn ? (
          <>
            <Button
              asChild
              variant="outline"
              size="icon-sm"
              className="sm:hidden"
              aria-label="Sign in"
              title="Sign in"
            >
              <Link href="/sign-in">
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/sign-in">SIGN IN</Link>
            </Button>

            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/sign-up">SIGN UP</Link>
            </Button>
          </>
        ) : null}

        {isSignedIn ? (
          <>
            <Button
              asChild
              variant="outline"
              size="icon-sm"
              className="size-8 rounded-none p-0 border-0 shadow-xs"
              aria-label="Go to home"
              title="Go to home"
            >
              <Link href="/">
                <Home className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="icon-sm"
              className="size-8 rounded-none p-0 border-0 shadow-xs"
              aria-label="Go to History"
              title="Go to History"
            >
              <Link href="/dashboard/history">
                <History className="size-4" />
              </Link>
            </Button>

            <UserProfileMenu />
          </>
        ) : null}

        <ThemeToggle />
      </div>
    </header>
  );
}
