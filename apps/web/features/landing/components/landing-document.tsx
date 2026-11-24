import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { DashboardGetStartedButton } from "@/components/DashboardGetStartedButton";
import { seoFaqItems } from "@/features/faq/faq-items";
import { DiagramFigure } from "@/features/landing/components/diagram-figure";

const REPO_URL = "https://github.com/KOUSHIKG04/GitLoud";

const steps = [
  {
    title: "Paste a link",
    body: "Drop in a GitHub pull request or commit URL, or connect GitHub and pick up to five from one repository.",
  },
  {
    title: "GitLoud reads the diff",
    body: "It pulls the metadata and the code changes, then writes from what actually shipped, using GitLoud's AI or your own key.",
  },
  {
    title: "Publish everywhere",
    body: "Social posts, summaries, changelog notes and portfolio bullets arrive together. Copy them, share them, or post straight to Discord.",
  },
];

const linkClass =
  "dither text-foreground underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:decoration-primary";

// The landing page as one readable document: a title, an illustration, then
// plain sections separated by hairlines, ending in links.
export function LandingDocument() {
  return (
    <article className="w-full px-4 pt-16 pb-20 sm:px-6 sm:pt-20 lg:px-12">
      <header>
        <h1
          id="hero"
          className="dither scroll-mt-24 text-3xl font-bold uppercase sm:text-4xl"
        >
          Ship it,{" "}
          <span className="relative z-10 inline-block after:absolute after:inset-0 after:-z-10 after:rotate-2 after:-skew-5 after:bg-primary after:content-['']">
            {/* Own layer so the dithered glyphs paint above the yellow mark */}
            <span className="dither relative">make noise.</span>
          </span>
          <span className="dither mt-4 block text-lg font-normal normal-case text-foreground/90 sm:text-xl">
            AI generator for GitHub PR summaries, changelogs and social posts
          </span>
        </h1>
        <p className="dither mt-6 text-base leading-7 text-muted-foreground">
          GitLoud turns one GitHub pull request or commit, or up to five from a
          connected repository, into a publish-ready set of social posts,
          summaries, changelog notes and portfolio bullets. It writes from the
          actual diff, with GitLoud&apos;s AI or your own key.
        </p>
        <p className="dither mt-4 text-base leading-7 text-muted-foreground">
          See{" "}
          <Link href="/examples" className={linkClass}>
            real output from a pull request
          </Link>
          , read the{" "}
          <Link href="/faq" className={linkClass}>
            FAQ
          </Link>
          , or browse the{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            code on GitHub
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <DashboardGetStartedButton />
          <Button
            asChild
            variant="outline"
            className="inline-flex items-center gap-2 text-foreground"
          >
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <GithubIconIcon className="size-4" />
              STAR ON GITHUB
            </a>
          </Button>
        </div>
      </header>

      <DiagramFigure />

      <section id="how-it-works" className="mt-16 scroll-mt-24">
        <h2 className="dither text-xl font-semibold">How it works</h2>
        <ol className="mt-6 space-y-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="w-full rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-baseline gap-3">
                <span className="dither font-mono text-sm tabular-nums text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="dither text-base font-medium">{step.title}</h3>
              </div>
              <p className="dither mt-3 text-base leading-7 text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="dither text-xl font-semibold">
          Frequently asked questions
        </h2>
        <Accordion
          type="single"
          collapsible
          defaultValue="faq-3"
          className="mt-6"
        >
          {seoFaqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="border-border transition-colors data-[state=open]:bg-card"
            >
              <AccordionTrigger className="px-6 py-5 text-left text-base hover:no-underline">
                <span className="dither">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="dither px-6 pb-6 text-base leading-7 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </article>
  );
}
