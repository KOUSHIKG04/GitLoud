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

WITH ranked_pull_requests AS (
    SELECT
        "id",
        FIRST_VALUE("id") OVER (
            PARTITION BY "userId", "owner", "repo", "number", "headSha"
            ORDER BY "createdAt" DESC, "id" ASC
        ) AS "canonicalId"
    FROM "PullRequest"
),
duplicate_pull_requests AS (
    SELECT "id", "canonicalId"
    FROM ranked_pull_requests
    WHERE "id" <> "canonicalId"
)
UPDATE "GeneratedContent"
SET "pullRequestId" = duplicate_pull_requests."canonicalId"
FROM duplicate_pull_requests
WHERE "GeneratedContent"."pullRequestId" = duplicate_pull_requests."id";

WITH ranked_pull_requests AS (
    SELECT
        "id",
        FIRST_VALUE("id") OVER (
            PARTITION BY "userId", "owner", "repo", "number", "headSha"
            ORDER BY "createdAt" DESC, "id" ASC
        ) AS "canonicalId"
    FROM "PullRequest"
),
duplicate_pull_requests AS (
    SELECT "id"
    FROM ranked_pull_requests
    WHERE "id" <> "canonicalId"
)
DELETE FROM "PullRequest"
USING duplicate_pull_requests
WHERE "PullRequest"."id" = duplicate_pull_requests."id";

WITH ranked_commits AS (
    SELECT
        "id",
        FIRST_VALUE("id") OVER (
            PARTITION BY "userId", "owner", "repo", "sha"
            ORDER BY "createdAt" DESC, "id" ASC
        ) AS "canonicalId"
    FROM "Commit"
),
duplicate_commits AS (
    SELECT "id", "canonicalId"
    FROM ranked_commits
    WHERE "id" <> "canonicalId"
)
UPDATE "GeneratedContent"
SET "commitId" = duplicate_commits."canonicalId"
FROM duplicate_commits
WHERE "GeneratedContent"."commitId" = duplicate_commits."id";

WITH ranked_commits AS (
    SELECT
        "id",
        FIRST_VALUE("id") OVER (
            PARTITION BY "userId", "owner", "repo", "sha"
            ORDER BY "createdAt" DESC, "id" ASC
        ) AS "canonicalId"
    FROM "Commit"
),
duplicate_commits AS (
    SELECT "id"
    FROM ranked_commits
    WHERE "id" <> "canonicalId"
)
DELETE FROM "Commit"
USING duplicate_commits
WHERE "Commit"."id" = duplicate_commits."id";

CREATE UNIQUE INDEX "PullRequest_userId_owner_repo_number_headSha_key"
ON "PullRequest"("userId", "owner", "repo", "number", "headSha");

CREATE UNIQUE INDEX "Commit_userId_owner_repo_sha_key"
ON "Commit"("userId", "owner", "repo", "sha");
