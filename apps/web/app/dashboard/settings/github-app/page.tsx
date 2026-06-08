import type { Metadata } from "next";
import { SettingsClient } from "../settings-client";

export const metadata: Metadata = {
  title: "GitHub App Settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GitHubAppSettingsPage() {
  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-1 justify-center px-4 pb-6 pt-0 sm:px-8">
        <section className="w-full max-w-4xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              GITHUB APP
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage private repository access through your GitHub App.
            </p>
          </div>

          <SettingsClient view="github-app" />
        </section>
      </div>
    </main>
  );
}
