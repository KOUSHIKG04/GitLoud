"use client";

import { Skeleton } from "@repo/ui/components/skeleton";

export function GeneratedContentSkeleton() {
  return [
    "short-summary",
    "beginner-summary",
    "technical-summary",
    "portfolio-bullet",
    "changelog-entry",
    "implementation",
  ].map((key) => (
    <section key={key} className="bg-card p-4 shadow-sm">
      <Skeleton className="h-4 w-36" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-full sm:size-9" />
        <Skeleton className="h-8 w-full sm:size-9" />
        <Skeleton className="h-8 w-full sm:size-9" />
      </div>
    </section>
  ));
}
