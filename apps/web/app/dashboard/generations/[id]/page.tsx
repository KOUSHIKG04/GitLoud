import { notFound } from "next/navigation";
import { db } from "@repo/db/client";
import { Header } from "@/components/Header";
import { getAuthenticatedUserId } from "@/lib/session";
import { GenerationDetailClient } from "./generation-detail-client";
import { AttachedMediaSection } from "./attached-media-section";
import {
  CalendarDays,
  ChevronRight,
  CircleDot,
  FileDiff,
  GitCommit,
  GitPullRequest,
  Minus,
  Plus,
  User,
} from "lucide-react";
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
      mediaAttachments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          secureUrl: true,
          resourceType: true,
          fileName: true,
          mimeType: true,
          bytes: true,
          width: true,
          height: true,
          duration: true,
        },
      },
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
  const sourceReference =
    generation.sourceType === "PULL_REQUEST" && generation.pullRequest
      ? `#${generation.pullRequest.number}`
      : generation.commit?.shortSha;

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
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
                      <GitCommit className="size-4" />
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
              {"state" in source ? (
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

          <AttachedMediaSection mediaAttachments={generation.mediaAttachments} />
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

function formatSourceDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}
