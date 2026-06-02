import type { GeneratedContent } from "@repo/shared/generated-content";
import { apiFetch } from "@/lib/api-client";

type PullRequestGenerateResponse = {
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

type CommitGenerateResponse = {
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

type GenerateResponse = PullRequestGenerateResponse | CommitGenerateResponse;

type UploadedMediaAttachment = {
  id: string;
  secureUrl: string;
  resourceType: string;
  fileName: string;
  mimeType: string;
  bytes: number;
};

type ProgressEvent =
  | { type: "progress"; message: string }
  | {
      type: "done";
      data: Pick<GenerateResponse, "sourceType" | "generatedContentId">;
    }
  | { type: "error"; message: string };

export async function readProgressStream(
  response: Response,
  onProgress: (message: string) => void,
) {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to fetch GitHub item");
  }

  if (!response.body) {
    throw new Error("Response stream is unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  async function readNextChunk(): Promise<
    Pick<GenerateResponse, "sourceType" | "generatedContentId">
  > {
    const { done, value } = await reader.read();

    if (done) {
      throw new Error("Generation finished without a result");
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const event = JSON.parse(line) as ProgressEvent;

      if (event.type === "progress") {
        onProgress(event.message);
      }

      if (event.type === "error") {
        throw new Error(event.message);
      }

      if (event.type === "done") {
        return event.data;
      }
    }

    return readNextChunk();
  }

  return readNextChunk();
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadMedia(
  file: File,
  getToken: () => Promise<string | null>,
) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await apiFetch(
    "/media",
    {
      method: "POST",
      body: formData,
    },
    getToken,
  );

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error ?? "Could not upload media");
  }

  return body.mediaAttachment as UploadedMediaAttachment;
}
