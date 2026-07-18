import { notFound } from "next/navigation";
import { getGenerationDetail } from "@/lib/generations-api";
import { GenerationDetailClient } from "./_components/generation-detail-client";
import { AttachedMediaSection } from "./_components/attached-media-section";
import { SourceMetadataPanel } from "./_components/source-metadata-panel";
import { ResponsiveTitle } from "./_components/responsive-title";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

export const metadata: Metadata = {
  title: "Generated Content",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const generation = await getGenerationDetail(id);

  if (!generation) {
    notFound();
  }

  const combinedSource = generation.combinedSources[0];
  const source = generation.pullRequest ?? generation.commit ?? combinedSource;

  if (!source) {
    notFound();
  }

  const title =
    generation.sourceType === "COMBINED"
      ? `Combined ${generation.combinedSources.length} ${combinedSource?.sourceType === "pull-request" ? "pull requests" : "commits"}`
      : generation.sourceType === "PULL_REQUEST" && generation.pullRequest
        ? generation.pullRequest.title
        : (generation.commit?.message ?? "").split("\n")[0];

  const sourceLabel =
    generation.sourceType === "COMBINED"
      ? "Combined"
      : generation.sourceType === "PULL_REQUEST"
        ? "Pull Request"
        : "Commit";
  const sourceDiffUrl =
    generation.sourceType === "PULL_REQUEST"
      ? `${source.url}/files`
      : source.url;
  const metadataSource =
    generation.sourceType === "COMBINED"
      ? {
          ...source,
          author: null,
          additions: generation.combinedSources.reduce(
            (total, item) => total + item.additions,
            0,
          ),
          deletions: generation.combinedSources.reduce(
            (total, item) => total + item.deletions,
            0,
          ),
          changedFiles: generation.combinedSources.reduce(
            (total, item) => total + item.changedFiles,
            0,
          ),
        }
      : source;

  return (
    <main className="relative isolate min-h-[calc(100dvh-3.5rem)] mx-auto w-full max-w-5xl">
      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-6 pt-0">
        {generation.sourceType === "COMBINED" ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="combined-sources" className="border-none">
              <AccordionTrigger className="items-start px-2 py-0 text-left hover:no-underline [&>svg]:mt-1">
                <span className="block min-w-0 flex-1">
                  <h1
                    className="flex min-w-0 w-full items-center gap-2 text-xl font-semibold tracking-tight"
                  >
                    <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[13px] uppercase text-muted-foreground">
                      {sourceLabel} <ChevronRight size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <ResponsiveTitle title={title ?? ""} />
                    </span>
                  </h1>
                  <span className="mt-2 block break-all text-sm font-normal text-muted-foreground">
                    {source.owner}/{source.repo}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 px-2 pb-0 pt-3">
                {generation.combinedSources.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center gap-2 rounded-sm border px-3 py-2 text-muted-foreground hover:bg-muted/30 hover:text-foreground hover:underline"
                  >
                    <span className="shrink-0 font-mono text-xs text-primary">
                      {item.reference}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </a>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="space-y-2 min-w-0 w-full">
            <h1 className="px-2 flex items-center gap-2 text-xl font-semibold tracking-tight min-w-0 w-full justify-start">
              <span className="flex items-center mt-0.5 gap-1 text-[13px] text-muted-foreground shrink-0 uppercase">
                {sourceLabel} <ChevronRight size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <ResponsiveTitle title={title ?? ""} />
              </div>
            </h1>
            <p className="break-all text-sm text-muted-foreground px-2 ">
              {source.owner}/{source.repo}
            </p>
          </div>
        )}

        <section className="grid min-w-0 w-full gap-3 rounded-sm bg-card p-3 text-card-foreground shadow-sm lg:grid-cols-[2fr_3fr]">
          <div className="space-y-3">
            <SourceMetadataPanel
              source={metadataSource}
              sourceType={generation.sourceType}
              sourceCount={generation.combinedSources.length}
            />
          </div>

          <AttachedMediaSection
            mediaAttachments={generation.mediaAttachments}
          />
        </section>

        <GenerationDetailClient
          generationId={generation.id}
          sourceUrl={source.url}
          sourceDiffUrl={sourceDiffUrl}
          mediaAttachments={generation.mediaAttachments}
          content={{
            shortSummary: generation.shortSummary,
            technicalSummary: generation.technicalSummary,
            features: generation.features,
            techUsed: generation.techUsed,
            tweet: generation.tweet,
            linkedInPost: generation.linkedInPost,
            redditPost: generation.redditPost,
            discordPost: generation.discordPost,
            portfolioBullet: generation.portfolioBullet,
            changelogEntry: generation.changelogEntry,
            beginnerSummary: generation.beginnerSummary,
          }}
        />
      </section>
    </main>
  );
}
