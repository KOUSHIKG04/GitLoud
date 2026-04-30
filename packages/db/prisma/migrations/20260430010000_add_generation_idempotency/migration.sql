DELETE FROM "GeneratedContent"
WHERE "userId" IS NULL;

DELETE FROM "PullRequest"
WHERE "userId" IS NULL;

DELETE FROM "Commit"
WHERE "userId" IS NULL;

ALTER TABLE "PullRequest"
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "headSha" SET NOT NULL;

ALTER TABLE "Commit"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "GeneratedContent"
ALTER COLUMN "userId" SET NOT NULL;

CREATE UNIQUE INDEX "PullRequest_userId_owner_repo_number_headSha_key"
ON "PullRequest"("userId", "owner", "repo", "number", "headSha");

CREATE UNIQUE INDEX "Commit_userId_owner_repo_sha_key"
ON "Commit"("userId", "owner", "repo", "sha");
