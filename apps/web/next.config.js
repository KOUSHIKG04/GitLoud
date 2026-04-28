/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ai", "@repo/shared", "@repo/github"],
};

export default nextConfig;
