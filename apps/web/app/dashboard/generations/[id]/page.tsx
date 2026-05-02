import { notFound } from "next/navigation";
import { db } from "@repo/db/client";
import { Header } from "@/components/Header";
import { getAuthenticatedUserId } from "@/lib/session";
import { GenerationDetailClient } from "./generation-detail-client";
import { ChevronRight, FileDiff, GitCommit, Minus, Plus } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

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
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    notFound();
  }

  const generation = await db.generatedContent.findFirst({
    where: { id, userId },
    include: {
      pullRequest: true,
      commit: true,
    },
  });

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
      : generation.commit?.message.split("\n")[0];

  const sourceLabel =
    generation.sourceType === "PULL_REQUEST" ? "Pull Request" : "Commit";
  const sourceDiffUrl =
    generation.sourceType === "PULL_REQUEST"
      ? `${source.url}/files`
      : source.url;

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <p className="text-md flex gap-2 font-semibold text-muted-foreground">
            {sourceLabel.toUpperCase()}
            <span className="flex items-center">
              <ChevronRight size={16} />
            </span>
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="break-all text-sm text-muted-foreground">
            {source.owner}/{source.repo}
          </p>
        </div>

        <section className="grid gap-3 border bg-card p-4 text-card-foreground shadow-sm sm:grid-cols-3">
          <SourceStat
            label="Files changed"
            value={source.changedFiles.toLocaleString()}
            icon={<FileDiff className="size-4" />}
          />
          <SourceStat
            label="Additions"
            value={`+${source.additions.toLocaleString()}`}
            icon={<Plus className="size-4" />}
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
          <SourceStat
            label="Deletions"
            value={`-${source.deletions.toLocaleString()}`}
            icon={<Minus className="size-4" />}
            valueClassName="text-red-600 dark:text-red-400"
          />

          <div className="border-t pt-3 sm:col-span-3">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <SourceMeta
                label={
                  generation.sourceType === "PULL_REQUEST"
                    ? "Head SHA"
                    : "Commit SHA"
                }
                value={
                  generation.sourceType === "PULL_REQUEST" &&
                  generation.pullRequest
                    ? generation.pullRequest.headSha
                    : generation.commit?.shortSha ?? generation.commit?.sha ?? ""
                }
              />
              {source.author ? (
                <SourceMeta label="Author" value={source.author} />
              ) : null}
              {"state" in source ? (
                <SourceMeta label="State" value={source.state} />
              ) : null}
            </div>
          </div>
        </section>

        <GenerationDetailClient
          generationId={generation.id}
          sourceUrl={source.url}
          sourceDiffUrl={sourceDiffUrl}
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

function SourceStat({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 border bg-background p-3">
      <span className="flex size-8 items-center justify-center bg-muted text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={["text-lg font-semibold", valueClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SourceMeta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 border bg-background px-2.5 py-1">
      <GitCommit className="size-3.5" />
      <span className="font-medium text-foreground">{label}:</span>
      <span className="break-all">{value}</span>
    </span>
  );
}
