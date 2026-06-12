import { serverApiFetch } from "@/lib/server-api-client";
import type {
  GenerationDetailResponse,
  GenerationHistoryResponse,
} from "@repo/shared/generations";

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
  const response = await serverApiFetch(`/generations/${id}`, {
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load generated content");
  }

  return ((await response.json()) as GenerationDetailResponse).generation;
}
