export const seoFaqItems = [
  {
    question: "Can GitLoud generate changelog entries?",
    answer:
      "Yes. GitLoud works as a developer changelog generator by turning public pull requests and commits into concise release notes and update copy.",
  },
  {
    question: "Can GitLoud combine multiple pull requests or commits?",
    answer:
      "Yes. Through the connected GitHub Activity dashboard, you can select up to five pull requests or five commits from one repository and generate one cohesive set of summaries and publish-ready posts.",
  },
  {
    question: "How does GitLoud handle private repository access?",
    answer:
      "GitLoud uses a read-only GitHub App with selected repository access and short-lived server-side installation tokens. GitLoud is not currently SOC 2 or ISO/IEC 27001 certified, so teams with formal compliance requirements should review their policy before connecting private repositories.",
  },
  {
    question: "Does GitLoud support private repositories?",
    answer:
      "Yes. Signed-in users can connect selected private repositories through the GitLoud GitHub App. GitLoud uses read-only permissions and short-lived, server-side installation tokens for private PR and commit generation.",
  },
  {
    question: "What content formats does GitLoud create?",
    answer:
      "GitLoud creates short summaries, technical summaries, beginner explanations, portfolio bullets, changelog entries, and social posts for X, LinkedIn, Reddit, and Discord.",
  },
  {
    question: "Can I use my own AI API key?",
    answer:
      "Yes. GitLoud supports your own Gemini, OpenAI, Anthropic, or OpenRouter API key for content generation. Saved credentials are encrypted before storage, and the API returns only a masked preview of each key.",
  },
] as const;

export function getSeoFaqItems() {
  return seoFaqItems;
}
