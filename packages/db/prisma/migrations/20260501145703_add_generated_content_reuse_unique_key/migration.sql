/*
  Warnings:

  - A unique constraint covering the columns `[userId,sourceType,contextHash,pullRequestId]` on the table `GeneratedContent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,sourceType,contextHash,commitId]` on the table `GeneratedContent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GeneratedContent_userId_sourceType_contextHash_pullRequestI_key" ON "GeneratedContent"("userId", "sourceType", "contextHash", "pullRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedContent_userId_sourceType_contextHash_commitId_key" ON "GeneratedContent"("userId", "sourceType", "contextHash", "commitId");
