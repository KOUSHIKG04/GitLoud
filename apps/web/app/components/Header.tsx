"use client";

import { ThemeToggle } from "@/components/ToggleThemeBtn";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = pathname !== "/";

  function navigateBack() {
    if (pathname.startsWith("/dashboard/generations/")) {
      router.push("/dashboard/history");
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

      <ThemeToggle />
    </header>
  );
}
