export const SOCIAL_PROVIDERS = ["discord"] as const;

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export type SocialConnection = {
  id: string;
  provider: SocialProvider;
  displayName: string;
  externalAccountId: string;
  updatedAt: string;
};

export type SocialConnectionsResponse = {
  connections: SocialConnection[];
};

export type SocialPublication = {
  id: string;
  provider: SocialProvider;
  status: "pending" | "published" | "failed";
  externalPostUrl: string | null;
  errorMessage: string | null;
  connectionName: string | null;
  createdAt: string;
};

export type SocialPublicationsResponse = {
  publications: SocialPublication[];
  nextCursor: string | null;
};

export type SocialPublishResponse = {
  publication: SocialPublication;
  reused: boolean;
};
