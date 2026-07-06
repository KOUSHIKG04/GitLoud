/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared", "@repo/ui"],
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
      {
        source: "/security",
        destination: "/security-and-privacy?tab=security",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
