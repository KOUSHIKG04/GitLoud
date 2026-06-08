import type { Metadata } from "next";
import { SettingsClient } from "../settings-client";

export const metadata: Metadata = {
  title: "API Key Settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApiKeySettingsPage() {
  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-1 justify-center px-4 pb-6 pt-0 sm:px-8">
        <section className="w-full max-w-4xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              API KEY
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage the AI provider key used for content generation.
            </p>
          </div>

          <SettingsClient view="api-key" />
        </section>
      </div>
    </main>
  );
}
