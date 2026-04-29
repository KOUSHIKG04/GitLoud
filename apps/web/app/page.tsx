import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PrForm } from "@/dashboard/pr-form";
import { ScrollToGeneratorButton } from "@/components/ScrollToGeneratorButton";

export const metadata: Metadata = {
  title: "GitHub PR Summary and Social Post Generator",
  description:
    "Use GitLoud to turn GitHub pull requests and commits into clear summaries, feature notes, changelog entries, portfolio bullets, and social posts.",
  alternates: {
    canonical: "/",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitloud.app";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GitLoud",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "Generate GitHub pull request and commit summaries, changelog entries, portfolio bullets, and share-ready posts for developers.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Header />

      <section className="flex min-h-[68dvh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-sm text-center sm:max-w-2xl lg:max-w-4xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
            Developer PR content assistant
          </p>

          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Generate share-ready content from GitHub PRs
          </h1>

          <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-6 text-muted-foreground sm:mt-5 sm:max-w-2xl sm:text-base lg:text-lg">
            Paste a GitHub pull request link and instantly create summaries,
            feature notes, changelog entries, and social posts.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <ScrollToGeneratorButton />
          </div>
        </div>
      </section>

      <section
        id="generator"
        className="border-y bg-background px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Dashboard
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Paste a PR or commit and generate content
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              This is the same generation workflow from the dashboard. After the
              content is created, GitLoud opens a separate result page where you
              can copy and share each format.
            </p>
          </div>

          <PrForm />
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              What GitLoud does
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Turn code changes into clear updates
            </h2>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              GitLoud reads public GitHub pull requests and commits, summarizes
              the technical work, and creates platform-ready content for sharing
              progress.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureBlock
              title="Reads GitHub changes"
              description="Fetches PR or commit metadata, changed files, stats, and text diffs from public repositories."
            />
            <FeatureBlock
              title="Generates useful summaries"
              description="Creates short summaries, technical notes, feature lists, tech used, and beginner-friendly explanations."
            />
            <FeatureBlock
              title="Prepares share posts"
              description="Builds copy-ready content for X, LinkedIn, Reddit, portfolio updates, and changelogs."
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FeatureBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border bg-card p-5 text-card-foreground">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
