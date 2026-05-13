import { config } from "dotenv";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

// dotenv keeps existing values by default, so earlier files take precedence.
// Keep this order intentional: root local, root shared, then package fallback.
for (const envFile of ["../../.env.local", "../../.env", ".env"]) {
  const envFilePath = fileURLToPath(new URL(envFile, import.meta.url));
  const exists = existsSync(envFilePath);
  const result = config({
    path: envFilePath,
  });

  console.debug(
    `[prisma-config] ${exists ? "loaded" : "missing"} env file: ${envFilePath}`,
  );

  if (exists && result.error) {
    console.warn(
      `[prisma-config] failed to load env file: ${envFilePath}`,
      result.error,
    );
  }
}

if (!process.env.DATABASE_URL) {
  console.warn("[prisma-config] DATABASE_URL is missing after loading env files.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
