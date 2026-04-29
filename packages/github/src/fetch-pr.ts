import { Octokit } from "@octokit/rest";
import { cleanPullRequestFiles } from "@repo/shared/pr-cleanup";
import { pullRequestResultSchema } from "@repo/shared/pull-request";

type FetchPullRequestInput = {
    owner: string;
    repo: string;
    number: number;
    githubToken?: string;
};

export async function fetchPullRequest(input: FetchPullRequestInput) {
    const octokit = new Octokit({
        auth: input.githubToken,
    });

    const prResponse = await octokit.pulls.get({
        owner: input.owner,
        repo: input.repo,
        pull_number: input.number,
    });

    const filesResponse = await octokit.paginate(octokit.rest.pulls.listFiles, {
        owner: input.owner,
        repo: input.repo,
        pull_number: input.number,
        per_page: 100,
    });

    const pr = prResponse.data;

    const cleanedFiles = cleanPullRequestFiles(
        filesResponse.map((file) => ({
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            patch: file.patch ?? null,
        })),
    );

    const result = {
        owner: input.owner,
        repo: input.repo,
        number: input.number,
        title: pr.title,
        body: pr.body,
        author: pr.user?.login,
        url: pr.html_url,
        state: pr.state,
        headSha: pr.head.sha,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        files: cleanedFiles,
    };

    return pullRequestResultSchema.parse(result);
}