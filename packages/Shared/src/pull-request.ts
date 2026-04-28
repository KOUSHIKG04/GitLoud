import { z } from "zod";

export const pullRequestFileSchema = z.object({
    filename: z.string(),
    status: z.string(),
    additions: z.number(),
    deletions: z.number(),
    patch: z.string().nullable(),
    skipped: z.boolean(),
    skipReason: z.string().nullable(),
});

export const pullRequestResultSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    author: z.string().optional(),
    url: z.url(),
    state: z.string(),
    additions: z.number(),
    deletions: z.number(),
    changedFiles: z.number(),

    files: z.array(pullRequestFileSchema),
});

export type PullRequestFile = z.infer<typeof pullRequestFileSchema>;
export type PullRequestResult = z.infer<typeof pullRequestResultSchema>;