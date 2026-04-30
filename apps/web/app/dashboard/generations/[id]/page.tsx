import { notFound } from "next/navigation";
import { db } from "@repo/db/client";
import { Header } from "@/components/Header";
import { getDiscordPost } from "@/lib/discord-post";
import { GenerationDetailClient } from "./generation-detail-client";

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const generation = await db.generatedContent.findUnique({
    where: { id },
    include: {
      pullRequest: true,
      commit: true,
    },
  });

  if (!generation) {
    notFound();
  }

  const discordPost = await getDiscordPost(id);

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

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{sourceLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="break-all text-sm text-muted-foreground">
            {source.owner}/{source.repo}
          </p>
        </div>

        <GenerationDetailClient
          generationId={generation.id}
          sourceUrl={source.url}
          content={{
            shortSummary: generation.shortSummary,
            technicalSummary: generation.technicalSummary,
            features: generation.features,
            techUsed: generation.techUsed,
            tweet: generation.tweet,
            linkedInPost: generation.linkedInPost,
            redditPost: generation.redditPost,
            discordPost,
            portfolioBullet: generation.portfolioBullet,
            changelogEntry: generation.changelogEntry,
            beginnerSummary: generation.beginnerSummary,
          }}
        />
      </section>
    </main>
  );
}
