import React from "react";

const ContentWorkFlow = () => {
  return (
    <section className="border-t px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="max-w-4xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Help improve the developer content workflow
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Useful feedback describes the goal, the step that felt unclear, and
            the result you expected. Reports are reviewed to identify
            reliability problems, confusing interactions, missing content
            formats, and opportunities to make repository-based generation
            easier to use.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
          <article className="space-y-3 border-t pt-5">
            <h2 className="font-semibold">Report reproducible bugs</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Include the page or workflow, what you selected, what you
              expected, and the visible error message. Mention whether the
              source was a public link or an authorized private repository.
              Never paste API keys, webhook URLs, access tokens, private code,
              or other credentials.
            </p>
          </article>
          <article className="space-y-3 border-t pt-5">
            <h2 className="font-semibold">Request focused features</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Explain the communication problem a feature would solve, who would
              use it, and where it belongs in the current flow. Examples include
              additional output formats, better editing controls, repository
              filters, publishing options, or clearer history and regeneration
              tools.
            </p>
          </article>
          <article className="space-y-3 border-t pt-5">
            <h2 className="font-semibold">Comment on output quality</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Describe whether a draft missed technical context, used the wrong
              tone, repeated details, or emphasized the wrong outcome. Share a
              sanitized example when possible. This helps improve prompts and
              presentation without exposing confidential repository information.
            </p>
          </article>
          <article className="space-y-3 border-t pt-5">
            <h2 className="font-semibold">Suggest usability changes</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Navigation, mobile behavior, accessibility, loading feedback, and
              error recovery all affect whether a tool is practical during a
              real release. Tell us which device and browser you used and what
              would have made the next action more obvious.
            </p>
          </article>
        </div>

        <div className="space-y-3 border-t pt-7">
          <h2 className="text-xl font-semibold tracking-tight">
            What happens after you submit
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Submissions are grouped by category and reviewed alongside
            reliability signals and recurring user needs. A contact email is
            optional and should be included only if you are comfortable
            receiving a follow-up question. Sending a request does not guarantee
            a specific feature or delivery date, but clear evidence helps
            prioritize fixes and future product work. For account data or
            security-sensitive concerns, use the contact address in the footer
            instead of including sensitive details in this form.
          </p>
        </div>

        <div className="space-y-4 border-t pt-7">
          <h2 className="text-xl font-semibold tracking-tight">
            A quick checklist for actionable feedback
          </h2>
          <div className="grid gap-5 text-sm leading-6 text-muted-foreground md:grid-cols-2">
            <p>
              <strong className="text-foreground">Name the goal:</strong>{" "}
              explain what you were trying to generate, review, connect, or
              publish. A clear goal separates a product defect from a request
              for a different workflow.
            </p>
            <p>
              <strong className="text-foreground">Describe the path:</strong>{" "}
              list the important actions in order, including the source type and
              the point where the behavior changed or stopped.
            </p>
            <p>
              <strong className="text-foreground">
                Include safe evidence:
              </strong>{" "}
              quote the visible error and provide browser or device details, but
              redact repository data, identifiers, and all credentials before
              sending.
            </p>
            <p>
              <strong className="text-foreground">State the impact:</strong>{" "}
              tell us whether the issue blocked generation, produced an
              inaccurate draft, interrupted publishing, or simply made the task
              harder to understand.
            </p>
          </div>
          <p className="max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base">
            Constructive criticism is welcome. Please keep submissions relevant
            to the product and avoid personal, abusive, or repetitive messages.
            One detailed report is more useful than several duplicate
            submissions and reduces the time needed to understand and reproduce
            the problem.
          </p>
          <p className="max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base">
            If the behavior is intermittent, note how often it occurs and
            whether retrying, reconnecting an integration, or using another
            repository changes the result. For content-quality feedback,
            identify the sentence or section that needs work and explain what
            information was missing. These details make it easier to separate
            source-data limitations from interface, integration, and generation
            problems.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContentWorkFlow;
