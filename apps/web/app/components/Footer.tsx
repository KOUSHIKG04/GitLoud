"use client";

import { HomeLink } from "@/components/HomeLink";
import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog";
import { useUser } from "@clerk/nextjs";
import { Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const footerLinkClass =
  "px-3 py-1 border shadow-sm text-chart-3 relative transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/50 after:transition-all after:duration-300 hover:text-primary/80 hover:after:w-full disabled:opacity-60";

export function Footer() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  function openProtectedPath(path: string) {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLoginDialogOpen(true);
      return;
    }

    router.push(path);
  }

  return (
    <>
      <footer className="border-t bg-background px-4 py-2 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            Copyright (c) {new Date().getFullYear()} GitLoud. Built for
            developers who ship in public.
          </span>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
            <Link href="/examples" className={footerLinkClass}>
              EXAMPLES
            </Link>
            <button
              type="button"
              disabled={!isLoaded}
              onClick={() => openProtectedPath("/dashboard")}
              className={footerLinkClass}
            >
              DASHBOARD
            </button>
            <button
              type="button"
              disabled={!isLoaded}
              onClick={() => openProtectedPath("/dashboard/history")}
              className={footerLinkClass}
            >
              HISTORY
            </button>
            <HomeLink
              aria-label="Go to home"
              className="px-3 py-1 border shadow-sm relative transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/50 after:transition-all after:duration-300 hover:text-primary/80 hover:after:w-full"
            >
              <Home className="size-3.5 mt-0.75" />
            </HomeLink>
          </nav>
        </div>
      </footer>

      <AuthRequiredDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
    </>
  );
}
