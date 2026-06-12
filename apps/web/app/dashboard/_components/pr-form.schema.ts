import { githubPrOrCommitUrlSchema } from "@repo/shared/github";
import { xPostLengthSchema } from "@repo/shared/generations";
import { z } from "zod";

export const formSchema = z.object({
  url: githubPrOrCommitUrlSchema,
  context: z.string().max(1000).optional(),
  xPostLength: xPostLengthSchema.default("standard"),
});

export type FormValues = z.input<typeof formSchema>;
