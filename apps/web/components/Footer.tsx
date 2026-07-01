"use client";

import { AppLogo } from "@/assets/AppLogo";
import { HomeLink } from "@/components/HomeLink";
import Link from "next/link";

const currentYear = new Date().getFullYear();

const navigationLinks = [
  { href: "/", label: "Home", isHome: true },
  { href: "/examples", label: "Examples" },
  { href: "/feedback", label: "Feedback" },
  { href: "/dashboard", label: "Dashboard" },
];

const supportLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/security", label: "Security" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="border-b">
        <div className="mx-auto w-full max-w-7xl px-10 py-12">
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

      <div className="border-b">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-4 md:divide-x">
          <div className="border-b md:border-b-0 md:col-span-2 p-6 sm:p-10 flex flex-col items-start justify-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Contact Us:{" "}
              <a
                href="mailto:koushikgdatta5@gmail.com"
                className="font-medium text-foreground lowercase hover:text-chart-3 transition-colors"
              >
                koushikgdatta5@gmail.com
              </a>
            </h3>
            <p className="text-xs pt-3 text-muted-foreground/60">
              Copyright &copy; {currentYear} GitLoud. All rights reserved.
            </p>
          </div>

          <div className="hidden md:block border-b md:border-b-0 p-6 sm:p-10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="pt-3 space-y-3 text-sm uppercase">
              {navigationLinks.map(({ href, label, isHome }) => (
                <li key={href}>
                  {isHome ? (
                    <HomeLink className="text-muted-foreground hover:text-chart-3 transition-colors">
                      {label}
                    </HomeLink>
                  ) : (
                    <Link
                      href={href}
                      className="text-muted-foreground hover:text-chart-3 transition-colors"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 sm:p-10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Support
            </h3>
            <ul className="pt-3 space-y-3 text-sm uppercase">
              {supportLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-chart-3 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-hidden px-4 pt-10 pb-2">
        <h1 className="text-center text-[20vw] md:text-[15vw] font-bold leading-[0.85] tracking-tight bg-linear-to-b from-transparent/30 to-primary/40 bg-clip-text text-transparent -mb-6">
          GitLoud
        </h1>
      </div>
    </footer>
  );
}
