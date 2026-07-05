import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ContentExamplesSection } from "@/components/home/ContentExamplesSection";

export const metadata: Metadata = {
  title: "Examples | GitLoud",
  description:
    "Explore examples of AI-generated pull request summaries, changelog entries, portfolio bullets, release notes, and social posts created from GitHub pull requests and commits.",
  alternates: {
    canonical: "/examples",
  },
  openGraph: {
    title: "Examples | GitLoud",
    description:
      "See real examples of developer content generated from GitHub pull requests and commits.",
    url: "/examples",
  },
};

export default function ExamplesPage() {
  return (
    <main className="min-h-dvh">
      <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
        <Header />

        <section className="px-4 pt-10 pb-6 sm:px-6 lg:px-20 lg:pt-20 lg:pb-6">
          <div className="mx-auto max-w-5xl text-left">
            <p className="text-md font-semibold uppercase tracking-wider text-primary">
              EXAMPLES
            </p>

            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tighter">
              See what GitLoud can generate
            </h1>

            <p className="mt-3 max-w-4xl text-md leading-6 text-muted-foreground tracking-tighter">
              Example below was generated from a GitHub pull request or
              commit. GitLoud transforms technical changes into clear, shareable
              content for teammates, recruiters, & your developer portfolio.
            </p>
          </div>
        </section>

        <ContentExamplesSection />
      </div>

      <Footer />
    </main>
  );
}
