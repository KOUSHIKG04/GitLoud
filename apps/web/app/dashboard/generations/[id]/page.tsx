import { notFound } from "next/navigation";
import { CommitBranchIcon } from "@/assets/CommitBranchIcon";
import { getGenerationDetail } from "@/lib/generations-api";
import { GenerationDetailClient } from "./_components/generation-detail-client";
import { AttachedMediaSection } from "./_components/attached-media-section";
import {
  CalendarDays,
  ChevronRight,
  CircleDot,
  FileDiff,
  GitPullRequest,
  Minus,
  Plus,
  User,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const sourceDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

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
  const sourceReference =
    generation.sourceType === "PULL_REQUEST" && generation.pullRequest
      ? `#${generation.pullRequest.number}`
      : generation.commit?.shortSha;

  return (
    <main className="relative isolate min-h-[calc(100dvh-3.5rem)] mx-auto">
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-6 pt-0">
        <div className="space-y-2">
          <h1 className="px-2 flex items-center gap-2 text-xl font-semibold tracking-tight min-w-0 w-full justify-start">
            <span className="flex items-center mt-0.5 gap-1 text-[13px] text-muted-foreground shrink-0 uppercase">
              {sourceLabel} <ChevronRight size={16} />
            </span>
            <span
              className="truncate text-foreground max-w-4xl font-normal tracking-tighter"
              title={title}
            >
              {title}
            </span>
          </h1>
          <p className="break-all text-sm text-muted-foreground px-2 ">
            {source.owner}/{source.repo}
          </p>
        </div>

        <section className="grid gap-3  bg-card p-3 text-card-foreground shadow-sm lg:grid-cols-[2fr_3fr]">
          <div className="space-y-3">
            <div className="grid grid-cols-3 overflow-hidden border bg-background">
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
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {sourceReference ? (
                <SourceMeta
                  icon={
                    generation.sourceType === "PULL_REQUEST" ? (
                      <GitPullRequest className="size-4" />
                    ) : (
                      <CommitBranchIcon className="size-4" />
                    )
                  }
                  label={
                    generation.sourceType === "PULL_REQUEST"
                      ? "Pull request"
                      : "Commit"
                  }
                  value={sourceReference}
                />
              ) : null}
              {source.author ? (
                <SourceMeta
                  icon={<User className="size-4" />}
                  label="Author"
                  value={source.author}
                />
              ) : null}
              {"state" in source && source.state ? (
                <SourceMeta
                  icon={<CircleDot className="size-4" />}
                  label="State"
                  value={source.state}
                />
              ) : null}
              <SourceMeta
                icon={<CalendarDays className="size-4" />}
                label="Saved"
                value={formatSourceDate(source.createdAt)}
              />
            </div>
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
    <div
      className="flex min-h-16 flex-col items-center justify-center gap-1.5 border-r p-2 text-center last:border-r-0"
      aria-label={`${label}: ${value}`}
      title={label}
    >
      <span className="flex size-7 items-center justify-center bg-muted text-muted-foreground">
        {icon}
      </span>
      <span
        className={["text-base font-semibold", valueClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function SourceMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="flex min-h-14 items-center gap-3 border bg-background px-3 py-2">
      <span className="flex size-8 shrink-0 items-center justify-center bg-muted text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="block break-all font-medium text-foreground">
          {value}
        </span>
      </span>
    </span>
  );
}

function formatSourceDate(value: string) {
  return sourceDateFormatter.format(new Date(value));
}
