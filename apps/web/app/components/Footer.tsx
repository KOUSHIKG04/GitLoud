import { HomeLink } from "@/components/HomeLink";
import { Home } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background px-4  py-2 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>
          Copyright(©) {new Date().getFullYear()} GitLoud. Built for developers
          who ship in public.
        </span>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
          <Link
            href="/examples"
            className="px-3 py-1 border shadow-sm text-chart-3 relative transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/50 after:transition-all after:duration-300 hover:text-primary/80 hover:after:w-full"
          >
            EXAMPLES
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1 border shadow-sm text-chart-3 relative transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/50 after:transition-all after:duration-300 hover:text-primary/80 hover:after:w-full"
          >
            DASHBOARD
          </Link>
          <Link
            href="/dashboard/history"
            className="px-3 py-1 border shadow-sm relative text-chart-3 transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/50 after:transition-all after:duration-300 hover:text-primary/80 hover:after:w-full"
          >
            HISTORY
          </Link>
          <HomeLink
            aria-label="Go to home"
            className="px-3 py-1 border shadow-sm text-chart-3 relative transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/50 after:transition-all after:duration-300 hover:text-primary/80 hover:after:w-full"
          >
            <Home className="size-4 mt-0.25" />
          </HomeLink>
        </nav>
      </div>
    </footer>
  );
}
