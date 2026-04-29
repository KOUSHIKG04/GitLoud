import { z } from "zod";

export const changedFileSchema = z.object({
    filename: z.string(),
    status: z.string(),
    additions: z.number(),
    deletions: z.number(),
    patch: z.string().nullable(),
    skipped: z.boolean().default(false),
    skipReason: z.string().nullable().default(null),
});

export type ChangedFile = z.infer<typeof changedFileSchema>;
