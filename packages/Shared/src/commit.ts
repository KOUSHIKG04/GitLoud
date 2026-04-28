import { z } from "zod";
import { pullRequestFileSchema } from "@/pull-request";


export const commitResultSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    sha: z.string(),
    shortSha: z.string(),
    message: z.string(),
    author: z.string().nullable(),
    url: z.url(),
    additions: z.number(),
    deletions: z.number(),
    changedFiles: z.number(),
    files: z.array(pullRequestFileSchema),
});

export type CommitResult = z.infer<typeof commitResultSchema>;