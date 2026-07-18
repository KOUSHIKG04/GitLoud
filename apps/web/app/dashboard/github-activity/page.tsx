import { GitHubActivityPanel } from "../_components/github-activity-panel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Activity",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GitHubActivityPage() {
  return (
    <main className="relative isolate mx-auto w-full max-w-3xl pb-6">
      <div className="flex min-w-0 justify-center px-3 sm:px-6 lg:px-8">
        <section className="min-w-0 w-full space-y-4">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              GITHUB ACTIVITY
            </h1>
            <p className="max-w-2xl text-sm leading-6 tracking-normal text-muted-foreground sm:text-base sm:leading-7">
              Select synced commits or pull requests from your GitHub App
              installation and generate content without pasting links.
            </p>
          </div>

          <div className="mx-auto min-w-0 max-w-3xl">
            <GitHubActivityPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
