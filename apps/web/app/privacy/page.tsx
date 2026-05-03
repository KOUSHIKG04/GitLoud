import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for GitLoud.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              GitLoud
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              GitLoud collects only the account and project information needed
              to provide authentication, generation history, and related product
              features.
            </p>
          </div>

          <div className="space-y-6 text-sm leading-7 text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Information We Use
              </h2>
              <p>
                We may use your email address, display name, authentication
                identifier, pull request details, and generated content history
                to operate GitLoud.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                How It Is Used
              </h2>
              <p>
                Your information is used to sign you in, save your generation
                history, improve reliability, and show the correct profile
                details in the app.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Data Control
              </h2>
              <p>
                You can request deletion or correction of account-related data.
                Some records may be retained when required for security,
                compliance, or abuse prevention.
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
