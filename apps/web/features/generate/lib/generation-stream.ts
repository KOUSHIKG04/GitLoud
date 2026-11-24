import type {
  GenerateDoneResponse,
  GenerationProgressEvent,
} from "@repo/shared/generations";

export class GenerationRequestError extends Error {
  constructor(
    message: string,
    readonly code?: "github_app_required" | "github_rate_limited",
  ) {
    super(message);
    this.name = "GenerationRequestError";
  }
}

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

  async function readNextChunk(): Promise<GenerateDoneResponse> {
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

      const event = JSON.parse(line) as GenerationProgressEvent;

      if (event.type === "progress") {
        onProgress(event.message);
      }

      if (event.type === "error") {
        throw new GenerationRequestError(event.message, event.code);
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
