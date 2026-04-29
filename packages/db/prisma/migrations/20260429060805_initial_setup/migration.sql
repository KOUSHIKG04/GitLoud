-- CreateEnum
CREATE TYPE "GeneratedSourceType" AS ENUM ('PULL_REQUEST', 'COMMIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "author" TEXT,
    "url" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "headSha" TEXT,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changedFiles" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "shortSha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author" TEXT,
    "url" TEXT NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changedFiles" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sourceType" "GeneratedSourceType" NOT NULL,
    "pullRequestId" TEXT,
    "commitId" TEXT,
    "shortSummary" TEXT NOT NULL,
    "technicalSummary" TEXT NOT NULL,
    "features" TEXT[],
    "techUsed" TEXT[],
    "tweet" TEXT NOT NULL,
    "linkedInPost" TEXT NOT NULL,
    "redditPost" TEXT NOT NULL,
    "portfolioBullet" TEXT NOT NULL,
    "changelogEntry" TEXT NOT NULL,
    "beginnerSummary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "PullRequest_userId_idx" ON "PullRequest"("userId");

-- CreateIndex
CREATE INDEX "PullRequest_owner_repo_number_idx" ON "PullRequest"("owner", "repo", "number");

-- CreateIndex
CREATE INDEX "PullRequest_headSha_idx" ON "PullRequest"("headSha");

-- CreateIndex
CREATE INDEX "PullRequest_createdAt_idx" ON "PullRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Commit_userId_idx" ON "Commit"("userId");

-- CreateIndex
CREATE INDEX "Commit_owner_repo_sha_idx" ON "Commit"("owner", "repo", "sha");

-- CreateIndex
CREATE INDEX "Commit_shortSha_idx" ON "Commit"("shortSha");

-- CreateIndex
CREATE INDEX "Commit_createdAt_idx" ON "Commit"("createdAt");

-- CreateIndex
CREATE INDEX "GeneratedContent_userId_createdAt_idx" ON "GeneratedContent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GeneratedContent_sourceType_idx" ON "GeneratedContent"("sourceType");

-- CreateIndex
CREATE INDEX "GeneratedContent_pullRequestId_idx" ON "GeneratedContent"("pullRequestId");

-- CreateIndex
CREATE INDEX "GeneratedContent_commitId_idx" ON "GeneratedContent"("commitId");

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
