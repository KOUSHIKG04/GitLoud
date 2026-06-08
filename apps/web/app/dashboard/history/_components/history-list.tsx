import { Button } from "@repo/ui/components/button";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import { getGenerationHistory } from "@/lib/generations-api";
import { ExternalLink, Paperclip } from "lucide-react";
import Link from "next/link";
import { DeleteGenerationButton } from "./delete-generation-button";

export async function HistoryList({
  date: legacyDateParam,
  from: fromParam,
  page: pageParam,
  to: toParam,
}: {
  date?: string;
  from?: string;
  page?: string;
  to?: string;
}) {
  const page = Math.max(Number.parseInt(pageParam ?? "1", 10) || 1, 1);
  const legacyDate = parseHistoryDate(legacyDateParam);
  const rangeStart = parseHistoryDate(fromParam) ?? legacyDate;
  const rangeEnd = parseHistoryDate(toParam) ?? legacyDate ?? rangeStart;
  const history = await getGenerationHistory({
    date: legacyDateParam,
    from: fromParam,
    page: pageParam,
    to: toParam,
  });
  const hasNextPage = history.hasNextPage;
  const visibleGenerations = history.generations;

  return (
    <>
      <div className="flex-1">
        {visibleGenerations.length === 0 ? (
          <div className="h-screen p-6 text-lg text-muted-foreground bg-card flex items-center justify-around">
            {page === 1
              ? "NO GENERATIONS YET."
              : "NO GENERATIONS YET ON THIS PAGE."}
          </div>
        ) : (
          <div className="space-y-3.5">
            {visibleGenerations.map((generation) => {
              const source = generation.pullRequest ?? generation.commit;

              if (!source) {
                return null;
              }

              const title =
                generation.sourceType === "PULL_REQUEST" &&
                generation.pullRequest
                  ? generation.pullRequest.title
                  : (generation.commit?.message ?? "").split("\n")[0];

              return (
                <article
                  key={generation.id}
                  className="border bg-card text-card-foreground transition-colors hover:bg-muted/40"
                >
                  <div className="grid gap-4 p-5 md:grid-cols-[5fr_1fr] md:items-start">
                    <Link
                      href={`/dashboard/generations/${generation.id}`}
                      className="min-w-0 space-y-1.5"
                    >
                      <p className="text-sm text-muted-foreground">
                        {generation.sourceType === "PULL_REQUEST"
                          ? "Pull Request"
                          : "Commit"}{" "}
                        - {source.owner}/{source.repo}
                      </p>

                      <h2 className="break-words text-lg font-semibold leading-7">
                        {title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {new Date(generation.createdAt).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5 border bg-background px-2 py-1">
                          <Paperclip className="size-3.5" />
                          {generation.mediaAttachmentCount > 0
                            ? `${generation.mediaAttachmentCount} file attached`
                            : "No file attached"}
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/generations/${generation.id}`}>
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
                          <GithubIconIcon className="size-4" />
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
    </>
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
