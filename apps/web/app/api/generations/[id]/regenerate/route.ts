import {
  generateContentFromCommit,
  generateContentFromPullRequest,
} from "@repo/ai/generate-content";
import { db } from "@repo/db/client";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { fetchCommit } from "@repo/github/fetch-commit";
import { fetchPullRequest } from "@repo/github/fetch-pr";
import { getRequestIp } from "@/lib/ip";
import { saveDiscordPost } from "@/lib/discord-post";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const generatedContentSelect = {
  shortSummary: true,
  technicalSummary: true,
  features: true,
  techUsed: true,
  tweet: true,
  linkedInPost: true,
  redditPost: true,
  portfolioBullet: true,
  changelogEntry: true,
  beginnerSummary: true,
} as const;

function buildGeneratedContentUpdate(generatedContent: GeneratedContent) {
  return {
    shortSummary: generatedContent.shortSummary,
    technicalSummary: generatedContent.technicalSummary,
    features: generatedContent.features,
    techUsed: generatedContent.techUsed,
    tweet: generatedContent.tweet,
    linkedInPost: generatedContent.linkedInPost,
    redditPost: generatedContent.redditPost,
    portfolioBullet: generatedContent.portfolioBullet,
    changelogEntry: generatedContent.changelogEntry,
    beginnerSummary: generatedContent.beginnerSummary,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const ip = getRequestIp(request);
  const limit = rateLimit({
    key: `regenerate:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many regenerate requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (limit.resetAt.getTime() - Date.now()) / 1000,
          ).toString(),
        },
      },
    );
  }

  const { id } = await params;

  try {
    const generation = await db.generatedContent.findUnique({
      where: { id },
      include: {
        pullRequest: true,
        commit: true,
      },
    });

    if (!generation) {
      return NextResponse.json(
        { error: "Generated content was not found" },
        { status: 404 },
      );
    }

    if (generation.sourceType === "PULL_REQUEST") {
      if (!generation.pullRequest) {
        return NextResponse.json(
          { error: "Pull request source was not found" },
          { status: 400 },
        );
      }

      const pullRequest = await fetchPullRequest({
        owner: generation.pullRequest.owner,
        repo: generation.pullRequest.repo,
        number: generation.pullRequest.number,
        githubToken: process.env.GITHUB_TOKEN,
      });

      const generatedContent =
        await generateContentFromPullRequest(pullRequest);

      const updated = await db.generatedContent.update({
        where: { id },
        select: generatedContentSelect,
        data: buildGeneratedContentUpdate(generatedContent),
      });
      await saveDiscordPost(id, generatedContent.discordPost);

      logger.info("Regenerated pull request content", {
        generationId: id,
        owner: generation.pullRequest.owner,
        repo: generation.pullRequest.repo,
        number: generation.pullRequest.number,
      });

      return NextResponse.json({
        generatedContent: {
          ...updated,
          discordPost: generatedContent.discordPost,
        },
      });
    }

    if (generation.sourceType === "COMMIT") {
      if (!generation.commit) {
        return NextResponse.json(
          { error: "Commit source was not found" },
          { status: 400 },
        );
      }

      const commit = await fetchCommit({
        owner: generation.commit.owner,
        repo: generation.commit.repo,
        sha: generation.commit.sha,
        githubToken: process.env.GITHUB_TOKEN,
      });

      const generatedContent = await generateContentFromCommit(commit);

      const updated = await db.generatedContent.update({
        where: { id },
        select: generatedContentSelect,
        data: buildGeneratedContentUpdate(generatedContent),
      });
      await saveDiscordPost(id, generatedContent.discordPost);

      logger.info("Regenerated commit content", {
        generationId: id,
        owner: generation.commit.owner,
        repo: generation.commit.repo,
        sha: generation.commit.sha,
      });

      return NextResponse.json({
        generatedContent: {
          ...updated,
          discordPost: generatedContent.discordPost,
        },
      });
    }

    return NextResponse.json(
      { error: "Unsupported generation source" },
      { status: 400 },
    );
  } catch (error) {
    logger.error("Regeneration failed", {
      generationId: id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Could not regenerate content" },
      { status: 500 },
    );
  }
}
