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
      description:
        "Feature additions, behavior changes, or notable implementation work.",
    },
    techUsed: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Only concrete tools, libraries, frameworks, services, or packages used, with the purpose for each. Do not include files, generic concepts, or vague patterns.",
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
      description:
        "A short Discord-ready update for a developer community chat.",
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
      description:
        "A beginner-friendly explanation without assuming deep context.",
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

type GenerationOptions = {
  xPostLength?: "standard" | "premium";
  onProgress?: (message: string) => void;
  aiProvider?: "gemini" | "openai" | "anthropic" | "openrouter";
  aiApiKey?: string;
  aiModel?: string;
};

type OpenRouterChatCompletionResponse = {
  error?: {
    message?: string;
    code?: number | string;
  };
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type OpenAiChatCompletionResponse = OpenRouterChatCompletionResponse;

type AnthropicMessagesResponse = {
  error?: {
    message?: string;
    type?: string;
  };
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

const FALLBACK_REDUCED_CONTENT_NOTICE =
  "Reduced due to fallback generation. Try regenerating later for full content.";

const fallbackGeneratedContentSchema = generatedContentSchema.pick({
  shortSummary: true,
  tweet: true,
  beginnerSummary: true,
});

const chatProviderResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    shortSummary: { type: "string" },
    technicalSummary: { type: "string" },
    features: {
      type: "array",
      items: { type: "string" },
    },
    techUsed: {
      type: "array",
      items: { type: "string" },
    },
    tweet: { type: "string" },
    linkedInPost: { type: "string" },
    redditPost: { type: "string" },
    discordPost: { type: "string" },
    portfolioBullet: { type: "string" },
    changelogEntry: { type: "string" },
    beginnerSummary: { type: "string" },
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
} as const;

const SOURCE_FILE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".sql",
  ".prisma",
  ".json",
  ".md",
  ".yml",
  ".yaml",
];

const IMPORTANT_CONFIG_FILES = [
  "package.json",
  "tsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "vite.config.ts",
  "tailwind.config.ts",
  "prisma/schema.prisma",
];

function getFileContextScore(file: ChangedFile) {
  const filename = file.filename.toLowerCase();
  const extensionScore = SOURCE_FILE_EXTENSIONS.some((extension) =>
    filename.endsWith(extension),
  )
    ? 20
    : 0;
  const configScore = IMPORTANT_CONFIG_FILES.some((configFile) =>
    filename.endsWith(configFile),
  )
    ? 25
    : 0;
  const patchScore = file.patch ? Math.min(file.patch.length / 250, 20) : 0;
  const changeScore = Math.min(file.additions + file.deletions, 60) / 6;
  const skippedPenalty = file.skipped ? -100 : 0;
  const testScore =
    filename.includes(".test.") || filename.includes(".spec.") ? 8 : 0;

  return (
    extensionScore +
    configScore +
    patchScore +
    changeScore +
    testScore +
    skippedPenalty
  );
}

function rankFilesForContext(files: ChangedFile[]) {
  return [...files].sort((a, b) => {
    const scoreDelta = getFileContextScore(b) - getFileContextScore(a);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return a.filename.localeCompare(b.filename);
  });
}

function buildFilesContext(files: ChangedFile[], budget: ContextBudget) {
  const rankedFiles = rankFilesForContext(files);
  const trimmedNotice =
    files.length > budget.maxFiles
      ? `\n\nNote: Showing the first ${budget.maxFiles} of ${files.length} changed files.`
      : "";

  return rankedFiles
    .slice(0, budget.maxFiles)
    .map((file) => {
      if (file.skipped) {
        return `File: ${file.filename}\nSkipped: ${file.skipReason}`;
      }

      return [
        `File: ${file.filename}`,
        `Status: ${file.status}`,
        `Changes: +${file.additions} -${file.deletions}`,
        `Patch:\n${
          file.patch ? file.patch.slice(0, budget.maxPatchChars) : "No patch"
        }`,
      ].join("\n");
    })
    .join("\n\n---\n\n")
    .concat(trimmedNotice);
}

const GEMINI_TIMEOUT_MS = 30_000;
const TOTAL_GENERATION_TIMEOUT_MS = 75_000;
const OPENROUTER_TIMEOUT_MS = 90_000;
const MAX_GENERATION_ATTEMPTS = 3;
const FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash"];
const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
  "nvidia/nemotron-nano-9b-v2:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openrouter/free",
];

function getModelFallbacks(options?: GenerationOptions) {
  const preferredModel =
    options?.aiModel ?? process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  return [preferredModel, ...FALLBACK_MODELS].filter(
    (model, index, models) => models.indexOf(model) === index,
  );
}

function getOpenRouterFallbackModels() {
  const configuredModels =
    process.env.OPENROUTER_FALLBACK_MODELS ?? process.env.OPENROUTER_MODEL;
  const models = configuredModels
    ? configuredModels.split(",").map((model) => model.trim())
    : DEFAULT_OPENROUTER_FALLBACK_MODELS;

  return models
    .filter(Boolean)
    .filter((model, index, allModels) => allModels.indexOf(model) === index);
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
  return value
    .replace(EMOJI_PATTERN, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

async function generateWithRetry(
  ai: GoogleGenAI,
  contentVariants: string[],
  options?: GenerationOptions,
) {
  let lastError: unknown;
  let retryCount = 0;
  const deadline = Date.now() + TOTAL_GENERATION_TIMEOUT_MS;

  for (const model of getModelFallbacks(options)) {
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

function buildReducedFallbackContent(
  content: Pick<GeneratedContent, "shortSummary" | "tweet" | "beginnerSummary">,
): GeneratedContent {
  return {
    shortSummary: content.shortSummary,
    technicalSummary: FALLBACK_REDUCED_CONTENT_NOTICE,
    features: [],
    techUsed: [],
    tweet: content.tweet,
    linkedInPost: FALLBACK_REDUCED_CONTENT_NOTICE,
    redditPost: FALLBACK_REDUCED_CONTENT_NOTICE,
    discordPost: FALLBACK_REDUCED_CONTENT_NOTICE,
    portfolioBullet: FALLBACK_REDUCED_CONTENT_NOTICE,
    changelogEntry: FALLBACK_REDUCED_CONTENT_NOTICE,
    beginnerSummary: content.beginnerSummary,
  };
}

async function generateWithOpenRouter(
  contentVariants: string[],
  onProgress?: (message: string) => void,
): Promise<GeneratedContent> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is missing");
  }

  const contents = contentVariants[contentVariants.length - 1];

  if (!contents) {
    throw new Error("No content variants available for OpenRouter generation");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
  let lastError: unknown;

  try {
    for (const [index, model] of getOpenRouterFallbackModels().entries()) {
      try {
        onProgress?.(
          `Fallback ${index + 1} is generating. This can take more than a minute.`,
        );

        let response = await requestOpenRouter(
          model,
          contents,
          openRouterApiKey,
          controller.signal,
        );

        if (response.status === 429) {
          await wait(15_000);
          response = await requestOpenRouter(
            model,
            contents,
            openRouterApiKey,
            controller.signal,
          );
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `OpenRouter failed with ${response.status}: ${errorText}`,
          );
        }

        const data =
          (await response.json()) as OpenRouterChatCompletionResponse;

        if (data.error) {
          throw new Error(
            `OpenRouter provider error ${data.error.code ?? "unknown"}: ${
              data.error.message ?? "Unknown error"
            }`,
          );
        }

        const text = data.choices?.[0]?.message?.content;

        if (!text) {
          throw new Error(
            `OpenRouter returned an empty response: ${JSON.stringify(
              data,
            ).slice(0, 2000)}`,
          );
        }

        let parsed: unknown;

        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error(
            `OpenRouter returned invalid JSON: ${text.slice(0, 2000)}`,
          );
        }

        const result = fallbackGeneratedContentSchema.safeParse(parsed);

        if (!result.success) {
          throw new Error(
            `OpenRouter returned invalid content shape: ${JSON.stringify(
              parsed,
            ).slice(0, 2000)}`,
          );
        }

        return buildReducedFallbackContent(result.data);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("OpenRouter request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function requestOpenRouter(
  model: string,
  contents: string,
  openRouterApiKey: string,
  signal: AbortSignal,
) {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL?.trim() ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME?.trim() ?? "GitLoud",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: `Return only a valid JSON object with exactly these keys:
          shortSummary: string
          tweet: string
          beginnerSummary: string
          
          This is a reduced fallback generation. Do not generate changelog, LinkedIn, Reddit, Discord, portfolio, technical summary, features, or tech used fields.
          Keep every field concise. Each string must be under 500 characters.
          Do not wrap the object in another key.
          Do not include markdown.
          Do not include code fences.
          Do not include explanations.
          Every key is required.`,
        },
        {
          role: "user",
          content: contents,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "fallback_generated_content",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              shortSummary: { type: "string" },
              tweet: { type: "string" },
              beginnerSummary: { type: "string" },
            },
            required: ["shortSummary", "tweet", "beginnerSummary"],
          },
        },
      },
    }),
  });
}

async function generateWithCustomProvider(
  contentVariants: string[],
  options: GenerationOptions,
): Promise<GeneratedContent> {
  if (!options.aiProvider || !options.aiApiKey) {
    throw new Error("Custom AI provider and API key are required");
  }

  const contents = contentVariants[0];

  if (!contents) {
    throw new Error("No content variants available for generation");
  }

  switch (options.aiProvider) {
    case "gemini": {
      const ai = new GoogleGenAI({
        apiKey: options.aiApiKey,
      });
      const response = await generateWithRetry(ai, contentVariants, options);

      if (!response.text) {
        throw new Error("model returned an empty response");
      }

      return sanitizeGeneratedContent(
        generatedContentSchema.parse(JSON.parse(response.text)),
      );
    }
    case "openai":
      return generateWithOpenAi(contents, options);
    case "anthropic":
      return generateWithAnthropic(contents, options);
    case "openrouter":
      return generateFullContentWithOpenRouter(contents, options);
    default:
      throw new Error("Unsupported custom AI provider");
  }
}

async function generateWithOpenAi(
  contents: string,
  options: GenerationOptions,
): Promise<GeneratedContent> {
  const response = await fetchWithProviderTimeout(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.aiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.aiModel ?? "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: getFullJsonSystemPrompt(),
          },
          {
            role: "user",
            content: contents,
          },
        ],
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "generated_content",
            strict: true,
            schema: chatProviderResponseSchema,
          },
        },
      }),
    },
    "OpenAI",
  );

  const data = (await response.json()) as OpenAiChatCompletionResponse;

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message ?? `OpenAI failed with ${response.status}`,
    );
  }

  return parseGeneratedProviderText(data.choices?.[0]?.message?.content);
}

async function generateWithAnthropic(
  contents: string,
  options: GenerationOptions,
): Promise<GeneratedContent> {
  const response = await fetchWithProviderTimeout(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "x-api-key": options.aiApiKey ?? "",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.aiModel ?? "claude-3-5-haiku-latest",
        max_tokens: 4000,
        temperature: 0.1,
        system: getFullJsonSystemPrompt(),
        messages: [
          {
            role: "user",
            content: contents,
          },
        ],
      }),
    },
    "Anthropic",
  );

  const data = (await response.json()) as AnthropicMessagesResponse;

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message ?? `Anthropic failed with ${response.status}`,
    );
  }

  return parseGeneratedProviderText(
    data.content?.find((content) => content.type === "text")?.text,
  );
}

async function generateFullContentWithOpenRouter(
  contents: string,
  options: GenerationOptions,
): Promise<GeneratedContent> {
  const response = await fetchWithProviderTimeout(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.aiApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.OPENROUTER_SITE_URL?.trim() ?? "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME?.trim() ?? "GitLoud",
      },
      body: JSON.stringify({
        model: options.aiModel ?? "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: getFullJsonSystemPrompt(),
          },
          {
            role: "user",
            content: contents,
          },
        ],
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "generated_content",
            strict: true,
            schema: chatProviderResponseSchema,
          },
        },
      }),
    },
    "OpenRouter",
  );

  const data = (await response.json()) as OpenRouterChatCompletionResponse;

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message ?? `OpenRouter failed with ${response.status}`,
    );
  }

  return parseGeneratedProviderText(data.choices?.[0]?.message?.content);
}

async function fetchWithProviderTimeout(
  input: string,
  init: RequestInit,
  provider: string,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`${provider} request timed out`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getFullJsonSystemPrompt() {
  return `Return only a valid JSON object matching the requested schema.
Do not wrap the object in markdown or code fences.
Do not include explanations outside JSON.
All fields are required.`;
}

function parseGeneratedProviderText(text: string | undefined) {
  if (!text) {
    throw new Error("AI provider returned an empty response");
  }

  const cleanedText = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  return sanitizeGeneratedContent(
    generatedContentSchema.parse(JSON.parse(cleanedText)),
  );
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

function getXPostLengthInstruction(options: GenerationOptions | undefined) {
  if (options?.xPostLength === "premium") {
    return "Write tweet as a longer X Premium-style post with 2-4 short paragraphs. It may exceed the standard short-post length, but must stay focused, readable, and grounded in the GitHub change.";
  }

  return "Write tweet as a concise standard X post.";
}

async function generateContent(
  inputs: string[],
  options?: GenerationOptions,
): Promise<GeneratedContent> {
  const contentVariants = inputs.map(buildGenerationPrompt);

  if (options?.aiProvider && options.aiApiKey) {
    return generateWithCustomProvider(contentVariants, options);
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
  });

  try {
    options?.onProgress?.("Trying initial generation...");

    // throw { status: 429 }; -> used for testing falbacks models

    const response = await generateWithRetry(ai, contentVariants, options);

    if (!response.text) {
      throw new Error("model returned an empty response");
    }

    return sanitizeGeneratedContent(
      generatedContentSchema.parse(JSON.parse(response.text)),
    );
  } catch (error) {
    if (!isRetryableGeminiError(error) || !process.env.OPENROUTER_API_KEY) {
      throw error;
    }

    options?.onProgress?.(
      "Gemini is busy. Switching to free fallback model...",
    );

    return sanitizeGeneratedContent(
      await generateWithOpenRouter(contentVariants, options?.onProgress),
    );
  }
}

export async function generateContentFromPullRequest(
  pr: PullRequestResult,
  userContext?: string,
  options?: GenerationOptions,
) {
  return generateContent(
    CONTEXT_BUDGETS.map(
      (budget) => `Generate content for this GitHub pull request.
      Repository: ${pr.owner}/${pr.repo}
      PR number: ${pr.number}
      Title: ${pr.title}
      Description: ${pr.body ?? "No description"}
      Author: ${pr.author ?? "Unknown"}
      Stats: +${pr.additions} -${pr.deletions}, ${pr.changedFiles} changed files
      URL: ${pr.url}
      User extra context requirements: ${userContext ?? "No extra context provided"}
      X post length requirement: ${getXPostLengthInstruction(options)}
      Files:${buildFilesContext(pr.files, budget)}
      `,
    ),
    options,
  );
}

export async function generateContentFromCommit(
  commit: CommitResult,
  userContext?: string,
  options?: GenerationOptions,
) {
  return generateContent(
    CONTEXT_BUDGETS.map(
      (budget) => `
  Generate content for this GitHub commit.
  Repository: ${commit.owner}/${commit.repo}
  Commit: ${commit.sha}
  Message: ${commit.message}
  Author: ${commit.author ?? "Unknown"}
  Stats: +${commit.additions} -${commit.deletions}, ${commit.changedFiles} changed files
  URL: ${commit.url}
  User extra context requirements: ${userContext ?? "No extra context provided"}
  X post length requirement: ${getXPostLengthInstruction(options)}
  Files:${buildFilesContext(commit.files, budget)}
  `,
    ),
    options,
  );
}
