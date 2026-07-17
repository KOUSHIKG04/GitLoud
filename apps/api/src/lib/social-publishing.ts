import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { db } from "@repo/db/client";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const DISCORD_REQUEST_TIMEOUT_MS = 10_000;
const DISCORD_CONTENT_LIMIT = 2_000;

type EncryptedSocialSecret = {
  secretEnc: string;
  secretIv: string;
  secretTag: string;
};

type DiscordWebhook = {
  id: string;
  name: string | null;
  channel_id: string;
  guild_id?: string | null;
};

type DiscordMessage = {
  id: string;
  channel_id: string;
  guild_id?: string | null;
};

export function normalizeDiscordWebhookUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid Discord webhook URL.");
  }

  const allowedHosts = new Set(["discord.com", "discordapp.com"]);
  const match = url.pathname.match(
    /^\/api(?:\/v\d+)?\/webhooks\/(\d+)\/([^/]+)\/?$/,
  );

  if (
    url.protocol !== "https:" ||
    !allowedHosts.has(url.hostname.toLowerCase()) ||
    !match
  ) {
    throw new Error("Enter an official Discord webhook URL.");
  }

  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";

  return {
    webhookUrl: url.toString().replace(/\/$/, ""),
    webhookId: match[1],
  };
}

export async function verifyDiscordWebhook(webhookUrl: string) {
  const response = await fetchWithTimeout(webhookUrl, { method: "GET" });
  const value = await readJson(response);

  if (!response.ok || !isDiscordWebhook(value)) {
    throw new Error("Discord could not verify this webhook URL.");
  }

  return value;
}

export async function saveDiscordConnection({
  userId,
  webhookUrl,
  displayName,
}: {
  userId: string;
  webhookUrl: string;
  displayName?: string;
}): Promise<void> {
  const normalized = normalizeDiscordWebhookUrl(webhookUrl);
  const webhook = await verifyDiscordWebhook(normalized.webhookUrl);

  if (webhook.id !== normalized.webhookId) {
    throw new Error("Discord returned an unexpected webhook identity.");
  }

  const encrypted = encryptSocialSecret(normalized.webhookUrl);
  const resolvedDisplayName =
    displayName?.trim() || webhook.name?.trim() || "Discord channel";

  await db.socialConnection.upsert({
    where: {
      userId_provider_externalAccountId: {
        userId,
        provider: "DISCORD",
        externalAccountId: webhook.id,
      },
    },
    create: {
      userId,
      provider: "DISCORD",
      displayName: resolvedDisplayName,
      externalAccountId: webhook.id,
      ...encrypted,
    },
    update: {
      displayName: resolvedDisplayName,
      ...encrypted,
    },
  });
}

export async function publishDiscordMessage({
  connection,
  content,
}: {
  connection: EncryptedSocialSecret;
  content: string;
}) {
  const webhookUrl = decryptSocialSecret(connection);
  const publishUrl = new URL(webhookUrl);
  publishUrl.searchParams.set("wait", "true");

  if (!content.trim()) {
    throw new Error("This generation does not contain a Discord post.");
  }

  if (content.length > DISCORD_CONTENT_LIMIT) {
    throw new Error("Discord content must be 2,000 characters or fewer.");
  }

  const response = await fetchWithTimeout(publishUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      allowed_mentions: { parse: [] },
    }),
  });
  const value = await readJson(response);

  if (!response.ok || !isDiscordMessage(value)) {
    throw new Error(getDiscordErrorMessage(value));
  }

  return {
    externalPostId: value.id,
    externalPostUrl: value.guild_id
      ? `https://discord.com/channels/${value.guild_id}/${value.channel_id}/${value.id}`
      : null,
  };
}

export function composeDiscordContent(value: string, mediaUrls: string[] = []) {
  const content = value.trim();
  const uniqueMediaUrls = [...new Set(mediaUrls.filter(Boolean))];

  if (uniqueMediaUrls.length === 0) {
    return content;
  }

  const withMedia = `${content}\n\nMedia:\n${uniqueMediaUrls.join("\n")}`;
  return withMedia.length <= DISCORD_CONTENT_LIMIT ? withMedia : content;
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DISCORD_REQUEST_TIMEOUT_MS,
  );

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Discord did not respond in time.");
    }

    throw new Error("Could not reach Discord.");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isDiscordWebhook(value: unknown): value is DiscordWebhook {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "channel_id" in value &&
    typeof value.channel_id === "string" &&
    "name" in value &&
    (typeof value.name === "string" || value.name === null)
  );
}

function isDiscordMessage(value: unknown): value is DiscordMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "channel_id" in value &&
    typeof value.channel_id === "string"
  );
}

function getDiscordErrorMessage(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return `Discord rejected the post: ${value.message.slice(0, 200)}`;
  }

  return "Discord rejected the post.";
}

function encryptSocialSecret(value: string): EncryptedSocialSecret {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return {
    secretEnc: encrypted.toString("base64"),
    secretIv: iv.toString("base64"),
    secretTag: cipher.getAuthTag().toString("base64"),
  };
}

function decryptSocialSecret(value: EncryptedSocialSecret) {
  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    getEncryptionKey(),
    Buffer.from(value.secretIv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(value.secretTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(value.secretEnc, "base64")),
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
