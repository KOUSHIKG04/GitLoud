import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LazyMotionCursor } from "@/components/LazyMotionCursor";
import { AuthToast } from "@/components/auth/AuthToast";
import { GeneratorSection } from "@/components/home/GeneratorSection";
import { FeedbackSection } from "@/components/home/FeedbackSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { SeoFaqSection } from "@/components/home/SeoFaqSection";
import { getSeoFaqItems } from "@/components/home/seo-faq-items";
import { ProfileSync } from "@/components/auth/ProfileSync";
import { Button } from "@repo/ui/components/button";
import { BillingActions } from "@/components/BillingActions";
import { Check } from "lucide-react";
import Link from "next/link";

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
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "14",
      priceCurrency: "USD",
    },
  ],
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
      <PricingSection />
      <SeoFaqSection />
      <FeedbackSection />
      <Footer />
    </main>
  );
}

function PricingSection() {
  return (
    <section
      id="pricing"
      className="px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-34"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <p className="text-sm font-semibold">PRICING</p>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Start public. Upgrade when your work gets serious.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            GitLoud keeps the public workflow simple, then adds private
            repository access and custom AI keys for developers who need more
            control.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PricingPlan
            name="Free"
            price="$0"
            description="For shipping in public and turning open work into updates."
            cta="START FREE"
            href="/dashboard"
            features={[
              "Public PR and commit generation",
              "Technical summaries and changelog entries",
              "Portfolio bullets and social posts",
              "Saved generation history",
            ]}
          />

          <PricingPlan
            name="Pro"
            price="$14"
            badge="Most useful"
            description="Per month for private work, heavier usage, and bring-your-own AI."
            cta="GO PRO"
            featured
            features={[
              "Private repository generation",
              "GitHub App installation access",
              "Custom Gemini, OpenAI, Anthropic, or OpenRouter key",
              "Higher limits and priority product support",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function PricingPlan({
  name,
  price,
  badge,
  description,
  features,
  cta,
  href,
  featured,
}: {
  name: string;
  price: string;
  badge?: string;
  description: string;
  features: string[];
  cta: string;
  href?: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`relative flex min-h-[420px] flex-col border bg-background p-6 shadow-sm ${
        featured ? "border-chart-3 shadow-lg" : "border-border"
      }`}
    >
      {badge ? (
        <div className="absolute right-4 top-4 border border-chart-3 bg-chart-3/10 px-2 py-1 text-xs font-medium text-chart-3">
          {badge}
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-semibold tracking-tight">
              {price}
            </span>
            <span className="pb-1 text-sm text-muted-foreground">/ month</span>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-chart-3" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {featured ? (
        <BillingActions />
      ) : (
        <Button asChild className="mt-6 w-full" variant="outline">
          <Link href={href ?? "/dashboard"}>{cta}</Link>
        </Button>
      )}
    </article>
  );
}
