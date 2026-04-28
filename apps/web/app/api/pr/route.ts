import { generateContentFromPullRequest, generateContentFromCommit, } from "@repo/ai/generate-content";
import { fetchCommit } from "@repo/github/fetch-commit";
import { fetchPullRequest } from "@repo/github/fetch-pr";
import {
    getGithubUrlType,
    parseGithubCommitUrl,
    parseGithubPullRequestUrl,
} from "@repo/shared/github";
import { z } from "zod";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const requestBodySchema = z.object({
    url: z.url().trim(),
    context: z.string().max(1000).optional(),
});

async function isRepoPublic(owner: string, repo: string): Promise<boolean> {
    try {
        const octokit = new Octokit(); // No auth token
        await octokit.repos.get({ owner, repo });
        return true;
    } catch (error: any) {
        // If we get a 404, the repo doesn't exist or is private
        // If we get a 403, it might be private or rate limited
        return false;
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const parsedBody = requestBodySchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json(
                { error: "GitHub URL is required" },
                { status: 400 },
            );
        }

        const userContext =
            typeof parsedBody.data.context === "string" &&
            parsedBody.data.context.trim().length > 0
                ? parsedBody.data.context.trim()
                : undefined;

        const url = parsedBody.data.url;
        const urlType = getGithubUrlType(url);

        if (urlType === "pull-request") {
            const { owner, repo, number } = parseGithubPullRequestUrl(url);
            if (!Number.isInteger(number) || number <= 0) {
                return NextResponse.json(
                    { error: "Enter a valid GitHub PR URL" },
                    { status: 400 },
                );
            }

            const isPublic = await isRepoPublic(owner, repo);
            if (!isPublic) {
                return NextResponse.json(
                    { error: "Only public repositories are supported" },
                    { status: 403 },
                );
            }

            const pullRequest = await fetchPullRequest({
                owner,
                repo,
                number,
                githubToken: process.env.GITHUB_TOKEN,
            });

            const generatedContent = await generateContentFromPullRequest(
                pullRequest,
                userContext,
            );

            return NextResponse.json({
                sourceType: "pull-request",
                generatedContent,
                metadata: {
                    owner: pullRequest.owner,
                    repo: pullRequest.repo,
                    number: pullRequest.number,
                    title: pullRequest.title,
                    author: pullRequest.author,
                    url: pullRequest.url,
                    state: pullRequest.state,
                    additions: pullRequest.additions,
                    deletions: pullRequest.deletions,
                    changedFiles: pullRequest.changedFiles,
                },
            });
        }

        if (urlType === "commit") {
            const { owner, repo, sha } = parseGithubCommitUrl(url);

            // Validate that the repository is public before processing
            const isPublic = await isRepoPublic(owner, repo);
            if (!isPublic) {
                return NextResponse.json(
                    { error: "Only public repositories are supported" },
                    { status: 403 },
                );
            }

            const commit = await fetchCommit({
                owner,
                repo,
                sha,
                githubToken: process.env.GITHUB_TOKEN,
            });

            const generatedContent = await generateContentFromCommit(
                commit,
                userContext,
            );

            return NextResponse.json({
                sourceType: "commit",
                generatedContent,
                metadata: {
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
            });
        }

        return NextResponse.json(
            { error: "Enter a valid GitHub PR or commit URL" },
            { status: 400 },
        );
    } catch (error) {
        console.error("GitHub URL processing failed:", error);

        if (isGithubRequestError(error)) {
            return NextResponse.json(
                { error: `GitHub API error: ${error.message}` },
                { status: error.status || 500 },
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { error: "Failed to process GitHub URL" },
            { status: 500 },
        );
    }
}

function isGithubRequestError(
    error: unknown,
): error is { message: string; status?: number } {
    return (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        "status" in error
    );
}
