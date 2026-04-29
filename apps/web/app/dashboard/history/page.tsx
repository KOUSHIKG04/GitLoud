import { db } from "@repo/db/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeleteGenerationButton } from "./delete-generation-button";

export default async function HistoryPage() {
  const generations = await db.generatedContent.findMany({
    where: {
      OR: [
        { pullRequestId: { not: null } },
        { commitId: { not: null } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      pullRequest: true,
      commit: true,
    },
    take: 50,
  });

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Dashboard</p>
            <h1 className="text-2xl font-bold tracking-tight">History</h1>
          </div>

          <Button asChild>
            <Link href="/dashboard">New generation</Link>
          </Button>
        </div>

        {generations.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No generations yet.
          </div>
        ) : (
          <div className="space-y-3">
            {generations.map((generation) => {
              const source = generation.pullRequest ?? generation.commit;

              if (!source) {
                return null;
              }

              const title =
                generation.sourceType === "PULL_REQUEST" &&
                generation.pullRequest
                  ? generation.pullRequest.title
                  : generation.commit?.message.split("\n")[0];

              return (
                <article
                  key={generation.id}
                  className="rounded-xl border bg-card p-4 text-card-foreground"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {generation.sourceType === "PULL_REQUEST"
                          ? "Pull Request"
                          : "Commit"}{" "}
                        - {source.owner}/{source.repo}
                      </p>

                      <h2 className="break-words text-base font-semibold">
                        {title}
                      </h2>

                      <p className="text-xs text-muted-foreground">
                        {generation.createdAt.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/generations/${generation.id}`}>
                          Open
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="icon-sm"
                        aria-label="Open on GitHub"
                        title="Open on GitHub"
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Open on GitHub"
                          title="Open on GitHub"
                        >
                          <GitHubIcon />
                        </a>
                      </Button>

                      <DeleteGenerationButton generationId={generation.id} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.78c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}
