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
    <main className="max-w-3xl mx-auto relative isolate">
      <div className="flex justify-center px-4 pb-6 pt-0 sm:px-8">
        <section className="w-full space-y-4">
          <div className="space-y-2">
            <h1 className="font-semibold tracking-tight sm:text-2xl">
              DASHBOARD
            </h1>
            <p className="text-md text-muted-foreground tracking-normal">
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
