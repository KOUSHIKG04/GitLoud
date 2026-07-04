import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { seoFaqItems } from "@/components/home/seo-faq-items";

export const metadata: Metadata = {
  title: "FAQ - GitLoud",
  description:
    "Find answers to frequently asked questions about GitLoud, the GitHub PR and commit summary generator.",
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": seoFaqItems.map((item) => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer,
              },
            })),
          }),
        }}
      />

      <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
        <Header />

        <section className="px-4 py-10 sm:px-6 lg:px-20 lg:pt-20 lg:py-10">
          <div className="mx-auto max-w-5xl text-left">
            <p className="text-md font-semibold uppercase tracking-wider text-primary">
              FAQ
            </p>

            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tighter">
              Frequently Asked Questions
            </h1>

            <p className="mt-3 max-w-3xl text-md leading-6 text-muted-foreground tracking-tighter">
              Quick answers about GitLoud&apos;s features, summary generation formats, and security policies for public and private repositories.
            </p>
          </div>
        </section>

        <div className="h-px bg-border w-full" />

        <section className="px-4 py-12 sm:px-6 lg:px-20">
          <div className="mx-auto max-w-4xl space-y-12">
            {seoFaqItems.map((item) => (
              <div key={item.question} className="space-y-3 pb-8 border-b border-border last:border-b-0 border-dashed">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {item.question}
                </h2>
                <p className="text-base leading-7 text-muted-foreground tracking-normal">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
