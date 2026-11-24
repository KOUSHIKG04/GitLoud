import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const stateLifetimeMs = 10 * 60 * 1000;

type GitHubInstallState = {
  expiresAt: number;
  nonce: string;
  userId: string;
};

export function createGitHubInstallState(userId: string, now = Date.now()) {
  const payload: GitHubInstallState = {
    expiresAt: now + stateLifetimeMs,
    nonce: randomBytes(16).toString("base64url"),
    userId,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyGitHubInstallState(state: string, now = Date.now()) {
  const [encodedPayload, providedSignature, extraPart] = state.split(".");

  if (!encodedPayload || !providedSignature || extraPart) {
    throw new Error("Invalid GitHub installation state");
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid GitHub installation state");
  }

  let payload: unknown;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    throw new Error("Invalid GitHub installation state");
  }

  if (!isGitHubInstallState(payload) || payload.expiresAt <= now) {
    throw new Error("Expired or invalid GitHub installation state");
  }

  return payload;
}

function sign(value: string) {
  return createHmac("sha256", getStateSecret())
    .update(value)
    .digest("base64url");
}

function getStateSecret() {
  const secret = process.env.GITHUB_APP_STATE_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "GITHUB_APP_STATE_SECRET must be configured with at least 32 characters",
    );
  }

  return secret;
}

function isGitHubInstallState(value: unknown): value is GitHubInstallState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<GitHubInstallState>;

  return (
    typeof candidate.userId === "string" &&
    candidate.userId.length > 0 &&
    typeof candidate.nonce === "string" &&
    candidate.nonce.length >= 22 &&
    typeof candidate.expiresAt === "number" &&
    Number.isSafeInteger(candidate.expiresAt)
  );
}
