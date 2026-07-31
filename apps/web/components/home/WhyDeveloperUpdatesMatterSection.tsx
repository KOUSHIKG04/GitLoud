import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

const reasons = [
  {
    title: "Keep technical context intact",
    description:
      "Release updates often lose the reasoning behind a change when they are rewritten days later. Starting from the pull request or commit keeps the problem, implementation, and outcome connected, so the final explanation is grounded in the work that actually shipped.",
  },
  {
    title: "Write once for every audience",
    description:
      "A teammate may need implementation details, while a recruiter or community member needs a concise explanation of impact. One source can become a technical summary, beginner explanation, changelog entry, portfolio bullet, and platform-ready post without repeating the research step.",
  },
  {
    title: "Build a consistent shipping habit",
    description:
      "Regular updates make progress easier to discover and remember. Saving generated drafts and returning to previous work gives individual developers and teams a lightweight record of releases, lessons, and product improvements that can be reviewed before sharing.",
  },
  {
    title: "Review before publishing",
    description:
      "Generated drafts are a starting point, not an automatic claim about the code. Review repository details, remove sensitive information, adjust the tone for the intended audience, and confirm the final text before publishing. This review step keeps communication accurate while preserving the speed benefit of source-aware generation.",
  },
  {
    title: "Start with evidence instead of a blank page",
    description:
      "After a release, developers often have to reconstruct the work from memory before they can explain it. Beginning with the pull request or commit provides a concrete source. From there, the draft can support an engineering handoff, public changelog, project case study, portfolio update, or community post that explains what shipped and why it matters.",
  },
  {
    title: "Use better source details for better drafts",
    description:
      "Clear pull request titles, descriptions, commit messages, and focused diffs provide stronger evidence for a useful draft. Extra context can explain the intended audience, the lesson learned, or the outcome that deserves emphasis. For larger changes, combining related items can produce a more complete release story than treating every commit as an isolated announcement.",
  },
  {
    title: "Keep privacy part of the workflow",
    description:
      "Public links can be used directly. Private access is optional and uses a read-only GitHub App that can be limited to selected repositories. Teams should still follow their own security and data-processing policies, avoid sharing secrets or restricted information, review generated text carefully, and disconnect integrations that are no longer required.",
  },
] as const;

export function WhyDeveloperUpdatesMatterSection() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-20 lg:py-20">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="max-w-4xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why it matters
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Shipping code is only half the communication work
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Developers frequently leave valuable work hidden inside pull
            requests because turning code changes into clear updates takes
            additional time and context switching. Explore how a source-aware
            workflow makes that work easier without removing editorial control.
          </p>
        </div>

        <Accordion type="single" collapsible className="border-t">
          {reasons.map((reason, index) => (
            <AccordionItem key={reason.title} value={`reason-${index}`}>
              <AccordionTrigger className="py-5 text-base hover:no-underline sm:text-lg">
                <span className="pr-4 text-left">{reason.title}</span>
              </AccordionTrigger>
              <AccordionContent className="max-w-4xl pb-6 text-sm leading-6 text-muted-foreground sm:text-base">
                {reason.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
