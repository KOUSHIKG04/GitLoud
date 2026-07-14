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
import {
  ExternalLink,
  Paperclip,
  Plus,
  CalendarDays,
  GitBranch,
  GitPullRequest,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { DeleteGenerationButton } from "./delete-generation-button";
import { HistoryDatePicker } from "./history-date-picker";
import { HistoryCardLink } from "./history-card-link";

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
  const hasActiveDateFilter = Boolean(legacyDateParam || fromParam || toParam);
  const showHistoryActions =
    visibleGenerations.length > 0 || hasActiveDateFilter;

  return (
    <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0 overflow-hidden px-2">
      {showHistoryActions ? (
        <div className="flex flex-wrap justify-end gap-2 pb-4 shrink-0">
          <HistoryDatePicker />
          {visibleGenerations.length > 0 ? (
            <Button asChild>
              <Link href="/dashboard">
                <Plus className="size-4" />
                New Generation
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="history-scroll-container flex-1 min-h-0 overflow-y-auto pr-1">
        {visibleGenerations.length === 0 ? (
          <div className="flex min-h-[250px] items-center justify-center gap-1 p-6 text-lg text-muted-foreground">
            <span>
              {page === 1
                ? "No generations yet. Create a"
                : "No generations yet on this page."}
            </span>
            {page === 1 ? (
              <Button asChild variant="link" className="px-1 text-lg underline">
                <Link href="/dashboard">new generation.</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3.5 pl-2 pb-2">
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

              const sourceLabel =
                generation.sourceType === "PULL_REQUEST"
                  ? "Pull Request"
                  : "Commit";

              return (
                <article
                  key={generation.id}
                  className="relative border text-card-foreground p-4 shadow-sm transition-colors hover:bg-card cursor-pointer"
                >
                  <HistoryCardLink
                    href={`/dashboard/generations/${generation.id}`}
                    ariaLabel={`View generation ${title}`}
                  />

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="flex size-7 shrink-0 items-center justify-center text-primary">
                        {generation.sourceType === "PULL_REQUEST" ? (
                          <GitPullRequest className="size-4" />
                        ) : (
                          <GitBranch className="size-4" />
                        )}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground shrink-0">
                        {sourceLabel}:{" "}
                        <span className="text-xs relative z-20">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {source.owner}/{source.repo}
                          </a>
                        </span>
                      </span>

                      <span className="text-muted-foreground/80 shrink-0 mx-0.5">
                        <ArrowRight size={12} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h2
                          className="text-sm text-muted-foreground uppercase truncate font-semibold"
                          title={title}
                        >
                          {title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto relative z-20">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 border-input"
                      >
                        <Link href={`/dashboard/generations/${generation.id}`}>
                          <ExternalLink className="size-3.5 mr-1.5" />
                          Open
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="icon-sm"
                        className="size-8 p-0 border-input"
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open on GitHub"
                          aria-label="Open on GitHub"
                        >
                          <GithubIconIcon className="size-4" />
                        </a>
                      </Button>

                      <DeleteGenerationButton generationId={generation.id} />
                    </div>
                  </div>

                  <div className="ml-2 mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-muted-foreground/80" />
                      <span className="capitalize">
                        {formatHistoryDateItem(generation.createdAt)}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 border bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground font-medium">
                      <Paperclip className="size-3" />
                      <span className="uppercase">
                        {generation.mediaAttachmentCount > 0
                          ? `${generation.mediaAttachmentCount} file${generation.mediaAttachmentCount > 1 ? "s" : ""} attached`
                          : "No file attached"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {visibleGenerations.length > 0 ? (
        <div className="pt-4 shrink-0  bg-background mt-auto">
          <HistoryPagination
            page={page}
            hasNextPage={hasNextPage}
            totalPages={history.totalPages}
            from={rangeStart ? formatHistoryDate(rangeStart) : undefined}
            to={rangeEnd ? formatHistoryDate(rangeEnd) : undefined}
          />
        </div>
      ) : null}
    </div>
  );
}

function HistoryPagination({
  from,
  page,
  hasNextPage,
  totalPages = 1,
  to,
}: {
  from?: string;
  page: number;
  hasNextPage: boolean;
  totalPages?: number;
  to?: string;
}) {
  const getPages = () => {
    const pages: (number | "start-ellipsis" | "end-ellipsis")[] = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) {
        pages.push("start-ellipsis");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("end-ellipsis");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPages();

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

        {pageNumbers.map((p) => {
          if (p === "start-ellipsis" || p === "end-ellipsis") {
            return (
              <PaginationItem key={p}>
                <span className="flex size-9 items-center justify-center text-sm select-none opacity-50">
                  ...
                </span>
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={p}>
              <PaginationLink
                href={getHistoryPageHref(p, from, to)}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          );
        })}

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

function formatHistoryDateItem(value: string) {
  const dateObj = new Date(value);
  if (!Number.isFinite(dateObj.valueOf())) return "";

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${formattedTime}`;
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
