import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const { fetchPullRequestMetadata } = await import("@repo/github/fetch-pr");
const { getGitHubGenerationError } =
  await import("../src/lib/github-generation-error");
const { isMissingGitHubInstallationError } =
  await import("../src/lib/github-app");

test("retries a public GitHub request without a rejected token", async () => {
  const originalFetch = globalThis.fetch;
  const authorizationHeaders: Array<string | null> = [];

  globalThis.fetch = async (_input, init) => {
    authorizationHeaders.push(new Headers(init?.headers).get("authorization"));

    if (authorizationHeaders.length === 1) {
      return Response.json(
        { message: "API rate limit exceeded" },
        { status: 403 },
      );
    }

    return Response.json({
      title: "Public pull request",
      body: null,
      user: { login: "octocat" },
      html_url: "https://github.com/octocat/hello-world/pull/1",
      state: "open",
      head: { sha: "abc123" },
      additions: 10,
      deletions: 2,
      changed_files: 1,
    });
  };

  try {
    const result = await fetchPullRequestMetadata({
      owner: "octocat",
      repo: "hello-world",
      number: 1,
      githubToken: "rejected-token",
    });

    assert.equal(result.title, "Public pull request");
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.match(authorizationHeaders[0] ?? "", /^token /i);
  assert.equal(authorizationHeaders[1], null);
});

test("marks inaccessible repositories as requiring the GitHub App", () => {
  const result = getGitHubGenerationError({
    status: 404,
    message: "Not Found",
  });

  assert.equal(result?.code, "github_app_required");
  assert.match(result?.message ?? "", /public repository links work without/i);
});

test("distinguishes GitHub rate limiting from App permissions", () => {
  const result = getGitHubGenerationError({
    status: 403,
    message: "API rate limit exceeded",
  });

  assert.equal(result?.code, "github_rate_limited");
  assert.match(result?.message ?? "", /retry in a few minutes/i);
});

test("recognizes a deleted GitHub App installation", () => {
  assert.equal(isMissingGitHubInstallationError({ status: 404 }), true);
  assert.equal(isMissingGitHubInstallationError({ status: 403 }), false);
});
