import { Octokit } from "@octokit/rest";

type GitHubRequest<T> = (octokit: Octokit) => Promise<T>;

export async function requestWithPublicFallback<T>(
  githubToken: string | undefined,
  request: GitHubRequest<T>,
) {
  try {
    return await request(new Octokit({ auth: githubToken }));
  } catch (error) {
    if (!githubToken || !isRejectedGitHubCredential(error)) {
      throw error;
    }

    return request(new Octokit());
  }
}

function isRejectedGitHubCredential(error: unknown) {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return false;
  }

  const status = (error as { status?: unknown }).status;
  return status === 401 || status === 403;
}
