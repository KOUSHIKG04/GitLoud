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
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] min-w-0 max-w-3xl flex-col">
      <div className="flex min-w-0 flex-1 justify-center px-3 pb-5 pt-0 sm:px-8 sm:pb-6">
        <section className="mt-4 min-w-0 w-full space-y-5 sm:mt-5 sm:space-y-6">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight sm:text-2xl">
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
