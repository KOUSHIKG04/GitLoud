import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { seoFaqItems } from "@/components/home/seo-faq-items";
import { safeJsonLd } from "@/lib/safe-json-ld";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

export const metadata: Metadata = {
  title: "FAQ - GitLoud",
  description:
    "Find answers to frequently asked questions about GitLoud, the GitHub PR and commit summary generator.",
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json">
        {safeJsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: seoFaqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        })}
      </script>

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
              Quick answers about GitLoud&apos;s features, summary generation
              formats, and security policies for public and private
              repositories.
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto w-full">
            <Accordion type="single" collapsible className="w-full">
              <div className="grid md:grid-cols-2 md:divide-x divide-border w-full">
                {seoFaqItems.map((item, index) => (
                  <AccordionItem
                    key={item.question}
                    value={`faq-item-${index}`}
                    className="border-b border-border py-1 last:border-b-0"
                  >
                    <AccordionTrigger className="px-4 sm:px-6 lg:px-10 text-left text-lg font-semibold tracking-tight hover:no-underline text-foreground py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 lg:px-10 text-base leading-7 text-muted-foreground pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            </Accordion>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
