const examples = [
  {
    title: "Pull request summary example",
    source: "PR: Add media attachments to generated content",
    output:
      "Added support for uploading media, attaching it to generated PR content, and sharing posts with media links. The change includes file validation, Cloudinary upload handling, and tenant-safe attachment records.",
  },
  {
    title: "Developer changelog example",
    source: "Commit: improve auth email code flow",
    output:
      "Fixed passwordless sign-in and sign-up states so the form no longer stays disabled when Clerk is still loading. The auth flow now checks readiness before setting pending UI state.",
  },
  {
    title: "LinkedIn post example",
    source: "PR: cache generated content by GitHub source",
    output:
      "Shipped a reuse path for generated content so repeated PR or commit submissions return existing results when the source and context are unchanged. This reduces duplicate AI calls and makes the dashboard feel faster.",
  },
] as const;

export function ContentExamplesSection() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-20 lg:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="max-w-5xl space-y-3">
          <p className="text-sm font-semibold">EXAMPLES</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Examples of developer content GitLoud can generate
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            GitLoud turns public GitHub pull requests and commits into practical
            summaries, changelog notes, portfolio bullets, and social posts.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {examples.map((example) => (
            <article
              key={example.title}
              className="min-h-72 bg-card p-7 text-card-foreground shadow-sm sm:p-8"
            >
              <p className="text-[15px] font-medium uppercase leading-6 text-muted-foreground">
                {example.source}
              </p>
              <h3 className="mt-4 text-xl font-semibold leading-8">
                {example.title}
              </h3>
              <p className="mt-4 text-[17px] leading-8 text-muted-foreground">
                {example.output}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
