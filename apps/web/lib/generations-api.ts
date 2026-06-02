import { serverApiFetch } from "@/lib/server-api-client";

type SourceType = "PULL_REQUEST" | "COMMIT";

export type GenerationHistoryItem = {
  id: string;
  sourceType: SourceType;
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
  mediaAttachmentCount: number;
};

export type GenerationHistoryResponse = {
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  generations: GenerationHistoryItem[];
};

export type GenerationDetailResponse = {
  generation: {
    id: string;
    sourceType: SourceType;
    shortSummary: string;
    technicalSummary: string;
    features: string[];
    techUsed: string[];
    tweet: string;
    linkedInPost: string;
    redditPost: string;
    discordPost: string;
    portfolioBullet: string;
    changelogEntry: string;
    beginnerSummary: string;
    pullRequest: GenerationSource | null;
    commit: GenerationSource | null;
    mediaAttachments: Array<{
      id: string;
      secureUrl: string;
      resourceType: string;
      fileName: string;
      mimeType: string;
      bytes: number;
      width: number | null;
      height: number | null;
      duration: number | null;
    }>;
  };
};

type GenerationSource = {
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

export async function syncProfile() {
  const response = await serverApiFetch("/profile/sync", { method: "POST" });

  if (!response.ok) {
    throw new Error("Could not sync profile");
  }
}

export async function getGenerationHistory(params: {
  date?: string;
  from?: string;
  page?: string;
  to?: string;
}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  const response = await serverApiFetch(
    query ? `/generations?${query}` : "/generations",
  );

  if (!response.ok) {
    throw new Error("Could not load generation history");
  }

  return (await response.json()) as GenerationHistoryResponse;
}

export async function getGenerationDetail(id: string) {
  const response = await serverApiFetch(`/generations/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load generated content");
  }

  return ((await response.json()) as GenerationDetailResponse).generation;
}
