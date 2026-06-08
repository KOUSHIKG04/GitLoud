import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { HistoryDatePicker } from "./_components/history-date-picker";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryLoading } from "./_components/history-loading";
import { HistoryList } from "./_components/history-list";

export const metadata: Metadata = {
  title: "History",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Renders the authenticated generation history page with date filtering.
 */
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

  return (
    <main className="relative isolate min-h-[calc(100dvh-3.5rem)]">
      <section className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-5xl flex-col gap-6 px-4 pb-6 pt-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-2xl font-semibold tracking-tight">
              History
            </span>
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

        <Suspense fallback={<HistoryLoading />}>
          <HistoryList
            date={legacyDateParam}
            from={fromParam}
            page={pageParam}
            to={toParam}
          />
        </Suspense>
      </section>
    </main>
  );
}
