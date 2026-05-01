DELETE FROM "GeneratedContent"
USING "PullRequest"
WHERE "GeneratedContent"."pullRequestId" = "PullRequest"."id"
  AND "GeneratedContent"."userId" <> "PullRequest"."userId";

DELETE FROM "GeneratedContent"
USING "Commit"
WHERE "GeneratedContent"."commitId" = "Commit"."id"
  AND "GeneratedContent"."userId" <> "Commit"."userId";

ALTER TABLE "GeneratedContent"
DROP CONSTRAINT "GeneratedContent_pullRequestId_fkey";

ALTER TABLE "GeneratedContent"
DROP CONSTRAINT "GeneratedContent_commitId_fkey";

CREATE UNIQUE INDEX "PullRequest_id_userId_key"
ON "PullRequest"("id", "userId");

CREATE UNIQUE INDEX "Commit_id_userId_key"
ON "Commit"("id", "userId");

CREATE INDEX "GeneratedContent_pullRequestId_userId_idx"
ON "GeneratedContent"("pullRequestId", "userId");

CREATE INDEX "GeneratedContent_commitId_userId_idx"
ON "GeneratedContent"("commitId", "userId");

ALTER TABLE "GeneratedContent"
ADD CONSTRAINT "GeneratedContent_pullRequestId_userId_fkey"
FOREIGN KEY ("pullRequestId", "userId")
REFERENCES "PullRequest"("id", "userId")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "GeneratedContent"
ADD CONSTRAINT "GeneratedContent_commitId_userId_fkey"
FOREIGN KEY ("commitId", "userId")
REFERENCES "Commit"("id", "userId")
ON DELETE RESTRICT
ON UPDATE CASCADE;
