import { GoogleGenAI, Type } from "@google/genai";
import {
    generatedContentSchema,
    type GeneratedContent,
} from "@repo/shared/generated-content";
import type { PullRequestResult } from "@repo/shared/pull-request";
import type { CommitResult } from "@repo/shared/commit";

const generatedContentResponseSchema = {
    type: Type.OBJECT,
    properties: {
        shortSummary: {
            type: Type.STRING,
            description: "A concise 1-2 sentence summary of the change.",
        },
        technicalSummary: {
            type: Type.STRING,
            description: "A developer-focused technical summary of the change.",
        },
        features: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Feature additions, behavior changes, or notable implementation work.",
        },
        techUsed: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Technologies, libraries, files, patterns, or concepts involved.",
        },
        tweet: {
            type: Type.STRING,
            description: "A concise X/Twitter-ready post.",
        },
        linkedInPost: {
            type: Type.STRING,
            description: "A professional LinkedIn-ready post.",
        },
        redditPost: {
            type: Type.STRING,
            description: "A conversational Reddit-ready post.",
        },
        portfolioBullet: {
            type: Type.STRING,
            description: "A portfolio resume-style bullet.",
        },
        changelogEntry: {
            type: Type.STRING,
            description: "A changelog-style entry.",
        },
        beginnerSummary: {
            type: Type.STRING,
            description: "A beginner-friendly explanation without assuming deep context.",
        },
    },
    required: [
        "shortSummary",
        "technicalSummary",
        "features",
        "techUsed",
        "tweet",
        "linkedInPost",
        "redditPost",
        "portfolioBullet",
        "changelogEntry",
        "beginnerSummary",
    ],
    propertyOrdering: [
        "shortSummary",
        "technicalSummary",
        "features",
        "techUsed",
        "tweet",
        "linkedInPost",
        "redditPost",
        "portfolioBullet",
        "changelogEntry",
        "beginnerSummary",
    ],
} as const;

function buildFilesContext(
    files: {
        filename: string; status: string; additions: number; deletions: number;
        patch: string | null; skipped: boolean; skipReason: string | null
    }[],
) {
    return files
        .slice(0, 20)
        .map((file) => {
            if (file.skipped) {
                return `File: ${file.filename}\nSkipped: ${file.skipReason}`;
            }

            return [
                `File: ${file.filename}`,
                `Status: ${file.status}`,
                `Changes: +${file.additions} -${file.deletions}`,
                `Patch:\n${file.patch ?? "No patch"}`,
            ].join("\n");
        })
        .join("\n\n---\n\n");
}

async function generateContent(input: string): Promise<GeneratedContent> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            "You create clear developer summaries and share-ready posts from GitHub code changes.",
            "Return concise, accurate content only. Do not invent details that are not supported by the supplied PR or commit context.",
            "Use the user's extra context when provided. If they mention learning, write the content as a learning or progress update.",
            input,
        ].join("\n\n"),
        config: {
            responseMimeType: "application/json",
            responseSchema: generatedContentResponseSchema,
        },
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response");
    }

    return generatedContentSchema.parse(JSON.parse(response.text));
}

export async function generateContentFromPullRequest(
    pr: PullRequestResult,
    userContext?: string,
) {
    return generateContent(`Generate content for this GitHub pull request.
  Repository: ${pr.owner}/${pr.repo}
  PR number: ${pr.number}
  Title: ${pr.title}
  Description: ${pr.body ?? "No description"}
  Author: ${pr.author ?? "Unknown"}
  Stats: +${pr.additions} -${pr.deletions}, ${pr.changedFiles} changed files
  URL: ${pr.url}
  User extra context: ${userContext ?? "No extra context provided"}
  Files:${buildFilesContext(pr.files)}
  `);
}

export async function generateContentFromCommit(
    commit: CommitResult,
    userContext?: string,
) {
    return generateContent(`
  Generate content for this GitHub commit.
  Repository: ${commit.owner}/${commit.repo}
  Commit: ${commit.sha}
  Message: ${commit.message}
  Author: ${commit.author ?? "Unknown"}
  Stats: +${commit.additions} -${commit.deletions}, ${commit.changedFiles} changed files
  URL: ${commit.url}
  User extra context: ${userContext ?? "No extra context provided"}
  Files:${buildFilesContext(commit.files)}
  `);
}
