import type { MetadataRoute } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-url";
const LEGAL_PAGES_LAST_MODIFIED = new Date("2026-06-09T00:00:00.000Z");

/**
 * Generates the sitemap.xml dynamically.
 *
 * @returns The Next.js Sitemap metadata route configuration.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getAbsoluteSiteUrl(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getAbsoluteSiteUrl("/examples"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getAbsoluteSiteUrl("/why-it-matters"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getAbsoluteSiteUrl("/security-and-privacy"),
      lastModified: LEGAL_PAGES_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getAbsoluteSiteUrl("/terms"),
      lastModified: LEGAL_PAGES_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: getAbsoluteSiteUrl("/faq"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getAbsoluteSiteUrl("/feedback"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
