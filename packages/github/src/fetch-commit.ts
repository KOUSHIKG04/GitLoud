import { Octokit } from "@octokit/rest";
import { cleanPullRequestFiles } from "@repo/shared/pr-cleanup";
import { commitResultSchema } from "@repo/shared/commit";

type FetchCommitInput = {
    owner: string;
    repo: string;
    sha: string;
    githubToken?: string;
};

export async function fetchCommit(input: FetchCommitInput) {
    const octokit = new Octokit({
        auth: input.githubToken,
    });

    const commitResponse = await octokit.repos.getCommit({
        owner: input.owner,
        repo: input.repo,
        ref: input.sha,
    });

    const commit = commitResponse.data;

    const cleanedFiles = cleanPullRequestFiles(
        (commit.files ?? []).map((file) => ({
            filename: file.filename,
            status: file.status ?? "modified",
            additions: file.additions ?? 0,
            deletions: file.deletions ?? 0,
            patch: file.patch ?? null,
        })),
    );

    const result = {
        owner: input.owner,
        repo: input.repo,
        sha: commit.sha,
        shortSha: commit.sha.slice(0, 7),
        message: commit.commit.message,
        author: commit.commit.author?.name ?? commit.author?.login ?? null,
        url: commit.html_url,
        additions: commit.stats?.additions ?? 0,
        deletions: commit.stats?.deletions ?? 0,
        changedFiles: commit.files?.length ?? 0,
        files: cleanedFiles,
    };

    return commitResultSchema.parse(result);
}