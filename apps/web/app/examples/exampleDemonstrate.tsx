import React from "react";

const exampleDemonstrate = () => {
  return (
    <section className="border-t px-4 py-16 sm:px-6 lg:px-20">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="max-w-4xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            What these generated examples demonstrate
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            A useful developer update does more than restate a pull request
            title. It explains what changed, why the change matters, and how the
            implementation affects users or the codebase. Each format below
            starts with the same repository evidence but serves a different
            communication goal.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          <article className="space-y-3 border-t pt-5">
            <h3 className="font-semibold">Technical communication</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Short and detailed summaries help reviewers, teammates, and future
              maintainers understand the implementation without reopening every
              changed file. They can capture architecture decisions,
              dependencies, migrations, risk areas, and the practical result of
              the work.
            </p>
          </article>
          <article className="space-y-3 border-t pt-5">
            <h3 className="font-semibold">Release documentation</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Changelog entries and release notes translate internal code
              changes into durable product history. The draft can be refined for
              a public release, internal announcement, or versioned project log
              while retaining the important scope of the original change.
            </p>
          </article>
          <article className="space-y-3 border-t pt-5">
            <h3 className="font-semibold">Career and social updates</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Portfolio bullets emphasize ownership and measurable impact, while
              social drafts adapt the explanation for X, LinkedIn, Reddit, or
              Discord. You can change the tone, remove confidential details,
              attach media, and review every word before sharing.
            </p>
          </article>
        </div>

        <div className="space-y-3 border-t pt-7">
          <h2 className="text-xl font-semibold tracking-tight">
            From repository source to an editable content pack
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Paste a public pull request or commit URL to begin, or connect the
            read-only GitHub App for an authorized private repository. The
            service retrieves the relevant metadata and code diff, prepares
            source-aware drafts, and saves the result to generation history. You
            can copy one format, regenerate the full set with extra context, or
            publish a reviewed Discord post. The example is representative
            rather than a guarantee: output quality depends on the available
            source details, your instructions, and the selected AI provider.
          </p>
        </div>

        <div className="grid gap-7 border-t pt-7 md:grid-cols-2">
          <article className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Review for accuracy and audience fit
            </h2>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              A generated draft should be checked against the original change
              before it becomes documentation or a public update. Confirm names,
              version numbers, feature behavior, and any claims about
              performance or impact. Remove internal links, customer details,
              security information, and implementation notes that the intended
              audience should not see. Then edit the opening, level of detail,
              and call to action so the result sounds like the developer or team
              publishing it.
            </p>
          </article>
          <article className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Use the right format for the job
            </h2>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              A short summary is useful for a quick internal handoff. A
              technical summary preserves implementation context for reviewers
              and maintainers. Changelog copy records user-facing changes, while
              a portfolio bullet highlights ownership, tools, and outcomes.
              Social drafts are more conversational and can be shortened,
              expanded, or paired with an image or video after the underlying
              facts have been reviewed.
            </p>
          </article>
        </div>

        <div className="space-y-3 border-t pt-7">
          <h2 className="text-xl font-semibold tracking-tight">
            Compare the draft with its source
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            The strongest way to evaluate an example is to trace its important
            statements back to the pull request or commit. Check that the named
            feature, affected area, and stated outcome are supported by the
            source. Details that are useful to maintainers may be unnecessary
            for a public audience, and a user-facing benefit may need more
            context than the diff provides. Add that context explicitly rather
            than presenting an inference as a confirmed result. This comparison
            makes the final content clearer, safer, and easier for another
            reader to trust.
          </p>
        </div>
      </div>
    </section>
  );
};

export default exampleDemonstrate;
