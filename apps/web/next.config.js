/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/ai",
    "@repo/db",
    "@repo/github",
    "@repo/shared",
    "@repo/ui",
  ],
};

export default nextConfig;
