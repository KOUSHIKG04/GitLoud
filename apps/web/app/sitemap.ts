import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitloud.app";
const LEGAL_PAGES_LAST_MODIFIED = new Date("2026-06-09T00:00:00.000Z");

/**
 * Generates the sitemap.xml dynamically.
 *
 * @returns The Next.js Sitemap metadata route configuration.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/examples`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/security`,
      lastModified: LEGAL_PAGES_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: LEGAL_PAGES_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: LEGAL_PAGES_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
