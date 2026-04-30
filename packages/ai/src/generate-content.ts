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
            description: "Only concrete tools, libraries, frameworks, services, or packages used, with the purpose for each. Do not include files, generic concepts, or vague patterns.",
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
        discordPost: {
            type: Type.STRING,
            description: "A short Discord-ready update for a developer community chat.",
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
        "discordPost",
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
        "discordPost",
        "portfolioBullet",
        "changelogEntry",
        "beginnerSummary",
    ],
} as const;

const EMOJI_PATTERN =
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu;
const CONTEXT_BUDGETS = [
    { maxFiles: 16, maxPatchChars: 3000 },
    { maxFiles: 10, maxPatchChars: 1800 },
    { maxFiles: 6, maxPatchChars: 900 },
] as const;

type ChangedFile = {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch: string | null;
    skipped: boolean;
    skipReason: string | null;
};

type ContextBudget = (typeof CONTEXT_BUDGETS)[number];

function buildFilesContext(
    files: ChangedFile[],
    budget: ContextBudget,
) {
    const trimmedNotice =
        files.length > budget.maxFiles
            ? `\n\nNote: Showing the first ${budget.maxFiles} of ${files.length} changed files.`
            : "";

    return files
        .slice(0, budget.maxFiles)
        .map((file) => {
            if (file.skipped) {
                return `File: ${file.filename}\nSkipped: ${file.skipReason}`;
            }

            return [
                `File: ${file.filename}`,
                `Status: ${file.status}`,
                `Changes: +${file.additions} -${file.deletions}`,
                `Patch:\n${file.patch
                    ? file.patch.slice(0, budget.maxPatchChars)
                    : "No patch"
                }`,
            ].join("\n");
        })
        .join("\n\n---\n\n")
        .concat(trimmedNotice);
}

const GEMINI_TIMEOUT_MS = 30_000;
const TOTAL_GENERATION_TIMEOUT_MS = 75_000;
const MAX_GENERATION_ATTEMPTS = 3;
const FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash"];

function getModelFallbacks() {
    const preferredModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

    return [preferredModel, ...FALLBACK_MODELS].filter(
        (model, index, models) => models.indexOf(model) === index,
    );
}

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatuses(error: unknown) {
    if (typeof error !== "object" || error === null) {
        return [];
    }

    const apiError = error as {
        message?: unknown;
        status?: unknown;
        code?: unknown;
        error?: { status?: unknown; code?: unknown };
    };

    return [
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
    ].filter(Boolean);
}

function isRetryableGeminiError(error: unknown) {
    const statuses = getErrorStatuses(error);

    return statuses.some(
        (status) =>
            status === 429 ||
            status === 500 ||
            status === 503 ||
            status === 504 ||
            status === "UNAVAILABLE" ||
            status === "DEADLINE_EXCEEDED" ||
            status === "RESOURCE_EXHAUSTED",
    );
}

function stripEmojis(value: string) {
    return value.replace(EMOJI_PATTERN, "")
        .split("\n")
        .map((line) => line.replace(/[ \t]{2,}/g, " ").trimEnd())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}

function sanitizeGeneratedContent(content: GeneratedContent): GeneratedContent {
    return {
        shortSummary: stripEmojis(content.shortSummary),
        technicalSummary: stripEmojis(content.technicalSummary),
        features: content.features.map(stripEmojis),
        techUsed: content.techUsed.map(stripEmojis),
        tweet: stripEmojis(content.tweet),
        linkedInPost: stripEmojis(content.linkedInPost),
        redditPost: stripEmojis(content.redditPost),
        discordPost: stripEmojis(content.discordPost),
        portfolioBullet: stripEmojis(content.portfolioBullet),
        changelogEntry: stripEmojis(content.changelogEntry),
        beginnerSummary: stripEmojis(content.beginnerSummary),
    };
}

async function generateWithRetry(ai: GoogleGenAI, contentVariants: string[]) {
    let lastError: unknown;
    let retryCount = 0;
    const deadline = Date.now() + TOTAL_GENERATION_TIMEOUT_MS;

    for (const model of getModelFallbacks()) {
        for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
            if (Date.now() > deadline) {
                throw new Error("Global generation timeout exceeded");
            }

            const contents =
                contentVariants[Math.min(retryCount, contentVariants.length - 1)];

            if (!contents) {
                throw new Error("No content variants available for generation");
            }

            try {
                return await ai.models.generateContent({
                    model,
                    contents,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: generatedContentResponseSchema,
                        httpOptions: {
                            timeout: GEMINI_TIMEOUT_MS,
                        },
                    },
                });
            } catch (error) {
                lastError = error;

                if (!isRetryableGeminiError(error)) {
                    throw error;
                }

                retryCount += 1;

                if (attempt < MAX_GENERATION_ATTEMPTS) {
                    await wait(750 * attempt);
                }
            }
        }
    }

    throw lastError;
}

function buildGenerationPrompt(input: string) {
    return [
        "You create clear developer summaries and share-ready posts from GitHub code changes.",
        "Return concise, accurate content only. Do not invent details that are not supported by the supplied PR or commit context.",
        "Do not use emojis or decorative symbols in any output field.",
        "The user's extra context is a requirement, not a suggestion. Reflect it in every relevant output field, especially tone, audience, learning angle, and what the user wants emphasized.",
        "If the user's extra context conflicts with the GitHub data, prioritize factual GitHub data and use only the compatible parts of the user's context.",
        "For techUsed, include only actual tools, libraries, frameworks, services, packages, or APIs. Format each item as '<tool> - <what it was used for>'. Do not list changed files, generic programming concepts, or inferred technologies.",
        input,
    ].join("\n\n");
}

async function generateContent(inputs: string[]): Promise<GeneratedContent> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await generateWithRetry(
        ai,
        inputs.map(buildGenerationPrompt),
    );

    if (!response.text) {
        throw new Error("Gemini returned an empty response");
    }

    return sanitizeGeneratedContent(
        generatedContentSchema.parse(JSON.parse(response.text)),
    );
}

export async function generateContentFromPullRequest(
    pr: PullRequestResult,
    userContext?: string,
) {
    return generateContent(CONTEXT_BUDGETS.map((budget) => `Generate content for this GitHub pull request.
  Repository: ${pr.owner}/${pr.repo}
  PR number: ${pr.number}
  Title: ${pr.title}
  Description: ${pr.body ?? "No description"}
  Author: ${pr.author ?? "Unknown"}
  Stats: +${pr.additions} -${pr.deletions}, ${pr.changedFiles} changed files
  URL: ${pr.url}
  User extra context requirements: ${userContext ?? "No extra context provided"}
  Files:${buildFilesContext(pr.files, budget)}
  `));
}

export async function generateContentFromCommit(
    commit: CommitResult,
    userContext?: string,
) {
    return generateContent(CONTEXT_BUDGETS.map((budget) => `
  Generate content for this GitHub commit.
  Repository: ${commit.owner}/${commit.repo}
  Commit: ${commit.sha}
  Message: ${commit.message}
  Author: ${commit.author ?? "Unknown"}
  Stats: +${commit.additions} -${commit.deletions}, ${commit.changedFiles} changed files
  URL: ${commit.url}
  User extra context requirements: ${userContext ?? "No extra context provided"}
  Files:${buildFilesContext(commit.files, budget)}
  `));
}
