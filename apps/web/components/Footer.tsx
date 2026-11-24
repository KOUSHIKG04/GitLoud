"use client";

import { AppLogo } from "@/components/icons/AppLogo";
import { HomeLink } from "@/components/HomeLink";
import { MailOpen } from "lucide-react";
import Link from "next/link";

const currentYear = new Date().getFullYear();

const navigationLinks = [
  { href: "/", label: "Home", isHome: true },
  { href: "/examples", label: "Examples" },
  { href: "/feedback", label: "Feedback" },
];

const resourceLinks = [
  { href: "/examples", label: "Examples" },
  { href: "/security-and-privacy", label: "Security and privacy" },
  { href: "/feedback", label: "Send feedback" },
];

const supportLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/faq", label: "FAQ" },
  { href: "/security-and-privacy", label: "Security & Privacy" },
];

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="border-b">
        <div className="mx-auto w-full max-w-7xl px-10 py-12">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <HomeLink className="flex items-center gap-2.5">
                <AppLogo className="size-6 text-foreground" />
                <span className="text-xl font-bold text-foreground">
                  GitLoud
                </span>
              </HomeLink>
              <span className="h-5 w-px bg-border" aria-hidden="true" />
              <h3 className="text-base font-semibold text-foreground">
                Free, and open source
              </h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              GitLoud costs nothing to use and its code is public on GitHub.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {resourceLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-foreground underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:decoration-primary"
                >
                  {label}
                </Link>
              ))}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-4 md:divide-x">
          <div className="border-b md:border-b-0 md:col-span-2 p-6 sm:p-10 flex flex-col items-start justify-center">
            <h3 className="text-sm font-semibold uppercase tracking-normal text-foreground">
              Contact Us:{" "}
              <a
                href="mailto:koushikgdatta5@gmail.com"
                className="inline-flex gap-1.5 items-center font-medium text-foreground lowercase hover:text-chart-3 transition-colors"
              >
                koushikgdatta5@gmail.com <MailOpen size={10} />
              </a>
            </h3>
            <p className="text-xs pt-3 text-muted-foreground/60 tracking-normal">
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
        <div
          aria-hidden="true"
          className="text-center text-[20vw] md:text-[15vw] font-bold leading-[0.85] bg-linear-to-b from-transparent/30 to-primary/40 bg-clip-text text-transparent -mb-6"
        >
          GitLoud
        </div>
      </div>
    </footer>
  );
}
