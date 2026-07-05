import type { Metadata } from "next";
import { AuthToast } from "@/components/auth/AuthToast";
import { Footer } from "@/components/Footer";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { ProfileSync } from "@/components/auth/ProfileSync";
import { safeJsonLd } from "@/lib/safe-json-ld";

export const metadata: Metadata = {
  title: "GitHub PR Summary and Social Post Generator",
  description:
    "Use GitLoud to turn GitHub pull requests and commits into clear summaries, feature notes, changelog entries, portfolio bullets, and social posts.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GitHub PR Summary and Social Post Generator",
    description:
      "Use GitLoud to turn GitHub pull requests and commits into clear summaries, feature notes, changelog entries, portfolio bullets, and social posts.",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GitLoud - GitHub PR Summary and Social Post Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub PR Summary and Social Post Generator",
    description:
      "Use GitLoud to turn GitHub pull requests and commits into clear summaries, feature notes, changelog entries, portfolio bullets, and social posts.",
    images: ["/twitter-image"],
  },
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitloud-web.vercel.app/";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GitLoud",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "Generate GitHub pull request and commit summaries, changelog entries, portfolio bullets, and share-ready posts for developers.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
    },
  ],
};

/**
 * Renders the main GitLoud landing page / home page.
 * Includes SEO structured data scripts, dynamic motion cursor, hero elements,
 * generator interface, features list, and FAQs section.
 *
 * @returns React page layout component.
 */

export default function Home() {
  return (
    <main className=" relative isolate min-h-dvh flex flex-col overflow-x-hidden">
      <AuthToast />
      <ProfileSync />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
        <Header />
        <HeroSection />
        <HowItWorksSection />
      </div>

      <Footer />
    </main>
  );
}
