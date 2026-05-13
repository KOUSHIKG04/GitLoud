CREATE TYPE "XPostLength" AS ENUM ('STANDARD', 'PREMIUM');

ALTER TABLE "GeneratedContent"
ADD COLUMN "xPostLength" "XPostLength" NOT NULL DEFAULT 'STANDARD';

DROP INDEX IF EXISTS "GeneratedContent_userId_sourceType_contextHash_pullRequestI_key";
DROP INDEX IF EXISTS "GeneratedContent_userId_sourceType_contextHash_commitId_key";

CREATE UNIQUE INDEX "GeneratedContent_pr_reuse_key"
ON "GeneratedContent"("userId", "sourceType", "contextHash", "xPostLength", "pullRequestId");

CREATE UNIQUE INDEX "GeneratedContent_commit_reuse_key"
ON "GeneratedContent"("userId", "sourceType", "contextHash", "xPostLength", "commitId");
