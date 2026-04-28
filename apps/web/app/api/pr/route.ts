import { generateContentFromPullRequest, generateContentFromCommit, } from "@repo/ai/generate-content";
import { fetchCommit } from "@repo/github/fetch-commit";
import { fetchPullRequest } from "@repo/github/fetch-pr";
import {
    getGithubUrlType,
    parseGithubCommitUrl,
    parseGithubPullRequestUrl,
} from "@repo/shared/github";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.url || typeof body.url !== "string") {
            return NextResponse.json(
                { error: "GitHub URL is required" },
                { status: 400 },
            );
        }

        const urlType = getGithubUrlType(body.url);

        if (urlType === "pull-request") {
            const { owner, repo, number } = parseGithubPullRequestUrl(body.url);

            const pullRequest = await fetchPullRequest({
                owner,
                repo,
                number,
                githubToken: process.env.GITHUB_TOKEN,
            });

            const generatedContent = await generateContentFromPullRequest(
                pullRequest,
            );

            return NextResponse.json({
                sourceType: "pull-request",
                pullRequest,
                generatedContent,
            });
        }

        if (urlType === "commit") {
            const { owner, repo, sha } = parseGithubCommitUrl(body.url);

            const commit = await fetchCommit({
                owner,
                repo,
                sha,
                githubToken: process.env.GITHUB_TOKEN,
            });

            const generatedContent = await generateContentFromCommit(commit);

            return NextResponse.json({
                sourceType: "commit",
                commit,
                generatedContent,
            });
        }

        return NextResponse.json(
            { error: "Enter a valid GitHub PR or commit URL" },
            { status: 400 },
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to process GitHub URL" },
            { status: 500 },
        );
    }
}