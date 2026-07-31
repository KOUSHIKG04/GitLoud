import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * Generates the robots.txt configuration dynamically.
 *
 * @returns The Next.js Robots metadata route configuration.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api",
        "/api/",
        "/dashboard",
        "/dashboard/",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
