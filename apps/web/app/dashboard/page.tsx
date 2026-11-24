import type { Metadata } from "next";
import { Suspense } from "react";
import { NewGeneration } from "@/features/generate/components/new-generation";
import { RecentGenerations } from "@/features/generations/components/recent-generations";

export const metadata: Metadata = {
  title: "New generation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <main className="relative isolate mx-auto max-w-3xl px-4 pb-10 pt-2 sm:px-8">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold sm:text-2xl">New generation</h1>
        <p className="text-sm text-muted-foreground">
          Turn a GitHub pull request or commit into summaries and share-ready
          posts.
        </p>
      </div>

      <div className="mt-6">
        <NewGeneration />
      </div>

      <div className="mt-10">
        <Suspense fallback={null}>
          <RecentGenerations />
        </Suspense>
      </div>
    </main>
  );
}
