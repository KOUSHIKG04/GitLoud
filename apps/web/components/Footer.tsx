"use client";

import Link from "next/link";
import { AppLogo } from "@/assets/AppLogo";
import { HomeLink } from "@/components/HomeLink";
// import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="mx-auto w-full max-w-7xl">
        <div className="px-10 py-12 border-b">
          <div className="flex items-center gap-3">
            <AppLogo className="size-4 text-foreground" />
            <span className="text-md font-bold tracking-tight text-foreground">
              GitLoud
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            GitLoud turns GitHub pull requests and commits into clear summaries,
            changelog entries, portfolio bullets, and social posts. Built for
            developers who ship in public.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 divide-x border-b">
        <div className="col-span-2 p-10 flex flex-col items-left justify-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Contact Us:
            <span>
              <a
                href="koushikgdatta5@gmail.com"
                className="font-medium text-foreground lowercase hover:text-chart-3 transition-colors"
              >
                {" "}
                koushikgdatta5@gmail.com
              </a>
            </span>
          </h3>
          <div className="pt-2 text-sm leading-6 text-muted-foreground">
            <p></p>
            <p className="text-xs pt-1 text-muted-foreground/60">
              Copyright &copy; {currentYear} GitLoud. All rights reserved.
            </p>
          </div>
          
        </div>

        <div className="p-10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Navigation
          </h3>
          <ul className="pt-3 space-y-3 text-sm uppercase">
            <li>
              <HomeLink className="text-muted-foreground hover:text-chart-3 transition-colors">
                Home
              </HomeLink>
            </li>
            <li>
              <Link
                href="/examples"
                className="text-muted-foreground hover:text-chart-3 transition-colors"
              >
                Examples
              </Link>
            </li>
            <li>
              <Link
                href="/feedback"
                className="text-muted-foreground hover:text-chart-3 transition-colors"
              >
                Feedback
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-chart-3 transition-colors"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Support
          </h3>
          <ul className="pt-3 space-y-3 text-sm uppercase">
           
            <li>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-chart-3 transition-colors"
              >
                Privacy Policy
              </Link>
            </li> <li>
              <Link
                href="/security"
                className="text-muted-foreground hover:text-chart-3 transition-colors"
              >
                Security
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-chart-3 transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="overflow-hidden pt-10">
        <h1 className="text-center text-[15vw] font-bold leading-[0.8] tracking-tight bg-linear-to-b from-transparent to-primary/80 bg-clip-text text-transparent -mb-5.5">
          GitLoud
        </h1>
      </div>
    </footer>
  );
}
