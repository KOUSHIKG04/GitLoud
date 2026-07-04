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
    <main className="min-h-dvh text-foreground tracking-tighter">
      <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
        <Header />

        <div className="divide-y divide-border w-full">
         
          <section className="px-4 py-10 sm:px-6 lg:px-20 lg:pt-20 lg:pb-10">
            <div className="mx-auto max-w-5xl text-left">
              <div className="space-y-3">
                <p className="text-md font-semibold uppercase tracking-wider text-primary">
                  TERMS
                </p>
                <h1 className="mt-4 text-balance text-4xl font-bold tracking-tighter">
                  Terms of Service
                </h1>
                <p className="mt-3 max-w-3xl text-md leading-6 text-muted-foreground tracking-tighter">
                  By creating an account or using GitLoud, you agree to use the
                  service responsibly and only with repositories and content you are
                  authorized to access.
                </p>
              </div>
            </div>
          </section>

  
          <section className="px-4 py-10 sm:px-6 lg:px-20 lg:py-10">
            <div className="mx-auto max-w-5xl text-left">
              <section className="space-y-1 shadow-xs">
                <h2 className="text-xl font-bold tracking-tight">
                  Account Use
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  You are responsible for activity under your account and for
                  keeping your authentication provider secure. Do not use GitLoud
                  to process content you do not have permission to use.
                  Organization owners should ensure they are allowed to connect a
                  GitHub App to selected private repositories before enabling
                  private repository generation.
                </p>
              </section>
            </div>
          </section>

     
          <section className="px-4 py-10 sm:px-6 lg:px-20 lg:py-10">
            <div className="mx-auto max-w-5xl text-left">
              <section className="space-y-1 shadow-xs">
                <h2 className="text-xl font-bold tracking-tight">
                  Generated Content
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  GitLoud helps generate summaries, posts, and related developer
                  content. You are responsible for reviewing generated output
                  before publishing or relying on it. Private repository
                  generation may process PR or commit metadata and code diff
                  context through GitLoud&apos;s backend and the configured AI
                  provider.
                </p>
              </section>
            </div>
          </section>

        
          <section className="px-4 py-10 sm:px-6 lg:px-20 lg:py-10">
            <div className="mx-auto max-w-5xl text-left">
              <section className="space-y-1 shadow-xs">
                <h2 className="text-xl font-bold tracking-tight">
                  Service Changes
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  GitLoud may change, pause, or discontinue features as the
                  product evolves. Continued use after changes means you accept
                  the updated terms.
                </p>
              </section>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
