"use client";

import { ThemeToggle } from "@/components/ToggleThemeBtn";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { ChevronLeft, History, Home } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = pathname !== "/";
  const { data: session, isPending } = useSession();
  const isSignedIn = Boolean(session?.user);

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
        {!isPending && !isSignedIn ? (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in">SIGN IN</Link>
            </Button>

            <Button asChild size="sm">
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
