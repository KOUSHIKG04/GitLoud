import { PrForm } from "./_components/pr-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <main className="relative isolate flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-1 justify-center px-4 pb-6 pt-0 sm:px-8">
        <section className="w-full max-w-5xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              DASHBOARD
            </h1>
            <p className="text-sm text-muted-foreground">
              Paste a GitHub pull request or commit link to start generating
              summaries and share-ready posts for free.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <PrForm />
          </div>
        </section>
      </div>
    </main>
  );
}
