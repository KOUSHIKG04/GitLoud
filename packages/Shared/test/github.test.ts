import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getGithubUrlType,
  githubPrOrCommitUrlSchema,
  parseGithubCommitUrl,
  parseGithubPullRequestUrl,
} from "../src/github";

describe("GitHub URL helpers", () => {
  it("parses pull request URLs", () => {
    assert.deepEqual(
      parseGithubPullRequestUrl("https://github.com/openai/openai-node/pull/123"),
      {
        owner: "openai",
        repo: "openai-node",
        number: 123,
      },
    );
  });

  it("parses commit URLs", () => {
    assert.deepEqual(
      parseGithubCommitUrl(
        "https://github.com/openai/openai-node/commit/abcdef1234567",
      ),
      {
        owner: "openai",
        repo: "openai-node",
        sha: "abcdef1234567",
      },
    );
  });

  it("classifies supported URL types", () => {
    assert.equal(
      getGithubUrlType("https://github.com/a/b/pull/1"),
      "pull-request",
    );
    assert.equal(
      getGithubUrlType("https://github.com/a/b/commit/abcdef1"),
      "commit",
    );
    assert.equal(getGithubUrlType("https://github.com/a/b/issues/1"), "unknown");
  });

  it("rejects unsupported URLs", () => {
    assert.equal(
      githubPrOrCommitUrlSchema.safeParse("https://example.com/a/b/pull/1")
        .success,
      false,
    );
    assert.equal(
      githubPrOrCommitUrlSchema.safeParse("https://github.com/a/b/issues/1")
        .success,
      false,
    );
  });
});
