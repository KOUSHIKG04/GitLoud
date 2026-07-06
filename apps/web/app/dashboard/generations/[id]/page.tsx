import { notFound } from "next/navigation";
import { getGenerationDetail } from "@/lib/generations-api";
import { GenerationDetailClient } from "./_components/generation-detail-client";
import { AttachedMediaSection } from "./_components/attached-media-section";
import { SourceMetadataPanel } from "./_components/source-metadata-panel";
import { ResponsiveTitle } from "./_components/responsive-title";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

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

  const source = generation.pullRequest ?? generation.commit;

  if (!source) {
    notFound();
  }

  const title =
    generation.sourceType === "PULL_REQUEST" && generation.pullRequest
      ? generation.pullRequest.title
      : (generation.commit?.message ?? "").split("\n")[0];

  const sourceLabel =
    generation.sourceType === "PULL_REQUEST" ? "Pull Request" : "Commit";
  const sourceDiffUrl =
    generation.sourceType === "PULL_REQUEST"
      ? `${source.url}/files`
      : source.url;

  return (
    <main className="relative isolate min-h-[calc(100dvh-3.5rem)] mx-auto w-full max-w-5xl">
      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-6 pt-0">
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

        <section className="grid gap-3 bg-card p-3 text-card-foreground shadow-sm lg:grid-cols-[2fr_3fr] min-w-0 w-full">
          <div className="space-y-3">
            <SourceMetadataPanel
              source={source}
              sourceType={generation.sourceType}
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


