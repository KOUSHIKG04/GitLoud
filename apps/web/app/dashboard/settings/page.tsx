import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1 justify-center px-4 pb-8 pt-12 sm:px-8">
        <section className="w-full max-w-4xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              SETTINGS
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage paid private repository access and custom AI credentials.
            </p>
          </div>

          <SettingsClient />
        </section>
      </div>

      <Footer />
    </main>
  );
}
