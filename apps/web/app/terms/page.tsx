import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for GitLoud.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              By creating an account or using GitLoud, you agree to use the
              service responsibly and only with repositories and content you are
              authorized to access.
            </p>
          </div>

          <div className="space-y-6 text-sm leading-7 text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Account Use
              </h2>
              <p>
                You are responsible for activity under your account and for
                keeping your authentication provider secure. Do not use GitLoud
                to process content you do not have permission to use.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Generated Content
              </h2>
              <p>
                GitLoud helps generate summaries, posts, and related developer
                content. You are responsible for reviewing generated output
                before publishing or relying on it.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Service Changes
              </h2>
              <p>
                GitLoud may change, pause, or discontinue features as the
                product evolves. Continued use after changes means you accept the
                updated terms.
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
