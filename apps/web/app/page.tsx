import type { Metadata } from "next";
// import { DraggableBits } from "@/components/DraggableBits";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionCursor } from "@/components/MotionCursor";
import { ScrollToGeneratorButton } from "@/components/ScrollToGeneratorButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MotionItem,
  MotionSection,
  MotionStagger,
  MotionViewportStagger,
} from "@/components/LandingMotion";

export const metadata: Metadata = {
  title: "GitHub PR Summary and Social Post Generator",
  description:
    "Use GitLoud to turn GitHub pull requests and commits into clear summaries, feature notes, changelog entries, portfolio bullets, and social posts.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GitHub PR Summary and Social Post Generator",
    description:
      "Use GitLoud to turn GitHub pull requests and commits into clear summaries, feature notes, changelog entries, portfolio bullets, and social posts.",
    url: "/",
  },
  twitter: {
    title: "GitHub PR Summary and Social Post Generator",
    description:
      "Use GitLoud to turn GitHub pull requests and commits into clear summaries, feature notes, changelog entries, portfolio bullets, and social posts.",
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

      <MotionCursor />
      <Header />

      <section className="relative flex min-h-[68dvh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* <DraggableBits /> */}

        <div className="mx-auto w-full max-w-sm text-center sm:max-w-2xl lg:max-w-4xl">
          <MotionStagger>
            <MotionItem>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                Developer PR content assistant
              </p>
            </MotionItem>

            <MotionItem>
              <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Generate share-ready content from GitHub PRs
              </h1>
            </MotionItem>

            <MotionItem>
              <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-6 text-muted-foreground sm:mt-5 sm:max-w-2xl sm:text-base lg:text-lg">
                Paste a GitHub pull request link and instantly create summaries,
                feature notes, changelog entries, and social posts.
              </p>
            </MotionItem>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <MotionItem>
                <ScrollToGeneratorButton />
              </MotionItem>
            </div>
          </MotionStagger>
        </div>
      </section>

      <section
        id="generator"
        className="border-y bg-background px-4 pt-16 pb-12 sm:px-6 lg:px-16"
      >
        <MotionViewportStagger className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <MotionViewportStagger className="space-y-3">
            <MotionItem>
              <p className="text-sm font-semibold">Dashboard</p>
            </MotionItem>

            <MotionItem>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Paste a PR or commit and generate content
              </h2>
            </MotionItem>

            <MotionItem>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                This is the same generation workflow from the dashboard. After
                the content is created, GitLoud opens a separate result page
                where you can copy and share each format.
              </p>
            </MotionItem>
          </MotionViewportStagger>

          <MotionItem>
            <GeneratorPreview />

            <MotionSection className="mx-auto flex w-full max-w-6xl justify-center mt-10">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 gap-4 group isolation-auto relative z-10  mt-2 flex items-center justify-center  overflow-hidden border  bg-gray-50 text-md text-gray-900 shadow-xs backdrop-blur-md before:absolute before:-left-full before:-z-10 before:aspect-square before:w-full before:bg-primary before:transition-all before:duration-700 hover:text-gray-900 before:hover:left-0 before:hover:w-full before:hover:scale-150 before:hover:duration-700 dark:border-border dark:bg-card dark:text-white dark:hover:text-white lg:font-semibold"
              >
                <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-gray-900/40 after:transition-all after:duration-300 group-hover:after:w-full dark:after:bg-white/40">
                  GET STARTED
                </span>
                <svg
                  className="rounded-[50%] h-8 w-8 rotate-45 border bg-gray-50 border-gray-200 p-2 text-gray-50 duration-300 ease-linear group-hover:rotate-90 group-hover:border-gray-300 group-hover:bg-gray-50"
                  viewBox="0 0 16 19"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                    className="fill-gray-800"
                  />
                </svg>
              </Link>
            </MotionSection>
          </MotionItem>
        </MotionViewportStagger>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-16">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <MotionViewportStagger className="space-y-3">
            <MotionItem>
              <p className="text-sm font-semibold">What GitLoud does</p>
            </MotionItem>

            <MotionItem>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Turn code changes into clear updates
              </h2>
            </MotionItem>

            <MotionItem>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                GitLoud reads public GitHub pull requests and commits,
                summarizes the technical work, and creates platform-ready
                content for sharing progress.
              </p>
            </MotionItem>
          </MotionViewportStagger>

          <MotionViewportStagger className="grid items-stretch gap-4 md:grid-cols-3">
            <MotionItem>
              <FeatureBlock
                title="Reads GitHub changes"
                description="Fetches PR or commit metadata, changed files, stats, and text diffs from public repositories."
              />
            </MotionItem>
            <MotionItem>
              <FeatureBlock
                title="Generates useful summaries"
                description="Creates short summaries, technical notes, feature lists, tech used, and beginner-friendly explanations."
              />
            </MotionItem>
            <MotionItem>
              <FeatureBlock
                title="Prepares share posts"
                description="Builds copy-ready content for X, LinkedIn, Reddit, portfolio updates, and changelogs."
              />
            </MotionItem>
          </MotionViewportStagger>
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
    <article className="h-full border bg-card p-5 text-card-foreground">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

function GeneratorPreview() {
  return (
    <div className="w-full space-y-6">
      <div className="border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col">
          <div className="space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <div className="flex min-h-10 items-center justify-center border bg-background px-3 py-2 text-sm text-muted-foreground rounded-none">
                <QuestionMarkIcon />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex min-h-36 items-center justify-center border bg-background p-3 text-sm leading-6 text-muted-foreground">
                <QuestionMarkIcon />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end border-t bg-muted/20 px-4 py-3 sm:px-6">
            <Button type="button" disabled className="min-w-32">
              GENERATE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionMarkIcon() {
  return (
    <svg
      className="animate-pulse"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4" />
      <path d="M12 19l0 .01" />
    </svg>
  );
}
