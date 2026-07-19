import { cleanPullRequestFiles } from "@repo/shared/pr-cleanup";
import {
  pullRequestResultSchema,
  type PullRequestResult,
} from "@repo/shared/pull-request";
import { requestWithPublicFallback } from "./client.js";

type FetchPullRequestInput = {
  owner: string;
  repo: string;
  number: number;
  githubToken?: string;
};

export type PullRequestMetadata = Omit<PullRequestResult, "files">;

export async function fetchPullRequestMetadata(
  input: FetchPullRequestInput,
): Promise<PullRequestMetadata> {
  const prResponse = await requestWithPublicFallback(
    input.githubToken,
    (octokit) =>
      octokit.pulls.get({
        owner: input.owner,
        repo: input.repo,
        pull_number: input.number,
      }),
  );

  const pr = prResponse.data;

  return {
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
  };
}

export async function fetchPullRequestFiles(input: FetchPullRequestInput) {
  const filesResponse = await requestWithPublicFallback(
    input.githubToken,
    (octokit) =>
      octokit.paginate(octokit.rest.pulls.listFiles, {
        owner: input.owner,
        repo: input.repo,
        pull_number: input.number,
        per_page: 100,
      }),
  );

  return cleanPullRequestFiles(
    filesResponse.map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch ?? null,
    })),
  );
}

export async function fetchPullRequest(input: FetchPullRequestInput) {
  const metadata = await fetchPullRequestMetadata(input);
  const files = await fetchPullRequestFiles(input);

  return pullRequestResultSchema.parse({
    ...metadata,
    files,
  });
}

export async function fetchPullRequestHydrated(
  metadata: PullRequestMetadata,
  input: FetchPullRequestInput,
) {
  const files = await fetchPullRequestFiles(input);

  return pullRequestResultSchema.parse({
    ...metadata,
    files,
  });
}
