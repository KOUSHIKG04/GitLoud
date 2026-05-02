import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is GitLoud?",
    answer:
      "GitLoud is a GitHub PR summary generator and commit summary generator for developers who want to explain shipped work faster.",
  },
  {
    question: "Can GitLoud generate changelog entries?",
    answer:
      "Yes. GitLoud works as a developer changelog generator by turning public pull requests and commits into concise release notes and update copy.",
  },
  {
    question: "Does GitLoud support private repositories?",
    answer:
      "Phase 1 supports public repositories. Private repository support is planned first in Phase 2 through explicit GitHub App permissions.",
  },
  {
    question: "What content formats does GitLoud create?",
    answer:
      "GitLoud creates short summaries, technical summaries, beginner explanations, portfolio bullets, changelog entries, and social posts for X, LinkedIn, Reddit, and Discord.",
  },
] as const;

export function SeoFaqSection() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 lg:px-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div className="space-y-3">
          <p className="text-sm font-semibold">FAQ</p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            GitHub PR summary generator for public code changes
          </h2>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Short answers for developers comparing GitHub PR summary tools,
            commit summary generators, and developer changelog generators.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue={faqs[0].question}
          className="grid gap-3"
        >
          {faqs.map((item) => (
            <AccordionItem
              key={item.question}
              value={item.question}
              className="border bg-card px-5 text-card-foreground shadow-sm last:border-b"
            >
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-6 text-muted-foreground">
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

export function getSeoFaqItems() {
  return faqs;
}
