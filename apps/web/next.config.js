const sharedAliases = {
  "@repo/shared/changed-file": "../../packages/shared/src/changed-file.ts",
  "@repo/shared/commit": "../../packages/shared/src/commit.ts",
  "@repo/shared/generated-content": "../../packages/shared/src/generated-content.ts",
  "@repo/shared/github": "../../packages/shared/src/github.ts",
  "@repo/shared/pr-cleanup": "../../packages/shared/src/pr-cleanup.ts",
  "@repo/shared/pull-request": "../../packages/shared/src/pull-request.ts",
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
