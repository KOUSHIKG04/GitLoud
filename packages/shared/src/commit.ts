import { z } from "zod";
import { changedFileSchema } from "./changed-file";

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
    files: z.array(changedFileSchema),
});

export type CommitResult = z.infer<typeof commitResultSchema>;
