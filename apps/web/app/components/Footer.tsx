import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Copyright 2026 GitLoud. Built for developers who ship in public.</p>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/dashboard/history"
            className="transition-colors hover:text-foreground"
          >
            History
          </Link>
        </nav>
      </div>
    </footer>
  );
}
