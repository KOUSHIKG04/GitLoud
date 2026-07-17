import {
  generateContentFromCommit,
  generateContentFromCommits,
  generateContentFromPullRequest,
  generateContentFromPullRequests,
} from "@repo/ai/generate-content";
import { db } from "@repo/db/client";
import { fetchCommit } from "@repo/github/fetch-commit";
import { fetchPullRequest } from "@repo/github/fetch-pr";
import type { GeneratedContent } from "@repo/shared/generated-content";
import type { CombinedGenerationSource } from "@repo/shared/generations";
import {
  parseGithubCommitUrl,
  parseGithubPullRequestUrl,
} from "@repo/shared/github";
import { Hono } from "hono";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getAiGenerationOptionsForUser } from "@/lib/ai-credentials";
import { getUserFeatures } from "@/lib/features";
import { getGitHubTokenForRepo, getPublicGitHubToken } from "@/lib/github-app";
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

export const generationRoutes: Hono = new Hono()
  .get("/", async (context) => {
    const userId = await getAuthenticatedUserId(context.req.raw);

    if (!userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const page = Math.max(
      Number.parseInt(context.req.query("page") ?? "1", 10) || 1,
      1,
    );
    const pageSize = 7;
    const skip = (page - 1) * pageSize;
    const legacyDate = parseHistoryDate(context.req.query("date"));
    const rangeStart =
      parseHistoryDate(context.req.query("from")) ?? legacyDate;
    const rangeEnd =
      parseHistoryDate(context.req.query("to")) ?? legacyDate ?? rangeStart;
    const exclusiveRangeEnd = rangeEnd ? addDays(rangeEnd, 1) : undefined;
    const createdAtFilter =
      rangeStart && exclusiveRangeEnd
        ? { createdAt: { gte: rangeStart, lt: exclusiveRangeEnd } }
        : undefined;

    const whereFilter = {
      userId,
      AND: [
        {
          OR: [
            { pullRequestId: { not: null } },
            { commitId: { not: null } },
            { sourceType: "COMBINED" as const },
          ],
        },
        ...(createdAtFilter ? [createdAtFilter] : []),
      ],
    };

    const generations = await db.generatedContent.findMany({
      where: whereFilter,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        sourceType: true,
        createdAt: true,
        pullRequest: {
          select: {
            title: true,
            owner: true,
            repo: true,
            url: true,
          },
        },
        commit: {
          select: {
            message: true,
            owner: true,
            repo: true,
            url: true,
          },
        },
        combinedSources: true,
        _count: {
          select: {
            mediaAttachments: true,
          },
        },
      },
      skip,
      take: pageSize,
    });
    const totalCount = await db.generatedContent.count({
      where: whereFilter,
    });
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;

    return context.json({
      page,
      pageSize,
      hasNextPage,
      totalPages,
      totalCount,
      generations: generations.map((generation) => ({
        id: generation.id,
        sourceType: generation.sourceType,
        createdAt: generation.createdAt.toISOString(),
        pullRequest: generation.pullRequest,
        commit: generation.commit,
        combinedSources: parseCombinedSources(generation.combinedSources),
        mediaAttachmentCount: generation._count.mediaAttachments,
      })),
    });
  })
  .get("/:id", async (context) => {
    const userId = await getAuthenticatedUserId(context.req.raw);

    if (!userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const id = context.req.param("id");
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
      return context.json({ error: "Generated content was not found" }, 404);
    }

    return context.json({
      generation: {
        ...generation,
        createdAt: generation.createdAt.toISOString(),
        updatedAt: generation.updatedAt.toISOString(),
        pullRequest: generation.pullRequest
          ? serializeSource(generation.pullRequest)
          : null,
        commit: generation.commit ? serializeSource(generation.commit) : null,
        combinedSources: parseCombinedSources(generation.combinedSources),
      },
    });
  })
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
      const features = await getUserFeatures(userId);
      const aiGenerationOptions = await getAiGenerationOptionsForUser(
        userId,
        features,
      );

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
          githubToken: features.canUsePrivateRepos
            ? ((await getGitHubTokenForRepo({
                userId,
                owner: generation.pullRequest.owner,
                repo: generation.pullRequest.repo,
              })) ?? getPublicGitHubToken())
            : getPublicGitHubToken(),
        });

        const generatedContent = await generateContentFromPullRequest(
          pullRequest,
          undefined,
          {
            xPostLength: getGenerationXPostLength(xPostLength),
            ...aiGenerationOptions,
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
          githubToken: features.canUsePrivateRepos
            ? ((await getGitHubTokenForRepo({
                userId,
                owner: generation.commit.owner,
                repo: generation.commit.repo,
              })) ?? getPublicGitHubToken())
            : getPublicGitHubToken(),
        });

        const generatedContent = await generateContentFromCommit(
          commit,
          undefined,
          {
            xPostLength: getGenerationXPostLength(xPostLength),
            ...aiGenerationOptions,
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

      if (generation.sourceType === "COMBINED") {
        const combinedSources = parseCombinedSources(
          generation.combinedSources,
        );

        if (combinedSources.length < 2) {
          return context.json(
            { error: "Combined generation sources were not found" },
            400,
          );
        }

        const firstSource = combinedSources[0]!;
        const githubToken = features.canUsePrivateRepos
          ? ((await getGitHubTokenForRepo({
              userId,
              owner: firstSource.owner,
              repo: firstSource.repo,
            })) ?? getPublicGitHubToken())
          : getPublicGitHubToken();
        const sourceType = firstSource.sourceType;
        let generatedContent;
        let refreshedCombinedSources: CombinedGenerationSource[] | undefined;

        if (sourceType === "pull-request") {
          const pullRequests = await Promise.all(
            combinedSources.map((source) => {
              const coordinates = parseGithubPullRequestUrl(source.url);

              return fetchPullRequest({
                ...coordinates,
                githubToken,
              });
            }),
          );
          const refreshedAt = new Date().toISOString();
          refreshedCombinedSources = pullRequests.map((pullRequest) => ({
            sourceType: "pull-request",
            owner: pullRequest.owner,
            repo: pullRequest.repo,
            url: pullRequest.url,
            title: pullRequest.title,
            reference: `#${pullRequest.number}`,
            author: pullRequest.author ?? null,
            additions: pullRequest.additions,
            deletions: pullRequest.deletions,
            changedFiles: pullRequest.changedFiles,
            createdAt: refreshedAt,
          }));
          generatedContent = await generateContentFromPullRequests(
            pullRequests,
            undefined,
            {
              xPostLength: getGenerationXPostLength(xPostLength),
              ...aiGenerationOptions,
            },
          );
        } else {
          const commits = await Promise.all(
            combinedSources.map((source) => {
              const coordinates = parseGithubCommitUrl(source.url);

              return fetchCommit({
                ...coordinates,
                githubToken,
              });
            }),
          );
          generatedContent = await generateContentFromCommits(
            commits,
            undefined,
            {
              xPostLength: getGenerationXPostLength(xPostLength),
              ...aiGenerationOptions,
            },
          );
        }

        const updated = await db.generatedContent.update({
          where: { id: generation.id },
          select: { ...generatedContentSelect, discordPost: true },
          data: {
            ...buildGeneratedContentUpdate(generatedContent),
            discordPost: generatedContent.discordPost,
            ...(refreshedCombinedSources
              ? { combinedSources: refreshedCombinedSources }
              : {}),
          },
        });

        logger.info("Regenerated combined GitHub content", {
          generationId: id,
          owner: firstSource.owner,
          repo: firstSource.repo,
          sourceType,
          sourceCount: combinedSources.length,
        });

        return context.json({ generatedContent: updated });
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

function parseHistoryDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function parseCombinedSources(value: unknown): CombinedGenerationSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((source): source is CombinedGenerationSource => {
    if (typeof source !== "object" || source === null) {
      return false;
    }

    const candidate = source as Record<string, unknown>;

    return (
      (candidate.sourceType === "pull-request" ||
        candidate.sourceType === "commit") &&
      ["owner", "repo", "url", "title", "reference", "createdAt"].every(
        (key) => typeof candidate[key] === "string",
      ) &&
      (typeof candidate.author === "string" || candidate.author === null) &&
      ["additions", "deletions", "changedFiles"].every(
        (key) => typeof candidate[key] === "number",
      )
    );
  });
}

function serializeSource<T extends { createdAt: Date; updatedAt: Date }>(
  source: T,
) {
  return {
    ...source,
    createdAt: source.createdAt.toISOString(),
    updatedAt: source.updatedAt.toISOString(),
  };
}
