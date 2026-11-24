export type GitHubGenerationErrorCode =
  | "github_app_required"
  | "github_rate_limited";

export type GitHubGenerationError = {
  message: string;
  code?: GitHubGenerationErrorCode;
};

export function getGitHubGenerationError(
  error: unknown,
): GitHubGenerationError | null {
  if (!isGitHubRequestError(error)) {
    return null;
  }

  if (isGitHubRateLimitError(error)) {
    return {
      code: "github_rate_limited",
      message:
        "GitHub's API rate limit was reached. Public repository links work without the GitHub App; please retry in a few minutes.",
    };
  }

  if (error.status === 404) {
    return {
      code: "github_app_required",
      message:
        "GitHub could not access this PR or commit. If the repository is private, connect the GitLoud GitHub App and grant it access. Public repository links work without the App.",
    };
  }

  if (error.status === 401 || error.status === 403) {
    return {
      code: "github_app_required",
      message:
        "GitHub denied access. For a private repository, connect the GitLoud GitHub App and grant it access. Public repository links work without the App.",
    };
  }

  return {
    message: `GitHub API error: ${error.message}`,
  };
}

function isGitHubRequestError(error: unknown): error is {
  message: string;
  status: number;
  response?: { headers?: Record<string, string | undefined> };
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  );
}

function isGitHubRateLimitError(error: {
  message: string;
  status: number;
  response?: { headers?: Record<string, string | undefined> };
}) {
  const remaining = error.response?.headers?.["x-ratelimit-remaining"];
  const message = error.message.toLowerCase();

  return (
    error.status === 429 ||
    remaining === "0" ||
    message.includes("rate limit") ||
    message.includes("secondary rate")
  );
}
