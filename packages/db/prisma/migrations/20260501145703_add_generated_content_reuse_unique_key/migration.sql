/*
  Warnings:

  - A unique constraint covering the columns `[userId,sourceType,contextHash,pullRequestId]` on the table `GeneratedContent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,sourceType,contextHash,commitId]` on the table `GeneratedContent` will be added. If there are existing duplicate values, this will fail.

*/
-- Preflight check: Deduplicate existing GeneratedContent rows for pullRequestId to prevent UNIQUE INDEX creation failure
DELETE FROM "GeneratedContent"
WHERE id NOT IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY "userId", "sourceType", "contextHash", "pullRequestId" ORDER BY "createdAt" DESC) as row_num
        FROM "GeneratedContent"
        WHERE "pullRequestId" IS NOT NULL
    ) duplicates
    WHERE row_num = 1
);

-- Preflight check: Deduplicate existing GeneratedContent rows for commitId to prevent UNIQUE INDEX creation failure
DELETE FROM "GeneratedContent"
WHERE id NOT IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY "userId", "sourceType", "contextHash", "commitId" ORDER BY "createdAt" DESC) as row_num
        FROM "GeneratedContent"
        WHERE "commitId" IS NOT NULL
    ) duplicates
    WHERE row_num = 1
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedContent_userId_sourceType_contextHash_pullRequestI_key" ON "GeneratedContent"("userId", "sourceType", "contextHash", "pullRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedContent_userId_sourceType_contextHash_commitId_key" ON "GeneratedContent"("userId", "sourceType", "contextHash", "commitId");
