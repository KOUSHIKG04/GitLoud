import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

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

export function getAllowedOrigins(value: string | undefined) {
  const configuredOrigins = value
    ? value
        .split(",")
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean)
    : [];
  const origins = [...defaultAllowedOrigins, ...configuredOrigins];

  return [...new Set(origins)];
}

export function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

export function isAllowedOrigin(origin: string, allowedOrigins: string[]) {
  const normalizedOrigin = normalizeOrigin(origin);

  return (
    allowedOrigins.includes(normalizedOrigin) ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
  );
}
