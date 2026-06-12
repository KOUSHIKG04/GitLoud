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

/**
 * Renders the Privacy Policy static page.
 *
 * @returns React page layout component.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-dvh text-foreground">
      <Header />
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              GitLoud
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Privacy Policy
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              GitLoud collects only the account and project information needed
              to provide authentication, generation history, and related product
              features.
            </p>
          </div>

          <div className="grid gap-4 text-sm leading-7 text-muted-foreground md:grid-cols-2">
            <section className="space-y-2 border border-border bg-background p-5 shadow-xs">
              <h2 className="text-base font-semibold text-foreground">
                Information We Use
              </h2>
              <p>
                We may use your email address, display name, authentication
                identifier, GitHub App installation metadata, selected
                repository names, pull request or commit details, media
                attachment metadata, generated content history, and feedback
                messages with an optional contact email to operate and improve
                GitLoud.
              </p>
            </section>

            <section className="space-y-2 border border-border bg-background p-5 shadow-xs">
              <h2 className="text-base font-semibold text-foreground">
                How It Is Used
              </h2>
              <p>
                Your information is used to sign you in, fetch GitHub PR or
                commit data you submit, generate content, save your generation
                history, improve reliability, and show the correct profile
                details in the app. For private repositories, GitLoud reads the
                selected PR or commit through a GitHub App installation token
                and sends the relevant metadata and code diff context to the
                configured AI provider for generation.
              </p>
            </section>

            <section className="space-y-2 border border-border bg-background p-5 shadow-xs">
              <h2 className="text-base font-semibold text-foreground">
                Third-Party Services
              </h2>
              <p>
                GitLoud uses infrastructure, authentication, database, media
                storage, GitHub, payment, and AI provider services to deliver
                the product. These providers process data only as needed for the
                requested feature. Do not connect repositories that contain data
                you are not allowed to process through these services.
              </p>
            </section>

            <section className="space-y-2 border border-border bg-background p-5 shadow-xs">
              <h2 className="text-base font-semibold text-foreground">
                Data Control
              </h2>
              <p>
                You can request deletion or correction of account-related data.
                Saved generations are also removed by retention cleanup after
                the configured retention period. Disconnecting GitHub from the
                settings page uninstalls the GitHub App for that installation
                and removes the local installation record. Some records may be
                retained when required for security, compliance, or abuse
                prevention.
              </p>
            </section>

            <section className="space-y-2 border border-border bg-background p-5 shadow-xs md:col-span-2">
              <h2 className="text-base font-semibold text-foreground">
                Compliance Status
              </h2>
              <p>
                GitLoud does not currently claim SOC 2 or ISO/IEC 27001
                certification. Security-conscious teams should review the
                product controls and their own data handling requirements before
                connecting private repositories.
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
