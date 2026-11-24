import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { db } from "@repo/db/client";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const DISCORD_REQUEST_TIMEOUT_MS = 10_000;
const DISCORD_CONTENT_LIMIT = 2_000;
const DISCORD_VERIFICATION_AUTO_RETRY_MAX_MS = 3_000;
const DISCORD_USER_AGENT = "DiscordBot (https://gitloud-web.vercel.app, 0.1.0)";

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

class DiscordRequestTimeoutError extends Error {
  constructor() {
    super("Discord did not respond in time.");
    this.name = "DiscordRequestTimeoutError";
  }
}

export class DiscordDeliveryUnknownError extends Error {
  constructor() {
    super(
      "Discord may have accepted this post, but its response timed out. Check the channel before publishing again.",
    );
    this.name = "DiscordDeliveryUnknownError";
  }
}

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
    webhookId: match[1]!,
  };
}

export async function verifyDiscordWebhook(webhookUrl: string) {
  let result = await fetchWithTimeout(webhookUrl, {
    method: "GET",
  });

  if (result.response.status === 429) {
    const retryAfterMs = getDiscordRetryAfterMs(result.response, result.data);

    if (
      retryAfterMs !== null &&
      retryAfterMs <= DISCORD_VERIFICATION_AUTO_RETRY_MAX_MS
    ) {
      await wait(retryAfterMs + 100);
      result = await fetchWithTimeout(webhookUrl, { method: "GET" });
    }
  }

  const { response, data: value } = result;

  if (!response.ok) {
    throw new Error(getDiscordWebhookVerificationError(response, value));
  }

  if (!isDiscordWebhook(value)) {
    throw new Error(
      "Discord returned an unexpected response while verifying this webhook.",
    );
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
  const encrypted = encryptSocialSecret(normalized.webhookUrl);
  const resolvedDisplayName = displayName?.trim() || "Discord channel";

  await db.socialConnection.upsert({
    where: {
      userId_provider_externalAccountId: {
        userId,
        provider: "DISCORD",
        externalAccountId: normalized.webhookId,
      },
    },
    create: {
      userId,
      provider: "DISCORD",
      displayName: resolvedDisplayName,
      externalAccountId: normalized.webhookId,
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

  let result: Awaited<ReturnType<typeof fetchWithTimeout>>;

  try {
    result = await fetchWithTimeout(publishUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        allowed_mentions: { parse: [] },
      }),
    });
  } catch (error) {
    if (error instanceof DiscordRequestTimeoutError) {
      throw new DiscordDeliveryUnknownError();
    }

    throw error;
  }

  const { response, data: value } = result;

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
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    headers.set("User-Agent", DISCORD_USER_AGENT);

    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });
    const data = await readJson(response, controller.signal);

    return { response, data };
  } catch (error) {
    if (error instanceof DiscordRequestTimeoutError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new DiscordRequestTimeoutError();
    }

    throw new Error("Could not reach Discord.");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readJson(
  response: Response,
  signal: AbortSignal,
): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    if (
      signal.aborted ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new DiscordRequestTimeoutError();
    }

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

function getDiscordWebhookVerificationError(
  response: Response,
  value: unknown,
) {
  const { status } = response;
  const discordCode = getDiscordErrorCode(value);
  const suffix = discordCode ? ` (Discord code ${discordCode})` : "";

  if (status === 404 || discordCode === 10015) {
    return `This Discord webhook does not exist or was deleted${suffix}. Create a new webhook and paste its current URL.`;
  }

  if (status === 429) {
    const retryAfterMs = getDiscordRetryAfterMs(response, value);
    const retryMessage =
      retryAfterMs === null
        ? "Wait at least one minute, then try again once."
        : `Retry after ${Math.max(1, Math.ceil(retryAfterMs / 1_000))} seconds.`;

    return `Discord is rate-limiting webhook verification${suffix}. ${retryMessage}`;
  }

  if (status === 401 || status === 403) {
    return `Discord or Cloudflare denied webhook verification from the GitLoud server (HTTP ${status})${suffix}.`;
  }

  if (status >= 500) {
    return `Discord is temporarily unavailable while verifying this webhook (HTTP ${status})${suffix}.`;
  }

  const discordMessage = getDiscordApiMessage(value);
  return `Discord rejected webhook verification (HTTP ${status})${suffix}${discordMessage ? `: ${discordMessage}` : "."}`;
}

function getDiscordRetryAfterMs(response: Response, value: unknown) {
  const bodyRetryAfter = getNumericProperty(value, "retry_after");

  if (bodyRetryAfter !== null && bodyRetryAfter >= 0) {
    return bodyRetryAfter * 1_000;
  }

  const retryAfter = response.headers.get("retry-after");

  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds >= 0) {
      return seconds * 1_000;
    }

    const retryAt = Date.parse(retryAfter);

    if (Number.isFinite(retryAt)) {
      return Math.max(0, retryAt - Date.now());
    }
  }

  const resetAfter = Number(response.headers.get("x-ratelimit-reset-after"));
  return Number.isFinite(resetAfter) && resetAfter >= 0
    ? resetAfter * 1_000
    : null;
}

function getNumericProperty(value: unknown, property: string) {
  if (typeof value !== "object" || value === null || !(property in value)) {
    return null;
  }

  const propertyValue = (value as Record<string, unknown>)[property];
  const numericValue =
    typeof propertyValue === "number"
      ? propertyValue
      : typeof propertyValue === "string"
        ? Number(propertyValue)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : null;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDiscordErrorCode(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof value.code === "number"
  ) {
    return value.code;
  }

  return null;
}

function getDiscordApiMessage(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message.slice(0, 160);
  }

  return null;
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
