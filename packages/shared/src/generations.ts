import { z } from "zod";
import type { GeneratedContent } from "./generated-content";
import type { AiProvider } from "./ai-credentials";

export const xPostLengthSchema = z.enum(["standard", "premium"]);

export type XPostLength = z.infer<typeof xPostLengthSchema>;

export type GenerationOptions = {
  xPostLength?: XPostLength;
  onProgress?: (message: string) => void;
  aiProvider?: AiProvider;
  aiApiKey?: string;
  aiModel?: string;
};

export type GenerationMediaAttachment = {
  id: string;
  secureUrl: string;
  resourceType: string;
  fileName: string;
  mimeType: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
};
export type StoredXPostLength = "STANDARD" | "PREMIUM";
export type GeneratedSourceType = "PULL_REQUEST" | "COMMIT" | "COMBINED";

export type CombinedGenerationSource = {
  sourceType: "pull-request" | "commit";
  owner: string;
  repo: string;
  url: string;
  title: string;
  reference: string;
  author: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
};

export type PullRequestGenerateResponse = {
  sourceType: "pull-request";
  generatedContentId: string;
  generatedContent: GeneratedContent;
  metadata: {
    owner: string;
    repo: string;
    number: number;
    title: string;
    author?: string;
    url: string;
    state: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  };
};

export type CommitGenerateResponse = {
  sourceType: "commit";
  generatedContentId: string;
  generatedContent: GeneratedContent;
  metadata: {
    owner: string;
    repo: string;
    sha: string;
    shortSha: string;
    message: string;
    author: string | null;
    url: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  };
};

export type GenerateResponse =
  | PullRequestGenerateResponse
  | CommitGenerateResponse;

export type GenerateDoneResponse = {
  sourceType: "pull-request" | "commit" | "combined";
  generatedContentId: string;
  reused?: boolean;
};

export type GenerationProgressEvent =
  | { type: "progress"; message: string }
  | { type: "done"; data: GenerateDoneResponse }
  | {
      type: "error";
      message: string;
      code?: "github_app_required" | "github_rate_limited";
    };

export type UploadedMediaAttachment = {
  id: string;
  secureUrl: string;
  resourceType: string;
  fileName: string;
  mimeType: string;
  bytes: number;
};

export type GenerationHistoryItem = {
  id: string;
  sourceType: GeneratedSourceType;
  createdAt: string;
  pullRequest: {
    title: string;
    owner: string;
    repo: string;
    url: string;
  } | null;
  commit: {
    message: string;
    owner: string;
    repo: string;
    url: string;
  } | null;
  combinedSources: CombinedGenerationSource[];
  mediaAttachmentCount: number;
};

export type GenerationHistoryResponse = {
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  totalPages: number;
  totalCount: number;
  generations: GenerationHistoryItem[];
};

export type GenerationSource = {
  owner: string;
  repo: string;
  url: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
  author: string | null;
  title?: string;
  number?: number;
  state?: string;
  message?: string;
  shortSha?: string;
};

export type GenerationDetail = GeneratedContent & {
  id: string;
  sourceType: GeneratedSourceType;
  pullRequest: GenerationSource | null;
  commit: GenerationSource | null;
  combinedSources: CombinedGenerationSource[];
  mediaAttachments: GenerationMediaAttachment[];
};

export type GenerationDetailResponse = {
  generation: GenerationDetail;
};
