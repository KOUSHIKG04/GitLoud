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
      // Sign-in and sign-up stay crawlable so Google can read their noindex tag;
      // the dashboard is private and also noindex.
      disallow: ["/dashboard", "/dashboard/", "/sso-callback"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
