import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { HistoryList } from "@/features/generations/components/history-list";

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
    <main className="relative isolate h-[calc(100dvh-3.5rem)] mx-auto w-full max-w-5xl overflow-hidden">
      <section className="h-full flex flex-col gap-4 px-4 pb-4 pt-4 overflow-hidden">
        <Suspense
          fallback={
            <SectionSkeleton
              label="Loading history"
              rows={6}
              rowClassName="h-16"
              bordered={false}
            />
          }
        >
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
