import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GitLoud",
  description:
    "Generate summaries, feature notes, and share-ready posts from GitHub pull requests instantly.",
};

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col overflow-x-hidden">
      <Header />

      <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
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
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard">Get started</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
