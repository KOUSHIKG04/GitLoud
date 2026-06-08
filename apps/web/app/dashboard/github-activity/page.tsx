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
    <main className="relative isolate">
      <div className="flex justify-center px-4 sm:px-8">
        <section className="w-full max-w-5xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              GITHUB ACTIVITY
            </h1>
            <p className="text-sm text-muted-foreground">
              Select synced commits or pull requests from your GitHub App
              installation and generate content without pasting links.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <GitHubActivityPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
