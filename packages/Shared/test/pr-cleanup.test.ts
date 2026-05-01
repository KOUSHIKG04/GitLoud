import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cleanPullRequestFiles } from "../src/pr-cleanup";

describe("cleanPullRequestFiles", () => {
  it("skips generated and lock files", () => {
    const [file] = cleanPullRequestFiles([
      {
        filename: "package-lock.json",
        status: "modified",
        additions: 10,
        deletions: 5,
        patch: "diff",
      },
    ]);

    assert.equal(file?.skipped, true);
    assert.equal(file?.skipReason, "Generated or lock file");
    assert.equal(file?.patch, null);
  });

  it("skips binary and asset files", () => {
    const [file] = cleanPullRequestFiles([
      {
        filename: "public/logo.png",
        status: "added",
        additions: 0,
        deletions: 0,
        patch: null,
      },
    ]);

    assert.equal(file?.skipped, true);
    assert.equal(file?.skipReason, "Binary or asset file");
  });

  it("trims large patches", () => {
    const [file] = cleanPullRequestFiles([
      {
        filename: "src/app.ts",
        status: "modified",
        additions: 500,
        deletions: 100,
        patch: "a".repeat(5000),
      },
    ]);

    assert.equal(file?.skipped, false);
    assert.ok(file?.patch?.endsWith("[Patch trimmed]"));
    assert.ok((file?.patch.length ?? 0) <= 4000);
  });
});
