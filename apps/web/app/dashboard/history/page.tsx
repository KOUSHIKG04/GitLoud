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
        <span className="text-2xl font-semibold tracking-tight">
          Generation&apos;s
        </span>

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
