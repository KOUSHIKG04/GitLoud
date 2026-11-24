import type { GitHubInstallationsResponse } from "@repo/shared/github-app";
import { apiFetch } from "@/lib/api/client";
import { getApiError } from "@/lib/api/response";

/** Cache key shared by Settings and the repo picker: one fetch serves both. */
export const GITHUB_INSTALLATIONS_RESOURCE = "github-installations";

export async function fetchGitHubInstallations(
  getToken: () => Promise<string | null>,
) {
  const response = await apiFetch("/github/installations", {}, getToken);
  const value = (await response.json()) as
    | GitHubInstallationsResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error(getApiError(value, "Could not load GitHub settings"));
  }

  return value as GitHubInstallationsResponse;
}
