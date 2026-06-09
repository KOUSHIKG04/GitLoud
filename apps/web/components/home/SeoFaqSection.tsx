import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { seoFaqItems } from "./seo-faq-items";

export function SeoFaqSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-3">
          <p className="text-sm font-semibold sm:text-base">FAQ</p>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            GitHub PR summary generator for public code changes
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Short answers for developers comparing GitHub PR summary tools,
            commit summary generators, and developer changelog generators.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue={seoFaqItems[0].question}
          className="grid min-w-0 gap-3.5"
        >
          {seoFaqItems.map((item) => (
            <AccordionItem
              key={item.question}
              value={item.question}
              className="border bg-card px-6 py-0.5 text-card-foreground shadow-sm last:border-b sm:px-7"
            >
              <AccordionTrigger className="py-4 text-[17px] font-semibold leading-7 hover:no-underline sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="pb-2 text-base leading-7 text-muted-foreground">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
