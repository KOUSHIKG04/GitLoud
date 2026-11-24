import type {
  GitHubActivityItem,
  GitHubActivityResponse,
  GitHubActivityType,
  GitHubInstallation,
  GitHubInstallationsResponse,
  GitHubRepository,
} from "@repo/shared/github-app";
import type { XPostLength } from "@repo/shared/generations";

export type GitHubRepositoryOption = GitHubRepository & {
  accountLogin: string;
};

export type ActivityType = GitHubActivityType;
export type GenerationStep = "select" | "customize";

export type {
  GitHubActivityItem,
  GitHubActivityResponse,
  GitHubInstallation,
  GitHubInstallationsResponse,
  XPostLength,
};
