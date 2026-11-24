// The six GitLoud features shown on the landing page.
export const landingFeatures: Array<{
  title: string;
  description: string;
  tag?: string;
}> = [
  {
    title: "GitHub-aware generation",
    description:
      "Generate from public PR or commit URLs and authorized private repositories through the read-only GitHub App.",
  },
  {
    title: "Combined repository updates",
    description:
      "Connect GitHub and combine between two and five pull requests or commits from one repository into one cohesive update.",
  },
  {
    title: "Bring your own AI key",
    description:
      "Use Gemini, OpenAI, Anthropic, or OpenRouter. Saved credentials are encrypted and returned only as masked previews.",
    tag: "BYOK",
  },
  {
    title: "Complete content pack",
    description:
      "Create summaries, technical notes, changelogs, portfolio bullets, and standard or long-form social posts together.",
  },
  {
    title: "Publish with media",
    description:
      "Attach images or videos, publish directly to Discord, open social composers, or use native sharing with supported apps.",
    tag: "Direct",
  },
  {
    title: "History and regeneration",
    description:
      "Reopen saved generations, copy individual formats, regenerate with saved preferences, or delete an entry.",
  },
];
