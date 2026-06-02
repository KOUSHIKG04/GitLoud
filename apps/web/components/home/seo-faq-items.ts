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
      "Phase 1 supports public repositories. Private repository support is planned first in Phase 2 through explicit GitHub App permissions.",
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
