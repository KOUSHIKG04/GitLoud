import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageStructuredData } from "@/components/seo/PageStructuredData";

const title = "Terms of Service and Responsible Platform Use";
const description =
  "Review terms governing GitLoud accounts, authorized repository access, AI-generated content, acceptable use, service availability, and user responsibilities.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <PageStructuredData
        name={`${title} | GitLoud`}
        description={description}
        path="/terms"
      />
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
                    By creating an account or using GitLoud, you agree to use
                    the service responsibly and only with repositories and
                    content you are authorized to access. These terms explain
                    account responsibilities, acceptable use, generated output,
                    connected services, and the limits of this evolving
                    developer tool.
                  </p>
                </div>
              </div>
            </section>

            <TermsSection title="Account Use">
              You are responsible for activity under your account and for
              keeping your authentication provider secure. Do not share access
              to an account in a way that bypasses applicable limits or exposes
              another person&apos;s data. You must provide accurate information
              where required and promptly address suspected unauthorized use.
              Organization owners should confirm they are permitted to connect a
              GitHub App before enabling access to selected private
              repositories.
            </TermsSection>

            <TermsSection title="Authorized Repository Access">
              Submit only public links you are allowed to use or private
              repositories for which you have valid access and organizational
              approval. Read-only access does not remove your responsibility to
              protect source code, customer information, trade secrets, or
              regulated data. Do not connect repositories that your employer,
              client, or project policy prohibits from being processed by
              third-party infrastructure or AI services.
            </TermsSection>

            <TermsSection title="Generated Content">
              The service helps create summaries, posts, changelog entries,
              portfolio bullets, and related developer content. AI-generated
              output may be incomplete, inaccurate, repetitive, or unsuitable
              for a particular audience. You are responsible for reviewing the
              source context, removing sensitive details, correcting factual
              errors, and confirming that you have the right to publish the
              final version. Generated drafts are not legal, security, or
              professional advice.
            </TermsSection>

            <TermsSection title="Acceptable Use">
              Do not use the platform to violate law, intellectual property
              rights, privacy rights, repository policies, or the security of
              another service. Prohibited activity includes attempting to gain
              unauthorized access, submitting malicious payloads, evading rate
              limits, disrupting infrastructure, distributing secrets, or using
              generated content for deceptive impersonation, harassment, or
              abuse. Automated access must respect documented interfaces and
              reasonable usage limits.
            </TermsSection>

            <TermsSection title="Connected Providers and Data Processing">
              Features may rely on authentication, hosting, database, media,
              GitHub, Discord, and AI provider services. Relevant pull request
              or commit metadata and code diff context may be processed by the
              configured provider to complete a generation request. Availability
              and behavior can be affected by those providers&apos; policies,
              outages, quotas, and rate limits. Review the Security & Privacy
              page before connecting sensitive projects.
            </TermsSection>

            <TermsSection title="Ownership and License">
              You retain your rights in content and repository material you
              submit. You grant the limited permission needed to process that
              material and provide the requested feature. You are responsible
              for determining whether generated output can be used, modified, or
              published under the licenses and agreements that apply to your
              source project and organization.
            </TermsSection>

            <TermsSection title="Service Availability and Changes">
              The product is provided on an evolving basis and may contain
              errors or experience interruptions. Features may be changed,
              paused, limited, or discontinued, and no uninterrupted level of
              availability is guaranteed. Access may be restricted when needed
              to protect users, investigate abuse, comply with legal
              obligations, or maintain the service. Continued use after updated
              terms take effect means you accept those changes.
            </TermsSection>

            <TermsSection title="Contact and Questions">
              If you have questions about these terms, repository authorization,
              or account data, use the contact address provided in the footer.
              Do not include passwords, access tokens, API keys, webhook URLs,
              private source code, or other secrets in support or feedback
              messages. These terms should be read together with the Security &
              Privacy information, which explains the current access model,
              connected providers, data controls, and practical limits of the
              service.
            </TermsSection>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

function TermsSection({
  title: sectionTitle,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-20">
      <div className="mx-auto max-w-5xl text-left">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">{sectionTitle}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{children}</p>
        </div>
      </div>
    </section>
  );
}
