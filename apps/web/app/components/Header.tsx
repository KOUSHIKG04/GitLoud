"use client";

import { ThemeToggle } from "@/components/ToggleThemeBtn";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { ChevronLeft, Home } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Show } from "@clerk/nextjs";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = pathname !== "/";

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

    router.back();
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-background border-b">
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
      <div className="flex items-center gap-2">
        <Show when="signed-out">
          <Button asChild variant="outline" size="sm">
            <Link href="/sign-in">SIGN IN</Link>
          </Button>

          <Button asChild size="sm">
            <Link href="/sign-up">SIGN UP</Link>
          </Button>
        </Show>

        <Show when="signed-in">
          <Button
            asChild
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-none p-0"
            aria-label="Go to home"
            title="Go to home"
          >
            <Link href="/">
              <Home className="size-4" />
            </Link>
          </Button>

          <UserProfileMenu />
        </Show>

        <ThemeToggle />
      </div>
    </header>
  );
}
