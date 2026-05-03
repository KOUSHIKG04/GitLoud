import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LazyMotionCursor } from "@/components/LazyMotionCursor";
import { AuthToast } from "@/components/auth/AuthToast";
import { GeneratorSection } from "@/components/home/GeneratorSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PhaseTwoUpdatesSection } from "@/components/home/PhaseTwoUpdatesSection";
import { getSeoFaqItems, SeoFaqSection } from "@/components/home/SeoFaqSection";
import { getCurrentUserId } from "@/lib/session";
import { Suspense } from "react";

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

export default async function Home() {
  await getCurrentUserId();

  return (
    <main className="min-h-dvh flex flex-col overflow-x-hidden">
      <Suspense fallback={null}>
        <AuthToast />
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />

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
