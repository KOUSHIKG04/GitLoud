import { db } from "@repo/db/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HistoryPage() {
  const generations = await db.generatedContent.findMany({
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

                      <Button asChild variant="outline" size="sm">
                        <a href={source.url} target="_blank" rel="noreferrer">
                          GitHub
                        </a>
                      </Button>
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
