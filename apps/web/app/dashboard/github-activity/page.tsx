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
    <main className="max-w-3xl mx-auto relative isolate">
      <div className="flex justify-center px-4 sm:px-8">
        <section className="w-full  space-y-4">
          <div className="space-y-2">
            <h1 className="font-semibold tracking-tight sm:text-2xl">
              GITHUB ACTIVITY
            </h1>
            <p className="text-md text-muted-foreground tracking-normal">
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
