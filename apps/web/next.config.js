/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared", "@repo/ui"],
  experimental: {
    // Keep visited dynamic pages (dashboard) in the client router cache for
    // 30s, so going back to a page is instant instead of a fresh server and
    // database round trip. Mutations call router.refresh() to clear it.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/privacy",
        destination: "/security-and-privacy?tab=privacy",
        permanent: true,
      },
      // Dashboard simplification: one New screen and one Settings page.
      {
        source: "/dashboard/github-activity",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/dashboard/settings/github-app",
        destination: "/dashboard/settings#github",
        permanent: true,
      },
      {
        source: "/dashboard/settings/api-key",
        destination: "/dashboard/settings#ai-key",
        permanent: true,
      },
      {
        source: "/dashboard/settings/social",
        destination: "/dashboard/settings#social",
        permanent: true,
      },
      {
        source: "/why-it-matters",
        destination: "/",
        permanent: true,
      },
      {
        source: "/security",
        destination: "/security-and-privacy?tab=security",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
