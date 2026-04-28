import { generatedContentSchema } from "@repo/shared/generated-content";
import type { PullRequestResult } from "@repo/shared/pull-request";
import type { CommitResult } from "@repo/shared/commit";

export async function generateContentFromPullRequest(pr: PullRequestResult) {
    const changedFileNames = pr.files
        .filter((file) => !file.skipped)
        .slice(0, 5)
        .map((file) => file.filename);

    const result = {
        shortSummary: `${pr.title} updates ${pr.repo} with ${pr.changedFiles} changed files.`,
        technicalSummary: `This pull request changes ${pr.changedFiles} files with ${pr.additions}
  additions and ${pr.deletions} deletions. Key touched files include ${changedFileNames.join(",") || "no readable text files"}.`,
        features: [
            `Updated ${pr.repo} through PR #${pr.number}`,
            `Changed ${pr.changedFiles} files`,
            `Prepared implementation details for review`,
        ],
        techUsed: changedFileNames.length > 0 ? changedFileNames : ["GitHub pull request metadata"],
        tweet: `Shipped: ${pr.title}\n\n${pr.url}`,
        linkedInPost: `I worked on ${pr.title} in ${pr.owner}/${pr.repo}.\n\nThis PR updates
  ${pr.changedFiles} files with ${pr.additions} additions and ${pr.deletions} deletions.`,
        redditPost: `I opened a PR for ${pr.title}. It touches ${pr.changedFiles} files and
  includes ${pr.additions} additions / ${pr.deletions} deletions.\n\n${pr.url}`,
        portfolioBullet: `Implemented ${pr.title} in ${pr.owner}/${pr.repo}.`,
        changelogEntry: `- ${pr.title}`,
        beginnerSummary: `This pull request is a set of code changes named "${pr.title}". It
  changes files in the ${pr.repo} project and is ready to be reviewed.`,
    };

    return generatedContentSchema.parse(result);
}

export async function generateContentFromCommit(commit: CommitResult) {
    const changedFileNames = commit.files
        .filter((file) => !file.skipped)
        .slice(0, 5)
        .map((file) => file.filename);

    const firstLine = commit.message.split("\n")[0] ?? commit.message;

    const result = {
        shortSummary: `${firstLine} updates ${commit.repo} in commit ${commit.shortSha}.`,
        technicalSummary: `This commit changes ${commit.changedFiles} files with
  ${commit.additions} additions and ${commit.deletions} deletions. Key touched files include
  ${changedFileNames.join(", ") || "no readable text files"}.`,
        features: [
            `Committed ${firstLine}`,
            `Changed ${commit.changedFiles} files`,
            `Prepared focused code changes in ${commit.repo}`,
        ],
        techUsed:
            changedFileNames.length > 0
                ? changedFileNames
                : ["GitHub commit metadata"],
        tweet: `Committed: ${firstLine}\n\n${commit.url}`,
        linkedInPost: `I worked on a focused commit in ${commit.owner}/${commit.repo}:
  ${firstLine}.\n\nIt changes ${commit.changedFiles} files with ${commit.additions} additions
  and ${commit.deletions} deletions.`,
        redditPost: `I made a commit for ${firstLine}. It touches ${commit.changedFiles} files and
  includes ${commit.additions} additions / ${commit.deletions} deletions.\n\n${commit.url}`,
        portfolioBullet: `Implemented ${firstLine} in ${commit.owner}/${commit.repo}.`,
        changelogEntry: `- ${firstLine}`,
        beginnerSummary: `This commit is a focused code change named "${firstLine}". It updates
  files in the ${commit.repo} project.`,
    };

    return generatedContentSchema.parse(result);
}