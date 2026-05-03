import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const sharedAliases = {
  "@repo/shared/changed-file": path.resolve(
    dirname,
    "../../packages/shared/src/changed-file.ts",
  ),
  "@repo/shared/commit": path.resolve(
    dirname,
    "../../packages/shared/src/commit.ts",
  ),
  "@repo/shared/generated-content": path.resolve(
    dirname,
    "../../packages/shared/src/generated-content.ts",
  ),
  "@repo/shared/github": path.resolve(
    dirname,
    "../../packages/shared/src/github.ts",
  ),
  "@repo/shared/pr-cleanup": path.resolve(
    dirname,
    "../../packages/shared/src/pr-cleanup.ts",
  ),
  "@repo/shared/pull-request": path.resolve(
    dirname,
    "../../packages/shared/src/pull-request.ts",
  ),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/ai",
    "@repo/db",
    "@repo/github",
    "@repo/shared",
    "@repo/ui",
  ],
  turbopack: {
    resolveAlias: sharedAliases,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...sharedAliases,
    };

    return config;
  },
};

export default nextConfig;
