import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ContentExamplesSection } from "@/components/home/ContentExamplesSection";
import { PageStructuredData } from "@/components/seo/PageStructuredData";

const title = "AI GitHub PR and Commit Content Examples";
const description =
  "Explore GitHub pull request and commit examples, including technical summaries, changelog entries, portfolio bullets, and social posts. View the output.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/examples",
  },
  openGraph: {
    title,
    description,
    url: "/examples",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Examples of developer content generated from GitHub changes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image"],
  },
};

export default function ExamplesPage() {
  return (
    <>
      <PageStructuredData
        name={`${title} | GitLoud`}
        description={description}
        path="/examples"
        pageType="CollectionPage"
      />
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
                commit. GitLoud transforms technical changes into clear,
                shareable content for teammates, recruiters, & your developer
                portfolio.
              </p>
            </div>
          </section>

          <ContentExamplesSection />

          
        </div>

        <Footer />
      </main>
    </>
  );
}
