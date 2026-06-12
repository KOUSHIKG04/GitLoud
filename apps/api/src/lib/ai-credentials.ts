import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { db } from "@repo/db/client";
import { AI_PROVIDERS, type AiProvider } from "@repo/shared/ai-credentials";
import { getUserFeatures, type UserFeatures } from "@/lib/features";

const ALGORITHM = "aes-256-gcm";
type DbAiProvider = "GEMINI" | "OPENAI" | "ANTHROPIC" | "OPENROUTER";

type EncryptedValue = {
  apiKeyEnc: string;
  apiKeyIv: string;
  apiKeyTag: string;
};

export async function listAiCredentials(userId: string) {
  const credentials = await db.userAiCredential.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      provider: true,
      model: true,
      apiKeyEnc: true,
      apiKeyIv: true,
      apiKeyTag: true,
      updatedAt: true,
    },
  });

  return credentials.map((credential) => ({
    provider: serializeProvider(credential.provider),
    model: credential.model,
    keyPreview: maskApiKey(
      decryptValue({
        apiKeyEnc: credential.apiKeyEnc,
        apiKeyIv: credential.apiKeyIv,
        apiKeyTag: credential.apiKeyTag,
      }),
    ),
    updatedAt: credential.updatedAt.toISOString(),
  }));
}

export async function saveAiCredential({
  userId,
  provider,
  apiKey,
  model,
}: {
  userId: string;
  provider: string;
  apiKey: string;
  model?: string | null;
}) {
  const normalizedProvider = normalizeProvider(provider);
  const encrypted = encryptValue(apiKey.trim());

  await db.userAiCredential.upsert({
    where: {
      userId_provider: {
        userId,
        provider: toDbProvider(normalizedProvider),
      },
    },
    create: {
      userId,
      provider: toDbProvider(normalizedProvider),
      model: model?.trim() || null,
      ...encrypted,
    },
    update: {
      model: model?.trim() || null,
      ...encrypted,
    },
  });
}

export async function deleteAiCredential(userId: string, provider: string) {
  const normalizedProvider = normalizeProvider(provider);

  await db.userAiCredential.deleteMany({
    where: {
      userId,
      provider: toDbProvider(normalizedProvider),
    },
  });
}

export async function getAiGenerationOptionsForUser(
  userId: string,
  prefetchedFeatures?: UserFeatures,
) {
  const features = prefetchedFeatures ?? (await getUserFeatures(userId));

  if (!features.canUseOwnAiKey) {
    return {};
  }

  const credential = await db.userAiCredential.findFirst({
    where: {
      userId,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!credential) {
    return {};
  }

  return {
    aiProvider: serializeProvider(credential.provider),
    aiApiKey: decryptValue({
      apiKeyEnc: credential.apiKeyEnc,
      apiKeyIv: credential.apiKeyIv,
      apiKeyTag: credential.apiKeyTag,
    }),
    aiModel: credential.model ?? undefined,
  };
}

export function normalizeProvider(provider: string) {
  const normalized = provider.trim().toLowerCase() as AiProvider;

  if (!AI_PROVIDERS.includes(normalized)) {
    throw new Error("Unsupported AI provider.");
  }

  return normalized;
}

export function getSupportedAiProviders() {
  return [...AI_PROVIDERS];
}

function toDbProvider(provider: AiProvider): DbAiProvider {
  const providerMap = {
    gemini: "GEMINI",
    openai: "OPENAI",
    anthropic: "ANTHROPIC",
    openrouter: "OPENROUTER",
  } satisfies Record<AiProvider, DbAiProvider>;

  return providerMap[provider];
}

function serializeProvider(provider: string): AiProvider {
  const providerMap = {
    GEMINI: "gemini",
    OPENAI: "openai",
    ANTHROPIC: "anthropic",
    OPENROUTER: "openrouter",
  } satisfies Record<DbAiProvider, AiProvider>;

  const serialized = providerMap[provider as DbAiProvider];

  if (!serialized) {
    throw new Error("Unsupported AI provider.");
  }

  return serialized;
}

function encryptValue(value: string): EncryptedValue {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    apiKeyEnc: encrypted.toString("base64"),
    apiKeyIv: iv.toString("base64"),
    apiKeyTag: tag.toString("base64"),
  };
}

function decryptValue(value: EncryptedValue) {
  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(value.apiKeyIv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(value.apiKeyTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(value.apiKeyEnc, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function getEncryptionKey() {
  const configuredKey = process.env.AI_CREDENTIAL_ENCRYPTION_KEY;

  if (!configuredKey) {
    throw new Error("AI_CREDENTIAL_ENCRYPTION_KEY is missing");
  }

  const key = Buffer.from(configuredKey, "base64");

  if (key.length !== 32) {
    throw new Error("AI_CREDENTIAL_ENCRYPTION_KEY must be 32 bytes base64");
  }

  return key;
}

function maskApiKey(apiKey: string) {
  return `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;
}
