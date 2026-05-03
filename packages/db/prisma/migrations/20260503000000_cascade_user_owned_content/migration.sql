-- Allow deleting a user to clean up user-owned PRs, commits, and generated content.
ALTER TABLE "GeneratedContent" DROP CONSTRAINT "GeneratedContent_pullRequestId_userId_fkey";
ALTER TABLE "GeneratedContent" DROP CONSTRAINT "GeneratedContent_commitId_userId_fkey";
ALTER TABLE "GeneratedContent" DROP CONSTRAINT "GeneratedContent_userId_fkey";
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_userId_fkey";
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_userId_fkey";

ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "Commit" ADD CONSTRAINT "Commit_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_pullRequestId_userId_fkey"
FOREIGN KEY ("pullRequestId", "userId")
REFERENCES "PullRequest"("id", "userId")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_commitId_userId_fkey"
FOREIGN KEY ("commitId", "userId")
REFERENCES "Commit"("id", "userId")
ON DELETE CASCADE
ON UPDATE CASCADE;
