import { z } from "zod";

export const changedFileSchema = z.object({
    filename: z.string(),
    status: z.string(),
    additions: z.number(),
    deletions: z.number(),
    patch: z.string().nullable(),
    skipped: z.boolean(),
    skipReason: z.string().nullable(),
});

export type ChangedFile = z.infer<typeof changedFileSchema>;
