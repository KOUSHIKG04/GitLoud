import {
  generateContentFromCommit,
  generateContentFromCommits,
  generateContentFromPullRequest,
  generateContentFromPullRequests,
} from "@repo/ai/generate-content";
import { db } from "@repo/db/client";
import { fetchCommit } from "@repo/github/fetch-commit";
import {
  fetchPullRequestHydrated,
  fetchPullRequestMetadata,
} from "@repo/github/fetch-pr";
import type { CommitResult } from "@repo/shared/commit";
import type {
  CombinedGenerationSource,
  GenerationProgressEvent,
  StoredXPostLength,
} from "@repo/shared/generations";
import {
  getGithubUrlType,
  githubPrOrCommitUrlSchema,
  parseGithubCommitUrl,
  parseGithubPullRequestUrl,
} from "@repo/shared/github";
import type { PullRequestResult } from "@repo/shared/pull-request";
import { createHash } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { getRequestIp } from "@/lib/ip";
import { logger } from "@/lib/logger";
import { persistentRateLimit } from "@/lib/rate-limit";
import { getGitHubTokenForRepo, getPublicGitHubToken } from "@/lib/github-app";
import { getUserFeatures } from "@/lib/features";
import { getAiGenerationOptionsForUser } from "@/lib/ai-credentials";

const requestBodySchema = z.object({
  url: githubPrOrCommitUrlSchema,
  context: z.string().trim().max(1000).optional(),
  mediaAttachmentId: z.string().trim().min(1).max(128).optional(),
  xPostLength: z.enum(["standard", "premium"]).default("standard"),
});

const combinedRequestBodySchema = z.object({
  urls: z.array(githubPrOrCommitUrlSchema).min(2).max(5),
  context: z.string().trim().max(1000).optional(),
  mediaAttachmentId: z.string().trim().min(1).max(128).optional(),
  xPostLength: z.enum(["standard", "premium"]).default("standard"),
});

type SendProgress = (event: GenerationProgressEvent) => void;

export const prRoutes = new Hono();

prRoutes.post("/", async (context) => {
  const appUserId = await getCurrentUserId(context.req.raw);

  if (!appUserId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const ip = getRequestIp(context.req.raw);
  const limit = await persistentRateLimit({
    key: `generate:${appUserId}:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.success) {
    return context.json(
      { error: "Too many generation requests. Please try again later." },
      429,
      {
        "Retry-After": Math.ceil(
          (limit.resetAt.getTime() - Date.now()) / 1000,
        ).toString(),
      },
    );
  }

  let body: unknown;

  try {
    body = await context.req.json();
  } catch {
    return context.json({ error: "Invalid JSON body" }, 400);
  }

  const parsedBody = requestBodySchema.safeParse(body);

  if (!parsedBody.success) {
    const message =
      parsedBody.error.issues[0]?.message ??
      "Enter a valid GitHub pull request or commit URL";

    return context.json({ error: message }, 400);
  }

  const userContext =
    typeof parsedBody.data.context === "string" &&
    parsedBody.data.context.trim().length > 0
      ? parsedBody.data.context.trim()
      : undefined;

  const url = parsedBody.data.url;
  const urlType = getGithubUrlType(url);
  const contextHash = getContextHash(userContext);
  const mediaAttachmentId = parsedBody.data.mediaAttachmentId;
  const xPostLength = parsedBody.data.xPostLength;
  const storedXPostLength: StoredXPostLength =
    xPostLength === "premium" ? "PREMIUM" : "STANDARD";

  return createProgressStream(async (send) => {
    send({ type: "progress", message: "Validating GitHub URL..." });

    if (urlType === "pull-request") {
      const { owner, repo, number } = parseGithubPullRequestUrl(url);

      const features = await getUserFeatures(appUserId);

      const githubToken = features.canUsePrivateRepos
        ? ((await getGitHubTokenForRepo({ userId: appUserId, owner, repo })) ??
          getPublicGitHubToken())
        : getPublicGitHubToken();

      if (!Number.isInteger(number) || number <= 0) {
        send({ type: "error", message: "Enter a valid GitHub PR URL" });
        return;
      }

      send({
        type: "progress",
        message: "Fetching pull request metadata from GitHub...",
      });

      const pullRequestMetadata = await fetchPullRequestMetadata({
        owner,
        repo,
        number,
        githubToken,
      });

      const existingGenerations = await db.$queryRaw<Array<{ id: string }>>`
        SELECT gc."id"
        FROM "GeneratedContent" gc
        INNER JOIN "PullRequest" pr ON pr."id" = gc."pullRequestId"
        WHERE gc."userId" = ${appUserId}
          AND gc."sourceType" = 'PULL_REQUEST'::"GeneratedSourceType"
          AND gc."contextHash" IS NOT DISTINCT FROM ${contextHash}
          AND gc."xPostLength" = ${storedXPostLength}::"XPostLength"
          AND pr."owner" = ${pullRequestMetadata.owner}
          AND pr."repo" = ${pullRequestMetadata.repo}
          AND pr."number" = ${pullRequestMetadata.number}
          AND pr."headSha" = ${pullRequestMetadata.headSha}
        ORDER BY gc."createdAt" DESC
        LIMIT 1
      `;
      const existingGeneration = existingGenerations[0];

      if (existingGeneration) {
        await attachMediaToGeneration({
          mediaAttachmentId,
          generatedContentId: existingGeneration.id,
          userId: appUserId,
        });

        logger.info("Reused existing pull request generation", {
          owner,
          repo,
          number,
          generatedContentId: existingGeneration.id,
        });

        send({
          type: "done",
          data: {
            sourceType: "pull-request",
            generatedContentId: existingGeneration.id,
            reused: true,
          },
        });

        return;
      }

      send({
        type: "progress",
        message: "Fetching changed files from GitHub...",
      });

      const pullRequest = await fetchPullRequestHydrated(pullRequestMetadata, {
        owner,
        repo,
        number,
        githubToken,
      });

      send({
        type: "progress",
        message: "Generating summaries and share-ready content with AI...",
      });

      const aiGenerationOptions = await getAiGenerationOptionsForUser(
        appUserId,
        features,
      );

      const generatedContent = await generateContentFromPullRequest(
        pullRequest,
        userContext,
        {
          xPostLength,
          ...aiGenerationOptions,
          onProgress: (message) => send({ type: "progress", message }),
        },
      );

      send({ type: "progress", message: "Saving generated content..." });

      let savedGeneratedContent;
      try {
        savedGeneratedContent = await db.generatedContent.create({
          data: {
            user: { connect: { id: appUserId } },
            sourceType: "PULL_REQUEST",
            contextHash,
            ...getStoredXPostLengthData(storedXPostLength),
            pullRequest: {
              connectOrCreate: {
                where: {
                  userId_owner_repo_number_headSha: {
                    userId: appUserId,
                    owner: pullRequest.owner,
                    repo: pullRequest.repo,
                    number: pullRequest.number,
                    headSha: pullRequest.headSha,
                  },
                },
                create: {
                  userId: appUserId,
                  owner: pullRequest.owner,
                  repo: pullRequest.repo,
                  number: pullRequest.number,
                  title: pullRequest.title,
                  body: pullRequest.body,
                  author: pullRequest.author,
                  url: pullRequest.url,
                  state: pullRequest.state,
                  headSha: pullRequest.headSha,
                  additions: pullRequest.additions,
                  deletions: pullRequest.deletions,
                  changedFiles: pullRequest.changedFiles,
                },
              },
            },
            shortSummary: generatedContent.shortSummary,
            technicalSummary: generatedContent.technicalSummary,
            features: generatedContent.features,
            techUsed: generatedContent.techUsed,
            tweet: generatedContent.tweet,
            linkedInPost: generatedContent.linkedInPost,
            redditPost: generatedContent.redditPost,
            discordPost: generatedContent.discordPost,
            portfolioBullet: generatedContent.portfolioBullet,
            changelogEntry: generatedContent.changelogEntry,
            beginnerSummary: generatedContent.beginnerSummary,
          },
          select: { id: true },
        });
      } catch (error: unknown) {
        if (isPrismaUniqueConstraintError(error)) {
          const existing = await findExistingPrGeneration(
            appUserId,
            pullRequest,
            contextHash,
            storedXPostLength,
          );
          if (existing) {
            savedGeneratedContent = existing;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      await attachMediaToGeneration({
        mediaAttachmentId,
        generatedContentId: savedGeneratedContent.id,
        userId: appUserId,
      });

      logger.info("Generated pull request content", {
        owner,
        repo,
        number,
        generatedContentId: savedGeneratedContent.id,
      });

      send({
        type: "done",
        data: {
          sourceType: "pull-request",
          generatedContentId: savedGeneratedContent.id,
        },
      });

      return;
    }

    if (urlType === "commit") {
      const { owner, repo, sha } = parseGithubCommitUrl(url);
      const features = await getUserFeatures(appUserId);

      const githubToken = features.canUsePrivateRepos
        ? ((await getGitHubTokenForRepo({ userId: appUserId, owner, repo })) ??
          getPublicGitHubToken())
        : getPublicGitHubToken();

      send({
        type: "progress",
        message: "Fetching commit metadata and diff from GitHub...",
      });

      const commit = await fetchCommit({
        owner,
        repo,
        sha,
        githubToken,
      });

      const existingGenerations = await db.$queryRaw<Array<{ id: string }>>`
        SELECT gc."id"
        FROM "GeneratedContent" gc
        INNER JOIN "Commit" c ON c."id" = gc."commitId"
        WHERE gc."userId" = ${appUserId}
          AND gc."sourceType" = 'COMMIT'::"GeneratedSourceType"
          AND gc."contextHash" IS NOT DISTINCT FROM ${contextHash}
          AND gc."xPostLength" = ${storedXPostLength}::"XPostLength"
          AND c."owner" = ${commit.owner}
          AND c."repo" = ${commit.repo}
          AND c."sha" = ${commit.sha}
        ORDER BY gc."createdAt" DESC
        LIMIT 1
      `;
      const existingGeneration = existingGenerations[0];

      if (existingGeneration) {
        await attachMediaToGeneration({
          mediaAttachmentId,
          generatedContentId: existingGeneration.id,
          userId: appUserId,
        });

        logger.info("Reused existing commit generation", {
          owner,
          repo,
          sha,
          generatedContentId: existingGeneration.id,
        });

        send({
          type: "done",
          data: {
            sourceType: "commit",
            generatedContentId: existingGeneration.id,
            reused: true,
          },
        });

        return;
      }

      send({
        type: "progress",
        message: "Generating summaries and share-ready content with AI...",
      });

      const aiGenerationOptions = await getAiGenerationOptionsForUser(
        appUserId,
        features,
      );

      const generatedContent = await generateContentFromCommit(
        commit,
        userContext,
        {
          xPostLength,
          ...aiGenerationOptions,
          onProgress: (message) => send({ type: "progress", message }),
        },
      );

      send({ type: "progress", message: "Saving generated content..." });

      let savedGeneratedContent;
      try {
        savedGeneratedContent = await db.generatedContent.create({
          data: {
            user: { connect: { id: appUserId } },
            sourceType: "COMMIT",
            contextHash,
            ...getStoredXPostLengthData(storedXPostLength),
            commit: {
              connectOrCreate: {
                where: {
                  userId_owner_repo_sha: {
                    userId: appUserId,
                    owner: commit.owner,
                    repo: commit.repo,
                    sha: commit.sha,
                  },
                },
                create: {
                  userId: appUserId,
                  owner: commit.owner,
                  repo: commit.repo,
                  sha: commit.sha,
                  shortSha: commit.shortSha,
                  message: commit.message,
                  author: commit.author,
                  url: commit.url,
                  additions: commit.additions,
                  deletions: commit.deletions,
                  changedFiles: commit.changedFiles,
                },
              },
            },
            shortSummary: generatedContent.shortSummary,
            technicalSummary: generatedContent.technicalSummary,
            features: generatedContent.features,
            techUsed: generatedContent.techUsed,
            tweet: generatedContent.tweet,
            linkedInPost: generatedContent.linkedInPost,
            redditPost: generatedContent.redditPost,
            discordPost: generatedContent.discordPost,
            portfolioBullet: generatedContent.portfolioBullet,
            changelogEntry: generatedContent.changelogEntry,
            beginnerSummary: generatedContent.beginnerSummary,
          },
          select: { id: true },
        });
      } catch (error: unknown) {
        if (isPrismaUniqueConstraintError(error)) {
          const existing = await findExistingCommitGeneration(
            appUserId,
            commit,
            contextHash,
            storedXPostLength,
          );
          if (existing) {
            savedGeneratedContent = existing;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      await attachMediaToGeneration({
        mediaAttachmentId,
        generatedContentId: savedGeneratedContent.id,
        userId: appUserId,
      });

      logger.info("Generated commit content", {
        owner,
        repo,
        sha,
        generatedContentId: savedGeneratedContent.id,
      });

      send({
        type: "done",
        data: {
          sourceType: "commit",
          generatedContentId: savedGeneratedContent.id,
        },
      });

      return;
    }

    send({
      type: "error",
      message: "Enter a valid GitHub PR or commit URL",
    });
  });
});

prRoutes.post("/combined", async (context) => {
  const appUserId = await getCurrentUserId(context.req.raw);

  if (!appUserId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const ip = getRequestIp(context.req.raw);
  const limit = await persistentRateLimit({
    key: `generate:${appUserId}:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.success) {
    return context.json(
      { error: "Too many generation requests. Please try again later." },
      429,
      {
        "Retry-After": Math.ceil(
          (limit.resetAt.getTime() - Date.now()) / 1000,
        ).toString(),
      },
    );
  }

  let body: unknown;

  try {
    body = await context.req.json();
  } catch {
    return context.json({ error: "Invalid JSON body" }, 400);
  }

  const parsedBody = combinedRequestBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return context.json(
      {
        error:
          parsedBody.error.issues[0]?.message ??
          "Select between 2 and 5 GitHub items",
      },
      400,
    );
  }

  const urls = parsedBody.data.urls;
  const urlTypes = urls.map(getGithubUrlType);
  const firstType = urlTypes[0];

  if (
    !firstType ||
    urlTypes.some((urlType) => urlType !== firstType) ||
    (firstType !== "pull-request" && firstType !== "commit")
  ) {
    return context.json(
      { error: "Combine pull requests or commits, not a mixture of both" },
      400,
    );
  }

  const parsedCoordinates = urls.map((url) =>
    firstType === "pull-request"
      ? parseGithubPullRequestUrl(url)
      : parseGithubCommitUrl(url),
  );
  const coordinatesByIdentity = new Map(
    parsedCoordinates.map((coordinate) => {
      const repositoryKey =
        `${coordinate.owner}/${coordinate.repo}`.toLowerCase();
      const sourceKey =
        "number" in coordinate
          ? `${repositoryKey}#${coordinate.number}`
          : `${repositoryKey}@${coordinate.sha.toLowerCase()}`;

      return [sourceKey, coordinate] as const;
    }),
  );

  if (coordinatesByIdentity.size < 2) {
    return context.json({ error: "Select at least 2 different items" }, 400);
  }

  const coordinates = [...coordinatesByIdentity.values()];
  const { owner, repo } = coordinates[0]!;

  if (
    coordinates.some(
      (coordinate) =>
        coordinate.owner.toLowerCase() !== owner.toLowerCase() ||
        coordinate.repo.toLowerCase() !== repo.toLowerCase(),
    )
  ) {
    return context.json(
      { error: "Combined items must come from the same repository" },
      400,
    );
  }

  const features = await getUserFeatures(appUserId);

  if (!features.canUsePrivateRepos) {
    return context.json(
      { error: "GitHub activity browser is unavailable for this account." },
      402,
    );
  }

  const githubToken = await getGitHubTokenForRepo({
    userId: appUserId,
    owner,
    repo,
  });

  if (!githubToken) {
    return context.json(
      {
        error:
          "Connect and sync the GitLoud GitHub App for this repository before combining items",
      },
      403,
    );
  }

  const userContext = parsedBody.data.context?.trim() || undefined;
  const xPostLength = parsedBody.data.xPostLength;
  const storedXPostLength: StoredXPostLength =
    xPostLength === "premium" ? "PREMIUM" : "STANDARD";

  return createProgressStream(async (send) => {
    send({
      type: "progress",
      message: `Fetching ${urls.length} GitHub ${firstType === "pull-request" ? "pull requests" : "commits"}...`,
    });

    const aiGenerationOptions = await getAiGenerationOptionsForUser(
      appUserId,
      features,
    );
    let generatedContent;
    let combinedSources: CombinedGenerationSource[];

    if (firstType === "pull-request") {
      const pullRequests = await Promise.all(
        coordinates.map(async (coordinate) => {
          if (!("number" in coordinate)) {
            throw new Error("Invalid pull request selection");
          }

          const metadata = await fetchPullRequestMetadata({
            owner: coordinate.owner,
            repo: coordinate.repo,
            number: coordinate.number,
            githubToken,
          });

          return fetchPullRequestHydrated(metadata, {
            owner: coordinate.owner,
            repo: coordinate.repo,
            number: coordinate.number,
            githubToken,
          });
        }),
      );

      send({
        type: "progress",
        message: "Generating one combined update with AI...",
      });
      generatedContent = await generateContentFromPullRequests(
        pullRequests,
        userContext,
        {
          xPostLength,
          ...aiGenerationOptions,
          onProgress: (message) => send({ type: "progress", message }),
        },
      );
      combinedSources = pullRequests.map((pullRequest) => ({
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
        createdAt: new Date().toISOString(),
      }));
    } else {
      const commits = await Promise.all(
        coordinates.map(async (coordinate) => {
          if (!("sha" in coordinate)) {
            throw new Error("Invalid commit selection");
          }

          return fetchCommit({
            owner: coordinate.owner,
            repo: coordinate.repo,
            sha: coordinate.sha,
            githubToken,
          });
        }),
      );

      send({
        type: "progress",
        message: "Generating one combined update with AI...",
      });
      generatedContent = await generateContentFromCommits(
        commits,
        userContext,
        {
          xPostLength,
          ...aiGenerationOptions,
          onProgress: (message) => send({ type: "progress", message }),
        },
      );
      combinedSources = commits.map((commit) => ({
        sourceType: "commit",
        owner: commit.owner,
        repo: commit.repo,
        url: commit.url,
        title: commit.message.split("\n")[0] || commit.shortSha,
        reference: commit.shortSha,
        author: commit.author,
        additions: commit.additions,
        deletions: commit.deletions,
        changedFiles: commit.changedFiles,
        createdAt: new Date().toISOString(),
      }));
    }

    send({ type: "progress", message: "Saving combined content..." });

    const savedGeneratedContent = await db.generatedContent.create({
      data: {
        user: { connect: { id: appUserId } },
        sourceType: "COMBINED",
        combinedSources,
        contextHash: getContextHash(userContext),
        ...getStoredXPostLengthData(storedXPostLength),
        shortSummary: generatedContent.shortSummary,
        technicalSummary: generatedContent.technicalSummary,
        features: generatedContent.features,
        techUsed: generatedContent.techUsed,
        tweet: generatedContent.tweet,
        linkedInPost: generatedContent.linkedInPost,
        redditPost: generatedContent.redditPost,
        discordPost: generatedContent.discordPost,
        portfolioBullet: generatedContent.portfolioBullet,
        changelogEntry: generatedContent.changelogEntry,
        beginnerSummary: generatedContent.beginnerSummary,
      },
      select: { id: true },
    });

    await attachMediaToGeneration({
      mediaAttachmentId: parsedBody.data.mediaAttachmentId,
      generatedContentId: savedGeneratedContent.id,
      userId: appUserId,
    });

    logger.info("Generated combined GitHub content", {
      owner,
      repo,
      sourceType: firstType,
      sourceCount: combinedSources.length,
      generatedContentId: savedGeneratedContent.id,
    });

    send({
      type: "done",
      data: {
        sourceType: "combined",
        generatedContentId: savedGeneratedContent.id,
      },
    });
  });
});

function getStoredXPostLengthData(xPostLength: StoredXPostLength) {
  return { xPostLength };
}

function getContextHash(userContext: string | undefined) {
  if (!userContext) {
    return null;
  }

  const normalizedContext = userContext.replace(/\r\n?/g, "\n").trim();

  return createHash("sha256").update(normalizedContext).digest("hex");
}

function createProgressStream(run: (send: SendProgress) => Promise<void>) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const send: SendProgress = (event) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };

        try {
          await run(send);
        } catch (error) {
          logger.error("GitHub URL processing failed", {
            error: getErrorMessage(error),
          });
          send({ type: "error", message: getErrorMessage(error) });
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-ndjson",
      },
    },
  );
}

function getErrorMessage(error: unknown) {
  if (isGithubRequestError(error)) {
    if (error.status === 404) {
      return "GitHub could not access that PR or commit. If it is private, install or sync the GitLoud GitHub App for that repository.";
    }

    if (error.status === 403) {
      return "GitHub access was denied. Check that the GitLoud GitHub App is installed with read access for that repository.";
    }

    return `GitHub API error: ${error.message}`;
  }

  if (isAiProviderError(error)) {
    return error instanceof Error
      ? error.message
      : "The AI provider is temporarily unavailable. Please try again in a minute.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to process GitHub URL";
}

function isGithubRequestError(
  error: unknown,
): error is { message: string; status: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  );
}

function isAiProviderError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const apiError = error as {
    message?: unknown;
    status?: unknown;
    code?: unknown;
    error?: { status?: unknown; code?: unknown };
  };

  const statuses = [
    apiError.status,
    apiError.code,
    apiError.error?.status,
    apiError.error?.code,
    typeof apiError.message === "string" &&
    apiError.message.includes("DEADLINE_EXCEEDED")
      ? "DEADLINE_EXCEEDED"
      : undefined,
    typeof apiError.message === "string" && apiError.message.includes("504")
      ? 504
      : undefined,
  ];

  return statuses.some(
    (status) =>
      status === "UNAVAILABLE" ||
      status === "DEADLINE_EXCEEDED" ||
      status === "RESOURCE_EXHAUSTED" ||
      status === 429 ||
      status === 500 ||
      status === 503 ||
      status === 504,
  );
}

function isPrismaUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

async function findExistingPrGeneration(
  appUserId: string,
  pullRequest: PullRequestResult,
  contextHash: string | null,
  storedXPostLength: StoredXPostLength,
) {
  const rows = await db.$queryRaw<Array<{ id: string }>>`
    SELECT gc."id"
    FROM "GeneratedContent" gc
    INNER JOIN "PullRequest" pr ON pr."id" = gc."pullRequestId"
    WHERE gc."userId" = ${appUserId}
      AND gc."sourceType" = 'PULL_REQUEST'::"GeneratedSourceType"
      AND gc."contextHash" IS NOT DISTINCT FROM ${contextHash}
      AND gc."xPostLength" = ${storedXPostLength}::"XPostLength"
      AND pr."owner" = ${pullRequest.owner}
      AND pr."repo" = ${pullRequest.repo}
      AND pr."number" = ${pullRequest.number}
      AND pr."headSha" = ${pullRequest.headSha}
    ORDER BY gc."createdAt" DESC
    LIMIT 1
  `;

  return rows[0] ?? null;
}

async function findExistingCommitGeneration(
  appUserId: string,
  commit: CommitResult,
  contextHash: string | null,
  storedXPostLength: StoredXPostLength,
) {
  const rows = await db.$queryRaw<Array<{ id: string }>>`
    SELECT gc."id"
    FROM "GeneratedContent" gc
    INNER JOIN "Commit" c ON c."id" = gc."commitId"
    WHERE gc."userId" = ${appUserId}
      AND gc."sourceType" = 'COMMIT'::"GeneratedSourceType"
      AND gc."contextHash" IS NOT DISTINCT FROM ${contextHash}
      AND gc."xPostLength" = ${storedXPostLength}::"XPostLength"
      AND c."owner" = ${commit.owner}
      AND c."repo" = ${commit.repo}
      AND c."sha" = ${commit.sha}
    ORDER BY gc."createdAt" DESC
    LIMIT 1
  `;

  return rows[0] ?? null;
}

async function attachMediaToGeneration({
  generatedContentId,
  mediaAttachmentId,
  userId,
}: {
  generatedContentId: string;
  mediaAttachmentId: string | undefined;
  userId: string;
}) {
  if (!mediaAttachmentId) {
    return;
  }

  await db.mediaAttachment.updateMany({
    where: {
      id: mediaAttachmentId,
      userId,
      generatedContentId: null,
    },
    data: {
      generatedContentId,
      generatedContentUserId: userId,
    },
  });
}
