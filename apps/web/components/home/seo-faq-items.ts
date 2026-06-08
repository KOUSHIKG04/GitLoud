export const seoFaqItems = [
  {
    question: "What is GitLoud?",
    answer:
      "GitLoud is a GitHub PR summary generator and commit summary generator for developers who want to explain shipped work faster.",
  },
  {
    question: "Can GitLoud generate changelog entries?",
    answer:
      "Yes. GitLoud works as a developer changelog generator by turning public pull requests and commits into concise release notes and update copy.",
  },
  {
    question: "Does GitLoud support private repositories?",
    answer:
      "Yes. Pro users can connect selected private repositories through the GitLoud GitHub App. GitLoud uses short-lived, server-side installation tokens for private PR and commit generation.",
  },
  {
    question: "What content formats does GitLoud create?",
    answer:
      "GitLoud creates short summaries, technical summaries, beginner explanations, portfolio bullets, changelog entries, and social posts for X, LinkedIn, Reddit, and Discord.",
  },
] as const;

export function getSeoFaqItems() {
  return seoFaqItems;
}
