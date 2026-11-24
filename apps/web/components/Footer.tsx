"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { AppLogo } from "@/components/icons/AppLogo";
import { HomeLink } from "@/components/HomeLink";

const currentYear = new Date().getFullYear();

const columns = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Home", isHome: true },
      { href: "/examples", label: "Examples" },
      { href: "/feedback", label: "Send feedback" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/security-and-privacy", label: "Security and privacy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="border-b border-border">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0 md:border-x md:border-border">
          <div className="space-y-4 p-6 sm:p-10 lg:px-12 md:col-span-2">
            <HomeLink className="inline-flex items-center gap-2.5">
              <AppLogo className="size-6 text-foreground" />
              <span className="text-xl font-bold text-foreground">
                GitLoud
              </span>
            </HomeLink>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Free and open source. GitLoud costs nothing to use and its code
              is public on GitHub.
            </p>
            <a
              href="mailto:koushikgdatta5@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary"
            >
              <Mail className="size-4" aria-hidden="true" />
              koushikgdatta5@gmail.com
            </a>
          </div>

          {columns.map((column) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className="p-6 sm:p-10 lg:px-12"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {"isHome" in link ? (
                      <HomeLink className={linkClass}>{link.label}</HomeLink>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-5xl px-6 py-5 text-xs text-muted-foreground sm:px-10 md:border-x md:border-border lg:px-12">
          © {currentYear} GitLoud. All rights reserved.
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
