import {
    generateContentFromCommit,
    generateContentFromPullRequest,
} from "@repo/ai/generate-content";
import { db } from "@repo/db/client";
import { fetchCommit } from "@repo/github/fetch-commit";
import { fetchPullRequest } from "@repo/github/fetch-pr";
import {
    getGithubUrlType,
    githubPrOrCommitUrlSchema,
    parseGithubCommitUrl,
    parseGithubPullRequestUrl,
} from "@repo/shared/github";
import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIp } from "@/lib/ip";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { saveDiscordPost } from "@/lib/discord-post";

const requestBodySchema = z.object({
    url: githubPrOrCommitUrlSchema,
    context: z.string().trim().max(1000).optional(),
});

type ProgressEvent =
    | { type: "progress"; message: string }
    | { type: "done"; data: unknown }
    | { type: "error"; message: string };

type SendProgress = (event: ProgressEvent) => void;

async function isRepoPublic(owner: string, repo: string): Promise<boolean> {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });

    try {
        const { data } = await octokit.repos.get({ owner, repo });
        return data.private === false;
    } catch (error) {
        if (isGithubRequestError(error) && error.status === 404) {
            return false;
        }
        throw error;
    }
}

function createProgressStream(
    run: (send: SendProgress) => Promise<void>,
): Response {
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
            headers: { "Cache-Control": "no-cache", "Content-Type": "application/x-ndjson" },
        },
    );
}

export async function POST(request: Request): Promise<Response> {

    const ip = getRequestIp(request);
    const limit = rateLimit({
        key: `generate:${ip}`,
        limit: 5,
        windowMs: 10 * 60 * 1000,
    });

    if (!limit.success) {
        return NextResponse.json(
            { error: "Too many generation requests. Please try again later.", },
            {
                status: 429,
                headers: {
                    "Retry-After": Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000).toString(),
                },
            },
        );
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const parsedBody = requestBodySchema.safeParse(body);

    if (!parsedBody.success) {
        const message =
            parsedBody.error.issues[0]?.message ??
            "Enter a valid GitHub pull request or commit URL";

        return NextResponse.json({ error: message }, { status: 400 });
    }

    const userContext =
        typeof parsedBody.data.context === "string" &&
            parsedBody.data.context.trim().length > 0
            ? parsedBody.data.context.trim()
            : undefined;

    const url = parsedBody.data.url;
    const urlType = getGithubUrlType(url);

    return createProgressStream(async (send) => {
        send({ type: "progress", message: "Validating GitHub URL..." });

        if (urlType === "pull-request") {
            const { owner, repo, number } = parseGithubPullRequestUrl(url);

            if (!Number.isInteger(number) || number <= 0) {
                send({ type: "error", message: "Enter a valid GitHub PR URL" });
                return;
            }

            send({ type: "progress", message: "Checking repository access..." });

            const isPublic = await isRepoPublic(owner, repo);
            if (!isPublic) {
                send({
                    type: "error",
                    message: "Only public repositories are supported",
                });
                return;
            }

            send({
                type: "progress",
                message: "Fetching pull request metadata and diff from GitHub...",
            });

            const pullRequest = await fetchPullRequest({
                owner,
                repo,
                number,
                githubToken: process.env.GITHUB_TOKEN,
            });

            send({
                type: "progress",
                message: "Generating summaries and share-ready content with AI...",
            });

            const generatedContent = await generateContentFromPullRequest(
                pullRequest,
                userContext,
            );

            send({ type: "progress", message: "Saving generated content..." });

            const savedGeneratedContent = await db.generatedContent.create({
                data: {
                    sourceType: "PULL_REQUEST",
                    pullRequest: {
                        create: {
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
                },
                select: { id: true },
            });
            await saveDiscordPost(
                savedGeneratedContent.id,
                generatedContent.discordPost,
            );

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

            send({ type: "progress", message: "Checking repository access..." });

            const isPublic = await isRepoPublic(owner, repo);
            if (!isPublic) {
                send({
                    type: "error",
                    message: "Only public repositories are supported",
                });
                return;
            }

            send({
                type: "progress",
                message: "Fetching commit metadata and diff from GitHub...",
            });

            const commit = await fetchCommit({
                owner,
                repo,
                sha,
                githubToken: process.env.GITHUB_TOKEN,
            });

            send({
                type: "progress",
                message: "Generating summaries and share-ready content with AI...",
            });

            const generatedContent = await generateContentFromCommit(
                commit,
                userContext,
            );

            send({ type: "progress", message: "Saving generated content..." });

            const savedGeneratedContent = await db.generatedContent.create({
                data: {
                    sourceType: "COMMIT",
                    commit: {
                        create: {
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
                },
                select: { id: true },
            });
            await saveDiscordPost(
                savedGeneratedContent.id,
                generatedContent.discordPost,
            );

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
}

function getErrorMessage(error: unknown) {

    if (isAiProviderError(error)) {
        return "The AI provider is temporarily unavailable. Please try again in a minute.";
    }

    if (isGithubRequestError(error)) {
        return `GitHub API error: ${error.message}`;
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
