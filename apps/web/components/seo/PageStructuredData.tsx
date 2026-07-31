import { safeJsonLd } from "@/lib/safe-json-ld";
import { getAbsoluteSiteUrl, siteUrl } from "@/lib/site-url";

type PageStructuredDataProps = {
  name: string;
  description: string;
  path: string;
  pageType?: "WebPage" | "CollectionPage" | "ContactPage";
};

export function PageStructuredData({
  name,
  description,
  path,
  pageType = "WebPage",
}: PageStructuredDataProps) {
  const url = getAbsoluteSiteUrl(path);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": pageType,
        "@id": `${url}#webpage`,
        url,
        name,
        description,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          url: `${siteUrl}/`,
          name: "GitLoud",
        },
        about: {
          "@type": "SoftwareApplication",
          name: "GitLoud",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <script type="application/ld+json">{safeJsonLd(structuredData)}</script>
  );
}
