import {
  generateContentFromCommit,
  generateContentFromPullRequest,
} from "@repo/ai/generate-content";
import { db } from "@repo/db/client";
import { fetchCommit } from "@repo/github/fetch-commit";
import { fetchPullRequest } from "@repo/github/fetch-pr";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { Hono } from "hono";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getRequestIp } from "@/lib/ip";
import { logger } from "@/lib/logger";
import { persistentRateLimit } from "@/lib/rate-limit";

class NotFoundError extends Error {}

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

export const generationRoutes = new Hono()
  .delete("/:id", async (context) => {
    const userId = await getAuthenticatedUserId(context.req.raw);

    if (!userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const id = context.req.param("id");

    try {
      await db.$transaction(async (tx) => {
        const generation = await tx.generatedContent.findFirst({
          where: { id, userId },
          select: {
            id: true,
            sourceType: true,
            pullRequestId: true,
            commitId: true,
          },
        });

        if (!generation) {
          throw new NotFoundError("Generated content was not found");
        }

        await tx.generatedContent.delete({
          where: { id: generation.id },
        });

        if (generation.pullRequestId) {
          await tx.$executeRaw`
            DELETE FROM "PullRequest"
            WHERE "id" = ${generation.pullRequestId}
              AND "userId" = ${userId}
              AND NOT EXISTS (
                SELECT 1
                FROM "GeneratedContent"
                WHERE "pullRequestId" = ${generation.pullRequestId}
              )
          `;
        }

        if (generation.commitId) {
          await tx.$executeRaw`
            DELETE FROM "Commit"
            WHERE "id" = ${generation.commitId}
              AND "userId" = ${userId}
              AND NOT EXISTS (
                SELECT 1
                FROM "GeneratedContent"
                WHERE "commitId" = ${generation.commitId}
              )
          `;
        }

        logger.info("Deleted generated content", {
          generationId: id,
          sourceType: generation.sourceType,
          pullRequestId: generation.pullRequestId,
          commitId: generation.commitId,
        });
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete generated content";
      const isNotFound = error instanceof NotFoundError;

      logger.error("Generated content deletion failed", {
        generationId: id,
        error: message,
      });

      return context.json(
        {
          error: isNotFound ? message : "Could not delete generated content",
        },
        isNotFound ? 404 : 500,
      );
    }

    return context.json({ ok: true });
  })
  .post("/:id/regenerate", async (context) => {
    const userId = await getAuthenticatedUserId(context.req.raw);

    if (!userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const ip = getRequestIp(context.req.raw);
    const limit = await persistentRateLimit({
      key: `regenerate:${userId}:${ip}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!limit.success) {
      return context.json(
        { error: "Too many regenerate requests. Please try again later." },
        429,
        {
          "Retry-After": Math.ceil(
            (limit.resetAt.getTime() - Date.now()) / 1000,
          ).toString(),
        },
      );
    }

    const id = context.req.param("id");

    try {
      const generation = await db.generatedContent.findFirst({
        where: { id, userId },
        include: {
          pullRequest: true,
          commit: true,
        },
      });

      if (!generation) {
        return context.json({ error: "Generated content was not found" }, 404);
      }

      const xPostLength = await getStoredXPostLength(generation.id, userId);

      if (generation.sourceType === "PULL_REQUEST") {
        if (!generation.pullRequest) {
          return context.json(
            { error: "Pull request source was not found" },
            400,
          );
        }

        const pullRequest = await fetchPullRequest({
          owner: generation.pullRequest.owner,
          repo: generation.pullRequest.repo,
          number: generation.pullRequest.number,
          githubToken: process.env.GITHUB_TOKEN,
        });

        const generatedContent = await generateContentFromPullRequest(
          pullRequest,
          undefined,
          {
            xPostLength: getGenerationXPostLength(xPostLength),
          },
        );

        const updated = await db.generatedContent.update({
          where: { id: generation.id },
          select: { ...generatedContentSelect, discordPost: true },
          data: {
            ...buildGeneratedContentUpdate(generatedContent),
            discordPost: generatedContent.discordPost,
          },
        });

        logger.info("Regenerated pull request content", {
          generationId: id,
          owner: generation.pullRequest.owner,
          repo: generation.pullRequest.repo,
          number: generation.pullRequest.number,
        });

        return context.json({
          generatedContent: {
            ...updated,
            discordPost: generatedContent.discordPost,
          },
        });
      }

      if (generation.sourceType === "COMMIT") {
        if (!generation.commit) {
          return context.json({ error: "Commit source was not found" }, 400);
        }

        const commit = await fetchCommit({
          owner: generation.commit.owner,
          repo: generation.commit.repo,
          sha: generation.commit.sha,
          githubToken: process.env.GITHUB_TOKEN,
        });

        const generatedContent = await generateContentFromCommit(
          commit,
          undefined,
          {
            xPostLength: getGenerationXPostLength(xPostLength),
          },
        );

        const updated = await db.generatedContent.update({
          where: { id: generation.id },
          select: { ...generatedContentSelect, discordPost: true },
          data: {
            ...buildGeneratedContentUpdate(generatedContent),
            discordPost: generatedContent.discordPost,
          },
        });

        logger.info("Regenerated commit content", {
          generationId: id,
          owner: generation.commit.owner,
          repo: generation.commit.repo,
          sha: generation.commit.sha,
        });

        return context.json({
          generatedContent: {
            ...updated,
            discordPost: generatedContent.discordPost,
          },
        });
      }

      return context.json({ error: "Unsupported generation source" }, 400);
    } catch (error) {
      logger.error("Regeneration failed", {
        generationId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return context.json({ error: "Could not regenerate content" }, 500);
    }
  });

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

function getGenerationXPostLength(value: "STANDARD" | "PREMIUM") {
  return value === "PREMIUM" ? "premium" : "standard";
}

async function getStoredXPostLength(generationId: string, userId: string) {
  const rows = await db.$queryRaw<
    Array<{ xPostLength: "STANDARD" | "PREMIUM" }>
  >`
    SELECT "xPostLength"
    FROM "GeneratedContent"
    WHERE "id" = ${generationId}
      AND "userId" = ${userId}
    LIMIT 1
  `;

  return rows[0]?.xPostLength ?? "STANDARD";
}
