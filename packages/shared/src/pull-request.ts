import { z } from "zod";
import { changedFileSchema } from "./changed-file";

export const pullRequestFileSchema = changedFileSchema;

export const pullRequestResultSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    author: z.string().optional(),
    url: z.url(),
    state: z.string(),
    headSha: z.string(),
    additions: z.number(),
    deletions: z.number(),
    changedFiles: z.number(),
    files: z.array(pullRequestFileSchema),
});

export type PullRequestFile = z.infer<typeof pullRequestFileSchema>;
export type PullRequestResult = z.infer<typeof pullRequestResultSchema>;
