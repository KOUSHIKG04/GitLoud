import type { MetadataRoute } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-url";

// Fixed dates: update one when that page's content actually changes, so
// search engines can trust lastModified instead of seeing "now" on every build.
const pages: Array<{
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  {
    path: "/",
    lastModified: "2026-11-24",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/examples",
    lastModified: "2026-11-24",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/faq",
    lastModified: "2026-11-24",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/security-and-privacy",
    lastModified: "2026-06-09",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/feedback",
    lastModified: "2026-07-31",
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    path: "/terms",
    lastModified: "2026-06-09",
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, lastModified, changeFrequency, priority }) => ({
    url: getAbsoluteSiteUrl(path),
    lastModified: new Date(`${lastModified}T00:00:00.000Z`),
    changeFrequency,
    priority,
  }));
}
