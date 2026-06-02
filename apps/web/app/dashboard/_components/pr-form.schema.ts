import { githubPrOrCommitUrlSchema } from "@repo/shared/github";
import { z } from "zod";

export const formSchema = z.object({
  url: githubPrOrCommitUrlSchema,
  context: z.string().max(1000).optional(),
  xPostLength: z.enum(["standard", "premium"]).default("standard"),
});

export type FormValues = z.input<typeof formSchema>;
