import { db } from "@repo/db/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { DeleteGenerationButton } from "./delete-generation-button";
import { HistoryDatePicker } from "./history-date-picker";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    from?: string;
    page?: string;
    to?: string;
  }>;
}) {
  const {
    date: legacyDateParam,
    from: fromParam,
    page: pageParam,
    to: toParam,
  } = await searchParams;
  const page = Math.max(Number.parseInt(pageParam ?? "1", 10) || 1, 1);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  const legacyDate = parseHistoryDate(legacyDateParam);
  const rangeStart = parseHistoryDate(fromParam) ?? legacyDate;
  const rangeEnd = parseHistoryDate(toParam) ?? legacyDate ?? rangeStart;
  const exclusiveRangeEnd = rangeEnd ? addDays(rangeEnd, 1) : undefined;
  const createdAtFilter =
    rangeStart && exclusiveRangeEnd
      ? { createdAt: { gte: rangeStart, lt: exclusiveRangeEnd } }
      : undefined;

  const generations = await db.generatedContent.findMany({
    where: {
      AND: [
        {
          OR: [{ pullRequestId: { not: null } }, { commitId: { not: null } }],
        },
        ...(createdAtFilter ? [createdAtFilter] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      pullRequest: true,
      commit: true,
    },
    skip,
    take: pageSize + 1,
  });
  const hasNextPage = generations.length > pageSize;
  const visibleGenerations = generations.slice(0, pageSize);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Dashboard</p>
            <h1 className="text-2xl font-bold tracking-tight">History</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <HistoryDatePicker />

            <Button asChild>
              <Link href="/dashboard">
                <Plus className="size-4" />
                New generation
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex-1">
          {visibleGenerations.length === 0 ? (
            <div className="rounded-xl border p-6 text-sm text-muted-foreground">
              {page === 1
                ? "No generations yet."
                : "No generations on this page."}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleGenerations.map((generation) => {
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
                    <div className="grid gap-4 md:grid-cols-[5fr_1fr] md:items-start">
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

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/dashboard/generations/${generation.id}`}
                          >
                            <ExternalLink className="size-4" />
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
        </div>

        <div className="pt-4">
          <HistoryPagination
            page={page}
            hasNextPage={hasNextPage}
            from={rangeStart ? formatHistoryDate(rangeStart) : undefined}
            to={rangeEnd ? formatHistoryDate(rangeEnd) : undefined}
          />
        </div>
      </section>
    </main>
  );
}

function HistoryPagination({
  from,
  page,
  hasNextPage,
  to,
}: {
  from?: string;
  page: number;
  hasNextPage: boolean;
  to?: string;
}) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={getHistoryPageHref(page - 1, from, to)} />
          ) : (
            <PaginationPrevious
              href="#"
              aria-disabled="true"
              className="pointer-events-none opacity-50"
              tabIndex={-1}
            />
          )}
        </PaginationItem>

        <PaginationItem>
          <PaginationLink href={getHistoryPageHref(page, from, to)} isActive>
            {page}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          {hasNextPage ? (
            <PaginationNext href={getHistoryPageHref(page + 1, from, to)} />
          ) : (
            <PaginationNext
              href="#"
              aria-disabled="true"
              className="pointer-events-none opacity-50"
              tabIndex={-1}
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function parseHistoryDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function formatHistoryDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getHistoryPageHref(
  page: number,
  from: string | undefined,
  to: string | undefined,
) {
  const params = new URLSearchParams({ page: page.toString() });

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  return `/dashboard/history?${params.toString()}`;
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
