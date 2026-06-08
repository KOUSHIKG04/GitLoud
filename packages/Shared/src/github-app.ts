export type GitHubRepository = {
  id: string;
  owner: string;
  repo: string;
  repoId?: string | null;
};

export type GitHubInstallation = {
  id: string;
  installationId: string;
  accountLogin: string;
  accountType: string;
  repositorySelection: string;
  manageUrl: string;
  updatedAt: string;
  repositories: GitHubRepository[];
};

export type GitHubInstallationsResponse = {
  plan: string;
  canUsePrivateRepos: boolean;
  installations: GitHubInstallation[];
};

export type GitHubActivityType = "pull-requests" | "commits";

export type GitHubActivityItem = {
  id: string;
  sourceType: "pull-request" | "commit";
  title: string;
  subtitle: string;
  author: string | null;
  updatedAt: string | null;
  url: string;
};

export type GitHubActivityResponse = {
  items: GitHubActivityItem[];
};
