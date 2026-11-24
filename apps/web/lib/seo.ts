import type { Metadata } from "next";

const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "GitLoud turns GitHub pull requests and commits into posts, changelogs and portfolio bullets",
};

/**
 * Per-page metadata with its own canonical URL, Open Graph and Twitter card,
 * so no page inherits the home page's social preview.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  /** Skip the "| GitLoud" title template (the home page). */
  absoluteTitle?: boolean;
  keywords?: string[];
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: "GitLoud",
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
  };
}
