import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

for (const envFile of ["../../.env.local", "../../.env", ".env"]) {
  config({
    path: fileURLToPath(new URL(envFile, import.meta.url)),
  });
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
