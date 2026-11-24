import type { Metadata } from "next";
import { AuthToast } from "@/features/auth/components/auth-toast";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LandingDocument } from "@/features/landing/components/landing-document";
import { ProfileSync } from "@/features/auth/components/profile-sync";
import { safeJsonLd } from "@/lib/safe-json-ld";
import { siteUrl } from "@/lib/site-url";
import { buildPageMetadata } from "@/lib/seo";
import { seoFaqItems } from "@/features/faq/faq-items";

const homeTitle = "GitLoud: Turn GitHub PRs into Changelogs and Social Posts";
const homeDescription =
  "Free AI tool that turns GitHub pull requests and commits into PR summaries, changelog entries, portfolio bullets, and posts for X, LinkedIn, Reddit and Discord.";

export const metadata: Metadata = buildPageMetadata({
  title: homeTitle,
  description: homeDescription,
  path: "/",
  absoluteTitle: true,
  keywords: [
    "GitHub PR summary generator",
    "pull request summary",
    "commit summary generator",
    "AI changelog generator",
    "release notes from pull requests",
    "GitHub to LinkedIn post",
    "GitHub to X post",
    "build in public posts",
    "developer portfolio bullets",
    "bring your own AI key",
  ],
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "GitLoud",
      url: `${siteUrl}/`,
      logo: `${siteUrl}/app-logo-512.png`,
      sameAs: ["https://github.com/KOUSHIKG04/GitLoud"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "GitLoud",
      description: homeDescription,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "GitLoud",
      url: `${siteUrl}/`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: homeDescription,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Generate from public GitHub pull request and commit URLs",
        "Private repositories through a read-only GitHub App",
        "Combine two to five pull requests or commits from one repository",
        "Summaries, technical notes, changelog entries and portfolio bullets",
        "Posts for X, LinkedIn, Reddit and Discord",
        "Bring your own Gemini, OpenAI, Anthropic or OpenRouter key",
      ],
      publisher: { "@id": `${siteUrl}/#organization` },
      sameAs: ["https://github.com/KOUSHIKG04/GitLoud"],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: seoFaqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

/**
 * Renders the main GitLoud landing page / home page.
 * Renders the landing document with Organization, WebSite, SoftwareApplication
 * and FAQPage structured data.
 *
 * @returns React page layout component.
 */

export default function Home() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-x-clip">
      <AuthToast />
      <ProfileSync />

      <script type="application/ld+json">{safeJsonLd(structuredData)}</script>

      <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
        <Header />
        <LandingDocument />
      </div>

      <Footer />
    </main>
  );
}
