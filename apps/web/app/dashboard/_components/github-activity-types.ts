import type {
  GitHubActivityItem,
  GitHubActivityResponse,
  GitHubActivityType,
  GitHubInstallation,
  GitHubInstallationsResponse,
  GitHubRepository,
} from "@repo/shared/github-app";

export type GitHubRepositoryOption = GitHubRepository & {
  accountLogin: string;
};

export type ActivityType = GitHubActivityType;
export type XPostLength = "standard" | "premium";
export type GenerationStep = "select" | "customize";

export type {
  GitHubActivityItem,
  GitHubActivityResponse,
  GitHubInstallation,
  GitHubInstallationsResponse,
};
