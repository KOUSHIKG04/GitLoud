"use client";

import { HomeLink } from "@/components/HomeLink";
import { Home } from "lucide-react";
import Link from "next/link";

const footerLinkClass =
  "px-3 py-1 border shadow-sm text-chart-3 relative transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/50 after:transition-all after:duration-300 hover:text-primary/80 hover:after:w-full disabled:opacity-60";
const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t bg-background px-4 py-2 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>
          Copyright (c) {currentYear} GitLoud. Built for developers who ship in
          public.
        </span>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-4"
        >
          <HomeLink
            aria-label="Go to home"
            className="relative border px-3 py-1 shadow-sm transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/50 after:transition-all after:duration-300 hover:text-primary/80 hover:after:w-full"
          >
            <Home className="mt-0.75 size-3.5" />
          </HomeLink>
          <Link href="/examples" className={footerLinkClass}>
            EXAMPLES
          </Link>
          <Link href="/#feedback" className={footerLinkClass}>
            FEEDBACK
          </Link>
          <Link href="/security" className={footerLinkClass}>
            SECURITY
          </Link>
          <Link href="/privacy" className={footerLinkClass}>
            PRIVACY
          </Link>
          <Link href="/terms" className={footerLinkClass}>
            TERMS
          </Link>
        </nav>
      </div>
    </footer>
  );
}
