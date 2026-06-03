import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

/**
 * Loads local env files for manual Node runs before importing env-dependent code.
 */
export function loadRuntimeEnv() {
  for (const envFile of [
    "../../../.env.local",
    "../../../.env",
    "../../../packages/db/.env",
    "../.env",
  ]) {
    const envFilePath = fileURLToPath(new URL(envFile, import.meta.url));

    if (existsSync(envFilePath)) {
      loadEnvFile(envFilePath);
    }
  }
}

/**
 * Resolves the API port, falling back to 4000 when the value is missing or invalid.
 */
export function getPort(value: string | undefined) {
  if (!value) {
    return 4000;
  }

  const parsedPort = Number(value);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    return 4000;
  }

  return parsedPort;
}

/**
 * Returns configured CORS origins, with local defaults only outside production.
 */
export function getAllowedOrigins(value: string | undefined) {
  const configuredOrigins = value
    ? value
        .split(",")
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean)
    : [];
  const origins =
    process.env.NODE_ENV === "production"
      ? configuredOrigins
      : [...defaultAllowedOrigins, ...configuredOrigins];

  return [...new Set(origins)];
}

/**
 * Normalizes an origin value for exact CORS allow-list comparisons.
 */
export function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

/**
 * Checks whether an origin is allowed by the configured CORS allow-list.
 */
export function isAllowedOrigin(origin: string, allowedOrigins: string[]) {
  const normalizedOrigin = normalizeOrigin(origin);
  const isLocalDevelopmentOrigin =
    process.env.NODE_ENV !== "production" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);

  return (
    allowedOrigins.includes(normalizedOrigin) || isLocalDevelopmentOrigin
  );
}
