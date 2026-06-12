export const AI_PROVIDERS = [
  "gemini",
  "openai",
  "anthropic",
  "openrouter",
] as const;

export type AiProvider = (typeof AI_PROVIDERS)[number];

export type AiCredential = {
  provider: AiProvider;
  model: string | null;
  keyPreview: string;
  updatedAt: string;
};

export type AiCredentialsResponse = {
  plan: string;
  canUseOwnAiKey: boolean;
  supportedProviders: AiProvider[];
  credentials: AiCredential[];
};
