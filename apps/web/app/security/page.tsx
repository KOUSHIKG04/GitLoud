import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Security and Trust",
  description:
    "Security and trust information for GitLoud private repository access.",
  alternates: {
    canonical: "/security",
  },
};

const securityControls = [
  "Private repository access is optional and available only through the GitLoud GitHub App.",
  "GitHub App access can be limited to selected repositories during installation.",
  "GitLoud requests read-only repository permissions for contents, metadata, and pull requests.",
  "Private repository reads use server-side GitHub App installation tokens.",
  "Installation tokens are short-lived and are generated only when GitLoud needs to fetch a selected PR or commit.",
  "GitLoud does not request repository write access.",
  "Disconnecting GitHub from settings uninstalls the GitHub App installation and removes the local installation record.",
] as const;

export default function SecurityPage() {
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
              Security and Trust
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              GitLoud limits private repository access through selected GitHub
              App installations, read-only permissions, and short-lived
              server-side tokens. Teams with formal compliance requirements
              should also review the current certification status below before
              connecting private repositories.
            </p>
          </div>

          <div className="grid gap-4">
            <section className="space-y-4 border border-border bg-background p-5 shadow-xs">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">
                  Private Repository Access
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  GitLoud uses a GitHub App instead of asking users for broad
                  personal access tokens. The app can be installed for selected
                  repositories, and GitLoud uses the installation to read only
                  the PR or commit data needed for generation.
                </p>
              </div>

              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {securityControls.map((control) => (
                  <li key={control} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 bg-primary" />
                    <span>{control}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4 border border-border bg-background p-5 shadow-xs">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Compliance Status</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  GitLoud is not currently SOC 2 or ISO/IEC 27001 certified. If
                  your team requires those certifications, treat private
                  repository access as an internal policy decision and connect
                  only repositories approved for processing through GitLoud and
                  its service providers.
                </p>
              </div>
              <div className="border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                If your organization requires vendor security review, complete
                that review before connecting private repositories.
              </div>
            </section>
          </div>

          <section className="space-y-4 border border-border bg-background p-5 shadow-xs">
            <h2 className="text-lg font-semibold">Data Handling</h2>
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                For public links, GitLoud fetches the submitted GitHub PR or
                commit. For private repositories, GitLoud fetches the selected
                PR or commit through the connected GitHub App installation.
              </p>
              <p>
                Generation may send relevant metadata and code diff context to
                the configured AI provider. Do not connect repositories that
                contain secrets, regulated data, customer data, or code your
                organization does not allow to be processed by third-party AI or
                infrastructure services.
              </p>
              <p>
                See the{" "}
                <Link href="/privacy" className="text-primary underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-primary underline">
                  Terms of Service
                </Link>{" "}
                for the broader product data terms.
              </p>
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
