import { z } from "zod";

export const generatedContentSchema = z.object({
    shortSummary: z.string(),
    technicalSummary: z.string(),
    features: z.array(z.string()),
    techUsed: z.array(z.string()),
    tweet: z.string(),
    linkedInPost: z.string(),
    redditPost: z.string(),
    portfolioBullet: z.string(),
    changelogEntry: z.string(),
    beginnerSummary: z.string(),
});

export type GeneratedContent = z.infer<typeof generatedContentSchema>;