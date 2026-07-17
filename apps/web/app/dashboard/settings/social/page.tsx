import type { Metadata } from "next";
import { SettingsClient } from "../settings-client";

export const metadata: Metadata = {
  title: "Social Accounts Settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SocialAccountsSettingsPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col">
      <div className="flex flex-1 justify-center px-4 pb-6 pt-0 sm:px-8">
        <section className="mt-5 w-full space-y-6">
          <div className="space-y-1">
            <h1 className="font-semibold tracking-tight sm:text-2xl">
              SOCIAL ACCOUNTS
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect publishing destinations and control where content is sent.
            </p>
          </div>

          <SettingsClient view="social" />
        </section>
      </div>
    </main>
  );
}
