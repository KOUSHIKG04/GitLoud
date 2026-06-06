import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LazyMotionCursor } from "@/components/LazyMotionCursor";
import { AuthToast } from "@/components/auth/AuthToast";
import { GeneratorSection } from "@/components/home/GeneratorSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PhaseTwoUpdatesSection } from "@/components/home/PhaseTwoUpdatesSection";
import { SeoFaqSection } from "@/components/home/SeoFaqSection";
import { getSeoFaqItems } from "@/components/home/seo-faq-items";
import { ProfileSync } from "@/components/auth/ProfileSync";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitloud.app";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GitLoud",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "Generate GitHub pull request and commit summaries, changelog entries, portfolio bullets, and share-ready posts for developers.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: getSeoFaqItems().map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
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
    <main className="relative isolate min-h-dvh flex flex-col overflow-x-hidden">
      <AuthToast />
      <ProfileSync />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>

      <LazyMotionCursor />
      <Header />
      <HeroSection />
      <GeneratorSection />
      <HowItWorksSection />
      <PhaseTwoUpdatesSection />
      <SeoFaqSection />
      <Footer />
    </main>
  );
}
